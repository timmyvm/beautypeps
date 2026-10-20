import type { DiscountType, OrderStatus, PaymentMethod, ReviewStatus, ShippingMethod } from "@/lib/db/schema";

export const SITE_NAME = "Beauty Peps";

export const CONCERNS = [
  { slug: "fine-lines", label: "Fine lines & wrinkles" },
  { slug: "expression-lines", label: "Expression lines" },
  { slug: "firmness", label: "Firmness & elasticity" },
  { slug: "dullness", label: "Dullness & uneven tone" },
  { slug: "dark-spots", label: "Dark spots" },
  { slug: "under-eye", label: "Under-eye puffiness & circles" },
  { slug: "lips", label: "Lip volume & definition" },
  { slug: "barrier", label: "Barrier & recovery" },
  { slug: "hair-density", label: "Hair & scalp" },
] as const;

export type ConcernSlug = (typeof CONCERNS)[number]["slug"];

export function concernLabel(slug: string) {
  return CONCERNS.find((c) => c.slug === slug)?.label ?? slug;
}

export const SKIN_TYPES = ["All skin types", "Dry", "Oily", "Combination", "Sensitive", "Mature"] as const;

export const PEPTIDE_CLASSES: Record<string, { label: string; description: string }> = {
  signal: {
    label: "Signal peptide",
    description: "Messenger fragments that prompt fibroblasts to produce collagen, elastin and other matrix proteins.",
  },
  carrier: {
    label: "Carrier peptide",
    description: "Deliver trace elements such as copper to the skin to support wound-healing and enzymatic processes.",
  },
  "neurotransmitter-inhibitor": {
    label: "Neurotransmitter-inhibiting peptide",
    description: "Modulate the nerve–muscle signal that drives repeated facial contractions, softening expression lines.",
  },
  "enzyme-inhibitor": {
    label: "Enzyme-inhibiting peptide",
    description: "Slow enzymes that break down collagen or drive pigment production.",
  },
};

export const ORDER_STATUSES: Record<OrderStatus, { label: string; tone: BadgeTone; description: string }> = {
  pending_payment: {
    label: "Awaiting payment",
    tone: "amber",
    description: "We're waiting for your bank transfer / PayID payment to clear.",
  },
  paid: { label: "Paid", tone: "sapphire", description: "Payment received — your order is queued for packing." },
  processing: { label: "Packing", tone: "sapphire", description: "Your order is being packed in our Melbourne studio." },
  shipped: { label: "Shipped", tone: "copper", description: "Your parcel is on its way." },
  delivered: { label: "Delivered", tone: "sage", description: "Your parcel has been delivered." },
  cancelled: { label: "Cancelled", tone: "neutral", description: "This order was cancelled." },
  refunded: { label: "Refunded", tone: "danger", description: "This order was refunded." },
};

/** Forward-moving fulfilment flow, used for progress trackers. */
export const ORDER_FLOW: OrderStatus[] = ["pending_payment", "paid", "processing", "shipped", "delivered"];

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; description: string }> = {
  bank_transfer: {
    label: "Bank transfer",
    description: "Pay by direct deposit. Use your order number as the reference.",
  },
  payid: {
    label: "PayID",
    description: "Instant payment from your banking app to our PayID email.",
  },
};

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  standard: "Standard (Australia Post Parcel Post)",
  express: "Express (Australia Post Express Post)",
};

export const DISCOUNT_TYPES: Record<DiscountType, string> = {
  percent: "Percentage off",
  fixed: "Fixed amount off",
  free_shipping: "Free shipping",
};

export const REVIEW_STATUSES: Record<ReviewStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: "Pending", tone: "amber" },
  approved: { label: "Approved", tone: "sage" },
  rejected: { label: "Rejected", tone: "danger" },
};

export const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;

export const ARTICLE_CATEGORIES = ["Guides", "Science", "Routines", "Ingredients"] as const;

export type BadgeTone = "neutral" | "copper" | "sapphire" | "sage" | "amber" | "danger";
