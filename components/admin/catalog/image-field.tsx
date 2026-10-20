"use client";

/* eslint-disable @next/next/no-img-element -- admin previews show arbitrary uploaded/pasted images */

import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Field, Input } from "@/components/ui/form";
import { uploadImageAction } from "@/lib/actions/admin/uploads";
import { cn } from "@/lib/utils";

type Folder = "products" | "articles" | "categories";

const previewable = (src: string) => src.startsWith("/") || src.startsWith("https://");

async function upload(file: File, folder: Folder) {
  const fd = new FormData();
  fd.set("file", file);
  fd.set("folder", folder);
  return uploadImageAction(fd);
}

/**
 * Single image: upload a file (sent immediately, and also posted as `${name}File`
 * as a no-JS fallback) or paste a path / URL into the `${name}` text input.
 */
export function ImageField({
  name,
  folder,
  defaultValue,
  label = "Image",
  error,
  hint,
  aspect = "aspect-[4/5]",
}: {
  name: string;
  folder: Folder;
  defaultValue?: string | null;
  label?: string;
  error?: string;
  hint?: string;
  aspect?: string;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(undefined);
    const res = await upload(file, folder);
    setUploading(false);
    if (res.ok && res.url) {
      setValue(res.url);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setUploadError(res.error);
    }
  }

  return (
    <Field label={label} htmlFor={id} error={uploadError ?? error} hint={hint}>
      <div className="flex gap-4">
        <div className={cn("relative w-28 shrink-0 overflow-hidden rounded-xl border border-stone bg-ivory", aspect)}>
          {value && previewable(value) ? (
            <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-taupe">
              <ImagePlus className="size-6" aria-hidden />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-cream/70">
              <Loader2 className="size-5 animate-spin text-copper" aria-hidden />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            id={id}
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="/images/products/… or upload"
            aria-invalid={!!(uploadError ?? error)}
          />
          <label
            className={cn(
              "inline-flex w-fit cursor-pointer items-center gap-2 rounded-full border border-espresso/25 px-4 py-2 text-xs font-medium text-espresso hover:bg-espresso/5",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <Upload className="size-3.5" aria-hidden />
            {uploading ? "Uploading…" : "Upload image"}
            <input
              ref={fileRef}
              type="file"
              name={`${name}File`}
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={onFile}
            />
          </label>
          <p className="text-[11px] text-taupe">JPG, PNG, WebP or AVIF · max 8 MB</p>
        </div>
      </div>
    </Field>
  );
}

/** Ordered list of images serialised as JSON into a hidden input. */
export function GalleryField({
  name,
  folder,
  defaultValue,
  label = "Gallery",
  error,
}: {
  name: string;
  folder: Folder;
  defaultValue?: string[];
  label?: string;
  error?: string;
}) {
  const [images, setImages] = useState<string[]>(defaultValue ?? []);
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(undefined);
    for (const file of files) {
      const res = await upload(file, folder);
      if (res.ok && res.url) setImages((prev) => [...prev, res.url!]);
      else setUploadError(res.error);
    }
    setUploading(false);
  }

  function move(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addUrl() {
    const v = url.trim();
    if (!v) return;
    setImages((prev) => [...prev, v]);
    setUrl("");
  }

  return (
    <Field label={label} error={uploadError ?? error} hint="Shown after the main image on the product page.">
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      {images.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-stone bg-ivory">
              {previewable(src) ? (
                <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center p-2 text-center text-[10px] break-all text-danger">
                  {src}
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1">
                <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="size-3 -rotate-90" />
                </IconBtn>
                <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
                  <ArrowDown className="size-3 -rotate-90" />
                </IconBtn>
                <IconBtn label="Remove" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}>
                  <Trash2 className="size-3" />
                </IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full border border-espresso/25 px-4 py-2 text-xs font-medium text-espresso hover:bg-espresso/5",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Upload className="size-3.5" aria-hidden />}
          {uploading ? "Uploading…" : "Upload images"}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={onFiles}
          />
        </label>
        <div className="flex min-w-56 flex-1 items-center gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="or paste /images/… path"
            className="h-9"
            aria-label="Image path or URL"
          />
          <button
            type="button"
            onClick={addUrl}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-espresso/25 hover:bg-espresso/5"
            aria-label="Add image path"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </Field>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-6 place-items-center rounded-full bg-cream/95 text-espresso shadow-sm disabled:opacity-30"
    >
      {children}
    </button>
  );
}
