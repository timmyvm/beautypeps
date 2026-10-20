import "server-only";

import { db } from "@/lib/db";
import { emailLog, type Order, type OrderItem } from "@/lib/db/schema";
import { ORDER_STATUSES, PAYMENT_METHODS, SHIPPING_METHOD_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";

/*
 * Every email is written to the email_log table (visible in Admin → Emails).
 * If RESEND_API_KEY and EMAIL_FROM are set it is also delivered via Resend.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  let status = "logged";
  let error: string | null = null;

  if (apiKey && from) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, html }),
      });
      status = res.ok ? "sent" : "failed";
      if (!res.ok) error = (await res.text()).slice(0, 500);
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : String(e);
    }
  } else if (process.env.NODE_ENV !== "production") {
    console.log(`[email] to=${to} subject="${subject}" (logged only — set RESEND_API_KEY to send)`);
  }

  await db.insert(emailLog).values({ to, subject, html, status, error });
  return { status, error };
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6f1ea;font-family:Helvetica,Arial,sans-serif;color:#2b211c">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf8f4;border:1px solid #e1d5c6;border-radius:16px;padding:32px">
<tr><td style="font-family:Georgia,serif;font-size:24px;letter-spacing:.02em;padding-bottom:4px">beauty peps</td></tr>
<tr><td style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8f5528;padding-bottom:24px">${escape(title)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding-top:32px;font-size:12px;color:#6b5a4e;border-top:1px solid #e1d5c6">Beauty Peps · Cosmetic peptides, formulated in Australia<br><a href="${siteUrl()}" style="color:#8f5528">${siteUrl().replace(/^https?:\/\//, "")}</a></td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#2b211c;color:#fbf8f4;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:14px">${escape(label)}</a></p>`;
}

function itemsTable(items: Pick<OrderItem, "name" | "quantity" | "lineTotal">[], order: Order) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escape(i.name)} × ${i.quantity}</td><td align="right">${formatMoney(i.lineTotal)}</td></tr>`,
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? "font-weight:bold" : "color:#6b5a4e"}">${label}</td><td align="right" style="${bold ? "font-weight:bold" : ""}">${value}</td></tr>`;
  return `<table width="100%" style="font-size:14px;border-top:1px solid #e1d5c6;border-bottom:1px solid #e1d5c6;margin:16px 0;padding:8px 0">${rows}
${line("Subtotal", formatMoney(order.subtotal))}
${order.discountTotal ? line(`Discount${order.discountCode ? ` (${escape(order.discountCode)})` : ""}`, `−${formatMoney(order.discountTotal)}`) : ""}
${line(SHIPPING_METHOD_LABELS[order.shippingMethod], order.shippingTotal ? formatMoney(order.shippingTotal) : "Free")}
${line("Total (incl. GST)", formatMoney(order.total), true)}
${line("GST included", formatMoney(order.gstTotal))}</table>`;
}

export function paymentInstructionsHtml(order: Order, s: StoreSettings) {
  if (order.paymentMethod === "payid") {
    return `<p><strong>Pay with PayID</strong><br>PayID: ${escape(s.payId)}<br>Name: ${escape(s.bankAccountName)}<br>Amount: ${formatMoney(order.total)}<br>Reference: <strong>${order.orderNumber}</strong></p>`;
  }
  return `<p><strong>Pay by bank transfer</strong><br>Account name: ${escape(s.bankAccountName)}<br>BSB: ${escape(s.bankBsb)}<br>Account: ${escape(s.bankAccountNumber)}<br>Amount: ${formatMoney(order.total)}<br>Reference: <strong>${order.orderNumber}</strong></p>`;
}

export function orderConfirmationEmail(order: Order, items: OrderItem[], s: StoreSettings) {
  const name = order.shippingAddress.firstName;
  return {
    subject: `Order ${order.orderNumber} received — payment details inside`,
    html: layout(
      "Order received",
      `<p>Hi ${escape(name)},</p><p>Thanks for your order <strong>${order.orderNumber}</strong>. To complete it, please send payment within ${s.paymentWindowDays} days using the details below — we'll start packing as soon as it clears.</p>
${paymentInstructionsHtml(order, s)}
${itemsTable(items, order)}
<p style="font-size:13px;color:#6b5a4e">Payment method: ${PAYMENT_METHODS[order.paymentMethod].label}. Unpaid orders are released after ${s.paymentWindowDays} days.</p>
${button(`${siteUrl()}/track?order=${order.orderNumber}&email=${encodeURIComponent(order.email)}`, "View order status")}`,
    ),
  };
}

export function orderStatusEmail(order: Order, s: StoreSettings) {
  const status = ORDER_STATUSES[order.status];
  const name = order.shippingAddress.firstName;
  let extra = `<p>${escape(status.description)}</p>`;
  if (order.status === "shipped" && order.trackingNumber) {
    extra += `<p><strong>${escape(order.trackingCarrier ?? "Australia Post")}</strong> tracking number: <strong>${escape(order.trackingNumber)}</strong><br><a href="https://auspost.com.au/mypost/track/details/${encodeURIComponent(order.trackingNumber)}" style="color:#8f5528">Track your parcel</a></p>`;
  }
  if (order.status === "paid") extra += `<p>${escape(s.dispatchTime)}</p>`;
  return {
    subject: `Order ${order.orderNumber}: ${status.label}`,
    html: layout(
      status.label,
      `<p>Hi ${escape(name)},</p><p>An update on your order <strong>${order.orderNumber}</strong>:</p>${extra}
${button(`${siteUrl()}/track?order=${order.orderNumber}&email=${encodeURIComponent(order.email)}`, "View order")}`,
    ),
  };
}

export function welcomeEmail(firstName: string) {
  return {
    subject: "Welcome to Beauty Peps",
    html: layout(
      "Welcome",
      `<p>Hi ${escape(firstName || "there")},</p><p>Your Beauty Peps account is ready. Track orders, save addresses and keep a wishlist of your favourite peptides — all in one place.</p>
<p>New to peptides? Our free <a href="${siteUrl()}/peptides" style="color:#8f5528">Peptide Library</a> explains what each one does, the evidence behind it, and how to layer it.</p>
${button(`${siteUrl()}/account`, "Go to my account")}`,
    ),
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: "Reset your Beauty Peps password",
    html: layout(
      "Password reset",
      `<p>We received a request to reset your password. This link is valid for 1 hour.</p>${button(resetUrl, "Choose a new password")}
<p style="font-size:13px;color:#6b5a4e">If you didn't request this, you can safely ignore this email.</p>`,
    ),
  };
}

export function contactAutoReplyEmail(name: string) {
  return {
    subject: "We've received your message",
    html: layout(
      "Message received",
      `<p>Hi ${escape(name)},</p><p>Thanks for getting in touch — a member of our team will reply within 1 business day.</p>`,
    ),
  };
}
