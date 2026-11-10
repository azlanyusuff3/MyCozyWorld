'use strict';
/* Mamak Rush — game kedai mamak gaya "sushi bar". Semua art guna emoji dulu;
   sprite dalam sprites/list.json (nama tanpa .webp) akan ganti emoji secara automatik. */
const GAME_VERSION = 'v1';
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
  ['bg_dinding', 'bg_lantai', 'kaunter', 'dulang'].forEach(n => { if (SPR[n]) { b.add('has-' + n); set('--' + n, SPR[n]); } });
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
  tosai: { name: 'Tosai', e: '🥞', price: 4 }
};
// mod yang boleh diminta untuk setiap menu
const ITEM_MODS = { teh: ['kaw', 'kurang', 'ikat'], milo: ['kurang', 'ikat', 'dino'], roti: ['garing'], rotitelur: ['garing'] };
const CUSTS = [
  { k: 'jamal', e: '🧑🏽', n: 'Abang Jamal' }, { k: 'lina', e: '🧕🏽', n: 'Kak Lina' }, { k: 'rahman', e: '👴🏽', n: 'Pakcik Rahman' },
  { k: 'amir', e: '👦🏽', n: 'Adik Amir' }, { k: 'lim', e: '👨🏻', n: 'Uncle Lim' }, { k: 'devi', e: '👩🏾', n: 'Aunty Devi' },
  { k: 'raju', e: '👷🏾', n: 'Abang Raju' }, { k: 'kiah', e: '👵🏽', n: 'Makcik Kiah' }
];
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
  9: { ic: '🥤', t: 'Menu baru: Milo ais', d: 'Pilih Milo, lepas tu swipe atas-bawah untuk goncang. Lepas jari bila jarum kat hijau. Lebih goncang, melimpah!' },
  10: { ic: '🍬', t: 'Order custom: "Kurang manis"', d: 'Tekan butang 🍬 Kurang sebelum buat air. Air biasa tak boleh bagi pada orang yang nak kurang manis (dan sebaliknya)!' },
  11: { ic: '🍳', t: 'Menu baru: Roti telur', d: 'Pilih Telur kat tawa, tebar macam biasa, lepas tu tap untuk pecah telur.' },
  12: { ic: '🔥', t: 'Order custom: "Roti garing"', d: 'Biar roti lama sikit atas tawa. Ambik masa bar masuk zon merah (sebelum hangus)!' },
  13: { ic: '🍝', t: 'Menu baru: Mee goreng mamak', d: 'Pilih Mee kat kuali. Separuh jalan, tap <b>KACAU!</b> cepat, kalau tak dia melekat hangus.' },
  14: { ic: '🛍️', t: 'Order custom: "Ikat tepi"', d: 'Air bungkus dalam plastik. Tekan 🛍️ Ikat sebelum buat air.' },
  15: { ic: '🥙', t: 'Menu baru: Murtabak', d: 'Paling mahal! Tebar, pecah 2 telur, dan tunggu lama sikit.' },
  16: { ic: '🦕', t: 'Order custom: "Milo Dinosaur"', d: 'Tekan 🦕 Dino sebelum goncang Milo, tabur serbuk Milo lebih kat atas.' },
  17: { ic: '🥞', t: 'Menu baru: Tosai', d: 'Pilih Tosai, swipe bulat-bulat atas tawa untuk ratakan adunan.' }
};
const feat = (d, f) => d >= { maggi: 2, tambah: 3, sabar: 4, grab: 5, cat: 6, nasi: 7, kaw: 8, milo: 9, kurang: 10, telur: 11, garing: 12, mee: 13, ikat: 14, murtabak: 15, dino: 16, tosai: 17 }[f];
const UPS = [
  { k: 'tables', ic: '🪑', n: 'Meja tambahan', d: 'Lebih ramai pelanggan serentak', cost: [40, 120], max: 2 },
  { k: 'fan', ic: '🌀', n: 'Kipas siling', d: 'Pelanggan lebih sabar (-20% cepat marah)', cost: [35], max: 1 },
  { k: 'teko', ic: '🫖', n: 'Teko besar', d: 'Zon hijau teh tarik lebih lebar', cost: [30, 90], max: 2 },
  { k: 'kuali', ic: '🍳', n: 'Kuali kedua', d: 'Masak 2 kuali serentak (Maggi/Mee)', cost: [60], max: 1, need: 2 },
  { k: 'tawa', ic: '🔥', n: 'Tawa panas', d: 'Roti canai masak lebih laju', cost: [45], max: 1 },
  { k: 'tray', ic: '🍽️', n: 'Dulang besar', d: 'Dulang muat 5 makanan', cost: [40], max: 1 },
  { k: 'tv', ic: '📺', n: 'TV bola', d: 'Tip +25% (pelanggan seronok tengok bola)', cost: [80], max: 1 },
  { k: 'siti', ic: '🧕🏻', spr: 'staff_siti', staff: 1, wage: 12, n: 'Upah Kak Siti (pelayan)', d: 'Auto tenangkan pelanggan tak sabar & halau Oyen', cost: [50], max: 1, need: 6 },
  { k: 'anne', ic: '👨🏾‍🍳', spr: 'staff_anne', staff: 1, wage: 15, n: 'Upah Anne (tukang teh)', d: 'Auto buat teh tarik biasa (bukan kaw/kurang/ikat)', cost: [70], max: 1, need: 8 },
  { k: 'ravi', ic: '🧑🏾‍🍳', spr: 'staff_ravi', staff: 1, wage: 20, n: 'Upah Ravi (tukang roti)', d: 'Auto tebar roti kosong bila ada order', cost: [90], max: 1, need: 10 }
];
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
P.reg = P.reg || {};
const up = k => P.up[k] || 0;
const save = () => store.set('save', P);
const target = d => Math.round(25 + d * 12 + d * d);

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
  $('#playBtn').textContent = '▶ BUKA KEDAI · HARI ' + P.day;
  $('#menuArt').innerHTML = `<span class="av">${ico('item_teh', '☕')}</span><span class="av">${ico('cust_jamal', '🧑🏽')}</span><span class="av">${ico('item_roti', '🫓')}</span>`;
  const n = Math.max(7, Math.ceil(P.day / 7) * 7);
  $('#daysList').innerHTML = Array.from({ length: n }, (_, i) => {
    const d = i + 1, st = P.stars[d] || 0;
    return `<button type="button" data-d="${d}" class="${d > P.day ? 'lock' : d === P.day ? 'cur' : ''}">${d > P.day ? '🔒' : 'H' + d}<small>${'★'.repeat(st) || (d <= P.day ? '·' : '')}</small></button>`;
  }).join('');
}
$('#daysList').onclick = e => { const b = e.target.closest('button'); if (!b || b.classList.contains('lock')) return; startDay(+b.dataset.d); };
$('#playBtn').onclick = () => startDay(P.day);
$('#shopBtn').onclick = () => openShop(0);
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set('sound', soundOn); renderMenu(); };
$('#resetBtn').onclick = () => { if (confirmReset()) { Object.assign(P, { day: 1, coins: 0, stars: {}, up: {}, reg: {} }); save(); renderMenu(); } };
let resetArm = 0;
function confirmReset() { if (Date.now() - resetArm < 3000) return true; resetArm = Date.now(); $('#resetBtn').textContent = 'Tap sekali lagi untuk reset'; setTimeout(() => $('#resetBtn').textContent = 'Reset progress', 3000); return false; }

/* ---------- Modal ---------- */
function modal(html) { $('#modalCard').classList.remove('shop'); $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }

function openShop(nextDay) {
  const rows = UPS.map(u => {
    const lv = up(u.k), max = lv >= u.max, locked = u.need && P.day < u.need, cost = u.cost[lv];
    return `<div class="up ${max ? 'max' : ''}"><span class="ic av">${u.spr ? ico(u.spr, u.ic) : u.ic}</span><div><b>${u.n}${u.max > 1 ? ` (${lv}/${u.max})` : ''}</b><small>${locked ? 'Buka lepas Hari ' + u.need : u.d}${u.staff ? ` · <b>gaji ${rm(u.wage)}/hari</b>` : ''}</small></div>
      <button type="button" data-k="${u.k}" ${max || locked || P.coins < cost ? 'disabled' : ''}>${max ? (u.staff ? 'KERJA ✓' : 'ADA ✓') : rm(cost)}</button></div>`;
  }).join('');
  const sc = $('#modalCard').classList.contains('shop') ? $('#modalCard').scrollTop : 0;
  modal(`<div class="sheet-head"><h2>🛠️ Upgrade</h2><span class="coins">💰 ${rm(P.coins)}</span><button class="x-btn" id="shopX" type="button" aria-label="Tutup">✕</button></div>${rows}
    <div class="sheet-foot"><button class="btn gold" id="shopDone" type="button">${nextDay ? '▶ HARI ' + nextDay : 'Siap'}</button></div>`);
  $('#modalCard').classList.add('shop'); $('#modalCard').scrollTop = sc;
  $('#modalCard').onclick = e => {
    if (e.target.closest('#shopX')) { closeModal(); if (nextDay) toMenu(); return; }
    const b = e.target.closest('button[data-k]');
    if (b) { const u = UPS.find(x => x.k === b.dataset.k), c = u.cost[up(u.k)]; if (P.coins >= c) { P.coins -= c; P.up[u.k] = up(u.k) + 1; save(); SFX.coin(); openShop(nextDay); renderMenu(); } return; }
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
    spawnT: 1.2, grabT: rand(15, 25), catT: rand(14, 22), uid: 0, ev: eventFor(d), datukDone: false, azan: false, regToday: [], anne: { t: 0, busy: false }, sitiT: 0,
    roti: { s: 'idle', t: 0, prog: 0, k: 'roti', eggs: 0 },
    teh: { s: 'idle', lvl: 0, hold: false, dir: 1, prog: 0 }, chips: {},
    maggi: Array.from({ length: feat(d, 'maggi') ? 1 + up('kuali') : 1 }, () => ({ s: 'idle', t: 0, k: 'maggi' })),
    nasi: { stock: 6, s: 'idle', t: 0 }
  };
  $('#menu').classList.add('hidden'); $('#game').classList.remove('hidden');
  $('#tables').className = 'tables n' + nTables;
  $('#tv').classList.toggle('hidden', !up('tv')); $('#fan').classList.toggle('hidden', !up('fan'));
  $('#menuBoard').textContent = menuItems().map(k => ITEMS[k].e).join(' ');
  $('#notifs').innerHTML = '';
  const fl = document.querySelector('.shop-floor'); fl.classList.toggle('rain', R.ev === 'hujan'); fl.classList.toggle('senja', R.ev === 'berbuka');
  if (R.ev === 'bola') $('#tv').classList.remove('hidden');
  if (R.ev === 'hujan' && feat(d, 'grab')) R.grabT = 3;
  if (R.ev === 'berbuka') R.spawnT = 999;
  renderStations(); renderTables(); renderTray(); renderSide(); renderStaff(); hud();
  const u = UNLOCK[d];
  modal(`<h2>Hari ${d}</h2>${u ? `<div class="new-box"><div class="ic">${u.ic}</div><b>${u.t}</b><span>${u.d}</span></div>` : (R.ev ? '' : '<p>Pelanggan makin ramai. Gerak laju!</p>')}${R.ev ? `<div class="new-box ev"><div class="ic">${EVENTS[R.ev].ic}</div><b>${u ? 'Event: ' : ''}${EVENTS[R.ev].t}</b><span>${EVENTS[R.ev].d}</span></div>` : ''}
    <p>Sasaran hari ni: <b>${rm(target(d))}</b></p><button class="btn gold" id="goBtn" type="button">▶ JOM BUKA!</button>`);
  $('#modalCard').onclick = e => { if (e.target.id === 'goBtn') { closeModal(); R.paused = false; SFX.bell(); lastT = performance.now(); } };
  cancelAnimationFrame(raf); lastT = performance.now(); raf = requestAnimationFrame(loop);
}
const menuItems = () => menuItemsFor(R.day);
const menuItemsFor = d => ['roti', 'teh', ...[['maggi', 'maggi'], ['nasi', 'nasi'], ['milo', 'milo'], ['telur', 'rotitelur'], ['mee', 'mee'], ['murtabak', 'murtabak'], ['tosai', 'tosai']].filter(([f]) => feat(d, f)).map(x => x[1])];

$('#pauseBtn').onclick = () => {
  if (!R || R.over) return; R.paused = true;
  modal(`<h2>Rehat jap ☕</h2><button class="btn gold" id="resBtn" type="button">▶ Sambung</button><button class="btn" id="quitBtn" type="button">Keluar ke menu</button>`);
  $('#modalCard').onclick = e => {
    if (e.target.id === 'resBtn') { closeModal(); R.paused = false; lastT = performance.now(); }
    if (e.target.id === 'quitBtn') { R.over = true; closeModal(); toMenu(); }
  };
};
document.addEventListener('visibilitychange', () => { if (document.hidden && R && !R.over && !R.paused) $('#pauseBtn').onclick(); });
function toMenu() { cancelAnimationFrame(raf); $('#game').classList.add('hidden'); $('#menu').classList.remove('hidden'); renderMenu(); }

/* ---------- Pelanggan ---------- */
function makeOrder(n, vip) {
  const opts = menuItems(), its = [];
  for (let i = 0; i < n; i++) {
    const k = pick(opts), m = {}, avail = (ITEM_MODS[k] || []).filter(x => feat(R.day, x));
    if (avail.length && (vip || Math.random() < .45)) { m[pick(avail)] = true; if (R.day >= 15 && Math.random() < .25) m[pick(avail)] = true; }
    if (m.dino && m.kurang) delete m.kurang;
    its.push({ k, m, done: false });
  }
  return its;
}
function patMax() { return Math.max(16, 34 - R.day * 1.1); }
function spawnCustomer(at, vip) {
  const free = R.tables.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  if (!free.length) return;
  const used = R.tables.filter(Boolean).map(c => c.who.k);
  const d = R.day, r = Math.random();
  const regPick = !vip && d >= 6 && Math.random() < .3 ? Object.keys(REGS).filter(k => !used.includes(k) && !R.regToday.includes(k) && regOrder(k).length) : [];
  const regK = regPick.length ? pick(regPick) : null;
  const who = vip ? DATUK : regK ? CUSTS.find(c => c.k === regK) : pick(CUSTS.filter(c => !used.includes(c.k)));
  const n = vip ? 3 : d >= 8 && r < .15 ? 3 : r < Math.min(.65, .12 + d * .08) ? 2 : 1;
  const c = { id: ++R.uid, who, items: regK ? regOrder(regK) : makeOrder(n, vip), reg: regK, pat: patMax() * (vip ? .75 : 1), max: patMax() * (vip ? .75 : 1), angry: false, calmed: false, asked: vip, vip };
  if (regK) {
    R.regToday.push(regK); const st = P.reg[regK] = P.reg[regK] || { h: 0, seen: false };
    c.hidden = st.seen; c.asked = true;
    if (!st.seen) { st.seen = true; save(); notify(`⭐ <b>${who.n}</b> nak jadi pelanggan tetap! Ingat order dia: ${c.items.map(i => ITEMS[i.k].name.toLowerCase() + (Object.keys(i.m).length ? ' (' + Object.keys(i.m).map(x => MOD_TXT[x]).join(', ') + ')' : '')).join(' + ')}`, 'info'); }
    else notify(`⭐ <b>${who.n}:</b> ${pick(['Macam biasa ya!', 'Biasa bos!', 'Yang selalu tu, ya!'])} <small>(${'❤️'.repeat(Math.min(5, st.h)) || '🤍'})</small>`, 'info');
  }
  if (vip) { notify('🎩 <b>Datuk Seri</b> dah sampai! Layan baik-baik, tip besar menanti!', 'info'); SFX.bell(); }
  if (!vip && !regK && feat(d, 'sabar') && Math.random() < Math.min(.45, .2 + (d - 4) * .04)) {
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
  const tipRate = (.15 + .6 * (c.pat / c.max)) * (up('tv') ? 1.25 : 1) * (c.grab ? (R.ev === 'hujan' ? 2.3 : 1.8) : 1);
  const pay = Math.round((sum + Math.round(sum * tipRate) + (c.perf || 0)) * (c.vip ? 2.5 : 1) * (c.reg ? 1.2 + Math.min(10, (P.reg[c.reg] || {}).h || 0) * .05 : 1));
  if (c.reg) {
    const st = P.reg[c.reg]; st.h++; save();
    const sl = REGS[c.reg].story, idx = [2, 5, 9].indexOf(st.h);
    setTimeout(() => R && notify(idx >= 0 ? `💬 ${sl[idx]}` : `❤️ ${c.who.n} makin sayang kedai ni! (${st.h})`, 'good'), 700);
  }
  if (c.vip) { notify(`🎩 Datuk puas hati! Bayar ${rm(pay)}!`, 'good'); SFX.perfect(); }
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
  if (angry) { R.lost++; SFX.bad(); buzz([30, 40, 30]); notify(`😠 <b>${c.who.n}</b> ${pick(['blah... lambat sangat!', 'merajuk, tak jadi makan!', 'kata: "Kedai lain lagi laju!"'])}`, 'bad'); emote(el, '💢'); }
  if (el) el.classList.add('leave');
  setTimeout(() => {
    if (!R) return;
    if (c.grab) { if (R.grab === c) R.grab = null; renderSide(); }
    else { const i = R.tables.indexOf(c); if (i >= 0) R.tables[i] = null; renderTables(); }
  }, 450);
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
  if (wantsK(item.k)) notify(`🤔 Ada yang order ${ITEMS[item.k].name.toLowerCase()}, tapi bukan macam ni. Tengok tag dia!`, 'bad');
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
function orderHTML(c) { return `<div class="order${c.reg ? ' reg' : ''}">${c.hidden ? '<i class="biasa">macam biasa</i>' : ''}${c.items.map(i => c.hidden && !i.done ? '<span class="it"><span class="av q">❓</span></span>' : `<span class="it ${i.done ? 'done' : ''}"><span class="av">${ico('item_' + i.k, ITEMS[i.k].e)}</span>${tagHTML(i.m)}</span>`).join('')}<div class="pat"><b class="${patCls(c)}" style="width:${c.pat / c.max * 100}%"></b></div></div>`; }
function patCls(c) { const f = c.pat / c.max; return f > .5 ? '' : f > .25 ? 'mid' : 'low'; }
function fitTables() {
  const box = $('#tables'); if (!box || !R) return;
  const n = R.tables.length, rows = n === 5 ? 2 : Math.ceil(n / 2), h = box.clientHeight - 30;
  if (h > 50) {
    const th = Math.max(110, Math.min(240, h / rows - 6)); box.style.setProperty('--th', th + 'px');
    const t = box.querySelector('.table'); if (t) { const w = t.clientWidth * (n === 5 ? 1.12 : 1.06); box.style.setProperty('--mh', Math.min(th * .66, w * .75) + 'px'); }
  }
}
addEventListener('resize', fitTables);
function renderTables() {
  if (!R) return;
  requestAnimationFrame(fitTables);
  $('#tables').innerHTML = R.tables.map((c, ti) => `<div class="table${SPR.meja ? ' spr' : ''}" style="z-index:${ti + 1}"><span class="shadow"></span>${SPR.meja ? `<img class="meja" src="${SPR.meja}" alt="">` : '<span class="top"></span><span class="stool l"></span><span class="stool r"></span>'}${c ? `
    <div class="cust ${c.angry ? 'angry' : ''}" data-id="${c.id}">${orderHTML(c)}<span class="av">${ico('cust_' + c.who.k, c.who.e)}</span>${c.angry ? '<span class="calm-tag">TAP: Sabar!</span>' : ''}</div>` : ''}</div>`).join('');
}
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

/* ---------- Stesen ---------- */
const ROTI_KINDS = [
  { k: 'roti', f: null, n: 'Kosong', e: '🫓', eggs: 0, cook: () => up('tawa') ? 2.4 : 3.5 },
  { k: 'rotitelur', f: 'telur', n: 'Telur', e: '🍳', eggs: 1, cook: () => up('tawa') ? 3 : 4.2 },
  { k: 'murtabak', f: 'murtabak', n: 'Murtabak', e: '🥙', eggs: 2, cook: () => up('tawa') ? 4.5 : 6 },
  { k: 'tosai', f: 'tosai', n: 'Tosai', e: '🥞', eggs: 0, circle: true, cook: () => up('tawa') ? 2.2 : 3 }
];
const READY_WIN = 5, MAGGI_COOK = 4.2, MEE_COOK = 5.5, NASI_COOK = 5, GARING_AT = .4;
const tehZone = () => { const w = .14 + up('teko') * .06; return [.72 - w / 2, .72 + w / 2]; };
const MILO_ZONE = [.75, 1.1];
const rotiOpts = () => ROTI_KINDS.filter(x => !x.f || feat(R.day, x.f));
const panOpts = () => feat(R.day, 'mee') ? ['maggi', 'mee'] : ['maggi'];

function renderStations() {
  if (!R) return;
  const d = R.day, h = [];
  h.push(`<div class="st" id="stRoti"><span class="lbl">TAWA ROTI</span><span class="big av"></span><span class="hint"></span><div class="choose"></div><span class="bar"><b></b><em class="gz"></em></span></div>`);
  const chips = [feat(d, 'kurang') && ['kurang', '🍬'], feat(d, 'ikat') && ['ikat', '🛍️'], feat(d, 'dino') && ['dino', '🦕']].filter(Boolean);
  h.push(`<div class="st" id="stTeh"><span class="lbl">${feat(d, 'milo') ? 'AIR' : 'TEH TARIK'}</span><span class="teh-stream"></span><span class="big av"></span><span class="hint"></span><div class="choose"></div>
    <div class="chips">${chips.map(([k, t]) => `<button type="button" class="chip" data-chip="${k}" title="${MOD_TXT[k]}">${t}</button>`).join('')}</div><div class="meter"><span class="zone"></span><span class="lvl"></span></div></div>`);
  if (feat(d, 'maggi')) h.push(`<div class="st sub" id="stMaggi"><span class="lbl">${feat(d, 'mee') ? 'KUALI' : 'MAGGI'}</span>${R.maggi.map((_, i) => `<div class="pan" data-i="${i}"><span class="big av"></span><span class="hint"></span><div class="choose"></div><span class="bar"><b></b></span></div>`).join('')}</div>`);
  if (feat(d, 'nasi')) h.push(`<div class="st" id="stNasi"><span class="lbl">NASI LEMAK</span><span class="cnt"></span><span class="big av"></span><span class="hint"></span><span class="bar"><b></b></span></div>`);
  $('#stations').innerHTML = h.join('');
  $('#stTeh').classList.toggle('has-tarik', !!SPR.st_tarik);
  $('#stTeh').classList.toggle('has-chips', chips.length > 0);
  R.chooseKeys = {};
  bindStations(); drawStations();
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
  const r = R.roti, rEl = $('#stRoti'), kind = ROTI_KINDS.find(x => x.k === r.k) || ROTI_KINDS[0], opts = rotiOpts();
  setChoose(rEl, r.s === 'idle' && opts.length > 1 ? 'pick' : '', r.s === 'idle' && opts.length > 1 ? opts.map(o => `<button type="button" data-roti="${o.k}"><span class="av">${ico('item_' + o.k, o.e)}</span>${o.n}</button>`).join('') : '');
  rEl.querySelector('.big').style.transform = '';
  const gz = rEl.querySelector('.gz'); gz.style.display = r.s === 'ready' && feat(R.day, 'garing') && (r.k === 'roti' || r.k === 'rotitelur') ? 'block' : 'none';
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

  // AIR
  const t = R.teh, tEl = $('#stTeh'), milo = feat(R.day, 'milo');
  tEl.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', !!R.chips[c.dataset.chip]));
  const z = t.s === 'shake' ? MILO_ZONE.map(v => v / 1.25) : tehZone(), zone = tEl.querySelector('.zone');
  zone.style.bottom = (z[0] * 100) + '%'; zone.style.height = ((z[1] - z[0]) * 100) + '%';
  tEl.querySelector('.meter').style.visibility = t.s === 'idle' && milo ? 'hidden' : 'visible';
  tEl.querySelector('.lvl').style.height = ((t.s === 'shake' ? t.prog / 1.25 : t.lvl) * 100) + '%';
  tEl.querySelector('.teh-stream').style.height = t.hold ? (20 + t.lvl * 60) + 'px' : '0';
  setChoose(tEl, t.s === 'idle' && milo ? 'pick' : '', t.s === 'idle' && milo ? `<button type="button" data-air="teh"><span class="av">${ico('item_teh', '☕')}</span>Teh<small>tahan</small></button><button type="button" data-air="milo"><span class="av">${ico('item_milo', '🥤')}</span>Milo<small>goncang</small></button>` : '');
  const setTxt = (e, v) => { if (e._v !== v) { e._v = v; e.innerHTML = v; } };
  if (t.s === 'idle') { setTxt(tEl.querySelector('.big'), milo ? '' : ico('st_teko', '🫖')); setTxt(tEl.querySelector('.hint'), milo ? '' : 'Tahan, lepas kat hijau'); }
  else if (t.s === 'shake') { setTxt(tEl.querySelector('.big'), ico('st_milo', '🥤')); setTxt(tEl.querySelector('.hint'), '↕️ Swipe atas-bawah, lepas kat hijau'); }

  // KUALI
  if (feat(R.day, 'maggi')) R.maggi.forEach((m, i) => {
    const el = document.querySelector(`#stMaggi .pan[data-i="${i}"]`); if (!el) return;
    const po = panOpts(), b = el.querySelector('.bar b'), mee = m.k === 'mee';
    setChoose(el, m.s === 'idle' && po.length > 1 ? 'pick' : '', m.s === 'idle' && po.length > 1 ? `<button type="button" data-pan="maggi"><span class="av">${ico('item_maggi', '🍜')}</span>Maggi</button><button type="button" data-pan="mee"><span class="av">${ico('item_mee', '🍝')}</span>Mee</button>` : '');
    el.classList.toggle('ready', m.s === 'ready' || m.s === 'stir'); el.classList.toggle('burn', m.s === 'burn');
    const pb = el.querySelector('.big'), pv = m.s === 'idle' ? (po.length > 1 ? '' : ico('st_kuali', '🍳')) : m.s === 'burn' ? ico('st_hangus_maggi', '🍜') : m.s === 'ready' ? ico('item_' + m.k, ITEMS[m.k].e) : ico('st_kuali_masak', '🥘');
    if (pb._v !== pv) { pb._v = pv; pb.innerHTML = pv; }
    const ph = el.querySelector('.hint'), hv = m.s === 'idle' ? (po.length > 1 ? '' : 'Tap masak') : m.s === 'cook' ? (mee ? 'Mee...' : 'Goreng...') : m.s === 'stir' ? 'KACAU!' : m.s === 'ready' ? '✨ Ambik!' : '🔥 Buang';
    if (ph._v !== hv) { ph._v = hv; ph.innerHTML = hv; }
    b.style.width = (m.s === 'cook' ? 1 - m.t / (mee ? MEE_COOK : MAGGI_COOK) : m.s === 'ready' ? m.t / READY_WIN : m.s === 'stir' ? m.st / 1.6 : 0) * 100 + '%';
  });
  if (feat(R.day, 'nasi')) {
    const n = R.nasi, el = $('#stNasi');
    el.querySelector('.cnt').textContent = n.s === 'cook' ? '...' : n.stock + ' bungkus';
    setSt(el, n.s === 'cook' ? ico('st_periuk', '♨️') : ico('item_nasi', '🍛'), n.s === 'cook' ? 'Masak nasi...' : n.stock ? 'Tap ambik' : 'Habis! Tap masak', n.s === 'cook' ? 1 - n.t / NASI_COOK : 0);
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
  const rEl = $('#stRoti'); let lastX = null, lastY = null;
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
      if (!feat(R.day, 'milo')) { startTeh(e); return; }
      const b = e.target.closest('[data-air]'); if (!b) return;
      if (b.dataset.air === 'teh') { startTeh(e); drawStations(); return; }
      t.s = 'shake'; t.prog = 0; SFX.tap(); drawStations(); return;
    }
    if (t.s === 'shake') { lastShakeY = e.clientY; tEl.setPointerCapture(e.pointerId); }
  });
  tEl.addEventListener('pointermove', e => {
    const t = R && R.teh; if (!t || t.s !== 'shake' || lastShakeY == null) return;
    t.prog += Math.abs(e.clientY - lastShakeY) / 700; lastShakeY = e.clientY;
    if (Math.random() < .15) tone(500 + Math.random() * 300, .03, 'triangle', .05);
    if (t.prog > 1.25) { t.prog = 0; t.s = 'idle'; lastShakeY = null; SFX.burn(); notify('🥤 Alamak, Milo melimpah! Goncang perlahan sikit.', 'bad'); }
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
    if (!ok) { notify('☕ Tarik tak cukup tinggi, cuba lagi!', 'bad'); t.lvl = 0; drawStations(); return; }
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
      const b = e.target.closest('[data-pan]'), k = panOpts().length > 1 ? (b && b.dataset.pan) : 'maggi'; if (!k) return;
      m.k = k; m.s = 'cook'; m.t = k === 'mee' ? MEE_COOK : MAGGI_COOK; m.stir = false; tone(200, .3, 'sawtooth', .04, 260);
    }
    else if (m.s === 'stir') { m.stir = true; m.s = 'cook'; tone(700, .08, 'triangle', .1); emote(p, '🥄'); }
    else if (m.s === 'ready') { if (deliver({ k: m.k, m: {} }, p)) m.s = 'idle'; }
    else if (m.s === 'burn') m.s = 'idle';
    drawStations();
  });
  const nEl = $('#stNasi');
  if (nEl) nEl.addEventListener('pointerdown', () => {
    if (!live()) return; const n = R.nasi;
    if (n.s === 'cook') return;
    if (n.stock > 0) { if (deliver({ k: 'nasi', m: {} }, nEl)) n.stock--; }
    else { n.s = 'cook'; n.t = NASI_COOK; SFX.tap(); }
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
  if (up('ravi') && R.roti.s === 'idle' && needers({ k: 'roti', m: {} }).length + needers({ k: 'roti', m: { garing: true } }).length > R.tray.filter(x => x.k === 'roti').length) {
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
  else if (r.s === 'ready' && (r.t -= dt) <= 0) { r.s = 'burn'; SFX.burn(); notify('🔥 Alamak, roti hangus!', 'bad'); }
  const t = R.teh;
  if (t.hold) { const sp = 1 / (1.25 + up('teko') * .2); t.lvl += t.dir * dt * sp; if (t.lvl >= 1) { t.lvl = 1; t.dir = -1; } if (t.lvl <= 0) { t.lvl = 0; t.dir = 1; } }
  R.maggi.forEach(m => {
    if (m.s === 'cook') {
      m.t -= dt;
      if (m.k === 'mee' && !m.stir && m.t <= MEE_COOK / 2) { m.s = 'stir'; m.st = 1.6; SFX.notif(); }
      else if (m.t <= 0) { m.s = 'ready'; m.t = READY_WIN; SFX.ready(); }
    }
    else if (m.s === 'stir' && (m.st -= dt) <= 0) { m.s = 'burn'; SFX.burn(); notify('🔥 Mee tak kacau, melekat hangus!', 'bad'); }
    else if (m.s === 'ready' && (m.t -= dt) <= 0) { m.s = 'burn'; SFX.burn(); notify(`🔥 ${m.k === 'mee' ? 'Mee' : 'Maggi'} hangus! Bau satu kedai...`, 'bad'); }
  });
  const n = R.nasi; if (n.s === 'cook' && (n.t -= dt) <= 0) { n.s = 'idle'; n.stock = 6; SFX.ready(); }
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
  if (R.cat) { R.cat.t -= dt; if (R.cat.t <= 0) { R.cat = null; if (R.tray.length) { const s = R.tray.splice(Math.floor(Math.random() * R.tray.length), 1)[0]; notify(`🐈 Alamak! Oyen curi ${ITEMS[s.k].name.toLowerCase()}! 😾`, 'bad'); SFX.bad(); renderTray(); } renderSide(); } }
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
  });
  const gb = $('#grabSpot .pat b'); if (gb && R.grab) { gb.style.width = Math.max(0, R.grab.pat / R.grab.max * 100) + '%'; gb.className = patCls(R.grab); }
  stepStations(dt); stepStaff(dt);
  drawStations(); hud();
  if (R.t <= 0) endDay();
}
function hud() {
  const s = Math.max(0, Math.ceil(R.t));
  $('#hudDay').textContent = 'Hari ' + R.day + (R.ev ? ' ' + EVENTS[R.ev].ic : '');
  $('#hudTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('#timeBar').style.width = Math.max(0, R.t / DUR * 100) + '%';
  $('#hudCoin').textContent = rm(R.earned);
  $('#hudTarget').textContent = 'sasaran ' + rm(target(R.day));
}
function endDay() {
  R.over = true; SFX.bell();
  const tg = target(R.day), e = R.earned, stars = e >= tg * 1.6 ? 3 : e >= tg * 1.3 ? 2 : e >= tg ? 1 : 0;
  const first = R.day === P.day;
  const wg = wages(); P.coins = Math.max(0, P.coins + e - wg); P.stars[R.day] = Math.max(P.stars[R.day] || 0, stars);
  if (stars && first) P.day++;
  save();
  const passed = stars > 0;
  modal(`<h2>${passed ? 'Kedai tutup! 🎉' : 'Alamak...'}</h2>
    <div class="stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? '' : 'off'}">⭐</span>`).join('')}</div>
    <div class="res"><span>Duit hari ni</span><b>${rm(e)}</b><span>Sasaran</span><b>${rm(tg)}</b><span>Pelanggan puas</span><b>${R.served} 😋</b><span>Pelanggan merajuk</span><b>${R.lost} 😠</b><span>Teh tarik perfect</span><b>${R.perfect} ✨</b>${wg ? `<span>Gaji pekerja</span><b>-${rm(wg)}</b>` : ''}</div>
    <p>${passed ? (first ? `Hari ${P.day} dah dibuka!` : 'Bagus!') : 'Tak capai sasaran. Cuba lagi, atau upgrade kedai dulu!'}</p>
    ${passed ? `<button class="btn gold" id="nextBtn" type="button">▶ HARI ${first ? P.day : R.day + 1 <= P.day ? R.day + 1 : P.day}</button>` : `<button class="btn gold" id="retryBtn" type="button">↻ CUBA LAGI</button>`}
    <button class="btn green" id="upBtn" type="button">🛠️ Upgrade (${rm(P.coins)})</button>
    <button class="btn" id="homeBtn" type="button">Menu</button>`);
  const next = passed ? (first ? P.day : Math.min(R.day + 1, P.day)) : R.day;
  $('#modalCard').onclick = ev => {
    const id = ev.target.id;
    if (id === 'nextBtn' || id === 'retryBtn') startDay(next);
    if (id === 'upBtn') openShop(next);
    if (id === 'homeBtn') { closeModal(); toMenu(); }
  };
}
renderMenu();
