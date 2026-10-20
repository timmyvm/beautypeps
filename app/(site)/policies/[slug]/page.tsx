import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/info/breadcrumbs";
import { Markdown } from "@/components/markdown";
import { getPolicy, POLICY_LINKS } from "@/lib/content/policies";
import { DEFAULT_SETTINGS, getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

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

  return (
    <div className="container-bp py-10 md:py-14">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Policies" }, { label: policy.title }]} />
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <nav aria-label="Policies" className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-4">Policies</p>
          <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-1 lg:px-0">
            {POLICY_LINKS.map((p) => (
              <li key={p.slug} className="shrink-0">
                <Link
                  href={`/policies/${p.slug}`}
                  aria-current={p.slug === slug ? "page" : undefined}
                  className={cn(
                    "block rounded-full border px-3.5 py-1.5 text-xs lg:rounded-lg lg:border-0 lg:px-3 lg:py-2 lg:text-sm",
                    p.slug === slug
                      ? "border-espresso bg-espresso text-cream lg:bg-ivory lg:font-medium lg:text-espresso"
                      : "border-stone bg-cream text-cocoa hover:text-espresso lg:bg-transparent lg:hover:bg-ivory",
                  )}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 hidden text-xs leading-relaxed text-taupe lg:block">
            Questions? Email{" "}
            <a href={`mailto:${settings.supportEmail}`} className="text-copper-dark underline underline-offset-2">
              {settings.supportEmail}
            </a>
          </p>
        </nav>

        <article className="min-w-0 max-w-3xl">
          <h1 className="font-display text-4xl text-espresso md:text-5xl">{policy.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-cocoa">{policy.summary}</p>
          <p className="mt-3 text-xs text-taupe">Last updated {policy.updated}</p>
          <Markdown className="mt-10 border-t border-stone/60 pt-6">{policy.body}</Markdown>
        </article>
      </div>
    </div>
  );
}
