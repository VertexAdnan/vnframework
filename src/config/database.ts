import { db } from "../database";
import type { DatabaseConfig } from "../database";

function createConfigFromEnv(prefix: string = ""): DatabaseConfig | null {
  const getEnv = (key: string) => {
    const fullKey = prefix ? `${prefix}_${key}` : key;
    return process.env[fullKey];
  };

  const dbType = getEnv("DB_TYPE");
  if (!dbType) return null;

  const config: DatabaseConfig = {
    type: dbType as any,
    host: getEnv("DB_HOST") || "localhost",
    port: Number(getEnv("DB_PORT")) || getDefaultPort(dbType as any),
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD"),
    database: getEnv("DB_NAME") || "default",
    ssl: getEnv("DB_SSL") === "true",
    filename: getEnv("DB_FILENAME"),
    authSource: getEnv("DB_AUTH_SOURCE"),
    uri: getEnv("DB_URI"),
  };

  return config;
}

function getDefaultPort(type: string): number {
  const ports: Record<string, number> = {
    postgres: 5432,
    mysql: 3306,
    mssql: 1433,
    mongodb: 27017,
    sqlite: 0,
  };
  return ports[type] || 5432;
}

export async function initializeDatabases() {
  const primaryConfig = createConfigFromEnv("");
  if (primaryConfig) {
    try {
      await db.connect({
        name: "default",
        config: primaryConfig,
      });
    } catch (error) {
      console.error("❌ Failed to connect to primary database:", error);
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
    }
  }

  const dbPrefixes = [
    "MIKROSERVER",
    "B2BSERVER", 
    "MONGOSERVER",
    "ANALYTICS",
    "CACHE",
  ];

  for (const prefix of dbPrefixes) {
    const config = createConfigFromEnv(prefix);
    if (config) {
      try {
        await db.connect({
          name: prefix.toLowerCase(),
          config,
        });
      } catch (error) {
        console.error(`❌ Failed to connect to ${prefix} database:`, error);
      }
    }
  }
}

export async function closeDatabases() {
  await db.closeAll();
}
