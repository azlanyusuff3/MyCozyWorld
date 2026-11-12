# Perang Lidi — art prompts (ChatGPT)

Game dah boleh main tanpa gambar (semua dilukis neon guna code). **Watak kekal stickman.** Gambar cuma untuk aksesori kepala, senjata, kubu, latar, logo, potret ketua puak dan UI. Setiap gambar adalah pilihan. Game guna gambar yang ada dan lukis neon untuk yang belum ada, jadi boleh tambah sikit-sikit.

## Cara pasang
1. Jana gambar guna prompt bawah. Simpan sebagai `.webp`, dengan **background transparent** kecuali yang ditanda "tak transparent".
2. Letak dalam folder ni (`perang-lidi/sprites/`) dengan nama fail tepat.
3. Tambah nama (tanpa `.webp`) dalam `list.json`, contoh: `["logo","hat_api","weapon_pedang"]`.
4. Naikkan `VERSION` dalam `sw.js`.

## Gaya umum (letak depan SETIAP prompt)
> Dark neon fantasy 2D game art, glowing rim light, bold clean silhouette, rich saturated colours against darkness, slightly stylised and cute (cozy mobile game feel, like a premium chibi auto-battler), crisp edges, no text, no watermark.

Warna puak (guna dalam prompt sebagai `[WARNA]`):

| Puak | Kod | Warna |
|---|---|---|
| Api | `api` | blazing orange and red, ember sparks |
| Bulan | `bulan` | violet and lavender, silver moonlight |
| Besi | `besi` | steel silver and electric ice blue |
| Hutan | `hutan` | leaf green and lime, small leaves and vines |
| Pendekar | `pendekar` | gold and deep amber, Malay songket pattern |
| Bunian | `bunian` | mint turquoise and teal, ethereal mist |
| Ais | `ais` | white and pale cyan, frost crystals |
| Racun | `racun` | toxic lime yellow-green, bubbling poison drops |

---

## 1. Logo (paling penting)
`logo.webp` (landscape ~1200×600, transparent)
> Game title logo text "PERANG LIDI" in bold chunky Malay-adventure lettering, the word PERANG glowing fiery orange, the word LIDI glowing violet purple, two crossed glowing swords behind the text, small sparks and embers, dark metal outline, epic but friendly mobile game logo, transparent background.

*(Logo satu-satunya prompt yang ada teks. Kalau ejaan salah, jana semula.)*

## 2. Latar
`bg_menu.webp` (portrait 1080×1920, **tak transparent**)
> Epic night battlefield seen from a hill, two glowing fortresses far apart on opposite sides of a valley (left one fiery orange, right one violet), aurora in the starry sky, big pale moon, thousands of tiny glowing stick-figure warriors silhouetted in the valley, misty, cinematic, empty dark area in the middle for UI.

`bg_far.webp` (panorama lebar **2400×900**, **tak transparent**, bahagian bawah 15% gelap rata)
> Wide side-scrolling game background panorama, night sky full of stars with soft purple and teal aurora, a big pale moon, three layers of dark silhouetted mountains with faint glowing violet rim light on the ridges, low mist at the bottom, no ground, no characters, no buildings, seamless left and right edges, the bottom of the image fades to near-black.

## 3. Aksesori kepala stickman (8 gambar)
`hat_[kod].webp` (persegi 256×256, transparent). Mesti **menghadap kanan (side view)**, dan bahagian bawah topi kosong supaya muat atas kepala bulat yang kecil.

Template:
> A single headwear item only (no head, no face, no body), side view facing right, centred, sized to sit on top of a small round head, glowing [WARNA] neon rim light, transparent background.

| Fail | Tambah dalam prompt |
|---|---|
| `hat_api.webp` | Flaming horned helmet, two small curved horns and flickering fire crest |
| `hat_bulan.webp` | Silver crescent-moon circlet with a small violet gem |
| `hat_besi.webp` | Knight steel helmet with T-visor and a short blue plume |
| `hat_hutan.webp` | Leaf crown made of big green leaves and a small twig antler |
| `hat_pendekar.webp` | Malay tengkolok (songket head wrap) in gold and maroon, the cloth tail flowing backwards |
| `hat_bunian.webp` | Delicate elf circlet with two long pointed elf ears attached and floating mint petals |
| `hat_ais.webp` | Crown of sharp ice crystals, frosty and translucent |
| `hat_racun.webp` | Witch-alchemist hood with a small bubbling green flask badge |

## 4. Senjata (4 gambar)
Semua **mendatar, mata senjata menghala ke KANAN, pemegang di KIRI**, latar transparent, warna perak/putih neutral dengan sedikit glow (game akan tambah cahaya ikut warna puak).

| Fail | Saiz | Prompt |
|---|---|---|
| `weapon_pedang.webp` | 512×160 | A single curved Malay-style sword (pedang) lying horizontally, blade pointing right, ornate hilt on the left, polished silver blade with soft white glow |
| `weapon_panah.webp` | 200×400 (tegak) | A single recurve bow standing vertically, the curve bulging to the RIGHT, string on the left, carved wood and silver tips, soft white glow |
| `weapon_perisai.webp` | 220×400 (tegak) | A single kite shield seen from the side-front, standing vertically, steel rim, simple emblem, soft white glow |
| `weapon_gergaji.webp` | 600×200 | A single fantasy chainsaw sword lying horizontally, motor handle on the left, long toothed chain blade pointing right, metallic with warm orange sparks |

## 5. Kubu (8 gambar)
`fort_[kod].webp` (portrait 512×1000, transparent). Pintu menghadap **KANAN**, menara tinggi dan sempit, ada bendera di atas.
> A tall narrow fantasy watchtower fortress for the [PUAK] tribe, side-ish view, door facing right, battlements at the top with a flag, glowing windows, [WARNA] neon rim light, dark stone, standing on flat ground, transparent background.

Ganti `[PUAK]` dengan contoh: *fire tribe (lava cracks)*, *moon tribe (crescent spire)*, *iron tribe (riveted steel)*, *forest tribe (tree trunk with vines)*, *Malay pendekar tribe (Malay palace roof)*, *bunian elf tribe (floating crystal)*, *ice tribe (ice spikes)*, *poison tribe (bubbling cauldron top)*.

## 6. Potret ketua puak (8 gambar)
`chief_[kod].webp` (persegi 512×512, transparent). Untuk menu, bracket dan skrin menang. Gaya **chibi macam Cozy Arena**, bust (kepala dan bahu).
> Cute chibi warrior chief bust portrait, big head, determined confident smile, wearing [HEADWEAR] and matching armour, [WARNA] glowing rim light, facing slightly right, transparent background.

`[HEADWEAR]` = sama macam aksesori kepala di bahagian 3, supaya padan dengan stickman dalam game.

## 7. UI
| Fail | Saiz | Prompt |
|---|---|---|
| `frame_modal.webp` | 800×900, **tak transparent** | Ornate dark fantasy UI panel background, deep navy-violet stone with thin glowing gold and teal neon border runes, empty centre for text, rounded corners |
| `trophy.webp` | 512×512 | A glowing golden champion trophy cup with eight small coloured gems (orange, violet, blue, green, gold, mint, white, lime) around it, sparkles |
| `icon_senjata.webp` | 256×256 | Game icon: glowing upgraded sword with an up arrow |
| `icon_zirah.webp` | 256×256 | Game icon: glowing armour chestplate with an up arrow |
| `icon_ekonomi.webp` | 256×256 | Game icon: stack of glowing gold coins with an up arrow |
| `icon_ult.webp` | 256×256 | Game icon: radiant magic burst star, white and gold |

## 8. Kad hub (pilihan)
`assets/hub/card_lidi.webp` (landscape 4:3), kemudian tambah `card_lidi` dalam `assets/hub/list.json`:
> Epic key art: an army of glowing neon stick-figure warriors in many colours (orange, violet, blue, green, gold) clashing in the middle of a night battlefield, swords, bows, shields and a chainsaw sword, sparks flying, two glowing fortresses on each side, aurora sky, dark background, no text.

---
**Senarai penuh** (36 fail): `logo, bg_menu, bg_far, hat_×8, weapon_×4, fort_×8, chief_×8, frame_modal, trophy, icon_senjata, icon_zirah, icon_ekonomi, icon_ult`

Mula dengan **logo, bg_menu, bg_far, weapon_×4 dan hat_×8**. Tu yang paling bagi kesan "wow".
