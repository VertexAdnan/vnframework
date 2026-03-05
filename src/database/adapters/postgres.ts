import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { DatabaseConfig } from "../types";

export function createPostgresConnection(config: DatabaseConfig) {
  const connectionString = `postgresql://${config.user}:${config.password}@${config.host}:${config.port || 5432}/${config.database}${config.ssl ? "?sslmode=require" : ""}`;

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  const db = drizzle(client);

  return {
    db,
    client,
    close: async () => {
      await client.end();
    },
  };
}
