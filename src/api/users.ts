import { db } from "../database";
import { users } from "../database/schemas/example";
import { eq } from "drizzle-orm";

export default async function handler(req: Request) {
  try {
    const database = db.getConnection("default");
    const allUsers = await database.select().from(users);

    return Response.json({
      success: true,
      data: allUsers,
      count: allUsers.length,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || "Database error",
        hint: "Make sure to configure database connection in src/server.tsx",
      },
      { status: 500 }
    );
  }
}
