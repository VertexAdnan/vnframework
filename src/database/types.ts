import type { MySql2Database } from "drizzle-orm/mysql2";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Db as MongoDatabase } from "mongodb";

export type DatabaseType = "postgres" | "mysql" | "sqlite" | "mssql" | "mongodb";

export type DatabaseInstance =
  | PostgresJsDatabase<Record<string, never>>
  | MySql2Database<Record<string, never>>
  | BetterSQLite3Database<Record<string, never>>
  | any
  | MongoDatabase;

export interface DatabaseConfig {
  type: DatabaseType;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database: string;
  ssl?: boolean;
  filename?: string;
  authSource?: string;
  uri?: string;
}

export interface ConnectionOptions {
  name?: string;
  config: DatabaseConfig;
}
