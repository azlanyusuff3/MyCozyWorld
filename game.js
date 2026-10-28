'use strict';
/* Cozy Arena — auto-battler lawan AI. Canvas 2D, logical 720x1280 (portrait).
   Logik tempur guna grid rata (BX/BY/CELL). Papan dilukis 2.5D melalui proj(). */

const W = 720, H = 1280, COLS = 6, ROWS = 8, CELL = 100, BX = 60, BY = 110;
const BENCH_Y = 940;
const SHOP_Y = BENCH_Y + CELL + 22;      // 1062
const MAX_ROUND = 10;
const FD = "'Lilita One', 'Trebuchet MS', sans-serif";
const FB = "800 1em 'Nunito', 'Trebuchet MS', sans-serif";

/* papan 2.5D: trapezium, belakang sempit, depan lebar */
const PX0 = 360, PY0 = 178, PY1 = 868, WTOP = 492, WBOT = 690, THICK = 30;

const HEROES = {
  knight: { name: 'Bulwark', role: 'Knight', cost: 3, hp: 980, atk: 58, range: 1.25, as: 1.0, armor: .32, speed: 150, proj: null, color: '#c9483a', ult: 'Perisai Suria!' },
  archer: { name: 'Bramble', role: 'Archer', cost: 3, hp: 480, atk: 74, range: 4, as: .85, armor: .05, speed: 140, proj: 'arrow', color: '#4f9a3f', ult: 'Hujan Panah!' },
  mage:   { name: 'Nimbus', role: 'Mage', cost: 4, hp: 440, atk: 112, range: 3.5, as: 1.6, armor: .05, speed: 130, proj: 'orb', color: '#4f6fd8', ult: 'Meteor!' },
  healer: { name: 'Willow', role: 'Healer', cost: 3, hp: 520, atk: 34, heal: 92, range: 3.5, as: 1.3, armor: .1, speed: 135, proj: 'spark', color: '#8a9d3a', ult: 'Rahmat Daun!' },
};
const TYPES = Object.keys(HEROES);
const PSPEED = { arrow: 900, arrowGold: 1000, orb: 560, leaf: 520, spark: 640, meteor: 1100 };

/* ---------- canvas ---------- */
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
let k = 1, ox = 0, oy = 0, dpr = 1;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = innerWidth, h = innerHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  k = Math.min(w / W, h / H); ox = (w - W * k) / 2; oy = (h - H * k) / 2;
}
addEventListener('resize', resize); resize();

/* ---------- projection ---------- */
function proj(x, y) {
  const u = (x - BX) / (COLS * CELL), v = (y - BY) / (ROWS * CELL), w = WTOP + (WBOT - WTOP) * v;
  return { x: PX0 + (u - .5) * w, y: PY0 + v * (PY1 - PY0), s: w / (COLS * CELL) };
}
function unproj(sx, sy) {
  const v = (sy - PY0) / (PY1 - PY0), w = WTOP + (WBOT - WTOP) * v;
  return { x: BX + ((sx - PX0) / w + .5) * COLS * CELL, y: BY + v * ROWS * CELL };
}

/* ---------- audio (Web Audio, tiada fail) ---------- */
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
  AU.noise = buf;
  AU.next = a.currentTime + .1;
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
    case 'spark': tone(1200 * r, .1, 'sine', .07, 1800); break;
    case 'slash': noise(.1, .3, 'highpass', 2500, 6000); tone(300 * r, .07, 'sawtooth', .05, 120); break;
    case 'hit': tone(150 * r, .14, 'sine', .45, 55); noise(.06, .22, 'lowpass', 1400); break;
    case 'crit': tone(170, .2, 'sine', .55, 45); noise(.12, .35, 'lowpass', 2600, 300); tone(1400, .12, 'square', .06, 700); break;
    case 'pop': noise(.18, .25, 'lowpass', 2200, 400); tone(320 * r, .14, 'sine', .18, 140); break;
    case 'boom': noise(.6, .7, 'lowpass', 1500, 120); tone(95, .5, 'sine', .7, 32); break;
    case 'heal': [880, 1175, 1568].forEach((f, i) => tone(f * r, .25, 'sine', .07, 0, now + i * .05)); break;
    case 'die': tone(420, .35, 'square', .07, 70); noise(.35, .25, 'bandpass', 1800, 300); break;
    case 'coin': tone(1320, .07, 'square', .06, 0, now); tone(1760, .16, 'square', .06, 0, now + .07); break;
    case 'click': tone(700, .05, 'triangle', .1, 500); break;
    case 'place': tone(260, .08, 'sine', .25, 160); noise(.05, .12, 'lowpass', 900); break;
    case 'merge': [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .12, 0, now + i * .06)); break;
    case 'ult': tone(220, .45, 'sawtooth', .1, 880); noise(.45, .18, 'bandpass', 600, 4000); tone(1760, .4, 'sine', .06, 0, now + .25); break;
    case 'start': [392, 523, 659].forEach((f, i) => tone(f, .35, 'sawtooth', .07, 0, now + i * .1)); tone(784, .6, 'square', .06, 0, now + .3); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, 'triangle', .14, 0, now + i * .1)); [523, 659, 784].forEach(f => tone(f * 2, .9, 'sine', .07, 0, now + .45)); break;
    case 'lose': [392, 330, 262, 196].forEach((f, i) => tone(f, .35, 'triangle', .13, 0, now + i * .16)); break;
  }
}
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], ARP = [0, 1, 2, 1, 0, 2, 1, 2];
function musicTick() {
  const a = AU.ctx; if (!a) return;
  if (AU.next < a.currentTime) AU.next = a.currentTime + .05;
  while (AU.next < a.currentTime + .25) {
    const st = AU.step, t = AU.next, ch = CHORDS[(st >> 3) % 4], i = st % 8, fight = S.phase === 'battle';
    if (i === 0 || i === 4) tone(mtof(ch[0] - 12), .55, 'triangle', .5, 0, t, AU.mus);
    tone(mtof(ch[ARP[i]] + 12), .3, 'sine', .22, 0, t, AU.mus);
    if (i === 0 && (st >> 3) % 2 === 0) ch.forEach(n => tone(mtof(n), 2.2, 'sine', .06, 0, t, AU.mus));
    if (fight) {
      noise(.04, i % 2 ? .08 : .14, 'highpass', 7000, 0, t, AU.mus);
      if (i === 0 || i === 4) tone(110, .2, 'sine', .9, 40, t, AU.mus);
      if (i === 2 || i === 6) noise(.12, .3, 'bandpass', 1800, 900, t, AU.mus);
    }
    AU.next += fight ? .25 : .32; AU.step++;
  }
}
function toggleMute() {
  AU.muted = !AU.muted; try { localStorage.setItem('cozyArenaMute', AU.muted ? '1' : '0'); } catch (e) {}
  if (AU.master) AU.master.gain.setTargetAtTime(AU.muted ? 0 : 1, AU.ctx.currentTime, .05);
}

/* ---------- images ---------- */
const IMG = {};
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
function whiteOf(img) {
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  return c;
}
async function loadAll() {
  await Promise.all(TYPES.flatMap(t => ['idle', 'attack'].map(async p => {
    const i = await loadImg(`assets/heroes/opt/${t}_${p}.webp`);
    (IMG[t] ||= {})[p] = i; IMG[t][p + 'W'] = whiteOf(i);
  })));
}

/* ---------- helpers ---------- */
const rand = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
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

/* ---------- state ---------- */
let uid = 1;
const S = { phase: 'loading', cam: { z: 1, x: 360, y: 520 } };
let best = 0; try { best = +localStorage.getItem('cozyArenaBest') || 0; } catch (e) {}

function newGame() {
  Object.assign(S, {
    phase: 'prep', gold: 10, round: 1, lives: 5, streak: 0, units: [], shop: [], enemy: [],
    fighters: [], proj: [], fx: [], texts: [], timers: [], toast: null, result: null,
    battleT: 0, endT: 0, speed: 1, shake: 0, hitstop: 0, slow: 0, camT: null, cam: { z: 1, x: 360, y: 520 },
  });
  rollShop(); genEnemy();
}
const cap = () => Math.min(2 + S.round, 8);
const onBoard = () => S.units.filter(u => u.where === 'board');
function benchFree() { for (let i = 0; i < 6; i++) if (!S.units.some(u => u.where === 'bench' && u.slot === i)) return i; return -1; }
function toast(msg) { S.toast = { msg, t: 1.8 }; }
function rollShop() { S.shop = Array.from({ length: 4 }, () => ({ type: TYPES[Math.random() * 4 | 0], sold: false })); }
function unitPos(u) { return u.where === 'board' ? cellCenter(u.c, u.r) : { x: BX + u.slot * CELL + CELL / 2, y: BENCH_Y + CELL / 2 }; }

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
  merge(type, keep.star);
}
function sell(u) {
  const v = HEROES[u.type].cost * [1, 3, 9][u.star - 1];
  S.gold += v; S.units.splice(S.units.indexOf(u), 1); sfx('coin');
  toast(`Jual ${HEROES[u.type].name} +${v} gold`);
}

function genEnemy() {
  const r = S.round, n = Math.min(r + 1, 8), list = [];
  for (let i = 0; i < n; i++) {
    let t = TYPES[Math.random() * 4 | 0];
    if (i === 0 && n >= 2) t = 'knight';
    let star = 1;
    if (Math.random() < Math.min(.12 * (r - 2), .75)) star = 2;
    if (r >= 8 && Math.random() < .15 * (r - 7)) star = 3;
    list.push({ type: t, star });
  }
  const used = new Set();
  S.enemy = list.map(e => {
    const rows = e.type === 'knight' ? [3, 2] : [0, 1];
    let c, row, tries = 0;
    do { row = rows[Math.random() * 2 | 0]; c = Math.random() * COLS | 0; } while (used.has(row * 10 + c) && ++tries < 60);
    if (used.has(row * 10 + c)) outer: for (let rr2 = 0; rr2 < 4; rr2++) for (let cc = 0; cc < COLS; cc++) if (!used.has(rr2 * 10 + cc)) { row = rr2; c = cc; break outer; }
    used.add(row * 10 + c);
    return { ...e, c, r: row };
  });
}

/* ---------- battle ---------- */
function makeFighter(type, star, c, r, team) {
  const h = HEROES[type], m = Math.pow(1.8, star - 1), p = cellCenter(c, r);
  return { id: uid++, team, type, star, h, x: p.x, y: p.y, hp: h.hp * m, maxhp: h.hp * m, atk: h.atk * m, heal: (h.heal || 0) * m,
    cd: rand(.25, .7), mana: 0, target: null, retarget: 0, face: team === 0 ? 1 : -1, atkAnim: 0, flash: 0, alive: true, shield: 0, walk: 0,
    shownHp: h.hp * m, kx: 0, ky: 0, squish: 0 };
}
function startBattle() {
  if (!onBoard().length) return toast('Letak sekurang-kurangnya 1 hero atas papan');
  S.fighters = [...onBoard().map(u => makeFighter(u.type, u.star, u.c, u.r, 0)), ...S.enemy.map(e => makeFighter(e.type, e.star, e.c, e.r, 1))];
  S.proj = []; S.timers = []; S.battleT = 0; S.endT = 0; S.phase = 'battle';
  sfx('start');
  addText(360, BY + 4 * CELL, 'LAWAN!', '#ffd84a', 84, 1.1, true);
}
function later(t, fn) { S.timers.push({ t, fn }); }
function nearest(f, team) {
  let b = null, bd = 1e9;
  for (const o of S.fighters) if (o.alive && o.team === team) { const d = dist(o, f); if (d < bd) { bd = d; b = o; } }
  return b;
}
function updateFighter(f, dt) {
  f.atkAnim = Math.max(0, f.atkAnim - dt); f.flash = Math.max(0, f.flash - dt); f.shield = Math.max(0, f.shield - dt);
  f.squish = Math.max(0, f.squish - dt * 4);
  f.cd -= dt; f.retarget -= dt;
  if (f.kx || f.ky) { f.x += f.kx * dt; f.y += f.ky * dt; const d = Math.max(0, 1 - dt * 9); f.kx *= d; f.ky *= d; if (Math.abs(f.kx) + Math.abs(f.ky) < 5) f.kx = f.ky = 0; }
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
  if (d <= f.h.range * CELL) {
    f.walk = 0;
    if (f.cd <= 0) {
      f.cd = f.h.as;
      if (f.mana >= 100) { f.mana = 0; cast(f, tgt, healing); } else attack(f, tgt, healing);
    }
  } else {
    const sp = f.h.speed * dt; f.x += dx / d * sp; f.y += dy / d * sp; f.walk += dt;
  }
}
function attack(f, t, healing) {
  f.atkAnim = .32; f.mana = Math.min(100, f.mana + (f.type === 'healer' ? 28 : 20));
  if (healing) { sfx('spark'); return shoot(f, t, 'leaf', () => healUnit(t, f.heal)); }
  if (f.h.proj === 'arrow') { sfx('arrow'); shoot(f, t, 'arrow', () => hit(f, t, f.atk)); }
  else if (f.h.proj === 'orb') { sfx('orb'); shoot(f, t, 'orb', () => { sfx('pop'); splash(f, t, 1.1 * CELL, f.atk); }); }
  else if (f.h.proj === 'spark') { sfx('spark'); shoot(f, t, 'spark', () => hit(f, t, f.atk)); }
  else later(.14, () => { if (f.alive && t.alive) { sfx('slash'); hit(f, t, f.atk); slash(t, f.face); } });
}
function cast(f, t, healing) {
  f.atkAnim = .55;
  addText(f.x, f.y - 130, f.h.ult, '#9fe8ff', 34, 1.3);
  ring(f.x, f.y, '#9fe8ff'); sfx('ult');
  S.slow = .55; S.camT = { x: f.x, y: f.y - 40, z: 1.08, t: .7 };
  S.fx.push({ type: 'aura', f, life: .7, max: .7 });
  switch (f.type) {
    case 'archer': {
      const foes = S.fighters.filter(o => o.alive && o.team !== f.team).sort((a, b) => dist(a, f) - dist(b, f)).slice(0, 3);
      foes.forEach((o, i) => later(.15 + i * .09, () => { if (!f.alive) return; sfx('arrow'); shoot(f, o, 'arrowGold', () => hit(f, o, f.atk * 1.6, true)); }));
      break;
    }
    case 'mage': {
      const tt = healing ? nearest(f, 1 - f.team) : t; if (!tt) break;
      S.proj.push({ kind: 'meteor', x: tt.x + 110, y: tt.y, z: 620, t: tt, tx: tt.x, ty: tt.y, tz: 10, d0: 0, vx: 0, vy: 0, vz: -1,
        onHit: () => { sfx('boom'); splash(f, tt, 1.7 * CELL, f.atk * 2.2, true); S.shake = .4; S.hitstop = .09; scorch(tt.x, tt.y); } });
      break;
    }
    case 'knight': {
      f.shield = 4; ring(f.x, f.y, '#ffd166');
      later(.12, () => {
        if (!f.alive) return; sfx('slash'); S.shake = .2;
        for (const o of S.fighters) if (o.alive && o.team !== f.team && dist(o, f) < 1.6 * CELL) { hit(f, o, f.atk * 1.4, true); slash(o, o.x > f.x ? 1 : -1); }
      });
      break;
    }
    case 'healer': {
      sfx('heal');
      for (const o of S.fighters) if (o.alive && o.team === f.team) { healUnit(o, f.heal * 1.3); ring(o.x, o.y, '#8ef08a'); leaves(o.x, o.y); }
      break;
    }
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
  const crit = Math.random() < .12;
  const dmg = Math.max(1, Math.round(amt * (1 - armor) * rand(.9, 1.1) * (crit ? 1.6 : 1)));
  t.hp -= dmg; t.flash = .14; t.squish = 1; t.mana = Math.min(100, t.mana + dmg / t.maxhp * 50);
  addText(t.x + rand(-14, 14), t.y - 100, crit ? dmg + '!' : '' + dmg, crit ? '#ffd23e' : '#ffffff', crit ? 46 : 32, .9, crit);
  sparks(t.x, t.y - 45, src.team === 0 ? '#ffe9a8' : '#ff8a6b', crit ? 16 : 8);
  if (crit) { sfx('crit'); S.hitstop = Math.max(S.hitstop, .07); S.shake = Math.max(S.shake, .14); }
  else sfx('hit');
  if (crit || heavy) {
    const dx = t.x - src.x, dy = t.y - src.y, d = Math.hypot(dx, dy) || 1, kb = heavy ? 300 : 220;
    t.kx += dx / d * kb; t.ky += dy / d * kb;
  }
  if (t.hp <= 0) { t.hp = 0; t.alive = false; shatter(t); sfx('die'); S.hitstop = Math.max(S.hitstop, .06); }
}
function healUnit(t, amt) {
  if (!t.alive) return;
  const a = Math.round(Math.min(amt, t.maxhp - t.hp)); t.hp += a;
  if (a > 0) { addText(t.x + rand(-10, 10), t.y - 100, '+' + a, '#7dff8a', 30); sfx('heal'); }
  sparks(t.x, t.y - 45, '#8ef08a', 8);
}
function splash(src, t, r, amt, heavy) {
  const cx = t.x, cy = t.y;
  boom(cx, cy, r, heavy ? '#c9a2ff' : '#7fdcff');
  for (const o of S.fighters) if (o.alive && o.team !== src.team && Math.hypot(o.x - cx, o.y - cy) <= r) hit(src, o, o === t ? amt : amt * .6, heavy);
}
function updateBattle(dt) {
  S.battleT += dt;
  for (const f of S.fighters) {
    if (f.alive) updateFighter(f, dt);
    f.shownHp += (f.hp - f.shownHp) * Math.min(1, dt * 4);
  }
  const al = S.fighters.filter(f => f.alive);
  for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) {
    const a = al[i], b = al[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01;
    if (d < 62) { const p = (62 - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * p; a.y -= ny * p; b.x += nx * p; b.y += ny * p; }
  }
  for (const f of al) { f.x = Math.max(BX + 30, Math.min(BX + COLS * CELL - 30, f.x)); f.y = Math.max(BY + 40, Math.min(BY + ROWS * CELL - 30, f.y)); }
  for (const p of S.proj) {
    if (p.t.alive) { p.tx = p.t.x; p.ty = p.t.y; }
    const sp = PSPEED[p.kind] * dt, dx = p.tx - p.x, dy = p.ty - p.y, dz = p.tz - p.z, d = Math.hypot(dx, dy, dz);
    if (d <= sp) { p.done = true; p.onHit(); continue; }
    p.vx = dx / d; p.vy = dy / d; p.vz = dz / d; p.x += p.vx * sp; p.y += p.vy * sp; p.z += p.vz * sp;
    if (p.kind !== 'arrow' && p.kind !== 'spark')
      S.fx.push({ type: 'p', x: p.x + rand(-4, 4), y: p.y, z: p.z + arcZ(p) + rand(-4, 4), vx: 0, vy: 0, vz: 0, life: .4, max: .4,
        color: p.kind === 'leaf' ? '#9df59a' : p.kind === 'arrowGold' ? '#ffe28a' : p.kind === 'meteor' ? '#c9a2ff' : '#8fe3ff', size: p.kind === 'meteor' ? 16 : 8, glow: true });
  }
  S.proj = S.proj.filter(p => !p.done);
  const a = S.fighters.some(f => f.alive && f.team === 0), b = S.fighters.some(f => f.alive && f.team === 1);
  if (!a || !b || S.battleT > 60) {
    S.endT += dt;
    if (S.endT > 1.2 || S.battleT > 60) {
      let win = a && !b;
      if (a && b) { const hp = t => S.fighters.filter(f => f.team === t).reduce((s, f) => s + f.hp / f.maxhp, 0); win = hp(0) >= hp(1); }
      endBattle(win);
    }
  }
}
function arcZ(p) {
  if (p.kind !== 'arrow' && p.kind !== 'arrowGold' && p.kind !== 'leaf') return 0;
  const left = Math.hypot(p.tx - p.x, p.ty - p.y), q = Math.max(0, Math.min(1, 1 - left / p.d0));
  return Math.sin(q * Math.PI) * Math.min(60, p.d0 * .14);
}
function endBattle(win) {
  const income = 5 + (win ? 2 : 0) + Math.min(Math.floor(S.gold / 10), 3);
  if (!win) S.lives--;
  S.streak = win ? S.streak + 1 : 0;
  S.result = { win, income, t: 0, aliveFoes: S.fighters.filter(f => f.alive && f.team === 1).length };
  sfx(win ? 'win' : 'lose');
  if (S.lives <= 0) { S.phase = 'over'; saveBest(S.round - 1); }
  else if (win && S.round >= MAX_ROUND) { S.phase = 'victory'; saveBest(MAX_ROUND); }
  else S.phase = 'result';
}
function saveBest(r) { if (r > best) { best = r; try { localStorage.setItem('cozyArenaBest', r); } catch (e) {} } }
function nextRound() {
  S.round++; S.gold += S.result.income; S.fighters = []; S.proj = []; S.fx = []; S.texts = [];
  rollShop(); genEnemy(); S.phase = 'prep'; S.result = null; sfx('coin');
  toast(`Pasukan boleh ada ${cap()} hero sekarang`);
}

/* ---------- effects (koordinat dunia: x, y tanah, z tinggi) ---------- */
function addText(x, y, s, color, size, life = .9, big = false) { S.texts.push({ x, y, s, color, size, t: 0, life, big }); }
function sparks(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(80, 260); S.fx.push({ type: 'p', x, y: y + 45, z: 45, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .4, vz: rand(40, 260), life: rand(.25, .5), max: .5, color, size: rand(3, 6), g: 700 }); } }
function burst(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(120, 380); S.fx.push({ type: 'p', x, y: y + 40, z: 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .5, vz: rand(100, 420), life: rand(.5, .9), max: .9, color, size: rand(4, 9), g: 800 }); } }
function uiBurst(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(120, 380); S.fx.push({ type: 'p', ui: true, x, y, z: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, vz: 0, life: rand(.5, .9), max: .9, color, size: rand(4, 9), gy: 600 }); } }
function leaves(x, y) { for (let i = 0; i < 6; i++) S.fx.push({ type: 'p', x: x + rand(-30, 30), y, z: rand(0, 20), vx: rand(-20, 20), vy: 0, vz: rand(90, 180), life: .9, max: .9, color: '#8ef08a', size: rand(4, 7), glow: true }); }
function ring(x, y, color) { S.fx.push({ type: 'ring', x, y, life: .55, max: .55, color, r: 70 }); }
function boom(x, y, r, color) { S.fx.push({ type: 'boom', x, y, life: .45, max: .45, color, r }); sparks(x, y - 20, color, 18); }
function scorch(x, y) { S.fx.push({ type: 'scorch', x, y, life: 3, max: 3 }); }
function slash(t, dir) { S.fx.push({ type: 'slash', x: t.x, y: t.y, life: .22, max: .22, dir }); }
function shatter(f) {
  const img = IMG[f.type].idle, n = 3, sw = img.width / n, sh = img.height / n, sz = CELL * 1.42 * (1 + .1 * (f.star - 1));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    S.fx.push({ type: 'shard', img, sx: i * sw, sy: j * sh, sw, sh, size: sz / n, face: f.face,
      x: f.x + (i - 1) * sz / n * f.face, y: f.y, z: sz * .96 - (j + .5) * sz / n - CELL * .34 + 34,
      vx: (i - 1) * rand(90, 220) * f.face + rand(-40, 40), vy: rand(-40, 40), vz: rand(150, 380) - (j - 1) * 60,
      r: 0, vr: rand(-7, 7), life: rand(.8, 1.1), max: 1.1, g: 1100 });
  }
  S.fx.push({ type: 'ring', x: f.x, y: f.y, life: .5, max: .5, color: f.team === 0 ? '#9be7b0' : '#ff9b85', r: 80 });
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

/* ---------- drawing ---------- */
function drawBackground(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#132a36'); g.addColorStop(.5, '#1b3a30'); g.addColorStop(1, '#14231c');
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  const v = ctx.createRadialGradient(360, 520, 120, 360, 520, 620);
  v.addColorStop(0, 'rgba(255,214,140,.10)'); v.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 22; i++) {
    const x = (i * 137 + Math.sin(t * .4 + i) * 30) % W, y = (i * 263 % H) + Math.cos(t * .5 + i * 2) * 20;
    ctx.globalAlpha = .25 + .25 * Math.sin(t * 2 + i); ctx.fillStyle = '#f9e27a';
    ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawBoard(t, dragging) {
  const L = BX, R = BX + COLS * CELL, T = BY, B = BY + ROWS * CELL;
  const tl = proj(L, T), tr = proj(R, T), bl = proj(L, B), br = proj(R, B);
  // bayang bawah papan
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath(); ctx.ellipse(PX0, PY1 + THICK + 14, WBOT * .56, 34, 0, 0, 7); ctx.fill();
  // bingkai kayu: permukaan + muka depan + sisi
  const pad = 16, ftl = { x: tl.x - pad * .85, y: tl.y - pad }, ftr = { x: tr.x + pad * .85, y: tr.y - pad }, fbl = { x: bl.x - pad * 1.15, y: bl.y + pad * .6 }, fbr = { x: br.x + pad * 1.15, y: br.y + pad * .6 };
  quad(fbl, fbr, { x: fbr.x, y: fbr.y + THICK }, { x: fbl.x, y: fbl.y + THICK });
  const fg = ctx.createLinearGradient(0, fbl.y, 0, fbl.y + THICK); fg.addColorStop(0, '#5b3920'); fg.addColorStop(1, '#2f1c0f');
  ctx.fillStyle = fg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1e1209'; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
  for (let i = 1; i < 6; i++) { const x = fbl.x + (fbr.x - fbl.x) * i / 6; ctx.beginPath(); ctx.moveTo(x, fbl.y + 4); ctx.lineTo(x, fbl.y + THICK - 4); ctx.stroke(); }
  quad(ftl, ftr, fbr, fbl);
  const wg = ctx.createLinearGradient(0, ftl.y, 0, fbl.y); wg.addColorStop(0, '#6e4a2c'); wg.addColorStop(1, '#8a5e36');
  ctx.fillStyle = wg; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1e1209'; ctx.stroke();
  // petak
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x0 = BX + c * CELL, y0 = BY + r * CELL, m = 3;
    const a = proj(x0 + m, y0 + m), b = proj(x0 + CELL - m, y0 + m), cc = proj(x0 + CELL - m, y0 + CELL - m), d = proj(x0 + m, y0 + CELL - m);
    const odd = (r + c) % 2, mine = r >= 4;
    // sisi petak (ketebalan kecil)
    quad(d, cc, { x: cc.x, y: cc.y + 6 * cc.s }, { x: d.x, y: d.y + 6 * d.s });
    ctx.fillStyle = mine ? '#3d6a2f' : '#5e4a30'; ctx.fill();
    quad(a, b, cc, d);
    const tg = ctx.createLinearGradient(0, a.y, 0, d.y);
    if (mine) { tg.addColorStop(0, odd ? '#78ad5c' : '#86bb67'); tg.addColorStop(1, odd ? '#5f9149' : '#6ca253'); }
    else { tg.addColorStop(0, odd ? '#a48a62' : '#b0966c'); tg.addColorStop(1, odd ? '#8a7350' : '#97805a'); }
    ctx.fillStyle = tg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a.x, a.y + 1); ctx.lineTo(b.x, b.y + 1); ctx.stroke();
    // corak: rumput (kita) / batu (musuh)
    const seed = (r * 7 + c * 13) % 5;
    if (mine && seed < 2) { const p = proj(x0 + 30 + seed * 30, y0 + 70); ctx.strokeStyle = 'rgba(40,80,30,.6)'; ctx.lineWidth = 2; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(p.x + i * 4, p.y); ctx.lineTo(p.x + i * 7, p.y - 9 * p.s); ctx.stroke(); } }
    if (!mine && seed === 1) { const p = proj(x0 + 66, y0 + 30); ctx.fillStyle = 'rgba(60,45,28,.35)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 9 * p.s, 5 * p.s, 0, 0, 7); ctx.fill(); }
    if (dragging && mine) {
      const occ = S.units.some(u => u.where === 'board' && u.c === c && u.r === r && u !== dragging.u);
      const hov = dragging.hc === c && dragging.hr === r;
      quad(a, b, cc, d);
      if (hov) { ctx.fillStyle = occ ? 'rgba(255,214,102,.35)' : 'rgba(255,255,255,.3)'; ctx.fill(); }
      ctx.strokeStyle = occ ? 'rgba(255,220,120,.6)' : 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  // garis tengah bercahaya
  const ml = proj(L, BY + 4 * CELL), mr = proj(R, BY + 4 * CELL);
  ctx.save(); ctx.shadowColor = '#ffd678'; ctx.shadowBlur = 14;
  ctx.strokeStyle = `rgba(255,214,120,${.45 + .2 * Math.sin(t * 2)})`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ml.x, ml.y); ctx.lineTo(mr.x, mr.y); ctx.stroke(); ctx.restore();
  // obor di 4 penjuru belakang & depan
  [[ftl.x - 6, ftl.y], [ftr.x + 6, ftr.y]].forEach(([x, y], i) => torch(x, y, t + i * 1.7, .8));
  [[fbl.x - 8, fbl.y], [fbr.x + 8, fbr.y]].forEach(([x, y], i) => torch(x, y, t + i * 2.3, 1));
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
function drawHero(o) {
  const P = o.ui ? { x: o.x, y: o.y, s: 1 } : proj(o.x, o.y), s = o.ui ? 1 : P.s * .95;
  const sz = CELL * 1.42 * (1 + .1 * (o.star - 1)) * s, foot = P.y + CELL * .34 * s;
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
  ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(P.x, foot, sz * .26, sz * .08, 0, 0, 7); ctx.fill();
  if (o.team !== undefined) {
    ctx.strokeStyle = o.team === 1 ? 'rgba(255,96,80,.9)' : 'rgba(110,240,170,.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(P.x, foot, sz * .3, sz * .1, 0, 0, 7); ctx.stroke();
  }
  const sq = (o.squash || 0) + (o.squish ? Math.sin(o.squish * Math.PI) * .12 : 0);
  ctx.translate(P.x + (o.lunge || 0) * s, foot - (o.lift || 0) * s); ctx.scale(o.face, 1); if (o.rot) ctx.rotate(o.rot);
  if (sq) ctx.scale(1 + sq, 1 - sq);
  ctx.drawImage(IMG[o.type][o.pose], -sz / 2, -sz * .96, sz, sz);
  if (o.flash > 0) { ctx.globalAlpha = (o.alpha ?? 1) * Math.min(1, o.flash / .14) * .85; ctx.drawImage(IMG[o.type][o.pose + 'W'], -sz / 2, -sz * .96, sz, sz); }
  ctx.restore();
  if (o.shield > 0) {
    ctx.save(); ctx.globalAlpha = .35 + .15 * Math.sin(o.t * 8);
    const g = ctx.createRadialGradient(P.x, foot - sz * .4, sz * .1, P.x, foot - sz * .4, sz * .5);
    g.addColorStop(0, 'rgba(255,214,102,0)'); g.addColorStop(1, 'rgba(255,214,102,.8)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, foot - sz * .4, sz * .5, 0, 7); ctx.fill(); ctx.restore();
  }
  const top = foot - sz * .98;
  if (o.bars) {
    const w = 76, x = P.x - w / 2, y = top - 4;
    rr(x - 2, y - 2, w + 4, 15, 5); ctx.fillStyle = 'rgba(20,12,8,.85)'; ctx.fill();
    ctx.fillStyle = '#f4e3c0'; ctx.fillRect(x, y, w * Math.max(0, o.shownHp / o.maxhp), 8);
    ctx.fillStyle = o.team === 1 ? '#ff5a4a' : '#5fe07a'; ctx.fillRect(x, y, w * Math.max(0, o.hp / o.maxhp), 8);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 1; i < 4; i++) ctx.fillRect(x + w * i / 4, y, 1.5, 8);
    ctx.fillStyle = o.mana >= 100 ? '#c8f4ff' : '#58c8ff'; ctx.fillRect(x, y + 9, w * o.mana / 100, 3);
  }
  if (o.star > 1 || o.bars) txt('★'.repeat(o.star), P.x, top - (o.bars ? 16 : 2), 20, o.star === 3 ? '#ff9cf0' : o.star === 2 ? '#c8e6ff' : '#ffd84a');
}
function fighterView(f, t) {
  const atk = f.atkAnim > 0;
  return { type: f.type, star: f.star, x: f.x, y: f.y, face: f.face, team: f.team, pose: atk ? 'attack' : 'idle',
    lunge: atk ? Math.sin((1 - f.atkAnim / .32) * Math.PI) * 10 * f.face : 0,
    lift: f.walk > 0 ? Math.abs(Math.sin(f.walk * 11)) * 8 : Math.sin(t * 3 + f.id) * 1.5,
    squash: f.walk > 0 ? 0 : Math.sin(t * 3 + f.id) * .012, squish: f.squish,
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
  } else {
    const r = p.kind === 'meteor' ? 28 : p.kind === 'orb' ? 15 : 11;
    const col = p.kind === 'meteor' ? ['#ffffff', '#c9a2ff', 'rgba(110,60,255,0)'] : p.kind === 'orb' ? ['#ffffff', '#6fd8ff', 'rgba(40,120,255,0)'] : p.kind === 'leaf' ? ['#ffffff', '#8ef08a', 'rgba(60,200,80,0)'] : ['#ffffff', '#e7f59a', 'rgba(180,220,60,0)'];
    if (p.kind !== 'spark') { const tr = ctx.createLinearGradient(-r * 4, 0, 0, 0); tr.addColorStop(0, 'rgba(255,255,255,0)'); tr.addColorStop(1, col[1]); ctx.fillStyle = tr; ctx.beginPath(); ctx.moveTo(-r * 4, 0); ctx.lineTo(0, -r * .8); ctx.lineTo(0, r * .8); ctx.closePath(); ctx.fill(); }
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 1.8);
    g.addColorStop(0, col[0]); g.addColorStop(.35, col[1]); g.addColorStop(1, col[2]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function drawGroundFx() {
  for (const p of S.fx) {
    const a = Math.max(0, p.life / p.max);
    if (p.type === 'scorch') { const P = proj(p.x, p.y); ctx.globalAlpha = Math.min(1, a * 2) * .5; ctx.fillStyle = '#1a1020'; ctx.beginPath(); ctx.ellipse(P.x, P.y + 30 * P.s, 90 * P.s, 30 * P.s, 0, 0, 7); ctx.fill(); }
    else if (p.type === 'ring') { const P = proj(p.x, p.y); ctx.globalAlpha = a; ctx.strokeStyle = p.color; ctx.lineWidth = 5 * a; ctx.beginPath(); ctx.ellipse(P.x, P.y + 34 * P.s, p.r * P.s * (1.4 - a), p.r * .35 * P.s * (1.4 - a), 0, 0, 7); ctx.stroke(); }
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
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    if (p.type === 'p') {
      let x, y, s = 1;
      if (p.ui) { x = p.x; y = p.y; } else { const P = proj(p.x, p.y); s = P.s; x = P.x; y = P.y + 30 * s - p.z * s; }
      if (p.glow) { ctx.globalCompositeOperation = 'lighter'; }
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
function drawMute() {
  const b = MUTE_BTN, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  ctx.fillStyle = 'rgba(20,12,8,.55)'; ctx.beginPath(); ctx.arc(cx, cy, 27, 0, 7); ctx.fill();
  ctx.fillStyle = '#f3e3c3'; ctx.beginPath(); ctx.moveTo(cx - 14, cy - 6); ctx.lineTo(cx - 7, cy - 6); ctx.lineTo(cx + 2, cy - 14); ctx.lineTo(cx + 2, cy + 14); ctx.lineTo(cx - 7, cy + 6); ctx.lineTo(cx - 14, cy + 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#f3e3c3'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  if (AU.muted) { ctx.beginPath(); ctx.moveTo(cx + 7, cy - 7); ctx.lineTo(cx + 17, cy + 7); ctx.moveTo(cx + 17, cy - 7); ctx.lineTo(cx + 7, cy + 7); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(cx + 3, cy, 8, -.8, .8); ctx.stroke(); ctx.beginPath(); ctx.arc(cx + 3, cy, 15, -.8, .8); ctx.stroke(); }
}
function drawHud() {
  txt(`Pusingan ${S.round}/${MAX_ROUND}`, 30, 38, 34, '#ffe9b0', 'left');
  for (let i = 0; i < 5; i++) heart(42 + i * 34, 80, 26, i < S.lives);
  coin(232, 80, 15); txt(String(S.gold), 256, 81, 32, '#ffd84a', 'left');
  if (S.streak >= 2) txt(`Menang ${S.streak} kali`, 300, 81, 22, '#9df59a', 'left');
  drawMute();
  if (S.phase === 'prep') btn(FIGHT_BTN.x, FIGHT_BTN.y, FIGHT_BTN.w, FIGHT_BTN.h, 'LAWAN!', '#ef7a2f', onBoard().length > 0, 38);
  if (S.phase === 'battle') btn(SPEED_BTN.x, SPEED_BTN.y, SPEED_BTN.w, SPEED_BTN.h, `x${S.speed}`, '#4f86c6', true, 30);
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
  S.shop.forEach((c, i) => {
    const x = BX + i * 126, y = SHOP_Y, w = 118, h = 190, hdef = HEROES[c.type];
    ctx.save(); if (c.sold) ctx.globalAlpha = .25; else if (S.gold < hdef.cost) ctx.globalAlpha = .55;
    rr(x, y + 5, w, h, 16); ctx.fillStyle = 'rgba(20,12,8,.6)'; ctx.fill();
    rr(x, y, w, h, 16); ctx.fillStyle = hdef.color; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2a170b'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(x + 6, y + 6, w - 12, 108, 12); ctx.fill();
    if (!c.sold) ctx.drawImage(IMG[c.type].idle, x + 6, y + 4 + Math.sin(t * 2 + i) * 2, 106, 106);
    txt(hdef.name, x + w / 2, y + 128, 23, '#fff');
    txt(hdef.role, x + w / 2, y + 152, 17, '#ffeccc', 'center', false, FB);
    coin(x + w / 2 - 14, y + 175, 10); txt(String(hdef.cost), x + w / 2 + 6, y + 176, 22, '#ffd84a', 'left');
    ctx.restore();
  });
  btn(REROLL.x, REROLL.y, REROLL.w, REROLL.h, '', '#5b6f8a', S.gold >= 2);
  ctx.save(); if (S.gold < 2) ctx.globalAlpha = .45;
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(REROLL.x + 48, REROLL.y + 70, 22, .6, 5.6); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(REROLL.x + 66, REROLL.y + 42); ctx.lineTo(REROLL.x + 74, REROLL.y + 64); ctx.lineTo(REROLL.x + 52, REROLL.y + 60); ctx.fill();
  txt('Tukar', REROLL.x + 48, REROLL.y + 122, 22, '#fff');
  coin(REROLL.x + 36, REROLL.y + 158, 10); txt('2', REROLL.x + 54, REROLL.y + 159, 22, '#ffd84a', 'left');
  ctx.restore();
}
function panel(title, lines, color, sub) {
  ctx.fillStyle = 'rgba(8,14,12,.6)'; ctx.fillRect(-400, -400, W + 800, H + 800);
  const w = 560, h = 300 + lines.length * 40, x = (W - w) / 2, y = 400;
  rr(x, y + 8, w, h, 28); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  rr(x, y, w, h, 28); ctx.fillStyle = '#f3e3c3'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#2a170b'; ctx.stroke();
  rr(x, y, w, 110, 28); ctx.fillStyle = color; ctx.fill(); ctx.stroke();
  txt(title, W / 2, y + 58, 58, '#fff');
  lines.forEach((l, i) => txt(l, W / 2, y + 160 + i * 40, 28, '#4a2e18', 'center', false, FB));
  txt(sub, W / 2, y + h - 54, 30, '#ef7a2f');
}
function drawTitle(t) {
  drawBackground(t);
  txt('Cozy Arena', W / 2, 230, 96, '#ffe9b0');
  txt('Auto-battler lawan AI', W / 2, 310, 30, '#bfe7c8', 'center', false, FB);
  if (IMG.knight) TYPES.forEach((ty, i) => {
    const x = 150 + i * 140, y = 560 + Math.sin(t * 2.4 + i) * 6;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, 640, 50, 14, 0, 0, 7); ctx.fill();
    ctx.drawImage(IMG[ty].idle, x - 85, y - 100, 170, 170);
    txt(HEROES[ty].name, x, 690, 24, '#fff'); txt(HEROES[ty].role, x, 718, 18, '#d8c8b0', 'center', false, FB);
  });
  const how = ['Beli hero di kedai, seret ke papan', '3 hero sama bergabung jadi ★★', 'Tekan LAWAN, hero bertarung sendiri', `Menang ${MAX_ROUND} pusingan untuk juara`];
  how.forEach((l, i) => txt(l, W / 2, 810 + i * 44, 27, '#f3e3c3', 'center', false, FB));
  if (best) txt(`Rekod terbaik: pusingan ${best}`, W / 2, 1010, 26, '#ffd84a', 'center', false, FB);
  if (S.phase === 'loading') txt('Memuatkan...', W / 2, 1120, 36, '#fff');
  else { ctx.globalAlpha = .6 + .4 * Math.sin(t * 4); txt('Tekan untuk mula', W / 2, 1120, 42, '#fff'); ctx.globalAlpha = 1; }
  drawMute();
}

let drag = null;
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#10191f'; ctx.fillRect(0, 0, cv.width, cv.height);
  const base = () => ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy);
  base();
  if (S.phase === 'loading' || S.phase === 'title') return drawTitle(t);
  drawBackground(t);
  // lapisan dunia: gegar + kamera zoom
  const sh = S.shake > 0 ? S.shake * 22 : 0, sx = rand(-1, 1) * sh, sy = rand(-1, 1) * sh;
  const c = S.cam, f = proj(c.x, c.y);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.translate(f.x, f.y); ctx.scale(c.z, c.z); ctx.translate(-f.x - (f.x - 360) * (c.z - 1) * 0, -f.y);
  drawBoard(t, drag && drag.moved ? drag : null);
  drawGroundFx();
  drawShadows();
  const list = [];
  if (S.phase === 'prep') {
    for (const e of S.enemy) { const p = cellCenter(e.c, e.r); list.push({ type: e.type, star: e.star, x: p.x, y: p.y, face: -1, team: 1, pose: 'idle', lift: Math.sin(t * 3 + e.c + e.r) * 1.5 }); }
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
  // vignette masa slow-mo
  if (S.slow > 0) { const v = ctx.createRadialGradient(360, 520, 200, 360, 520, 760); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(10,30,60,${Math.min(.55, S.slow)})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  drawHud();
  drawBenchAndShop(t, drag && drag.moved ? drag : null);
  for (const p of S.fx) if (p.ui) { ctx.globalAlpha = Math.max(0, p.life / p.max); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  if (drag && drag.moved) drawHero({ ui: true, type: drag.u.type, star: drag.u.star, x: drag.x, y: drag.y - 30, face: 1, pose: 'idle', lift: 10 });
  if (S.phase === 'prep' && S.round === 1 && !onBoard().length && !drag) {
    const P = proj(360, BY + 6 * CELL);
    ctx.globalAlpha = .7 + .3 * Math.sin(t * 4);
    txt(S.units.length ? 'Seret hero dari bench ke papan hijau' : 'Tekan kad hero untuk beli', W / 2, P.y, 32, '#fff');
    ctx.globalAlpha = 1;
  }
  if (S.toast) { const ty = proj(360, BY + 4 * CELL).y; ctx.globalAlpha = Math.min(1, S.toast.t * 3); rr(80, ty - 34, W - 160, 68, 20); ctx.fillStyle = 'rgba(20,12,8,.85)'; ctx.fill(); txt(S.toast.msg, W / 2, ty, 26, '#fff', 'center', false, FB); ctx.globalAlpha = 1; }
  if (S.phase === 'result') {
    const r = S.result;
    panel(r.win ? 'MENANG!' : 'KALAH', r.win ? [`Pasukan kau menang pusingan ${S.round}`, `Gold +${r.income}`] : [`Musuh tinggal ${r.aliveFoes} hero`, 'Nyawa -1', `Gold +${r.income}`], r.win ? '#4f9a3f' : '#c9483a', 'Tekan untuk teruskan');
  }
  if (S.phase === 'over') panel('TAMAT', [`Kau bertahan sampai pusingan ${S.round}`, `Rekod terbaik: ${best}`], '#7a3a5a', 'Tekan untuk main semula');
  if (S.phase === 'victory') panel('JUARA!', [`Kau menang semua ${MAX_ROUND} pusingan`, `Nyawa tinggal: ${S.lives}`], '#d9a224', 'Tekan untuk main semula');
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
cv.addEventListener('pointerdown', e => {
  audioInit();
  const p = toLocal(e);
  if (S.phase !== 'loading' && Math.hypot(p.x - (MUTE_BTN.x + 28), p.y - (MUTE_BTN.y + 28)) < 32) return toggleMute();
  if (S.phase === 'title') { sfx('click'); newGame(); return; }
  if (S.phase === 'result') { nextRound(); return; }
  if (S.phase === 'over' || S.phase === 'victory') { S.phase = 'title'; return; }
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
    // kamera
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
