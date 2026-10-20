import { relations } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/*
 * All money is stored as integer cents (AUD, GST inclusive).
 * Timestamps are stored as unix seconds and surface as Date objects.
 */

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

/* ------------------------------------------------------------------ */
/* Users & auth                                                        */
/* ------------------------------------------------------------------ */

export type UserRole = "customer" | "admin";

export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull().default(""),
    lastName: text("last_name").notNull().default(""),
    phone: text("phone"),
    role: text("role").$type<UserRole>().notNull().default("customer"),
    marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
    // Bump to invalidate every existing session (password change, "log out everywhere")
    tokenVersion: integer("token_version").notNull().default(0),
    disabled: integer("disabled", { mode: "boolean" }).notNull().default(false),
    adminNote: text("admin_note"),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("users_role_idx").on(t.role)],
);

export const passwordResets = sqliteTable("password_resets", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: createdAt(),
});

export const addresses = sqliteTable(
  "addresses",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Home"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    company: text("company"),
    line1: text("line1").notNull(),
    line2: text("line2"),
    suburb: text("suburb").notNull(),
    state: text("state").notNull(),
    postcode: text("postcode").notNull(),
    country: text("country").notNull().default("AU"),
    phone: text("phone"),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export const categories = sqliteTable("categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  tagline: text("tagline"),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: createdAt(),
});

export type ProductStatus = "active" | "draft" | "archived";
export type KeyActive = { name: string; amount: string; note?: string };
export type FaqItem = { q: string; a: string };

export const products = sqliteTable(
  "products",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    subtitle: text("subtitle"),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    sku: text("sku").notNull().unique(),
    status: text("status").$type<ProductStatus>().notNull().default("active"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    badge: text("badge"), // e.g. "Bestseller", "New"
    price: integer("price").notNull(), // cents
    compareAtPrice: integer("compare_at_price"), // cents
    stock: integer("stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
    size: text("size"), // "30 mL", "1 g"
    image: text("image").notNull(),
    gallery: text("gallery", { mode: "json" }).$type<string[]>().notNull().default([]),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(), // markdown
    howToUse: text("how_to_use"), // markdown
    ingredients: text("ingredients"), // full INCI list
    keyActives: text("key_actives", { mode: "json" }).$type<KeyActive[]>().notNull().default([]),
    peptideSlugs: text("peptide_slugs", { mode: "json" }).$type<string[]>().notNull().default([]),
    concerns: text("concerns", { mode: "json" }).$type<string[]>().notNull().default([]),
    skinTypes: text("skin_types", { mode: "json" }).$type<string[]>().notNull().default([]),
    faqs: text("faqs", { mode: "json" }).$type<FaqItem[]>().notNull().default([]),
    texture: text("texture"),
    phRange: text("ph_range"),
    routineStep: text("routine_step"), // "AM / PM", "PM only", ...
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_category_idx").on(t.categoryId), index("products_status_idx").on(t.status)],
);

export type PeptideStudy = { title: string; source: string; year?: number; url?: string };

/** The Peptide Library — informational monographs, editable in the admin. */
export const peptides = sqliteTable("peptides", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(), // "GHK-Cu"
  inciName: text("inci_name").notNull(), // "Copper Tripeptide-1"
  aliases: text("aliases", { mode: "json" }).$type<string[]>().notNull().default([]),
  peptideClass: text("peptide_class").notNull(), // signal | carrier | neurotransmitter-inhibitor | enzyme-inhibitor
  sequence: text("sequence"),
  molecularWeight: text("molecular_weight"),
  discovered: text("discovered"),
  summary: text("summary").notNull(),
  benefits: text("benefits", { mode: "json" }).$type<string[]>().notNull().default([]),
  mechanism: text("mechanism").notNull(), // markdown
  evidence: text("evidence").notNull(), // markdown
  usage: text("usage").notNull(), // markdown: concentration, pH, layering
  typicalConcentration: text("typical_concentration"),
  phRange: text("ph_range"),
  pairsWith: text("pairs_with", { mode: "json" }).$type<string[]>().notNull().default([]),
  avoidWith: text("avoid_with", { mode: "json" }).$type<string[]>().notNull().default([]),
  concerns: text("concerns", { mode: "json" }).$type<string[]>().notNull().default([]),
  studies: text("studies", { mode: "json" }).$type<PeptideStudy[]>().notNull().default([]),
  evidenceLevel: integer("evidence_level").notNull().default(3), // 1-5
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Learn hub — long-form guides and science articles. */
export const articles = sqliteTable("articles", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(), // markdown
  coverImage: text("cover_image"),
  category: text("category").notNull().default("Guides"), // Guides | Science | Routines | Ingredients
  author: text("author").notNull().default("Beauty Peps Lab"),
  readMinutes: integer("read_minutes").notNull().default(5),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  seoDescription: text("seo_description"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "bank_transfer" | "payid";
export type ShippingMethod = "standard" | "express";

export type OrderAddress = {
  firstName: string;
  lastName: string;
  company?: string | null;
  line1: string;
  line2?: string | null;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string | null;
};

export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    orderNumber: text("order_number").notNull().unique(), // BP10001
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    status: text("status").$type<OrderStatus>().notNull().default("pending_payment"),
    paymentStatus: text("payment_status").$type<PaymentStatus>().notNull().default("unpaid"),
    paymentMethod: text("payment_method").$type<PaymentMethod>().notNull().default("bank_transfer"),
    shippingMethod: text("shipping_method").$type<ShippingMethod>().notNull().default("standard"),
    subtotal: integer("subtotal").notNull(),
    discountTotal: integer("discount_total").notNull().default(0),
    shippingTotal: integer("shipping_total").notNull().default(0),
    total: integer("total").notNull(),
    gstTotal: integer("gst_total").notNull().default(0), // GST component included in total
    discountCode: text("discount_code"),
    shippingAddress: text("shipping_address", { mode: "json" }).$type<OrderAddress>().notNull(),
    customerNote: text("customer_note"),
    adminNote: text("admin_note"),
    trackingCarrier: text("tracking_carrier"),
    trackingNumber: text("tracking_number"),
    paidAt: integer("paid_at", { mode: "timestamp" }),
    shippedAt: integer("shipped_at", { mode: "timestamp" }),
    deliveredAt: integer("delivered_at", { mode: "timestamp" }),
    cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    image: text("image"),
    size: text("size"),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

/** Timeline shown in admin (all) and to the customer (visibleToCustomer). */
export const orderEvents = sqliteTable(
  "order_events",
  {
    id: id(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // created | status | payment | shipment | note | email
    message: text("message").notNull(),
    visibleToCustomer: integer("visible_to_customer", { mode: "boolean" }).notNull().default(true),
    actor: text("actor"), // admin email, "system", "customer"
    createdAt: createdAt(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
);

/* ------------------------------------------------------------------ */
/* Marketing & engagement                                              */
/* ------------------------------------------------------------------ */

export type DiscountType = "percent" | "fixed" | "free_shipping";

export const discounts = sqliteTable("discounts", {
  id: id(),
  code: text("code").notNull().unique(), // stored upper-case
  description: text("description"),
  type: text("type").$type<DiscountType>().notNull(),
  value: integer("value").notNull().default(0), // percent (0-100) or cents
  minSubtotal: integer("min_subtotal").notNull().default(0), // cents
  maxUses: integer("max_uses"), // null = unlimited
  usedCount: integer("used_count").notNull().default(0),
  startsAt: integer("starts_at", { mode: "timestamp" }),
  endsAt: integer("ends_at", { mode: "timestamp" }),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export type ReviewStatus = "pending" | "approved" | "rejected";

export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    rating: integer("rating").notNull(), // 1-5
    title: text("title").notNull(),
    body: text("body").notNull(),
    skinType: text("skin_type"),
    verifiedPurchase: integer("verified_purchase", { mode: "boolean" }).notNull().default(false),
    status: text("status").$type<ReviewStatus>().notNull().default("pending"),
    adminReply: text("admin_reply"),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_product_idx").on(t.productId), index("reviews_status_idx").on(t.status)],
);

export const wishlistItems = sqliteTable(
  "wishlist_items",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

export type MessageStatus = "new" | "read" | "archived";

export const contactMessages = sqliteTable("contact_messages", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  orderNumber: text("order_number"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").$type<MessageStatus>().notNull().default("new"),
  createdAt: createdAt(),
});

export const subscribers = sqliteTable("subscribers", {
  id: id(),
  email: text("email").notNull().unique(),
  source: text("source").notNull().default("footer"),
  createdAt: createdAt(),
});

/** Every outgoing email is logged here (and sent via Resend when configured). */
export const emailLog = sqliteTable("email_log", {
  id: id(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  status: text("status").notNull().default("logged"), // logged | sent | failed
  error: text("error"),
  createdAt: createdAt(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: updatedAt(),
});

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  addresses: many(addresses),
  reviews: many(reviews),
  wishlist: many(wishlistItems),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  events: many(orderEvents),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, { fields: [wishlistItems.userId], references: [users.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}));

export type User = typeof users.$inferSelect;
export type Address = typeof addresses.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Peptide = typeof peptides.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
