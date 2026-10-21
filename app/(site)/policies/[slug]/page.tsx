import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Figure, PageHeader, PictureLink, reveal } from "@/components/info/page-header";
import { Markdown } from "@/components/markdown";
import { getPolicy, POLICY_LINKS } from "@/lib/content/policies";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

const PICTURES: Record<string, { src: string; alt: string }> = {
  shipping: { src: "/images/editorial/unboxing.webp", alt: "An opened box holding three serums in tissue paper" },
  returns: { src: "/images/editorial/hero.webp", alt: "Three peptide serums on a travertine plinth in soft afternoon light" },
  terms: { src: "/images/editorial/lab.webp", alt: "A formulation bench with beakers, a scale and amber vials" },
  privacy: { src: "/images/articles/beginner-peptide-routine.webp", alt: "Three serums and a vase on a travertine tray in a bathroom" },
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug, DEFAULT_SETTINGS);
  if (!policy) return { title: "Policy not found" };
  return { title: policy.title, description: policy.summary, alternates: { canonical: `/policies/${slug}` } };
}

export default async function PolicyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const settings = await getSettings();
  const policy = getPolicy(slug, settings);
  if (!policy) notFound();
  const pic = PICTURES[slug];
  const others = POLICY_LINKS.filter((p) => p.slug !== slug).map((p) => getPolicy(p.slug, settings)!);

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Policies" }, { label: policy.title }]}
        title={policy.title}
        lead={policy.summary}
        figure={
          pic && (
            <Figure ratio="aspect-[4/3]">
              <Image src={pic.src} alt={pic.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </Figure>
          )
        }
      >
        <p className="text-body text-muted">Last updated {policy.updated}</p>
        <nav aria-label="Policies" className="mt-6 flex flex-wrap gap-2">
          {POLICY_LINKS.map((p) => (
            <Link
              key={p.slug}
              href={`/policies/${p.slug}`}
              aria-current={p.slug === slug ? "page" : undefined}
              className={cn(
                "press inline-flex h-11 items-center px-4 text-body whitespace-nowrap",
                p.slug === slug ? "bg-ink text-white" : "bg-surface text-ink hover:bg-surface-2",
              )}
            >
              {p.title.replace(" & ", " and ")}
            </Link>
          ))}
        </nav>
      </PageHeader>

      <div className="container-bp mt-20 grid gap-12 lg:mt-32 lg:grid-cols-12 lg:gap-[var(--gutter)]">
        <aside className="lg:col-span-3">
          <h2 className="text-lead font-medium">Questions?</h2>
          <p className="mt-2 text-body">
            Email{" "}
            <a href={`mailto:${settings.supportEmail}`} className="underline underline-offset-4">
              {settings.supportEmail}
            </a>{" "}
            and we will reply within one business day.
          </p>
        </aside>
        <Markdown className="min-w-0 lg:col-span-7 lg:col-start-5">{policy.body}</Markdown>
      </div>

      <section aria-labelledby="others-title" className="container-bp mt-28 lg:mt-44">
        <h2 id="others-title" className="display-type text-head" {...reveal(0)}>
          The other policies
        </h2>
        <div className="mt-12 grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-3">
          {others.map((p, i) => (
            <PictureLink
              key={p.slug}
              href={`/policies/${p.slug}`}
              src={PICTURES[p.slug]?.src ?? "/images/editorial/texture.webp"}
              alt={PICTURES[p.slug]?.alt ?? ""}
              title={p.title.replace(" & ", " and ")}
              text={p.summary}
              index={i + 1}
            />
          ))}
        </div>
      </section>
    </>
  );
}
