import "server-only";

import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type UploadFolder = "products" | "articles" | "categories";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class UploadError extends Error {}

/**
 * Store an uploaded image and return its public URL.
 * Production (BLOB_READ_WRITE_TOKEN set): Vercel Blob. Local dev: /public/uploads.
 */
export async function saveUpload(file: File, folder: UploadFolder): Promise<string> {
  const ext = EXTENSIONS[file.type];
  if (!ext) throw new UploadError("Images must be JPG, PNG, WebP or AVIF.");
  if (file.size === 0) throw new UploadError("That file is empty.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("Images must be 8 MB or smaller.");

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${folder}/${randomUUID()}.${ext}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${name}`;
}

export function isNonEmptyFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && typeof value.size === "number" && value.size > 0;
}

/**
 * Image paths must be renderable by next/image: a local path ("/images/...", "/uploads/...")
 * or an https URL on Vercel Blob (the only remote host allowed in next.config.ts).
 */
export function isAllowedImageSrc(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export const IMAGE_SRC_HINT = "Upload an image, or use a /images/… path or a Vercel Blob URL.";

/**
 * Resolve an image field posted by <ImageField name="x">: a file in "xFile" wins,
 * otherwise the text value in "x". Throws UploadError on a bad file.
 */
export async function resolveImageField(formData: FormData, field: string, folder: UploadFolder) {
  const file = formData.get(`${field}File`);
  if (isNonEmptyFile(file)) return saveUpload(file, folder);
  return String(formData.get(field) ?? "").trim();
}
