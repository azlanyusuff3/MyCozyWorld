# Cari Cari — art prompts (ChatGPT)

Game dah boleh main guna emoji + latar SVG. Sprite akan ganti emoji/latar **secara automatik** bila dimasukkan.

**Cara (sama macam game lain):**
1. Jana gambar guna prompt bawah, ikut batch.
2. Tukar ke `.webp`, simpan dalam `cozy-cari/sprites/` dengan nama fail **tepat**.
3. Tambah nama (tanpa `.webp`) dalam `cozy-cari/sprites/list.json`, contoh `["bg_stor","stor_broom"]`.
4. Naikkan `VERSION` dalam `sw.js` (root repo), ikut semver (1.2.0 → 1.2.1).
5. Lepas setiap batch, commit dan tunjuk dulu.

## Gaya umum (letak depan SETIAP prompt)
> Cute cozy hand-drawn mobile hidden-object game art, bright cheerful colours, soft dark-brown outline, gentle cel shading, kawaii storybook style for kids, consistent art style across the whole set, no text, no letters, no logos.

## Peraturan penting
- **Objek (item & decoy):** 512×512, **background transparent**, satu objek sahaja, di tengah, isi ~85% kotak, sudut pandang depan sedikit dari atas. Tiada bayang di lantai.
- **Latar (bg_*):** 1600×1200 (4:3), **penuh, tak transparent**. Latar mesti **kosong dari barang kecil yang lepas** (tiada alat, buah, mainan bertaburan) sebab game akan tabur objek sendiri atas latar. Perabot besar, rak, tingkap, dinding, lantai sahaja. Biar ada banyak permukaan (rak, meja, lantai) untuk objek "duduk". Warna latar sedikit lebih lembut/pudar dari objek supaya objek masih boleh dicari.
- Jangan letak teks, nombor atau tulisan dalam mana-mana gambar.

## Batch 1 — Latar (5 tema + menu)
| Fail | Saiz | Prompt tambahan |
|---|---|---|
| `bg_stor.webp` | 1600×1200 | Full illustrated background of a cosy cluttered Malaysian kampung house store room: wooden plank walls, a tall wooden shelf, a small window with green trees outside, cardboard boxes, a ladder leaning on the wall, wooden floor. Front view, slightly top-down, empty surfaces with no small loose objects, soft muted colours, cosy lighting |
| `bg_dapur.webp` | 1600×1200 | Full illustrated background of a warm traditional Malaysian grandma kitchen (dapur kampung): wooden cabinets, open shelves with jars, a gas stove, a window with batik curtains, a woven mat on the floor, rattan baskets. Front view, slightly top-down, empty surfaces with no small loose objects, soft muted colours, cosy lighting |
| `bg_pasar.webp` | 1600×1200 | Full illustrated background of a lively Malaysian night market (pasar malam) at dusk: rows of stalls with striped canopies, warm string lights and lanterns, food carts, fruit crates, a purple-orange evening sky. Front view, slightly top-down, empty surfaces with no small loose objects, soft muted colours, cosy lighting |
| `bg_bilik.webp` | 1600×1200 | Full illustrated background of a cute kid's bedroom: a bed with pastel blanket, a study desk, bookshelf, toy box, a window with curtains, a round rug on wooden floor, posters with no text. Front view, slightly top-down, empty surfaces with no small loose objects, soft muted colours, cosy lighting |
| `bg_taman.webp` | 1600×1200 | Full illustrated background of a sunny Malaysian kampung backyard garden: a wooden house wall on one side, a coconut tree, banana trees, a small fence, flower beds, a vegetable patch, a grass lawn and stone path. Front view, slightly top-down, empty surfaces with no small loose objects, soft muted colours, cosy lighting |
| `bg_menu.webp` | 1080×1920 (portrait) | Soft blurred cosy pattern of tiny doodle icons (magnifying glass, stars, toys, tools, fruit) on a cream background, very low contrast so text on top is readable |

## Batch 2 — Objek Bilik Stor (Store Room)
Tambahan gaya: *object from a cosy cluttered Malaysian kampung house store room*.
| Fail | BM | Prompt tambahan |
|---|---|---|
| `stor_broom.webp` | penyapu | A cute single broom |
| `stor_bucket.webp` | baldi | A cute single bucket |
| `stor_hammer.webp` | tukul | A cute single hammer |
| `stor_saw.webp` | gergaji | A cute single saw |
| `stor_screwdriver.webp` | pemutar skru | A cute single screwdriver |
| `stor_spanner.webp` | sepana | A cute single spanner |
| `stor_ladder.webp` | tangga | A cute single ladder |
| `stor_gloves.webp` | sarung tangan | A cute single gloves |
| `stor_safetyhat.webp` | topi keselamatan | A cute single safety hat |
| `stor_paintbrush.webp` | berus cat | A cute single paint brush |
| `stor_pottedplant.webp` | pokok pasu | A cute single potted plant |
| `stor_box.webp` | kotak | A cute single box |
| `stor_torch.webp` | lampu suluh | A cute single torch |
| `stor_pencil.webp` | pensel | A cute single pencil |
| `stor_bottle.webp` | botol | A cute single bottle |

## Batch 3 — Objek Dapur Nenek (Grandma's Kitchen)
Tambahan gaya: *object from a warm traditional Malaysian grandma kitchen (dapur kampung)*.
| Fail | BM | Prompt tambahan |
|---|---|---|
| `dapur_fryingpan.webp` | kuali | A cute single frying pan |
| `dapur_spoon.webp` | sudu | A cute single spoon |
| `dapur_fork.webp` | garpu | A cute single fork |
| `dapur_knife.webp` | pisau | A cute single knife |
| `dapur_teapot.webp` | teko | A cute single teapot |
| `dapur_cup.webp` | cawan | A cute single cup |
| `dapur_rice.webp` | nasi | A cute single rice |
| `dapur_salt.webp` | garam | A cute single salt |
| `dapur_egg.webp` | telur | A cute single egg |
| `dapur_onion.webp` | bawang | A cute single onion |
| `dapur_chilli.webp` | cili | A cute single chilli |
| `dapur_coconut.webp` | kelapa | A cute single coconut |
| `dapur_banana.webp` | pisang | A cute single banana |
| `dapur_basket.webp` | bakul | A cute single basket |
| `dapur_candle.webp` | lilin | A cute single candle |

## Batch 4 — Objek Pasar Malam (Night Market)
Tambahan gaya: *object from a lively Malaysian night market (pasar malam) at dusk*.
| Fail | BM | Prompt tambahan |
|---|---|---|
| `pasar_satay.webp` | satay | A cute single satay |
| `pasar_corn.webp` | jagung | A cute single corn |
| `pasar_watermelon.webp` | tembikai | A cute single watermelon |
| `pasar_mango.webp` | mangga | A cute single mango |
| `pasar_pineapple.webp` | nanas | A cute single pineapple |
| `pasar_balloon.webp` | belon | A cute single balloon |
| `pasar_teddybear.webp` | anak patung | A cute single teddy bear |
| `pasar_shoes.webp` | kasut | A cute single shoes |
| `pasar_cap.webp` | topi | A cute single cap |
| `pasar_sunglasses.webp` | cermin mata | A cute single sunglasses |
| `pasar_lantern.webp` | tanglung | A cute single lantern |
| `pasar_icecream.webp` | aiskrim | A cute single ice cream |
| `pasar_drink.webp` | air | A cute single drink |
| `pasar_lightbulb.webp` | mentol | A cute single light bulb |
| `pasar_yoyo.webp` | yoyo | A cute single yo-yo |

## Batch 5 — Objek Bilik Tidur (Bedroom)
Tambahan gaya: *object from a cute kid's bedroom*.
| Fail | BM | Prompt tambahan |
|---|---|---|
| `bilik_bed.webp` | katil | A cute single bed |
| `bilik_teddybear.webp` | teddy | A cute single teddy bear |
| `bilik_books.webp` | buku | A cute single books |
| `bilik_alarmclock.webp` | jam loceng | A cute single alarm clock |
| `bilik_schoolbag.webp` | beg | A cute single school bag |
| `bilik_shirt.webp` | baju | A cute single shirt |
| `bilik_socks.webp` | stoking | A cute single socks |
| `bilik_toothbrush.webp` | berus gigi | A cute single toothbrush |
| `bilik_gamepad.webp` | alat main | A cute single game pad |
| `bilik_crayon.webp` | krayon | A cute single crayon |
| `bilik_ball.webp` | bola | A cute single ball |
| `bilik_mirror.webp` | cermin | A cute single mirror |
| `bilik_joystick.webp` | joystick | A cute single joystick |
| `bilik_headphones.webp` | fon kepala | A cute single headphones |
| `bilik_puzzle.webp` | puzzle | A cute single puzzle |

## Batch 6 — Objek Taman Atuk (Grandpa's Garden)
Tambahan gaya: *object from a sunny Malaysian kampung backyard garden*.
| Fail | BM | Prompt tambahan |
|---|---|---|
| `taman_sunflower.webp` | bunga matahari | A cute single sunflower |
| `taman_mushroom.webp` | cendawan | A cute single mushroom |
| `taman_snail.webp` | siput | A cute single snail |
| `taman_butterfly.webp` | rama-rama | A cute single butterfly |
| `taman_chicken.webp` | ayam | A cute single chicken |
| `taman_cat.webp` | kucing | A cute single cat |
| `taman_nest.webp` | sarang | A cute single nest |
| `taman_carrot.webp` | lobak | A cute single carrot |
| `taman_tomato.webp` | tomato | A cute single tomato |
| `taman_cactus.webp` | kaktus | A cute single cactus |
| `taman_rock.webp` | batu | A cute single rock |
| `taman_frog.webp` | katak | A cute single frog |
| `taman_bee.webp` | lebah | A cute single bee |
| `taman_bicycle.webp` | basikal | A cute single bicycle |
| `taman_kite.webp` | layang-layang | A cute single kite |

## Batch 7 — Objek pengalih (decoy) 1/2
Objek rawak yang ditabur untuk kelirukan pemain. Gaya sama.
| Fail | Prompt tambahan |
|---|---|
| `d_apple.webp` | A cute single apple (like 🍎) |
| `d_orange.webp` | A cute single orange (like 🍊) |
| `d_grapes.webp` | A cute single grapes (like 🍇) |
| `d_strawberry.webp` | A cute single strawberry (like 🍓) |
| `d_cheese.webp` | A cute single cheese (like 🧀) |
| `d_bread.webp` | A cute single bread (like 🍞) |
| `d_cupcake.webp` | A cute single cupcake (like 🧁) |
| `d_donut.webp` | A cute single donut (like 🍩) |
| `d_cookie.webp` | A cute single cookie (like 🍪) |
| `d_ribbon.webp` | A cute single ribbon (like 🎀) |
| `d_gift.webp` | A cute single gift (like 🎁) |
| `d_yarn.webp` | A cute single yarn (like 🧶) |
| `d_thread.webp` | A cute single thread (like 🧵) |
| `d_hat.webp` | A cute single hat (like 👒) |
| `d_glasses.webp` | A cute single glasses (like 👓) |
| `d_briefcase.webp` | A cute single briefcase (like 💼) |
| `d_handbag.webp` | A cute single handbag (like 👜) |
| `d_coin.webp` | A cute single coin (like 🪙) |
| `d_gem.webp` | A cute single gem (like 💎) |
| `d_key.webp` | A cute single key (like 🔑) |
| `d_paperclip.webp` | A cute single paperclip (like 📎) |
| `d_pin.webp` | A cute single pin (like 📌) |
| `d_ruler.webp` | A cute single ruler (like 📏) |
| `d_scissors.webp` | A cute single scissors (like ✂️) |
| `d_notebook.webp` | A cute single notebook (like 📒) |
| `d_soap.webp` | A cute single soap (like 🧼) |
| `d_sponge.webp` | A cute single sponge (like 🧽) |
| `d_tissue.webp` | A cute single tissue (like 🧻) |
| `d_magnet.webp` | A cute single magnet (like 🧲) |
| `d_bolt.webp` | A cute single bolt (like 🔩) |

## Batch 8 — Objek pengalih (decoy) 2/2
Objek rawak yang ditabur untuk kelirukan pemain. Gaya sama.
| Fail | Prompt tambahan |
|---|---|
| `d_gear.webp` | A cute single gear (like ⚙️) |
| `d_toolbox.webp` | A cute single toolbox (like 🧰) |
| `d_battery.webp` | A cute single battery (like 🔋) |
| `d_plug.webp` | A cute single plug (like 🔌) |
| `d_radio.webp` | A cute single radio (like 📻) |
| `d_phone.webp` | A cute single phone (like ☎️) |
| `d_hourglass.webp` | A cute single hourglass (like ⏳) |
| `d_umbrella.webp` | A cute single umbrella (like ☂️) |
| `d_suitcase.webp` | A cute single suitcase (like 🧳) |
| `d_dice.webp` | A cute single dice (like 🎲) |
| `d_target.webp` | A cute single target (like 🎯) |
| `d_drum.webp` | A cute single drum (like 🥁) |
| `d_trumpet.webp` | A cute single trumpet (like 🎺) |
| `d_fish.webp` | A cute single fish (like 🐟) |
| `d_duck.webp` | A cute single duck (like 🦆) |
| `d_bird.webp` | A cute single bird (like 🐦) |
| `d_mouse.webp` | A cute single mouse (like 🐁) |
| `d_rabbit.webp` | A cute single rabbit (like 🐇) |
| `d_turtle.webp` | A cute single turtle (like 🐢) |
| `d_leaf.webp` | A cute single leaf (like 🍂) |
| `d_flower.webp` | A cute single flower (like 🌸) |
| `d_log.webp` | A cute single log (like 🪵) |
| `d_can.webp` | A cute single can (like 🥫) |
| `d_jar.webp` | A cute single jar (like 🫙) |
| `d_honey.webp` | A cute single honey (like 🍯) |
| `d_candy.webp` | A cute single candy (like 🍬) |
| `d_lollipop.webp` | A cute single lollipop (like 🍭) |
| `d_bell.webp` | A cute single bell (like 🔔) |
| `d_shell.webp` | A cute single shell (like 🐚) |
| `d_feather.webp` | A cute single feather (like 🪶) |

## Batch 9 — UI & logo
| Fail | Saiz | Background | Prompt tambahan |
|---|---|---|---|
| `logo.webp` | 1024×512 | transparent | Game logo: a big cute magnifying glass with sparkles and tiny hidden toys peeking around it, playful bubbly shape. Leave a blank rounded banner in the middle (no letters) — tulisan "Cari Cari" akan ditambah kemudian, ATAU minta ChatGPT tulis "Cari Cari" dalam huruf bulat comel |
| `../../assets/hub/card_cari.webp` | 1024×640 | penuh | Key art for the game card: a cosy store room scene with many cute objects, a giant magnifying glass revealing a hidden teddy bear, sparkles, warm light. No text. (Lepas simpan, tambah `card_cari` dalam `assets/hub/list.json`) |
