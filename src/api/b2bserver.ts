import { db } from "../database";

export default async function handler(req: Request) {
  try {
    const b2bDB = db.getConnection("b2bserver");
    const result = await (b2bDB as any).query("SELECT TOP 10 * FROM Orders");

    return Response.json({
      success: true,
      source: "B2BServer (MSSQL - 192.168.1.6:1433)",
      data: result.recordset,
      count: result.recordset?.length || 0,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || "Database error",
        hint: "Make sure B2BSERVER_DB_* variables are set in .env",
      },
      { status: 500 }
    );
  }
}
