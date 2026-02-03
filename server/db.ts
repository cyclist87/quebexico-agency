import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Charger .env depuis la racine du projet. CJS (bundle) : __filename ; ESM (dev) : import.meta.url
declare const __filename: string | undefined;
const __dirname =
  typeof __filename !== "undefined"
    ? path.dirname(__filename)
    : path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const result = config({ path: envPath, override: true });
if (result.parsed?.DATABASE_URL) {
  process.env.DATABASE_URL = result.parsed.DATABASE_URL;
}
// Bascule rapide vers la base de prod en local : USE_PROD_DB=1 ou npm run dev:prod
if (process.env.USE_PROD_DB === "1") {
  const prodPath = path.join(rootDir, ".env.prod");
  const prodResult = config({ path: prodPath, override: true });
  if (prodResult.parsed?.DATABASE_URL) {
    process.env.DATABASE_URL = prodResult.parsed.DATABASE_URL;
    console.warn("[db] USE_PROD_DB=1 : DATABASE_URL chargée depuis .env.prod (données de production)");
  }
}
if (!process.env.DATABASE_URL) {
  console.error("[db] DATABASE_URL absent. Fichier .env trouvé:", !!result.parsed, "Clés lues:", result.parsed ? Object.keys(result.parsed) : "aucune");
}

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
