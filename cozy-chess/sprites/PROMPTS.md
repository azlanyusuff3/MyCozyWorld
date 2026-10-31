# Cozy Chess — Sprite guide untuk ChatGPT

Game ni dah boleh main guna placeholder chibi. Bila sprite sebenar masuk, game auto guna sprite tu.

## Peraturan file
- Folder: `cozy-chess/sprites/`
- Nama: `{team}_{piece}_{pose}.png` (atau `.webp`)
  - team: `white`, `black`
  - piece: `king`, `queen`, `rook`, `bishop`, `knight`, `pawn`
  - pose: `idle`, `attack`, `hurt`
  - Contoh: `white_knight_attack.png`, `black_queen_hurt.png`
- Background **transparent**, satu character satu file, saiz 512x512, character berdiri penuh, kaki dekat bawah frame.
- Semua character **menghadap ke kanan** (game akan flip sendiri untuk yang kena serang).
- Lepas tambah file, **update `sprites/list.json`** — array nama file, contoh:
  `["white_king_idle.png","white_king_attack.png","white_king_hurt.png"]`
- Kalau `attack`/`hurt` belum ada, game guna `idle`. Jadi boleh buat `idle` dulu untuk 12 piece.
- Bila tambah sprite, bump `VERSION` dalam `/sw.js`.

## Style (sama macam Cozy Arena)
Cute chibi 2.5D game character, kepala besar, outline gelap tebal, warna pastel, shading lembut, cozy fantasy, mobile game sprite. Ikut feel hero Cozy Arena (Bulwark, Nimbus, Willow…).

- **White team**: baju krim/putih dengan trim biru langit, aksesori emas.
- **Black team**: baju ungu gelap dengan trim pink, aksesori emas.
- Mesti senang kenal dari atas board walaupun kecil — siluet topi/mahkota kena jelas.

## Character
| Piece | Idea character | Senjata |
|---|---|---|
| King | Raja chibi berjubah, mahkota besar dengan permata | Tongkat kerajaan (scepter) |
| Queen | Permaisuri anggun, tiara, gaun kembang | Tongkat bintang magic |
| Rook | Penjaga tegap, helmet bentuk menara istana | Perisai besar + tukul |
| Bishop | Ahli sihir/paderi, topi mitre tinggi | Staff dengan orb bercahaya |
| Knight | Kesatria dengan helmet ada telinga kuda & plume | Lembing (lance) |
| Pawn | Askar kecil comel, helmet bulat | Lembing kayu kecil |

## Pose
- `idle`: berdiri santai, senyum.
- `attack`: tengah menyerang ke kanan, muka garang comel (King hentak scepter, Queen tembak bintang, Rook hayun tukul, Bishop angkat staff, Knight tujah lance, Pawn cucuk lembing).
- `hurt`: kena pukul, badan terdorong ke belakang, mata X atau berpusing.

## Contoh prompt
> Cute chibi 2.5D mobile game character sprite, full body, facing right, transparent background, 512x512, thick dark outline, soft pastel shading, cozy fantasy style. A small chess **Knight** from the **white team**: cream armor with sky-blue trim, gold details, helmet with little horse ears and a blue plume, holding a lance. Pose: **attack** — lunging forward thrusting the lance, determined cute face. No text, no shadow box, no background.

Tukar **piece**, **team** dan **pose** untuk setiap file (12 piece x 3 pose = 36 file).
