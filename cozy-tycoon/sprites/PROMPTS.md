# Cozy Tycoon — art prompts (ChatGPT)

Game dah boleh main tanpa gambar (watak chibi dilukis guna SVG). Bila nak tukar ke art sebenar:
1. Jana gambar guna prompt bawah, simpan sebagai `.webp` (background transparent, ~512×600 px).
2. Letak dalam folder ni dengan nama tepat macam bawah.
3. Tambah nama (tanpa `.webp`) dalam `list.json`, contoh: `["token_kucing","token_arnab"]`.
4. Naikkan `VERSION` dalam `sw.js`.

## Gaya umum (letak depan setiap prompt)
> Cute chibi game character, full body, standing facing the viewer, very big round head (head is half of body height), tiny body, huge sparkly eyes, pink blush cheeks, soft pastel colours, thick soft outline, kawaii mobile game style for young kids, transparent background, no text.

## Watak (token pemain)
| Fail | Prompt tambahan |
|---|---|
| `token_kucing.webp` | Mimi, an orange tabby kitten wearing a small orange scarf, happy smile |
| `token_arnab.webp` | Bubu, a white bunny with long pink inner ears, wearing a pink scarf, shy smile |
| `token_panda.webp` | Pipi, a baby panda wearing a blue scarf, cheerful wave |
| `token_ayam.webp` | Koko, a round yellow baby chick with a tiny orange beak and a little hair curl, wearing a yellow scarf |

## Kad hub (pilihan)
`assets/hub/card_tycoon.webp` (landscape 4:3), kemudian tambah `card_tycoon` dalam `assets/hub/list.json`:
> Cute chibi kitten, bunny, panda and chick standing around a colourful Monopoly-style board game with Malaysian landmarks (KLCC, Menara KL, kampung house, pasar malam stall), big dice and gold coins, pastel pink and sky blue background, kawaii mobile game key art, no text.
