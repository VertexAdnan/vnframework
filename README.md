# VN Framework

Modern, hafif ve Bun ile güçlendirilmiş full-stack web framework. Next.js benzeri file-based routing, SSR, client-side hydration ve çoklu veritabanı desteği.

## 🚀 Özellikler

- ✅ **Server-Side Rendering (SSR)** - SEO dostu React rendering
- ✅ **Client-Side Hydration** - Interaktif UI için automatic hydration
- ✅ **File-Based Routing** - NextJS stili `src/pages/*.tsx` → routes
- ✅ **API Routes** - `src/api/*.ts` → `/api/*` endpoints
- ✅ **WebSocket Support** - Gerçek zamanlı iletişim
- ✅ **Database Adapters** - PostgreSQL, MySQL, SQLite, MSSQL, MongoDB desteği
- ✅ **Multiple Databases** - Aynı anda birden fazla farklı veritabanı sunucusu
- ✅ **Hot Reload** - Development'ta otomatik yenileme
- ✅ **Soft Restart** - Production'da downtime olmadan yeniden başlatma
- ✅ **Code Splitting** - Her sayfa ayrı bundle
- ✅ **TypeScript** - Tam type-safety

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
bun install

# .env dosyasını yapılandır
cp .env.example .env
```

## 🎯 Kullanım

### Development Modu

```bash
bun run dev
```

### Production Build

```bash
# Build et
bun run build

# Çalıştır
bun start
```

## 🗄️ Database Kullanımı

Framework, **5 farklı veritabanı tipini** destekler ve **aynı anda birden fazla veritabanına** bağlanabilir.

### Desteklenen Veritabanları

- ✅ **PostgreSQL** (Drizzle ORM)
- ✅ **MySQL / MariaDB** (Drizzle ORM)
- ✅ **SQLite** (Drizzle ORM)
- ✅ **Microsoft SQL Server (MSSQL)** (Native driver)
- ✅ **MongoDB** (Native driver)

### Hızlı Başlangıç

1. `.env` dosyasını düzenleyin:
```env
# Primary Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=vnframework

# MikroServer - MSSQL
MIKROSERVER_DB_TYPE=mssql
MIKROSERVER_DB_HOST=192.168.1.5
MIKROSERVER_DB_PORT=1433
MIKROSERVER_DB_USER=sa
MIKROSERVER_DB_PASSWORD=password
MIKROSERVER_DB_NAME=MikroDB
```

2. API'de kullan:
```typescript
import { db } from "../database";

// Primary database
const primaryDB = db.getConnection("default");

// MikroServer (MSSQL)
const mikroDB = db.getConnection("mikroserver");
const result = await mikroDB.query("SELECT * FROM Products");
```

**Detaylı bilgi için:**
- [DATABASE.md](DATABASE.md) - Temel kullanım
- [MULTI-DATABASE.md](MULTI-DATABASE.md) - Çoklu veritabanı kullanımı

## 📁 Proje Yapısı

```
vnframework/
├── src/
│   ├── pages/          # Route dosyaları (index.tsx → /)
│   ├── api/            # API endpoints (hello.ts → /api/hello)
│   ├── components/     # React bileşenleri
│   ├── database/       # Database adapters & schemas
│   │   ├── adapters/   # PostgreSQL, MySQL, SQLite, MSSQL, MongoDB
│   │   └── schemas/    # Drizzle schema'lar
│   ├── config/         # Konfigürasyon dosyaları
│   ├── server.tsx      # Ana sunucu
│   └── entry-client.tsx # Client-side hydration
├── build.ts            # Build script
├── manager.ts          # Production process manager
└── drizzle.config.ts   # Migration config
```

## 🔧 Scripts

```bash
bun run dev          # Development sunucusu (watch mode)
bun run build        # Production build
bun start            # Production server
bun run db:generate  # Migration dosyaları oluştur
bun run db:migrate   # Migration'ları çalıştır
bun run db:push      # Schema'yı direkt DB'ye push et
bun run db:studio    # Drizzle Studio GUI
```

## 🌐 Yeni Sayfa Ekleme

```typescript
// src/pages/about.tsx
export const title = "Hakkımızda";
export const description = "Bu sayfa hakkında bilgi";

export default function About() {
  return <div>Hakkımızda sayfası</div>;
}
```

Otomatik olarak `/about` route'u oluşur! 🎉

## 🔌 Yeni API Endpoint Ekleme

```typescript
// src/api/hello.ts
export default function handler(req: Request) {
  return Response.json({ message: "Hello World!" });
}
```

Otomatik olarak `/api/hello` endpoint'i oluşur! 🎉

## 📚 Daha Fazla Bilgi

- [Database Kullanımı](DATABASE.md) - Temel veritabanı işlemleri
- [Çoklu Veritabanı](MULTI-DATABASE.md) - Birden fazla DB sunucusu kullanımı
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Bun Documentation](https://bun.sh)

## 📝 Lisans

MIT