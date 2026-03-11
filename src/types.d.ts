export {};

declare global {
  interface AppWebSocketData {
    room: string;
    createdAt: number;
    userId?: string;
  }

  interface AppRateLimiterOptions {
    windowMs: number;
    maxRequests: number;
  }

  interface AppRateLimitEntry {
    count: number;
    resetAt: number;
  }

  interface AppRateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
    retryAfterSeconds: number;
  }

  interface Request {
    query: Record<string, string | string[] | undefined>;
    session?: AppSession;
    cookies?: Record<string, string>;
  }

  interface AppSession {
    id: string;
    data: Record<string, any>;
    createdAt: number;
    expiresAt: number;
  }

  interface AppSessionOptions {
    maxAge?: number; // milliseconds
    cookieName?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  }
}