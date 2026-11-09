# Titik Titik — art prompts (ChatGPT)

Gaya game: kertas buku latihan + garisan pen. Papan TAK perlu gambar. Yang perlu cuma avatar watak.

Game dah boleh main tanpa gambar (semua dilukis guna SVG). Bila nak tukar ke art sebenar:
1. Jana gambar guna prompt bawah. **Background mesti transparent.**
2. Tukar ke `.webp`, letak dalam folder ni (`cozy-kampung/sprites/`) dengan nama fail **tepat** macam dalam jadual.
3. Tambah nama (tanpa `.webp`) dalam `list.json`, contoh: `["av_mimi","av_pipi"]`.
   Game auto guna sprite yang ada dalam list; yang tak ada kekal guna lukisan SVG.
4. Naikkan `VERSION` dalam `sw.js` (root repo).

Buat satu-satu dulu, commit, tengok dalam game. Tak payah siapkan semua sekaligus.

## Gaya umum (letak depan SETIAP prompt)
> Cute chibi cozy mobile game asset, soft pastel colours, thick soft dark-brown outline, gentle cel shading, kawaii style for young kids, single character centred, front view, transparent background, no text, no ground tile.

## B. Avatar watak (persegi 512×512, bust/separuh badan, muka pandang depan)
Tambahan gaya: *big round head, huge sparkly eyes, pink blush cheeks, cheerful expression, wearing a tiny batik/songkok-style accessory where stated.*

| Fail | Siapa | Prompt tambahan |
|---|---|---|
| `av_mimi.webp` | Pemain 1 | Mimi, an orange tabby kitten wearing a small royal-blue bandana (like blue ballpoint ink), big happy smile |
| `av_pipi.webp` | Pemain 2 | Pipi, a baby panda wearing a small red bandana (like red ballpoint ink), cheerful wave |
| `av_koko.webp` | AI Senang | Koko, a round fluffy yellow baby chick with a tiny orange beak, looking a bit clumsy and excited |
| `av_bubu.webp` | AI Sederhana | Bubu, a white bunny with long pink inner ears and a little carrot tucked behind one ear, sweet cheeky smile |
| `av_belang.webp` | AI Susah | Sensei Belang, a chubby little tiger cub wearing a tiny black songkok and a small batik sash, smug confident smirk, one eyebrow raised, still cute not scary |

## C. Kad hub (pilihan)
Simpan sebagai `assets/hub/card_kampung.webp` (landscape 4:3), kemudian tambah `"card_kampung"` dalam `assets/hub/list.json`:
> Top-down photo-style illustration of an open school exercise book page with blue ruled lines and a red margin line, a hand-drawn dots and boxes game in blue and red ballpoint pen with letters written inside some boxes, a blue pen and a pencil lying beside it, a cute chibi orange kitten and baby panda peeking from the corner, warm cozy nostalgic lighting, no text.
