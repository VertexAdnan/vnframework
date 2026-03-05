export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly store = new Map<string, AppRateLimitEntry>();
  private readonly cleanupTimer: Timer;

  constructor(options: AppRateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;

    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt <= now) {
          this.store.delete(key);
        }
      }
    }, Math.max(1000, Math.floor(this.windowMs / 2)));
  }

  check(key: string): AppRateLimitResult {
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || current.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.store.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        resetAt,
        retryAfterSeconds: 0,
      };
    }

    current.count += 1;
    const allowed = current.count <= this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - current.count);
    const retryAfterSeconds = allowed
      ? 0
      : Math.max(1, Math.ceil((current.resetAt - now) / 1000));

    return {
      allowed,
      limit: this.maxRequests,
      remaining,
      resetAt: current.resetAt,
      retryAfterSeconds,
    };
  }

  stop() {
    clearInterval(this.cleanupTimer);
  }
}
