# Mamak Rush — art prompts (ChatGPT)

Game dah boleh main guna emoji. Sprite akan ganti emoji secara automatik bila dimasukkan.
1. Jana gambar guna prompt bawah. **Background mesti transparent.** Persegi **512×512**, subjek isi ~85% kotak.
2. Tukar ke `.webp`, simpan dalam `mamak-rush/sprites/` dengan nama fail **tepat**.
3. Tambah nama (tanpa `.webp`) dalam `mamak-rush/sprites/list.json`, contoh `["item_roti","item_teh"]`.
4. Naikkan `VERSION` dalam `sw.js` (root repo).

Buat ikut batch. Lepas setiap batch, commit dan tunjuk dulu.

## Gaya umum (letak depan SETIAP prompt)
> Cute chibi cozy mobile game asset, Malaysian mamak restaurant theme, soft warm colours, thick soft dark-brown outline, gentle cel shading, kawaii style for kids, single subject centred, front view, transparent background, no text.

## Batch 1 — Makanan (item siap dihidang)
| Fail | Prompt tambahan |
|---|---|
| `item_roti.webp` | A golden flaky roti canai on a small round steel plate with a little bowl of yellow dhal curry |
| `item_teh.webp` | A glass mug of teh tarik with a thick creamy foam top, light caramel brown colour |
| `item_maggi.webp` | A plate of spicy Maggi goreng (fried instant noodles) with a fried egg on top, lime wedge and green vegetables |
| `item_nasi.webp` | Nasi lemak on a banana leaf: white coconut rice, red sambal, fried anchovies, peanuts, cucumber slices and half a boiled egg |

## Batch 2 — Pelanggan (manusia chibi, separuh badan atas / duduk, pandang depan)
Tambahan gaya: *cute chibi Malaysian person, big round head, huge sparkly eyes, pink blush cheeks, tiny body, friendly expression, upper body visible.*
| Fail | Watak | Prompt tambahan |
|---|---|---|
| `cust_jamal.webp` | Abang Jamal | A young Malay man with short messy hair wearing a red football jersey, excited grin |
| `cust_lina.webp` | Kak Lina | A young Malay woman wearing a pastel pink tudung and office blouse with a lanyard ID card, holding a phone |
| `cust_rahman.webp` | Pakcik Rahman | An old Malay uncle with a white kopiah cap, small round glasses, grey moustache and batik shirt, warm smile |
| `cust_amir.webp` | Adik Amir | A Malay schoolboy in white school shirt and dark blue shorts with a backpack, cheeky smile |
| `cust_lim.webp` | Uncle Lim | A chubby Chinese Malaysian uncle in a white singlet holding a folded newspaper, relaxed happy face |
| `cust_devi.webp` | Aunty Devi | An Indian Malaysian aunty wearing a colourful saree with a small bindi and gold bangles, cheerful |
| `cust_raju.webp` | Abang Raju | A young Indian Malaysian man wearing an orange safety vest and a yellow hard hat, tired but happy |
| `cust_kiah.webp` | Makcik Kiah | A Malay auntie wearing a colourful floral tudung and baju kurung, holding a market shopping bag with vegetables |

## Batch 3 — Watak khas
| Fail | Prompt tambahan |
|---|---|
| `cust_grab.webp` | Abang Grab, a cheerful young delivery rider in a green jacket and green helmet riding a small green scooter with a delivery box on the back (no logos, no text) |
| `cust_oyen.webp` | Oyen, a chubby orange tabby cat crouching sneakily with a mischievous grin, one paw raised |

## Batch 4 — Stesen masak
| Fail | Prompt tambahan |
|---|---|
| `st_doh.webp` | A round ball of soft white roti canai dough shining with oil |
| `st_roti_masak.webp` | A pale half-cooked roti canai flat on a hot iron griddle with little steam |
| `st_hangus.webp` | A burnt black roti canai with little smoke puffs, funny sad face drawn by the smoke |
| `st_teko.webp` | A shiny stainless steel teh tarik pitcher (mug with handle) |
| `st_tarik.webp` | Two steel pitchers pouring a long stream of teh tarik from high up into a lower pitcher, splash and foam |
| `st_kuali.webp` | An empty black wok (kuali) on a stove |
| `st_kuali_masak.webp` | A black wok tossing Maggi goreng noodles in the air with fire flames underneath |
| `st_hangus_maggi.webp` | A wok of burnt black noodles with smoke puffs |
| `st_periuk.webp` | A big steaming rice pot with lid slightly open |

## Batch 5 — Kedai (meja, dinding, lantai, kaunter, dulang)
Ini yang buat semua art nampak sebati. Gaya umum sama, **tapi saiz ikut jadual** (bukan semua 512×512).

| Fail | Saiz | Background | Prompt tambahan |
|---|---|---|---|
| `meja.webp` | 512×384 | transparent | A round white marble mamak table on a thin steel stand, viewed from the front at a slight top-down angle so the table top is a wide oval, with two red plastic stools tucked in front on the left and right. Empty table top. The table top should sit in the upper half of the image and the stools in the lower half |
| `bg_dinding.webp` | 1536×256 (lebar, nipis) | **penuh, tak transparent** | Wide strip of a Malaysian mamak restaurant wall seen straight on: mint green ceramic tiles, a wooden ledge at the bottom, a blank dark chalkboard menu (no writing), a round wall clock, a small framed picture and a hanging string of warm lights. No people, no text |
| `bg_lantai.webp` | 512×512 | **penuh, seamless tile** | Seamless tileable top-down floor texture of cream and beige terrazzo floor tiles with subtle speckles, soft and light so characters stand out, no shadows, must tile perfectly on all edges |
| `kaunter.webp` | 1536×256 (lebar, nipis) | transparent | Front view of a long mamak restaurant counter: warm wooden front panel with a stainless steel top edge, a few small details like a napkin box and sauce bottles at the far left and far right ends only, the middle area kept clean and empty. No text |
| `dulang.webp` | 768×192 | transparent | Top-down view of a long oval stainless steel serving tray, empty, shiny with soft highlights |

> Tips: `bg_dinding` dan `kaunter` kena **lebar dan nipis** (nisbah 6:1). Kalau ChatGPT tak boleh terus jana saiz tu, jana landscape biasa dan crop bahagian tengah ikut nisbah.

## Batch 6 — Menu baru (Hari 9–17)
512×512, transparent, gaya sama macam Batch 1 (makanan atas pinggan/gelas, pandang depan sikit dari atas).
| Fail | Prompt tambahan |
|---|---|
| `item_milo.webp` | A tall glass of iced Milo chocolate malt drink with ice cubes and a red straw, light brown colour, a little condensation on the glass |
| `item_rotitelur.webp` | A golden roti telur (roti canai folded with egg inside, egg yolk slightly visible at the edge) on a small round steel plate with a little bowl of yellow dhal curry |
| `item_mee.webp` | A plate of red-orange mee goreng mamak (fried yellow noodles) with tofu cubes, potato slices, bean sprouts, a fried egg on top and a lime wedge |
| `item_murtabak.webp` | Thick square murtabak cut into pieces showing minced meat and egg filling, on a steel plate with sliced pickled onions and a small bowl of curry |
| `item_tosai.webp` | A thin crispy golden tosai (dosa) folded into a big triangle on a steel plate with small bowls of coconut chutney and sambar |
| `st_telur.webp` | A single white chicken egg with a small crack and a tiny bit of yolk peeking out, cute and simple |
| `st_milo.webp` | A plastic shaker cup half full of chocolate Milo drink with motion lines, being shaken (no hands) |

## Batch 7 — Datuk VIP + Pekerja kedai
512×512, transparent, gaya sama macam pelanggan Batch 2 (manusia chibi, separuh badan atas, pandang depan).
| Fail | Watak | Prompt tambahan |
|---|---|---|
| `cust_datuk.webp` | Datuk Seri (event VIP) | A distinguished Malay VIP man with a neat moustache, wearing a black songkok and an elegant gold-and-maroon songket baju Melayu with a small gold brooch, confident proud smile, one hand adjusting his collar, looks important but still cute |
| `staff_siti.webp` | Kak Siti (pelayan) | A friendly young Malay waitress wearing a plain lavender tudung and a green mamak restaurant apron, holding a notepad and pen, warm helpful smile |
| `staff_anne.webp` | Anne (tukang teh) | A cheerful Indian Malaysian man with a thick moustache, white short-sleeve shirt, a small towel over one shoulder, holding a steel teh tarik pitcher, proud grin (in Malaysia "Anne" means big brother) |
| `staff_ravi.webp` | Ravi (tukang roti) | A young Indian Malaysian roti chef wearing a white chef cap and white singlet with a green apron, spinning a thin roti canai dough in the air above one hand, energetic smile |

> Pelanggan tetap (Uncle Lim, Pakcik Rahman, Kak Lina) guna gambar Batch 2 yang dah ada. Tak perlu gambar baru.

## Kad hub (pilihan)
Simpan `assets/hub/card_mamak.webp` (landscape 4:3), tambah `"card_mamak"` dalam `assets/hub/list.json`:
> Cute chibi busy Malaysian mamak restaurant at night with green walls, marble round tables and red plastic stools, a chef stretching roti canai in the air, teh tarik being pulled high, cute chibi Malaysian customers of different races eating happily, a delivery rider on a scooter and an orange cat sneaking near the counter, warm lights and a TV showing football, kawaii mobile game key art, no text.

## Batch 7 — Upgrade dapur & kedai (v2, gaya Cooking Diary)
Ikon kedai upgrade. Setiap tahap mesti nampak **makin mewah**: tahap 1 = biasa/lusuh sikit, tahap 2 = baru & berkilat, tahap 3 = emas/premium dengan sparkle.
Tambahan gaya: *cozy mobile game upgrade icon, chunky shapes, slight 3/4 view, clear silhouette, transparent background, no text.*
| Fail | Prompt tambahan |
|---|---|
| `up_tawa_1.webp` | A simple old flat iron griddle (tawa) for roti canai on a small gas stove, a bit worn and dented |
| `up_tawa_2.webp` | A shiny new stainless steel tawa griddle with a bigger gas burner and blue flames underneath |
| `up_tawa_3.webp` | A luxurious golden tawa griddle with ornate trim, roaring orange flames and little sparkles around it |
| `up_teko_1.webp` | A plain dented aluminium teapot used for teh tarik with a long spout |
| `up_teko_2.webp` | A bigger polished stainless steel teh tarik pitcher pair, shiny highlights |
| `up_teko_3.webp` | An elegant copper teh tarik pot with gold trim, steam swirls and sparkles |
| `up_kuali.webp` | Two black woks (kuali) side by side on a double gas stove |
| `up_api_1.webp` | A sturdy gas stove burner with strong blue flames |
| `up_api_2.webp` | A powerful wok burner with huge roaring red-orange "dragon" flames, sparks flying |
| `up_periuk_1.webp` | A large aluminium rice pot with lid slightly open and steam, white rice visible |
| `up_periuk_2.webp` | A giant shiny rice cooker pot overflowing with fluffy coconut rice, big steam clouds and sparkles |
| `up_dulang_1.webp` | A round stainless steel serving tray, empty |
| `up_dulang_2.webp` | A large oval golden serving tray with decorative handles, empty |
| `up_kipas.webp` | A classic wooden ceiling fan with 4 blades and a small light |
| `up_tv.webp` | A chunky wall-mounted TV showing a green football field (no logos) |
| `up_deko_1.webp` | A cute potted green plant in a terracotta pot |
| `up_deko_2.webp` | A potted plant with a string of warm fairy lights wrapped around it |
| `up_deko_3.webp` | A potted plant, fairy lights and a small framed colourful mural painting of a Malaysian kampung scene |

## Batch 8 — Hiasan dinding kedai (kecil, muncul atas dinding ikut tahap)
| Fail | Prompt tambahan |
|---|---|
| `deko_pokok.webp` | A small cute potted money plant hanging on a wall |
| `deko_lampu.webp` | A short string of warm yellow fairy light bulbs |
| `deko_mural.webp` | A small framed painting of a Malaysian kampung house with coconut trees |
