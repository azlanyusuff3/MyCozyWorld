# Mamak Lab — art prompts isometric (ChatGPT)

Game dah boleh main guna lukisan placeholder. Bila sprite dimasukkan, game **auto ganti** placeholder tu.

## Cara masukkan
1. Jana gambar guna prompt bawah. **Background mesti transparent.**
2. Tukar ke `.webp`, simpan dalam `mamak-lab/sprites/` dengan nama fail **tepat**.
3. Tambah nama (tanpa `.webp`) dalam `mamak-lab/sprites/list.json`, contoh `["iso_meja","iso_kerusi"]`.
4. Buat ikut batch. Lepas setiap batch, commit dan tunjuk dulu.

> ⚠️ Folder ni untuk dev (tersorok). JANGAN ubah `mamak-rush/` atau `sw.js`.

## Gaya umum (letak depan SETIAP prompt)
> Cute chibi cozy mobile game asset, Malaysian mamak restaurant theme, **isometric view, 2:1 isometric angle (30°), viewed from the front-right corner**, soft warm colours, thick soft dark-brown outline, gentle cel shading, kawaii style, single object centred, transparent background, no text, no shadow on the ground.

**Penting:** semua gambar mesti sudut isometric yang SAMA. Kalau satu senget lain, semua nampak pelik. Kalau perlu, bagi ChatGPT gambar `iso_meja` yang dah siap dan suruh "same isometric angle and style as this image".

## Batch 1 — Perabot asas (paling penting)
| Fail | Saiz | Prompt tambahan |
|---|---|---|
| `iso_meja.webp` | 512×512 | A small round white marble mamak table on a thin steel pedestal, isometric, empty table top |
| `iso_kerusi.webp` | 256×256 | A red plastic stool (round seat, four legs), isometric |
| `iso_lantai.webp` | 256×128 | One single isometric diamond floor tile (exact 2:1 rhombus filling the whole image), cream and terracotta patterned ceramic tile, flat, no outline at the edges |

## Batch 2 — Watak (badan penuh, berdiri, chibi, pandang ke depan-kiri)
Tambahan gaya: *cute chibi Malaysian person, full body standing, big round head, big sparkly eyes, pink blush, tiny body, isometric 3/4 view facing front-left.* Saiz **384×512**.
| Fail | Watak | Prompt tambahan |
|---|---|---|
| `iso_chef.webp` | Tukang masak | A mamak cook in white t-shirt, white apron and white cook hat, holding a flat spatula |
| `iso_pelayan.webp` | Pelayan | A young waiter in a teal green polo shirt with a small black apron, holding a round steel tray |
| `iso_cust_jamal.webp` | Abang Jamal | A young Malay man with short messy hair wearing a red football jersey, excited grin |
| `iso_cust_lina.webp` | Kak Lina | A young Malay woman wearing a pastel pink tudung and office blouse with a lanyard ID card |
| `iso_cust_rahman.webp` | Pakcik Rahman | An old Malay uncle with a white kopiah cap, small round glasses, grey moustache and purple batik shirt |
| `iso_cust_amir.webp` | Adik Amir | A Malay schoolboy in white school shirt and dark blue shorts with a backpack |
| `iso_cust_lim.webp` | Uncle Lim | A chubby Chinese Malaysian uncle in a white singlet holding a folded newspaper |
| `iso_cust_devi.webp` | Aunty Devi | An Indian Malaysian aunty in an orange saree with gold bangles |
| `iso_cust_raju.webp` | Abang Raju | A young Indian Malaysian man in an orange safety vest and yellow hard hat |
| `iso_cust_kiah.webp` | Makcik Kiah | A Malay auntie in a pink floral tudung and green baju kurung holding a market bag |
| `iso_cust_a.webp` | Pelanggan biasa 1 | A Malay office guy in a blue shirt and tie |
| `iso_cust_b.webp` | Pelanggan biasa 2 | A university girl in a yellow hoodie with a tote bag |
| `iso_cust_c.webp` | Pelanggan biasa 3 | A Chinese Malaysian teenager in a green t-shirt and cap |
| `iso_cust_d.webp` | Pelanggan biasa 4 | An Indian Malaysian man in a white kurta |
| `iso_cust_e.webp` | Pelanggan biasa 5 | A Malay mother in a lilac tudung and purple baju kurung |

## Batch 3 — Upgrade & hiasan
| Fail | Saiz | Prompt tambahan |
|---|---|---|
| `iso_kipas.webp` | 256×256 | A white ceiling fan with three blades hanging from a short rod, isometric |
| `iso_tv.webp` | 384×256 | A wall-mounted flat TV showing a green football field (no logos, no text), isometric, mounted on a left wall |
| `iso_pokok.webp` | 256×384 | A leafy money plant in a terracotta pot, isometric |

Belum ada dalam game (kaunter, dinding, papan tanda masih dilukis guna code). Kita tambah selepas Batch 1–3 nampak ngam.

## Batch 4 — Dinding, kaunter, papan tanda & stesen
Dua jenis gambar dalam batch ni:
- **RATA (pandang depan, BUKAN isometric)**: game akan condongkan sendiri ikut dinding. Lukis lurus macam scan/foto depan.
- **ISO**: sudut isometric sama macam Batch 1.

| Fail | Jenis | Saiz | Background | Prompt tambahan |
|---|---|---|---|---|
| `wall_jubin.webp` | RATA | 256×256 | **penuh** | Seamless repeating texture of small mint-green square ceramic wall tiles with thin white grout, flat front view, tileable on all edges, no shading gradient |
| `kaunter_depan.webp` | RATA | 512×128 | **penuh** | Seamless repeating front panel of a mamak shop counter: brushed stainless steel with a strip of teal tiles at the bottom, flat front view, tileable left-right |
| `papan_tanda.webp` | RATA | 1024×256 | transparent | A blank wide dark-teal shop signboard with a cream border and small warm light bulbs along the edge, flat front view, **completely empty, no text** (game letak tulisan sendiri) |
| `menu_board.webp` | RATA | 384×256 | transparent | A wooden-framed blackboard menu with small chalk doodles of roti canai, teh tarik cup and nasi lemak, flat front view, no words |
| `deko_jam.webp` | RATA | 256×256 | transparent | A round vintage wall clock with a cream face and red rim, flat front view, no numbers text needed (simple tick marks) |
| `deko_bingkai.webp` | RATA | 256×320 | transparent | A small framed painting of a Malaysian kampung house with coconut trees, wooden frame, flat front view |
| `deko_bingkai2.webp` | RATA | 256×320 | transparent | A small framed retro photo of a smiling mamak tea maker pulling teh tarik (cartoon style), wooden frame, flat front view |
| `iso_tawa.webp` | ISO | 256×256 | transparent | A flat iron griddle (tawa) station on a small stand with one golden roti canai cooking on it, isometric |
| `iso_dandang.webp` | ISO | 256×384 | transparent | A tall shiny stainless steel tea urn with a tap at the bottom and two steel pitchers beside it, isometric |

## Batch 5 — Sprite sheet animasi (jalan depan/belakang, duduk)
Ganti gambar watak satu-pose. Setiap watak = **SATU fail sprite sheet 1536×1024, transparent**, grid **4 lajur × 2 baris** (setiap petak 384×512). Watak berdiri tengah petak, kaki di bawah petak (~10px dari bawah), saiz watak SAMA dalam semua petak.

| | Lajur 1 | Lajur 2 | Lajur 3 | Lajur 4 |
|---|---|---|---|---|
| **Baris 1 — DEPAN** (3/4 depan, muka & badan menghadap **bawah-kiri**) | Berdiri diam | Jalan: kaki KIRI ke depan | Jalan: kaki KANAN ke depan | **Duduk** (lutut bengkok macam duduk atas bangku kecil — JANGAN lukis bangku) |
| **Baris 2 — BELAKANG** (3/4 belakang, nampak belakang kepala, berjalan menjauh ke **atas-kiri**) | Berdiri diam | Jalan: kaki KIRI ke depan | Jalan: kaki KANAN ke depan | Pelanggan: **duduk dari belakang**. Chef: **sedang masak** (pegang sudip). Pelayan: **pegang dulang** dengan air |

Game akan flip sendiri untuk arah kanan. Nama fail: `sh_<id>.webp`.

### 5A — Staff (muka MESTI berbeza antara satu sama lain)
| Fail | Watak |
|---|---|
| `sh_chef1.webp` | Anna (Tukang roti): Indian Malaysian man, 40s, thick black moustache, round face, white t-shirt, white apron, white cook cap |
| `sh_chef2.webp` | Bang Kamal (Tukang teh): young Malay man, 20s, slim, short spiky hair, no moustache, orange t-shirt, white apron, towel on shoulder |
| `sh_pelayan1.webp` | Siva: young Indian Malaysian waiter, curly hair, teal polo shirt, black apron |
| `sh_pelayan2.webp` | Aiman: Malay teenage waiter, round glasses, buzz cut, teal polo shirt, black apron |
| `sh_pelayan3.webp` | Mei: Chinese Malaysian waitress, ponytail, teal polo shirt, black apron |

### 5B — Pelanggan tetap (ikut rupa `iso_cust_<id>.webp` sedia ada)
`sh_jamal`, `sh_lina`, `sh_rahman`, `sh_amir`, `sh_lim` (*Chinese Malaysian uncle — mata sepet, rambut nipis, singlet putih*), `sh_devi`, `sh_raju`, `sh_kiah`

### 5C — Pelanggan biasa (ikut `iso_cust_a..e.webp`)
`sh_cust_a`, `sh_cust_b`, `sh_cust_c`, `sh_cust_d`, `sh_cust_e`
