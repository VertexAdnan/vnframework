import sql from "mssql";
import type { DatabaseConfig } from "../types";

export async function createMSSQLConnection(config: DatabaseConfig) {
  const connectionConfig: sql.config = {
    server: config.host || "localhost",
    port: config.port || 1433,
    user: config.user,
    password: config.password,
    database: config.database,
    options: {
      encrypt: config.ssl || false,
      trustServerCertificate: true,
    },
  };

  const pool = await sql.connect(connectionConfig);

  return {
    db: pool,
    client: pool,
    close: async () => {
      await pool.close();
    },
    query: async (queryString: string) => {
      return pool.request().query(queryString);
    },
  };
}
