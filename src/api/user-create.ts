import { db } from "../database";
import { users } from "../database/schemas/example";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return Response.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const database = db.getConnection("default");

    const newUser = await database
      .insert(users)
      .values({
        name,
        email,
      })
      .returning();

    return Response.json({
      success: true,
      data: newUser[0],
      message: "User created successfully",
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || "Database error",
      },
      { status: 500 }
    );
  }
}
