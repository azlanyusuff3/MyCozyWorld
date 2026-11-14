/* Perang Lidi — stickman tribe battle (MyCozyWorld)
   Kau vs AI. Hantar askar lidi, upgrade, guna ultimate puak, rampas senjata musuh yang jatuh. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

/* ================= DATA ================= */
const TRIBES = [
  { id: 'api',      name: 'Puak Api',      c: '#ff7a2e', g: '#ff4d00', mod: { hp: 1, dmg: 1.12, spd: 1 },    ult: 'Hujan Api',    desc: 'Meteor jatuh atas kumpulan musuh paling padat.' },
  { id: 'bulan',    name: 'Puak Bulan',    c: '#b98cff', g: '#7b3dff', mod: { hp: 1, dmg: 1, spd: 1.1 },     ult: 'Sabit Bulan',  desc: 'Gelombang sabit merentas medan, tebas semua musuh.' },
  { id: 'besi',     name: 'Puak Besi',     c: '#9fd8ff', g: '#3aa0ff', mod: { hp: 1.18, dmg: 0.95, spd: 0.92 }, ult: 'Kubu Besi',  desc: 'Semua askar kau kebal 60% selama 7 saat.' },
  { id: 'hutan',    name: 'Puak Hutan',    c: '#7dff6a', g: '#21c22a', mod: { hp: 1.08, dmg: 1, spd: 1 },    ult: 'Akar Belit',   desc: 'Akar membelit semua musuh. Tak boleh gerak 4 saat.' },
  { id: 'pendekar', name: 'Puak Pendekar', c: '#ffd36b', g: '#ffaa00', mod: { hp: 1, dmg: 1.08, spd: 1.05 }, ult: 'Amukan',       desc: 'Askar kau +70% serangan & laju selama 7 saat.' },
  { id: 'bunian',   name: 'Puak Bunian',   c: '#5ff5d8', g: '#00c9a7', mod: { hp: 0.95, dmg: 1.05, spd: 1.12 }, ult: 'Halimunan', desc: 'Askar kau ghaib & pulih 35% darah. Musuh tak nampak 5 saat.' },
  { id: 'ais',      name: 'Puak Ais',      c: '#d6f4ff', g: '#7fd3ff', mod: { hp: 1.05, dmg: 1, spd: 0.97 }, ult: 'Badai Salji',  desc: 'Musuh perlahan 65% dan kena damage selama 6 saat.' },
  { id: 'racun',    name: 'Puak Racun',    c: '#d4ff3a', g: '#8fd400', mod: { hp: 1, dmg: 1.04, spd: 1 },    ult: 'Kabus Racun',  desc: 'Kabus beracun hakis darah semua musuh 6 saat.' },
];
// type: cost, hp, dmg, range, rate (s), speed, armor, size
const UNITS = {
  pedang:  { name: 'Pedang',  cost: 20, hp: 60,  dmg: 11, range: 20,  rate: 0.75, spd: 42, armor: 0,   size: 1,    melee: true },
  panah:   { name: 'Panah',   cost: 30, hp: 34,  dmg: 8,  range: 170, rate: 1.15, spd: 37, armor: 0,   size: 0.95 },
  perisai: { name: 'Perisai', cost: 45, hp: 170, dmg: 6,  range: 18,  rate: 1.0,  spd: 29, armor: 0.35, size: 1.12, melee: true },
  gergaji: { name: 'Gergaji', cost: 70, hp: 120, dmg: 5,  range: 26,  rate: 0.16, spd: 31, armor: 0.1, size: 1.2,  melee: true, cleave: 2 },
};
const UNIT_KEYS = Object.keys(UNITS);
// askar istimewa setiap puak (unit ke-5)
const ELITE = {
  api:      { name: 'Naga Api',       cost: 110, hp: 230, dmg: 5,  range: 75,  rate: 0.25, spd: 34, armor: 0.1,  size: 1.45, mech: 'flame',   shape: 'naga',  melee: true, desc: 'Naga terbang, sembur api kena semua musuh di depan' },
  bulan:    { name: 'Pemanah Bulan',  cost: 120, hp: 150, dmg: 26, range: 280, rate: 2.2,  spd: 32, armor: 0,    size: 1.35, mech: 'beam',    wpn: 'panah',   desc: 'Sinar bulan tembus semua musuh sebaris' },
  besi:     { name: 'Robot Gergasi',  cost: 130, hp: 650, dmg: 30, range: 30,  rate: 1.6,  spd: 22, armor: 0.4,  size: 1.85, mech: 'punch',   shape: 'robot',   melee: true, desc: 'Tumbukan berat, tolak musuh ke belakang' },
  hutan:    { name: 'Gergasi Pokok',  cost: 120, hp: 520, dmg: 20, range: 30,  rate: 1.5,  spd: 24, armor: 0.15, size: 1.75, mech: 'slam',    shape: 'pokok',   melee: true, desc: 'Hentak tanah: pengsankan musuh, pulihkan kawan' },
  pendekar: { name: 'Pahlawan Keris', cost: 110, hp: 260, dmg: 26, range: 22,  rate: 0.6,  spd: 50, armor: 0.1,  size: 1.35, mech: 'leap',    wpn: 'keris',   melee: true, desc: 'Lompat terus ke musuh, tikaman maut' },
  bunian:   { name: 'Penembak Ghaib', cost: 110, hp: 130, dmg: 30, range: 210, rate: 1.6,  spd: 36, armor: 0,    size: 1.3,  mech: 'stealth', wpn: 'panah',   desc: 'Halimunan, hanya nampak bila menembak' },
  ais:      { name: 'Penyihir Salji', cost: 115, hp: 170, dmg: 14, range: 190, rate: 1.8,  spd: 30, armor: 0,    size: 1.35, mech: 'iceball', wpn: 'tongkat', desc: 'Bola ais membeku sekumpulan musuh' },
  racun:    { name: 'Bomoh Racun',    cost: 115, hp: 180, dmg: 7,  range: 170, rate: 1.7,  spd: 30, armor: 0,    size: 1.35, mech: 'flask',   wpn: 'tongkat', desc: 'Baling botol racun ke kumpulan musuh' },
};
for (const k in ELITE) UNITS['e_' + k] = Object.assign({ elite: true, tribe: k }, ELITE[k]);
const ELITE_MAX = 2;
// senjata setiap puak untuk 4 peranan: [nama, bentuk senjata]. proj = gaya peluru, el = efek elemen bila kena
const THEME = {
  api:      { pedang: ['Tinju Api', 'tinju_api'],     panah: ['Bola Api', 'orb'],          perisai: ['Perisai Lava', 'perisai'],    gergaji: ['Tukul Lava', 'tukul'],       proj: 'fire',   el: ['#ff7a2e', '#ffd36b', '#ff4d00'] },
  bulan:    { pedang: ['Sabit Bulan', 'sabit'],       panah: ['Cakera Bulan', 'orb'],      perisai: ['Perisai Gerhana', 'perisai'], gergaji: ['Sabit Gergasi', 'sabit_besar'], proj: 'moon', el: ['#b98cff', '#ffffff', '#e2d4ff'] },
  besi:     { pedang: ['Pedang Besi', 'pedang'],      panah: ['Busur Silang', 'busur_silang'], perisai: ['Perisai Menara', 'perisai'], gergaji: ['Gergaji Besi', 'gergaji'],  proj: 'bolt',   el: ['#ffe28a', '#ffffff', '#9fd8ff'] },
  hutan:    { pedang: ['Lembing Kayu', 'lembing'],    panah: ['Busur Ranting', 'panah'],   perisai: ['Perisai Kayu', 'perisai'],    gergaji: ['Kapak Batu', 'kapak'],       proj: 'leaf',   el: ['#7dff6a', '#21c22a', '#c8ff9a'] },
  pendekar: { pedang: ['Keris', 'keris'],             panah: ['Sumpit', 'sumpit'],         perisai: ['Perisai Rotan', 'perisai'],   gergaji: ['Parang Panjang', 'parang'],  proj: 'dart',   el: ['#ffd36b', '#ffffff', '#ffaa00'] },
  bunian:   { pedang: ['Pedang Kristal', 'pedang'],   panah: ['Busur Bunian', 'panah'],    perisai: ['Perisai Kabus', 'perisai'],   gergaji: ['Tongkat Roh', 'tongkat_roh'], proj: 'spirit', el: ['#5ff5d8', '#ffffff', '#00c9a7'] },
  ais:      { pedang: ['Pedang Ais', 'pedang'],       panah: ['Serpihan Ais', 'orb'],      perisai: ['Perisai Salji', 'perisai'],   gergaji: ['Tukul Beku', 'tukul'],       proj: 'ice',    el: ['#d6f4ff', '#ffffff', '#7fd3ff'] },
  racun:    { pedang: ['Belati Racun', 'belati'],     panah: ['Botol Racun', 'orb'],       perisai: ['Perisai Tengkorak', 'perisai'], gergaji: ['Sabit Racun', 'sabit_besar'], proj: 'poison', el: ['#d4ff3a', '#8fd400', '#f2ffb0'] },
};
const ROLES = ['pedang', 'panah', 'perisai', 'gergaji'];
const unitName = (tid, k) => THEME[tid] && THEME[tid][k] ? THEME[tid][k][0] : UNITS[k].name;
// bentuk lukisan: kategori untuk saiz gambar & pose
const SHAPE_CAT = { pedang: 'long', sabit: 'long', lembing: 'long', keris: 'long', belati: 'long', parang: 'long', kapak: 'long', tukul: 'long', sabit_besar: 'long', gergaji: 'long', tongkat_roh: 'long', sumpit: 'long', busur_silang: 'long',
  panah: 'bow', perisai: 'shield', orb: 'orb', tinju_api: 'orb' };
const SHAPE_LEN = { pedang: 38, sabit: 36, lembing: 52, keris: 30, belati: 22, parang: 44, kapak: 36, tukul: 38, sabit_besar: 48, gergaji: 48, tongkat_roh: 44, sumpit: 42, busur_silang: 34 };
// senjata yang dipegang: { shape, key gambar, tribe }
function weaponOf(u) {
  const U = UNITS[u.type];
  if (U && (U.elite || U.special)) return { shape: wpnOf(u.type), img: 'weapon_' + wpnOf(u.type), tid: u.t.id };
  const tid = u.wt || u.t.id, th = THEME[tid];
  return { shape: th[u.type][1], img: 'w_' + tid + '_' + u.type, alt: tid === 'besi' ? 'weapon_' + th[u.type][1] : null, tid };
}
const wpnOf = type => (UNITS[type] && UNITS[type].wpn) || type;
// unit khas dari skill (tak boleh beli)
UNITS.tembok = { name: 'Tembok', cost: 0, hp: 380, dmg: 0, range: 0, rate: 99, spd: 0, armor: 0.3, size: 1, special: true };
UNITS.pokok  = { name: 'Pokok',  cost: 0, hp: 140, dmg: 7, range: 160, rate: 0.9, spd: 0, armor: 0, size: 1.1, special: true };
const PASSIVE = {
  api: 'Bakar: pukulan membakar musuh beberapa saat',
  bulan: 'Malam Panjang: askar makin laju bila perang makin lama',
  besi: 'Tukang Besi: Perisai 30% lebih murah',
  hutan: 'Akar Hidup: askar pulih darah perlahan-lahan',
  pendekar: 'Bunga Silat: Pedang 25% peluang kritikal ×2',
  bunian: 'Bayang: serangan musuh 15% tersasar',
  ais: 'Sejuk: pukulan memperlahankan musuh',
  racun: 'Mayat Toksik: askar mati meletup racun',
};
const SKILL = {
  api: ['Bom Api', 'Letupan atas barisan depan musuh'],
  bulan: ['Lompat Bulan', '3 askar depan lompat ke belakang musuh'],
  besi: ['Tembok Besi', 'Bina tembok penahan di depan'],
  hutan: ['Pokok Penjaga', 'Tanam pokok yang menembak musuh'],
  pendekar: ['Laungan Silat', 'Askar serang 3× laju selama 4 saat'],
  bunian: ['Klon Ghaib', '3 askar bayang muncul di barisan depan'],
  ais: ['Lantai Licin', 'Musuh depan tergelincir ke belakang'],
  racun: ['Panah Racun', 'Hujan anak panah beracun'],
};
const SKILL_CD = 16;
const CARDS = [
  { id: 'panah2', t: 'Panah Berkembar', d: 'Pemanah tembak 2 anak panah', ic: '🏹' },
  { id: 'rampas', t: 'Rampasan Perang', d: 'Askar yang rampas senjata +60% HP', ic: '★' },
  { id: 'kubuApi', t: 'Kubu Berapi', d: 'Kubu tembak 2× laju & lebih kuat', ic: '🏰' },
  { id: 'emas', t: 'Lombong Emas', d: 'Emas ×2 selama 25 saat', ic: '🪙', once: 1 },
  { id: 'murah', t: 'Rekrut Murah', d: 'Semua askar 20% lebih murah', ic: '🏷' },
  { id: 'skillCd', t: 'Fokus', d: 'Cooldown skill -40%', ic: '⏱' },
  { id: 'ultCas', t: 'Semangat', d: 'Ultimate cas 50% lebih cepat', ic: '✦' },
  { id: 'vamp', t: 'Darah Pahlawan', d: 'Serangan dekat pulihkan 25% damage', ic: '❤' },
  { id: 'pedang', t: 'Pedang Tajam', d: 'Askar Pedang +40% damage & HP', ic: '🗡' },
  { id: 'duri', t: 'Perisai Berduri', d: 'Perisai pantulkan 35% damage', ic: '🛡' },
  { id: 'gergaji', t: 'Enjin Turbo', d: 'Gergaji +35% laju & serangan', ic: '⚙' },
  { id: 'baiki', t: 'Baiki Kubu', d: 'Kubu pulih 400 HP serta-merta', ic: '🔧', once: 1 },
  { id: 'laju', t: 'Langkah Pantas', d: 'Semua askar +15% laju', ic: '💨' },
  { id: 'pasukan', t: 'Bantuan Tiba', d: '4 askar Pedang percuma sekarang', ic: '⚔', once: 1 },
];
const CARD_EVERY = 55;
const UPS = {
  senjata: { name: 'Senjata', icon: '🗡', base: 70, desc: '+15% dmg' },
  zirah:   { name: 'Zirah',   icon: '🛡', base: 70, desc: '+15% HP' },
  ekonomi: { name: 'Ekonomi', icon: '🪙', base: 55, desc: '+2 emas/s' },
};
const MAXUP = 5;
const W = 1500, GROUND = 330, BASE_HP = 1600, BASE_X = 70;
const DIFF = [ { gold: 0.65, think: 1.6, smart: 0.15, skill: 0.35, elite: 0.1, start: 30 }, { gold: 0.85, think: 1.15, smart: 0.4, skill: 0.6, elite: 0.22, start: 45 }, { gold: 1.12, think: 0.7, smart: 0.9, skill: 0.95, elite: 0.5, start: 80 } ];

/* ================= SOUND ================= */
let AC = null, muted = false;
function snd(type) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    const S = { hit: [180, 60, 'square', 0.05, 0.06], shoot: [900, 300, 'triangle', 0.04, 0.08], die: [300, 50, 'sawtooth', 0.06, 0.22],
      spawn: [440, 660, 'sine', 0.06, 0.1], ult: [120, 900, 'sawtooth', 0.12, 0.6], up: [520, 1040, 'triangle', 0.08, 0.18],
      boom: [90, 30, 'square', 0.14, 0.4], pick: [700, 1400, 'sine', 0.07, 0.12] }[type];
    if (!S) return;
    o.type = S[2]; o.frequency.setValueAtTime(S[0], t); o.frequency.exponentialRampToValueAtTime(S[1], t + S[4]);
    g.gain.setValueAtTime(S[3], t); g.gain.exponentialRampToValueAtTime(0.0001, t + S[4]);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + S[4] + 0.02);
  } catch (e) {}
}
let lastHitSnd = 0;
const hitSnd = () => { const n = performance.now(); if (n - lastHitSnd > 70) { lastHitSnd = n; snd('hit'); } };

/* ================= STATE ================= */
const store = (() => { try { return JSON.parse(localStorage.getItem('perangLidi') || '{}'); } catch (e) { return {}; } })();
const save = () => { try { localStorage.setItem('perangLidi', JSON.stringify(store)); } catch (e) {} };
let mode = store.mode || 'quick', diff = store.diff ?? 1, myTribe = store.tribe || 'pendekar';
let G = null;        // battle state
/* ---- gambar pilihan (sprites/list.json). Kalau tiada, semua dilukis neon. ---- */
const IMG = {};
const img = k => { const i = IMG[k]; return i && (i.getContext || (i.complete && i.naturalWidth)) ? i : null; };
// potong ruang kosong (transparent) supaya saiz dalam game tepat
function cropAlpha(im) {
  try {
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y += 2) for (let xx = 0; xx < c.width; xx += 2) if (d[(y * c.width + xx) * 4 + 3] > 24) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 <= x0 || y1 <= y0) return im;
    const o = document.createElement('canvas'); o.width = x1 - x0 + 2; o.height = y1 - y0 + 2;
    o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return o;
  } catch (e) { return im; }
}
fetch('sprites/list.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).catch(() => []).then(l => {
  let n = l.length; if (!n) return;
  l.forEach(k => { const i = new Image(); i.onload = i.onerror = () => { if (i.naturalWidth && /^(hat|weapon|fort|w)_/.test(k)) IMG[k] = cropAlpha(i); if (--n === 0) applyArt(); }; i.src = 'sprites/' + k + '.webp'; IMG[k] = i; });
});
function applyArt() {
  if (img('logo')) document.querySelector('#menu .logo').innerHTML = `<img src="${IMG.logo.src}" alt="Perang Lidi">`;
  if (img('bg_menu')) ['menu', 'bracket'].forEach(id => { $(id).style.background = `linear-gradient(#07060f99,#07060fcc 60%,#07060f), url(${IMG.bg_menu.src}) center top/cover no-repeat, #07060f`; });
  if (img('frame_modal')) document.querySelector('.modal .box').style.background = `url(${IMG.frame_modal.src}) center/100% 100% no-repeat, #100d20`;
  buildTribeGrid();
  if (G) buildPanel();
  if (tour && !$('bracket').classList.contains('hidden')) renderBracket();
}
const chiefImg = (id, cls) => img('chief_' + id) ? `<img class="${cls}" src="${IMG['chief_' + id].src}" alt="">` : '';
let tour = null;     // tournament state

/* ================= MENU ================= */
function segInit(id, val, cb) {
  const el = $(id);
  const set = v => { [...el.children].forEach(b => b.classList.toggle('on', b.dataset.v == v)); };
  set(val);
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return; set(b.dataset.v); cb(b.dataset.v); };
}
segInit('modeSeg', mode, v => { mode = v; store.mode = v; save(); $('diffBox').classList.toggle('hidden', v === 'tour'); });
segInit('diffSeg', diff, v => { diff = +v; store.diff = diff; save(); });
$('diffBox').classList.toggle('hidden', mode === 'tour');

function miniStick(tribe, type, w = 44, h = 50) {
  const c = document.createElement('canvas'), dpr = Math.min(2, devicePixelRatio || 1);
  c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
  const x = c.getContext('2d'); x.scale(dpr, dpr);
  const u = { side: 0, x: w / 2 - 3, y: 0, type, t: TRIBES.find(t => t.id === tribe), walk: 0.6, atk: 0, size: (UNITS[type].shape ? (UNITS[type].shape === 'naga' ? 0.62 : 0.72) : Math.min(UNITS[type].size, 1.15)) * h / 78, hp: 1, maxHp: 1, stolen: false };
  drawStick(x, u, 0, h - 3 - GROUND, 1);
  return c;
}
function buildTribeGrid() {
  const g = $('tribeGrid'); g.innerHTML = '';
  TRIBES.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'tribe' + (t.id === myTribe ? ' on' : ''); b.style.setProperty('--c', t.c);
    b.innerHTML = `<b style="color:${t.c}">${t.name.replace('Puak ', '')}</b><small>◆ ${PASSIVE[t.id]}</small><small>⚡ ${SKILL[t.id][0]}: ${SKILL[t.id][1]}</small><small>♛ ${ELITE[t.id].name}: ${ELITE[t.id].desc}</small><small>✦ ${t.ult}: ${t.desc}</small>`;
    if (img('chief_' + t.id)) b.insertAdjacentHTML('afterbegin', chiefImg(t.id, 'chief')); else b.prepend(miniStick(t.id, pick(UNIT_KEYS)));
    b.onclick = () => { myTribe = t.id; store.tribe = t.id; save(); [...g.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); };
    g.appendChild(b);
  });
  $('trophies').textContent = `🏆 Juara kejohanan: ${store.cups || 0} kali · Menang: ${store.wins || 0}`;
}
$('startBtn').onclick = () => {
  snd('spawn');
  if (mode === 'tour') { startTour(); return; }
  const foe = pick(TRIBES.filter(t => t.id !== myTribe)).id;
  startBattle(myTribe, foe, diff);
};
function show(id) { ['menu', 'bracket', 'battle'].forEach(v => $(v).classList.toggle('hidden', v !== id)); document.body.classList.toggle('playing', id === 'battle'); }

/* ================= TOURNAMENT ================= */
function startTour() {
  const others = TRIBES.map(t => t.id).filter(id => id !== myTribe).sort(() => Math.random() - 0.5);
  const seeds = [myTribe, ...others];
  // susun bracket: pemain di slot 0
  tour = { rounds: [[[seeds[0], seeds[1]], [seeds[2], seeds[3]], [seeds[4], seeds[5]], [seeds[6], seeds[7]]]], winners: [[]], r: 0, done: false, champ: null };
  renderBracket();
}
const RNAMES = ['Suku Akhir', 'Separuh Akhir', 'Final'];
const tName = id => TRIBES.find(t => t.id === id).name.replace('Puak ', '');
const tCol = id => TRIBES.find(t => t.id === id).c;
function renderBracket() {
  show('bracket');
  const body = $('brBody'); body.innerHTML = '';
  tour.rounds.forEach((ms, ri) => {
    const d = document.createElement('div'); d.className = 'round';
    d.innerHTML = `<h4>${RNAMES[ri]}</h4>`;
    ms.forEach((m, mi) => {
      const w = tour.winners[ri][mi];
      const isNext = !w && !tour.done && ri === tour.r && m.includes(myTribe);
      const side = (id, r) => `<span class="t ${r ? 'r' : ''} ${w && w !== id ? 'lose' : ''} ${id === myTribe ? 'you' : ''}">${r ? '' : (chiefImg(id, 'cp') || `<span class="dot" style="color:${tCol(id)};background:${tCol(id)}"></span>`)}${tName(id)}${id === myTribe ? ' (Kau)' : ''}${r ? (chiefImg(id, 'cp') || `<span class="dot" style="color:${tCol(id)};background:${tCol(id)}"></span>`) : ''}</span>`;
      d.innerHTML += `<div class="match ${isNext ? 'next' : ''}">${side(m[0])}<em>vs</em>${side(m[1], 1)}</div>`;
    });
    body.appendChild(d);
  });
  const alive = !tour.done && tour.rounds[tour.r].some(m => m.includes(myTribe));
  if (tour.done) {
    $('brTitle').innerHTML = tour.champ === myTribe ? (img('trophy') ? `<img class="trophy" src="${IMG.trophy.src}" alt=""><br>` : '🏆 ') + 'JUARA!' : 'Tamat Kejohanan';
    $('brBtn').textContent = 'KEMBALI KE MENU';
  } else {
    $('brTitle').innerHTML = 'Kejohanan · ' + RNAMES[tour.r];
    $('brBtn').textContent = alive ? 'MULA PERLAWANAN ▶' : 'TERUSKAN ▶';
  }
}
$('brBtn').onclick = () => {
  if (tour.done) { tour = null; show('menu'); buildTribeGrid(); return; }
  const ms = tour.rounds[tour.r], mi = ms.findIndex(m => m.includes(myTribe));
  if (mi >= 0 && !tour.winners[tour.r][mi]) {
    const foe = ms[mi][0] === myTribe ? ms[mi][1] : ms[mi][0];
    startBattle(myTribe, foe, tour.r);   // suku=mudah, separuh=sedang, final=susah
  } else advanceTour(null);
};
$('brQuit').onclick = () => { tour = null; show('menu'); buildTribeGrid(); };
function advanceTour(playerWon) {
  const ms = tour.rounds[tour.r];
  ms.forEach((m, i) => {
    if (tour.winners[tour.r][i]) return;
    if (m.includes(myTribe) && playerWon !== null) tour.winners[tour.r][i] = playerWon ? myTribe : (m[0] === myTribe ? m[1] : m[0]);
    else tour.winners[tour.r][i] = pick(m);
  });
  const ws = tour.winners[tour.r];
  if (ws.length === 1) { tour.done = true; tour.champ = ws[0]; if (ws[0] === myTribe) { store.cups = (store.cups || 0) + 1; save(); } }
  else { const nx = []; for (let i = 0; i < ws.length; i += 2) nx.push([ws[i], ws[i + 1]]); tour.rounds.push(nx); tour.winners.push([]); tour.r++; }
  renderBracket();
}

/* ================= BATTLE SETUP ================= */
const cv = $('cv'), ctx = cv.getContext('2d');
let DPR = 1, VW = 0, VH = 0, scale = 1, camX = 0, camTarget = 0, userPan = 0;
function resize() {
  DPR = Math.min(2, devicePixelRatio || 1);
  const r = cv.getBoundingClientRect(); VW = r.width; VH = r.height;
  cv.width = VW * DPR; cv.height = VH * DPR;
  // tinggi dunia ~400; pastikan sekurang-kurangnya 560 lebar nampak
  makeVignette();
  scale = Math.min(VH / 360, VW / (VW < VH ? 340 : 560));
}
addEventListener('resize', () => G && resize());

function makeSide(tid, isAI, d) {
  return { t: TRIBES.find(x => x.id === tid), ai: isAI, gold: 60, ups: { senjata: 0, zirah: 0, ekonomi: 0 }, ult: 0, baseHp: BASE_HP,
    buff: { shield: 0, rage: 0, ghost: 0, slow: 0, root: 0, poison: 0, silat: 0, gold: 0 }, skill: 4, cards: new Set(), d: d ?? 1, think: 0, plan: null, baseCd: 0, flash: 0, kills: 0 };
}
function startBattle(pT, eT, d) {
  G = { sides: [makeSide(pT, false), makeSide(eT, true, d)], units: [], corpses: [], drops: [], proj: [], fx: [], parts: [], t: 0, speed: 1, over: false, paused: false, shake: 0, nextCard: CARD_EVERY };
  show('battle'); resize(); camX = 0; userPan = 0;
  const P = G.sides[0], E = G.sides[1];
  E.gold = DIFF[d].start;
  $('pName').textContent = P.t.name + ' (Kau)'; $('pName').style.color = P.t.c; $('pHp').style.background = P.t.c; $('pHp').style.boxShadow = `0 0 8px ${P.t.c}`;
  $('eName').textContent = E.t.name + ' · AI ' + ['Mudah', 'Sedang', 'Susah'][d]; $('eName').style.color = E.t.c; $('eHp').style.background = E.t.c; $('eHp').style.boxShadow = `0 0 8px ${E.t.c}`;
  $('ultBtn').style.setProperty('--c', P.t.c); $('ultName').innerHTML = (img('icon_ult') ? `<img class="ic" src="${IMG.icon_ult.src}" alt=""> ` : '✦ ') + P.t.ult;
  $('skillBtn').style.setProperty('--c', P.t.c); $('skillName').textContent = SKILL[P.t.id][0];
  $('speedBtn').textContent = '1x';
  buildPanel();
  toast('PERANG!', P.t.c);
  setTimeout(() => G && toast('Pasif: ' + PASSIVE[P.t.id].split(':')[0], P.t.c, 1.6), 1300);
  // askar permulaan
  spawn(0, 'pedang', true); spawn(1, 'pedang', true);
}
function buildPanel() {
  const P = G.sides[0];
  const uw = $('units'); uw.innerHTML = '';
  [...UNIT_KEYS, 'e_' + P.t.id].forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k; if (UNITS[k].elite) b.className = 'elite';
    b.appendChild(miniStick(P.t.id, k, 34, 34));
    b.insertAdjacentHTML('beforeend', `<b>${UNITS[k].elite ? '♛ ' + UNITS[k].name.split(' ')[0] : unitName(P.t.id, k)}</b><small>🪙${UNITS[k].cost}</small><span class="cnt"></span>`);
    b.onclick = () => { if (buy(0, k)) snd('spawn'); };
    uw.appendChild(b);
  });
  const up = $('ups'); up.innerHTML = '';
  Object.keys(UPS).forEach(k => {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k;
    b.innerHTML = `<span class="lv"></span><b>${img('icon_' + k) ? `<img class="ic" src="${IMG['icon_' + k].src}" alt="">` : UPS[k].icon} ${UPS[k].name}</b><small></small>`;
    b.onclick = () => { if (upgrade(0, k)) snd('up'); };
    up.appendChild(b);
  });
}
const upCost = (s, k) => UPS[k].base * (s.ups[k] + 1);
function upgrade(si, k) {
  const s = G.sides[si];
  if (s.ups[k] >= MAXUP || s.gold < upCost(s, k)) return false;
  s.gold -= upCost(s, k); s.ups[k]++;
  if (k === 'zirah') G.units.forEach(u => { if (u.side === si) { const r = u.hp / u.maxHp; u.maxHp = unitMaxHp(u); u.hp = r * u.maxHp; } });
  if (si === 0) toast(UPS[k].name + ' Lv' + s.ups[k], '#9fe', 0.8);
  return true;
}
function costOf(si, k) {
  const s = G.sides[si]; let c = UNITS[k].cost;
  if (s.t.id === 'besi' && k === 'perisai') c *= 0.7;
  if (s.cards.has('murah')) c *= 0.8;
  return Math.round(c);
}
function buy(si, k) {
  const s = G.sides[si];
  if (s.gold < costOf(si, k) || G.over) return false;
  if (UNITS[k].elite && G.units.filter(u => u.side === si && u.type === k).length >= ELITE_MAX) { if (si === 0) toast('Maksimum ' + ELITE_MAX + ' ' + UNITS[k].name, '#f88', 0.8); return false; }
  if (G.units.filter(u => u.side === si).length >= 34) { if (si === 0) toast('Askar penuh!', '#f88', 0.7); return false; }
  s.gold -= costOf(si, k); const nu = spawn(si, k); if (UNITS[k].elite) { G.fx.push({ k: 'text', x: nu.x, y: GROUND - 90, s: UNITS[k].name.toUpperCase(), c: s.t.c, life: 1.2 }); if (si === 0) snd('up'); } return true;
}
const unitMaxHp = u => UNITS[u.type].hp * G.sides[u.side].t.mod.hp * (1 + 0.15 * G.sides[u.side].ups.zirah) * (u.type === 'pedang' && G.sides[u.side].cards.has('pedang') ? 1.4 : 1) * (u.stolen && G.sides[u.side].cards.has('rampas') ? 1.6 : 1);
function spawn(si, type, free, at) {
  const s = G.sides[si];
  const u = { id: Math.random(), side: si, dir: si ? -1 : 1, type, t: s.t, x: at ?? (si ? W - BASE_X - 10 : BASE_X + 10), y: rnd(0, 46), burn: 0, chill: 0, tox: 0,
    hp: 0, maxHp: 0, cd: rnd(0, 0.4), atk: 0, walk: rnd(0, 6), size: UNITS[type].size, stolen: false, hitFlash: 0, target: null };
  u.maxHp = unitMaxHp(u); u.hp = u.maxHp;
  G.units.push(u);
  for (let i = 0; i < 8; i++) G.parts.push({ x: u.x, y: GROUND + u.y - 20, vx: rnd(-60, 60), vy: rnd(-90, -10), life: 0.5, c: s.t.c, r: 2 });
  return u;
}

/* ================= UPDATE ================= */
function enemyOf(si) { return G.sides[1 - si]; }
function update(dt) {
  G.t += dt;
  G.sides.forEach((s, si) => {
    const behind = !s.ai && G.sides[1].d < 2 && G.units.filter(u => u.side === 0).length + 4 < G.units.filter(u => u.side === 1).length;
    s.gold += (6 + 2 * s.ups.ekonomi) * (s.ai ? DIFF[s.d].gold : behind ? 1.25 : 1) * (s.buff.gold ? 2 : 1) * dt;
    s.ult = Math.min(100, s.ult + dt * 1.1 * (s.cards.has('ultCas') ? 1.5 : 1) * (s.ai ? [0.6, 0.8, 1.1][s.d] : 1));
    s.skill = Math.max(0, s.skill - dt);
    for (const k in s.buff) s.buff[k] = Math.max(0, s.buff[k] - dt);
    s.flash = Math.max(0, s.flash - dt);
    // kubu menembak
    s.baseCd -= dt;
    if (s.baseCd <= 0) {
      const bx = si ? W - BASE_X : BASE_X;
      const tgt = nearestEnemy({ side: si, x: bx, dir: si ? -1 : 1 }, 230, true);
      if (tgt) { const hot = s.cards.has('kubuApi'); s.baseCd = hot ? 0.55 : 1.1; shoot({ side: si, x: bx, y: 20, size: 1.6, dir: si ? -1 : 1, t: s.t }, tgt, hot ? 14 : 9, 'arrow', -110); }
      else s.baseCd = 0.2;
    }
  });
  const E0 = G.sides[0], E1 = G.sides[1];
  // poison dmg (kabus racun kena pada pihak yang ada debuff)
  for (const u of G.units) {
    const me = G.sides[u.side];
    u.hitFlash = Math.max(0, u.hitFlash - dt);
    if (me.buff.poison > 0) damage(u, 6 * dt, null, true);
    if (me.buff.slow > 0) damage(u, 3 * dt, null, true);
    if (u.burn > 0) { u.burn -= dt; damage(u, 4 * dt, null, true); if (Math.random() < 0.15) G.parts.push({ x: u.x + rnd(-5, 5), y: GROUND + u.y - rnd(15, 45), vx: 0, vy: -50, life: 0.35, c: '#ff7a2e', r: 2 }); }
    if (u.tox > 0) { u.tox -= dt; damage(u, 4 * dt, null, true); }
    u.chill = Math.max(0, u.chill - dt);
    if (me.t.id === 'hutan' && u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + 1.4 * dt);
    if (u.ttl !== undefined && (u.ttl -= dt) <= 0) { u.hp = 0; u.noReward = true; }
    if (u.flipT > 0 && (u.flipT -= dt) <= 0) u.dir = u.side ? -1 : 1;
    if (u.stun > 0) u.stun -= dt;
    if (UNITS[u.type].mech === 'stealth') { u.reveal = Math.max(0, (u.reveal || 0) - dt); u.hidden = u.reveal <= 0; }
    if (u.leapCd > 0) u.leapCd -= dt;
  }
  for (const u of G.units) {
    if (u.hp <= 0) continue;
    const U = UNITS[u.type], me = G.sides[u.side], foe = enemyOf(u.side);
    if (u.stun > 0) { u.atk = 0; continue; }
    // Pahlawan Keris: lompat ke musuh
    if (U.mech === 'leap' && !(u.leapCd > 0)) { const far = nearestEnemy(u, 170); if (far && Math.abs(far.x - u.x) > 40) { const from = u.x; u.x = far.x - u.dir * 16; u.leapCd = 5; u.cd = 0;
      for (let k = 0; k < 14; k++) G.parts.push({ x: from + (u.x - from) * k / 14, y: GROUND + u.y - 40 - Math.sin(k / 14 * Math.PI) * 50, vx: 0, vy: -20, life: 0.5, c: u.t.c, r: 2.5 });
      G.fx.push({ k: 'text', x: u.x, y: GROUND + u.y - 90, s: 'HIAAA!', c: '#ffd36b', life: 0.7, sm: 1 }); } }
    let spd = U.spd * me.t.mod.spd * (me.buff.rage ? 1.5 : 1) * (me.buff.slow ? 0.35 : 1) * (u.chill ? 0.65 : 1) * (me.t.id === 'bulan' ? 1 + Math.min(0.35, G.t / 360) : 1) * (me.cards.has('laju') ? 1.15 : 1) * (u.type === 'gergaji' && me.cards.has('gergaji') ? 1.35 : 1);
    if (me.buff.root) spd = 0;
    u.cd -= dt * (me.buff.rage ? 1.5 : 1) * (me.buff.slow ? 0.5 : 1) * (me.buff.silat && U.melee ? 3 : 1) * (u.type === 'gergaji' && me.cards.has('gergaji') ? 1.35 : 1);
    u.atk = Math.max(0, u.atk - dt * 3);
    const tgt = nearestEnemy(u, U.range + 4);
    if (u.flipT > 0 && !tgt) { u.flipT = 0; u.dir = u.side ? -1 : 1; } // habis lawan di belakang, pusing semula
    const foeBaseX = u.side ? BASE_X + 26 : W - BASE_X - 26;
    const atBase = Math.abs(foeBaseX - u.x) <= U.range + 6;
    if (tgt || atBase) {
      if (u.cd <= 0) {
        u.cd = U.rate; u.atk = 1;
        let dmg = U.dmg * me.t.mod.dmg * (1 + 0.15 * me.ups.senjata) * (me.buff.rage ? 1.7 : 1) * (u.type === 'pedang' && me.cards.has('pedang') ? 1.4 : 1);
        if (me.t.id === 'pendekar' && u.type === 'pedang' && Math.random() < 0.25) { dmg *= 2; if (G.fx.length < 120) G.fx.push({ k: 'text', x: u.x, y: GROUND + u.y - 70, s: 'KRITIKAL!', c: '#ffd36b', life: 0.6, sm: 1 }); }
        if (U.mech) u.reveal = 1.5;
        if (tgt && U.mech && mech(u, U, tgt, dmg, me)) {
          // dah diurus oleh mech()
        } else if (tgt) {
          if (U.melee) {
            damage(tgt, dmg, u);
            if (me.cards.has('vamp')) u.hp = Math.min(u.maxHp, u.hp + dmg * 0.25);
            if (U.cleave) { const t2 = G.units.find(o => o !== tgt && o.side !== u.side && o.hp > 0 && Math.abs(o.x - u.x) < U.range + 8); if (t2) damage(t2, dmg, u); }
            if (u.type !== 'gergaji' || Math.random() < 0.25) hitSnd();
            if (u.type === 'gergaji') for (let i = 0; i < 2; i++) G.parts.push({ x: u.x + u.dir * 30 * u.size, y: GROUND + u.y - 32 * u.size, vx: u.dir * rnd(40, 160), vy: rnd(-160, -20), life: 0.35, c: '#ffd36b', r: 1.6 });
          } else { shoot(u, tgt, dmg, 'arrow'); if (u.type === 'panah' && me.cards.has('panah2')) { const t2 = G.units.find(o => o !== tgt && o.side !== u.side && o.hp > 0 && Math.abs(o.x - u.x) < U.range) || tgt; setTimeout(() => G && t2.hp > 0 && shoot(u, t2, dmg, 'arrow'), 120); } if (u.side === 0) snd('shoot'); }
        } else {
          foe.baseHp -= dmg * (U.melee ? 1 : 0.8); foe.flash = 0.15;
          for (let i = 0; i < 3; i++) G.parts.push({ x: foeBaseX, y: GROUND - rnd(10, 80), vx: rnd(-80, 80) , vy: rnd(-120, 0), life: 0.4, c: foe.t.c, r: 2 });
          if (foe.baseHp <= 0) endBattle(u.side === 0);
        }
      }
    } else {
      u.x += u.dir * spd * dt; u.walk += dt * spd * 0.16;
    }
    // rampas senjata yang jatuh
    for (const d of G.drops) {
      if (d.taken || U.special || u.clone || Math.abs(d.x - u.x) > 14 || Math.abs(d.y - u.y) > 26) continue;
      if (UNITS[d.type].cost > UNITS[u.type].cost) {
        const r = u.hp / u.maxHp; u.type = d.type; u.wt = d.wt; u.size = UNITS[d.type].size; u.stolen = d.wt !== u.t.id; u.maxHp = unitMaxHp(u); u.hp = Math.max(r, 0.6) * u.maxHp;
        d.taken = true; snd('pick');
        G.fx.push({ k: 'text', x: u.x, y: GROUND + u.y - 70, s: 'RAMPAS!', c: me.t.c, life: 1 });
      }
    }
    u.x = clamp(u.x, BASE_X, W - BASE_X);
  }
  // mati -> ragdoll + jatuh senjata
  for (const u of G.units) if (u.hp <= 0 && !u.dead) kill(u);
  G.units = G.units.filter(u => !u.dead);
  G.drops = G.drops.filter(d => !d.taken && (d.life -= dt) > 0);
  // projektil
  for (const p of G.proj) {
    p.t += dt / p.dur;
    if (p.t >= 1 && !p.done) {
      p.done = true;
      if (p.aoe && p.aoe.kind) { const A = p.aoe;
        G.units.forEach(u => { if (u.side !== A.si && u.hp > 0 && Math.abs(u.x - A.x) < A.r) { damage(u, A.dmg, { dir: 1, side: A.si }); if (A.kind === 'ice') { u.chill = 2.5; if (!UNITS[u.type].elite) u.stun = 0.6; } else u.tox = 5; } });
        G.fx.push({ k: 'ring', x: A.x, y: p.ty, c: p.c, life: 0.35, max: 0.35 });
        for (let k = 0; k < 14; k++) G.parts.push({ x: A.x + rnd(-10, 10), y: p.ty, vx: rnd(-110, 110), vy: rnd(-150, -20), life: 0.55, c: p.c, r: 3 }); }
      else if (p.aoe) { G.units.forEach(u => { if (u.side !== p.aoe.si && u.hp > 0 && Math.abs(u.x - p.aoe.x) < 30) { u.tox = 4; damage(u, 9, { dir: 1, side: p.aoe.si }); } });
        for (let k = 0; k < 5; k++) G.parts.push({ x: p.tx, y: p.ty, vx: rnd(-60, 60), vy: rnd(-90, -20), life: 0.4, c: p.c, r: 2.5 }); }
      else if (p.tgt && p.tgt.hp > 0) damage(p.tgt, p.dmg, p.src);
    }
  }
  G.proj = G.proj.filter(p => !p.done);
  // ragdoll
  for (const c of G.corpses) stepRagdoll(c, dt);
  G.corpses = G.corpses.filter(c => (c.life -= dt) > 0);
  if (G.corpses.length > 70) G.corpses.splice(0, G.corpses.length - 70);
  for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
  G.parts = G.parts.filter(p => p.life > 0);
  if (G.parts.length > 400) G.parts.splice(0, G.parts.length - 400);
  for (const f of G.fx) { f.life -= dt; if (f.step) f.step(f, dt); }
  G.fx = G.fx.filter(f => f.life > 0);
  G.shake = Math.max(0, G.shake - dt * 30);
  // AI
  aiThink(G.sides[1], 1, dt);
  if (!G.over && G.t >= G.nextCard) { G.nextCard += CARD_EVERY; offerCards(); }
}
function mech(u, U, tgt, dmg, me) {
  const fi = 1 - u.side, foes = G.units.filter(o => o.side === fi && o.hp > 0 && !o.hidden);
  const ahead = (o, r) => { const dx = (o.x - u.x) * u.dir; return dx > -12 && dx < r; };
  const naga = U.shape === 'naga';
  const hx = u.x + u.dir * (naga ? 30 : 20) * u.size, hy = GROUND + u.y - (naga ? 50 : 38) * u.size;
  switch (U.mech) {
    case 'flame':
      foes.forEach(o => { if (ahead(o, U.range + 4)) { damage(o, dmg, u, true); o.burn = 3; o.hitFlash = 0.08; } });
      for (let i = 0; i < 6; i++) G.parts.push({ x: hx, y: hy, vx: u.dir * rnd(140, 260), vy: rnd(-50, 30), life: 0.35, c: pick(['#ff7a2e', '#ffd36b', '#ff4d00']), r: 3.5 });
      return true;
    case 'beam': {
      const hit = foes.filter(o => ahead(o, U.range + 4));
      hit.forEach(o => damage(o, dmg, u));
      G.fx.push({ k: 'beam', x1: hx, y1: hy, x2: hx + u.dir * U.range, y2: hy + 6, c: u.t.c, life: 0.3, max: 0.3 });
      if (u.side === 0) snd('shoot');
      return true;
    }
    case 'punch':
      damage(tgt, dmg, u); if (!UNITS[tgt.type].special && !UNITS[tgt.type].elite) { tgt.x = clamp(tgt.x + u.dir * 28, BASE_X, W - BASE_X); tgt.stun = 0.4; }
      G.shake = Math.max(G.shake, 3); hitSnd();
      return true;
    case 'slam':
      foes.forEach(o => { if (Math.abs(o.x - tgt.x) < 55) { damage(o, dmg, u); if (!UNITS[o.type].elite) o.stun = 0.9; } });
      G.units.forEach(o => { if (o.side === u.side && o.hp > 0 && Math.abs(o.x - u.x) < 70) o.hp = Math.min(o.maxHp, o.hp + 10); });
      G.fx.push({ k: 'ring', x: tgt.x, y: GROUND + tgt.y - 4, c: u.t.c, life: 0.35, max: 0.35 });
      for (let i = 0; i < 10; i++) G.parts.push({ x: tgt.x + rnd(-40, 40), y: GROUND + tgt.y, vx: rnd(-40, 40), vy: rnd(-160, -60), life: 0.5, c: '#7dff6a', r: 2.5 });
      G.shake = Math.max(G.shake, 4); hitSnd();
      return true;
    case 'iceball': case 'flask': {
      const ice = U.mech === 'iceball';
      G.proj.push({ sx: hx, sy: hy, tgt: null, tx: tgt.x, ty: GROUND + tgt.y - 10, t: 0, dur: 0.45, dmg: 0, src: u, c: ice ? '#d6f4ff' : '#b8ff2a', arc: 50, big: 1,
        aoe: { x: tgt.x, si: u.side, r: ice ? 45 : 50, dmg, kind: ice ? 'ice' : 'tox' } });
      return true;
    }
  }
  return false; // leap & stealth guna serangan biasa
}
function nearestEnemy(u, range, ignoreGhost) {
  let best = null, bd = 1e9;
  const ghost = G.sides[1 - u.side].buff.ghost > 0;
  if (ghost && !ignoreGhost) return null;
  for (const o of G.units) {
    if (o.side === u.side || o.hp <= 0 || o.hidden) continue;
    const dx = (o.x - u.x) * u.dir;
    if (dx < -10 || dx > range) continue;
    if (dx < bd) { bd = dx; best = o; }
  }
  return best;
}
function damage(u, dmg, src, silent) {
  const me = G.sides[u.side];
  if (src && src.t && !silent) {
    if (me.t.id === 'bunian' && Math.random() < 0.15) { if (G.fx.length < 120) G.fx.push({ k: 'text', x: u.x, y: GROUND + u.y - 66 * u.size, s: 'MISS', c: '#5ff5d8', life: 0.5, sm: 1 }); return; }
    if (src.t.id === 'api') u.burn = 2.5;
    if (src.t.id === 'ais') u.chill = 1.6;
    if (u.type === 'perisai' && me.cards.has('duri') && src.hp > 0 && UNITS[src.type] && UNITS[src.type].melee) src.hp -= dmg * 0.35;
  }
  let d = dmg * (1 - UNITS[u.type].armor);
  if (me.buff.shield) d *= 0.4;
  u.hp -= d;
  if (!silent) { u.hitFlash = 0.12; u.lastHitDir = src ? src.dir : -u.dir;
    if (G.fx.length < 120) G.fx.push({ k: 'ring', x: u.x, y: GROUND + u.y - 32 * u.size, c: src && src.t ? src.t.c : '#fff', life: 0.22, max: 0.22 });
    const elx = src && THEME[src.wt || (src.t && src.t.id)];
    if (elx && G.parts.length < 360) for (let i = 0; i < 4; i++) G.parts.push({ x: u.x + rnd(-6, 6), y: GROUND + u.y - 32 * u.size + rnd(-8, 8), vx: rnd(-60, 60) + (src.dir || 0) * 40, vy: rnd(-120, -20), life: rnd(0.25, 0.5), c: pick(elx.el), r: rnd(1.6, 3) });
    if (d >= 18 && G.fx.length < 120) G.fx.push({ k: 'text', x: u.x + rnd(-6, 6), y: GROUND + u.y - 62 * u.size, s: Math.round(d), c: '#fff', life: 0.7, sm: 1 });
    for (let i = 0; i < 3; i++) G.parts.push({ x: u.x, y: GROUND + u.y - 34 * u.size, vx: rnd(-70, 70) + (src ? src.dir * 60 : 0), vy: rnd(-110, -20), life: 0.35, c: '#fff', r: 1.6 }); }
  if (u.hp <= 0 && src && !u.killedBy) u.killedBy = src.side;
}
function kill(u) {
  u.dead = true;
  const killer = 1 - u.side, ks = G.sides[killer], U = UNITS[u.type];
  if (u.t.id === 'racun' && !U.special) {
    for (let i = 0; i < 14; i++) G.parts.push({ x: u.x, y: GROUND + u.y - 25, vx: rnd(-120, 120), vy: rnd(-140, -20), life: 0.6, c: '#b8ff2a', r: 3 });
    G.units.forEach(o => { if (o.side !== u.side && o.hp > 0 && Math.abs(o.x - u.x) < 45) { o.tox = 3; damage(o, 8, null, true); } });
  }
  if (U.special) { u.dead = true; for (let i = 0; i < 20; i++) G.parts.push({ x: u.x + rnd(-15, 15), y: GROUND + u.y - rnd(0, 60), vx: rnd(-90, 90), vy: rnd(-160, -20), life: 0.6, c: u.t.c, r: 2.5 }); return; }
  if (!u.noReward && !u.clone) {
    ks.gold += U.cost * 0.3;
    ks.ult = Math.min(100, ks.ult + U.cost * 0.22);
    ks.kills++;
  }
  if (U.shape) { G.shake = Math.max(G.shake, 6); snd('boom'); for (let i = 0; i < 40; i++) G.parts.push({ x: u.x + rnd(-20, 20) * u.size, y: GROUND + u.y - rnd(5, 55) * u.size, vx: rnd(-160, 160), vy: rnd(-220, -30), life: rnd(0.5, 1), c: pick([u.t.c, '#ffffff', u.t.g]), r: rnd(2, 4) });
    G.fx.push({ k: 'ring', x: u.x, y: GROUND + u.y - 30 * u.size, c: u.t.c, life: 0.4, max: 0.4 }); return; }
  if (u.clone) { for (let i = 0; i < 10; i++) G.parts.push({ x: u.x, y: GROUND + u.y - rnd(0, 50), vx: rnd(-40, 40), vy: rnd(-80, -10), life: 0.5, c: u.t.c, r: 2 }); return; }
  if (!U.elite && Math.random() < 0.55) G.drops.push({ x: u.x, y: u.y, type: u.type, wt: u.wt || u.t.id, life: 9, c: TRIBES.find(t => t.id === (u.wt || u.t.id)).c, rot: rnd(-0.4, 0.4) });
  const j = pose(u, 0, 0), dir = u.lastHitDir || -u.dir, pow = u.type === 'gergaji' ? 1.3 : 1;
  const pts = {};
  for (const k in j) { const p = j[k]; pts[k] = { x: p.x, y: p.y, px: p.x - dir * rnd(1.5, 4.5) * pow, py: p.y + rnd(2, 5) * pow }; }
  G.corpses.push({ pts, side: u.side, c: u.t.c, g: u.t.g, size: u.size, life: 4, type: u.type, dy: u.y, x0: u.x });
  if (G.corpses.length % 3 === 0) snd('die');
}
const BONES = [['head', 'neck'], ['neck', 'hip'], ['neck', 'hb'], ['neck', 'hf'], ['hip', 'fb'], ['hip', 'ff']];
function stepRagdoll(c, dt) {
  const gy = GROUND + c.dy;
  const f = Math.min(dt * 60, 2);
  for (const k in c.pts) {
    const p = c.pts[k], vx = (p.x - p.px) * 0.985, vy = (p.y - p.py) * 0.985;
    p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + 0.35 * f;
    if (p.y > gy) { p.y = gy; p.px = p.x - vx * 0.5; }
  }
  if (!c.len) { c.len = BONES.map(([a, b]) => Math.hypot(c.pts[a].x - c.pts[b].x, c.pts[a].y - c.pts[b].y)); }
  for (let it = 0; it < 3; it++) BONES.forEach(([a, b], i) => {
    const A = c.pts[a], B = c.pts[b], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 0.01, df = (d - c.len[i]) / d / 2;
    A.x += dx * df; A.y += dy * df; B.x -= dx * df; B.y -= dy * df;
  });
}
function shoot(src, tgt, dmg, kind, lift) {
  const sx = src.x + src.dir * 10, sy = GROUND + (src.y || 0) - 40 * (src.size || 1) + (lift || 0);
  const dist = Math.abs(tgt.x - sx);
  const st = THEME[(src.wt) || (src.t && src.t.id)] ? THEME[src.wt || src.t.id].proj : 'arrow';
  const fast = st === 'dart' || st === 'bolt', lob = st === 'poison' || st === 'fire';
  G.proj.push({ sx, sy, tgt, tx: tgt.x, ty: GROUND + tgt.y - 30, t: 0, dur: (fast ? 0.15 : 0.25) + dist / (fast ? 800 : 520), dmg, src, c: src.t.c, arc: fast ? 6 + dist * 0.05 : (lob ? 30 : 18) + dist * (lob ? 0.25 : 0.18), st });
}

/* ================= ULTIMATE ================= */
function useUlt(si) {
  const s = G.sides[si], foe = enemyOf(si), fi = 1 - si;
  if (s.ult < 100 || G.over) return false;
  s.ult = 0; snd('ult'); G.shake = 10;
  const foes = () => G.units.filter(u => u.side === fi && u.hp > 0);
  const mine = () => G.units.filter(u => u.side === si && u.hp > 0);
  toast((si ? 'MUSUH: ' : '') + s.t.ult.toUpperCase() + '!', s.t.c, 1.2);
  G.fx.push({ k: 'flash', c: s.t.c, life: 0.4, max: 0.4 });
  switch (s.t.id) {
    case 'api': {
      const fs = foes(); const spots = [];
      for (let i = 0; i < 4; i++) spots.push(fs.length ? pick(fs).x + rnd(-30, 30) : (si ? BASE_X + 200 : W - BASE_X - 200) + rnd(-100, 100));
      spots.forEach((x, i) => G.fx.push({ k: 'meteor', x, c: s.t.c, life: 0.7 + i * 0.25, max: 0.7 + i * 0.25, hit: false, si,
        step(f) { if (!f.hit && f.life < 0.12) { f.hit = true; G.shake = 8; snd('boom');
          G.units.forEach(u => { if (u.side === fi && Math.abs(u.x - f.x) < 75) damage(u, 70, { dir: u.x > f.x ? 1 : -1, side: si }); });
          for (let k = 0; k < 30; k++) G.parts.push({ x: f.x, y: GROUND, vx: rnd(-200, 200), vy: rnd(-300, -50), life: 0.8, c: pick([s.t.c, '#fff', s.t.g]), r: 3 }); } } }));
      break;
    }
    case 'bulan':
      G.fx.push({ k: 'wave', x: si ? W - BASE_X : BASE_X, dir: si ? -1 : 1, c: s.t.c, life: 2.4, max: 2.4, hitIds: new Set(),
        step(f, dt) { f.x += f.dir * 650 * dt; G.units.forEach(u => { if (u.side === fi && !f.hitIds.has(u.id) && Math.abs(u.x - f.x) < 30) { f.hitIds.add(u.id); damage(u, 55, { dir: f.dir, side: si }); } }); } });
      break;
    case 'besi': s.buff.shield = 7; break;
    case 'hutan': foe.buff.root = 4; foes().forEach(u => damage(u, 15, null)); break;
    case 'pendekar': s.buff.rage = 7; break;
    case 'bunian': s.buff.ghost = 5; mine().forEach(u => { u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.35); }); break;
    case 'ais': foe.buff.slow = 6; break;
    case 'racun': foe.buff.poison = 6; break;
  }
  return true;
}
$('ultBtn').onclick = () => { if (G && !G.paused) useUlt(0); };
$('skillBtn').onclick = () => { if (G && !G.paused) useSkill(0); };
function front(si) { // x barisan depan sendiri & musuh
  const mine = G.units.filter(u => u.side === si && u.hp > 0 && !UNITS[u.type].special), foes = G.units.filter(u => u.side !== si && u.hp > 0);
  const d = si ? -1 : 1, home = si ? W - BASE_X : BASE_X;
  const myF = mine.length ? (d > 0 ? Math.max(...mine.map(u => u.x)) : Math.min(...mine.map(u => u.x))) : home + d * 60;
  const foeF = foes.length ? (d > 0 ? Math.min(...foes.map(u => u.x)) : Math.max(...foes.map(u => u.x))) : (si ? BASE_X + 80 : W - BASE_X - 80);
  return { myF, foeF, foes, mine, d };
}
function densest(foes, fallback) {
  if (!foes.length) return fallback;
  let best = foes[0].x, bn = 0;
  for (const a of foes) { const n = foes.filter(b => Math.abs(b.x - a.x) < 60).length; if (n > bn) { bn = n; best = a.x; } }
  return best;
}
function useSkill(si) {
  const s = G.sides[si], fi = 1 - si;
  if (s.skill > 0 || G.over) return false;
  s.skill = SKILL_CD * (s.cards.has('skillCd') ? 0.6 : 1) * (s.ai ? [1.6, 1.3, 0.9][s.d] : 1);
  const F = front(si), id = s.t.id;
  snd('up'); toast((si ? 'MUSUH: ' : '') + SKILL[id][0] + '!', s.t.c, 0.9);
  if (id === 'api') {
    const x = densest(F.foes, F.foeF);
    G.fx.push({ k: 'meteor', x, c: s.t.c, life: 0.55, max: 0.55, hit: false, step(f) { if (!f.hit && f.life < 0.12) { f.hit = true; G.shake = 6; snd('boom');
      G.units.forEach(u => { if (u.side === fi && Math.abs(u.x - f.x) < 60) { damage(u, 45, { dir: u.x > f.x ? 1 : -1, side: si, t: s.t }); } });
      for (let k = 0; k < 24; k++) G.parts.push({ x: f.x, y: GROUND, vx: rnd(-180, 180), vy: rnd(-260, -40), life: 0.7, c: pick([s.t.c, '#fff']), r: 3 }); } } });
  } else if (id === 'bulan') {
    const jumpers = F.mine.filter(u => UNITS[u.type].melee).sort((a, b) => (b.x - a.x) * F.d).slice(0, 3);
    if (!jumpers.length) { s.skill = 1; return false; }
    jumpers.forEach((u, i) => { const from = u.x; u.x = clamp(F.foeF + F.d * (50 + i * 18), BASE_X + 30, W - BASE_X - 30); u.dir = -F.d; u.flipT = 6;
      for (let k = 0; k < 12; k++) G.parts.push({ x: from, y: GROUND + u.y - rnd(0, 50), vx: rnd(-40, 40), vy: rnd(-100, -20), life: 0.5, c: s.t.c, r: 2 }); });
  } else if (id === 'besi') {
    const w = spawn(si, 'tembok', true, clamp(F.myF + F.d * 30, BASE_X + 40, W - BASE_X - 40)); w.ttl = 10; w.y = 22;
  } else if (id === 'hutan') {
    const t = spawn(si, 'pokok', true, clamp(F.myF - F.d * 20, BASE_X + 40, W - BASE_X - 40)); t.ttl = 14;
  } else if (id === 'pendekar') {
    s.buff.silat = 4;
  } else if (id === 'bunian') {
    for (let i = 0; i < 3; i++) { const c = spawn(si, 'pedang', true, clamp(F.myF + F.d * rnd(-10, 15), BASE_X + 20, W - BASE_X - 20)); c.clone = true; c.ttl = 9; }
  } else if (id === 'ais') {
    G.units.forEach(u => { if (u.side === fi && Math.abs(u.x - F.foeF) < 180) { u.x = clamp(u.x + F.d * 70, BASE_X, W - BASE_X); u.chill = 3; damage(u, 10, null); } });
    G.fx.push({ k: 'flash', c: '#d6f4ff', life: 0.3, max: 0.3 });
  } else if (id === 'racun') {
    const x = densest(F.foes, F.foeF);
    for (let i = 0; i < 12; i++) setTimeout(() => { if (!G || G.over) return; const tx = x + rnd(-70, 70);
      G.proj.push({ sx: tx - F.d * 40, sy: GROUND - 260, tgt: null, tx, ty: GROUND + rnd(0, 40), t: 0, dur: 0.35, dmg: 0, src: null, c: s.t.c, arc: 0, aoe: { x: tx, si } }); }, i * 60);
  }
  return true;
}
/* ================= KAD TAKTIK ================= */
function cardPool(s) { return CARDS.filter(c => c.once || !s.cards.has(c.id)); }
function applyCard(si, c) {
  const s = G.sides[si];
  if (c.id === 'emas') s.buff.gold = 25;
  else if (c.id === 'baiki') s.baseHp = Math.min(BASE_HP, s.baseHp + 400);
  else if (c.id === 'pasukan') for (let i = 0; i < 4; i++) spawn(si, 'pedang', true);
  else s.cards.add(c.id);
  if (c.id === 'pedang' || c.id === 'rampas') G.units.forEach(u => { if (u.side === si) { const r = u.hp / u.maxHp; u.maxHp = unitMaxHp(u); u.hp = r * u.maxHp; } });
}
function offerCards() {
  const E = G.sides[1];
  const ec = pick(cardPool(E)); applyCard(1, ec);
  const opts = cardPool(G.sides[0]).sort(() => Math.random() - 0.5).slice(0, 3);
  G.paused = true; snd('ult');
  $('mTitle').textContent = 'KAD TAKTIK'; $('mTitle').style.color = '#ffd36b'; $('mTitle').style.textShadow = '0 0 14px #ffaa00';
  $('mText').innerHTML = `Pilih satu kad.<br><small style="color:${E.t.c}">AI ambil: ${ec.ic} ${ec.t}</small>`;
  const b = $('mBtns'); b.innerHTML = '';
  opts.forEach(c => { const e = document.createElement('button'); e.type = 'button'; e.className = 'card-btn';
    e.innerHTML = `<span class="ci">${c.ic}</span><span><b>${c.t}</b><small>${c.d}</small></span>`;
    e.onclick = () => { $('modal').classList.add('hidden'); applyCard(0, c); snd('pick'); toast(c.t + '!', '#ffd36b', 1); G.paused = false; };
    b.appendChild(e); });
  $('modal').classList.remove('hidden');
}

/* ================= AI ================= */
function aiThink(s, si, dt) {
  s.think -= dt;
  if (s.think > 0 || G.over) return;
  const D = DIFF[s.d];
  s.think = D.think * rnd(0.7, 1.3);
  const mine = G.units.filter(u => u.side === si), theirs = G.units.filter(u => u.side !== si);
  // ultimate
  if (s.ult >= 100) {
    const near = theirs.filter(u => Math.abs(u.x - (si ? W - BASE_X : BASE_X)) < 500).length;
    const fight = theirs.length >= 5 || near >= 3 || s.baseHp < BASE_HP * 0.4;
    if (fight && Math.random() < 0.5 + D.smart * 0.5) { useUlt(si); return; }
  }
  // skill kecil
  if (s.skill <= 0 && theirs.length >= 3 && Math.random() < D.skill) { if (useSkill(si)) return; }
  // upgrade sekali-sekala
  if (!s.plan && Math.random() < 0.08 + D.smart * 0.1) {
    const opts = Object.keys(UPS).filter(k => s.ups[k] < MAXUP);
    if (opts.length) s.plan = { up: s.ups.ekonomi < 2 && G.t < 90 && Math.random() < D.smart ? 'ekonomi' : pick(opts) };
  }
  if (s.plan && s.plan.up) {
    if (s.gold >= upCost(s, s.plan.up)) { upgrade(si, s.plan.up); s.plan = null; }
    else if (theirs.length > mine.length + 3) s.plan = null; // kecemasan: lupakan upgrade
    else return;
  }
  // pilih askar (counter kalau pandai)
  let want;
  if (Math.random() < D.smart) {
    const cnt = k => theirs.filter(u => u.type === k).length;
    const myFront = mine.filter(u => UNITS[u.type].melee).length, myBack = mine.filter(u => u.type === 'panah').length;
    if (cnt('panah') >= 3) want = 'gergaji';
    else if (cnt('gergaji') >= 2) want = 'panah';
    else if (myBack > myFront) want = pick(['perisai', 'pedang']);
    else if (myFront > myBack + 2) want = 'panah';
    else want = pick(UNIT_KEYS);
  } else want = pick(['pedang', 'pedang', 'panah', 'perisai', 'gergaji']);
  const ek = 'e_' + s.t.id;
  if (s.gold >= costOf(si, ek) && G.units.filter(u => u.side === si && u.type === ek).length < ELITE_MAX && Math.random() < D.elite) { buy(si, ek); return; }
  if (s.gold >= UNITS[want].cost) buy(si, want);
  else if (s.gold >= UNITS.pedang.cost && (theirs.length > mine.length + 2 || Math.random() < 0.3)) buy(si, 'pedang');
}

/* ================= DRAW ================= */
const glowCache = {};
function glow(col) {
  if (glowCache[col]) return glowCache[col];
  const key = col; if (col.length === 4) col = '#' + col[1] + col[1] + col[2] + col[2] + col[3] + col[3];
  const g = document.createElement('canvas'); g.width = g.height = 64;
  const x = g.getContext('2d'), r = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, col); r.addColorStop(0.25, col + 'aa'); r.addColorStop(1, col + '00');
  x.fillStyle = r; x.fillRect(0, 0, 64, 64);
  return (glowCache[key] = g);
}
const blob = (c, col, x, y, rx, ry, a) => { c.globalAlpha = a; c.drawImage(glow(col), x - rx, y - (ry ?? rx), rx * 2, (ry ?? rx) * 2); };
const embers = [];
let vign = null;
function makeVignette() {
  vign = document.createElement('canvas'); vign.width = Math.max(1, VW * DPR); vign.height = Math.max(1, VH * DPR);
  const x = vign.getContext('2d'), r = x.createRadialGradient(vign.width / 2, vign.height * 0.62, vign.height * 0.15, vign.width / 2, vign.height * 0.62, Math.max(vign.width, vign.height) * 0.8);
  r.addColorStop(0, '#00000000'); r.addColorStop(1, '#000000cc'); x.fillStyle = r; x.fillRect(0, 0, vign.width, vign.height);
}

function pose(u, ox, oy) {
  const s = u.size, d = u.dir ?? (u.side ? -1 : 1), gy = GROUND + (u.y || 0) + (oy || 0), x = u.x + (ox || 0);
  const moving = u.atk <= 0.01;
  const p = u.walk, sw = moving ? Math.sin(p) : 0;
  const bob = moving ? Math.abs(Math.cos(p)) * 2 : 0;
  const lean = (u.atk > 0 ? u.atk * 5 : 2) * d;
  const hip = { x, y: gy - 22 * s - bob };
  const neck = { x: x + lean, y: gy - 46 * s - bob };
  const head = { x: neck.x + 1.5 * d, y: neck.y - 9 * s };
  const ff = { x: x + (sw * 10 + 3) * d * s, y: gy - (moving ? Math.max(0, -Math.cos(p)) * 4 : 0) };
  const fb = { x: x - (sw * 10 + 3) * d * s, y: gy - (moving ? Math.max(0, Math.cos(p)) * 4 : 0) };
  // tangan depan pegang senjata
  const a = u.atk; let ang;
  const sh = UNITS[u.type] && !UNITS[u.type].elite && THEME[u.wt || (u.t && u.t.id)] ? weaponOf(u).shape : wpnOf(u.type);
  const cat = SHAPE_CAT[sh];
  if (sh === 'tinju_api') ang = a > 0 ? -0.15 + (1 - a) * 0.15 : 0.35;
  else if (sh === 'orb') ang = a > 0 ? -1.3 + (1 - a) * 1.6 : -0.5;
  else if (sh === 'busur_silang' || sh === 'sumpit') ang = -0.08;
  else if (sh === 'lembing') ang = a > 0 ? -0.1 + (1 - a) * 0.1 : -0.35;
  else if (cat === 'bow') ang = -0.15;
  else if (cat === 'shield') ang = 0.1 - a * 0.6;
  else if (sh === 'tongkat_roh') ang = -0.9 + a * 0.7;
  else if (wpnOf(u.type) === 'panah') ang = -0.15;
  else if (wpnOf(u.type) === 'perisai') ang = 0.1 - a * 0.6;
  else if (wpnOf(u.type) === 'tongkat' || wpnOf(u.type) === 'obor') ang = -0.9 + a * 0.7;
  else if (wpnOf(u.type) === 'tinju') ang = a > 0 ? -0.3 + (1 - a) * 0.3 : 0.5;
  else if (sh === 'gergaji') ang = 0.15 + Math.sin(G ? G.t * 40 : 0) * 0.04 * (a > 0 ? 1 : 0);
  else ang = a > 0 ? (-2.0 + (1 - a) * 2.8) : -0.6 + sw * 0.15;
  const al = 17 * s;
  const hf = { x: neck.x + Math.cos(ang) * al * d, y: neck.y + 4 * s + Math.sin(ang) * al };
  const hb = { x: neck.x - (sw * 8 + 4) * d * s, y: neck.y + 15 * s };
  return { head, neck, hip, hf, hb, ff, fb, ang };
}
function drawWeapon(c, type, hx, hy, ang, d, s, col, atk, W) {
  c.save(); c.translate(hx, hy); c.scale(d, 1); c.rotate(ang);
  c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round';
  const ti = W && (img(W.img) || (W.alt && img(W.alt)));
  if (ti) {
    const ar = ti.width / ti.height, cat = SHAPE_CAT[type] || 'long';
    if (cat === 'long') { const w = (SHAPE_LEN[type] || 38) * s, h = w / ar; c.drawImage(ti, -7 * s, -h / 2, w, h); }
    else if (cat === 'bow') { const h = 36 * s, w = h * ar; c.drawImage(ti, -w / 2, -h / 2, w, h); }
    else if (cat === 'shield') { const h = 32 * s, w = h * ar; c.drawImage(ti, 0, -h / 2, w, h); }
    else { const z = (type === 'tinju_api' ? 15 : 13) * s; c.drawImage(ti, -z / 2 + 3 * s, -z / 2, z, z * ti.height / ti.width); }
    if (cat === 'long' && atk > 0.25 && type !== 'busur_silang' && type !== 'sumpit') slash(c, s, atk);
    c.restore(); return;
  }
  if (type === 'tinju_api' || type === 'orb') {
    // tangan berkuasa elemen: bola tenaga di tapak tangan
    const g = c.globalAlpha, r = (type === 'tinju_api' ? 6 : 4.5) * s * (1 + atk * 0.4), t = G ? G.t : 0;
    c.globalCompositeOperation = 'lighter';
    blob(c, col, 3 * s, 0, r * 2.4, r * 2.4, g * 0.9);
    for (let i = 0; i < 3; i++) blob(c, col, 3 * s + Math.cos(t * 9 + i * 2.1) * r * 0.6, -Math.abs(Math.sin(t * 7 + i)) * r * 1.4, r, r, g * 0.6);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = g;
    c.fillStyle = '#fff'; c.beginPath(); c.arc(3 * s, 0, r * 0.45, 0, 7); c.fill();
    c.restore(); return;
  }
  if (type === 'sabit' || type === 'sabit_besar') {
    const L = (SHAPE_LEN[type]) * s;
    c.lineWidth = 2.2 * s; c.beginPath(); c.moveTo(-4 * s, 0); c.lineTo(L * 0.75, 0); c.stroke();
    c.lineWidth = 2.6 * s; c.beginPath(); c.arc(L * 0.75, -L * 0.28, L * 0.3, Math.PI * 0.5, Math.PI * 1.55, true); c.stroke();
    if (atk > 0.25) slash(c, s, atk);
    c.restore(); return;
  }
  if (type === 'lembing' || type === 'sumpit') {
    const L = SHAPE_LEN[type] * s;
    c.lineWidth = (type === 'sumpit' ? 2.4 : 2) * s; c.beginPath(); c.moveTo(-10 * s, 0); c.lineTo(L - 10 * s, 0); c.stroke();
    if (type === 'lembing') { c.beginPath(); c.moveTo(L - 10 * s, -3.5 * s); c.lineTo(L - 1 * s, 0); c.lineTo(L - 10 * s, 3.5 * s); c.closePath(); c.fill(); }
    else { c.lineWidth = 1 * s; c.beginPath(); c.moveTo(4 * s, -2 * s); c.lineTo(4 * s, 2 * s); c.moveTo(16 * s, -2 * s); c.lineTo(16 * s, 2 * s); c.stroke(); }
    c.restore(); return;
  }
  if (type === 'busur_silang') {
    c.lineWidth = 2.6 * s; c.beginPath(); c.moveTo(-6 * s, 0); c.lineTo(20 * s, 0); c.stroke();
    c.lineWidth = 2 * s; c.beginPath(); c.arc(12 * s, 0, 11 * s, -1.2, 1.2); c.stroke();
    c.lineWidth = 0.8; c.beginPath(); c.moveTo(16 * s, -10 * s); c.lineTo(6 * s - atk * 4, 0); c.lineTo(16 * s, 10 * s); c.stroke();
    c.restore(); return;
  }
  if (type === 'belati' || type === 'parang') {
    const L = SHAPE_LEN[type] * s;
    c.lineWidth = 3 * s; c.beginPath(); c.moveTo(-3 * s, 0); c.lineTo(4 * s, 0); c.stroke();
    c.lineWidth = 1.8 * s; c.beginPath(); c.moveTo(4 * s, -2.5 * s); c.lineTo(L, type === 'parang' ? -4 * s : 0); c.lineTo(L - 3 * s, 2 * s); c.lineTo(4 * s, 2.5 * s); c.closePath(); c.globalAlpha *= 0.35; c.fill(); c.globalAlpha /= 0.35; c.stroke();
    if (atk > 0.25) slash(c, s, atk);
    c.restore(); return;
  }
  if (type === 'kapak' || type === 'tukul') {
    const L = SHAPE_LEN[type] * s;
    c.lineWidth = 2.6 * s; c.beginPath(); c.moveTo(-6 * s, 0); c.lineTo(L, 0); c.stroke();
    c.lineWidth = 2.2 * s; c.beginPath();
    if (type === 'kapak') { c.moveTo(L - 6 * s, -2 * s); c.quadraticCurveTo(L + 6 * s, -12 * s, L + 2 * s, 9 * s); c.lineTo(L - 6 * s, 2 * s); c.closePath(); }
    else c.rect(L - 6 * s, -8 * s, 12 * s, 16 * s);
    c.globalAlpha *= 0.3; c.fill(); c.globalAlpha /= 0.3; c.stroke();
    if (atk > 0.25) slash(c, s, atk);
    c.restore(); return;
  }
  if (type === 'tongkat_roh') {
    c.lineWidth = 2.2 * s; c.beginPath(); c.moveTo(-6 * s, 0); c.lineTo(32 * s, 0); c.stroke();
    blob(c, col, 36 * s, 0, 9 * s, 9 * s, c.globalAlpha); c.globalAlpha = 1;
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(36 * s, -5 * s); c.lineTo(40 * s, 0); c.lineTo(36 * s, 5 * s); c.lineTo(32 * s, 0); c.closePath(); c.fill();
    c.restore(); return;
  }
  const wi = (!W || !W.tid || W.tid === 'besi') ? img('weapon_' + type) : null;
  if (wi) {
    const ar = wi.width / wi.height;
    if (type === 'pedang') { const w = 38 * s, h = w / ar; c.drawImage(wi, -7 * s, -h / 2, w, h); }
    else if (type === 'gergaji') { const w = 48 * s, h = w / ar; c.drawImage(wi, -10 * s, -h / 2, w, h); }
    else if (type === 'panah') { const h = 36 * s, w = h * ar; c.drawImage(wi, -w / 2, -h / 2, w, h); }
    else { const h = 32 * s, w = h * ar; c.drawImage(wi, 0, -h / 2, w, h); }
    if (type === 'pedang' && atk > 0.25) slash(c, s, atk);
    c.restore(); return;
  }
  if (type === 'obor') {
    c.lineWidth = 3 * s; c.beginPath(); c.moveTo(-4 * s, 0); c.lineTo(16 * s, 0); c.stroke();
    c.lineWidth = 2 * s; c.strokeRect(14 * s, -4 * s, 8 * s, 8 * s);
    c.restore(); return;
  }
  if (type === 'tongkat') {
    c.lineWidth = 2.4 * s; c.beginPath(); c.moveTo(-6 * s, 0); c.lineTo(26 * s, 0); c.stroke();
    c.beginPath(); c.arc(30 * s, 0, 4.5 * s, 0, 7); c.fill();
    c.lineWidth = 1.2 * s; c.beginPath(); c.moveTo(24 * s, -5 * s); c.lineTo(26 * s, 0); c.lineTo(24 * s, 5 * s); c.stroke();
    c.restore(); return;
  }
  if (type === 'keris') {
    c.lineWidth = 2 * s; c.beginPath(); c.moveTo(-2 * s, 0);
    for (let i = 0; i <= 12; i++) c.lineTo((2 + i * 1.9) * s, Math.sin(i * 1.3) * 2.2 * s * (1 - i / 14));
    c.stroke(); c.lineWidth = 3.4 * s; c.beginPath(); c.moveTo(0, -4 * s); c.lineTo(1 * s, 4 * s); c.stroke();
    if (atk > 0.25) slash(c, s, atk);
    c.restore(); return;
  }
  if (type === 'tinju') {
    c.lineWidth = 2.5 * s; c.beginPath(); c.arc(4 * s, 0, 7 * s, 0, 7); c.globalAlpha *= 1; c.stroke();
    c.beginPath(); c.moveTo(0, -5 * s); c.lineTo(9 * s, -5 * s); c.moveTo(0, 0); c.lineTo(10 * s, 0); c.moveTo(0, 5 * s); c.lineTo(9 * s, 5 * s); c.stroke();
    c.restore(); return;
  }
  if (type === 'pedang') {
    c.lineWidth = 2.2 * s; c.beginPath(); c.moveTo(-3 * s, 0); c.lineTo(26 * s, 0); c.stroke();
    c.lineWidth = 3 * s; c.beginPath(); c.moveTo(0, -5 * s); c.lineTo(0, 5 * s); c.stroke();
    if (atk > 0.25) slash(c, s, atk);
  } else if (type === 'panah') {
    c.lineWidth = 2 * s; c.beginPath(); c.arc(-4 * s, 0, 15 * s, -1.25, 1.25); c.stroke();
    c.lineWidth = 0.8; c.beginPath(); c.moveTo(1 * s, -14 * s); c.lineTo(-4 * s - atk * 6, 0); c.lineTo(1 * s, 14 * s); c.stroke();
  } else if (type === 'perisai') {
    c.lineWidth = 2.4 * s; c.beginPath(); c.moveTo(4 * s, -16 * s); c.quadraticCurveTo(13 * s, 0, 4 * s, 16 * s); c.lineTo(1 * s, 0); c.closePath();
    c.globalAlpha = 0.25; c.fill(); c.globalAlpha = 1; c.stroke();
  } else if (type === 'gergaji') {
    c.lineWidth = 2.5 * s; c.strokeRect(-6 * s, -5 * s, 10 * s, 10 * s);
    c.beginPath(); c.moveTo(4 * s, -4 * s); c.lineTo(34 * s, -3 * s); c.arc(34 * s, 0, 3 * s, -Math.PI / 2, Math.PI / 2); c.lineTo(4 * s, 4 * s); c.stroke();
    const off = ((G ? G.t : 0) * 60) % 5;
    c.lineWidth = 1.4; c.beginPath();
    for (let i = 6; i < 34; i += 5) { c.moveTo((i + off) * s, -4 * s); c.lineTo((i + off + 2) * s, -7.5 * s); }
    c.stroke();
  }
  c.restore();
}
function drawWall(c, u) {
  const x = u.x, gy = GROUND + u.y, r = Math.max(0, u.hp / u.maxHp), col = u.hitFlash > 0 ? '#fff' : u.t.c;
  blob(c, u.t.g, x, gy - 30, 34, 50, 0.35); c.globalAlpha = 1;
  c.fillStyle = '#0d1424'; c.strokeStyle = col; c.lineWidth = 2.5; c.shadowBlur = 10; c.shadowColor = u.t.g;
  c.fillRect(x - 10, gy - 64, 20, 64); c.strokeRect(x - 10, gy - 64, 20, 64);
  c.beginPath(); for (let y = gy - 48; y < gy; y += 16) { c.moveTo(x - 10, y); c.lineTo(x + 10, y); } c.moveTo(x, gy - 64); c.lineTo(x, gy - 48); c.moveTo(x, gy - 32); c.lineTo(x, gy - 16); c.stroke();
  c.shadowBlur = 0; c.fillStyle = '#ffffff22'; c.fillRect(x - 12, gy - 72, 24, 3); c.fillStyle = u.t.c; c.fillRect(x - 12, gy - 72, 24 * r, 3);
}
function drawTree(c, u) {
  const x = u.x, gy = GROUND + u.y, col = u.hitFlash > 0 ? '#fff' : u.t.c, sw = Math.sin(G.t * 2 + u.id * 9) * 2;
  blob(c, u.t.g, x, gy - 40, 34, 46, 0.35); c.globalAlpha = 1;
  c.strokeStyle = col; c.lineCap = 'round'; c.shadowBlur = 10; c.shadowColor = u.t.g;
  c.lineWidth = 5; c.beginPath(); c.moveTo(x, gy); c.lineTo(x + sw * 0.3, gy - 40); c.stroke();
  c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, gy - 22); c.lineTo(x - 12, gy - 36); c.moveTo(x, gy - 30); c.lineTo(x + 13, gy - 44); c.stroke();
  c.fillStyle = col + '55'; c.beginPath(); c.arc(x + sw, gy - 52, 18, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(x + sw + 5 * u.dir, gy - 54, 2, 0, 7); c.fill();
  c.shadowBlur = 0; const r = Math.max(0, u.hp / u.maxHp); c.fillStyle = '#ffffff22'; c.fillRect(x - 12, gy - 78, 24, 3); c.fillStyle = u.t.c; c.fillRect(x - 12, gy - 78, 24 * r, 3);
}
function drawProj(c, p, x, y, a) {
  const T = G.t, el = THEME[p.src && (p.src.wt || (p.src.t && p.src.t.id))]?.el || [p.c, '#fff', p.c];
  c.globalCompositeOperation = 'lighter';
  switch (p.st) {
    case 'fire':
      blob(c, el[0], x, y, 13, 13, 0.9); blob(c, el[1], x, y, 6, 6, 1);
      if (Math.random() < 0.6) G.parts.push({ x, y, vx: rnd(-20, 20), vy: rnd(-40, -10), life: 0.3, c: pick(el), r: 2.5 });
      break;
    case 'ice':
      c.save(); c.translate(x, y); c.rotate(a); c.globalAlpha = 1; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(9, 0); c.lineTo(0, -3.5); c.lineTo(-7, 0); c.lineTo(0, 3.5); c.closePath(); c.fill(); c.restore();
      blob(c, el[2], x, y, 10, 10, 0.7);
      if (Math.random() < 0.4) G.parts.push({ x, y, vx: 0, vy: 10, life: 0.3, c: '#ffffff', r: 1.5 });
      break;
    case 'moon':
      c.save(); c.translate(x, y); c.rotate(T * 18); c.globalAlpha = 1; c.strokeStyle = '#fff'; c.lineWidth = 2.2; c.beginPath(); c.arc(0, 0, 6, 0.3, Math.PI * 1.5); c.stroke(); c.restore();
      blob(c, el[0], x, y, 12, 12, 0.8);
      break;
    case 'poison':
      blob(c, el[0], x, y, 10, 10, 0.8); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
      c.strokeStyle = el[0]; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 4.5, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.fillRect(x - 1, y - 9, 2, 4);
      if (Math.random() < 0.4) G.parts.push({ x, y, vx: 0, vy: 20, life: 0.4, c: el[0], r: 2 });
      break;
    case 'leaf':
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x - Math.cos(a) * 13, y - Math.sin(a) * 13); c.lineTo(x, y); c.stroke();
      c.save(); c.translate(x - Math.cos(a) * 12, y - Math.sin(a) * 12); c.rotate(a + Math.sin(T * 20) * 0.5); c.fillStyle = el[0]; c.beginPath(); c.ellipse(0, 0, 4, 2, 0, 0, 7); c.fill(); c.restore();
      blob(c, el[0], x, y, 6, 6, 0.8);
      break;
    case 'bolt':
      c.globalAlpha = 1; c.lineWidth = 3; c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(x - Math.cos(a) * 9, y - Math.sin(a) * 9); c.lineTo(x, y); c.stroke();
      blob(c, el[2], x, y, 7, 7, 0.8);
      break;
    case 'dart':
      c.globalAlpha = 0.6; c.lineWidth = 1; c.strokeStyle = el[0]; c.beginPath(); c.moveTo(x - Math.cos(a) * 18, y - Math.sin(a) * 18); c.lineTo(x, y); c.stroke();
      c.globalAlpha = 1; c.lineWidth = 1.4; c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(x - Math.cos(a) * 6, y - Math.sin(a) * 6); c.lineTo(x, y); c.stroke();
      break;
    case 'spirit':
      c.globalAlpha = 1; c.lineWidth = 2; c.strokeStyle = '#fff'; c.beginPath(); c.moveTo(x - Math.cos(a) * 12, y - Math.sin(a) * 12); c.lineTo(x, y); c.stroke();
      blob(c, el[0], x, y, 11, 11, 0.85);
      if (Math.random() < 0.5) G.parts.push({ x, y, vx: rnd(-15, 15), vy: rnd(-25, 5), life: 0.45, c: pick(el), r: 1.8 });
      break;
  }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
}
function slash(c, s, atk) {
  const ga = c.globalAlpha; c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { c.globalAlpha = ga * atk * (0.45 - i * 0.12); c.lineWidth = (9 - i * 3) * s; c.beginPath(); c.arc(0, 0, (24 - i * 3) * s, -1.6 + i * 0.2, 0.25); c.stroke(); }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = ga;
}
function neon(c, col, w, alpha) {
  c.globalAlpha = alpha * 0.2; c.lineWidth = w * 3; c.stroke();
  c.globalAlpha = alpha; c.lineWidth = w; c.stroke();
  c.globalAlpha = alpha * 0.7; const sc = c.strokeStyle; c.strokeStyle = '#ffffff'; c.lineWidth = w * 0.35; c.stroke(); c.strokeStyle = sc; c.globalAlpha = alpha;
}
function drawShape(c, u, ox, oy, alpha) {
  const sh = UNITS[u.type] && UNITS[u.type].shape; if (!sh) return false;
  const k = u.size, d = u.dir ?? (u.side ? -1 : 1), x = u.x + (ox || 0), gy = GROUND + (u.y || 0) + (oy || 0);
  const T = G ? G.t : performance.now() / 1000, col = u.hitFlash > 0 ? '#ffffff' : u.t.c, a = u.atk || 0;
  const moving = a <= 0.01, w = u.walk || 0;
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.fillStyle = '#07060f';
  if (sh === 'naga') {
    const bob = Math.sin(T * 5 + (u.id || 0) * 9) * 3 * k, by = gy - 40 * k + bob, flap = Math.sin(T * 9 + (u.id || 0) * 5);
    blob(c, u.t.g, x, gy, 18 * k, 4 * k, alpha * 0.4); c.globalAlpha = alpha; // bayang di tanah
    // ekor
    c.beginPath(); c.moveTo(x - d * 10 * k, by);
    for (let i = 1; i <= 6; i++) c.lineTo(x - d * (10 + i * 4) * k, by + Math.sin(T * 6 - i * 0.9) * 3 * k + i * 1.2 * k);
    neon(c, col, 2.6 * k, alpha);
    c.beginPath(); const tx = x - d * 34 * k, ty = by + Math.sin(T * 6 - 5.4) * 3 * k + 7 * k; c.moveTo(tx, ty); c.lineTo(tx - d * 4 * k, ty - 4 * k); c.lineTo(tx - d * 2 * k, ty + 3 * k); c.closePath(); neon(c, col, 1.6 * k, alpha);
    // sayap belakang
    const wing = (side) => { const sx = x - d * 1 * k, sy = by - 5 * k, f = flap * side, tx = x - d * 9 * k, ty = sy - (15 + f * 9) * k;
      const f1x = x - d * 19 * k, f1y = ty + (7 + f * 3) * k, f2x = x - d * 21 * k, f2y = sy - 1 * k;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(tx, ty);
      c.quadraticCurveTo(x - d * 15 * k, ty + 1 * k, f1x, f1y);
      c.quadraticCurveTo(x - d * 16 * k, f1y + 3 * k, f2x, f2y);
      c.quadraticCurveTo(x - d * 13 * k, sy + 1 * k, x - d * 7 * k, sy + 2 * k);
      c.closePath();
      c.moveTo(tx, ty); c.lineTo(f1x, f1y); c.moveTo(tx, ty); c.lineTo(f2x, f2y); };
    wing(-1); c.globalAlpha = alpha * 0.15; c.fillStyle = col; c.fill(); neon(c, col, 1.4 * k, alpha * 0.6);
    // badan
    c.fillStyle = '#07060f'; c.beginPath(); c.ellipse(x, by, 13 * k, 7 * k, d * 0.15, 0, 7); c.fill(); neon(c, col, 2.4 * k, alpha);
    // perut berjalur
    c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(x + i * 4 * k, by + 2 * k); c.lineTo(x + i * 4 * k + d * 1 * k, by + 6 * k); } neon(c, col, 0.9 * k, alpha * 0.8);
    // kaki kecil
    c.beginPath(); c.moveTo(x - d * 5 * k, by + 6 * k); c.lineTo(x - d * 6 * k, by + 12 * k); c.moveTo(x + d * 6 * k, by + 6 * k); c.lineTo(x + d * 7 * k, by + 12 * k); neon(c, col, 1.6 * k, alpha);
    // leher & kepala
    const hx = x + d * 22 * k, hy = by - 8 * k - a * 2 * k;
    c.beginPath(); c.moveTo(x + d * 9 * k, by - 3 * k); c.quadraticCurveTo(x + d * 16 * k, by - 12 * k, hx - d * 3 * k, hy); neon(c, col, 3 * k, alpha);
    c.fillStyle = '#07060f'; c.beginPath(); c.moveTo(hx - d * 5 * k, hy - 4 * k); c.lineTo(hx + d * 7 * k, hy - 2 * k); c.lineTo(hx + d * 9 * k, hy + (1 + a * 3) * k); c.lineTo(hx + d * 2 * k, hy + 1 * k); c.lineTo(hx + d * 8 * k, hy + (3 + a * 4) * k); c.lineTo(hx - d * 4 * k, hy + 4 * k); c.closePath(); c.fill(); neon(c, col, 1.8 * k, alpha);
    // tanduk
    c.beginPath(); c.moveTo(hx - d * 3 * k, hy - 3 * k); c.lineTo(hx - d * 9 * k, hy - 9 * k); c.moveTo(hx, hy - 4 * k); c.lineTo(hx - d * 4 * k, hy - 10 * k); neon(c, col, 1.4 * k, alpha);
    // mata
    c.globalAlpha = alpha; c.fillStyle = '#fff'; c.beginPath(); c.arc(hx + d * 2 * k, hy - 1 * k, 1.3 * k, 0, 7); c.fill(); blob(c, col, hx + d * 2 * k, hy - 1 * k, 4 * k, 4 * k, alpha * 0.9);
    if (a > 0) blob(c, '#ffb347', hx + d * 9 * k, hy + 2 * k, 8 * k, 6 * k, alpha * a);
    // sayap depan
    c.globalAlpha = alpha; wing(1); c.globalAlpha = alpha * 0.2; c.fillStyle = col; c.fill(); neon(c, col, 1.6 * k, alpha);
  } else if (sh === 'robot') {
    const sw = moving ? Math.sin(w) : 0, bob = moving ? Math.abs(Math.cos(w)) * 1.5 * k : 0;
    const hipY = gy - 17 * k - bob;
    // kaki tebal
    c.beginPath(); c.moveTo(x - 4 * k, hipY); c.lineTo(x - 4 * k + sw * 6 * k * d, gy - 2 * k); c.moveTo(x + 4 * k, hipY); c.lineTo(x + 4 * k - sw * 6 * k * d, gy - 2 * k); neon(c, col, 4 * k, alpha);
    c.beginPath(); c.moveTo(x - 9 * k + sw * 6 * k * d, gy); c.lineTo(x + 1 * k + sw * 6 * k * d, gy); c.moveTo(x - 1 * k - sw * 6 * k * d, gy); c.lineTo(x + 9 * k - sw * 6 * k * d, gy); neon(c, col, 2.2 * k, alpha);
    // lengan belakang
    c.beginPath(); c.moveTo(x - d * 9 * k, hipY - 18 * k); c.lineTo(x - d * (12 + sw * 3) * k, hipY - 6 * k); neon(c, col, 3.4 * k, alpha * 0.8);
    // badan kotak
    c.fillStyle = '#0a1020'; c.globalAlpha = alpha; c.beginPath(); c.rect(x - 11 * k, hipY - 24 * k, 22 * k, 24 * k); c.fill(); neon(c, col, 2.2 * k, alpha);
    c.beginPath(); c.rect(x - 6 * k, hipY - 18 * k, 12 * k, 8 * k); neon(c, col, 1 * k, alpha * 0.8);
    blob(c, col, x, hipY - 14 * k, 6 * k, 6 * k, alpha * (0.6 + 0.4 * Math.sin(T * 4))); c.globalAlpha = alpha;
    c.beginPath(); for (let i = -1; i <= 1; i++) { c.moveTo(x + i * 6 * k, hipY - 6 * k); c.lineTo(x + i * 6 * k, hipY - 3 * k); } neon(c, col, 1 * k, alpha);
    // kepala & visor
    const hy = hipY - 34 * k;
    c.fillStyle = '#0a1020'; c.beginPath(); c.rect(x - 7 * k, hy, 14 * k, 10 * k); c.fill(); neon(c, col, 2 * k, alpha);
    c.beginPath(); c.moveTo(x, hy); c.lineTo(x, hy - 5 * k); neon(c, col, 1.2 * k, alpha); blob(c, '#ff4d4d', x, hy - 6 * k, 3 * k, 3 * k, alpha * (Math.sin(T * 6) > 0 ? 1 : 0.3)); c.globalAlpha = alpha;
    c.fillStyle = '#fff'; c.fillRect(x + d * 0.5 * k - (d < 0 ? 6 * k : 0), hy + 3.5 * k, 6 * k, 2.2 * k); blob(c, col, x + d * 3.5 * k, hy + 4.5 * k, 7 * k, 4 * k, alpha);
    // lengan depan & penumbuk
    const sx = x + d * 10 * k, sy = hipY - 20 * k, reach = a > 0 ? (a > 0.5 ? (1 - a) * 2 : a * 2) : 0;
    const fx = sx + d * (8 + reach * 18) * k, fy = sy + (10 - reach * 6) * k;
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(fx, fy); neon(c, col, 3.6 * k, alpha);
    c.fillStyle = '#0a1020'; c.globalAlpha = alpha; c.beginPath(); c.rect(fx - 4 * k, fy - 4 * k, 8 * k, 8 * k); c.fill(); neon(c, col, 2 * k, alpha);
    if (reach > 0.6) blob(c, '#ffffff', fx + d * 4 * k, fy, 10 * k, 10 * k, alpha * 0.6);
  } else if (sh === 'pokok') {
    const sw = moving ? Math.sin(w) : 0, sway = Math.sin(T * 1.6 + (u.id || 0) * 7) * 1.5 * k;
    const baseY = gy - 6 * k, topY = gy - 46 * k;
    // akar-kaki
    c.beginPath(); c.moveTo(x - 3 * k, baseY); c.quadraticCurveTo(x - 7 * k + sw * 4 * k * d, gy - 2 * k, x - 10 * k + sw * 6 * k * d, gy); c.moveTo(x + 3 * k, baseY); c.quadraticCurveTo(x + 7 * k - sw * 4 * k * d, gy - 2 * k, x + 10 * k - sw * 6 * k * d, gy);
    c.moveTo(x, baseY); c.lineTo(x + d * 2 * k, gy); neon(c, col, 2.6 * k, alpha);
    // batang
    c.fillStyle = '#081208'; c.globalAlpha = alpha; c.beginPath(); c.moveTo(x - 7 * k, baseY); c.lineTo(x - 5 * k + sway, topY + 6 * k); c.lineTo(x + 5 * k + sway, topY + 6 * k); c.lineTo(x + 7 * k, baseY); c.closePath(); c.fill(); neon(c, col, 2.4 * k, alpha);
    c.beginPath(); c.moveTo(x - 2 * k, baseY - 4 * k); c.lineTo(x - 1 * k + sway * 0.5, topY + 16 * k); c.moveTo(x + 3 * k, baseY - 10 * k); c.lineTo(x + 2 * k + sway * 0.5, topY + 22 * k); neon(c, col, 0.8 * k, alpha * 0.6);
    // muka di batang
    const fy = topY + 25 * k; c.fillStyle = '#fff'; c.globalAlpha = alpha;
    c.beginPath(); c.arc(x + d * 1 * k + sway * 0.6, fy, 1.4 * k, 0, 7); c.arc(x + d * 4.5 * k + sway * 0.6, fy, 1.4 * k, 0, 7); c.fill();
    blob(c, col, x + d * 3 * k + sway * 0.6, fy, 6 * k, 4 * k, alpha); c.globalAlpha = alpha;
    c.beginPath(); c.moveTo(x + d * 0.5 * k + sway * 0.6, fy + 5 * k); c.quadraticCurveTo(x + d * 3 * k + sway * 0.6, fy + 7 * k, x + d * 5.5 * k + sway * 0.6, fy + 5 * k); neon(c, col, 0.9 * k, alpha);
    // dahan-tangan (depan hentak bila serang)
    const sY = topY + 31 * k, slam = a > 0 ? a : 0;
    c.beginPath(); c.moveTo(x - d * 5 * k, sY); c.lineTo(x - d * 14 * k, sY - 8 * k + sw * 2 * k); c.lineTo(x - d * 18 * k, sY - 14 * k); c.moveTo(x - d * 14 * k, sY - 8 * k); c.lineTo(x - d * 19 * k, sY - 6 * k); neon(c, col, 2.2 * k, alpha * 0.85);
    const ex = x + d * 16 * k, ey = sY - 16 * k + slam * 26 * k;
    c.beginPath(); c.moveTo(x + d * 5 * k, sY); c.quadraticCurveTo(x + d * 12 * k, sY - 6 * k, ex, ey); c.moveTo(ex, ey); c.lineTo(ex + d * 4 * k, ey - 3 * k); c.moveTo(ex, ey); c.lineTo(ex + d * 3 * k, ey + 3 * k); neon(c, col, 2.6 * k, alpha);
    // daun / kanopi
    const cy = topY + 2 * k;
    [[-9, 2, 9], [8, 3, 9], [0, -5, 11], [-3, 6, 7], [5, 7, 7]].forEach(([dx, dy, r], i) => {
      c.fillStyle = '#081208'; c.globalAlpha = alpha; c.beginPath(); c.arc(x + dx * k + sway * 1.3, cy + dy * k + Math.sin(T * 2 + i) * 0.6 * k, r * k, 0, 7); c.fill(); neon(c, col, 1.6 * k, alpha * 0.85); });
    blob(c, u.t.c, x + sway, cy, 22 * k, 16 * k, alpha * 0.25);
    c.globalAlpha = alpha; c.fillStyle = '#ffd36b'; [[-6, -2], [7, 4], [1, -9]].forEach(([dx, dy], i) => { if (Math.sin(T * 2 + i * 2) > 0.2) { c.beginPath(); c.arc(x + dx * k + sway * 1.3, cy + dy * k, 1.2 * k, 0, 7); c.fill(); } });
  }
  c.globalAlpha = 1;
  return true;
}
function drawStick(c, u, ox, oy, alpha) {
  if (drawShape(c, u, ox, oy, alpha)) return;
  const j = pose(u, ox, oy), s = u.size, d = u.dir ?? (u.side ? -1 : 1);
  const col = u.hitFlash > 0 ? '#ffffff' : u.t.c;
  c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col;
  c.beginPath();
  c.moveTo(j.neck.x, j.neck.y); c.lineTo(j.hip.x, j.hip.y);
  // kaki dengan lutut
  const knee = (f) => ({ x: (j.hip.x + f.x) / 2 + 3 * d * s, y: (j.hip.y + f.y) / 2 });
  const kf = knee(j.ff), kb = knee(j.fb);
  c.moveTo(j.hip.x, j.hip.y); c.lineTo(kf.x, kf.y); c.lineTo(j.ff.x, j.ff.y);
  c.moveTo(j.hip.x, j.hip.y); c.lineTo(kb.x, kb.y); c.lineTo(j.fb.x, j.fb.y);
  c.moveTo(j.neck.x, j.neck.y + 3 * s); c.lineTo(j.hb.x, j.hb.y);
  c.moveTo(j.neck.x, j.neck.y + 3 * s); c.lineTo(j.hf.x, j.hf.y);
  // tiub neon: cahaya luar, warna, teras putih
  c.globalAlpha = alpha * 0.2; c.lineWidth = 9 * s; c.stroke();
  c.globalAlpha = alpha; c.lineWidth = 3.2 * s; c.stroke();
  c.globalAlpha = alpha * 0.75; c.strokeStyle = '#ffffff'; c.lineWidth = 1 * s; c.stroke();
  c.strokeStyle = col; c.globalAlpha = alpha;
  blob(c, col, j.head.x, j.head.y, 15 * s, 15 * s, alpha * 0.35);
  c.globalAlpha = alpha; c.fillStyle = '#07060f'; c.lineWidth = 2.8 * s;
  c.beginPath(); c.arc(j.head.x, j.head.y, 7 * s, 0, 7); c.fill(); c.stroke();
  c.globalAlpha = alpha * 0.7; c.strokeStyle = '#fff'; c.lineWidth = 0.9 * s; c.stroke(); c.strokeStyle = col; c.globalAlpha = alpha;
  // mata menyala
  c.fillStyle = '#fff'; c.beginPath(); c.arc(j.head.x + 3 * d * s, j.head.y - 1, 1.5 * s, 0, 7); c.fill();
  blob(c, col, j.head.x + 3 * d * s, j.head.y - 1, 4 * s, 4 * s, alpha * 0.9); c.globalAlpha = alpha;
  // tanda puak di kepala
  const hat = img('hat_' + u.t.id);
  if (hat) { c.save(); c.translate(j.head.x, j.head.y + 1 * s); c.scale(d, 1); const hw = 21 * s, hh = Math.min(hw * hat.height / hat.width, 22 * s); c.globalAlpha = alpha; c.drawImage(hat, -hw / 2, -hh - 2 * s, hw, hh); c.restore(); c.globalAlpha = alpha; }
  else tribeMark(c, u.t.id, j.head.x, j.head.y, s, d, col);
  c.shadowBlur = 9; c.shadowColor = u.stolen ? '#ffffff' : u.t.g;
  if (UNITS[u.type] && UNITS[u.type].elite) {
    // mahkota kecil untuk askar istimewa
    c.fillStyle = '#ffd36b'; c.globalAlpha = alpha; c.beginPath(); const cx = j.head.x, cy = j.head.y - 19 * s;
    c.moveTo(cx - 5 * s, cy + 4 * s); c.lineTo(cx - 5 * s, cy - 2 * s); c.lineTo(cx - 2 * s, cy + 1 * s); c.lineTo(cx, cy - 4 * s); c.lineTo(cx + 2 * s, cy + 1 * s); c.lineTo(cx + 5 * s, cy - 2 * s); c.lineTo(cx + 5 * s, cy + 4 * s); c.fill();
  }
  const W0 = weaponOf(u), wcol = u.stolen ? TRIBES.find(t => t.id === W0.tid).c : col;
  drawWeapon(c, W0.shape, j.hf.x, j.hf.y, j.ang, d, s, wcol, u.atk, W0);
  c.shadowBlur = 0;
  if (u.stolen) { c.fillStyle = '#fff'; c.font = `${10 * s}px sans-serif`; c.fillText('★', j.head.x - 4, j.head.y - 11 * s); }
  c.globalAlpha = 1;
}
function tribeMark(c, id, x, y, s, d, col) {
  c.beginPath(); c.strokeStyle = col; c.lineWidth = 1.8 * s;
  if (id === 'api') { c.moveTo(x - 4 * s, y - 6 * s); c.lineTo(x - 1 * s, y - 13 * s); c.lineTo(x + 1 * s, y - 8 * s); c.lineTo(x + 4 * s, y - 14 * s); }
  else if (id === 'bulan') { c.arc(x - 2 * d * s, y - 9 * s, 5 * s, Math.PI * 1.1, Math.PI * 1.9); }
  else if (id === 'besi') { c.moveTo(x - 7 * s, y - 2 * s); c.lineTo(x - 7 * s, y - 7 * s); c.lineTo(x + 7 * s, y - 7 * s); c.lineTo(x + 7 * s, y - 2 * s); c.moveTo(x, y - 7 * s); c.lineTo(x, y - 12 * s); }
  else if (id === 'hutan') { c.moveTo(x, y - 7 * s); c.quadraticCurveTo(x - 8 * d * s, y - 12 * s, x - 10 * d * s, y - 6 * s); c.moveTo(x, y - 7 * s); c.quadraticCurveTo(x + 5 * d * s, y - 14 * s, x + 2 * d * s, y - 16 * s); }
  else if (id === 'pendekar') { c.moveTo(x - 7 * s, y - 4 * s); c.lineTo(x + 7 * s, y - 4 * s); c.moveTo(x - 7 * d * s, y - 4 * s); c.lineTo(x - 13 * d * s, y - 1 * s); c.moveTo(x - 7 * d * s, y - 4 * s); c.lineTo(x - 12 * d * s, y + 2 * s); }
  else if (id === 'bunian') { c.moveTo(x - 6 * s, y - 5 * s); c.lineTo(x - 9 * s, y - 14 * s); c.moveTo(x + 6 * s, y - 5 * s); c.lineTo(x + 9 * s, y - 14 * s); }
  else if (id === 'ais') { for (let i = -1; i <= 1; i++) { c.moveTo(x + i * 4 * s, y - 7 * s); c.lineTo(x + i * 5 * s, y - 13 * s); } }
  else if (id === 'racun') { c.arc(x, y - 12 * s, 2.5 * s, 0, 7); c.moveTo(x + 4 * s, y - 16 * s); c.arc(x + 4 * s, y - 16 * s, 1.5 * s, 0, 7); }
  c.stroke();
}
function drawBase(c, si) {
  const s = G.sides[si], x = si ? W - BASE_X : BASE_X, col = s.flash > 0 ? '#fff' : s.t.c, d = si ? -1 : 1;
  const pulse = 0.5 + 0.5 * Math.sin(G.t * 3 + si);
  blob(c, s.t.g, x, GROUND - 70, 120, 140, 0.18 + pulse * 0.08);
  blob(c, s.t.g, x, GROUND + 6, 90, 18, 0.5);
  c.globalAlpha = 1;
  const fi = img('fort_' + s.t.id);
  if (fi) {
    const h = 225, w = h * fi.width / fi.height;
    c.save(); c.translate(x, GROUND + 28); c.scale(d, 1); c.shadowBlur = 16; c.shadowColor = s.flash > 0 ? '#fff' : s.t.g;
    c.drawImage(fi, -w / 2, -h, w, h); c.restore(); c.shadowBlur = 0;
    const r = Math.max(0, s.baseHp / BASE_HP);
    c.fillStyle = '#ffffff22'; c.fillRect(x - 36, GROUND - 206, 72, 6); c.fillStyle = s.t.c; c.fillRect(x - 36, GROUND - 206, 72 * r, 6);
    return;
  }
  c.strokeStyle = col; c.lineWidth = 3; c.fillStyle = '#0a0816';
  c.shadowBlur = 14; c.shadowColor = s.t.g;
  c.beginPath(); c.moveTo(x - 34, GROUND + 30); c.lineTo(x - 26, GROUND - 120); c.lineTo(x + 26, GROUND - 120); c.lineTo(x + 34, GROUND + 30); c.closePath(); c.fill(); c.stroke();
  for (let i = -2; i <= 2; i++) c.strokeRect(x + i * 11 - 4, GROUND - 134, 8, 14);
  c.beginPath(); c.moveTo(x, GROUND - 134); c.lineTo(x, GROUND - 175); c.stroke();
  c.shadowBlur = 0;
  // tingkap menyala
  c.fillStyle = s.t.c; [[-12, -95], [12, -95], [-12, -60], [12, -60]].forEach(([dx, dy], i) => { c.globalAlpha = 0.45 + 0.4 * Math.abs(Math.sin(G.t * 1.5 + i)); c.fillRect(x + dx - 3, GROUND + dy, 6, 9); });
  // orb tenaga di atas
  blob(c, s.t.c, x, GROUND - 145, 22 + pulse * 6, 22 + pulse * 6, 0.9);
  c.globalAlpha = 1; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, GROUND - 145, 3.5, 0, 7); c.fill();
  c.fillStyle = col; c.beginPath(); c.moveTo(x, GROUND - 175); c.lineTo(x + 26 * d, GROUND - 167 + Math.sin(G.t * 4) * 3); c.lineTo(x, GROUND - 157); c.fill();
  // pintu & simbol
  c.beginPath(); c.arc(x, GROUND + 10, 14, Math.PI, 0); c.lineTo(x + 14, GROUND + 30); c.moveTo(x - 14, GROUND + 10); c.lineTo(x - 14, GROUND + 30); c.stroke();
  tribeMark(c, s.t.id, x, GROUND - 60, 2.4, d, col);
  // hp bar
  const r = Math.max(0, s.baseHp / BASE_HP);
  c.fillStyle = '#ffffff22'; c.fillRect(x - 36, GROUND - 196, 72, 6);
  c.fillStyle = s.t.c; c.fillRect(x - 36, GROUND - 196, 72 * r, 6);
}
let bgStars = null;
function draw() {
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.fillStyle = '#05040b'; c.fillRect(0, 0, VW, VH);
  // kamera ikut barisan depan
  const viewW = VW / scale;
  if (userPan > 0) userPan -= 1 / 60;
  else {
    const mine = G.units.filter(u => u.side === 0), theirs = G.units.filter(u => u.side === 1);
    const f0 = mine.length ? Math.max(...mine.map(u => u.x)) : BASE_X, f1 = theirs.length ? Math.min(...theirs.map(u => u.x)) : W - BASE_X;
    camTarget = (Math.min(f0, f1 + 60) + Math.max(f0 - 60, f1)) / 2 - viewW / 2;
    camX += (camTarget - camX) * 0.04;
  }
  camX = clamp(camX, 0, Math.max(0, W - viewW));
  const sx = G.shake ? rnd(-G.shake, G.shake) : 0, sy = G.shake ? rnd(-G.shake, G.shake) * 0.5 : 0;
  const oy = Math.max(VH / scale - 400, (VH / scale) * 0.68 - GROUND);
  c.setTransform(DPR * scale, 0, 0, DPR * scale, DPR * (-camX * scale + sx), DPR * (oy * scale + sy));
  const P = G.sides[0].t, E = G.sides[1].t, top = -oy - 60, T = G.t;
  // langit
  let gr = c.createLinearGradient(0, top, 0, GROUND);
  gr.addColorStop(0, '#04030a'); gr.addColorStop(0.6, '#0d0920'); gr.addColorStop(1, '#1a0f2e');
  c.fillStyle = gr; c.fillRect(camX - 20, top, viewW + 40, GROUND - top + 10);
  gr = c.createLinearGradient(camX, 0, camX + viewW, 0);
  const pl = clamp(1 - camX / W * 1.6, 0, 1), el = clamp((camX + viewW) / W * 1.6 - 0.6, 0, 1);
  gr.addColorStop(0, P.g + Math.round(0x30 * pl).toString(16).padStart(2, '0')); gr.addColorStop(0.5, '#00000000'); gr.addColorStop(1, E.g + Math.round(0x30 * el).toString(16).padStart(2, '0'));
  c.fillStyle = gr; c.fillRect(camX - 20, top, viewW + 40, GROUND - top + 10);
  const bi = img('bg_far');
  if (bi) {
    const h = GROUND + 10 - top, w = h * bi.width / bi.height, base = camX * 0.7;
    for (let x = base + Math.floor((camX - base) / w) * w; x < camX + viewW; x += w) c.drawImage(bi, x, top, w, h);
  } else {
  // bintang (parallax perlahan)
  if (!bgStars) { bgStars = []; for (let i = 0; i < 140; i++) bgStars.push([rnd(0, W), rnd(-420, GROUND - 120), rnd(0.6, 1.8), rnd(0, 6)]); }
  c.fillStyle = '#ffffff';
  bgStars.forEach(([x, y, r, ph]) => { const sx = x + camX * 0.85; if (sx < camX - 5 || sx > camX + viewW + 5 || y < top) return; c.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(T * 0.8 + ph)); c.fillRect(sx, y, r, r); });
  // aurora
  c.globalCompositeOperation = 'lighter';
  for (let b = 0; b < 2; b++) {
    const col = b ? E.g : P.g; c.strokeStyle = col; c.lineCap = 'round';
    for (let l = 0; l < 3; l++) {
      c.globalAlpha = 0.05; c.lineWidth = 26 - l * 8; c.beginPath();
      for (let x = camX - 40; x <= camX + viewW + 40; x += 30) { const y = GROUND - 250 - b * 40 + Math.sin(x * 0.006 + T * 0.4 + b * 2) * 30 + Math.sin(x * 0.017 - T * 0.3) * 12 + l * 6; x === camX - 40 ? c.moveTo(x, y) : c.lineTo(x, y); }
      c.stroke();
    }
  }
  c.globalCompositeOperation = 'source-over';
  // bulan
  blob(c, '#c9b8ff', camX * 0.6 + viewW * 0.5 + 120, GROUND - 230, 110, 110, 0.35);
  c.globalAlpha = 0.85; c.fillStyle = '#efeaff'; c.beginPath(); c.arc(camX * 0.6 + viewW * 0.5 + 120, GROUND - 230, 34, 0, 7); c.fill();
  c.fillStyle = '#d9d0f5'; [[-10, -8, 7], [8, 6, 5], [-4, 12, 4], [12, -12, 3]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(camX * 0.6 + viewW * 0.5 + 120 + dx, GROUND - 230 + dy, r, 0, 7); c.fill(); });
  c.globalAlpha = 1;
  // 3 lapis gunung dengan rim cahaya
  [[0.75, 175, 95, '#0b0918', '#3a2a6a'], [0.5, 120, 60, '#0e0b1f', '#4b3a88'], [0.25, 70, 38, '#100d22', '#5d4aa8']].forEach(([par, base, amp, fill, rim], li) => {
    const off = camX * par;
    c.beginPath(); c.moveTo(camX - 40, GROUND);
    const pts = [];
    for (let x = camX - 40; x <= camX + viewW + 60; x += 24) { const wx = x - off + li * 400; pts.push([x, GROUND - base + 40 - Math.abs(Math.sin(wx * 0.004)) * amp - Math.sin(wx * 0.013) * amp * 0.3 - Math.sin(wx * 0.041) * 6]); }
    pts.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(camX + viewW + 60, GROUND); c.closePath();
    c.fillStyle = fill; c.fill();
    c.strokeStyle = rim; c.globalAlpha = 0.5; c.lineWidth = 1.2; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.globalAlpha = 1;
  });
  }
  // kabus dekat tanah
  gr = c.createLinearGradient(0, GROUND - 90, 0, GROUND);
  gr.addColorStop(0, '#2a1f5000'); gr.addColorStop(1, '#2a1f5066');
  c.fillStyle = gr; c.fillRect(camX - 20, GROUND - 90, viewW + 40, 90);
  // tanah: lantai gelap berkilat
  gr = c.createLinearGradient(0, GROUND - 4, 0, GROUND + 120);
  gr.addColorStop(0, '#0f1d1a'); gr.addColorStop(0.15, '#08100f'); gr.addColorStop(1, '#030506');
  c.fillStyle = gr; c.fillRect(camX - 20, GROUND - 4, viewW + 40, 140);
  // garis horizon bercahaya ikut warna puak
  gr = c.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, P.c); gr.addColorStop(0.5, '#2ee6c4'); gr.addColorStop(1, E.c);
  c.strokeStyle = gr; c.globalAlpha = 0.18; c.lineWidth = 8; c.beginPath(); c.moveTo(0, GROUND - 4); c.lineTo(W, GROUND - 4); c.stroke();
  c.globalAlpha = 0.8; c.lineWidth = 1.5; c.stroke(); c.globalAlpha = 1;
  // rumput
  c.strokeStyle = '#2ee6c4'; c.globalAlpha = 0.22; c.lineWidth = 1; c.beginPath();
  for (let x = Math.floor((camX - 20) / 7) * 7; x < camX + viewW + 20; x += 7) { const h = 4 + ((x * 7) % 7), sw = Math.sin(T * 2 + x * 0.05) * 1.5; c.moveTo(x, GROUND - 4); c.lineTo(x + 1.5 + sw, GROUND - 4 - h); }
  c.stroke(); c.globalAlpha = 1;
  // garis perspektif lantai
  c.strokeStyle = '#2ee6c4'; c.globalAlpha = 0.05; c.beginPath();
  for (let x = Math.floor(camX / 80) * 80; x < camX + viewW + 80; x += 80) { c.moveTo(x, GROUND); c.lineTo(x + (x - camX - viewW / 2) * 0.6, GROUND + 110); }
  for (let y = GROUND + 12; y < GROUND + 110;) { c.moveTo(camX - 20, y); c.lineTo(camX + viewW + 20, y); y += (y - GROUND) * 0.5 + 8; }
  c.stroke(); c.globalAlpha = 1;
  drawBase(c, 0); drawBase(c, 1);
  c.shadowBlur = 10;
  // kolam cahaya bawah askar
  for (const u of G.units) blob(c, u.t.g, u.x, GROUND + u.y, 22 * u.size, 6 * u.size, G.sides[u.side].buff.ghost ? 0.1 : 0.35);
  c.globalAlpha = 1;
  // senjata yang jatuh
  G.drops.forEach(d => { c.shadowColor = d.c; c.globalAlpha = d.life < 2 ? (Math.sin(G.t * 20) > 0 ? 0.9 : 0.3) : 0.9; { const th = THEME[d.wt || 'besi']; drawWeapon(c, th[d.type][1], d.x - 10, GROUND + d.y - 3, d.rot, 1, 0.9, d.c, 0, { tid: d.wt || 'besi', img: 'w_' + (d.wt || 'besi') + '_' + d.type, alt: (d.wt || 'besi') === 'besi' ? 'weapon_' + th[d.type][1] : null }); } c.globalAlpha = 1; });
  // mayat ragdoll
  for (const k of G.corpses) {
    c.shadowColor = k.g; c.globalAlpha = Math.min(1, k.life / 1.5) * 0.85; c.strokeStyle = k.c; c.lineWidth = 3 * k.size; c.lineCap = 'round';
    c.beginPath(); BONES.forEach(([a, b]) => { if (a === 'head') return; c.moveTo(k.pts[a].x, k.pts[a].y); c.lineTo(k.pts[b].x, k.pts[b].y); });
    const ka = c.globalAlpha; c.globalAlpha = ka * 0.2; c.lineWidth = 8 * k.size; c.stroke(); c.globalAlpha = ka; c.lineWidth = 3 * k.size; c.stroke();
    c.fillStyle = '#07060f'; c.beginPath(); c.arc(k.pts.head.x, k.pts.head.y, 7 * k.size, 0, 7); c.fill(); c.stroke();
  }
  c.globalAlpha = 1;
  // askar (susun ikut kedalaman)
  const sorted = G.units.slice().sort((a, b) => a.y - b.y);
  for (const u of sorted) {
    const me = G.sides[u.side];
    c.shadowBlur = 0;
    if (me.buff.rage) { blob(c, '#ff3b1f', u.x, GROUND + u.y - 30 * u.size, 26 * u.size, 40 * u.size, 0.45); if (Math.random() < 0.2) G.parts.push({ x: u.x + rnd(-6, 6), y: GROUND + u.y - rnd(10, 50), vx: 0, vy: -60, life: 0.4, c: '#ff5a1f', r: 2 }); }
    if (u.type === 'tembok') { drawWall(c, u); continue; }
    if (u.type === 'pokok') { drawTree(c, u); continue; }
    if (me.buff.silat && UNITS[u.type].melee) blob(c, '#ffd36b', u.x, GROUND + u.y - 30 * u.size, 22 * u.size, 36 * u.size, 0.35);
    if (u.burn > 0) blob(c, '#ff5a1f', u.x, GROUND + u.y - 30, 16, 26, 0.3);
    if (u.chill > 0) blob(c, '#bfefff', u.x, GROUND + u.y - 30, 16, 26, 0.3);
    if (u.tox > 0) blob(c, '#b8ff2a', u.x, GROUND + u.y - 30, 16, 26, 0.3);
    if (UNITS[u.type].elite) { blob(c, u.t.g, u.x, GROUND + u.y - 34 * u.size, 26 * u.size, 40 * u.size, 0.3 + 0.1 * Math.sin(G.t * 4)); c.globalAlpha = 1; }
    if (wpnOf(u.type) === 'obor') blob(c, '#ff7a2e', u.x + u.dir * 26 * u.size, GROUND + u.y - 48 * u.size, 9 + Math.random() * 3, 12, 0.9);
    if (wpnOf(u.type) === 'tongkat') blob(c, u.t.c, u.x + u.dir * 20 * u.size, GROUND + u.y - 60 * u.size, 10, 10, 0.7);
    drawStick(c, u, 0, 0, u.hidden ? (u.side === 0 ? 0.3 : 0.12) : me.buff.ghost || u.clone ? 0.4 : 1);
    if (u.stun > 0) { c.fillStyle = '#ffd36b'; for (let k = 0; k < 3; k++) { const an = G.t * 6 + k * 2.1; c.fillRect(u.x + Math.cos(an) * 9 - 1.5, GROUND + u.y - 76 * u.size + Math.sin(an) * 3, 3, 3); } }
    if (me.buff.shield) { c.strokeStyle = '#9fd8ff'; c.lineWidth = 1.5; c.globalAlpha = 0.5; c.beginPath(); c.ellipse(u.x, GROUND + u.y - 28 * u.size, 18 * u.size, 34 * u.size, 0, 0, 7); c.stroke(); c.globalAlpha = 1; }
    if (u.hp < u.maxHp) { c.shadowBlur = 0; c.fillStyle = '#ffffff22'; c.fillRect(u.x - 10, GROUND + u.y - 74 * u.size, 20, 2.5); c.fillStyle = u.t.c; c.fillRect(u.x - 10, GROUND + u.y - 74 * u.size, 20 * Math.max(0, u.hp / u.maxHp), 2.5); c.shadowBlur = 10; }
  }
  // projektil
  for (const p of G.proj) {
    const tx = p.tgt && p.tgt.hp > 0 ? p.tgt.x : p.tx, ty = p.tgt && p.tgt.hp > 0 ? GROUND + p.tgt.y - 30 : p.ty;
    const x = p.sx + (tx - p.sx) * p.t, y = p.sy + (ty - p.sy) * p.t - Math.sin(p.t * Math.PI) * p.arc;
    const nx = p.sx + (tx - p.sx) * (p.t + 0.04), ny = p.sy + (ty - p.sy) * (p.t + 0.04) - Math.sin((p.t + 0.04) * Math.PI) * p.arc;
    const a = Math.atan2(ny - y, nx - x);
    c.shadowBlur = 0; c.strokeStyle = p.c; c.lineCap = 'round';
    if (p.st && p.st !== 'arrow' && !p.big) { drawProj(c, p, x, y, a); continue; }
    c.globalAlpha = 0.25; c.lineWidth = 5; c.beginPath(); c.moveTo(x - Math.cos(a) * 26, y - Math.sin(a) * 26); c.lineTo(x, y); c.stroke();
    c.globalAlpha = 1; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x - Math.cos(a) * 13, y - Math.sin(a) * 13); c.lineTo(x, y); c.stroke();
    blob(c, p.c, x, y, p.big ? 14 : 7, p.big ? 14 : 7, 0.9); if (p.big) { c.globalAlpha = 1; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill(); } c.globalAlpha = 1;
  }
  // efek
  for (const f of G.fx) {
    if (f.k === 'meteor') {
      const k = 1 - f.life / f.max, y = -oy + (GROUND + oy) * Math.min(1, k * 1.15), x = f.x - (1 - k) * 160;
      if (!f.hit) { c.shadowColor = f.c; c.shadowBlur = 30; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill();
        c.strokeStyle = f.c; c.lineWidth = 9; c.globalAlpha = 0.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 60, y - 90); c.stroke(); c.globalAlpha = 1; }
      else { c.shadowColor = f.c; c.fillStyle = f.c; c.globalAlpha = f.life * 5; c.beginPath(); c.arc(f.x, GROUND, 75 * (1 - f.life * 4), Math.PI, 0); c.fill(); c.globalAlpha = 1; }
    } else if (f.k === 'wave') {
      c.shadowColor = f.c; c.shadowBlur = 30; c.strokeStyle = f.c; c.lineWidth = 7; c.globalAlpha = Math.min(1, f.life);
      c.beginPath(); c.arc(f.x - f.dir * 30, GROUND - 50, 60, -1.1, 1.1); if (f.dir < 0) { c.beginPath(); c.arc(f.x + 30, GROUND - 50, 60, Math.PI - 1.1, Math.PI + 1.1); } c.stroke();
      c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke(); c.globalAlpha = 1;
    } else if (f.k === 'beam') {
      const k = f.life / f.max; c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.strokeStyle = f.c;
      c.globalAlpha = k * 0.35; c.lineWidth = 14; c.beginPath(); c.moveTo(f.x1, f.y1); c.lineTo(f.x2, f.y2); c.stroke();
      c.globalAlpha = k; c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke(); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    } else if (f.k === 'ring') {
      const k = 1 - f.life / f.max; c.shadowBlur = 0;
      blob(c, f.c, f.x, f.y, 10 + k * 8, 10 + k * 8, (1 - k) * 0.8);
      c.globalAlpha = 1 - k; c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.arc(f.x, f.y, 4 + k * 14, 0, 7); c.stroke();
      c.beginPath(); for (let i = 0; i < 4; i++) { const an = i * 1.57 + 0.6; c.moveTo(f.x + Math.cos(an) * (5 + k * 8), f.y + Math.sin(an) * (5 + k * 8)); c.lineTo(f.x + Math.cos(an) * (9 + k * 16), f.y + Math.sin(an) * (9 + k * 16)); } c.stroke();
      c.globalAlpha = 1;
    } else if (f.k === 'text') {
      c.shadowBlur = 8; c.shadowColor = f.c; c.fillStyle = f.c; c.font = f.sm ? '700 12px Teko, sans-serif' : '700 16px Teko, sans-serif'; c.textAlign = 'center';
      c.globalAlpha = Math.min(1, f.life * 2); c.fillText(f.s, f.x, f.y - (1 - f.life) * 20); c.globalAlpha = 1; c.textAlign = 'left';
    }
  }
  // partikel
  c.shadowBlur = 0;
  c.globalCompositeOperation = 'lighter';
  for (const p of G.parts) { const a = Math.min(1, p.life * 3); blob(c, p.c, p.x, p.y, p.r * 3, p.r * 3, a * 0.6); c.globalAlpha = a; c.fillStyle = p.c; c.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r, p.r); }
  // bara terapung
  if (embers.length < 40) embers.push({ x: rnd(0, W), y: GROUND + rnd(0, 20), vy: rnd(-25, -10), ph: rnd(0, 6), life: rnd(4, 9), c: Math.random() < 0.5 ? P.c : E.c });
  for (const e of embers) { e.life -= 1 / 60; e.y += e.vy / 60; e.x += Math.sin(G.t + e.ph) * 0.3; blob(c, e.c, e.x, e.y, 4, 4, Math.min(1, e.life) * 0.7); }
  for (let i = embers.length - 1; i >= 0; i--) if (embers[i].life <= 0) embers.splice(i, 1);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  // kilat skrin bila ult + vignette
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (vign) c.drawImage(vign, 0, 0);
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  for (const f of G.fx) if (f.k === 'flash') { c.fillStyle = f.c; c.globalAlpha = f.life / f.max * 0.3; c.fillRect(0, 0, VW, VH); c.globalAlpha = 1; }
  // minimap
  const mw = Math.min(200, VW * 0.45), mx = (VW - mw) / 2, my = 6;
  c.fillStyle = '#ffffff10'; c.fillRect(mx, my, mw, 8);
  c.strokeStyle = '#ffffff40'; c.lineWidth = 1; c.strokeRect(mx + camX / W * mw, my - 1, viewW / W * mw, 10);
  G.units.forEach(u => { c.fillStyle = u.t.c; c.fillRect(mx + u.x / W * mw - 1, my + 2 + (u.y / 46) * 3, 2, 2); });
  if (G.sides[0].buff.root || G.sides[1].buff.root) {}
}

/* ================= HUD ================= */
let hudT = 0;
function hud() {
  const P = G.sides[0], E = G.sides[1];
  $('gold').textContent = Math.floor(P.gold);
  $('goldRate').textContent = `+${6 + 2 * P.ups.ekonomi}/s`;
  $('pHp').style.width = Math.max(0, P.baseHp / BASE_HP * 100) + '%';
  $('eHp').style.width = Math.max(0, E.baseHp / BASE_HP * 100) + '%';
  [...$('units').children].forEach(b => { const k = b.dataset.k, cst = costOf(0, k); b.classList.toggle('cant', P.gold < cst || (UNITS[k].elite && G.units.filter(u => u.side === 0 && u.type === k).length >= ELITE_MAX)); b.querySelector('small').textContent = '🪙' + cst; const n = G.units.filter(u => u.side === 0 && u.type === k).length; b.querySelector('.cnt').textContent = n || ''; });
  [...$('ups').children].forEach(b => { const k = b.dataset.k, lv = P.ups[k]; b.querySelector('.lv').textContent = 'Lv' + lv;
    b.querySelector('small').textContent = lv >= MAXUP ? 'MAX' : '🪙' + upCost(P, k); b.classList.toggle('cant', lv >= MAXUP || P.gold < upCost(P, k)); });
  $('ultFill').style.height = P.ult + '%';
  $('ultBtn').classList.toggle('ready', P.ult >= 100);
  const sm = SKILL_CD * (P.cards.has('skillCd') ? 0.6 : 1);
  $('skillFill').style.height = (100 - P.skill / sm * 100) + '%';
  $('skillCd').textContent = P.skill > 0 ? Math.ceil(P.skill) : '';
  $('skillBtn').classList.toggle('ready', P.skill <= 0);
}
let toastTO;
function toast(s, c, dur = 1.1) { const t = $('toast'); t.textContent = s; t.style.color = c; t.classList.add('show'); clearTimeout(toastTO); toastTO = setTimeout(() => t.classList.remove('show'), dur * 1000); }

/* ================= END / PAUSE ================= */
function modal(title, text, btns, col) {
  $('mTitle').textContent = title; $('mTitle').style.color = col || '#fff'; $('mTitle').style.textShadow = `0 0 14px ${col || '#a86bff'}`;
  $('mText').innerHTML = text; const b = $('mBtns'); b.innerHTML = '';
  btns.forEach(([l, fn, alt]) => { const e = document.createElement('button'); e.type = 'button'; e.textContent = l; if (alt) e.className = 'alt'; e.onclick = () => { $('modal').classList.add('hidden'); fn(); }; b.appendChild(e); });
  $('modal').classList.remove('hidden');
}
function endBattle(win) {
  if (G.over) return; G.over = true;
  snd('boom'); G.shake = 14;
  const loser = G.sides[win ? 1 : 0], lx = win ? W - BASE_X : BASE_X;
  loser.baseHp = 0;
  for (let i = 0; i < 80; i++) G.parts.push({ x: lx + rnd(-30, 30), y: GROUND - rnd(0, 150), vx: rnd(-250, 250), vy: rnd(-350, -50), life: 1.4, c: pick([loser.t.c, '#fff', loser.t.g]), r: 3 });
  if (win) { store.wins = (store.wins || 0) + 1; save(); }
  const P = G.sides[0];
  setTimeout(() => {
    const face = chiefImg(win ? G.sides[0].t.id : G.sides[1].t.id, 'win');
    const txt = face + `${win ? 'Kubu ' + G.sides[1].t.name + ' roboh!' : 'Kubu kau dah roboh...'}<br>Musuh dibunuh: <b>${P.kills}</b> · Masa: <b>${Math.floor(G.t / 60)}:${String(Math.floor(G.t % 60)).padStart(2, '0')}</b>`;
    if (tour) modal(win ? 'MENANG!' : 'KALAH', txt + (win ? '' : '<br>Kau tersingkir dari kejohanan.'), [['Lihat Bracket', () => { G = null; advanceTour(win); }]], win ? '#ffd36b' : '#ff5a5a');
    else modal(win ? 'MENANG!' : 'KALAH', txt, [['Lawan Lagi', () => startBattle(G.sides[0].t.id, G.sides[1].t.id, G.sides[1].d)], ['Menu', () => { G = null; show('menu'); buildTribeGrid(); }, 1]], win ? '#ffd36b' : '#ff5a5a');
  }, 1600);
}
$('pauseBtn').onclick = () => {
  if (!G || G.over) return; G.paused = true;
  const P = G.sides[0], cs = CARDS.filter(c => P.cards.has(c.id)).map(c => c.ic + ' ' + c.t).join('<br>');
  modal('PAUSE', `<b style="color:${P.t.c}">Pasif:</b> ${PASSIVE[P.t.id]}<br><b style="color:${P.t.c}">Skill:</b> ${SKILL[P.t.id][0]}: ${SKILL[P.t.id][1]}<br><b style="color:${P.t.c}">Istimewa:</b> ${ELITE[P.t.id].name}: ${ELITE[P.t.id].desc}${cs ? '<br><br><b>Kad aktif:</b><br>' + cs : ''}`, [['Sambung', () => { G.paused = false; }], [muted ? '🔇 Bunyi: OFF' : '🔊 Bunyi: ON', () => { muted = !muted; G.paused = false; }, 1],
    ['Menyerah', () => { G.paused = false; endBattle(false); }, 1]]);
};
$('speedBtn').onclick = () => { if (!G) return; G.speed = G.speed === 1 ? 2 : G.speed === 2 ? 3 : 1; $('speedBtn').textContent = G.speed + 'x'; };

// seret untuk tengok medan
let drag = null;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, cam: camX }; });
addEventListener('pointermove', e => { if (!drag || !G) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) { camX = drag.cam - dx / scale; userPan = 2.5; } });
addEventListener('pointerup', () => { drag = null; });

/* ================= LOOP ================= */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (G && !G.paused && !document.hidden) {
    const steps = G.speed;
    for (let i = 0; i < steps; i++) { if (G.paused) break; if (!G.over) update(dt); else { // animasi akhir masih berjalan
        for (const c of G.corpses) stepRagdoll(c, dt);
        for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
        G.parts = G.parts.filter(p => p.life > 0); G.t += dt; G.shake = Math.max(0, G.shake - dt * 30); } }
    draw();
    if ((hudT += dt) > 0.12) { hudT = 0; hud(); }
  }
  requestAnimationFrame(loop);
}
buildTribeGrid();
window.__pl = () => G; window.__mini = miniStick;
requestAnimationFrame(loop);
})();
