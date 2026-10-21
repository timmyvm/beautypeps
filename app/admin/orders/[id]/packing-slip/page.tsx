import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/ops/buttons";
import { AddressBlock } from "@/components/order/order-parts";
import { SHIPPING_METHOD_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { getOrderDetail } from "@/lib/queries/admin-ops";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const detail = await getOrderDetail((await params).id);
  return { title: detail ? `Packing slip ${detail.order.orderNumber}` : "Packing slip" };
}

// Print only the slip, whatever admin chrome surrounds it.
const printCss = `
@media print {
  @page { margin: 14mm; }
  body * { visibility: hidden !important; }
  .packing-slip, .packing-slip * { visibility: visible !important; }
  .packing-slip { position: absolute; inset: 0 auto auto 0; width: 100%; border: 0 !important; box-shadow: none !important; padding: 0 !important; }
  body { background: #fff !important; }
}`;

export default async function PackingSlipPage({ params }: Props) {
  const [detail, settings] = await Promise.all([getOrderDetail((await params).id), getSettings()]);
  if (!detail) notFound();
  const { order } = detail;
  const units = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <style>{printCss}</style>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/admin/orders/${order.id}`} className="text-[13px] text-muted hover:text-espresso">
          ← Back to {order.orderNumber}
        </Link>
        <PrintButton />
      </div>

      <article className="packing-slip mx-auto max-w-3xl rounded-2xl border border-stone/70 bg-white p-10 text-espresso">
        <header className="flex items-start justify-between gap-6 border-b border-stone pb-6">
          <div>
            <Image src="/images/brand/logo-wordmark.png" alt={settings.storeName} width={1229} height={301} className="h-8 w-auto" />
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              {settings.businessAddress}
              <br />
              {settings.supportEmail}
              {settings.abn ? ` · ABN ${settings.abn}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-copper-dark">Packing slip</p>
            <p className="mt-1 font-mono text-2xl">{order.orderNumber}</p>
            <p className="mt-1 text-[13px] text-muted">Ordered {formatDate(order.createdAt)}</p>
          </div>
        </header>

        <section className="grid gap-8 py-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-muted">Ship to</p>
            <AddressBlock address={order.shippingAddress} />
          </div>
          <div>
            <p className="mb-2 text-[13px] font-semibold text-muted">Shipping</p>
            <p className="text-sm">{SHIPPING_METHOD_LABELS[order.shippingMethod]}</p>
            {order.trackingNumber && <p className="mt-1 font-mono text-sm">{order.trackingNumber}</p>}
            <p className="mt-3 text-sm text-muted">
              {units} {units === 1 ? "unit" : "units"} · {order.items.length} {order.items.length === 1 ? "line" : "lines"}
            </p>
          </div>
        </section>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-stone text-[13px] text-muted">
              <th className="w-10 py-2.5 font-semibold">
                <span className="sr-only">Packed</span>
              </th>
              <th className="py-2.5 font-semibold">Item</th>
              <th className="py-2.5 font-semibold">SKU</th>
              <th className="py-2.5 text-right font-semibold">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-stone/60">
                <td className="py-3">
                  <span className="block size-4 rounded border border-espresso/60" aria-hidden />
                </td>
                <td className="py-3">
                  {item.name}
                  {item.size && <span className="ml-2 text-[13px] text-muted">{item.size}</span>}
                </td>
                <td className="py-3 font-mono text-[13px]">{item.sku}</td>
                <td className="py-3 text-right text-base font-semibold">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {order.customerNote && (
          <section className="mt-6 rounded-xl border border-stone p-4">
            <p className="mb-1 text-[13px] font-semibold text-muted">Customer note</p>
            <p className="text-sm whitespace-pre-line">{order.customerNote}</p>
          </section>
        )}

        <footer className="mt-10 border-t border-stone pt-6 text-center text-[13px] leading-relaxed text-muted">
          Thank you for choosing Beauty Peps. Store your peptides somewhere cool and dark, and patch test before first use.
          <br />
          Questions? {settings.supportEmail}
        </footer>
      </article>
    </>
  );
}
