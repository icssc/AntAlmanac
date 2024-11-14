import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

const { DB_URL } = process.env;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: DB_URL ?? "",
  }
});
