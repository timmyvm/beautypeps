"use client";

import { Download, PackageCheck } from "lucide-react";
import { useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { markOrdersPackingAction } from "@/lib/actions/admin/orders";
import { PACKAGING_TYPES, type AuspostSender } from "@/lib/auspost";
import { AU_STATES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type AuspostOrderRow = {
  id: string;
  orderNumber: string;
  name: string;
  suburb: string;
  state: string;
  postcode: string;
  method: "standard" | "express";
  status: "paid" | "processing";
  units: number;
  placed: string;
};

export function AuspostForm({ orders, sender }: { orders: AuspostOrderRow[]; sender: AuspostSender }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(orders.map((o) => o.id)));
  const [packaging, setPackaging] = useState<string>("AP_SATCHEL_S");
  const pack = PACKAGING_TYPES.find((p) => p.code === packaging) ?? PACKAGING_TYPES[1];
  const [weight, setWeight] = useState<string>(String(pack.defaultKg));
  const allChecked = selected.size === orders.length && orders.length > 0;
  const paidSelected = orders.filter((o) => selected.has(o.id) && o.status === "paid").length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action="/admin/orders/export-auspost" method="get" className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      {/* Orders */}
      <section className="rounded-2xl border border-stone/70 bg-cream">
        <div className="flex items-center justify-between gap-4 border-b border-stone/60 px-5 py-4">
          <h2 className="text-sm font-semibold text-espresso">Orders ready to ship ({orders.length})</h2>
          <label className="flex items-center gap-2 text-xs text-cocoa">
            <Checkbox
              checked={allChecked}
              onChange={() => setSelected(allChecked ? new Set() : new Set(orders.map((o) => o.id)))}
            />
            Select all
          </label>
        </div>
        {orders.length === 0 ? (
          <p className="p-5 text-sm text-cocoa">No paid or packing orders right now.</p>
        ) : (
          <ul className="max-h-[560px] divide-y divide-stone/50 overflow-y-auto">
            {orders.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-ivory/50">
                  <Checkbox name="id" value={o.id} checked={selected.has(o.id)} onChange={() => toggle(o.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-espresso">
                      {o.orderNumber} · {o.name}
                    </span>
                    <span className="block text-xs text-taupe">
                      {o.suburb} {o.state} {o.postcode} · {o.units} {o.units === 1 ? "item" : "items"} · {o.placed}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1 text-[11px]">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-semibold",
                        o.method === "express" ? "bg-copper-light text-copper-dark" : "bg-sand text-cocoa",
                      )}
                    >
                      {o.method === "express" ? "EXP" : "PP"}
                    </span>
                    <span className="text-taupe">{o.status === "paid" ? "Paid" : "Packing"}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-6">
        {/* Sender */}
        <section className="rounded-2xl border border-stone/70 bg-cream p-5">
          <h2 className="mb-4 text-sm font-semibold text-espresso">Send from</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *" htmlFor="s_name" className="col-span-2 sm:col-span-1">
              <Input id="s_name" name="s_name" defaultValue={sender.name} maxLength={35} required />
            </Field>
            <Field label="Business name" htmlFor="s_business" className="col-span-2 sm:col-span-1">
              <Input id="s_business" name="s_business" defaultValue={sender.business} maxLength={40} />
            </Field>
            <Field label="Address line 1 *" htmlFor="s_line1" className="col-span-2">
              <Input id="s_line1" name="s_line1" defaultValue={sender.line1} maxLength={40} required />
            </Field>
            <Field label="Address line 2" htmlFor="s_line2" className="col-span-2">
              <Input id="s_line2" name="s_line2" defaultValue={sender.line2} maxLength={40} />
            </Field>
            <Field label="Suburb *" htmlFor="s_suburb" className="col-span-2 sm:col-span-1">
              <Input id="s_suburb" name="s_suburb" defaultValue={sender.suburb} maxLength={30} required />
            </Field>
            <div className="col-span-2 grid grid-cols-2 gap-3 sm:col-span-1">
              <Field label="State *" htmlFor="s_state">
                <Select id="s_state" name="s_state" defaultValue={sender.state} required>
                  <option value="">—</option>
                  {AU_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Postcode *" htmlFor="s_postcode">
                <Input
                  id="s_postcode"
                  name="s_postcode"
                  defaultValue={sender.postcode}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  required
                />
              </Field>
            </div>
            <Field label="Phone" htmlFor="s_phone" className="col-span-2 sm:col-span-1">
              <Input id="s_phone" name="s_phone" defaultValue={sender.phone} inputMode="tel" />
            </Field>
            <Field label="Email" htmlFor="s_email" className="col-span-2 sm:col-span-1">
              <Input id="s_email" name="s_email" type="email" defaultValue={sender.email} maxLength={50} />
            </Field>
          </div>
          <p className="mt-3 text-xs text-taupe">Remembered on this browser after your first export.</p>
        </section>

        {/* Parcel */}
        <section className="rounded-2xl border border-stone/70 bg-cream p-5">
          <h2 className="mb-4 text-sm font-semibold text-espresso">Parcel</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Packaging" htmlFor="packaging" className="col-span-2">
              <Select
                id="packaging"
                name="packaging"
                value={packaging}
                onChange={(e) => {
                  setPackaging(e.target.value);
                  const next = PACKAGING_TYPES.find((p) => p.code === e.target.value);
                  if (next) setWeight(String(next.defaultKg));
                }}
              >
                {PACKAGING_TYPES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Weight (kg)" htmlFor="weight" hint={`Max ${pack.maxKg} kg for this packaging`}>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min="0.01"
                max={pack.maxKg}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </Field>
            <Field label="Item description" htmlFor="description">
              <Input id="description" name="description" defaultValue="Skincare products" maxLength={50} />
            </Field>
            {packaging === "OWN_PACKAGING" && (
              <div className="col-span-2 grid grid-cols-3 gap-3">
                {(["length", "width", "height"] as const).map((d) => (
                  <Field key={d} label={`${d[0].toUpperCase()}${d.slice(1)} (cm)`} htmlFor={d}>
                    <Input id={d} name={d} type="number" min="1" max="104" required />
                  </Field>
                ))}
              </div>
            )}
            <label className="col-span-2 flex items-center gap-2 text-sm text-cocoa">
              <Checkbox name="notify" defaultChecked /> Send tracking notifications to the customer
            </label>
            <label className="col-span-2 flex items-center gap-2 text-sm text-cocoa">
              <Checkbox name="signature" /> Signature on delivery
            </label>
          </div>
          <p className="mt-3 text-xs text-taupe">
            Standard orders export as <strong>PP</strong> (Parcel Post), express as <strong>EXP</strong> (Express Post).
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={selected.size === 0} className={buttonClasses({ variant: "copper" })}>
            <Download className="size-4" /> Download CSV ({selected.size})
          </button>
          <button
            type="submit"
            formAction={markOrdersPackingAction}
            formMethod="post"
            disabled={paidSelected === 0}
            className={buttonClasses({ variant: "outline" })}
          >
            <PackageCheck className="size-4" /> Mark {paidSelected} paid as packing
          </button>
        </div>
        <p className="text-xs leading-relaxed text-taupe">
          Upload the file at MyPost Business → Send a parcel → Import. Don&apos;t open it in Excel first — Excel strips
          leading zeros from phone numbers and postcodes.
        </p>
      </div>
    </form>
  );
}
