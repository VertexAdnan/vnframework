import { sessionManager } from "../../server";

/**
 * Session Info API
 * GET /api/auth/session-info
 * 
 * Mevcut session bilgilerini ve server istatistiklerini döndürür
 */
export default function handler(req: Request) {
  if (req.method !== "GET") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const stats = sessionManager.getStats();

  return Response.json({
    hasSession: !!req.session,
    session: req.session
      ? {
          id: req.session.id,
          createdAt: req.session.createdAt,
          expiresAt: req.session.expiresAt,
          data: req.session.data,
        }
      : null,
    serverStats: {
      totalSessions: stats.total,
      activeSessions: stats.active,
    },
    cookies: req.cookies || {},
  });
}
