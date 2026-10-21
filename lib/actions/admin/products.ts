"use server";

import { and, eq, ne } from "drizzle-orm";
import { refresh, revalidatePath, updateTag } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { CONCERNS, SKIN_TYPES } from "@/lib/constants";
import { db } from "@/lib/db";
import { products, type FaqItem, type KeyActive } from "@/lib/db/schema";
import { parseMoney } from "@/lib/format";
import {
  bool,
  int,
  jsonArray,
  list,
  optStr,
  productOrderCount,
  SLUG_RE,
  str,
} from "@/lib/queries/admin-catalog";
import { IMAGE_SRC_HINT, isAllowedImageSrc, resolveImageField, UploadError } from "@/lib/uploads";
import { fieldErrors, slugify, type FormState } from "@/lib/utils";

const CONCERN_SLUGS = CONCERNS.map((c) => c.slug) as string[];

const productSchema = z
  .object({
    name: z.string().min(2, "Enter a product name.").max(120, "Keep the name under 120 characters."),
    slug: z.string().regex(SLUG_RE, "Use lowercase letters, numbers and single hyphens."),
    subtitle: z.string().max(160, "Keep the subtitle under 160 characters.").nullable(),
    sku: z
      .string()
      .min(2, "Enter a SKU.")
      .max(40)
      .regex(/^[A-Za-z0-9][A-Za-z0-9-_]*$/, "SKUs can contain letters, numbers, hyphens and underscores."),
    categoryId: z.string().nullable(),
    status: z.enum(["active", "draft", "archived"]),
    featured: z.boolean(),
    badge: z.string().max(24, "Keep badges short (24 characters).").nullable(),
    sortOrder: z.number({ error: "Sort order must be a whole number." }).int("Sort order must be a whole number."),
    price: z.number({ error: "Enter a price." }).int().positive("Price must be more than $0."),
    compareAtPrice: z.number().int().positive().nullable(),
    stock: z.number({ error: "Stock must be a whole number." }).int("Stock must be a whole number.").min(0, "Stock can't be negative."),
    lowStockThreshold: z
      .number({ error: "Threshold must be a whole number." })
      .int("Threshold must be a whole number.")
      .min(0, "Threshold can't be negative."),
    size: z.string().max(30).nullable(),
    image: z.string().min(1, "Add a main product image.").refine(isAllowedImageSrc, IMAGE_SRC_HINT),
    gallery: z.array(z.string().refine(isAllowedImageSrc, `Gallery: ${IMAGE_SRC_HINT}`)),
    shortDescription: z
      .string()
      .min(10, "Write a short description (at least 10 characters).")
      .max(300, "Keep the short description under 300 characters."),
    description: z.string().min(20, "Write a description (at least 20 characters)."),
    howToUse: z.string().nullable(),
    ingredients: z.string().nullable(),
    texture: z.string().max(80).nullable(),
    phRange: z.string().max(30).nullable(),
    routineStep: z.string().max(60).nullable(),
    keyActives: z.array(
      z.object({
        name: z.string().min(1, "Every key active needs a name."),
        amount: z.string(),
        note: z.string().optional(),
      }),
    ),
    peptideSlugs: z.array(z.string()),
    concerns: z.array(z.string().refine((c) => CONCERN_SLUGS.includes(c), "Unknown concern.")),
    skinTypes: z.array(z.string().refine((s) => (SKIN_TYPES as readonly string[]).includes(s), "Unknown skin type.")),
    faqs: z.array(
      z.object({
        q: z.string().min(1, "Every FAQ needs a question."),
        a: z.string().min(1, "Every FAQ needs an answer."),
      }),
    ),
    seoTitle: z.string().max(70, "SEO titles should be 70 characters or fewer.").nullable(),
    seoDescription: z.string().max(170, "SEO descriptions should be 170 characters or fewer.").nullable(),
  })
  .refine((p) => p.compareAtPrice === null || p.compareAtPrice > p.price, {
    message: "Compare-at price must be higher than the price (or leave it blank).",
    path: ["compareAtPrice"],
  });

function money(formData: FormData, key: string) {
  const raw = str(formData, key);
  if (raw === "") return null;
  const cents = parseMoney(raw);
  return Number.isNaN(cents) ? -1 : cents;
}

/** Create (no id) or update (id) a product. Used with useActionState. */
export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(formData, "id") || null;

  let image: string;
  try {
    image = await resolveImageField(formData, "image", "products");
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, message: e.message, errors: { image: e.message } };
    throw e;
  }

  const name = str(formData, "name");
  const keyActives = jsonArray<Record<string, string>>(formData, "keyActives").map((k) => ({
    name: String(k.name ?? "").trim(),
    amount: String(k.amount ?? "").trim(),
    ...(k.note?.trim() ? { note: k.note.trim() } : {}),
  }));
  const faqs = jsonArray<Record<string, string>>(formData, "faqs").map((f) => ({
    q: String(f.q ?? "").trim(),
    a: String(f.a ?? "").trim(),
  }));
  const price = money(formData, "price");

  const raw = {
    name,
    slug: str(formData, "slug") || slugify(name),
    subtitle: optStr(formData, "subtitle"),
    sku: str(formData, "sku").toUpperCase(),
    categoryId: optStr(formData, "categoryId"),
    status: str(formData, "status") || "draft",
    featured: bool(formData, "featured"),
    badge: optStr(formData, "badge"),
    sortOrder: int(formData, "sortOrder", 0),
    price: price === null ? Number.NaN : price,
    compareAtPrice: money(formData, "compareAtPrice"),
    stock: int(formData, "stock", 0),
    lowStockThreshold: int(formData, "lowStockThreshold", 10),
    size: optStr(formData, "size"),
    image,
    gallery: jsonArray<string>(formData, "gallery").map((g) => String(g).trim()).filter(Boolean),
    shortDescription: str(formData, "shortDescription"),
    description: str(formData, "description"),
    howToUse: optStr(formData, "howToUse"),
    ingredients: optStr(formData, "ingredients"),
    texture: optStr(formData, "texture"),
    phRange: optStr(formData, "phRange"),
    routineStep: optStr(formData, "routineStep"),
    keyActives,
    peptideSlugs: list(formData, "peptideSlugs"),
    concerns: list(formData, "concerns"),
    skinTypes: list(formData, "skinTypes"),
    faqs,
    seoTitle: optStr(formData, "seoTitle"),
    seoDescription: optStr(formData, "seoDescription"),
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error.issues);
    if (raw.compareAtPrice === -1) errors.compareAtPrice = "Enter a valid amount, e.g. 59.00";
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const data = parsed.data;

  // Uniqueness (slug, sku)
  const [slugClash, skuClash] = await Promise.all([
    db.query.products.findFirst({
      where: id ? and(eq(products.slug, data.slug), ne(products.id, id)) : eq(products.slug, data.slug),
      columns: { id: true, name: true },
    }),
    db.query.products.findFirst({
      where: id ? and(eq(products.sku, data.sku), ne(products.id, id)) : eq(products.sku, data.sku),
      columns: { id: true, name: true },
    }),
  ]);
  if (slugClash || skuClash) {
    const errors: Record<string, string> = {};
    if (slugClash) errors.slug = `“${slugClash.name}” already uses this URL slug.`;
    if (skuClash) errors.sku = `“${skuClash.name}” already uses this SKU.`;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  const values = {
    ...data,
    keyActives: data.keyActives as KeyActive[],
    faqs: data.faqs as FaqItem[],
  };

  if (!id) {
    const [created] = await db.insert(products).values(values).returning({ id: products.id });
    revalidatePath("/admin/products");
  updateTag(TAGS.catalog);
    redirect(`/admin/products/${created.id}?saved=created`);
  }

  // Stock is managed by the separate stock adjuster on the edit page.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stock, ...update } = values;
  const result = await db.update(products).set(update).where(eq(products.id, id)).returning({ id: products.id });
  if (result.length === 0) return { ok: false, message: "This product no longer exists." };

  revalidatePath("/admin/products");
  updateTag(TAGS.catalog);
  revalidatePath(`/products/${data.slug}`);
  refresh();
  return { ok: true, message: `Saved ${data.name}.` };
}

/** Quick inventory changes from the edit page: mode "delta" (+/-) or "set". */
export async function adjustStockAction(
  productId: string,
  mode: "delta" | "set",
  value: number,
): Promise<{ ok: boolean; message: string; stock?: number }> {
  await requireAdmin();
  if (!Number.isInteger(value)) return { ok: false, message: "Enter a whole number." };
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { stock: true },
  });
  if (!product) return { ok: false, message: "Product not found." };
  const next = mode === "set" ? value : product.stock + value;
  if (next < 0) return { ok: false, message: "Stock can't go below zero." };
  await db.update(products).set({ stock: next }).where(eq(products.id, productId));
  revalidatePath("/admin/products");
  updateTag(TAGS.catalog);
  return { ok: true, message: `Stock is now ${next}.`, stock: next };
}

export async function duplicateProductAction(productId: string) {
  await requireAdmin();
  const source = await db.query.products.findFirst({ where: eq(products.id, productId) });
  if (!source) redirect("/admin/products");

  // Find a free slug / SKU
  let n = 1;
  let slug = `${source.slug}-copy`;
  let sku = `${source.sku}-COPY`;
  while (
    await db.query.products.findFirst({
      where: (p, { or }) => or(eq(p.slug, slug), eq(p.sku, sku)),
      columns: { id: true },
    })
  ) {
    n++;
    slug = `${source.slug}-copy-${n}`;
    sku = `${source.sku}-COPY${n}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdAt, updatedAt, ...rest } = source;
  const [created] = await db
    .insert(products)
    .values({ ...rest, name: `${source.name} (copy)`, slug, sku, status: "draft", featured: false, stock: 0 })
    .returning({ id: products.id });
  revalidatePath("/admin/products");
  updateTag(TAGS.catalog);
  redirect(`/admin/products/${created.id}?saved=duplicated`);
}

export async function setProductStatusAction(productId: string, status: "active" | "draft" | "archived") {
  await requireAdmin();
  await db.update(products).set({ status }).where(eq(products.id, productId));
  revalidatePath("/admin/products");
  updateTag(TAGS.catalog);
  refresh();
  return { ok: true, message: status === "archived" ? "Archived" : status === "active" ? "Now active" : "Moved to drafts" };
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();
  const orders = await productOrderCount(productId);
  if (orders > 0) {
    return {
      ok: false,
      message: `This product appears in ${orders} order${orders === 1 ? "" : "s"} — archive it instead so order history stays intact.`,
    };
  }
  await db.delete(products).where(eq(products.id, productId));
  revalidatePath("/admin/products");
  updateTag(TAGS.catalog);
  redirect("/admin/products?notice=deleted");
}
