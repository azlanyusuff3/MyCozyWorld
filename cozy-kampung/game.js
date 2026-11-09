'use strict';
/* Cozy Kampung Plot — Dots and Boxes, tema kampung.
   Art: semua dilukis guna SVG. Kalau ada sprite dalam sprites/list.json, sprite tu ganti lukisan SVG. */
const GAME_VERSION = 'v1';
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const store = {
  get(k, d) { try { const v = localStorage.getItem('kampung_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('kampung_' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- Watak ---------- */
const P1 = { name: 'Mimi', emoji: '🐱', sprite: 'av_mimi', color: '#e0574a', roof: 'merah' };
const P2 = { name: 'Pipi', emoji: '🐼', sprite: 'av_pipi', color: '#3b7dd8', roof: 'biru' };
const AIS = {
  easy: { name: 'Koko', emoji: '🐤', sprite: 'av_koko', label: 'Senang', talk: { cap: ['Yeay dapat! 🐣', 'Ciap ciap!'], win: ['Koko menang?! Ciap!'], lose: ['Alaa... tahniah! 🐥'] } },
  medium: { name: 'Bubu', emoji: '🐰', sprite: 'av_bubu', label: 'Sederhana', talk: { cap: ['Hehe, plot ni Bubu punya~', 'Hop hop!'], win: ['Bubu menang! 🥕'], lose: ['Pandai la awak!'] } },
  hard: { name: 'Sensei Belang', emoji: '🐯', sprite: 'av_belang', label: 'Susah', talk: { cap: ['Grrr... sedap.', 'Semua ni aku punya 😼'], dc: ['Nah, ambik la 2 kotak tu... hehe 😼', 'Hadiah untuk kau. Percuma... kononnya.'], win: ['Sensei sentiasa menang. 🐯'], lose: ['Hmm... kau dah belajar rupanya.'] } }
};
const SPR = {}; // nama -> url
fetch('sprites/list.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).catch(() => []).then(l => {
  l.forEach(n => { SPR[n] = 'sprites/' + n + '.webp'; new Image().src = SPR[n]; });
  renderMenu(); if (G) { buildBoard(); updateHud(); }
});

/* ---------- Bunyi (synth) ---------- */
let AC = null, soundOn = store.get('sound', true);
function tone(f, d = .12, type = 'sine', v = .18, f2) {
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
  tok: () => { tone(320, .08, 'triangle', .2, 180); },
  pop: n => { tone(520 + n * 90, .16, 'sine', .22, 900 + n * 120); setTimeout(() => tone(1200 + n * 80, .1, 'triangle', .08), 70); },
  combo: () => [660, 880, 1100].forEach((f, i) => setTimeout(() => tone(f, .14, 'triangle', .15), i * 70)),
  win: () => [523, 659, 784, 1046, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, .22, 'triangle', .17), i * 130)),
  lose: () => [440, 392, 349, 294].forEach((f, i) => setTimeout(() => tone(f, .25, 'sine', .15), i * 160))
};
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

/* ---------- Lukisan SVG ---------- */
function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e); return e;
}
// Semua objek dilukis dalam kotak 100x100 (tapak di bawah, y~92)
const ART = {
  rumah(color) {
    return `<ellipse cx="50" cy="93" rx="38" ry="6" fill="#00000022"/>
    <g stroke="#6b4423" stroke-width="2.5" stroke-linejoin="round">
    <rect x="24" y="74" width="5" height="18" fill="#8a5a33"/><rect x="71" y="74" width="5" height="18" fill="#8a5a33"/><rect x="47" y="74" width="5" height="18" fill="#8a5a33"/>
    <path d="M40 92 l6 -18 h8 l6 18" fill="none" stroke-width="2"/>
    <rect x="20" y="48" width="60" height="28" rx="2" fill="#d9a066"/>
    <path d="M20 56h60M20 64h60" stroke="#b97f45" stroke-width="1.5"/>
    <rect x="30" y="54" width="13" height="13" rx="2" fill="#ffe9a8"/><rect x="57" y="54" width="13" height="13" rx="2" fill="#ffe9a8"/>
    <path d="M36.5 54v13M63.5 54v13" stroke-width="1.5"/>
    <path d="M10 50 L50 18 L90 50 Z" fill="${color}"/>
    <path d="M44 23 L50 10 L56 23" fill="${color}"/></g>
    <path d="M22 46 L50 24" stroke="#ffffff77" stroke-width="3" stroke-linecap="round"/>`;
  },
  pisang() {
    return `<ellipse cx="50" cy="93" rx="26" ry="5" fill="#00000022"/>
    <g class="sway"><path d="M47 92 Q45 60 50 38 Q55 60 53 92Z" fill="#8fae4a" stroke="#5e7a2a" stroke-width="2.5"/>
    <g fill="#7cc24a" stroke="#4f8a2a" stroke-width="2.5" stroke-linejoin="round">
    <path d="M50 40 Q30 18 8 30 Q28 34 50 44Z"/><path d="M50 40 Q72 16 94 28 Q72 34 50 44Z"/>
    <path d="M50 38 Q40 8 22 6 Q34 24 48 42Z"/><path d="M50 38 Q62 8 80 8 Q66 24 52 42Z"/></g>
    <g fill="#f4d23c" stroke="#b3901a" stroke-width="1.5"><path d="M54 50 q8 2 8 10 q-6 -2 -8 -10z"/><path d="M54 56 q9 3 7 12 q-6 -3 -7 -12z"/></g></g>`;
  },
  kelapa() {
    return `<ellipse cx="46" cy="93" rx="24" ry="5" fill="#00000022"/>
    <g class="sway"><path d="M40 92 Q44 60 58 30 L64 32 Q52 62 48 92Z" fill="#b98652" stroke="#6b4423" stroke-width="2.5"/>
    <path d="M44 80h8M46 68h8M49 56h9M53 44h8" stroke="#8a5a33" stroke-width="2"/>
    <g fill="#5fb84a" stroke="#3b7a2a" stroke-width="2.5" stroke-linejoin="round">
    <path d="M61 30 Q40 12 16 26 Q38 24 60 34Z"/><path d="M61 30 Q82 10 96 30 Q80 24 62 34Z"/>
    <path d="M61 30 Q56 6 36 4 Q52 14 58 32Z"/><path d="M61 30 Q76 40 84 58 Q70 42 60 34Z"/><path d="M61 30 Q46 42 36 58 Q48 40 60 33Z"/></g>
    <circle cx="57" cy="36" r="5" fill="#7a4a22"/><circle cx="65" cy="37" r="5" fill="#7a4a22"/></g>`;
  },
  reban() {
    return `<ellipse cx="50" cy="93" rx="36" ry="5" fill="#00000022"/>
    <g stroke="#6b4423" stroke-width="2.5" stroke-linejoin="round">
    <rect x="22" y="56" width="48" height="34" fill="#e3b77a"/><path d="M30 56v34M38 56v34M46 56v34M54 56v34M62 56v34" stroke="#c4955a" stroke-width="2"/>
    <path d="M16 58 L46 36 L76 58Z" fill="#c8693f"/><path d="M38 90 v-16 q8 -8 16 0 v16z" fill="#5a3a20"/></g>
    <g stroke="#b3741a" stroke-width="2"><ellipse cx="80" cy="84" rx="10" ry="9" fill="#ffd94a"/><circle cx="83" cy="73" r="7" fill="#ffd94a"/></g>
    <circle cx="85" cy="72" r="1.6" fill="#3a2a1a"/><path d="M89 74 l5 1 -5 2z" fill="#f08a2a"/><path d="M82 66 q1 -4 4 -3" stroke="#e05a4a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  },
  wakaf() {
    return `<ellipse cx="50" cy="93" rx="36" ry="5" fill="#00000022"/>
    <g stroke="#6b4423" stroke-width="2.5" stroke-linejoin="round">
    <rect x="22" y="48" width="5" height="44" fill="#8a5a33"/><rect x="73" y="48" width="5" height="44" fill="#8a5a33"/>
    <rect x="18" y="72" width="64" height="7" rx="2" fill="#c48a55"/>
    <path d="M10 50 L50 20 L90 50Z" fill="#a8763f"/><path d="M50 20 l0 -8" /></g>
    <path d="M16 50 Q30 56 50 50 Q70 56 84 50" stroke="#e8c27a" stroke-width="3" fill="none"/>
    <circle cx="50" cy="11" r="3" fill="#f6b93b" stroke="#6b4423" stroke-width="2"/>`;
  },
  // Pancang (titik)
  pancang() {
    return `<ellipse cx="0" cy="6" rx="9" ry="4" fill="#00000030"/><rect x="-6" y="-12" width="12" height="18" rx="4" fill="#9a6538" stroke="#5e3b1f" stroke-width="2.5"/><ellipse cx="0" cy="-12" rx="6" ry="3" fill="#d8a06a" stroke="#5e3b1f" stroke-width="2"/>`;
  },
  rumput() {
    return `<path d="M0 0 q2 -7 3 0 q2 -9 3 0 q2 -6 3 0" fill="none" stroke="#7fbd55" stroke-width="2" stroke-linecap="round"/>`;
  },
  bunga(c) {
    return `<g><circle cx="0" cy="0" r="2.6" fill="${c}"/><circle cx="0" cy="0" r="1.1" fill="#fff6c4"/></g>`;
  }
};

/* ---------- Avatar ---------- */
function avHTML(who) { return SPR[who.sprite] ? `<img src="${SPR[who.sprite]}" alt="">` : who.emoji; }

/* ---------- Tetapan & menu ---------- */
const S = store.get('settings', { mode: 'ai', level: 'medium', size: 5 });
function renderMenu() {
  document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === S.mode));
  document.querySelectorAll('#sizeSeg button').forEach(b => b.classList.toggle('on', +b.dataset.v === S.size));
  $('#levelBox').classList.toggle('hidden', S.mode !== 'ai');
  $('#levelSeg').innerHTML = Object.keys(AIS).map(k => `<button data-v="${k}" type="button" class="${k === S.level ? 'on' : ''}"><span class="av">${avHTML(AIS[k])}</span>${AIS[k].name}<small>${AIS[k].label}</small></button>`).join('');
  $('#titleArt').innerHTML = `<svg viewBox="0 0 240 110">${['<g transform="translate(0,8)">' + ART.kelapa() + '</g>', '<g transform="translate(70,0) scale(1.05)">' + ART.rumah(P1.color) + '</g>', '<g transform="translate(140,10) scale(.95)">' + ART.reban() + '</g>'].join('')}</svg>`;
  $('#soundBtn').textContent = soundOn ? '🔊' : '🔇';
}
$('#modeSeg').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.mode = b.dataset.v; store.set('settings', S); renderMenu(); };
$('#sizeSeg').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.size = +b.dataset.v; store.set('settings', S); renderMenu(); };
$('#levelSeg').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.level = b.dataset.v; store.set('settings', S); renderMenu(); tone(700, .08, 'triangle', .12); };
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set('sound', soundOn); renderMenu(); };
$('#startBtn').onclick = () => startGame();
$('#menuBtn').onclick = $('#endMenuBtn').onclick = () => showMenu();
$('#restartBtn').onclick = $('#againBtn').onclick = () => startGame();
$('#viewBtn').onclick = () => $('#endModal').classList.add('hidden');
function showMenu() { clearTimeout(aiTimer); G = null; $('#endModal').classList.add('hidden'); $('#play').classList.add('hidden'); $('#menu').classList.remove('hidden'); renderMenu(); }

/* ---------- Model papan ----------
   n×n plot. Garisan mendatar: (n+1)*n, menegak: n*(n+1). Satu array L (0/1). */
let G = null, aiTimer = 0;
function makeGeom(n) {
  const HC = (n + 1) * n, VC = n * (n + 1), N = HC + VC;
  const h = (r, c) => r * n + c, v = (r, c) => HC + r * (n + 1) + c;
  const boxLines = [], lineBoxes = Array.from({ length: N }, () => []);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const b = r * n + c, ls = [h(r, c), h(r + 1, c), v(r, c), v(r, c + 1)];
    boxLines.push(ls); ls.forEach(l => lineBoxes[l].push(b));
  }
  const ends = [];
  for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) ends[h(r, c)] = [r, c, r, c + 1];
  for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) ends[v(r, c)] = [r, c, r + 1, c];
  return { n, N, boxLines, lineBoxes, ends };
}
const sides = (L, geo, b) => geo.boxLines[b].reduce((s, l) => s + L[l], 0);

function startGame() {
  clearTimeout(aiTimer);
  const n = S.size, geo = makeGeom(n);
  const opp = S.mode === 'ai' ? AIS[S.level] : P2;
  G = { geo, L: new Uint8Array(geo.N), owner: new Int8Array(n * n).fill(-1), objs: [], turn: 0, score: [0, 0], last: -1, streak: 0, over: false,
    who: [P1, { ...opp, color: P2.color, roof: P2.roof }], ai: S.mode === 'ai', lineOwner: new Int8Array(geo.N).fill(-1) };
  $('#menu').classList.add('hidden'); $('#endModal').classList.add('hidden'); $('#play').classList.remove('hidden');
  hideBubble(); buildBoard(); updateHud();
}

/* ---------- Render papan ---------- */
const CS = 100, PAD = 34;
function buildBoard() {
  const { n, N, ends } = G.geo, W = n * CS + PAD * 2, svg = $('#board');
  svg.setAttribute('viewBox', `0 0 ${W} ${W}`); svg.innerHTML = '';
  const defs = el('defs', {}, svg);
  defs.innerHTML = `<radialGradient id="gr" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#c4ec9c"/><stop offset="1" stop-color="#a9db80"/></radialGradient>`;
  const ground = el('g', {}, svg);
  // rumput dan bunga hiasan (tetap ikut seed supaya tak berubah bila render semula)
  let seed = n * 977;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let b = 0; b < n * n; b++) {
    const r = Math.floor(b / n), c = b % n, x = PAD + c * CS, y = PAD + r * CS;
    el('rect', { x: x + 3, y: y + 3, width: CS - 6, height: CS - 6, rx: 12, fill: 'url(#gr)', class: 'plot-tint', id: 'plot' + b }, ground);
    for (let i = 0; i < 3; i++) { const g = el('g', { transform: `translate(${x + 15 + rnd() * 62},${y + 20 + rnd() * 66})` }, ground); g.innerHTML = rnd() < .7 ? ART.rumput() : ART.bunga(['#ff8fb1', '#fff', '#ffd23f'][Math.floor(rnd() * 3)]); }
  }
  G.objLayer = el('g', {}, svg);
  G.fenceLayer = el('g', {}, svg);
  const hitLayer = el('g', {}, svg);
  G.hits = [];
  for (let l = 0; l < N; l++) {
    const [r1, c1, r2, c2] = ends[l], x1 = PAD + c1 * CS, y1 = PAD + r1 * CS, x2 = PAD + c2 * CS, y2 = PAD + r2 * CS, horiz = r1 === r2;
    const g = el('g', { 'data-l': l }, hitLayer);
    const hit = el('rect', horiz ? { x: x1 + 12, y: y1 - 22, width: CS - 24, height: 44, class: 'hit' } : { x: x1 - 22, y: y1 + 12, width: 44, height: CS - 24, class: 'hit' }, g);
    el('line', { x1: horiz ? x1 + 16 : x1, y1: horiz ? y1 : y1 + 16, x2: horiz ? x2 - 16 : x2, y2: horiz ? y2 : y2 - 16, class: 'guide' }, g);
    G.hits[l] = g;
  }
  const dotLayer = el('g', {}, svg);
  for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) { const g = el('g', { transform: `translate(${PAD + c * CS},${PAD + r * CS + 4})` }, dotLayer); g.innerHTML = ART.pancang(); }
  // lukis semula state sedia ada (contoh: lepas sprite load)
  for (let l = 0; l < N; l++) if (G.L[l]) drawFence(l, false);
  G.owner.forEach((o, b) => { if (o >= 0) drawPlot(b, o, false); });
  markLast();
  svg.classList.toggle('locked', isAiTurn() || G.over);
}
function drawFence(l, anim = true) {
  const { ends } = G.geo, [r1, c1, r2, c2] = ends[l];
  const x1 = PAD + c1 * CS, y1 = PAD + r1 * CS, x2 = PAD + c2 * CS, y2 = PAD + r2 * CS, horiz = r1 === r2;
  G.hits[l].style.display = 'none';
  const tie = G.who[G.lineOwner[l]].color;
  const g = el('g', { class: 'fence', id: 'f' + l, style: `--len:${CS}` }, G.fenceLayer);
  const a = { x1, y1, x2, y2, 'stroke-linecap': 'round' };
  el('line', { ...a, stroke: tie, 'stroke-width': 20, class: 'glow' }, g);
  el('line', { ...a, stroke: '#9c7a2c', 'stroke-width': 12, class: anim ? 'pole' : '' }, g);
  el('line', { ...a, stroke: '#e9c96a', 'stroke-width': 7, class: anim ? 'pole' : '' }, g);
  el('line', { ...a, stroke: '#fff3b8', 'stroke-width': 2, transform: horiz ? 'translate(0,-2)' : 'translate(-2,0)', class: anim ? 'pole' : '' }, g);
  // ruas buluh + ikatan warna pemain
  [.33, .66].forEach(t => {
    const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
    el('line', horiz ? { x1: x, y1: y - 6, x2: x, y2: y + 6 } : { x1: x - 6, y1: y, x2: x + 6, y2: y }, g).setAttribute('style', 'stroke:#8a6a22;stroke-width:2.5');
  });
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  el('rect', horiz ? { x: mx - 4, y: my - 7, width: 8, height: 14, rx: 3, fill: tie } : { x: mx - 7, y: my - 4, width: 14, height: 8, rx: 3, fill: tie }, g);
  if (!anim) g.querySelectorAll('.pole').forEach(p => p.classList.remove('pole'));
}
function markLast() {
  document.querySelectorAll('.fence.last').forEach(f => f.classList.remove('last'));
  if (G.last >= 0) { const f = document.getElementById('f' + G.last); if (f) f.classList.add('last'); }
}
function pickObj(b, owner) {
  if (G.objs[b]) return G.objs[b];
  const r = Math.random();
  return (G.objs[b] = r < .45 ? 'rumah' : r < .62 ? 'pisang' : r < .77 ? 'kelapa' : r < .9 ? 'reban' : 'wakaf');
}
function drawPlot(b, owner, anim = true) {
  const n = G.geo.n, r = Math.floor(b / n), c = b % n, x = PAD + c * CS, y = PAD + r * CS, who = G.who[owner];
  const tint = document.getElementById('plot' + b);
  tint.setAttribute('fill', owner === 0 ? '#f7c7b4' : '#bfd6f7');
  const kind = pickObj(b, owner);
  const outer = el('g', { transform: `translate(${x},${y})` }, G.objLayer);
  const inner = el('g', { class: anim ? 'obj-in' : '' }, outer);
  const sprName = kind === 'rumah' ? 'rumah_' + who.roof : kind;
  if (SPR[sprName]) el('image', { href: SPR[sprName], x: 6, y: 4, width: 88, height: 92 }, inner);
  else inner.innerHTML = `<g transform="translate(8,6) scale(.84)">${ART[kind](who.color)}</g>`;
  // bendera kecil penanda pemilik (selain rumah yang dah ada warna bumbung)
  if (kind !== 'rumah') { const f = el('g', { transform: 'translate(12,14)' }, inner); f.innerHTML = `<path d="M0 0v26" stroke="#6b4423" stroke-width="2.5"/><path d="M1 1 l16 5 -16 6z" fill="${who.color}" stroke="#6b4423" stroke-width="1.5"/>`; }
  if (anim) { const s = el('text', { x: x + 50, y: y + 40, 'text-anchor': 'middle', 'font-size': 28, class: 'spark' }, G.objLayer); s.textContent = '✨'; setTimeout(() => s.remove(), 800); }
}

/* ---------- HUD ---------- */
function updateHud() {
  [0, 1].forEach(i => {
    const p = $('#p' + i), w = G.who[i];
    p.style.setProperty('--pc', w.color);
    p.querySelector('.av').innerHTML = avHTML(w);
    p.querySelector('.nm').textContent = w.name;
    p.querySelector('.sc').textContent = G.score[i];
    p.classList.toggle('on', !G.over && G.turn === i);
  });
  const left = G.geo.n ** 2 - G.score[0] - G.score[1];
  $('#turnLbl').innerHTML = G.over ? 'Kampung dah siap! 🎉' : isAiTurn() ? `${G.who[1].name} tengah fikir... 🤔` : `Giliran <b style="color:${G.who[G.turn].color}">${G.who[G.turn].name}</b> · ${left} plot lagi`;
}
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); }
let bubbleT = 0;
function say(key) {
  if (!G.ai) return; const lines = G.who[1].talk && G.who[1].talk[key]; if (!lines) return;
  const b = $('#bubble'); b.textContent = lines[Math.floor(Math.random() * lines.length)]; b.classList.remove('hidden');
  clearTimeout(bubbleT); bubbleT = setTimeout(hideBubble, 2600);
}
function hideBubble() { $('#bubble').classList.add('hidden'); }

/* ---------- Gerakan ---------- */
const isAiTurn = () => G && G.ai && G.turn === 1 && !G.over;
$('#board').addEventListener('click', e => {
  const g = e.target.closest('[data-l]'); if (!g || !G || G.over || isAiTurn()) return;
  play(+g.dataset.l);
});
function play(l) {
  if (G.L[l]) return;
  const geo = G.geo; G.L[l] = 1; G.lineOwner[l] = G.turn;
  drawFence(l); G.last = l; markLast(); SFX.tok(); buzz(8);
  let got = 0;
  geo.lineBoxes[l].forEach(b => { if (G.owner[b] < 0 && sides(G.L, geo, b) === 4) { G.owner[b] = G.turn; G.score[G.turn]++; got++; drawPlot(b, G.turn); } });
  if (got) {
    G.streak += got; setTimeout(() => SFX.pop(G.streak), 120); buzz(25);
    if (G.streak >= 2) { toast(G.streak >= 4 ? `Mega Combo x${G.streak}! 🔥` : `Combo x${G.streak}!`); SFX.combo(); }
    if (G.ai && G.turn === 1 && Math.random() < .3) say('cap');
  } else { G.streak = 0; G.turn ^= 1; }
  if (G.score[0] + G.score[1] === geo.n ** 2) return endGame();
  updateHud();
  $('#board').classList.toggle('locked', isAiTurn());
  if (isAiTurn()) aiTimer = setTimeout(aiMove, got ? 420 : 650);
}
function endGame() {
  G.over = true; updateHud(); $('#board').classList.add('locked');
  const [a, b] = G.score, win = a === b ? -1 : a > b ? 0 : 1;
  setTimeout(() => {
    const w = win < 0 ? null : G.who[win];
    $('#endAv').innerHTML = w ? avHTML(w) : '🤝';
    $('#endTitle').textContent = w ? (G.ai && win === 1 ? `${w.name} menang!` : `${w.name} menang! 🎉`) : 'Seri!';
    $('#endText').textContent = `${G.who[0].name} ${a} plot · ${G.who[1].name} ${b} plot` + (w ? ` — kampung ${w.name} lagi besar!` : ' — kampung sama besar!');
    $('#endModal').classList.remove('hidden');
    if (G.ai && win === 1) { SFX.lose(); say('win'); } else { SFX.win(); if (G.ai) say('lose'); }
    if (G.ai && win === 0) { const k = 'wins_' + S.level; store.set(k, store.get(k, 0) + 1); }
  }, 700);
}

/* ---------- AI ---------- */
// Garisan yang terus tutup plot
const isCapture = (L, geo, l) => geo.lineBoxes[l].some(b => sides(L, geo, b) === 3);
// Selamat = tak bagi mana-mana plot jadi 3 sisi
const isSafe = (L, geo, l) => geo.lineBoxes[l].every(b => sides(L, geo, b) <= 1);
// Berapa plot lawan boleh sapu kalau dia ambil semua (tamak)
function greedyGain(L0, geo) {
  const L = L0.slice(); let total = 0, found = true;
  while (found) {
    found = false;
    for (let l = 0; l < geo.N; l++) if (!L[l] && isCapture(L, geo, l)) {
      L[l] = 1; total += geo.lineBoxes[l].filter(b => sides(L, geo, b) === 4).length; found = true;
    }
  }
  return total;
}
const pick = a => a[Math.floor(Math.random() * a.length)];
function minSacrifice(L, geo, avail) {
  let best = [], bestCost = 1e9;
  avail.forEach(l => { const T = L.slice(); T[l] = 1; const c = greedyGain(T, geo); if (c < bestCost) { bestCost = c; best = [l]; } else if (c === bestCost) best.push(l); });
  return pick(best);
}
function chooseMove(level) {
  const { L, geo } = G, avail = [];
  for (let l = 0; l < geo.N; l++) if (!L[l]) avail.push(l);
  const caps = avail.filter(l => isCapture(L, geo, l)), safe = avail.filter(l => isSafe(L, geo, l));
  if (level === 'easy') {
    if (caps.length && Math.random() < .65) return pick(caps);
    if (safe.length && Math.random() < .5) return pick(safe);
    return pick(avail);
  }
  if (caps.length) {
    if (level === 'hard' && caps.length === 1 && safe.length === 0) {
      // Double-cross: tinggal 2 plot hujung rantai -> bagi kat lawan, simpan "control"
      const l = caps[0], bs = geo.lineBoxes[l];
      const B = bs.find(b => G.owner[b] < 0 && sides(L, geo, b) === 2);
      const unclaimed = G.owner.filter(o => o < 0).length;
      if (B != null && unclaimed - 2 >= 3) {
        const M = geo.boxLines[B].find(x => !L[x] && x !== l);
        if (M != null) {
          const C = geo.lineBoxes[M].find(b => b !== B);
          if (C == null || sides(L, geo, C) <= 1) {
            const T = L.slice(); T[M] = 1;
            // pastikan lepas lawan ambil 2 tu, dia kena bukak rantai lain untuk kita
            if (greedyGain(T, geo) === 2) { G.dc = true; return M; }
          }
        }
      }
    }
    return pick(caps);
  }
  if (safe.length) {
    if (level === 'hard') {
      // Elak garisan yang buat plot jadi 2 sisi kalau boleh (simpan pilihan selamat lebih lama)
      const calm = safe.filter(l => geo.lineBoxes[l].every(b => sides(L, geo, b) === 0));
      if (calm.length && Math.random() < .6) return pick(calm);
    }
    return pick(safe);
  }
  return minSacrifice(L, geo, avail);
}
function aiMove() {
  if (!isAiTurn()) return;
  G.dc = false;
  const l = chooseMove(S.level);
  if (G.dc) say('dc');
  play(l);
}

renderMenu();
