import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import type { DatabaseConfig } from "../types";

export async function createMySQLConnection(config: DatabaseConfig) {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port || 3306,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl ? {} : undefined,
  });

  const db = drizzle(connection);

  return {
    db,
    client: connection,
    close: async () => {
      await connection.end();
    },
  };
}
