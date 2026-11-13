'use strict';
/* Mamak Rush — game kedai mamak gaya "sushi bar". Semua art guna emoji dulu;
   sprite dalam sprites/list.json (nama tanpa .webp) akan ganti emoji secara automatik. */
const GAME_VERSION = 'v4';
const $ = s => document.querySelector(s);
const store = {
  get(k, d) { try { const v = localStorage.getItem('mamak_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('mamak_' + k, JSON.stringify(v)); } catch (e) {} }
};
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const rm = n => 'RM' + n;

/* ---------- Sprite / emoji ---------- */
const SPR = {};
function ico(key, emoji) { return SPR[key] ? `<img src="${SPR[key]}" alt="">` : emoji; }
fetch('sprites/list.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).catch(() => []).then(l => {
  l.forEach(n => { SPR[n] = 'sprites/' + n + '.webp'; new Image().src = SPR[n]; });
  applyScene(); renderMenu(); if (R) { renderStations(); renderTables(); renderTray(); }
});

function applyScene() {
  const b = document.body.classList, set = (k, v) => document.documentElement.style.setProperty(k, `url(${v})`);
  ['bg_dinding', 'bg_lantai', 'kaunter', 'dulang', 'bg_dapur', 'kaunter_dapur', 'bg_kedai', 'ui_hud', 'ui_papan', 'ui_panel', 'ui_butang'].forEach(n => { const v = LOC === 'satay' && SPR[n + '_satay'] || SPR[n]; if (v) { b.add('has-' + n); set('--' + n, v); } });
  b.toggle('satay-art', LOC === 'satay' && !!SPR.bg_dinding_satay);
}
// Elak menu "save image" bila tekan lama atas gambar (iOS/Android)
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => e.preventDefault());

/* ---------- Data ---------- */
const ITEMS = {
  roti: { name: 'Roti canai', e: '🫓', price: 3 },
  teh: { name: 'Teh tarik', e: '☕', price: 2 },
  maggi: { name: 'Maggi goreng', e: '🍜', price: 5 },
  nasi: { name: 'Nasi lemak', e: '🍛', price: 4 },
  milo: { name: 'Milo ais', e: '🥤', price: 3 },
  rotitelur: { name: 'Roti telur', e: '🍳', price: 4 },
  mee: { name: 'Mee goreng mamak', e: '🍝', price: 6 },
  murtabak: { name: 'Murtabak', e: '🥙', price: 9 },
  tosai: { name: 'Tosai', e: '🥞', price: 4 },
  satay: { name: 'Satay ayam', e: '🍢', price: 6 },
  satayd: { name: 'Satay daging', e: '🥩', price: 8 },
  kuah: { name: 'Kuah kacang', e: '🥜', price: 2 }
};
/* ---------- Restoran ---------- */
const LOCS = {
  mamak: { n: 'Mamak Ali', ic: '🫓', sub: '24 JAM · ROTI · TEH · MAGGI' },
  satay: { n: 'Warung Satay Pak Mat', ic: '🍢', sub: 'MALAM · SATAY · KUAH KACANG', need: 10 }
};
const SATAY_UNLOCK = {
  1: { ic: '🍢', t: 'Warung Satay dibuka!', d: 'Letak satay atas pemanggang. Separuh masak, tap <b>PUSING!</b> cepat, kalau tak hangus sebelah.' },
  2: { ic: '🥜', t: 'Kuah kacang', d: 'Tap periuk kuah untuk cedok. Bila habis, tap untuk masak baru.' },
  3: { ic: '🥩', t: 'Menu baru: Satay daging', d: 'Lebih mahal, lama sikit nak masak.' },
  4: { ic: '🥤', t: 'Milo ais', d: 'Pilih Milo kat stesen air. Sama macam teh: tahan, lepas bila kat hijau.' },
  6: { ic: '🔥', t: 'Order custom: "Satay garing"', d: 'Biar satay lama sikit atas bara, ambik bila bar masuk zon merah!' }
};
let LOC = 'mamak';
// mod yang boleh diminta untuk setiap menu
const ITEM_MODS = { satay: ['garing'], satayd: ['garing'], teh: ['kaw', 'kurang', 'ikat'], milo: ['kurang', 'ikat', 'dino'], roti: ['garing'], rotitelur: ['garing'] };
const CUSTS = [
  { k: 'jamal', e: '🧑🏽', n: 'Abang Jamal' }, { k: 'lina', e: '🧕🏽', n: 'Kak Lina' }, { k: 'rahman', e: '👴🏽', n: 'Pakcik Rahman', t: 'tenang' },
  { k: 'amir', e: '👦🏽', n: 'Adik Amir', t: 'budak' }, { k: 'lim', e: '👨🏻', n: 'Uncle Lim' }, { k: 'devi', e: '👩🏾', n: 'Aunty Devi' },
  { k: 'raju', e: '👷🏾', n: 'Abang Raju', t: 'lapar' }, { k: 'kiah', e: '👵🏽', n: 'Makcik Kiah', t: 'tenang' },
  { k: 'mira', e: '🤳🏻', n: 'Mira Influencer', t: 'influencer' }, { k: 'ain', e: '👧🏽', n: 'Adik Ain', t: 'budak' }
];
/* Personaliti pelanggan: sabar, saiz order, tip */
const TRAITS = {
  tenang: { ic: '😌', n: 'Pakcik/Makcik tenang', pat: 1.4, tip: .7, d: 'Sangat sabar, tapi tip sikit je.' },
  budak: { ic: '🎒', n: 'Budak sekolah', pat: .7, tip: .6, one: true, d: 'Tak sabar! Order sikit & murah, kena layan cepat.' },
  lapar: { ic: '😋', n: 'Pelanggan lapar', pat: 1, tip: 1.1, big: true, d: 'Order banyak sekaligus, tip lebih sikit.' },
  influencer: { ic: '📸', n: 'Influencer', pat: .85, tip: 1, need: 5, d: 'Hidang laju (❤️ masih 2+) = VIRAL: bonus duit & semua pelanggan lain makin sabar. Lambat = review buruk!' }
};
const traitOk = c => !TRAITS[c.t] || !TRAITS[c.t].need || (LOC === 'satay' ? 3 : TRAITS[c.t].need) <= R.day;
const GRAB = { k: 'grab', e: '🛵', n: 'Abang Grab' };
const CAT = { k: 'oyen', e: '🐈', n: 'Oyen' };
// Benda baru yang dibuka ikut hari
const UNLOCK = {
  1: { ic: '🫓☕', t: 'Kedai dibuka!', d: 'Buat roti canai dan teh tarik untuk pelanggan.' },
  2: { ic: '🍜', t: 'Menu baru: Maggi goreng', d: 'Tap kuali untuk masak. Ambik cepat sebelum hangus!' },
  3: { ic: '🙋', t: '"Tambah satu!"', d: 'Lepas makan, ada pelanggan nak tambah order. Layan dia, dapat tip lebih.' },
  4: { ic: '😤', t: 'Pelanggan tak sabar', d: 'Ada yang cepat marah. Tap dia untuk "Sabar ye bang!", sabar dia naik balik (sekali je).' },
  5: { ic: '🛵', t: 'Abang Grab', d: 'Order bungkus kat kaunter. Sabar dia pendek, tapi tip besar!' },
  6: { ic: '🐈', t: 'Oyen si pencuri', d: 'Kucing kedai nak curi makanan atas dulang. Tap dia untuk halau!' },
  7: { ic: '🍛', t: 'Menu baru: Nasi lemak', d: 'Ambik terus dari periuk. Bila habis, tap untuk masak periuk baru.' },
  8: { ic: '☕✨', t: 'Order custom: "Teh tarik kaw"', d: 'Ada order dengan tag <b>kaw</b>. Kena lepas tepat kat zon hijau, kalau tak dia tak nak!' },
  9: { ic: '🥤', t: 'Menu baru: Milo ais', d: 'Pilih Milo, tahan macam teh tarik, lepas bila kat hijau. Senang!' },
  10: { ic: '🍬', t: 'Order custom: "Kurang manis"', d: 'Tekan butang 🍬 Kurang sebelum buat air. Air biasa tak boleh bagi pada orang yang nak kurang manis (dan sebaliknya)!' },
  11: { ic: '🍳', t: 'Menu baru: Roti telur', d: 'Pilih Telur kat tawa, tebar macam biasa, lepas tu tap untuk pecah telur.' },
  12: { ic: '🔥', t: 'Order custom: "Roti garing"', d: 'Biar roti lama sikit atas tawa. Ambik masa bar masuk zon merah (sebelum hangus)!' },
  13: { ic: '🍝', t: 'Menu baru: Mee goreng mamak', d: 'Pilih Mee kat kuali. Separuh jalan, tap <b>KACAU!</b> cepat, kalau tak dia melekat hangus.' },
  14: { ic: '🛍️', t: 'Order custom: "Ikat tepi"', d: 'Air bungkus dalam plastik. Tekan 🛍️ Ikat sebelum buat air.' },
  15: { ic: '🥙', t: 'Menu baru: Murtabak', d: 'Paling mahal! Tebar, pecah 2 telur, dan tunggu lama sikit.' },
  16: { ic: '🦕', t: 'Order custom: "Milo Dinosaur"', d: 'Tekan 🦕 Dino sebelum buat Milo, tabur serbuk Milo lebih kat atas.' },
  17: { ic: '🥞', t: 'Menu baru: Tosai', d: 'Pilih Tosai, swipe bulat-bulat atas tawa untuk ratakan adunan.' }
};
const FEAT_SATAY = { satay: 1, tambah: 1, kuah: 2, sabar: 2, kaw: 2, satayd: 3, grab: 3, milo: 4, cat: 4, kurang: 5, garing: 6, ikat: 7 };
const feat = (d, f) => LOC === 'satay' ? d >= (FEAT_SATAY[f] || 99) : d >= { maggi: 2, tambah: 3, sabar: 4, grab: 5, cat: 6, nasi: 7, kaw: 8, milo: 9, kurang: 10, telur: 11, garing: 12, mee: 13, ikat: 14, murtabak: 15, dino: 16, tosai: 17 }[f];
const UPS = [
  // DAPUR — setiap stesen ada 3 tahap, makin laju & makin cantik
  { k: 'tawa', cat: 'dapur', ic: '🔥', spr: 'up_tawa', n: 'Tawa roti', d: ['Roti masak 30% laju', 'Roti masak 45% laju', 'Tawa emas: roti masak 55% laju'], cost: [45, 110, 220], max: 3 },
  { k: 'teko', cat: 'dapur', ic: '🫖', spr: 'up_teko', n: 'Teko', d: ['Zon hijau teh tarik lebih lebar', 'Zon hijau lebih lebar lagi', 'Teko tembaga: zon hijau paling lebar'], cost: [30, 90, 180], max: 3 },
  { k: 'kuali', cat: 'dapur', ic: '🍳', spr: 'up_kuali', n: 'Kuali kedua', d: 'Masak 2 kuali serentak (Maggi/Mee)', cost: [60], max: 1, need: 2 },
  { k: 'api', cat: 'dapur', ic: '♨️', spr: 'up_api', n: 'Dapur gas', d: ['Kuali masak 20% laju', 'Api naga: kuali masak 35% laju'], cost: [70, 160], max: 2, need: 2 },
  { k: 'periuk', cat: 'dapur', ic: '🍚', spr: 'up_periuk', n: 'Periuk nasi', d: ['Periuk besar: 9 bungkus, masak laju', 'Periuk gergasi: 12 bungkus, masak paling laju'], cost: [60, 140], max: 2, need: 7 },
  { k: 'bara', cat: 'dapur', loc: 'satay', ic: '🍢', spr: 'up_bara', n: 'Pemanggang satay', d: ['Satay masak 15% laju', 'Bara kuat: satay masak 28% laju', 'Pemanggang emas: satay masak 40% laju'], cost: [70, 150, 280], max: 3 },
  { k: 'tray', cat: 'dapur', ic: '🍽️', spr: 'up_dulang', n: 'Dulang', d: ['Dulang muat 5 makanan', 'Dulang muat 6 makanan'], cost: [40, 120], max: 2 },
  // KEDAI — selesa = pelanggan lebih sabar & tip lebih
  { k: 'tables', cat: 'kedai', ic: '🪑', n: 'Meja tambahan', d: 'Lebih ramai pelanggan serentak', cost: [40, 120], max: 2 },
  { k: 'fan', cat: 'kedai', ic: '🌀', spr: 'up_kipas', n: 'Kipas siling', d: 'Pelanggan lebih sabar (-20% cepat marah)', cost: [35], max: 1 },
  { k: 'deko', cat: 'kedai', ic: '🪴', spr: 'up_deko', n: 'Hiasan kedai', d: ['Pokok bunga: sabar +8%, tip +5%', 'Lampu kelip: sabar +16%, tip +10%', 'Mural cantik: sabar +24%, tip +15%'], cost: [60, 150, 300], max: 3 },
  { k: 'tv', cat: 'kedai', ic: '📺', spr: 'up_tv', n: 'TV bola', d: 'Tip +25% (pelanggan seronok tengok bola)', cost: [80], max: 1 },
  { k: 'siti', cat: 'staf', ic: '🧕🏻', spr: 'staff_siti', staff: 1, wage: 12, n: 'Upah Kak Siti (pelayan)', d: 'Auto tenangkan pelanggan tak sabar & halau Oyen', cost: [50], max: 1, need: 6 },
  { k: 'anne', cat: 'staf', ic: '👨🏾‍🍳', spr: 'staff_anne', staff: 1, wage: 15, n: 'Upah Anne (tukang teh)', d: 'Auto buat teh tarik biasa (bukan kaw/kurang/ikat)', cost: [70], max: 1, need: 8 },
  { k: 'ravi', cat: 'staf', ic: '🧑🏾‍🍳', spr: 'staff_ravi', staff: 1, wage: 20, n: 'Upah Ravi (tukang roti)', d: 'Auto tebar roti kosong bila ada order', cost: [90], max: 1, need: 10 }
];
const upDesc = u => Array.isArray(u.d) ? u.d[Math.min(up(u.k), u.d.length - 1)] : u.d;
const lvStars = u => u.max > 1 ? '★'.repeat(up(u.k)) + '☆'.repeat(u.max - up(u.k)) : '';
const baraMul = () => [1, .85, .72, .6][up('bara')];
const tawaMul = () => [1, .7, .55, .45][up('tawa')];
const apiMul = () => [1, .8, .65][up('api')];
const nasiStock = () => 6 + up('periuk') * 3, nasiCook = () => 5 * [1, .75, .55][up('periuk')];
const dekoPat = () => 1 + up('deko') * .08, dekoTip = () => 1 + up('deko') * .05;
const wages = () => UPS.filter(u => u.staff && up(u.k)).reduce((s, u) => s + u.wage, 0);
// Pelanggan tetap: order "macam biasa" yang sama setiap kali datang
const REGS = {
  lim: { fav: [{ k: 'teh', m: { kurang: true } }, { k: 'roti', m: { garing: true } }], story: ['Uncle Lim: "Kedai ni teh dia paling ngam!"', 'Uncle Lim cerita dia dah lepak mamak ni 30 tahun 😄', 'Uncle Lim bawak kawan-kawan dia! Semua order macam dia.'] },
  rahman: { fav: [{ k: 'nasi', m: {} }, { k: 'teh', m: { kaw: true } }], story: ['Pakcik Rahman: "Nasi lemak macam arwah isteri pakcik buat..."', 'Pakcik Rahman doakan kedai murah rezeki 🤲', 'Pakcik Rahman belanja semua orang teh hari ni!'] },
  lina: { fav: [{ k: 'milo', m: { ikat: true } }, { k: 'maggi', m: {} }], story: ['Kak Lina: "Lunch break 30 minit je, nasib awak laju!"', 'Kak Lina dah naik pangkat! Dia nak celebrate kat sini 🎉', 'Kak Lina post kedai ni kat TikTok, viral!'] }
};
const regOrder = k => REGS[k].fav.filter(f => menuItemsFor(R.day).includes(f.k)).map(f => ({ k: f.k, m: Object.fromEntries(Object.entries(f.m).filter(([x]) => feat(R.day, x))), done: false }));
const DUR = 90;
const EVENTS = {
  bola: { ic: '⚽', t: 'Malam Liga Juara!', d: 'Semua orang datang tengok bola. Kedai sesak gila, pelanggan datang laju!' },
  hujan: { ic: '🌧️', t: 'Hujan lebat!', d: 'Orang malas keluar rumah. Pelanggan dalam kedai kurang, tapi order Grab mencurah-curah, dan rider bagi tip lebih!' },
  berbuka: { ic: '🌙', t: 'Waktu berbuka!', d: '15 saat pertama semua orang tunggu azan. Masak siap-siap dulu, letak atas dulang. Lepas azan, semua meja penuh serentak!' },
  datuk: { ic: '🎩', t: 'Datuk VIP datang!', d: 'Tengah hari nanti, Datuk singgah. Order banyak dan cerewet, sabar nipis, tapi bayar 2.5 kali ganda!' }
};
const DATUK = { k: 'datuk', e: '🤵🏽', n: 'Datuk Seri' };
function eventFor(d) {
  if (d % 5 === 0) return 'bola';
  if (d < 6) return null;
  return [null, 'hujan', null, 'datuk', null, 'berbuka'][d % 6];
}
const P = Object.assign({ day: 1, coins: 0, stars: {}, up: {}, reg: {} }, store.get('save', {}));
P.reg = P.reg || {}; P.L = P.L || { satay: { day: 1, stars: {} } }; P.seenT = P.seenT || {}; LOC = P.loc && P.loc !== 'mamak' && P.day > LOCS.satay.need ? P.loc : 'mamak';
const prog = () => LOC === 'mamak' ? P : P.L[LOC];
const locOpen = k => !LOCS[k].need || P.day > LOCS[k].need;
const up = k => P.up[k] || 0;
const save = () => store.set('save', P);
const target = d => { if (LOC === 'satay') d += 4; return Math.round(26 + d * 7 + d * d * .1); };
/* Matlamat hari: ★1 capai duit, ★2 jaga pelanggan, ★3 cabaran berpusing */
function goalsFor(d) {
  const lostMax = d < 4 ? 1 : d < 10 ? 2 : 3;
  const ch = [
    { ic: '🔥', t: `Combo x${3 + Math.floor(d / 4)}`, ok: r => r.bestCombo >= 3 + Math.floor(d / 4) },
    { ic: '😋', t: `Hidang ${Math.round(4 + d * 1.1)} pelanggan`, ok: r => r.served >= Math.round(4 + d * 1.1) },
    { ic: '✨', t: `${2 + Math.floor(d / 3)} teh tarik perfect`, ok: r => r.perfect >= 2 + Math.floor(d / 3) },
    { ic: '🧯', t: 'Takde makanan hangus', ok: r => r.mist.burn === 0 }
  ][d % 4];
  return [
    { ic: '💰', t: `Kutip ${rm(target(d))}`, ok: r => r.earned >= target(d) },
    { ic: '❤️', t: `Merajuk maks ${lostMax} orang`, ok: r => r.lost <= lostMax },
    ch
  ];
}
const goalsHTML = (d, r) => `<div class="goals">${goalsFor(d).map((g, i) => `<div class="goal ${r ? (g.ok(r) ? 'ok' : 'no') : ''}"><span class="gs">${'⭐'}</span><span>${g.ic} ${g.t}</span><b>${r ? (g.ok(r) ? '✓' : '✗') : i ? '' : 'WAJIB'}</b></div>`).join('')}</div>`;

/* ---------- Bunyi ---------- */
let AC = null, soundOn = store.get('sound', true);
function tone(f, d = .12, type = 'sine', v = .16, f2) {
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02);
  } catch (e) {}
}
const SFX = {
  tap: () => tone(600, .06, 'triangle', .12),
  ready: () => { tone(880, .1, 'triangle', .14); setTimeout(() => tone(1175, .12, 'triangle', .12), 80); },
  coin: () => { tone(1320, .08, 'square', .06); setTimeout(() => tone(1760, .12, 'square', .06), 70); },
  bad: () => tone(220, .25, 'sawtooth', .08, 140),
  notif: () => tone(990, .07, 'sine', .1),
  burn: () => tone(160, .35, 'sawtooth', .07, 90),
  perfect: () => [784, 988, 1318].forEach((f, i) => setTimeout(() => tone(f, .12, 'triangle', .13), i * 60)),
  bell: () => [1568, 1318].forEach((f, i) => setTimeout(() => tone(f, .3, 'sine', .12), i * 140))
};
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

/* ---------- Notifikasi ---------- */
function notify(txt, kind = '') {
  const box = $('#notifs'), n = document.createElement('div');
  if (box.firstChild && box.firstChild.innerHTML === txt && !box.firstChild.classList.contains('out')) return;
  n.className = 'notif ' + kind; n.innerHTML = txt; box.prepend(n);
  while (box.children.length > 2) box.lastChild.remove();
  SFX.notif();
  setTimeout(() => { n.classList.add('out'); setTimeout(() => n.remove(), 300); }, 2600);
}
function floatAt(elm, txt, cls = 'coinpop') {
  if (!elm) return; const r = elm.getBoundingClientRect(), f = document.createElement('div');
  f.className = cls; f.textContent = txt; f.style.left = (r.left + r.width / 2 - 20) + 'px'; f.style.top = (r.top) + 'px';
  document.body.appendChild(f); setTimeout(() => f.remove(), 1100);
}
function emote(elm, e) { if (!elm) return; const s = document.createElement('div'); s.className = 'emote'; s.textContent = e; elm.appendChild(s); setTimeout(() => s.remove(), 1000); }
function flyItem(fromEl, toEl, k) {
  if (!fromEl || !toEl) return;
  const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect(), f = document.createElement('div');
  f.className = 'fly'; f.innerHTML = ico('item_' + k, ITEMS[k].e);
  f.style.left = (a.left + a.width / 2 - 15) + 'px'; f.style.top = (a.top + a.height / 2 - 15) + 'px';
  
  document.body.appendChild(f);
  requestAnimationFrame(() => { f.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.8)`; });
  setTimeout(() => f.remove(), 470);
}

/* ---------- Menu ---------- */
function renderMenu() {
  $('#soundBtn').textContent = soundOn ? '🔊' : '🔇';
  $('#menuCoins').textContent = rm(P.coins);
  const G = prog(); applyScene();
  document.body.classList.toggle('loc-satay', LOC === 'satay');
  $('#signName').textContent = LOC === 'mamak' ? 'Mamak Rush' : LOCS[LOC].n; $('#signSub').textContent = LOCS[LOC].sub;
  $('#locs').innerHTML = Object.entries(LOCS).map(([k, l]) => { const o = locOpen(k), st = Object.values((k === 'mamak' ? P : P.L[k]).stars).reduce((a, b) => a + b, 0);
    return `<button type="button" data-loc="${k}" class="loc ${k === LOC ? 'on' : ''} ${o ? '' : 'lock'}"><span class="av">${ico('loc_' + k, l.ic)}</span><b>${l.n}</b><small>${o ? '⭐ ' + st : '🔒 Habiskan Mamak Hari ' + l.need}</small></button>`; }).join('');
  $('#playBtn').textContent = '▶ BUKA KEDAI · HARI ' + G.day;
  $('#menuArt').innerHTML = `<span class="av">${ico('item_teh', '☕')}</span><span class="av">${ico('cust_jamal', '🧑🏽')}</span><span class="av">${ico('item_roti', '🫓')}</span>`;
  const n = Math.max(7, Math.ceil(G.day / 7) * 7);
  $('#daysList').innerHTML = Array.from({ length: n }, (_, i) => {
    const d = i + 1, st = G.stars[d] || 0;
    return `<button type="button" data-d="${d}" class="${d > G.day ? 'lock' : d === G.day ? 'cur' : ''}">${d > G.day ? '🔒' : 'H' + d}<small>${'★'.repeat(st) || (d <= G.day ? '·' : '')}</small></button>`;
  }).join('');
}
$('#daysList').onclick = e => { const b = e.target.closest('button'); if (!b || b.classList.contains('lock')) return; startDay(+b.dataset.d); };
$('#playBtn').onclick = () => startDay(prog().day);
$('#locs').onclick = e => { const b = e.target.closest('[data-loc]'); if (!b) return; if (b.classList.contains('lock')) { SFX.bad(); return; } LOC = P.loc = b.dataset.loc; save(); SFX.tap(); renderMenu(); };
$('#shopBtn').onclick = () => openShop(0);
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set('sound', soundOn); renderMenu(); };
$('#resetBtn').onclick = () => { if (confirmReset()) { Object.assign(P, { day: 1, coins: 0, stars: {}, up: {}, reg: {}, L: { satay: { day: 1, stars: {} } }, seenT: {}, loc: 'mamak' }); LOC = 'mamak'; save(); renderMenu(); } };
let resetArm = 0;
function confirmReset() { if (Date.now() - resetArm < 3000) return true; resetArm = Date.now(); $('#resetBtn').textContent = 'Tap sekali lagi untuk reset'; setTimeout(() => $('#resetBtn').textContent = 'Reset progress', 3000); return false; }

/* ---------- Modal ---------- */
function modal(html) { $('#modalCard').classList.remove('shop'); $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }

let shopTab = 'dapur', justUp = null;
function levelUp(u, nextDay) {
  const lv = up(u.k), img = u.spr ? ico(u.spr + (u.max > 1 ? '_' + lv : ''), ico(u.spr, u.ic)) : u.ic;
  const was = u.spr && u.max > 1 && lv > 1 ? ico(u.spr + '_' + (lv - 1), u.ic) : '';
  modal(`<div class="lvup"><div class="rays"></div><h2>${u.max > 1 ? 'NAIK TAHAP!' : 'BARU!'}</h2>
    <div class="lv-row">${was ? `<span class="old av">${was}</span><span class="arr">➜</span>` : ''}<span class="new av">${img}</span></div>
    <b>${u.n}</b>${u.max > 1 ? `<div class="lvs big">${lvStars(u)}</div>` : ''}<p>${Array.isArray(u.d) ? u.d[lv - 1] : u.d}</p>
    <button class="btn gold" id="lvOk" type="button">MANTAP! 👍</button></div>`);
  $('#modalCard').onclick = e => { if (e.target.id === 'lvOk') openShop(nextDay); };
}
const TABS = [['dapur', '🍳 Dapur'], ['kedai', '🏠 Kedai'], ['staf', '👥 Pekerja']];
function openShop(nextDay) {
  const rows = `<div class="tabs">${TABS.map(([k, t]) => `<button type="button" data-tab="${k}" class="${shopTab === k ? 'on' : ''}">${t}</button>`).join('')}</div>` + UPS.filter(u => u.cat === shopTab).map(u => {
    const lv = up(u.k), max = lv >= u.max, locked = (u.need && P.day < u.need) || (u.loc && !locOpen(u.loc)), cost = u.cost[lv];
    return `<div class="up ${max ? 'max' : ''} ${justUp === u.k ? 'pop' : ''}"><span class="ic av">${u.spr ? ico(u.spr + (u.max > 1 ? '_' + Math.max(1, lv) : ''), ico(u.spr, u.ic)) : u.ic}</span><div><b>${u.n}</b>${u.max > 1 ? `<span class="lvs">${lvStars(u)}</span>` : ''}<small>${locked ? (u.loc ? 'Buka bila ' + LOCS[u.loc].n + ' dibuka' : 'Buka lepas Hari ' + u.need) : max && Array.isArray(u.d) ? 'Tahap maksimum! ' + u.d[u.d.length - 1].split(':')[0] : (lv && u.max > 1 ? 'Seterusnya: ' : '') + upDesc(u)}${u.staff ? ` · <b>gaji ${rm(u.wage)}/hari</b>` : ''}</small></div>
      <button type="button" data-k="${u.k}" ${max || locked || P.coins < cost ? 'disabled' : ''}>${max ? (u.staff ? 'KERJA ✓' : 'ADA ✓') : rm(cost)}</button></div>`;
  }).join('');
  const sc = $('#modalCard').classList.contains('shop') ? $('#modalCard').scrollTop : 0;
  modal(`<div class="sheet-head"><h2>🛠️ Upgrade</h2><span class="coins">💰 ${rm(P.coins)}</span><button class="x-btn" id="shopX" type="button" aria-label="Tutup">✕</button></div>${rows}
    <div class="sheet-foot"><button class="btn gold" id="shopDone" type="button">${nextDay ? '▶ HARI ' + nextDay : 'Siap'}</button></div>`);
  $('#modalCard').classList.add('shop'); $('#modalCard').scrollTop = sc;
  $('#modalCard').onclick = e => {
    if (e.target.closest('#shopX')) { closeModal(); if (nextDay) toMenu(); return; }
    const tb = e.target.closest('[data-tab]'); if (tb) { shopTab = tb.dataset.tab; justUp = null; SFX.tap(); openShop(nextDay); return; }
    const b = e.target.closest('button[data-k]');
    if (b) { const u = UPS.find(x => x.k === b.dataset.k), c = u.cost[up(u.k)]; if (P.coins >= c) { P.coins -= c; P.up[u.k] = up(u.k) + 1; save(); SFX.perfect(); buzz(20); justUp = u.k; levelUp(u, nextDay); renderMenu(); } return; }
    if (e.target.id === 'shopDone') { closeModal(); if (nextDay) startDay(nextDay); }
  };
}

/* ---------- Main run ---------- */
let R = null, raf = 0, lastT = 0;
function startDay(d) {
  closeModal();
  const nTables = 3 + up('tables');
  R = {
    day: d, t: DUR, earned: 0, served: 0, lost: 0, perfect: 0, paused: true, over: false,
    tables: Array(nTables).fill(null), grab: null, tray: [], trayMax: 4 + up('tray'), cat: null,
    spawnT: 1.2, grabT: rand(15, 25), catT: rand(14, 22), uid: 0, ev: eventFor(d), datukDone: false, azan: false, mist: { burn: 0, wrong: 0, spill: 0, stolen: 0, teh: 0 }, combo: 0, bestCombo: 0, regToday: [], anne: { t: 0, busy: false }, sitiT: 0,
    roti: { s: 'idle', t: 0, prog: 0, k: 'roti', eggs: 0 },
    teh: { s: 'idle', lvl: 0, hold: false, dir: 1, prog: 0 }, chips: {},
    maggi: LOC === 'satay' ? ['satay', ...(feat(d, 'satayd') ? ['satayd'] : [])].map(k => ({ s: 'idle', t: 0, k, fixed: true })) : Array.from({ length: feat(d, 'maggi') ? 1 + up('kuali') : 1 }, () => ({ s: 'idle', t: 0, k: 'maggi' })), loc: LOC,
    nasi: { stock: LOC === 'satay' ? 8 : nasiStock(), s: 'idle', t: 0 }
  };
  $('#menu').classList.add('hidden'); $('#game').classList.remove('hidden');
  $('#tables').className = 'tables n' + nTables;
  $('#deco').innerHTML = ['', '🪴', '🪴💡', '🪴💡🖼️'][up('deko')].replace(/🪴|💡|🖼️/gu, m => `<span class="av">${ico({ '🪴': 'deko_pokok', '💡': 'deko_lampu', '🖼️': 'deko_mural' }[m], m)}</span>`); $('#tv').classList.toggle('hidden', !up('tv')); if (SPR.up_tv) $('#tv').innerHTML = `<img src="${SPR.up_tv}" alt="">`; if (SPR.up_kipas) { $('#fan').innerHTML = `<img src="${SPR.up_kipas}" alt="">`; $('#fan').classList.add('spr'); } $('#fan').classList.toggle('hidden', !up('fan'));
  $('#door').innerHTML = `<span class="av">${ico('pintu', '🚪')}</span>`;
  $('#menuBoard').textContent = menuItems().map(k => ITEMS[k].e).join(' ');
  $('#notifs').innerHTML = '';
  const fl = document.querySelector('.shop-floor'); fl.classList.toggle('rain', R.ev === 'hujan'); fl.classList.toggle('senja', R.ev === 'berbuka');
  if (R.ev === 'bola') $('#tv').classList.remove('hidden');
  if (R.ev === 'hujan' && feat(d, 'grab')) R.grabT = 3;
  if (R.ev === 'berbuka') R.spawnT = 999;
  renderStations(); renderTables(); renderTray(); renderSide(); renderStaff(); hud();
  const u = (LOC === 'satay' ? SATAY_UNLOCK : UNLOCK)[d];
  document.body.classList.toggle('loc-satay', LOC === 'satay');
  modal(`<h2>Hari ${d}</h2>${u ? `<div class="new-box"><div class="ic">${u.ic}</div><b>${u.t}</b><span>${u.d}</span></div>` : (R.ev ? '' : '<p>Pelanggan makin ramai. Gerak laju!</p>')}${R.ev ? `<div class="new-box ev"><div class="ic">${EVENTS[R.ev].ic}</div><b>${u ? 'Event: ' : ''}${EVENTS[R.ev].t}</b><span>${EVENTS[R.ev].d}</span></div>` : ''}
    <p class="gtitle">Matlamat hari ni</p>${goalsHTML(d)}<button class="btn gold" id="goBtn" type="button">▶ JOM BUKA!</button>`);
  $('#modalCard').onclick = e => { if (e.target.id === 'goBtn') { closeModal(); R.paused = false; SFX.bell(); lastT = performance.now(); } };
  cancelAnimationFrame(raf); lastT = performance.now(); raf = requestAnimationFrame(loop);
}
const menuItems = () => menuItemsFor(R.day);
const menuItemsFor = d => LOC === 'satay' ? ['satay', 'teh', ...[['kuah', 'kuah'], ['satayd', 'satayd'], ['milo', 'milo']].filter(([f]) => feat(d, f)).map(x => x[1])] : ['roti', 'teh', ...[['maggi', 'maggi'], ['nasi', 'nasi'], ['milo', 'milo'], ['telur', 'rotitelur'], ['mee', 'mee'], ['murtabak', 'murtabak'], ['tosai', 'tosai']].filter(([f]) => feat(d, f)).map(x => x[1])];

$('#pauseBtn').onclick = () => {
  if (!R || R.over) return; R.paused = true;
  modal(`<h2>Rehat jap ☕</h2>${goalsHTML(R.day, R)}<button class="btn gold" id="resBtn" type="button">▶ Sambung</button><button class="btn" id="quitBtn" type="button">Keluar ke menu</button>`);
  $('#modalCard').onclick = e => {
    if (e.target.id === 'resBtn') { closeModal(); R.paused = false; lastT = performance.now(); }
    if (e.target.id === 'quitBtn') { R.over = true; closeModal(); toMenu(); }
  };
};
document.addEventListener('visibilitychange', () => { if (document.hidden && R && !R.over && !R.paused) $('#pauseBtn').onclick(); });
function toMenu() { cancelAnimationFrame(raf); $('#game').classList.add('hidden'); $('#menu').classList.remove('hidden'); renderMenu(); }

/* ---------- Pelanggan ---------- */
function makeOrder(n, vip, cheap) {
  const all = menuItems(), opts = cheap ? all.slice().sort((a, b) => ITEMS[a].price - ITEMS[b].price).slice(0, 3) : all, its = [];
  for (let i = 0; i < n; i++) {
    const k = pick(opts), m = {}, avail = (ITEM_MODS[k] || []).filter(x => feat(R.day, x));
    if (avail.length && (vip || Math.random() < .45)) { m[pick(avail)] = true; if (R.day >= 15 && Math.random() < .25) m[pick(avail)] = true; }
    if (m.dino && m.kurang) delete m.kurang;
    its.push({ k, m, done: false });
  }
  return its;
}
function patMax() { return Math.max(16, 34 - R.day * 1.1) * dekoPat(); }
function spawnCustomer(at, vip) {
  const free = R.tables.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  if (!free.length) return;
  const used = R.tables.filter(Boolean).map(c => c.who.k);
  const d = R.day, r = Math.random();
  const regPick = !vip && LOC === 'mamak' && d >= 6 && Math.random() < .3 ? Object.keys(REGS).filter(k => !used.includes(k) && !R.regToday.includes(k) && regOrder(k).length) : [];
  const regK = regPick.length ? pick(regPick) : null;
  let pool = CUSTS.filter(c => !used.includes(c.k) && traitOk(c));
  if (pool.some(c => c.t === 'influencer') && Math.random() > .35) pool = pool.filter(c => c.t !== 'influencer');
  const who = vip ? DATUK : regK ? CUSTS.find(c => c.k === regK) : pick(pool);
  const tr = !vip && !regK && TRAITS[who.t] ? TRAITS[who.t] : null;
  let n = vip ? 3 : d >= 8 && r < .15 ? 3 : r < Math.min(.65, .12 + d * .08) ? 2 : 1;
  if (tr && tr.one) n = 1; if (tr && tr.big) n = Math.min(3, Math.max(2, n + 1));
  const pm = patMax() * (vip ? .75 : 1) * (tr ? tr.pat : 1);
  const c = { id: ++R.uid, who, t: tr ? who.t : null, items: regK ? regOrder(regK) : makeOrder(n, vip, tr && tr.one), reg: regK, pat: pm, max: pm, angry: false, calmed: false, asked: vip, vip };
  if (tr && !P.seenT[who.t]) { P.seenT[who.t] = 1; save(); setTimeout(() => R && notify(`${tr.ic} <b>Pelanggan baru: ${tr.n}!</b> ${tr.d}`, 'info'), 900); }
  else if (c.t === 'influencer') notify('📸 <b>Mira Influencer</b> datang! Layan laju, boleh viral!', 'info');
  if (regK) {
    R.regToday.push(regK); const st = P.reg[regK] = P.reg[regK] || { h: 0, seen: false };
    c.hidden = false; c.biasa = st.seen; c.asked = true;
    if (!st.seen) { st.seen = true; save(); notify(`⭐ <b>${who.n}</b> nak jadi pelanggan tetap! Order kegemaran dia: ${c.items.map(i => ITEMS[i.k].name.toLowerCase() + (Object.keys(i.m).length ? ' (' + Object.keys(i.m).map(x => MOD_TXT[x]).join(', ') + ')' : '')).join(' + ')}`, 'info'); }
    else notify(`⭐ <b>${who.n}:</b> ${pick(['Macam biasa ya!', 'Biasa bos!', 'Yang selalu tu, ya!'])} <small>(${'❤️'.repeat(Math.min(5, st.h)) || '🤍'})</small>`, 'info');
  }
  if (vip) { notify('🎩 <b>Datuk Seri</b> dah sampai! Layan baik-baik, tip besar menanti!', 'info'); SFX.bell(); }
  if (!vip && !regK && c.t !== 'tenang' && feat(d, 'sabar') && Math.random() < Math.min(.45, .2 + (d - 4) * .04)) {
    c.angry = true;
    setTimeout(() => R && c === R.tables[R.tables.indexOf(c)] && notify(`😤 <b>${who.n}:</b> ${pick(['Lama lagi ke ni?!', 'Cepat sikit boleh tak?', 'Woi, order aku mana?', 'Aku nak cepat ni!'])}`, 'bad'), 400);
  }
  R.tables[at != null && at >= 0 && !R.tables[at] ? at : pick(free)] = c;
  renderTables(); serveFromTray();
}
function spawnGrab() {
  const c = { id: ++R.uid, who: GRAB, items: makeOrder(Math.random() < .5 ? 1 : 2), pat: 20, max: 20, grab: true };
  R.grab = c; renderSide();
  notify(`🛵 <b>Abang Grab:</b> ${pick(['Bungkus bos, cepat sikit!', 'Order online bos! Customer tengah tunggu!', 'Bos, rider dah sampai!'])}`, 'info');
  serveFromTray();
}
function custEl(c) { return c.grab ? $('#grabSpot .grab') : document.querySelector(`.cust[data-id="${c.id}"]`); }
function custDone(c) {
  const sum = c.items.reduce((s, i) => s + ITEMS[i.k].price, 0);
  const tipRate = (.15 + .6 * (c.pat / c.max)) * (up('tv') ? 1.25 : 1) * dekoTip() * (c.grab ? (R.ev === 'hujan' ? 2.3 : 1.8) : 1);
  const tt = TRAITS[c.t]; let pay = Math.round((sum + Math.round(sum * tipRate * (tt ? tt.tip : 1)) + (c.perf || 0)) * (c.vip ? 2.5 : 1) * (c.reg ? 1.2 + Math.min(10, (P.reg[c.reg] || {}).h || 0) * .05 : 1));
  if (c.reg) {
    const st = P.reg[c.reg]; st.h++; save();
    const sl = REGS[c.reg].story, idx = [2, 5, 9].indexOf(st.h);
    setTimeout(() => R && notify(idx >= 0 ? `💬 ${sl[idx]}` : `❤️ ${c.who.n} makin sayang kedai ni! (${st.h})`, 'good'), 700);
  }
  if (c.t === 'influencer') {
    if (c.pat / c.max > .34) { const b = 8 + R.day * 2; pay += b; R.viral = (R.viral || 0) + 1; R.tables.forEach(o => { if (o && o !== c && !o.gone) o.pat = Math.min(o.max, o.pat + o.max * .3); }); setTimeout(() => R && notify(`📸✨ <b>VIRAL!</b> Mira post video kedai, +${rm(b)} & semua pelanggan happy!`, 'good'), 300); SFX.perfect(); }
    else { const f = Math.min(R.earned, 5 + R.day); R.earned -= f; setTimeout(() => R && notify(`📸😒 Mira bagi review 2 bintang... -${rm(f)}`, 'bad'), 300); }
  }
  if (c.vip) { notify(`🎩 Datuk puas hati! Bayar ${rm(pay)}!`, 'good'); SFX.perfect(); }
  R.combo++; R.bestCombo = Math.max(R.bestCombo, R.combo);
  const cb = comboBonus();
  if (cb) { const extra = Math.max(1, Math.round(pay * cb)); pay += extra; if ([3, 5, 8, 12].includes(R.combo) || R.combo % 5 === 0) { notify(`🔥 <b>Combo x${R.combo}!</b> Tip +${Math.round(cb * 100)}%`, 'good'); SFX.perfect(); } }
  hudCombo();
  R.earned += pay; R.served++; SFX.coin(); buzz(15);
  const el = custEl(c); floatAt(el, '+' + rm(pay)); emote(el, c.grab ? '👍' : pick(['😋', '🥰', '😄', '❤️']));
  // Tambah satu!
  if (!c.grab && !c.asked && feat(R.day, 'tambah') && Math.random() < .35) {
    c.asked = true; const k = pick(menuItems()); c.items = [{ k, m: {}, done: false }]; c.pat = Math.min(c.max, c.pat + c.max * .35); c.perf = 0;
    notify(`🙋 <b>${c.who.n}:</b> ${pick(['Eh, tambah', 'Bos! Tambah', 'Sedap la, nak tambah'])} ${ITEMS[k].name.toLowerCase()} satu!`, 'good');
    setTimeout(() => { renderTables(); serveFromTray(); }, 500);
    return;
  }
  leave(c);
}
function leave(c, angry) {
  const el = custEl(c);
  if (angry && c.t === 'influencer') { const f = Math.min(R.earned, 8 + R.day); R.earned -= f; setTimeout(() => R && notify(`📸😡 Mira post review buruk! -${rm(f)}`, 'bad'), 200); }
  if (angry) { if (R.combo >= 3) notify(`💔 Combo x${R.combo} putus!`, 'bad'); R.combo = 0; hudCombo(); R.lost++; SFX.bad(); buzz([30, 40, 30]); notify(`😠 <b>${c.who.n}</b> ${pick(['blah... lambat sangat!', 'merajuk, tak jadi makan!', 'kata: "Kedai lain lagi laju!"'])}`, 'bad'); emote(el, '💢'); }
  if (el) el.classList.add('leave');
  if (!c.grab) chefSay(angry ? '😰' : '👋');
  setTimeout(() => {
    if (!R) return;
    if (c.grab) { if (R.grab === c) R.grab = null; renderSide(); }
    else { const i = R.tables.indexOf(c); if (i >= 0) R.tables[i] = null; renderTables(); }
  }, c.grab ? 450 : 850);
  c.gone = true;
}
function calm(c) {
  if (!c.angry || c.calmed || c.gone) return;
  c.calmed = true; c.angry = false; c.pat = Math.min(c.max, c.pat + c.max * .45);
  notify(`🙏 ${pick(['Sabar ye bang, kejap je siap!', 'Relaks bos, tengah buat ni!', 'Sikit je lagi, sumpah!'])}`, 'good');
  emote(custEl(c), '😌'); SFX.tap(); renderTables();
}
$('#tables').addEventListener('pointerdown', e => {
  const el = e.target.closest('.cust'); if (!el || !R) return;
  const c = R.tables.find(x => x && x.id === +el.dataset.id); if (c) calm(c);
});

/* ---------- Dulang & hantar ---------- */
// Mod "binari" mesti sama tepat; mod "kualiti" cuma wajib kalau pelanggan minta
const BIN_MODS = ['kurang', 'ikat', 'dino'], Q_MODS = ['kaw', 'garing'];
const MOD_TXT = { kaw: 'kaw', kurang: 'kurang manis', ikat: 'ikat tepi', garing: 'garing', dino: 'dinosaur' };
function matches(item, ord) {
  if (item.k !== ord.k) return false;
  for (const m of BIN_MODS) if (!!item.m[m] !== !!ord.m[m]) return false;
  for (const m of Q_MODS) if (ord.m[m] && !item.m[m]) return false;
  return true;
}
function needers(item) {
  const list = [];
  if (R.grab && !R.grab.gone) list.push(R.grab);
  R.tables.forEach(c => c && !c.gone && list.push(c));
  return list.filter(c => c.items.some(i => !i.done && matches(item, i))).sort((a, b) => (b.grab ? 1 : 0) - (a.grab ? 1 : 0) || a.pat / a.max - b.pat / b.max);
}
const wantsK = k => [R.grab, ...R.tables].some(c => c && !c.gone && c.items.some(i => !i.done && i.k === k));
function deliver(item, fromEl) {
  const c = needers(item)[0];
  if (c) {
    setTimeout(() => { clearTimeout(chefT); chefSet('serve'); chefT = setTimeout(() => chefSet('idle'), 700); }, 120);
    const it = c.items.find(i => !i.done && matches(item, i)); it.done = true;
    if (item.m.kaw || item.m.garing) c.perf = (c.perf || 0) + 2;
    flyItem(fromEl, custEl(c), item.k);
    setTimeout(() => {
      if (!R) return;
      c.grab ? renderSide() : renderTables();
      if (c.items.every(i => i.done)) custDone(c);
    }, 460);
    return true;
  }
  if (wantsK(item.k)) R.mist.wrong++, notify(`🤔 Ada yang order ${ITEMS[item.k].name.toLowerCase()}, tapi bukan macam ni. Tengok tag dia!`, 'bad');
  if (R.tray.length >= R.trayMax) { notify('🍽️ Dulang dah penuh! Tap makanan atas dulang untuk buang.', 'bad'); return false; }
  R.tray.push(item); flyItem(fromEl, $('#tray'), item.k); setTimeout(renderTray, 300);
  return true;
}
function serveFromTray() {
  let moved = false;
  for (let i = R.tray.length - 1; i >= 0; i--) {
    const t = R.tray[i];
    if (needers(t).length) { R.tray.splice(i, 1); const slot = $('#tray').children[i]; deliver(t, slot); moved = true; }
  }
  if (moved) renderTray();
}
const tagHTML = m => { const t = Object.keys(m || {}).filter(x => m[x]).map(x => MOD_TXT[x]); return t.length ? `<i class="tag">${t.join(' · ')}</i>` : ''; };
function renderTray() {
  if (!R) return;
  $('#tray').innerHTML = Array.from({ length: R.trayMax }, (_, i) => { const t = R.tray[i]; return t ? `<div class="slot full av" data-i="${i}">${ico('item_' + t.k, ITEMS[t.k].e)}${t.m.kaw || t.m.garing ? '<span class="star">✨</span>' : ''}${tagHTML({ kurang: t.m.kurang, ikat: t.m.ikat, dino: t.m.dino })}</div>` : '<div class="slot"></div>'; }).join('');
}
$('#tray').addEventListener('pointerdown', e => {
  const s = e.target.closest('.slot.full'); if (!s || !live()) return;
  const t = R.tray.splice(+s.dataset.i, 1)[0]; renderTray(); SFX.tap();
  notify(`🗑️ Buang ${ITEMS[t.k].name.toLowerCase()}`, '');
});

/* ---------- Render meja ---------- */
const heartsN = c => Math.max(0, Math.ceil(c.pat / c.max * 3));
const heartsTxt = n => '❤️'.repeat(n) + '🤍'.repeat(3 - n);
const NAME_TAG = { maggi: 'MAGGI', mee: 'MEE', satay: 'AYAM', satayd: 'DAGING' };
function orderHTML(c) { return `<div class="order${c.reg ? ' reg' : ''}"><span class="hearts" data-h="${heartsN(c)}">${heartsTxt(heartsN(c))}</span>${c.hidden || c.biasa ? '<i class="biasa">⭐ macam biasa</i>' : ''}${c.items.map(i => c.hidden && !i.done ? '<span class="it"><span class="av q">❓</span></span>' : `<span class="it ${i.done ? 'done' : ''}"><span class="av">${ico('item_' + i.k, ITEMS[i.k].e)}</span>${NAME_TAG[i.k] ? `<b class="ntag ${i.k}">${NAME_TAG[i.k]}</b>` : ''}${tagHTML(i.m)}</span>`).join('')}<div class="pat"><b class="${patCls(c)}" style="width:${c.pat / c.max * 100}%"></b></div></div>`; }
function patCls(c) { const f = c.pat / c.max; return f > .5 ? '' : f > .25 ? 'mid' : 'low'; }
function fitTables() {
  const box = $('#tables'); if (!box || !R) return;
  const n = R.tables.length, rows = n <= 3 ? 1 : 2, h = box.clientHeight - 26;
  if (h > 50) {
    const th = Math.max(80, Math.min(240, h / rows - 6)); box.style.setProperty('--th', th + 'px');
    const t = box.querySelector('.table'); if (t) { const w = t.clientWidth * (n === 5 || n === 3 ? 1.12 : 1.06); box.style.setProperty('--mh', Math.min(th * .66, w * .75) + 'px'); }
  }
}
addEventListener('resize', fitTables);
function renderTables() {
  if (!R) return;
  requestAnimationFrame(fitTables); setTimeout(markShown, 0);
  $('#tables').innerHTML = R.tables.map((c, ti) => `<div class="table spot" style="z-index:${ti + 1}"><span class="shadow"></span>${c ? `
    <div class="cust ${c.angry ? 'angry' : ''} ${c.shown ? '' : 'enter'} ${c.gone ? 'leave' : ''}" data-id="${c.id}">${orderHTML(c)}<span class="av">${ico('cust_' + c.who.k, c.who.e)}</span><div class="plate">${c.items.filter(i => i.done).map(i => `<span class="av">${ico('item_' + i.k, ITEMS[i.k].e)}</span>`).join('')}</div>${c.t ? `<span class="trait">${TRAITS[c.t].ic}</span>` : ''}${c.angry ? '<span class="calm-tag">TAP: Sabar!</span>' : ''}</div>` : ''}</div>`).join('');
}
function markShown() { R.tables.forEach(c => { if (c) c.shown = true; }); }
function renderSide() {
  if (!R) return;
  const g = R.grab;
  $('#grabSpot').innerHTML = g ? `<div class="grab">${orderHTML(g)}<span class="av">${ico('cust_grab', '🛵')}</span></div>` : '';
  $('#catSpot').innerHTML = R.cat ? `<div class="cat"><span class="av">${ico('cust_oyen', '🐈')}</span></div>` : '';
}
$('#catSpot').addEventListener('pointerdown', () => {
  if (!R || !R.cat) return; R.cat = null; renderSide();
  notify(pick(['🐈 Shuh shuh! Oyen lari.', '🐈 Oyen kena halau. Meow 😿', '🐈 Selamat makanan!']), 'good'); SFX.tap(); buzz(10);
});

/* ---------- Chef (gaya Cooking Diary) ---------- */
let chefT = 0, chefPose = 'idle';
function chefSet(pose) {
  chefPose = pose; const el = $('#chef'); if (!el) return;
  el.className = 'chef ' + pose;
  const k = 'chef_' + (pose === 'walk' ? 'walk' : pose), v = ico(SPR[k] ? k : 'chef_idle', '👨🏽‍🍳');
  const a = el.querySelector('.av'); if (a._v !== v) { a._v = v; a.innerHTML = v; }
}
function chefTo(target, pose = 'cook') {
  const ch = $('#chef'), kit = $('#kitchen'); if (!ch || !kit || !target) return;
  const kb = kit.getBoundingClientRect(), tb = target.getBoundingClientRect();
  const x = Math.max(0, Math.min(kb.width - ch.offsetWidth, tb.left - kb.left + tb.width / 2 - ch.offsetWidth / 2));
  const cur = parseFloat(ch.style.left) || 0, far = Math.abs(x - cur) > 8;
  ch.style.setProperty('--flip', x < cur ? -1 : 1);
  ch.style.left = x + 'px';
  clearTimeout(chefT);
  if (far) { chefSet('walk'); chefT = setTimeout(() => { chefSet(pose); chefT = setTimeout(() => chefSet('idle'), 900); }, 380); }
  else { chefSet(pose); chefT = setTimeout(() => chefSet('idle'), 900); }
}
function chefSay(e) { const ch = $('#chef'); if (ch) emote(ch, e); }

/* ---------- Stesen ---------- */
const ROTI_KINDS = [
  { k: 'roti', f: null, n: 'Kosong', e: '🫓', eggs: 0, cook: () => 3.5 * tawaMul() },
  { k: 'rotitelur', f: 'telur', n: 'Telur', e: '🍳', eggs: 1, cook: () => 4.2 * tawaMul() },
  { k: 'murtabak', f: 'murtabak', n: 'Murtabak', e: '🥙', eggs: 2, cook: () => 6 * tawaMul() },
  { k: 'tosai', f: 'tosai', n: 'Tosai', e: '🥞', eggs: 0, circle: true, cook: () => 3 * tawaMul() }
];
const READY_WIN = 5, MAGGI_COOK = 4.2, MEE_COOK = 5.5, NASI_COOK = 5, GARING_AT = .62;
const tehZone = () => { const w = .14 + up('teko') * .05; return [.72 - w / 2, .72 + w / 2]; };
const MILO_ZONE = [.75, 1.1];
const rotiOpts = () => ROTI_KINDS.filter(x => !x.f || feat(R.day, x.f));
const panOpts = () => LOC === 'satay' ? (feat(R.day, 'satayd') ? ['satay', 'satayd'] : ['satay']) : feat(R.day, 'mee') ? ['maggi', 'mee'] : ['maggi'];
const PAN = {
  maggi: { n: 'Maggi', cook: () => MAGGI_COOK * apiMul(), idle: 'st_kuali', ie: '🍳', raw: 'st_kuali_masak', re: '🥘', burn: 'st_hangus_maggi', be: '🍜', go: 'Tap masak', cookT: 'Goreng...', stirT: 'KACAU!' },
  mee: { n: 'Mee', stir: true, cook: () => MEE_COOK * apiMul(), idle: 'st_kuali', ie: '🍳', raw: 'st_kuali_masak', re: '🥘', burn: 'st_hangus_maggi', be: '🍜', go: 'Tap masak', cookT: 'Mee...', stirT: 'KACAU!', stirMsg: '🔥 Mee tak kacau, melekat hangus!' },
  satay: { n: 'Ayam', stir: true, gar: true, cook: () => 4.5 * baraMul(), idle: 'st_bara', ie: '🔥', raw: 'st_satay_bakar', re: '🍢', burn: 'st_hangus_satay', be: '⚫', go: 'Tap bakar', cookT: 'Bakar...', stirT: '🔄 PUSING!', stirMsg: '🔥 Satay tak pusing, hangus sebelah!' },
  satayd: { n: 'Daging', stir: true, gar: true, cook: () => 6 * baraMul(), idle: 'st_bara', ie: '🔥', raw: 'st_satay_bakar', re: '🥩', burn: 'st_hangus_satay', be: '⚫', go: 'Tap bakar', cookT: 'Bakar...', stirT: '🔄 PUSING!', stirMsg: '🔥 Satay tak pusing, hangus sebelah!' }
};

function renderStations() {
  if (!R) return;
  const d = R.day, h = [];
  if (LOC !== 'satay') h.push(`<div class="st" id="stRoti"><span class="lbl">TAWA ROTI</span><span class="big av"></span><span class="hint"></span><div class="choose"></div><span class="bar"><b></b><em class="gz"></em></span></div>`);
  const chips = [feat(d, 'kurang') && ['kurang', '🍬'], feat(d, 'ikat') && ['ikat', '🛍️'], feat(d, 'dino') && ['dino', '🦕']].filter(Boolean);
  h.push(`<div class="st" id="stTeh"><span class="lbl">${feat(d, 'milo') ? 'AIR' : 'TEH TARIK'}</span><span class="teh-stream"></span><span class="big av"></span><span class="hint"></span><div class="choose"></div>
    <div class="chips">${chips.map(([k, t]) => `<button type="button" class="chip" data-chip="${k}" title="${MOD_TXT[k]}">${t}</button>`).join('')}</div><div class="meter"><span class="zone"></span><span class="lvl"></span></div></div>`);
  if (LOC === 'satay' || feat(d, 'maggi')) h.push(`<div class="st sub${LOC === 'satay' ? ' bara' : ''}" id="stMaggi"><span class="lbl">${LOC === 'satay' ? 'PEMANGGANG' : feat(d, 'mee') ? 'KUALI' : 'MAGGI'}</span>${R.maggi.map((_, i) => `<div class="pan" data-i="${i}"><span class="big av"></span><span class="hint"></span><div class="choose"></div><span class="bar"><b></b></span></div>`).join('')}</div>`);
  if (feat(d, LOC === 'satay' ? 'kuah' : 'nasi')) h.push(`<div class="st" id="stNasi"><span class="lbl">${LOC === 'satay' ? 'KUAH KACANG' : 'NASI LEMAK'}</span><span class="cnt"></span><span class="big av"></span><span class="hint"></span><span class="bar"><b></b></span></div>`);
  const unlockDay = f => { for (let x = d; x < 60; x++) if (feat(x, f)) return x; return '?'; };
  const lockSt = (n, f, ic) => `<div class="st locked"><span class="lbl">${n}</span><span class="big av">${ic}</span><span class="hint">🔒 Hari ${unlockDay(f)}</span></div>`;
  if (LOC !== 'satay') {
    if (!feat(d, 'maggi')) h.splice(2, 0, lockSt('MAGGI', 'maggi', ico('st_kuali', '🍳')));
    if (!feat(d, 'nasi')) h.push(lockSt('NASI LEMAK', 'nasi', ico('item_nasi', '🍛')));
  } else if (!feat(d, 'kuah')) h.push(lockSt('KUAH KACANG', 'kuah', ico('item_kuah', '🥜')));
  $('#stations').innerHTML = h.join('');
  $('#stations').className = 'stations s' + h.length; $('#stations').style.setProperty('--sc', h.length);
  [['stRoti', 'tawa', 3], ['stTeh', 'teko', 3], LOC === 'satay' ? ['stMaggi', 'bara', 3] : ['stMaggi', 'api', 2], ['stNasi', 'periuk', 2]].forEach(([id, k, mx]) => {
    const el = $('#' + id); if (!el) return; const lv = up(k);
    el.classList.add('lv' + lv); el.querySelector(':scope > .lbl').insertAdjacentHTML('beforeend', lv ? ` <i class="lvb">${'★'.repeat(lv)}</i>` : '');
    const bg = SPR['stbg_' + k + '_' + lv]; if (bg) { el.style.backgroundImage = `url(${bg})`; el.classList.add('has-bg'); }
    const eq = SPR[{ tawa: 'up_tawa_', teko: 'up_teko_', api: 'up_api_', periuk: 'up_periuk_', bara: 'up_bara_' }[k] + Math.max(1, lv)];
    if (eq && lv) el.insertAdjacentHTML('afterbegin', `<img class="equip" src="${eq}" alt="">`);
    if (lv >= mx) el.insertAdjacentHTML('afterbegin', '<span class="shine"></span>');
  });
  $('#stTeh').classList.toggle('has-tarik', !!SPR.st_tarik);
  $('#stTeh').classList.toggle('has-chips', chips.length > 0);
  R.chooseKeys = {};
  bindStations(); drawStations();
  $('#stations').onpointerdown = e => { if (!live()) return; const t = e.target.closest('.pan') || e.target.closest('.st'); if (t) chefTo(t, t.id === 'stTeh' ? 'tarik' : 'cook'); };
  requestAnimationFrame(() => { const st = $('#stations .st'); if (st) chefTo(st, 'idle'); chefSet('idle'); });
}
function setChoose(el, key, html) {
  if (!el) return; const box = el.querySelector(':scope > .choose'); if (!box) return;
  if (R.chooseKeys[el.id || el.dataset.i] === key) return;
  R.chooseKeys[el.id || el.dataset.i] = key; box.innerHTML = html || ''; el.classList.toggle('choosing', !!html);
}
function setSt(el, big, hint, bar, cls) {
  if (!el) return;
  const bg = el.querySelector('.big'), ht = el.querySelector('.hint');
  if (bg._v !== big) { bg._v = big; bg.innerHTML = big; }
  if (ht._v !== hint) { ht._v = hint; ht.innerHTML = hint; }
  const b = el.querySelector('.bar b'); if (b) b.style.width = (Math.max(0, Math.min(1, bar)) * 100) + '%';
  el.classList.toggle('ready', cls === 'ready'); el.classList.toggle('burn', cls === 'burn');
}
function drawStations() {
  if (!R) return;
  // TAWA
  const r = R.roti, rEl = $('#stRoti') || document.createElement('div'), kind = ROTI_KINDS.find(x => x.k === r.k) || ROTI_KINDS[0], opts = rotiOpts();
  if (rEl.isConnected) setChoose(rEl, r.s === 'idle' && opts.length > 1 ? 'pick' : '', r.s === 'idle' && opts.length > 1 ? opts.map(o => `<button type="button" data-roti="${o.k}"><span class="av">${ico('item_' + o.k, o.e)}</span>${o.n}</button>`).join('') : '');
  if (rEl.isConnected) { rEl.querySelector('.big').style.transform = ''; const gz = rEl.querySelector('.gz'); gz.style.display = r.s === 'ready' && feat(R.day, 'garing') && (r.k === 'roti' || r.k === 'rotitelur') ? 'block' : 'none';
  if (r.s === 'idle') setSt(rEl, opts.length > 1 ? '' : ico('st_doh', '⚪'), opts.length > 1 ? '' : 'Tap ambik doh', 0);
  else if (r.s === 'tebar') { setSt(rEl, ico('st_doh', '⚪'), kind.circle ? '🔄 Swipe bulat-bulat!' : '<span class="swipe-arrow">👉</span> Swipe tebar!', r.prog); rEl.querySelector('.big').style.transform = `scale(${1 + r.prog * .5}) rotate(${r.prog * 200}deg)`; }
  else if (r.s === 'egg') setSt(rEl, ico('st_telur', '🥚'), `Tap pecah telur! (${r.eggs})`, 0, 'ready');
  else if (r.s === 'cook') setSt(rEl, ico('st_roti_masak', '🫓'), `Masak ${kind.n.toLowerCase()}...`, 1 - r.t / kind.cook());
  else if (r.s === 'ready') {
    const canG = gz.style.display === 'block', g = canG && r.t / READY_WIN < GARING_AT;
    const wantG = canG && [R.grab, ...R.tables].some(c => c && !c.gone && c.items.some(i => !i.done && i.k === r.k && i.m.garing));
    setSt(rEl, ico('item_' + r.k, kind.e), g ? '🔥 GARING! Tap!' : wantG ? '⏳ Tunggu garing...' : '✨ Tap ambik!', r.t / READY_WIN, 'ready');
    rEl.classList.toggle('garing', g);
  }
  else if (r.s === 'burn') setSt(rEl, ico('st_hangus', '🫓'), '🔥 Hangus! Tap buang', 0, 'burn');
  }

  // AIR
  const t = R.teh, tEl = $('#stTeh'), milo = feat(R.day, 'milo');
  tEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', !!R.chips[c.dataset.chip]));
  const z = t.s === 'shake' ? MILO_ZONE.map(v => v / 1.25) : tehZone(), zone = tEl.querySelector('.zone');
  zone.style.bottom = (z[0] * 100) + '%'; zone.style.height = ((z[1] - z[0]) * 100) + '%';
  tEl.querySelector('.meter').style.visibility = t.s === 'idle' && milo ? 'hidden' : 'visible';
  tEl.querySelector('.lvl').style.height = ((t.s === 'shake' ? t.prog / 1.25 : t.lvl) * 100) + '%';
  tEl.querySelector('.teh-stream').style.height = t.hold ? (20 + t.lvl * 60) + 'px' : '0';
  setChoose(tEl, t.s === 'idle' && milo ? 'pick' : '', t.s === 'idle' && milo ? `<button type="button" data-air="teh"><span class="av">${ico('item_teh', '☕')}</span>Teh<small>tahan</small></button><button type="button" data-air="milo"><span class="av">${ico('item_milo', '🥤')}</span>Milo<small>tahan</small></button>` : '');
  const setTxt = (e, v) => { if (e._v !== v) { e._v = v; e.innerHTML = v; } };
  if (t.s === 'idle') { setTxt(tEl.querySelector('.big'), milo ? '' : ico('st_teko', '🫖')); setTxt(tEl.querySelector('.hint'), milo ? '' : 'Tahan, lepas kat hijau'); }
  else if (t.s === 'shake') { setTxt(tEl.querySelector('.big'), ico('st_milo', '🥤')); setTxt(tEl.querySelector('.hint'), '↕️ Swipe atas-bawah, lepas kat hijau'); }

  // KUALI
  if ($('#stMaggi')) R.maggi.forEach((m, i) => {
    const el = document.querySelector(`#stMaggi .pan[data-i="${i}"]`); if (!el) return;
    const po = m.fixed ? [m.k] : panOpts(), b = el.querySelector('.bar b'), pk = PAN[m.k];
    setChoose(el, m.s === 'idle' && po.length > 1 ? 'pick' : '', m.s === 'idle' && po.length > 1 ? po.map(k => `<button type="button" data-pan="${k}"><span class="av">${ico('item_' + k, ITEMS[k].e)}</span>${PAN[k].n}</button>`).join('') : '');
    const gar = m.s === 'ready' && feat(R.day, 'garing') && PAN[m.k].gar && m.t / READY_WIN < GARING_AT;
    el.classList.toggle('ready', m.s === 'ready' || m.s === 'stir'); el.classList.toggle('burn', m.s === 'burn'); el.classList.toggle('garing', gar);
    if (m.fixed) { let n = el.querySelector('.pcnt'); if (!n) { n = document.createElement('i'); n.className = 'pcnt'; el.appendChild(n); } const tx = m.s === 'ready' ? '×' + m.left : PAN[m.k].n; if (n.textContent !== tx) n.textContent = tx; }
    const pb = el.querySelector('.big'), pv = m.s === 'idle' ? (po.length > 1 ? '' : m.fixed ? ico('item_' + m.k, ITEMS[m.k].e) : ico(PAN[po[0]].idle, PAN[po[0]].ie)) : m.s === 'burn' ? ico(pk.burn, pk.be) : m.s === 'ready' ? ico('item_' + m.k, ITEMS[m.k].e) : ico(pk.raw, pk.re);
    if (pb._v !== pv) { pb._v = pv; pb.innerHTML = pv; }
    const ph = el.querySelector('.hint'), hv = m.s === 'idle' ? (po.length > 1 ? '' : PAN[po[0]].go) : m.s === 'cook' ? pk.cookT : m.s === 'stir' ? pk.stirT : m.s === 'ready' ? (gar ? '🔥 GARING!' : '✨ Ambik!') : '🔥 Buang';
    if (ph._v !== hv) { ph._v = hv; ph.innerHTML = hv; }
    b.style.width = (m.s === 'cook' ? 1 - m.t / (m.T || MAGGI_COOK) : m.s === 'ready' ? m.t / READY_WIN : m.s === 'stir' ? m.st / 1.6 : 0) * 100 + '%';
  });
  if ($('#stNasi')) {
    const n = R.nasi, el = $('#stNasi'), sk = LOC === 'satay' ? 'kuah' : 'nasi';
    el.querySelector('.cnt').textContent = n.s === 'cook' ? '...' : n.stock + (sk === 'kuah' ? ' mangkuk' : ' bungkus');
    setSt(el, n.s === 'cook' ? ico(sk === 'kuah' ? 'st_periuk_kuah' : 'st_periuk', '♨️') : ico('item_' + sk, ITEMS[sk].e), n.s === 'cook' ? (sk === 'kuah' ? 'Masak kuah...' : 'Masak nasi...') : n.stock ? 'Tap ambik' : 'Habis! Tap masak', n.s === 'cook' ? 1 - n.t / nasiCook() : 0);
  }
}
function drinkMods(k) {
  const m = {};
  if (R.chips.kurang) m.kurang = true;
  if (R.chips.ikat) m.ikat = true;
  if (k === 'milo' && R.chips.dino) m.dino = true;
  R.chips = {};
  return m;
}
function startRoti(k) {
  const r = R.roti; r.k = k; r.s = 'tebar'; r.prog = 0; r.ang = null; SFX.tap();
  const kind = ROTI_KINDS.find(x => x.k === k); r.eggs = kind.eggs;
}
function afterTebar() {
  const r = R.roti, kind = ROTI_KINDS.find(x => x.k === r.k);
  if (r.eggs > 0) { r.s = 'egg'; } else { r.s = 'cook'; r.t = kind.cook(); }
  tone(300, .2, 'sawtooth', .05, 500);
}
function bindStations() {
  // TAWA
  const rEl = $('#stRoti') || document.createElement('div'); let lastX = null, lastY = null;
  rEl.addEventListener('pointerdown', e => {
    if (!live()) return; const r = R.roti;
    const pickB = e.target.closest('[data-roti]');
    if (r.s === 'idle') { if (pickB) startRoti(pickB.dataset.roti); else if (rotiOpts().length === 1) startRoti('roti'); drawStations(); return; }
    if (r.s === 'tebar') { r.prog = Math.min(1, r.prog + .06); lastX = e.clientX; lastY = e.clientY; r.ang = null; rEl.setPointerCapture(e.pointerId); }
    else if (r.s === 'egg') { r.eggs--; tone(900, .06, 'square', .08); emote(rEl, '🥚'); if (r.eggs <= 0) { r.s = 'cook'; r.t = ROTI_KINDS.find(x => x.k === r.k).cook(); } }
    else if (r.s === 'ready') {
      const garing = feat(R.day, 'garing') && (r.k === 'roti' || r.k === 'rotitelur') && r.t / READY_WIN < GARING_AT;
      if (deliver({ k: r.k, m: garing ? { garing: true } : {} }, rEl)) { r.s = 'idle'; SFX.tap(); if (garing) { SFX.perfect(); notify('🔥 Roti garing rangup!', 'good'); } }
    }
    else if (r.s === 'burn') { r.s = 'idle'; SFX.tap(); }
    if (r.s !== 'tebar' && r.prog >= 1) r.prog = 0;
    drawStations();
  });
  rEl.addEventListener('pointermove', e => {
    const r = R && R.roti; if (!r || r.s !== 'tebar' || lastX == null) return;
    const kind = ROTI_KINDS.find(x => x.k === r.k);
    if (kind.circle) {
      const bx = rEl.getBoundingClientRect(), cx = bx.left + bx.width / 2, cy = bx.top + bx.height / 2, a = Math.atan2(e.clientY - cy, e.clientX - cx);
      if (r.ang != null) { let da = a - r.ang; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; r.prog = Math.min(1, r.prog + Math.abs(da) / (Math.PI * 4)); }
      r.ang = a;
    } else r.prog = Math.min(1, r.prog + Math.abs(e.clientX - lastX) / 520);
    lastX = e.clientX; lastY = e.clientY;
    if (r.prog >= 1) { lastX = null; afterTebar(); }
    drawStations();
  });
  rEl.addEventListener('pointerup', () => { lastX = null; const r = R && R.roti; if (r && r.s === 'tebar' && r.prog >= 1) afterTebar(); });

  // AIR
  const tEl = $('#stTeh'); let lastShakeY = null;
  const startTeh = e => { const t = R.teh; t.hold = true; t.lvl = 0; t.dir = 1; t.s = 'tarik'; tEl.setPointerCapture(e.pointerId); const bb = tEl.querySelector('.big'), hh = tEl.querySelector('.hint'); bb.innerHTML = ico('st_tarik', '🫖'); hh.innerHTML = 'Tariiik...'; bb._v = hh._v = null; };
  tEl.addEventListener('pointerdown', e => {
    if (!live()) return; const t = R.teh;
    const chip = e.target.closest('[data-chip]');
    if (chip) { R.chips[chip.dataset.chip] = !R.chips[chip.dataset.chip]; SFX.tap(); drawStations(); return; }
    if (t.s === 'idle') {
      if (!feat(R.day, 'milo')) { startTeh(e); t.kind = 'teh'; return; }
      const b = e.target.closest('[data-air]'); if (!b) return;
      startTeh(e); t.kind = b.dataset.air;
      if (t.kind === 'milo') { tEl.querySelector('.big').innerHTML = ico('st_milo', '🥤'); tEl.querySelector('.hint').innerHTML = 'Tahan, lepas kat hijau'; }
      drawStations(); return;
    }
    if (t.s === 'shake') { lastShakeY = e.clientY; tEl.setPointerCapture(e.pointerId); }
  });
  tEl.addEventListener('pointermove', e => {
    const t = R && R.teh; if (!t || t.s !== 'shake' || lastShakeY == null) return;
    t.prog += Math.abs(e.clientY - lastShakeY) / 700; lastShakeY = e.clientY;
    if (Math.random() < .15) tone(500 + Math.random() * 300, .03, 'triangle', .05);
    if (t.prog > 1.25) { t.prog = 0; t.s = 'idle'; lastShakeY = null; R.mist.spill++; SFX.burn(); notify('🥤 Alamak, Milo melimpah! Goncang perlahan sikit.', 'bad'); }
    drawStations();
  });
  const rel = () => {
    const t = R && R.teh; if (!t) return;
    if (t.s === 'shake') {
      lastShakeY = null;
      if (t.prog >= MILO_ZONE[0] && t.prog <= MILO_ZONE[1]) { deliver({ k: 'milo', m: drinkMods('milo') }, tEl); t.s = 'idle'; t.prog = 0; SFX.ready(); }
      drawStations(); return;
    }
    if (!t.hold) return; t.hold = false; t.s = 'idle';
    const [a, b] = tehZone(), perf = t.lvl >= a && t.lvl <= b, ok = t.lvl >= .3;
    if (!ok) { R.mist.teh++; notify(t.kind === 'milo' ? '🥤 Milo tak cukup penuh, cuba lagi!' : '☕ Tarik tak cukup tinggi, cuba lagi!', 'bad'); t.lvl = 0; drawStations(); return; }
    if (t.kind === 'milo') { if (perf) { R.perfect++; SFX.perfect(); notify('✨ Milo ais penuh, sejuk gila!', 'good'); buzz(20); } else SFX.tap(); deliver({ k: 'milo', m: drinkMods('milo') }, tEl); t.lvl = 0; t.kind = 'teh'; drawStations(); return; }
    if (perf) { R.perfect++; SFX.perfect(); notify(feat(R.day, 'kaw') ? '✨ Teh tarik KAW! Buih tebal!' : '✨ Teh tarik buih tebal! Perfect!', 'good'); buzz(20); } else SFX.tap();
    const m = drinkMods('teh'); if (perf) m.kaw = true;
    deliver({ k: 'teh', m }, tEl); t.lvl = 0; drawStations();
  };
  tEl.addEventListener('pointerup', rel); tEl.addEventListener('pointercancel', rel);

  // KUALI
  const mEl = $('#stMaggi');
  if (mEl) mEl.addEventListener('pointerdown', e => {
    const p = e.target.closest('.pan'); if (!p || !live()) return; const m = R.maggi[+p.dataset.i];
    if (m.s === 'idle') {
      const b = e.target.closest('[data-pan]'), k = m.fixed ? m.k : panOpts().length > 1 ? (b && b.dataset.pan) : panOpts()[0]; if (!k) return; m.left = m.fixed ? 2 : 1;
      m.k = k; m.s = 'cook'; m.t = m.T = PAN[k].cook(); m.stir = false; tone(200, .3, 'sawtooth', .04, 260);
    }
    else if (m.s === 'stir') { m.stir = true; m.s = 'cook'; tone(700, .08, 'triangle', .1); emote(p, '🥄'); }
    else if (m.s === 'ready') { const g = PAN[m.k].gar && feat(R.day, 'garing') && m.t / READY_WIN < GARING_AT; if (deliver({ k: m.k, m: g ? { garing: true } : {} }, p)) { if (--m.left > 0) { drawStations(); return; } m.s = 'idle'; if (g) { SFX.perfect(); notify('🔥 Satay garing, bau sampai jalan!', 'good'); } } }
    else if (m.s === 'burn') m.s = 'idle';
    drawStations();
  });
  const nEl = $('#stNasi');
  if (nEl) nEl.addEventListener('pointerdown', () => {
    if (!live()) return; const n = R.nasi;
    if (n.s === 'cook') return;
    if (n.stock > 0) { if (deliver({ k: LOC === 'satay' ? 'kuah' : 'nasi', m: {} }, nEl)) n.stock--; }
    else { n.s = 'cook'; n.t = nasiCook(); SFX.tap(); }
    drawStations();
  });
}
function staffEl(k) { return document.querySelector(`.staff[data-k="${k}"]`); }
function stepStaff(dt) {
  // Anne: teh biasa
  if (up('anne')) {
    const a = R.anne;
    const plain = { k: 'teh', m: {} };
    if (!a.busy && needers(plain).length > R.tray.filter(x => x.k === 'teh' && matches(x, { k: 'teh', m: {} })).length) { a.busy = true; a.t = 5; }
    if (a.busy) {
      a.t -= dt; const el = staffEl('anne'); if (el) el.style.setProperty('--p', (1 - a.t / 5) * 100 + '%');
      if (a.t <= 0) { a.busy = false; if (el) el.style.setProperty('--p', '0%'); deliver(plain, el || $('#stTeh')); }
    }
  }
  // Ravi: tebar roti kosong
  if (LOC !== 'satay' && up('ravi') && R.roti.s === 'idle' && needers({ k: 'roti', m: {} }).length + needers({ k: 'roti', m: { garing: true } }).length > R.tray.filter(x => x.k === 'roti').length) {
    R.roti.k = 'roti'; R.roti.s = 'cook'; R.roti.t = ROTI_KINDS[0].cook(); emote(staffEl('ravi'), '🫓');
  }
  // Kak Siti: tenangkan & halau kucing
  if (up('siti')) {
    R.sitiT -= dt;
    if (R.sitiT <= 0) {
      const c = R.tables.find(x => x && x.angry && !x.calmed && !x.gone);
      if (c) { calm(c); emote(staffEl('siti'), '🙏'); R.sitiT = 6; }
    }
    if (R.cat && R.cat.t < 2.2) { R.cat = null; renderSide(); notify('🧕🏻 Kak Siti halau Oyen. "Shuh! Shuh!"', 'good'); emote(staffEl('siti'), '🧹'); }
  }
}
function renderStaff() {
  const box = $('#staffBar'); if (!box) return;
  box.innerHTML = UPS.filter(u => u.staff && up(u.k)).map(u => `<div class="staff" data-k="${u.k}"><span class="av">${ico(u.spr, u.ic)}</span><b>${u.n.split('(')[0].replace('Upah ', '')}</b></div>`).join('');
}
function stepStations(dt) {
  const r = R.roti;
  if (r.s === 'cook' && (r.t -= dt) <= 0) { r.s = 'ready'; r.t = READY_WIN; SFX.ready(); }
  else if (r.s === 'ready' && (r.t -= dt) <= 0) { r.s = 'burn'; R.mist.burn++; SFX.burn(); notify('🔥 Alamak, roti hangus!', 'bad'); }
  const t = R.teh;
  if (t.hold) { const sp = 1 / (1.25 + up('teko') * .2); t.lvl += t.dir * dt * sp; if (t.lvl >= 1) { t.lvl = 1; t.dir = -1; } if (t.lvl <= 0) { t.lvl = 0; t.dir = 1; } }
  R.maggi.forEach(m => {
    if (m.s === 'cook') {
      m.t -= dt;
      if (PAN[m.k].stir && !m.stir && m.t <= m.T / 2) { m.s = 'stir'; m.st = 1.6; SFX.notif(); }
      else if (m.t <= 0) { m.s = 'ready'; m.t = READY_WIN; SFX.ready(); }
    }
    else if (m.s === 'stir' && (m.st -= dt) <= 0) { m.s = 'burn'; R.mist.burn++; SFX.burn(); notify(PAN[m.k].stirMsg, 'bad'); }
    else if (m.s === 'ready' && (m.t -= dt) <= 0) { m.s = 'burn'; R.mist.burn++; SFX.burn(); notify(`🔥 ${ITEMS[m.k].name} hangus! Bau satu kedai...`, 'bad'); }
  });
  const n = R.nasi; if (n.s === 'cook' && (n.t -= dt) <= 0) { n.s = 'idle'; n.stock = LOC === 'satay' ? 8 : nasiStock(); SFX.ready(); }
}
const live = () => R && !R.paused && !R.over;

/* ---------- Loop ---------- */
function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(.1, (now - lastT) / 1000); lastT = now;
  if (!R || R.paused || R.over) return;
  const d = R.day;
  R.t -= dt;
  // spawn
  R.spawnT -= dt;
  const rush = R.ev === 'bola' ? .7 : R.ev === 'hujan' ? 1.7 : 1;
  if (R.ev === 'berbuka' && !R.azan) {
    if (R.t <= DUR - 15) {
      R.azan = true; R.spawnT = 6; SFX.bell(); buzz([60, 60, 60]);
      document.querySelector('.shop-floor').classList.remove('senja');
      notify('🌙 <b>Azan Maghrib!</b> Semua serbu nak berbuka!', 'info');
      R.tables.forEach((c, i) => { if (!c) { spawnCustomer(i); const n = R.tables[i]; if (n) { n.max *= 1.3; n.pat = n.max; } } });
    } else if (!R.berbukaHint) { R.berbukaHint = true; setTimeout(() => R && notify('⏳ Pelanggan tengah tunggu azan... masak siap-siap dulu!', 'info'), 600); }
  }
  if (R.spawnT <= 0 && R.t > 6) { spawnCustomer(); R.spawnT = Math.max(2.2, 7.5 - d * .45) * rush * rand(.8, 1.25); }
  if (R.ev === 'datuk' && !R.datukDone && R.t <= DUR * .55 && R.t > 15 && R.tables.some(x => !x)) { R.datukDone = true; spawnCustomer(R.tables.findIndex(x => !x), true); }
  if (feat(d, 'grab') && !R.grab) { R.grabT -= dt; if (R.grabT <= 0 && R.t > 12) { spawnGrab(); R.grabT = R.ev === 'hujan' ? rand(5, 9) : rand(18, 30); } }
  if (feat(d, 'cat') && !R.cat) { R.catT -= dt; if (R.catT <= 0 && R.tray.length && R.t > 5) { R.cat = { t: 4 }; renderSide(); notify('🐈 <b>Oyen</b> nak curi makanan! Tap halau cepat!', 'bad'); R.catT = rand(16, 26); } }
  if (R.cat) { R.cat.t -= dt; if (R.cat.t <= 0) { R.cat = null; if (R.tray.length) { const s = R.tray.splice(Math.floor(Math.random() * R.tray.length), 1)[0]; R.mist.stolen++; notify(`🐈 Alamak! Oyen curi ${ITEMS[s.k].name.toLowerCase()}! 😾`, 'bad'); SFX.bad(); renderTray(); } renderSide(); } }
  // sabar
  const drain = up('fan') ? .8 : 1;
  R.tables.forEach(c => {
    if (!c || c.gone) return;
    c.pat -= dt * drain * (c.angry ? 1.7 : 1);
    if (c.pat <= 0) leave(c, true);
  });
  if (R.grab && !R.grab.gone) { R.grab.pat -= dt * drain; if (R.grab.pat <= 0) leave(R.grab, true); }
  document.querySelectorAll('.cust').forEach(el => {
    const c = R.tables.find(x => x && x.id === +el.dataset.id); if (!c) return;
    const b = el.querySelector('.pat b'); b.style.width = Math.max(0, c.pat / c.max * 100) + '%'; b.className = patCls(c);
    const h = el.querySelector('.hearts'), hn = heartsN(c); if (h && +h.dataset.h !== hn) { h.dataset.h = hn; h.textContent = heartsTxt(hn); h.classList.remove('lose'); void h.offsetWidth; h.classList.add('lose'); }
  });
  const gb = $('#grabSpot .pat b'); if (gb && R.grab) { gb.style.width = Math.max(0, R.grab.pat / R.grab.max * 100) + '%'; gb.className = patCls(R.grab); }
  stepStations(dt); stepStaff(dt);
  drawStations(); hud();
  if (R.t <= 0) endDay();
}
const comboBonus = () => R.combo >= 3 ? Math.min(.5, .1 + (R.combo - 3) * .05) : 0;
function hudCombo() {
  const el = $('#hudCombo'); if (!el) return;
  el.classList.toggle('hidden', R.combo < 3);
  el.textContent = `🔥x${R.combo}`;
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
}
function hud() {
  const s = Math.max(0, Math.ceil(R.t));
  $('#hudDay').textContent = 'Hari ' + R.day + (R.ev ? ' ' + EVENTS[R.ev].ic : '');
  $('#hudTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('#timeBar').style.width = Math.max(0, R.t / DUR * 100) + '%';
  $('#hudCoin').textContent = rm(R.earned);
  $('#hudTarget').textContent = 'sasaran ' + rm(target(R.day));
}
function mistakeHTML() {
  const M = R.mist, rows = [
    [R.lost, '😠', 'pelanggan merajuk', 'Layan yang bar sabar merah dulu. Tap 😤 untuk tenangkan.'],
    [M.burn, '🔥', 'makanan hangus', 'Jangan masak terlalu banyak serentak. Ambik bila stesen menyala.'],
    [M.wrong, '🏷️', 'salah tag (kurang manis / ikat / kaw...)', 'Tengok tag merah bawah order, tekan chip sebelum buat air.'],
    [M.spill, '🥤', 'Milo melimpah', 'Goncang perlahan, lepas jari bila jarum masuk hijau.'],
    [M.stolen, '🐈', 'kena curi Oyen', 'Tap Oyen cepat-cepat, atau upah Kak Siti.'],
    [M.teh, '☕', 'teh tak cukup tarik', 'Tahan lebih lama sampai jarum naik ke hijau.']
  ].filter(r => r[0] > 0).sort((a, b) => b[0] - a[0]);
  if (!rows.length) return '<div class="mist good">🌟 Takde kesilapan langsung! Power!</div>';
  return `<div class="mist"><b>Kena baiki:</b>${rows.slice(0, 3).map(r => `<div class="m-row"><span>${r[1]}</span><div><b>${r[0]}× ${r[2]}</b><small>${r[3]}</small></div></div>`).join('')}</div>`;
}
function endDay() {
  R.over = true; SFX.bell();
  const tg = target(R.day), e = R.earned, gs = goalsFor(R.day).map(g => g.ok(R)), stars = gs[0] ? 1 + gs[1] + gs[2] : 0;
  const G = prog(), first = R.day === G.day, wasOpen = locOpen('satay');
  const wg = wages(); P.coins = Math.max(0, P.coins + e - wg); G.stars[R.day] = Math.max(G.stars[R.day] || 0, stars);
  if (stars && first) G.day++;
  const newLoc = !wasOpen && locOpen('satay');
  save();
  const passed = stars > 0;
  modal(`<h2>${passed ? 'Kedai tutup! 🎉' : 'Alamak...'}</h2>
    <div class="stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? '' : 'off'}">⭐</span>`).join('')}</div>
    <div class="res"><span>Duit hari ni</span><b>${rm(e)}</b><span>Sasaran</span><b>${rm(tg)}</b><span>Pelanggan puas</span><b>${R.served} 😋</b><span>Pelanggan merajuk</span><b>${R.lost} 😠</b><span>Teh tarik perfect</span><b>${R.perfect} ✨</b><span>Combo terbaik</span><b>🔥 x${R.bestCombo}</b>${wg ? `<span>Gaji pekerja</span><b>-${rm(wg)}</b>` : ''}</div>
    ${goalsHTML(R.day, R)}
    ${mistakeHTML()}
    ${newLoc ? `<div class="new-box ev"><div class="ic">🍢🏮</div><b>Restoran baru dibuka!</b><span>${LOCS.satay.n} dah boleh dimain. Pilih kat menu utama.</span></div>` : ''}${R.viral ? `<p>📸 Viral ${R.viral} kali hari ni!</p>` : ''}
    <p>${passed ? (first ? `Hari ${G.day} dah dibuka!` : 'Bagus!') : 'Tak capai sasaran. Cuba lagi, atau upgrade kedai dulu!'}</p>
    ${passed ? `<button class="btn gold" id="nextBtn" type="button">▶ HARI ${first ? G.day : R.day + 1 <= G.day ? R.day + 1 : G.day}</button>` : `<button class="btn gold" id="retryBtn" type="button">↻ CUBA LAGI</button>`}
    <button class="btn green" id="upBtn" type="button">🛠️ Upgrade (${rm(P.coins)})</button>
    <button class="btn" id="homeBtn" type="button">Menu</button>`);
  const next = passed ? (first ? G.day : Math.min(R.day + 1, G.day)) : R.day;
  $('#modalCard').onclick = ev => {
    const id = ev.target.id;
    if (id === 'nextBtn' || id === 'retryBtn') startDay(next);
    if (id === 'upBtn') openShop(next);
    if (id === 'homeBtn') { closeModal(); toMenu(); }
  };
}
renderMenu();
