# Cozy Salon — Art Prompts for ChatGPT (batch by batch)

> **ChatGPT: the current to-do list is in `salon/sprites/NEXT.md`. Read it and do those tasks.**

Do ONE batch per message. Never redesign a character between batches: always look at the
reference sheet already committed in `salon/sprites/sheets/` and match it exactly.

## RULES (apply to every image)
- Original characters for "Cozy Salon" (NOT Sally from Sally's Salon, no copyrighted characters).
- Style: cute chibi 2D cartoon, about 2.5 heads tall, soft pastel colours, clean thick dark-plum outlines (#4b2f3f), soft cel shading, cozy mobile-game look. Same line thickness, head size and proportions in every image.
- Canvas exactly 1536x1024 px, PNG.
- Background: flat solid magenta #FF00FF everywhere (no gradient, no floor, no shadow, no texture).
- Grid: 3 columns x 2 rows, each cell 512x512. One full-body pose per cell, centred, feet on the same baseline (about 60 px above the cell bottom), same scale in every cell, nothing touching the cell edges.
- No text, no labels, no grid lines, no props unless the pose says so.
- SIDE views always face RIGHT.
- Walk frames: walk1 = left foot forward, walk2 = right foot forward (clear contrasting stride, arms swinging opposite).
- Commit the PNG straight to GitHub repo `azlanyusuff3/MyCozyWorld`, branch `main`, path `salon/sprites/sheets/<filename>`. Do not touch any other file.

---

## BATCH 1 — Mira the stylist (3 images, same chat)
Mira: cheerful young Malaysian hairstylist, ~22 years old, warm light skin, plum-burgundy hair in a high ponytail with a pink scrunchie, big brown eyes, rosy cheeks, pink short-sleeve top, white apron with a small scissors logo pocket, dark-purple pants, white sneakers.

1. `mira_ref.png` — turnaround reference. Row 1: front, side (facing right), back (all standing idle). Row 2: 3/4 front, happy waving front, close-up head front.
2. `mira_walk.png` — Row 1: front_idle, front_walk1, front_walk2. Row 2: back_idle, back_walk1, back_walk2.
3. `mira_side.png` — Row 1: side_idle, side_walk1, side_walk2 (facing right). Row 2: cut (side view facing right, holding scissors and comb up at head height, focused), wash (side view facing right, hands forward covered in shampoo foam), happy (front, jumping with both arms up, eyes closed smiling, small sparkles allowed).

## BATCH 2–6 — Guests (3 images each, new chat per guest is OK; attach `mira_ref.png` so the style matches)
For each guest make:
1. `guest_<id>_ref.png` — turnaround: Row 1 front, side (right), back. Row 2: 3/4 front, sitting front, close-up head.
2. `guest_<id>_walk.png` — Row 1: front_idle, front_walk1, front_walk2. Row 2: back_idle, back_walk1, back_walk2.
3. `guest_<id>_pose.png` — Row 1: side_walk1, side_walk2 (facing right), after (front, super happy with a NEW stylish hairstyle, sparkles around). Row 2: sit (sitting front view on an invisible seat, calm smile, hands on lap), angry (sitting front view, frowning, puffed cheeks, small anger mark), chair (sitting front view, eyes closed relaxed, small towel cape on shoulders).

Guests:
- Batch 2 `biasa` — young woman ~25, long dark-brown wavy hair, mint blouse, beige skirt, flats.
- Batch 3 `makcik` — friendly Malay auntie ~55, rosy-pink tudung (hijab) fully covering hair, glasses, long floral baju kurung in teal, handbag on arm. In `after` her tudung becomes a fancy new lilac draped style with a brooch.
- Batch 4 `remaja` — teenage boy ~16, messy black hair, orange hoodie, shorts, sneakers, holding a phone; impatient energy.
- Batch 5 `vip` — elegant Datin ~45, glamorous voluminous bun hair, gold-trimmed purple dress, pearl necklace, sunglasses on head, tiny crown hairpin.
- Batch 6 `seleb` — influencer girl ~20, pastel pink twin-tail hair, trendy white jacket, ring light phone in hand, star stickers on cheek.

## BATCH 7 — Stations (1 image)
`stations.png` — same style, props only, 3/4 view facing slightly right, each prop roughly the same size:
Row 1: wash (shampoo sink with reclining blue chair), cut (pink styling chair in front of a round wall mirror), color (lavender chair with a cart of dye bottles and brush).
Row 2: style (yellow chair with a hood hair dryer), pay (wooden cashier counter with register and flower vase), coffee (small brown coffee machine on a little table with cups).

## BATCH 8 — Backgrounds (4 images, NOT magenta, NOT grid)
Size PORTRAIT 1024x1365 (game screen is 3:4 portrait).
Top-down-ish 3/4 view of an EMPTY salon floor (no furniture, no people, no text): wall strip with windows in the top 25%, the rest is open floor so stations can be placed on top.
- `bg_kampung.png` — kampung kedai: warm peach wallpaper with small flowers, wooden floorboards, window showing coconut trees.
- `bg_mall.png` — modern KL mall salon: lavender/white walls, glossy light tiles, window showing city towers.
- `bg_resort.png` — Langkawi beach resort salon: mint and rattan, sandy-cream tiles, window showing sea.
- `bg_seleb.png` — celebrity studio: deep plum floor, pink walls with gold trim and spotlights.

---
After each batch is committed, Claude cuts the sheets into `salon/sprites/*.webp` and updates `salon/sprites/list.json`.
