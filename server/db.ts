import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// Charger .env depuis la racine du projet
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");
const result = config({ path: envPath, override: true });
if (result.parsed?.DATABASE_URL) {
  process.env.DATABASE_URL = result.parsed.DATABASE_URL;
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
