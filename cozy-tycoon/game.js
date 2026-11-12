/* Cozy Tycoon — Saidina/Monopoly-style board game, chibi style. MyCozyWorld */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const SAVE = 'cozyTycoonSave_v1';

/* ---------- Chibi characters (SVG fallback; swap with sprites/token_<id>.webp) ---------- */
const CHARS = [
  { id: 'kucing', h: 'aina', name: 'Aina', color: '#ff9f43', body: '#ffb86b', ear: 'cat' },
  { id: 'arnab', h: 'meimei', name: 'Mei Mei', color: '#ff7fa8', body: '#fff4f8', ear: 'bunny' },
  { id: 'panda', h: 'adam', name: 'Adam', color: '#6c7ae0', body: '#ffffff', ear: 'panda' },
  { id: 'ayam', h: 'ravi', name: 'Ravi', color: '#f2b705', body: '#ffe066', ear: 'chick' },
  { id: 'sofea', h: 'sofea', name: 'Sofea', color: '#9b6bd6', body: '#f1e4ff', ear: 'none' },
  { id: 'jason', h: 'jason', name: 'Jason', color: '#3fb27f', body: '#dcf5e8', ear: 'none' },
  { id: 'priya', h: 'priya', name: 'Priya', color: '#17a2b8', body: '#d6f3f7', ear: 'none' },
  { id: 'ryan', h: 'ryan', name: 'Ryan', color: '#e8504f', body: '#ffe0df', ear: 'none' },
];
const SPRITES = {};
function chibi(c) {
  const b = c.body, d = c.id === 'panda' ? '#3b3b4f' : (c.id === 'arnab' ? '#ffc2d6' : '#e8893a');
  let ears = '';
  if (c.ear === 'cat') ears = `<path d="M22 30 L28 8 L42 24Z" fill="${b}" stroke="#d9772b" stroke-width="2"/><path d="M78 30 L72 8 L58 24Z" fill="${b}" stroke="#d9772b" stroke-width="2"/><path d="M27 24 L29 14 L36 22Z" fill="#ffc7c7"/><path d="M73 24 L71 14 L64 22Z" fill="#ffc7c7"/>`;
  if (c.ear === 'bunny') ears = `<ellipse cx="36" cy="14" rx="8" ry="20" fill="${b}" stroke="#f2b3c9" stroke-width="2"/><ellipse cx="64" cy="14" rx="8" ry="20" fill="${b}" stroke="#f2b3c9" stroke-width="2"/><ellipse cx="36" cy="15" rx="4" ry="14" fill="#ffc2d6"/><ellipse cx="64" cy="15" rx="4" ry="14" fill="#ffc2d6"/>`;
  if (c.ear === 'panda') ears = `<circle cx="26" cy="24" r="11" fill="#3b3b4f"/><circle cx="74" cy="24" r="11" fill="#3b3b4f"/>`;
  if (c.ear === 'none') ears = `<path d="M18 46 Q20 14 50 14 Q80 14 82 46 Q70 26 50 26 Q30 26 18 46Z" fill="#5a3a2a"/>`;
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
// board token: glossy chess pawn in the player's colour
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; const m = v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))); return `rgb(${m(r)},${m(g)},${m(b)})`; }
function pawn(ci) {
  const c = CHARS[ci].color, id = 'pw' + ci;
  return `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${shade(c, .55)}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -.35)}"/></radialGradient></defs>
  <ellipse cx="50" cy="112" rx="34" ry="7" fill="#0003"/>
  <path d="M18 104 Q18 92 30 90 L70 90 Q82 92 82 104 Q82 110 50 110 Q18 110 18 104Z" fill="url(#${id})" stroke="${shade(c, -.45)}" stroke-width="2.5"/>
  <path d="M33 90 Q40 72 40 58 L60 58 Q60 72 67 90Z" fill="url(#${id})" stroke="${shade(c, -.45)}" stroke-width="2.5"/>
  <ellipse cx="50" cy="58" rx="20" ry="6" fill="url(#${id})" stroke="${shade(c, -.45)}" stroke-width="2.5"/>
  <circle cx="50" cy="34" r="20" fill="url(#${id})" stroke="${shade(c, -.45)}" stroke-width="2.5"/>
  <ellipse cx="43" cy="26" rx="7" ry="5" fill="#fff" opacity=".65"/>
  <path d="M26 100 Q50 106 74 100" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/>
</svg>`;
}
function avatar(ci) { const c = CHARS[ci]; return SPRITES[c.id] ? `<img src="${SPRITES[c.id]}" alt="">` : chibi(c); }
fetch('sprites/list.json').then(r => r.ok ? r.json() : []).then(l => {
  // human chibi kids (token_aina...) if available, else old animal tokens
  CHARS.forEach(c => { const n = l.indexOf('token_' + c.h) >= 0 ? 'token_' + c.h : (l.indexOf('token_' + c.id) >= 0 ? 'token_' + c.id : null); if (n) SPRITES[c.id] = 'sprites/' + n + '.webp'; });
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

/* ---------- Fakta tempat (untuk budak belajar) ---------- */
const FACTS = {
  cendol: 'Warna hijau cendol datang dari daun pandan.',
  roticanai: 'Roti canai ditebar nipis-nipis, lepas tu dimakan dengan kuah kari.',
  pasarmalam: 'Pasar malam buka waktu petang sampai malam. Banyak makanan sedap!',
  mamak: 'Teh tarik dituang dari satu gelas ke gelas lain supaya berbuih.',
  runcit: 'Kedai runcit jual barang harian macam roti, telur dan gula.',
  melaka: 'Bandar Melaka ialah Tapak Warisan Dunia UNESCO.',
  ipoh: 'Ipoh terkenal dengan ayam tauge dan bukit batu kapur.',
  kuantan: 'Kuantan ialah ibu negeri Pahang, negeri paling besar di Semenanjung.',
  kotabharu: 'Kota Bharu ialah ibu negeri Kelantan, negeri wau bulan.',
  kterengganu: 'Keropok lekor Terengganu dibuat daripada ikan.',
  alorsetar: 'Kedah digelar Jelapang Padi sebab banyak sawah padi.',
  cameron: 'Cameron Highlands sejuk, ada ladang teh dan strawberi.',
  genting: 'Genting Highlands terletak tinggi atas bukit, jadi cuaca dia sejuk.',
  langkawi: 'Langkawi ada lebih kurang 99 pulau!',
  kuching: 'Kuching ialah ibu negeri Sarawak, digelar Bandaraya Kucing.',
  kk: 'Gunung Kinabalu di Sabah ialah gunung paling tinggi di Malaysia.',
  sandakan: 'Dekat Sandakan ada Sepilok, tempat jaga anak orang utan.',
  putrajaya: 'Putrajaya ialah pusat pentadbiran kerajaan. Kubah Masjid Putra warna pink!',
  jb: 'Johor Bahru disambung ke Singapura melalui Tambak Johor.',
  penang: 'Pulau Pinang digelar Mutiara Timur dan terkenal dengan makanan sedap.',
  menarakl: 'Menara KL tingginya 421 meter!',
  klcc: 'Menara Berkembar Petronas ada 88 tingkat!',
  lrt: 'LRT bergerak atas landasan tinggi, jadi tak kena jalan sesak.',
  ktm: 'KTM maksudnya Keretapi Tanah Melayu.',
  ets: 'ETS ialah tren elektrik laju yang bawa orang ke bandar jauh.',
  feri: 'Feri bawa orang menyeberang laut ke pulau.',
  air: 'Jimat air! Tutup paip masa gosok gigi.',
  elektrik: 'Jimat elektrik! Tutup lampu bila keluar bilik.',
};

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
  { txt: 'Pasar Malam! Pilih satu kuih', pasar: true, ic: '🏮' },
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
// put notifications over the centre of the board (map area), not over money or buttons
function placeToasts() {
  const box = $('toasts'), bw = $('boardWrap');
  if (!box || !bw || $('play').classList.contains('hidden')) { box && box.removeAttribute('style'); return; }
  const r = bw.getBoundingClientRect(), w = r.width * 0.74;
  box.style.cssText = `top:${r.top + r.height * 0.5}px;bottom:auto;left:${r.left + (r.width - w) / 2}px;right:auto;width:${w}px;transform:translateY(-50%);padding:0`;
}
window.addEventListener('resize', placeToasts);
window.addEventListener('scroll', placeToasts, { passive: true });
const NQ = [];
function flushNotify() { while (NQ.length && $('modal').classList.contains('hidden') && !document.querySelector('.mg')) { const n = NQ.shift(); notify(n[0], n[1], n[2]); } }
setInterval(flushNotify, 400);
function notify(who, msg, voice) {
  // don't cover popups: wait until they close
  if (!$('modal').classList.contains('hidden') || document.querySelector('.mg')) { NQ.push([who, msg, voice]); if (NQ.length > 3) NQ.shift(); return; }
  const box = $('toasts'); if (!box) return;
  let F, face;
  if (/^p\d$/.test(who) && G && G.players[+who[1]]) {
    const pl = G.players[+who[1]]; F = { n: pname(pl), c: CHARS[pl.ci].color }; face = avatar(pl.ci);
  } else { F = FOLK[who] || FOLK.kiah; face = F.img ? `<img src="${F.img}" alt="">` : F.f; }
  const t = document.createElement('div');
  t.className = 'toast' + (who === 'ann' ? ' ann' : '') + (who[0] === 'p' ? ' player' : ''); t.style.setProperty('--c', F.c);
  t.innerHTML = `<div class="face">${face}</div><div><b>${F.n}</b><span>${msg}</span></div>`;
  placeToasts();
  box.prepend(t);
  while (box.children.length > 2) box.lastChild.remove();
  setTimeout(() => { t.classList.add('bye'); setTimeout(() => t.remove(), 400); }, 6500);
  if (voice) { chime(); setTimeout(() => speak((who === 'ann' ? 'Pengumuman! ' : '') + msg), 650); }
  else beep(1046, .06, 'sine', .05);
}
const pick = a => a[Math.random() * a.length | 0];
function festStart() {
  notify('ann', 'Musim Perayaan dah bermula! Mulai sekarang sewa naik setiap pusingan!', true);
  modal(`<div class="big-ic">🎉</div><h2>Musim Perayaan!</h2><p>Bandar makin meriah dan ramai pelancong! Mulai pusingan ni, <b>sewa naik 10% setiap pusingan</b> (paling tinggi ×4).</p><p>Siapa paling banyak tanah, dia untung besar!</p>`, [{ label: 'Jom!' }], 10000);
}
function festMore() { say2('fest', { x: festMult().toFixed(1) }); }
/* ---------- Ayat penduduk (rawak, ikut situasi) ---------- */
const fill = (t, v) => t.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
const LINES = {
  buy: [
    ['kiah', 'Wah, {p} dah jadi tuan {t}! Tahniah, nak!', true],
    ['kiah', '{t} ada tuan baru: {p}. Nanti mak cik singgah ye!', false],
    ['mira', 'Yeay! {p} beli {t}! Boleh Mira main kat situ tak?', false],
    ['abu', '{p} beli {t}? Hmm... jangan naikkan sewa mahal-mahal sudah.', true],
    ['abu', 'Muda-muda dah beli {t}. Pak Abu dulu umur macam tu jual surat khabar je!', false],
    ['ann', '{p} kini pemilik {t}. Tahniah!', true],
    ['polis', 'Tahniah {p}. Jaga {t} elok-elok, jangan bagi orang parking merata.', false],
  ],
  buyBig: [
    ['ann', 'Berita besar! {p} beli {t} dengan harga {m}!', true],
    ['kiah', 'Ya Allah, {t}! Kayanya {p} ni!', true],
    ['abu', '{m} untuk {t}?! Dulu harga tanah murah je...', false],
  ],
  upgrade: [
    ['mira', 'Cantiknya! {t} dah jadi {l}!', true],
    ['kiah', 'Wah, {t} makin cantik sekarang. {p} pandai berniaga!', false],
    ['abu', '{t} dah jadi {l}. Mesti sewa naik lepas ni... hmm.', true],
    ['polis', 'Pembinaan {l} kat {t} dah siap. Selamat berniaga, {p}!', false],
  ],
  bangunan: [
    ['ann', '{t} kini ada bangunan tinggi milik {p}! Hebat!', true],
    ['mira', 'Tingginya bangunan {p} kat {t}! Boleh nampak sampai rumah Mira!', true],
    ['abu', 'Bangunan tinggi lagi kat {t}. Langit pun dah tak nampak!', false],
  ],
  rentHigh: [
    ['abu', 'Mahalnya sewa {t}, {m}! Tak puas hati betul!', true],
    ['abu', '{m} sewa {t}? Ini rompakan siang hari ni!', true],
    ['kiah', 'Kesian {p}, kena bayar {m} kat {o}. Sabar ye nak.', false],
    ['mira', 'Alamak {p}, {m}! Banyaknya duit!', false],
  ],
  rentLow: [
    ['abu', 'Sewa {t} {m}. Bolehlah, tak mahal sangat.', false],
    ['kiah', '{p} bayar {m} kat {o}. Murah je tu!', false],
    ['mira', '{p} singgah {t} dan bayar {m}. Ok la tu!', false],
  ],
  go: [
    ['ann', '{p} lalu MULA dan dapat RM200!', false],
    ['kiah', '{p} dapat gaji RM200! Jangan boros ye!', false],
    ['mira', '{p} dapat RM200! Belanja Mira aiskrim boleh?', false],
  ],
  sleep: [
    ['polis', 'Shhh... {p} tengah tidur kat Rumah Tok Wan. Jangan bising!', true],
    ['kiah', '{p} penat sangat agaknya. Tidur je kat rumah Tok Wan.', false],
    ['mira', 'Hihi, {p} tertidur! Tok Wan bagi selimut tak?', false],
  ],
  kenduri: [
    ['ann', 'Semua dijemput ke kenduri kahwin {p}!', true],
    ['kiah', 'Jom ke kenduri {p}! Nasi minyak dia sedap!', true],
    ['abu', 'Kenduri {p} meriah betul. Pak Abu nak tambah nasi!', false],
  ],
  minigame: [
    ['mira', 'Hebatnya {p}! Tangkap syiling laju gila!', false],
    ['kiah', 'Pandai {p}! Sewa dapat separuh harga!', false],
  ],
  sell: [
    ['kiah', 'Alamak, {p} tak cukup duit! Terpaksa jual harta kat bank.', false],
    ['abu', 'Itulah, belanja tak ingat dunia. Kan dah kena jual harta, {p}!', false],
  ],
  bankrupt: [
    ['ann', 'Berita sedih. {p} dah bankrap!', true],
    ['kiah', 'Kesian {p}... takpe nak, lain kali cuba lagi ye.', true],
  ],
  trade: [
    ['kiah', 'Wah, {p} dah beli {t} dari {o}!', true],
    ['abu', '{o} jual {t} kat {p}? Hmm, harap-harap untung la.', false],
    ['ann', 'Urusan jual beli selesai: {t} kini milik {p}!', true],
  ],
  win: [
    ['ann', 'Tahniah {p}! Jutawan Comel bandar kita!', true],
  ],
  fest: [
    ['abu', 'Sewa dah naik ×{x}! Mahal sangat, nak beli kuih pun tak lepas!', true],
    ['kiah', 'Musim perayaan, semua benda naik harga... sewa dah ×{x}.', true],
    ['ann', 'Perhatian: sewa kini ×{x}. Selamat berbelanja!', true],
  ],
  // berbual biasa (kena dengan tempat dalam board)
  chatter: [
    ['polis', 'Jalan sesak kat KLCC hari ni. Naik LRT lagi senang!', true],
    ['polis', 'Ingat! Jangan parking merata-rata. Nanti kena saman!', false],
    ['polis', 'Pakai tali pinggang keledar bila naik kereta ye adik-adik.', false],
    ['mira', 'Cendol kat Gerai Cendol sedap gila! Nak lagi!', false],
    ['mira', 'Esok cuti sekolah! Jom pergi Langkawi!', false],
    ['mira', 'Mira dah siap kerja sekolah. Boleh main dah!', false],
    ['kiah', 'Kedai Mamak penuh malam ni, semua tengok bola.', false],
    ['kiah', 'Strawberi Cameron tengah musim. Manis-manis belaka!', false],
    ['kiah', 'Harga barang naik lagi... mak cik pening kepala.', false],
    ['abu', 'Hujan lebat kat Kuantan. Bawa payung kalau nak keluar.', false],
    ['abu', 'Zaman Pak Abu dulu, roti canai sekeping 20 sen je!', false],
    ['abu', 'Bising betul bunyi pembinaan kat bandar ni. Hmm...', false],
    ['ann', 'Pasar malam dibuka malam ini. Jemput datang semua!', true],
    ['ann', 'Peringatan: jimat air dan elektrik untuk bumi kita!', false],
  ],
};
let lastLine = '';
// pemain sendiri bercakap (orang pertama)
const PL = {
  buy: ['Yeay! {t} jadi milik aku!', 'Akhirnya dapat jugak {t}!', '{t} ni aku punya sekarang. Jangan lupa bayar sewa ye!', 'Beli! Nanti aku jaga {t} elok-elok.', 'Wah, best gila dapat {t}!'],
  buyBig: ['{m} untuk {t}! Mahal, tapi berbaloi!', 'Aku dah jadi tuan {t}! Kaya kaya!', 'Habis duit simpanan... tapi {t} aku punya!'],
  upgrade: ['{t} aku dah jadi {l}!', 'Siap! {l} baru kat {t}!', 'Upgrade {t}! Mesti ramai pelanggan lepas ni!'],
  bangunan: ['Tengok bangunan tinggi aku kat {t}!', '{t} dah ada bangunan! Aku memang tauke besar!', 'Bangunan siap! Sewa {t} mahal sekarang, hehe.'],
  rentHigh: ['Alamak, {m} kat {o}?! Mahalnya!', 'Habis duit aku... {m}!', 'Kenapa aku singgah {t} ni... {m}!', '{o}, kurangkan sikit boleh tak? {m} mahal la!'],
  rentLow: ['Ok la, {m} je. Nah {o}!', 'Bayar {m} kat {o}. Tak apa, murah je.', 'Sewa {t} {m}. Boleh tahan.'],
  go: ['Yeay! Dapat RM200!', 'Gaji masuk! RM200!', 'Lalu MULA, duit tambah RM200!'],
  sleep: ['Mengantuknya... aku tidur kat rumah Tok Wan kejap.', 'Zzz... kejut aku nanti ye.', 'Tok Wan, nak tumpang tidur!'],
  kenduri: ['Terima kasih datang kenduri aku semua!', 'Jemput makan nasi minyak! Jangan malu-malu!', 'Kenduri aku! Terima kasih salam berisi!'],
  minigame: ['Yes! Aku tangkap semua syiling!', 'Laju tak aku? Sewa separuh!'],
  sell: ['Alamak, duit tak cukup... terpaksa jual harta.', 'Sedihnya kena jual tanah aku...'],
  bankrupt: ['Duit aku dah habis... aku bankrap.', 'Takpe, lain kali aku menang!'],
  trade: ['Deal! {t} dah jadi milik aku!', 'Terima kasih {o}! Aku jaga {t} baik-baik.'],
  win: ['Yeay! Aku menang! Aku jutawan!', 'Terima kasih semua! Aku jadi Jutawan Comel!'],
};
const PL_CHANCE = { buy: .75, buyBig: .6, upgrade: .7, bangunan: .6, rentHigh: .6, rentLow: .7, go: .8, sleep: .7, kenduri: .5, minigame: .8, sell: .6, bankrupt: .5, trade: .6, win: .7 };
const AI_SAY = {
  buy: ['Yeay! Aku beli {t}!', '{t} ni cantik, aku ambil!', 'Lama dah aku berkenan dengan {t}!', 'Beli! Nanti kawan-kawan kena bayar sewa, hehe.', 'Ok, {t} jadi milik aku sekarang!'],
  skip: ['Hmm... mahal la, tak nak.', 'Simpan duit dulu la.', 'Tak berkenan sangat dengan {t}.', 'Nanti-nantilah aku fikir.', 'Duit aku nak guna benda lain.'],
  up: ['{t} aku dah jadi {l}!', 'Siap! {t} sekarang {l}!', 'Upgrade {t}! Mesti ramai pelanggan!', 'Tengok {l} baru aku kat {t}!'],
  pay: ['Alamak, kena bayar {m} kat {o}!', 'Ok la, {m} je. Nah {o}!', 'Hmm, terpaksa bayar {m}...', 'Takpe, {m} tak banyak.'],
  payBig: ['Alamak! {m}?! Mahalnya!', 'Habislah duit aku... {m}!', '{o}, kurangkan sikit boleh tak? {m} mahal la!', 'Aduh, {m}! Kenapa aku singgah {t} ni...'],
};
function say2(kind, v) {
  v = v || {};
  if (v.k !== undefined && PL[kind] && Math.random() < (PL_CHANCE[kind] || .6)) {
    let txt, n = 0; do { txt = fill(pick(PL[kind]), v); n++; } while (txt === lastLine && n < 5);
    lastLine = txt; notify('p' + v.k, txt, false); return;
  }
  const pool = LINES[kind]; if (!pool) return;
  let l, n = 0; do { l = pick(pool); n++; } while (fill(l[1], v || {}) === lastLine && n < 5);
  const txt = fill(l[1], v || {}); lastLine = txt; notify(l[0], txt, l[2]);
}
function folkChatter() {
  if (!G || Math.random() > .55) return;
  const ps = alive().map(p => ({ p, n: G.own.filter(o => o === G.players.indexOf(p)).length }));
  const rich = ps.slice().sort((a, b) => b.n - a.n)[0], poor = ps.slice().sort((a, b) => a.p.money - b.p.money)[0];
  const opts = [];
  if (rich && rich.n >= 4) opts.push(pick([['abu', `Tak puas hati betul! ${pname(rich.p)} dah borong ${rich.n} tempat. Tinggal apa untuk orang lain?`, true], ['kiah', `${pname(rich.p)} dah ada ${rich.n} tanah. Dah macam tauke besar!`, false]]));
  if (poor && poor.p.money < 300) opts.push(pick([['kiah', `Kesian ${pname(poor.p)}, tinggal ${rm(poor.p.money)} je. Jimat-jimat ye nak!`, false], ['mira', `${pname(poor.p)} tinggal ${rm(poor.p.money)}... Mira boleh pinjamkan duit tabung!`, false]]));
  const lead = alive().slice().sort((a, b) => worth(G.players.indexOf(b)) - worth(G.players.indexOf(a)))[0];
  if (lead && G.round > 5 && Math.random() < .4) opts.push(['ann', `Setakat ini, ${pname(lead)} paling kaya di bandar kita!`, true]);
  const blds = G.lvl.filter(x => x === 2).length;
  if (blds >= 3) opts.push(['abu', `Dah ada ${blds} bangunan tinggi. Bandar kita dah macam KL!`, false]);
  const c = pick(LINES.chatter); if (c[1] !== lastLine) opts.push(c);
  const o = pick(opts); lastLine = o[1]; notify(o[0], o[1], o[2]);
}

/* ---------- State ---------- */
let G = null, busy = false;
const cfg = { math: localStorage.getItem('cozyTycoonMathMode') === '1', char: Math.min(7, +(localStorage.getItem('cozyTycoonChar') || 0)), mode: 'ai', count: 4, rounds: 20, speed: +(localStorage.getItem('cozyTycoonSpeed') || 1.15) };
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
    const others = shuffle(CHARS.map((c, i) => i).filter(i => i !== cfg.char)).slice(0, 3);
    players.push({ name: getName(0, 'Kau'), ci: cfg.char, ai: null });
    others.forEach((ci, k) => players.push({ name: CHARS[ci].name, ci, ai: k }));
  } else {
    const order = localOrder();
    order.forEach((ci, k) => players.push({ name: getName(k, CHARS[ci].name), ci, ai: null }));
  }
  players.forEach(p => Object.assign(p, { money: 1500, pos: 0, out: false, sleep: 0 }));
  G = {
    players, turn: 0, round: 1, maxRounds: cfg.rounds,
    own: TILES.map(() => null), lvl: TILES.map(() => 0),
    rz: shuffle([...REZEKI.keys()]), ms: shuffle([...MUSIBAH.keys()]),
    log: ['Selamat datang ke Cozy Tycoon! 🎉'], dice: [1, 1], over: false, math: cfg.math,
  };
}
function save() { try { if (G && !G.over) localStorage.setItem(SAVE, JSON.stringify(G)); else localStorage.removeItem(SAVE); } catch (e) {} }
function load() { try { return JSON.parse(localStorage.getItem(SAVE)); } catch (e) { return null; } }

/* ---------- Menu ---------- */
let NAMES = []; try { NAMES = JSON.parse(localStorage.getItem('cozyTycoonNames')) || []; } catch (e) {}
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function getName(k, def) { const v = (NAMES[k] || '').trim(); return v ? v.slice(0, 12) : def; }
// Main Bersama: each player picks a character (tap the face to change)
let LC = []; try { LC = JSON.parse(localStorage.getItem('cozyTycoonLocalChars')) || []; } catch (e) {}
function localOrder() {
  const out = [cfg.char];
  for (let k = 1; k < cfg.count; k++) {
    let c = LC[k];
    if (c === undefined || c >= CHARS.length || out.includes(c)) c = CHARS.map((x, i) => i).find(i => !out.includes(i));
    out.push(c);
  }
  LC = out.slice(); try { localStorage.setItem('cozyTycoonLocalChars', JSON.stringify(LC)); } catch (e) {}
  return out;
}
function cycleChar(k) {
  const order = localOrder(); let c = order[k];
  do { c = (c + 1) % CHARS.length; } while (order.includes(c) && c !== order[k]);
  if (k === 0) { cfg.char = c; localStorage.setItem('cozyTycoonChar', c); } else { LC[k] = c; }
  beep(700); renderMenu();
}
function renderNames() {
  const box = $('nameInputs'); if (!box) return;
  const order = cfg.mode === 'ai' ? [cfg.char] : localOrder();
  box.innerHTML = order.map((ci, k) => `<label class="name-row"><button type="button" class="name-face" data-k="${k}" title="Tukar watak">${avatar(ci)}${cfg.mode === 'local' ? '<i>🔄</i>' : ''}</button><input data-k="${k}" maxlength="12" autocomplete="off" placeholder="${cfg.mode === 'ai' ? 'Nama kau' : 'Pemain ' + (k + 1) + ' (' + CHARS[ci].name + ')'}" value="${esc(NAMES[k] || '')}"></label>`).join('');
  box.querySelectorAll('.name-face').forEach(b => b.onclick = e => { e.preventDefault(); if (cfg.mode === 'local') cycleChar(+b.dataset.k); });
  box.querySelectorAll('input').forEach(inp => inp.oninput = () => { NAMES[+inp.dataset.k] = inp.value; try { localStorage.setItem('cozyTycoonNames', JSON.stringify(NAMES)); } catch (e) {} });
}
function renderMenu() {
  renderNames(); renderStickers();
  $('titleChars').innerHTML = CHARS.map((c, i) => avatar(i)).join('');
  $('charPick').innerHTML = CHARS.map((c, i) => `<button data-i="${i}" class="${i === cfg.char ? 'on' : ''}">${avatar(i)}${c.name}</button>`).join('');
  [...$('charPick').children].forEach(b => b.onclick = () => { cfg.char = +b.dataset.i; localStorage.setItem('cozyTycoonChar', cfg.char); beep(700); renderMenu(); });
  $('resumeBtn').classList.toggle('hidden', !load());
}
function seg(id, key, num, after) {
  [...$(id).children].forEach(b => b.onclick = () => {
    [...$(id).children].forEach(x => x.classList.toggle('on', x === b));
    cfg[key] = num ? +b.dataset.v : b.dataset.v; beep(650); after && after();
  });
}
seg('modeSeg', 'mode', false, () => { $('countRow').classList.toggle('hidden', cfg.mode !== 'local'); renderNames(); });
seg('countSeg', 'count', true, renderNames);
seg('mathSeg', 'math', false, () => { cfg.math = cfg.math === '1' || cfg.math === true; localStorage.setItem('cozyTycoonMathMode', cfg.math ? '1' : '0'); });
[...$('mathSeg').children].forEach(b => b.classList.toggle('on', (b.dataset.v === '1') === cfg.math)); seg('speedSeg', 'speed', true, () => localStorage.setItem('cozyTycoonSpeed', cfg.speed));
[...$('speedSeg').children].forEach(b => b.classList.toggle('on', +b.dataset.v === cfg.speed)); seg('roundSeg', 'rounds', true);
$('startBtn').onclick = () => { newGame(); startPlay(); };
$('resumeBtn').onclick = () => { G = load(); if (G) { G.players.forEach(p => { if (p.ai === null && /^Pemain \d/.test(p.name || '')) p.name = CHARS[p.ci].name; }); startPlay(); } };

function startPlay() {
  ensureState();
  $('menu').classList.add('hidden'); $('play').classList.remove('hidden'); document.body.classList.add('playing');
  buildBoard(); renderAll(); save(); nextTurn(true);
}

/* ---------- Render ---------- */
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
const DICE_IMG = {};
/* ---------- Real 3D dice roll on canvas (iPhone-safe, no CSS 3D) ---------- */
const D3 = (() => {
  const V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v => v.map(x => x * .5));
  // face: vertex idx, outward normal, number, local axes (u,v) for pips
  const F = [
    { i: [4, 5, 6, 7], n: [0, 0, 1], num: 1, u: [1, 0, 0], v: [0, 1, 0] },
    { i: [1, 0, 3, 2], n: [0, 0, -1], num: 6, u: [-1, 0, 0], v: [0, 1, 0] },
    { i: [5, 1, 2, 6], n: [1, 0, 0], num: 3, u: [0, 0, -1], v: [0, 1, 0] },
    { i: [0, 4, 7, 3], n: [-1, 0, 0], num: 4, u: [0, 0, 1], v: [0, 1, 0] },
    { i: [7, 6, 2, 3], n: [0, 1, 0], num: 2, u: [1, 0, 0], v: [0, 0, -1] },
    { i: [0, 1, 5, 4], n: [0, -1, 0], num: 5, u: [1, 0, 0], v: [0, 0, 1] },
  ];
  const PIP = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  const ap = (M, p) => [0, 1, 2].map(r => M[r][0] * p[0] + M[r][1] * p[1] + M[r][2] * p[2]);
  const Rx = t => [[1, 0, 0], [0, Math.cos(t), -Math.sin(t)], [0, Math.sin(t), Math.cos(t)]];
  const Ry = t => [[Math.cos(t), 0, Math.sin(t)], [0, 1, 0], [-Math.sin(t), 0, Math.cos(t)]];
  const Rz = t => [[Math.cos(t), -Math.sin(t), 0], [Math.sin(t), Math.cos(t), 0], [0, 0, 1]];
  const P = Math.PI / 2;
  const FACE_UP = { 1: Rx(-P), 6: Rx(P), 3: Rz(P), 4: Rz(-P), 2: Rx(0), 5: Rx(2 * P) };
  const L = (() => { const l = [-.45, .75, .55], m = Math.hypot(...l); return l.map(x => x / m); })();
  function draw(ctx, W, M, lift) {
    ctx.clearRect(0, 0, W, W);
    const cx = W / 2, cy = W * .6 - lift, sc = W * .3;
    // shadow
    const sh = Math.max(.25, 1 - lift / (W * .5));
    ctx.fillStyle = `rgba(150,70,110,${.28 * sh})`; ctx.beginPath(); ctx.ellipse(W / 2, W * .84, W * .22 * sh, W * .05 * sh, 0, 0, 7); ctx.fill();
    const pr = p => { const z = 3.2 - p[2]; const k = 3.2 / z; return [cx + p[0] * sc * k, cy - p[1] * sc * k]; };
    const vs = V.map(v => ap(M, v));
    const faces = F.map(f => ({ f, n: ap(M, f.n), z: f.i.reduce((s, i) => s + vs[i][2], 0) / 4 })).filter(o => o.n[2] > 0.02).sort((a, b) => a.z - b.z);
    for (const o of faces) {
      const lit = Math.max(0, o.n[0] * L[0] + o.n[1] * L[1] + o.n[2] * L[2]);
      const r = Math.round(238 + 17 * lit), g = Math.round(178 + 62 * lit), bl = Math.round(206 + 42 * lit);
      const pts = o.f.i.map(i => pr(vs[i]));
      ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      ctx.fillStyle = `rgb(${r},${g},${bl})`; ctx.lineJoin = 'round'; ctx.lineWidth = W * .07; ctx.strokeStyle = `rgb(${r},${g},${bl})`; ctx.stroke(); ctx.fill();
      ctx.lineWidth = W * .018; ctx.strokeStyle = `rgba(214,120,160,${.35 + .3 * (1 - lit)})`; ctx.stroke();
      // pips
      const u = ap(M, o.f.u), v = ap(M, o.f.v), c = ap(M, o.f.n.map(x => x * .5));
      ctx.fillStyle = `rgba(224,69,122,${.75 + .25 * lit})`;
      for (const [a, bb] of PIP[o.f.num]) {
        ctx.beginPath();
        for (let k = 0; k <= 12; k++) {
          const t = k / 12 * Math.PI * 2, rr = .095, du = a * .27 + Math.cos(t) * rr, dv = bb * .27 + Math.sin(t) * rr;
          const p = pr([c[0] + u[0] * du + v[0] * dv, c[1] + u[1] * du + v[1] * dv, c[2] + u[2] * du + v[2] * dv]);
          k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]);
        }
        ctx.fill();
      }
    }
  }
  return { draw, mul, Rx, Ry, Rz, FACE_UP };
})();
function roll3d(el, n, idx) {
  return new Promise(res => {
    const W = 170; let cv = el.querySelector('canvas.d3');
    if (!cv) { cv = document.createElement('canvas'); cv.width = cv.height = W; cv.className = 'd3'; el.classList.remove('img'); el.innerHTML = ''; el.appendChild(cv); }
    cv.dataset.n = '';
    const ctx = cv.getContext('2d');
    const sx = (2 + (Math.random() * 2 | 0)) * Math.PI * 2, sy = (1 + (Math.random() * 2 | 0)) * Math.PI * 2, sz = (Math.random() < .5 ? -1 : 1) * Math.PI * 2;
    const T = 1150 + idx * 120, t0 = performance.now(), base = D3.FACE_UP[n];
    let lastBounce = 0;
    const frame = now => {
      const t = Math.min(1, (now - t0) / T), e = 1 - Math.pow(1 - t, 3);
      const rx = .95 + sx * (1 - e), ry = .55 + sy * (1 - e), rz = sz * (1 - e) * (1 - e);
      const M = D3.mul(D3.Ry(ry), D3.mul(D3.Rx(rx), D3.mul(D3.Rz(rz), base)));
      // bounces getting smaller
      const ph = t * 3.2, lift = Math.abs(Math.sin(ph * Math.PI)) * (1 - t) * W * .26;
      const b = Math.floor(ph); if (b !== lastBounce && t < .95) { lastBounce = b; beep(330 + Math.random() * 120, .05, 'triangle', .05); }
      D3.draw(ctx, W, M, lift);
      if (t < 1) requestAnimationFrame(frame); else { cv.dataset.n = n; beep(520, .06, 'triangle', .05); setTimeout(res, 120); }
    };
    requestAnimationFrame(frame);
  });
}
function setDie(el, n) {
  // always the same 3D canvas dice (resting pose shows n on top)
  let cv = el.querySelector('canvas.d3');
  if (cv && cv.dataset.n === String(n)) return;
  if (!cv) { el.classList.remove('img'); el.innerHTML = ''; cv = document.createElement('canvas'); cv.width = cv.height = 170; cv.className = 'd3'; el.appendChild(cv); }
  cv.dataset.n = n;
  const M = D3.mul(D3.Ry(.55), D3.mul(D3.Rx(.95), D3.FACE_UP[n]));
  D3.draw(cv.getContext('2d'), 170, M, 0);
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
      `<div class="ic">${tileIcon(i)}</div>` + (t.price ? `<div class="pr">${t.price}</div>` : (i % 10 === 0 ? '' : `<div class="pr">${t.amt ? '-' + t.amt : ''}</div>`)) + '<div class="bld"></div><div class="own"></div>';
    el.onclick = () => { if (!busy && $('modal').classList.contains('hidden')) showTileInfo(i); };
    bd.appendChild(el);
  });
  $('tokens').innerHTML = G.players.map((p, k) => `<div class="token" id="tok${k}"><div class="stand">${pawn(p.ci)}</div><div class="shadow"></div></div>`).join('');
}
function renderAll() {
  if (!G || !$('board').querySelector('.tile')) return;
  $('players').style.gridTemplateColumns = `repeat(${G.players.length},1fr)`;
  $('players').innerHTML = G.players.map((p, k) =>
    `<div class="pchip ${k === G.turn ? 'turn' : ''} ${p.out ? 'out' : ''}" style="border-color:${k === G.turn ? CHARS[p.ci].color : '#fff'}">${p.sleep ? '<i class="zz">💤</i>' : ''}${avatar(p.ci)}<b>${pname(p)}</b><span>${p.out ? 'Bankrap' : rm(p.money)}</span><i class="cnt">🏠 ${G.own.filter(o => o === k).length} tanah</i></div>`).join('');
  TILES.forEach((t, i) => {
    const el = $('tile' + i), o = G.own[i];
    el.classList.toggle('owned', o !== null);
    if (o !== null) { el.style.setProperty('--own', CHARS[G.players[o].ci].color); el.style.setProperty('--own-bg', CHARS[G.players[o].ci].color + '40'); }
    const ow = el.querySelector('.own'), key = o === null ? '' : 'o' + G.players[o].ci;
    if (ow.dataset.k !== key) { ow.dataset.k = key; ow.innerHTML = o === null ? '' : avatar(G.players[o].ci); }
    el.querySelector('.bld').innerHTML = o !== null && t.t === 'prop' ? bldIcon(G.lvl[i]) : (o !== null ? (ART.bld_owned ? img('bld_owned', 'bi') : '⭐') : '');
  });
  G.players.forEach((p, k) => placeToken(k, p.pos));
  const p = cur();
  $('roundTxt').textContent = (G.maxRounds ? `Pusingan ${Math.min(G.round, G.maxRounds)}/${G.maxRounds}` : `Pusingan ${G.round} · sampai tinggal sorang`) + (festMult() > 1 ? ` · 🎉 Sewa ×${festMult().toFixed(1)}` : '');
  $('turnTxt').innerHTML = `${avatar(p.ci)} Giliran ${pname(p)}!`;
  $('log').innerHTML = G.log.slice(0, 3).map(l => `<div>${l}</div>`).join('');
  [...$('dice').children].forEach((d, i) => { if (!d.classList.contains('spin')) setDie(d, G.dice[i]); });
  $('hudTurn').innerHTML = $('turnTxt').innerHTML;
}
function placeToken(k, pos) {
  const el = $('tok' + k); if (!el) return;
  const [r, c] = tilePos(pos), same = G.players.map((p, j) => j).filter(j => !G.players[j].out && G.players[j].pos === pos), idx = same.indexOf(k);
  const ox = [.05, .38, .05, .38][idx < 0 ? 0 : idx], oy = [-.22, -.22, .05, .05][idx < 0 ? 0 : idx];
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
    const close = v => { if (done) return; done = true; $('modal').classList.add('hidden'); res(v); setTimeout(flushNotify, 250); };
    $('modalCard').querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { beep(700); close(buttons[+b.dataset.i].v); });
    $('modalCard').querySelectorAll('[data-pick]').forEach(b => b.onclick = e => { e.stopPropagation(); if (b.disabled) return; beep(700); close(b.dataset.pick); });
    const fin = () => close(buttons.length ? buttons[0].v : null);
    if (ms) { setTimeout(fin, ms); $('modal').onclick = fin; }
    else if (!buttons.length) $('modal').onclick = () => close(null); else $('modal').onclick = null;
    if (html.includes('class="flip"')) setTimeout(() => { const f = $('modalCard').querySelector('.flip'); if (f) { f.classList.add('open'); sfx.buy(); } }, 450);
  });
}
// Musim Perayaan: from round 31, rent grows 10% per round (max x4) so long games finish
const FEST_START = 30;
function festMult() { return G && G.round > FEST_START ? Math.min(4, 1 + (G.round - FEST_START) * 0.1) : 1; }
function rentOf(i, diceSum) { return Math.round(rawRent(i, diceSum) * festMult()); }
function rawRent(i, diceSum) {
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
  if (festMult() > 1 && t.price) body += `<p class="fest">🎉 Musim Perayaan: semua sewa ×${festMult().toFixed(1)}</p>`;
  const fact = FACTS[SLUGS[i]];
  return `<div class="prop-head" style="background:${col}"><div class="big-ic">${tileIcon(i)}</div><h2 style="color:#fff">${t.name}</h2>${t.price ? rm(t.price) : ''}</div>${fact ? `<div class="fact">💡 <b>Tahukah kau?</b> ${fact}</div>` : ''}${body}${o !== null ? `<p>Tuan: <b>${pname(G.players[o])}</b></p>` : ''}`;
}
function tileDesc(t) {
  return { go: 'Lalu sini dapat RM200!', rezeki: 'Ambil kad Rezeki — selalunya best!', musibah: 'Ambil kad Musibah — alamak...', tax: `Bayar ${rm(t.amt)}.`, jail: 'Rumah Tok Wan. Kalau singgah je, takpe. Kalau tertidur, rehat 1 giliran.', gojail: 'Mengantuk! Terus pergi tidur kat Rumah Tok Wan.', kenduri: 'Kenduri kahwin! Semua orang bagi salam berisi RM20 kat kau.' }[t.t] || '';
}
const pname = p => p.ai !== null ? CHARS[p.ci].name : esc(p.name || CHARS[p.ci].name);
function showTileInfo(i) { if (!G) return; modal(propHtml(i), []); }

/* ---------- Tile FX (beli / upgrade) ---------- */
function tileFx(i, kind) {
  const el = $('tile' + i); if (!el) return;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  const [r, c] = tilePos(i), box = document.createElement('div');
  box.className = 'fx'; box.style.left = (c + .5) / 11 * 100 + '%'; box.style.top = (r + .5) / 11 * 100 + '%';
  const big = kind === 'big', n = big ? 22 : 12, em = big ? ['🎆', '✨', '⭐', '🎉'] : ['✨', '⭐', '💖'];
  for (let k = 0; k < n; k++) {
    const sp = document.createElement('span'), a = Math.PI * 2 * k / n + Math.random() * .4, d = (big ? 70 : 42) + Math.random() * 25;
    sp.textContent = big && k % 2 ? '' : pick(em);
    if (!sp.textContent) { sp.className = 'dot'; sp.style.background = pick(['#ff7fa8', '#ffd43b', '#5cc9a7', '#7fd0f0', '#b197fc']); }
    sp.style.setProperty('--dx', Math.cos(a) * d + 'px'); sp.style.setProperty('--dy', Math.sin(a) * d + 'px');
    sp.style.animationDelay = (big ? Math.random() * .3 : 0) + 's';
    box.appendChild(sp);
  }
  if (kind !== 'small') { const lbl = document.createElement('b'); lbl.textContent = big ? 'BANGUNAN!' : kind === 'up' ? 'UPGRADE!' : 'DIBELI!'; box.appendChild(lbl); }
  $('tokens').appendChild(box); setTimeout(() => box.remove(), 1600);
  if (big) [523, 659, 784, 1047, 1319].forEach((f, k) => setTimeout(() => beep(f, .12, 'triangle', .06), k * 90));
}

/* ---------- Money ---------- */
async function pay(k, amt, to) {
  const p = G.players[k], before = p.money;
  let mathOk = false;
  if (G.math && p.ai === null && amt > 0 && before >= amt) mathOk = await mathQuiz(k, before, amt);
  p.money -= amt; floatText(k, '-' + amt, '#e64980'); sfx.pay();
  let raised = 0;
  if (p.money < 0) raised = await raiseCash(k, amt);
  // if they went bankrupt, the receiver only gets what they really had
  const paid = p.out ? Math.max(0, before + raised) : amt;
  if (to !== undefined && to !== null && paid > 0) { G.players[to].money += paid; floatText(to, '+' + paid, '#2f9f73'); }
  if (mathOk && !p.out) { await wait(300); gain(k, 10); log(`🧮 ${pname(p)} kira betul! Bonus RM10`); }
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
    say2('sell', { k, p: pname(p) });
    await modal(`<div class="big-ic">🏦</div><h2>Duit tak cukup!</h2><p>${pname(p)} kena bayar <b>${rm(owed)}</b> tapi duit tak cukup. Bank beli harta ni separuh harga:</p><div class="sold-list">${sold.map(x => `<div>${x}</div>`).join('')}</div><p>Baki duit sekarang: <b>${rm(Math.max(0, p.money))}</b></p>`, [{ label: 'OK' }], p.ai !== null ? 10000 : 0);
  }
  if (p.money < 0) {
    p.out = true; p.money = 0; log(`💸 ${pname(p)} dah bankrap!`);
    say2('bankrupt', { k, p: pname(p) });
    await modal(`<div class="big-ic">😭</div><h2>${pname(p)} Bankrap!</h2><p>Duit habis... takpe, lain kali cuba lagi!</p>`, [{ label: 'OK' }], p.ai !== null ? 10000 : 0);
  }
  return raised;
}

/* ---------- Turn flow ---------- */
const isHumanTurn = () => cur().ai === null;
function setRoll(on) {
  $('rollBtn').disabled = !on; $('rollBtn').style.visibility = on ? 'visible' : 'hidden';
  const hum = on && G && !G.over && isHumanTurn();
  $('tradeBtn').classList.toggle('hidden', !hum || !TILES.some((t, i) => G.own[i] !== null && G.own[i] !== G.turn));
  const lb = G && G.lastBuy;
  $('undoBtn').classList.toggle('hidden', !(hum && lb && lb.k === G.turn && G.own[lb.i] === G.turn && G.lvl[lb.i] === 0));
  if (lb) $('undoBtn').textContent = `↩️ Batal beli ${TILES[lb.i].name}`;
}
async function nextTurn(first) {
  if (G.over) return;
  if (!first) {
    let n = G.turn;
    do { n = (n + 1) % G.players.length; if (n === 0) { G.round++; (!G.maxRounds || G.round <= G.maxRounds) && setTimeout(G.round === FEST_START + 1 ? festStart : (G.round > FEST_START && (G.round - FEST_START) % 10 === 0 ? festMore : folkChatter), 400); } } while (G.players[n].out);
    G.turn = n;
  }
  if ((G.maxRounds && G.round > G.maxRounds) || alive().length < 2) return endGame();
  renderAll(); save();
  const p = cur();
  if (p.sleep > 0) {
    p.sleep--; log(`💤 ${pname(p)} masih tidur kat Rumah Tok Wan...`);
    await wait(1100); return nextTurn();
  }
  G.players.forEach((q, j) => { if (!q.out && q.money >= 5000) sticker('rich', j); });
  if (isHumanTurn()) { setRoll(true); busy = false; }
  else { setRoll(false); busy = true; await wait(650); await doRoll(0); }
}
$('rollBtn').onclick = () => { if (busy || !isHumanTurn()) return; busy = true; setRoll(false); doRoll(0); };

async function doRoll(dbl) {
  const p = cur(), k = G.turn, dies = [...$('dice').children];
  if (G.lastBuy && G.lastBuy.k === k) G.lastBuy = null;
  setRoll(false);
  const a = 1 + (Math.random() * 6 | 0), b = 1 + (Math.random() * 6 | 0);
  await Promise.all(dies.map((d, i) => roll3d(d, [a, b][i], i)));
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
    if (p.pos === 0 && dir > 0) { gain(k, 200); log(`🏁 ${pname(p)} lalu MULA, dapat RM200!`); if (Math.random() < .5) say2('go', { k, p: pname(p) }); }
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
  p.pos = 10; p.sleep = 1; st(k).sleeps++; sticker('tidur', k); renderAll();
  log(`😴 ${pname(p)} tertidur kat Rumah Tok Wan (rehat 1 giliran)`);
  say2('sleep', { k, p: pname(p) });
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
        p.money -= t.price; G.own[i] = k; sfx.buy(); st(k).bought++; if (!ai) G.lastBuy = { k, i, price: t.price }; sticker('first_buy', k); if (i === 39) sticker('klcc', k); if (t.set && TILES.every((x, j) => x.set !== t.set || G.own[j] === k)) sticker('set', k); floatText(k, '-' + t.price, '#e64980');
        log(`🛒 ${pname(p)} beli ${t.name}!`); renderAll(); tileFx(i, 'buy'); await wait(1000);
        say2(t.price >= 300 ? 'buyBig' : 'buy', { k, p: pname(p), t: t.name, m: rm(t.price) });
        if (ai) await modal(say(`${pname(p)}: "${fill(pick(AI_SAY.buy), { t: t.name })}"`) + propHtml(i), [{ label: 'OK' }], auto);
      } else { log(`${pname(p)} tak beli ${t.name}`); if (ai) await modal(say(`${pname(p)}: "${fill(pick(AI_SAY.skip), { t: t.name })}"`) + propHtml(i), [{ label: 'OK' }], 10000); }
    } else if (o === k) {
      if (t.t === 'prop' && G.lvl[i] < 2) {
        const cost = UPC[t.set], can = p.money >= cost, nx = G.lvl[i] + 1;
        let up;
        if (ai) up = can && p.money - cost >= ai.upReserve;
        else up = await modal(propHtml(i) + `<p>Ni tempat kau! Nak naik taraf jadi <b>${LVL_IC[nx]} ${LVL[nx]}</b>?</p>`, [{ label: `🔨 UPGRADE ${rm(cost)}`, v: true, cls: 'mint', dis: !can }, { label: 'Nanti dulu', v: false, cls: 'grey' }]);
        if (up) { p.money -= cost; G.lvl[i] = nx; sfx.buy(); if (nx === 2) sticker('bangunan', k); renderAll(); tileFx(i, nx === 2 ? 'big' : 'up'); await wait(1100); log(`🔨 ${pname(p)} naik taraf ${t.name} jadi ${LVL[nx]}!`); renderAll(); say2(nx === 2 ? 'bangunan' : 'upgrade', { k, p: pname(p), t: t.name, l: LVL[nx] }); if (ai) await modal(say(`${pname(p)}: "${fill(pick(AI_SAY.up), { t: t.name, l: LVL[nx] })} ${LVL_IC[nx]}"`) + propHtml(i), [{ label: 'OK' }], auto); }
      } else log(`${pname(p)} rehat kat ${t.name} sendiri 😌`);
    } else {
      let r = rentOf(i, sum); const owner = G.players[o];
      if (G.lastBuy && G.lastBuy.i === i) G.lastBuy = null;
      log(`🏠 ${pname(p)} bayar sewa ${rm(r)} kat ${pname(owner)}`);
      if (r >= 100) say2('rentHigh', { k, p: pname(p), o: pname(owner), t: t.name, m: rm(r) }); else if (Math.random() < .6) say2('rentLow', { k, p: pname(p), o: pname(owner), t: t.name, m: rm(r) });
      if (!ai) {
        const big = r >= 20;
        const v = await modal(propHtml(i) + `<p>Alamak! Ni tempat <b>${pname(owner)}</b>. Kena bayar sewa:</p><h2>${rm(r)}</h2>${big ? '<p class="mg-hint">🎮 Main <b>Tangkap Syiling</b>! Dapat 7 syiling, sewa jadi separuh.</p>' : ''}`,
          big ? [{ label: '🎮 CUBA NASIB', v: 'mg', cls: 'mint' }, { label: '💸 Bayar je', v: 'pay', cls: 'pink' }] : [{ label: '💸 BAYAR', v: 'pay', cls: 'pink' }]);
        if (v === 'mg') {
          const ok = await coinGame();
          if (ok) { r = Math.ceil(r / 2); sticker('minigame', k); log(`🪙 ${pname(p)} menang Tangkap Syiling! Sewa jadi ${rm(r)}`); say2('minigame', { k, p: pname(p) }); }
          else log(`🪙 ${pname(p)} tak sempat... bayar penuh ${rm(r)}`);
        }
      }
      else await modal(say(`${pname(p)}: "${fill(pick(r >= 100 ? AI_SAY.payBig : AI_SAY.pay), { m: rm(r), o: pname(owner), t: t.name })}"`) + propHtml(i), [{ label: 'OK' }], 10000);
      st(k).rentPaid += r; st(o).rentEarn += r; G.tileEarn[i] += r;
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
    st(k).kenduri++; if (st(k).kenduri >= 3) sticker('kenduri3', k);
    say2('kenduri', { k, p: pname(p) });
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
  if (c.pasar) await pasarMalam(k);
  else if (c.money > 0) gain(k, c.money);
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

/* ===================== EXTRAS ===================== */
function ensureState() {
  if (!G.stats) G.stats = G.players.map(() => ({ rentPaid: 0, rentEarn: 0, sleeps: 0, kenduri: 0, bought: 0 }));
  if (!G.tileEarn) G.tileEarn = TILES.map(() => 0);
  if (G.math === undefined) G.math = false;
}
const st = k => { ensureState(); return G.stats[k]; };

/* --- Stickers (simpan kekal dalam phone) --- */
const STICKERS = [
  ['first_buy', '🛒', 'Tanah Pertama', 'Beli tanah pertama'],
  ['klcc', '🏙️', 'Tuan KLCC', 'Beli KLCC'],
  ['bangunan', '🏢', 'Arkitek Cilik', 'Naik taraf jadi Bangunan'],
  ['set', '⭐', 'Set Lengkap', 'Kumpul satu set warna penuh'],
  ['kenduri3', '💐', 'Raja Kenduri', '3 kali kenduri dalam satu game'],
  ['tidur', '😴', 'Kaki Tidur', 'Tertidur kat Rumah Tok Wan'],
  ['rich', '💰', 'Jutawan Comel', 'Kumpul RM5000'],
  ['win', '🏆', 'Juara Tycoon', 'Menang satu game'],
  ['minigame', '🪙', 'Penangkap Syiling', 'Menang Tangkap Syiling'],
  ['trade', '🤝', 'Pakar Tawar', 'Berjaya beli tanah kawan'],
  ['math', '🧮', 'Otak Geliga', 'Jawab 10 soalan kira dengan betul'],
  ['pasar', '🍡', 'Hantu Kuih', 'Pilih kuih kat Pasar Malam'],
];
let STK = {}; try { STK = JSON.parse(localStorage.getItem('cozyTycoonStickers')) || {}; } catch (e) {}
function sticker(id, k) {
  if (STK[id] || !G || k < 0 || !G.players[k] || G.players[k].ai !== null) return;
  STK[id] = Date.now(); try { localStorage.setItem('cozyTycoonStickers', JSON.stringify(STK)); } catch (e) {}
  const d = STICKERS.find(x => x[0] === id); if (!d) return;
  setTimeout(() => {
    const t = document.createElement('div'); t.className = 'stk-pop';
    t.innerHTML = `<div class="stk-ic">${stickerIcon(d)}</div><div><small>STICKER BARU!</small><b>${d[2]}</b></div>`;
    document.body.appendChild(t); [784, 988, 1175, 1568].forEach((f, n) => setTimeout(() => beep(f, .12, 'triangle', .06), n * 90));
    setTimeout(() => t.remove(), 3600);
  }, 500);
}
const stickerIcon = d => ART['stk_' + d[0]] ? img('stk_' + d[0], 'si') : d[1];
function renderStickers() {
  const box = $('stickers'); if (!box) return;
  const n = STICKERS.filter(d => STK[d[0]]).length;
  $('stkCount').textContent = `${n}/${STICKERS.length}`;
  box.innerHTML = STICKERS.map(d => `<div class="stk ${STK[d[0]] ? 'on' : ''}" title="${d[3]}"><div class="stk-ic">${STK[d[0]] ? stickerIcon(d) : '❔'}</div><b>${d[2]}</b><small>${d[3]}</small></div>`).join('');
}

/* --- Mini game: Tangkap Syiling --- */
function coinGame() {
  return new Promise(res => {
    const need = 7, ov = document.createElement('div'); let score = 0, t = 7, end = false;
    ov.className = 'mg';
    ov.innerHTML = `<div class="mg-card"><h2>Tangkap Syiling! 🪙</h2><div class="mg-top"><span id="mgScore">🪙 0/${need}</span><span id="mgTime">⏱ ${t}</span></div><div class="mg-area" id="mgArea"><div class="mg-go">SEDIA...</div></div><p>Tap syiling yang jatuh! Jangan tap 💣</p></div>`;
    document.body.appendChild(ov);
    const area = ov.querySelector('#mgArea'), coinArt = ART.mg_coin ? img('mg_coin', 'mgi') : '🪙', bombArt = ART.mg_bomb ? img('mg_bomb', 'mgi') : '💣';
    let sp, tm;
    const spawn = () => {
      if (end) return;
      const bomb = Math.random() < .2, c = document.createElement('div');
      c.className = 'mg-coin' + (bomb ? ' bomb' : ''); c.innerHTML = bomb ? bombArt : coinArt;
      c.style.left = (4 + Math.random() * 78) + '%'; c.style.animationDuration = (1.7 + Math.random() * 1.1) + 's';
      c.onpointerdown = e => {
        e.preventDefault(); if (end) return;
        if (bomb) { score = Math.max(0, score - 2); beep(180, .25, 'sawtooth', .06); area.classList.remove('shake'); void area.offsetWidth; area.classList.add('shake'); }
        else { score++; sfx.coin(); }
        c.remove(); ov.querySelector('#mgScore').textContent = `🪙 ${score}/${need}`;
        if (score >= need) finish(true);
      };
      c.addEventListener('animationend', () => c.remove());
      area.appendChild(c);
    };
    setTimeout(() => {
      area.innerHTML = ''; sp = setInterval(spawn, 360); spawn();
      tm = setInterval(() => { t--; ov.querySelector('#mgTime').textContent = '⏱ ' + t; if (t <= 0) finish(score >= need); }, 1000);
    }, 1100);
    function finish(ok) {
      if (end) return; end = true; clearInterval(sp); clearInterval(tm);
      ok ? sfx.win() : sfx.pay();
      ov.querySelector('.mg-card').insertAdjacentHTML('beforeend', `<div class="mg-res ${ok ? 'win' : 'lose'}">${ok ? '🎉 BERJAYA! Sewa separuh!' : '😅 Tak cukup... bayar penuh'}</div>`);
      setTimeout(() => { ov.remove(); res(ok); }, 1800);
    }
  });
}

/* --- Pasar Malam: pilih kuih --- */
const KUIH = [['🍡', 'Kuih Lapis'], ['🥟', 'Karipap'], ['🍩', 'Donut Gula'], ['🍢', 'Sate'], ['🍧', 'ABC'], ['🌽', 'Jagung Bakar'], ['🍮', 'Puding'], ['🥞', 'Apam Balik']];
async function pasarMalam(k) {
  const p = G.players[k], three = shuffle(KUIH.slice()).slice(0, 3), prizes = shuffle([30, 80, 150]);
  const ki = c => ART['kuih_' + KUIH.indexOf(c)] ? img('kuih_' + KUIH.indexOf(c), 'ki') : c[0];
  let pickI;
  if (p.ai === null) {
    pickI = +(await modal(`<div class="big-ic">🏮</div><h2>Pasar Malam!</h2><p>Pilih satu kuih. Setiap kuih ada hadiah rahsia!</p><div class="kuih-row">${three.map((c, n) => `<button class="kuih" data-pick="${n}"><span>${ki(c)}</span>${c[1]}</button>`).join('')}</div>`, []));
    if (isNaN(pickI)) pickI = 0;
  } else { await wait(600); pickI = Math.random() * 3 | 0; }
  const won = prizes[pickI];
  await modal(`<div class="big-ic">${ki(three[pickI])}</div><h2>${three[pickI][1]}!</h2><p>${pname(p)} dapat <b>${rm(won)}</b>${won === 150 ? ' — paling sedap! 🤩' : won === 30 ? ' — sikit je, tapi sedap 😋' : ' 😄'}</p><div class="kuih-row">${three.map((c, n) => `<div class="kuih ${n === pickI ? 'sel' : 'dim'}"><span>${ki(c)}</span>${rm(prizes[n])}</div>`).join('')}</div>`, [{ label: 'Sedap!', cls: 'mint' }], p.ai !== null ? 10000 : 0);
  gain(k, won); log(`🏮 ${pname(p)} pilih ${three[pickI][1]}, dapat ${rm(won)}`); sticker('pasar', k);
}

/* --- Mod Belajar Kira --- */
async function mathQuiz(k, before, amt) {
  const p = G.players[k], ans = before - amt, opts = new Set([ans]);
  const ds = [10, 20, 50, 100].filter(d => d !== 0);
  while (opts.size < 3) { const v = ans + (Math.random() < .5 ? -1 : 1) * pick(ds); if (v >= 0) opts.add(v); }
  const list = shuffle([...opts]);
  const v = +(await modal(`<div class="big-ic">🧮</div><h2>Jom Kira!</h2><p><b>${pname(p)}</b> ada <b>${rm(before)}</b> dan kena bayar <b>${rm(amt)}</b>.</p><div class="math-eq">${before} − ${amt} = ?</div>`, list.map(o => ({ label: rm(o), v: o, cls: 'mint' }))));
  const ok = v === ans;
  if (ok) { let n = +(localStorage.getItem('cozyTycoonMath') || 0) + 1; try { localStorage.setItem('cozyTycoonMath', n); } catch (e) {} if (n >= 10) sticker('math', k); sfx.win(); }
  await modal(`<div class="big-ic">${ok ? '🎉' : '🤔'}</div><h2>${ok ? 'Betul! Pandainya!' : 'Hampir betul!'}</h2><div class="math-eq">${before} − ${amt} = <b>${ans}</b></div><p>${ok ? 'Bonus <b>RM10</b> untuk otak geliga!' : 'Takpe, cuba lagi lain kali ye!'}</p>`, [{ label: 'OK', cls: ok ? 'mint' : 'pink' }]);
  return ok;
}

/* --- Batal beli --- */
$('undoBtn').onclick = () => {
  const lb = G && G.lastBuy; if (busy || !lb || lb.k !== G.turn || G.own[lb.i] !== lb.k || G.lvl[lb.i] !== 0) return;
  const p = G.players[lb.k]; p.money += lb.price; G.own[lb.i] = null; st(lb.k).bought--; G.lastBuy = null;
  floatText(lb.k, '+' + lb.price, '#2f9f73'); sfx.coin(); log(`↩️ ${pname(p)} batal beli ${TILES[lb.i].name}, duit dipulangkan`);
  renderAll(); setRoll(true); save();
};

/* --- Beli tanah kawan (trade) --- */
$('tradeBtn').onclick = async () => {
  if (busy || !isHumanTurn()) return;
  busy = true; setRoll(false);
  try { await openTrade(G.turn); } finally { busy = false; renderAll(); setRoll(true); save(); }
};
function aiValue(k, i) {
  const o = G.own[i], t = TILES[i], ai = AIS[G.players[o].ai] || AIS[2];
  let v = (t.price || 0) + G.lvl[i] * (UPC[t.set] || 0);
  let m = [1.8, 1.4, 1.55][G.players[o].ai] || 1.5;
  if (t.set) { const mine = TILES.filter((x, j) => x.set === t.set && G.own[j] === o).length; if (mine >= 2) m += .8; }
  if (G.players[o].money < 150) m -= .4; // need cash: more willing
  void ai; return Math.round(v * m / 10) * 10;
}
async function openTrade(k) {
  const p = G.players[k], tiles = TILES.map((t, i) => i).filter(i => G.own[i] !== null && G.own[i] !== k && !G.players[G.own[i]].out);
  const iStr = await modal(`<h2>🤝 Beli Tanah Kawan</h2><p>Pilih tanah yang kau nak. Kawan boleh setuju atau tolak!</p><div class="tr-grid">${tiles.map(i => `<button class="tr-tile" data-pick="${i}" style="--own:${CHARS[G.players[G.own[i]].ci].color}"><span class="tr-ic">${tileIcon(i)}</span><b>${TILES[i].name}</b><small>${pname(G.players[G.own[i]])}${G.lvl[i] ? ' · ' + LVL_IC[G.lvl[i]] : ''}</small></button>`).join('')}</div>`, [{ label: 'Batal', v: null, cls: 'grey' }]);
  if (iStr === null || iStr === undefined) return;
  const i = +iStr, t = TILES[i], o = G.own[i], owner = G.players[o], base = (t.price || 0) + G.lvl[i] * (UPC[t.set] || 0);
  const offers = [base, Math.round(base * 1.5 / 10) * 10, base * 2];
  const off = await modal(propHtml(i) + `<p>Duit kau: <b>${rm(p.money)}</b>. Nak tawar berapa kat <b>${pname(owner)}</b>?</p>`,
    [...offers.map(v => ({ label: rm(v), v, cls: 'mint', dis: v > p.money })), { label: 'Batal', v: null, cls: 'grey' }]);
  if (!off) return;
  let yes;
  if (owner.ai !== null) {
    const want = aiValue(k, i); yes = off >= want;
    await modal(`<div class="ai-say">${avatar(owner.ci)}<span>${pname(owner)}: "${yes ? pick(['Ok deal! Ambik la 😊', 'Boleh! Duit tu aku nak beli aiskrim 🍦', 'Setuju! Jaga elok-elok ye']) : pick(['Hmm... tak nak la, sayang tanah ni 😤', 'Murah sangat! Tambah lagi la', 'Tak boleh, ni tanah kesayangan aku!'])}"</span></div><h2>${yes ? '🤝 Deal!' : '🙅 Ditolak'}</h2>`, [{ label: 'OK' }]);
  } else {
    yes = (await modal(`<div class="big-ic">🤝</div><h2>Hei ${pname(owner)}!</h2><p><b>${pname(p)}</b> nak beli <b>${t.name}</b> kau dengan harga <b>${rm(off)}</b>. Setuju?</p><p class="hint">Bagi phone kat ${pname(owner)} dulu 😉</p>`, [{ label: '✅ Setuju', v: true, cls: 'mint' }, { label: '❌ Tak nak', v: false, cls: 'pink' }])) === true;
  }
  if (!yes) { log(`🙅 ${pname(owner)} tak nak jual ${t.name}`); return; }
  p.money -= off; owner.money += off; G.own[i] = k;
  floatText(k, '-' + off, '#e64980'); floatText(o, '+' + off, '#2f9f73'); sfx.buy();
  renderAll(); tileFx(i, 'buy'); sticker('trade', k);
  log(`🤝 ${pname(p)} beli ${t.name} dari ${pname(owner)} dengan ${rm(off)}`);
  say2('trade', { k, p: pname(p), o: pname(owner), t: t.name });
  if (t.set && TILES.every((x, j) => x.set !== t.set || G.own[j] === k)) sticker('set', k);
  await wait(1000);
}

/* --- Ringkasan hujung game --- */
function statsHtml() {
  ensureState();
  const ps = G.players.map((p, k) => ({ p, s: G.stats[k] }));
  const top = (f) => ps.slice().sort((a, b) => f(b.s) - f(a.s))[0];
  const rows = [];
  const a = top(s => s.rentPaid); if (a.s.rentPaid) rows.push(['💸', 'Paling banyak bayar sewa', `${pname(a.p)} (${rm(a.s.rentPaid)})`]);
  const b = top(s => s.rentEarn); if (b.s.rentEarn) rows.push(['💰', 'Paling untung sewa', `${pname(b.p)} (${rm(b.s.rentEarn)})`]);
  const c = top(s => s.bought); if (c.s.bought) rows.push(['🏠', 'Paling banyak beli', `${pname(c.p)} (${c.s.bought})`]);
  const d = top(s => s.sleeps); if (d.s.sleeps) rows.push(['😴', 'Paling kuat tidur', `${pname(d.p)} (${d.s.sleeps}×)`]);
  const ti = G.tileEarn.indexOf(Math.max(...G.tileEarn)); if (G.tileEarn[ti] > 0) rows.push([TILES[ti].ic, 'Tanah paling untung', `${TILES[ti].name} (${rm(G.tileEarn[ti])})`]);
  return rows.length ? `<div class="stats">${rows.map(r => `<div><span>${r[0]}</span><small>${r[1]}</small><b>${r[2]}</b></div>`).join('')}</div>` : '';
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
  sticker('win', G.players.indexOf(win));
  sfx.win(); confetti(); say2('win', { k: G.players.indexOf(win), p: pname(win) });
  await modal(`<div class="big-ic">🏆</div><h2>${pname(win)} ${win.ai === null && G.players.filter(x => x.ai === null).length === 1 ? 'menang! Hebat!' : 'jadi Jutawan Comel!'}</h2>
    <p>Kekayaan = duit + nilai tanah & bangunan</p>
    <ol class="rank">${rank.map((r, n) => `<li>${['🥇', '🥈', '🥉', '4️⃣'][n]} ${avatar(r.p.ci)} ${pname(r.p)}<span>${r.w < 0 ? 'Bankrap' : rm(r.w)}</span></li>`).join('')}</ol>${statsHtml()}`,
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
