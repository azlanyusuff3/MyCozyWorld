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

---

## Batch 7 — Mini game & Pasar Malam (10 images)
All: **256×256, transparent**, single object centred, same style as tiles.

| File | Object |
|---|---|
| `mg_coin.webp` | Shiny cute gold coin with a tiny smiling face and sparkle (no text, no numbers) |
| `mg_bomb.webp` | Cute round cartoon bomb with a lit fuse and a nervous face |
| `kuih_0.webp` | Kuih lapis (colourful layered cake slice, pink and white layers) |
| `kuih_1.webp` | Karipap (golden curry puff with crimped edge) |
| `kuih_2.webp` | Ring doughnut coated with white sugar |
| `kuih_3.webp` | Three sticks of satay with peanut sauce |
| `kuih_4.webp` | Bowl of ABC / ais kacang with colourful toppings |
| `kuih_5.webp` | Grilled corn on the cob (jagung bakar) |
| `kuih_6.webp` | Wobbly pastel pudding with caramel |
| `kuih_7.webp` | Apam balik folded pancake with peanut and corn filling |

## Batch 8 — Sticker badges (12 images)
All: **256×256, transparent**, round collectible sticker badge with a thick white die-cut border and soft shadow, one cute icon inside, pastel background circle. **No text.**

| File | Icon inside the badge |
|---|---|
| `stk_first_buy.webp` | Small stall with a "sold" heart flag (heart only, no letters) |
| `stk_klcc.webp` | Twin towers with a gold crown |
| `stk_bangunan.webp` | Little architect hard hat on top of a tower |
| `stk_set.webp` | Three coloured tiles joined with a gold star |
| `stk_kenduri3.webp` | Bunga manggar wedding flower with three hearts |
| `stk_tidur.webp` | Sleeping pillow with a nightcap and moon |
| `stk_rich.webp` | Pile of gold coins with a money bag |
| `stk_win.webp` | Gold trophy with confetti |
| `stk_minigame.webp` | Gold coin being caught by a small hand / net |
| `stk_trade.webp` | Two cute paws doing a handshake |
| `stk_math.webp` | Smiling brain with plus and minus symbols (+ and − allowed) |
| `stk_pasar.webp` | Red paper lantern with a kuih on a stick |

---

## Batch 9 — Human player tokens (4 images) — replaces the animal tokens
The players are now cute chibi **Malaysian kids**, same style as the townsfolk portraits (`folk_kiah.webp`, `folk_mira.webp`) but **full body**. Keep the old `token_kucing/arnab/panda/ayam` files (do not delete them).
All: **512×600 portrait, transparent**, full body standing, facing the viewer, very big head (half of body height), tiny body, big sparkly eyes, rosy cheeks, thick soft brown outline, happy pose. Each kid wears the colour shown so players can be told apart on the board.

| File | Character |
|---|---|
| `token_aina.webp` | **Aina**, Malay girl about 8 years old, peach-orange tudung and orange baju kurung, holding a small gold coin, cheerful smile |
| `token_meimei.webp` | **Mei Mei**, Chinese girl about 8, two hair buns with pink ribbons, pink cheongsam-style top and skirt, waving |
| `token_adam.webp` | **Adam**, Malay boy about 8, blue backwards cap, blue t-shirt and shorts, thumbs up |
| `token_ravi.webp` | **Ravi**, Indian boy about 8, round glasses, curly hair, yellow polo shirt and shorts, holding a toy dice, big grin |

Important: all four must have the same size, proportions and line style. Register `token_aina`, `token_meimei`, `token_adam`, `token_ravi` in `list.json` (keep everything already there).

## Batch 10 — Redraw hub card & menu background with the human kids (2 images)
Do this **after Batch 9**, and use the four new kid tokens (`token_aina`, `token_meimei`, `token_adam`, `token_ravi`) as the character reference so they look identical. **Overwrite** the existing files (same names, same sizes). No new `list.json` entries are needed for these two (they are already registered), but still bump `sw.js` VERSION.

| File | Size | Background | Description |
|---|---|---|---|
| `assets/hub/card_tycoon.webp` | same size as the current file (landscape 4:3) | opaque | Aina, Mei Mei, Adam and Ravi standing happily around a colourful Monopoly-style board with Malaysian landmarks (KLCC, Menara KL, kampung house, pasar malam stall), big pink dice and gold coins, pastel pink and sky blue background. **No animals, no text.** |
| `cozy-tycoon/sprites/bg_menu.webp` | 1080×1920 portrait | opaque | Same dreamy pastel kampung-and-city scene as the current file, but replace any animal characters with the four kids (small, placed near the bottom corners, playing with dice and coins). Keep the **middle 60% calm and low detail** for the UI. **No animals, no text.** |

---

## Batch 11 — 4 more player kids (4 images)
Same rules and style as Batch 9: **512×600 portrait, transparent**, full body chibi kid about 8 years old, standing, facing the viewer, very big head, thick soft brown outline, happy pose. Use `token_aina.webp`, `token_adam.webp` as the exact style and size reference so all 8 kids look like one set. Each kid wears the colour shown.

| File | Character |
|---|---|
| `token_sofea.webp` | **Sofea**, Malay girl, lavender-purple tudung and purple baju kurung with small flower pattern, holding a little paper house, sweet smile |
| `token_jason.webp` | **Jason**, Chinese boy, short neat hair, green hoodie and khaki shorts, holding a toy train, cheerful wave |
| `token_priya.webp` | **Priya**, Indian girl, long braided hair with a small flower clip, teal/turquoise dress, small bindi optional, hands clasped happily |
| `token_ryan.webp` | **Ryan**, Kadazan-Dusun boy from Sabah, spiky hair, red t-shirt with a small Mount Kinabalu print (no text), blue shorts, peace sign |

Register `token_sofea`, `token_jason`, `token_priya`, `token_ryan` in `list.json` (keep everything already there).
