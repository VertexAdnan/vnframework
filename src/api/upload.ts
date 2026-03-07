import { FileUploadError, FileUploader } from "../helpers/file-uploader";

const uploader = new FileUploader({
  uploadDir: "public/uploads",
  baseUrl: "/public/uploads",
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".pdf"],
});

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return Response.json(
      { success: false, error: "Sadece POST desteklenir." },
      { status: 405 }
    );
  }

  try {
    const files = await uploader.uploadFromRequest(req, "file");

    return Response.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error: any) {
    if (error instanceof FileUploadError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    }

    return Response.json(
      { success: false, error: error?.message || "Beklenmeyen yukleme hatasi" },
      { status: 500 }
    );
  }
}
