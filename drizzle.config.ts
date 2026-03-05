import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schemas/*.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "vnframework",
    ssl: process.env.DB_SSL === "true",
  },

  verbose: true,
  strict: true,
});
