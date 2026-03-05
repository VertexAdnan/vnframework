import { db } from "../database";

export default async function handler(req: Request) {
  try {
    const connections = ["default", "mikroserver", "b2bserver", "mongoserver"];
    const status: Record<string, any> = {};

    for (const name of connections) {
      try {
        const conn = db.getConnection(name);
        status[name] = {
          connected: true,
          type: getConnectionType(name),
        };
      } catch (error) {
        status[name] = {
          connected: false,
          error: "Not configured or connection failed",
        };
      }
    }

    return Response.json({
      success: true,
      databases: status,
      message: "Database connection status",
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function getConnectionType(name: string): string {
  const types: Record<string, string> = {
    default: process.env.DB_TYPE || "unknown",
    mikroserver: "mssql",
    b2bserver: "mssql",
    mongoserver: "mongodb",
  };
  return types[name] || "unknown";
}
