import { formatMoney } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";

/** `tab` is the one or two words on the index-card tab that files each question. */
export type FaqGroup = { id: string; title: string; items: { q: string; tab: string; a: string }[] };

/** FAQ answers are markdown (links allowed). Numbers come from live store settings. */
export function getFaqGroups(s: StoreSettings): FaqGroup[] {
  const free =
    s.freeShippingThreshold > 0
      ? `Standard shipping is free on orders over ${formatMoney(s.freeShippingThreshold)}.`
      : "";

  return [
    {
      id: "about-peptides",
      title: "About peptides",
      items: [
        {
          q: "What are cosmetic peptides?",
          tab: "Basics",
          a: "Short chains of amino acids, the building blocks of proteins like collagen. In skincare they act mainly as messengers: some signal skin cells to build collagen, some deliver copper, some soften the nerve signals behind expression lines and some slow enzymes that break down collagen or drive pigment. Our [science guide](/science) explains each type.",
        },
        {
          q: "Do peptides actually work?",
          tab: "Evidence",
          a: "The honest answer: several peptides have encouraging in-vivo data, but most research is run by ingredient manufacturers and effects are gradual rather than dramatic. That's why every entry in our [Peptide Library](/peptides) carries an evidence grade and links to the studies. Expect subtle, cumulative improvements over 8–12 weeks of consistent use.",
        },
        {
          q: "Is Argireline the same as Botox?",
          tab: "Argireline",
          a: "No. Botulinum toxin is a prescription injectable that blocks nerve signals strongly and reliably. Argireline and similar peptides are applied topically and work on a related pathway far more gently; the effect is modest and depends on how much reaches the muscle. Read our [Argireline explainer](/learn/argireline-neuropeptides-explained).",
        },
        {
          q: "Why do you publish concentrations?",
          tab: "Labels",
          a: "Because 'contains peptides' tells you very little. Many products include a trace amount for the label. We list key active percentages on every product page so you can compare them with the concentrations used in published studies: see the [comparison chart](/compare).",
        },
        {
          q: "Why is your GHK-Cu serum blue?",
          tab: "Colour",
          a: "Copper(II) peptide complexes are naturally blue. The colour is a good sign: if a copper peptide product turns green or brown, the complex may have degraded.",
        },
      ],
    },
    {
      id: "using-products",
      title: "Using our products",
      items: [
        {
          q: "Can I use peptides with retinol?",
          tab: "Retinol",
          a: "Yes. Peptides don't react with retinoids. Many people apply peptides in the morning and retinoids at night, or alternate nights, mainly to keep irritation down. Our [layering guide](/learn/how-to-layer-peptides) has example routines.",
        },
        {
          q: "Can I use peptides with vitamin C or acids?",
          tab: "Vitamin C",
          a: "Most peptides are fine alongside vitamin C and exfoliating acids. The exception is copper peptides: keep GHK-Cu out of the same step as L-ascorbic acid or strong AHA/BHA products, as low pH can destabilise the copper complex and copper can oxidise vitamin C. Use them at different times of day.",
        },
        {
          q: "How long until I see results?",
          tab: "Results",
          a: "Hydration and smoothness can feel better within days. Changes in the look of fine lines and firmness typically take 6–12 weeks of twice-daily use, which matches the timeframes in most studies. Take a photo in consistent lighting on day one so you can compare fairly.",
        },
        {
          q: "Are your products suitable for sensitive skin?",
          tab: "Sensitive skin",
          a: "Our serums are fragrance-free and peptides are generally well tolerated. Still, everyone's skin is different: patch test any new product on your inner arm for a few days, and introduce one new product at a time.",
        },
        {
          q: "Can I use them while pregnant or breastfeeding?",
          tab: "Pregnancy",
          a: "Cosmetic peptides are not known to be a concern, but there's little specific research in pregnancy. Please check with your GP, obstetrician or dermatologist before starting new actives.",
        },
        {
          q: "How should I store my serums?",
          tab: "Storage",
          a: "Keep them closed, out of direct sunlight and below 25°C. A bathroom cabinet is fine; a sunny windowsill or hot car is not. Use within 6 months of opening (check the open-jar symbol on the box).",
        },
        {
          q: "Will these products replace sunscreen?",
          tab: "Sunscreen",
          a: "No. Daily broad-spectrum SPF is still the most effective anti-ageing step there is, especially in Australia. Peptides work best as part of a routine that includes sun protection.",
        },
      ],
    },
    {
      id: "pure-actives",
      title: "Pure actives",
      items: [
        {
          q: "Who are the pure actives for?",
          tab: "Who for",
          a: "Cosmetic chemists, DIY formulators and brands making small batches. They're lyophilised cosmetic-grade powders intended to be dissolved into a properly preserved topical formula, not to be applied neat.",
        },
        {
          q: "How do I add peptide powder to a formula?",
          tab: "Formulating",
          a: "Dissolve the powder in distilled water or your water phase, then add during the cool-down phase below 40°C. Aim for a final pH within the range listed on the product page and always include a broad-spectrum preservative. See [storing peptide powders](/learn/storing-peptide-powders).",
        },
        {
          q: "How should I store peptide powders?",
          tab: "Storage",
          a: "Sealed, dry and in the fridge (2–8°C), away from light. Let the vial reach room temperature before opening to avoid condensation. Once dissolved, use within a few weeks.",
        },
        {
          q: "Are pure actives for injection or ingestion?",
          tab: "Safety",
          a: "No. All Beauty Peps products, including pure actives, are cosmetic ingredients for external, topical use only.",
        },
      ],
    },
    {
      id: "orders-payment",
      title: "Orders & payment",
      items: [
        {
          q: "How do I pay?",
          tab: "Paying",
          a: `We accept bank transfer (direct deposit) and PayID. After you place your order you'll see our payment details on screen and by email. Please use your order number (e.g. BP10001) as the payment reference.`,
        },
        {
          q: "How long do I have to pay?",
          tab: "Deadline",
          a: `Please pay within ${s.paymentWindowDays} days. Unpaid orders are cancelled after that so stock can be released. We email you as soon as your payment clears.`,
        },
        {
          q: "Why don't you take cards?",
          tab: "Cards",
          a: "Keeping payments to bank transfer and PayID keeps our fees and your prices down, and means we never handle or store card details.",
        },
        {
          q: "How do I check my order status?",
          tab: "Status",
          a: "Sign in to [your account](/account) to see every order and its timeline, or use [order tracking](/track) with your order number and email address; no account needed.",
        },
        {
          q: "Can I change or cancel my order?",
          tab: "Changes",
          a: `If it hasn't been paid yet, you can cancel it from your account, or email us at ${s.supportEmail}. Once an order is packed we can't change it, but you can return unopened items under our [returns policy](/policies/returns).`,
        },
        {
          q: "Do you offer discount codes?",
          tab: "Codes",
          a: "Subscribers to The Peptide Letter get first access to offers. Enter any code in your bag before checkout. Only one code can be used per order.",
        },
      ],
    },
    {
      id: "shipping",
      title: "Shipping",
      items: [
        {
          q: "Where do you ship?",
          tab: "Where",
          a: "Australia-wide, including PO boxes and parcel lockers, with Australia Post. We don't currently ship internationally.",
        },
        {
          q: "How much is shipping?",
          tab: "Cost",
          a: `Standard (Parcel Post) is ${formatMoney(s.standardShipping)} and Express Post is ${formatMoney(s.expressShipping)}. ${free}`,
        },
        {
          q: "When will my order ship?",
          tab: "Dispatch",
          a: `${s.dispatchTime} Standard delivery typically takes 2–6 business days and Express 1–3 business days, depending on your location.`,
        },
        {
          q: "How do I track my parcel?",
          tab: "Tracking",
          a: "When your order ships we email you an Australia Post tracking number. You'll also find it in your account and on the [order tracking](/track) page.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & issues",
      items: [
        {
          q: "What is your returns policy?",
          tab: "Returns",
          a: "Unopened, unused items can be returned within 30 days of delivery for a refund (return postage is at your cost). Faulty or damaged items are always covered under Australian Consumer Law. Full details are in our [returns policy](/policies/returns).",
        },
        {
          q: "My order arrived damaged. What do I do?",
          tab: "Damage",
          a: `Sorry about that! Email ${s.supportEmail} within 7 days with your order number and a photo of the damage, and we'll send a replacement or refund.`,
        },
        {
          q: "I had a reaction to a product.",
          tab: "Reactions",
          a: `Stop using it straight away and rinse with cool water. If symptoms persist, see a doctor or pharmacist. Please let us know at ${s.supportEmail}; we take every report seriously and can help with a refund.`,
        },
      ],
    },
    {
      id: "account",
      title: "Your account",
      items: [
        {
          q: "Do I need an account to order?",
          tab: "Guest orders",
          a: "No. Guest checkout is available. An account lets you see order history, save addresses, keep a wishlist and leave verified reviews. If you create one with the same email later, your past guest orders are linked automatically.",
        },
        {
          q: "I forgot my password.",
          tab: "Password",
          a: "Use [reset password](/forgot-password) and we'll email you a secure link valid for one hour.",
        },
        {
          q: "How do I unsubscribe from emails?",
          tab: "Emails",
          a: "Update your marketing preferences in your account, or use the unsubscribe link in any newsletter. Order emails will still be sent for orders you place.",
        },
      ],
    },
  ];
}

/** Plain text for JSON-LD (strips markdown links). */
export function faqPlainText(markdown: string) {
  return markdown.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "");
}
