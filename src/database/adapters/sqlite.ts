import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { DatabaseConfig } from "../types";

export function createSQLiteConnection(config: DatabaseConfig): {
  db: ReturnType<typeof drizzle>;
  client: Database.Database;
  close: () => void;
} {
  const sqlite = new Database(config.filename || config.database);
  const db = drizzle(sqlite);

  return {
    db,
    client: sqlite,
    close: () => {
      sqlite.close();
    },
  };
}
