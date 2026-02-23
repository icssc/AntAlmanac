import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/schema/index.ts",
    out: "./migrations",
    dbCredentials: {
        url: process.env.DB_URL!,
    },
});
