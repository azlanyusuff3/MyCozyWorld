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

## Kad hub (pilihan)
Simpan `assets/hub/card_mamak.webp` (landscape 4:3), tambah `"card_mamak"` dalam `assets/hub/list.json`:
> Cute chibi busy Malaysian mamak restaurant at night with green walls, marble round tables and red plastic stools, a chef stretching roti canai in the air, teh tarik being pulled high, cute chibi Malaysian customers of different races eating happily, a delivery rider on a scooter and an orange cat sneaking near the counter, warm lights and a TV showing football, kawaii mobile game key art, no text.
