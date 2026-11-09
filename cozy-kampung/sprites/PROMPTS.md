# Cozy Kampung Plot — art prompts (ChatGPT)

Game dah boleh main tanpa gambar (semua dilukis guna SVG). Bila nak tukar ke art sebenar:
1. Jana gambar guna prompt bawah. **Background mesti transparent.**
2. Tukar ke `.webp`, letak dalam folder ni (`cozy-kampung/sprites/`) dengan nama fail **tepat** macam dalam jadual.
3. Tambah nama (tanpa `.webp`) dalam `list.json`, contoh: `["rumah_merah","rumah_biru","av_mimi"]`.
   Game auto guna sprite yang ada dalam list; yang tak ada kekal guna lukisan SVG.
4. Naikkan `VERSION` dalam `sw.js` (root repo).

Buat satu-satu dulu, commit, tengok dalam game. Tak payah siapkan semua sekaligus.

## Gaya umum (letak depan SETIAP prompt)
> Cute chibi cozy mobile game asset, Malaysian kampung (village) theme, soft pastel colours, thick soft dark-brown outline, gentle cel shading, kawaii style for young kids, single object centred, viewed from the front at a slight top-down 3/4 angle, transparent background, no text, no ground tile.

## A. Objek plot (persegi 512×512, objek isi ~85% kotak, tapak objek di bahagian bawah)
| Fail | Prompt tambahan |
|---|---|
| `rumah_merah.webp` | A tiny traditional Malay kampung house on short wooden stilts, warm wooden plank walls, two little yellow-lit windows, small wooden stairs at the front, **bright red-coral zinc roof** with a pointed gable, cute and chunky |
| `rumah_biru.webp` | Exact same house design as before (same angle, same size, same walls and stairs) but with a **bright sky-blue zinc roof** |
| `pisang.webp` | A small chubby banana tree with big glossy green leaves and a little bunch of yellow bananas |
| `kelapa.webp` | A short cute coconut palm tree with a gently curved trunk, green fronds and three brown coconuts |
| `reban.webp` | A small wooden chicken coop with a red-brown roof and a round yellow baby chick standing next to it |
| `wakaf.webp` | A small open wooden wakaf pavilion (Malay rest hut) with four posts, a wooden bench platform and a brown pyramid roof |

> Penting: `rumah_merah` dan `rumah_biru` mesti nampak **sama**, beza warna bumbung je. Bila jana `rumah_biru`, upload `rumah_merah` dan minta "same house, only change the roof to sky blue".
> Objek lain (pisang/kelapa/reban/wakaf) neutral — game letak bendera kecil warna pemain secara automatik.

## B. Avatar watak (persegi 512×512, bust/separuh badan, muka pandang depan)
Tambahan gaya: *big round head, huge sparkly eyes, pink blush cheeks, cheerful expression, wearing a tiny batik/songkok-style accessory where stated.*

| Fail | Siapa | Prompt tambahan |
|---|---|---|
| `av_mimi.webp` | Pemain 1 | Mimi, an orange tabby kitten wearing a small red-coral bandana, big happy smile |
| `av_pipi.webp` | Pemain 2 | Pipi, a baby panda wearing a small sky-blue bandana, cheerful wave |
| `av_koko.webp` | AI Senang | Koko, a round fluffy yellow baby chick with a tiny orange beak, looking a bit clumsy and excited |
| `av_bubu.webp` | AI Sederhana | Bubu, a white bunny with long pink inner ears and a little carrot tucked behind one ear, sweet cheeky smile |
| `av_belang.webp` | AI Susah | Sensei Belang, a chubby little tiger cub wearing a tiny black songkok and a small batik sash, smug confident smirk, one eyebrow raised, still cute not scary |

## C. Kad hub (pilihan)
Simpan sebagai `assets/hub/card_kampung.webp` (landscape 4:3), kemudian tambah `"card_kampung"` dalam `assets/hub/list.json`:
> Cute chibi Malaysian kampung village seen from slightly above, built on a grid of grassy square plots separated by little bamboo fences and wooden posts, kampung houses with red and blue roofs, banana and coconut trees, a chicken coop, an orange kitten and a baby panda waving in front, warm sunny pastel colours, kawaii mobile game key art, no text.
