# Cozy Salon — NEXT art tasks for ChatGPT

Read `salon/sprites/PROMPTS.md` → section **RULES** first. Every rule there still applies
(1536x1024 PNG, flat magenta #FF00FF, 3x2 grid of 512 cells, same chibi style as
`salon/sprites/sheets/mira_ref.png`, commit straight to `main` in `salon/sprites/sheets/`,
don't touch any other file).

Extra rules for this round:
- Leave at least 40 px of empty magenta around every drawing inside its cell (nothing may touch the cell edges).
- Use `mira_ref.png` as the style reference for EVERYTHING (outline colour/thickness, shading, palette softness).
- Do the tasks in order. Commit after each task. Write the task letter in the commit message, e.g. `art(salon): task B stations`.
- When a task is finished, tick it here by changing `[ ]` to `[x]` in this file (this file is the only non-image file you may edit).

Status: Mira, makcik, remaja, vip, seleb are DONE and look great — don't redo them.

---

## [x] Task A — Redo guest "biasa" (she looks too much like Mira)
Mira has long brown wavy hair, so biasa must look clearly different.
New design: young woman ~25, SHORT straight black bob with straight bangs, mint-green blouse, beige skirt, white flats, small tote bag.
Replace these three files with the same layouts as in PROMPTS.md (BATCH 2–6):
`guest_biasa_ref.png`, `guest_biasa_walk.png`, `guest_biasa_pose.png`
(`pose` = Row 1: side_walk1, side_walk2 facing right, after (front, super happy, NEW hairstyle: wavy shoulder-length with a hair clip, sparkles). Row 2: sit, angry, chair.)

## [x] Task B — Salon stations → `stations.png`
Props only, no people, 3/4 view facing slightly right, the same size as each other, chair seats at about the same height. Each prop is roughly as tall as Mira.
- Row 1: **wash** — white shampoo sink with a reclining sky-blue chair; **cut** — pink styling chair with a round wall mirror behind it and a small shelf with combs; **color** — lavender styling chair with a little trolley of dye bowls, brushes and colour bottles.
- Row 2: **style** — butter-yellow chair under a big hood hair dryer on a stand; **pay** — cute wooden cashier counter with a pastel register, a receipt and a flower vase; **coffee** — small brown espresso machine on a little round side table with two cups.

## [x] Task C — Need icons → `icons_a.png`
Chunky round game icons (like mobile game UI), one per cell, each on a soft circular badge with a thick plum outline, filling about 70% of the cell:
- Row 1: wash (bubbles + shampoo bottle), cut (scissors), color (paint palette / dye brush)
- Row 2: style (blow dryer with wind), pay (coin pouch), coffee (steaming cup)

## [x] Task D — UI icons → `icons_b.png`
Same badge style as Task C but **no badge circle** (just the object, thick outline):
- Row 1: gold coin, yellow star, red heart
- Row 2: broken heart, hourglass, small gold crown

## [x] Task E — Small icons → `icons_c.png`
Same style as Task D (no badge):
- Row 1: phone camera (influencer), lightning bolt (impatient), padlock
- Row 2: sparkle cluster, red anger mark (manga 💢 style), pink heart with sparkles (happy)

## [x] Task F — Logo → `logo.png`
Canvas 1536x1024, flat magenta background, NO grid. Big centred game logo text **"Cozy Salon"** in a chunky rounded cute font, pink and cream with a thick plum outline, a little pair of scissors and a comb crossed behind it, small sparkles. Text must be spelled exactly "Cozy Salon".

## [x] Task G — Backgrounds (NOT magenta, NOT grid, PORTRAIT 1024x1365)
Each one is an **EMPTY** salon seen from a slightly-raised front view: the back wall with two windows fills the top ~25%, the rest is open floor (no furniture, no chairs, no people, no text, no sofa). The game places stations on top, so keep the floor clean and evenly lit.
- `bg_kampung.png` — village shop: warm peach wallpaper with tiny flowers, wooden floorboards, windows showing coconut trees.
- `bg_mall.png` — KL mall salon: lavender and white walls, glossy pale tiles, windows showing city towers.
- `bg_resort.png` — Langkawi resort salon: mint walls with rattan trim, sandy-cream tiles, windows showing the sea.
- `bg_seleb.png` — celebrity studio: pink walls with gold trim and spotlights, deep plum floor.

## [x] Task H — Lounge sofas + deco → `sofas.png`
Normal RULES (1536x1024, magenta, 3x2 grid, 40 px padding, same style as `mira_ref.png`). Front view (facing the viewer, slightly from above), no people.
Each sofa is a LONG 4-seat waiting sofa, very wide and low (about 4x wider than tall), filling the cell width minus padding, with 4 visible seat cushions of equal size.
- Row 1: **sofa_kampung** — rattan/wood frame with peach floral cushions; **sofa_mall** — modern lavender velvet sofa with slim metal legs; **sofa_resort** — light rattan sofa with mint and white striped cushions.
- Row 2: **sofa_seleb** — glamorous deep-pink tufted velvet sofa with gold legs; **magazine** — small wooden magazine rack with colourful magazines; **plant** — potted monstera plant in a cream pot.
Commit as `salon/sprites/sheets/sofas.png`.

## [x] Task I — Salon helpers Aiman & Lina (same layouts as Mira in PROMPTS.md BATCH 1)
They work with Mira, so they wear the SAME salon uniform style as Mira (same apron design with the scissors pocket) but in their own colour, and must look clearly different from Mira and all guests. Same chibi proportions as `mira_ref.png`.

**Aiman** — cheerful young man ~20, the shampoo boy. Short neat black hair with a small side part, tan skin, mint-teal t-shirt, white apron, dark grey trousers, white sneakers, small towel over one shoulder.
- `aiman_ref.png` — Row 1: front, side (right), back idle. Row 2: 3/4 front, thumbs-up front, close-up head.
- `aiman_walk.png` — Row 1: front_idle, front_walk1, front_walk2. Row 2: back_idle, back_walk1, back_walk2.
- `aiman_side.png` — Row 1: side_idle, side_walk1, side_walk2 (facing right). Row 2: **wash** (side view facing right, both hands forward with shampoo foam), **coffee** (side view facing right, carrying a small tray with a steaming cup), **happy** (front, jumping, arms up).

**Lina** — friendly cashier ~28, auburn hair in a neat low bun with a pen tucked in it, light skin, peach-orange blouse, white apron, brown skirt, flats, small name badge.
- `lina_ref.png` — same layout as Aiman's ref.
- `lina_walk.png` — same layout as Aiman's walk.
- `lina_side.png` — Row 1: side_idle, side_walk1, side_walk2 (facing right). Row 2: **pay** (side view facing right, typing on a small handheld card machine, smiling), **wave** (front, waving goodbye), **happy** (front, jumping, arms up).

---
After you finish, tell the user "Cozy Salon art round done" so Claude can process the sheets.
