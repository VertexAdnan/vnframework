# FileUploader Kullanım Rehberi

Bu doküman, `src/helpers/file-uploader.ts` içinde bulunan `FileUploader` sınıfının hızlı kullanımını anlatır.

## Ne İşe Yarar?

`FileUploader` ile API endpoint içinde her seferinde uzun `formData` ve dosya kaydetme kodu yazmadan dosya yükleyebilirsiniz.

Sağladıkları:

- Multipart form-data'dan dosya okuma
- Tekli veya çoklu dosya yükleme
- Maksimum dosya boyutu limiti
- Dosya uzantısı / mime type filtreleme
- Benzersiz dosya adı üretimi
- `public/uploads` altına kayıt

## Mevcut Endpoint

Projede hazır endpoint:

- `POST /api/upload`
- Dosya alan adı: `file`

Dosya: `src/api/upload.ts`

## Hızlı Test

### Windows (curl)

```bash
curl -X POST http://localhost:3000/api/upload ^
  -F "file=@C:\path\to\image.jpg"
```

### Birden Fazla Dosya

```bash
curl -X POST http://localhost:3000/api/upload ^
  -F "file=@C:\path\to\image1.jpg" ^
  -F "file=@C:\path\to\doc.pdf"
```

## Örnek Başarılı Yanıt

```json
{
  "success": true,
  "count": 1,
  "files": [
    {
      "originalName": "image.jpg",
      "storedName": "1741350000000-uuid.jpg",
      "mimeType": "image/jpeg",
      "size": 12345,
      "relativePath": "public/uploads/1741350000000-uuid.jpg",
      "url": "/public/uploads/1741350000000-uuid.jpg"
    }
  ]
}
```

## Kendi Endpoint'inde Kullanım

```ts
import { FileUploadError, FileUploader } from "../helpers/file-uploader";

const uploader = new FileUploader({
  uploadDir: "public/uploads",
  baseUrl: "/public/uploads",
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".pdf"],
});

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ success: false, error: "Sadece POST desteklenir." }, { status: 405 });
  }

  try {
    const files = await uploader.uploadFromRequest(req, "file");
    return Response.json({ success: true, count: files.length, files });
  } catch (error: any) {
    if (error instanceof FileUploadError) {
      return Response.json({ success: false, error: error.message }, { status: error.status });
    }

    return Response.json({ success: false, error: error?.message || "Beklenmeyen yukleme hatasi" }, { status: 500 });
  }
}
```

## Parametreler

`new FileUploader(options)`

- `uploadDir`: Dosyanın fiziksel kaydedileceği klasor. Varsayılan: `public/uploads`
- `baseUrl`: Response'ta donulecek URL prefix'i. Varsayılan: `/public/uploads`
- `maxFileSizeBytes`: Maksimum dosya boyutu. Varsayılan: `10MB`
- `allowedMimeTypes`: Izinli mime type listesi (opsiyonel)
- `allowedExtensions`: Izinli uzantı listesi (opsiyonel)

`uploadFromRequest(req, fieldName)`

- `req`: API Request
- `fieldName`: FormData içindeki dosya alan adı. Varsayılan: `file`

## Notlar

- Statik dosya servisi `public/*` yollarını sunduğu için `url` alanı doğrudan tarayıcıda erişilebilir.
- Production'da `npm run build` sonrası dosyalar `dist/public` içine taşınır.
- Dosya adları çakışmayı engellemek için otomatik benzersiz üretilir.
