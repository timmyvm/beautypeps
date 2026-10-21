# App screens — admin + customer account (tasteskill v2, app run)

Style: achromatic-ledger, seed 1969225264, kind commerce, light, --keep palette,type.
Redraw: shell "No sidebar" → "Open plane" (the admin has 13 destinations; a no-sidebar shell suits
products with few). The customer account keeps the dealt "no sidebar" shape: it sits inside the
site's own header in a centred column with its own section nav.
Deviation: square corners (radius 0) instead of the style's 8/6, to stay one system with the site.

## Inventory (data and jobs)
- Orders: BP10001…, status pending_payment → paid → processing → shipped → delivered (or cancelled /
  refunded); totals AUD incl. GST, ~$70–$250, ~1 order a day; paid by bank transfer or PayID with the
  order number as the reference; shipped Australia Post standard / express.
- Awaiting payment: ~4–7 orders, ~$900 outstanding at any time. To pack: ~2–5.
- Products: 18, stock 0–60, low-stock threshold per product (sold out: SNAP-8 powder).
- Reviews pending ~4, messages unread ~2–3, subscribers ~15.
- People: the owner (one person), daily, 5–15 minutes, laptop and phone.
- Jobs, most frequent first: pack and ship paid orders (AusPost labels, packing slips, tracking);
  match bank deposits to awaiting orders and mark them paid; moderate reviews; reply to messages.
- The product's own things: the Beauty Peps wordmark; the bank reference = the order number;
  Australia Post; the specimen product photos as thumbnails.

## Overview
Question: "What has to happen before today's post?"
Finding (title subline): "N paid orders to pack and M transfers to match ($X)."
Primary job: Create Australia Post labels (one click from the first screen).
Face: the stone ground from the product's world (#f3f3f1, the travertine of the photographs) with
white panels; sapphire only on the sales bars (the main data element).
Signature element: "Transfers to match" — each awaiting order listed as the bank line the owner is
looking for (reference + exact amount + method + days waiting) with Mark paid on the row.
Blocks: transfers to match | to pack (balanced, capped rows) → sales (KPIs as the chart's tabs) →
running low | selling most | waiting on you.

## Order detail
Question: "What's the next step for this order?" The next valid move is the only dark button.

## Account overview (customer)
Question: "Is anything waiting on me, and where is my order?" Unpaid orders with the payment details
first, then recent orders with their status, then the default address.
