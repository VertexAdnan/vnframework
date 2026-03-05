# VN Framework - Database Kullanım Kılavuzu

## 🚀 Hızlı Başlangıç

### 1. Konfigürasyon

`.env` dosyanızı oluşturun (`.env.example`'dan kopyalayın):

```bash
cp .env.example .env
```

### 2. Veritabanı Seçimi

#### PostgreSQL
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=vnframework
```

#### MySQL
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=vnframework
```

#### SQLite
```env
DB_TYPE=sqlite
DB_FILENAME=./database.db
```

### 3. Schema Tanımlama

`src/database/schemas/` klasörüne schema dosyalarınızı ekleyin:

```typescript
// src/database/schemas/users.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 4. Migration Oluştur

```bash
bun run db:generate
```

### 5. Migration Çalıştır

```bash
bun run db:migrate
# veya direkt push
bun run db:push
```

### 6. Server'da Database'i Başlat

```typescript
// src/server.tsx
import { initializeDatabases, closeDatabases } from "./config/database";

// Server başlatmadan önce
await initializeDatabases();

// Graceful shutdown'da
process.on("SIGTERM", async () => {
  await closeDatabases();
  process.exit(0);
});
```

## 📚 Kullanım Örnekleri

### API Endpoint'lerinde

```typescript
// src/api/users.ts
import { db } from "../database";
import { users } from "../database/schemas/users";
import { eq } from "drizzle-orm";

export default async function handler(req: Request) {
  const database = db.getConnection("default");
  
  // SELECT
  const allUsers = await database.select().from(users);
  
  // INSERT
  const newUser = await database.insert(users)
    .values({ name: "John", email: "john@example.com" })
    .returning();
  
  // UPDATE
  await database.update(users)
    .set({ name: "Jane" })
    .where(eq(users.id, 1));
  
  // DELETE
  await database.delete(users).where(eq(users.id, 1));
  
  return Response.json({ users: allUsers });
}
```

### Çoklu Veritabanı Kullanımı

```typescript
// .env
SECONDARY_DB_TYPE=mysql
SECONDARY_DB_HOST=localhost
SECONDARY_DB_NAME=analytics

// Kullanım
const primary = db.getConnection("default");
const analytics = db.getConnection("secondary");
```

## 🔧 Drizzle Kit Komutları

```bash
# Migration dosyaları oluştur
bun run db:generate

# Migration'ları çalıştır
bun run db:migrate

# Schema'yı direkt DB'ye push et (dikkatli kullan!)
bun run db:push

# Drizzle Studio GUI'yi aç
bun run db:studio
```

## 💡 İpuçları

1. **Development'ta** `db:push` kullanabilirsiniz (hızlı)
2. **Production'da** mutlaka `db:generate` + `db:migrate` kullanın
3. Schema değişikliklerini version control'e ekleyin
4. `.env` dosyasını **asla** git'e eklemeyin
5. Birden fazla database adapter aynı anda çalışabilir

## 🎯 Test Endpoint'leri

- `GET /api/users` - Kullanıcıları listele
- `POST /api/user-create` - Yeni kullanıcı oluştur

Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```
