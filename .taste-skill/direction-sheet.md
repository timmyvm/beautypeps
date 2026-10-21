# DIRECTION SHEET — The specimen catalogue
seed 1073179091 · drawn 2026-10-21 · sector ecommerce
Brief: Beauty Peps: Melbourne small-batch cosmetic peptide serums (GHK-Cu, Matrixyl, Argireline) with published concentrations and an evidence-graded peptide library

| | |
| --- | --- |
| Direction | The specimen catalogue |
| Hero | Statement beside specimen mosaic |
| Type | Chillax |
| Colour | Report blocks |
| Sections | showcase (Frame run, one lifted) → list (Object riding down the schedule) → how-it-works (Tiles that grow) → testimonial (Quotes on paper slips) → faq (Tabbed index cards) → footer (A footer of tiles) |
| Motion | Shutter image |
| Photographs | the "Plants and flowers" set, as atmosphere |

This is the direction for this build. Adopt it. Do not blend it with the layout you would have made anyway,
and do not redraw because it is unfamiliar: unfamiliar is the point. Redraw a slot only when it conflicts
with a stated brand constraint or needs an asset that does not exist, and say why in your report.

The parts of this sheet were written separately and will disagree in small ways. Settle every disagreement in this order:
**house rules** (including type no smaller than 13px and body text of 16px or more) → **the direction** (the idea, the composition habits, where the
one accent goes) → **the type system and the palette** (which face does which job, the five size steps, which colour is the ground and where the
accent goes) → **the hero blueprint** → **the section blueprints**. Under each blueprint below, "Adjusted for this page" lists where it disagrees.
In practice: take geometry from blueprints (columns, proportions, what sits where) and take everything else from above them. Map every size a
blueprint names onto one of your five type steps instead of adding a sixth. Use one button shape, one corner radius and one pair of page margins on
the whole page, whatever individual blueprints say. If a blueprint names a kind of typeface (a light serif, a heavy grotesk), use the dealt face.

## 1. The idea
Present what is on offer the way a field guide presents birds: each item alone on a flat colour, same scale, same angle, named plainly. A bakery's pastries become specimens and the specimens become the menu. A furniture maker's chairs each get their own colour tile. The format flatters ordinary objects because it treats each as worth looking at, and it replaces both the feature grid and the product-card grid with something that has a point of view.

Before anything else, write one sentence in your notes: "On this page, <the subject's own material> becomes <the device>."
Fill the first blank from your inventory of what only this client has (its name and what it means, its street, its numbers, its
constraint), then put the nearest competitor in the sentence: if it still works, the idea is the category's, not the client's.
Then name the one live thing the visitor can do on the page (SKILL.md step 4).

## 2. Composition
Hero: a left-aligned statement of what this is (5–7vw, upper-left) beside or above a tight cluster of four to seven specimen tiles of different sizes arranged as a loose mosaic that runs off the right edge. Each tile is a flat colour square or 4:5 rectangle with one photograph centred on it, no border, 8–12px gaps. The main section is the catalogue itself: a grid of tiles in which each item has its name and one fact set beneath the tile in the text face, aligned left to the tile edge. Tile colours rotate through three or four fields from the palette. One tile in every six or seven is double size. Supporting sections (about, how to order) are plain text on the ground colour, kept short.

## 3. Type — Chillax
A soft geometric sans with wide round letters and relaxed joins, warm at semibold and easy at text size. Suits consumer apps, community products, cafes and small friendly brands.
```html
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=chillax@400,500,600&display=swap" rel="stylesheet">
```
- Display: **Chillax** — weight 600 · tracking -0.03em · leading 1.0 · sentence case
- Text: **Chillax** — 400 for body, 500 for emphasis · leading 1.5 · tracking 0
```css
:root {
  --step-small: clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem);
  --step-body: clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem);
  --step-lead: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  --step-head: clamp(2rem, 1.3rem + 3.2vw, 4rem);
}
```
Friendly and plain. Item names at 18–22px in medium weight, facts beneath in the soft ink. One big statement in the hero; no other display type.
The direction decides sizes and how many of them; the type system decides how this face is set. Where the two give different tracking or leading, use the values of the type system: they are tuned to this face.
The display size itself comes from the hero blueprint below.

## 4. Colour — Report blocks
```css
:root {
  --bg: #ffffff;
  --surface: #f6f6f6;
  --ink: #000000;
  --muted: #5f5f5f;
  --accent: #fe7141;
  --accent-ink: #000000;
  --field-1: #fe7141;  --field-1-ink: #000000;
  --field-2: #d1ddd3;  --field-2-ink: #000000;
  --field-3: #f0ff1c;  --field-3-ink: #000000;
  --field-4: #000000;  --field-4-ink: #f4f4f4;
}
```
A white base with flat blocks of orange, sage, acid yellow and black assigned to whole modules: figure tiles, quote panels and chapter bands. Text is black on every colour and off-white on black, and orange is also the button colour.
The tiles are the colour: three or four flat fields from the palette, repeated in a steady rotation. Ground stays neutral.

## 5. Imagery
**Use the images that belong to the project in every picture slot.** For slots they cannot fill, real pictures of the subject's world from the open collections come next (start with `node /home/user/beautypeps/.claude/skills/design-taste-frontend/scripts/assets.mjs "peptide library"`, then queries from your inventory (its street, its materials, its trade's tools and history); credit them on the page), then the dealt photographs.

Photographs of single items on plain backgrounds, all cropped to sit at the same apparent size within their tile. On light tiles, `mix-blend-mode: multiply` removes white studio backgrounds. If the subject's own item photographs are missing, use the dealt set and say so.

**Floor (the inspector checks it):** at least four real pictures on the page, usually six to twelve; SVG drawings do not count. One moving picture where an honest clip exists: `node <skill>/scripts/assets.mjs --video "<query>"`, used as a muted loop with a poster frame. Whatever this direction says about pictures, it is carried out with real ones.

Photographs dealt for this build, from the "Plants and flowers" set (botanical close-ups, leaves and flowers)
Order of preference for imagery: (1) the project's own photographs and product shots; (2) images you generate, if an image tool is
available; (3) real pictures of the subject's world found in the open collections (assets.mjs, downloaded and credited on the page);
(4) drawings of the subject in code; (5) these. They are real photographs (Unsplash licence, served by picsum.photos) of places, light and
texture. They are atmosphere, never a stand-in for a specific product, dish, person or interface. List the ones you use in your report so
they can be replaced.
- `https://picsum.photos/id/798/1600/1000` — White daisy with a yellow and green centre on a white background · light tone · white, yellow, green · calm area: left · native landscape · photo: Aaron Burden
- `https://picsum.photos/id/940/1600/1000` — Blue-green succulent rosettes filling the frame from above · mid tone · teal green, dark green, dusty purple · native portrait · photo: Annie Spratt
- `https://picsum.photos/id/738/1600/1000` — Single white calla lily against a dark, almost black background · dark tone · near black, cream white, soft green · calm area: left · native portrait · photo: Marta Pawlik
- `https://picsum.photos/id/306/1600/1000` — White water lily with yellow centre among dark lily pads · dark tone · white, dark green, yellow · native landscape · photo: Schicka
- `https://picsum.photos/id/248/1600/1000` — Round cactus in a pot seen from above, softly blurred · mid tone · sage green, warm tan, soft pink · calm area: top · native landscape · photo: Oliver Pacas
- `https://picsum.photos/id/492/1600/1000` — Field of dandelion seed heads backlit beneath a bright sky · mid tone · pale blue, dark green, white · calm area: top · native landscape · photo: Jason Long
- `https://picsum.photos/id/400/1600/1000` — Green plant with tight flower buds against a dark teal background · dark tone · emerald green, dark teal · calm area: right · native landscape · photo: John French
- `https://picsum.photos/id/239/1600/1000` — Hand holding a dandelion seed head against a dark background · dark tone · black, white, dark green · calm area: left · native landscape · photo: Coley Christine
The last two path numbers are width and height: request the exact crop you render (`/1200/1500` for a 4:5 portrait, `/2400/1350` for a hero) and
add `?grayscale` to desaturate. Use three to six of them, not all eight. Always set `width`, `height`, `alt` and `loading="lazy"` (not on the hero image).
Other sets that fit this brief: hands-and-making, field-and-farm, interior-and-table, object-still — `node draw.mjs --photos <set>` prints one in full; `--photos list` shows all sets. Taking photographs from another set is your call and is not a redraw; keep them to one light and one treatment.

## 6. Hero — Statement beside specimen mosaic
The viewport is split 50/50 by tone alone: the left half is the page ground, the right half a field one step darker, meeting at a clean vertical edge with no line. Left half: the wordmark at 22px sits top-left on a 32px margin; under it the statement at clamp(44px, 4.4vw, 68px), bold, tracking -0.04em, leading 1.0, top-left aligned and filling the upper 40% of the half. The lower part of this side stays empty except for one supporting sentence at 18px pinned bottom-left and the single action as a solid rectangle beside it. Right half: a loose mosaic of seven specimen tiles on a 4-column, 3-row grid with 14px gaps. Each tile is a flat palette colour at 3:4 holding one cut-out item, centred, object-fit: contain, mix-blend-mode: multiply. Five cells are left empty so the tiles stagger; one tile spans two columns and two rows; the rightmost column is cropped by the viewport edge. Two text links sit top-right over the darker field. The right half may be position: sticky while the left scrolls.

On a phone: The split becomes a stack. The statement comes first at 10.5vw on two lines inside 20px margins, the supporting sentence under it at 16px, then the action. Below, the darker field runs full width and the mosaic becomes two columns of tiles, the right column started 48px lower than the left; five tiles show and the last row is cropped by the bottom of the screen. Navigation is the wordmark and one link.
Headline: A 3-5 word statement of what is on offer, at most 28 characters so it holds two lines at 10.5vw on a phone.

Adjusted for this page:
- It sets a sentence large over several lines: jurors read that as a long headline. Either cut it to a two-line headline at display size, or keep it a statement at 36px or less on three lines (24px, four lines on a phone).

## 7. Sections, in order
Each is a composition to rebuild with this project's content. Keep the geometry; change the subject. Re-order or drop a
section when the argument of the page needs it (see references/copy.md), never to fall back to a card grid.

### 1. showcase — Frame run, one lifted (strip)
Columns 1–3 are a nearly empty column: the heading (two to four words at 24–28px) at the top, a link under it, and one or two short notes at 15px much further down, each level with the frame it describes. Columns 4–12 hold a run of six to eight frames of the same subject at one fixed height of 30vh, with natural widths and 6px gaps: the whole view, a tight crop of the same thing, a detail, the reverse side. The run is allowed to leave the right edge. One frame is lifted out of the row: shown at 2.2 times the row height with its bottom aligned to the row's bottom (flex row, align-items: end), so it stands above the others. Under each frame, at 15px: a name on the left and a single fact on the right. Square corners, no captions on the images.
On a phone: The heading and link sit on top. The lifted frame comes first at full width. The rest of the run scrolls sideways beneath it at a fixed height of 34vw with 4px gaps and scroll-snap, bleeding off the right edge. Notes are listed under the run at 15px.

### 2. list — Object riding down the schedule (table)
A schedule of dated events (races, concerts, tastings, departures) with the subject's own object travelling down it. On a dark flat ground, on the page's own margins, the heading is one centred line of condensed capitals at clamp(40px, 3.6vw, 56px), split into its two words with a gap between them, and in the gap stands a cut-out photograph of the object seen from above or in profile, about 320px wide (22% of the width) and up to 64% of the viewport tall. Below come full-width rows 84px tall, each a two-part grid: the event's name at 26px in condensed capitals on the left with a one-line note at 16px in the soft ink under it, and the date and place right-aligned at 16px on the note's baseline. Rows alternate between the ground and a tone one step lighter instead of rules. As the page scrolls, the object leaves the heading and moves down the centre line over the rows (`position: sticky` in a centred column that spans the list, `pointer-events: none`), where it covers only the empty middle of each row and marks how far the reader has come. The row for the next event takes the accent colour across its whole band, with its name and date in the accent's ink. About ten rows fit on one screen; the list ends 120px under the last row.
On a phone: Rows stack at full width on 20px margins: the name at 22px on up to two lines, the note at 16px, the date under the note. The object shrinks to 40% of the width and stays in the heading; it does not travel, because on a phone it would cover the rows. The accent band stays on the next event.

Adjusted for this page:
- It names a kind of typeface: use the dealt faces (display Chillax, text Chillax) and their settings; capitals only where the type system sets them.
- It draws lines or borders: keep them only inside a table, a form or a `data-ui` fragment; elsewhere separate with space or a change of ground.

### 3. how-it-works — Tiles that grow (grid)
Order is carried by size. Three flat colour tiles stand in one row, bottom-aligned (align-items: end) with 10px gaps, each larger than the one before: columns 1–3 at 30vh tall, columns 4–7 at 44vh, columns 8–12 at 60vh. Each tile holds one photograph of the subject at that stage (raw, in progress, finished), centred and scaled so the object grows from tile to tile; on light tiles mix-blend-mode: multiply removes a white studio background. One palette colour per tile. Text sits under the tiles, outside them, aligned to each tile's left edge: a stage name at 20px medium whose wording carries the order ('Picked', 'Pressed', 'Poured') and two lines at 16px in the soft ink. The heading, two to four words at 40–52px, occupies the empty ground above the two smaller tiles, top-aligned with the tallest tile. A fourth stage is possible with spans of 2, 3, 3 and 4 columns.
On a phone: Tiles stack in order and grow in height instead: 34vw, 46vw and 62vw tall, each at full width. The name and text sit under each tile at 18px and 16px. The heading comes first at 30px. 28px between stages.

### 4. testimonial — Quotes on paper slips (strip)
A heading of two to four words at about 3vw sits top-left in columns 1–6. Beneath it three paper slips fan across columns 2–11 on a contrasting flat ground: each is a filled paper-coloured panel about 300px wide, of three different lengths (440, 520 and 600px), rotated −4, 2 and 5 degrees and overlapping its neighbour by roughly 40px. The top and bottom edges of each slip are zigzag tears cut with `clip-path: polygon()`. On a slip, from the top: the speaker's name centred at 18px bold, the role on one line, a square greyscale photograph of the speaker 120px wide, then the quotation at 16px in the text face, left-aligned with 24px padding. The longest slip runs past the bottom of the section, which clips it with `overflow: hidden`, so the slips look freshly printed rather than laid out as cards.
On a phone: One slip per row, each 78% of the screen wide and kept rotated by two or three degrees in alternating directions, the first hugging the left margin, the second the right, each overlapping the one above by 32px. The heading sits above at 8vw on two lines.

### 5. faq — Tabbed index cards (stack)
Questions are filed like cards in a drawer. A heading of two to four words at about 4vw sits in columns 3–10. Beneath it, in the same columns, five or six filled panels are stacked so that each overlaps the one above, leaving 96px of every card showing. Each card has a tab on its top edge, 200px wide and 40px tall, stepping right by 150px per card, cut with `clip-path: polygon()` so card and tab are one filled shape. The cards rotate through two or three palette colours. The tab carries the topic in one or two words at 16px; the visible strip under it shows the question at 20px medium. Choosing a card expands it to show the answer at 17px over at most 50ch and pushes the cards below it down. One card is open at a time; the first is open on load.
On a phone: Cards run full width with the same overlap, 88px of each showing. Tabs shrink to 120px wide and step right by 48px per card. The open card expands in place with its answer at 16px and 20px padding, and the heading leads at 9vw.

### 6. footer — A footer of tiles (grid)
The footer is the last two rows of a board: filled tiles with 8px gaps and 8–12px outer margins, every cell used. Upper row, each tile 220px tall: a statement tile in columns 1–4 with one sentence at 24px top-left and the legal text at 12px bottom-left; a navigation tile in columns 5–7 with a plain list at 16px; a tile in columns 8–9 giving the city and local time as text; an email tile in columns 10–12 with the address at 20px as a link, bottom-left. Lower row, 320px tall: a tile in the ink colour spanning columns 1–8 with the wordmark set large (about 9vw) and centred, and a tile in the accent colour in columns 9–12 with a two-to-four-word invitation top-left at 28px and an arrow, drawn as inline SVG with 4px strokes, in its bottom-right corner; the whole accent tile is a link.
On a phone: Two columns of tiles with 6px gaps: the wordmark tile full width first at 160px tall, the accent tile full width next, then navigation and email side by side, then time and statement. Every tile keeps 20px padding and top-left text.

Adjusted for this page:
- It sets text at 12px: use your small step (13px or more) instead.

## 8. Motion — Shutter image
The one hero or showcase image opens from an edge with a clip-path over about 1.1 seconds while the picture inside settles from 1.12 scale to rest. Use it once, on the image that matters most; later images simply are there. Recipe: 'Image shutter' in references/motion.md.
This is the signature move, the one loud moment. Around it the page still needs the rest of the motion layer (SKILL.md step 9): an entrance for the parts of every section, feedback on every control, and one moving picture. The inspector fails a page that barely moves. Recipes: references/motion.md.

## 10. Where the richness comes from
Rhythm of colour tiles and the pleasure of comparing like with like.

## 11. How this direction goes wrong
It needs at least six items that can be shown as objects; with three it is a feature row. Keep labels outside the tiles. No shadows under the objects, no hover lift.

## 12. Real references
Studied sites that work this way. Take the principle, never the specifics: no names, copy, images or signature assets of theirs.
- **Noho** (Awwwards Site of the Day, studied score 8) `aww-noho`
  Idea: Furniture sold through people misusing it (wearing, balancing on, hiding behind chairs on flat colour backdrops) while the interface stays quiet beige.
  Hero: The viewport splits exactly 50/50 by tone alone: left half warm off-white, right half a slightly darker greige, no rule. Left: a small lowercase logo top-left at 30px margin, then a four-line bold headline at 60px (4.2vw), tracking -0.04em and leading near 1.0, top-left aligned and filling the upper 40%; the lower half is empty except for a one-line 18px tagline pinned bottom-left. Right: a staggered mosaic of seven portrait photos, each about 175 by 230px with 15px gaps, on a four-column, three-row grid with several cells left empty and the rightmost image cropped by the viewport edge. A white square menu button sits top-right.
  Worth taking: Split the hero 50/50 by background tone alone, park the headline top-left and one tagline bottom-left, and fill the other half with a staggered photo mosaic that leaves grid cells empty.
- **Madie** (One Page Love, studied score 7.2) `opl-madie`
  Idea: A burgundy-and-cream bakery brand in which the madeleines themselves, cut out like specimens, become the menu.
  Hero: A dark, warm photograph (iced coffee with a logo sticker and a glazed madeleine on a wooden counter, burgundy tiles behind) fills a rounded-corner frame inset 20px from every edge on a cream page; the subject sits right of centre. In the left column, starting 42% down: a small star-rating line, then a three-line uppercase headline at 5vw in a heavy geometric sans, the first two lines outline-only and the third solid cream, a three-line paragraph, and a row with a pink pill button and an underlined text link. Top-left: menu icon and script logo. Top-right: a three-language pill toggle. Bottom-right: a circular text badge.
  Worth taking: Set a headline with its first lines as outline strokes and the last line solid, so emphasis falls on the final phrase without a size change.
- **Aardvark Book Club** (Awwwards Site of the Day, studied score 7.7) `aww-aardvark-book-club`
  Idea: A book club dressed as a sweet shop: fat black type, tumbling 3D books and boxes on wavy colour fields, annotated with handwritten asides.
  Hero: A saturated yellow field with two large wavy blobs, pale yellow then orange, rising from the bottom. A three-line headline in Champ Bold, black, at about 8.3vw with leading under 0.85, is flush to a 15px left margin and reaches 60% across. Beneath it: a four-line paragraph 310px wide and a magenta split button (label plus arrow square). Right of centre a 3D hardback in navy and pink tilts 20 degrees, 600px tall; another book is cropped by the top-left corner, a third by the bottom edge. A purple handwritten note sits rotated at far right. Nav: pale-yellow pill links centred, an orange login button, black round social icons.
  Worth taking: Give each section one flat saturated colour inside a large-radius inset panel and keep the type black across all of them.
Full notes on any of them: `node draw.mjs --site <id>`.

## Always
Headlines two lines or fewer at every width. No eyebrow labels, no monospace, no 01/02/03, no thin rules, no gradients, no shadows at rest,
no cream-and-terracotta, no violet. The frame: one h1 on the first screen that says what this is, equal outer margins, no
section huddled on one side with the other half empty, no blank stretch over half a screen, a heading on every section.
`inspect.mjs` measures all of it.

Saved to /home/user/beautypeps/.taste-skill/direction.json · reprint with `node draw.mjs --show`
