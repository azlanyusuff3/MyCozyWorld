# Cozy Tycoon — Art untuk papan Saidina (Nov 2026)

Papan Cozy Tycoon dah tukar ikut susunan Saidina Traveller. Petak-petak baru perlukan ikon baru, rumah & hotel perlukan model 3D, dan belakang kad Keputusan perlu dilukis semula.
Game dah siap baca semua fail di bawah secara automatik. Kalau fail takde, game guna emoji.

## Peraturan (sama macam ART_BRIEF.md)
1. **Jangan ubah code** (`game.js`, `index.html`, `style.css`). Cuma tambah gambar, `list.json` dan nombor VERSION dalam `/sw.js`.
2. Nama fail tepat macam di bawah, huruf kecil, format `.webp`, simpan dalam `cozy-tycoon/sprites/`.
3. Latar belakang lutsinar mesti alpha sebenar. Jangan lukis corak petak-petak kelabu.
4. **Takde tulisan, huruf atau nombor** dalam gambar.
5. Ikut gaya art sedia ada. Tengok dulu `tile_kuching.webp`, `tile_ipoh.webp`, `b3d_2.webp` dan `token_aina.webp`.
6. Tambah nama setiap gambar (tanpa `.webp`) dalam array `cozy-tycoon/sprites/list.json`. Kekalkan semua entry lama.
7. Lepas setiap batch, naikkan nombor terakhir `VERSION` dalam `/sw.js`.
8. Satu commit setiap batch, terus ke `main`: `art(tycoon): saidina batch N <ringkas>`.
9. Lepas setiap batch, tunjuk preview dan **berhenti**. Tunggu user cakap "next batch".

### Gaya umum (letak depan setiap prompt)
> Cute kawaii mobile game art for young children, chibi proportions, soft pastel colour palette (pink, peach, mint, sky blue, butter yellow, lavender), thick soft brown outline, glossy highlights, soft shading, clean simple shapes, Malaysian theme, consistent with a cozy pastel board game.

---

## Batch S1 — Rumah, hotel & kad Keputusan

| Fail | Saiz | Latar | Penerangan |
|---|---|---|---|
| `b3d_rumah.webp` | 256×512 (tinggi & kurus) | lutsinar | Rumah kecil comel macam buah catur/mainan monopoly: rumah teres satu tingkat, bumbung merah jambu, dinding krim, tingkap kecil. Pandangan 3/4 dari depan, berdiri di bahagian bawah kanvas, ruang kosong di atas. |
| `b3d_hotel.webp` | 256×512 (tinggi & kurus) | lutsinar | Hotel comel 4–5 tingkat, warna merah jambu & emas, bumbung kubah kecil, bendera kecil di atas, tingkap berderet, pintu kaca. Lebih tinggi dan lebih "mewah" daripada rumah. Pandangan 3/4 dari depan, berdiri di bahagian bawah kanvas. |
| `card_rezeki_back.webp` | 600×840 potret | legap | **Tukar ganti fail lama.** Belakang kad KEPUTUSAN: lavender-pink, bucu bulat, tanda soal (❓) besar comel di tengah (bentuk tanda soal sahaja, bukan huruf), bintang berkilau, bingkai emas. Satu reka bentuk untuk semua kad. |

## Batch S2 — Petak bandar A (11 ikon)
Semua petak: **256×256, lutsinar**, satu objek comel di tengah, pandangan 3/4 dari atas, gaya mainan/sticker, isi lebih kurang 80% kanvas, takde tulisan.

| Fail | Objek |
|---|---|
| `tile_kangar.webp` | Pintu gerbang/menara jam kecil Perlis dengan sawah padi hijau dan bukit batu kapur kecil |
| `tile_batupahat.webp` | Batu besar comel di tepi pantai dengan semangkuk mi bandung |
| `tile_sibu.webp` | Pagoda tujuh tingkat kecil di tepi sungai dengan perahu kayu |
| `tile_butterworth.webp` | Feri kuning-putih comel di atas air biru |
| `tile_taiping.webp` | Tasik dengan pokok hujan-hujan (rain tree) rendang dan jambatan kecil |
| `tile_telukintan.webp` | Menara jam condong (Menara Condong Teluk Intan) bentuk pagoda, sedikit senget |
| `tile_shahalam.webp` | Masjid biru dengan kubah biru besar dan 4 menara |
| `tile_kelang.webp` | Kapal kontena kecil di pelabuhan dengan semangkuk bak kut teh (sup herba) |
| `tile_seremban.webp` | Rumah adat Negeri Sembilan (bumbung melengkung macam tanduk kerbau) |
| `tile_pj.webp` | Bandar moden kecil: dua bangunan pejabat comel dan bulatan/arca di tengah jalan |
| `tile_kl.webp` | Menara berkembar KL (twin towers) dengan bunga api kecil di belakang |

## Batch S3 — Ladang, cukai & penjara (10 ikon)
Saiz dan gaya sama macam Batch S2.

| Fail | Objek |
|---|---|
| `tile_getah.webp` | Pokok getah dengan mangkuk kecil menadah susu getah putih |
| `tile_kelapa.webp` | Dua pokok kelapa dengan buah kelapa hijau |
| `tile_sawit.webp` | Pokok kelapa sawit dengan tandan buah merah-oren |
| `tile_nenas.webp` | Dua biji nenas comel dengan daun hijau berduri lembut |
| `tile_cukai.webp` | Sampul surat cukai coklat dengan duit kertas dan syiling emas |
| `tile_taksiran.webp` | Rumah kecil dengan resit kertas tertampal dan syiling emas |
| `tile_denda.webp` | Papan tanda P (parking) dengan tanda pangkah merah dan saman kertas kuning (P sahaja, takde tulisan lain) |
| `tile_keputusan.webp` | Tanda soal merah jambu besar comel, berkilau (bentuk tanda soal sahaja) |
| `tile_penjara.webp` | Bangunan penjara comel dengan jeriji besi dan kucing tidur di depan (tak menakutkan, sesuai untuk budak) |
| `tile_kepenjara.webp` | Polis chibi comel meniup wisel sambil tunjuk arah |

## Batch S4 — Sticker yang tukar maksud (pilihan)
Saiz 256×256, lutsinar, gaya sticker bulat dengan bingkai putih tebal. **Tukar ganti fail lama.**

| Fail | Objek |
|---|---|
| `stk_tidur.webp` | Budak chibi comel pakai baju belang di belakang jeriji, senyum dan buat tanda peace (sticker "Banduan Comel") |
| `stk_klcc.webp` | Menara berkembar KL dengan mahkota emas kecil (sticker "Tuan KL") |
| `stk_bangunan.webp` | Hotel comel dengan topi keledar kuning & pembaris (sticker "Arkitek Cilik") |
