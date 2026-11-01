// Cozy Salon — Sally's Salon-style time management game (original characters).
// Sprite hooks: letak gambar dalam salon/sprites/ (senarai dalam sprites/list.json). Kalau tiada, game lukis placeholder sendiri.
(() => {
'use strict';
const SALON_VERSION = 16, SALON_DATE = '1 Nov 2026';
const $ = id => document.getElementById(id);
const KEY = 'mycozyworld_cozy_salon_v2', OLD_KEY = 'mycozyworld_cozy_salon_v1', BACKUP_KEY = 'mycozyworld_cozy_salon_backup', LIMIT = 60, SAVE_V = 3;
const W = 720, H = 960;   // logical canvas size (portrait)

// =====================================================================
// BALANCE — semua nombor ekonomi di sini supaya senang tune.
// Diukur dengan bot (3 percubaan/level, upgrade penuh):
//   pemain lemah: Kampung ~600–1900 · Mall ~2400–3300 · Resort ~3000–5000 · Seleb ~2500–5600
//   pemain sederhana: Kampung ~700–2300 · Mall ~3000–3700 · Resort ~4000–7700 · Seleb ~4200–7300
// Sasaran: latihan T1 ≈ ½ sesi Mall, T3 ≈ 2 sesi lewat; kosmetik 1–2 sesi; renovasi besar 12–35 sesi.
// =====================================================================
const BAL = {
  firstClearBonus: n => 30 + n * 5,   // sekali sahaja per level (level 1: 35, level 60: 330)
  starBonus: 20,                      // per bintang, first clear
  comboBonus: 5,                      // per combo terbaik, first clear
  repeatKeep: .7,                     // ulang level: simpan 70% coins yang dikutip
  newStarBonus: 25,                   // ulang level: per bintang BARU (tambahan dari rekod lama)
  failKeep: .4,                       // kalah: simpan 40%
  resvMax: 3,                         // max tempahan per stesen
  trainPrice: [1500, 4000, 9000],     // harga tahap latihan 1,2,3 (9 trek × 14.5k = 130k)
  supCap: 3,                          // max stok setiap bekalan
  colTip: .02,                        // koleksi lengkap: tip +2% (max 4 koleksi = 8%)
  cosmeticCap: .1,                    // jumlah bonus kosmetik/renovasi dihadkan 10%
  contractKeepWin: .7, contractKeepFail: .3,
  masterDiff: 56, masterBonus: [0, 1500, 2500, 4000], masterKeepFail: .5,
};

// ---------- data ----------
const TYPES = {
  wash:  { name: 'Shampoo',    icon: '🫧', time: 3.2, staff: true },
  cut:   { name: 'Gunting',    icon: '✂️', time: 4.2, staff: true },
  color: { name: 'Warna',      icon: '🎨', time: 4.8, staff: true },
  style: { name: 'Hair Dryer', icon: '💨', time: 5.0, staff: false },
  pay:   { name: 'Bayar',      icon: '💰', time: 1.2, staff: true },
};
const LOCS = [
  { key: 'kampung', name: 'Kedai Kampung', icon: '🌴', from: 1,  wall: '#fbe3d2', wall2: '#f6cfb8', floor: '#d9a77c', floor2: '#c99368', trim: '#a8714f', tipX: 1,
    blurb: 'Pelanggan sabar, datang satu-satu. Masa terbaik belajar rantai servis & combo.' },
  { key: 'mall',    name: 'Mall KL',       icon: '🏙️', from: 16, wall: '#e3e8fb', wall2: '#cfd7f6', floor: '#e9e4ef', floor2: '#d5cde0', trim: '#8a7fb2', tipX: 1.25,
    blurb: 'Gelombang waktu makan tengah hari, lepas tu rehat sekejap.' },
  { key: 'resort',  name: 'Resort Langkawi', icon: '🏝️', from: 31, wall: '#dff5ef', wall2: '#c4ebe0', floor: '#f0dcb8', floor2: '#e2c99e', trim: '#4f9d8c', tipX: 1.5,
    blurb: 'Pelancong datang berkumpulan, diselang waktu lengang.' },
  { key: 'seleb',   name: 'Studio Seleb',  icon: '🌟', from: 46, wall: '#f3dcf3', wall2: '#e7c3e8', floor: '#4a3756', floor2: '#3c2c47', trim: '#d4a64b', tipX: 1.8,
    blurb: 'Kurang pelanggan tapi cerewet: banyak hajat, tip besar. Pilih keutamaan!' },
];
const GUESTS = {
  biasa:   { label: 'Pelanggan',  patience: 1.0,  tip: 1.0, from: 1,  tag: '' },
  makcik:  { label: 'Mak Cik',    patience: 1.45, tip: 0.85, from: 1, tag: '🧕' },
  remaja:  { label: 'Remaja',     patience: 0.62, tip: 1.15, from: 4, tag: '⚡' },
  vip:     { label: 'VIP',        patience: 0.9,  tip: 2.1, from: 8,  tag: '👑' },
  seleb:   { label: 'Influencer', patience: 0.78, tip: 1.6, from: 12, tag: '📸' },
};
const NAMES = {
  biasa: ['Mia','Aina','Sofia','Hana','Raya','Lily','Iris','Ruby','Nina','Maya'],
  makcik: ['Mak Cik Ros','Mak Cik Siti','Mak Cik Yam','Mak Cik Mah','Mak Cik Jah'],
  remaja: ['Danish','Aiman','Haziq','Irfan','Zara','Alya'],
  vip: ['Datin Lisa','Puan Sri Mel','Datin Farah'],
  seleb: ['Aira','Kayla','Ellie','Mimi'],
};
// Rupa siap selepas servis warna. Gambar: guest_<type>_<pose>_c<1-3>.webp (dilukis ChatGPT, lihat sprites/NEXT.md Task P).
const HAIR_LOOKS = ['Burgundy', 'Karamel', 'Ungu Lavender'];
const SKIN = ['#f6cdb1','#e8ae84','#cc8f69','#a46f57','#f9dcc2'];
const HAIR = ['#4b2f3f','#8a5434','#e2a457','#2d3a4f','#a3506f','#6b4840','#c76b3c','#7c5cc4','#e77fa5','#4fa3a0'];
const OUTFIT = ['#79c5b6','#db91b0','#9ca9da','#f2b775','#be99cc','#8fc98a','#e7898a'];
const STYLES = ['long','bob','bun','pony','curly','short'];

const TIER = ['Biasa', 'Pro', 'Emas'];
const UP = [
  { cat: 'alat', key: 'wash',  name: 'Sinki',          icon: '🫧', info: 'Shampoo lebih laju & tip lebih besar.', base: 120, max: 2, unlock: 1, tier: true },
  { cat: 'alat', key: 'cut',   name: 'Kerusi Gunting', icon: '✂️', info: 'Gunting lebih laju & tip lebih besar.', base: 140, max: 2, unlock: 1, tier: true },
  { cat: 'alat', key: 'style', name: 'Hair Dryer',     icon: '💨', info: 'Dryer lebih laju & tip lebih besar.',   base: 160, max: 2, unlock: 3, tier: true },
  { cat: 'alat', key: 'color', name: 'Color Bar',      icon: '🎨', info: 'Warna lebih laju & tip lebih besar.',   base: 190, max: 2, unlock: 5, tier: true },
  { cat: 'alat', key: 'coffee',name: 'Mesin Kopi',     icon: '☕', info: 'Bagi kopi: pulihkan patience pelanggan.', base: 150, max: 2, unlock: 4 },
  { cat: 'alat', key: 'shoes', name: 'Kasut Laju',     icon: '👟', info: 'Semua staf berjalan 20% lebih laju.',   base: 110, max: 3, unlock: 2 },
  { cat: 'stesen', key: 'chair',  name: 'Kerusi Gunting #2', icon: '🪑', info: 'Tambah satu lagi stesen gunting.', base: 300, max: 1, unlock: 6 },
  { cat: 'stesen', key: 'sofa',   name: 'Sofa Extra',        icon: '🛋️', info: 'Tambah 1 tempat duduk menunggu.',  base: 220, max: 1, unlock: 7 },
  { cat: 'stesen', key: 'style2', name: 'Hair Dryer #2',     icon: '💨', info: 'Tambah satu lagi hair dryer.',     base: 420, max: 1, unlock: 9 },
  { cat: 'stesen', key: 'wash2',  name: 'Sinki #2',          icon: '🚿', info: 'Tambah satu lagi sinki shampoo.',  base: 380, max: 1, unlock: 10 },
  { cat: 'stesen', key: 'color2', name: 'Color Bar #2',      icon: '🎨', info: 'Tambah satu lagi stesen warna.',   base: 520, max: 1, unlock: 12 },
  { cat: 'staff', key: 'helper1', name: 'Pembantu Aiman', icon: '🧑‍🔧', info: 'Aiman pakar shampoo & kopi.', base: 450, max: 1, unlock: 8 },
  { cat: 'staff', key: 'helper2', name: 'Juruwang Lina',  icon: '👩‍💼', info: 'Lina pakar kaunter & layan pelanggan.', base: 700, max: 1, unlock: 14 },
  { cat: 'dekor', key: 'comfort',  name: 'Majalah',      icon: '📰', info: 'Patience turun 12% lebih perlahan.', base: 120, max: 3, unlock: 2 },
  { cat: 'dekor', key: 'd_flowers',name: 'Pasu Bunga',   icon: '💐', info: 'Tip +3%.',                      base: 90,  max: 1, unlock: 2 },
  { cat: 'dekor', key: 'd_aquarium',name: 'Akuarium',    icon: '🐠', info: 'Pelanggan tenang: patience -8% lebih perlahan.', base: 260, max: 1, unlock: 4 },
  { cat: 'dekor', key: 'd_tv',     name: 'TV Lounge',    icon: '📺', info: 'Yang menunggu di sofa kurang bosan (-15%).', base: 340, max: 1, unlock: 7 },
  { cat: 'dekor', key: 'd_chandelier', name: 'Chandelier', icon: '💡', info: 'Salon nampak mewah: tip +10%.', base: 600, max: 1, unlock: 11 },
  { cat: 'dekor', key: 'd_jukebox',name: 'Jukebox',      icon: '📻', info: 'Masa combo lebih panjang (+1.5s).', base: 520, max: 1, unlock: 16 },
  { cat: 'dekor', key: 'd_neon',   name: 'Neon Hati',    icon: '💖', info: 'Vibe Instagram: tip +5%.', base: 800, max: 1, unlock: 20 },
];
const CATS = [['alat', '🧰 Peralatan'], ['stesen', '🪑 Stesen Tambahan'], ['staff', '👥 Pekerja'], ['dekor', '🖼️ Dekorasi (ada kesan)']];
const priceOf = u => Math.round(u.base * Math.pow(u.tier ? 2.4 : 1.8, upg(u.key)));

// ---------- staf: kepakaran & latihan ----------
const STAFF = {
  mira:  { name: 'Mira',  col: '#7759a8', label: '#e56b93', hair: '#6b3f2a', style: 0, outfit: '#e56b93', speed: 300, spec: 'Pakar gunting & warna: 8% lebih laju, zon PERFECT lebih lebar, tip +2.' },
  aiman: { name: 'Aiman', col: '#2f9c8f', label: '#2f9c8f', hair: '#2d2a33', style: 5, outfit: '#5fc3b2', speed: 280, home: { x: 250, y: 470 }, up: 'helper1', spec: 'Pakar shampoo (12% lebih laju) & kopi (hidang lebih cepat, +5% sabar).' },
  lina:  { name: 'Lina',  col: '#e08a2e', label: '#e08a2e', hair: '#c76b3c', style: 3, outfit: '#f2b775', speed: 280, home: { x: 680, y: 705 }, up: 'helper2', spec: 'Pakar kaunter: bayar 30% lebih laju, tip +5%, pelanggan di kaunter lebih sabar.' },
};
// [key, nama, penerangan per tahap, fungsi teks nilai]
const TRAIN = {
  mira:  [['move', '👟 Langkah Pantas', 'Gerak +6% / tahap', l => '+' + l * 6 + '% laju'], ['skill', '✂️ Tangan Pantas', 'Gunting & warna -6% masa / tahap', l => '-' + l * 6 + '% masa'], ['qual', '✨ Sentuhan Halus', 'Zon PERFECT +12% & tip +3 / tahap', l => '+' + l * 12 + '% zon, +' + l * 3 + ' tip']],
  aiman: [['move', '👟 Langkah Pantas', 'Gerak +6% / tahap', l => '+' + l * 6 + '% laju'], ['wash', '🫧 Shampoo Pantas', 'Shampoo -8% masa / tahap', l => '-' + l * 8 + '% masa'], ['coffee', '☕ Barista', 'Kopi pulihkan +8% sabar / tahap', l => '+' + l * 8 + '% sabar']],
  lina:  [['move', '👟 Langkah Pantas', 'Gerak +6% / tahap', l => '+' + l * 6 + '% laju'], ['pay', '💳 Kaunter Pantas', 'Bayar -10% masa / tahap', l => '-' + l * 10 + '% masa'], ['tip', '😊 Layanan Mesra', 'Tip checkout +3% / tahap', l => '+' + l * 3 + '% tip']],
};
const TR = (id, k) => ((state.training || {})[id] || {})[k] || 0;
const moveMul = m => 1 + upg('shoes') * .2 + TR(m.id, 'move') * .06;
function svcMul(m, kind) {
  let f = 1;
  if (m.id === 'mira' && (kind === 'cut' || kind === 'color')) f *= .92 * (1 - TR('mira', 'skill') * .06);
  if (m.id === 'aiman' && kind === 'wash') f *= .88 * (1 - TR('aiman', 'wash') * .08);
  if (m.id === 'lina' && kind === 'pay') f *= .7 * (1 - TR('lina', 'pay') * .1);
  return f;
}
const zoneMul = m => m && m.id === 'mira' ? 1.15 + TR('mira', 'qual') * .12 : 1;

// ---------- koleksi dekor kosmetik (tiada kesan gameplay kecuali bonus siap koleksi) ----------
const COLL = [
  { key: 'kampung', name: 'Warisan Kampung', icon: '🌴', unlock: 1, items: [['k_floor', 'floor', 'Lantai Papan Jati', 900], ['k_wall', 'wall', 'Dinding Batik', 1050], ['k_rug', 'rug', 'Tikar Mengkuang', 750], ['k_sofa', 'sofa', 'Set Bantal Songket', 1250], ['k_plant', 'plant', 'Pasu Tembikar & Pandan', 650], ['k_sign', 'sign', 'Papan Tanda Kayu', 950]] },
  { key: 'mall', name: 'KL Moden', icon: '🏙️', unlock: 16, items: [['m_floor', 'floor', 'Jubin Marmar', 2250], ['m_wall', 'wall', 'Panel Geometri', 2500], ['m_rug', 'rug', 'Permaidani Minimalis', 1900], ['m_sofa', 'sofa', 'Bantal Baldu Kelabu', 3000], ['m_light', 'light', 'Lampu Gantung Moden', 2750], ['m_finish', 'finish', 'Kemasan Krom', 3250]] },
  { key: 'resort', name: 'Tropika Langkawi', icon: '🏝️', unlock: 31, items: [['r_floor', 'floor', 'Lantai Batu Pasir', 3750], ['r_wall', 'wall', 'Mural Daun Palma', 4250], ['r_rug', 'rug', 'Tikar Pantai Berjalur', 3000], ['r_sofa', 'sofa', 'Bantal Pantai Biru', 4750], ['r_plant', 'plant', 'Pokok Palma', 3250], ['r_light', 'light', 'Lampu Tali Pantai', 4000]] },
  { key: 'seleb', name: 'Emas Selebriti', icon: '🌟', unlock: 46, items: [['s_floor', 'floor', 'Lantai Hitam Berkilat', 6500], ['s_wall', 'wall', 'Dinding Bintang Emas', 7000], ['s_rug', 'rug', 'Karpet Merah', 5500], ['s_sofa', 'sofa', 'Bantal Baldu Emas', 7500], ['s_finish', 'finish', 'Kemasan Emas', 8000], ['s_sign', 'sign', 'Papan Neon Seleb', 7250]] },
];
const SLOTNAME = { floor: 'Lantai', wall: 'Dinding', rug: 'Permaidani', sofa: 'Sofa', plant: 'Pokok', light: 'Lampu', finish: 'Kemasan Stesen', sign: 'Papan Tanda' };
const ITEM = {}; COLL.forEach(c => c.items.forEach(([id, slot, name, price]) => ITEM[id] = { id, slot, name, price, coll: c.key }));
const colDone = c => c.items.every(i => state.decor.own[i[0]]);

// ---------- renovasi besar ----------
const RENO = [
  { key: 'reception', name: 'Makeover Kaunter', icon: '🎀', cost: 60000, info: 'Gerbang sambutan, pokok & lampu di belakang kaunter bayar.', bonus: 'Tiada kesan gameplay (kosmetik).' },
  { key: 'lounge', name: 'Ruang Menunggu Premium', icon: '🛋️', cost: 100000, info: 'Panel dinding, lampu lantai & bingkai gambar di lounge.', bonus: 'Pelanggan di sofa kurang bosan 5%.' },
  { key: 'frontage', name: 'Lampu Signature & Papan Nama', icon: '💡', cost: 160000, info: 'Mentol marquee sepanjang dinding & papan nama bercahaya.', bonus: 'Tip +2%.' },
];
const renoDone = k => { const r = RENO.find(x => x.key === k); return (state.reno[k] || 0) >= r.cost; };
function tipMult() {
  const base = 1 + upg('d_flowers') * .03 + upg('d_chandelier') * .1 + upg('d_neon') * .05;
  const cos = Math.min(BAL.cosmeticCap, COLL.filter(colDone).length * BAL.colTip + (renoDone('frontage') ? .02 : 0));
  return base + cos;
}

// ---------- bekalan pra-level ----------
const SUP = {
  beans:  { name: 'Biji Kopi Premium', icon: '☕', price: 400, info: '3 hidangan kopi pertama pulihkan +50% lebih banyak sabar.', need: () => upg('coffee') > 0, needTxt: 'Perlu Mesin Kopi' },
  colour: { name: 'Bekalan Warna Berkualiti', icon: '🎨', price: 600, info: 'Tip servis warna +15% sepanjang level.', need: () => state.level >= 5, needTxt: 'Buka di Level 5' },
  snack:  { name: 'Minuman Selamat Datang', icon: '🧃', price: 500, info: 'Pelanggan yang tiba dalam 45 saat pertama: sabar +15%.', need: () => true },
};

// ---------- kontrak berbayar ----------
const CONTRACTS = [
  { id: 'bridal', name: 'Tempahan Pengantin', icon: '👰', loc: 'resort', event: 'bridal', obj: 'serve' },
  { id: 'tourist', name: 'Rombongan Pelancong', icon: '🧳', loc: 'resort', event: null, obj: 'income' },
  { id: 'celeb', name: 'Sesi Selebriti', icon: '🌟', loc: 'seleb', event: 'influ', obj: 'perfect' },
  { id: 'office', name: 'Rush Pejabat', icon: '💼', loc: 'mall', event: 'office', obj: 'income' },
  { id: 'promo', name: 'Promosi Warna', icon: '🎨', loc: 'mall', event: 'promo', obj: 'mix' },
];
const CTIERS = [
  { name: 'Mudah', diff: 24, fee: 1000, pay: 3000, need: 21 },
  { name: 'Sederhana', diff: 38, fee: 2500, pay: 7000, need: 31 },
  { name: 'Sukar', diff: 52, fee: 5000, pay: 13000, need: 46 },
];
const contractsOpen = () => state.level >= CTIERS[0].need;
const masterOpen = () => (state.stars[LIMIT] || 0) > 0;

// ---------- sprites ----------
const IMG = {};
let SPRITE_LIST = new Set();
let ART_READY = false, artDone = 0, artTotal = 0;
function artProgress() {
  const btn = $('playBtn'); if (!btn || mode !== 'home') return;
  if (ART_READY) { btn.disabled = false; btn.textContent = '▶ MAIN LEVEL ' + state.sel + (state.sel < state.level ? ' (ULANG)' : ''); }
  else { btn.disabled = true; btn.textContent = '⏳ Memuatkan gambar… ' + (artTotal ? Math.floor(artDone / artTotal * 100) : 0) + '%'; }
}
fetch('sprites/list.json').then(r => r.ok ? r.json() : []).catch(() => []).then(list => {
  artTotal = list.length;
  return Promise.all(list.map(name => new Promise(res => {
    const i = new Image(); i.ok = false; i.decoding = 'async';
    const done = ok => { i.ok = ok; if (ok) SPRITE_LIST.add(name); artDone++; artProgress(); res(); };
    i.onload = () => (i.decode ? i.decode().catch(() => {}) : Promise.resolve()).then(() => done(true));
    i.onerror = () => done(false);
    i.src = 'sprites/' + name + '.webp'; IMG[name] = i;
  })));
}).then(() => { ART_READY = true; if (mode === 'home') home(); artProgress(); });
function img(name) { if (!SPRITE_LIST.has(name)) return null; const i = IMG[name]; return i && i.ok ? i : null; }

// ---------- save (versioned) ----------
const obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const nonNeg = v => Math.max(0, Math.floor(Number(v) || 0));
let state = load();
function load() {
  const s = { v: SAVE_V, level: 1, sel: 1, coins: 100, stars: {}, upgrades: {}, muted: false, music: true, stats: {}, daily: null, ach: {}, roles: null, layout: {},
    training: {}, decor: { own: {}, eq: {} }, reno: {}, sup: {}, supUse: {}, contract: null, master: { round: 0, played: 0, wins: 0 }, notice: '' };
  let raw = null;
  try { raw = localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY); } catch (e) {}
  let x = null;
  try { x = JSON.parse(raw || 'null'); } catch (e) { x = null; }
  if (x && typeof x === 'object') {
    if ((Number(x.v) || 0) < SAVE_V && raw) { try { localStorage.setItem(BACKUP_KEY, raw); } catch (e) {} }  // salinan pemulihan sebelum migrasi
    s.level = Math.min(LIMIT, Math.max(1, Number(x.level) || 1));
    s.coins = nonNeg(x.coins);
    s.stars = {}; Object.entries(obj(x.stars)).forEach(([k, v]) => { const n = +k; if (n >= 1 && n <= LIMIT) s.stars[n] = Math.min(3, nonNeg(v)); });
    s.upgrades = obj(x.upgrades);
    s.muted = !!x.muted; s.music = x.music !== false;
    s.stats = obj(x.stats); s.daily = x.daily && typeof x.daily === 'object' && Array.isArray(x.daily.goals) ? x.daily : null; s.ach = obj(x.ach);
    s.roles = x.roles && typeof x.roles === 'object' ? x.roles : null;
    s.layout = {}; Object.entries(obj(x.layout)).forEach(([k, v]) => { if (Array.isArray(v) && v.length === 2 && v.every(Number.isFinite)) s.layout[k] = [v[0], v[1]]; });
    s.sel = Math.min(s.level, Math.max(1, Number(x.sel) || s.level));
    ['mira', 'aiman', 'lina'].forEach(id => { const t = obj(obj(x.training)[id]); s.training[id] = {}; TRAIN[id].forEach(([k]) => s.training[id][k] = Math.min(3, nonNeg(t[k]))); });
    const d = obj(x.decor); s.decor.own = {}; Object.keys(obj(d.own)).forEach(k => { if (ITEM[k]) s.decor.own[k] = 1; });
    Object.entries(obj(d.eq)).forEach(([slot, id]) => { if (ITEM[id] && s.decor.own[id] && ITEM[id].slot === slot) s.decor.eq[slot] = id; });
    RENO.forEach(r => s.reno[r.key] = Math.min(r.cost, nonNeg(obj(x.reno)[r.key])));
    Object.keys(SUP).forEach(k => { s.sup[k] = Math.min(BAL.supCap, nonNeg(obj(x.sup)[k])); s.supUse[k] = !!obj(x.supUse)[k]; });
    const m = obj(x.master); s.master = { round: nonNeg(m.round), played: nonNeg(m.played), wins: nonNeg(m.wins) };
    const c = x.contract;
    if (c && typeof c === 'object' && CONTRACTS.some(q => q.id === c.id) && CTIERS[c.tier]) {
      s.contract = { id: c.id, tier: c.tier, att: nonNeg(c.att), status: c.status === 'active' ? 'failed' : c.status === 'done' ? 'done' : 'failed' };
      if (c.status === 'active') s.notice = 'Kontrak "' + CONTRACTS.find(q => q.id === c.id).name + '" terbatal sebab app ditutup semasa main. Yuran tidak dipulangkan.';
    }
  } else { ['mira', 'aiman', 'lina'].forEach(id => s.training[id] = {}); Object.keys(SUP).forEach(k => { s.sup[k] = 0; s.supUse[k] = false; }); RENO.forEach(r => s.reno[r.key] = 0); }
  UP.forEach(u => s.upgrades[u.key] = Math.min(u.max, Math.max(0, Number(s.upgrades[u.key]) || 0)));
  delete s.upgrades.assistant;
  s.v = SAVE_V;
  return s;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
const upg = k => state.upgrades[k] || 0;
const locOf = n => LOCS.slice().reverse().find(l => n >= l.from);
const rnd = a => a[Math.floor(Math.random() * a.length)];
const cleared = n => n < state.level || (state.stars[n] || 0) > 0;

// ---------- audio ----------
let audio = null;
function ac() { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; if (!audio) audio = new C(); if (audio.state === 'suspended') audio.resume(); return audio; }
function tone(f1, f2, dur, type = 'sine', vol = .08, delay = 0) {
  const a = ac(); if (!a) return; const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, freq, vol = .05, delay = 0) {
  const a = ac(); if (!a) return; const t = a.currentTime + delay, n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start(t);
}
const Music = { on: false, timer: 0, next: 0, step: 0, bus: null };
const PROG = [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]];
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16];
const hz = n => 261.63 * Math.pow(2, n / 12);
function mNote(f, t, dur, type, vol) {
  const a = audio, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
  o.connect(g).connect(Music.bus); o.start(t); o.stop(t + dur + .05);
}
function musicTick() {
  if (!audio) return;
  const key = [0, 2, -3, 5][game ? LOCS.indexOf(game.loc) : 0] || 0, bpm = mode === 'play' ? 104 : 84, e8 = 60 / bpm / 2;
  while (Music.next < audio.currentTime + .25) {
    const st = Music.step, bar = Math.floor(st / 8) % 4, ch = PROG[bar].map(n => n + key), t = Music.next;
    if (st % 8 === 0) ch.forEach((n, i) => mNote(hz(n - 12), t + i * .02, e8 * 7.5, 'triangle', .022));
    if (st % 4 === 0) mNote(hz(ch[0] - 24), t, e8 * 3, 'sine', .07);
    if (st % 2 === 1 || Math.random() < .25) mNote(hz(ch[0] - 12) * 2, t, .05, 'square', .006);
    if (Math.random() < .42) mNote(hz(PENTA[Math.floor(Math.random() * PENTA.length)] + key + 12), t, e8 * 1.6, 'triangle', .03);
    Music.next += e8; Music.step++;
  }
}
function musicUpdate() {
  const want = state.music && !document.hidden && mode !== 'pause';
  if (want && !Music.on) { const a = ac(); if (!a) return; if (!Music.bus) { Music.bus = a.createGain(); Music.bus.gain.value = .8; Music.bus.connect(a.destination); } Music.next = a.currentTime + .1; Music.on = true; Music.timer = setInterval(musicTick, 90); }
  else if (!want && Music.on) { clearInterval(Music.timer); Music.on = false; }
}
function sound(k) {
  if (state.muted) return;
  try {
    if (k === 'tap') tone(620, 880, .1);
    else if (k === 'coin') { tone(988, 1320, .12, 'triangle', .07); tone(1320, 1760, .15, 'triangle', .06, .08); }
    else if (k === 'bad') tone(260, 150, .25, 'sawtooth', .04);
    else if (k === 'snip') { noise(.05, 4000, .08); noise(.05, 4500, .08, .12); }
    else if (k === 'water') noise(.35, 900, .05);
    else if (k === 'dry') noise(.5, 2200, .025);
    else if (k === 'combo') [523, 659, 784, 1047].forEach((f, i) => tone(f, f * 1.01, .12, 'triangle', .06, i * .06));
    else if (k === 'door') { tone(1175, 1170, .3, 'sine', .05); tone(1568, 1560, .4, 'sine', .04, .12); }
    else if (k === 'perfect') { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, f * 1.02, .14, 'triangle', .06, i * .05)); noise(.25, 6000, .03, .1); }
    else if (k === 'win') [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, f, .16, 'triangle', .07, i * .11));
  } catch (e) {}
}

// ---------- toast / modal ----------
let toastTimer = 0;
function toast(s) { const t = $('toast'); t.textContent = s; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1900); }
function modal(icon, title, text, actions, html) {
  $('modalIcon').textContent = icon; $('modalTitle').textContent = title;
  if (html) $('modalText').innerHTML = html; else $('modalText').textContent = text;
  $('modalActions').innerHTML = actions.map((a, i) => `<button type="button" data-action="${a[1]}" ${i ? 'class="secondary"' : ''}>${a[0]}</button>`).join('');
  $('overlay').hidden = false;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- stats, misi harian, pencapaian ----------
function stat(k, v, isMax) {
  const S = state.stats;
  S[k] = isMax ? Math.max(S[k] || 0, v) : (S[k] || 0) + v;
  const D = dailyToday();
  for (const q of D.goals) if (q.id === k && !q.claimed) q.prog = isMax ? Math.max(q.prog, v) : q.prog + v;
}
const DAILY_POOL = [
  { id: 'served', t: n => `Layan ${n} pelanggan`, n: [8, 12, 16] },
  { id: 'perfect', t: n => `Dapat ${n} PERFECT ✨`, n: [3, 5, 8] },
  { id: 'combo', t: n => `Buat combo x${n}`, n: [3, 4], max: true },
  { id: 'makcik', t: n => `Layan ${n} Mak Cik`, n: [2, 4] },
  { id: 'earned', t: n => `Kumpul 🪙${n}`, n: [300, 600, 1000] },
  { id: 'coffee', t: n => `Bagi kopi ${n} kali`, n: [2, 4], need: () => upg('coffee') },
  { id: 'wish', t: n => `Tunaikan ${n} hajat ⭐`, n: [1, 3], need: () => state.level >= 7 },
  { id: 'stars3', t: n => `Dapat 3 bintang ${n} kali`, n: [1, 2] },
];
function dailyToday() {
  const day = new Date().toDateString();
  if (!state.daily || state.daily.day !== day) {
    const pool = DAILY_POOL.filter(q => !q.need || q.need()).sort(() => Math.random() - .5).slice(0, 3);
    state.daily = { day, goals: pool.map(q => { const ni = Math.min(q.n.length - 1, Math.floor(state.level / 12)); const n = q.n[Math.floor(Math.random() * (ni + 1))]; return { id: q.id, n, prog: 0, claimed: false, reward: 60 + n * (q.id === 'earned' ? .12 : 12) }; }) };
  }
  return state.daily;
}
const ACH = [
  ['served25', '👋 Pelanggan Pertama', 'Layan 25 pelanggan', () => (state.stats.served || 0) >= 25, 100],
  ['served200', '💇 Stylist Popular', 'Layan 200 pelanggan', () => (state.stats.served || 0) >= 200, 400],
  ['served1000', '👑 Ratu Salon', 'Layan 1000 pelanggan', () => (state.stats.served || 0) >= 1000, 1500],
  ['perfect10', '✨ Tangan Ajaib', '10 PERFECT', () => (state.stats.perfect || 0) >= 10, 150],
  ['perfect100', '💎 Tangan Emas', '100 PERFECT', () => (state.stats.perfect || 0) >= 100, 800],
  ['combo4', '🔥 Combo Master', 'Combo x4', () => (state.stats.combo || 0) >= 4, 200],
  ['combo6', '🌋 Combo Legenda', 'Combo x6', () => (state.stats.combo || 0) >= 6, 600],
  ['wish10', '⭐ Penunai Hajat', 'Tunaikan 10 hajat', () => (state.stats.wish || 0) >= 10, 400],
  ['makcik20', '🧕 Kesayangan Mak Cik', 'Layan 20 Mak Cik', () => (state.stats.makcik || 0) >= 20, 300],
  ['vip10', '💼 Kawan Datin', 'Layan 10 VIP', () => (state.stats.vip || 0) >= 10, 400],
  ['mall', '🏙️ Masuk Mall', 'Buka Mall KL', () => state.level >= 16, 300],
  ['resort', '🏝️ Ke Langkawi', 'Buka Resort Langkawi', () => state.level >= 31, 600],
  ['seleb', '🌟 Studio Seleb', 'Buka Studio Seleb', () => state.level >= 46, 1000],
  ['team', '👥 Satu Pasukan', 'Upah Aiman & Lina', () => upg('helper1') && upg('helper2'), 500],
  ['gold', '🥇 Salon Emas', 'Semua peralatan tier Emas', () => ['wash', 'cut', 'style', 'color'].every(k => upg(k) >= 2), 1200],
  ['decor', '🖼️ Pereka Dalaman', 'Beli semua dekorasi', () => UP.filter(u => u.cat === 'dekor').every(u => upg(u.key) >= 1), 800],
];

// =====================================================================
// LEVEL DESIGN — konfigurasi level, acara khas & objektif
// =====================================================================
const EVENTS = {
  bridal: { name: 'Majlis Pengantin', icon: '👰', desc: 'Rombongan pengantin masuk serentak di awal — semua nak shampoo, gunting & dryer.' },
  office: { name: 'Rush Makan Tengah Hari', icon: '💼', desc: 'Pekerja pejabat datang ikut gelombang dan kurang sabar.' },
  promo:  { name: 'Promosi Warna Rambut', icon: '🎨', desc: 'Ramai pelanggan nak warna rambut hari ni.' },
  vipday: { name: 'Hari Temujanji VIP', icon: '👑', desc: 'Datin & VIP datang dengan hajat istimewa.' },
  influ:  { name: 'Makeover Influencer', icon: '📸', desc: 'Influencer nak hasil PERFECT untuk content.' },
};
const EVENT_OBJ = { bridal: 'serve', office: 'income', promo: 'mix', vipday: 'wish', influ: 'perfect' };
const EVENT_AT = { 10: 'bridal', 14: 'promo', 20: 'office', 25: 'promo', 29: 'bridal', 35: 'bridal', 40: 'vipday', 44: 'influ', 50: 'vipday', 55: 'influ', 59: 'bridal' };
const OBJ_ROT = ['serve', 'income', 'serve', 'perfect', 'serve', 'wish', 'serve', 'noangry', 'serve', 'mix'];
const OBJ_INTRO = { serve: 1, income: 8, perfect: 10, wish: 12, noangry: 14, mix: 14 };
const OBJ = {
  serve:   { icon: '💇', hud: 'DILAYAN', t: n => `Layan ${n} pelanggan`, rule: 'Lulus bila cukup pelanggan dilayan.' },
  income:  { icon: '🪙', hud: 'PENDAPATAN', t: n => `Kutip 🪙${n} dalam level ni`, rule: 'Lulus bila kutipan sampai sasaran. Tip, combo & hajat semua dikira.' },
  perfect: { icon: '✨', hud: 'PERFECT', t: n => `Dapat ${n} PERFECT`, rule: 'Tap bar timing masa gunting/warna dalam zon hijau gelap.' },
  wish:    { icon: '⭐', hud: 'HAJAT', t: n => `Tunaikan ${n} hajat ⭐`, rule: 'Pelanggan bertanda ⭐ nak PERFECT atau nak cepat & happy (hati ≥ 60% masa bayar).' },
  noangry: { icon: '😇', hud: 'TANPA MARAH', t: n => `Layan semua ${n} pelanggan, 0 blah marah`, rule: 'Seorang pun tak boleh keluar marah. Pelanggan lebih sabar sikit hari ni.' },
  mix:     { icon: '🎨', hud: 'WARNA', t: n => `Siapkan ${n} servis warna 🎨`, rule: 'Hantar pelanggan yang perlukan 🎨 ke Color Bar.' },
};
function objFor(n) {
  if (EVENT_AT[n]) return EVENT_OBJ[EVENT_AT[n]];
  if (n < 7) return 'serve';
  const o = OBJ_ROT[(n - 7) % OBJ_ROT.length];
  return n >= OBJ_INTRO[o] ? o : 'serve';
}
// seeded random supaya level sama → rangka sama (adil bila ulang), tapi variasi kecil kekal
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function stepsFor(diff, R) {
  let p;
  if (diff < 3) p = [['wash', 'cut'], ['cut'], ['wash', 'cut']];
  else if (diff < 5) p = [['wash', 'cut', 'style'], ['cut', 'style'], ['wash', 'style'], ['wash', 'cut']];
  else p = [['wash', 'color', 'style'], ['cut', 'color', 'style'], ['wash', 'cut', 'style'], ['cut', 'style'], ['wash', 'cut', 'color', 'style'], ['color', 'style'], ['wash', 'cut']];
  return p[Math.floor(R() * p.length)].slice();
}
const ORDER = ['wash', 'cut', 'color', 'style'];
const withStep = (st, k) => st.includes(k) ? st : ORDER.filter(x => x === k || st.includes(x));
function pickType(diff, R, force) {
  if (force && R() < .55) return force;
  const pool = [];
  Object.entries(GUESTS).forEach(([k, g]) => { if (diff >= g.from) pool.push([k, k === 'biasa' ? 5 : k === 'makcik' ? 3 : k === 'remaja' ? 3 : k === 'vip' ? 2 : 1.5]); });
  let r = R() * pool.reduce((a, b) => a + b[1], 0);
  for (const [k, w] of pool) { if ((r -= w) <= 0) return k; }
  return 'biasa';
}
// spec: { kind:'campaign', n } | { kind:'contract', id, tier } | { kind:'master', round, opt }
function levelCfg(spec) {
  let n = spec.n || 1, diff = n, loc = locOf(n), ev = EVENT_AT[n] || null, objKey = objFor(n), title = 'Level ' + n, seed = n * 7919;
  if (spec.kind === 'contract') {
    const C = CONTRACTS.find(c => c.id === spec.id), T = CTIERS[spec.tier];
    diff = T.diff; loc = LOCS.find(l => l.key === C.loc); ev = C.event; objKey = C.obj; title = C.icon + ' ' + C.name + ' (' + T.name + ')'; seed = 99991 + spec.tier * 31 + CONTRACTS.indexOf(C) * 7;
  }
  if (spec.kind === 'master') {
    const o = masterOptions(spec.round)[spec.opt];
    diff = BAL.masterDiff; loc = LOCS.find(l => l.key === o.loc); ev = o.event; objKey = o.obj; title = '👑 Salon Master #' + (spec.round + 1); seed = 50000 + spec.round * 13 + spec.opt;
  }
  const R = rng(seed);
  let total = Math.min(18, 4 + Math.ceil(diff * .55)), patMul = 1, wishRate = diff >= 6 ? .15 : 0, tipX = loc.tipX, pattern = loc.key === 'mall' ? 'waves' : loc.key === 'resort' ? 'groups' : 'steady', force = null;
  if (loc.key === 'kampung') patMul = 1.15;
  if (loc.key === 'seleb') { total = Math.min(total, 14); patMul = .95; wishRate = .4; tipX *= 1.1; }
  if (ev === 'bridal') pattern = 'bridal';
  if (ev === 'office') { pattern = 'waves'; patMul *= .92; }
  if (ev === 'vipday') force = 'vip';
  if (ev === 'influ') force = diff >= 12 ? 'seleb' : null;
  if (objKey === 'noangry') { total = Math.max(5, Math.round(total * .75)); patMul *= 1.3; }
  // rancang pelanggan
  const plan = [];
  for (let i = 0; i < total; i++) {
    let type = pickType(diff, R, force);
    if (ev === 'bridal' && i < 4) type = i === 0 ? 'biasa' : R() < .5 ? 'makcik' : 'biasa';
    let steps = stepsFor(diff, R);
    if (ev === 'bridal' && i < 4) steps = diff >= 3 ? ['wash', 'cut', 'style'] : ['wash', 'cut'];
    if (ev === 'promo' && diff >= 5 && R() < .6) steps = withStep(steps, 'color');
    plan.push({ type, steps, wish: null });
  }
  // jaminan peluang objektif
  let target = 0;
  const qualPerfect = g => g.steps.includes('cut') || g.steps.includes('color');
  if (objKey === 'perfect') { plan.forEach(g => { if (!qualPerfect(g)) g.steps = withStep(g.steps, 'cut'); }); target = Math.max(2, Math.round(total * .4)); }
  if (objKey === 'mix') { const k = Math.ceil(total * .55); plan.slice(0, total).forEach((g, i) => { if (i % 2 === 0 || plan.filter(x => x.steps.includes('color')).length < k) g.steps = withStep(g.steps, 'color'); }); target = Math.ceil(plan.filter(g => g.steps.includes('color')).length * .65); }
  // hajat
  plan.forEach(g => { if (diff >= 6 && R() < ((g.type === 'vip' || g.type === 'seleb') ? .7 : wishRate)) g.wish = 'x'; });
  if (objKey === 'wish') { const need = Math.max(4, Math.ceil(total * .45)); for (let i = 0; plan.filter(g => g.wish).length < need && i < plan.length; i++) plan[(i * 3) % plan.length].wish = 'x'; target = Math.max(2, Math.ceil(plan.filter(g => g.wish).length * .4)); }
  plan.forEach(g => { if (g.wish) g.wish = qualPerfect(g) && R() < (objKey === 'wish' ? .4 : .55) ? 'perfect' : 'cepat'; g.steps.push('pay'); });
  const goal = Math.ceil(total * .7);
  if (objKey === 'serve') target = goal;
  if (objKey === 'noangry') target = total;
  if (objKey === 'income') { const est = plan.reduce((a, g) => a + (18 + (g.steps.length - 1) * 9 + g.steps.reduce((b, k) => b + (k === 'pay' ? 0 : 4 + 5 * upg(k)), 0) + 6) * GUESTS[g.type].tip * tipX * tipMult(), 0); target = Math.max(100, Math.round(est * .6 / 10) * 10); }
  // jadual ketibaan (kumpulan dihadkan oleh tempat duduk masa spawn)
  const times = []; let t = 1.2;
  const gap = Math.max(3.4, 8 - diff * .08) * (loc.key === 'kampung' ? 1.1 : loc.key === 'seleb' ? 1.15 : 1);
  for (let i = 0; i < total;) {
    if (pattern === 'bridal' && i === 0) { for (let k = 0; k < 4 && i < total; k++, i++) times.push(t + k * .7); t += 14; continue; }
    if (pattern === 'waves') { const sz = 3 + (R() < .4 ? 1 : 0); for (let k = 0; k < sz && i < total; k++, i++) times.push(t + k * 1.6); t += Math.max(12, 17 - diff * .08) + sz * 1.6; continue; }
    if (pattern === 'groups') { const sz = 2 + (R() < .45 ? 1 : 0); for (let k = 0; k < sz && i < total; k++, i++) times.push(t + k * .7); t += 12 + R() * 5; continue; }
    times.push(t); t += gap * (0.8 + R() * .4); i++;
  }
  return { spec, diff, loc, ev, obj: objKey, title, plan, times, total, goal, target, patMul, tipX };
}
function masterOptions(round) {
  const R = rng(777 + round * 101), out = [];
  const objs = ['income', 'perfect', 'wish', 'mix', 'noangry', 'serve'];
  for (let i = 0; i < 3; i++) {
    const c = CONTRACTS[Math.floor(R() * CONTRACTS.length)], loc = LOCS[1 + Math.floor(R() * 3)].key, obj = objs[Math.floor(R() * objs.length)];
    out.push({ loc, event: c.event, obj, name: c.icon + ' ' + c.name + ' · ' + LOCS.find(l => l.key === loc).name });
  }
  return out;
}

// ---------- layout (posisi barang ikut susun atur) ----------
let editLayout = null;
const LAY = () => (mode === 'edit' && editLayout) ? editLayout : state.layout;
const lp = (lay, id, def) => { const v = lay[id]; return v ? { x: v[0], y: v[1] } : def; };
const DOOR = { x: -40, y: 900 };
const COFFEE_DEF = { x: 455, y: 790 }, COFFEE = { ...COFFEE_DEF };
function buildSlots(diff, lay) {
  const L = [{ id: 'wash1', kind: 'wash' }, { id: 'cut1', kind: 'cut' }];
  if (upg('chair')) L.push({ id: 'cut2', kind: 'cut' });
  if (diff >= 3) L.push({ id: 'style1', kind: 'style' });
  if (diff >= 5) L.push({ id: 'color1', kind: 'color' });
  if (upg('wash2')) L.push({ id: 'wash2', kind: 'wash' });
  if (upg('style2') && diff >= 3) L.push({ id: 'style2', kind: 'style' });
  if (upg('color2') && diff >= 5) L.push({ id: 'color2', kind: 'color' });
  const cols = L.length <= 6 ? 3 : 4, xs = cols === 3 ? [120, 330, 540] : [92, 262, 432, 602], sc = cols === 3 ? 1 : .8;
  L.forEach((o, i) => { o.x = xs[i % cols]; o.y = i < cols ? 360 : 590; o.sc = sc; });
  L.push({ id: 'pay1', kind: 'pay', x: 600, y: 790, sc: 1 });
  L.forEach(o => { const v = lay[o.id]; if (v) { o.x = v[0]; o.y = v[1]; } });
  return L.map(o => ({ ...o, guestId: null, state: 'empty', t: 0, dur: 0, queued: false, resv: [], retry: false }));
}
function buildSeats(lay) {
  const n = 4 + upg('sofa'), seats = [], o = lp(lay, 'sofa', { x: 70, y: 880 });
  for (let i = 0; i < n; i++) seats.push({ x: o.x + i * 92, y: o.y, guestId: null });
  return seats;
}
const DECOR = [
  { k: 'd_chandelier', sp: 'deco_chandelier', e: '💡', x: 360, y: 0, w: 120, h: 120, top: true },
  { k: 'd_tv', sp: 'deco_tv', e: '📺', x: 290, y: 95, w: 130, h: 130, top: true },
  { k: 'd_neon', sp: 'deco_neon', e: '💖', x: 430, y: 120, w: 90, h: 90, top: true },
  { k: 'd_aquarium', sp: 'deco_aquarium', e: '🐠', x: 55, y: 700, w: 110, h: 110, block: .4 },
  { k: 'd_flowers', sp: 'deco_flowers', e: '💐', x: 235, y: 715, w: 90, h: 90, block: .22 },
  { k: 'd_jukebox', sp: 'deco_jukebox', e: '📻', x: 672, y: 845, w: 90, h: 90, block: .35 },
];

// =====================================================================
// NAVIGASI — grid kecil + A*. Perabot = kos tinggi (elak), mod "strict" = tak boleh lalu (untuk validasi).
// =====================================================================
const CS = 20, NC = Math.ceil(W / CS), NR = Math.ceil(H / CS);
function solidsFor(w) {
  const r = [];
  for (const s of w.slots) { const sc = s.sc || 1; r.push({ id: s.id, x1: s.x - 60 * sc, x2: s.x + 60 * sc, y1: s.y - 60 * sc, y2: s.y + 4 }); }
  if (w.coffee) r.push({ id: 'coffee', x1: w.coffee.x - 36, x2: w.coffee.x + 36, y1: w.coffee.y - 30, y2: w.coffee.y + 12 });
  if (w.seats.length) { const a = w.seats[0], b = w.seats[w.seats.length - 1]; r.push({ id: 'sofa', x1: a.x - 50, x2: b.x + 50, y1: a.y - 45, y2: a.y + 8 }); }
  for (const d0 of DECOR) if (d0.block && upg(d0.k)) { const d = { ...d0, ...lp(w.lay, d0.k, d0) }; r.push({ id: d0.k, x1: d.x - d0.w * d0.block, x2: d.x + d0.w * d0.block, y1: d.y + d0.h * .5, y2: d.y + d0.h - 4 }); }
  return r;
}
function navGrid(w) {
  const g = new Uint8Array(NC * NR);
  for (const s of solidsFor(w)) {
    for (let cy = Math.max(0, Math.floor(s.y1 / CS)); cy <= Math.min(NR - 1, Math.floor(s.y2 / CS)); cy++)
      for (let cx = Math.max(0, Math.floor(s.x1 / CS)); cx <= Math.min(NC - 1, Math.floor(s.x2 / CS)); cx++) {
        const mx = cx * CS + CS / 2, my = cy * CS + CS / 2;
        if (mx > s.x1 && mx < s.x2 && my > s.y1 && my < s.y2) g[cy * NC + cx] = 1;
      }
  }
  for (let i = 0; i < NC; i++) for (let j = 0; j < 12; j++) g[j * NC + i] = 1; // dinding belakang
  return g;
}
const cellOf = (x, y) => [Math.max(0, Math.min(NC - 1, Math.floor(x / CS))), Math.max(0, Math.min(NR - 1, Math.floor(y / CS)))];
function astar(grid, ax, ay, bx, by, strict) {
  const [sx, sy] = cellOf(ax, ay), [gx, gy] = cellOf(bx, by), S = sy * NC + sx, Gl = gy * NC + gx;
  if (strict && (grid[Gl] || grid[S])) return null;
  const gs = new Float32Array(NC * NR).fill(1e9), from = new Int32Array(NC * NR).fill(-1), closed = new Uint8Array(NC * NR);
  const heap = [[0, S]]; gs[S] = 0;
  const push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  while (heap.length) {
    const [, cur] = pop(); if (closed[cur]) continue; closed[cur] = 1;
    if (cur === Gl) break;
    const cx = cur % NC, cy = (cur / NC) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= NC || ny >= NR) continue;
      const ni = ny * NC + nx; if (closed[ni]) continue;
      const blocked = grid[ni] && ni !== Gl;
      if (blocked && strict) continue;
      if (dx && dy && strict && (grid[cy * NC + nx] || grid[ny * NC + cx])) continue;
      const c = gs[cur] + (dx && dy ? 1.414 : 1) * (blocked ? 25 : 1);
      if (c < gs[ni]) { gs[ni] = c; from[ni] = cur; push(c + Math.hypot(nx - gx, ny - gy), ni); }
    }
  }
  if (from[Gl] < 0 && Gl !== S) return null;
  const cells = []; for (let i = Gl; i !== S && i >= 0; i = from[i]) cells.push(i); cells.reverse();
  const pts = cells.map(i => ({ x: (i % NC) * CS + CS / 2, y: ((i / NC) | 0) * CS + CS / 2 }));
  // ratakan: buang titik bila garis lurus tak kena perabot
  const free = (p, q) => { const n = Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / 8); for (let k = 1; k < n; k++) { const [x, y] = cellOf(p.x + (q.x - p.x) * k / n, p.y + (q.y - p.y) * k / n); if (grid[y * NC + x]) return false; } return true; };
  const out = []; let a = { x: ax, y: ay };
  for (let i = 0; i < pts.length; i++) { if (i === pts.length - 1 || !free(a, pts[i + 1])) { out.push(pts[i]); a = pts[i]; } }
  if (out.length) out.pop();
  out.push({ x: bx, y: by });
  return out;
}
const pathLen = (a, p) => { let L = 0, c = a; for (const q of p) { L += Math.hypot(q.x - c.x, q.y - c.y); c = q; } return L; };
function moveEnt(e, speed, dt) {
  const key = e.tx + ',' + e.ty;
  if (e.navKey !== key) { e.navKey = key; e.path = (game && game.nav && astar(game.nav, e.x, e.y, e.tx, e.ty, false)) || [{ x: e.tx, y: e.ty }]; }
  let rem = speed * dt, moved = false;
  while (rem > 0 && e.path.length) {
    const p = e.path[0], dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy);
    if (d > .01) { e.mdx = dx; e.mdy = dy; }
    if (d <= rem) { e.x = p.x; e.y = p.y; rem -= d; e.path.shift(); } else { e.x += dx / d * rem; e.y += dy / d * rem; rem = 0; }
    moved = true;
  }
  e.moving = moved; return moved;
}
// titik pendekatan yang mesti boleh sampai
function guestPoint(s) { return { x: s.x, y: s.y + 10 }; }
function staffPointOf(s) { return s.kind === 'pay' ? { x: s.x, y: s.y - 70 } : { x: s.x + 62 * s.sc, y: s.y + 25 }; }
function worldFor(lay, diff) {
  const w = { lay, slots: buildSlots(diff, lay), seats: buildSeats(lay), coffee: lp(lay, 'coffee', COFFEE_DEF) };
  w.nav = navGrid(w); return w;
}
function validateWorld(w) {
  const bad = new Set(), start = { x: 20, y: 900 }, g = w.nav;
  const ok = (p, id) => { if (!astar(g, start.x, start.y, p.x, p.y + (p.ap || 0), true)) bad.add(id); };
  // pintu masuk mesti lapang
  for (const s of solidsFor(w)) if (s.x1 < 70 && s.y2 > 850) bad.add(s.id);
  for (const s of w.slots) { ok({ x: s.x, y: s.y + 30 }, s.id); ok(staffPointOf(s), s.id); }
  if (upg('coffee')) ok({ x: w.coffee.x - 50, y: w.coffee.y + 20 }, 'coffee');
  w.seats.forEach(s => ok({ x: s.x, y: Math.min(950, s.y + 30) }, 'sofa'));
  ok({ x: 420, y: 640 }, 'mira');
  const S = solidsFor(w);
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) { const a = S[i], b = S[j]; if (a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1) { bad.add(a.id); bad.add(b.id); } }
  return [...bad];
}
// baiki susun atur lama yang rosak (buang item bermasalah, kalau tak jadi reset)
function repairLayout() {
  let lay = { ...state.layout }; const diff = Math.max(5, state.level);
  let bad = validateWorld(worldFor(lay, diff));
  if (!bad.length) return false;
  for (let k = 0; k < 6 && bad.length; k++) { bad.forEach(id => delete lay[id]); bad = validateWorld(worldFor(lay, diff)); }
  if (bad.length) lay = {};
  state.layout = lay; save(); return true;
}

// ---------- game state ----------
let mode = 'home', game = null, selected = null, nextId = 1, last = performance.now(), attSeq = Date.now() % 100000;
const cv = $('salonCanvas'), mainCtx = cv.getContext('2d');
let ctx = mainCtx, scale = 1;
const JOBS = [['wash', '🫧', 'Shampoo', 1], ['cut', '✂️', 'Gunting', 1], ['color', '🎨', 'Warna', 5], ['pay', '💰', 'Kaunter', 1], ['coffee', '☕', 'Kopi', 1]];
const ROLE_DEF = { mira: ['wash', 'cut', 'color', 'pay', 'coffee'], aiman: ['wash', 'coffee'], lina: ['pay'] };
function roleOf(id) { return (state.roles && state.roles[id]) || ROLE_DEF[id]; }
function hiredStaff() { return ['mira'].concat(upg('helper1') ? ['aiman'] : [], upg('helper2') ? ['lina'] : []); }

// begin(spec, attempt) — attempt dikekalkan bila "Ulang Level" dari pause (bekalan & yuran kontrak tak dicaj lagi)
function begin(spec, attempt) {
  if (repairLayout()) toast('Susun atur lama tak sah — dah dibaiki 🛠️');
  const cfg = levelCfg(spec);
  mode = 'play'; selected = null;
  if (!attempt) {
    attempt = { id: ++attSeq, sup: {} };
    for (const k of Object.keys(SUP)) if (state.supUse[k] && state.sup[k] > 0 && SUP[k].need()) { state.sup[k]--; attempt.sup[k] = true; if (!state.sup[k]) state.supUse[k] = false; }
    save();
  }
  game = { cfg, spec, kind: spec.kind, n: spec.n, level: cfg.diff, loc: cfg.loc, total: cfg.total, goal: cfg.goal, spawned: 0, served: 0, lost: 0, earned: 0, t: 0,
    arrivals: cfg.times.slice(), guests: [], fx: [], moodSum: 0, combo: 0, lastKind: null, comboT: 0, bestCombo: 0, cnt: { perfect: 0, wish: 0, color: 0 },
    att: attempt, beans: attempt.sup.beans ? 3 : 0, reveal: null };
  const lay = state.layout;
  game.slots = buildSlots(cfg.diff, lay); game.seats = buildSeats(lay); Object.assign(COFFEE, lp(lay, 'coffee', COFFEE_DEF));
  game.nav = navGrid({ lay, slots: game.slots, seats: game.seats, coffee: COFFEE });
  const mk = (id, x, y) => ({ id, ...STAFF[id], x, y, tx: x, ty: y, queue: [], cur: null, act: 0, face: 1, walk: 0, happy: 0, path: [] });
  game.staff = [mk('mira', 420, 640)];
  if (upg('helper1')) game.staff.push(mk('aiman', STAFF.aiman.home.x, STAFF.aiman.home.y));
  if (upg('helper2')) game.staff.push(mk('lina', STAFF.lina.home.x, STAFF.lina.home.y));
  game.mira = game.staff[0];
  $('homeView').hidden = true; $('gameView').hidden = false; $('gameView').classList.remove('editing'); $('overlay').hidden = true; document.querySelectorAll('.sheet').forEach(x => x.hidden = true);
  $('playingLevel').textContent = spec.kind === 'campaign' ? 'LEVEL ' + spec.n : spec.kind === 'contract' ? 'KONTRAK' : 'MASTER';
  $('hudLoc').textContent = (cfg.ev ? EVENTS[cfg.ev].icon + ' ' : '') + cfg.loc.name.toUpperCase();
  resize(); hud(); window.scrollTo(0, 0); sound('door');
}

function spawnGuest() {
  const seat = game.seats.find(s => s.guestId == null); if (!seat) return false;
  const P = game.cfg.plan[game.spawned], type = P.type, T = GUESTS[type];
  let base = (Math.max(30, 58 - game.level * .35) + Math.random() * 10) * T.patience * game.cfg.patMul;
  if (game.att.sup.snack && game.t < 45) base *= 1.15;
  const g = { id: nextId++, type, name: rnd(NAMES[type]), skin: Math.floor(Math.random() * SKIN.length),
    hair: Math.floor(Math.random() * HAIR.length), style: Math.floor(Math.random() * STYLES.length), outfit: Math.floor(Math.random() * OUTFIT.length),
    steps: P.steps.slice(), step: 0, status: 'walk', x: DOOR.x, y: DOOR.y, tx: seat.x, ty: seat.y, at: { k: 'seat', o: seat },
    patience: base, max: base, tip: 0, bounce: 0, sparkle: 0, coffee: 0, done: [], wish: P.wish, resv: null, path: [],
    look: { cut: false, hair: null, pin: false } };
  if (type === 'makcik') g.style = -1;
  if (type === 'remaja' && Math.random() < .6) g.style = 5;
  seat.guestId = g.id; game.guests.push(g); game.spawned++; hud();
  sound('door'); return true;
}
const G = id => game && game.guests.find(g => g.id === id);
const need = g => g.steps[g.step];
const canMove = g => g && g.status === 'wait';
const slotById = id => game.slots.find(s => s.id === id);

function cancelResv(g) { if (g.resv == null) return; const s = slotById(g.resv); if (s) s.resv = s.resv.filter(i => i !== g.id); g.resv = null; }
function release(g) {
  if (!g.at) return;
  if (g.at.k === 'seat') g.at.o.guestId = null;
  else { const s = g.at.o; s.guestId = null; s.state = 'empty'; s.t = 0; s.queued = false; s.retry = false; s.qte = null; game.staff.forEach(m => { m.queue = m.queue.filter(q => q.slot !== s); if (m.cur && m.cur.slot === s) { m.cur = null; } }); }
  g.at = null;
}
function leave(g, angry) {
  cancelResv(g); release(g); g.status = 'leave'; g.tx = DOOR.x; g.ty = DOOR.y;
  if (angry) g.angry = true; else g.happyLeave = true;
  if (selected === g.id) selected = null;
}
function assign(g, s, auto) {
  if (!canMove(g)) return false;
  if (s.guestId != null) { toast('Station tu ada orang!'); sound('bad'); return false; }
  if (need(g) !== s.kind) { toast(g.name + ' perlukan ' + TYPES[need(g)].icon + ' ' + TYPES[need(g)].name + ' dulu!'); sound('bad'); return false; }
  cancelResv(g); release(g);
  s.guestId = g.id; s.state = 'arriving'; g.at = { k: 'slot', o: s };
  g.status = 'walk'; const gp = guestPoint(s); g.tx = gp.x; g.ty = gp.y;
  if (TYPES[s.kind].staff && !enqueue({ k: 'work', slot: s }, true)) { s.retry = true; toast('Staf penuh — kerja ' + TYPES[s.kind].name + ' akan masuk queue bila lapang'); }
  if (selected === g.id) selected = null;
  if (auto) fx('📌 ' + g.name, s.x, s.y - 140, '#7759a8', 18);
  sound('tap'); return true;
}
// tempah stesen yang sedang berpenghuni
function reserve(g, s) {
  if (!canMove(g)) return false;
  if (need(g) !== s.kind) { toast(g.name + ' perlukan ' + TYPES[need(g)].icon + ' ' + TYPES[need(g)].name + ' dulu!'); sound('bad'); return false; }
  if (g.resv === s.id) { cancelResv(g); toast('Tempahan ' + g.name + ' dibatalkan'); sound('tap'); selected = null; return true; }
  if (s.resv.length >= BAL.resvMax) { toast('Tempahan ' + TYPES[s.kind].name + ' penuh (max ' + BAL.resvMax + ')'); sound('bad'); return false; }
  cancelResv(g); s.resv.push(g.id); g.resv = s.id;
  toast('📌 ' + g.name + ' tempah ' + TYPES[s.kind].name + ' (giliran #' + s.resv.length + ')'); sound('tap'); selected = null; return true;
}
function place(g, s) { if (s.guestId == null) return assign(g, s); if (s.guestId === g.id) return false; return reserve(g, s); }
function enqueue(task, quiet) {
  const kind = task.k === 'coffee' ? 'coffee' : task.slot.kind, max = 5;
  const cand = game.staff.filter(x => roleOf(x.id).includes(kind));
  const m = (cand.length ? cand : [game.mira]).slice().sort((a, b) => (a.queue.length + (a.cur ? 1 : 0)) - (b.queue.length + (b.cur ? 1 : 0)))[0];
  if (m.queue.length + (m.cur ? 1 : 0) >= max + 1) { if (!quiet) { toast('Queue ' + m.name + ' penuh! (max 5)'); sound('bad'); } return false; }
  if (task.slot) { task.slot.queued = true; task.slot.retry = false; }
  m.queue.push(task); return true;
}
function giveCoffee(g) {
  if (!upg('coffee')) { toast('Beli upgrade Mesin Kopi dulu ☕'); return; }
  if (g.coffee > 0) { toast(g.name + ' dah dapat kopi'); return; }
  if (game.staff.some(m => m.queue.some(q => q.k === 'coffee' && q.g === g) || (m.cur && m.cur.k === 'coffee' && m.cur.g === g))) return;
  if (enqueue({ k: 'coffee', g })) { selected = null; sound('tap'); }
}
function staffPoint(task) { return task.k === 'coffee' ? { x: COFFEE.x - 50, y: COFFEE.y + 20 } : staffPointOf(task.slot); }

function finishService(s, who) {
  const g = G(s.guestId); if (!g) return;
  const kind = s.kind;
  if (kind !== 'pay') {
    game.combo = game.lastKind === kind ? game.combo + 1 : 1; game.lastKind = kind; game.comboT = 3 + upg('d_jukebox') * 1.5;
    if (game.combo >= 2) { g.tip += 4 * game.combo; fx('COMBO x' + game.combo + '!', s.x, s.y - 110, '#e56b93', 30); sound('combo'); game.bestCombo = Math.max(game.bestCombo, game.combo); stat('combo', game.combo, true); }
  }
  // makeover: keadaan rupa (kekal sepanjang gerak, pose & checkout)
  if (kind === 'wash') { g.sparkle = 1.2; sound('water'); }
  if (kind === 'cut') { if (g.type === 'makcik') g.look.pin = true; else g.look.cut = true; if (g.style >= 0) { let n; do { n = Math.floor(Math.random() * STYLES.length); } while (n === g.style); g.style = n; } else g.tudung = (g.tudung || 0) + 1; g.sparkle = 1.5; }
  if (kind === 'color') {
    if (g.type === 'makcik') g.look.pin = true;
    else { let n; do { n = Math.floor(Math.random() * HAIR_LOOKS.length); } while (n === g.look.hair); g.look.hair = n; }
    let h; do { h = Math.floor(Math.random() * HAIR.length); } while (h === g.hair); g.hair = h;
    g.sparkle = 1.5; game.cnt.color++;
    if (game.att.sup.colour) g.tipPct = (g.tipPct || 0) + .15;
  }
  if (kind === 'style') { g.sparkle = 2; g.shine = 1; }
  if ((kind === 'cut' || kind === 'color') && who && who.id === 'mira') g.tip += 2 + TR('mira', 'qual') * 3;
  if (kind !== 'pay') g.tip += 5 * upg(kind);
  g.done.push(kind); g.step++;
  g.tip += Math.round(4 * (g.patience / g.max));
  if (kind === 'pay') {
    const T = GUESTS[g.type], mood = g.patience / g.max;
    const linaX = who && who.id === 'lina' ? 1.05 + TR('lina', 'tip') * .03 : 1;
    let pay = Math.round((18 + (g.steps.length - 1) * 9 + g.tip) * T.tip * game.cfg.tipX * (0.75 + mood * .5) * tipMult() * linaX * (1 + (g.tipPct || 0)));
    if (g.wish) {
      const ok = g.wish === 'perfect' ? g.perfect : mood >= .6;
      if (ok) { const b = Math.round(30 * game.cfg.tipX); pay += b; game.cnt.wish++; fx('⭐ Hajat tercapai! +' + b, s.x - 40, s.y - 140, '#e56b93', 24); stat('wish', 1); sound('perfect'); }
      else fx('Hajat tak tercapai…', s.x - 40, s.y - 140, '#9a7f8f', 18);
    }
    stat('served', 1); stat('earned', pay); if (g.type === 'makcik') stat('makcik', 1); if (g.type === 'vip') stat('vip', 1);
    game.earned += pay; game.served++; game.moodSum += mood;
    fx('+🪙' + pay, s.x, s.y - 90, '#d39a1c', 28);
    for (let i = 0; i < 6; i++) game.fx.push({ coin: true, x: s.x, y: s.y - 40, vx: (Math.random() - .5) * 220, vy: -200 - Math.random() * 150, life: 1 });
    sound('coin'); (who || game.mira).happy = 1;
    if (g.done.some(k => k === 'cut' || k === 'color')) game.reveal = { g, t: 2.6 };
    leave(g, false);
  } else {
    g.status = 'wait'; s.state = 'done'; g.bounce = 1;
    if (selected == null) selected = g.id;
  }
  hud();
}

// ---------- update ----------
function update(dt) {
  if (mode !== 'play') return;
  game.t += dt;
  if (game.comboT > 0 && (game.comboT -= dt) <= 0) { game.combo = 0; game.lastKind = null; }
  if (game.reveal && (game.reveal.t -= dt) <= 0) game.reveal = null;
  // ketibaan ikut jadual lokasi
  if (game.spawned < game.total && game.t >= game.arrivals[game.spawned]) { if (!spawnGuest()) game.arrivals[game.spawned] = game.t + 1; }
  const decay = (1 - upg('comfort') * .12) * (1 - upg('d_aquarium') * .08);
  const linaOn = game.staff.some(m => m.id === 'lina');
  for (const g of game.guests.slice()) {
    const sp = g.status === 'leave' ? 260 : 230;
    moveEnt(g, sp, dt);
    g.walking = g.moving;
    if (!g.moving && !g.path.length) {
      if (g.status === 'walk') {
        if (g.at && g.at.k === 'slot') {
          const s = g.at.o;
          if (!TYPES[s.kind].staff) { s.state = 'working'; s.t = 0; s.dur = TYPES[s.kind].time * Math.pow(.82, upg(s.kind)); g.status = 'serve'; sound('dry'); }
          else { s.state = 'ready'; g.status = 'ready'; }
        } else g.status = 'wait';
      }
      if (g.status === 'leave') { game.guests = game.guests.filter(x => x !== g); continue; }
    }
    if (g.bounce > 0) g.bounce -= dt * 2.5;
    if (g.sparkle > 0) g.sparkle -= dt;
    if (g.coffee > 0) g.coffee -= dt;
    if (g.status === 'wait' || g.status === 'ready' || (g.status === 'walk' && g.at && g.at.k === 'seat')) {
      const atSeat = g.at && g.at.k === 'seat', atPay = g.at && g.at.k === 'slot' && g.at.o.kind === 'pay';
      const rate = (g.status === 'ready' ? .55 : 1) * decay * (g.coffee > 0 ? .3 : 1) * (atSeat && upg('d_tv') ? .85 : 1) * (atSeat && renoDone('lounge') ? .95 : 1) * (atPay && linaOn ? .6 : 1);
      g.patience -= dt * rate;
      if (g.patience <= 0) {
        game.lost++; leave(g, true);
        fx('😡 ' + g.name + ' blah!', g.x, g.y - 120, '#c6455f', 24); sound('bad'); hud();
      }
    }
  }
  for (const s of game.slots) {
    // kerja yang gagal masuk queue: cuba lagi senyap (pelanggan tak tersangkut)
    if (s.retry && !s.queued && G(s.guestId)) enqueue({ k: 'work', slot: s }, true);
    // tempahan: buang yang tak sah, gerakkan giliran pertama bila stesen kosong
    if (s.resv.length) {
      s.resv = s.resv.filter(id => { const x = G(id); return x && x.status !== 'leave' && x.resv === s.id && need(x) === s.kind; });
      if (s.guestId == null) { const x = s.resv.map(G).find(canMove); if (x) assign(x, s, true); }
    }
    if (s.state === 'working' && !TYPES[s.kind].staff) { s.t += dt; if (s.t >= s.dur) finishService(s); }
  }
  for (const m of game.staff) updateStaff(m, dt);
  for (const f of game.fx) {
    f.life -= dt * (f.coin ? 1.4 : .9);
    if (f.coin) { f.vy += 600 * dt; f.x += f.vx * dt; f.y += f.vy * dt; } else f.y -= 40 * dt;
  }
  game.fx = game.fx.filter(f => f.life > 0);
  if (game.spawned >= game.total && !game.guests.length) endLevel();
}
function updateStaff(m, dt) {
  if (m.happy > 0) m.happy -= dt;
  if (!m.cur && m.queue.length) {
    m.cur = m.queue.shift();
    if (m.cur.k === 'work' && !G(m.cur.slot.guestId)) { m.cur.slot.queued = false; m.cur = null; }
    else if (m.cur.k === 'coffee' && !game.guests.includes(m.cur.g)) m.cur = null;
    if (m.cur) { const p = staffPoint(m.cur); m.tx = p.x; m.ty = p.y; m.phase = 'go'; }
  }
  const moved = moveEnt(m, m.speed * moveMul(m), dt);
  if (moved) { m.walk += dt * 10; if (Math.abs(m.mdx) > 1) m.face = m.mdx > 0 ? 1 : -1; return; }
  if (m.path.length) return;
  if (m.cur) {
    const c = m.cur;
    if (c.k === 'work') {
      const s = c.slot, g = G(s.guestId);
      if (!g) { s.queued = false; m.cur = null; }
      else if (m.phase === 'go') {
        if (g.status === 'ready') {
          m.phase = 'do'; s.state = 'working'; g.status = 'serve'; s.t = 0; s.dur = TYPES[s.kind].time * Math.pow(.82, upg(s.kind)) * svcMul(m, s.kind); m.face = -1; m.act = 0; s.by = m;
          s.qte = (s.kind === 'cut' || s.kind === 'color' || (s.kind === 'wash' && m.id === 'mira')) ? { t: 0, res: null, c: .3 + Math.random() * .4, sp: .75 + Math.min(.6, game.level * .012), z: zoneMul(m) } : null;
        }
      } else {
        s.t += dt; m.act += dt; if (s.qte) s.qte.t += dt;
        if (s.kind === 'cut' && Math.floor(m.act * 2.2) !== Math.floor((m.act - dt) * 2.2)) sound('snip');
        if (s.kind === 'wash' && Math.floor(m.act * .8) !== Math.floor((m.act - dt) * .8)) sound('water');
        if (s.t >= s.dur) { s.queued = false; m.cur = null; finishService(s, m); }
      }
    } else if (c.k === 'coffee') {
      if (m.phase === 'go') { m.phase = 'do'; m.act = 0; }
      m.act += dt;
      if (m.act >= (m.id === 'aiman' ? 1.0 : 1.3)) {
        const g = c.g;
        if (game.guests.includes(g) && g.status !== 'leave') {
          let amt = .35 + upg('coffee') * .1 + (m.id === 'aiman' ? .05 + TR('aiman', 'coffee') * .08 : 0);
          if (game.beans > 0) { amt *= 1.5; game.beans--; }
          g.patience = Math.min(g.max, g.patience + g.max * amt); g.coffee = 6; g.bounce = 1; fx('☕ Sedapnya!', g.x, g.y - 120, '#8a5434', 22); sound('coin'); stat('coffee', 1);
        }
        m.cur = null;
      }
    }
  } else if (!m.queue.length && m.home) { m.tx = m.home.x; m.ty = m.home.y; }
}
function fx(text, x, y, color, size) { game.fx.push({ text, x, y, color, size, life: 1.4 }); }

// ---------- objektif ----------
function objProgress() {
  const o = game.cfg.obj;
  const cur = o === 'income' ? game.earned : o === 'perfect' ? game.cnt.perfect : o === 'wish' ? game.cnt.wish : o === 'mix' ? game.cnt.color : game.served;
  return { cur, target: game.cfg.target };
}
function objResult() {
  const { cur, target } = objProgress(), o = game.cfg.obj;
  const avg = game.served ? game.moodSum / game.served : 0;
  let won = cur >= target, stars = 0;
  if (o === 'noangry') { won = game.lost === 0 && game.served >= target; if (won) stars = avg >= .55 ? 3 : avg >= .4 ? 2 : 1; }
  else if (won) stars = (game.lost === 0 && avg >= .5) ? 3 : game.lost <= 2 ? 2 : 1;
  return { won, stars, cur, target, avg };
}
const STAR_RULE = 'Bintang: ⭐ lulus · ⭐⭐ lulus & ≤2 blah · ⭐⭐⭐ 0 blah & hati purata ≥ 50%.';
const STAR_RULE_NA = 'Bintang: ⭐ lulus · ⭐⭐ hati purata ≥ 40% · ⭐⭐⭐ hati purata ≥ 55%.';

function endLevel() {
  const r = objResult(), won = r.won, stars = r.stars;
  const lines = [];
  let payout = 0, title = won ? 'Level Lulus!' : 'Cuba Lagi!', actions;
  const prevLoc = locOf(state.level);
  if (game.kind === 'campaign') {
    const n = game.n, first = !cleared(n), prev = state.stars[n] || 0;
    if (won) {
      if (first) {
        const fc = BAL.firstClearBonus(n), sb = stars * BAL.starBonus, cb = game.bestCombo * BAL.comboBonus;
        payout = game.earned + fc + sb + cb;
        lines.push('Kutipan: 🪙' + game.earned, '🎉 Bonus first-clear: 🪙' + fc, 'Bonus bintang & combo: 🪙' + (sb + cb));
      } else {
        const ns = Math.max(0, stars - prev), keep = Math.round(game.earned * BAL.repeatKeep);
        payout = keep + ns * BAL.newStarBonus;
        lines.push('Ganjaran ulang (' + Math.round(BAL.repeatKeep * 100) + '% kutipan): 🪙' + keep);
        if (ns) lines.push('⭐ Bintang baru +' + ns + ': 🪙' + ns * BAL.newStarBonus);
      }
      state.stars[n] = Math.max(prev, stars);
      state.level = Math.min(LIMIT, Math.max(state.level, n + 1));
      if (first) state.sel = state.level;
    } else { payout = Math.floor(game.earned * BAL.failKeep); lines.push('Simpan ' + Math.round(BAL.failKeep * 100) + '% kutipan: 🪙' + payout); }
    if (stars === 3) stat('stars3', 1);
    const nextN = Math.min(LIMIT, n + 1);
    actions = won ? (n < LIMIT && nextN <= state.level ? [['▶ LEVEL ' + nextN, 'next'], ['🏠 BALIK SALON', 'home']] : [['🏠 BALIK SALON', 'home']]) : [['↻ CUBA LAGI', 'retry'], ['🏠 BALIK SALON', 'home']];
    if (won && n === LIMIT && first) lines.push('', '👑 Kempen tamat! Mod Salon Master dibuka dalam Peta.');
  } else if (game.kind === 'contract') {
    const c = state.contract, T = CTIERS[game.spec.tier];
    if (c && c.status === 'active' && c.att === game.att.id) {
      c.status = won ? 'done' : 'failed';   // tanda dulu sebelum bayar → tak boleh tuntut dua kali
      const keep = Math.round(game.earned * (won ? BAL.contractKeepWin : BAL.contractKeepFail));
      payout = keep + (won ? T.pay : 0);
      lines.push('Kutipan disimpan: 🪙' + keep);
      if (won) lines.push('📜 Bayaran kontrak: 🪙' + T.pay, 'Untung bersih vs yuran: 🪙' + (payout - T.fee));
      else lines.push('Yuran 🪙' + T.fee + ' hangus. Cuba lagi = yuran baru.');
    }
    title = won ? 'Kontrak Berjaya!' : 'Kontrak Gagal';
    actions = [['🏠 BALIK SALON', 'home']];
  } else {
    const keep = won ? game.earned : Math.round(game.earned * BAL.masterKeepFail), bonus = won ? BAL.masterBonus[stars] : 0;
    payout = keep + bonus; lines.push('Kutipan: 🪙' + keep, won ? '👑 Bonus Master: 🪙' + bonus : 'Simpan ' + Math.round(BAL.masterKeepFail * 100) + '% kutipan.');
    if (game.spec.round === state.master.round) { state.master.round++; state.master.played++; if (won) state.master.wins++; }
    title = won ? 'Sesi Master Berjaya!' : 'Sesi Master Tamat';
    actions = [['🏠 BALIK SALON', 'home']];
  }
  state.coins += Math.max(0, payout);
  save(); mode = 'result';
  const newLoc = locOf(state.level);
  if (won && game.kind === 'campaign' && newLoc !== prevLoc) lines.push('', '🎉 Lokasi baru dibuka: ' + newLoc.icon + ' ' + newLoc.name + '!');
  const O = OBJ[game.cfg.obj];
  modal(won ? '🏆' : '💔', title,
    (won ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '\n' : '') +
    O.icon + ' ' + O.t(r.target) + ': ' + r.cur + ' / ' + r.target + (won ? ' ✓' : ' ✗') +
    '\nDilayan: ' + game.served + ' / ' + game.total + ' · Blah: ' + game.lost +
    (game.bestCombo >= 2 ? '\nCombo terbaik: x' + game.bestCombo : '') + '\n' + lines.join('\n') + '\nJumlah: +🪙' + payout,
    actions);
  sound(won ? 'win' : 'bad');
}

function hud() {
  if (!game || !game.cfg) return;
  const { cur, target } = objProgress(), O = OBJ[game.cfg.obj];
  $('hudObjLabel').textContent = O.icon + ' ' + O.hud;
  $('servedCount').textContent = (game.cfg.obj === 'income' ? '🪙' : '') + cur + ' / ' + target;
  $('earnedCount').textContent = '🪙 ' + game.earned;
  $('goalFill').style.width = Math.min(100, cur / target * 100) + '%';
  $('goalCaption').textContent = 'Datang ' + game.spawned + '/' + game.total + ' · Dilayan ' + game.served + ' · Blah ' + game.lost + (game.cfg.obj === 'noangry' ? ' (mesti 0)' : '');
}

// ---------- drawing ----------
function dirOf(dx, dy) { return Math.abs(dx) > Math.abs(dy) * 1.2 ? 'side' : dy > 0 ? 'front' : 'back'; }
function resize() {
  const maxW = Math.min(620, window.innerWidth - 16);
  const top = cv.getBoundingClientRect().top || 110;
  const maxH = Math.max(380, window.innerHeight - top - 46);
  const w = Math.min(maxW, maxH * W / H);
  scale = w / W;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.width = w + 'px'; cv.style.height = (w * H / W) + 'px';
  cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr);
  ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function ell(x, y, rx, ry, fill, stroke, lw = 3) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
function text(t, x, y, size, color, align = 'center', stroke = '#fff') {
  ctx.font = `${size}px "Lilita One", "Nunito", sans-serif`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = size / 5; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(t, x, y); }
  ctx.fillStyle = color; ctx.fillText(t, x, y);
}
const ICON = { '🫧': 'wash', '✂️': 'cut', '🎨': 'color', '💨': 'style', '💰': 'pay', '☕': 'coffee', '🪙': 'coin', '⭐': 'star', '❤️': 'heart', '💔': 'heartbroken', '⏳': 'wait', '👑': 'crown', '📸': 'camera', '⚡': 'bolt', '🔒': 'lock', '✨': 'sparkle', '💢': 'angry', '💖': 'love' };
function emoji(e, x, y, size) {
  const ic = ICON[e] && img('ic_' + ICON[e]);
  if (ic) { const s = size * 1.25; ctx.drawImage(ic, x - s / 2, y - s / 2, s, s); return; }
  emojiText(e, x, y, size);
}
function emojiText(e, x, y, size) { ctx.font = `${size}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); }

function drawRoom(L) {
  const bg = img('bg_' + L.key);
  if (bg) ctx.drawImage(bg, 0, 0, W, H);
  else {
    ctx.fillStyle = L.wall; ctx.fillRect(0, 0, W, 250);
    ctx.fillStyle = L.wall2; for (let x = 0; x < W; x += 60) ctx.fillRect(x, 0, 28, 250);
    for (const wx of [210, 440]) { rr(wx, 74, 70, 120, 14); ctx.fillStyle = '#cfeefc'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(wx + 31, 74, 8, 120); emoji(L.icon, wx + 52, 172, 22); }
    rr(W / 2 - 150, 14, 300, 46, 20); ctx.fillStyle = L.trim; ctx.fill();
    text('✂ ' + L.name + ' ✂', W / 2, 38, 24, '#fff', 'center', null);
    ctx.fillStyle = L.floor; ctx.fillRect(0, 250, W, H - 250);
    ctx.fillStyle = L.floor2; for (let y = 250; y < H; y += 60) for (let x = ((y / 60) % 2) * 60; x < W; x += 120) ctx.fillRect(x, y, 60, 60);
    ctx.fillStyle = L.trim; ctx.fillRect(0, 244, W, 12);
  }
  drawCosmetics();
}
// ---- kosmetik (lukisan kod, berlapis atas latar) ----
const EQ = slot => state.decor.eq[slot] || null;
function drawCosmetics() {
  const f = EQ('floor'), wl = EQ('wall'), sg = EQ('sign'), li = EQ('light'), pl = EQ('plant');
  ctx.save();
  if (f) {
    ctx.globalAlpha = f === 's_floor' ? .55 : .38;
    if (f === 'k_floor') { ctx.fillStyle = '#8a5a35'; for (let y = 262; y < H; y += 34) { ctx.fillRect(0, y, W, 3); for (let x = (y / 34 % 2) * 90; x < W; x += 180) ctx.fillRect(x, y, 3, 34); } }
    if (f === 'm_floor') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 252, W, H); ctx.strokeStyle = '#b9b2c8'; ctx.lineWidth = 2; for (let y = 252; y < H; y += 120) for (let x = 0; x < W; x += 120) { ctx.strokeRect(x, y, 120, 120); ctx.beginPath(); ctx.moveTo(x + 10, y + 30); ctx.bezierCurveTo(x + 50, y + 10, x + 70, y + 90, x + 115, y + 70); ctx.stroke(); } }
    if (f === 'r_floor') { ctx.fillStyle = '#e8cf9e'; ctx.fillRect(0, 252, W, H); ctx.strokeStyle = '#b89662'; ctx.lineWidth = 3; for (let y = 252, r = 0; y < H; y += 70, r++) for (let x = (r % 2) * -50; x < W; x += 100) { rr(x + 4, y + 4, 92, 62, 16); ctx.stroke(); } }
    if (f === 's_floor') { const g = ctx.createLinearGradient(0, 252, W, H); g.addColorStop(0, '#1d1424'); g.addColorStop(.5, '#3a2a48'); g.addColorStop(1, '#140e1a'); ctx.fillStyle = g; ctx.fillRect(0, 252, W, H); ctx.globalAlpha = .18; ctx.fillStyle = '#fff'; for (let x = -200; x < W; x += 160) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + 40, H); ctx.lineTo(x + 340, 252); ctx.lineTo(x + 300, 252); ctx.fill(); } }
    ctx.globalAlpha = 1;
  }
  if (wl) {
    const y0 = 168, h = 78;
    if (wl === 'k_wall') { ctx.fillStyle = '#a8603a'; ctx.fillRect(0, y0, W, h); for (let x = 0; x < W; x += 40) { ell(x + 20, y0 + 39, 14, 14, '#f2c46d', '#6b3a20', 2); ell(x + 20, y0 + 39, 5, 5, '#c6455f'); ctx.fillStyle = '#f6dfb8'; ctx.fillRect(x, y0 + 4, 40, 4); ctx.fillRect(x, y0 + h - 8, 40, 4); } }
    if (wl === 'm_wall') { ctx.fillStyle = '#e8e4f2'; ctx.fillRect(0, y0, W, h); for (let x = 0; x < W; x += 52) { ctx.fillStyle = (x / 52) % 2 ? '#b6aed2' : '#8f86b8'; ctx.beginPath(); ctx.moveTo(x, y0 + h); ctx.lineTo(x + 26, y0); ctx.lineTo(x + 52, y0 + h); ctx.fill(); } }
    if (wl === 'r_wall') { ctx.fillStyle = '#d6f1e8'; ctx.fillRect(0, y0, W, h); for (let x = 10; x < W; x += 70) { ctx.save(); ctx.translate(x, y0 + h); ctx.rotate(-.4 + (x % 140 ? .8 : 0)); ctx.fillStyle = '#4f9d8c'; ctx.beginPath(); ctx.ellipse(0, -36, 10, 36, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#2f6d5f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -70); ctx.stroke(); ctx.restore(); } }
    if (wl === 's_wall') { ctx.fillStyle = '#5a2d5e'; ctx.fillRect(0, y0, W, h); ctx.fillStyle = '#f2c46d'; ctx.fillRect(0, y0, W, 5); ctx.fillRect(0, y0 + h - 5, W, 5); ctx.font = '22px system-ui'; ctx.textAlign = 'center'; for (let x = 30; x < W; x += 60) ctx.fillText('★', x, y0 + 42 + ((x / 60) % 2 ? -10 : 10)); }
    ctx.fillStyle = '#00000022'; ctx.fillRect(0, y0 + h, W, 4);
  }
  if (li === 'm_light') for (const x of [170, 360, 550]) { ctx.strokeStyle = '#4a4458'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 70); ctx.stroke(); ctx.fillStyle = '#4a4458'; ctx.beginPath(); ctx.moveTo(x - 26, 100); ctx.lineTo(x - 10, 70); ctx.lineTo(x + 10, 70); ctx.lineTo(x + 26, 100); ctx.fill(); const g = ctx.createRadialGradient(x, 104, 2, x, 140, 90); g.addColorStop(0, '#fff6c8cc'); g.addColorStop(1, '#fff6c800'); ctx.fillStyle = g; ctx.fillRect(x - 90, 100, 180, 140); }
  if (li === 'r_light') { ctx.strokeStyle = '#6b4a5c'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= W; x += 6) { const y = 30 + Math.sin(x / W * Math.PI * 3) ** 2 * 40; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); const cols = ['#ffd36e', '#7fe0c8', '#ff9fb4', '#9fc4ff']; for (let x = 20, i = 0; x < W; x += 36, i++) { const y = 34 + Math.sin(x / W * Math.PI * 3) ** 2 * 40, on = (Math.floor(performance.now() / 500) + i) % 3; ell(x, y, 6, 8, cols[i % 4]); if (on) { ctx.globalAlpha = .35; ell(x, y, 14, 14, cols[i % 4]); ctx.globalAlpha = 1; } } }
  if (sg === 'k_sign') { rr(W / 2 - 130, 56, 260, 44, 10); ctx.fillStyle = '#8a5434'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#5c3720'; ctx.stroke(); text('Salon Mira · Sejak 2026', W / 2, 78, 20, '#ffe9c4', 'center', null); }
  if (sg === 's_sign') { ctx.shadowColor = '#ff7ac8'; ctx.shadowBlur = 18; text('★ STUDIO MIRA ★', W / 2, 74, 32, '#ffd1ee', 'center', '#d4459a'); ctx.shadowBlur = 0; }
  if (pl === 'k_plant') { ell(690, 300, 22, 8, '#00000022'); rr(668, 252, 44, 46, 10); ctx.fillStyle = '#c4703f'; ctx.fill(); ctx.fillStyle = '#5fa04a'; for (let i = 0; i < 7; i++) { ctx.save(); ctx.translate(690, 256); ctx.rotate(-1.2 + i * .4); ctx.beginPath(); ctx.ellipse(0, -30, 5, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
  if (pl === 'r_plant') { ell(684, 300, 26, 9, '#00000022'); rr(664, 262, 40, 38, 8); ctx.fillStyle = '#efe2c8'; ctx.fill(); ctx.strokeStyle = '#8b6a43'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(684, 266); ctx.quadraticCurveTo(690, 200, 680, 150); ctx.stroke(); ctx.fillStyle = '#3f9a6a'; for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(680, 150); ctx.rotate(i * 1.05); ctx.beginPath(); ctx.ellipse(0, -30, 10, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
  if (renoDone('frontage')) { for (let x = 16, i = 0; x < W; x += 32, i++) { const on = (Math.floor(performance.now() / 300) + i) % 4; ell(x, 10, 7, 7, on ? '#fff3b0' : '#e7c35e', '#a37b22', 2); if (on) { ctx.globalAlpha = .3; ell(x, 10, 14, 14, '#fff3b0'); ctx.globalAlpha = 1; } } if (!EQ('sign')) { ctx.shadowColor = '#ffe08a'; ctx.shadowBlur = 16; rr(W / 2 - 150, 52, 300, 46, 22); ctx.fillStyle = '#fff6dc'; ctx.fill(); ctx.shadowBlur = 0; ctx.lineWidth = 4; ctx.strokeStyle = '#d4a64b'; ctx.stroke(); text('✂ Cozy Salon Mira ✂', W / 2, 76, 24, '#a3506f', 'center', null); } }
  ctx.restore();
}
function drawRug() {
  const r = EQ('rug'), n = game.seats.length; if (!n) return;
  const x0 = game.seats[0].x - 70, w = (n - 1) * 92 + 140, y = game.seats[0].y - 10;
  if (renoDone('lounge')) { rr(x0 - 10, y - 150, w + 20, 110, 18); ctx.fillStyle = '#fff5ecdd'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#d4a64b'; ctx.stroke(); for (let i = 0; i < 3; i++) { const fx0 = x0 + 40 + i * (w - 80) / 2.5; rr(fx0, y - 135, 70, 52, 6); ctx.fillStyle = ['#f6c6d4', '#c9e4f6', '#e4d4f6'][i]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#a3793c'; ctx.stroke(); } for (const lx of [x0 - 4, x0 + w + 4]) { ctx.fillStyle = '#6b4a5c'; ctx.fillRect(lx - 3, y - 110, 6, 120); ctx.beginPath(); ctx.moveTo(lx - 20, y - 110); ctx.lineTo(lx + 20, y - 110); ctx.lineTo(lx + 12, y - 140); ctx.lineTo(lx - 12, y - 140); ctx.fillStyle = '#ffe3a8'; ctx.fill(); } }
  if (!r) return;
  ctx.save();
  if (r === 'k_rug') { rr(x0, y + 10, w, 70, 10); ctx.fillStyle = '#d9b77a'; ctx.fill(); ctx.clip(); for (let i = 0; i < w; i += 18) for (let j = 0; j < 70; j += 18) if (((i + j) / 18) % 2) { ctx.fillStyle = '#5f8f5a'; ctx.fillRect(x0 + i, y + 10 + j, 18, 18); } }
  if (r === 'm_rug') { rr(x0, y + 10, w, 70, 30); ctx.fillStyle = '#c7c2d3'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#8a7fb2'; ctx.stroke(); }
  if (r === 'r_rug') { rr(x0, y + 10, w, 70, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.clip(); for (let i = 0; i < w; i += 28) { ctx.fillStyle = '#4fb1c4'; ctx.fillRect(x0 + i, y + 10, 14, 70); } }
  if (r === 's_rug') { rr(x0, y + 10, w, 70, 4); ctx.fillStyle = '#b8203a'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#e8c15a'; ctx.stroke(); }
  ctx.restore();
}
function drawReception(s) {
  if (!renoDone('reception')) return;
  rr(s.x - 120, s.y - 210, 240, 150, 60); ctx.fillStyle = '#ffe4ec'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#d4a64b'; ctx.stroke();
  text('Selamat Datang', s.x, s.y - 178, 18, '#a3506f', 'center', null);
  for (const dx of [-135, 135]) { rr(s.x + dx - 16, s.y - 40, 32, 34, 8); ctx.fillStyle = '#e8d2b4'; ctx.fill(); ctx.fillStyle = '#5fa04a'; for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(s.x + dx, s.y - 40); ctx.rotate(-1 + i * .5); ctx.beginPath(); ctx.ellipse(0, -18, 6, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
}

function drawStation(s) {
  ctx.save(); ctx.translate(s.x, s.y); ctx.scale(s.sc, s.sc); ctx.translate(-s.x, -s.y);
  drawStationInner(s);
  ctx.restore();
  drawResvBadges(s);
  drawQTE(s);
}
const STATION_COL = { wash: '#8fd3e8', cut: '#f4a7c0', color: '#c3a6e8', style: '#ffd08a', pay: '#f2c46d' };
function drawStationInner(s) {
  const tier = s.kind !== 'pay' ? upg(s.kind) : 0;
  const T = TYPES[s.kind], sp = (tier === 2 && img('st_' + s.kind + '_gold')) || (tier >= 1 && img('st_' + s.kind + '_pro')) || img('st_' + s.kind);
  const sg = G(selected), want = sg && canMove(sg) && need(sg) === s.kind;
  if (want) { ctx.save(); ctx.globalAlpha = .45 + Math.sin(performance.now() / 180) * .2; ell(s.x, s.y + 40, 95, 40, s.guestId == null ? '#fff6a8' : '#c9b8ff'); ctx.restore(); }
  const fin = EQ('finish');
  if (fin) { const g = ctx.createLinearGradient(s.x - 85, 0, s.x + 85, 0); if (fin === 'm_finish') { g.addColorStop(0, '#9aa0ad'); g.addColorStop(.5, '#f5f7fb'); g.addColorStop(1, '#8b91a0'); } else { g.addColorStop(0, '#b8862a'); g.addColorStop(.5, '#ffe9a3'); g.addColorStop(1, '#a8781f'); } ell(s.x, s.y + 48, 88, 26, g, fin === 'm_finish' ? '#6c7280' : '#7a5410', 3); }
  else ell(s.x, s.y + 48, 80, 22, '#00000022');
  if (sp) ctx.drawImage(sp, s.x - 90, s.y - 120, 180, 180);
  else if (s.kind === 'pay') {
    rr(s.x - 90, s.y - 40, 180, 90, 18); ctx.fillStyle = '#c98a5a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#8d5a39'; ctx.stroke();
    rr(s.x - 80, s.y - 52, 160, 22, 10); ctx.fillStyle = '#e9b07e'; ctx.fill();
    emoji('🧾', s.x + 40, s.y - 70, 34); emoji('💐', s.x - 50, s.y - 72, 30);
  } else {
    if (s.kind === 'wash') { rr(s.x - 55, s.y - 95, 110, 50, 24); ctx.fillStyle = '#e8f6fb'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#7fb4c6'; ctx.stroke(); emoji('🚿', s.x + 44, s.y - 112, 28); }
    else if (s.kind === 'style') { ell(s.x, s.y - 85, 60, 40, '#ffe4b3', '#d79b4c', 4); ctx.fillStyle = '#d79b4c'; ctx.fillRect(s.x + 48, s.y - 85, 10, 110); }
    else { rr(s.x - 42, s.y - 128, 84, 92, 42); ctx.fillStyle = '#e7f3fb'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = s.kind === 'color' ? '#b08ad8' : '#e39ab4'; ctx.stroke(); }
    rr(s.x - 44, s.y - 30, 88, 70, 22); ctx.fillStyle = STATION_COL[s.kind]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#00000033'; ctx.stroke();
    rr(s.x - 52, s.y + 18, 104, 26, 12); ctx.fillStyle = STATION_COL[s.kind]; ctx.fill(); ctx.stroke();
  }
  rr(s.x - 52, s.y + 58, 104, 28, 14); ctx.fillStyle = '#fffffff0'; ctx.fill();
  text(T.icon + ' ' + T.name, s.x, s.y + 72, 15, '#6a4877', 'center', null);
  if (s.state === 'working') {
    const p = Math.min(1, s.t / s.dur);
    rr(s.x - 50, s.y + 90, 100, 14, 7); ctx.fillStyle = '#fff'; ctx.fill();
    rr(s.x - 48, s.y + 92, 96 * p, 10, 5); ctx.fillStyle = '#5fc48f'; ctx.fill();
  }
}
function drawResvBadges(s) {
  if (!s.resv.length) return;
  s.resv.forEach((id, i) => { const x = s.x + 58 * s.sc - i * 26, y = s.y - 128 * s.sc; ell(x, y, 13, 13, '#7759a8', '#fff', 3); text(String(i + 1), x, y + 1, 14, '#fff', 'center', null); });
  text('tempahan', s.x + 58 * s.sc - (s.resv.length - 1) * 13, s.y - 150 * s.sc, 11, '#7759a8');
}

// rupa pelanggan: potongan baru (sprite 'after') + warna (variant sprite _c1.._c3 bila dah dilukis ChatGPT)
function guestImg(g, pose) {
  let p = pose;
  if (g.look.cut && pose === 'sit') p = 'after';
  const base = 'guest_' + g.type + '_' + p;
  if (g.look.hair != null) { const v = img(base + '_c' + (g.look.hair + 1)); if (v) return v; }
  return img(base);
}
function drawPin(x, y) { ell(x, y, 7, 7, '#f2c46d', '#a3793c', 2); ell(x, y, 3, 3, '#e56b93'); ctx.globalAlpha = .6 + Math.sin(performance.now() / 200) * .3; emojiText('✦', x + 9, y - 8, 10); ctx.globalAlpha = 1; }
function drawGuest(g) {
  const T = GUESTS[g.type], seated = !g.walking && g.status !== 'leave';
  const bob = g.walking ? Math.abs(Math.sin(performance.now() / 110)) * 6 : 0;
  const bnc = g.bounce > 0 ? Math.sin(g.bounce * Math.PI) * 14 : 0;
  const x = g.x, y = g.y - bob - bnc - (seated ? 0 : 6);
  const mood = g.angry ? 0 : g.happyLeave ? 1 : g.patience / g.max;
  const dir = dirOf(g.mdx || 0, g.mdy || 1), step = Math.sin(performance.now() / 110) > 0 ? 'walk1' : 'walk2';
  const pose = g.walking ? dir + '_' + step : g.status === 'serve' ? 'chair' : mood < .3 ? 'angry' : g.done.length && g.step >= g.steps.length - 1 ? 'after' : 'sit';
  const sp = guestImg(g, pose);
  const flip = g.walking && dir === 'side' && (g.mdx || 0) < 0;
  const sel = selected === g.id;
  if (sel) ell(x, g.y + 34, 52, 16, '#ffe36e'); else ell(x, g.y + 34, 40, 12, '#00000026');
  if (sp) { ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.drawImage(sp, -75, -125, 150, 150); ctx.restore(); }
  else chibi(x, y, { skin: SKIN[g.skin], hair: HAIR[g.hair], style: g.style, outfit: OUTFIT[g.outfit], mood, tudung: g.tudung || 0, closed: g.status === 'serve', shine: g.shine, crown: g.type === 'vip', walking: g.walking });
  if (g.look.pin && !g.walking) drawPin(x + 16, y - 70);
  if (g.status === 'serve' && TYPES[g.at?.o?.kind]?.staff === false) { ctx.globalAlpha = .5; ell(x, y - 60, 46, 38, '#fff'); ctx.globalAlpha = 1; }
  if (g.sparkle > 0) { ctx.globalAlpha = Math.min(1, g.sparkle); const t = performance.now() / 200; for (let i = 0; i < 5; i++) emoji('✨', x + Math.cos(t + i * 1.3) * 50, y - 60 + Math.sin(t * 1.2 + i) * 40, 18); ctx.globalAlpha = 1; }
  if (g.coffee > 0) emoji('☕', x + 34, y - 18, 22);
  if (T.tag && g.type !== 'makcik') emoji(T.tag, x - 36, y - 100, 20);
  if (g.status === 'leave') { if (g.angry) emoji('💢', x + 20, y - 110, 30); else if (g.happyLeave) emoji('💖', x + 20, y - 110, 30); return; }
  if (g.status === 'wait' || g.status === 'ready' || (g.status === 'walk' && g.at?.k === 'seat')) {
    const n = need(g), bx = x + 34, by = y - 112;
    ctx.save(); if (sel) { ctx.translate(bx, by); ctx.scale(1.15, 1.15); ctx.translate(-bx, -by); }
    rr(bx - 30, by - 26, 60, 52, 18); ctx.fillStyle = g.status === 'ready' ? '#e8f8ee' : '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = mood < .3 ? '#e2546f' : '#e6c2d2'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 14, by + 24); ctx.lineTo(bx - 24, by + 38); ctx.lineTo(bx - 2, by + 24); ctx.fillStyle = g.status === 'ready' ? '#e8f8ee' : '#fff'; ctx.fill();
    emoji(g.status === 'ready' ? '⏳' : TYPES[n].icon, bx, by - 3, 28);
    ctx.restore();
    if (g.wish) emoji('⭐', bx + 30, by - 24, 20);
    if (g.resv != null) { const s = slotById(g.resv), k = s ? s.resv.indexOf(g.id) + 1 : 0; if (k) { rr(x - 70, y - 120, 40, 24, 12); ctx.fillStyle = '#7759a8'; ctx.fill(); text('📌' + k, x - 50, y - 107, 14, '#fff', 'center', null); } }
    const hearts = Math.ceil(mood * 5);
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = i < hearts ? 1 : .22; emoji(mood < .3 ? '💔' : '❤️', x - 34 + i * 17, y - 156, 14); }
    ctx.globalAlpha = 1;
  }
}
// kad sebelum/selepas kecil semasa checkout (tak sekat permainan)
function drawReveal() {
  const r = game.reveal; if (!r) return;
  const g = r.g, a = Math.min(1, r.t * 2, (2.6 - r.t) * 4);
  ctx.save(); ctx.globalAlpha = a;
  const x = 14, y = 96, w = 230, h = 128;   // kawasan dinding: tak tutup stesen/perabot
  rr(x, y, w, h, 18); ctx.fillStyle = '#fffaf7f2'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#e56b93'; ctx.stroke();
  text('Sebelum', x + 55, y + 16, 14, '#9a7f8f', 'center', null); text('Selepas ✨', x + 172, y + 16, 14, '#e56b93', 'center', null);
  const before = img('guest_' + g.type + '_sit'), after = guestImg(g, 'after');
  if (before) ctx.drawImage(before, x + 8, y + 24, 96, 96);
  if (after) ctx.drawImage(after, x + 124, y + 24, 96, 96);
  if (g.look.pin) drawPin(x + 182, y + 60);
  text('➜', x + 115, y + 72, 22, '#e56b93');
  if (g.look.hair != null && !img('guest_' + g.type + '_after_c' + (g.look.hair + 1))) text(HAIR_LOOKS[g.look.hair], x + 172, y + 116, 11, '#7759a8');
  ctx.restore();
}

// placeholder chibi (hanya bila sprite tiada langsung)
function chibi(x, y, o) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.moveTo(-30, 30); ctx.quadraticCurveTo(-32, -6, 0, -8); ctx.quadraticCurveTo(32, -6, 30, 30); ctx.closePath();
  ctx.fillStyle = o.outfit; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#6b4a5c'; ctx.stroke();
  if (o.apron) { rr(-18, -2, 36, 32, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); }
  const hc = o.hair;
  if (!o.tudung && o.style >= 0) {
    const st = STYLES[o.style]; ctx.fillStyle = hc; ctx.strokeStyle = '#4b2f3f'; ctx.lineWidth = 3;
    if (st === 'long') { rr(-36, -70, 72, 82, 30); ctx.fill(); ctx.stroke(); }
    if (st === 'pony') ell(32, -40, 14, 28, hc, '#4b2f3f');
    if (st === 'curly') for (let i = 0; i < 9; i++) ell(Math.cos(i / 9 * Math.PI * 2) * 36, -50 + Math.sin(i / 9 * Math.PI * 2) * 30, 16, 16, hc, '#4b2f3f');
  }
  if (o.style === -1) {
    const tc = ['#e6a2b8', '#9ed3c8', '#f2c46d', '#b7a3e3', '#8fb7e6', '#f29a8f'][o.tudung % 6];
    ctx.beginPath(); ctx.moveTo(-40, 10); ctx.quadraticCurveTo(-44, -88, 0, -88); ctx.quadraticCurveTo(44, -88, 40, 10); ctx.quadraticCurveTo(0, 22, -40, 10);
    ctx.fillStyle = tc; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#6b4a5c'; ctx.stroke();
  }
  ell(0, -46, 30, 32, o.skin, '#9e735c', 2.5);
  const m = o.mood;
  ctx.fillStyle = '#4b2f3f'; ctx.strokeStyle = '#4b2f3f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  if (o.closed || m > .85) { for (const ex of [-11, 11]) { ctx.beginPath(); ctx.arc(ex, -44, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
  else { ell(-11, -44, 3.6, 4.8, '#4b2f3f'); ell(11, -44, 3.6, 4.8, '#4b2f3f'); }
  ctx.beginPath();
  if (m >= .6) ctx.arc(0, -34, 7, .15 * Math.PI, .85 * Math.PI); else if (m >= .3) { ctx.moveTo(-5, -30); ctx.lineTo(5, -30); } else ctx.arc(0, -24, 7, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.strokeStyle = '#a24d64'; ctx.stroke();
  if (o.style >= 0) {
    const st = STYLES[o.style]; ctx.fillStyle = hc; ctx.strokeStyle = '#4b2f3f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-32, -44); ctx.quadraticCurveTo(-34, -86, 0, -84); ctx.quadraticCurveTo(34, -86, 32, -44);
    ctx.quadraticCurveTo(st === 'short' ? 20 : 14, -66, 0, -60); ctx.quadraticCurveTo(-18, -68, -32, -44); ctx.fill(); ctx.stroke();
    if (st === 'bob') { rr(-37, -62, 14, 40, 7); ctx.fill(); ctx.stroke(); rr(23, -62, 14, 40, 7); ctx.fill(); ctx.stroke(); }
    if (st === 'bun') ell(0, -92, 17, 15, hc, '#4b2f3f');
  }
  if (o.crown) emoji('👑', 0, -98, 24);
  ctx.restore();
}

function drawStaff(m) {
  const moving = !!m.moving;
  const working = m.cur && m.phase === 'do';
  const kind = m.cur?.k === 'work' ? m.cur.slot.kind : m.cur?.k;
  if (moving) m.dir = dirOf(m.mdx || 0, m.mdy || 0);
  const md = m.dir || 'front';
  const wpose = kind === 'color' ? (img(m.id + '_color') ? 'color' : 'cut') : kind;
  let pose = moving ? md + '_' + (Math.sin(m.walk) > 0 ? 'walk1' : 'walk2') : working ? wpose : m.happy > 0 ? 'happy' : 'front_idle';
  const noPose = working && !img(m.id + '_' + pose);
  if (noPose) pose = 'side_idle';
  const bob = moving ? Math.abs(Math.sin(m.walk)) * 7 : working ? Math.sin(performance.now() / 90) * 2 : 0;
  ell(m.x, m.y + 36, 42, 12, '#00000030');
  const sp = img(m.id + '_' + pose);
  ctx.save(); ctx.translate(m.x, m.y - bob); if (m.face < 0 && (!sp || md === 'side' || working)) ctx.scale(-1, 1);
  if (sp) { ctx.drawImage(sp, -80, -135, 160, 160); if (noPose) emoji(kind === 'cut' ? '✂️' : kind === 'color' ? '🖌️' : kind === 'wash' ? '🧴' : kind === 'pay' ? '🧾' : '☕', 40, -60 + Math.sin(performance.now() / 70) * 6, 30); }
  else {
    chibi(0, 0, { skin: m.id === 'aiman' ? '#d9a07a' : '#f6cdb1', hair: m.hair, style: m.style, outfit: m.outfit, mood: m.happy > 0 ? 1 : .7, apron: true, walking: moving });
    if (working) emoji(kind === 'cut' ? '✂️' : kind === 'color' ? '🖌️' : kind === 'wash' ? '🧴' : kind === 'pay' ? '🧾' : '☕', 34, -10 + Math.sin(performance.now() / 70) * 6, 26);
  }
  ctx.restore();
  text(m.name, m.x, m.y + 56, 16, m.label);
  const q = m.queue.length + (m.cur ? 1 : 0);
  if (q) { ell(m.x + 40, m.y - 110, 16, 16, m.col, '#fff', 3); text(String(q), m.x + 40, m.y - 109, 18, '#fff', 'center', null); }
}
function drawQueueMarkers() {
  for (const m of game.staff) m.queue.forEach((q, i) => {
    const p = q.k === 'coffee' ? { x: COFFEE.x, y: COFFEE.y - 70 } : { x: q.slot.x - 62, y: q.slot.y - 120 };
    ell(p.x, p.y, 15, 15, m.col, '#fff', 3); text(String(i + 1 + (m.cur ? 1 : 0)), p.x, p.y + 1, 16, '#fff', 'center', null);
  });
}
function drawCoffee() {
  const on = upg('coffee') > 0;
  ctx.globalAlpha = on ? 1 : .35;
  ell(COFFEE.x, COFFEE.y + 30, 40, 12, '#00000022');
  const cs = img(upg('coffee') >= 2 ? 'st_coffee_gold' : upg('coffee') === 1 ? 'st_coffee_pro' : 'st_coffee') || img('st_coffee');
  if (cs) ctx.drawImage(cs, COFFEE.x - 60, COFFEE.y - 88, 120, 120); else {
    rr(COFFEE.x - 34, COFFEE.y - 40, 68, 76, 14); ctx.fillStyle = '#8a5434'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#5c3720'; ctx.stroke();
    emoji('☕', COFFEE.x, COFFEE.y - 2, 32); }
  ctx.globalAlpha = 1;
  if (!on) emoji('🔒', COFFEE.x + 28, COFFEE.y - 40, 18);
  if (game.beans > 0) text('✦' + game.beans, COFFEE.x + 36, COFFEE.y - 70, 14, '#8a5434');
  const g = G(selected);
  if (on && g && canMove(g) && !(g.coffee > 0)) { ctx.globalAlpha = .4 + Math.sin(performance.now() / 180) * .2; ell(COFFEE.x, COFFEE.y, 52, 52, null, '#ffe36e', 6); ctx.globalAlpha = 1; }
}
function drawDecor(top) {
  for (const d0 of DECOR) {
    if (!!d0.top !== top || !upg(d0.k)) continue;
    const d = { ...d0, ...lp(LAY(), d0.k, d0) };
    const im = img(d.sp);
    if (im) ctx.drawImage(im, d.x - d.w / 2, d.y, d.w, d.h);
    else { if (!top) ell(d.x, d.y + d.h - 6, d.w * .4, 10, '#00000022'); emoji(d.e, d.x, d.y + d.h / 2, d.h * .6); }
  }
}
const PILLOW = { k_sofa: ['#c6455f', '#f2c46d'], m_sofa: ['#8b91a0', '#d9dce4'], r_sofa: ['#4fb1c4', '#ffffff'], s_sofa: ['#e8c15a', '#b8203a'] };
function drawSofa() {
  const n = game.seats.length, x0 = game.seats[0].x - 50, w = game.seats[n - 1].x - game.seats[0].x + 100;
  const so = img('sofa_' + game.loc.key), mg = img('deco_magazine'), pl = img('deco_plant');
  if (pl) ctx.drawImage(pl, 4, 560, 90, 90);
  if (so) {
    const sw = w + 30, sh = sw * so.height / so.width, by = game.seats[0].y + 55;
    ctx.drawImage(so, x0 - 15, by - sh, sw, sh);
    if (mg) ctx.drawImage(mg, x0 + w + 8, by - 90, 80, 80);
  } else {
    rr(x0, 856, w, 60, 22); ctx.fillStyle = '#c49ad4'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#8e6aa0'; ctx.stroke();
    rr(x0 - 10, 900, w + 20, 40, 18); ctx.fillStyle = '#d5b0e2'; ctx.fill(); ctx.stroke();
  }
  const p = PILLOW[EQ('sofa')];
  if (p) for (let i = 0; i < n; i++) { const sx = game.seats[i].x, sy = game.seats[0].y - 14; ctx.save(); ctx.translate(sx + (i % 2 ? 26 : -26), sy); ctx.rotate(i % 2 ? .25 : -.25); rr(-16, -14, 32, 28, 8); ctx.fillStyle = p[0]; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#4b2f3f'; ctx.stroke(); ctx.fillStyle = p[1]; ctx.fillRect(-16, -2, 32, 4); ctx.restore(); }
}

function draw() {
  if (!game) return;
  ctx.clearRect(0, 0, W, H);
  drawRoom(game.loc);
  drawRug();
  drawSofa();
  drawDecor(true);
  drawDecor(false);
  drawCoffee();
  game.slots.forEach(s => { if (s.kind === 'pay') drawReception(s); });
  const items = [];
  game.slots.forEach(s => items.push({ y: s.y - 1, f: () => drawStation(s) }));
  game.guests.forEach(g => items.push({ y: g.y, f: () => drawGuest(g) }));
  game.staff.forEach(m => items.push({ y: m.y, f: () => drawStaff(m) }));
  items.sort((a, b) => a.y - b.y).forEach(i => i.f());
  drawQueueMarkers();
  if (mode === 'edit') { drawEditOverlay(); return; }
  if (game.combo >= 2) { rr(W - 170, 268, 150, 40, 20); ctx.fillStyle = '#e56b93'; ctx.fill(); text('🔥 COMBO x' + game.combo, W - 95, 289, 20, '#fff', 'center', null); }
  drawReveal();
  for (const f of game.fx) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    if (f.coin) emoji('🪙', f.x, f.y, 22); else text(f.text, f.x, f.y, f.size, f.color);
  }
  ctx.globalAlpha = 1;
  if (drag && drag.moved) { const g = G(drag.id); const im = g && guestImg(g, 'sit'); if (im) { ctx.globalAlpha = .7; ctx.drawImage(im, drag.x - 60, drag.y - 100, 120, 120); ctx.globalAlpha = 1; } }
  const sg = G(selected);
  const anyQ = game.slots.some(s => s.qte && s.qte.res == null && s.state === 'working');
  $('gameHint').textContent = anyQ ? '✂ Tap stesen bila jarum dalam zon HIJAU untuk PERFECT!'
    : sg && canMove(sg) ? sg.name + ' → tap ' + TYPES[need(sg)].icon + ' ' + TYPES[need(sg)].name + ' (kalau berpenghuni = 📌 tempah)' + (sg.resv ? ' · tap stesen sama untuk batal tempahan' : '') + (upg('coffee') ? ' · ☕ kopi' : '') + (sg.wish ? ' · ⭐ ' + (sg.wish === 'perfect' ? 'nak PERFECT' : 'nak cepat & happy') : '')
    : 'Tap pelanggan → tap stesen. Stesen penuh? Tempah giliran 📌!';
}

// ---------- input ----------
let drag = null;
function pos(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
function guestAt(p) {
  let best = null, bd = 1e9;
  for (const g of game.guests) { if (g.status === 'leave') continue; const d = Math.hypot(p.x - g.x, (p.y - (g.y - 40)) * .8); if (d < 62 && d < bd) { bd = d; best = g; } }
  return best;
}
function slotAt(p) { return game.slots.find(s => p.x > s.x - 90 * s.sc && p.x < s.x + 90 * s.sc && p.y > s.y - 150 * s.sc && p.y < s.y + 90 * s.sc); }
const coffeeAt = p => Math.hypot(p.x - COFFEE.x, p.y - COFFEE.y) < 55;
function qtePos(q) { const x = (q.t * q.sp) % 2; return x < 1 ? x : 2 - x; }
function resolveQTE(s) {
  const q = s.qte, g = G(s.guestId); if (!q || q.res != null || !g) return false;
  const d = Math.abs(qtePos(q) - q.c), z = q.z || 1;
  if (d <= .08 * z) { q.res = 'perfect'; s.t += (s.dur - s.t) * .5; g.tip += 10; g.perfect = true; game.cnt.perfect++; fx('PERFECT! ✨', s.x, s.y - 175, '#e56b93', 30); sound('perfect'); stat('perfect', 1); hud(); }
  else if (d <= .17 * z) { q.res = 'good'; g.tip += 4; s.t += (s.dur - s.t) * .2; fx('Bagus!', s.x, s.y - 175, '#4f9d8c', 24); sound('tap'); }
  else { q.res = 'miss'; fx('Alamak…', s.x, s.y - 175, '#9a7f8f', 20); sound('bad'); }
  return true;
}
function drawQTE(s) {
  const q = s.qte; if (!q || s.state !== 'working' || q.res != null) return;
  const w = 130, x0 = s.x - w / 2, y0 = s.y > 500 ? s.y - 128 : s.y - 172, z = q.z || 1;
  rr(x0 - 6, y0 - 6, w + 12, 26, 13); ctx.fillStyle = '#fffffff2'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#e56b93'; ctx.stroke();
  rr(x0, y0, w, 14, 7); ctx.fillStyle = '#f3dde6'; ctx.fill();
  rr(x0 + (q.c - .17 * z) * w, y0, .34 * z * w, 14, 7); ctx.fillStyle = '#bfe8c9'; ctx.fill();
  rr(x0 + (q.c - .08 * z) * w, y0, .16 * z * w, 14, 7); ctx.fillStyle = '#5fc48f'; ctx.fill();
  const px = x0 + qtePos(q) * w;
  ctx.fillStyle = '#6a4877'; ctx.beginPath(); ctx.moveTo(px - 8, y0 - 10); ctx.lineTo(px + 8, y0 - 10); ctx.lineTo(px, y0 + 4); ctx.fill();
  text('TAP!', s.x, y0 - 22, 18, '#e56b93');
}
function tapAt(p) {
  const g = guestAt(p), s = slotAt(p), sg = G(selected);
  { const qs = s && s.qte && s.qte.res == null && s.state === 'working' ? s : g && g.at?.k === 'slot' && g.at.o.qte && g.at.o.qte.res == null && g.at.o.state === 'working' ? g.at.o : null; if (qs && resolveQTE(qs)) return; }
  if (sg && canMove(sg) && s && s.guestId !== sg.id && (!g || g === G(s.guestId))) { place(sg, s); return; }
  if (sg && canMove(sg) && coffeeAt(p)) { giveCoffee(sg); return; }
  if (g) {
    if (g.status === 'ready' && g.at?.k === 'slot' && !g.at.o.queued) { enqueue({ k: 'work', slot: g.at.o }); sound('tap'); return; }
    if (canMove(g)) { selected = selected === g.id ? null : g.id; sound('tap'); return; }
    return;
  }
  if (s) {
    if (s.guestId == null) {
      const c = game.guests.filter(x => canMove(x) && need(x) === s.kind).sort((a, b) => a.patience / a.max - b.patience / b.max)[0];
      if (c) assign(c, s); else toast('Tiada pelanggan perlukan ' + TYPES[s.kind].name);
    } else { const sgg = G(s.guestId); if (sgg && sgg.status === 'ready' && !s.queued) { enqueue({ k: 'work', slot: s }); sound('tap'); } else toast('Pilih pelanggan dulu untuk 📌 tempah stesen ni'); }
    return;
  }
  selected = null;
}

// ===== Mod Susun Kedai =====
let edrag = null, esel = null;
function startEdit() {
  mode = 'edit'; selected = null; editLayout = JSON.parse(JSON.stringify(state.layout || {}));
  const n = Math.max(5, state.level);
  game = { level: n, loc: locOf(state.level), guests: [], fx: [], staff: [], combo: 0, slots: [], seats: [] };
  rebuildEdit();
  $('homeView').hidden = true; $('gameView').hidden = false; $('gameView').classList.add('editing');
  document.querySelectorAll('.sheet').forEach(x => x.hidden = true);
  resize(); window.scrollTo(0, 0); editHint();
}
function rebuildEdit() {
  game.slots = buildSlots(game.level, editLayout); game.seats = buildSeats(editLayout); Object.assign(COFFEE, lp(editLayout, 'coffee', COFFEE_DEF));
  game.nav = navGrid({ lay: editLayout, slots: game.slots, seats: game.seats, coffee: COFFEE });
  game.bad = validateWorld({ lay: editLayout, slots: game.slots, seats: game.seats, coffee: COFFEE, nav: game.nav });
}
function avgRoute() {
  const pts = game.slots.filter(s => s.kind !== 'style').map(staffPointOf); if (upg('coffee')) pts.push({ x: COFFEE.x - 50, y: COFFEE.y + 20 });
  let L = 0, c = 0; for (const p of pts) { const r = astar(game.nav, 420, 640, p.x, p.y, true); if (r) { L += pathLen({ x: 420, y: 640 }, r); c++; } }
  return c ? Math.round(L / c / CS) : 0;
}
function editHint() { $('gameHint').textContent = (game.bad.length ? '⚠️ Laluan tersekat / bertindih — tak boleh simpan. ' : '✅ Semua tempat boleh dicapai. ') + 'Laluan purata staf: ' + avgRoute() + ' langkah (lebih pendek = lebih laju).'; }
function editItems() {
  const it = game.slots.map(s => ({ id: s.id, x: s.x, y: s.y, sc: s.sc, hit: [90 * s.sc, 150 * s.sc, 90 * s.sc], ry: [330, 810] }));
  it.push({ id: 'coffee', x: COFFEE.x, y: COFFEE.y, hit: [60, 90, 40], ry: [330, 860] });
  const n = game.seats.length, sx = game.seats[0].x, sy = game.seats[0].y, hw = ((n - 1) * 92 + 130) / 2;
  it.push({ id: 'sofa', x: sx, y: sy, cx: sx + (n - 1) * 46, hit: [hw, 70, 60], ry: [700, 885], sofa: true });
  for (const d0 of DECOR) if (upg(d0.k)) { const d = { ...d0, ...lp(editLayout, d0.k, d0) }; it.push({ id: d0.k, x: d.x, y: d.y, hit: [d.w / 2, 0, d.h], ry: d0.top ? [-10, 150] : [300, 860], top: !!d0.top, deco: true }); }
  return it;
}
function hitOf(o) { const cx = o.sofa ? o.cx : o.x; return o.deco ? { x1: cx - o.hit[0], x2: cx + o.hit[0], y1: o.y, y2: o.y + o.hit[2] } : { x1: cx - o.hit[0], x2: cx + o.hit[0], y1: o.y - o.hit[1], y2: o.y + o.hit[2] }; }
function drawEditOverlay() {
  // tapak pepejal (kelabu), titik tersekat (merah)
  ctx.save();
  for (const s of solidsFor({ lay: editLayout, slots: game.slots, seats: game.seats, coffee: COFFEE })) { const b = game.bad.includes(s.id); ctx.fillStyle = b ? '#e5484d55' : '#4b2f3f22'; ctx.fillRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1); ctx.strokeStyle = b ? '#e5484d' : '#4b2f3f55'; ctx.lineWidth = 2; ctx.strokeRect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1); }
  ctx.fillStyle = '#5fc48f33'; ctx.fillRect(0, 850, 70, 110); text('PINTU', 34, 940, 13, '#2f7a52');
  if (edrag) { const it = editItems().find(o => o.id === edrag.id); if (it) { ctx.setLineDash([4, 6]); ctx.strokeStyle = '#7759a8'; ctx.lineWidth = 2; ctx.strokeRect(40, it.ry[0], 640, it.ry[1] - it.ry[0]); ctx.setLineDash([]); } }
  for (const o of editItems()) {
    const r = hitOf(o), act = (edrag && edrag.id === o.id) || esel === o.id;
    ctx.setLineDash([8, 6]); ctx.lineWidth = act ? 4 : 2;
    ctx.strokeStyle = act ? (game.bad.includes(o.id) ? '#e5484d' : '#5fc48f') : '#ffffffcc';
    rr(r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1, 14); ctx.stroke(); ctx.setLineDash([]);
  }
  // pratonton laluan untuk barang dipilih
  const sel = esel && (game.slots.find(s => s.id === esel) || (esel === 'coffee' ? { coffee: true } : null));
  if (sel) {
    const tgt = sel.coffee ? { x: COFFEE.x - 50, y: COFFEE.y + 20 } : staffPointOf(sel);
    const paths = [[{ x: 420, y: 640 }, '#7759a8', 'Mira'], [{ x: 20, y: 900 }, '#e56b93', 'Pintu']];
    for (const [a, col, nm] of paths) {
      const r = astar(game.nav, a.x, a.y, tgt.x, tgt.y, true);
      ctx.strokeStyle = r ? col : '#e5484d'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(a.x, a.y);
      (r || [tgt]).forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke(); ctx.setLineDash([]);
      text(nm + ': ' + (r ? Math.round(pathLen(a, r) / CS) + ' langkah' : 'TERSEKAT'), (a.x + tgt.x) / 2, (a.y + tgt.y) / 2 - 10, 15, r ? col : '#e5484d');
    }
  }
  ctx.restore();
}
function editDown(p) {
  const o = editItems().reverse().find(o => { const r = hitOf(o); return p.x > r.x1 && p.x < r.x2 && p.y > r.y1 && p.y < r.y2; });
  if (!o) { esel = null; return; }
  esel = o.id;
  edrag = { id: o.id, ox: o.x, oy: o.y, sx: p.x, sy: p.y, ry: o.ry, orig: editLayout[o.id] ? editLayout[o.id].slice() : null };
}
function editMove(p) {
  if (!edrag) return;
  const snap = v => Math.round(v / 5) * 5;
  const x = Math.max(40, Math.min(680, snap(edrag.ox + p.x - edrag.sx))), y = Math.max(edrag.ry[0], Math.min(edrag.ry[1], snap(edrag.oy + p.y - edrag.sy)));
  editLayout[edrag.id] = [x, y]; rebuildEdit();
}
function editUp() {
  if (!edrag) return;
  sound(game.bad.includes(edrag.id) ? 'bad' : 'tap');
  edrag = null; editHint();
}
function exitEdit() { $('gameView').classList.remove('editing'); editLayout = null; esel = null; Object.assign(COFFEE, lp(state.layout, 'coffee', COFFEE_DEF)); home(); window.scrollTo(0, 0); }
$('editBar').addEventListener('click', e => {
  const b = e.target.closest('[data-edit]'); if (!b || mode !== 'edit') return;
  const a = b.dataset.edit;
  if (a === 'reset') { editLayout = {}; esel = null; rebuildEdit(); editHint(); toast('Susun atur asal (belum disimpan)'); return; }
  if (a === 'save') {
    if (game.bad.length) { toast('Tak boleh simpan: pintu, kaunter atau stesen tersekat / bertindih!'); sound('bad'); return; }
    state.layout = editLayout; save(); toast('Susun atur disimpan! ✨'); sound('win');
  }
  exitEdit();
});

cv.addEventListener('pointerdown', e => {
  if (mode === 'edit') { editDown(pos(e)); cv.setPointerCapture?.(e.pointerId); return; }
  if (mode !== 'play') return; ac();
  const p = pos(e), g = guestAt(p);
  drag = { id: g && canMove(g) ? g.id : null, sx: p.x, sy: p.y, x: p.x, y: p.y, moved: false, pid: e.pointerId };
  cv.setPointerCapture?.(e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (mode === 'edit') { editMove(pos(e)); return; }
  if (!drag || e.pointerId !== drag.pid) return;
  const p = pos(e); drag.x = p.x; drag.y = p.y;
  if (drag.id != null && !drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) > 18) { drag.moved = true; selected = drag.id; }
});
cv.addEventListener('pointerup', e => {
  if (mode === 'edit') { editUp(); return; }
  if (!drag || e.pointerId !== drag.pid) return;
  const p = pos(e), d = drag; drag = null;
  if (mode !== 'play') return;
  if (d.moved) { const g = G(d.id), s = slotAt(p); if (g && s) place(g, s); else if (g && coffeeAt(p)) giveCoffee(g); }
  else tapAt(p);
});
cv.addEventListener('pointercancel', () => { drag = null; if (mode === 'edit') edrag = null; });

// =====================================================================
// HOME + menu sheets
// =====================================================================
let shopTab = 'up', mapTab = 'levels';
function home() {
  const ml = $('menuLogo'); if (ml) ml.hidden = !SPRITE_LIST.has('logo');
  mode = 'home'; game = null; selected = null;
  state.sel = Math.min(state.level, Math.max(1, state.sel || state.level));
  $('shopCoins').textContent = state.coins;
  $('shopBadge').textContent = UP.filter(u => state.level >= u.unlock && upg(u.key) < u.max && state.coins >= priceOf(u)).length || '';
  $('homeView').hidden = false; $('gameView').hidden = true; $('overlay').hidden = true;
  $('walletStat').textContent = state.coins;
  $('starsStat').textContent = Object.values(state.stars).reduce((a, b) => a + (Number(b) || 0), 0);
  $('levelStat').textContent = state.level + ' / ' + LIMIT;
  const n = state.sel, cfg = levelCfg({ kind: 'campaign', n }), L = cfg.loc, O = OBJ[cfg.obj];
  $('missionEyebrow').textContent = L.icon + ' ' + L.name.toUpperCase() + (cfg.ev ? ' · ' + EVENTS[cfg.ev].icon + ' ' + EVENTS[cfg.ev].name.toUpperCase() : '');
  $('missionTitle').textContent = 'Level ' + n + (state.stars[n] ? ' · ' + '⭐'.repeat(state.stars[n]) : '');
  $('missionDesc').textContent = O.icon + ' ' + O.t(cfg.target) + '.' + (GUESTS.remaja.from === n ? ' Pelanggan baru: Remaja ⚡!' : GUESTS.vip.from === n ? ' Pelanggan baru: VIP 👑!' : GUESTS.seleb.from === n ? ' Pelanggan baru: Influencer 📸!' : n === 3 ? ' Station baru: Hair Dryer 💨!' : n === 5 ? ' Station baru: Warna 🎨!' : '');
  artProgress();
  $('soundBtn').textContent = state.muted ? '🔇' : '🔊';
  $('musicBtn').textContent = state.music ? '🎵' : '🔕';
  renderMap(); renderShop(); renderGoals(); renderStaff();
  [['sheetShop', 'dock_shop'], ['sheetGoals', 'dock_missions'], ['sheetMap', 'dock_map'], ['sheetHow', 'dock_help']].forEach(([k, nm]) => { const b = document.querySelector(`[data-sheet=${k}] .dock-ic`); if (b && SPRITE_LIST.has(nm) && !b.querySelector('img')) b.innerHTML = `<img src="sprites/${nm}.webp" alt="">`; });
  $('versionNote').textContent = 'Versi ' + SALON_VERSION + ' · ' + SALON_DATE + ' · Progress disimpan dalam device ni sahaja (bukan cloud).';
  if (state.notice) { toast(state.notice); state.notice = ''; save(); }
}
const tabs = (id, cur, list) => `<div class="tabs">${list.map(([k, t]) => `<button class="tab ${k === cur ? 'on' : ''}" data-tab="${k}" data-tabset="${id}">${t}</button>`).join('')}</div>`;

// ---- PETA: level / kontrak / master
function renderMap() {
  const T = [['levels', '🗺️ Level'], ['contracts', '📜 Kontrak'], ['master', '👑 Master']];
  let h = tabs('map', mapTab, T);
  if (mapTab === 'levels') {
    const n = state.sel, cfg = levelCfg({ kind: 'campaign', n }), O = OBJ[cfg.obj], ev = cfg.ev && EVENTS[cfg.ev];
    h += `<div class="lvl-detail"><b>Level ${n} · ${cfg.loc.icon} ${cfg.loc.name}</b><small>${'⭐'.repeat(state.stars[n] || 0) || 'Belum ada bintang'} · ${cleared(n) ? 'Ulang: ganjaran ' + Math.round(BAL.repeatKeep * 100) + '% kutipan + bonus bintang baru' : 'First clear: bonus 🪙' + BAL.firstClearBonus(n)}</small>
      <p>${O.icon} ${O.t(cfg.target)}${ev ? '<br>' + ev.icon + ' <b>' + ev.name + '</b>: ' + ev.desc : ''}<br><i>${cfg.loc.blurb}</i></p><button class="buy-btn" data-play="${n}">▶ MAIN LEVEL ${n}</button></div>`;
    h += LOCS.map(l => {
      const open = state.level >= l.from;
      const st = Array.from({ length: 15 }, (_, i) => state.stars[l.from + i] || 0).reduce((a, b) => a + b, 0);
      const pic = SPRITE_LIST.has('loc_' + l.key) ? 'sprites/loc_' + l.key + '.webp' : SPRITE_LIST.has('bg_' + l.key) ? 'sprites/bg_' + l.key + '.webp' : '';
      const card = `<div class="loc-card ${open ? '' : 'locked'} ${locOf(state.sel) === l ? 'current' : ''}" style="background-color:${l.wall};${pic ? `background-image:url(${pic});${SPRITE_LIST.has('loc_' + l.key) ? 'background-size:auto 112%;background-position:right -10px center;background-repeat:no-repeat' : ''}` : ''}"><div class="loc-info"><b>${l.icon} ${l.name}</b><small>${open ? '⭐ ' + st + ' / 45 · Level ' + l.from + '–' + (l.from + 14) : 'Buka di Level ' + l.from}</small></div></div>`;
      const grid = open ? `<div class="lvl-grid">${Array.from({ length: 15 }, (_, i) => { const k = l.from + i, ok = k <= state.level, s = state.stars[k] || 0, e = EVENT_AT[k]; return `<button class="lvl ${k === state.sel ? 'on' : ''} ${ok ? '' : 'locked'}" data-lvl="${k}" ${ok ? '' : 'disabled'}><b>${k}</b><small>${ok ? (s ? '★'.repeat(s) : '·') : '🔒'}</small>${e ? `<i>${EVENTS[e].icon}</i>` : ''}</button>`; }).join('')}</div>` : '';
      return card + grid;
    }).join('');
  } else if (mapTab === 'contracts') {
    if (!contractsOpen()) h += `<p class="sheet-note">🔒 Kontrak dibuka selepas lulus Level ${CTIERS[0].need - 1}. Main kempen tetap percuma.</p>`;
    else {
      h += `<p class="sheet-note">Kontrak pilihan, guna gameplay salon biasa. <b>Yuran dibayar sekali bila tekan MULA.</b> Berjaya = bayaran kontrak + ${Math.round(BAL.contractKeepWin * 100)}% kutipan. Gagal = yuran hangus, simpan ${Math.round(BAL.contractKeepFail * 100)}% kutipan. "Ulang Level" dari pause tak caj lagi. Keluar/tutup app semasa kontrak = gagal.</p>`;
      h += CONTRACTS.map(c => `<div class="contract"><b>${c.icon} ${c.name}</b><small>${LOCS.find(l => l.key === c.loc).name} · ${OBJ[c.obj].icon} ${OBJ[c.obj].hud}${c.event ? ' · ' + EVENTS[c.event].name : ''}</small><div class="ctiers">${CTIERS.map((t, i) => { const ok = state.level >= t.need; return `<button class="buy-btn" data-contract="${c.id}" data-tier="${i}" ${ok ? '' : 'disabled'}>${ok ? t.name + '<br>🪙' + t.fee + ' → 🪙' + t.pay : '🔒 Lv ' + t.need}</button>`; }).join('')}</div></div>`).join('');
    }
  } else {
    if (!masterOpen()) h += `<p class="sheet-note">🔒 Salon Master dibuka selepas lulus Level ${LIMIT}. Sesi terhad, objektif bergilir, kesukaran dihadkan (tiada pecutan tanpa had). Tiada reset upgrade.</p>`;
    else {
      const M = state.master;
      h += `<p class="sheet-note">Pilih satu daripada 3 sesi pusingan #${M.round + 1}. Percuma masuk. Berjaya = semua kutipan + bonus 🪙${BAL.masterBonus[1]}–${BAL.masterBonus[3]} ikut bintang. Main ${M.played} · Menang ${M.wins}.</p>`;
      h += masterOptions(M.round).map((o, i) => { const c = levelCfg({ kind: 'master', round: M.round, opt: i }); return `<div class="contract"><b>${o.name}</b><small>${OBJ[o.obj].icon} ${OBJ[o.obj].t(c.target)}</small><button class="buy-btn" data-master="${i}">▶ MAIN</button></div>`; }).join('');
    }
  }
  $('locationRow').innerHTML = h;
}
$('locationRow').addEventListener('click', e => {
  const t = e.target.closest('[data-tab]'); if (t) { mapTab = t.dataset.tab; renderMap(); sound('tap'); return; }
  const l = e.target.closest('[data-lvl]'); if (l && !l.disabled) { state.sel = +l.dataset.lvl; save(); home(); $('sheetMap').hidden = false; sound('tap'); return; }
  const p = e.target.closest('[data-play]'); if (p) { showBrief({ kind: 'campaign', n: +p.dataset.play }); return; }
  const c = e.target.closest('[data-contract]'); if (c && !c.disabled) { showBrief({ kind: 'contract', id: c.dataset.contract, tier: +c.dataset.tier }); return; }
  const m = e.target.closest('[data-master]'); if (m) showBrief({ kind: 'master', round: state.master.round, opt: +m.dataset.master });
});

// ---- taklimat sebelum mula (objektif + bekalan + syarat kontrak)
let pendingSpec = null;
function showBrief(spec) {
  if (!ART_READY) return;
  pendingSpec = spec;
  const cfg = levelCfg(spec), O = OBJ[cfg.obj], ev = cfg.ev && EVENTS[cfg.ev];
  let h = `<b>${O.icon} ${esc(O.t(cfg.target))}</b><br><small>${esc(O.rule)}<br>${cfg.obj === 'noangry' ? STAR_RULE_NA : STAR_RULE}</small>`;
  if (ev) h += `<br><br>${ev.icon} <b>${esc(ev.name)}</b> — ${esc(ev.desc)}`;
  h += `<br><small>${cfg.loc.icon} ${esc(cfg.loc.blurb)} · ${cfg.total} pelanggan</small>`;
  if (spec.kind === 'contract') { const T = CTIERS[spec.tier]; h += `<div class="brief-box">📜 Yuran: <b>🪙${T.fee}</b> (dibayar sekali sekarang) · Bayaran jika berjaya: <b>🪙${T.pay}</b><br><small>Gagal: yuran hangus, simpan ${Math.round(BAL.contractKeepFail * 100)}% kutipan. Keluar / tutup app = gagal.</small></div>`; }
  if (spec.kind === 'campaign' && cleared(spec.n)) h += `<div class="brief-box">🔁 Ulang level: ${Math.round(BAL.repeatKeep * 100)}% kutipan + 🪙${BAL.newStarBonus} setiap bintang baru. Progress tak akan turun.</div>`;
  const sup = Object.entries(SUP).filter(([k, s]) => s.need() && state.sup[k] > 0);
  if (sup.length) h += `<div class="brief-box"><b>🧺 Bekalan (pilihan)</b> — digunakan bila level mula.<br>${sup.map(([k, s]) => `<label class="sup-tog"><input type="checkbox" data-sup="${k}" ${state.supUse[k] ? 'checked' : ''}> ${s.icon} ${esc(s.name)} (ada ${state.sup[k]})</label>`).join('')}</div>`;
  const title = spec.kind === 'campaign' ? 'Level ' + spec.n : cfg.title;
  modal(ev ? ev.icon : O.icon, title, '', [[spec.kind === 'contract' ? '▶ BAYAR & MULA' : '▶ MULA', 'start'], ['Batal', 'cancel']], h);
  sound('tap');
}
$('modalText').addEventListener('change', e => { const c = e.target.closest('[data-sup]'); if (c) { state.supUse[c.dataset.sup] = c.checked; save(); } });
function startPending() {
  const spec = pendingSpec; pendingSpec = null; if (!spec) return;
  if (spec.kind === 'campaign' && spec.n > state.level) return;
  if (spec.kind === 'contract') {
    const T = CTIERS[spec.tier]; if (!contractsOpen() || state.level < T.need) return;
    if (state.coins < T.fee) { toast('Coins tak cukup untuk yuran 🪙' + T.fee); sound('bad'); $('overlay').hidden = true; return; }
    state.coins -= T.fee; state.contract = { id: spec.id, tier: spec.tier, att: attSeq + 1, status: 'active' }; save();
    begin(spec); state.contract.att = game.att.id; save(); return;
  }
  if (spec.kind === 'master' && (!masterOpen() || spec.round !== state.master.round)) return;
  if (spec.kind === 'campaign') { state.sel = spec.n; save(); }
  begin(spec);
}
function forfeitIfContract() {
  if (game && game.kind === 'contract' && (mode === 'pause' || mode === 'play') && state.contract && state.contract.status === 'active') { state.contract.status = 'failed'; save(); toast('Kontrak ditinggalkan — yuran hangus.'); }
}

// ---- KEDAI: upgrade / koleksi / renovasi / bekalan
function renderShop() {
  let h = tabs('shop', shopTab, [['up', '🧰 Upgrade'], ['col', '🎨 Koleksi'], ['reno', '🏗️ Renovasi'], ['sup', '🧺 Bekalan']]);
  if (shopTab === 'up') h += CATS.map(([c, title]) => `<h3 class="cat-head">${title}</h3>` + UP.filter(u => u.cat === c).map(u => {
    const lv = upg(u.key), price = priceOf(u), locked = state.level < u.unlock, maxed = lv >= u.max, dis = locked || maxed || state.coins < price;
    const pips = Array.from({ length: u.max }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('');
    const lvTxt = u.tier ? `<span class="tier t${lv}">${TIER[lv]}</span>` : `LEVEL<span class="pips">${pips}</span>`;
    const btn = locked ? '🔒 Level ' + u.unlock : maxed ? 'MAX ✓' : (u.tier ? '⬆ ' + TIER[lv + 1] + ' · ' : '') + '🪙 ' + price;
    return `<article class="upgrade"><div class="upgrade-icon">${u.icon}</div><h3>${u.name}</h3><p>${u.info}</p><div class="upgrade-level">${lvTxt}</div><button class="buy-btn" data-upgrade="${u.key}" ${dis ? 'disabled' : ''}>${btn}</button></article>`;
  }).join('')).join('');
  if (shopTab === 'col') {
    h += `<p class="sheet-note">Kosmetik sahaja — tukar percuma antara barang yang dah dibeli. Siapkan satu koleksi = tip +${BAL.colTip * 100}% kekal (jumlah bonus kosmetik max ${BAL.cosmeticCap * 100}%). Peralatan berfungsi ada dalam tab Upgrade.</p>`;
    h += COLL.map(c => {
      const own = c.items.filter(i => state.decor.own[i[0]]).length, locked = state.level < c.unlock;
      return `<h3 class="cat-head">${c.icon} ${c.name} <small>${own}/${c.items.length}${own === c.items.length ? ' · ✅ tip +2%' : ''}</small></h3>` + (locked ? `<p class="sheet-note">🔒 Buka di Level ${c.unlock}</p>` : c.items.map(([id, slot, name, price]) => {
        const has = state.decor.own[id], on = state.decor.eq[slot] === id;
        const btn = !has ? `<button class="buy-btn" data-buy="${id}" ${state.coins < price ? 'disabled' : ''}>🪙 ${price}</button>` : `<button class="buy-btn ${on ? 'eq' : ''}" data-equip="${id}">${on ? '✓ Dipakai (tanggal)' : 'Pakai'}</button>`;
        return `<article class="upgrade"><div class="upgrade-icon">${c.icon}</div><h3>${name}</h3><p>${SLOTNAME[slot]}</p>${btn}</article>`;
      }).join(''));
    }).join('');
  }
  if (shopTab === 'reno') {
    h += `<p class="sheet-note">Projek besar jangka panjang. Sumbang ansuran bila-bila masa — progress disimpan. Sumbangan tak boleh ditarik balik.</p>`;
    h += RENO.map(r => {
      const got = state.reno[r.key] || 0, done = got >= r.cost, left = r.cost - got;
      const step = (f, lbl) => { const v = Math.min(left, Math.ceil(r.cost * f)); return `<button class="buy-btn" data-reno="${r.key}" data-amt="${v}" ${done || state.coins < v ? 'disabled' : ''}>${lbl} 🪙${v}</button>`; };
      return `<div class="contract"><b>${r.icon} ${r.name} ${done ? '✅' : ''}</b><small>${r.info} ${r.bonus}</small><div class="goal-bar"><i style="width:${got / r.cost * 100}%"></i></div><small>🪙 ${got} / ${r.cost}</small>${done ? '' : `<div class="ctiers">${step(.05, '+5%')}${step(.2, '+20%')}${step(1, 'Siapkan')}</div>`}</div>`;
    }).join('');
  }
  if (shopTab === 'sup') {
    h += `<p class="sheet-note">Pilihan sahaja, tak perlu untuk lulus level. Stok max ${BAL.supCap} setiap satu. Pilih "guna" dalam taklimat sebelum level; 1 unit habis bila level MULA (ulang dari pause tak guna unit baru). Tutup app semasa level = unit tu hangus.</p>`;
    h += Object.entries(SUP).map(([k, s]) => { const ok = s.need(), full = state.sup[k] >= BAL.supCap; return `<article class="upgrade"><div class="upgrade-icon">${s.icon}</div><h3>${s.name}</h3><p>${s.info}</p><div class="upgrade-level">STOK ${state.sup[k]} / ${BAL.supCap}</div><button class="buy-btn" data-sup-buy="${k}" ${!ok || full || state.coins < s.price ? 'disabled' : ''}>${!ok ? '🔒 ' + s.needTxt : full ? 'PENUH' : '🪙 ' + s.price}</button></article>`; }).join('');
  }
  $('upgradeGrid').innerHTML = h;
}
let buyLock = 0;
$('upgradeGrid').addEventListener('click', e => {
  if (mode !== 'home') return;
  const t = e.target.closest('[data-tab]'); if (t) { shopTab = t.dataset.tab; renderShop(); sound('tap'); return; }
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  const now = performance.now(); if (now - buyLock < 250) return; buyLock = now;  // elak tekan dua kali
  const done = msg => { save(); home(); $('sheetShop').hidden = false; sound('coin'); toast(msg); };
  if (b.dataset.upgrade) {
    const u = UP.find(x => x.key === b.dataset.upgrade); if (!u || state.level < u.unlock) return;
    const lv = upg(u.key), price = priceOf(u); if (lv >= u.max || state.coins < price) return;
    state.coins -= price; state.upgrades[u.key]++; done('Upgrade: ' + u.name + '!');
  } else if (b.dataset.buy) {
    const it = ITEM[b.dataset.buy], c = COLL.find(x => x.key === it.coll); if (!it || state.decor.own[it.id] || state.coins < it.price || state.level < c.unlock) return;
    const was = colDone(c);
    state.coins -= it.price; state.decor.own[it.id] = 1; state.decor.eq[it.slot] = it.id;
    done(it.name + ' dibeli & dipakai!' + (!was && colDone(c) ? ' 🎉 Koleksi lengkap: tip +2%!' : ''));
  } else if (b.dataset.equip) {
    const it = ITEM[b.dataset.equip]; if (!it || !state.decor.own[it.id]) return;
    if (state.decor.eq[it.slot] === it.id) delete state.decor.eq[it.slot]; else state.decor.eq[it.slot] = it.id;
    save(); home(); $('sheetShop').hidden = false; sound('tap');
  } else if (b.dataset.reno) {
    const r = RENO.find(x => x.key === b.dataset.reno), amt = Math.floor(+b.dataset.amt), left = r.cost - (state.reno[r.key] || 0);
    if (!r || amt <= 0 || amt > left || state.coins < amt) return;
    state.coins -= amt; state.reno[r.key] = (state.reno[r.key] || 0) + amt;
    done(state.reno[r.key] >= r.cost ? '🏗️ ' + r.name + ' SIAP!' : 'Sumbangan 🪙' + amt + ' ke ' + r.name);
  } else if (b.dataset.supBuy) {
    const k = b.dataset.supBuy, s = SUP[k]; if (!s || !s.need() || state.sup[k] >= BAL.supCap || state.coins < s.price) return;
    state.coins -= s.price; state.sup[k]++; done(s.name + ' +1 (stok ' + state.sup[k] + ')');
  }
});

// ---- STAF: tugas + latihan
function renderStaff() {
  const pics = { mira: 'mira_front_idle', aiman: 'aiman_front_idle', lina: 'lina_front_idle' };
  $('staffList').innerHTML = ['mira', 'aiman', 'lina'].map(id => {
    const hired = hiredStaff().includes(id), r = roleOf(id), S = STAFF[id];
    const pic = SPRITE_LIST.has(pics[id]) ? `<img src="sprites/${pics[id]}.webp" alt="">` : '🙂';
    const jobs = JOBS.filter(j => state.level >= j[3] && (j[0] !== 'coffee' || upg('coffee'))).map(j => `<button class="job ${r.includes(j[0]) ? 'on' : ''}" data-staff="${id}" data-job="${j[0]}" ${hired ? '' : 'disabled'}>${j[1]} ${j[2]}</button>`).join('');
    const train = TRAIN[id].map(([k, nm, info, val]) => {
      const lv = TR(id, k), max = lv >= 3, price = BAL.trainPrice[lv];
      return `<div class="train-row"><div><b>${nm}</b><small>${lv ? 'Sekarang: ' + val(lv) : 'Belum dilatih'}${max ? ' · MAX' : ' · Seterusnya: ' + val(lv + 1)}</small><span class="pips">${[0, 1, 2].map(i => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</span></div><button class="claim-btn" data-train="${id}" data-tk="${k}" ${!hired || max || state.coins < price ? 'disabled' : ''}>${max ? 'MAX' : '🪙 ' + price}</button></div>`;
    }).join('');
    return `<div class="staff-row ${hired ? '' : 'locked'}"><div class="staff-pic">${pic}</div><div class="staff-info"><b>${S.name}</b><small>${S.spec}</small><small>${hired ? 'Tap kerja untuk hidup/matikan' : '🔒 Upah dulu dalam Kedai'}</small><div class="jobs">${jobs}</div><div class="train">${train}</div></div></div>`;
  }).join('');
}
$('staffList').addEventListener('click', e => {
  const t = e.target.closest('[data-train]');
  if (t && !t.disabled) {
    const id = t.dataset.train, k = t.dataset.tk, lv = TR(id, k), price = BAL.trainPrice[lv];
    if (!hiredStaff().includes(id) || lv >= 3 || state.coins < price) return;
    state.coins -= price; state.training[id][k] = lv + 1; save(); home(); $('sheetStaff').hidden = false; sound('coin'); toast(STAFF[id].name + ' dilatih! Tahap ' + (lv + 1)); return;
  }
  const b = e.target.closest('[data-job]'); if (!b || b.disabled) return;
  const id = b.dataset.staff, job = b.dataset.job;
  const roles = state.roles ? JSON.parse(JSON.stringify(state.roles)) : {};
  hiredStaff().forEach(h => { if (!roles[h]) roles[h] = roleOf(h).slice(); });
  const cur = roles[id];
  if (cur.includes(job)) {
    if (!hiredStaff().some(h => h !== id && roles[h].includes(job))) { toast('Mesti ada sekurang-kurangnya seorang buat ' + JOBS.find(j => j[0] === job)[2] + '!'); sound('bad'); return; }
    roles[id] = cur.filter(x => x !== job);
  } else roles[id] = cur.concat(job);
  state.roles = roles; save(); renderStaff(); sound('tap');
});
function renderGoals() {
  const D = dailyToday();
  $('dailyList').innerHTML = D.goals.map((q, i) => {
    const P = DAILY_POOL.find(x => x.id === q.id); if (!P) return '';
    const done = q.prog >= q.n, r = Math.round(q.reward);
    return `<div class="goal-row ${q.claimed ? 'claimed' : ''}"><div class="goal-txt"><b>${P.t(q.n)}</b><div class="goal-bar"><i style="width:${Math.min(100, q.prog / q.n * 100)}%"></i></div><small>${Math.min(q.prog, q.n)} / ${q.n}</small></div><button class="claim-btn" data-daily="${i}" ${done && !q.claimed ? '' : 'disabled'}>${q.claimed ? '✓' : '🪙 ' + r}</button></div>`;
  }).join('');
  const got = ACH.filter(a => state.ach[a[0]]).length;
  $('achCount').textContent = got + ' / ' + ACH.length;
  $('achList').innerHTML = ACH.map(a => {
    const ok = a[3](), claimed = state.ach[a[0]];
    return `<div class="goal-row ${claimed ? 'claimed' : ok ? '' : 'locked'}"><div class="goal-txt"><b>${a[1]}</b><small>${a[2]}</small></div><button class="claim-btn" data-ach="${a[0]}" ${ok && !claimed ? '' : 'disabled'}>${claimed ? '✓' : '🪙 ' + a[4]}</button></div>`;
  }).join('');
  const ready = D.goals.filter(q => q.prog >= q.n && !q.claimed).length + ACH.filter(a => a[3]() && !state.ach[a[0]]).length;
  $('goalBadge').textContent = ready || '';
}

// little animated hero on home screen
const hc = $('heroCanvas'), hx = hc.getContext('2d');
function drawHero() {
  if (mode !== 'home' || !ART_READY) return;
  const W2 = 720, H2 = 900, t = performance.now();
  hx.setTransform(hc.width / W2, 0, 0, hc.height / H2, 0, 0);
  const L = locOf(state.sel), bg = img('menu_bg') || img('bg_' + L.key);
  if (bg) { const sc = Math.max(W2 / bg.width, H2 / bg.height); hx.drawImage(bg, (W2 - bg.width * sc) / 2, (H2 - bg.height * sc) / 2, bg.width * sc, bg.height * sc); }
  else { const gr = hx.createLinearGradient(0, 0, 0, H2); gr.addColorStop(0, '#ffd9e6'); gr.addColorStop(1, '#fff0dc'); hx.fillStyle = gr; hx.fillRect(0, 0, W2, H2); }
  if (!img('menu_bg')) { const v = hx.createLinearGradient(0, 0, 0, H2); v.addColorStop(0, '#fff3f800'); v.addColorStop(.55, '#ffe6ef55'); v.addColorStop(1, '#ffd2e3ee'); hx.fillStyle = v; hx.fillRect(0, 0, W2, H2); }
  const rg = hx.createRadialGradient(360, 470, 20, 360, 470, 300); rg.addColorStop(0, '#ffffffaa'); rg.addColorStop(1, '#ffffff00'); hx.fillStyle = rg; hx.fillRect(0, 200, W2, 700);
  const crew = [['mira_happy', 360, 455, 300, 0], [upg('helper1') ? 'aiman_front_idle' : 'guest_makcik_after', 165, 500, 240, 1.3], [upg('helper2') ? 'lina_front_idle' : 'guest_seleb_after', 555, 500, 240, 2.4]];
  for (const [n, x, y, sz, ph] of [crew[1], crew[2], crew[0]]) {
    const im = img(n); if (!im) continue;
    const b = Math.sin(t / 380 + ph) * 7;
    hx.fillStyle = '#00000022'; hx.beginPath(); hx.ellipse(x, y + sz * .47, sz * .26, sz * .05, 0, 0, Math.PI * 2); hx.fill();
    hx.drawImage(im, x - sz / 2, y - sz / 2 + b, sz, sz);
  }
  hx.font = '34px system-ui'; hx.textAlign = 'center'; hx.textBaseline = 'middle';
  for (let i = 0; i < 6; i++) { const a = t / 1400 + i * 1.05; hx.globalAlpha = .5 + .5 * Math.sin(t / 300 + i); const ic = img('ic_sparkle'); const x = 360 + Math.cos(a) * 300, y = 430 + Math.sin(a * 1.3) * 120; if (ic) hx.drawImage(ic, x - 18, y - 18, 36, 36); else hx.fillText('✨', x, y); }
  hx.globalAlpha = 1;
}
function sizeHero() { const r = hc.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); if (r.width) { hc.width = Math.round(r.width * d); hc.height = Math.round(r.height * d); } }
addEventListener('resize', sizeHero); setTimeout(sizeHero, 0);
$('editBtn').addEventListener('click', () => { if (ART_READY) { sound('tap'); startEdit(); } });
document.querySelectorAll('[data-sheet]').forEach(b => b.addEventListener('click', () => { home(); $(b.dataset.sheet).hidden = false; sound('tap'); }));
document.querySelectorAll('.sheet').forEach(sh => sh.addEventListener('click', e => { if (e.target === sh || e.target.closest('.sheet-close')) sh.hidden = true; }));

// ---------- buttons ----------
$('goalsBox').addEventListener('click', e => {
  const b = e.target.closest('.claim-btn'); if (!b || b.disabled) return;
  if (b.dataset.daily != null) { const q = dailyToday().goals[+b.dataset.daily]; if (!q || q.claimed || q.prog < q.n) return; q.claimed = true; state.coins += Math.round(q.reward); toast('Misi siap! +🪙' + Math.round(q.reward)); }
  if (b.dataset.ach) { const a = ACH.find(x => x[0] === b.dataset.ach); if (!a || state.ach[a[0]] || !a[3]()) return; state.ach[a[0]] = 1; state.coins += a[4]; toast(a[1] + '! +🪙' + a[4]); }
  save(); sound('win'); home(); $('sheetGoals').hidden = false;
});
$('playBtn').addEventListener('click', () => { if (ART_READY) showBrief({ kind: 'campaign', n: state.sel }); });
addEventListener('pointerdown', () => musicUpdate(), { passive: true });
$('musicBtn').addEventListener('click', () => { state.music = !state.music; save(); $('musicBtn').textContent = state.music ? '🎵' : '🔕'; musicUpdate(); });
$('pauseBtn').addEventListener('click', pause);
$('soundBtn').addEventListener('click', () => { state.muted = !state.muted; save(); $('soundBtn').textContent = state.muted ? '🔇' : '🔊'; if (!state.muted) sound('tap'); });
function pause() { if (mode !== 'play') return; mode = 'pause'; musicUpdate(); modal('☕', 'Rehat Jap', 'Pelanggan tunggu dengan sabar. Sambung bila dah ready.' + (game.kind === 'contract' ? '\n(Keluar = kontrak gagal)' : ''), [['▶ SAMBUNG', 'resume'], [state.music ? '🎵 Muzik: ON' : '🔕 Muzik: OFF', 'music'], ['↻ ULANG LEVEL', 'restart'], ['🏠 KELUAR', 'home']]); }
$('modalActions').addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b) return; const a = b.dataset.action;
  if (a === 'music') { state.music = !state.music; save(); b.textContent = state.music ? '🎵 Muzik: ON' : '🔕 Muzik: OFF'; return; }
  if (a === 'start') { startPending(); return; }
  if (a === 'cancel') { pendingSpec = null; $('overlay').hidden = true; return; }
  if (a === 'resume' && mode === 'pause') { mode = 'play'; $('overlay').hidden = true; last = performance.now(); musicUpdate(); }
  else if (a === 'home') { forfeitIfContract(); home(); window.scrollTo(0, 0); }
  else if (a === 'restart' && game && mode === 'pause') begin(game.spec, game.att);   // percubaan sama: tiada caj baru
  else if (a === 'retry' && game) { const sp = game.spec; home(); showBrief(sp); }
  else if (a === 'next' && game) { const n = Math.min(LIMIT, game.n + 1); home(); showBrief({ kind: 'campaign', n }); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') pause(); if (document.hidden) save(); musicUpdate(); });
addEventListener('resize', () => { if (game) resize(); });

// ---------- loop ----------
function frame(t) {
  const dt = Math.min(.1, Math.max(0, (t - last) / 1000)); last = t;
  try { update(dt); if (game) draw(); else drawHero(); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}
// debug hook untuk ujian automatik
window.__salon = { get game() { return game; }, get state() { return state; }, get mode() { return mode; }, begin, home, update, levelCfg, assign, reserve, place, tapAt, finishService, validateWorld, worldFor, repairLayout, showBrief, startPending, endLevel, astar, BAL, CONTRACTS, CTIERS, load, save, set selected(v) { selected = v; } };
home(); requestAnimationFrame(frame);
})();
