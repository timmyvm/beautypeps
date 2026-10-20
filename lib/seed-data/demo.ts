import type {
  addresses,
  contactMessages,
  OrderAddress,
  orderEvents,
  orderItems,
  orders,
  OrderStatus,
  PaymentMethod,
  ShippingMethod,
  subscribers,
  users,
  wishlistItems,
} from "../db/schema";
import { seedReviews } from "./reviews";

/*
 * Demo data: customers, orders (with consistent totals + timelines), reviews,
 * subscribers and contact messages. Deterministic (seeded PRNG) so every
 * `npm run db:seed` produces the same store.
 */

type UserInsert = typeof users.$inferInsert;
type AddressInsert = typeof addresses.$inferInsert;
type OrderInsert = typeof orders.$inferInsert;
type OrderItemInsert = typeof orderItems.$inferInsert;
type OrderEventInsert = typeof orderEvents.$inferInsert;
type ReviewInsert = {
  productId: string;
  userId: string | null;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  skinType: string | null;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  adminReply: string | null;
  createdAt: Date;
};

export type DemoProduct = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  image: string;
  size: string | null;
  price: number;
};

export type DemoDiscount = { id: string; code: string; type: "percent" | "fixed" | "free_shipping"; value: number; minSubtotal: number };

export const DEMO_CUSTOMER = {
  email: "demo@beautypeps.com.au",
  password: "Demo-Peps-2026!",
  firstName: "Ava",
  lastName: "Nguyen",
};

const SHIPPING = { standard: 995, express: 1495, freeThreshold: 15000 };

const DAY = 86_400_000;
const HOUR = 3_600_000;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CUSTOMERS: { firstName: string; lastName: string; suburb: string; state: string; postcode: string; street: string; phone: string }[] = [
  { firstName: "Olivia", lastName: "Harris", suburb: "Fitzroy", state: "VIC", postcode: "3065", street: "14 Gertrude Street", phone: "0412 345 678" },
  { firstName: "Charlotte", lastName: "Kowalski", suburb: "Paddington", state: "NSW", postcode: "2021", street: "88 Oxford Street", phone: "0423 112 908" },
  { firstName: "Mia", lastName: "Patel", suburb: "New Farm", state: "QLD", postcode: "4005", street: "3/21 Brunswick Street", phone: "0434 556 120" },
  { firstName: "Isla", lastName: "Robertson", suburb: "Subiaco", state: "WA", postcode: "6008", street: "7 Rokeby Road", phone: "0401 774 315" },
  { firstName: "Grace", lastName: "Chen", suburb: "Glenelg", state: "SA", postcode: "5045", street: "52 Jetty Road", phone: "0455 230 871" },
  { firstName: "Sophie", lastName: "Martin", suburb: "Battery Point", state: "TAS", postcode: "7004", street: "19 Hampden Road", phone: "0418 009 442" },
  { firstName: "Chloe", lastName: "Andersen", suburb: "Braddon", state: "ACT", postcode: "2612", street: "11 Lonsdale Street", phone: "0427 651 330" },
  { firstName: "Zara", lastName: "Hussain", suburb: "Parramatta", state: "NSW", postcode: "2150", street: "240 Church Street", phone: "0439 812 004" },
  { firstName: "Emily", lastName: "O'Brien", suburb: "South Yarra", state: "VIC", postcode: "3141", street: "5/102 Toorak Road", phone: "0411 238 765" },
  { firstName: "Hannah", lastName: "Lee", suburb: "Surry Hills", state: "NSW", postcode: "2010", street: "33 Crown Street", phone: "0402 118 553" },
  { firstName: "Ruby", lastName: "Santos", suburb: "Burleigh Heads", state: "QLD", postcode: "4220", street: "9 Goodwin Terrace", phone: "0447 902 116" },
  { firstName: "Amelia", lastName: "Wright", suburb: "Fremantle", state: "WA", postcode: "6160", street: "26 Market Street", phone: "0433 674 220" },
  { firstName: "Lily", lastName: "Nakamura", suburb: "Northcote", state: "VIC", postcode: "3070", street: "411 High Street", phone: "0409 551 870" },
  { firstName: "Ella", lastName: "Fitzgerald", suburb: "Newtown", state: "NSW", postcode: "2042", street: "180 King Street", phone: "0422 330 619" },
  { firstName: "Priya", lastName: "Sharma", suburb: "Box Hill", state: "VIC", postcode: "3128", street: "12 Station Street", phone: "0415 776 203" },
  { firstName: "Jade", lastName: "Thompson", suburb: "Darwin City", state: "NT", postcode: "0800", street: "45 Mitchell Street", phone: "0408 441 992" },
  { firstName: "Matilda", lastName: "Brown", suburb: "Byron Bay", state: "NSW", postcode: "2481", street: "6 Lawson Street", phone: "0431 205 774" },
  { firstName: "Sienna", lastName: "Rossi", suburb: "Carlton", state: "VIC", postcode: "3053", street: "220 Lygon Street", phone: "0426 908 331" },
  { firstName: "Maya", lastName: "Williams", suburb: "Toowong", state: "QLD", postcode: "4066", street: "17 Sherwood Road", phone: "0414 663 087" },
  { firstName: "Leah", lastName: "Kim", suburb: "Chatswood", state: "NSW", postcode: "2067", street: "8 Victoria Avenue", phone: "0437 552 901" },
  { firstName: "Freya", lastName: "Campbell", suburb: "Norwood", state: "SA", postcode: "5067", street: "140 The Parade", phone: "0403 219 448" },
  { firstName: "Imogen", lastName: "Taylor", suburb: "Mosman", state: "NSW", postcode: "2088", street: "21 Military Road", phone: "0419 887 560" },
  { firstName: "Harper", lastName: "Nguyen", suburb: "Footscray", state: "VIC", postcode: "3011", street: "64 Barkly Street", phone: "0428 314 095" },
  { firstName: "Willow", lastName: "Jones", suburb: "Noosa Heads", state: "QLD", postcode: "4567", street: "2 Hastings Street", phone: "0449 120 337" },
  { firstName: "Aisha", lastName: "Rahman", suburb: "Cottesloe", state: "WA", postcode: "6011", street: "15 Marine Parade", phone: "0435 771 602" },
];

const GUESTS: typeof CUSTOMERS = [
  { firstName: "Georgia", lastName: "Mitchell", suburb: "Manly", state: "NSW", postcode: "2095", street: "30 The Corso", phone: "0410 552 778" },
  { firstName: "Tahlia", lastName: "Evans", suburb: "St Kilda", state: "VIC", postcode: "3182", street: "77 Acland Street", phone: "0421 667 309" },
  { firstName: "Bella", lastName: "Morris", suburb: "Fortitude Valley", state: "QLD", postcode: "4006", street: "300 Wickham Street", phone: "0432 908 145" },
  { firstName: "Holly", lastName: "Baker", suburb: "Hobart", state: "TAS", postcode: "7000", street: "41 Elizabeth Street", phone: "0406 113 587" },
  { firstName: "Eva", lastName: "Grant", suburb: "Leederville", state: "WA", postcode: "6007", street: "128 Oxford Street", phone: "0438 220 961" },
];

export const DEMO_DISCOUNT_CODES = [
  { code: "WELCOME10", description: "10% off your first order", type: "percent" as const, value: 10, minSubtotal: 0, maxUses: null, active: true },
  { code: "PEPS20", description: "20% off orders over $150", type: "percent" as const, value: 20, minSubtotal: 15000, maxUses: 100, active: true },
  { code: "FREESHIP", description: "Free standard shipping", type: "free_shipping" as const, value: 0, minSubtotal: 0, maxUses: null, active: true },
  { code: "GLOW15", description: "$15 off orders over $100", type: "fixed" as const, value: 1500, minSubtotal: 10000, maxUses: 250, active: true },
  {
    code: "EXPIRED5",
    description: "Expired example code — $5 off",
    type: "fixed" as const,
    value: 500,
    minSubtotal: 0,
    maxUses: null,
    active: true,
    startsAt: new Date(Date.now() - 120 * DAY),
    endsAt: new Date(Date.now() - 30 * DAY),
  },
];

function emailFor(first: string, last: string) {
  return `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + "@example.com";
}

function addressOf(c: (typeof CUSTOMERS)[number]): OrderAddress {
  return {
    firstName: c.firstName,
    lastName: c.lastName,
    company: null,
    line1: c.street,
    line2: null,
    suburb: c.suburb,
    state: c.state,
    postcode: c.postcode,
    country: "AU",
    phone: c.phone,
  };
}

export type DemoData = {
  users: (UserInsert & { id: string })[];
  addresses: AddressInsert[];
  orders: (OrderInsert & { id: string })[];
  orderItems: OrderItemInsert[];
  orderEvents: OrderEventInsert[];
  reviews: ReviewInsert[];
  wishlist: (typeof wishlistItems.$inferInsert)[];
  subscribers: (typeof subscribers.$inferInsert)[];
  messages: (typeof contactMessages.$inferInsert)[];
  discountUsage: Record<string, number>;
};

export function buildDemoData(opts: {
  products: DemoProduct[];
  discounts: DemoDiscount[];
  passwordHash: string; // shared hash for fake customers (they can't really log in without knowing it)
  demoPasswordHash: string;
  adminEmail: string;
  now?: Date;
}): DemoData {
  const rand = mulberry32(20261020);
  const now = (opts.now ?? new Date()).getTime();
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const between = (min: number, max: number) => min + rand() * (max - min);
  const uuid = () => crypto.randomUUID();

  const sellable = opts.products.filter((p) => p.slug !== "snap-8-pure-powder");
  const bySlug = new Map(opts.products.map((p) => [p.slug, p]));
  // Weighted toward bestsellers
  const weighted = [
    ...sellable,
    ...["ghk-cu-copper-peptide-serum", "argireline-10-serum", "multi-peptide-complex", "matrixyl-3000-serum", "eye-peptide-gel", "copper-ritual-kit"]
      .flatMap((s) => [bySlug.get(s), bySlug.get(s)])
      .filter((p): p is DemoProduct => !!p),
  ];

  /* ---------------- Users ---------------- */
  const data: DemoData = {
    users: [],
    addresses: [],
    orders: [],
    orderItems: [],
    orderEvents: [],
    reviews: [],
    wishlist: [],
    subscribers: [],
    messages: [],
    discountUsage: {},
  };

  const ava = {
    id: uuid(),
    email: DEMO_CUSTOMER.email,
    passwordHash: opts.demoPasswordHash,
    firstName: DEMO_CUSTOMER.firstName,
    lastName: DEMO_CUSTOMER.lastName,
    phone: "0412 000 111",
    role: "customer" as const,
    marketingOptIn: true,
    createdAt: new Date(now - 75 * DAY),
    lastLoginAt: new Date(now - 2 * DAY),
  };
  data.users.push(ava);
  const avaHome: OrderAddress = {
    firstName: "Ava",
    lastName: "Nguyen",
    company: null,
    line1: "27 Smith Street",
    line2: null,
    suburb: "Collingwood",
    state: "VIC",
    postcode: "3066",
    country: "AU",
    phone: "0412 000 111",
  };
  const avaWork: OrderAddress = {
    ...avaHome,
    company: "Studio Nine",
    line1: "Level 4, 180 Flinders Lane",
    suburb: "Melbourne",
    postcode: "3000",
  };
  data.addresses.push(
    { userId: ava.id, label: "Home", ...avaHome, isDefault: true, createdAt: new Date(now - 75 * DAY) },
    { userId: ava.id, label: "Work", ...avaWork, isDefault: false, createdAt: new Date(now - 40 * DAY) },
  );

  const customerUsers = CUSTOMERS.map((c, i) => {
    const created = new Date(now - between(5, 95) * DAY);
    const u = {
      id: uuid(),
      email: emailFor(c.firstName, c.lastName),
      passwordHash: opts.passwordHash,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      role: "customer" as const,
      marketingOptIn: i % 3 !== 0,
      createdAt: created,
      lastLoginAt: new Date(Math.min(now - HOUR, created.getTime() + between(1, 40) * DAY)),
    };
    data.users.push(u);
    data.addresses.push({ userId: u.id, label: "Home", ...addressOf(c), isDefault: true, createdAt: created });
    return { user: u, address: addressOf(c) };
  });

  /* ---------------- Orders ---------------- */
  const ORDER_COUNT = 60;
  // Skewed toward recent days so the dashboard shows a realistic mix of open orders.
  const dates = Array.from({ length: ORDER_COUNT }, () => now - Math.max(0.04, 60 * Math.pow(rand(), 1.8)) * DAY).sort(
    (a, b) => a - b,
  );

  // Plan statuses by age (oldest first), then sprinkle special cases.
  const statusFor = (createdMs: number): OrderStatus => {
    const ageDays = (now - createdMs) / DAY;
    const r = rand();
    if (ageDays < 0.5) return r < 0.6 ? "pending_payment" : "paid";
    if (ageDays < 1.5) return r < 0.3 ? "pending_payment" : r < 0.7 ? "paid" : "processing";
    if (ageDays < 3) return r < 0.35 ? "processing" : "shipped";
    if (ageDays < 8) return "shipped";
    return "delivered";
  };
  const statuses = dates.map(statusFor);
  // Special cases on older orders
  statuses[6] = "cancelled";
  statuses[31] = "cancelled";
  statuses[14] = "refunded";
  // Guarantee a few orders in every open state for the admin queue.
  const ensure = (status: OrderStatus, count: number, minAge: number, maxAge: number) => {
    let have = statuses.filter((s) => s === status).length;
    for (let i = dates.length - 2; i >= 0 && have < count; i--) {
      const ageDays = (now - dates[i]) / DAY;
      if (ageDays >= minAge && ageDays <= maxAge && statuses[i] !== status) {
        statuses[i] = status;
        have++;
      }
    }
  };
  ensure("processing", 3, 0.8, 3);
  ensure("paid", 3, 0.2, 2);

  // Demo customer: delivered (old), shipped (recent-ish), pending_payment (newest)
  const avaOrderIdx = new Set<number>();
  const deliveredIdx = 20;
  statuses[deliveredIdx] = "delivered";
  avaOrderIdx.add(deliveredIdx);
  const shippedIdx = dates.findIndex((d) => (now - d) / DAY < 5 && (now - d) / DAY > 2.6);
  const shippedSlot = shippedIdx >= 0 ? shippedIdx : ORDER_COUNT - 6;
  statuses[shippedSlot] = "shipped";
  avaOrderIdx.add(shippedSlot);
  const pendingSlot = ORDER_COUNT - 1;
  statuses[pendingSlot] = "pending_payment";
  avaOrderIdx.add(pendingSlot);

  const avaItems: Record<number, string[]> = {
    [deliveredIdx]: ["ghk-cu-copper-peptide-serum", "peptide-night-cream"],
    [shippedSlot]: ["argireline-10-serum", "eye-peptide-gel"],
    [pendingSlot]: ["multi-peptide-complex"],
  };

  const discountByCode = new Map(opts.discounts.map((d) => [d.code, d]));
  let orderSeq = 10001;

  dates.forEach((createdMs, idx) => {
    const status = statuses[idx];
    const isAva = avaOrderIdx.has(idx);
    const isGuest = !isAva && rand() < 0.16;
    let userId: string | null = null;
    let email: string;
    let address: OrderAddress;
    if (isAva) {
      userId = ava.id;
      email = ava.email;
      address = idx === shippedSlot ? avaWork : avaHome;
    } else if (isGuest) {
      const g = pick(GUESTS);
      email = emailFor(g.firstName, g.lastName);
      address = addressOf(g);
    } else {
      const c = pick(customerUsers);
      userId = c.user.id;
      email = c.user.email;
      address = c.address;
    }

    // Line items
    const lines = new Map<string, number>();
    if (isAva) {
      for (const s of avaItems[idx]) lines.set(s, 1);
    } else {
      const n = rand() < 0.45 ? 1 : rand() < 0.75 ? 2 : 3;
      for (let i = 0; i < n; i++) {
        const p = pick(weighted);
        lines.set(p.slug, (lines.get(p.slug) ?? 0) + (rand() < 0.12 ? 2 : 1));
      }
    }

    const orderId = uuid();
    let subtotal = 0;
    for (const [slug, qty] of lines) {
      const p = bySlug.get(slug)!;
      const lineTotal = p.price * qty;
      subtotal += lineTotal;
      data.orderItems.push({
        orderId,
        productId: p.id,
        name: p.name,
        sku: p.sku,
        image: p.image,
        size: p.size,
        unitPrice: p.price,
        quantity: qty,
        lineTotal,
      });
    }

    // Discount (occasionally)
    let discountCode: string | null = null;
    let discountTotal = 0;
    let freeShipCode = false;
    const roll = rand();
    if (!isAva && roll < 0.22) {
      const candidates = ["WELCOME10", "PEPS20", "GLOW15", "FREESHIP"]
        .map((c) => discountByCode.get(c))
        .filter((d): d is DemoDiscount => !!d && subtotal >= d.minSubtotal);
      if (candidates.length) {
        const d = pick(candidates);
        discountCode = d.code;
        if (d.type === "percent") discountTotal = Math.round((subtotal * d.value) / 100);
        if (d.type === "fixed") discountTotal = Math.min(d.value, subtotal);
        if (d.type === "free_shipping") freeShipCode = true;
        data.discountUsage[d.code] = (data.discountUsage[d.code] ?? 0) + 1;
      }
    }

    const shippingMethod: ShippingMethod = rand() < 0.2 ? "express" : "standard";
    let shippingTotal = shippingMethod === "express" ? SHIPPING.express : SHIPPING.standard;
    if (shippingMethod === "standard" && (subtotal >= SHIPPING.freeThreshold || freeShipCode)) shippingTotal = 0;
    if (shippingMethod === "express" && freeShipCode) shippingTotal = SHIPPING.express - SHIPPING.standard;
    const total = Math.max(0, subtotal - discountTotal + shippingTotal);
    const gstTotal = Math.round(total / 11);
    const paymentMethod: PaymentMethod = rand() < 0.62 ? "bank_transfer" : "payid";
    const orderNumber = `BP${orderSeq++}`;

    // Timeline
    const age = now - createdMs;
    const paidAt = createdMs + Math.min(between(2, 26) * HOUR, age * 0.25);
    const processingAt = paidAt + Math.min(between(2, 12) * HOUR, age * 0.15);
    const shippedAt = processingAt + Math.min(between(6, 30) * HOUR, age * 0.2);
    const deliveredAt = shippedAt + Math.min(between(2, 5) * DAY, age * 0.35);
    const tracking = `33LPK${Math.floor(between(10000000, 99999999))}`;
    const payLabel = paymentMethod === "payid" ? "PayID" : "bank transfer";
    const ev = (type: string, message: string, at: number, visible = true, actor = "system") =>
      data.orderEvents.push({ orderId, type, message, visibleToCustomer: visible, actor, createdAt: new Date(at) });

    ev("created", `Order placed — awaiting ${payLabel} payment.`, createdMs, true, "customer");
    ev("email", `Order confirmation email sent to ${email}.`, createdMs + 30_000, false);

    const reached = (s: OrderStatus) => {
      const flow: OrderStatus[] = ["pending_payment", "paid", "processing", "shipped", "delivered"];
      if (status === "refunded") return flow.indexOf(s) <= flow.indexOf("delivered");
      if (status === "cancelled") return s === "pending_payment";
      return flow.indexOf(s) <= flow.indexOf(status);
    };

    if (reached("paid")) ev("payment", `Payment of $${(total / 100).toFixed(2)} received by ${payLabel} — thank you!`, paidAt, true, opts.adminEmail);
    if (reached("processing")) ev("status", "Your order is being packed in our Melbourne studio.", processingAt, true, opts.adminEmail);
    if (reached("shipped")) {
      ev("shipment", `Shipped with Australia Post — tracking number ${tracking}.`, shippedAt, true, opts.adminEmail);
      ev("email", `Shipping notification sent to ${email}.`, shippedAt + 60_000, false);
    }
    if (reached("delivered")) ev("status", "Delivered — enjoy your peptides!", deliveredAt, true, "system");

    let cancelledAt: number | null = null;
    if (status === "cancelled") {
      cancelledAt = createdMs + 3.2 * DAY;
      ev("status", "Order cancelled — payment wasn't received within 3 days. Stock has been released.", cancelledAt, true, opts.adminEmail);
    }
    let refundAt: number | null = null;
    if (status === "refunded") {
      refundAt = deliveredAt + Math.min(2 * DAY, (now - deliveredAt) * 0.5);
      ev("note", "Customer reported a cracked dropper on arrival — photo received.", refundAt - 4 * HOUR, false, opts.adminEmail);
      ev("payment", `Refund of $${(total / 100).toFixed(2)} issued to the original account.`, refundAt, true, opts.adminEmail);
    }

    const paymentStatus =
      status === "refunded" ? "refunded" : status === "pending_payment" || status === "cancelled" ? "unpaid" : "paid";

    let adminNote: string | null = null;
    let customerNote: string | null = null;
    if (rand() < 0.12) customerNote = pick(["Please leave at the front door.", "It's a gift — no invoice in the box please.", "Leave with reception if I'm not home.", "Could you include a sample of the eye gel? Thanks!"]);
    if (rand() < 0.08) adminNote = pick(["Repeat customer — added a handwritten thank-you card.", "Checked address with customer by email.", "Packed with extra bubble wrap (regional delivery)."]);

    data.orders.push({
      id: orderId,
      orderNumber,
      userId,
      email,
      status,
      paymentStatus,
      paymentMethod,
      shippingMethod,
      subtotal,
      discountTotal,
      shippingTotal,
      total,
      gstTotal,
      discountCode,
      shippingAddress: address,
      customerNote,
      adminNote,
      trackingCarrier: reached("shipped") ? "Australia Post" : null,
      trackingNumber: reached("shipped") ? tracking : null,
      paidAt: reached("paid") ? new Date(paidAt) : null,
      shippedAt: reached("shipped") ? new Date(shippedAt) : null,
      deliveredAt: reached("delivered") ? new Date(deliveredAt) : null,
      cancelledAt: cancelledAt ? new Date(cancelledAt) : null,
      createdAt: new Date(createdMs),
      updatedAt: new Date(refundAt ?? cancelledAt ?? (reached("delivered") ? deliveredAt : reached("shipped") ? shippedAt : reached("processing") ? processingAt : reached("paid") ? paidAt : createdMs)),
    });
  });

  /* ---------------- Reviews ---------------- */
  // Map reviewers to customer accounts where names match, else leave userId null.
  const usersByName = new Map(data.users.map((u) => [`${u.firstName} ${u.lastName![0]}.`, u.id]));
  for (const r of seedReviews) {
    const p = bySlug.get(r.productSlug);
    if (!p) continue;
    data.reviews.push({
      productId: p.id,
      userId: usersByName.get(r.authorName) ?? null,
      authorName: r.authorName,
      rating: r.rating,
      title: r.title,
      body: r.body,
      skinType: r.skinType ?? null,
      verifiedPurchase: r.verified ?? true,
      status: r.status ?? "approved",
      adminReply: r.adminReply ?? null,
      createdAt: new Date(now - r.daysAgo * DAY),
    });
  }

  /* ---------------- Wishlist (demo customer) ---------------- */
  for (const slug of ["scalp-peptide-serum", "copper-ritual-kit", "nonapeptide-brightening-serum"]) {
    const p = bySlug.get(slug);
    if (p) data.wishlist.push({ userId: ava.id, productId: p.id, createdAt: new Date(now - between(1, 20) * DAY) });
  }

  /* ---------------- Subscribers ---------------- */
  const subEmails = [
    ava.email,
    ...customerUsers.filter((c) => c.user.marketingOptIn).slice(0, 9).map((c) => c.user.email),
    "glowgetter@example.com",
    "skin.notes@example.com",
    "formulator.jess@example.com",
    "peptide.curious@example.com",
    "hello.renee@example.com",
  ];
  subEmails.forEach((email, i) =>
    data.subscribers.push({
      email,
      source: i % 4 === 0 ? "checkout" : i % 3 === 0 ? "journal" : "footer",
      createdAt: new Date(now - between(1, 80) * DAY),
    }),
  );

  /* ---------------- Contact messages ---------------- */
  data.messages.push(
    {
      name: "Hannah Lee",
      email: "hannah.lee@example.com",
      orderNumber: null,
      subject: "Can I use GHK-Cu with tretinoin?",
      message:
        "Hi! I'm on tretinoin 0.025% three nights a week. Can I use the copper serum on the other nights, or should I avoid it completely? Thanks so much.",
      status: "new",
      createdAt: new Date(now - 5 * HOUR),
    },
    {
      name: "Georgia Mitchell",
      email: "georgia.mitchell@example.com",
      orderNumber: data.orders.find((o) => o.email === "georgia.mitchell@example.com")?.orderNumber ?? null,
      subject: "Bank transfer reference",
      message:
        "I paid by bank transfer this morning but I think I put my name as the reference instead of the order number. Can you match it up please?",
      status: "new",
      createdAt: new Date(now - 26 * HOUR),
    },
    {
      name: "Jess Taylor",
      email: "formulator.jess@example.com",
      orderNumber: null,
      subject: "Wholesale pricing for pure actives",
      message:
        "I run a small skincare brand in Byron and I'm interested in buying Argireline and GHK-Cu powder in 10 g quantities. Do you offer wholesale pricing and COAs per batch?",
      status: "new",
      createdAt: new Date(now - 2 * DAY),
    },
    {
      name: "Chloe Andersen",
      email: "chloe.andersen@example.com",
      orderNumber: null,
      subject: "Thank you!",
      message: "Just wanted to say the eye gel is incredible — my morning puffiness is so much better. Will be back for the night cream.",
      status: "read",
      createdAt: new Date(now - 9 * DAY),
    },
    {
      name: "Sophie Martin",
      email: "sophie.martin@example.com",
      orderNumber: null,
      subject: "Shipping to Tasmania",
      message: "How long does express shipping usually take to Hobart?",
      status: "archived",
      createdAt: new Date(now - 21 * DAY),
    },
  );

  return data;
}
