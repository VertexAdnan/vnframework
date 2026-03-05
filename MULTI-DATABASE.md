# Çoklu Veritabanı Kullanım Rehberi

VN Framework, **aynı anda birden fazla farklı veritabanına bağlanmanızı** sağlar. Farklı sunuculardaki MSSQL, PostgreSQL, MySQL, MongoDB ve SQLite veritabanlarını tek bir projede kullanabilirsiniz.

## 🎯 Desteklenen Veritabanları

- ✅ **PostgreSQL** (Drizzle ORM ile)
- ✅ **MySQL / MariaDB** (Drizzle ORM ile)
- ✅ **SQLite** (Drizzle ORM ile)
- ✅ **Microsoft SQL Server (MSSQL)** (Native driver ile)
- ✅ **MongoDB** (Native driver ile)

## 📝 Konfigürasyon

### .env Dosyası

Her veritabanı için **prefix** kullanarak tanımlama yapın:

```env
# Primary Database (default)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=maindb

# MikroServer - MSSQL
MIKROSERVER_DB_TYPE=mssql
MIKROSERVER_DB_HOST=192.168.1.5
MIKROSERVER_DB_PORT=1433
MIKROSERVER_DB_USER=sa
MIKROSERVER_DB_PASSWORD=password
MIKROSERVER_DB_NAME=MikroDB
MIKROSERVER_DB_SSL=true

# B2BServer - MSSQL
B2BSERVER_DB_TYPE=mssql
B2BSERVER_DB_HOST=192.168.1.6
B2BSERVER_DB_PORT=1433
B2BSERVER_DB_USER=sa
B2BSERVER_DB_PASSWORD=password
B2BSERVER_DB_NAME=B2BDB

# MongoServer - MongoDB
MONGOSERVER_DB_TYPE=mongodb
MONGOSERVER_DB_HOST=192.168.1.5
MONGOSERVER_DB_PORT=27017
MONGOSERVER_DB_USER=admin
MONGOSERVER_DB_PASSWORD=password
MONGOSERVER_DB_NAME=MongoServerDB
MONGOSERVER_DB_AUTH_SOURCE=admin
```

### Prefix Sistemi

Her veritabanı için **benzersiz bir prefix** kullanın:
- Prefix'siz → `default` connection
- `MIKROSERVER_` → `mikroserver` connection
- `B2BSERVER_` → `b2bserver` connection
- `MONGOSERVER_` → `mongoserver` connection

Framework otomatik olarak prefix'leri algılar ve bağlantıları oluşturur.

## 💻 API'de Kullanım

### Örnek 1: MSSQL (MikroServer)

```typescript
// src/api/mikroserver.ts
import { db } from "../database";

export default async function handler(req: Request) {
  // MikroServer bağlantısını al
  const mikroDB = db.getConnection("mikroserver");

  // Native MSSQL query
  const result = await mikroDB.query("SELECT * FROM Products");

  return Response.json({
    data: result.recordset,
  });
}
```

### Örnek 2: MSSQL (B2BServer)

```typescript
// src/api/b2bserver.ts
import { db } from "../database";

export default async function handler(req: Request) {
  const b2bDB = db.getConnection("b2bserver");

  const result = await b2bDB.query(`
    SELECT 
      OrderID, 
      CustomerName, 
      OrderDate 
    FROM Orders 
    WHERE Status = 'Active'
  `);

  return Response.json({
    orders: result.recordset,
  });
}
```

### Örnek 3: MongoDB (MongoServer)

```typescript
// src/api/mongoserver.ts
import { db } from "../database";
import type { Db } from "mongodb";

export default async function handler(req: Request) {
  const mongoDB = db.getConnection("mongoserver") as Db;

  // Collection'dan veri çek
  const logs = await mongoDB
    .collection("logs")
    .find({ level: "error" })
    .limit(10)
    .toArray();

  return Response.json({
    logs,
  });
}
```

### Örnek 4: Çoklu Veritabanı Birlikte

```typescript
// src/api/combined-data.ts
import { db } from "../database";
import type { Db } from "mongodb";

export default async function handler(req: Request) {
  // 1. MikroServer'dan ürünleri çek
  const mikroDB = db.getConnection("mikroserver");
  const products = await mikroDB.query("SELECT * FROM Products");

  // 2. B2BServer'dan siparişleri çek
  const b2bDB = db.getConnection("b2bserver");
  const orders = await b2bDB.query("SELECT * FROM Orders");

  // 3. MongoDB'den logları çek
  const mongoDB = db.getConnection("mongoserver") as Db;
  const logs = await mongoDB.collection("logs").find().limit(10).toArray();

  return Response.json({
    products: products.recordset,
    orders: orders.recordset,
    logs,
    message: "Data from 3 different databases!",
  });
}
```

## 🔄 Dinamik Prefix Ekleme

Yeni bir veritabanı eklemek için:

1. **`.env` dosyasına ekleyin:**
```env
NEWSERVER_DB_TYPE=mysql
NEWSERVER_DB_HOST=192.168.1.10
NEWSERVER_DB_PORT=3306
NEWSERVER_DB_USER=root
NEWSERVER_DB_PASSWORD=password
NEWSERVER_DB_NAME=newdb
```

2. **`src/config/database.ts`'e prefix ekleyin:**
```typescript
const dbPrefixes = [
  "MIKROSERVER",
  "B2BSERVER", 
  "MONGOSERVER",
  "NEWSERVER", // ← Yeni prefix
];
```

3. **API'de kullanın:**
```typescript
const newDB = db.getConnection("newserver");
```

## 🎯 Test Endpoint'leri

Framework ile birlikte gelen örnek endpoint'ler:

```bash
# Bağlantı durumunu kontrol et
GET /api/db-status

# MikroServer'dan veri
GET /api/mikroserver

# B2BServer'dan veri
GET /api/b2bserver

# MongoServer'dan veri
GET /api/mongoserver
```

## 📊 Connection Pool Ayarları

Her adapter kendi connection pool ayarlarına sahiptir:

### PostgreSQL
```typescript
// src/database/adapters/postgres.ts
const client = postgres(connectionString, {
  max: 10,              // Maximum bağlantı sayısı
  idle_timeout: 20,     // Idle timeout (saniye)
  connect_timeout: 10,  // Bağlantı timeout (saniye)
});
```

### MSSQL
```typescript
// src/database/adapters/mssql.ts
const pool = await sql.connect({
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  }
});
```

### MongoDB
```typescript
// src/database/adapters/mongodb.ts
const client = new MongoClient(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
});
```

## 🛡️ Hata Yönetimi

Bağlantı başarısız olursa:
- **Development**: Hata loglanır, uygulama devam eder
- **Production**: Primary database hariç diğerleri loglanır ancak uygulama çalışmaya devam eder

```typescript
try {
  const db = db.getConnection("mikroserver");
  // ...
} catch (error) {
  // Bağlantı bulunamadı veya hata oluştu
  return Response.json({ 
    error: "MikroServer not available" 
  }, { status: 503 });
}
```

## 💡 Best Practices

1. **Bağlantı isimlerini küçük harfle kullanın**: `mikroserver`, `b2bserver`
2. **Her veritabanı için ayrı prefix yapın**: Karışıklığı önler
3. **Connection pooling ayarlarını optimize edin**: Yük testleri yapın
4. **Hata durumlarını handle edin**: try-catch kullanın
5. **Development'ta mock data kullanın**: Gerçek sunuculara her zaman erişilemeyebilir

## 🚀 Örnek Senaryo

E-ticaret platformu:
- **Primary DB (PostgreSQL)**: Kullanıcılar, web verileri
- **MikroServer (MSSQL)**: Stok ve ürün bilgileri
- **B2BServer (MSSQL)**: B2B siparişler
- **MongoServer (MongoDB)**: Log ve analytics

Her sistem kendi veritabanıyla çalışır, framework hepsini merkezi yönetir! 🎉
