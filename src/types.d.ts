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
  }
}