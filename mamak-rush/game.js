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
  renderMenu(); if (R) { renderStations(); renderTables(); renderTray(); }
});

/* ---------- Data ---------- */
const ITEMS = {
  roti: { name: 'Roti canai', e: '🫓', price: 3 },
  teh: { name: 'Teh tarik', e: '☕', price: 2 },
  maggi: { name: 'Maggi goreng', e: '🍜', price: 5 },
  nasi: { name: 'Nasi lemak', e: '🍛', price: 4 }
};
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
  7: { ic: '🍛', t: 'Menu baru: Nasi lemak', d: 'Ambik terus dari periuk. Bila habis, tap untuk masak periuk baru.' }
};
const feat = (d, f) => d >= { maggi: 2, tambah: 3, sabar: 4, grab: 5, cat: 6, nasi: 7 }[f];
const UPS = [
  { k: 'tables', ic: '🪑', n: 'Meja tambahan', d: 'Lebih ramai pelanggan serentak', cost: [40, 120], max: 2 },
  { k: 'fan', ic: '🌀', n: 'Kipas siling', d: 'Pelanggan lebih sabar (-20% cepat marah)', cost: [35], max: 1 },
  { k: 'teko', ic: '🫖', n: 'Teko besar', d: 'Zon hijau teh tarik lebih lebar', cost: [30, 90], max: 2 },
  { k: 'kuali', ic: '🍳', n: 'Kuali kedua', d: 'Masak 2 Maggi serentak', cost: [60], max: 1, need: 2 },
  { k: 'tawa', ic: '🔥', n: 'Tawa panas', d: 'Roti canai masak lebih laju', cost: [45], max: 1 },
  { k: 'tray', ic: '🍽️', n: 'Dulang besar', d: 'Dulang muat 5 makanan', cost: [40], max: 1 },
  { k: 'tv', ic: '📺', n: 'TV bola', d: 'Tip +25% (pelanggan seronok tengok bola)', cost: [80], max: 1 }
];
const DUR = 90;
const P = Object.assign({ day: 1, coins: 0, stars: {}, up: {} }, store.get('save', {}));
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
  while (box.children.length > 3) box.lastChild.remove();
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
  if (SPR['item_' + k]) { f.style.width = f.style.height = '34px'; }
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
$('#resetBtn').onclick = () => { if (confirmReset()) { Object.assign(P, { day: 1, coins: 0, stars: {}, up: {} }); save(); renderMenu(); } };
let resetArm = 0;
function confirmReset() { if (Date.now() - resetArm < 3000) return true; resetArm = Date.now(); $('#resetBtn').textContent = 'Tap sekali lagi untuk reset'; setTimeout(() => $('#resetBtn').textContent = 'Reset progress', 3000); return false; }

/* ---------- Modal ---------- */
function modal(html) { $('#modalCard').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }

function openShop(nextDay) {
  const rows = UPS.map(u => {
    const lv = up(u.k), max = lv >= u.max, locked = u.need && P.day < u.need, cost = u.cost[lv];
    return `<div class="up ${max ? 'max' : ''}"><span class="ic">${u.ic}</span><div><b>${u.n}${u.max > 1 ? ` (${lv}/${u.max})` : ''}</b><small>${locked ? 'Buka lepas Hari ' + u.need : u.d}</small></div>
      <button type="button" data-k="${u.k}" ${max || locked || P.coins < cost ? 'disabled' : ''}>${max ? 'ADA ✓' : rm(cost)}</button></div>`;
  }).join('');
  modal(`<h2>🛠️ Upgrade</h2><p>Duit: <b>${rm(P.coins)}</b></p>${rows}
    <button class="btn gold" id="shopDone" type="button">${nextDay ? '▶ HARI ' + nextDay : 'Siap'}</button>`);
  $('#modalCard').onclick = e => {
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
    spawnT: 1.2, grabT: rand(15, 25), catT: rand(14, 22), uid: 0,
    roti: { s: 'idle', t: 0, prog: 0 },
    teh: { s: 'idle', lvl: 0, hold: false, dir: 1 },
    maggi: Array.from({ length: feat(d, 'maggi') ? 1 + up('kuali') : 1 }, () => ({ s: 'idle', t: 0 })),
    nasi: { stock: 6, s: 'idle', t: 0 }
  };
  $('#menu').classList.add('hidden'); $('#game').classList.remove('hidden');
  $('#tables').className = 'tables n' + nTables;
  $('#tv').classList.toggle('hidden', !up('tv')); $('#fan').classList.toggle('hidden', !up('fan'));
  $('#menuBoard').textContent = menuItems().map(k => ITEMS[k].e).join(' ');
  $('#notifs').innerHTML = '';
  renderStations(); renderTables(); renderTray(); renderSide(); hud();
  const u = UNLOCK[d];
  modal(`<h2>Hari ${d}</h2>${u ? `<div class="new-box"><div class="ic">${u.ic}</div><b>${u.t}</b><span>${u.d}</span></div>` : `<p>${d % 5 === 0 ? '⚽ <b>Malam Liga Juara!</b> Kedai sesak gila, siap sedia!' : 'Pelanggan makin ramai. Gerak laju!'}</p>`}
    <p>Sasaran hari ni: <b>${rm(target(d))}</b></p><button class="btn gold" id="goBtn" type="button">▶ JOM BUKA!</button>`);
  $('#modalCard').onclick = e => { if (e.target.id === 'goBtn') { closeModal(); R.paused = false; SFX.bell(); lastT = performance.now(); } };
  cancelAnimationFrame(raf); lastT = performance.now(); raf = requestAnimationFrame(loop);
}
const menuItems = () => ['roti', 'teh', ...(feat(R.day, 'maggi') ? ['maggi'] : []), ...(feat(R.day, 'nasi') ? ['nasi'] : [])];

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
function makeOrder(n) {
  const opts = menuItems(), its = [];
  for (let i = 0; i < n; i++) its.push({ k: pick(opts), done: false });
  return its;
}
function patMax() { return Math.max(16, 34 - R.day * 1.1); }
function spawnCustomer() {
  const free = R.tables.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  if (!free.length) return;
  const used = R.tables.filter(Boolean).map(c => c.who.k);
  const who = pick(CUSTS.filter(c => !used.includes(c.k)));
  const d = R.day, r = Math.random();
  const n = d >= 8 && r < .15 ? 3 : r < Math.min(.65, .12 + d * .08) ? 2 : 1;
  const c = { id: ++R.uid, who, items: makeOrder(n), pat: patMax(), max: patMax(), angry: false, calmed: false, asked: false };
  if (feat(d, 'sabar') && Math.random() < Math.min(.45, .2 + (d - 4) * .04)) {
    c.angry = true;
    setTimeout(() => R && c === R.tables[R.tables.indexOf(c)] && notify(`😤 <b>${who.n}:</b> ${pick(['Lama lagi ke ni?!', 'Cepat sikit boleh tak?', 'Woi, order aku mana?', 'Aku nak cepat ni!'])}`, 'bad'), 400);
  }
  R.tables[pick(free)] = c;
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
  const tipRate = (.15 + .6 * (c.pat / c.max)) * (up('tv') ? 1.25 : 1) * (c.grab ? 1.8 : 1);
  const pay = sum + Math.round(sum * tipRate) + (c.perf || 0);
  R.earned += pay; R.served++; SFX.coin(); buzz(15);
  const el = custEl(c); floatAt(el, '+' + rm(pay)); emote(el, c.grab ? '👍' : pick(['😋', '🥰', '😄', '❤️']));
  // Tambah satu!
  if (!c.grab && !c.asked && feat(R.day, 'tambah') && Math.random() < .35) {
    c.asked = true; const k = pick(menuItems()); c.items = [{ k, done: false }]; c.pat = Math.min(c.max, c.pat + c.max * .35); c.perf = 0;
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
function needers(k) {
  const list = [];
  if (R.grab && !R.grab.gone) list.push(R.grab);
  R.tables.forEach(c => c && !c.gone && list.push(c));
  return list.filter(c => c.items.some(i => !i.done && i.k === k)).sort((a, b) => (b.grab ? 1 : 0) - (a.grab ? 1 : 0) || a.pat / a.max - b.pat / b.max);
}
function deliver(k, perf, fromEl) {
  const c = needers(k)[0];
  if (c) {
    const it = c.items.find(i => !i.done && i.k === k); it.done = true; if (perf) c.perf = (c.perf || 0) + 2;
    flyItem(fromEl, custEl(c), k);
    setTimeout(() => {
      if (!R) return;
      c.grab ? renderSide() : renderTables();
      if (c.items.every(i => i.done)) custDone(c);
    }, 460);
    return true;
  }
  if (R.tray.length >= R.trayMax) { notify('🍽️ Dulang dah penuh!', 'bad'); return false; }
  R.tray.push({ k, perf }); flyItem(fromEl, $('#tray'), k); setTimeout(renderTray, 300);
  return true;
}
function serveFromTray() {
  let moved = false;
  for (let i = R.tray.length - 1; i >= 0; i--) {
    const t = R.tray[i];
    if (needers(t.k).length) { R.tray.splice(i, 1); const slot = $('#tray').children[i]; deliver(t.k, t.perf, slot); moved = true; }
  }
  if (moved) renderTray();
}
function renderTray() {
  if (!R) return;
  $('#tray').innerHTML = Array.from({ length: R.trayMax }, (_, i) => { const t = R.tray[i]; return t ? `<div class="slot full av">${ico('item_' + t.k, ITEMS[t.k].e)}${t.perf ? '<span class="star">✨</span>' : ''}</div>` : '<div class="slot"></div>'; }).join('');
}

/* ---------- Render meja ---------- */
function orderHTML(c) { return `<div class="order">${c.items.map(i => `<span class="it av ${i.done ? 'done' : ''}">${ico('item_' + i.k, ITEMS[i.k].e)}</span>`).join('')}</div>`; }
function patCls(c) { const f = c.pat / c.max; return f > .5 ? '' : f > .25 ? 'mid' : 'low'; }
function renderTables() {
  if (!R) return;
  $('#tables').innerHTML = R.tables.map(c => `<div class="table"><span class="top"></span><span class="stool l"></span><span class="stool r"></span>${c ? `
    <div class="cust ${c.angry ? 'angry' : ''}" data-id="${c.id}">${orderHTML(c)}<span class="av">${ico('cust_' + c.who.k, c.who.e)}</span>
    <div class="pat"><b class="${patCls(c)}" style="width:${c.pat / c.max * 100}%"></b></div>${c.angry ? '<span class="calm-tag">TAP: Sabar!</span>' : ''}</div>` : ''}</div>`).join('');
}
function renderSide() {
  if (!R) return;
  const g = R.grab;
  $('#grabSpot').innerHTML = g ? `<div class="grab">${orderHTML(g)}<span class="av">${ico('cust_grab', '🛵')}</span><div class="pat"><b class="${patCls(g)}" style="width:${g.pat / g.max * 100}%"></b></div></div>` : '';
  $('#catSpot').innerHTML = R.cat ? `<div class="cat"><span class="av">${ico('cust_oyen', '🐈')}</span></div>` : '';
}
$('#catSpot').addEventListener('pointerdown', () => {
  if (!R || !R.cat) return; R.cat = null; renderSide();
  notify(pick(['🐈 Shuh shuh! Oyen lari.', '🐈 Oyen kena halau. Meow 😿', '🐈 Selamat makanan!']), 'good'); SFX.tap(); buzz(10);
});

/* ---------- Stesen ---------- */
function renderStations() {
  if (!R) return;
  const d = R.day, h = [];
  h.push(`<div class="st" id="stRoti"><span class="lbl">ROTI CANAI</span><span class="big av"></span><span class="hint"></span><span class="bar"><b></b></span></div>`);
  h.push(`<div class="st" id="stTeh"><span class="lbl">TEH TARIK</span><span class="teh-stream"></span><span class="big av"></span><span class="hint"></span><div class="meter"><span class="zone"></span><span class="lvl"></span></div></div>`);
  if (feat(d, 'maggi')) h.push(`<div class="st sub" id="stMaggi"><span class="lbl">MAGGI</span>${R.maggi.map((_, i) => `<div class="pan" data-i="${i}"><span class="big av"></span><span class="hint"></span><span class="bar"><b></b></span></div>`).join('')}</div>`);
  if (feat(d, 'nasi')) h.push(`<div class="st" id="stNasi"><span class="lbl">NASI LEMAK</span><span class="cnt"></span><span class="big av"></span><span class="hint"></span><span class="bar"><b></b></span></div>`);
  $('#stations').innerHTML = h.join('');
  const z = tehZone(); const zone = $('#stTeh .zone'); zone.style.bottom = (z[0] * 100) + '%'; zone.style.height = ((z[1] - z[0]) * 100) + '%';
  bindStations(); drawStations();
}
const tehZone = () => { const w = .14 + up('teko') * .06; return [.72 - w / 2, .72 + w / 2]; };
const ROTI_COOK = () => up('tawa') ? 2.4 : 3.5, READY_WIN = 5, MAGGI_COOK = 4.2, NASI_COOK = 5;
function setSt(el, big, hint, bar, cls) {
  if (!el) return;
  el.querySelector('.big').innerHTML = big; el.querySelector('.hint').innerHTML = hint;
  const b = el.querySelector('.bar b'); if (b) b.style.width = (bar * 100) + '%';
  el.classList.toggle('ready', cls === 'ready'); el.classList.toggle('burn', cls === 'burn');
}
function drawStations() {
  if (!R) return;
  const r = R.roti, rEl = $('#stRoti');
  if (r.s === 'idle') setSt(rEl, ico('st_doh', '⚪'), 'Tap ambik doh', 0);
  else if (r.s === 'tebar') { setSt(rEl, ico('st_doh', '⚪'), '<span class="swipe-arrow">👉</span> Swipe tebar!', r.prog); rEl.querySelector('.big').style.transform = `scale(${1 + r.prog * .5}) rotate(${r.prog * 200}deg)`; }
  else { rEl.querySelector('.big').style.transform = ''; }
  if (r.s === 'cook') setSt(rEl, ico('st_roti_masak', '🫓'), 'Tengah masak...', 1 - r.t / ROTI_COOK());
  if (r.s === 'ready') setSt(rEl, ico('item_roti', '🫓'), '✨ Tap ambik!', r.t / READY_WIN, 'ready');
  if (r.s === 'burn') setSt(rEl, ico('st_hangus', '🫓'), '🔥 Hangus! Tap buang', 0, 'burn');

  const t = R.teh, tEl = $('#stTeh');
  tEl.querySelector('.lvl').style.height = (t.lvl * 100) + '%';
  tEl.querySelector('.teh-stream').style.height = t.hold ? (20 + t.lvl * 60) + 'px' : '0';
  if (t.s === 'idle') { tEl.querySelector('.big').innerHTML = ico('st_teko', '🫖'); tEl.querySelector('.hint').innerHTML = 'Tekan & tahan, lepas kat hijau'; }

  if (feat(R.day, 'maggi')) R.maggi.forEach((m, i) => {
    const el = document.querySelector(`#stMaggi .pan[data-i="${i}"]`); if (!el) return;
    const b = el.querySelector('.bar b');
    el.classList.toggle('ready', m.s === 'ready'); el.classList.toggle('burn', m.s === 'burn');
    el.querySelector('.big').innerHTML = m.s === 'idle' ? ico('st_kuali', '🍳') : m.s === 'burn' ? ico('st_hangus_maggi', '🍜') : m.s === 'ready' ? ico('item_maggi', '🍜') : ico('st_kuali_masak', '🥘');
    el.querySelector('.hint').innerHTML = m.s === 'idle' ? 'Tap masak' : m.s === 'cook' ? 'Goreng...' : m.s === 'ready' ? '✨ Ambik!' : '🔥 Buang';
    b.style.width = (m.s === 'cook' ? 1 - m.t / MAGGI_COOK : m.s === 'ready' ? m.t / READY_WIN : 0) * 100 + '%';
  });
  if (feat(R.day, 'nasi')) {
    const n = R.nasi, el = $('#stNasi');
    el.querySelector('.cnt').textContent = n.s === 'cook' ? '...' : n.stock + ' bungkus';
    setSt(el, n.s === 'cook' ? ico('st_periuk', '♨️') : ico('item_nasi', '🍛'), n.s === 'cook' ? 'Masak nasi...' : n.stock ? 'Tap ambik' : 'Habis! Tap masak', n.s === 'cook' ? 1 - n.t / NASI_COOK : 0, n.stock && n.s !== 'cook' ? '' : '');
  }
}
function bindStations() {
  // Roti
  const rEl = $('#stRoti'); let lastX = null;
  rEl.addEventListener('pointerdown', e => {
    if (!live()) return; const r = R.roti;
    if (r.s === 'idle') { r.s = 'tebar'; r.prog = 0; SFX.tap(); }
    else if (r.s === 'tebar') { r.prog = Math.min(1, r.prog + .08); lastX = e.clientX; rEl.setPointerCapture(e.pointerId); }
    else if (r.s === 'ready') { if (deliver('roti', false, rEl)) { r.s = 'idle'; SFX.tap(); } }
    else if (r.s === 'burn') { r.s = 'idle'; SFX.tap(); }
    drawStations();
  });
  rEl.addEventListener('pointermove', e => {
    const r = R && R.roti; if (!r || r.s !== 'tebar' || lastX == null) return;
    r.prog = Math.min(1, r.prog + Math.abs(e.clientX - lastX) / 520); lastX = e.clientX;
    if (r.prog >= 1) { r.s = 'cook'; r.t = ROTI_COOK(); lastX = null; tone(300, .2, 'sawtooth', .05, 500); }
    drawStations();
  });
  rEl.addEventListener('pointerup', () => { lastX = null; const r = R && R.roti; if (r && r.s === 'tebar' && r.prog >= 1) { r.s = 'cook'; r.t = ROTI_COOK(); } });
  // Teh
  const tEl = $('#stTeh');
  tEl.addEventListener('pointerdown', e => { if (!live()) return; const t = R.teh; t.hold = true; t.lvl = 0; t.dir = 1; t.s = 'tarik'; tEl.setPointerCapture(e.pointerId); tEl.querySelector('.big').innerHTML = ico('st_tarik', '🫖'); tEl.querySelector('.hint').innerHTML = 'Tariiik...'; });
  const rel = () => {
    const t = R && R.teh; if (!t || !t.hold) return; t.hold = false; t.s = 'idle';
    const [a, b] = tehZone(), perf = t.lvl >= a && t.lvl <= b, ok = t.lvl >= .3;
    if (!ok) { notify('☕ Tarik tak cukup tinggi, cuba lagi!', 'bad'); t.lvl = 0; drawStations(); return; }
    if (perf) { R.perfect++; SFX.perfect(); notify('✨ Teh tarik buih tebal! Perfect!', 'good'); buzz(20); } else SFX.tap();
    deliver('teh', perf, tEl); t.lvl = 0; drawStations();
  };
  tEl.addEventListener('pointerup', rel); tEl.addEventListener('pointercancel', rel);
  // Maggi
  const mEl = $('#stMaggi');
  if (mEl) mEl.addEventListener('pointerdown', e => {
    const p = e.target.closest('.pan'); if (!p || !live()) return; const m = R.maggi[+p.dataset.i];
    if (m.s === 'idle') { m.s = 'cook'; m.t = MAGGI_COOK; tone(200, .3, 'sawtooth', .04, 260); }
    else if (m.s === 'ready') { if (deliver('maggi', false, p)) m.s = 'idle'; }
    else if (m.s === 'burn') m.s = 'idle';
    drawStations();
  });
  const nEl = $('#stNasi');
  if (nEl) nEl.addEventListener('pointerdown', () => {
    if (!live()) return; const n = R.nasi;
    if (n.s === 'cook') return;
    if (n.stock > 0) { if (deliver('nasi', false, nEl)) n.stock--; }
    else { n.s = 'cook'; n.t = NASI_COOK; SFX.tap(); }
    drawStations();
  });
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
  const rush = d % 5 === 0 ? .7 : 1;
  if (R.spawnT <= 0 && R.t > 6) { spawnCustomer(); R.spawnT = Math.max(2.2, 7.5 - d * .45) * rush * rand(.8, 1.25); }
  if (feat(d, 'grab') && !R.grab) { R.grabT -= dt; if (R.grabT <= 0 && R.t > 12) { spawnGrab(); R.grabT = rand(18, 30); } }
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
  // stesen
  const r = R.roti;
  if (r.s === 'cook' && (r.t -= dt) <= 0) { r.s = 'ready'; r.t = READY_WIN; SFX.ready(); }
  else if (r.s === 'ready' && (r.t -= dt) <= 0) { r.s = 'burn'; SFX.burn(); notify('🔥 Alamak, roti hangus!', 'bad'); }
  const t = R.teh;
  if (t.hold) { const sp = 1 / (1.25 + up('teko') * .2); t.lvl += t.dir * dt * sp; if (t.lvl >= 1) { t.lvl = 1; t.dir = -1; } if (t.lvl <= 0) { t.lvl = 0; t.dir = 1; } }
  R.maggi.forEach(m => {
    if (m.s === 'cook' && (m.t -= dt) <= 0) { m.s = 'ready'; m.t = READY_WIN; SFX.ready(); }
    else if (m.s === 'ready' && (m.t -= dt) <= 0) { m.s = 'burn'; SFX.burn(); notify('🔥 Maggi hangus! Bau satu kedai...', 'bad'); }
  });
  const n = R.nasi; if (n.s === 'cook' && (n.t -= dt) <= 0) { n.s = 'idle'; n.stock = 6; SFX.ready(); }
  drawStations(); hud();
  if (R.t <= 0) endDay();
}
function hud() {
  const s = Math.max(0, Math.ceil(R.t));
  $('#hudDay').textContent = 'Hari ' + R.day;
  $('#hudTime').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('#timeBar').style.width = Math.max(0, R.t / DUR * 100) + '%';
  $('#hudCoin').textContent = rm(R.earned);
  $('#hudTarget').textContent = 'sasaran ' + rm(target(R.day));
}
function endDay() {
  R.over = true; SFX.bell();
  const tg = target(R.day), e = R.earned, stars = e >= tg * 1.6 ? 3 : e >= tg * 1.3 ? 2 : e >= tg ? 1 : 0;
  const first = R.day === P.day;
  P.coins += e; P.stars[R.day] = Math.max(P.stars[R.day] || 0, stars);
  if (stars && first) P.day++;
  save();
  const passed = stars > 0;
  modal(`<h2>${passed ? 'Kedai tutup! 🎉' : 'Alamak...'}</h2>
    <div class="stars">${[1, 2, 3].map(i => `<span class="${i <= stars ? '' : 'off'}">⭐</span>`).join('')}</div>
    <div class="res"><span>Duit hari ni</span><b>${rm(e)}</b><span>Sasaran</span><b>${rm(tg)}</b><span>Pelanggan puas</span><b>${R.served} 😋</b><span>Pelanggan merajuk</span><b>${R.lost} 😠</b><span>Teh tarik perfect</span><b>${R.perfect} ✨</b></div>
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
