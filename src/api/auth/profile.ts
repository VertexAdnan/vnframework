/**
 * Profile API
 * GET /api/auth/profile
 * 
 * Login olan kullanıcının bilgilerini döndürür
 * Session gerektirir
 */
export default function handler(req: Request) {
  if (req.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  // Session kontrolü
  if (!req.session) {
    return Response.json(
      { error: "Unauthorized", message: "Login gerekli" },
      { status: 401 }
    );
  }

  // Session'dan kullanıcı bilgilerini al
  return Response.json({
    success: true,
    user: {
      userId: req.session.data.userId,
      username: req.session.data.username,
      email: req.session.data.email,
      loginAt: req.session.data.loginAt,
    },
    session: {
      id: req.session.id,
      createdAt: req.session.createdAt,
      expiresAt: req.session.expiresAt,
    },
  });
}
