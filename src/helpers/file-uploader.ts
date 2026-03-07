import { mkdir } from "node:fs/promises";
import path from "node:path";

export interface FileUploaderOptions {
  uploadDir?: string;
  baseUrl?: string;
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export interface UploadedFile {
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  relativePath: string;
  url: string;
}

export class FileUploadError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "FileUploadError";
    this.status = status;
  }
}

export class FileUploader {
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly maxFileSizeBytes: number;
  private readonly allowedMimeTypes?: Set<string>;
  private readonly allowedExtensions?: Set<string>;

  constructor(options: FileUploaderOptions = {}) {
    this.uploadDir = options.uploadDir || "public/uploads";
    this.baseUrl = options.baseUrl || "/public/uploads";
    this.maxFileSizeBytes = options.maxFileSizeBytes || 10 * 1024 * 1024;
    this.allowedMimeTypes = options.allowedMimeTypes
      ? new Set(options.allowedMimeTypes.map((m) => m.toLowerCase()))
      : undefined;
    this.allowedExtensions = options.allowedExtensions
      ? new Set(options.allowedExtensions.map((e) => e.toLowerCase()))
      : undefined;
  }

  async uploadFromRequest(req: Request, fieldName = "file"): Promise<UploadedFile[]> {
    const formData = await req.formData();
    const files = formData
      .getAll(fieldName)
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      throw new FileUploadError(`'${fieldName}' alaninda dosya bulunamadi.`);
    }

    await mkdir(this.uploadDir, { recursive: true });

    const uploadedFiles: UploadedFile[] = [];
    for (const file of files) {
      this.validateFile(file);

      const extension = path.extname(file.name).toLowerCase();
      const storedName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
      const absolutePath = path.join(this.uploadDir, storedName);
      await Bun.write(absolutePath, file);

      uploadedFiles.push({
        originalName: file.name,
        storedName,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        relativePath: `${this.uploadDir}/${storedName}`.replace(/\\/g, "/"),
        url: `${this.baseUrl}/${storedName}`.replace(/\\/g, "/"),
      });
    }

    return uploadedFiles;
  }

  private validateFile(file: File) {
    if (file.size > this.maxFileSizeBytes) {
      throw new FileUploadError(
        `Dosya boyutu limiti asildi. Maksimum: ${this.maxFileSizeBytes} bytes.`
      );
    }

    if (this.allowedMimeTypes && file.type) {
      const normalizedType = file.type.toLowerCase();
      if (!this.allowedMimeTypes.has(normalizedType)) {
        throw new FileUploadError(`Dosya tipi desteklenmiyor: ${file.type}`);
      }
    }

    if (this.allowedExtensions) {
      const extension = path.extname(file.name).toLowerCase();
      if (!this.allowedExtensions.has(extension)) {
        throw new FileUploadError(`Dosya uzantisi desteklenmiyor: ${extension || "(yok)"}`);
      }
    }
  }
}
