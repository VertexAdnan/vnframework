import { db } from "../database";
import type { Db } from "mongodb";

export default async function handler(req: Request) {
  try {
    const mongoDB = db.getConnection("mongoserver") as Db;
    const collection = mongoDB.collection("logs");
    const logs = await collection.find().limit(10).toArray();

    return Response.json({
      success: true,
      source: "MongoServer (MongoDB - 192.168.1.5:27017)",
      data: logs,
      count: logs.length,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || "Database error",
        hint: "Make sure MONGOSERVER_DB_* variables are set in .env",
      },
      { status: 500 }
    );
  }
}
