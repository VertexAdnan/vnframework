/**
 * SessionManager - In-memory session storage ve yönetimi
 * 
 * Özellikler:
 * - Otomatik session temizleme
 * - Configurable cookie seçenekleri
 * - Güvenli session ID üretimi
 * - TTL (Time To Live) desteği
 */

export class SessionManager {
  private readonly store = new Map<string, AppSession>();
  private readonly cleanupTimer: Timer;
  private readonly options: Required<AppSessionOptions>;

  constructor(options?: AppSessionOptions) {
    this.options = {
      maxAge: options?.maxAge || 24 * 60 * 60 * 1000, // 24 saat default
      cookieName: options?.cookieName || "session_id",
      httpOnly: options?.httpOnly ?? true,
      secure: options?.secure ?? process.env.NODE_ENV === "production",
      sameSite: options?.sameSite || "Lax",
    };

    // Her 5 dakikada bir expired sessions'ları temizle
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Yeni bir session oluştur
   */
  create(data: Record<string, any> = {}): AppSession {
    const id = this.generateSessionId();
    const now = Date.now();
    const session: AppSession = {
      id,
      data,
      createdAt: now,
      expiresAt: now + this.options.maxAge,
    };

    this.store.set(id, session);
    return session;
  }

  /**
   * Session ID'ye göre session getir
   */
  get(sessionId: string): AppSession | null {
    const session = this.store.get(sessionId);

    if (!session) {
      return null;
    }

    // Expired kontrolü
    if (Date.now() > session.expiresAt) {
      this.store.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * Session'ı güncelle
   */
  update(sessionId: string, data: Record<string, any>): boolean {
    const session = this.get(sessionId);

    if (!session) {
      return false;
    }

    session.data = { ...session.data, ...data };
    // TTL'yi yenile
    session.expiresAt = Date.now() + this.options.maxAge;
    this.store.set(sessionId, session);

    return true;
  }

  /**
   * Session'ı sil
   */
  destroy(sessionId: string): boolean {
    return this.store.delete(sessionId);
  }

  /**
   * Session'ın TTL'sini yenile
   */
  refresh(sessionId: string): boolean {
    const session = this.get(sessionId);

    if (!session) {
      return false;
    }

    session.expiresAt = Date.now() + this.options.maxAge;
    return true;
  }

  /**
   * Expired session'ları temizle
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, session] of this.store.entries()) {
      if (session.expiresAt <= now) {
        this.store.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} expired session temizlendi`);
    }
  }

  /**
   * Güvenli session ID üret
   */
  private generateSessionId(): string {
    // Crypto-secure random ID
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Set-Cookie header string'i oluştur
   */
  createCookieHeader(sessionId: string): string {
    const parts = [
      `${this.options.cookieName}=${sessionId}`,
      `Max-Age=${Math.floor(this.options.maxAge / 1000)}`,
      `Path=/`,
      `SameSite=${this.options.sameSite}`,
    ];

    if (this.options.httpOnly) {
      parts.push("HttpOnly");
    }

    if (this.options.secure) {
      parts.push("Secure");
    }

    return parts.join("; ");
  }

  /**
   * Session silme cookie'si oluştur
   */
  createDeleteCookieHeader(): string {
    return `${this.options.cookieName}=; Max-Age=0; Path=/`;
  }

  /**
   * Cookie name'i döndür
   */
  getCookieName(): string {
    return this.options.cookieName;
  }

  /**
   * İstatistikleri döndür
   */
  getStats(): { total: number; active: number } {
    const now = Date.now();
    let active = 0;

    for (const session of this.store.values()) {
      if (session.expiresAt > now) {
        active++;
      }
    }

    return {
      total: this.store.size,
      active,
    };
  }

  /**
   * Cleanup timer'ı temizle (shutdown için)
   */
  shutdown(): void {
    clearInterval(this.cleanupTimer);
    this.store.clear();
  }
}
