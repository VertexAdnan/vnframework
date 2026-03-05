import { MongoClient } from "mongodb";
import type { DatabaseConfig } from "../types";

export async function createMongoDBConnection(config: DatabaseConfig) {
  const uri =
    config.uri ||
    `mongodb://${config.user}:${config.password}@${config.host}:${config.port || 27017}/${config.database}${
      config.authSource ? `?authSource=${config.authSource}` : ""
    }`;

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  await client.connect();
  const db = client.db(config.database);

  return {
    db,
    client,
    close: async () => {
      await client.close();
    },
  };
}
