import type { articles } from "../db/schema";

export type SeedArticle = Omit<typeof articles.$inferInsert, "id">;

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);
const readMinutes = (md: string) => Math.max(3, Math.round(md.split(/\s+/).filter(Boolean).length / 220));

const LAB = "Beauty Peps Lab";
const MARA = "Mara Ellis, Head Formulator";

type Draft = Omit<SeedArticle, "readMinutes" | "coverImage" | "published"> & { slug: string; body: string };

const drafts: Draft[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "what-are-peptides",
    title: "What are peptides? A plain-English guide to your skin's messengers",
    category: "Science",
    author: MARA,
    featured: true,
    publishedAt: daysAgo(118),
    excerpt:
      "Peptides are everywhere in skincare, but what actually are they — and how can a few amino acids make a difference to skin? Start here.",
    seoDescription:
      "A plain-English guide to cosmetic peptides: what they are, the four main classes, how they reach the skin and what the evidence says.",
    body: `Walk down any skincare aisle and you'll see "peptides" on serums, creams, eye gels and lip balms. The word has become shorthand for *advanced anti-ageing*, but it's rarely explained. This guide covers what peptides are, how the different types work, and how to tell a well-formulated peptide product from marketing.

## Peptides, proteins and amino acids

Your skin is built from proteins — collagen for strength, elastin for bounce, keratin for the protective outer layer. Every protein is a long chain of building blocks called **amino acids**, folded into a specific shape.

A **peptide** is simply a *short* chain of amino acids. There's no hard cut-off, but in skincare we're usually talking about chains of two to around ten amino acids. Because they're small, peptides can do something proteins can't: act as **messengers**.

> A useful way to think about it: collagen is the brick wall. A peptide is the text message telling the builder to lay more bricks.

## Why the skin listens to peptides

The skin constantly breaks down and rebuilds its supporting structure, the **extracellular matrix** (ECM). When collagen is broken down, small fragments are released. Some of these fragments — called **matrikines** — are recognised by **fibroblasts** (the cells that make collagen) as a sign that repair is needed.

Cosmetic chemists realised that if you could make a stable copy of one of these fragments and get it to the right place, you might be able to nudge the skin's repair processes along. That's the idea behind most "anti-ageing" peptides.

## The four classes of cosmetic peptides

Not all peptides work the same way. Researchers usually group them into four classes:

| Class | What it does | Examples |
| --- | --- | --- |
| **Signal peptides** | Mimic matrix fragments to prompt collagen, elastin and glycosaminoglycan production | [Matrixyl](/peptides/palmitoyl-pentapeptide-4), [Matrixyl 3000](/peptides/palmitoyl-tripeptide-1), [SYN-COLL](/peptides/palmitoyl-tripeptide-5) |
| **Carrier peptides** | Deliver trace elements (mostly copper) needed for repair enzymes | [GHK-Cu](/peptides/ghk-cu) |
| **Neurotransmitter-inhibiting peptides** | Modulate the nerve–muscle signal behind repeated expressions | [Argireline](/peptides/acetyl-hexapeptide-8), [SNAP-8](/peptides/acetyl-octapeptide-3), [Leuphasyl](/peptides/pentapeptide-18) |
| **Enzyme-inhibiting peptides** | Slow enzymes that degrade collagen or drive pigment | [Nonapeptide-1](/peptides/nonapeptide-1), [Eyeseryl](/peptides/acetyl-tetrapeptide-5) |

Many products combine classes. Our [Multi-Peptide 12 Complex](/products/multi-peptide-complex), for example, pairs five signal peptides with two neurotransmitter-inhibiting peptides.

## The penetration problem

There's an honest challenge with topical peptides: the skin's outer layer, the **stratum corneum**, is designed to keep things out. A widely cited rule of thumb is that molecules larger than about **500 daltons** struggle to penetrate intact skin. Many peptides sit near or above that size.

Formulators use several tricks to help:

- **Lipidation** — attaching a fatty acid (usually palmitic acid, hence "palmitoyl") makes a peptide more oil-loving, so it has a better affinity for the lipid-rich outer layer.
- **Acetylation and amidation** — capping the ends of a peptide makes it more stable against enzymes.
- **Smart vehicles** — the base formula (solvents, humectants, pH) influences how much peptide reaches the skin.

This is one reason the *formula* matters as much as the ingredient name on the front of the bottle.

## What the evidence actually says

Peptide research spans a wide range of quality:

1. **In-vitro studies** (cells in a dish) show that many peptides can switch on matrix production. This is the strongest and most consistent evidence — but a dish isn't a face.
2. **Ex-vivo and animal studies** add some confidence, particularly for GHK-Cu in wound healing.
3. **Human studies** exist for a handful of peptides. Palmitoyl pentapeptide-4 and Argireline have published, placebo-controlled trials; GHK-Cu has several smaller studies. Many newer trade-name peptides rely mostly on **manufacturer-sponsored** studies with small groups.

None of this means peptides "don't work". It means effects are generally **gradual and modest**, and you should be wary of anyone promising overnight results. In our [Peptide Library](/peptides) we give each peptide an evidence rating so you can see where it sits.

## How to choose a peptide product

- **Look for the INCI name**, not just a trade name. "Acetyl Hexapeptide-8" tells you more than "advanced peptide complex".
- **Check where it sits in the ingredient list.** Peptides are used at low levels, but a meaningful dose of the trade solution usually lands it in the first half of the list.
- **Match the class to your concern.** Expression lines → neurotransmitter-inhibiting peptides. Firmness and texture → signal and carrier peptides. Uneven tone → nonapeptide-1.
- **Think in months.** Most studies measure results at 8–12 weeks.
- **Keep the rest of your routine sensible.** Daily sunscreen does more for skin ageing than any single active.

## The bottom line

Peptides are short chains of amino acids that can act as messengers in the skin. They're gentle, compatible with almost every other active, and backed by a mix of strong lab evidence and smaller human studies. Used consistently, alongside sunscreen, they're one of the most well-tolerated ways to support skin as it ages.

Ready to explore? Browse the [Peptide Library](/peptides) or [compare peptides side by side](/compare).`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "copper-peptides-ghk-cu-guide",
    title: "The complete guide to copper peptides (GHK-Cu)",
    category: "Ingredients",
    author: MARA,
    featured: true,
    publishedAt: daysAgo(102),
    excerpt:
      "Why is it blue? Can you use it with vitamin C? And what does fifty years of research actually show? Everything you need to know about GHK-Cu.",
    seoDescription:
      "GHK-Cu copper peptide explained: history, mechanism, evidence, how to use it, what not to mix it with, and how to choose a good copper peptide serum.",
    body: `Of all the peptides in skincare, **GHK-Cu** has the most interesting backstory and the deepest research base. It's also the most misunderstood. Here's our complete guide.

## A peptide your body already makes

GHK — glycyl-L-histidyl-L-lysine — is a tiny three-amino-acid peptide found naturally in human plasma, saliva and urine. It was isolated in 1973 by researcher Loren Pickart, who noticed that something in the blood of young people caused older liver tissue to behave more youthfully in the lab. That "something" turned out to be GHK.

GHK has a very high affinity for **copper(II) ions**, and in the body it exists largely as the copper complex **GHK-Cu**. Its levels decline with age — published reviews report a drop from roughly 200 ng/mL at age 20 to around 80 ng/mL by 60.

## Why copper matters

Copper is an essential cofactor for several enzymes that keep skin healthy:

- **Lysyl oxidase** cross-links collagen and elastin, giving them strength.
- **Superoxide dismutase** helps neutralise free radicals.
- **Tyrosinase** (yes, the pigment enzyme) also uses copper.

GHK-Cu is classed as a **carrier peptide**: it's thought to deliver copper where it's needed, and the peptide itself also acts as a signal.

## What GHK-Cu does in the lab

Decades of cell and animal research have shown that GHK-Cu can:

- Stimulate fibroblasts to make **collagen, elastin, decorin and glycosaminoglycans**
- Modulate the balance of **MMPs** (enzymes that break down collagen) and **TIMPs** (their inhibitors) — supporting *remodelling* rather than simply building
- Attract immune and blood-vessel cells to wounds, speeding repair in animal models
- Influence the activity of a large number of genes involved in tissue repair, according to gene-expression database analyses

That last finding generated a lot of excitement. It's worth keeping in context: it comes from cell-based data, and doesn't tell us exactly what a cosmetic serum does on intact skin.

## What it does on real faces

Human studies of copper peptide creams and eye creams are encouraging but small. Reported outcomes over **8–12 weeks** include improved laxity, reduced fine lines, better density and increased skin thickness. One small comparative study reported increased collagen production in biopsied skin after a month of using a GHK-Cu cream.

Our honest summary: GHK-Cu is one of the best-supported cosmetic peptides, but the human trials are small. Expect gradual improvements in **firmness, texture and resilience** rather than dramatic change.

## Why is my serum blue?

The copper complex is naturally **blue to violet**. A properly made GHK-Cu serum at 0.5–1% will have a visible blue tint. A few quick checks:

- **Deep blue** — good sign the copper is bound.
- **Green or murky** — the pH may be too low, causing copper to dissociate.
- **Colourless** — either a very low concentration, or the peptide isn't copper-complexed.

The colour disappears as the serum absorbs, so it won't tint your skin.

## What *not* to mix it with

Copper peptides are compatible with most ingredients, but there are a few exceptions in the **same routine**:

| Ingredient | Why to separate | What to do |
| --- | --- | --- |
| **L-ascorbic acid** (pure vitamin C) | Low pH and its reducing action can destabilise the copper complex | Vitamin C in the morning, GHK-Cu at night |
| **Strong AHA/BHA exfoliants** | Very low pH can strip copper from the peptide | Use exfoliants on separate nights |
| **High levels of EDTA / chelators** | They can bind the copper | Mostly a formulation issue — choose well-formulated products |

**Retinoids** are generally fine. Many people alternate nights; others use copper in the morning and a retinoid at night. If your skin is sensitive, alternate.

**Niacinamide, hyaluronic acid, ceramides and other peptides** all pair well.

## How to use GHK-Cu

1. Apply to clean skin, 3–4 drops for the face and neck.
2. Use once or twice daily. If you're new to it, start every other night for a week.
3. Follow with moisturiser, and SPF in the morning.
4. Give it 8–12 weeks before judging.

Our [GHK-Cu Copper Peptide Serum](/products/ghk-cu-copper-peptide-serum) uses 1% copper tripeptide-1 in a deliberately simple, buffered base. If you formulate your own products, our [pure GHK-Cu powder](/products/ghk-cu-pure-powder) comes with full formulation notes.

## Copper peptides for hair

GHK-Cu has also been studied in laboratory models of hair follicles, where it appeared to support follicle size. That's why you'll find it in scalp serums — including our [Scalp Peptide Serum](/products/scalp-peptide-serum), where it's paired with biotinoyl tripeptide-1.

## The bottom line

GHK-Cu is a naturally occurring peptide with half a century of research behind it. It's a great choice if your priorities are **firmness, texture and skin resilience**. Keep it away from strong acids and pure vitamin C in the same routine, be patient, and it's one of the most rewarding peptides to use.

Read the full [GHK-Cu monograph](/peptides/ghk-cu) in our Peptide Library.`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "argireline-neuropeptides-explained",
    title: "Argireline and the neuropeptides: how 'topical Botox' really works",
    category: "Ingredients",
    author: LAB,
    featured: false,
    publishedAt: daysAgo(88),
    excerpt:
      "Argireline is often sold as 'Botox in a bottle'. The truth is more interesting — and more modest. Here's how expression-line peptides work.",
    seoDescription:
      "How Argireline, SNAP-8, Leuphasyl and Syn-Ake work on expression lines, what the evidence shows, and how they compare to injectables.",
    body: `Few skincare ingredients have been marketed as hard as Argireline. "Botox in a bottle", "needle-free alternative", "topical neuromodulator"... Some of that is exaggeration, but the science behind it is genuinely clever. Here's what's really going on.

## Where expression lines come from

Every time you frown, squint or raise your eyebrows, a nerve tells a muscle to contract. Over years, the skin above those muscles creases in the same places again and again, and the lines become etched in. These are **dynamic** or **expression** lines — the "11s" between the brows, forehead lines and crow's-feet.

## The nerve–muscle handshake

To trigger a contraction, the nerve ending releases a chemical messenger called **acetylcholine**. It's stored in tiny bubbles (vesicles) inside the nerve, and to release it, those vesicles must fuse with the nerve's outer membrane.

That fusion is powered by a trio of proteins called the **SNARE complex**: **SNAP-25**, **syntaxin** and **VAMP**. When they zip together, the vesicle fuses and acetylcholine is released.

Botulinum toxin works by *cutting* SNAP-25, which stops the SNARE complex from forming. That's why injectables are so effective — and why they need a medical professional.

## How Argireline fits in

[Argireline](/peptides/acetyl-hexapeptide-8) (acetyl hexapeptide-8) is a six-amino-acid peptide modelled on the end of SNAP-25. The idea is that it **competes** with the real SNAP-25 for a place in the SNARE complex. A complex containing Argireline is less efficient, so a little less acetylcholine is released, and contractions are a little less intense.

Note the words "a little". Argireline doesn't cut anything, doesn't freeze muscles, and wears off when you stop using it.

## What the studies show

- The original 2002 study reported reduced wrinkle depth around the eyes after 30 days of using a 10% Argireline solution twice daily, in a small group of volunteers.
- A later randomised, placebo-controlled study in Chinese subjects reported improvements in periorbital wrinkles versus placebo.
- The open question is **penetration**: how much peptide actually reaches the nerve endings through intact skin. The effects measured are real but subtle.

**Our take:** Argireline is the best-studied of the neuropeptides and a sensible choice for softening the look of expression lines — think gentle smoothing over a month or two, not a frozen forehead.

## Meet the rest of the family

Argireline has some relatives that target the same pathway at different points:

| Peptide | INCI | Where it acts | Evidence |
| --- | --- | --- | --- |
| [Argireline](/peptides/acetyl-hexapeptide-8) | Acetyl Hexapeptide-8 | SNARE complex (inside the nerve) | Published human studies |
| [SNAP-8](/peptides/acetyl-octapeptide-3) | Acetyl Octapeptide-3 | SNARE complex (longer mimic) | Mostly supplier data |
| [Leuphasyl](/peptides/pentapeptide-18) | Pentapeptide-18 | Enkephalin receptor (calms the nerve) | Mostly supplier data |
| [Syn-Ake](/peptides/dipeptide-diaminobutyroyl-benzylamide-diacetate) | Dipeptide Diaminobutyroyl Benzylamide Diacetate | Acetylcholine receptor (on the muscle) | Mostly supplier data |

Because they act at **different steps**, combining them is a reasonable strategy: turn down the signal (Leuphasyl), make release less efficient (Argireline, SNAP-8), and blunt the muscle's response (Syn-Ake).

## Do they work with injectables?

Many people use expression-line peptides **between** injectable appointments. There's no conflict in mechanism; if anything, they're aiming at the same goal by gentler means. If you've just had a procedure, check with your practitioner before applying anything to the area.

## How to use them

1. Apply 2–3 drops to areas of movement: forehead, between the brows, crow's-feet and smile lines.
2. Use twice daily — consistency matters more than quantity.
3. Layer with signal peptides (for the *static* component of lines) and moisturiser.
4. Allow 4–8 weeks.

Our [Argireline 10%](/products/argireline-10-serum), [SNAP-8](/products/snap-8-serum) and [Leuphasyl + Syn-Ake](/products/leuphasyl-syn-ake-serum) serums can be used alone or together — or try the [Expression Line Duo](/products/expression-line-duo).

## Who are expression-line peptides best for?

They suit people who:

- Notice lines mainly **when they move** — frowning, squinting or raising their brows — rather than lines that are visible at rest.
- Want a **gentle, low-commitment** option, or prefer not to use injectables.
- Already use injectables and want to **maintain** results between appointments.
- Have **sensitive skin** that doesn't tolerate retinoids well.

They're less effective on deep, static lines that are visible even when your face is relaxed. For those, signal peptides, retinoids and professional treatments do more of the work.

## Frequently asked questions

**Will Argireline make my face look "frozen"?**
No. The effect of a topical peptide is far too subtle to restrict expression. You'll still frown and smile normally.

**Do the results last if I stop?**
No — like most skincare actives, the benefit fades gradually once you stop applying it.

**Can I use it with retinol?**
Yes. Apply Argireline first, then your retinoid, or use them at different times of day.

**Is it safe during pregnancy?**
There's little specific safety data for cosmetic peptides in pregnancy. Speak to your doctor before starting any new active while pregnant or breastfeeding.

## The bottom line

Expression-line peptides are a genuinely clever piece of biomimetic chemistry, but they're not injectables. Used consistently, they can soften the look of dynamic lines a little at a time — with no needles, no downtime and almost no risk of irritation.`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "how-to-layer-peptides",
    title: "How to layer peptides with retinol, vitamin C, acids and niacinamide",
    category: "Routines",
    author: MARA,
    featured: false,
    publishedAt: daysAgo(71),
    excerpt:
      "Peptides play nicely with almost everything — with a couple of important exceptions. Our compatibility chart and layering order, explained.",
    seoDescription:
      "Can you use peptides with retinol, vitamin C, AHAs, BHAs and niacinamide? Our peptide layering guide and compatibility chart.",
    body: `One of the best things about peptides is how **easy** they are to fit into a routine. They're gentle, they rarely irritate, and most of them are compatible with every other popular active. But "most" isn't "all" — and the order you apply things in does matter.

## The golden rules of layering

1. **Thinnest to thickest.** Water-light serums first, then gels, then creams, then oils.
2. **Actives on clean skin.** Your most important treatment step should go on first, after cleansing (and toner, if you use one).
3. **pH-dependent actives first.** Products that need a low pH to work (vitamin C, exfoliating acids) usually go on before neutral-pH serums.
4. **Sunscreen last** in the morning. Always.

## The compatibility chart

| Pair peptides with… | Signal & neurotransmitter peptides | Copper peptides (GHK-Cu) |
| --- | --- | --- |
| **Retinol / retinoids** | ✅ Great together | ✅ Usually fine; alternate if sensitive |
| **Vitamin C (L-ascorbic acid)** | ✅ Fine | ⚠️ Separate — AM vs PM |
| **Vitamin C derivatives** (e.g. SAP, MAP, THD) | ✅ Fine | ✅ Generally fine |
| **AHAs / BHAs** (leave-on exfoliants) | ✅ Fine; apply acid first | ⚠️ Separate — different nights |
| **Niacinamide** | ✅ Great together | ✅ Fine |
| **Hyaluronic acid** | ✅ Great together | ✅ Great together |
| **Ceramides** | ✅ Great together | ✅ Great together |
| **Benzoyl peroxide** | ⚠️ Separate — it's a strong oxidiser | ⚠️ Separate |

## Peptides + retinoids

This is a classic pairing. Retinoids increase cell turnover and support collagen; peptides support the matrix through different signals and are calming. Most people can layer them in the same routine:

- Apply your **peptide serum**, wait a minute, then your **retinoid**, then moisturiser — or
- Apply the retinoid first and a **peptide cream** like our [Peptide Night Cream](/products/peptide-night-cream) on top to cushion it.

With **GHK-Cu**, many people prefer to alternate: copper one night, retinoid the next.

## Peptides + vitamin C

Most peptides are fine with vitamin C. The exception is **copper peptides with L-ascorbic acid**: pure vitamin C is formulated at a low pH and is a strong reducing agent, both of which can destabilise the copper complex. The fix is easy — vitamin C in the **morning** (where its antioxidant protection pairs with sunscreen) and GHK-Cu at **night**.

## Peptides + exfoliating acids

Signal and neurotransmitter peptides are generally stable enough to be used straight after a leave-on AHA or BHA. Very low-pH products can theoretically break down some peptides over time, so it's sensible to let the acid absorb for a few minutes first.

For **copper peptides**, use acids on different nights.

## Peptides + niacinamide

An excellent pairing. Niacinamide supports the barrier and tone; peptides support the matrix. Our [Nonapeptide-1 Brightening Serum](/products/nonapeptide-brightening-serum) builds them into one bottle.

## How many peptide products should I use?

You don't need a dozen. Two well-chosen peptide steps is plenty for most people — for example:

- **Morning:** [Argireline 10%](/products/argireline-10-serum) for expression lines → moisturiser → SPF
- **Evening:** [GHK-Cu Serum](/products/ghk-cu-copper-peptide-serum) → [Peptide Night Cream](/products/peptide-night-cream)

Or keep it to a single step with a broad-spectrum formula like [Multi-Peptide 12](/products/multi-peptide-complex).

## Sample routines

**Minimalist**
- AM: Cleanser → Multi-Peptide 12 → SPF 50+
- PM: Cleanser → Multi-Peptide 12 → moisturiser

**Firmness-focused**
- AM: Cleanser → vitamin C → Matrixyl 3000 → SPF 50+
- PM: Cleanser → GHK-Cu → Peptide Night Cream (retinoid on alternate nights)

**Expression lines**
- AM: Cleanser → Argireline 10% → SNAP-8 → moisturiser → SPF 50+
- PM: Cleanser → Leuphasyl + Syn-Ake → Matrixyl 3000 → moisturiser

## How long should I wait between layers?

For most peptide serums, **30–60 seconds** is enough — just until the previous layer no longer feels wet. The exceptions:

- After a **low-pH vitamin C or exfoliating acid**, give it a few minutes before applying peptides.
- Before **sunscreen**, let your moisturiser settle for a couple of minutes so the SPF film forms evenly.

There's no need for the long "wait 20 minutes" rules you'll see online for most combinations.

## Troubleshooting pilling

If products ball up on your skin ("pilling"), it's almost always about **quantity or order**, not incompatibility:

1. Use less — 3–4 drops of serum is enough for the whole face.
2. Let each layer absorb before the next.
3. Apply water-based products before silicone-heavy ones.
4. Pat rather than rub.

If a particular pair always pills, try them at different times of day instead.

## The bottom line

Peptides are team players. Keep **copper peptides away from pure vitamin C and strong acids in the same routine**, apply thinnest to thickest, and finish with sunscreen in the morning. Beyond that, it's hard to go wrong.

Not sure what to combine? Try our [Routine Builder](/routine-builder).`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "peptides-for-eyes",
    title: "Peptides for the eye area: puffiness, dark circles and crow's-feet",
    category: "Guides",
    author: LAB,
    featured: false,
    publishedAt: daysAgo(55),
    excerpt:
      "The eye area ages differently from the rest of the face. Here's which peptides target puffiness, shadows and fine lines — and what topicals can't fix.",
    seoDescription:
      "Which peptides help under-eye puffiness, dark circles and crow's-feet? An honest guide to eye-area peptides, plus how to apply them.",
    body: `The skin around your eyes is some of the thinnest on your body — and it works harder than almost anywhere else, moving thousands of times a day as you blink, squint and smile. It's no surprise that it's often the first place people notice changes. Here's how peptides can help, and where their limits are.

## Three different problems

"Tired eyes" usually means some combination of:

1. **Puffiness** — fluid that collects overnight, often worse with salty food, poor sleep or allergies.
2. **Dark circles** — which can be *vascular* (blood vessels showing through thin skin), *pigmented* (extra melanin), or *structural* (shadows cast by hollows).
3. **Fine lines and crow's-feet** — from repeated expression and thinning skin.

Each responds to different ingredients, so it's worth knowing which you're dealing with.

## Peptides for puffiness

[Acetyl tetrapeptide-5](/peptides/acetyl-tetrapeptide-5) (Eyeseryl) is the go-to eye peptide for puffiness. According to its developer, it helps by reducing vascular permeability (so less fluid leaks into the tissue), inhibiting an enzyme involved in fluid regulation, and reducing glycation that stiffens the area.

**Caffeine** is the perfect partner: it constricts blood vessels and gives a fast, visible de-puffing effect while the peptide works over weeks.

## Peptides for dark circles

For **vascular** dark circles, the Haloxyl complex — which combines [palmitoyl tripeptide-1](/peptides/palmitoyl-tripeptide-1) and [palmitoyl tetrapeptide-7](/peptides/palmitoyl-tetrapeptide-7) with chrysin and N-hydroxysuccinimide — is designed to help clear the haem by-products that give the area a blue-brown tint, while supporting the matrix so skin looks less translucent.

For **pigmented** dark circles, a pigment-signalling peptide like [nonapeptide-1](/peptides/nonapeptide-1) may help alongside sunscreen — but be gentle and keep products on the orbital bone.

**Structural** dark circles (hollows and bone structure) don't really respond to topicals. A good concealer is your friend, and a cosmetic doctor can talk you through other options.

## Peptides for crow's-feet

Crow's-feet are part expression line, part loss of elasticity:

- **Neurotransmitter-inhibiting peptides** like [Argireline](/peptides/acetyl-hexapeptide-8) and [SNAP-8](/peptides/acetyl-octapeptide-3) target the movement component.
- **Signal peptides** and **GHK-Cu** support firmness and texture.

## How to apply eye products

- Use your **ring finger** — it naturally applies the least pressure.
- **Tap, don't rub,** along the orbital bone from inner to outer corner.
- Stay on the bone, not the eyelid or lash line. Products migrate as they warm.
- **Half a pump** is enough for both eyes.
- Keep gels in the **fridge** for an extra de-puffing boost in the morning.

## What about using face serum around the eyes?

Many face serums are perfectly fine to use on the orbital bone, particularly fragrance-free peptide serums. Dedicated eye products earn their place by combining the right ingredients (caffeine, Eyeseryl, Haloxyl) in a texture that won't migrate into the eyes.

## Lifestyle factors that matter

Topicals can only do so much if the root cause is lifestyle. A few things that genuinely affect the eye area:

- **Sleep position.** Sleeping flat lets fluid pool overnight. An extra pillow can noticeably reduce morning puffiness.
- **Salt and alcohol.** Both encourage fluid retention, which shows up first under the eyes.
- **Allergies and rubbing.** Hay fever and habitual eye-rubbing cause swelling and can deepen pigmentation over time.
- **Sun exposure.** The eye area is often missed with sunscreen. Use a gentle SPF up to the orbital bone and wear sunglasses — they also reduce squinting.

## A simple eye routine

**Morning:** cleanse → eye gel (from the fridge) tapped along the orbital bone → moisturiser → sunscreen → sunglasses outdoors.

**Evening:** gentle makeup removal (no rubbing) → eye gel or a peptide serum on the orbital bone → night cream around (not on) the eye area.

Stick with it for at least six to eight weeks — puffiness often improves first, fine lines last.

## Frequently asked questions

**Do I really need a separate eye product?**
Not always. A fragrance-free face serum can be used on the orbital bone. Dedicated eye gels add targeted ingredients like caffeine and Eyeseryl in a texture designed not to migrate.

**Can I use retinol around my eyes?**
Many people can, gently and gradually. If you're sensitive, peptides are a well-tolerated alternative.

## When to see a professional

Persistent swelling, sudden changes, one-sided puffiness or itching may have medical causes (such as allergies, thyroid conditions or kidney issues). See your GP if you're unsure.

## Our eye-area picks

- [Eye Peptide Gel](/products/eye-peptide-gel) — Eyeseryl + Haloxyl + caffeine in a cooling airless pump.
- [Argireline 10%](/products/argireline-10-serum) — for crow's-feet, applied along the outer orbital bone.
- [The Copper Ritual Kit](/products/copper-ritual-kit) — eye gel, GHK-Cu serum and night cream together.

## The bottom line

Eye peptides work best on **puffiness** and **vascular shadows**, with gradual help for fine lines. Be realistic about structural dark circles, apply gently, and give any eye product at least four to eight weeks.`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "storing-peptide-powders",
    title: "How to store and handle lyophilised peptide powders",
    category: "Guides",
    author: MARA,
    featured: false,
    publishedAt: daysAgo(40),
    excerpt:
      "Bought a vial of pure peptide for your own formulations? Here's how to store it, weigh it, dissolve it and keep it stable — from our lab bench to yours.",
    seoDescription:
      "Storage and handling guide for cosmetic-grade lyophilised peptide powders: temperature, moisture, weighing, stock solutions and stability.",
    body: `Our [Pure Actives](/shop?category=pure-actives) are the same cosmetic-grade peptide powders we formulate with, supplied for DIY and professional formulators. Peptides are robust once formulated, but the dry powders need a little care. This guide covers everything we do in our own lab.

> **Important:** our pure actives are cosmetic raw materials for topical formulations. They are not for injection or ingestion.

## What "lyophilised" means

Lyophilisation is **freeze-drying**: the peptide is dissolved, frozen, then put under vacuum so the ice turns straight into vapour. What's left is a light, porous powder (sometimes a solid "cake") with very little water — which is exactly what makes it stable.

Water is the enemy of a dry peptide. Moisture lets degradation reactions start, so most of the rules below are about keeping water out.

## Storage at a glance

| Situation | Where | How long (typical) |
| --- | --- | --- |
| Unopened vial | Fridge, **2–8 °C**, dark | 12–24 months (see the COA retest date) |
| Opened vial, powder | Fridge, tightly sealed, with desiccant | Use within the retest period |
| Aqueous stock solution, unpreserved | Fridge | **A few days** at most |
| Finished, preserved formula | Room temperature, away from heat and sun | As validated by your stability testing |

Some formulators freeze powders for long-term storage. That's fine for unopened vials, but repeated freeze–thaw cycles and condensation on opening do more harm than good, so the fridge is better for anything you're actively using.

## Opening a vial: avoid condensation

The single most common mistake is opening a cold vial straight out of the fridge. Warm room air hits the cold powder and moisture condenses on it.

1. Take the vial out of the fridge.
2. **Let it come to room temperature** (20–30 minutes) before opening.
3. Weigh what you need quickly, reseal tightly, and return it to the fridge.

## Weighing tiny amounts

Peptides are used at low levels, so accuracy matters:

- Use a **0.001 g (milligram) scale** at minimum. A 0.0001 g analytical balance is better for neat neurotransmitter or signal peptides.
- Weigh onto a small piece of weighing paper or a clean glass boat.
- Static can make light powders jump — an anti-static gun or simply touching a grounded metal surface first helps.

## Making a stock solution

For peptides used at very low levels (such as pure [Argireline](/products/argireline-pure-powder) or [SNAP-8](/products/snap-8-pure-powder)), it's far easier to make a concentrated **stock solution** and dose that:

1. Weigh, for example, **0.100 g** of peptide.
2. Dissolve in **99.900 g** of distilled water (or the solvent recommended on the product page) → a **0.1%** stock.
3. Add the stock to your formula by weight. 1 g of stock in 100 g of product gives **0.001%** (10 ppm) peptide.
4. Use stock solutions promptly — they're not preserved.

**Lipophilic peptides** such as [palmitoyl pentapeptide-4](/products/matrixyl-pure-powder) won't dissolve in water. Pre-dissolve them in a glycol co-solvent with a solubiliser, as described on the product page.

## Adding peptides to a formula

- Add peptides in the **cool-down phase, below 40 °C**. Heat is one of the main causes of degradation.
- Check the **final pH**. Most peptides are happiest between pH 4.5 and 7. [GHK-Cu](/products/ghk-cu-pure-powder) needs to stay around 5–7 to keep the copper bound.
- Use a **broad-spectrum preservative** system for any water-containing product.
- Avoid strong oxidisers (e.g. benzoyl peroxide) and, for copper peptides, strong chelators and L-ascorbic acid.

## Shipping and arrival

Lyophilised peptides are stable at room temperature for the few days they spend in transit — the dry powder is far more robust than a solution. When your order arrives:

1. Check the seal and crimp cap are intact.
2. Check the label matches the certificate of analysis (product, batch number and date).
3. Move the vial into the fridge straight away.

## Your formulator's equipment checklist

- Milligram scale (0.001 g) — or an analytical balance for neat peptides
- Glass beakers and a glass stirring rod
- Distilled or deionised water
- pH meter or narrow-range pH strips (4.0–7.0)
- A thermometer, so you know when you're below 40 °C
- Broad-spectrum preservative
- Amber glass or airless packaging for finished products
- Gloves and a clean, dedicated workspace

## Signs a powder has degraded

- **Clumping or stickiness** — moisture has got in.
- **Colour change** — e.g. GHK-Cu turning greenish.
- **Poor solubility** compared with a fresh vial.
- **Unusual odour.**

If in doubt, don't use it. Every vial ships with a **certificate of analysis**; get in touch if you have questions about a batch.

## The bottom line

Keep powders **cold, dry and dark**, let vials warm up before opening, make stock solutions for tiny doses, and add peptides **below 40 °C** at the right pH. Do that and your peptides will stay as effective as the day they were made.`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "matrixyl-collagen-signal-peptides",
    title: "Matrixyl and the signal peptides: how matrikines talk to your skin",
    category: "Science",
    author: MARA,
    featured: false,
    publishedAt: daysAgo(24),
    excerpt:
      "Matrixyl, Matrixyl 3000, Matrixyl synthe'6, SYN-COLL... What's the difference, and how do these 'collagen peptides' actually work?",
    seoDescription:
      "Signal peptides explained: Matrixyl (palmitoyl pentapeptide-4), Matrixyl 3000, Matrixyl synthe'6 and SYN-COLL — mechanisms and evidence.",
    body: `If you've read an ingredient list in the last twenty years, you've almost certainly seen **Matrixyl**. It's one of the most widely used cosmetic peptides in the world, and it spawned a family of successors with confusingly similar names. Here's how they work and how they differ.

## Your skin's repair signals

The dermis is held together by the **extracellular matrix** — collagen for tensile strength, elastin for recoil, and glycosaminoglycans like hyaluronic acid to hold water. Cells called **fibroblasts** build and maintain it.

When the matrix is damaged — by UV, inflammation or simply time — enzymes break collagen into fragments. Some of these fragments, known as **matrikines**, act as feedback signals: fibroblasts detect them and respond by producing new matrix. It's an elegant repair loop.

**Signal peptides** are synthetic copies of these fragments. The hope is that by applying them, you send the "repair needed" message without the damage.

## Matrixyl: where it started

In 1993, researchers identified a five-amino-acid fragment of type I procollagen — **KTTKS** (lysine-threonine-threonine-lysine-serine) — that stimulated collagen and fibronectin production in cell culture.

KTTKS alone penetrates skin poorly, so the cosmetics supplier Sederma attached a **palmitic acid** chain, creating **palmitoyl pentapeptide-4** (Pal-KTTKS), launched as Matrixyl in 2000.

Crucially, Matrixyl is one of the few cosmetic peptides with a **published, placebo-controlled human study**: a 12-week split-face trial found that a moisturiser with just a few parts per million of Pal-KTTKS improved fine lines and wrinkles compared with the vehicle alone.

## The family tree

| Trade name | INCI | Signal | Main idea |
| --- | --- | --- | --- |
| **Matrixyl** | [Palmitoyl Pentapeptide-4](/peptides/palmitoyl-pentapeptide-4) | Pro-collagen fragment | Stimulates collagen I, III and fibronectin |
| **Matrixyl 3000** | [Palmitoyl Tripeptide-1](/peptides/palmitoyl-tripeptide-1) + [Palmitoyl Tetrapeptide-7](/peptides/palmitoyl-tetrapeptide-7) | GHK fragment + IgG fragment | "Build" plus "calm inflammation" (IL-6) |
| **Matrixyl synthe'6** | [Palmitoyl Tripeptide-38](/peptides/palmitoyl-tripeptide-38) | KMK matrikine | Targets six matrix components at once |
| **SYN-COLL** | [Palmitoyl Tripeptide-5](/peptides/palmitoyl-tripeptide-5) | Thrombospondin-1 mimic | Activates TGF-β; reduces MMPs |

Despite the shared name, **Matrixyl and Matrixyl 3000 are different molecules** — and they work well together.

## Why combine signal peptides?

Each signal peptide pulls a slightly different lever:

- Some push **production** (Matrixyl, Pal-tripeptide-1, synthe'6).
- Some reduce **breakdown** (SYN-COLL's effect on MMPs).
- Some reduce **inflammatory signalling** that accelerates breakdown (Pal-tetrapeptide-7).

Combining them is a bit like having several people send the same message by different routes. That's the thinking behind our [Multi-Peptide 12 Complex](/products/multi-peptide-complex) and [Peptide Night Cream](/products/peptide-night-cream).

## How strong is the evidence?

- **Matrixyl (Pal-KTTKS):** good — published placebo-controlled human data plus supplier studies.
- **Matrixyl 3000:** moderate — long track record, human data mainly from the supplier.
- **Matrixyl synthe'6 and SYN-COLL:** promising — mostly supplier in-vitro and small in-vivo studies.

Across the category, effects are **gradual**. Studies typically measure changes at 8–12 weeks, and they're measured in percentages of wrinkle depth — not transformations.

## Signal peptides vs retinoids

Signal peptides and retinoids are often compared because both support collagen. They're better thought of as partners:

| | Signal peptides | Retinoids |
| --- | --- | --- |
| **How they work** | Mimic matrix fragments to prompt repair | Bind nuclear receptors that change gene expression and cell turnover |
| **Irritation** | Very low | Common at first (dryness, flaking) |
| **Sun sensitivity** | No | Increases sensitivity — use SPF |
| **Evidence** | Moderate, mostly smaller studies | Extensive, including prescription-strength trials |
| **Pregnancy** | Limited data — ask your doctor | Avoid |

If your skin tolerates retinoids, using both covers more ground. If it doesn't, signal peptides are a gentle way to keep supporting the matrix.

## Frequently asked questions

**Are "collagen peptides" in supplements the same thing?**
No. Oral collagen peptides are larger protein fragments that are digested before absorption. Topical signal peptides are short, specific sequences designed to act on skin cells.

**Is more Matrixyl better?**
Not necessarily. Suppliers recommend use ranges based on their testing; beyond that, more peptide doesn't reliably mean more effect.

## Getting the most from signal peptides

1. **Use them twice daily.** Consistency is everything.
2. **Pair with sunscreen.** Signal peptides support repair; UV protection reduces the damage in the first place.
3. **Combine with a retinoid** if your skin tolerates it — they work through different pathways and are a classic pairing.
4. **Be patient.** Give any peptide product at least three months.

## The bottom line

Signal peptides are biomimetic messages that ask your fibroblasts to maintain the matrix. Matrixyl started it all and still has some of the best human evidence; its successors broaden the approach. Our [Matrixyl 3000 Serum](/products/matrixyl-3000-serum) is a great single-peptide starting point — or go broad with [Multi-Peptide 12](/products/multi-peptide-complex).`,
  },
  /* ------------------------------------------------------------------ */
  {
    slug: "beginner-peptide-routine",
    title: "Your first peptide routine: a 12-week plan for beginners",
    category: "Routines",
    author: LAB,
    featured: false,
    publishedAt: daysAgo(9),
    excerpt:
      "New to peptides? Here's exactly what to use, when to use it, and what to expect week by week over your first three months.",
    seoDescription:
      "A simple 12-week peptide routine for beginners: which peptide to start with, morning and evening steps, and what to expect week by week.",
    body: `Peptides are one of the friendliest actives for beginners — they're gentle, compatible with almost everything and don't need a careful "build-up" like retinoids. But with so many to choose from, it's easy to overthink it. Here's a simple, realistic 12-week plan.

## Step 1: pick one goal

Peptides work best when matched to a concern. Choose your **main** priority:

- **Overall firmness, texture and "skin quality"** → [GHK-Cu](/peptides/ghk-cu) or [Matrixyl 3000](/peptides/palmitoyl-tripeptide-1)
- **Expression lines** (forehead, frown lines, crow's-feet) → [Argireline](/peptides/acetyl-hexapeptide-8)
- **A bit of everything, one bottle** → a multi-peptide serum
- **Uneven tone** → [Nonapeptide-1](/peptides/nonapeptide-1) with niacinamide

If you genuinely can't decide, our [Peptide Discovery Set](/products/peptide-discovery-set) lets you try five, or use the [Routine Builder](/routine-builder).

## Step 2: build the routine

You only need four or five steps. Here's the template:

**Morning**
1. Gentle cleanser (or just water if your skin is dry)
2. Peptide serum
3. Moisturiser
4. **Sunscreen SPF 50+** — non-negotiable

**Evening**
1. Cleanser (double cleanse if you wore sunscreen or makeup)
2. Peptide serum
3. Moisturiser or night cream

That's it. If you already use a vitamin C or retinoid, see our [layering guide](/learn/how-to-layer-peptides) — the short version is that copper peptides should be kept apart from pure vitamin C and strong acids.

## Step 3: the 12-week timeline

| Weeks | What to do | What to expect |
| --- | --- | --- |
| **1–2** | Use your serum once a day (evening). Patch test first. | Skin feels hydrated and comfortable. No visible change yet — that's normal. |
| **3–4** | Increase to twice daily. | Smoother texture; makeup may sit better. |
| **5–8** | Keep going. Take a photo in the same light as day one. | Early softening of fine lines for some people; skin may look more "rested". |
| **9–12** | Compare your photos. | This is when studies typically measure results — gradual improvement in fine lines, firmness or tone. |

## Step 4: track your progress honestly

Peptide changes are subtle and gradual, so it's easy to miss them — or to imagine them. A few tips:

- Take photos in the **same spot, same light, same time of day**, without makeup.
- Note how your skin **feels** too: resilience, comfort, how it handles a late night.
- Change **one thing at a time**, so you know what's working.

## Common beginner mistakes

- **Using five peptide products at once.** More isn't better. One or two well-chosen products beats a shelf full.
- **Stopping at week three.** Peptides are slow. Give them a full 12 weeks.
- **Skipping sunscreen.** Daily UV exposure will undo more than any serum can build.
- **Mixing copper with vitamin C in the same routine.** Morning vitamin C, evening copper.
- **Expecting injectable results.** Topical peptides are about steady, natural-looking improvement.

## Three ready-made beginner routines

**"Just tell me what to buy"**
- AM & PM: [Multi-Peptide 12 Complex](/products/multi-peptide-complex) → moisturiser (→ SPF in the morning)

**"I care most about firmness"**
- AM: [Matrixyl 3000](/products/matrixyl-3000-serum) → moisturiser → SPF
- PM: [GHK-Cu Serum](/products/ghk-cu-copper-peptide-serum) → [Peptide Night Cream](/products/peptide-night-cream)

**"It's my forehead lines"**
- AM & PM: [Argireline 10%](/products/argireline-10-serum) → moisturiser (→ SPF in the morning)
- Add [SNAP-8](/products/snap-8-serum) after a month if you want to go further.

## Budget-friendly options

You don't need every product to start. If you're watching your spend:

- Choose **one serum** and use it twice a day — that's the single biggest factor.
- Keep your **cleanser and moisturiser simple**; they don't need to contain peptides.
- Spend the rest on a **sunscreen** you'll actually wear every day.
- Consider a **kit or set** once you know what you like — they're better value than buying individually.

## Beginner FAQs

**Can I use peptides if I have acne-prone skin?**
Yes. Peptide serums are typically lightweight and non-comedogenic. Pair them with your usual acne actives (keeping copper peptides apart from benzoyl peroxide and strong acids).

**Do I need to "purge" with peptides?**
No. Peptides don't speed up cell turnover the way retinoids and acids do, so purging isn't expected. If you break out, it's more likely a reaction to another ingredient or the texture — stop and reassess.

**Can I start peptides in my 20s?**
Absolutely. Peptides are gentle enough for preventative use, though sunscreen remains the most important anti-ageing step at any age.

## After 12 weeks

If you're happy, keep going — peptide benefits are maintained with continued use. If you want more, add a second peptide class (for example, a signal peptide alongside your expression-line peptide), or introduce a retinoid slowly at night.

## The bottom line

Pick one goal, choose one peptide product that targets it, use it twice a day with sunscreen, and give it twelve weeks. It's the simplest — and most effective — way to start.`,
  },
];

export const seedArticles: SeedArticle[] = drafts.map((d) => ({
  ...d,
  coverImage: `/images/articles/${d.slug}.webp`,
  readMinutes: readMinutes(d.body),
  published: true,
}));
