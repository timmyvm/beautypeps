"use client";

import { useState } from "react";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import { saveDiscountAction } from "@/lib/actions/admin/discounts";
import type { Discount, DiscountType } from "@/lib/db/schema";
import { DISCOUNT_TYPES } from "@/lib/constants";
import { ActionField, ActionForm } from "./action-form";
import { OpsSubmit } from "./buttons";

const toDateInput = (d: Date | null | undefined) => {
  if (!d) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export function DiscountForm({ discount }: { discount?: Discount }) {
  const [type, setType] = useState<DiscountType>(discount?.type ?? "percent");
  const valueDefault =
    discount?.type === "fixed" ? (discount.value / 100).toFixed(2) : discount?.type === "percent" ? String(discount.value) : "";

  return (
    <ActionForm action={saveDiscountAction} className="grid max-w-3xl gap-5 rounded-2xl border border-stone/70 bg-cream p-6 sm:grid-cols-2">
      {discount && <input type="hidden" name="id" value={discount.id} />}

      <ActionField name="code" label="Code" hint="Customers type this at checkout. Letters, numbers, - and _.">
        <Input
          id="code"
          name="code"
          defaultValue={discount?.code}
          required
          minLength={3}
          maxLength={32}
          className="font-mono uppercase"
          placeholder="GLOW15"
        />
      </ActionField>

      <ActionField name="type" label="Type">
        <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as DiscountType)}>
          {Object.entries(DISCOUNT_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </ActionField>

      {type !== "free_shipping" ? (
        <ActionField
          name="value"
          label={type === "percent" ? "Percentage off" : "Amount off (AUD)"}
          hint={type === "percent" ? "1–100" : "Taken off the subtotal, never below $0"}
        >
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-taupe">
              {type === "percent" ? "%" : "$"}
            </span>
            <Input
              id="value"
              name="value"
              type="number"
              step={type === "percent" ? "1" : "0.01"}
              min={type === "percent" ? 1 : 0.01}
              max={type === "percent" ? 100 : undefined}
              defaultValue={valueDefault}
              required
              className="pl-9"
            />
          </div>
        </ActionField>
      ) : (
        <div className="self-end rounded-xl bg-ivory px-4 py-3 text-xs text-cocoa">
          Standard shipping becomes free; express is discounted by the standard rate.
        </div>
      )}

      <ActionField name="minSubtotal" label="Minimum spend (AUD)" hint="Leave blank for no minimum">
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-taupe">$</span>
          <Input
            id="minSubtotal"
            name="minSubtotal"
            type="number"
            step="0.01"
            min="0"
            defaultValue={discount?.minSubtotal ? (discount.minSubtotal / 100).toFixed(2) : ""}
            className="pl-9"
          />
        </div>
      </ActionField>

      <ActionField name="maxUses" label="Usage limit" hint={discount ? `Used ${discount.usedCount} times so far` : "Leave blank for unlimited"}>
        <Input id="maxUses" name="maxUses" type="number" min="1" step="1" defaultValue={discount?.maxUses ?? ""} />
      </ActionField>

      <div className="grid grid-cols-2 gap-3">
        <ActionField name="startsAt" label="Starts">
          <Input id="startsAt" name="startsAt" type="date" defaultValue={toDateInput(discount?.startsAt)} />
        </ActionField>
        <ActionField name="endsAt" label="Ends (inclusive)">
          <Input id="endsAt" name="endsAt" type="date" defaultValue={toDateInput(discount?.endsAt)} />
        </ActionField>
      </div>

      <ActionField name="description" label="Internal description" className="sm:col-span-2">
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={discount?.description ?? ""}
          placeholder="e.g. Instagram launch campaign"
          className="min-h-16"
        />
      </ActionField>

      <label className="flex items-center gap-2 text-sm text-cocoa sm:col-span-2">
        <Checkbox name="active" defaultChecked={discount?.active ?? true} /> Active
      </label>

      <div className="flex justify-end gap-3 sm:col-span-2">
        <OpsSubmit size="md">{discount ? "Save changes" : "Create discount"}</OpsSubmit>
      </div>
    </ActionForm>
  );
}
