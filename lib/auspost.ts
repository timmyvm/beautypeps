import type { Order } from "@/lib/db/schema";

/*
 * Australia Post MyPost Business bulk-import CSV (domestic).
 * Column order and enum codes follow what the MyPost validator accepts —
 * codes (AP_SATCHEL_S, PP, YES) rather than the friendly dropdown labels.
 */

export const AUSPOST_COLUMNS = [
  "Additional Label Information 1",
  "Send Tracking Notifications",
  "Send From Name",
  "Send From Business Name",
  "Send From Address Line 1",
  "Send From Address Line 2",
  "Send From Address Line 3",
  "Send From Suburb",
  "Send From State",
  "Send From Postcode",
  "Send From Phone Number",
  "Send From Email Address",
  "Deliver To Name",
  "Deliver To MyPost Number",
  "Deliver To Business Name",
  "Deliver To Type Of Address",
  "Deliver To Address Line 1",
  "Deliver To Address Line 2",
  "Deliver To Address Line 3",
  "Deliver To Suburb",
  "Deliver To State",
  "Deliver To Postcode",
  "Deliver To Phone Number",
  "Deliver To Email Address",
  "Item Packaging Type",
  "Item Delivery Service",
  "Item Description",
  "Item Length",
  "Item Width",
  "Item Height",
  "Item Weight",
  "Item Dangerous Goods Flag",
  "Signature On Delivery",
  "Extra Cover Amount",
] as const;

export const PACKAGING_TYPES = [
  { code: "AP_SATCHEL_XS", label: "Flat Rate Satchel — Extra Small (≤250 g)", maxKg: 0.25, defaultKg: 0.25 },
  { code: "AP_SATCHEL_S", label: "Flat Rate Satchel — Small (≤500 g)", maxKg: 0.5, defaultKg: 0.5 },
  { code: "AP_SATCHEL_M", label: "Flat Rate Satchel — Medium (≤3 kg)", maxKg: 3, defaultKg: 3 },
  { code: "AP_SATCHEL_L", label: "Flat Rate Satchel — Large (≤5 kg)", maxKg: 5, defaultKg: 5 },
  { code: "AP_SATCHEL_XL", label: "Flat Rate Satchel — Extra Large (≤5 kg)", maxKg: 5, defaultKg: 5 },
  { code: "AP_BOX_S", label: "Flat Rate Box — Small (≤5 kg)", maxKg: 5, defaultKg: 1 },
  { code: "AP_BOX_M", label: "Flat Rate Box — Medium (≤5 kg)", maxKg: 5, defaultKg: 2 },
  { code: "AP_BOX_L", label: "Flat Rate Box — Large (≤5 kg)", maxKg: 5, defaultKg: 3 },
  { code: "AP_BOX_XL", label: "Flat Rate Box — Extra Large (≤5 kg)", maxKg: 5, defaultKg: 5 },
  { code: "OWN_PACKAGING", label: "Own packaging (needs dimensions, ≤22 kg)", maxKg: 22, defaultKg: 0.3 },
] as const;

export type PackagingCode = (typeof PACKAGING_TYPES)[number]["code"];

export type AuspostSender = {
  name: string;
  business: string;
  line1: string;
  line2: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
};

export type AuspostParcel = {
  packaging: PackagingCode;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  description: string;
  trackingNotifications: boolean;
  signature: boolean;
};

export const AUSPOST_SENDER_COOKIE = "bp_auspost_sender";

/** Trim to max length without cutting mid-word where possible. */
function clip(s: string | null | undefined, max: number) {
  const v = (s ?? "").replace(/\s+/g, " ").trim();
  if (v.length <= max) return v;
  const cut = v.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trim();
}

/** Split an over-long street line across Address Line 1–3 (40 chars each). */
function splitAddress(line1: string, line2?: string | null) {
  const out: string[] = [];
  let rest = `${line1}${line2 ? `, ${line2}` : ""}`.replace(/\s+/g, " ").trim();
  while (rest && out.length < 3) {
    const part = clip(rest, 40);
    out.push(part.replace(/,$/, ""));
    rest = rest.slice(part.length).replace(/^[,\s]+/, "");
  }
  return [out[0] ?? "", out[1] ?? "", out[2] ?? ""];
}

/** Australian phone → digits, +61 → 0 prefix. */
export function auPhone(raw: string | null | undefined) {
  let d = (raw ?? "").replace(/\D/g, "");
  if (d.startsWith("61") && d.length === 11) d = `0${d.slice(2)}`;
  return d;
}

export function auspostRow(order: Pick<Order, "orderNumber" | "email" | "shippingAddress" | "shippingMethod">, sender: AuspostSender, parcel: AuspostParcel) {
  const a = order.shippingAddress;
  const [to1, to2, to3] = splitAddress(a.line1, a.line2);
  const [from1, from2, from3] = splitAddress(sender.line1, sender.line2);
  const email = order.email.trim();
  // Tracking emails need a recipient email of ≤50 chars.
  const notify = parcel.trackingNotifications && email.length > 0 && email.length <= 50;
  const phone = auPhone(a.phone);
  const own = parcel.packaging === "OWN_PACKAGING";

  const row: Record<(typeof AUSPOST_COLUMNS)[number], string> = {
    "Additional Label Information 1": clip(`Order ${order.orderNumber}`, 50),
    "Send Tracking Notifications": notify ? "YES" : "NO",
    "Send From Name": clip(sender.name, 35),
    "Send From Business Name": clip(sender.business, 40),
    "Send From Address Line 1": from1,
    "Send From Address Line 2": from2,
    "Send From Address Line 3": from3,
    "Send From Suburb": clip(sender.suburb, 30).toUpperCase(),
    "Send From State": sender.state,
    "Send From Postcode": sender.postcode,
    "Send From Phone Number": auPhone(sender.phone).slice(0, 10),
    "Send From Email Address": clip(sender.email, 50),
    "Deliver To Name": clip(`${a.firstName} ${a.lastName}`, 35),
    "Deliver To MyPost Number": "",
    "Deliver To Business Name": clip(a.company, 40),
    "Deliver To Type Of Address": "STANDARD_ADDRESS",
    "Deliver To Address Line 1": to1,
    "Deliver To Address Line 2": to2,
    "Deliver To Address Line 3": to3,
    "Deliver To Suburb": clip(a.suburb, 40).toUpperCase(),
    "Deliver To State": a.state.toUpperCase(),
    "Deliver To Postcode": a.postcode.trim(),
    "Deliver To Phone Number": phone.length >= 10 && phone.length <= 20 ? phone : "",
    "Deliver To Email Address": notify ? email : "",
    "Item Packaging Type": parcel.packaging,
    "Item Delivery Service": order.shippingMethod === "express" ? "EXP" : "PP",
    "Item Description": clip(parcel.description, 50),
    "Item Length": own && parcel.lengthCm ? String(parcel.lengthCm) : "",
    "Item Width": own && parcel.widthCm ? String(parcel.widthCm) : "",
    "Item Height": own && parcel.heightCm ? String(parcel.heightCm) : "",
    "Item Weight": String(parcel.weightKg),
    "Item Dangerous Goods Flag": "NO",
    "Signature On Delivery": parcel.signature ? "YES" : "NO",
    "Extra Cover Amount": "",
  };
  return AUSPOST_COLUMNS.map((c) => row[c]);
}
