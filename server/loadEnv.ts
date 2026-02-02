/**
 * Charge .env depuis la racine du projet. Doit être importé en premier (avant db).
 * CJS (bundle) : __filename existe. ESM (dev) : import.meta.url.
 */
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

declare const __filename: string | undefined;
const __dirname =
  typeof __filename !== "undefined"
    ? path.dirname(__filename)
    : path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");
const result = config({ path: envPath });
if (process.env.NODE_ENV === "development" && result.parsed) {
  const hasAdmin = "ADMIN_SECRET_KEY" in result.parsed;
  console.log("[loadEnv] .env loaded from", envPath, "| ADMIN_SECRET_KEY present:", hasAdmin);
}
