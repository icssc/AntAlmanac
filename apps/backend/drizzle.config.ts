import { defineConfig } from "drizzle-kit";

import { backendEnvSchema } from "./src/env";

const { DB_URL } = backendEnvSchema.parse(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: DB_URL,
  }
});
