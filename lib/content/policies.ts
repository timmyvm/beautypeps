import { formatMoney } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";

export type Policy = { slug: string; title: string; summary: string; updated: string; body: string };

export const POLICY_LINKS = [
  { slug: "shipping", title: "Shipping" },
  { slug: "returns", title: "Returns & refunds" },
  { slug: "terms", title: "Terms of sale" },
  { slug: "privacy", title: "Privacy policy" },
] as const;

const UPDATED = "1 October 2026";

/** Policy pages as markdown, with live numbers from store settings. */
export function getPolicy(slug: string, s: StoreSettings): Policy | null {
  const free =
    s.freeShippingThreshold > 0
      ? `Standard shipping is **free on orders of ${formatMoney(s.freeShippingThreshold)} or more** (after discounts).`
      : "";

  switch (slug) {
    case "shipping":
      return {
        slug,
        title: "Shipping",
        summary: "Australia-wide delivery with Australia Post, dispatched from Melbourne.",
        updated: UPDATED,
        body: `
## Where we ship

We ship to all Australian addresses, including PO boxes and Parcel Lockers, using **Australia Post**. We don't currently ship internationally.

## Shipping rates

| Method | Price | Typical delivery |
| --- | --- | --- |
| Standard (Parcel Post) | ${formatMoney(s.standardShipping)} | 2–6 business days |
| Express Post | ${formatMoney(s.expressShipping)} | 1–3 business days |

${free}

Delivery estimates are Australia Post's, start from dispatch, and can be longer for regional and remote areas or during peak periods.

## Dispatch

${s.dispatchTime} Orders placed on weekends or public holidays are processed the next business day. Because we accept bank transfer and PayID, your order is dispatched once payment has cleared in our account — PayID is usually instant; bank transfers can take 1–2 business days.

## Tracking

As soon as your parcel is lodged we'll email you an Australia Post tracking number. You can also see it in [your account](/account) or on our [order tracking page](/track).

## Lost or delayed parcels

If your tracking hasn't updated for 5 business days, or a parcel marked delivered hasn't arrived, contact us at ${s.supportEmail} and we'll open an investigation with Australia Post. If a parcel is confirmed lost, we'll send a replacement or a full refund.

## Heat & handling

Our products are packed to handle normal transit. In summer we recommend bringing parcels inside promptly — like most actives, peptides prefer to stay below 25°C.
`,
      };
    case "returns":
      return {
        slug,
        title: "Returns & refunds",
        summary: "30-day change-of-mind returns on unopened items, and your rights under Australian Consumer Law.",
        updated: UPDATED,
        body: `
## Change of mind

We want you to love what you ordered. If you change your mind, you can return **unopened, unused items in their original packaging within 30 days** of delivery for a refund of the item price.

- For hygiene and safety reasons we can't accept change-of-mind returns of opened products.
- Return postage for change-of-mind returns is at your cost, and original shipping charges aren't refunded.
- Items returned without contacting us first may be delayed.

## Faulty, damaged or incorrect items

Our products come with guarantees that cannot be excluded under the **Australian Consumer Law**. If an item is faulty, damaged in transit, or not what you ordered, you're entitled to a replacement or refund — opened or not.

Please email ${s.supportEmail} within 7 days of delivery where possible, with your order number and a photo of the issue. We'll cover any return postage.

## Skin reactions

If you experience irritation, stop using the product and seek medical advice if needed. Contact us — we review every report and will work with you on a fair outcome, including a refund where appropriate.

## How to return

1. Email ${s.supportEmail} with your order number and the item(s) you'd like to return.
2. We'll reply with the return address and instructions.
3. Once we receive and inspect the return, we'll process your refund within 5 business days.

## Refunds

Refunds are made by bank transfer to the account you paid from (or another Australian account in your name). Please allow 1–3 business days for the funds to appear.

## Unpaid orders

Orders not paid within ${s.paymentWindowDays} days are cancelled automatically and no payment is required.
`,
      };
    case "terms":
      return {
        slug,
        title: "Terms of sale",
        summary: "The terms that apply when you shop with Beauty Peps.",
        updated: UPDATED,
        body: `
These terms apply to purchases from ${s.storeName}${s.abn ? ` (ABN ${s.abn})` : ""}. By placing an order you agree to them. Nothing in these terms limits your rights under the Australian Consumer Law.

## Our products

All Beauty Peps products — including serums, treatments and pure actives — are **cosmetics for external, topical use only**. They are not medicines, are not intended to diagnose, treat, cure or prevent any disease, and are not for injection or ingestion. Information in our Peptide Library and Journal is educational and is not medical advice.

Pure actives are cosmetic raw materials intended for use by formulators in properly preserved topical products. You're responsible for using them safely and in line with applicable regulations.

Product images are illustrative. Packaging may vary slightly between batches.

## Prices

All prices are in **Australian dollars and include GST**. Shipping is calculated at checkout. We may change prices at any time, but changes won't affect orders already placed. If we list a product at an obviously incorrect price, we may cancel the order and refund any payment.

## Placing an order & payment

Your order is an offer to buy. A contract is formed when we confirm payment has been received. We accept **bank transfer and PayID**; please use your order number as the payment reference.

Payment is due within **${s.paymentWindowDays} days** of placing your order. Stock is reserved during this window; unpaid orders are cancelled afterwards.

## Discount codes

One code per order. Codes have no cash value, can't be applied to past orders, and may have minimum spends, expiry dates or usage limits.

## Shipping & risk

Delivery is covered by our [shipping policy](/policies/shipping). Risk in the goods passes to you on delivery.

## Returns

See our [returns & refunds policy](/policies/returns).

## Reviews

By submitting a review you confirm it reflects your genuine experience. We may moderate reviews that are abusive, off-topic or make medical claims, but we don't remove reviews just because they're negative.

## Contact

Questions about these terms? Email ${s.supportEmail}.
`,
      };
    case "privacy":
      return {
        slug,
        title: "Privacy policy",
        summary: "How we collect, use and protect your personal information under the Australian Privacy Principles.",
        updated: UPDATED,
        body: `
${s.storeName} respects your privacy and handles personal information in line with the **Privacy Act 1988 (Cth)** and the **Australian Privacy Principles**.

## What we collect

- **Account details:** name, email address, phone number (optional) and a securely hashed password.
- **Order details:** delivery address, items purchased, order history and notes you add at checkout.
- **Communications:** messages you send us, and your newsletter subscription.
- **Reviews:** your display name, rating and review text.
- **Technical data:** basic information such as IP address and browser type used to keep the site secure and working.

We **do not collect or store card details** — we accept bank transfer and PayID, which you make directly from your bank.

## How we use it

- To process, ship and support your orders (including sharing your delivery details with Australia Post).
- To manage your account, wishlist and reviews.
- To send order and account emails (these are necessary and can't be switched off while you have active orders).
- To send The Peptide Letter and offers, **only if you opt in**. You can unsubscribe at any time.
- To keep our site secure and prevent fraud.

## Cookies

We use essential cookies to keep you signed in and to remember your shopping bag. We don't use advertising cookies.

## Sharing

We don't sell your personal information. We share it only with service providers who help us run the store — such as our hosting, email delivery and shipping partners — and only as needed for those services, or where required by law.

## Storage & security

Your information is stored with reputable cloud providers and protected with encryption in transit, hashed passwords and restricted staff access. Some providers may store data outside Australia; where they do, we take reasonable steps to ensure it's protected to an equivalent standard.

## Your choices

You can view and update your details in [your account](/account), delete your account from the security settings, or email ${s.supportEmail} to request access to or correction of your information.

## Complaints

If you have a privacy concern, contact us at ${s.supportEmail} and we'll respond within 30 days. If you're not satisfied, you can contact the Office of the Australian Information Commissioner (oaic.gov.au).
`,
      };
    default:
      return null;
  }
}
