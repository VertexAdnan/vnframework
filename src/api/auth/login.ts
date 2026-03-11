import { sessionManager } from "../../server";

/**
 * Login API
 * POST /api/auth/login
 * 
 * Body: { username: string, password: string }
 * 
 * Bu basit örnekte gerçek bir database kontrolü yok.
 * Prodüksiyon'da database ile kullanıcı doğrulaması yapılmalı.
 */
export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json(
        { error: "Username ve password gerekli" },
        { status: 400 }
      );
    }

    // Basit örnek doğrulama (GERÇEK PROJEDE DATABASE KULLANIN!)
    if (username === "demo" && password === "demo123") {
      // Session oluştur
      const session = sessionManager.create({
        userId: "user_123",
        username: username,
        email: "demo@example.com",
        loginAt: Date.now(),
      });

      // Set-Cookie header ile session ID'yi gönder
      const cookieHeader = sessionManager.createCookieHeader(session.id);

      return Response.json(
        {
          success: true,
          message: "Login başarılı",
          user: {
            userId: session.data.userId,
            username: session.data.username,
            email: session.data.email,
          },
        },
        {
          headers: {
            "Set-Cookie": cookieHeader,
          },
        }
      );
    }

    return Response.json(
      { error: "Kullanıcı adı veya şifre hatalı" },
      { status: 401 }
    );
  } catch (error) {
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
