'use strict';
/* Cozy Arena — auto-battler lawan AI. Canvas 2D, logical 720x1280 (portrait).
   Logik tempur guna grid rata (BX/BY/CELL). Papan dilukis 2.5D melalui proj(). */

const GAME_VERSION = 9, GAME_DATE = '29 Okt 2026';   // samakan dengan VERSION dalam sw.js
const TEAM = ['#3fa9ff', '#ff4a3d'];                // biru = kau, merah = musuh
const W = 720, H = 1280, COLS = 6, ROWS = 8, CELL = 100, BX = 60, BY = 110;
const BENCH_Y = 940;
const SHOP_Y = BENCH_Y + CELL + 22;      // 1062
const MAX_ROUND = 10, BOSS_ROUNDS = [5, 10];
const FD = "'Lilita One', 'Trebuchet MS', sans-serif";
const FB = "800 1em 'Nunito', 'Trebuchet MS', sans-serif";
const PX0 = 360, PY0 = 178, PY1 = 868, WTOP = 492, WBOT = 690, THICK = 30;

/* ---------- data ---------- */
const HEROES = {
  knight:   { name: 'Bulwark', role: 'Knight', cost: 3, hp: 980, atk: 58, range: 1.25, as: 1.0, armor: .32, speed: 150, proj: null, color: '#c9483a', ult: 'Perisai Suria!', traits: ['berani'], dirs: true },
  archer:   { name: 'Bramble', role: 'Archer', cost: 3, hp: 480, atk: 74, range: 4, as: .85, armor: .05, speed: 140, proj: 'arrow', color: '#4f9a3f', ult: 'Hujan Panah!', traits: ['hutan', 'pemburu'] },
  mage:     { name: 'Nimbus', role: 'Mage', cost: 4, hp: 440, atk: 112, range: 3.5, as: 1.6, armor: .05, speed: 130, proj: 'orb', color: '#4f6fd8', ult: 'Meteor!', traits: ['arcane', 'berani'] },
  healer:   { name: 'Willow', role: 'Healer', cost: 3, hp: 520, atk: 34, heal: 92, range: 3.5, as: 1.3, armor: .1, speed: 135, proj: 'spark', color: '#8a9d3a', ult: 'Rahmat Daun!', traits: ['hutan', 'arcane'] },
  // hero baru: muncul automatik bila gambar assets/heroes/<id>_idle.png ada
  assassin: { name: 'Kage', role: 'Assassin', cost: 4, hp: 560, atk: 96, range: 1.2, as: .8, armor: .1, speed: 200, proj: null, color: '#5a4a7a', ult: 'Tikaman Bayang!', traits: ['pemburu', 'berani'], leap: true },
  bear:     { name: 'Bruno', role: 'Brawler', cost: 3, hp: 1150, atk: 50, range: 1.25, as: 1.1, armor: .25, speed: 140, proj: null, color: '#8a5a2e', ult: 'Raungan!', traits: ['hutan', 'berani'] },
  pyro:     { name: 'Ember', role: 'Pyromancer', cost: 5, hp: 450, atk: 88, range: 3.5, as: 1.3, armor: .05, speed: 130, proj: 'fire', color: '#d0532a', ult: 'Hujan Api!', traits: ['arcane', 'pemburu'] },
  gunner:   { name: 'Pip', role: 'Gunner', cost: 4, hp: 430, atk: 72, range: 4.5, as: 1.1, armor: .05, speed: 135, proj: 'cannon', color: '#4a7a8a', ult: 'Meriam Besar!', traits: ['pemburu', 'hutan'] },
};
const TRAITS = {
  berani:  { name: 'Berani', color: '#e0614f', tiers: [2, 4], desc: ['+20% HP', '+45% HP'] },
  hutan:   { name: 'Hutan', color: '#6cc25a', tiers: [2, 4], desc: ['+15% laju serang', '+35% laju serang'] },
  arcane:  { name: 'Arcane', color: '#6f8cff', tiers: [2, 4], desc: ['Mula dengan 35 mana', 'Mula dengan 70 mana'] },
  pemburu: { name: 'Pemburu', color: '#f2b84b', tiers: [2, 4], desc: ['+12% peluang crit', '+25% peluang crit'] },
};
const THEMES = [
  { name: 'Hutan Senja', sky: ['#132a36', '#1b3a30', '#14231c'], enemy: ['#b0966c', '#a48a62', '#97805a', '#8a7350'], ally: ['#86bb67', '#78ad5c', '#6ca253', '#5f9149'], decor: 'forest', key: 0 },
  { name: 'Gurun Emas', sky: ['#40283a', '#8a5238', '#3a2618'], enemy: ['#e6c98c', '#dcbb7a', '#cdac6a', '#c09a5a'], ally: ['#a0b860', '#93ab55', '#86a04a', '#7a9240'], decor: 'desert', key: -3 },
  { name: 'Puncak Salji', sky: ['#18263f', '#2c4560', '#162131'], enemy: ['#dbe5ee', '#ccd8e4', '#b8c6d4', '#a9b8c8'], ally: ['#8cc0a2', '#7fb396', '#72a689', '#669a7e'], decor: 'snow', key: 2 },
  { name: 'Kubu Gunung Api', sky: ['#2a0e12', '#521c14', '#180909'], enemy: ['#7a5650', '#6e4c46', '#5f403c', '#543834'], ally: ['#6f8f56', '#64834c', '#5a7844', '#4f6c3c'], decor: 'volcano', key: -5 },
];
const themeOf = r => THEMES[r <= 3 ? 0 : r <= 6 ? 1 : r <= 9 ? 2 : 3];
const BOSS = { 5: { type: 'knight', name: 'Bulwark Kegelapan', hpMul: 7, atkMul: 1.5 }, 10: { type: 'mage', name: 'Nimbus Kegelapan', hpMul: 10, atkMul: 1.6 } };
const PSPEED = { arrow: 900, arrowGold: 1000, orb: 560, leaf: 520, spark: 640, meteor: 1100, fire: 600, cannon: 700, cannonBig: 650 };
let POOL = [];

/* ---------- canvas ---------- */
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
let k = 1, ox = 0, oy = 0, dpr = 1;
const SA_PROBE = document.createElement('div');
SA_PROBE.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
document.body.appendChild(SA_PROBE);
function safeArea() { const c = getComputedStyle(SA_PROBE); return { top: parseFloat(c.paddingTop) || 0, bottom: parseFloat(c.paddingBottom) || 0 }; }
const standalone = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone;
function goFullscreen() {
  const el = document.documentElement;
  if (standalone() || document.fullscreenElement || !el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: 'hide' }).then(() => { try { screen.orientation.lock('portrait').catch(() => {}); } catch (e) {} }).catch(() => {});
}
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = innerWidth, h = innerHeight, sa = safeArea();
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  const ah = h - sa.top - sa.bottom;
  k = Math.min(w / W, ah / H); ox = (w - W * k) / 2; oy = sa.top + (ah - H * k) / 2;
}
addEventListener('resize', resize); resize();
function proj(x, y) {
  const u = (x - BX) / (COLS * CELL), v = (y - BY) / (ROWS * CELL), w = WTOP + (WBOT - WTOP) * v;
  return { x: PX0 + (u - .5) * w, y: PY0 + v * (PY1 - PY0), s: w / (COLS * CELL) };
}
function unproj(sx, sy) {
  const v = (sy - PY0) / (PY1 - PY0), w = WTOP + (WBOT - WTOP) * v;
  return { x: BX + ((sx - PX0) / w + .5) * COLS * CELL, y: BY + v * ROWS * CELL };
}

/* ---------- audio ---------- */
const AU = { ctx: null, muted: false, last: {}, step: 0, next: 0 };
try { AU.muted = localStorage.getItem('cozyArenaMute') === '1'; } catch (e) {}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function audioInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  const a = AU.ctx = new C();
  AU.master = a.createGain(); AU.master.gain.value = AU.muted ? 0 : 1; AU.master.connect(a.destination);
  const comp = a.createDynamicsCompressor(); comp.connect(AU.master);
  AU.sfx = a.createGain(); AU.sfx.gain.value = .8; AU.sfx.connect(comp);
  AU.mus = a.createGain(); AU.mus.gain.value = .16; AU.mus.connect(comp);
  const len = a.sampleRate, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AU.noise = buf; AU.next = a.currentTime + .1;
  setInterval(musicTick, 50);
}
function tone(f, dur, type = 'sine', vol = .2, f2 = 0, at = 0, dest = AU.sfx) {
  const a = AU.ctx; if (!a) return; const t = at || a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol = .2, ft = 'lowpass', f = 1200, f2 = 0, at = 0, dest = AU.sfx) {
  const a = AU.ctx; if (!a) return; const t = at || a.currentTime;
  const s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = AU.noise; fl.type = ft; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
}
function sfx(n) {
  const a = AU.ctx; if (!a || AU.muted) return;
  const now = a.currentTime; if (AU.last[n] && now - AU.last[n] < .04) return; AU.last[n] = now;
  const r = 1 + (Math.random() - .5) * .1;
  switch (n) {
    case 'arrow': noise(.14, .22, 'bandpass', 3200, 700); tone(900 * r, .09, 'triangle', .06, 350); break;
    case 'orb': tone(520 * r, .2, 'sine', .14, 1100); tone(780 * r, .16, 'triangle', .05, 1500); break;
    case 'fire': noise(.3, .3, 'bandpass', 900, 2600); tone(200 * r, .2, 'sawtooth', .05, 90); break;
    case 'cannon': tone(120 * r, .25, 'sine', .6, 45); noise(.2, .4, 'lowpass', 1800, 200); break;
    case 'spark': tone(1200 * r, .1, 'sine', .07, 1800); break;
    case 'slash': noise(.1, .3, 'highpass', 2500, 6000); tone(300 * r, .07, 'sawtooth', .05, 120); break;
    case 'hit': tone(150 * r, .14, 'sine', .45, 55); noise(.06, .22, 'lowpass', 1400); break;
    case 'crit': tone(170, .2, 'sine', .55, 45); noise(.12, .35, 'lowpass', 2600, 300); tone(1400, .12, 'square', .06, 700); break;
    case 'pop': noise(.18, .25, 'lowpass', 2200, 400); tone(320 * r, .14, 'sine', .18, 140); break;
    case 'boom': noise(.6, .7, 'lowpass', 1500, 120); tone(95, .5, 'sine', .7, 32); break;
    case 'heal': [880, 1175, 1568].forEach((f, i) => tone(f * r, .25, 'sine', .07, 0, now + i * .05)); break;
    case 'die': tone(420, .35, 'square', .07, 70); noise(.35, .25, 'bandpass', 1800, 300); break;
    case 'coin': tone(1320, .07, 'square', .05, 0, now); tone(1760, .16, 'square', .05, 0, now + .07); break;
    case 'tick': tone(1900 * r, .05, 'square', .03); break;
    case 'click': tone(700, .05, 'triangle', .1, 500); break;
    case 'place': tone(260, .08, 'sine', .25, 160); noise(.05, .12, 'lowpass', 900); break;
    case 'merge': [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .12, 0, now + i * .06)); break;
    case 'trait': [659, 988].forEach((f, i) => tone(f, .25, 'triangle', .1, 0, now + i * .08)); break;
    case 'ult': tone(220, .45, 'sawtooth', .1, 880); noise(.45, .18, 'bandpass', 600, 4000); tone(1760, .4, 'sine', .06, 0, now + .25); break;
    case 'roar': tone(110, .6, 'sawtooth', .18, 60); noise(.6, .3, 'lowpass', 700, 150); break;
    case 'warn': tone(330, .5, 'square', .06, 200); break;
    case 'start': [392, 523, 659].forEach((f, i) => tone(f, .35, 'sawtooth', .07, 0, now + i * .1)); tone(784, .6, 'square', .06, 0, now + .3); break;
    case 'boss': [110, 104, 98].forEach((f, i) => tone(f, .7, 'sawtooth', .16, 0, now + i * .35)); noise(1.2, .2, 'lowpass', 400, 80); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .14, 0, now + i * .1)); [523, 659, 784].forEach(f => tone(f * 2, .9, 'sine', .07, 0, now + .45)); break;
    case 'star': tone(1047 * r, .3, 'triangle', .12, 0); tone(1568 * r, .3, 'sine', .06, 0, now + .05); break;
    case 'lose': [392, 330, 262, 196].forEach((f, i) => tone(f, .35, 'triangle', .13, 0, now + i * .16)); break;
  }
}
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], ARP = [0, 1, 2, 1, 0, 2, 1, 2];
function musicTick() {
  const a = AU.ctx; if (!a) return;
  if (AU.next < a.currentTime) AU.next = a.currentTime + .05;
  const th = themeOf(S.round || 1), boss = isBossRound() && S.phase === 'battle';
  while (AU.next < a.currentTime + .25) {
    const st = AU.step, t = AU.next, ch = CHORDS[(st >> 3) % 4].map(n => n + th.key - (boss ? 1 : 0)), i = st % 8, fight = S.phase === 'battle';
    if (i === 0 || i === 4) tone(mtof(ch[0] - 12), .55, boss ? 'sawtooth' : 'triangle', boss ? .25 : .5, 0, t, AU.mus);
    tone(mtof(ch[ARP[i]] + 12), .3, 'sine', .22, 0, t, AU.mus);
    if (i === 0 && (st >> 3) % 2 === 0) ch.forEach(n => tone(mtof(n), 2.2, 'sine', .06, 0, t, AU.mus));
    if (fight) {
      noise(.04, i % 2 ? .08 : .14, 'highpass', 7000, 0, t, AU.mus);
      if (i === 0 || i === 4 || (boss && (i === 3 || i === 7))) tone(110, .2, 'sine', .9, 40, t, AU.mus);
      if (i === 2 || i === 6) noise(.12, .3, 'bandpass', 1800, 900, t, AU.mus);
    }
    AU.next += fight ? (boss ? .22 : .25) : .32; AU.step++;
  }
}
function toggleMute() {
  AU.muted = !AU.muted; try { localStorage.setItem('cozyArenaMute', AU.muted ? '1' : '0'); } catch (e) {}
  if (AU.master) AU.master.gain.setTargetAtTime(AU.muted ? 0 : 1, AU.ctx.currentTime, .05);
}

/* ---------- images ---------- */
const IMG = {}, ARENA = {}, UI = {};
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
const loadAny = async list => { for (const s of list) { try { return await loadImg(s); } catch (e) {} } return null; };
function tinted(img, color, mode = 'source-in') {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  g.globalCompositeOperation = mode; g.fillStyle = color; g.fillRect(0, 0, c.width, c.height);
  return c;
}
const POSE_LIST = ['windup', 'hurt', 'walk1', 'walk2', 'victory', 'cast'];
const PADR = 576 / 384;                 // pose canvases carry 96px padding around the 384px idle frame
const POSE_FALLBACK = { windup: 'idle', hurt: 'idle', walk1: 'idle', walk2: 'idle', victory: 'idle', cast: 'attack' };
const DIR_POSES = ['idle', 'walk1', 'walk2', 'windup', 'attack', 'hurt'];   // back/side views (cast & victory always face the camera)
function spriteImg(type, pose, v, dir) {
  const im = IMG[type];
  const dset = dir && im.d[dir];
  let base, big, key;
  if (dset && dset[pose]) { base = dset[pose]; big = true; key = dir + pose + v; }
  else {
    if (pose !== 'idle' && pose !== 'attack' && !im.p[pose]) pose = POSE_FALLBACK[pose] || 'idle';
    const own = pose === 'idle' || pose === 'attack';
    big = im.big || !own; base = own ? im[pose] : im.p[pose]; key = pose + v;
  }
  if (!v) return { img: base, big };
  if (!im.v[key]) im.v[key] = v === 'W' ? tinted(base, '#fff') : v === 'T0' ? tinted(base, TEAM[0]) : v === 'T1' ? tinted(base, TEAM[1]) : tinted(base, 'rgba(60,10,90,.55)', 'source-atop');
  return { img: im.v[key], big };
}
function drawIdle(t, x, y, w, h) {   // UI portrait: crop the 384 frame out of padded sprites
  const im = IMG[t], o = im.big ? 96 : 0, s = im.idle.width - 2 * o;
  ctx.drawImage(im.idle, o, o, s, s, x, y, w, h);
}
async function loadAll() {
  await Promise.all(Object.keys(HEROES).map(async t => {
    const src = p => [`assets/heroes/opt/${t}_${p}.webp`, `assets/heroes/${t}_${p}.png`];
    const idle = await loadAny(src('idle')); if (!idle) return;
    const attack = (await loadAny(src('attack'))) || idle;
    IMG[t] = { idle, attack, p: {}, v: {}, d: {}, big: idle.width > 400 };
    await Promise.all(POSE_LIST.map(async n => { const i = await loadAny([`assets/heroes/opt/${t}_${n}.webp`]); if (i) IMG[t].p[n] = i; }));
    // optional back/side views: assets/heroes/opt/<id>_back_<pose>.webp, <id>_side_<pose>.webp
    if (HEROES[t].dirs) await Promise.all(['back', 'side'].flatMap(d => DIR_POSES.map(async n => {
      const i = await loadAny([`assets/heroes/opt/${t}_${d}_${n}.webp`]); if (i) (IMG[t].d[d] ||= {})[n] = i;
    })));
  }));
  POOL = Object.keys(HEROES).filter(t => IMG[t]);
  UI.logo = await loadAny(['assets/ui/logo.webp']);
  await Promise.all(['forest', 'desert', 'snow', 'volcano'].map(async d => { const i = await loadAny([`assets/arena/${d}.webp`]); if (i) ARENA[d] = i; }));
}

/* ---------- helpers ---------- */
const rand = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const cellCenter = (c, r) => ({ x: BX + c * CELL + CELL / 2, y: BY + r * CELL + CELL / 2 });
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function quad(a, b, c, d) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); }
function txt(s, x, y, size, color, align = 'center', stroke = true, font = FD) {
  ctx.font = font === FD ? `${size}px ${FD}` : `800 ${size}px 'Nunito', 'Trebuchet MS', sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  if (stroke) { ctx.lineWidth = Math.max(3, size * .2); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(28,16,10,.9)'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
}
function coin(x, y, r) {
  const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
  g.addColorStop(0, '#fff3b0'); g.addColorStop(.5, '#f6c445'); g.addColorStop(1, '#b77a12');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#6b4208'; ctx.lineWidth = 2; ctx.stroke();
}
function heart(x, y, s, on) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 20, s / 20);
  ctx.beginPath(); ctx.moveTo(0, 6); ctx.bezierCurveTo(-14, -4, -8, -16, 0, -8); ctx.bezierCurveTo(8, -16, 14, -4, 0, 6); ctx.closePath();
  ctx.fillStyle = on ? '#ff5d6c' : 'rgba(255,255,255,.15)'; ctx.fill();
  ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(28,16,10,.9)'; ctx.stroke(); ctx.restore();
}
function star5(x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#2a170b'; ctx.stroke();
}
function traitIcon(key, x, y, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color; ctx.strokeStyle = '#2a170b'; ctx.lineWidth = 2;
  ctx.beginPath();
  if (key === 'berani') { ctx.moveTo(0, -r); ctx.lineTo(r * .85, -r * .6); ctx.lineTo(r * .7, r * .3); ctx.lineTo(0, r); ctx.lineTo(-r * .7, r * .3); ctx.lineTo(-r * .85, -r * .6); }
  else if (key === 'hutan') { ctx.moveTo(0, -r); ctx.quadraticCurveTo(r, -r * .1, 0, r); ctx.quadraticCurveTo(-r, -r * .1, 0, -r); }
  else if (key === 'arcane') { ctx.moveTo(0, -r); ctx.lineTo(r * .7, 0); ctx.lineTo(0, r); ctx.lineTo(-r * .7, 0); }
  else { ctx.arc(0, 0, r * .8, 0, 7); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  if (key === 'pemburu') { ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke(); }
  if (key === 'hutan') { ctx.beginPath(); ctx.moveTo(0, -r * .6); ctx.lineTo(0, r * .8); ctx.stroke(); }
  ctx.restore();
}

/* ---------- state ---------- */
let uid = 1;
const S = { phase: 'loading', round: 1, cam: { z: 1, x: 360, y: 520 }, fx: [], coins: [] };
let best = 0; try { best = +localStorage.getItem('cozyArenaBest') || 0; } catch (e) {}
const isBossRound = () => BOSS_ROUNDS.includes(S.round);

function newGame() {
  Object.assign(S, {
    phase: 'prep', gold: 10, goldShown: 10, goldBump: 0, round: 1, lives: 5, streak: 0, units: [], shop: [], enemy: [],
    fighters: [], proj: [], fx: [], texts: [], timers: [], coins: [], toast: null, result: null, chips: [],
    battleT: 0, endT: 0, speed: 1, shake: 0, hitstop: 0, slow: 0, camT: null, cam: { z: 1, x: 360, y: 520 }, lastTraits: '',
  });
  rollShop(); genEnemy(); showBanner();
}
function showBanner() {
  const th = themeOf(S.round);
  S.banner = isBossRound() ? { title: 'BOSS!', sub: BOSS[S.round].name, t: 0, color: '#ff7ad9' } : { title: `Pusingan ${S.round}`, sub: th.name, t: 0, color: '#ffe9b0' };
  if (isBossRound()) sfx('boss');
}
const cap = () => Math.min(2 + S.round, 8);
const onBoard = () => S.units.filter(u => u.where === 'board');
function benchFree() { for (let i = 0; i < 6; i++) if (!S.units.some(u => u.where === 'bench' && u.slot === i)) return i; return -1; }
function toast(msg, t = 1.8) { S.toast = { msg, t }; }
function pickWeighted() {
  const w = POOL.map(t => { const c = HEROES[t].cost; return c <= 3 ? 1 : c === 4 ? .75 : (S.round >= 4 ? .45 : .15); });
  let x = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < POOL.length; i++) if ((x -= w[i]) <= 0) return POOL[i];
  return POOL[0];
}
function rollShop() { S.shop = Array.from({ length: 4 }, () => ({ type: pickWeighted(), sold: false })); }
function unitPos(u) { return u.where === 'board' ? cellCenter(u.c, u.r) : { x: BX + u.slot * CELL + CELL / 2, y: BENCH_Y + CELL / 2 }; }

/* sinergi */
function traitCounts(types) {
  const uniq = [...new Set(types)], cnt = {};
  for (const t of uniq) for (const tr of HEROES[t].traits) cnt[tr] = (cnt[tr] || 0) + 1;
  return cnt;
}
const traitLevel = (key, n) => n >= TRAITS[key].tiers[1] ? 2 : n >= TRAITS[key].tiers[0] ? 1 : 0;
function checkTraitsChanged() {
  const cnt = traitCounts(onBoard().map(u => u.type));
  const sig = Object.keys(TRAITS).map(k2 => traitLevel(k2, cnt[k2] || 0)).join('');
  if (S.lastTraits && sig !== S.lastTraits) {
    const up = Object.keys(TRAITS).find((k2, i) => +sig[i] > +S.lastTraits[i]);
    if (up) { sfx('trait'); toast(`${TRAITS[up].name} aktif: ${TRAITS[up].desc[traitLevel(up, cnt[up]) - 1]}`); }
  }
  S.lastTraits = sig;
}

function buy(i) {
  const c = S.shop[i]; if (!c || c.sold) return;
  const h = HEROES[c.type];
  if (S.gold < h.cost) return toast('Gold tak cukup');
  const same = S.units.filter(u => u.type === c.type && u.star === 1).length;
  const slot = benchFree();
  if (slot < 0 && same < 2) return toast('Bench penuh. Jual atau letak hero atas papan');
  S.gold -= h.cost; c.sold = true; sfx('coin');
  S.units.push({ id: uid++, type: c.type, star: 1, where: 'bench', slot });
  merge(c.type, 1);
}
function merge(type, star) {
  if (star >= 3) return;
  const g = S.units.filter(u => u.type === type && u.star === star);
  if (g.length < 3) return;
  const three = g.slice(0, 3);
  const keep = three.find(u => u.where === 'board') || three.find(u => u.slot >= 0) || three[0];
  for (const u of three) if (u !== keep) S.units.splice(S.units.indexOf(u), 1);
  keep.star++;
  if (keep.where === 'bench' && keep.slot < 0) keep.slot = benchFree();
  const p = unitPos(keep);
  if (keep.where === 'board') { burst(p.x, p.y - 40, '#ffd84a', 26); ring(p.x, p.y, '#ffd84a'); }
  else uiBurst(p.x, p.y - 30, '#ffd84a', 26);
  sfx('merge');
  toast(`${HEROES[type].name} naik ${'★'.repeat(keep.star)}!`);
  merge(type, keep.star); checkTraitsChanged();
}
function sell(u) {
  const v = HEROES[u.type].cost * [1, 3, 9][u.star - 1];
  S.gold += v; S.units.splice(S.units.indexOf(u), 1); sfx('coin');
  toast(`Jual ${HEROES[u.type].name} +${v} gold`); checkTraitsChanged();
}

function genEnemy() {
  const r = S.round, list = [];
  const boss = BOSS[r];
  const n = boss ? Math.min(r - 1, 6) : Math.min(r + 1, 8);
  for (let i = 0; i < n; i++) {
    let t = POOL[Math.random() * POOL.length | 0];
    if (i === 0 && n >= 2 && !boss) t = 'knight';
    let star = 1;
    if (Math.random() < Math.min(.12 * (r - 2), .75)) star = 2;
    if (r >= 8 && Math.random() < .15 * (r - 7)) star = 3;
    list.push({ type: t, star });
  }
  const used = new Set();
  const out = [];
  if (boss) { const c = 2, row = boss.type === 'knight' ? 2 : 1; used.add(row * 10 + c); used.add(row * 10 + c + 1); out.push({ type: boss.type, star: 2, c, r: row, boss: true }); }
  for (const e of list) {
    const melee = HEROES[e.type].range < 2, rows = melee ? [3, 2] : [0, 1];
    let c, row, tries = 0;
    do { row = rows[Math.random() * 2 | 0]; c = Math.random() * COLS | 0; } while (used.has(row * 10 + c) && ++tries < 60);
    if (used.has(row * 10 + c)) outer: for (let rr2 = 0; rr2 < 4; rr2++) for (let cc = 0; cc < COLS; cc++) if (!used.has(rr2 * 10 + cc)) { row = rr2; c = cc; break outer; }
    used.add(row * 10 + c);
    out.push({ ...e, c, r: row });
  }
  S.enemy = out;
}

/* ---------- battle ---------- */
function makeFighter(type, star, c, r, team, boss) {
  const h = HEROES[type], m = Math.pow(1.8, star - 1), p = cellCenter(c, r);
  if (boss) p.x += CELL / 2;
  const f = { id: uid++, team, type, star, h, x: p.x, y: p.y, hp: h.hp * m, maxhp: h.hp * m, atk: h.atk * m, heal: (h.heal || 0) * m,
    cd: rand(.25, .7), mana: 0, target: null, retarget: 0, face: team === 0 ? 1 : -1, atkAnim: 0, flash: 0, alive: true, shield: 0, walk: 0,
    kx: 0, ky: 0, squish: 0, windT: 0, hurtT: 0, castT: 0, asMul: 1, crit: .12, burn: null, leaped: false };
  if (boss) { const b = BOSS[S.round]; f.boss = b.name; f.hp *= b.hpMul; f.maxhp *= b.hpMul; f.atk *= b.atkMul; f.slamCd = 4.5; }
  f.shownHp = f.hp;
  return f;
}
function applyTraits(team) {
  const fs = S.fighters.filter(f => f.team === team), cnt = traitCounts(fs.map(f => f.type));
  const lv = key => traitLevel(key, cnt[key] || 0);
  for (const f of fs) {
    const m = [1, 1.2, 1.45][lv('berani')]; f.hp *= m; f.maxhp *= m; f.shownHp = f.hp;
    f.asMul = [1, 1.15, 1.35][lv('hutan')];
    f.mana = [0, 35, 70][lv('arcane')];
    f.crit = .12 + [0, .12, .25][lv('pemburu')];
  }
}
function startBattle() {
  if (!onBoard().length) return toast('Letak sekurang-kurangnya 1 hero atas papan');
  S.fighters = [...onBoard().map(u => makeFighter(u.type, u.star, u.c, u.r, 0)), ...S.enemy.map(e => makeFighter(e.type, e.star, e.c, e.r, 1, e.boss))];
  applyTraits(0); applyTraits(1);
  S.proj = []; S.timers = []; S.battleT = 0; S.endT = 0; S.phase = 'battle'; S.banner = null;
  sfx('start');
  addText(360, BY + 4 * CELL, 'LAWAN!', '#ffd84a', 84, 1.1, true);
}
function later(t, fn) { S.timers.push({ t, fn }); }
function nearest(f, team) {
  let b = null, bd = 1e9;
  for (const o of S.fighters) if (o.alive && o.team === team) { const d = dist(o, f); if (d < bd) { bd = d; b = o; } }
  return b;
}
const reach = (f, t) => f.h.range * CELL + (t.boss ? 40 : 0) + (f.boss ? 40 : 0);
function updateFighter(f, dt) {
  f.atkAnim = Math.max(0, f.atkAnim - dt); f.flash = Math.max(0, f.flash - dt); f.shield = Math.max(0, f.shield - dt);
  f.squish = Math.max(0, f.squish - dt * 4);
  f.windT = Math.max(0, f.windT - dt); f.hurtT = Math.max(0, f.hurtT - dt); f.castT = Math.max(0, f.castT - dt);
  f.cd -= dt; f.retarget -= dt;
  if (f.kx || f.ky) { f.x += f.kx * dt; f.y += f.ky * dt; const d = Math.max(0, 1 - dt * 9); f.kx *= d; f.ky *= d; if (Math.abs(f.kx) + Math.abs(f.ky) < 5) f.kx = f.ky = 0; }
  if (f.burn) {
    f.burn.t -= dt; f.burn.tick -= dt;
    if (f.burn.tick <= 0) { f.burn.tick = .5; dot(f, f.burn.dmg); }
    if (f.burn && f.burn.t <= 0) f.burn = null;
    if (!f.alive) return;
  }
  if (f.h.leap && !f.leaped && S.battleT > .35) {
    f.leaped = true;
    let far = null, fd = -1;
    for (const o of S.fighters) if (o.alive && o.team !== f.team) { const d = dist(o, f); if (d > fd) { fd = d; far = o; } }
    if (far) {
      smoke(f.x, f.y); f.x = far.x + rand(-20, 20); f.y = far.y + (f.team === 0 ? -55 : 55); smoke(f.x, f.y);
      f.target = far; f.retarget = 2; f.face = far.x >= f.x ? 1 : -1; sfx('slash');
    }
  }
  if (f.boss) {
    f.slamCd -= dt;
    if (f.slamCd <= 0) { f.slamCd = 6; bossSkill(f); }
  }
  let tgt = null, healing = false;
  if (f.type === 'healer') {
    let lp = .85;
    for (const o of S.fighters) if (o.alive && o.team === f.team && o.hp / o.maxhp < lp) { lp = o.hp / o.maxhp; tgt = o; }
    healing = !!tgt;
  }
  if (!tgt) {
    if (!f.target || !f.target.alive || f.retarget <= 0) { f.target = nearest(f, 1 - f.team); f.retarget = .6; }
    tgt = f.target;
  }
  if (!tgt) { f.walk = 0; return; }
  const dx = tgt.x - f.x, dy = tgt.y - f.y, d = Math.hypot(dx, dy);
  if (Math.abs(dx) > 6) f.face = dx > 0 ? 1 : -1;
  // which way the hero looks: back (away from camera), side, or front (default)
  const adx = Math.abs(dx), ady = Math.abs(dy);
  if (ady > adx * 1.15) f.dir = dy < 0 ? 'back' : '';
  else if (adx > ady * 1.6) f.dir = 'side';
  if (d <= reach(f, tgt)) {
    f.walk = 0;
    if (f.cd <= 0) {
      f.cd = f.h.as / f.asMul;
      if (f.mana >= 100) { f.mana = 0; cast(f, tgt, healing); } else attack(f, tgt, healing);
    }
  } else {
    const sp = f.h.speed * (f.boss ? .8 : 1) * dt; f.x += dx / d * sp; f.y += dy / d * sp; f.walk += dt;
  }
}
function bossSkill(f) {
  if (f.type === 'mage') {
    addText(f.x, f.y - 190, 'Hujan Meteor!', '#ff9cf0', 38, 1.4);
    sfx('ult'); S.camT = { x: f.x, y: f.y - 40, z: 1.06, t: .6 }; S.slow = .4;
    const foes = S.fighters.filter(o => o.alive && o.team !== f.team).sort(() => Math.random() - .5).slice(0, 3);
    foes.forEach((o, i) => later(.2 + i * .25, () => { if (!f.alive) return; warnZone(o.x, o.y, 1.1 * CELL, .5); later(.15, () => meteor(f, o, 1.1 * CELL, f.atk * 1.4)); }));
  } else {
    const R = 1.9 * CELL;
    addText(f.x, f.y - 190, 'Hentakan Bumi!', '#ff9cf0', 38, 1.4);
    warnZone(f.x, f.y, R, .85); sfx('warn');
    later(.85, () => {
      if (!f.alive) return;
      f.atkAnim = .5; sfx('boom'); S.shake = .45; S.hitstop = .08;
      S.fx.push({ type: 'boom', x: f.x, y: f.y, life: .5, max: .5, color: '#c46bff', r: R });
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; S.fx.push({ type: 'p', x: f.x + Math.cos(a) * R * .8, y: f.y + Math.sin(a) * R * .5, z: 0, vx: Math.cos(a) * 80, vy: 0, vz: rand(150, 350), life: .7, max: .7, color: '#8a6a50', size: rand(5, 9), g: 900 }); }
      for (const o of S.fighters) if (o.alive && o.team !== f.team && dist(o, f) <= R) hit(f, o, f.atk * 1.8, true);
    });
  }
}
function meteor(f, tt, r, amt) {
  S.proj.push({ kind: 'meteor', x: tt.x + 110, y: tt.y, z: 620, t: tt, tx: tt.x, ty: tt.y, tz: 10, d0: 0, vx: 0, vy: 0, vz: -1,
    onHit: () => { sfx('boom'); splash(f, tt, r, amt, true); S.shake = .4; S.hitstop = .09; scorch(tt.x, tt.y); } });
}
function attack(f, t, healing) {
  f.mana = Math.min(100, f.mana + (f.type === 'healer' ? 28 : 20));
  f.windT = .12;
  later(.12, () => { if (!f.alive) return; f.atkAnim = .32; strike(f, t, healing); });
}
function strike(f, t, healing) {
  if (healing) { sfx('spark'); return shoot(f, t, 'leaf', () => healUnit(t, f.heal)); }
  switch (f.h.proj) {
    case 'arrow': sfx('arrow'); shoot(f, t, 'arrow', () => hit(f, t, f.atk)); break;
    case 'orb': sfx('orb'); shoot(f, t, 'orb', () => { sfx('pop'); splash(f, t, 1.1 * CELL, f.atk); }); break;
    case 'spark': sfx('spark'); shoot(f, t, 'spark', () => hit(f, t, f.atk)); break;
    case 'fire': sfx('fire'); shoot(f, t, 'fire', () => { hit(f, t, f.atk); burn(t, f.atk * .14); }); break;
    case 'cannon': sfx('cannon'); shoot(f, t, 'cannon', () => { sfx('pop'); splash(f, t, .8 * CELL, f.atk, false, '#ffb35c'); }); break;
    default: later(.14, () => { if (f.alive && t.alive) { sfx('slash'); hit(f, t, f.atk); slash(t, f.face); } });
  }
}
function cast(f, t, healing) {
  f.atkAnim = .55; f.castT = .7;
  addText(f.x, f.y - 130, f.h.ult, '#9fe8ff', 34, 1.3);
  ring(f.x, f.y, '#9fe8ff'); sfx('ult');
  S.slow = .55; S.camT = { x: f.x, y: f.y - 40, z: 1.08, t: .7 };
  S.fx.push({ type: 'aura', f, life: .7, max: .7 });
  const foes = () => S.fighters.filter(o => o.alive && o.team !== f.team);
  switch (f.type) {
    case 'archer':
      foes().sort((a, b) => dist(a, f) - dist(b, f)).slice(0, 3)
        .forEach((o, i) => later(.15 + i * .09, () => { if (!f.alive) return; sfx('arrow'); shoot(f, o, 'arrowGold', () => hit(f, o, f.atk * 1.6, true)); }));
      break;
    case 'mage': { const tt = healing ? nearest(f, 1 - f.team) : t; if (tt) meteor(f, tt, 1.7 * CELL, f.atk * 2.2); break; }
    case 'knight':
      f.shield = 4; ring(f.x, f.y, '#ffd166');
      later(.12, () => {
        if (!f.alive) return; sfx('slash'); S.shake = .2;
        for (const o of foes()) if (dist(o, f) < 1.6 * CELL) { hit(f, o, f.atk * 1.4, true); slash(o, o.x > f.x ? 1 : -1); }
      });
      break;
    case 'healer':
      sfx('heal');
      for (const o of S.fighters) if (o.alive && o.team === f.team) { healUnit(o, f.heal * 1.3); ring(o.x, o.y, '#8ef08a'); leaves(o.x, o.y); }
      break;
    case 'assassin':
      [0, .12, .24].forEach(d => later(d, () => { if (f.alive && t.alive) { sfx('slash'); hit(f, t, f.atk * 1.3, d === .24); slash(t, f.face); } }));
      break;
    case 'bear':
      sfx('roar'); S.shake = .25; healUnit(f, f.maxhp * .25);
      S.fx.push({ type: 'ring', x: f.x, y: f.y, life: .7, max: .7, color: '#ff9a3c', r: 2.2 * CELL });
      for (const o of foes()) if (dist(o, f) < 2.2 * CELL) { o.target = f; o.retarget = 3; addText(o.x, o.y - 120, '!', '#ff9a3c', 34, .8); }
      break;
    case 'pyro':
      foes().sort(() => Math.random() - .5).slice(0, 4)
        .forEach((o, i) => later(.1 + i * .1, () => { if (!f.alive) return; sfx('fire'); shoot(f, o, 'fire', () => { splash(f, o, .9 * CELL, f.atk * 1.4, false, '#ff7a2e'); burn(o, f.atk * .2); }); }));
      break;
    case 'gunner':
      sfx('cannon'); shoot(f, t, 'cannonBig', () => { sfx('boom'); S.shake = .3; splash(f, t, 1.4 * CELL, f.atk * 2.4, true, '#ffb35c'); });
      break;
  }
}
function shoot(f, t, kind, onHit) {
  const p = { kind, x: f.x + f.face * 26, y: f.y, z: 55, t, tx: t.x, ty: t.y, tz: 42, onHit, vx: f.face, vy: 0, vz: 0 };
  p.d0 = Math.hypot(p.tx - p.x, p.ty - p.y) || 1;
  S.proj.push(p);
}
function hit(src, t, amt, heavy) {
  if (!t.alive) return;
  const armor = Math.min(.85, t.h.armor + (t.shield > 0 ? .5 : 0));
  const crit = Math.random() < (src.crit || .12);
  const dmg = Math.max(1, Math.round(amt * (1 - armor) * rand(.9, 1.1) * (crit ? 1.6 : 1)));
  t.hp -= dmg; t.flash = .14; t.squish = 1;
  if (!t.boss && (crit || heavy || dmg > t.maxhp * .07)) t.hurtT = .3; t.mana = Math.min(100, t.mana + dmg / t.maxhp * (t.boss ? 20 : 50));
  addText(t.x + rand(-14, 14), t.y - (t.boss ? 170 : 100), crit ? dmg + '!' : '' + dmg, crit ? '#ffd23e' : '#ffffff', crit ? 46 : 32, .9, crit);
  sparks(t.x, t.y - 45, src.team === 0 ? '#ffe9a8' : '#ff8a6b', crit ? 16 : 8);
  if (crit) { sfx('crit'); S.hitstop = Math.max(S.hitstop, .07); S.shake = Math.max(S.shake, .14); }
  else sfx('hit');
  if ((crit || heavy) && !t.boss) {
    const dx = t.x - src.x, dy = t.y - src.y, d = Math.hypot(dx, dy) || 1, kb = heavy ? 300 : 220;
    t.kx += dx / d * kb; t.ky += dy / d * kb;
  }
  if (t.hp <= 0) kill(t);
}
function kill(t) {
  t.hp = 0; t.alive = false; shatter(t); sfx('die'); S.hitstop = Math.max(S.hitstop, t.boss ? .2 : .06);
  if (t.boss) { S.shake = .6; S.slow = .9; S.camT = { x: t.x, y: t.y - 40, z: 1.12, t: 1 }; burst(t.x, t.y - 60, '#ff9cf0', 50); }
}
function dot(t, amt) {
  if (!t.alive) return;
  const dmg = Math.max(1, Math.round(amt)); t.hp -= dmg;
  addText(t.x + rand(-18, 18), t.y - (t.boss ? 160 : 90), '' + dmg, '#ff9a3c', 24, .7);
  for (let i = 0; i < 4; i++) S.fx.push({ type: 'p', x: t.x + rand(-20, 20), y: t.y, z: rand(10, 70), vx: 0, vy: 0, vz: rand(60, 140), life: .5, max: .5, color: '#ff8a2e', size: rand(3, 6), glow: true });
  if (t.hp <= 0) kill(t);
}
function burn(t, dmg) { if (t.alive) t.burn = { t: 3, tick: .5, dmg }; }
function healUnit(t, amt) {
  if (!t.alive) return;
  const a = Math.round(Math.min(amt, t.maxhp - t.hp)); t.hp += a;
  if (a > 0) { addText(t.x + rand(-10, 10), t.y - 100, '+' + a, '#7dff8a', 30); sfx('heal'); }
  sparks(t.x, t.y - 45, '#8ef08a', 8);
}
function splash(src, t, r, amt, heavy, color) {
  const cx = t.x, cy = t.y;
  boom(cx, cy, r, color || (heavy ? '#c9a2ff' : '#7fdcff'));
  for (const o of S.fighters) if (o.alive && o.team !== src.team && Math.hypot(o.x - cx, o.y - cy) <= r + (o.boss ? 40 : 0)) hit(src, o, o === t ? amt : amt * .6, heavy);
}
const radius = f => f.boss ? 58 : 31;
function updateBattle(dt) {
  S.battleT += dt;
  for (const f of S.fighters) {
    if (f.alive) updateFighter(f, dt);
    f.shownHp += (f.hp - f.shownHp) * Math.min(1, dt * 4);
  }
  const al = S.fighters.filter(f => f.alive);
  for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) {
    const a = al[i], b = al[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01, m = radius(a) + radius(b);
    if (d < m) {
      const p = (m - d), nx = dx / d, ny = dy / d, wa = a.boss ? .1 : b.boss ? .9 : .5;
      a.x -= nx * p * wa; a.y -= ny * p * wa; b.x += nx * p * (1 - wa); b.y += ny * p * (1 - wa);
    }
  }
  for (const f of al) { f.x = Math.max(BX + 30, Math.min(BX + COLS * CELL - 30, f.x)); f.y = Math.max(BY + 40, Math.min(BY + ROWS * CELL - 30, f.y)); }
  for (const p of S.proj) {
    if (p.t.alive) { p.tx = p.t.x; p.ty = p.t.y; }
    const sp = PSPEED[p.kind] * dt, dx = p.tx - p.x, dy = p.ty - p.y, dz = p.tz - p.z, d = Math.hypot(dx, dy, dz);
    if (d <= sp) { p.done = true; p.onHit(); continue; }
    p.vx = dx / d; p.vy = dy / d; p.vz = dz / d; p.x += p.vx * sp; p.y += p.vy * sp; p.z += p.vz * sp;
    if (p.kind !== 'arrow' && p.kind !== 'spark')
      S.fx.push({ type: 'p', x: p.x + rand(-4, 4), y: p.y, z: p.z + arcZ(p) + rand(-4, 4), vx: 0, vy: 0, vz: 0, life: .4, max: .4,
        color: { leaf: '#9df59a', arrowGold: '#ffe28a', meteor: '#c9a2ff', fire: '#ff7a2e', cannon: '#9a9a9a', cannonBig: '#ffb35c' }[p.kind] || '#8fe3ff',
        size: p.kind === 'meteor' ? 16 : p.kind.startsWith('cannon') ? 6 : 8, glow: !p.kind.startsWith('cannon') });
  }
  S.proj = S.proj.filter(p => !p.done);
  const a = S.fighters.some(f => f.alive && f.team === 0), b = S.fighters.some(f => f.alive && f.team === 1);
  if (!a || !b || S.battleT > 75) {
    S.endT += dt;
    if (S.endT > 1.4 || S.battleT > 75) {
      let win = a && !b;
      if (a && b) { const hp = t => S.fighters.filter(f => f.team === t).reduce((s, f) => s + f.hp / f.maxhp * (f.boss ? 4 : 1), 0); win = hp(0) >= hp(1); }
      endBattle(win);
    }
  }
}
function arcZ(p) {
  if (!['arrow', 'arrowGold', 'leaf', 'cannon', 'cannonBig'].includes(p.kind)) return 0;
  const left = Math.hypot(p.tx - p.x, p.ty - p.y), q = Math.max(0, Math.min(1, 1 - left / p.d0));
  return Math.sin(q * Math.PI) * Math.min(p.kind.startsWith('cannon') ? 140 : 60, p.d0 * (p.kind.startsWith('cannon') ? .35 : .14));
}
function endBattle(win) {
  const boss = isBossRound();
  const income = 5 + (win ? 2 : 0) + (win && boss ? 5 : 0) + Math.min(Math.floor(S.gold / 10), 3);
  if (!win) S.lives--;
  S.streak = win ? S.streak + 1 : 0;
  const mine = S.fighters.filter(f => f.team === 0), alive = mine.filter(f => f.alive).length / Math.max(1, mine.length);
  const stars = win ? (alive >= .99 ? 3 : alive >= .5 ? 2 : 1) : 0;
  S.result = { win, income, t: 0, stars, starSfx: 0, boss, aliveFoes: S.fighters.filter(f => f.alive && f.team === 1).length };
  sfx(win ? 'win' : 'lose');
  if (S.lives <= 0) { S.phase = 'over'; saveBest(S.round - 1); }
  else if (win && S.round >= MAX_ROUND) { S.phase = 'victory'; saveBest(MAX_ROUND); }
  else S.phase = 'result';
}
function saveBest(r) { if (r > best) { best = r; try { localStorage.setItem('cozyArenaBest', r); } catch (e) {} } }
function nextRound() {
  const inc = S.result.income;
  for (let i = 0; i < Math.min(inc, 12); i++) S.coins.push({ t: -i * .06, x0: 360 + rand(-80, 80), y0: 560 + rand(-30, 30), val: i === Math.min(inc, 12) - 1 ? inc - (Math.min(inc, 12) - 1) : 1 });
  S.round++; S.fighters = []; S.proj = []; S.fx = []; S.texts = [];
  rollShop(); genEnemy(); S.phase = 'prep'; S.result = null;
  showBanner();
  if (!isBossRound()) later(1.6, () => toast(`Pasukan boleh ada ${cap()} hero sekarang`));
}

/* ---------- effects ---------- */
function addText(x, y, s, color, size, life = .9, big = false) { S.texts.push({ x, y, s, color, size, t: 0, life, big }); }
function sparks(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(80, 260); S.fx.push({ type: 'p', x, y: y + 45, z: 45, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .4, vz: rand(40, 260), life: rand(.25, .5), max: .5, color, size: rand(3, 6), g: 700 }); } }
function burst(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(120, 380); S.fx.push({ type: 'p', x, y: y + 40, z: 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .5, vz: rand(100, 420), life: rand(.5, .9), max: .9, color, size: rand(4, 9), g: 800 }); } }
function uiBurst(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(120, 380); S.fx.push({ type: 'p', ui: true, x, y, z: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, vz: 0, life: rand(.5, .9), max: .9, color, size: rand(4, 9), gy: 600 }); } }
function leaves(x, y) { for (let i = 0; i < 6; i++) S.fx.push({ type: 'p', x: x + rand(-30, 30), y, z: rand(0, 20), vx: rand(-20, 20), vy: 0, vz: rand(90, 180), life: .9, max: .9, color: '#8ef08a', size: rand(4, 7), glow: true }); }
function smoke(x, y) { for (let i = 0; i < 14; i++) S.fx.push({ type: 'p', x: x + rand(-25, 25), y: y + rand(-10, 10), z: rand(0, 80), vx: rand(-60, 60), vy: rand(-20, 20), vz: rand(20, 90), life: rand(.4, .7), max: .7, color: '#3a2f4a', size: rand(10, 18) }); }
function ring(x, y, color) { S.fx.push({ type: 'ring', x, y, life: .55, max: .55, color, r: 70 }); }
function warnZone(x, y, r, life) { S.fx.push({ type: 'warn', x, y, r, life, max: life }); }
function boom(x, y, r, color) { S.fx.push({ type: 'boom', x, y, life: .45, max: .45, color, r }); sparks(x, y - 20, color, 18); }
function scorch(x, y) { S.fx.push({ type: 'scorch', x, y, life: 3, max: 3 }); }
function slash(t, dir) { S.fx.push({ type: 'slash', x: t.x, y: t.y, life: .22, max: .22, dir }); }
function shatter(f) {
  const img = IMG[f.type].idle, n = f.boss ? 4 : 3, off = IMG[f.type].big ? 96 : 0, sw = (img.width - 2 * off) / n, sh = sw, sz = CELL * 1.42 * (1 + .1 * (f.star - 1)) * (f.boss ? 1.75 : 1);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    S.fx.push({ type: 'shard', img: f.boss ? spriteImg(f.type, 'idle', 'D').img : img, sx: off + i * sw, sy: off + j * sh, sw, sh, size: sz / n, face: f.face,
      x: f.x + (i - (n - 1) / 2) * sz / n * f.face, y: f.y, z: sz * .96 - (j + .5) * sz / n - CELL * .34 + 34,
      vx: (i - (n - 1) / 2) * rand(90, 220) * f.face + rand(-40, 40), vy: rand(-40, 40), vz: rand(150, 380) - (j - 1) * 60,
      r: 0, vr: rand(-7, 7), life: rand(.8, 1.1), max: 1.1, g: 1100 });
  }
  S.fx.push({ type: 'ring', x: f.x, y: f.y, life: .5, max: .5, color: f.team === 0 ? '#9be7b0' : '#ff9b85', r: f.boss ? 160 : 80 });
  sparks(f.x, f.y - 40, '#ffffff', 14);
}
function updateFx(dt) {
  for (const p of S.fx) {
    p.life -= dt;
    if (p.type === 'p' || p.type === 'shard') {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.ui) { p.vy += (p.gy || 0) * dt; }
      else { p.vz -= (p.g || 0) * dt; p.z += p.vz * dt; if (p.z < 0 && p.g) { p.z = 0; p.vz *= -.35; p.vx *= .6; p.vy *= .6; if (p.vr) p.vr *= .5; } }
      if (p.vr) p.r += p.vr * dt;
    }
  }
  S.fx = S.fx.filter(p => p.life > 0);
  for (const t of S.texts) t.t += dt;
  S.texts = S.texts.filter(t => t.t < t.life);
  for (const tm of S.timers) { tm.t -= dt; if (tm.t <= 0) { tm.done = true; tm.fn(); } }
  S.timers = S.timers.filter(t => !t.done);
}

/* ---------- scenery ---------- */
function pine(x, y, s, col, snow) {
  ctx.fillStyle = '#2a1a10'; ctx.fillRect(x - 5 * s, y - 18 * s, 10 * s, 20 * s);
  [[0, 70, 46], [28, 56, 40], [52, 40, 36]].forEach(([dy, w, h]) => {
    ctx.beginPath(); ctx.moveTo(x - w / 2 * s, y - (14 + dy) * s); ctx.lineTo(x + w / 2 * s, y - (14 + dy) * s); ctx.lineTo(x, y - (14 + dy + h) * s); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    if (snow) { ctx.beginPath(); ctx.moveTo(x - w * .22 * s, y - (14 + dy + h * .55) * s); ctx.lineTo(x + w * .22 * s, y - (14 + dy + h * .55) * s); ctx.lineTo(x, y - (14 + dy + h) * s); ctx.closePath(); ctx.fillStyle = '#eef6ff'; ctx.fill(); }
  });
}
function cactus(x, y, s) {
  ctx.fillStyle = '#4f8a46'; ctx.strokeStyle = '#2b4a26'; ctx.lineWidth = 2;
  rr(x - 9 * s, y - 80 * s, 18 * s, 80 * s, 9 * s); ctx.fill(); ctx.stroke();
  rr(x - 30 * s, y - 58 * s, 12 * s, 30 * s, 6 * s); ctx.fill(); ctx.stroke(); ctx.fillRect(x - 24 * s, y - 34 * s, 16 * s, 9 * s);
  rr(x + 18 * s, y - 70 * s, 12 * s, 34 * s, 6 * s); ctx.fill(); ctx.stroke(); ctx.fillRect(x + 8 * s, y - 42 * s, 14 * s, 9 * s);
}
function crag(x, y, s, t, i) {
  ctx.beginPath(); ctx.moveTo(x - 40 * s, y); ctx.lineTo(x - 24 * s, y - 60 * s); ctx.lineTo(x - 6 * s, y - 38 * s); ctx.lineTo(x + 8 * s, y - 92 * s); ctx.lineTo(x + 30 * s, y - 44 * s); ctx.lineTo(x + 42 * s, y);
  ctx.closePath(); ctx.fillStyle = '#2a1714'; ctx.fill();
  ctx.strokeStyle = `rgba(255,${90 + 40 * Math.sin(t * 3 + i)},40,.85)`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 8 * s, y - 80 * s); ctx.lineTo(x + 2 * s, y - 50 * s); ctx.lineTo(x + 12 * s, y - 24 * s); ctx.stroke();
}
const SIDE = [[38, 250, .9], [20, 360, .7], [62, 318, .55], [26, 470, .62], [70, 205, .5]];
function drawBackground(t) {
  const th = themeOf(S.round || 1), g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.sky[0]); g.addColorStop(.5, th.sky[1]); g.addColorStop(1, th.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  const d = th.decor, bgImg = ARENA[d];
  if (bgImg) { ctx.drawImage(bgImg, 0, 0, W, H); drawAmbient(t, d); return; }
  if (d === 'desert') {
    const sg = ctx.createRadialGradient(560, 140, 10, 560, 140, 180); sg.addColorStop(0, 'rgba(255,214,140,.7)'); sg.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = sg; ctx.fillRect(360, 0, 400, 340); ctx.fillStyle = '#ffd88a'; ctx.beginPath(); ctx.arc(560, 140, 34, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a4a2c'; ctx.beginPath(); ctx.ellipse(160, 215, 300, 70, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#8a5632'; ctx.beginPath(); ctx.ellipse(560, 225, 320, 60, 0, Math.PI, 0); ctx.fill();
  }
  if (d === 'volcano') {
    ctx.fillStyle = '#1e0b0c'; ctx.beginPath(); ctx.moveTo(140, 230); ctx.lineTo(310, 95); ctx.lineTo(410, 95); ctx.lineTo(580, 230); ctx.closePath(); ctx.fill();
    const lg = ctx.createRadialGradient(360, 95, 5, 360, 95, 120); lg.addColorStop(0, `rgba(255,120,40,${.6 + .2 * Math.sin(t * 2)})`); lg.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = lg; ctx.fillRect(220, 0, 280, 220);
  }
  if (d === 'forest' || d === 'snow') for (let i = 0; i < 13; i++) pine(i * 60 + hash(i) * 25, 186, .55 + hash(i + 9) * .25, d === 'snow' ? '#2c4a52' : '#173126', d === 'snow');
  if (d === 'desert') for (let i = 0; i < 6; i++) { ctx.fillStyle = '#6a4024'; ctx.beginPath(); ctx.ellipse(i * 140 + 40, 190, 40, 14, 0, Math.PI, 0); ctx.fill(); }
  SIDE.forEach(([x, y, s], i) => [x, W - x - 6 * hash(i)].forEach((xx, j) => {
    const yy = y + j * 18 * hash(i + 3);
    if (d === 'forest') pine(xx, yy, s, j ? '#1f4430' : '#244b33', false);
    else if (d === 'snow') pine(xx, yy, s, '#2f5560', true);
    else if (d === 'desert') (i + j) % 2 ? cactus(xx, yy, s) : (ctx.fillStyle = '#7a5434', ctx.beginPath(), ctx.ellipse(xx, yy - 10 * s, 34 * s, 22 * s, 0, 0, 7), ctx.fill());
    else crag(xx, yy, s, t, i + j);
  }));
  // kabus
  if (d === 'forest' || d === 'snow') for (let i = 0; i < 3; i++) {
    const x = ((t * (12 + i * 6) + i * 260) % (W + 600)) - 300;
    ctx.fillStyle = `rgba(255,255,255,${d === 'snow' ? .06 : .04})`; ctx.beginPath(); ctx.ellipse(x, 300 + i * 260, 300, 46, 0, 0, 7); ctx.fill();
  }
  drawAmbient(t, d);
}
function drawAmbient(t, d) {
  for (let i = 0; i < 26; i++) {
    const h1 = hash(i), h2 = hash(i + 50);
    if (d === 'forest') { const x = (i * 137 + Math.sin(t * .4 + i) * 30) % W, y = (i * 263 % H) + Math.cos(t * .5 + i * 2) * 20; ctx.globalAlpha = .25 + .25 * Math.sin(t * 2 + i); ctx.fillStyle = '#f9e27a'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill(); }
    else if (d === 'snow') { const y = (h1 * H + t * (30 + h2 * 40)) % H, x = (h2 * W + Math.sin(t + i) * 20) % W; ctx.globalAlpha = .7; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 1.5 + h1 * 2.5, 0, 7); ctx.fill(); }
    else if (d === 'desert') { const x = (h1 * W + t * (40 + h2 * 50)) % W, y = h2 * H; ctx.globalAlpha = .35; ctx.fillStyle = '#ffd7a0'; ctx.beginPath(); ctx.arc(x, y, 1.5 + h1 * 1.5, 0, 7); ctx.fill(); }
    else { const y = H - ((h1 * H + t * (40 + h2 * 50)) % H), x = (h2 * W + Math.sin(t * 2 + i) * 15) % W; ctx.globalAlpha = .5 + .4 * Math.sin(t * 5 + i); ctx.fillStyle = i % 3 ? '#ff8a3c' : '#ffd060'; ctx.beginPath(); ctx.arc(x, y, 1.6 + h1 * 2, 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  const v = ctx.createRadialGradient(360, 520, 160, 360, 520, 700);
  v.addColorStop(0, d === 'volcano' ? 'rgba(255,120,60,.08)' : 'rgba(255,214,140,.08)'); v.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}
function drawBoard(t, dragging) {
  const th = themeOf(S.round || 1);
  if (ARENA[th.decor]) return drawGridOverlay(t, dragging);
  const L = BX, R = BX + COLS * CELL, T = BY, B = BY + ROWS * CELL;
  const tl = proj(L, T), tr = proj(R, T), bl = proj(L, B), br = proj(R, B);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(PX0, PY1 + THICK + 14, WBOT * .56, 34, 0, 0, 7); ctx.fill();
  const pad = 16, ftl = { x: tl.x - pad * .85, y: tl.y - pad }, ftr = { x: tr.x + pad * .85, y: tr.y - pad }, fbl = { x: bl.x - pad * 1.15, y: bl.y + pad * .6 }, fbr = { x: br.x + pad * 1.15, y: br.y + pad * .6 };
  quad(fbl, fbr, { x: fbr.x, y: fbr.y + THICK }, { x: fbl.x, y: fbl.y + THICK });
  const fg = ctx.createLinearGradient(0, fbl.y, 0, fbl.y + THICK); fg.addColorStop(0, '#5b3920'); fg.addColorStop(1, '#2f1c0f');
  ctx.fillStyle = fg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1e1209'; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) { const x = fbl.x + (fbr.x - fbl.x) * i / 6; ctx.beginPath(); ctx.moveTo(x, fbl.y + 4); ctx.lineTo(x, fbl.y + THICK - 4); ctx.stroke(); }
  quad(ftl, ftr, fbr, fbl);
  const wg = ctx.createLinearGradient(0, ftl.y, 0, fbl.y); wg.addColorStop(0, '#6e4a2c'); wg.addColorStop(1, '#8a5e36');
  ctx.fillStyle = wg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1e1209'; ctx.stroke();
  if (th.decor === 'snow') { ctx.strokeStyle = 'rgba(240,248,255,.85)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ftl.x + 4, ftl.y + 2); ctx.lineTo(ftr.x - 4, ftr.y + 2); ctx.stroke(); }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x0 = BX + c * CELL, y0 = BY + r * CELL, m = 3;
    const a = proj(x0 + m, y0 + m), b = proj(x0 + CELL - m, y0 + m), cc = proj(x0 + CELL - m, y0 + CELL - m), d = proj(x0 + m, y0 + CELL - m);
    const odd = (r + c) % 2, mine = r >= 4, pal = mine ? th.ally : th.enemy;
    quad(d, cc, { x: cc.x, y: cc.y + 6 * cc.s }, { x: d.x, y: d.y + 6 * d.s });
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
    quad(a, b, cc, d);
    const tg = ctx.createLinearGradient(0, a.y, 0, d.y);
    tg.addColorStop(0, pal[odd ? 1 : 0]); tg.addColorStop(1, pal[odd ? 3 : 2]);
    ctx.fillStyle = tg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a.x, a.y + 1); ctx.lineTo(b.x, b.y + 1); ctx.stroke();
    const seed = (r * 7 + c * 13) % 5;
    if (mine && seed < 2) { const p = proj(x0 + 30 + seed * 30, y0 + 70); ctx.strokeStyle = 'rgba(30,60,25,.55)'; ctx.lineWidth = 2; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(p.x + i * 4, p.y); ctx.lineTo(p.x + i * 7, p.y - 9 * p.s); ctx.stroke(); } }
    if (!mine && seed === 1) { const p = proj(x0 + 66, y0 + 30); ctx.fillStyle = 'rgba(40,30,20,.25)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 9 * p.s, 5 * p.s, 0, 0, 7); ctx.fill(); }
    if (!mine && th.decor === 'volcano' && seed === 3) { const p = proj(x0 + 40, y0 + 55); ctx.strokeStyle = `rgba(255,${100 + 50 * Math.sin(t * 3 + r + c)},40,.7)`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(p.x - 14 * p.s, p.y - 4); ctx.lineTo(p.x, p.y + 3); ctx.lineTo(p.x + 16 * p.s, p.y - 2); ctx.stroke(); }
    if (dragging && mine) {
      const occ = S.units.some(u => u.where === 'board' && u.c === c && u.r === r && u !== dragging.u);
      const hov = dragging.hc === c && dragging.hr === r;
      quad(a, b, cc, d);
      if (hov) { ctx.fillStyle = occ ? 'rgba(255,214,102,.35)' : 'rgba(255,255,255,.3)'; ctx.fill(); }
      ctx.strokeStyle = occ ? 'rgba(255,220,120,.6)' : 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  const ml = proj(L, BY + 4 * CELL), mr = proj(R, BY + 4 * CELL);
  ctx.save(); ctx.shadowColor = '#ffd678'; ctx.shadowBlur = 14;
  ctx.strokeStyle = `rgba(255,214,120,${.45 + .2 * Math.sin(t * 2)})`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ml.x, ml.y); ctx.lineTo(mr.x, mr.y); ctx.stroke(); ctx.restore();
  [[ftl.x - 6, ftl.y], [ftr.x + 6, ftr.y]].forEach(([x, y], i) => torch(x, y, t + i * 1.7, .8));
  [[fbl.x - 8, fbl.y], [fbr.x + 8, fbr.y]].forEach(([x, y], i) => torch(x, y, t + i * 2.3, 1));
}
function drawGridOverlay(t, dragging) {
  const L = BX, R = BX + COLS * CELL;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x0 = BX + c * CELL, y0 = BY + r * CELL, m = 4, mine = r >= 4;
    const a = proj(x0 + m, y0 + m), b = proj(x0 + CELL - m, y0 + m), cc = proj(x0 + CELL - m, y0 + CELL - m), d = proj(x0 + m, y0 + CELL - m);
    quad(a, b, cc, d);
    ctx.fillStyle = mine ? ((r + c) % 2 ? 'rgba(120,255,170,.10)' : 'rgba(120,255,170,.16)') : ((r + c) % 2 ? 'rgba(255,110,90,.06)' : 'rgba(255,110,90,.11)');
    ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = mine ? 'rgba(220,255,230,.38)' : 'rgba(255,230,220,.22)'; ctx.stroke();
    if (dragging && mine) {
      const occ = S.units.some(u => u.where === 'board' && u.c === c && u.r === r && u !== dragging.u);
      const hov = dragging.hc === c && dragging.hr === r;
      quad(a, b, cc, d);
      if (hov) { ctx.fillStyle = occ ? 'rgba(255,214,102,.4)' : 'rgba(255,255,255,.35)'; ctx.fill(); }
      ctx.strokeStyle = occ ? 'rgba(255,220,120,.8)' : 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  const ml = proj(L, BY + 4 * CELL), mr = proj(R, BY + 4 * CELL);
  ctx.save(); ctx.shadowColor = '#ffd678'; ctx.shadowBlur = 14;
  ctx.strokeStyle = `rgba(255,214,120,${.5 + .2 * Math.sin(t * 2)})`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ml.x, ml.y); ctx.lineTo(mr.x, mr.y); ctx.stroke(); ctx.restore();
}
function torch(x, y, t, s) {
  ctx.fillStyle = '#3a2414'; ctx.fillRect(x - 4 * s, y - 34 * s, 8 * s, 40 * s);
  ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x - 7 * s, y - 38 * s, 14 * s, 6 * s);
  const fl = 1 + .12 * Math.sin(t * 13) + .08 * Math.sin(t * 7.3);
  const g = ctx.createRadialGradient(x, y - 48 * s, 2, x, y - 48 * s, 60 * s * fl);
  g.addColorStop(0, 'rgba(255,210,120,.55)'); g.addColorStop(1, 'rgba(255,140,40,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - 48 * s, 60 * s * fl, 0, 7); ctx.fill();
  ctx.fillStyle = '#ff9a2e'; ctx.beginPath(); ctx.ellipse(x, y - 48 * s, 7 * s * fl, 13 * s * fl, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.ellipse(x, y - 45 * s, 3.5 * s, 7 * s * fl, 0, 0, 7); ctx.fill();
}

/* ---------- heroes & projectiles ---------- */
function drawHero(o) {
  const P = o.ui ? { x: o.x, y: o.y, s: 1 } : proj(o.x, o.y), s = o.ui ? 1 : P.s * .95;
  const sz = CELL * 1.42 * (1 + .1 * (o.star - 1)) * s * (o.boss ? 1.75 : 1), foot = P.y + CELL * .34 * s;
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
  if (o.boss) {
    const g = ctx.createRadialGradient(P.x, foot, 5, P.x, foot, sz * .5); g.addColorStop(0, 'rgba(190,90,255,.55)'); g.addColorStop(1, 'rgba(120,40,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(P.x, foot, sz * .5, sz * .17, 0, 0, 7); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(P.x, foot, sz * .26, sz * .08, 0, 0, 7); ctx.fill();
  if (o.team !== undefined) {
    const tc = o.boss ? '#d478ff' : TEAM[o.team];
    ctx.globalAlpha = (o.alpha ?? 1) * .35; ctx.fillStyle = tc; ctx.beginPath(); ctx.ellipse(P.x, foot, sz * .3, sz * .1, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = o.alpha ?? 1; ctx.strokeStyle = tc; ctx.lineWidth = o.boss ? 4.5 : 3.5; ctx.stroke();
  }
  if (o.burn) { ctx.globalAlpha = .5 + .3 * Math.sin(o.t * 20); ctx.fillStyle = '#ff7a2e'; ctx.beginPath(); ctx.ellipse(P.x, foot - 4, sz * .22, sz * .06, 0, 0, 7); ctx.fill(); ctx.globalAlpha = o.alpha ?? 1; }
  const sq = (o.squash || 0) + (o.squish ? Math.sin(o.squish * Math.PI) * (o.boss ? .05 : .12) : 0);
  ctx.translate(P.x + (o.lunge || 0) * s, foot - (o.lift || 0) * s); ctx.scale(o.face, 1); if (o.rot) ctx.rotate(o.rot);
  if (sq) ctx.scale(1 + sq, 1 - sq);
  const sp = spriteImg(o.type, o.pose, o.boss ? 'D' : '', o.dir), dw = sz * (sp.big ? PADR : 1), dy = -sz * .96 - (dw - sz) / 2;
  if (o.team !== undefined && !o.boss) {
    const ol = spriteImg(o.type, o.pose, 'T' + o.team, o.dir).img, d = 2.6 * (o.ui ? 1 : P.s);
    ctx.globalAlpha = (o.alpha ?? 1) * .95;
    for (const [ddx, ddy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) ctx.drawImage(ol, -dw / 2 + ddx, dy + ddy, dw, dw);
    ctx.globalAlpha = o.alpha ?? 1;
  }
  ctx.drawImage(sp.img, -dw / 2, dy, dw, dw);
  if (o.flash > 0) { ctx.globalAlpha = (o.alpha ?? 1) * Math.min(1, o.flash / .14) * .85; ctx.drawImage(spriteImg(o.type, o.pose, 'W', o.dir).img, -dw / 2, dy, dw, dw); }
  ctx.restore();
  if (o.shield > 0) {
    ctx.save(); ctx.globalAlpha = .35 + .15 * Math.sin(o.t * 8);
    const g = ctx.createRadialGradient(P.x, foot - sz * .4, sz * .1, P.x, foot - sz * .4, sz * .5);
    g.addColorStop(0, 'rgba(255,214,102,0)'); g.addColorStop(1, 'rgba(255,214,102,.8)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, foot - sz * .4, sz * .5, 0, 7); ctx.fill(); ctx.restore();
  }
  const top = foot - sz * .98;
  if (o.boss) { txt('BOSS', P.x, top - 4, 24, '#ff9cf0'); return; }
  if (o.bars) {
    const w = 76, x = P.x - w / 2, y = top - 4;
    rr(x - 2, y - 2, w + 4, 15, 5); ctx.fillStyle = 'rgba(20,12,8,.85)'; ctx.fill();
    ctx.fillStyle = '#f4e3c0'; ctx.fillRect(x, y, w * Math.max(0, o.shownHp / o.maxhp), 8);
    ctx.fillStyle = TEAM[o.team] || TEAM[0]; ctx.fillRect(x, y, w * Math.max(0, o.hp / o.maxhp), 8);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 1; i < 4; i++) ctx.fillRect(x + w * i / 4, y, 1.5, 8);
    ctx.fillStyle = o.mana >= 100 ? '#c8f4ff' : '#58c8ff'; ctx.fillRect(x, y + 9, w * Math.min(100, o.mana) / 100, 3);
  }
  if (o.star > 1 || o.bars) txt('★'.repeat(o.star), P.x, top - (o.bars ? 16 : 2), 20, o.star === 3 ? '#ff9cf0' : o.star === 2 ? '#c8e6ff' : '#ffd84a');
}
function fighterView(f, t) {
  const atk = f.atkAnim > 0, won = f.team === 0 && !S.fighters.some(g => g.alive && g.team !== f.team);
  let pose = 'idle';
  if (f.castT > 0) pose = 'cast';
  else if (f.hurtT > 0) pose = 'hurt';
  else if (atk) pose = 'attack';
  else if (f.windT > 0) pose = 'windup';
  else if (won) pose = 'victory';
  else if (f.walk > 0) pose = Math.floor(f.walk * 3.5) % 2 ? 'walk2' : 'walk1';
  return { type: f.type, star: f.star, x: f.x, y: f.y, face: f.face, team: f.team, pose, boss: f.boss, dir: f.dir,
    lunge: atk ? Math.sin((1 - f.atkAnim / .32) * Math.PI) * 10 * f.face : 0,
    lift: won ? Math.abs(Math.sin(t * 6 + f.id)) * 16 : f.walk > 0 ? Math.abs(Math.sin(f.walk * 11)) * 8 : Math.sin(t * 3 + f.id) * 1.5,
    squash: f.walk > 0 ? 0 : Math.sin(t * 3 + f.id) * .012, squish: f.squish, burn: f.burn,
    flash: f.flash, bars: true, hp: f.hp, shownHp: f.shownHp, maxhp: f.maxhp, mana: f.mana, shield: f.shield, t };
}
function drawShadows() {
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  for (const p of S.proj) { const g = proj(p.x, p.y), r = (p.kind === 'meteor' ? 30 * (1 - p.z / 700) + 8 : 10) * g.s; ctx.beginPath(); ctx.ellipse(g.x, g.y + 30 * g.s, r * 1.6, r * .5, 0, 0, 7); ctx.fill(); }
}
function drawProj(p) {
  const z = p.z + arcZ(p), P = proj(p.x, p.y), s = P.s;
  const px = P.x, py = P.y + 30 * s - z * s;
  const ahead = proj(p.x + p.vx * 10, p.y + p.vy * 10), zAhead = z + (p.vz || 0) * 10;
  const ang = Math.atan2((ahead.y + 30 * s - zAhead * s) - py, ahead.x - px);
  ctx.save(); ctx.translate(px, py); ctx.rotate(ang); ctx.scale(s, s);
  if (p.kind === 'arrow' || p.kind === 'arrowGold') {
    const gold = p.kind === 'arrowGold';
    ctx.globalAlpha = .35; ctx.strokeStyle = gold ? '#ffe28a' : '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-26, 0); ctx.stroke(); ctx.globalAlpha = 1;
    if (gold) { ctx.shadowColor = '#ffd84a'; ctx.shadowBlur = 16; }
    ctx.strokeStyle = gold ? '#ffcf4a' : '#8a5428'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(12, 0); ctx.stroke();
    ctx.fillStyle = gold ? '#fff2b0' : '#dfe6ee'; ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(24, 0); ctx.lineTo(10, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = gold ? '#ffe9a0' : '#f6efe0'; ctx.beginPath(); ctx.moveTo(-28, -7); ctx.lineTo(-18, 0); ctx.lineTo(-28, 7); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fill();
  } else if (p.kind === 'cannon' || p.kind === 'cannonBig') {
    const r = p.kind === 'cannonBig' ? 16 : 10;
    const g = ctx.createRadialGradient(-r * .3, -r * .3, 1, 0, 0, r); g.addColorStop(0, '#9aa3ad'); g.addColorStop(1, '#2a2f36');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffb35c'; ctx.beginPath(); ctx.arc(-r * .9, -r * .6, 3, 0, 7); ctx.fill();
  } else {
    const r = p.kind === 'meteor' ? 28 : p.kind === 'orb' || p.kind === 'fire' ? 15 : 11;
    const col = { meteor: ['#ffffff', '#c9a2ff', 'rgba(110,60,255,0)'], orb: ['#ffffff', '#6fd8ff', 'rgba(40,120,255,0)'], leaf: ['#ffffff', '#8ef08a', 'rgba(60,200,80,0)'], fire: ['#fff6c0', '#ff7a2e', 'rgba(255,60,0,0)'], spark: ['#ffffff', '#e7f59a', 'rgba(180,220,60,0)'] }[p.kind];
    if (p.kind !== 'spark') { const tr = ctx.createLinearGradient(-r * 4, 0, 0, 0); tr.addColorStop(0, 'rgba(255,255,255,0)'); tr.addColorStop(1, col[1]); ctx.fillStyle = tr; ctx.beginPath(); ctx.moveTo(-r * 4, 0); ctx.lineTo(0, -r * .8); ctx.lineTo(0, r * .8); ctx.closePath(); ctx.fill(); }
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 1.8);
    g.addColorStop(0, col[0]); g.addColorStop(.35, col[1]); g.addColorStop(1, col[2]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function drawGroundFx(t) {
  for (const p of S.fx) {
    const a = Math.max(0, p.life / p.max);
    if (p.type === 'scorch') { const P = proj(p.x, p.y); ctx.globalAlpha = Math.min(1, a * 2) * .5; ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(P.x, P.y + 30 * P.s, 90 * P.s, 30 * P.s, 0, 0, 7); ctx.fill(); }
    else if (p.type === 'ring') { const P = proj(p.x, p.y); ctx.globalAlpha = a; ctx.strokeStyle = p.color; ctx.lineWidth = 5 * a; ctx.beginPath(); ctx.ellipse(P.x, P.y + 34 * P.s, p.r * P.s * (1.4 - a), p.r * .35 * P.s * (1.4 - a), 0, 0, 7); ctx.stroke(); }
    else if (p.type === 'warn') {
      const P = proj(p.x, p.y), q = 1 - a;
      ctx.globalAlpha = .35 + .25 * Math.sin(t * 25); ctx.fillStyle = '#ff3a5c'; ctx.beginPath(); ctx.ellipse(P.x, P.y + 30 * P.s, p.r * P.s * q, p.r * .45 * P.s * q, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = .9; ctx.strokeStyle = '#ff5a7a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(P.x, P.y + 30 * P.s, p.r * P.s, p.r * .45 * P.s, 0, 0, 7); ctx.stroke();
    }
    else if (p.type === 'aura' && p.f.alive) {
      const P = proj(p.f.x, p.f.y); ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(P.x, P.y - 40 * P.s, 10, P.x, P.y - 40 * P.s, 120 * P.s);
      g.addColorStop(0, 'rgba(160,232,255,.55)'); g.addColorStop(1, 'rgba(160,232,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, P.y - 40 * P.s, 120 * P.s, 0, 7); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
function drawFx() {
  for (const p of S.fx) {
    if (p.ui) continue;
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    if (p.type === 'p') {
      const P = proj(p.x, p.y), s = P.s, x = P.x, y = P.y + 30 * s - p.z * s;
      if (p.glow) ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(x, y, p.size * s * (.4 + .6 * a), 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (p.type === 'shard') {
      const P = proj(p.x, p.y), s = P.s * .95;
      ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); ctx.translate(P.x, P.y + 30 * P.s - p.z * P.s); ctx.rotate(p.r); ctx.scale(p.face * s, s);
      ctx.drawImage(p.img, p.sx, p.sy, p.sw, p.sh, -p.size / 2, -p.size / 2, p.size, p.size); ctx.restore();
    } else if (p.type === 'boom') {
      const P = proj(p.x, p.y), cy = P.y, rad = p.r * P.s * (1.15 - a * .5);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(P.x, cy, 0, P.x, cy, rad); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.4, p.color); g.addColorStop(1, 'rgba(80,120,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(P.x, cy, rad, rad * .75, 0, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * a; ctx.beginPath(); ctx.ellipse(P.x, cy + 30 * P.s, rad * 1.2, rad * .4, 0, 0, 7); ctx.stroke();
    } else if (p.type === 'slash') {
      const P = proj(p.x, p.y), s = P.s; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8 * a * s; ctx.lineCap = 'round';
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(P.x - p.dir * 10 * s, P.y - 15 * s, 38 * s, -1.1 + (1 - a), .9 + (1 - a)); ctx.stroke(); ctx.shadowBlur = 0;
    }
  }
  ctx.globalAlpha = 1;
}
function drawTexts() {
  for (const t of S.texts) {
    const a = 1 - t.t / t.life, pop = t.t < .12 ? .5 + t.t / .12 * .7 : t.t < .2 ? 1.2 - (t.t - .12) / .08 * .2 : 1;
    const P = proj(t.x, t.y);
    ctx.globalAlpha = Math.min(1, a * 2.5); txt(t.s, P.x, P.y - (t.big ? 0 : t.t * 55), t.size * pop, t.color); ctx.globalAlpha = 1;
  }
}

/* ---------- UI ---------- */
function btn(x, y, w, h, label, color, on = true, size = 34) {
  ctx.save(); if (!on) ctx.globalAlpha = .45;
  rr(x, y + 6, w, h, 16); ctx.fillStyle = 'rgba(20,12,8,.6)'; ctx.fill();
  rr(x, y, w, h, 16); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2a170b'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.22)'; rr(x + 8, y + 6, w - 16, h * .3, 10); ctx.fill();
  txt(label, x + w / 2, y + h / 2 + 2, size, '#fff'); ctx.restore();
}
const FIGHT_BTN = { x: 490, y: 22, w: 200, h: 70 };
const SPEED_BTN = { x: 590, y: 26, w: 100, h: 60 };
const MUTE_BTN = { x: 420, y: 30, w: 56, h: 56 };
const REROLL = { x: BX + 4 * 126, y: SHOP_Y, w: 96, h: 190 };
const RARITY = { 3: ['#d9dee4', '#8a96a3'], 4: ['#ffe28a', '#c9902a'], 5: ['#e8b8ff', '#9b5ad6'] };
function drawMute() {
  const b = MUTE_BTN, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  ctx.fillStyle = 'rgba(20,12,8,.55)'; ctx.beginPath(); ctx.arc(cx, cy, 27, 0, 7); ctx.fill();
  ctx.fillStyle = '#f3e3c3'; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 6); ctx.lineTo(cx - 7, cy - 6); ctx.lineTo(cx + 2, cy - 14); ctx.lineTo(cx + 2, cy + 14); ctx.lineTo(cx - 7, cy + 6); ctx.lineTo(cx - 14, cy + 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#f3e3c3'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  if (AU.muted) { ctx.beginPath(); ctx.moveTo(cx + 7, cy - 7); ctx.lineTo(cx + 17, cy + 7); ctx.moveTo(cx + 17, cy - 7); ctx.lineTo(cx + 7, cy + 7); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(cx + 3, cy, 8, -.8, .8); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + 3, cy, 15, -.8, .8); ctx.stroke(); }
}
function drawHud() {
  txt(`Pusingan ${S.round}/${MAX_ROUND}`, 30, 38, 34, isBossRound() ? '#ff9cf0' : '#ffe9b0', 'left');
  for (let i = 0; i < 5; i++) heart(42 + i * 34, 80, 26, i < S.lives);
  const bump = 1 + S.goldBump * .35;
  coin(232, 80, 15 * bump); txt(String(Math.round(S.goldShown)), 256, 81, 32 * bump, '#ffd84a', 'left');
  if (S.streak >= 2 && !(S.phase === 'battle' && isBossRound())) txt(`Menang ${S.streak} kali`, 300, 81, 22, '#9df59a', 'left');
  drawMute();
  if (S.phase === 'prep') btn(FIGHT_BTN.x, FIGHT_BTN.y, FIGHT_BTN.w, FIGHT_BTN.h, 'LAWAN!', isBossRound() ? '#b14fd6' : '#ef7a2f', onBoard().length > 0, 38);
  if (S.phase === 'battle') btn(SPEED_BTN.x, SPEED_BTN.y, SPEED_BTN.w, SPEED_BTN.h, `x${S.speed}`, '#4f86c6', true, 30);
  const boss = S.phase === 'battle' && S.fighters.find(f => f.boss);
  if (boss) {
    const x = 60, y = 112, w = 600;
    txt(boss.boss, W / 2, y, 26, '#ff9cf0');
    rr(x - 4, y + 18, w + 8, 26, 10); ctx.fillStyle = 'rgba(20,8,24,.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#2a170b'; ctx.stroke();
    ctx.fillStyle = '#f4e3c0'; ctx.fillRect(x, y + 22, w * Math.max(0, boss.shownHp / boss.maxhp), 18);
    const bg = ctx.createLinearGradient(0, y + 22, 0, y + 40); bg.addColorStop(0, '#e07aff'); bg.addColorStop(1, '#8a2fc0');
    ctx.fillStyle = bg; ctx.fillRect(x, y + 22, w * Math.max(0, boss.hp / boss.maxhp), 18);
    txt(`${Math.ceil(boss.hp)} / ${Math.round(boss.maxhp)}`, W / 2, y + 31, 16, '#fff');
  } else drawChips();
}
function drawChips() {
  const types = S.phase === 'battle' ? S.fighters.filter(f => f.team === 0).map(f => f.type) : onBoard().map(u => u.type);
  const cnt = traitCounts(types), keys = Object.keys(TRAITS).filter(k2 => cnt[k2]).sort((a, b) => traitLevel(b, cnt[b]) - traitLevel(a, cnt[a]) || cnt[b] - cnt[a]);
  S.chips = [];
  keys.forEach((key, i) => {
    const T = TRAITS[key], n = cnt[key], lv = traitLevel(key, n), next = T.tiers[Math.min(lv, 1)];
    const x = 26 + i * 168, y = 110, w = 158, h = 40;
    ctx.save(); if (!lv) ctx.globalAlpha = .6;
    rr(x, y, w, h, 20); ctx.fillStyle = lv ? 'rgba(30,18,10,.85)' : 'rgba(30,18,10,.6)'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = lv ? T.color : 'rgba(255,255,255,.2)'; ctx.stroke();
    if (lv === 2) { ctx.shadowColor = T.color; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0; }
    traitIcon(key, x + 22, y + h / 2, 12, lv ? T.color : '#8a8a8a');
    txt(T.name, x + 38, y + h / 2 + 1, 17, lv ? '#fff' : '#cfc3b0', 'left', false, FB);
    txt(lv === 2 ? `${n}` : `${n}/${next}`, x + w - 10, y + h / 2 + 1, 17, lv ? T.color : '#cfc3b0', 'right', false, FB);
    ctx.restore();
    S.chips.push({ x, y, w, h, key });
  });
  if (!keys.length && S.phase === 'prep') txt('Gabung hero sama trait untuk bonus', 30, 130, 18, 'rgba(240,225,200,.6)', 'left', false, FB);
}
function drawCard(c, i, t) {
  const x = BX + i * 126, y = SHOP_Y, w = 118, h = 190, hdef = HEROES[c.type], rar = RARITY[hdef.cost] || RARITY[3];
  ctx.save(); if (c.sold) ctx.globalAlpha = .25; else if (S.gold < hdef.cost) ctx.globalAlpha = .55;
  rr(x, y + 5, w, h, 16); ctx.fillStyle = 'rgba(20,12,8,.6)'; ctx.fill();
  const fg = ctx.createLinearGradient(x, y, x + w, y + h); fg.addColorStop(0, rar[0]); fg.addColorStop(1, rar[1]);
  rr(x, y, w, h, 16); ctx.fillStyle = fg; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2a170b'; ctx.stroke();
  rr(x + 5, y + 5, w - 10, h - 10, 12); ctx.fillStyle = hdef.color; ctx.fill();
  const ag = ctx.createRadialGradient(x + w / 2, y + 60, 5, x + w / 2, y + 60, 70); ag.addColorStop(0, 'rgba(255,255,255,.35)'); ag.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = ag; rr(x + 5, y + 5, w - 10, 110, 12); ctx.fill();
  if (!c.sold) drawIdle(c.type, x + 6, y + 4 + Math.sin(t * 2 + i) * 2, 106, 106);
  if (hdef.cost >= 4 && !c.sold) {
    ctx.save(); rr(x + 5, y + 5, w - 10, h - 10, 12); ctx.clip();
    const sx = x - 60 + ((t * 120 + i * 70) % (w + 160));
    const sg = ctx.createLinearGradient(sx, 0, sx + 50, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg; ctx.translate(sx + 25, y + h / 2); ctx.rotate(.35); ctx.fillRect(-25, -h, 50, h * 2); ctx.restore();
  }
  hdef.traits.forEach((tr, j) => { ctx.fillStyle = 'rgba(20,12,8,.7)'; ctx.beginPath(); ctx.arc(x + 20, y + 22 + j * 28, 13, 0, 7); ctx.fill(); traitIcon(tr, x + 20, y + 22 + j * 28, 9, TRAITS[tr].color); });
  txt(hdef.name, x + w / 2, y + 128, 23, '#fff');
  txt(hdef.role, x + w / 2, y + 152, 17, '#ffeccc', 'center', false, FB);
  coin(x + w / 2 - 14, y + 175, 10); txt(String(hdef.cost), x + w / 2 + 6, y + 176, 22, '#ffd84a', 'left');
  ctx.restore();
}
function drawBenchAndShop(t, drag) {
  rr(BX - 16, BENCH_Y - 8, COLS * CELL + 32, CELL + 16, 18); ctx.fillStyle = 'rgba(30,18,10,.55)'; ctx.fill();
  for (let i = 0; i < 6; i++) { rr(BX + i * CELL + 6, BENCH_Y + 6, CELL - 12, CELL - 12, 12); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill(); }
  const n = onBoard().length;
  txt(`Pasukan ${n}/${cap()}`, BX + COLS * CELL, BENCH_Y - 22, 24, n >= cap() ? '#ffd84a' : '#d8f5c8', 'right');
  txt('Bench', BX, BENCH_Y - 22, 24, '#d8c8b0', 'left');
  for (const u of S.units) if (u.where === 'bench' && !(drag && drag.u === u)) {
    const p = unitPos(u);
    drawHero({ ui: true, type: u.type, star: u.star, x: p.x, y: p.y, face: 1, pose: 'idle', lift: Math.sin(t * 3 + u.id) * 1.5, alpha: S.phase === 'battle' ? .6 : 1 });
  }
  if (drag) {
    rr(BX - 16, SHOP_Y - 10, COLS * CELL + 32, 212, 18); ctx.fillStyle = 'rgba(200,60,40,.35)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#ff8a6b'; ctx.setLineDash([12, 8]); ctx.stroke(); ctx.setLineDash([]);
    const v = HEROES[drag.u.type].cost * [1, 3, 9][drag.u.star - 1];
    txt(`Lepas sini untuk jual (+${v})`, W / 2, SHOP_Y + 95, 34, '#fff');
    return;
  }
  S.shop.forEach((c, i) => drawCard(c, i, t));
  btn(REROLL.x, REROLL.y, REROLL.w, REROLL.h, '', '#5b6f8a', S.gold >= 2);
  ctx.save(); if (S.gold < 2) ctx.globalAlpha = .45;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(REROLL.x + 48, REROLL.y + 70, 22, .6, 5.6); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(REROLL.x + 66, REROLL.y + 42); ctx.lineTo(REROLL.x + 74, REROLL.y + 64); ctx.lineTo(REROLL.x + 52, REROLL.y + 60); ctx.fill();
  txt('Tukar', REROLL.x + 48, REROLL.y + 122, 22, '#fff');
  coin(REROLL.x + 36, REROLL.y + 158, 10); txt('2', REROLL.x + 54, REROLL.y + 159, 22, '#ffd84a', 'left');
  ctx.restore();
}
function panel(title, lines, color, sub, t, stars) {
  const e = Math.min(1, t / .35), sc = e < 1 ? .6 + .4 * (1 - Math.pow(1 - e, 3)) + Math.sin(e * Math.PI) * .08 : 1;
  ctx.fillStyle = `rgba(8,14,12,${.6 * e})`; ctx.fillRect(-400, -400, W + 800, H + 800);
  const w = 560, h = 240 + lines.length * 40 + (stars !== undefined ? 70 : 0), x = (W - w) / 2, y = 380;
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(sc, sc); ctx.translate(-W / 2, -(y + h / 2)); ctx.globalAlpha = e;
  rr(x, y + 8, w, h, 28); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  rr(x, y, w, h, 28); ctx.fillStyle = '#f3e3c3'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#2a170b'; ctx.stroke();
  rr(x, y, w, 110, 28); ctx.fillStyle = color; ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.2)'; rr(x + 12, y + 10, w - 24, 34, 18); ctx.fill();
  txt(title, W / 2, y + 58, 58, '#fff');
  let ly = y + 160;
  if (stars !== undefined) {
    for (let i = 0; i < 3; i++) {
      const st = t - .45 - i * .22, on = i < stars && st > 0, s2 = on ? Math.min(1, st / .15) * (1 + Math.max(0, .3 - st) ) : 1;
      star5(W / 2 + (i - 1) * 78, y + 165 - (i === 1 ? 10 : 0), 30 * (on ? s2 : .85), on ? '#ffd84a' : 'rgba(80,60,40,.25)');
    }
    ly += 70;
  }
  lines.forEach((l, i) => txt(l, W / 2, ly + i * 40, 28, '#4a2e18', 'center', false, FB));
  ctx.globalAlpha = e * (.65 + .35 * Math.sin(t * 4));
  txt(sub, W / 2, y + h - 54, 30, '#ef7a2f');
  ctx.restore();
}
function drawCoins() {
  for (const c of S.coins) {
    if (c.t < 0) continue;
    const q = Math.min(1, c.t / .6), e = q * q * (3 - 2 * q);
    const x = c.x0 + (232 - c.x0) * e, y = c.y0 + (80 - c.y0) * e - Math.sin(q * Math.PI) * 160;
    coin(x, y, 13 - 3 * q);
  }
}
function drawBanner() {
  const b = S.banner; if (!b) return;
  const a = b.t < .25 ? b.t / .25 : b.t > 1.7 ? Math.max(0, 1 - (b.t - 1.7) / .4) : 1, sc = b.t < .25 ? .7 + .3 * (b.t / .25) : 1;
  const y = proj(360, BY + 4 * CELL).y;
  ctx.save(); ctx.globalAlpha = a;
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(10,6,4,0)'); g.addColorStop(.2, 'rgba(10,6,4,.75)'); g.addColorStop(.8, 'rgba(10,6,4,.75)'); g.addColorStop(1, 'rgba(10,6,4,0)');
  ctx.fillStyle = g; ctx.fillRect(0, y - 70, W, 130);
  ctx.translate(W / 2, y); ctx.scale(sc, sc);
  txt(b.title, 0, -16, 66, b.color); txt(b.sub, 0, 36, 28, '#f3e3c3', 'center', false, FB);
  ctx.restore();
}
function drawTitle(t) {
  drawBackground(t);
  ctx.save(); ctx.translate(W / 2, 230); const s = 1 + Math.sin(t * 2) * .02; ctx.scale(s, s);
  if (UI.logo) { const lw = 620, lh = lw * UI.logo.height / UI.logo.width; ctx.drawImage(UI.logo, -lw / 2, -lh / 2, lw, lh); }
  else txt('Cozy Arena', 0, 0, 96, '#ffe9b0');
  ctx.restore();
  txt('Auto-battler lawan AI', W / 2, UI.logo ? 400 : 310, 30, '#bfe7c8', 'center', false, FB);
  const show = POOL.length ? POOL : ['knight', 'archer', 'mage', 'healer'];
  if (POOL.length) {
    const n = Math.min(show.length, 8), perRow = n > 4 ? Math.ceil(n / 2) : n;
    show.slice(0, 8).forEach((ty, i) => {
      const row = Math.floor(i / perRow), col = i % perRow, cols = Math.min(perRow, n - row * perRow);
      const sc2 = n > 4 ? .72 : 1, x = W / 2 + (col - (cols - 1) / 2) * 140 * (n > 4 ? .95 : 1), base = (n > 4 ? 520 + row * 170 : 640), y = base - 80 * sc2 + Math.sin(t * 2.4 + i) * 6;
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, base, 50 * sc2, 14 * sc2, 0, 0, 7); ctx.fill();
      drawIdle(ty, x - 85 * sc2, y - 20 * sc2, 170 * sc2, 170 * sc2);
      txt(HEROES[ty].name, x, base + 50 * sc2, 24 * Math.max(sc2, .85), '#fff'); txt(HEROES[ty].role, x, base + 78 * sc2, 18 * Math.max(sc2, .85), '#d8c8b0', 'center', false, FB);
    });
  }
  const how = ['Beli hero di kedai, seret ke papan', '3 hero sama bergabung jadi ★★', 'Hero trait sama aktifkan bonus', `Kalahkan boss pusingan 5 & ${MAX_ROUND}`];
  how.forEach((l, i) => txt(l, W / 2, 870 + i * 42, 26, '#f3e3c3', 'center', false, FB));
  if (best) txt(`Rekod terbaik: pusingan ${best}`, W / 2, 1052, 26, '#ffd84a', 'center', false, FB);
  if (S.phase === 'loading') txt('Memuatkan...', W / 2, 1140, 36, '#fff');
  else { ctx.globalAlpha = .6 + .4 * Math.sin(t * 4); txt('Tekan untuk mula', W / 2, 1140, 42, '#fff'); ctx.globalAlpha = 1; }
  rr(W / 2 - 150, 1200, 300, 44, 22); ctx.fillStyle = 'rgba(12,8,6,.6)'; ctx.fill();
  txt(`Versi ${GAME_VERSION}  ·  ${GAME_DATE}`, W / 2, 1222, 20, '#d8c8b0', 'center', false, FB);
  drawMute();
}

let drag = null;
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#10191f'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
  if (S.phase === 'loading' || S.phase === 'title') return drawTitle(t);
  drawBackground(t);
  const sh = S.shake > 0 ? S.shake * 22 : 0, sx = rand(-1, 1) * sh, sy = rand(-1, 1) * sh;
  const c = S.cam, f = proj(c.x, c.y);
  ctx.save();
  ctx.translate(sx, sy); ctx.translate(f.x, f.y); ctx.scale(c.z, c.z); ctx.translate(-f.x, -f.y);
  drawBoard(t, drag && drag.moved ? drag : null);
  drawGroundFx(t);
  drawShadows();
  const list = [];
  if (S.phase === 'prep') {
    for (const e of S.enemy) { const p = cellCenter(e.c, e.r); if (e.boss) p.x += CELL / 2; list.push({ type: e.type, star: e.star, x: p.x, y: p.y, face: -1, team: 1, boss: e.boss && BOSS[S.round].name, pose: 'idle', lift: Math.sin(t * 3 + e.c + e.r) * 1.5, t }); }
    for (const u of S.units) if (u.where === 'board' && !(drag && drag.u === u && drag.moved)) {
      const p = unitPos(u);
      list.push({ type: u.type, star: u.star, x: p.x, y: p.y, face: 1, team: 0, pose: 'idle', lift: Math.sin(t * 3 + u.id) * 1.5 });
    }
  } else for (const fi of S.fighters) if (fi.alive) list.push(fighterView(fi, t));
  list.sort((a, b) => a.y - b.y).forEach(drawHero);
  for (const p of S.proj) drawProj(p);
  drawFx();
  drawTexts();
  ctx.restore();
  if (S.slow > 0) { const v = ctx.createRadialGradient(360, 520, 200, 360, 520, 760); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,30,60,${Math.min(.55, S.slow)})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  { const g = ctx.createLinearGradient(0, 860, 0, H); g.addColorStop(0, 'rgba(12,8,6,0)'); g.addColorStop(.25, 'rgba(12,8,6,.7)'); g.addColorStop(1, 'rgba(12,8,6,.92)'); ctx.fillStyle = g; ctx.fillRect(0, 860, W, H - 860);
    const g2 = ctx.createLinearGradient(0, 0, 0, 170); g2.addColorStop(0, 'rgba(12,8,6,.7)'); g2.addColorStop(1, 'rgba(12,8,6,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, 170); }
  drawHud();
  drawBenchAndShop(t, drag && drag.moved ? drag : null);
  for (const p of S.fx) if (p.ui) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  if (drag && drag.moved) drawHero({ ui: true, type: drag.u.type, star: drag.u.star, x: drag.x, y: drag.y - 30, face: 1, pose: 'idle', lift: 10 });
  drawBanner();
  if (S.phase === 'prep' && S.round === 1 && !onBoard().length && !drag && !S.banner) {
    const P = proj(360, BY + 6 * CELL);
    ctx.globalAlpha = .7 + .3 * Math.sin(t * 4);
    txt(S.units.length ? 'Seret hero dari bench ke papan hijau' : 'Tekan kad hero untuk beli', W / 2, P.y, 32, '#fff');
    ctx.globalAlpha = 1;
  }
  if (S.toast) { const ty = proj(360, BY + 4 * CELL).y; ctx.globalAlpha = Math.min(1, S.toast.t * 3); rr(60, ty - 34, W - 120, 68, 20); ctx.fillStyle = 'rgba(20,12,8,.88)'; ctx.fill(); txt(S.toast.msg, W / 2, ty, 24, '#fff', 'center', false, FB); ctx.globalAlpha = 1; }
  if (S.phase === 'result') {
    const r = S.result;
    panel(r.win ? (r.boss ? 'BOSS TUMBANG!' : 'MENANG!') : 'KALAH',
      r.win ? [`Gold +${r.income}${r.boss ? ' (bonus boss +5)' : ''}`] : [`Musuh tinggal ${r.aliveFoes} hero`, `Nyawa -1    Gold +${r.income}`],
      r.win ? (r.boss ? '#b14fd6' : '#4f9a3f') : '#c9483a', 'Tekan untuk teruskan', r.t, r.win ? r.stars : undefined);
  }
  if (S.phase === 'over') panel('TAMAT', [`Kau bertahan sampai pusingan ${S.round}`, `Rekod terbaik: ${best}`], '#7a3a5a', 'Tekan untuk main semula', S.result ? S.result.t : 1);
  if (S.phase === 'victory') panel('JUARA!', [`Kau tewaskan semua ${MAX_ROUND} pusingan`, `Nyawa tinggal: ${S.lives}`], '#d9a224', 'Tekan untuk main semula', S.result ? S.result.t : 1, 3);
  drawCoins();
}

/* ---------- input ---------- */
const toLocal = e => ({ x: (e.clientX - ox) / k, y: (e.clientY - oy) / k });
const inR = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
function unitAt(p) {
  for (const u of S.units) {
    const q = unitPos(u);
    if (u.where === 'board') { const P = proj(q.x, q.y); if (Math.abs(p.x - P.x) < CELL * .5 * P.s && p.y > P.y - CELL * .9 * P.s && p.y < P.y + CELL * .5 * P.s) return u; }
    else if (Math.abs(p.x - q.x) < CELL / 2 && Math.abs(p.y - q.y) < CELL / 2) return u;
  }
  return null;
}
function boardCellAt(x, y) {
  const b = unproj(x, y), c = Math.floor((b.x - BX) / CELL), r = Math.floor((b.y - BY) / CELL);
  return c >= 0 && c < COLS && r >= 0 && r < ROWS ? { c, r } : null;
}
function chipAt(p) { return (S.chips || []).find(c => inR(p, c)); }
function showTrait(key) {
  const T = TRAITS[key], who = Object.keys(HEROES).filter(h => HEROES[h].traits.includes(key) && POOL.includes(h)).map(h => HEROES[h].name).join(', ');
  toast(`${T.name} (${who}): ${T.tiers[0]} = ${T.desc[0]}, ${T.tiers[1]} = ${T.desc[1]}`, 3.2);
}
cv.addEventListener('pointerdown', e => {
  audioInit(); goFullscreen();
  const p = toLocal(e);
  if (S.phase !== 'loading' && Math.hypot(p.x - (MUTE_BTN.x + 28), p.y - (MUTE_BTN.y + 28)) < 32) return toggleMute();
  if (S.phase === 'title') { sfx('click'); newGame(); return; }
  if (S.phase === 'result') { if (S.result.t > .5) nextRound(); return; }
  if (S.phase === 'over' || S.phase === 'victory') { if (!S.result || S.result.t > .6) S.phase = 'title'; return; }
  const ch = chipAt(p); if (ch) return showTrait(ch.key);
  if (S.phase === 'battle') { if (inR(p, SPEED_BTN)) { sfx('click'); S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 3 : 1; } return; }
  if (S.phase !== 'prep') return;
  if (inR(p, FIGHT_BTN)) return startBattle();
  if (inR(p, REROLL)) { if (S.gold >= 2) { S.gold -= 2; rollShop(); sfx('click'); } else toast('Gold tak cukup'); return; }
  for (let i = 0; i < 4; i++) if (inR(p, { x: BX + i * 126, y: SHOP_Y, w: 118, h: 190 })) return buy(i);
  const u = unitAt(p);
  if (u) { drag = { u, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }; cv.setPointerCapture(e.pointerId); }
});
cv.addEventListener('pointermove', e => {
  if (!drag) return; const p = toLocal(e); drag.x = p.x; drag.y = p.y;
  if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 10) drag.moved = true;
  const cell = boardCellAt(p.x, p.y - 30); drag.hc = cell ? cell.c : -1; drag.hr = cell ? cell.r : -1;
});
function endDrag() {
  if (!drag) return; const d = drag; drag = null;
  if (!d.moved || S.phase !== 'prep') return;
  const u = d.u, x = d.x, y = d.y - 30;
  const old = { where: u.where, slot: u.slot, c: u.c, r: u.r };
  let dest = null;
  const cell = boardCellAt(x, y), bc = Math.floor((x - BX) / CELL);
  if (cell && cell.r >= 4 && y < PY1 + THICK) dest = { where: 'board', c: cell.c, r: cell.r };
  else if (bc >= 0 && bc < COLS && y >= BENCH_Y - 10 && y <= BENCH_Y + CELL + 10) dest = { where: 'bench', slot: bc };
  else if (d.y >= SHOP_Y - 20) return sell(u);
  if (!dest) return;
  const occ = S.units.find(o => o !== u && o.where === dest.where && (dest.where === 'board' ? o.c === dest.c && o.r === dest.r : o.slot === dest.slot));
  if (dest.where === 'board' && old.where !== 'board' && !occ && onBoard().length >= cap()) return toast(`Pasukan dah penuh (${cap()}). Naik pusingan untuk tambah`);
  Object.assign(u, dest); sfx('place');
  if (occ) Object.assign(occ, old);
  if (dest.where === 'board') { const q = cellCenter(dest.c, dest.r); S.fx.push({ type: 'ring', x: q.x, y: q.y, life: .4, max: .4, color: '#ffffff', r: 60 }); }
  checkTraitsChanged();
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', () => { drag = null; });

/* ---------- loop ---------- */
let last = 0;
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
  if (S.phase !== 'loading' && S.phase !== 'title') {
    let sdt = dt;
    if (S.hitstop > 0) { S.hitstop -= dt; sdt = 0; }
    else if (S.slow > 0) { S.slow -= dt; sdt = dt * .3; }
    if (S.phase === 'battle') { for (let i = 0; i < S.speed; i++) { updateBattle(sdt); if (S.phase !== 'battle') break; updateFx(sdt); } }
    else updateFx(dt);
    S.shake = Math.max(0, S.shake - dt);
    if (S.toast && (S.toast.t -= dt) <= 0) S.toast = null;
    if (S.banner && (S.banner.t += dt) > 2.1) S.banner = null;
    if (S.result) {
      S.result.t += dt;
      if (S.result.win && S.result.starSfx < S.result.stars && S.result.t > .45 + S.result.starSfx * .22) { S.result.starSfx++; sfx('star'); }
    }
    for (const c of S.coins) { c.t += dt; if (c.t >= .6 && !c.done) { c.done = true; S.gold += c.val; S.goldBump = 1; sfx('tick'); } }
    S.coins = S.coins.filter(c => !c.done);
    S.goldBump = Math.max(0, S.goldBump - dt * 4);
    S.goldShown += (S.gold - S.goldShown) * Math.min(1, dt * 10); if (Math.abs(S.gold - S.goldShown) < .05) S.goldShown = S.gold;
    const ct = S.camT && S.camT.t > 0 ? S.camT : null;
    if (S.camT) S.camT.t -= dt;
    const tz = ct ? ct.z : 1, tx = ct ? ct.x : 360, ty = ct ? ct.y : BY + 4 * CELL, e = Math.min(1, dt * (ct ? 7 : 4));
    S.cam.z += (tz - S.cam.z) * e; S.cam.x += (tx - S.cam.x) * e; S.cam.y += (ty - S.cam.y) * e;
  }
  render(ts / 1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
Promise.all([loadAll(), document.fonts ? document.fonts.load(`40px 'Lilita One'`).catch(() => {}) : 0])
  .then(() => { S.phase = 'title'; })
  .catch(err => { S.phase = 'title'; console.error(err); });
