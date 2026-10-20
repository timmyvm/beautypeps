"use server";

import { and, count, eq, ne } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { int, optStr, SLUG_RE, str } from "@/lib/queries/admin-catalog";
import { IMAGE_SRC_HINT, isAllowedImageSrc, resolveImageField, UploadError } from "@/lib/uploads";
import { fieldErrors, slugify, type FormState } from "@/lib/utils";

const categorySchema = z.object({
  name: z.string().min(2, "Enter a category name.").max(60),
  slug: z.string().regex(SLUG_RE, "Use lowercase letters, numbers and single hyphens."),
  tagline: z.string().max(120, "Keep the tagline under 120 characters.").nullable(),
  description: z.string().max(1000).nullable(),
  image: z
    .string()
    .nullable()
    .refine((v) => v === null || isAllowedImageSrc(v), IMAGE_SRC_HINT),
  sortOrder: z.number({ error: "Sort order must be a whole number." }).int("Sort order must be a whole number."),
});

export async function saveCategoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(formData, "id") || null;

  let image: string;
  try {
    image = await resolveImageField(formData, "image", "categories");
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, message: e.message, errors: { image: e.message } };
    throw e;
  }

  const name = str(formData, "name");
  const parsed = categorySchema.safeParse({
    name,
    slug: str(formData, "slug") || slugify(name),
    tagline: optStr(formData, "tagline"),
    description: optStr(formData, "description"),
    image: image || null,
    sortOrder: int(formData, "sortOrder", 0),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }

  const clash = await db.query.categories.findFirst({
    where: id ? and(eq(categories.slug, parsed.data.slug), ne(categories.id, id)) : eq(categories.slug, parsed.data.slug),
    columns: { name: true },
  });
  if (clash) return { ok: false, message: "Please fix the highlighted fields.", errors: { slug: `“${clash.name}” already uses this slug.` } };

  if (!id) {
    const [created] = await db.insert(categories).values(parsed.data).returning({ id: categories.id });
    revalidatePath("/admin/categories");
    redirect(`/admin/categories/${created.id}?saved=created`);
  }

  await db.update(categories).set(parsed.data).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  refresh();
  return { ok: true, message: `Saved ${parsed.data.name}.` };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();
  const [{ n }] = await db.select({ n: count() }).from(products).where(eq(products.categoryId, categoryId));
  await db.delete(categories).where(eq(categories.id, categoryId));
  revalidatePath("/admin/categories");
  redirect(`/admin/categories?notice=deleted${n ? `&moved=${n}` : ""}`);
}
