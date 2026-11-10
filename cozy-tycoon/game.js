/* Cozy Tycoon — Saidina/Monopoly-style board game, chibi style. MyCozyWorld */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const SAVE = 'cozyTycoonSave_v1';

/* ---------- Chibi characters (SVG fallback; swap with sprites/token_<id>.webp) ---------- */
const CHARS = [
  { id: 'kucing', name: 'Mimi', color: '#ff9f43', body: '#ffb86b', ear: 'cat' },
  { id: 'arnab', name: 'Bubu', color: '#ff7fa8', body: '#fff4f8', ear: 'bunny' },
  { id: 'panda', name: 'Pipi', color: '#6c7ae0', body: '#ffffff', ear: 'panda' },
  { id: 'ayam', name: 'Koko', color: '#f2b705', body: '#ffe066', ear: 'chick' },
];
const SPRITES = {};
function chibi(c) {
  const b = c.body, d = c.id === 'panda' ? '#3b3b4f' : (c.id === 'arnab' ? '#ffc2d6' : '#e8893a');
  let ears = '';
  if (c.ear === 'cat') ears = `<path d="M22 30 L28 8 L42 24Z" fill="${b}" stroke="#d9772b" stroke-width="2"/><path d="M78 30 L72 8 L58 24Z" fill="${b}" stroke="#d9772b" stroke-width="2"/><path d="M27 24 L29 14 L36 22Z" fill="#ffc7c7"/><path d="M73 24 L71 14 L64 22Z" fill="#ffc7c7"/>`;
  if (c.ear === 'bunny') ears = `<ellipse cx="36" cy="14" rx="8" ry="20" fill="${b}" stroke="#f2b3c9" stroke-width="2"/><ellipse cx="64" cy="14" rx="8" ry="20" fill="${b}" stroke="#f2b3c9" stroke-width="2"/><ellipse cx="36" cy="15" rx="4" ry="14" fill="#ffc2d6"/><ellipse cx="64" cy="15" rx="4" ry="14" fill="#ffc2d6"/>`;
  if (c.ear === 'panda') ears = `<circle cx="26" cy="24" r="11" fill="#3b3b4f"/><circle cx="74" cy="24" r="11" fill="#3b3b4f"/>`;
  if (c.ear === 'chick') ears = `<path d="M44 14 Q50 0 54 14 Q60 4 58 18" fill="none" stroke="#e0a100" stroke-width="4" stroke-linecap="round"/>`;
  const eyePatch = c.id === 'panda' ? `<ellipse cx="37" cy="50" rx="9" ry="11" fill="#3b3b4f" transform="rotate(-15 37 50)"/><ellipse cx="63" cy="50" rx="9" ry="11" fill="#3b3b4f" transform="rotate(15 63 50)"/>` : '';
  const eyeCol = c.id === 'panda' ? '#fff' : '#3a2a3a';
  const mouth = c.id === 'ayam' ? `<path d="M45 60 L55 60 L50 67Z" fill="#ff8c42"/>` : `<path d="M44 61 Q47 65 50 61 Q53 65 56 61" fill="none" stroke="#3a2a3a" stroke-width="2.2" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="50" cy="116" rx="24" ry="4" fill="#0002"/>
  <ellipse cx="50" cy="96" rx="22" ry="19" fill="${b}" stroke="${d}" stroke-width="2"/>
  <ellipse cx="50" cy="100" rx="12" ry="10" fill="#fff8" />
  <path d="M32 84 Q50 92 68 84 L66 92 Q50 98 34 92Z" fill="${c.color}"/>
  <ellipse cx="36" cy="113" rx="8" ry="5" fill="${d}"/><ellipse cx="64" cy="113" rx="8" ry="5" fill="${d}"/>
  ${ears}
  <circle cx="50" cy="50" r="33" fill="${b}" stroke="${d}" stroke-width="2.4"/>
  ${eyePatch}
  <ellipse cx="38" cy="50" rx="6" ry="7.5" fill="${eyeCol === '#fff' ? '#1e1e2a' : eyeCol}"/><ellipse cx="62" cy="50" rx="6" ry="7.5" fill="${eyeCol === '#fff' ? '#1e1e2a' : eyeCol}"/>
  <circle cx="40" cy="47" r="2.6" fill="#fff"/><circle cx="64" cy="47" r="2.6" fill="#fff"/><circle cx="36.5" cy="53" r="1.2" fill="#fff"/><circle cx="60.5" cy="53" r="1.2" fill="#fff"/>
  <ellipse cx="27" cy="60" rx="6" ry="3.5" fill="#ff8fa8" opacity=".6"/><ellipse cx="73" cy="60" rx="6" ry="3.5" fill="#ff8fa8" opacity=".6"/>
  ${mouth}
</svg>`;
}
function avatar(ci) { const c = CHARS[ci]; return SPRITES[c.id] ? `<img src="${SPRITES[c.id]}" alt="">` : chibi(c); }
fetch('sprites/list.json').then(r => r.ok ? r.json() : []).then(l => {
  CHARS.forEach(c => { if (l.indexOf('token_' + c.id) >= 0) SPRITES[c.id] = 'sprites/token_' + c.id + '.webp'; });
  for (let n = 1; n <= 6; n++) if (l.indexOf('dice_' + n) >= 0) { DICE_IMG[n] = 'sprites/dice_' + n + '.webp'; new Image().src = DICE_IMG[n]; }
  l.forEach(n => { ART[n] = 'sprites/' + n + '.webp'; });
  applyArt();
  renderMenu(); if (G) { buildBoard(); renderAll(); }
}).catch(() => {});
/* ---------- Optional art from ChatGPT (see sprites/ART_BRIEF.md) ---------- */
const ART = {};
const SLUGS = ['go', 'cendol', 'rezeki', 'roticanai', 'bil_elektrik', 'lrt', 'pasarmalam', 'musibah', 'mamak', 'runcit',
  'tokwan', 'melaka', 'air', 'ipoh', 'kuantan', 'ktm', 'kotabharu', 'rezeki', 'kterengganu', 'alorsetar',
  'kenduri', 'cameron', 'musibah', 'genting', 'langkawi', 'ets', 'kuching', 'kk', 'elektrik', 'sandakan',
  'tertidur', 'putrajaya', 'jb', 'rezeki', 'penang', 'feri', 'musibah', 'menarakl', 'saman', 'klcc'];
const img = (n, cls) => `<img class="${cls || 'art'}" src="${ART[n]}" alt="" draggable="false">`;
function tileIcon(i) { const n = 'tile_' + SLUGS[i]; return ART[n] ? img(n, 'ti') : TILES[i].ic; }
function bldIcon(lv) { const n = 'bld_' + ['gerai', 'kedai', 'bangunan'][lv]; return ART[n] ? img(n, 'bi') : LVL_IC[lv]; }
function applyArt() {
  const root = document.documentElement.style;
  if (ART.bg_menu) root.setProperty('--bg-menu', `url(sprites/bg_menu.webp)`);
  if (ART.bg_game) root.setProperty('--bg-game', `url(sprites/bg_game.webp)`);
  if (ART.board_center) root.setProperty('--board-center', `url(sprites/board_center.webp)`);
  ['rezeki', 'musibah'].forEach(t => ['back', 'front'].forEach(f => { const n = `card_${t}_${f}`; if (ART[n]) root.setProperty('--' + n.replace(/_/g, '-'), `url(sprites/${n}.webp)`); }));
  document.body.classList.toggle('has-art', !!(ART.bg_menu || ART.bg_game));
  if (ART.logo_tycoon) {
    const h = document.querySelector('#menu h1'); if (h) h.innerHTML = img('logo_tycoon', 'logo');
    const c = document.querySelector('.c-title'); if (c) c.innerHTML = img('logo_tycoon', 'logo');
  }
  Object.keys(FOLK || {}).forEach(k => { if (ART['folk_' + k]) FOLK[k].img = ART['folk_' + k]; });
  Object.values(ART).forEach(u => { new Image().src = u; });
}

/* ---------- Board ---------- */
const SET = {
  coklat: '#a9765a', biru: '#7fd0f0', pink: '#ff8fc1', oren: '#ffa94d',
  merah: '#ff6b6b', kuning: '#ffd43b', hijau: '#51cf66', ungu: '#7c5cd6',
};
const UPC = { coklat: 50, biru: 50, pink: 100, oren: 100, merah: 150, kuning: 150, hijau: 200, ungu: 200 };
function P(name, ic, set, price) { return { t: 'prop', name, ic, set, price }; }
const TILES = [
  { t: 'go', name: 'MULA', ic: '🏁' },
  P('Gerai Cendol', '🍧', 'coklat', 60), { t: 'rezeki', name: 'Rezeki', ic: '🍀' }, P('Roti Canai', '🫓', 'coklat', 60),
  { t: 'tax', name: 'Bil Elektrik', ic: '💡', amt: 100 }, { t: 'stn', name: 'Stesen LRT', ic: '🚝', price: 200 },
  P('Pasar Malam', '🏮', 'biru', 100), { t: 'musibah', name: 'Musibah', ic: '🌧️' }, P('Kedai Mamak', '☕', 'biru', 100), P('Kedai Runcit', '🧺', 'biru', 120),
  { t: 'jail', name: 'Rumah Tok Wan', ic: '🏡' },
  P('Melaka', '🛺', 'pink', 140), { t: 'util', name: 'Syarikat Air', ic: '💧', price: 150 }, P('Ipoh', '🥢', 'pink', 140), P('Kuantan', '🐢', 'pink', 160),
  { t: 'stn', name: 'Stesen KTM', ic: '🚆', price: 200 },
  P('Kota Bharu', '🪁', 'oren', 180), { t: 'rezeki', name: 'Rezeki', ic: '🍀' }, P('K. Terengganu', '🐟', 'oren', 180), P('Alor Setar', '🌾', 'oren', 200),
  { t: 'kenduri', name: 'Kenduri Kahwin', ic: '💐' },
  P('Cameron', '🍓', 'merah', 220), { t: 'musibah', name: 'Musibah', ic: '🌧️' }, P('Genting', '🎡', 'merah', 220), P('Langkawi', '🦅', 'merah', 240),
  { t: 'stn', name: 'Stesen ETS', ic: '🚄', price: 200 },
  P('Kuching', '🐱', 'kuning', 260), P('Kota Kinabalu', '⛰️', 'kuning', 260), { t: 'util', name: 'Syarikat Elektrik', ic: '⚡', price: 150 }, P('Sandakan', '🦧', 'kuning', 280),
  { t: 'gojail', name: 'Tertidur!', ic: '😴' },
  P('Putrajaya', '🕌', 'hijau', 300), P('Johor Bahru', '🌉', 'hijau', 300), { t: 'rezeki', name: 'Rezeki', ic: '🍀' }, P('Pulau Pinang', '🍜', 'hijau', 320),
  { t: 'stn', name: 'Stesen Feri', ic: '⛴️', price: 200 },
  { t: 'musibah', name: 'Musibah', ic: '🌧️' }, P('Menara KL', '🗼', 'ungu', 350), { t: 'tax', name: 'Saman Parking', ic: '🅿️', amt: 75 }, P('KLCC', '🏙️', 'ungu', 400),
];
const LVL = ['Gerai', 'Kedai', 'Bangunan'], LVL_IC = ['🛖', '🏪', '🏢'], MULT = [1, 6, 18];
const baseRent = t => Math.max(4, Math.round(t.price / 10 / 2) * 2);
function tilePos(i) {
  if (i <= 10) return [10, 10 - i];
  if (i <= 20) return [10 - (i - 10), 0];
  if (i <= 30) return [0, i - 20];
  return [i - 30, 10];
}

/* ---------- Cards ---------- */
const REZEKI = [
  { txt: 'Durian runtuh! Dapat duit', money: 200, ic: '🍈' },
  { txt: 'Menang pertandingan mewarna', money: 100, ic: '🖍️' },
  { txt: 'Dapat duit raya dari Tok Wan', money: 150, ic: '🧧' },
  { txt: 'Kuih kau laku keras!', money: 80, ic: '🍡' },
  { txt: 'Jumpa duit dalam poket seluar', money: 50, ic: '👖' },
  { txt: 'Hari jadi kau! Semua kawan bagi hadiah', each: 30, ic: '🎂' },
  { txt: 'Naik basikal laju ke MULA', goto: 0, ic: '🚲' },
  { txt: 'Naik tren ke stesen terdekat', nearest: 'stn', ic: '🚝' },
];
const MUSIBAH = [
  { txt: 'Kena saman parking!', money: -50, ic: '🚓' },
  { txt: 'Tayar basikal pancit', money: -40, ic: '🛞' },
  { txt: 'Kucing pecahkan pasu mak', money: -60, ic: '🏺' },
  { txt: 'Lupa bawa bekal, beli makan', money: -30, ic: '🍱' },
  { txt: 'Mengantuk... tidur kat Rumah Tok Wan', jail: true, ic: '😴' },
  { txt: 'Baiki semua kedai & bangunan (25 setiap satu)', repair: 25, ic: '🔧' },
  { txt: 'Tertinggal barang, undur 3 petak', back: 3, ic: '↩️' },
  { txt: 'Belanja semua kawan aiskrim', each: -20, ic: '🍦' },
];

/* ---------- AI personalities ---------- */
const AIS = [
  { name: 'Pak Cik Kedekut', reserve: 420, upReserve: 600 },
  { name: 'Abang Borong', reserve: 40, upReserve: 150 },
  { name: 'Mak Cik Bijak', reserve: 180, upReserve: 300, smart: true },
];

/* ---------- Sound ---------- */
let soundOn = localStorage.getItem('cozyTycoonSound') !== '0', AC = null;
let voiceOn = localStorage.getItem('cozyTycoonVoice') !== '0';
function beep(f = 600, d = .08, type = 'triangle', v = .07) {
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state !== 'running') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.value = f; g.gain.value = v;
    g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + d);
    o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + d);
  } catch (e) {}
}
const sfx = {
  step: () => beep(520 + Math.random() * 80, .05),
  coin: () => { beep(988, .08, 'square', .04); setTimeout(() => beep(1319, .12, 'square', .04), 70); },
  pay: () => { beep(300, .12, 'sawtooth', .04); setTimeout(() => beep(220, .15, 'sawtooth', .04), 90); },
  buy: () => [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, .1), i * 80)),
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .14), i * 120)),
};
// iPhone: unlock audio on first touch & play even when silent switch is on
function unlockAudio() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
    if (window.speechSynthesis && !unlockAudio.sp) { unlockAudio.sp = 1; const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); }
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    AC.resume();
    const b = AC.createBuffer(1, 1, 22050), src = AC.createBufferSource(); src.buffer = b; src.connect(AC.destination); src.start(0);
    const a = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA='); a.setAttribute('playsinline', ''); a.play().catch(() => {});
  } catch (e) {}
}
['touchstart', 'touchend', 'pointerdown', 'click'].forEach(ev => document.addEventListener(ev, unlockAudio, { passive: true }));
document.addEventListener('visibilitychange', () => { if (!document.hidden && AC) AC.resume(); });
function updSoundBtn() { $('soundBtn').textContent = soundOn ? '🔊' : '🔇'; $('voiceBtn') && $('voiceBtn').classList.toggle('off', !voiceOn); }
setTimeout(() => { $('voiceBtn').onclick = () => { voiceOn = !voiceOn; localStorage.setItem('cozyTycoonVoice', voiceOn ? '1' : '0'); updSoundBtn(); if (voiceOn) speak('Suara pengumuman dihidupkan'); else window.speechSynthesis && speechSynthesis.cancel(); }; updSoundBtn(); });
$('soundBtn').onclick = () => { soundOn = !soundOn; localStorage.setItem('cozyTycoonSound', soundOn ? '1' : '0'); updSoundBtn(); beep(); };
updSoundBtn();

/* ---------- Penduduk notifications + voice announcer ---------- */
const FOLK = {
  kiah: { n: 'Mak Cik Kiah', f: '👵', c: '#e05f8d' },
  abu: { n: 'Pak Abu', f: '👴', c: '#a9765a' },
  mira: { n: 'Adik Mira', f: '👧', c: '#5cc9a7' },
  polis: { n: 'Encik Polis', f: '👮', c: '#5b7fd6' },
  ann: { n: 'PENGUMUMAN', f: '📢', c: '#e0a100' },
};
let VOICE = null;
function pickVoice() {
  if (!window.speechSynthesis) return;
  const v = speechSynthesis.getVoices();
  VOICE = v.find(x => /^ms/i.test(x.lang)) || v.find(x => /^id/i.test(x.lang)) || null;
}
if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(txt) {
  if (!voiceOn || !soundOn || !window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt.replace(/RM(\d+)/g, '$1 ringgit').replace(/[^\p{L}\p{N}\s,.!?']/gu, ''));
    u.lang = VOICE ? VOICE.lang : 'ms-MY'; if (VOICE) u.voice = VOICE;
    u.rate = 1.02; u.pitch = 1.15; u.volume = 1;
    speechSynthesis.speak(u);
  } catch (e) {}
}
function chime() { beep(784, .25, 'sine', .08); setTimeout(() => beep(587, .35, 'sine', .08), 260); }
function notify(who, msg, voice) {
  const F = FOLK[who] || FOLK.kiah, box = $('toasts'); if (!box) return;
  const t = document.createElement('div');
  t.className = 'toast' + (who === 'ann' ? ' ann' : ''); t.style.setProperty('--c', F.c);
  t.innerHTML = `<div class="face">${F.img ? `<img src="${F.img}" alt="">` : F.f}</div><div><b>${F.n}</b><span>${msg}</span></div>`;
  t.onclick = () => t.remove();
  box.prepend(t);
  while (box.children.length > 2) box.lastChild.remove();
  setTimeout(() => { t.classList.add('bye'); setTimeout(() => t.remove(), 400); }, 6500);
  if (voice) { chime(); setTimeout(() => speak((who === 'ann' ? 'Pengumuman! ' : '') + msg), 650); }
  else beep(1046, .06, 'sine', .05);
}
const pick = a => a[Math.random() * a.length | 0];
function folkChatter() {
  if (!G || Math.random() > .55) return;
  const ps = alive().map(p => ({ p, n: G.own.filter(o => o === G.players.indexOf(p)).length }));
  const rich = ps.slice().sort((a, b) => b.n - a.n)[0], poor = ps.slice().sort((a, b) => a.p.money - b.p.money)[0];
  const opts = [];
  if (rich && rich.n >= 4) opts.push(['abu', `Tak puas hati betul! ${pname(rich.p)} dah borong ${rich.n} tempat. Tinggal apa untuk orang lain?`, true]);
  if (poor && poor.p.money < 300) opts.push(['kiah', `Kesian ${pname(poor.p)}, tinggal ${rm(poor.p.money)} je. Jimat-jimat ye nak!`, false]);
  opts.push(pick([
    ['polis', 'Hari ni jalan sesak kat KLCC. Sila guna LRT ye!', true],
    ['mira', 'Cendol kat Gerai Cendol sedap gila! Nak lagi!', false],
    ['kiah', 'Harga barang naik lagi... mak cik pening kepala.', false],
    ['abu', 'Bila nak buat taman permainan baru ni? Budak-budak bosan!', true],
    ['polis', 'Ingat! Jangan parking merata-rata. Nanti kena saman!', false],
    ['mira', 'Yeay! Esok cuti sekolah, jom pergi Langkawi!', false],
    ['ann', 'Pasar malam dibuka malam ini. Jemput datang semua!', true],
  ]));
  const o = pick(opts); notify(o[0], o[1], o[2]);
}

/* ---------- State ---------- */
let G = null, busy = false;
const cfg = { char: 0, mode: 'ai', count: 4, rounds: 20, speed: +(localStorage.getItem('cozyTycoonSpeed') || 1.15) };
const SPD = () => cfg.speed;
const wait = ms => new Promise(r => setTimeout(r, ms * SPD()));
let camOn = localStorage.getItem('cozyTycoonCam') !== '0';
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const cur = () => G.players[G.turn];
const alive = () => G.players.filter(p => !p.out);
const rm = n => 'RM' + n;

function newGame() {
  const players = [];
  if (cfg.mode === 'ai') {
    const others = [0, 1, 2, 3].filter(i => i !== cfg.char);
    players.push({ name: getName(0, 'Kau'), ci: cfg.char, ai: null });
    others.forEach((ci, k) => players.push({ name: CHARS[ci].name, ci, ai: k }));
  } else {
    const order = [cfg.char, ...[0, 1, 2, 3].filter(i => i !== cfg.char)].slice(0, cfg.count);
    order.forEach((ci, k) => players.push({ name: getName(k, CHARS[ci].name), ci, ai: null }));
  }
  players.forEach(p => Object.assign(p, { money: 1500, pos: 0, out: false, sleep: 0 }));
  G = {
    players, turn: 0, round: 1, maxRounds: cfg.rounds,
    own: TILES.map(() => null), lvl: TILES.map(() => 0),
    rz: shuffle([...REZEKI.keys()]), ms: shuffle([...MUSIBAH.keys()]),
    log: ['Selamat datang ke Cozy Tycoon! 🎉'], dice: [1, 1], over: false,
  };
}
function save() { try { if (G && !G.over) localStorage.setItem(SAVE, JSON.stringify(G)); else localStorage.removeItem(SAVE); } catch (e) {} }
function load() { try { return JSON.parse(localStorage.getItem(SAVE)); } catch (e) { return null; } }

/* ---------- Menu ---------- */
let NAMES = []; try { NAMES = JSON.parse(localStorage.getItem('cozyTycoonNames')) || []; } catch (e) {}
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function getName(k, def) { const v = (NAMES[k] || '').trim(); return v ? v.slice(0, 12) : def; }
function renderNames() {
  const box = $('nameInputs'); if (!box) return;
  const order = cfg.mode === 'ai' ? [cfg.char] : [cfg.char, ...[0, 1, 2, 3].filter(i => i !== cfg.char)].slice(0, cfg.count);
  box.innerHTML = order.map((ci, k) => `<label class="name-row">${avatar(ci)}<input data-k="${k}" maxlength="12" autocomplete="off" placeholder="${cfg.mode === 'ai' ? 'Nama kau' : 'Pemain ' + (k + 1) + ' (' + CHARS[ci].name + ')'}" value="${esc(NAMES[k] || '')}"></label>`).join('');
  box.querySelectorAll('input').forEach(inp => inp.oninput = () => { NAMES[+inp.dataset.k] = inp.value; try { localStorage.setItem('cozyTycoonNames', JSON.stringify(NAMES)); } catch (e) {} });
}
function renderMenu() {
  renderNames();
  $('titleChars').innerHTML = CHARS.map((c, i) => avatar(i)).join('');
  $('charPick').innerHTML = CHARS.map((c, i) => `<button data-i="${i}" class="${i === cfg.char ? 'on' : ''}">${avatar(i)}${c.name}</button>`).join('');
  [...$('charPick').children].forEach(b => b.onclick = () => { cfg.char = +b.dataset.i; beep(700); renderMenu(); });
  $('resumeBtn').classList.toggle('hidden', !load());
}
function seg(id, key, num, after) {
  [...$(id).children].forEach(b => b.onclick = () => {
    [...$(id).children].forEach(x => x.classList.toggle('on', x === b));
    cfg[key] = num ? +b.dataset.v : b.dataset.v; beep(650); after && after();
  });
}
seg('modeSeg', 'mode', false, () => { $('countRow').classList.toggle('hidden', cfg.mode !== 'local'); renderNames(); });
seg('countSeg', 'count', true, renderNames); seg('speedSeg', 'speed', true, () => localStorage.setItem('cozyTycoonSpeed', cfg.speed));
[...$('speedSeg').children].forEach(b => b.classList.toggle('on', +b.dataset.v === cfg.speed)); seg('roundSeg', 'rounds', true);
$('startBtn').onclick = () => { newGame(); startPlay(); };
$('resumeBtn').onclick = () => { G = load(); if (G) { G.players.forEach(p => { if (p.ai === null && /^Pemain \d/.test(p.name || '')) p.name = CHARS[p.ci].name; }); startPlay(); } };

function startPlay() {
  $('menu').classList.add('hidden'); $('play').classList.remove('hidden'); document.body.classList.add('playing');
  buildBoard(); renderAll(); save(); nextTurn(true);
}

/* ---------- Render ---------- */
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const DICE_IMG = {};
function setDie(el, n) {
  if (DICE_IMG[n]) { el.classList.add('img'); el.innerHTML = `<img src="${DICE_IMG[n]}" alt="${n}">`; return; }
  el.classList.remove('img');
  el.innerHTML = `<div class="face">${[...Array(9)].map((_, i) => `<i class="${PIPS[n].includes(i) ? 'on' : ''}"></i>`).join('')}</div>`;
}
/* camera: pseudo-3D tilt toward moving token, then back flat */
function cam(pos) {
  const b = $('board');
  G && G.players.forEach((q, j) => { const t = $('tok' + j); t && t.classList.toggle('active', pos !== null && j === G.turn); });
  if (pos === null || !camOn) { b.style.setProperty('--tilt', '20deg'); b.style.transform = ''; b.classList.remove('tilt'); return; }
  const [r, c] = tilePos(pos);
  b.style.transformOrigin = `${(c + .5) / 11 * 100}% ${(r + .5) / 11 * 100}%`;
  b.style.setProperty('--tilt', '30deg');
  b.style.transform = 'rotateX(30deg) scale(1.22)'; b.classList.add('tilt');
}
$('camBtn').onclick = () => { camOn = !camOn; localStorage.setItem('cozyTycoonCam', camOn ? '1' : '0'); $('camBtn').classList.toggle('off', !camOn); beep(650); };
$('camBtn').classList.toggle('off', !camOn);

function buildBoard() {
  const bd = $('board');
  bd.querySelectorAll('.tile').forEach(t => t.remove());
  TILES.forEach((t, i) => {
    const [r, c] = tilePos(i), el = document.createElement('div');
    el.className = 'tile' + (i % 10 === 0 ? ' corner' : ''); el.id = 'tile' + i;
    el.style.gridRow = r + 1; el.style.gridColumn = c + 1;
    el.innerHTML = (t.set ? `<div class="strip" style="background:${SET[t.set]}"></div>` : '') +
      `<div class="ic">${tileIcon(i)}</div>` + (t.price ? `<div class="pr">${t.price}</div>` : (i % 10 === 0 ? '' : `<div class="pr">${t.amt ? '-' + t.amt : ''}</div>`)) + '<div class="bld"></div>';
    el.onclick = () => { if (!busy && $('modal').classList.contains('hidden')) showTileInfo(i); };
    bd.appendChild(el);
  });
  $('tokens').innerHTML = G.players.map((p, k) => `<div class="token" id="tok${k}"><div class="stand">${avatar(p.ci)}</div><div class="shadow"></div></div>`).join('');
}
function renderAll() {
  if (!G || !$('board').querySelector('.tile')) return;
  $('players').style.gridTemplateColumns = `repeat(${G.players.length},1fr)`;
  $('players').innerHTML = G.players.map((p, k) =>
    `<div class="pchip ${k === G.turn ? 'turn' : ''} ${p.out ? 'out' : ''}" style="border-color:${k === G.turn ? CHARS[p.ci].color : '#fff'}">${p.sleep ? '<i class="zz">💤</i>' : ''}${avatar(p.ci)}<b>${pname(p)}</b><span>${p.out ? 'Bankrap' : rm(p.money)}</span></div>`).join('');
  TILES.forEach((t, i) => {
    const el = $('tile' + i), o = G.own[i];
    el.classList.toggle('owned', o !== null);
    if (o !== null) el.style.setProperty('--own', CHARS[G.players[o].ci].color);
    el.querySelector('.bld').innerHTML = o !== null && t.t === 'prop' ? bldIcon(G.lvl[i]) : (o !== null ? (ART.bld_owned ? img('bld_owned', 'bi') : '⭐') : '');
  });
  G.players.forEach((p, k) => placeToken(k, p.pos));
  const p = cur();
  $('roundTxt').textContent = G.maxRounds ? `Pusingan ${Math.min(G.round, G.maxRounds)}/${G.maxRounds}` : `Pusingan ${G.round} · sampai tinggal sorang`;
  $('turnTxt').innerHTML = `${avatar(p.ci)} Giliran ${pname(p)}!`;
  $('log').innerHTML = G.log.slice(0, 3).map(l => `<div>${l}</div>`).join('');
  [...$('dice').children].forEach((d, i) => { if (!d.classList.contains('spin')) setDie(d, G.dice[i]); });
  $('hudTurn').innerHTML = $('turnTxt').innerHTML;
}
function placeToken(k, pos) {
  const el = $('tok' + k); if (!el) return;
  const [r, c] = tilePos(pos), same = G.players.map((p, j) => j).filter(j => !G.players[j].out && G.players[j].pos === pos), idx = same.indexOf(k);
  const ox = [.1, .32, -.08, .45][idx < 0 ? 0 : idx], oy = [-.3, -.3, -.12, -.12][idx < 0 ? 0 : idx];
  el.style.left = `calc(${(c + ox) / 11 * 100}% + 3px)`; el.style.top = `calc(${(r + oy) / 11 * 100}% + 3px)`;
  el.style.display = G.players[k].out ? 'none' : '';
  el.style.zIndex = k === G.turn ? 4 : 3;
}
function log(m) { G.log.unshift(m); G.log.length = Math.min(G.log.length, 12); renderAll(); }
function floatText(k, txt, col) {
  const tok = $('tok' + k); if (!tok) return;
  const f = document.createElement('div'); f.className = 'float'; f.textContent = txt; f.style.color = col;
  f.style.left = tok.style.left; f.style.top = tok.style.top; $('tokens').appendChild(f); setTimeout(() => f.remove(), 1300);
}

/* ---------- Modal ---------- */
function modal(html, buttons, autoMs) {
  return new Promise(res => {
    const ms = autoMs || 0;
    $('modalCard').innerHTML = html + (ms ? `<div class="auto-bar"><i style="animation-duration:${ms}ms"></i></div><div class="tap-hint">tap untuk teruskan</div>` : (buttons.length ? `<div class="btns">${buttons.map((b, i) => `<button class="btn ${b.cls || 'pink'}" data-i="${i}" ${b.dis ? 'disabled' : ''}>${b.label}</button>`).join('')}</div>` : ''));
    $('modal').classList.remove('hidden');
    let done = false;
    const close = v => { if (done) return; done = true; $('modal').classList.add('hidden'); res(v); };
    $('modalCard').querySelectorAll('button').forEach(b => b.onclick = () => { beep(700); close(buttons[+b.dataset.i].v); });
    const fin = () => close(buttons.length ? buttons[0].v : null);
    if (ms) { setTimeout(fin, ms); $('modal').onclick = fin; }
    else if (!buttons.length) $('modal').onclick = () => close(null); else $('modal').onclick = null;
    if (html.includes('class="flip"')) setTimeout(() => { const f = $('modalCard').querySelector('.flip'); if (f) { f.classList.add('open'); sfx.buy(); } }, 450);
  });
}
function rentOf(i, diceSum) {
  const t = TILES[i], o = G.own[i]; if (o === null) return 0;
  if (t.t === 'stn') return 25 * Math.pow(2, TILES.filter((x, j) => x.t === 'stn' && G.own[j] === o).length - 1);
  if (t.t === 'util') return diceSum * (TILES.filter((x, j) => x.t === 'util' && G.own[j] === o).length === 2 ? 10 : 4);
  const fullSet = TILES.every((x, j) => x.set !== t.set || G.own[j] === o);
  return baseRent(t) * MULT[G.lvl[i]] * (fullSet && G.lvl[i] === 0 ? 2 : 1);
}
function propHtml(i) {
  const t = TILES[i], col = t.set ? SET[t.set] : '#a98bc4', o = G.own[i];
  let body = '';
  if (t.t === 'prop') {
    const b = baseRent(t);
    body = `<table class="rent-tbl">${LVL.map((l, k) => `<tr class="${o !== null && G.lvl[i] === k ? 'cur' : ''}"><td>${LVL_IC[k]} ${l}</td><td>sewa ${rm(b * MULT[k])}</td></tr>`).join('')}<tr><td>⭐ Set penuh (gerai)</td><td>sewa ×2</td></tr><tr><td>🔨 Kos upgrade</td><td>${rm(UPC[t.set])}</td></tr></table>`;
  } else if (t.t === 'stn') body = `<p>Sewa RM25 / 50 / 100 / 200 ikut berapa stesen tuan dia ada.</p>`;
  else if (t.t === 'util') body = `<p>Sewa = dadu × 4 (atau × 10 kalau ada dua-dua syarikat).</p>`;
  else body = `<p>${tileDesc(t)}</p>`;
  return `<div class="prop-head" style="background:${col}"><div class="big-ic">${tileIcon(i)}</div><h2 style="color:#fff">${t.name}</h2>${t.price ? rm(t.price) : ''}</div>${body}${o !== null ? `<p>Tuan: <b>${pname(G.players[o])}</b></p>` : ''}`;
}
function tileDesc(t) {
  return { go: 'Lalu sini dapat RM200!', rezeki: 'Ambil kad Rezeki — selalunya best!', musibah: 'Ambil kad Musibah — alamak...', tax: `Bayar ${rm(t.amt)}.`, jail: 'Rumah Tok Wan. Kalau singgah je, takpe. Kalau tertidur, rehat 1 giliran.', gojail: 'Mengantuk! Terus pergi tidur kat Rumah Tok Wan.', kenduri: 'Kenduri kahwin! Semua orang bagi salam berisi RM20 kat kau.' }[t.t] || '';
}
const pname = p => p.ai !== null ? CHARS[p.ci].name : esc(p.name || CHARS[p.ci].name);
function showTileInfo(i) { if (!G) return; modal(propHtml(i), []); }

/* ---------- Money ---------- */
async function pay(k, amt, to) {
  const p = G.players[k], before = p.money;
  p.money -= amt; floatText(k, '-' + amt, '#e64980'); sfx.pay();
  let raised = 0;
  if (p.money < 0) raised = await raiseCash(k, amt);
  // if they went bankrupt, the receiver only gets what they really had
  const paid = p.out ? Math.max(0, before + raised) : amt;
  if (to !== undefined && to !== null && paid > 0) { G.players[to].money += paid; floatText(to, '+' + paid, '#2f9f73'); }
  renderAll();
}
function gain(k, amt) { G.players[k].money += amt; floatText(k, '+' + amt, '#2f9f73'); sfx.coin(); renderAll(); }
async function raiseCash(k, owed) {
  const p = G.players[k], sold = [];
  let raised = 0;
  const mine = () => TILES.map((t, i) => i).filter(i => G.own[i] === k);
  while (p.money < 0 && mine().length) {
    const need = -p.money, list = mine();
    // 1) sell a building level first (cheapest upgrade), 2) else the cheapest land that covers the debt, 3) else the cheapest land
    const ups = list.filter(i => G.lvl[i] > 0).sort((a, b) => UPC[TILES[a].set] - UPC[TILES[b].set]);
    const lands = list.filter(i => G.lvl[i] === 0).sort((a, b) => TILES[a].price - TILES[b].price);
    let i, v;
    if (ups.length) { i = ups.find(x => (UPC[TILES[x].set] / 2 | 0) >= need) ?? ups[ups.length - 1]; v = UPC[TILES[i].set] / 2 | 0; G.lvl[i]--; sold.push(`${LVL_IC[G.lvl[i] + 1]} ${LVL[G.lvl[i] + 1]} ${TILES[i].name} (+${rm(v)})`); }
    else { i = lands.find(x => (TILES[x].price / 2 | 0) >= need) ?? lands[lands.length - 1]; v = TILES[i].price / 2 | 0; G.own[i] = null; sold.push(`${TILES[i].ic} ${TILES[i].name} (+${rm(v)})`); }
    p.money += v; raised += v;
  }
  renderAll();
  if (sold.length) {
    log(`🏦 ${pname(p)} tak cukup duit, bank beli: ${sold.join(', ')}`);
    notify('kiah', `Alamak, ${pname(p)} tak cukup duit! Terpaksa jual ${sold.length > 1 ? sold.length + ' harta' : 'harta'} kat bank.`, false);
    await modal(`<div class="big-ic">🏦</div><h2>Duit tak cukup!</h2><p>${pname(p)} kena bayar <b>${rm(owed)}</b> tapi duit tak cukup. Bank beli harta ni separuh harga:</p><div class="sold-list">${sold.map(x => `<div>${x}</div>`).join('')}</div><p>Baki duit sekarang: <b>${rm(Math.max(0, p.money))}</b></p>`, [{ label: 'OK' }], p.ai !== null ? 10000 : 0);
  }
  if (p.money < 0) {
    p.out = true; p.money = 0; log(`💸 ${pname(p)} dah bankrap!`);
    notify('ann', `Berita sedih. ${pname(p)} dah bankrap!`, true);
    await modal(`<div class="big-ic">😭</div><h2>${pname(p)} Bankrap!</h2><p>Duit habis... takpe, lain kali cuba lagi!</p>`, [{ label: 'OK' }], p.ai !== null ? 10000 : 0);
  }
  return raised;
}

/* ---------- Turn flow ---------- */
const isHumanTurn = () => cur().ai === null;
function setRoll(on) { $('rollBtn').disabled = !on; $('rollBtn').style.visibility = on ? 'visible' : 'hidden'; }
async function nextTurn(first) {
  if (G.over) return;
  if (!first) {
    let n = G.turn;
    do { n = (n + 1) % G.players.length; if (n === 0) { G.round++; (!G.maxRounds || G.round <= G.maxRounds) && setTimeout(folkChatter, 400); } } while (G.players[n].out);
    G.turn = n;
  }
  if ((G.maxRounds && G.round > G.maxRounds) || alive().length < 2) return endGame();
  renderAll(); save();
  const p = cur();
  if (p.sleep > 0) {
    p.sleep--; log(`💤 ${pname(p)} masih tidur kat Rumah Tok Wan...`);
    await wait(1100); return nextTurn();
  }
  if (isHumanTurn()) { setRoll(true); busy = false; }
  else { setRoll(false); busy = true; await wait(650); await doRoll(0); }
}
$('rollBtn').onclick = () => { if (busy || !isHumanTurn()) return; busy = true; setRoll(false); doRoll(0); };

async function doRoll(dbl) {
  const p = cur(), k = G.turn, dies = [...$('dice').children];
  const a = 1 + (Math.random() * 6 | 0), b = 1 + (Math.random() * 6 | 0);
  dies.forEach(d => d.classList.add('spin'));
  for (let i = 0; i < 10; i++) { dies.forEach(d => setDie(d, 1 + (Math.random() * 6 | 0))); beep(380 + i * 45, .03); await new Promise(r => setTimeout(r, 90)); }
  dies.forEach((d, i) => setDie(d, [a, b][i]));
  dies.forEach(d => { d.classList.remove('spin'); d.classList.remove('land'); void d.offsetWidth; d.classList.add('land'); });
  G.dice = [a, b]; renderAll();
  log(`${pname(p)} dapat ${a} + ${b} = ${a + b}${a === b ? ' — DOUBLE! 🎉' : ''}`);
  await wait(300); cam(p.pos); await wait(450);
  await moveSteps(k, a + b);
  await landOn(k, a + b);
  if (G.over) return;
  if (!p.out && a === b && dbl < 2 && !p.sleep) {
    log(`${pname(p)} dapat baling lagi!`); renderAll(); save();
    if (isHumanTurn()) { busy = false; setRoll(true); return; }
    await wait(600); return doRoll(dbl + 1);
  }
  await wait(isHumanTurn() ? 200 : 500);
  nextTurn();
}
async function moveSteps(k, n) {
  const p = G.players[k], dir = n < 0 ? -1 : 1;
  for (let s = 0; s < Math.abs(n); s++) {
    p.pos = (p.pos + dir + 40) % 40;
    if (p.pos === 0 && dir > 0) { gain(k, 200); log(`🏁 ${pname(p)} lalu MULA, dapat RM200!`); notify('ann', `${pname(p)} lalu MULA dan dapat RM200!`, false); }
    const tok = $('tok' + k); tok.classList.remove('hop'); void tok.offsetWidth; tok.classList.add('hop');
    G.players.forEach((q, j) => placeToken(j, q.pos)); cam(p.pos); sfx.step();
    await wait(230);
  }
  const t = $('tile' + p.pos); t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
  await wait(450); cam(null); await wait(350);
}
async function goTo(k, pos) {
  const p = G.players[k], steps = (pos - p.pos + 40) % 40;
  await moveSteps(k, steps);
}
async function sendSleep(k) {
  const p = G.players[k];
  p.pos = 10; p.sleep = 1; renderAll();
  log(`😴 ${pname(p)} tertidur kat Rumah Tok Wan (rehat 1 giliran)`);
  notify('polis', `Shhh... ${pname(p)} tengah tidur kat Rumah Tok Wan. Jangan bising!`, true);
}

async function landOn(k, sum) {
  const p = G.players[k], t = TILES[p.pos], i = p.pos, ai = p.ai !== null ? AIS[p.ai] : null;
  const auto = ai ? 10000 : 0;
  const say = t => `<div class="ai-say">${avatar(p.ci)}<span>${t}</span></div>`;
  if (t.t === 'prop' || t.t === 'stn' || t.t === 'util') {
    const o = G.own[i];
    if (o === null) {
      const can = p.money >= t.price;
      let want;
      if (ai) want = can && aiWantsBuy(k, i);
      else want = await modal(propHtml(i) + `<p>Duit kau: <b>${rm(p.money)}</b></p>`, [{ label: `🛒 BELI ${rm(t.price)}`, v: true, cls: 'mint', dis: !can }, { label: 'Tak nak', v: false, cls: 'grey' }]);
      if (want) {
        p.money -= t.price; G.own[i] = k; sfx.buy(); floatText(k, '-' + t.price, '#e64980');
        log(`🛒 ${pname(p)} beli ${t.name}!`);
        notify(pick(['kiah', 'mira', 'ann']), pick([`${pname(p)} dah beli ${t.name}! Tahniah!`, `Wah, ${t.name} ada tuan baru: ${pname(p)}!`]), true);
        if (ai) await modal(say(`${pname(p)}: "Yeay! Aku beli ${t.name}!"`) + propHtml(i), [{ label: 'OK' }], auto);
      } else { log(`${pname(p)} tak beli ${t.name}`); if (ai) await modal(say(`${pname(p)}: "Hmm... mahal la, tak nak."`) + propHtml(i), [{ label: 'OK' }], 10000); }
    } else if (o === k) {
      if (t.t === 'prop' && G.lvl[i] < 2) {
        const cost = UPC[t.set], can = p.money >= cost, nx = G.lvl[i] + 1;
        let up;
        if (ai) up = can && p.money - cost >= ai.upReserve;
        else up = await modal(propHtml(i) + `<p>Ni tempat kau! Nak naik taraf jadi <b>${LVL_IC[nx]} ${LVL[nx]}</b>?</p>`, [{ label: `🔨 UPGRADE ${rm(cost)}`, v: true, cls: 'mint', dis: !can }, { label: 'Nanti dulu', v: false, cls: 'grey' }]);
        if (up) { p.money -= cost; G.lvl[i] = nx; sfx.buy(); log(`🔨 ${pname(p)} naik taraf ${t.name} jadi ${LVL[nx]}!`); renderAll(); notify('mira', `Cantiknya! ${t.name} dah jadi ${LVL[nx]} ${LVL_IC[nx]}`, true); if (ai) await modal(say(`${pname(p)}: "${t.name} aku dah jadi ${LVL[nx]}! ${LVL_IC[nx]}"`) + propHtml(i), [{ label: 'OK' }], auto); }
      } else log(`${pname(p)} rehat kat ${t.name} sendiri 😌`);
    } else {
      const r = rentOf(i, sum), owner = G.players[o];
      log(`🏠 ${pname(p)} bayar sewa ${rm(r)} kat ${pname(owner)}`);
      if (r >= 100) notify('abu', `Mahalnya sewa ${t.name}, ${rm(r)}! Tak puas hati betul!`, true); else notify('abu', pick([`Sewa ${t.name} ${rm(r)}. Bolehlah...`, `${pname(p)} bayar sewa kat ${pname(owner)}.`]), false);
      if (!ai) await modal(propHtml(i) + `<p>Alamak! Ni tempat <b>${pname(owner)}</b>. Kena bayar sewa:</p><h2>${rm(r)}</h2>`, [{ label: '💸 BAYAR', cls: 'pink' }]);
      else await modal(say(`${pname(p)}: "Alamak, kena bayar ${rm(r)} kat ${pname(owner)}!"`) + propHtml(i), [{ label: 'OK' }], 10000);
      await pay(k, r, o);
    }
  } else if (t.t === 'tax') {
    log(`${t.ic} ${pname(p)} bayar ${t.name} ${rm(t.amt)}`);
    if (!ai) await modal(`<div class="big-ic">${tileIcon(i)}</div><h2>${t.name}</h2><p>Kena bayar <b>${rm(t.amt)}</b>.</p>`, [{ label: 'Bayar' }]);
    await pay(k, t.amt);
  } else if (t.t === 'gojail') {
    await modal(`<div class="big-ic">😴</div><h2>Tertidur!</h2><p>${pname(p)} mengantuk sangat... terus pergi tidur kat Rumah Tok Wan.</p>`, [{ label: 'Zzz...' }], auto || 0);
    await sendSleep(k);
  } else if (t.t === 'kenduri') {
    let tot = 0;
    for (let j = 0; j < G.players.length; j++) if (j !== k && !G.players[j].out) { tot += 20; await pay(j, 20, k); }
    log(`💐 Kenduri ${pname(p)}! Dapat salam berisi ${rm(tot)}`); sfx.coin();
    notify('ann', `Semua dijemput ke kenduri kahwin ${pname(p)}!`, true);
    await modal(`<div class="big-ic">💐</div><h2>Kenduri Kahwin!</h2><p>Semua orang datang bagi salam berisi. ${pname(p)} dapat <b>${rm(tot)}</b>!</p>`, [{ label: 'Yeay!' }], auto || 0);
  } else if (t.t === 'rezeki' || t.t === 'musibah') {
    await drawCard(k, t.t);
  }
  renderAll(); save();
}
async function drawCard(k, type) {
  const p = G.players[k], deckKey = type === 'rezeki' ? 'rz' : 'ms', deck = type === 'rezeki' ? REZEKI : MUSIBAH;
  if (!G[deckKey].length) G[deckKey] = shuffle([...deck.keys()]);
  const c = deck[G[deckKey].shift()];
  let extra = '';
  if (c.money) extra = c.money > 0 ? `+${rm(c.money)}` : `-${rm(-c.money)}`;
  if (c.each) extra = c.each > 0 ? `Setiap kawan bagi ${rm(c.each)}` : `Bayar setiap kawan ${rm(-c.each)}`;
  await modal(`<p style="margin:0 0 8px"><b>${pname(p)}</b> ambil kad...</p><div class="flip"><div class="flip-in"><div class="face back ${type} ${ART['card_' + type + '_back'] ? 'art' : ''}"><span>${type === 'rezeki' ? '🍀' : '🌧️'}</span>${type === 'rezeki' ? 'REZEKI' : 'MUSIBAH'}</div><div class="face front ${type} ${ART['card_' + type + '_front'] ? 'art' : ''}"><div class="big-ic">${c.ic}</div><h2>${c.txt}</h2>${extra ? `<b>${extra}</b>` : ''}</div></div></div>`, [{ label: 'OK!', cls: type === 'rezeki' ? 'mint' : 'pink' }], p.ai !== null ? 10000 : 0);
  log(`${c.ic} ${pname(p)}: ${c.txt}`);
  if (c.money > 0) gain(k, c.money);
  else if (c.money < 0) await pay(k, -c.money);
  else if (c.each) {
    for (let j = 0; j < G.players.length; j++) if (j !== k && !G.players[j].out) {
      if (c.each > 0) await pay(j, c.each, k); else await pay(k, -c.each, j);
    }
  } else if (c.goto !== undefined) { await goTo(k, c.goto); }
  else if (c.nearest) {
    let n = p.pos; do { n = (n + 1) % 40; } while (TILES[n].t !== c.nearest);
    await goTo(k, n); await landOn(k, G.dice[0] + G.dice[1]);
  } else if (c.jail) await sendSleep(k);
  else if (c.repair) {
    const n = TILES.reduce((s, t, i) => s + (G.own[i] === k ? G.lvl[i] : 0), 0);
    if (n) await pay(k, n * c.repair); else log(`${pname(p)} takde kedai nak baiki. Fuh!`);
  } else if (c.back) { await moveSteps(k, -c.back); await landOn(k, G.dice[0] + G.dice[1]); }
}
function aiWantsBuy(k, i) {
  const p = G.players[k], ai = AIS[p.ai], t = TILES[i], left = p.money - t.price;
  if (ai.smart && t.set) {
    const mineInSet = TILES.filter((x, j) => x.set === t.set && G.own[j] === k).length;
    const othersInSet = TILES.filter((x, j) => x.set === t.set && G.own[j] !== null && G.own[j] !== k).length;
    if (mineInSet > 0 && left >= 30) return true;
    if (othersInSet > 0 && left < 400) return false;
  }
  return left >= ai.reserve;
}

/* ---------- End ---------- */
function worth(k) {
  return G.players[k].money + TILES.reduce((s, t, i) => s + (G.own[i] === k ? (t.price || 0) + G.lvl[i] * (UPC[t.set] || 0) : 0), 0);
}
async function endGame() {
  cam(null);
  G.over = true; save(); busy = true; setRoll(false);
  const rank = G.players.map((p, k) => ({ p, k, w: p.out ? -1 : worth(k) })).sort((a, b) => b.w - a.w);
  const win = rank[0].p;
  sfx.win(); confetti(); notify('ann', `Tahniah ${pname(win)}! Jutawan Comel bandar kita!`, true);
  await modal(`<div class="big-ic">🏆</div><h2>${pname(win)} ${win.ai === null && G.players.filter(x => x.ai === null).length === 1 ? 'menang! Hebat!' : 'jadi Jutawan Comel!'}</h2>
    <p>Kekayaan = duit + nilai tanah & bangunan</p>
    <ol class="rank">${rank.map((r, n) => `<li>${['🥇', '🥈', '🥉', '4️⃣'][n]} ${avatar(r.p.ci)} ${pname(r.p)}<span>${r.w < 0 ? 'Bankrap' : rm(r.w)}</span></li>`).join('')}</ol>`,
    [{ label: '🔁 MAIN LAGI', v: 'again' }, { label: 'Menu', v: 'menu', cls: 'grey' }]).then(v => {
      if (v === 'again') { newGame(); startPlay(); }
      else { $('play').classList.add('hidden'); $('menu').classList.remove('hidden'); document.body.classList.remove('playing'); G = null; renderMenu(); }
    });
}
function confetti() {
  const box = $('confetti'), cols = ['#ff7fa8', '#ffd43b', '#5cc9a7', '#7fd0f0', '#b197fc'];
  for (let i = 0; i < 80; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % 5];
    c.style.animationDuration = (1.8 + Math.random() * 2) + 's'; c.style.animationDelay = Math.random() * .8 + 's';
    box.appendChild(c); setTimeout(() => c.remove(), 5000);
  }
}

window.addEventListener('resize', () => G && renderAll());
renderMenu();
})();
