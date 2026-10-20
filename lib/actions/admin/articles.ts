"use server";

import { and, eq, ne } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { bool, int, optStr, SLUG_RE, str } from "@/lib/queries/admin-catalog";
import { IMAGE_SRC_HINT, isAllowedImageSrc, resolveImageField, UploadError } from "@/lib/uploads";
import { fieldErrors, slugify, type FormState } from "@/lib/utils";

const articleSchema = z.object({
  title: z.string().min(4, "Enter a title.").max(140, "Keep the title under 140 characters."),
  slug: z.string().regex(SLUG_RE, "Use lowercase letters, numbers and single hyphens."),
  excerpt: z.string().min(20, "Write an excerpt (at least 20 characters).").max(320, "Keep the excerpt under 320 characters."),
  body: z.string().min(50, "The article body is too short."),
  coverImage: z
    .string()
    .nullable()
    .refine((v) => v === null || isAllowedImageSrc(v), IMAGE_SRC_HINT),
  category: z.enum(ARTICLE_CATEGORIES, { error: "Choose a category." }),
  author: z.string().min(2, "Enter an author.").max(80),
  readMinutes: z.number({ error: "Read time must be a whole number." }).int().min(1, "Read time must be at least 1 minute.").max(120),
  featured: z.boolean(),
  published: z.boolean(),
  publishedAt: z.date().nullable(),
  seoDescription: z.string().max(170, "SEO descriptions should be 170 characters or fewer.").nullable(),
});

/** datetime-local value ("2026-10-20T09:30") → Date, interpreted in the server's local time. */
function parseDateTime(value: string) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function saveArticleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(formData, "id") || null;

  let coverImage: string;
  try {
    coverImage = await resolveImageField(formData, "coverImage", "articles");
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, message: e.message, errors: { coverImage: e.message } };
    throw e;
  }

  const title = str(formData, "title");
  const body = str(formData, "body");
  const words = body ? body.split(/\s+/).length : 0;
  const published = bool(formData, "published");
  let publishedAt = parseDateTime(str(formData, "publishedAt"));
  if (publishedAt === undefined) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: { publishedAt: "Enter a valid date and time." } };
  }
  // First publish without an explicit date → now.
  if (published && !publishedAt) publishedAt = new Date();

  const parsed = articleSchema.safeParse({
    title,
    slug: str(formData, "slug") || slugify(title),
    excerpt: str(formData, "excerpt"),
    body,
    coverImage: coverImage || null,
    category: str(formData, "category"),
    author: str(formData, "author") || "Beauty Peps Lab",
    readMinutes: int(formData, "readMinutes", Math.max(1, Math.round(words / 220))),
    featured: bool(formData, "featured"),
    published,
    publishedAt,
    seoDescription: optStr(formData, "seoDescription"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }
  const data = parsed.data;

  const clash = await db.query.articles.findFirst({
    where: id ? and(eq(articles.slug, data.slug), ne(articles.id, id)) : eq(articles.slug, data.slug),
    columns: { title: true },
  });
  if (clash) return { ok: false, message: "Please fix the highlighted fields.", errors: { slug: `“${clash.title}” already uses this slug.` } };

  if (!id) {
    const [created] = await db.insert(articles).values(data).returning({ id: articles.id });
    revalidatePath("/admin/articles");
    redirect(`/admin/articles/${created.id}?saved=created`);
  }

  const result = await db.update(articles).set(data).where(eq(articles.id, id)).returning({ id: articles.id });
  if (result.length === 0) return { ok: false, message: "This article no longer exists." };
  revalidatePath("/admin/articles");
  revalidatePath(`/learn/${data.slug}`);
  revalidatePath("/learn");
  refresh();
  return { ok: true, message: data.published ? `Saved and published “${data.title}”.` : `Saved draft “${data.title}”.` };
}

export async function deleteArticleAction(articleId: string) {
  await requireAdmin();
  await db.delete(articles).where(eq(articles.id, articleId));
  revalidatePath("/admin/articles");
  revalidatePath("/learn");
  redirect("/admin/articles?notice=deleted");
}
