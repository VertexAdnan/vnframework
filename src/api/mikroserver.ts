import { db } from "../database";

export default async function handler(req: Request) {
  try {
    const mikroDB = db.getConnection("mikroserver");
    const result = await (mikroDB as any).query("SELECT TOP 10 * FROM Products");

    return Response.json({
      success: true,
      source: "MikroServer (MSSQL - 192.168.1.5:1433)",
      data: result.recordset,
      count: result.recordset?.length || 0,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || "Database error",
        hint: "Make sure MIKROSERVER_DB_* variables are set in .env",
      },
      { status: 500 }
    );
  }
}
