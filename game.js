'use strict';
/* Cozy Arena — auto-battler lawan AI. Canvas 2D, logical 720x1280 (portrait). */

const W = 720, H = 1280, COLS = 6, ROWS = 8, CELL = 100, BX = 60, BY = 110;
const BENCH_Y = BY + ROWS * CELL + 30;   // 940
const SHOP_Y = BENCH_Y + CELL + 22;      // 1062
const MAX_ROUND = 10;
const FD = "'Lilita One', 'Trebuchet MS', sans-serif";
const FB = "800 1em 'Nunito', 'Trebuchet MS', sans-serif";

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
const S = { phase: 'loading' };
let best = 0; try { best = +localStorage.getItem('cozyArenaBest') || 0; } catch (e) {}

function newGame() {
  Object.assign(S, {
    phase: 'prep', gold: 10, round: 1, lives: 5, streak: 0, units: [], shop: [], enemy: [],
    fighters: [], proj: [], fx: [], texts: [], timers: [], toast: null, result: null,
    battleT: 0, endT: 0, speed: 1, shake: 0, flashScreen: 0,
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
  S.gold -= h.cost; c.sold = true;
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
  burst(p.x, p.y - 40, '#ffd84a', 26); ring(p.x, p.y, '#ffd84a');
  toast(`${HEROES[type].name} naik ${'★'.repeat(keep.star)}!`);
  merge(type, keep.star);
}
function sell(u) {
  const v = HEROES[u.type].cost * [1, 3, 9][u.star - 1];
  S.gold += v; S.units.splice(S.units.indexOf(u), 1);
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
    cd: rand(.25, .7), mana: 0, target: null, retarget: 0, face: team === 0 ? 1 : -1, atkAnim: 0, flash: 0, alive: true, dead: 0, shield: 0, walk: 0, shownHp: h.hp * m };
}
function startBattle() {
  if (!onBoard().length) return toast('Letak sekurang-kurangnya 1 hero atas papan');
  S.fighters = [...onBoard().map(u => makeFighter(u.type, u.star, u.c, u.r, 0)), ...S.enemy.map(e => makeFighter(e.type, e.star, e.c, e.r, 1))];
  S.proj = []; S.timers = []; S.battleT = 0; S.endT = 0; S.phase = 'battle';
}
function later(t, fn) { S.timers.push({ t, fn }); }
function nearest(f, team) {
  let b = null, bd = 1e9;
  for (const o of S.fighters) if (o.alive && o.team === team) { const d = dist(o, f); if (d < bd) { bd = d; b = o; } }
  return b;
}
function updateFighter(f, dt) {
  f.atkAnim = Math.max(0, f.atkAnim - dt); f.flash = Math.max(0, f.flash - dt); f.shield = Math.max(0, f.shield - dt);
  f.cd -= dt; f.retarget -= dt;
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
  if (healing) return shoot(f, t, 'leaf', () => healUnit(t, f.heal));
  if (f.h.proj === 'arrow') shoot(f, t, 'arrow', () => hit(f, t, f.atk));
  else if (f.h.proj === 'orb') shoot(f, t, 'orb', () => splash(f, t, 1.1 * CELL, f.atk));
  else if (f.h.proj === 'spark') shoot(f, t, 'spark', () => hit(f, t, f.atk));
  else later(.14, () => { if (f.alive && t.alive) { hit(f, t, f.atk); slash(t, f.face); } });
}
function cast(f, t, healing) {
  f.atkAnim = .55;
  addText(f.x, f.y - 120, f.h.ult, '#9fe8ff', 28, 1.2);
  ring(f.x, f.y, '#9fe8ff');
  switch (f.type) {
    case 'archer': {
      const foes = S.fighters.filter(o => o.alive && o.team !== f.team).sort((a, b) => dist(a, f) - dist(b, f)).slice(0, 3);
      foes.forEach((o, i) => later(i * .09, () => f.alive && shoot(f, o, 'arrowGold', () => hit(f, o, f.atk * 1.6))));
      break;
    }
    case 'mage': {
      const tt = healing ? nearest(f, 1 - f.team) : t; if (!tt) break;
      S.proj.push({ kind: 'meteor', x: tt.x + 90, y: tt.y - 560, t: tt, tx: tt.x, ty: tt.y - 20, onHit: () => { splash(f, tt, 1.7 * CELL, f.atk * 2.2); S.shake = .35; }, vx: 0, vy: 0, age: 0 });
      break;
    }
    case 'knight': {
      f.shield = 4; ring(f.x, f.y, '#ffd166');
      for (const o of S.fighters) if (o.alive && o.team !== f.team && dist(o, f) < 1.6 * CELL) { hit(f, o, f.atk * 1.4); slash(o, o.x > f.x ? 1 : -1); }
      break;
    }
    case 'healer': {
      for (const o of S.fighters) if (o.alive && o.team === f.team) { healUnit(o, f.heal * 1.3); ring(o.x, o.y, '#8ef08a'); }
      break;
    }
  }
}
function shoot(f, t, kind, onHit) {
  S.proj.push({ kind, x: f.x + f.face * 30, y: f.y - 52, t, tx: t.x, ty: t.y - 40, onHit, vx: f.face, vy: 0, age: 0 });
}
function hit(src, t, amt) {
  if (!t.alive) return;
  const armor = Math.min(.85, t.h.armor + (t.shield > 0 ? .5 : 0));
  const crit = Math.random() < .12;
  const dmg = Math.max(1, Math.round(amt * (1 - armor) * rand(.9, 1.1) * (crit ? 1.6 : 1)));
  t.hp -= dmg; t.flash = .14; t.mana = Math.min(100, t.mana + dmg / t.maxhp * 50);
  addText(t.x + rand(-14, 14), t.y - 95, crit ? dmg + '!' : '' + dmg, crit ? '#ffd23e' : '#ffffff', crit ? 40 : 30);
  sparks(t.x, t.y - 40, src.team === 0 ? '#ffe9a8' : '#ff8a6b', crit ? 14 : 8);
  if (t.hp <= 0) { t.hp = 0; t.alive = false; t.dead = .001; burst(t.x, t.y - 40, t.team === 0 ? '#9be7b0' : '#ff9b85', 22); }
}
function healUnit(t, amt) {
  if (!t.alive) return;
  const a = Math.round(Math.min(amt, t.maxhp - t.hp)); t.hp += a;
  if (a > 0) addText(t.x + rand(-10, 10), t.y - 95, '+' + a, '#7dff8a', 28);
  sparks(t.x, t.y - 40, '#8ef08a', 8);
}
function splash(src, t, r, amt) {
  const cx = t.x, cy = t.y;
  boom(cx, cy - 20, r, '#7fdcff');
  for (const o of S.fighters) if (o.alive && o.team !== src.team && Math.hypot(o.x - cx, o.y - cy) <= r) hit(src, o, o === t ? amt : amt * .6);
}
function updateBattle(dt) {
  S.battleT += dt;
  for (const f of S.fighters) {
    if (f.alive) updateFighter(f, dt); else if (f.dead) f.dead += dt;
    f.shownHp += (f.hp - f.shownHp) * Math.min(1, dt * 4);
  }
  // separation, so heroes don't stack
  const al = S.fighters.filter(f => f.alive);
  for (let i = 0; i < al.length; i++) for (let j = i + 1; j < al.length; j++) {
    const a = al[i], b = al[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01;
    if (d < 62) { const p = (62 - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * p; a.y -= ny * p; b.x += nx * p; b.y += ny * p; }
  }
  for (const f of al) { f.x = Math.max(BX + 30, Math.min(BX + COLS * CELL - 30, f.x)); f.y = Math.max(BY + 40, Math.min(BY + ROWS * CELL - 30, f.y)); }
  // projectiles
  for (const p of S.proj) {
    p.age += dt;
    if (p.t.alive) { p.tx = p.t.x; p.ty = p.t.y - (p.kind === 'meteor' ? 20 : 40); }
    const sp = PSPEED[p.kind] * dt, dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
    if (d <= sp) { p.done = true; p.onHit(); continue; }
    p.vx = dx / d; p.vy = dy / d; p.x += p.vx * sp; p.y += p.vy * sp;
    if (p.kind === 'orb' || p.kind === 'meteor' || p.kind === 'leaf' || p.kind === 'arrowGold')
      S.fx.push({ type: 'p', x: p.x + rand(-4, 4), y: p.y + rand(-4, 4), vx: 0, vy: 0, life: .35, max: .35,
        color: p.kind === 'leaf' ? '#9df59a' : p.kind === 'arrowGold' ? '#ffe28a' : p.kind === 'meteor' ? '#c9a2ff' : '#8fe3ff', size: p.kind === 'meteor' ? 14 : 7 });
  }
  S.proj = S.proj.filter(p => !p.done);
  const a = S.fighters.some(f => f.alive && f.team === 0), b = S.fighters.some(f => f.alive && f.team === 1);
  if (!a || !b || S.battleT > 60) {
    S.endT += dt;
    if (S.endT > 1.1 || S.battleT > 60) {
      let win = a && !b;
      if (a && b) { const hp = t => S.fighters.filter(f => f.team === t).reduce((s, f) => s + f.hp / f.maxhp, 0); win = hp(0) >= hp(1); }
      endBattle(win);
    }
  }
}
function endBattle(win) {
  const income = 5 + (win ? 2 : 0) + Math.min(Math.floor(S.gold / 10), 3);
  if (!win) S.lives--;
  S.streak = win ? S.streak + 1 : 0;
  S.result = { win, income, t: 0, aliveFoes: S.fighters.filter(f => f.alive && f.team === 1).length };
  if (S.lives <= 0) { S.phase = 'over'; saveBest(S.round - 1); }
  else if (win && S.round >= MAX_ROUND) { S.phase = 'victory'; saveBest(MAX_ROUND); }
  else S.phase = 'result';
}
function saveBest(r) { if (r > best) { best = r; try { localStorage.setItem('cozyArenaBest', r); } catch (e) {} } }
function nextRound() {
  S.round++; S.gold += S.result.income; S.fighters = []; S.proj = []; S.fx = []; S.texts = [];
  rollShop(); genEnemy(); S.phase = 'prep'; S.result = null;
  toast(`Pasukan boleh ada ${cap()} hero sekarang`);
}

/* ---------- effects ---------- */
function addText(x, y, s, color, size, life = .9) { S.texts.push({ x, y, s, color, size, t: 0, life }); }
function sparks(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(80, 260); S.fx.push({ type: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rand(.25, .5), max: .5, color, size: rand(3, 6), g: 500 }); } }
function burst(x, y, color, n) { for (let i = 0; i < n; i++) { const a = rand(0, 6.28), v = rand(120, 380); S.fx.push({ type: 'p', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, life: rand(.5, .9), max: .9, color, size: rand(4, 9), g: 600 }); } }
function ring(x, y, color) { S.fx.push({ type: 'ring', x, y: y + CELL * .3, life: .55, max: .55, color, r: 70 }); }
function boom(x, y, r, color) { S.fx.push({ type: 'boom', x, y, life: .4, max: .4, color, r }); sparks(x, y, color, 16); }
function slash(t, dir) { S.fx.push({ type: 'slash', x: t.x, y: t.y - 45, life: .22, max: .22, dir }); }
function updateFx(dt) {
  for (const p of S.fx) { p.life -= dt; if (p.type === 'p') { p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
  S.fx = S.fx.filter(p => p.life > 0);
  for (const t of S.texts) t.t += dt;
  S.texts = S.texts.filter(t => t.t < t.life);
  for (const tm of S.timers) { tm.t -= dt; if (tm.t <= 0) { tm.done = true; tm.fn(); } }
  S.timers = S.timers.filter(t => !t.done);
  if (S.toast && (S.toast.t -= dt) <= 0) S.toast = null;
  S.shake = Math.max(0, S.shake - dt);
}

/* ---------- drawing ---------- */
function drawBackground(t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#16303a'); g.addColorStop(.55, '#1d3a2f'); g.addColorStop(1, '#17261f');
  ctx.fillStyle = g; ctx.fillRect(-400, -400, W + 800, H + 800);
  // fireflies
  for (let i = 0; i < 18; i++) {
    const x = (i * 137 + Math.sin(t * .4 + i) * 30) % W, y = (i * 263 % H) + Math.cos(t * .5 + i * 2) * 20;
    ctx.globalAlpha = .25 + .25 * Math.sin(t * 2 + i); ctx.fillStyle = '#f9e27a';
    ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawBoard(t, dragging) {
  // wooden frame
  rr(BX - 16, BY - 16, COLS * CELL + 32, ROWS * CELL + 32, 22);
  ctx.fillStyle = '#5a3a22'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#2e1c10'; ctx.stroke();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x = BX + c * CELL, y = BY + r * CELL, odd = (r + c) % 2, mine = r >= 4;
    ctx.fillStyle = mine ? (odd ? '#5f9149' : '#6ca253') : (odd ? '#8a7350' : '#97805a');
    rr(x + 2, y + 2, CELL - 4, CELL - 4, 10); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.06)'; rr(x + 6, y + 6, CELL - 12, 14, 6); ctx.fill();
    if (dragging && mine) {
      const occ = S.units.some(u => u.where === 'board' && u.c === c && u.r === r && u !== dragging.u);
      ctx.strokeStyle = occ ? 'rgba(255,220,120,.5)' : 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]); rr(x + 8, y + 8, CELL - 16, CELL - 16, 8); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  // middle line
  ctx.strokeStyle = `rgba(255,214,120,${.35 + .15 * Math.sin(t * 2)})`; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(BX, BY + 4 * CELL); ctx.lineTo(BX + COLS * CELL, BY + 4 * CELL); ctx.stroke();
}
function drawHero(o) {
  const sz = CELL * 1.42 * (1 + .1 * (o.star - 1)), foot = o.y + CELL * .34;
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(o.x, foot, sz * .26, sz * .08, 0, 0, 7); ctx.fill();
  if (o.team !== undefined) {
    ctx.strokeStyle = o.team === 1 ? 'rgba(255,96,80,.9)' : 'rgba(110,240,170,.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(o.x, foot, sz * .3, sz * .1, 0, 0, 7); ctx.stroke();
  }
  ctx.translate(o.x + (o.lunge || 0), foot - (o.lift || 0)); ctx.scale(o.face, 1); if (o.rot) ctx.rotate(o.rot);
  if (o.squash) ctx.scale(1 + o.squash, 1 - o.squash);
  ctx.drawImage(IMG[o.type][o.pose], -sz / 2, -sz * .96, sz, sz);
  if (o.flash > 0) { ctx.globalAlpha = (o.alpha ?? 1) * Math.min(1, o.flash / .14) * .8; ctx.drawImage(IMG[o.type][o.pose + 'W'], -sz / 2, -sz * .96, sz, sz); }
  ctx.restore();
  if (o.shield > 0) {
    ctx.save(); ctx.globalAlpha = .35 + .15 * Math.sin(o.t * 8);
    const g = ctx.createRadialGradient(o.x, foot - sz * .4, sz * .1, o.x, foot - sz * .4, sz * .5);
    g.addColorStop(0, 'rgba(255,214,102,0)'); g.addColorStop(1, 'rgba(255,214,102,.8)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, foot - sz * .4, sz * .5, 0, 7); ctx.fill(); ctx.restore();
  }
  const top = foot - sz * .98;
  if (o.bars) {
    const w = 76, x = o.x - w / 2, y = top - 4;
    rr(x - 2, y - 2, w + 4, 15, 5); ctx.fillStyle = 'rgba(20,12,8,.85)'; ctx.fill();
    ctx.fillStyle = '#f4e3c0'; ctx.fillRect(x, y, w * Math.max(0, o.shownHp / o.maxhp), 8);
    ctx.fillStyle = o.team === 1 ? '#ff5a4a' : '#5fe07a'; ctx.fillRect(x, y, w * Math.max(0, o.hp / o.maxhp), 8);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 1; i < 4; i++) ctx.fillRect(x + w * i / 4, y, 1.5, 8);
    ctx.fillStyle = '#58c8ff'; ctx.fillRect(x, y + 9, w * o.mana / 100, 3);
  }
  if (o.star > 1 || o.bars) txt('★'.repeat(o.star), o.x, top - (o.bars ? 16 : 2), 20, o.star === 3 ? '#ff9cf0' : o.star === 2 ? '#c8e6ff' : '#ffd84a');
}
function fighterView(f, t) {
  const atk = f.atkAnim > 0, dying = f.dead > 0;
  return { type: f.type, star: f.star, x: f.x, y: f.y, face: f.face, team: f.team, pose: atk ? 'attack' : 'idle',
    lunge: atk ? Math.sin((1 - f.atkAnim / .32) * Math.PI) * 10 * f.face : 0,
    lift: f.walk > 0 ? Math.abs(Math.sin(f.walk * 11)) * 8 : Math.sin(t * 3 + f.id) * 1.5,
    squash: f.walk > 0 ? 0 : Math.sin(t * 3 + f.id) * .012,
    flash: f.flash, alpha: dying ? Math.max(0, 1 - f.dead / .7) : 1, rot: dying ? f.dead * .9 * -f.face : 0,
    bars: !dying, hp: f.hp, shownHp: f.shownHp, maxhp: f.maxhp, mana: f.mana, shield: f.shield, t };
}
function drawProj(p) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
  if (p.kind === 'arrow' || p.kind === 'arrowGold') {
    const gold = p.kind === 'arrowGold';
    if (gold) { ctx.shadowColor = '#ffd84a'; ctx.shadowBlur = 16; }
    ctx.strokeStyle = gold ? '#ffcf4a' : '#8a5428'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(12, 0); ctx.stroke();
    ctx.fillStyle = gold ? '#fff2b0' : '#dfe6ee'; ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(24, 0); ctx.lineTo(10, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = gold ? '#ffe9a0' : '#f6efe0'; ctx.beginPath(); ctx.moveTo(-28, -7); ctx.lineTo(-18, 0); ctx.lineTo(-28, 7); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fill();
  } else {
    const r = p.kind === 'meteor' ? 26 : p.kind === 'orb' ? 15 : 11;
    const col = p.kind === 'meteor' ? ['#ffffff', '#c9a2ff', 'rgba(110,60,255,0)'] : p.kind === 'orb' ? ['#ffffff', '#6fd8ff', 'rgba(40,120,255,0)'] : p.kind === 'leaf' ? ['#ffffff', '#8ef08a', 'rgba(60,200,80,0)'] : ['#ffffff', '#e7f59a', 'rgba(180,220,60,0)'];
    const g = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 1.8);
    g.addColorStop(0, col[0]); g.addColorStop(.35, col[1]); g.addColorStop(1, col[2]);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 1.8, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function drawFx() {
  for (const p of S.fx) {
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    if (p.type === 'p') { ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (.4 + .6 * a), 0, 7); ctx.fill(); }
    else if (p.type === 'ring') { ctx.strokeStyle = p.color; ctx.lineWidth = 5 * a; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * (1.4 - a), p.r * .35 * (1.4 - a), 0, 0, 7); ctx.stroke(); }
    else if (p.type === 'boom') { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * (1.1 - a * .5)); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.4, p.color); g.addColorStop(1, 'rgba(80,120,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.1 - a * .5), 0, 7); ctx.fill(); }
    else if (p.type === 'slash') { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7 * a; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(p.x - p.dir * 10, p.y, 34, -1.1 + (1 - a), .9 + (1 - a)); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
  for (const t of S.texts) {
    const a = 1 - t.t / t.life, s = t.size * (t.t < .1 ? .6 + t.t * 4 : 1);
    ctx.globalAlpha = Math.min(1, a * 2); txt(t.s, t.x, t.y - t.t * 50, s, t.color); ctx.globalAlpha = 1;
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
const REROLL = { x: BX + 4 * 126, y: SHOP_Y, w: 96, h: 190 };
function drawHud() {
  txt(`Pusingan ${S.round}/${MAX_ROUND}`, 30, 38, 34, '#ffe9b0', 'left');
  for (let i = 0; i < 5; i++) heart(42 + i * 34, 80, 26, i < S.lives);
  coin(232, 80, 15); txt(String(S.gold), 256, 81, 32, '#ffd84a', 'left');
  if (S.streak >= 2) txt(`Menang ${S.streak} kali`, 330, 81, 22, '#9df59a', 'left');
  if (S.phase === 'prep') btn(FIGHT_BTN.x, FIGHT_BTN.y, FIGHT_BTN.w, FIGHT_BTN.h, 'LAWAN!', '#ef7a2f', onBoard().length > 0, 38);
  if (S.phase === 'battle') btn(SPEED_BTN.x, SPEED_BTN.y, SPEED_BTN.w, SPEED_BTN.h, `x${S.speed}`, '#4f86c6', true, 30);
}
function drawBenchAndShop(t, drag) {
  // bench
  rr(BX - 16, BENCH_Y - 8, COLS * CELL + 32, CELL + 16, 18); ctx.fillStyle = 'rgba(30,18,10,.55)'; ctx.fill();
  for (let i = 0; i < 6; i++) { rr(BX + i * CELL + 6, BENCH_Y + 6, CELL - 12, CELL - 12, 12); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill(); }
  const n = onBoard().length;
  txt(`Pasukan ${n}/${cap()}`, BX + COLS * CELL, BENCH_Y - 24, 24, n >= cap() ? '#ffd84a' : '#d8f5c8', 'right');
  txt('Bench', BX, BENCH_Y - 24, 24, '#d8c8b0', 'left');
  // shop
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
}

let drag = null;
function render(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#10191f'; ctx.fillRect(0, 0, cv.width, cv.height);
  const sx = S.shake > 0 ? rand(-8, 8) * S.shake * 3 : 0, sy = S.shake > 0 ? rand(-8, 8) * S.shake * 3 : 0;
  ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * (ox + sx * k), dpr * (oy + sy * k));
  if (S.phase === 'loading' || S.phase === 'title') return drawTitle(t);
  drawBackground(t);
  drawBoard(t, drag);
  const list = [];
  if (S.phase === 'prep') {
    for (const e of S.enemy) { const p = cellCenter(e.c, e.r); list.push({ type: e.type, star: e.star, x: p.x, y: p.y, face: -1, team: 1, pose: 'idle', lift: Math.sin(t * 3 + e.c + e.r) * 1.5 }); }
    for (const u of S.units) {
      if (drag && drag.u === u && drag.moved) continue;
      const p = unitPos(u);
      list.push({ type: u.type, star: u.star, x: p.x, y: p.y, face: 1, team: u.where === 'board' ? 0 : undefined, pose: 'idle', lift: Math.sin(t * 3 + u.id) * 1.5 });
    }
  } else {
    for (const f of S.fighters) if (f.alive || f.dead < .7) list.push(fighterView(f, t));
    if (S.phase !== 'battle') for (const u of S.units) if (u.where === 'bench') { const p = unitPos(u); list.push({ type: u.type, star: u.star, x: p.x, y: p.y, face: 1, pose: 'idle' }); }
  }
  if (S.phase === 'battle') for (const u of S.units) if (u.where === 'bench') { const p = unitPos(u); list.push({ type: u.type, star: u.star, x: p.x, y: p.y, face: 1, pose: 'idle', alpha: .6 }); }
  list.sort((a, b) => a.y - b.y).forEach(drawHero);
  for (const p of S.proj) drawProj(p);
  drawFx();
  drawHud();
  drawBenchAndShop(t, drag && drag.moved ? drag : null);
  if (drag && drag.moved) drawHero({ type: drag.u.type, star: drag.u.star, x: drag.x, y: drag.y - 30, face: 1, pose: 'idle', lift: 10 });
  if (S.phase === 'prep' && S.round === 1 && !onBoard().length && !drag) {
    ctx.globalAlpha = .7 + .3 * Math.sin(t * 4);
    txt(S.units.length ? 'Seret hero dari bench ke papan hijau' : 'Tekan kad hero untuk beli', W / 2, BY + 6 * CELL, 32, '#fff');
    ctx.globalAlpha = 1;
  }
  if (S.toast) { ctx.globalAlpha = Math.min(1, S.toast.t * 3); rr(80, BY + 4 * CELL - 34, W - 160, 68, 20); ctx.fillStyle = 'rgba(20,12,8,.85)'; ctx.fill(); txt(S.toast.msg, W / 2, BY + 4 * CELL, 26, '#fff', 'center', false, FB); ctx.globalAlpha = 1; }
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
  for (const u of S.units) { const q = unitPos(u); if (Math.abs(p.x - q.x) < CELL / 2 && Math.abs(p.y - q.y) < CELL / 2) return u; }
  return null;
}
cv.addEventListener('pointerdown', e => {
  const p = toLocal(e);
  if (S.phase === 'title') { newGame(); return; }
  if (S.phase === 'result') { nextRound(); return; }
  if (S.phase === 'over' || S.phase === 'victory') { S.phase = 'title'; return; }
  if (S.phase === 'battle') { if (inR(p, SPEED_BTN)) S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 3 : 1; return; }
  if (S.phase !== 'prep') return;
  if (inR(p, FIGHT_BTN)) return startBattle();
  if (inR(p, REROLL)) { if (S.gold >= 2) { S.gold -= 2; rollShop(); } else toast('Gold tak cukup'); return; }
  for (let i = 0; i < 4; i++) if (inR(p, { x: BX + i * 126, y: SHOP_Y, w: 118, h: 190 })) return buy(i);
  const u = unitAt(p);
  if (u) { drag = { u, x: p.x, y: p.y, sx: p.x, sy: p.y, moved: false }; cv.setPointerCapture(e.pointerId); }
});
cv.addEventListener('pointermove', e => {
  if (!drag) return; const p = toLocal(e); drag.x = p.x; drag.y = p.y;
  if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 10) drag.moved = true;
});
function endDrag(e) {
  if (!drag) return; const d = drag; drag = null;
  if (!d.moved || S.phase !== 'prep') return;
  const u = d.u, x = d.x, y = d.y - 30;
  const old = { where: u.where, slot: u.slot, c: u.c, r: u.r };
  let dest = null;
  const c = Math.floor((x - BX) / CELL), r = Math.floor((y - BY) / CELL);
  if (c >= 0 && c < COLS && r >= 4 && r < ROWS) dest = { where: 'board', c, r };
  else if (c >= 0 && c < COLS && y >= BENCH_Y - 10 && y <= BENCH_Y + CELL + 10) dest = { where: 'bench', slot: c };
  else if (d.y >= SHOP_Y - 20) return sell(u);
  if (!dest) return;
  const occ = S.units.find(o => o !== u && o.where === dest.where && (dest.where === 'board' ? o.c === dest.c && o.r === dest.r : o.slot === dest.slot));
  if (dest.where === 'board' && old.where !== 'board' && !occ && onBoard().length >= cap()) return toast(`Pasukan dah penuh (${cap()}). Naik pusingan untuk tambah`);
  Object.assign(u, dest);
  if (occ) Object.assign(occ, old);
}
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', () => { drag = null; });

/* ---------- loop ---------- */
let last = 0;
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
  if (S.phase !== 'loading' && S.phase !== 'title') {
    if (S.phase === 'battle') { for (let i = 0; i < S.speed; i++) { updateBattle(dt); if (S.phase !== 'battle') break; updateFx(dt); } }
    else updateFx(dt);
  }
  render(ts / 1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
Promise.all([loadAll(), document.fonts ? document.fonts.load(`40px 'Lilita One'`).catch(() => {}) : 0])
  .then(() => { S.phase = 'title'; })
  .catch(err => { S.phase = 'title'; console.error(err); });
