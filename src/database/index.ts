import { createPostgresConnection } from "./adapters/postgres";
import { createMySQLConnection } from "./adapters/mysql";
import { createSQLiteConnection } from "./adapters/sqlite";
import { createMSSQLConnection } from "./adapters/mssql";
import { createMongoDBConnection } from "./adapters/mongodb";
import type { ConnectionOptions, DatabaseInstance } from "./types";

class DatabaseManager {
  private connections: Map<string, { db: DatabaseInstance; close: () => Promise<void> | void }> = new Map();

  async connect(options: ConnectionOptions) {
    const name = options.name || "default";

    if (this.connections.has(name)) {
      console.warn(`Connection "${name}" already exists. Returning existing connection.`);
      return this.connections.get(name)!.db;
    }

    let connection;

    switch (options.config.type) {
      case "postgres":
        connection = createPostgresConnection(options.config);
        break;
      case "mysql":
        connection = await createMySQLConnection(options.config);
        break;
      case "sqlite":
        connection = createSQLiteConnection(options.config);
        break;
      case "mssql":
        connection = await createMSSQLConnection(options.config);
        break;
      case "mongodb":
        connection = await createMongoDBConnection(options.config);
        break;
      default:
        throw new Error(`Unsupported database type: ${options.config.type}`);
    }

    this.connections.set(name, connection);
    console.log(`✅ Database "${name}" (${options.config.type}) connected successfully`);

    return connection.db;
  }

  getConnection(name: string = "default") {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`Connection "${name}" not found. Did you forget to call connect()?`);
    }
    return connection.db;
  }

  async closeAll() {
    for (const [name, connection] of this.connections.entries()) {
      await connection.close();
      console.log(`🔌 Connection "${name}" closed`);
    }
    this.connections.clear();
  }

  async close(name: string = "default") {
    const connection = this.connections.get(name);
    if (connection) {
      await connection.close();
      this.connections.delete(name);
      console.log(`🔌 Connection "${name}" closed`);
    }
  }
}

export const db = new DatabaseManager();
export type { DatabaseConfig, DatabaseType, ConnectionOptions } from "./types";
