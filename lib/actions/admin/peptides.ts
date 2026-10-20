"use server";

import { and, eq, ne } from "drizzle-orm";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { CONCERNS, PEPTIDE_CLASSES } from "@/lib/constants";
import { db } from "@/lib/db";
import { peptides, type PeptideStudy } from "@/lib/db/schema";
import { bool, int, jsonArray, lines, list, optStr, productsUsingPeptide, SLUG_RE, str } from "@/lib/queries/admin-catalog";
import { fieldErrors, slugify, type FormState } from "@/lib/utils";

const CONCERN_SLUGS = CONCERNS.map((c) => c.slug) as string[];
const currentYear = new Date().getFullYear();

const peptideSchema = z.object({
  name: z.string().min(2, "Enter the peptide's common name.").max(80),
  slug: z.string().regex(SLUG_RE, "Use lowercase letters, numbers and single hyphens."),
  inciName: z.string().min(2, "Enter the INCI name.").max(160),
  aliases: z.array(z.string().max(80)),
  peptideClass: z.string().refine((c) => c in PEPTIDE_CLASSES, "Choose a peptide class."),
  sequence: z.string().max(200).nullable(),
  molecularWeight: z.string().max(40).nullable(),
  discovered: z.string().max(120).nullable(),
  summary: z.string().min(20, "Write a summary (at least 20 characters).").max(600, "Keep the summary under 600 characters."),
  benefits: z.array(z.string().max(200)),
  mechanism: z.string().min(20, "Explain the mechanism (at least 20 characters)."),
  evidence: z.string().min(20, "Summarise the evidence (at least 20 characters)."),
  usage: z.string().min(10, "Add usage guidance (at least 10 characters)."),
  typicalConcentration: z.string().max(60).nullable(),
  phRange: z.string().max(30).nullable(),
  pairsWith: z.array(z.string().max(80)),
  avoidWith: z.array(z.string().max(80)),
  concerns: z.array(z.string().refine((c) => CONCERN_SLUGS.includes(c), "Unknown concern.")),
  studies: z.array(
    z.object({
      title: z.string().min(1, "Every study needs a title."),
      source: z.string().min(1, "Every study needs a source (journal or publisher)."),
      year: z.number().int().min(1950).max(currentYear + 1).optional(),
      url: z.url("Study links must be full URLs (https://…).").optional(),
    }),
  ),
  evidenceLevel: z.number().int().min(1, "Choose an evidence level.").max(5),
  sortOrder: z.number({ error: "Sort order must be a whole number." }).int("Sort order must be a whole number."),
  published: z.boolean(),
});

export async function savePeptideAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(formData, "id") || null;
  const name = str(formData, "name");

  const studies = jsonArray<Record<string, string>>(formData, "studies").map((s) => {
    const year = String(s.year ?? "").trim();
    const url = String(s.url ?? "").trim();
    return {
      title: String(s.title ?? "").trim(),
      source: String(s.source ?? "").trim(),
      ...(year ? { year: Number(year) } : {}),
      ...(url ? { url } : {}),
    };
  });

  const parsed = peptideSchema.safeParse({
    name,
    slug: str(formData, "slug") || slugify(name),
    inciName: str(formData, "inciName"),
    aliases: lines(formData, "aliases"),
    peptideClass: str(formData, "peptideClass"),
    sequence: optStr(formData, "sequence"),
    molecularWeight: optStr(formData, "molecularWeight"),
    discovered: optStr(formData, "discovered"),
    summary: str(formData, "summary"),
    benefits: lines(formData, "benefits"),
    mechanism: str(formData, "mechanism"),
    evidence: str(formData, "evidence"),
    usage: str(formData, "usage"),
    typicalConcentration: optStr(formData, "typicalConcentration"),
    phRange: optStr(formData, "phRange"),
    pairsWith: lines(formData, "pairsWith"),
    avoidWith: lines(formData, "avoidWith"),
    concerns: list(formData, "concerns"),
    studies,
    evidenceLevel: int(formData, "evidenceLevel", 3),
    sortOrder: int(formData, "sortOrder", 0),
    published: bool(formData, "published"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  }
  const data = { ...parsed.data, studies: parsed.data.studies as PeptideStudy[] };

  const clash = await db.query.peptides.findFirst({
    where: id ? and(eq(peptides.slug, data.slug), ne(peptides.id, id)) : eq(peptides.slug, data.slug),
    columns: { name: true },
  });
  if (clash) return { ok: false, message: "Please fix the highlighted fields.", errors: { slug: `“${clash.name}” already uses this slug.` } };

  if (!id) {
    const [created] = await db.insert(peptides).values(data).returning({ id: peptides.id });
    revalidatePath("/admin/peptides");
    redirect(`/admin/peptides/${created.id}?saved=created`);
  }

  const before = await db.query.peptides.findFirst({ where: eq(peptides.id, id), columns: { slug: true } });
  if (!before) return { ok: false, message: "This peptide no longer exists." };
  if (before.slug !== data.slug) {
    const using = await productsUsingPeptide(before.slug);
    if (using.length > 0) {
      return {
        ok: false,
        message: "Please fix the highlighted fields.",
        errors: {
          slug: `${using.length} product${using.length === 1 ? " links" : "s link"} to this slug (${using
            .map((p) => p.name)
            .join(", ")}). Untick it on those products first.`,
        },
      };
    }
  }

  await db.update(peptides).set(data).where(eq(peptides.id, id));
  revalidatePath("/admin/peptides");
  revalidatePath(`/peptides/${data.slug}`);
  refresh();
  return { ok: true, message: `Saved ${data.name}.` };
}

export async function deletePeptideAction(peptideId: string) {
  await requireAdmin();
  const peptide = await db.query.peptides.findFirst({ where: eq(peptides.id, peptideId), columns: { slug: true } });
  if (!peptide) redirect("/admin/peptides");
  const using = await productsUsingPeptide(peptide.slug);
  if (using.length > 0) {
    return {
      ok: false,
      message: `Used by ${using.length} product${using.length === 1 ? "" : "s"} (${using.map((p) => p.name).join(", ")}). Unpublish it instead, or untick it on those products first.`,
    };
  }
  await db.delete(peptides).where(eq(peptides.id, peptideId));
  revalidatePath("/admin/peptides");
  redirect("/admin/peptides?notice=deleted");
}
