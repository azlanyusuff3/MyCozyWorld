# Cozy Tycoon — Art Brief for ChatGPT

You are the art producer for **Cozy Tycoon**, a cute Monopoly-style board game for young Malaysian kids, inside the repo `azlanyusuff3/MyCozyWorld` (folder `cozy-tycoon/`).
The game code is FINISHED and already loads every image listed in this brief automatically. Your only job is to create the images and commit them. Work **one batch at a time**.

---

## 0. Hard rules (read before every batch)

1. **Do NOT edit any code**: never touch `game.js`, `index.html`, `style.css`, or any file outside the paths listed here (except `sw.js` VERSION, see rule 7).
2. **Exact file names** as written below, lowercase, `.webp` format, saved in `cozy-tycoon/sprites/`.
3. **Transparent background** means a REAL alpha channel. Never paint a white or grey checkerboard pattern. Only items marked *opaque* have a full background.
4. **No text, letters, numbers or logos** inside images unless the item explicitly says so (only `logo_tycoon` has text).
5. **Match the existing art.** Open and look at `token_kucing.webp`, `token_panda.webp` and `dice_1.webp` in this folder first. Every new image must feel like the same game: kawaii chibi, soft pastel colours (pink, peach, mint, sky blue, butter yellow, lavender), thick soft brown outline, glossy highlights, gentle soft shadows.
6. **Register each image**: append its name WITHOUT `.webp` to the JSON array in `cozy-tycoon/sprites/list.json`. Keep every existing entry (tokens and dice). The file must stay valid JSON.
7. After each batch, bump `VERSION` in `/sw.js` by one (e.g. `mycozyworld-v48` → `mycozyworld-v49`). Nothing else in `sw.js`.
8. One commit per batch, directly to `main`, message: `art(tycoon): batch N <short description>`.
9. After each batch, reply with: the commit link, a preview of every image, and stop. Wait for the user to say "next batch" before continuing.
10. Do not invent extra files, rename things, or skip items. If an item fails, redo it until it meets the spec.

### Global style prompt (prefix for EVERY image)
> Cute kawaii mobile game art for young children, chibi proportions, soft pastel colour palette (pink, peach, mint, sky blue, butter yellow, lavender), thick soft brown outline, glossy highlights, soft shading, clean and simple shapes, Malaysian theme, consistent with a cozy pastel board game.

---

## Batch 1 — Backgrounds & logo

| File | Size | Background | Description |
|---|---|---|---|
| `bg_menu.webp` | 1080×1920 portrait | opaque | Dreamy pastel Malaysian kampung-and-city skyline at golden hour: wooden kampung house, coconut trees, small KLCC-like twin towers far away, fluffy clouds, floating gold coins and dice. Keep the **middle 60% calm and low detail** (UI sits on top). |
| `bg_game.webp` | 1080×1920 portrait | opaque | Same world but softer and blurrier, like a cozy table top in a bright room: pastel pink tablecloth with subtle pattern, light bokeh. Very low contrast, no objects in the centre. |
| `board_center.webp` | 1024×1024 square | opaque | Centre of the board seen from above: soft pastel map of Malaysia (peninsula + Borneo) with tiny cute landmarks, light paper texture, faded and low contrast so text can sit on top. |
| `logo_tycoon.webp` | 1200×450 | transparent | Game logo with the text **"Cozy Tycoon"** in chunky rounded bubbly letters, pink-to-peach gradient with white outline and soft shadow, a tiny house and gold coin decoration. Text must be spelled exactly `Cozy Tycoon`. |

## Batch 2 — Chance cards & buildings

| File | Size | Background | Description |
|---|---|---|---|
| `card_rezeki_back.webp` | 600×840 portrait | opaque | Back of a "good luck" card: mint green with rounded corners, big lucky four-leaf clover in the centre, sparkles, gold border. No text. |
| `card_musibah_back.webp` | 600×840 portrait | opaque | Back of a "bad luck" card: coral/peach with rounded corners, cute grey rain cloud with a sweat drop in the centre, gold border. No text. |
| `card_rezeki_front.webp` | 600×840 portrait | opaque | Front frame of the good luck card: mint border with clovers in the corners, a large **plain cream area** in the middle (text and icon will be drawn on top by the game). No text. |
| `card_musibah_front.webp` | 600×840 portrait | opaque | Front frame of the bad luck card: coral border with small rain clouds in the corners, large plain cream middle area. No text. |
| `bld_gerai.webp` | 256×256 | transparent | Tiny Malaysian roadside stall (gerai) with striped awning, 3/4 top view, toy-like. |
| `bld_kedai.webp` | 256×256 | transparent | Small two-storey shophouse (kedai), pastel colours, 3/4 top view, toy-like. |
| `bld_bangunan.webp` | 256×256 | transparent | Cute pastel tower building with a tiny flag on top, 3/4 top view, toy-like. |
| `bld_owned.webp` | 256×256 | transparent | Shiny gold star badge (marks owned stations and utilities). |

## Batch 3 — Board tiles A (12 icons)
All tiles: **256×256, transparent**, a single cute object centred, 3/4 top view, toy/sticker look, fills about 80% of the canvas, no text.

| File | Object |
|---|---|
| `tile_go.webp` | Start flag: checkered flag with a gold coin and a "go" arrow shape (no letters) |
| `tile_cendol.webp` | Bowl of cendol with green jelly, shaved ice and palm sugar |
| `tile_roticanai.webp` | Plate of roti canai with a small bowl of curry |
| `tile_rezeki.webp` | Four-leaf clover with sparkles |
| `tile_musibah.webp` | Cute grey rain cloud with raindrops and a worried face |
| `tile_bil_elektrik.webp` | Light bulb with a small paper bill |
| `tile_lrt.webp` | Cute LRT train (blue and white) |
| `tile_pasarmalam.webp` | Night market stall with a red paper lantern and string lights |
| `tile_mamak.webp` | Glass of teh tarik with foam, steam |
| `tile_runcit.webp` | Small grocery basket with bread, eggs and a bottle of milk |
| `tile_tokwan.webp` | Cozy wooden Malay kampung house on stilts (grandparent's house) |
| `tile_tertidur.webp` | Sleepy chibi pillow with "Zzz" bubbles (bubbles only, no letters) and a nightcap |

## Batch 4 — Board tiles B (12 icons)
Same rules as Batch 3.

| File | Object |
|---|---|
| `tile_melaka.webp` | Colourful decorated Melaka trishaw with flowers |
| `tile_air.webp` | Water drop with a small tap (water company) |
| `tile_ipoh.webp` | Plate of Ipoh bean sprout chicken (tauge ayam) |
| `tile_kuantan.webp` | Cute baby sea turtle on sand |
| `tile_ktm.webp` | Cute KTM commuter train (white with blue/yellow stripe) |
| `tile_kotabharu.webp` | Traditional wau bulan kite |
| `tile_kterengganu.webp` | Keropok lekor with dipping sauce and a small fish |
| `tile_alorsetar.webp` | Golden paddy field bundle with a small paddy stalk |
| `tile_kenduri.webp` | Wedding bunga manggar (decorative flower stand) with a gift box |
| `tile_cameron.webp` | Basket of strawberries with tea leaves |
| `tile_genting.webp` | Pastel Ferris wheel on a misty hill |
| `tile_langkawi.webp` | Cute eagle (helang) statue / bird perched on a rock |

## Batch 5 — Board tiles C (12 icons)
Same rules as Batch 3.

| File | Object |
|---|---|
| `tile_ets.webp` | Cute sleek ETS high-speed train |
| `tile_kuching.webp` | Chubby cat statue (Kuching cat city) |
| `tile_kk.webp` | Mount Kinabalu mountain with a small cloud |
| `tile_elektrik.webp` | Lightning bolt with a small power pole (electric company) |
| `tile_sandakan.webp` | Baby orangutan hugging a branch |
| `tile_putrajaya.webp` | Pink-domed mosque (Putra Mosque inspired) |
| `tile_jb.webp` | Cute bridge over blue water (causeway) |
| `tile_penang.webp` | Bowl of Penang char kway teow / asam laksa |
| `tile_feri.webp` | Cute ferry boat on small waves |
| `tile_menarakl.webp` | KL Tower (Menara KL) cute toy version |
| `tile_saman.webp` | Parking sign "P" shape with a small ticket (the letter P is allowed here) |
| `tile_klcc.webp` | Twin towers (KLCC inspired) cute toy version with sparkles |

## Batch 6 — Townsfolk portraits (notifications)
All: **256×256, transparent**, chibi head-and-shoulders portrait, big sparkly eyes, facing the viewer, same style as the tokens. These appear in small round bubbles, so keep the face large and centred.

| File | Character |
|---|---|
| `folk_kiah.webp` | Mak Cik Kiah: friendly auntie in a pastel pink tudung and baju kurung, warm smile |
| `folk_abu.webp` | Pak Abu: grumpy-but-cute grandpa with white moustache, songkok and batik shirt, arms crossed, frowning |
| `folk_mira.webp` | Adik Mira: cheerful little girl with pigtails and a yellow school-style dress, big grin |
| `folk_polis.webp` | Encik Polis: cute friendly policeman in a dark blue Malaysian police uniform and cap, giving a salute |
| `folk_ann.webp` | Announcer: pink megaphone with a little speech bubble and sparkles (object only, no person) |

---

### Final check before every commit
- [ ] File names and sizes exactly as listed
- [ ] Real transparency where required (no checkerboard)
- [ ] No unwanted text
- [ ] Style matches `token_*.webp` and `dice_*.webp`
- [ ] `list.json` updated, still valid JSON, old entries kept
- [ ] `sw.js` VERSION bumped by one
