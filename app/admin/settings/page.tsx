import { CheckCircle2, CircleDashed } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ActionField, ActionForm } from "@/components/admin/ops/action-form";
import { OpsSubmit } from "@/components/admin/ops/buttons";
import { Toaster } from "@/components/admin/ops/toast";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { Input, Textarea } from "@/components/ui/form";
import { saveSettingsAction } from "@/lib/actions/admin/settings";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Settings" };

const dollars = (cents: number) => (cents / 100).toFixed(2);

function MoneyInput({ id, cents }: { id: string; cents: number }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-taupe">$</span>
      <Input id={id} name={id} type="number" step="0.01" min="0" defaultValue={dollars(cents)} className="pl-9" required />
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="grid gap-6 border-b border-stone/60 py-8 first:pt-0 last:border-0 last:pb-0 lg:grid-cols-[240px_1fr]">
      <div>
        <h2 className="text-sm font-semibold text-espresso">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function EnvRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sage" aria-label="Configured" />
      ) : (
        <CircleDashed className="mt-0.5 size-4 shrink-0 text-taupe" aria-label="Not configured" />
      )}
      <div>
        <p className="text-sm text-espresso">{label}</p>
        <p className="text-[13px] text-muted">{detail}</p>
      </div>
    </li>
  );
}

export default async function AdminSettingsPage() {
  const s = await getSettings();
  const dbUrl = process.env.DATABASE_URL ?? "file:local.db";
  const env = {
    authSecret: !!process.env.AUTH_SECRET,
    resend: !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    remoteDb: !dbUrl.startsWith("file:"),
    siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
  };

  return (
    <>
      <Toaster />
      <AdminPageHeader title="Settings" description="Store details, payment instructions and shipping rates." />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Panel>
          <ActionForm action={saveSettingsAction}>
            <Section title="Store details" description="Shown in the footer, emails and packing slips.">
              <ActionField name="storeName" label="Store name">
                <Input id="storeName" name="storeName" defaultValue={s.storeName} required />
              </ActionField>
              <ActionField name="abn" label="ABN">
                <Input id="abn" name="abn" defaultValue={s.abn} placeholder="12 345 678 901" />
              </ActionField>
              <ActionField name="supportEmail" label="Support email">
                <Input id="supportEmail" name="supportEmail" type="email" defaultValue={s.supportEmail} required />
              </ActionField>
              <ActionField name="supportPhone" label="Support phone">
                <Input id="supportPhone" name="supportPhone" defaultValue={s.supportPhone} />
              </ActionField>
              <ActionField name="businessAddress" label="Business address" className="sm:col-span-2">
                <Input id="businessAddress" name="businessAddress" defaultValue={s.businessAddress} />
              </ActionField>
            </Section>

            <Section title="Announcement bar" description="The thin bar above the site header. Leave empty to hide it.">
              <ActionField name="announcement" label="Message" className="sm:col-span-2" hint="Max 160 characters">
                <Input id="announcement" name="announcement" defaultValue={s.announcement} maxLength={160} />
              </ActionField>
            </Section>

            <Section
              title="Payments"
              description="Customers see these details after checkout and in their confirmation email. Orders use the order number as the payment reference."
            >
              <ActionField name="bankAccountName" label="Account name">
                <Input id="bankAccountName" name="bankAccountName" defaultValue={s.bankAccountName} />
              </ActionField>
              <ActionField name="payId" label="PayID">
                <Input id="payId" name="payId" defaultValue={s.payId} />
              </ActionField>
              <ActionField name="bankBsb" label="BSB">
                <Input id="bankBsb" name="bankBsb" defaultValue={s.bankBsb} inputMode="numeric" />
              </ActionField>
              <ActionField name="bankAccountNumber" label="Account number">
                <Input id="bankAccountNumber" name="bankAccountNumber" defaultValue={s.bankAccountNumber} inputMode="numeric" />
              </ActionField>
              <ActionField name="paymentWindowDays" label="Payment window (days)" hint="Unpaid orders are released after this">
                <Input id="paymentWindowDays" name="paymentWindowDays" type="number" min="1" max="30" defaultValue={s.paymentWindowDays} required />
              </ActionField>
            </Section>

            <Section title="Shipping" description="Australia-wide flat rates. Prices include GST.">
              <ActionField name="standardShipping" label="Standard (Parcel Post)">
                <MoneyInput id="standardShipping" cents={s.standardShipping} />
              </ActionField>
              <ActionField name="expressShipping" label="Express (Express Post)">
                <MoneyInput id="expressShipping" cents={s.expressShipping} />
              </ActionField>
              <ActionField name="freeShippingThreshold" label="Free standard shipping over" hint="Set to 0 to turn free shipping off">
                <MoneyInput id="freeShippingThreshold" cents={s.freeShippingThreshold} />
              </ActionField>
              <ActionField name="dispatchTime" label="Dispatch time message" className="sm:col-span-2">
                <Textarea id="dispatchTime" name="dispatchTime" defaultValue={s.dispatchTime} rows={2} className="min-h-16" />
              </ActionField>
            </Section>

            <Section title="Social" description="Linked from the footer.">
              <ActionField name="instagram" label="Instagram URL">
                <Input id="instagram" name="instagram" type="url" defaultValue={s.instagram} placeholder="https://instagram.com/…" />
              </ActionField>
              <ActionField name="tiktok" label="TikTok URL">
                <Input id="tiktok" name="tiktok" type="url" defaultValue={s.tiktok} placeholder="https://tiktok.com/@…" />
              </ActionField>
            </Section>

            <div className="sticky bottom-4 mt-8 flex justify-end">
              <OpsSubmit size="md">
                Save settings
              </OpsSubmit>
            </div>
          </ActionForm>
        </Panel>

        <Panel title="Environment" className="self-start">
          <p className="mb-2 text-[13px] text-muted">Read-only. Configure these as environment variables on your host.</p>
          <ul className="divide-y divide-stone/50">
            <EnvRow
              label="Session secret"
              ok={env.authSecret}
              detail={env.authSecret ? "AUTH_SECRET is set." : "AUTH_SECRET missing — required in production."}
            />
            <EnvRow
              label="Email delivery"
              ok={env.resend}
              detail={env.resend ? "Sending through Resend." : "RESEND_API_KEY / EMAIL_FROM not set — emails are logged only."}
            />
            <EnvRow
              label="Image uploads"
              ok={env.blob}
              detail={env.blob ? "Uploading to Vercel Blob." : "BLOB_READ_WRITE_TOKEN not set — uploads saved locally (dev only)."}
            />
            <EnvRow
              label="Database"
              ok={env.remoteDb}
              detail={env.remoteDb ? "Connected to a remote libSQL / Turso database." : "Using a local SQLite file — fine for development."}
            />
            <EnvRow
              label="Public site URL"
              ok={env.siteUrl}
              detail={env.siteUrl ? "NEXT_PUBLIC_SITE_URL is set (used in email links)." : "NEXT_PUBLIC_SITE_URL not set — email links use localhost."}
            />
          </ul>
        </Panel>
      </div>
    </>
  );
}
