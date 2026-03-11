# 🔐 Session Yönetimi

VNFramework, güçlü ve güvenli bir session (oturum) yönetim sistemi ile gelir. Bu dokümantasyon, session sisteminin nasıl kullanılacağını detaylı olarak açıklar.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Yapılandırma](#yapılandırma)
- [Kullanım](#kullanım)
- [API Referansı](#api-referansı)
- [Güvenlik](#güvenlik)
- [Örnekler](#örnekler)

## ✨ Özellikler

- ✅ **In-memory session storage** - Hızlı ve hafif
- ✅ **Otomatik temizleme** - Expired session'lar otomatik silinir
- ✅ **Cookie-based** - HTTP-only ve secure cookie desteği
- ✅ **TTL (Time To Live)** - Configurable session süresi
- ✅ **Crypto-secure ID** - Güvenli session ID üretimi
- ✅ **TypeScript desteği** - Tam tip güvenliği
- ✅ **Automatic session refresh** - Her istekte TTL yenilenir

## ⚙️ Yapılandırma

Session ayarları environment variables ile yapılandırılabilir:

```bash
# .env
SESSION_MAX_AGE=86400000          # Session süresi (ms) - default: 24 saat
SESSION_COOKIE_NAME=session_id    # Cookie adı - default: session_id
NODE_ENV=production               # Production'da secure cookies aktif
```

### Server Yapılandırması

Session manager `server.tsx` içinde otomatik olarak yapılandırılır:

```typescript
const sessionManager = new SessionManager({
    maxAge: 24 * 60 * 60 * 1000,     // 24 saat
    cookieName: "session_id",         // Cookie adı
    httpOnly: true,                   // XSS koruması
    secure: process.env.NODE_ENV === "production", // HTTPS zorunlu
    sameSite: "Lax",                  // CSRF koruması
});
```

## 🚀 Kullanım

### 1. Session Oluşturma (Login)

```typescript
// src/api/auth/login.ts
import { sessionManager } from "../../server";

export default async function handler(req: Request) {
  const { username, password } = await req.json();
  
  // Kullanıcı doğrulaması...
  
  // Session oluştur
  const session = sessionManager.create({
    userId: user.id,
    username: user.username,
    email: user.email,
    roles: ["user"],
  });
  
  // Cookie header'ı oluştur
  const cookieHeader = sessionManager.createCookieHeader(session.id);
  
  return Response.json(
    { success: true, user },
    { headers: { "Set-Cookie": cookieHeader } }
  );
}
```

### 2. Session Kontrolü (Protected Routes)

```typescript
// src/api/profile.ts
export default function handler(req: Request) {
  // Session otomatik olarak yüklenir
  if (!req.session) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Session data'ya erişim
  const userId = req.session.data.userId;
  const username = req.session.data.username;
  
  return Response.json({
    user: req.session.data
  });
}
```

### 3. Session Silme (Logout)

```typescript
// src/api/auth/logout.ts
import { sessionManager } from "../../server";

export default function handler(req: Request) {
  if (req.session) {
    sessionManager.destroy(req.session.id);
  }
  
  const deleteCookieHeader = sessionManager.createDeleteCookieHeader();
  
  return Response.json(
    { success: true },
    { headers: { "Set-Cookie": deleteCookieHeader } }
  );
}
```

### 4. Session Güncelleme

```typescript
// Session data'yı güncelle
sessionManager.update(sessionId, {
  lastActivity: Date.now(),
  preferences: { theme: "dark" }
});
```

### 5. Session var mı kontrol et (Middleware mantığı)

Her API isteğinde otomatik olarak:

```typescript
// server.tsx içinde otomatik çalışır
const sessionId = req.cookies?.[sessionManager.getCookieName()];
if (sessionId) {
  const session = sessionManager.get(sessionId);
  if (session) {
    Object.assign(req, { session });
  }
}
```

## 📚 API Referansı

### SessionManager

#### `create(data?: Record<string, any>): AppSession`
Yeni bir session oluşturur.

```typescript
const session = sessionManager.create({
  userId: "123",
  username: "demo"
});
```

#### `get(sessionId: string): AppSession | null`
Session ID'ye göre session'ı getirir.

```typescript
const session = sessionManager.get(sessionId);
```

#### `update(sessionId: string, data: Record<string, any>): boolean`
Session data'yı günceller ve TTL'yi yeniler.

```typescript
sessionManager.update(sessionId, { lastActivity: Date.now() });
```

#### `destroy(sessionId: string): boolean`
Session'ı siler.

```typescript
sessionManager.destroy(sessionId);
```

#### `refresh(sessionId: string): boolean`
Session'ın TTL'sini yeniler.

```typescript
sessionManager.refresh(sessionId);
```

#### `getStats(): { total: number; active: number }`
Session istatistiklerini döndürür.

```typescript
const stats = sessionManager.getStats();
console.log(`Active sessions: ${stats.active}`);
```

#### `createCookieHeader(sessionId: string): string`
Set-Cookie header string'i oluşturur.

```typescript
const header = sessionManager.createCookieHeader(session.id);
```

#### `createDeleteCookieHeader(): string`
Session silme cookie'si oluşturur.

```typescript
const header = sessionManager.createDeleteCookieHeader();
```

### Cookie Parser

#### `parseCookies(cookieHeader: string | null): Record<string, string>`
Cookie header'ını parse eder.

```typescript
const cookies = parseCookies(req.headers.get("cookie"));
```

#### `attachCookies(req: Request): Request`
Request'e cookies ekler.

```typescript
const reqWithCookies = attachCookies(req);
```

## 🔒 Güvenlik

### HTTP-Only Cookies
Session ID'ler HTTP-only cookie'lerde saklanır, bu JavaScript'ten erişimi engeller ve XSS saldırılarını önler.

### Secure Cookies
Production ortamında `secure` flag aktif olur ve HTTPS zorunlu hale gelir.

### SameSite Protection
`SameSite=Lax` ile CSRF saldırılarına karşı koruma sağlanır.

### Crypto-Secure IDs
Session ID'ler `crypto.getRandomValues()` ile üretilir (32 byte = 64 hex karakter).

### Otomatik Temizleme
Expired session'lar her 5 dakikada bir otomatik temizlenir:

```typescript
// Her 5 dakikada bir
setInterval(() => {
  this.cleanup();
}, 5 * 60 * 1000);
```

### TTL (Time To Live)
Her session get/update işleminde TTL kontrol edilir ve geçersiz session'lar otomatik silinir.

## 📝 Örnekler

### Basit Login/Logout Akışı

1. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"demo","password":"demo123"}' \\
  -c cookies.txt
```

2. **Profile (Protected)**
```bash
curl http://localhost:3000/api/auth/profile \\
  -b cookies.txt
```

3. **Logout**
```bash
curl -X POST http://localhost:3000/api/auth/logout \\
  -b cookies.txt
```

### Frontend Örneği (Fetch API)

```javascript
// Login
async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Cookie'leri gönder/al
    body: JSON.stringify({ username, password })
  });
  return response.json();
}

// Profile
async function getProfile() {
  const response = await fetch('/api/auth/profile', {
    credentials: 'include' // Cookie'leri gönder
  });
  return response.json();
}

// Logout
async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
}
```

### Custom Session Data

```typescript
// Farklı user rolleri ile
const session = sessionManager.create({
  userId: user.id,
  username: user.username,
  roles: ["admin", "editor"],
  permissions: ["read", "write", "delete"],
  metadata: {
    loginIp: getClientIp(req),
    userAgent: req.headers.get("user-agent")
  }
});

// Session'da role kontrolü
export default function handler(req: Request) {
  if (!req.session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const isAdmin = req.session.data.roles?.includes("admin");
  if (!isAdmin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Admin işlemleri...
}
```

### Session Middleware Helper

Custom middleware fonksiyonu oluşturabilirsiniz:

```typescript
// src/helpers/auth-middleware.ts
export function requireAuth(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    if (!req.session) {
      return Response.json(
        { error: "Unauthorized", message: "Login gerekli" },
        { status: 401 }
      );
    }
    return handler(req);
  };
}

export function requireRole(role: string) {
  return (handler: (req: Request) => Promise<Response>) => {
    return async (req: Request) => {
      if (!req.session) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const hasRole = req.session.data.roles?.includes(role);
      if (!hasRole) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
      
      return handler(req);
    };
  };
}

// Kullanım
import { requireAuth, requireRole } from "../../helpers/auth-middleware";

export default requireAuth(async function handler(req: Request) {
  // Bu kod sadece login olan kullanıcılar için çalışır
  return Response.json({ data: "Protected data" });
});

export default requireRole("admin")(async function handler(req: Request) {
  // Bu kod sadece admin rolüne sahip kullanıcılar için çalışır
  return Response.json({ data: "Admin data" });
});
```

## 🎯 Best Practices

1. **Session verilerini minimal tutun** - Sadece gerekli bilgileri saklayın
2. **Hassas bilgileri saklamayın** - Password, credit card gibi
3. **TTL'yi uygun ayarlayın** - Banking app: 15 dk, Blog: 30 gün
4. **Production'da HTTPS kullanın** - Secure cookies için zorunlu
5. **Session istatistiklerini izleyin** - Memory kullanımı için
6. **Logout işlemini uygulayın** - Kullanıcıya logout imkanı sunun

## 🔄 Session Lifecycle

```
1. User Login
   ↓
2. sessionManager.create() → Session ID üretilir
   ↓
3. Set-Cookie header ile browser'a gönderilir
   ↓
4. Browser her istekte cookie'yi gönderir
   ↓
5. Server cookie'yi parse eder
   ↓
6. sessionManager.get() ile session yüklenir
   ↓
7. req.session olarak API'ye sağlanır
   ↓
8. User Logout
   ↓
9. sessionManager.destroy() → Session silinir
   ↓
10. Delete cookie header gönderilir
```

## 📊 Monitoring

Session istatistiklerini takip edin:

```typescript
// src/api/admin/sessions.ts
import { sessionManager } from "../../server";

export default function handler(req: Request) {
  const stats = sessionManager.getStats();
  
  return Response.json({
    sessions: {
      total: stats.total,
      active: stats.active,
      expired: stats.total - stats.active
    },
    timestamp: new Date().toISOString()
  });
}
```

## 🚀 Production Notları

- **Ölçeklendirme**: In-memory sessions tek sunucu için uygundur. Çoklu sunucu için Redis gibi merkezi bir store kullanın.
- **Persistence**: Server restart'ta session'lar kaybolur. Kalıcı storage için database entegrasyonu ekleyin.
- **Load Balancing**: Sticky sessions veya merkezi session store gerekir.

## 📖 İlgili Dökümanlar

- [RATE-LIMITER.md](./FILE-UPLOADER.md) - Rate limiting
- [DATABASE.md](./DATABASE.md) - Database entegrasyonu
- [API Documentation](./README.md) - Genel API kullanımı

---

**Not**: Bu session sistemi development ve küçük-orta ölçekli projeler için uygundur. Enterprise uygulamalar için Redis, JWT veya OAuth benzeri çözümler değerlendirin.
