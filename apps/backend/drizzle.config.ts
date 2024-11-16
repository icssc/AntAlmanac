import { defineConfig } from "drizzle-kit";

import env from "./src/env";

const { DB_URL } = env;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: DB_URL,
  }
});
