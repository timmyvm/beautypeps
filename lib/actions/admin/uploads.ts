"use server";

import { requireAdmin } from "@/lib/auth/session";
import { isNonEmptyFile, saveUpload, UploadError, type UploadFolder } from "@/lib/uploads";

const FOLDERS: UploadFolder[] = ["products", "articles", "categories"];

/** Immediate upload used by the admin ImageField / GalleryField. Expects "file" and "folder". */
export async function uploadImageAction(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "products") as UploadFolder;
  if (!FOLDERS.includes(folder)) return { ok: false, error: "Unknown upload folder." };
  if (!isNonEmptyFile(file)) return { ok: false, error: "Choose an image to upload." };
  try {
    return { ok: true, url: await saveUpload(file, folder) };
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, error: e.message };
    console.error("[upload]", e);
    return { ok: false, error: "Upload failed. Please try again." };
  }
}
