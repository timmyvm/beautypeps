# Beauty Peps redesign — working notes (tasteskill v2)

Reading of the brief: "run the redesign" = full redesign of the public site (home first, then every
storefront and education page) under the dealt direction; account + admin are app screens and get the
app-screen rules (tokens, type, no ornaments), not a page rebuild.

## Inventory (only this client)
1. The logo's three linked circles = a tripeptide (Gly-His-Lys, the GHK in GHK-Cu, the flagship).
2. Sapphire blue — copper turns the GHK-Cu serum blue; it is not a dye.
3. Brushed-copper collars and travertine plinths in every product photograph (same angle, scale, light).
4. Published concentrations: 1% GHK-Cu, 10% Argireline, 8% Matrixyl 3000, 12% total in Multi-Peptide 12.
5. An evidence grade 1–5 published for every peptide (The Ordinary prints % but grades nothing).
6. Sequences + molecular weights; the ~500 dalton rule.
7. The 4–12 week window studies measure in.
8. Melbourne, small batch.
9. Bank transfer / PayID with the order number as reference; Australia Post; free over $150.
10. Pure actives: freeze-dried powders in amber vials, 2–8 °C.
11. 13 peptides, 4 classes, 18 formulas.

## Argument (home)
1. Beauty Peps makes peptide serums; each is shown plainly, like a specimen. → hero: statement + specimen mosaic
2. All 18 formulas, each with its peptide, % and grade, filterable by what you treat. → catalogue (live thing)
3. GHK-Cu is blue because of copper. → frame run of the blue/copper things
4. Every peptide has a graded monograph. → the library list (13 rows, grade at right)
5. Powder → serum → skin, over 8–12 weeks. → tiles that grow
6. Customers' notes (real approved reviews from the DB). → paper slips
7. Practical answers: results, layering, payment, shipping, returns, formulators. → index cards
8. Close: what it is, where, how to reach, the routine builder. → footer tiles

## Direction
specimen-catalogue, seed 1073179091. Chosen over contact-sheet / pinned-poster because the
product photography already is specimen photography (same plinth, angle, light) and the Peptide
Library already is a field guide (one entry per peptide, named plainly, graded).

Palette: dealt "Report blocks" proportions kept (white ground, one-step surface, black ink, one
accent that is also the button, four tile fields in rotation), colours taken from the subject:
accent/field-1 = GHK-Cu sapphire #1f4ab0, field-2 = frosted glass #dde4e8, field-3 = travertine
stone #e2dfda (low chroma), field-4 = ink #111. Orange/acid yellow fought the material.
Type: Chillax as dealt (self-hosted, 400/500/600). Logo kept as the brand's own asset (Higgsfield wordmark).

## Idea
On this page, the evidence grade we publish for every peptide becomes the field-guide entry under
each specimen: every bottle stands alone on its own colour tile, named plainly, with its concentration
and how sure the science is.
Competitor test (The Ordinary): they print % but publish no evidence grades → the sentence fails for them.

## Live thing
"What are you treating?" — nine concern chips over the catalogue; choosing one narrows the guide to
the formulas that address it and names the peptide doing the work, its % and its grade. Chips are real
links to /shop?concern=… so it works without script. Wraps on a phone (no sideways row).

## Copy deck (home)
H1: Peptide serums, graded
Support: Small-batch serums made in Melbourne from 13 cosmetic peptides. Every label prints the
concentration; every peptide carries an evidence grade from 1 to 5.
Action: Shop serums
Catalogue H2: All 18 formulas · "Pick what you're treating and the guide narrows to the formulas that address it."
Frame run H2: Blue by copper · notes: "The blue is the copper ion bound to the peptide, not a dye." /
  "Use it at night, apart from vitamin C and strong acids."
Library H2: The peptide library (split around the vial)
Tiles H2: From powder to skin · Weighed / Dissolved / Applied
Slips H2: In their words
FAQ H2: Before you order
Footer: "Cosmetic peptides, dosed in full and graded honestly. Made in Melbourne." · Melbourne time ·
  hello@ · wordmark · "Build your routine →"

Sample content to confirm before launch: "made in Melbourne / small batch" claims, reviews (seeded demo),
bank details, ABN.

## Gate + look (home)
Before (old build, inspect.mjs): 16 FAIL, 9 WARN — 3-line headlines, 13 eyebrows, 01–04 numbering,
22 micro-labels, gradients, 18 hairlines, 22 outlined boxes, icon cards, 2.2:1 text, 14px body, still page,
reduced-motion hidden text; WARN cream palette, glass, 11 sizes, grey body, no footage.
After: 0 FAIL, 2 WARN (both defended below), at 1440 / 768 / 390.
- empty-middle "Blue by copper": measured in the frames that bleed off the right edge (the probe clamps
  boxes to the viewport); on screen the run is continuous, as the blueprint asks.
- card-rows: the catalogue is the direction's archive of specimens (an index is where a repeated module belongs).

Redraws: none. Palette colours taken from the product (see Palette above); proportions kept.
Imagery: project's own (Higgsfield product shots → Higgsfield background-removed specimens; editorial
photos; one Kling clip of the copper serum, /video/copper-drop.mp4). No open-collection pictures used.

ROUND 1
Seen in one second: the blue GHK-Cu bottle on its stone tile, "Peptide serums, graded".
Scores: design 7.5 · usability 8 · creativity 7.5 · content 8 → 7.7
1. Hero statement undersized for its half (68px) → 5.9vw (85px).
2. Catalogue ended on a ragged row (3 double tiles = 27 cells) → 2 doubles.
3. Cropped last mosaic column read as a black bar → 112% width, quieter tones.

ROUND 2
Scores: design 8 · usability 8 · creativity 8 · content 8 → 8.0
1. Footer nav labels wrapping mid-phrase, email breaking inside the domain → wider tiles, break at @.
2. Void beside the lifted frame in "Blue by copper" → the two notes moved into it, above the row.
3. Display headings with leading 1 overhung their section tops → 12px top padding.

ROUND 3 (final)
Seen in one second: the sapphire GHK-Cu specimen beside "Peptide serums, graded".
Idea: the evidence grade we publish for every peptide becomes the field-guide entry under each specimen.
Live thing: "What are you treating?" chips narrow the catalogue (no-JS fallback: /shop?concern=…).
Layout words: hero=split mosaic / catalogue=grid / copper=strip / library=table / powder=growing tiles /
reviews=slips / faq=stacked cards / footer=board.
Scores: design 8 · usability 8 · creativity 8 · content 8 → 8.0
Caps applied: none.
Still short: 1. the hero's left-half rest is long on very tall screens; 2. catalogue fact lines (14px,
muted) are the smallest text on the page; 3. the reviews section shows seeded demo reviews until real ones exist.

## Whole site: inspector before (old build) → after (final production build), FAIL / WARN
| Page | Before | After |
| --- | --- | --- |
| / | 16 / 9 | 0 / 2 (both defended above) |
| /shop | 9 / 9 | 0 / 2 |
| /products/ghk-cu-copper-peptide-serum | 13 / 9 | 0 / 0 |
| /search?q=copper | 10 / 9 | 0 / 2 |
| /cart | — | 0 / 2 |
| /track | 8 / 7 | 0 / 2 |
| /contact | 9 / 7 | 0 / 2 |
| /peptides | 14 / 10 | 0 / 0 |
| /peptides/ghk-cu | 10 / 9 | 0 / 1 |
| /science | 13 / 8 | 0 / 0 |
| /compare | 13 / 7 | 0 / 2 |
| /routine-builder | 10 / 7 | 0 / 1 |
| /learn | 10 / 7 | 0 / 2 |
| /learn/what-are-peptides | 11 / 9 | 0 / 2 |
| /glossary | 13 / 10 | 0 / 2 |
| /faq | 9 / 9 | 0 / 3 |
| /about | 12 / 8 | 0 / 1 |
| /policies/shipping | 8 / 6 | 0 / 1 |
| /login, /register, /forgot-password | — | 0 / 2, 0 / 3, 0 / 2 |
| admin overview / orders / order detail (inspect --app) | 4/4, 5/2, 4/5 | 0/0, 0/0, 0/0 |
| /account (inspect --app) | 2 / 5 | 0 / 2 |

Remaining WARNs are of four kinds, each defensible: no-footage on pages where the one real clip
(the copper serum) would not be about the subject; still-page on short task pages (12–14 moving
elements, warn below 16); card-rows where the catalogue/specimen grid is the archive; first-action on
/register and /glossary (the button ends a five-field form; a glossary has no primary action).

App screens (account, admin) dealt their own app style: achromatic-ledger, seed 1969225264,
--keep palette,type.

Regression on the final build: 104 routes × 2 widths × (public, customer, admin) all 200 with no
console errors or phone overflow; end-to-end guest checkout → tracking → admin paid/shipped →
customer sees tracking → register links guest order: pass.
