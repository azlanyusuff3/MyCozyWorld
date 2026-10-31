// Cozy Salon — Sally's Salon-style time management game (original characters).
// Sprite hooks: letak gambar dalam salon/sprites/ (lihat SPRITES di bawah). Kalau tiada, game lukis placeholder sendiri.
(() => {
'use strict';
const SALON_VERSION = 10, SALON_DATE = '31 Okt 2026';
const $ = id => document.getElementById(id);
const KEY = 'mycozyworld_cozy_salon_v2', OLD_KEY = 'mycozyworld_cozy_salon_v1', LIMIT = 60;
const W = 720, H = 960;   // logical canvas size (portrait)

// ---------- data ----------
const TYPES = {
  wash:  { name: 'Shampoo',    icon: '🫧', time: 3.2, staff: true },
  cut:   { name: 'Gunting',    icon: '✂️', time: 4.2, staff: true },
  color: { name: 'Warna',      icon: '🎨', time: 4.8, staff: true },
  style: { name: 'Hair Dryer', icon: '💨', time: 5.0, staff: false },
  pay:   { name: 'Bayar',      icon: '💰', time: 1.2, staff: true },
};
const LOCS = [
  { key: 'kampung', name: 'Kedai Kampung', icon: '🌴', from: 1,  wall: '#fbe3d2', wall2: '#f6cfb8', floor: '#d9a77c', floor2: '#c99368', trim: '#a8714f', tipX: 1 },
  { key: 'mall',    name: 'Mall KL',       icon: '🏙️', from: 16, wall: '#e3e8fb', wall2: '#cfd7f6', floor: '#e9e4ef', floor2: '#d5cde0', trim: '#8a7fb2', tipX: 1.25 },
  { key: 'resort',  name: 'Resort Langkawi', icon: '🏝️', from: 31, wall: '#dff5ef', wall2: '#c4ebe0', floor: '#f0dcb8', floor2: '#e2c99e', trim: '#4f9d8c', tipX: 1.5 },
  { key: 'seleb',   name: 'Studio Seleb',  icon: '🌟', from: 46, wall: '#f3dcf3', wall2: '#e7c3e8', floor: '#4a3756', floor2: '#3c2c47', trim: '#d4a64b', tipX: 1.8 },
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
const SKIN = ['#f6cdb1','#e8ae84','#cc8f69','#a46f57','#f9dcc2'];
const HAIR = ['#4b2f3f','#8a5434','#e2a457','#2d3a4f','#a3506f','#6b4840','#c76b3c','#7c5cc4','#e77fa5','#4fa3a0'];
const OUTFIT = ['#79c5b6','#db91b0','#9ca9da','#f2b775','#be99cc','#8fc98a','#e7898a'];
const STYLES = ['long','bob','bun','pony','curly','short'];

const TIER = ['Biasa', 'Pro', 'Emas'];
const UP = [
  // 🧰 peralatan (tier stesen: Biasa → Pro → Emas, gambar stesen bertukar)
  { cat: 'alat', key: 'wash',  name: 'Sinki',          icon: '🫧', info: 'Shampoo lebih laju & tip lebih besar.', base: 120, max: 2, unlock: 1, tier: true },
  { cat: 'alat', key: 'cut',   name: 'Kerusi Gunting', icon: '✂️', info: 'Gunting lebih laju & tip lebih besar.', base: 140, max: 2, unlock: 1, tier: true },
  { cat: 'alat', key: 'style', name: 'Hair Dryer',     icon: '💨', info: 'Dryer lebih laju & tip lebih besar.',   base: 160, max: 2, unlock: 3, tier: true },
  { cat: 'alat', key: 'color', name: 'Color Bar',      icon: '🎨', info: 'Warna lebih laju & tip lebih besar.',   base: 190, max: 2, unlock: 5, tier: true },
  { cat: 'alat', key: 'coffee',name: 'Mesin Kopi',     icon: '☕', info: 'Bagi kopi: pulihkan patience pelanggan.', base: 150, max: 2, unlock: 4 },
  { cat: 'alat', key: 'shoes', name: 'Kasut Laju',     icon: '👟', info: 'Semua staf berjalan 20% lebih laju.',   base: 110, max: 3, unlock: 2 },
  // 🪑 stesen tambahan
  { cat: 'stesen', key: 'chair',  name: 'Kerusi Gunting #2', icon: '🪑', info: 'Tambah satu lagi stesen gunting.', base: 300, max: 1, unlock: 6 },
  { cat: 'stesen', key: 'sofa',   name: 'Sofa Extra',        icon: '🛋️', info: 'Tambah 1 tempat duduk menunggu.',  base: 220, max: 1, unlock: 7 },
  { cat: 'stesen', key: 'style2', name: 'Hair Dryer #2',     icon: '💨', info: 'Tambah satu lagi hair dryer.',     base: 420, max: 1, unlock: 9 },
  { cat: 'stesen', key: 'wash2',  name: 'Sinki #2',          icon: '🚿', info: 'Tambah satu lagi sinki shampoo.',  base: 380, max: 1, unlock: 10 },
  { cat: 'stesen', key: 'color2', name: 'Color Bar #2',      icon: '🎨', info: 'Tambah satu lagi stesen warna.',   base: 520, max: 1, unlock: 12 },
  // 👥 pekerja
  { cat: 'staff', key: 'helper1', name: 'Pembantu Aiman', icon: '🧑‍🔧', info: 'Aiman buat semua shampoo & hantar kopi.', base: 450, max: 1, unlock: 8 },
  { cat: 'staff', key: 'helper2', name: 'Juruwang Lina',  icon: '👩‍💼', info: 'Lina jaga kaunter bayar.', base: 700, max: 1, unlock: 14 },
  // 🖼️ dekorasi (ada kesan)
  { cat: 'dekor', key: 'comfort',  name: 'Majalah',      icon: '📰', info: 'Patience turun 12% lebih perlahan.', base: 120, max: 3, unlock: 2 },
  { cat: 'dekor', key: 'd_flowers',name: 'Pasu Bunga',   icon: '💐', info: 'Tip +3%.',                      base: 90,  max: 1, unlock: 2 },
  { cat: 'dekor', key: 'd_aquarium',name: 'Akuarium',    icon: '🐠', info: 'Pelanggan tenang: patience -8% lebih perlahan.', base: 260, max: 1, unlock: 4 },
  { cat: 'dekor', key: 'd_tv',     name: 'TV Lounge',    icon: '📺', info: 'Yang menunggu di sofa kurang bosan (-15%).', base: 340, max: 1, unlock: 7 },
  { cat: 'dekor', key: 'd_chandelier', name: 'Chandelier', icon: '💡', info: 'Salon nampak mewah: tip +10%.', base: 600, max: 1, unlock: 11 },
  { cat: 'dekor', key: 'd_jukebox',name: 'Jukebox',      icon: '📻', info: 'Masa combo lebih panjang (+1.5s).', base: 520, max: 1, unlock: 16 },
  { cat: 'dekor', key: 'd_neon',   name: 'Neon Hati',    icon: '💖', info: 'Vibe Instagram: tip +5%.', base: 800, max: 1, unlock: 20 },
];
const CATS = [['alat', '🧰 Peralatan'], ['stesen', '🪑 Stesen Tambahan'], ['staff', '👥 Pekerja'], ['dekor', '🖼️ Dekorasi']];
const priceOf = u => Math.round(u.base * Math.pow(u.tier ? 2.4 : 1.8, upg(u.key)));
const tipMult = () => 1 + upg('d_flowers') * .03 + upg('d_chandelier') * .1 + upg('d_neon') * .05;


// ---------- sprites (optional) ----------
// Nama fail: salon/sprites/<nama>.webp  (contoh mira_idle.webp, guest_makcik_sit.webp, bg_kampung.webp, st_wash.webp)
const IMG = {};
let SPRITE_LIST = new Set();
// Preload SEMUA gambar dulu supaya game tak pernah tunjuk placeholder sekejap.
let ART_READY = false, artDone = 0, artTotal = 0;
function artProgress() {
  const btn = $('playBtn'); if (!btn || mode !== 'home') return;
  if (ART_READY) { btn.disabled = false; btn.textContent = '▶ MAIN LEVEL ' + state.level; }
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
function img(name) {
  if (!SPRITE_LIST.has(name)) return null;
  const i = IMG[name];
  return i && i.ok ? i : null;
}

// ---------- save ----------
let state = load();
function load() {
  const s = { level: 1, coins: 100, stars: {}, upgrades: {}, muted: false, music: true, stats: {}, daily: null, ach: {} };
  try {
    const x = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY) || 'null');
    if (x && typeof x === 'object') {
      s.level = Math.min(LIMIT, Math.max(1, Number(x.level) || 1));
      s.coins = Math.max(0, Number(x.coins) || 0);
      s.stars = x.stars && typeof x.stars === 'object' ? x.stars : {};
      s.upgrades = x.upgrades && typeof x.upgrades === 'object' ? x.upgrades : {};
      s.muted = !!x.muted; s.music = x.music !== false;
      s.stats = x.stats && typeof x.stats === 'object' ? x.stats : {};
      s.daily = x.daily && typeof x.daily === 'object' ? x.daily : null;
      s.ach = x.ach && typeof x.ach === 'object' ? x.ach : {};
    }
  } catch (e) {}
  UP.forEach(u => s.upgrades[u.key] = Math.min(u.max, Math.max(0, Number(s.upgrades[u.key]) || 0)));
  delete s.upgrades.assistant;
  return s;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
const upg = k => state.upgrades[k] || 0;
const locOf = n => LOCS.slice().reverse().find(l => n >= l.from);
const rnd = a => a[Math.floor(Math.random() * a.length)];

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
// ---- muzik latar (procedural, cozy lo-fi) ----
const Music = { on: false, timer: 0, next: 0, step: 0, bus: null };
const PROG = [[0, 4, 7, 11], [9, 12, 16, 19], [5, 9, 12, 16], [7, 11, 14, 17]]; // Imaj7 vi IV V
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
    if (st % 2 === 1 || Math.random() < .25) mNote(hz(ch[0] - 12) * 2, t, .05, 'square', .006); // hi-hat-ish tick
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
function toast(s) { const t = $('toast'); t.textContent = s; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1700); }
function modal(icon, title, text, actions) {
  $('modalIcon').textContent = icon; $('modalTitle').textContent = title; $('modalText').textContent = text;
  $('modalActions').innerHTML = actions.map((a, i) => `<button type="button" data-action="${a[1]}" ${i ? 'class="secondary"' : ''}>${a[0]}</button>`).join('');
  $('overlay').hidden = false;
}

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
function renderGoals() {
  const D = dailyToday();
  $('dailyList').innerHTML = D.goals.map((q, i) => {
    const P = DAILY_POOL.find(x => x.id === q.id), done = q.prog >= q.n, r = Math.round(q.reward);
    return `<div class="goal-row ${q.claimed ? 'claimed' : ''}"><div class="goal-txt"><b>${P.t(q.n)}</b><div class="goal-bar"><i style="width:${Math.min(100, q.prog / q.n * 100)}%"></i></div><small>${Math.min(q.prog, q.n)} / ${q.n}</small></div><button class="claim-btn" data-daily="${i}" ${done && !q.claimed ? '' : 'disabled'}>${q.claimed ? '✓' : '🪙 ' + r}</button></div>`;
  }).join('');
  const got = ACH.filter(a => state.ach[a[0]]).length;
  $('achCount').textContent = got + ' / ' + ACH.length;
  $('achList').innerHTML = ACH.map(a => {
    const ok = a[3](), claimed = state.ach[a[0]];
    return `<div class="goal-row ${claimed ? 'claimed' : ok ? '' : 'locked'}"><div class="goal-txt"><b>${a[1]}</b><small>${a[2]}</small></div><button class="claim-btn" data-ach="${a[0]}" ${ok && !claimed ? '' : 'disabled'}>${claimed ? '✓' : '🪙 ' + a[4]}</button></div>`;
  }).join('');
  const ready = D.goals.filter(q => q.prog >= q.n && !q.claimed).length + ACH.filter(a => a[3]() && !state.ach[a[0]]).length;
  $('goalBadge').textContent = ready ? ready + ' ganjaran sedia!' : '';
}

// ---------- level design ----------
const totalGuests = n => Math.min(18, 4 + Math.ceil(n * .55));
const goalGuests = n => Math.ceil(totalGuests(n) * .7);
function levelTitle(n) { const i = (n - 1) % 15; return i < 2 ? 'Hari Pertama' : i < 5 ? 'Makin Ramai' : i < 9 ? 'Hari Sibuk' : i < 13 ? 'Rush Hour' : 'Hari Besar'; }
function orderFor(n) {
  let p;
  if (n < 3) p = [['wash', 'cut'], ['cut'], ['wash', 'cut']];
  else if (n < 5) p = [['wash', 'cut', 'style'], ['cut', 'style'], ['wash', 'style'], ['wash', 'cut']];
  else p = [['wash', 'color', 'style'], ['cut', 'color', 'style'], ['wash', 'cut', 'style'], ['cut', 'style'], ['wash', 'cut', 'color', 'style'], ['color', 'style'], ['wash', 'cut']];
  return rnd(p).concat('pay');
}
function pickType(n) {
  const pool = [];
  Object.entries(GUESTS).forEach(([k, g]) => { if (n >= g.from) { const w = k === 'biasa' ? 5 : k === 'makcik' ? 3 : k === 'remaja' ? 3 : k === 'vip' ? 2 : 1.5; pool.push([k, w]); } });
  let r = Math.random() * pool.reduce((a, b) => a + b[1], 0);
  for (const [k, w] of pool) { if ((r -= w) <= 0) return k; }
  return 'biasa';
}

// ---------- layout ----------
function buildSlots() {
  const L = [{ id: 'wash1', kind: 'wash' }, { id: 'cut1', kind: 'cut' }];
  if (upg('chair')) L.push({ id: 'cut2', kind: 'cut' });
  if (game.level >= 3) L.push({ id: 'style1', kind: 'style' });
  if (game.level >= 5) L.push({ id: 'color1', kind: 'color' });
  if (upg('wash2')) L.push({ id: 'wash2', kind: 'wash' });
  if (upg('style2') && game.level >= 3) L.push({ id: 'style2', kind: 'style' });
  if (upg('color2') && game.level >= 5) L.push({ id: 'color2', kind: 'color' });
  const cols = L.length <= 6 ? 3 : 4, xs = cols === 3 ? [120, 330, 540] : [92, 262, 432, 602], sc = cols === 3 ? 1 : .8;
  L.forEach((o, i) => { o.x = xs[i % cols]; o.y = i < cols ? 360 : 590; o.sc = sc; });
  L.push({ id: 'pay1', kind: 'pay', x: 600, y: 790, sc: 1 });
  return L.map(o => ({ ...o, guestId: null, state: 'empty', t: 0, dur: 0, queued: false }));
}
function buildSeats() {
  const n = 4 + upg('sofa'), seats = [];
  for (let i = 0; i < n; i++) seats.push({ x: 70 + i * 92, y: 880, guestId: null });
  return seats;
}
const STAFF = {
  mira:  { name: 'Mira',  roles: null, col: '#7759a8', label: '#e56b93', hair: '#6b3f2a', style: 0, outfit: '#e56b93', speed: 300 },
  aiman: { name: 'Aiman', roles: ['wash', 'coffee'], col: '#2f9c8f', label: '#2f9c8f', hair: '#2d2a33', style: 5, outfit: '#5fc3b2', speed: 280, home: { x: 250, y: 470 }, up: 'helper1' },
  lina:  { name: 'Lina',  roles: ['pay'], col: '#e08a2e', label: '#e08a2e', hair: '#c76b3c', style: 3, outfit: '#f2b775', speed: 280, home: { x: 680, y: 705 }, up: 'helper2' },
};
const COFFEE = { x: 455, y: 790 };
const DOOR = { x: -40, y: 900 };

// ---------- game state ----------
let mode = 'home', game = null, selected = null, nextId = 1, last = performance.now();
const cv = $('salonCanvas'), mainCtx = cv.getContext('2d');
let ctx = mainCtx;
let scale = 1;

function begin(n) {
  mode = 'play'; selected = null;
  game = { level: n, loc: locOf(n), total: totalGuests(n), goal: goalGuests(n), spawned: 0, served: 0, lost: 0, earned: 0, t: 0,
    nextArrival: 1.2, guests: [], fx: [], moodSum: 0, combo: 0, lastKind: null, comboT: 0, bestCombo: 0 };
  game.slots = buildSlots(); game.seats = buildSeats();
  const mk = (id, x, y) => ({ id, ...STAFF[id], x, y, tx: x, ty: y, queue: [], cur: null, act: 0, face: 1, walk: 0, happy: 0 });
  game.staff = [mk('mira', 420, 640)];
  if (upg('helper1')) game.staff.push(mk('aiman', STAFF.aiman.home.x, STAFF.aiman.home.y));
  if (upg('helper2')) game.staff.push(mk('lina', STAFF.lina.home.x, STAFF.lina.home.y));
  game.mira = game.staff[0];
  $('homeView').hidden = true; $('gameView').hidden = false; $('overlay').hidden = true;
  $('playingLevel').textContent = 'LEVEL ' + n; $('hudLoc').textContent = game.loc.name.toUpperCase();
  resize(); hud(); window.scrollTo(0, 0); sound('door');
}

function spawnGuest() {
  const seat = game.seats.find(s => s.guestId == null); if (!seat) return false;
  const type = pickType(game.level), T = GUESTS[type];
  const base = (Math.max(30, 58 - game.level * .35) + Math.random() * 10) * T.patience;
  const g = { id: nextId++, type, name: rnd(NAMES[type]), skin: Math.floor(Math.random() * SKIN.length),
    hair: Math.floor(Math.random() * HAIR.length), style: Math.floor(Math.random() * STYLES.length), outfit: Math.floor(Math.random() * OUTFIT.length),
    steps: orderFor(game.level), step: 0, status: 'walk', x: DOOR.x, y: DOOR.y, tx: seat.x, ty: seat.y, at: { k: 'seat', o: seat },
    patience: base, max: base, tip: 0, bounce: 0, sparkle: 0, coffee: 0, done: [] };
  if (type === 'makcik') g.style = -1; // tudung
  if (game.level >= 6 && ((type === 'vip' || type === 'seleb') ? Math.random() < .7 : Math.random() < .15)) {
    const canPerfect = g.steps.some(k => k === 'cut' || k === 'color');
    g.wish = canPerfect && Math.random() < .55 ? 'perfect' : 'cepat';
  }
  if (type === 'remaja' && Math.random() < .6) g.style = 5;
  seat.guestId = g.id; game.guests.push(g); game.spawned++; hud();
  sound('door'); return true;
}
const G = id => game && game.guests.find(g => g.id === id);
const need = g => g.steps[g.step];
const canMove = g => g && (g.status === 'wait');

function release(g) {
  if (!g.at) return;
  if (g.at.k === 'seat') g.at.o.guestId = null;
  else { const s = g.at.o; s.guestId = null; s.state = 'empty'; s.t = 0; s.queued = false; game.staff.forEach(m => m.queue = m.queue.filter(q => q.slot !== s)); }
  g.at = null;
}

function assign(g, s) {
  if (!canMove(g)) return false;
  if (s.guestId != null) { toast('Station tu ada orang!'); sound('bad'); return false; }
  if (need(g) !== s.kind) { toast(g.name + ' perlukan ' + TYPES[need(g)].icon + ' ' + TYPES[need(g)].name + ' dulu!'); sound('bad'); return false; }
  release(g);
  s.guestId = g.id; s.state = 'arriving'; g.at = { k: 'slot', o: s };
  g.status = 'walk'; g.tx = s.x; g.ty = s.y + 10;
  if (TYPES[s.kind].staff) enqueue({ k: 'work', slot: s });
  selected = null; sound('tap'); return true;
}
function enqueue(task) {
  const kind = task.k === 'coffee' ? 'coffee' : task.slot.kind, max = 5;
  const m = game.staff.find(x => x.roles && x.roles.includes(kind)) || game.mira;
  if (m.queue.length + (m.cur ? 1 : 0) >= max + 1) { toast('Queue ' + m.name + ' penuh! (max 5)'); return false; }
  if (task.slot) task.slot.queued = true;
  m.queue.push(task); return true;
}
function giveCoffee(g) {
  if (!upg('coffee')) { toast('Beli upgrade Mesin Kopi dulu ☕'); return; }
  if (g.coffee > 0) { toast(g.name + ' dah dapat kopi'); return; }
  if (game.staff.some(m => m.queue.some(q => q.k === 'coffee' && q.g === g) || (m.cur && m.cur.k === 'coffee' && m.cur.g === g))) return;
  if (enqueue({ k: 'coffee', g })) { selected = null; sound('tap'); }
}

function staffPoint(task) {
  if (task.k === 'coffee') return { x: COFFEE.x - 50, y: COFFEE.y + 20 };
  const s = task.slot; return s.kind === 'pay' ? { x: s.x, y: s.y - 70 } : { x: s.x + 62 * s.sc, y: s.y + 25 };
}

function finishService(s, who) {
  const g = G(s.guestId); if (!g) return;
  const kind = s.kind;
  // combo
  if (kind !== 'pay') {
    game.combo = game.lastKind === kind ? game.combo + 1 : 1; game.lastKind = kind; game.comboT = 3 + upg('d_jukebox') * 1.5;
    if (game.combo >= 2) { g.tip += 4 * game.combo; fx('COMBO x' + game.combo + '!', s.x, s.y - 110, '#e56b93', 30); sound('combo'); game.bestCombo = Math.max(game.bestCombo, game.combo); stat('combo', game.combo, true); }
  }
  // hair transformation
  if (kind === 'wash') { g.sparkle = 1.2; sound('water'); }
  if (kind === 'cut') { if (g.style >= 0) { let n; do { n = Math.floor(Math.random() * STYLES.length); } while (n === g.style); g.style = n; } else g.tudung = (g.tudung || 0) + 1; g.sparkle = 1.5; }
  if (kind === 'color') { let n; do { n = Math.floor(Math.random() * HAIR.length); } while (n === g.hair); g.hair = n; g.sparkle = 1.5; }
  if (kind === 'style') { g.sparkle = 2; g.shine = 1; }
  if (kind !== 'pay') g.tip += 5 * upg(kind);
  g.done.push(kind); g.step++;
  g.tip += Math.round(4 * (g.patience / g.max));
  if (kind === 'pay') {
    const T = GUESTS[g.type], mood = g.patience / g.max;
    let pay = Math.round((18 + (g.steps.length - 1) * 9 + g.tip) * T.tip * game.loc.tipX * (0.75 + mood * .5) * tipMult());
    if (g.wish) {
      const ok = g.wish === 'perfect' ? g.perfect : mood >= .6;
      if (ok) { const b = Math.round(30 * game.loc.tipX); pay += b; fx('⭐ Hajat tercapai! +' + b, s.x - 40, s.y - 140, '#e56b93', 24); stat('wish', 1); sound('perfect'); }
      else fx('Hajat tak tercapai…', s.x - 40, s.y - 140, '#9a7f8f', 18);
    }
    stat('served', 1); stat('earned', pay); if (g.type === 'makcik') stat('makcik', 1); if (g.type === 'vip') stat('vip', 1);
    game.earned += pay; game.served++; game.moodSum += mood;
    fx('+🪙' + pay, s.x, s.y - 90, '#d39a1c', 28);
    for (let i = 0; i < 6; i++) game.fx.push({ coin: true, x: s.x, y: s.y - 40, vx: (Math.random() - .5) * 220, vy: -200 - Math.random() * 150, life: 1 });
    sound('coin'); (who || game.mira).happy = 1;
    release(g); g.status = 'leave'; g.tx = DOOR.x; g.ty = DOOR.y; g.happyLeave = true;
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
  // arrivals
  if (game.spawned < game.total && game.t >= game.nextArrival) {
    if (spawnGuest()) game.nextArrival = game.t + Math.max(3.4, 8 - game.level * .08) * (0.8 + Math.random() * .4);
    else game.nextArrival = game.t + 1;
  }
  const decay = (1 - upg('comfort') * .12) * (1 - upg('d_aquarium') * .08);
  for (const g of game.guests.slice()) {
    // move
    const dx = g.tx - g.x, dy = g.ty - g.y, d = Math.hypot(dx, dy), sp = (g.status === 'leave' ? 260 : 230) * dt;
    if (d > 2) { g.x += dx / d * Math.min(sp, d); g.y += dy / d * Math.min(sp, d); g.walking = true; }
    else {
      g.walking = false; g.x = g.tx; g.y = g.ty;
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
    // patience
    if (g.status === 'wait' || g.status === 'ready' || (g.status === 'walk' && g.at && g.at.k === 'seat')) {
      const rate = (g.status === 'ready' ? .55 : 1) * decay * (g.coffee > 0 ? .3 : 1) * (g.at && g.at.k === 'seat' && upg('d_tv') ? .85 : 1);
      g.patience -= dt * rate;
      if (g.patience <= 0) {
        game.lost++; release(g); g.status = 'leave'; g.tx = DOOR.x; g.ty = DOOR.y; g.angry = true;
        if (selected === g.id) selected = null;
        fx('😡 ' + g.name + ' blah!', g.x, g.y - 120, '#c6455f', 24); sound('bad'); hud();
      }
    }
  }
  // dryer (auto) & staffed slots progress
  for (const s of game.slots) {
    if (s.state !== 'working') continue;
    if (!TYPES[s.kind].staff) { s.t += dt; if (s.t >= s.dur) finishService(s); }
  }
  for (const m of game.staff) updateStaff(m, dt);
  // fx
  for (const f of game.fx) {
    f.life -= dt * (f.coin ? 1.4 : .9);
    if (f.coin) { f.vy += 600 * dt; f.x += f.vx * dt; f.y += f.vy * dt; } else f.y -= 40 * dt;
  }
  game.fx = game.fx.filter(f => f.life > 0);
  // end
  if (game.spawned >= game.total && !game.guests.length) endLevel();
}
function updateStaff(m, dt) {
  const speed = m.speed * (1 + upg('shoes') * .2);
  if (m.happy > 0) m.happy -= dt;
  if (!m.cur && m.queue.length) {
    m.cur = m.queue.shift();
    // skip if invalid
    if (m.cur.k === 'work' && !G(m.cur.slot.guestId)) { if (m.cur.slot) m.cur.slot.queued = false; m.cur = null; }
    else if (m.cur.k === 'coffee' && !game.guests.includes(m.cur.g)) m.cur = null;
    if (m.cur) { const p = staffPoint(m.cur); m.tx = p.x; m.ty = p.y; m.phase = 'go'; }
  }
  const dx = m.tx - m.x, dy = m.ty - m.y, d = Math.hypot(dx, dy);
  if (d > 2) { m.x += dx / d * Math.min(speed * dt, d); m.y += dy / d * Math.min(speed * dt, d); m.walk += dt * 10; if (Math.abs(dx) > 3) m.face = dx > 0 ? 1 : -1; }
  else if (m.cur) {
    const c = m.cur;
    if (c.k === 'work') {
      const s = c.slot, g = G(s.guestId);
      if (!g) { s.queued = false; m.cur = null; }
      else if (m.phase === 'go') {
        if (g.status === 'ready') { m.phase = 'do'; s.state = 'working'; g.status = 'serve'; s.t = 0; s.dur = TYPES[s.kind].time * Math.pow(.82, upg(s.kind)); m.face = -1; m.act = 0; s.qte = (s.kind === 'cut' || s.kind === 'color' || (s.kind === 'wash' && m.id === 'mira')) ? { t: 0, res: null, c: .3 + Math.random() * .4, sp: .75 + Math.min(.6, game.level * .012) } : null; }
        // else: guest still walking — wait here
      } else {
        s.t += dt; m.act += dt; if (s.qte) s.qte.t += dt;
        if (s.kind === 'cut' && Math.floor(m.act * 2.2) !== Math.floor((m.act - dt) * 2.2)) sound('snip');
        if (s.kind === 'wash' && Math.floor(m.act * .8) !== Math.floor((m.act - dt) * .8)) sound('water');
        if (s.t >= s.dur) { s.queued = false; m.cur = null; finishService(s, m); }
      }
    } else if (c.k === 'coffee') {
      if (m.phase === 'go') { m.phase = 'do'; m.act = 0; }
      m.act += dt;
      if (m.act >= 1.3) {
        const g = c.g;
        if (game.guests.includes(g) && g.status !== 'leave') { g.patience = Math.min(g.max, g.patience + g.max * (.35 + upg('coffee') * .1)); g.coffee = 6; g.bounce = 1; fx('☕ Sedapnya!', g.x, g.y - 120, '#8a5434', 22); sound('coin'); stat('coffee', 1); }
        m.cur = null;
      }
    }
  } else if (!m.queue.length && m.home) { m.tx = m.home.x; m.ty = m.home.y; }
}
function fx(text, x, y, color, size) { game.fx.push({ text, x, y, color, size, life: 1.4 }); }

function endLevel() {
  const won = game.served >= game.goal;
  const avg = game.served ? game.moodSum / game.served : 0;
  const stars = !won ? 0 : (game.lost === 0 && avg >= .5) ? 3 : game.lost <= 2 ? 2 : 1;
  const bonus = won ? stars * 20 + game.bestCombo * 5 : 0;
  const payout = won ? game.earned + bonus : Math.floor(game.earned * .4);
  const n = game.level, prevLoc = locOf(state.level);
  state.coins += payout;
  if (won) { state.stars[n] = Math.max(state.stars[n] || 0, stars); state.level = Math.min(LIMIT, Math.max(state.level, n + 1)); }
  if (stars === 3) stat('stars3', 1);
  save(); mode = 'result';
  const newLoc = locOf(state.level);
  const extra = won && newLoc !== prevLoc ? '\n\n🎉 Lokasi baru dibuka: ' + newLoc.icon + ' ' + newLoc.name + '!' : '';
  modal(won ? '🏆' : '💔', won ? 'Level Lulus!' : 'Cuba Lagi!',
    (won ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '\n' : '') +
    'Dilayan: ' + game.served + ' / ' + game.total + '\nBlah: ' + game.lost +
    (game.bestCombo >= 2 ? '\nCombo terbaik: x' + game.bestCombo : '') +
    '\nCoins: +' + payout + (won ? '' : '\nKena layan sekurang-kurangnya ' + game.goal + ' orang.') + extra,
    won ? (n < LIMIT ? [['▶ LEVEL SETERUSNYA', 'next'], ['🏠 BALIK SALON', 'home']] : [['🏠 BALIK SALON', 'home']]) : [['↻ CUBA LAGI', 'retry'], ['🏠 BALIK SALON', 'home']]);
  sound(won ? 'win' : 'bad');
}

function hud() {
  if (!game) return;
  $('servedCount').textContent = game.served + ' / ' + game.goal;
  $('earnedCount').textContent = '🪙 ' + game.earned;
  $('goalFill').style.width = Math.min(100, game.served / game.goal * 100) + '%';
  $('goalCaption').textContent = 'Target ' + game.goal + ' · Datang ' + game.spawned + '/' + game.total + ' · Blah ' + game.lost;
}

// ---------- drawing ----------
// arah sprite: turun = front, naik = back, kiri/kanan = side (sprite side menghadap kanan, flip bila ke kiri)
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
  if (bg) { ctx.drawImage(bg, 0, 0, W, H); return; }
  // wall
  ctx.fillStyle = L.wall; ctx.fillRect(0, 0, W, 250);
  ctx.fillStyle = L.wall2; for (let x = 0; x < W; x += 60) ctx.fillRect(x, 0, 28, 250);
  ctx.globalAlpha = .5; for (let x = 30; x < W; x += 60) for (let y = 30; y < 230; y += 60) emoji('✿', x + 14, y, 14); ctx.globalAlpha = 1;
  // windows
  for (const wx of [210, 440]) { rr(wx, 74, 70, 120, 14); ctx.fillStyle = '#cfeefc'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(wx + 31, 74, 8, 120); emoji(L.icon, wx + 52, 172, 22); }
  // sign
  rr(W / 2 - 150, 14, 300, 46, 20); ctx.fillStyle = L.trim; ctx.fill();
  text('✂ ' + L.name + ' ✂', W / 2, 38, 24, '#fff', 'center', null);
  // floor
  ctx.fillStyle = L.floor; ctx.fillRect(0, 250, W, H - 250);
  ctx.fillStyle = L.floor2; for (let y = 250; y < H; y += 60) for (let x = ((y / 60) % 2) * 60; x < W; x += 120) ctx.fillRect(x, y, 60, 60);
  ctx.fillStyle = L.trim; ctx.fillRect(0, 244, W, 12);
  // rug lounge
  rr(20, 800, 470, 140, 40); ctx.fillStyle = '#ffffff55'; ctx.fill();
  // plants
  emoji('🪴', 680, 270, 44); emoji('🪴', 30, 620, 40);
}

const STATION_COL = { wash: '#8fd3e8', cut: '#f4a7c0', color: '#c3a6e8', style: '#ffd08a', pay: '#f2c46d' };
function drawStation(s) {
  ctx.save(); ctx.translate(s.x, s.y); ctx.scale(s.sc, s.sc); ctx.translate(-s.x, -s.y);
  drawStationInner(s);
  ctx.restore();
  drawQTE(s);
}
function drawStationInner(s) {
  const tier = TYPES[s.kind].staff !== undefined && s.kind !== 'pay' ? upg(s.kind) : 0;
  const T = TYPES[s.kind], sp = (tier === 2 && img('st_' + s.kind + '_gold')) || (tier >= 1 && img('st_' + s.kind + '_pro')) || img('st_' + s.kind);
  const glow = selected != null && canMove(G(selected)) && need(G(selected)) === s.kind && s.guestId == null;
  if (glow) { ctx.save(); ctx.globalAlpha = .45 + Math.sin(performance.now() / 180) * .2; ell(s.x, s.y + 40, 95, 40, '#fff6a8'); ctx.restore(); }
  ell(s.x, s.y + 48, 80, 22, '#00000022');
  if (sp) { ctx.drawImage(sp, s.x - 90, s.y - 120, 180, 180); }
  else if (s.kind === 'pay') {
    rr(s.x - 90, s.y - 40, 180, 90, 18); ctx.fillStyle = '#c98a5a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#8d5a39'; ctx.stroke();
    rr(s.x - 80, s.y - 52, 160, 22, 10); ctx.fillStyle = '#e9b07e'; ctx.fill();
    emoji('🧾', s.x + 40, s.y - 70, 34); emoji('💐', s.x - 50, s.y - 72, 30);
  } else {
    // mirror (for cut/color) or sink
    if (s.kind === 'wash') { rr(s.x - 55, s.y - 95, 110, 50, 24); ctx.fillStyle = '#e8f6fb'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#7fb4c6'; ctx.stroke(); emoji('🚿', s.x + 44, s.y - 112, 28); }
    else if (s.kind === 'style') { ell(s.x, s.y - 85, 60, 40, '#ffe4b3', '#d79b4c', 4); ctx.fillStyle = '#d79b4c'; ctx.fillRect(s.x + 48, s.y - 85, 10, 110); }
    else { rr(s.x - 42, s.y - 128, 84, 92, 42); ctx.fillStyle = '#e7f3fb'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = s.kind === 'color' ? '#b08ad8' : '#e39ab4'; ctx.stroke(); ctx.globalAlpha = .6; emoji('✦', s.x + 20, s.y - 104, 16); ctx.globalAlpha = 1; }
    // chair
    rr(s.x - 44, s.y - 30, 88, 70, 22); ctx.fillStyle = STATION_COL[s.kind]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#00000033'; ctx.stroke();
    rr(s.x - 52, s.y + 18, 104, 26, 12); ctx.fillStyle = STATION_COL[s.kind]; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9b8a96'; ctx.fillRect(s.x - 5, s.y + 44, 10, 12);
  }
  // label
  rr(s.x - 52, s.y + 58, 104, 28, 14); ctx.fillStyle = '#fffffff0'; ctx.fill();
  ctx.font = '15px system-ui'; text(T.icon + ' ' + T.name, s.x, s.y + 72, 15, '#6a4877', 'center', null);
  // progress
  if (s.state === 'working') {
    const p = Math.min(1, s.t / s.dur);
    rr(s.x - 50, s.y + 90, 100, 14, 7); ctx.fillStyle = '#fff'; ctx.fill();
    rr(s.x - 48, s.y + 92, 96 * p, 10, 5); ctx.fillStyle = '#5fc48f'; ctx.fill();
  }
}

function drawGuest(g) {
  const T = GUESTS[g.type], seated = !g.walking && g.status !== 'leave';
  const bob = g.walking ? Math.abs(Math.sin(performance.now() / 110)) * 6 : 0;
  const bnc = g.bounce > 0 ? Math.sin(g.bounce * Math.PI) * 14 : 0;
  const x = g.x, y = g.y - bob - bnc - (seated ? 0 : 6);
  const mood = g.angry ? 0 : g.happyLeave ? 1 : g.patience / g.max;
  const dir = dirOf(g.tx - g.x, g.ty - g.y), step = Math.sin(performance.now() / 110) > 0 ? 'walk1' : 'walk2';
  const pose = g.walking ? dir + '_' + step : g.status === 'serve' ? 'chair' : mood < .3 ? 'angry' : g.done.length && g.step >= g.steps.length - 1 ? 'after' : 'sit';
  const sp = img('guest_' + g.type + '_' + pose);
  const flip = g.walking && dir === 'side' && g.tx < g.x;
  const sel = selected === g.id;
  if (sel) { ell(x, g.y + 34, 52, 16, '#ffe36e'); }
  else ell(x, g.y + 34, 40, 12, '#00000026');
  if (sp) { ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1); ctx.drawImage(sp, -75, -125, 150, 150); ctx.restore(); }
  else chibi(x, y, { skin: SKIN[g.skin], hair: HAIR[g.hair], style: g.style, outfit: OUTFIT[g.outfit], mood, tudung: g.tudung || 0, closed: g.status === 'serve', shine: g.shine, crown: g.type === 'vip', walking: g.walking });
  if (g.status === 'serve' && TYPES[g.at?.o?.kind]?.staff === false) { ctx.globalAlpha = .5; ell(x, y - 60, 46, 38, '#fff'); ctx.globalAlpha = 1; }
  if (g.sparkle > 0) { ctx.globalAlpha = Math.min(1, g.sparkle); const t = performance.now() / 200; for (let i = 0; i < 5; i++) emoji('✨', x + Math.cos(t + i * 1.3) * 50, y - 60 + Math.sin(t * 1.2 + i) * 40, 18); ctx.globalAlpha = 1; }
  if (g.coffee > 0) emoji('☕', x + 34, y - 18, 22);
  if (T.tag && g.type !== 'makcik') emoji(T.tag, x - 36, y - 100, 20);
  // bubble
  if (g.status === 'leave') { if (g.angry) emoji('💢', x + 20, y - 110, 30); else if (g.happyLeave) emoji('💖', x + 20, y - 110, 30); return; }
  if (g.status === 'wait' || g.status === 'ready' || (g.status === 'walk' && g.at?.k === 'seat')) {
    const n = need(g), bx = x + 34, by = y - 112;
    ctx.save(); if (sel) { ctx.translate(bx, by); ctx.scale(1.15, 1.15); ctx.translate(-bx, -by); }
    rr(bx - 30, by - 26, 60, 52, 18); ctx.fillStyle = g.status === 'ready' ? '#e8f8ee' : '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = mood < .3 ? '#e2546f' : '#e6c2d2'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx - 14, by + 24); ctx.lineTo(bx - 24, by + 38); ctx.lineTo(bx - 2, by + 24); ctx.fillStyle = g.status === 'ready' ? '#e8f8ee' : '#fff'; ctx.fill();
    emoji(g.status === 'ready' ? '⏳' : TYPES[n].icon, bx, by - 3, 28);
    ctx.restore();
    if (g.wish) { emoji('⭐', bx + 30, by - 24, 20); }
    // hearts
    const hearts = Math.ceil(mood * 5);
    for (let i = 0; i < 5; i++) { ctx.globalAlpha = i < hearts ? 1 : .22; emoji(mood < .3 ? '💔' : '❤️', x - 34 + i * 17, y - 156, 14); }
    ctx.globalAlpha = 1;
  }
}

// placeholder chibi (replaced by sprites when available)
function chibi(x, y, o) {
  ctx.save(); ctx.translate(x, y);
  // body
  ctx.beginPath(); ctx.moveTo(-30, 30); ctx.quadraticCurveTo(-32, -6, 0, -8); ctx.quadraticCurveTo(32, -6, 30, 30); ctx.closePath();
  ctx.fillStyle = o.outfit; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#6b4a5c'; ctx.stroke();
  if (o.apron) { rr(-18, -2, 36, 32, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); emoji('✂', 0, 13, 14); }
  if (o.walking) { ell(-12, 32, 8, 6, '#6b4a5c'); ell(12, 32, 8, 6, '#6b4a5c'); }
  // back hair
  const hc = o.hair;
  if (!o.tudung && o.style >= 0) {
    const st = STYLES[o.style];
    ctx.fillStyle = hc; ctx.strokeStyle = '#4b2f3f'; ctx.lineWidth = 3;
    if (st === 'long') { rr(-36, -70, 72, 82, 30); ctx.fill(); ctx.stroke(); }
    if (st === 'pony') { ell(32, -40, 14, 28, hc, '#4b2f3f'); }
    if (st === 'curly') for (let i = 0; i < 9; i++) ell(Math.cos(i / 9 * Math.PI * 2) * 36, -50 + Math.sin(i / 9 * Math.PI * 2) * 30, 16, 16, hc, '#4b2f3f');
  }
  if (o.style === -1 || o.tudungMode) {
    const tc = ['#e6a2b8', '#9ed3c8', '#f2c46d', '#b7a3e3', '#8fb7e6', '#f29a8f'][o.tudung % 6];
    ctx.beginPath(); ctx.moveTo(-40, 10); ctx.quadraticCurveTo(-44, -88, 0, -88); ctx.quadraticCurveTo(44, -88, 40, 10); ctx.quadraticCurveTo(0, 22, -40, 10);
    ctx.fillStyle = tc; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#6b4a5c'; ctx.stroke();
  }
  // head
  ell(0, -46, 30, 32, o.skin, '#9e735c', 2.5);
  // face
  const m = o.mood;
  ctx.fillStyle = '#4b2f3f'; ctx.strokeStyle = '#4b2f3f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  if (o.closed || m > .85) { for (const ex of [-11, 11]) { ctx.beginPath(); ctx.arc(ex, -44, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } }
  else { ell(-11, -44, 3.6, 4.8, '#4b2f3f'); ell(11, -44, 3.6, 4.8, '#4b2f3f'); ell(-10, -46, 1.3, 1.3, '#fff'); ell(12, -46, 1.3, 1.3, '#fff'); }
  if (m < .3) { ctx.beginPath(); ctx.moveTo(-17, -55); ctx.lineTo(-6, -51); ctx.moveTo(17, -55); ctx.lineTo(6, -51); ctx.stroke(); }
  ell(-19, -34, 5, 3, '#f59ab055'); ell(19, -34, 5, 3, '#f59ab055');
  ctx.beginPath();
  if (m >= .6) ctx.arc(0, -34, 7, .15 * Math.PI, .85 * Math.PI); else if (m >= .3) { ctx.moveTo(-5, -30); ctx.lineTo(5, -30); } else ctx.arc(0, -24, 7, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.strokeStyle = '#a24d64'; ctx.stroke();
  // front hair
  if (o.style >= 0) {
    const st = STYLES[o.style]; ctx.fillStyle = hc; ctx.strokeStyle = '#4b2f3f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-32, -44); ctx.quadraticCurveTo(-34, -86, 0, -84); ctx.quadraticCurveTo(34, -86, 32, -44);
    ctx.quadraticCurveTo(st === 'short' ? 20 : 14, -66, 0, -60); ctx.quadraticCurveTo(-18, -68, -32, -44); ctx.fill(); ctx.stroke();
    if (st === 'bob') { rr(-37, -62, 14, 40, 7); ctx.fill(); ctx.stroke(); rr(23, -62, 14, 40, 7); ctx.fill(); ctx.stroke(); }
    if (st === 'bun') ell(0, -92, 17, 15, hc, '#4b2f3f');
    if (o.shine) { ctx.globalAlpha = .7; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(-6, -70, 14, 1.1 * Math.PI, 1.5 * Math.PI); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  if (o.crown) emoji('👑', 0, -98, 24);
  ctx.restore();
}

function drawStaff(m) {
  const moving = Math.hypot(m.tx - m.x, m.ty - m.y) > 2;
  const working = m.cur && m.phase === 'do';
  const kind = m.cur?.k === 'work' ? m.cur.slot.kind : m.cur?.k;
  if (moving) m.dir = dirOf(m.tx - m.x, m.ty - m.y);
  const md = m.dir || 'front';
  const wpose = kind === 'cut' || kind === 'color' ? 'cut' : kind;
  let pose = moving ? md + '_' + (Math.sin(m.walk) > 0 ? 'walk1' : 'walk2') : working ? wpose : m.happy > 0 ? 'happy' : 'front_idle';
  if (!img(m.id + '_' + pose) && working) pose = 'side_idle';
  const bob = moving ? Math.abs(Math.sin(m.walk)) * 7 : working ? Math.sin(performance.now() / 90) * 2 : 0;
  ell(m.x, m.y + 36, 42, 12, '#00000030');
  const sp = img(m.id + '_' + pose);
  ctx.save(); ctx.translate(m.x, m.y - bob); if (m.face < 0 && (!sp || md === 'side' || working)) ctx.scale(-1, 1);
  if (sp) ctx.drawImage(sp, -80, -135, 160, 160);
  else {
    chibi(0, 0, { skin: m.id === 'aiman' ? '#d9a07a' : '#f6cdb1', hair: m.hair, style: m.style, outfit: m.outfit, mood: m.happy > 0 ? 1 : .7, apron: true, walking: moving });
    if (working) emoji(kind === 'cut' ? '✂️' : kind === 'color' ? '🖌️' : kind === 'wash' ? '🧴' : kind === 'pay' ? '🧾' : '☕', 34, -10 + Math.sin(performance.now() / 70) * 6, 26);
  }
  ctx.restore();
  text(m.name, m.x, m.y + 56, 16, m.label);
  // queue badge
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
  const cs = img('st_coffee');
  if (cs) ctx.drawImage(cs, COFFEE.x - 60, COFFEE.y - 88, 120, 120); else {
  rr(COFFEE.x - 34, COFFEE.y - 40, 68, 76, 14); ctx.fillStyle = '#8a5434'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#5c3720'; ctx.stroke();
  emoji('☕', COFFEE.x, COFFEE.y - 2, 32); }
  ctx.globalAlpha = 1;
  if (!on) emoji('🔒', COFFEE.x + 28, COFFEE.y - 40, 18);
  const g = G(selected);
  if (on && g && canMove(g) && !(g.coffee > 0)) { ctx.globalAlpha = .4 + Math.sin(performance.now() / 180) * .2; ell(COFFEE.x, COFFEE.y, 52, 52, null, '#ffe36e', 6); ctx.globalAlpha = 1; }
}

const DECOR = [
  { k: 'd_chandelier', sp: 'deco_chandelier', e: '💡', x: 360, y: 0, w: 120, h: 120, top: true },
  { k: 'd_tv', sp: 'deco_tv', e: '📺', x: 290, y: 95, w: 130, h: 130, top: true },
  { k: 'd_neon', sp: 'deco_neon', e: '💖', x: 430, y: 120, w: 90, h: 90, top: true },
  { k: 'd_aquarium', sp: 'deco_aquarium', e: '🐠', x: 55, y: 700, w: 110, h: 110 },
  { k: 'd_flowers', sp: 'deco_flowers', e: '💐', x: 235, y: 715, w: 90, h: 90 },
  { k: 'd_jukebox', sp: 'deco_jukebox', e: '📻', x: 672, y: 845, w: 90, h: 90 },
];
function drawDecor(top) {
  for (const d of DECOR) {
    if (!!d.top !== top || !upg(d.k)) continue;
    const im = img(d.sp);
    if (im) ctx.drawImage(im, d.x - d.w / 2, d.y, d.w, d.h);
    else { if (!top) ell(d.x, d.y + d.h - 6, d.w * .4, 10, '#00000022'); emoji(d.e, d.x, d.y + d.h / 2, d.h * .6); }
  }
}
function drawSofa() {
  const n = game.seats.length, x0 = game.seats[0].x - 50, w = game.seats[n - 1].x - game.seats[0].x + 100;
  const so = img('sofa_' + game.loc.key), mg = img('deco_magazine'), pl = img('deco_plant');
  if (pl) ctx.drawImage(pl, 4, 560, 90, 90);
  if (so) {
    const sw = w + 30, sh = sw * so.height / so.width;
    ctx.drawImage(so, x0 - 15, 935 - sh, sw, sh);
    if (mg) ctx.drawImage(mg, x0 + w + 8, 845, 80, 80);
    return;
  }
  rr(x0, 856, w, 60, 22); ctx.fillStyle = '#c49ad4'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#8e6aa0'; ctx.stroke();
  rr(x0 - 10, 900, w + 20, 40, 18); ctx.fillStyle = '#d5b0e2'; ctx.fill(); ctx.stroke();
  text('Lounge', x0 + w / 2, 950, 15, '#8e6aa0');
  emoji('📰', x0 + w + 30, 905, 26);
}

function draw() {
  if (!game) return;
  ctx.clearRect(0, 0, W, H);
  drawRoom(game.loc);
  drawSofa();
  drawDecor(true);
  drawDecor(false);
  drawCoffee();
  // depth sort
  const items = [];
  game.slots.forEach(s => items.push({ y: s.y - 1, f: () => drawStation(s) }));
  game.guests.forEach(g => items.push({ y: g.y, f: () => drawGuest(g) }));
  game.staff.forEach(m => items.push({ y: m.y, f: () => drawStaff(m) }));
  items.sort((a, b) => a.y - b.y).forEach(i => i.f());
  drawQueueMarkers();
  // combo meter
  if (game.combo >= 2) { rr(W - 170, 268, 150, 40, 20); ctx.fillStyle = '#e56b93'; ctx.fill(); text('🔥 COMBO x' + game.combo, W - 95, 289, 20, '#fff', 'center', null); }
  for (const f of game.fx) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    if (f.coin) emoji('🪙', f.x, f.y, 22); else text(f.text, f.x, f.y, f.size, f.color);
  }
  ctx.globalAlpha = 1;
  if (drag && drag.moved) { const g = G(drag.id); if (g) { ctx.globalAlpha = .75; chibi(drag.x, drag.y, { skin: SKIN[g.skin], hair: HAIR[g.hair], style: g.style, outfit: OUTFIT[g.outfit], mood: g.patience / g.max, tudung: g.tudung || 0 }); ctx.globalAlpha = 1; } }
  // hint
  const sg = G(selected);
  const anyQ = game.slots.some(s => s.qte && s.qte.res == null && s.state === 'working');
  $('gameHint').textContent = anyQ ? '✂ Tap stesen bila jarum dalam zon HIJAU untuk PERFECT!' : sg && canMove(sg) ? sg.name + ' dipilih → tap ' + TYPES[need(sg)].icon + ' ' + TYPES[need(sg)].name + (upg('coffee') ? ' (atau ☕ kopi)' : '') + (sg.wish ? ' · ⭐ Hajat: ' + (sg.wish === 'perfect' ? 'nak PERFECT' : 'nak cepat & happy') : '') : 'Tap pelanggan, lepas tu tap station. Susun kerja Mira laju-laju!';
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
  const d = Math.abs(qtePos(q) - q.c);
  if (d <= .08) { q.res = 'perfect'; s.t += (s.dur - s.t) * .5; g.tip += 10; g.perfect = true; fx('PERFECT! ✨', s.x, s.y - 175, '#e56b93', 30); sound('perfect'); stat('perfect', 1); }
  else if (d <= .17) { q.res = 'good'; g.tip += 4; s.t += (s.dur - s.t) * .2; fx('Bagus!', s.x, s.y - 175, '#4f9d8c', 24); sound('tap'); }
  else { q.res = 'miss'; fx('Alamak…', s.x, s.y - 175, '#9a7f8f', 20); sound('bad'); }
  return true;
}
function drawQTE(s) {
  const q = s.qte; if (!q || s.state !== 'working') return;
  if (q.res != null) return;
  const w = 130, x0 = s.x - w / 2, y0 = s.y > 500 ? s.y - 128 : s.y - 172;
  rr(x0 - 6, y0 - 6, w + 12, 26, 13); ctx.fillStyle = '#fffffff2'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#e56b93'; ctx.stroke();
  rr(x0, y0, w, 14, 7); ctx.fillStyle = '#f3dde6'; ctx.fill();
  rr(x0 + (q.c - .17) * w, y0, .34 * w, 14, 7); ctx.fillStyle = '#bfe8c9'; ctx.fill();
  rr(x0 + (q.c - .08) * w, y0, .16 * w, 14, 7); ctx.fillStyle = '#5fc48f'; ctx.fill();
  const px = x0 + qtePos(q) * w;
  ctx.fillStyle = '#6a4877'; ctx.beginPath(); ctx.moveTo(px - 8, y0 - 10); ctx.lineTo(px + 8, y0 - 10); ctx.lineTo(px, y0 + 4); ctx.fill();
  text('TAP!', s.x, y0 - 22, 18, '#e56b93');
}
function tapAt(p) {
  const g = guestAt(p), s = slotAt(p), sg = G(selected);
  { const qs = s && s.qte && s.qte.res == null && s.state === 'working' ? s : g && g.at?.k === 'slot' && g.at.o.qte && g.at.o.qte.res == null && g.at.o.state === 'working' ? g.at.o : null; if (qs && resolveQTE(qs)) return; }
  // tapping a station while a guest is selected takes priority if guest belongs elsewhere
  if (sg && canMove(sg) && s && s.guestId !== sg.id && (!g || g === G(s.guestId))) { assign(sg, s); return; }
  if (sg && canMove(sg) && coffeeAt(p)) { giveCoffee(sg); return; }
  if (g) {
    if (g.status === 'ready' && g.at?.k === 'slot' && !g.at.o.queued) { enqueue({ k: 'work', slot: g.at.o }); sound('tap'); return; }
    if (canMove(g)) { selected = selected === g.id ? null : g.id; sound('tap'); return; }
    return;
  }
  if (s) {
    // no selection: auto-pick most impatient waiting guest who needs this station
    if (s.guestId == null) {
      const c = game.guests.filter(x => canMove(x) && need(x) === s.kind).sort((a, b) => a.patience / a.max - b.patience / b.max)[0];
      if (c) assign(c, s); else toast('Tiada pelanggan perlukan ' + TYPES[s.kind].name);
    } else { const sgg = G(s.guestId); if (sgg && sgg.status === 'ready' && !s.queued) { enqueue({ k: 'work', slot: s }); sound('tap'); } }
    return;
  }
  selected = null;
}
cv.addEventListener('pointerdown', e => {
  if (mode !== 'play') return; ac();
  const p = pos(e), g = guestAt(p);
  drag = { id: g && canMove(g) ? g.id : null, sx: p.x, sy: p.y, x: p.x, y: p.y, moved: false, pid: e.pointerId };
  cv.setPointerCapture?.(e.pointerId);
});
cv.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.pid) return;
  const p = pos(e); drag.x = p.x; drag.y = p.y;
  if (drag.id != null && !drag.moved && Math.hypot(p.x - drag.sx, p.y - drag.sy) > 18) { drag.moved = true; selected = drag.id; }
});
cv.addEventListener('pointerup', e => {
  if (!drag || e.pointerId !== drag.pid) return;
  const p = pos(e), d = drag; drag = null;
  if (mode !== 'play') return;
  if (d.moved) {
    const g = G(d.id), s = slotAt(p);
    if (g && s) assign(g, s); else if (g && coffeeAt(p)) giveCoffee(g);
  } else tapAt(p);
});
cv.addEventListener('pointercancel', () => { drag = null; });

// ---------- home ----------
function home() {
  if (SPRITE_LIST.has('logo') && !$('salonLogo')) { const l = new Image(); l.id = 'salonLogo'; l.className = 'salon-logo'; l.alt = 'Cozy Salon'; l.src = 'sprites/logo.webp'; $('homeView').querySelector('.hero-copy').prepend(l); }
  mode = 'home'; game = null; selected = null;
  $('homeView').hidden = false; $('gameView').hidden = true; $('overlay').hidden = true;
  $('walletStat').textContent = state.coins;
  $('starsStat').textContent = Object.values(state.stars).reduce((a, b) => a + (Number(b) || 0), 0);
  $('levelStat').textContent = state.level + ' / ' + LIMIT;
  const L = locOf(state.level);
  $('missionEyebrow').textContent = L.icon + ' ' + L.name.toUpperCase();
  $('missionTitle').textContent = 'Level ' + state.level + ' · ' + levelTitle(state.level);
  $('missionDesc').textContent = 'Layan ' + goalGuests(state.level) + ' daripada ' + totalGuests(state.level) + ' pelanggan.' + (GUESTS.remaja.from === state.level ? ' Pelanggan baru: Remaja ⚡ (cepat bosan)!' : GUESTS.vip.from === state.level ? ' Pelanggan baru: VIP 👑 (tip besar)!' : GUESTS.seleb.from === state.level ? ' Pelanggan baru: Influencer 📸!' : state.level === 3 ? ' Station baru: Hair Dryer 💨!' : state.level === 5 ? ' Station baru: Warna 🎨!' : '');
  artProgress();
  $('soundBtn').textContent = state.muted ? '🔇' : '🔊';
  $('musicBtn').textContent = state.music ? '🎵' : '🔕';
  $('locationRow').innerHTML = LOCS.map(l => {
    const open = state.level >= l.from, cur = l === L;
    const st = Array.from({ length: 15 }, (_, i) => state.stars[l.from + i] || 0).reduce((a, b) => a + b, 0);
    return `<div class="loc ${open ? '' : 'locked'} ${cur ? 'current' : ''}" style="background:${l.wall}"><span class="loc-ic">${open ? l.icon : '🔒'}</span>${l.name}<small>${open ? '⭐ ' + st + '/45' : 'Level ' + l.from}</small></div>`;
  }).join('');
  $('upgradeGrid').innerHTML = CATS.map(([c, title]) => `<h3 class="cat-head">${title}</h3>` + UP.filter(u => u.cat === c).map(u => {
    const lv = upg(u.key), price = priceOf(u), locked = state.level < u.unlock, maxed = lv >= u.max, dis = locked || maxed || state.coins < price;
    const pips = Array.from({ length: u.max }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('');
    const lvTxt = u.tier ? `<span class="tier t${lv}">${TIER[lv]}</span>` : `LEVEL<span class="pips">${pips}</span>`;
    const btn = locked ? '🔒 Level ' + u.unlock : maxed ? 'MAX ✓' : (u.tier ? '⬆ ' + TIER[lv + 1] + ' · ' : '') + '🪙 ' + price;
    return `<article class="upgrade"><div class="upgrade-icon">${u.icon}</div><h3>${u.name}</h3><p>${u.info}</p><div class="upgrade-level">${lvTxt}</div><button class="buy-btn" data-upgrade="${u.key}" ${dis ? 'disabled' : ''}>${btn}</button></article>`;
  }).join('')).join('');
  renderGoals();
  $('versionNote').textContent = 'Versi ' + SALON_VERSION + ' · ' + SALON_DATE + ' · Progress disimpan dalam device ni.';
}
// little animated hero on home screen
const hc = $('heroCanvas'), hx = hc.getContext('2d');
function drawHero() {
  if (mode !== 'home' || !ART_READY) return;
  const sp = img('mira_happy') || img('mira_front_idle');
  hx.setTransform(1, 0, 0, 1, 0, 0); hx.clearRect(0, 0, 300, 300);
  hx.fillStyle = '#ffffff88'; hx.beginPath(); hx.arc(150, 160, 120, 0, Math.PI * 2); hx.fill();
  const b = Math.sin(performance.now() / 300) * 6;
  if (sp) hx.drawImage(sp, 30, 30 + b, 240, 240);
  else { hx.save(); hx.translate(150, 190 + b); hx.scale(1.8, 1.8); swapCtx(hx, () => chibi(0, 0, { skin: '#f6cdb1', hair: '#7a3b52', style: 3, outfit: '#e56b93', mood: 1, apron: true })); hx.restore(); }
  hx.font = '30px system-ui'; hx.textAlign = 'center'; hx.textBaseline = 'middle';
  const t = performance.now() / 500; hx.fillText('✨', 150 + Math.cos(t) * 110, 140 + Math.sin(t) * 80); hx.fillText('✂️', 150 - Math.cos(t) * 110, 160 - Math.sin(t) * 70);
}
function swapCtx(c, fn) { const old = ctx; ctx = c; try { fn(); } finally { ctx = old; } }

// ---------- buttons ----------
$('goalsBox').addEventListener('click', e => {
  const b = e.target.closest('.claim-btn'); if (!b || b.disabled) return;
  if (b.dataset.daily != null) { const q = dailyToday().goals[+b.dataset.daily]; if (!q || q.claimed || q.prog < q.n) return; q.claimed = true; state.coins += Math.round(q.reward); toast('Misi siap! +🪙' + Math.round(q.reward)); }
  if (b.dataset.ach) { const a = ACH.find(x => x[0] === b.dataset.ach); if (!a || state.ach[a[0]] || !a[3]()) return; state.ach[a[0]] = 1; state.coins += a[4]; toast(a[1] + '! +🪙' + a[4]); }
  save(); sound('win'); home();
});
$('playBtn').addEventListener('click', () => { if (ART_READY) begin(state.level); });
addEventListener('pointerdown', () => musicUpdate(), { once: false, passive: true });
$('musicBtn').addEventListener('click', () => { state.music = !state.music; save(); $('musicBtn').textContent = state.music ? '🎵' : '🔕'; musicUpdate(); });
$('pauseBtn').addEventListener('click', pause);
$('soundBtn').addEventListener('click', () => { state.muted = !state.muted; save(); $('soundBtn').textContent = state.muted ? '🔇' : '🔊'; if (!state.muted) sound('tap'); });
$('upgradeGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-upgrade]'); if (!b || mode !== 'home') return;
  const u = UP.find(x => x.key === b.dataset.upgrade); if (!u || state.level < u.unlock) return;
  const lv = upg(u.key), price = priceOf(u); if (lv >= u.max || state.coins < price) return;
  state.coins -= price; state.upgrades[u.key]++; save(); home(); sound('coin'); toast('Upgrade: ' + u.name + '!');
});
function pause() { if (mode !== 'play') return; mode = 'pause'; musicUpdate(); modal('☕', 'Rehat Jap', 'Pelanggan tunggu dengan sabar. Sambung bila dah ready.', [['▶ SAMBUNG', 'resume'], [state.music ? '🎵 Muzik: ON' : '🔕 Muzik: OFF', 'music'], ['↻ ULANG LEVEL', 'restart'], ['🏠 KELUAR', 'home']]); }
$('modalActions').addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b) return; const a = b.dataset.action;
  if (a === 'music') { state.music = !state.music; save(); b.textContent = state.music ? '🎵 Muzik: ON' : '🔕 Muzik: OFF'; return; }
  if (a === 'resume' && mode === 'pause') { mode = 'play'; $('overlay').hidden = true; last = performance.now(); musicUpdate(); }
  else if (a === 'home') { home(); window.scrollTo(0, 0); }
  else if (a === 'retry' || a === 'restart') { if (game) begin(game.level); }
  else if (a === 'next') begin(state.level);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'play') pause(); musicUpdate(); });
addEventListener('resize', () => { if (game) resize(); });

// ---------- loop ----------
function frame(t) {
  const dt = Math.min(.1, Math.max(0, (t - last) / 1000)); last = t;
  try { update(dt); if (game) draw(); else drawHero(); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}
// debug hook for testing
window.__salon = { get game() { return game; }, get state() { return state; }, begin, home };
home(); requestAnimationFrame(frame);
})();
