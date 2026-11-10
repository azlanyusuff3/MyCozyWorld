'use strict';
/* Titik Titik — Kepung Titik (Dots) atas kertas graf buku latihan zaman sekolah.
   Art: semua dilukis guna SVG. Kalau ada sprite dalam sprites/list.json, sprite tu ganti lukisan SVG. */
const GAME_VERSION = 'v2';
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const store = {
  get(k, d) { try { const v = localStorage.getItem('kampung_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('kampung_' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- Watak ---------- */
const P1 = { name: 'Mimi', emoji: '🐱', sprite: 'av_mimi', color: '#2346b0', roof: 'biru' };
const P2 = { name: 'Pipi', emoji: '🐼', sprite: 'av_pipi', color: '#d1342f', roof: 'merah' };
const AIS = {
  easy: { name: 'Koko', emoji: '🐤', sprite: 'av_koko', label: 'Senang', talk: { cap: ['Yeay kena kepung! 🐣', 'Ciap ciap!'], win: ['Koko menang?! Ciap!'], lose: ['Alaa... tahniah! 🐥'] } },
  medium: { name: 'Bubu', emoji: '🐰', sprite: 'av_bubu', label: 'Sederhana', talk: { cap: ['Hehe, terkepung~', 'Hop hop!'], win: ['Bubu menang! 🥕'], lose: ['Pandai la awak!'] } },
  hard: { name: 'Sensei Belang', emoji: '🐯', sprite: 'av_belang', label: 'Susah', talk: { cap: ['Grrr... sedap.', 'Semua ni aku punya 😼'], win: ['Sensei sentiasa menang. 🐯'], lose: ['Hmm... kau dah belajar rupanya.'] } }
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
/* ---------- Avatar ---------- */
function avHTML(who) { return SPR[who.sprite] ? `<img src="${SPR[who.sprite]}" alt="">` : who.emoji; }

/* ---------- Tetapan & menu ---------- */
const SIZES = { s: [10, 13], m: [15, 19], l: [20, 26] }; // [lajur, baris]
const S = store.get('settings2', { mode: 'ai', level: 'medium', size: 'l' });
if (!SIZES[S.size]) S.size = 'l';
function renderMenu() {
  document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === S.mode));
  document.querySelectorAll('#sizeSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === S.size));
  $('#levelBox').classList.toggle('hidden', S.mode !== 'ai');
  $('#levelSeg').innerHTML = Object.keys(AIS).map(k => `<button data-v="${k}" type="button" class="${k === S.level ? 'on' : ''}"><span class="av">${avHTML(AIS[k])}</span>${AIS[k].name}<small>${AIS[k].label}</small></button>`).join('');
  const B = P1.color, R = P2.color;
  const dots = [[40,30,B],[70,30,B],[25,55,B],[85,55,B],[40,80,B],[70,80,B],[55,55,R],[120,40,R],[150,40,R],[105,65,R],[165,65,R],[135,90,R],[135,62,B],[20,95,R],[185,20,B],[100,100,B]];
  $('#titleArt').innerHTML = `<svg viewBox="0 0 200 115"><g stroke="#bcd3ef" stroke-width="1">${Array.from({length:14},(_,i)=>`<line x1="${i*15}" y1="0" x2="${i*15}" y2="115"/>`).join('')}${Array.from({length:8},(_,i)=>`<line x1="0" y1="${i*15+5}" x2="200" y2="${i*15+5}"/>`).join('')}</g>
    <g fill="none" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M40 30 L70 30 L85 55 L70 80 L40 80 L25 55Z" stroke="${B}" fill="${B}18"/><path d="M120 40 L150 40 L165 65 L135 90 L105 65Z" stroke="${R}" fill="${R}18"/></g>
    ${dots.map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${c}" stroke-width="3"/>`).join('')}</svg>`;
  $('#soundBtn').textContent = soundOn ? '🔊' : '🔇';
}
$('#modeSeg').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.mode = b.dataset.v; store.set('settings2', S); renderMenu(); };
$('#sizeSeg').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.size = b.dataset.v; store.set('settings2', S); renderMenu(); };
$('#levelSeg').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.level = b.dataset.v; store.set('settings2', S); renderMenu(); tone(700, .08, 'triangle', .12); };
$('#soundBtn').onclick = () => { soundOn = !soundOn; store.set('sound', soundOn); renderMenu(); };
$('#startBtn').onclick = () => startGame();
$('#menuBtn').onclick = $('#endMenuBtn').onclick = () => showMenu();
$('#restartBtn').onclick = $('#againBtn').onclick = () => startGame();
$('#viewBtn').onclick = () => $('#endModal').classList.add('hidden');
$('#finishBtn').onclick = () => { if (G && !G.over && confirm('Tamatkan game dan kira markah sekarang?')) endGame(); };
let zoom = store.get('zoom', 1);
$('#zoomBtn').onclick = () => { zoom = zoom === 1 ? 1.7 : zoom === 1.7 ? 2.4 : 1; store.set('zoom', zoom); applyZoom(); };
function showMenu() { clearTimeout(aiTimer); G = null; $('#endModal').classList.add('hidden'); $('#play').classList.add('hidden'); $('#menu').classList.remove('hidden'); renderMenu(); }

/* ---------- Model ----------
   Titik atas persimpangan grid W×H. own: -1 kosong / 0 / 1. cap: titik dah kena tangkap.
   dead: titik kosong dalam kawasan yang dah dikepung (tak boleh letak). */
let G = null, aiTimer = 0;
function startGame() {
  clearTimeout(aiTimer);
  const [W, H] = SIZES[S.size], N = W * H;
  const opp = S.mode === 'ai' ? AIS[S.level] : P2;
  G = { W, H, N, own: new Int8Array(N).fill(-1), cap: new Uint8Array(N), dead: new Uint8Array(N), turn: 0, score: [0, 0], last: -1, moves: 0, over: false,
    who: [P1, { ...opp, color: P2.color }], ai: S.mode === 'ai', regions: [], ghost: -1 };
  $('#menu').classList.add('hidden'); $('#endModal').classList.add('hidden'); $('#play').classList.remove('hidden');
  hideBubble(); buildBoard(); updateHud();
  const wrap = $('#boardWrap'); wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2; wrap.scrollTop = 0;
}

/* Cari kawasan yang dikepung oleh p. Flood 4-arah dari tepi kertas melalui semua titik yang bukan dinding p.
   Titik yang tak sampai = terkepung. Kawasan dikira hanya kalau ada titik lawan yang masih hidup. */
function findRegions(own, cap, W, H, p) {
  const N = W * H, seen = new Uint8Array(N), q = new Int32Array(N); let qh = 0, qt = 0;
  const wall = i => own[i] === p && !cap[i];
  const push = i => { if (!seen[i] && !wall(i)) { seen[i] = 1; q[qt++] = i; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (qh < qt) {
    const i = q[qh++], x = i % W, y = (i - x) / W;
    if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W);
  }
  const regs = [], o = 1 - p;
  for (let s = 0; s < N; s++) {
    if (seen[s] || wall(s)) continue;
    const cells = []; let qh2 = 0; seen[s] = 1; q[0] = s; let qt2 = 1, prey = 0;
    while (qh2 < qt2) {
      const i = q[qh2++], x = i % W, y = (i - x) / W; cells.push(i);
      if (own[i] === o && !cap[i]) prey++;
      const nb = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1];
      for (const j of nb) if (j >= 0 && !seen[j] && !wall(j)) { seen[j] = 1; q[qt2++] = j; }
    }
    if (prey) regs.push({ cells, prey });
  }
  return regs;
}
const canPlace = (st, i) => st.own[i] < 0 && !st.dead[i];
// Simulasi: berapa titik p tangkap kalau letak di i (dan adakah titik tu sendiri kena tangkap)
function simulate(st, i, p) {
  const own = st.own.slice(); own[i] = p;
  let gain = 0; findRegions(own, st.cap, st.W, st.H, p).forEach(r => gain += r.prey);
  let suicide = false;
  if (!gain) suicide = findRegions(own, st.cap, st.W, st.H, 1 - p).length > 0;
  return { gain, suicide };
}

/* ---------- Render ---------- */
const CS = 30, PAD = 18;
const px = i => PAD + (i % G.W) * CS, py = i => PAD + Math.floor(i / G.W) * CS;
function jit(i, k) { return (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453 % 1); }
function buildBoard() {
  const { W, H } = G, VW = (W - 1) * CS + PAD * 2, VH = (H - 1) * CS + PAD * 2, svg = $('#board');
  svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`); svg.innerHTML = '';
  const grid = el('g', { stroke: '#a9c4ea', 'stroke-width': 1 }, svg);
  for (let x = -1; x <= W; x++) el('line', { x1: PAD + x * CS, y1: 0, x2: PAD + x * CS, y2: VH }, grid);
  for (let y = -1; y <= H; y++) el('line', { x1: 0, y1: PAD + y * CS, x2: VW, y2: PAD + y * CS }, grid);
  G.regLayer = el('g', {}, svg);
  G.dotLayer = el('g', {}, svg);
  G.ghostEl = el('circle', { r: 9, fill: 'none', 'stroke-width': 3, 'stroke-dasharray': '3 4', class: 'ghost', opacity: 0 }, svg);
  G.lastEl = el('circle', { r: 12, fill: 'none', 'stroke-width': 2, class: 'lastmark', opacity: 0 }, svg);
  G.regions.forEach(r => drawRegion(r, false));
  for (let i = 0; i < G.N; i++) if (G.own[i] >= 0) drawDot(i, false);
  markLast(); applyZoom();
  svg.classList.toggle('locked', isAiTurn() || G.over);
}
function applyZoom() {
  if (!G) return;
  const svg = $('#board'), wrap = $('#boardWrap');
  const base = Math.max(wrap.clientWidth - 8, 280);
  svg.style.width = Math.round(base * zoom) + 'px';
  $('#zoomBtn').textContent = zoom === 1 ? '🔍 Zoom' : `🔍 x${zoom}`;
}
function drawDot(i, anim = true) {
  const p = G.own[i], c = G.who[p].color;
  const g = el('g', { id: 'd' + i, class: 'dot' + (anim ? ' dot-in' : '') + (G.cap[i] ? ' captured' : ''), transform: `translate(${px(i) + jit(i, 1) * 2},${py(i) + jit(i, 2) * 2})` }, G.dotLayer);
  el('circle', { r: 5.6 + jit(i, 3) * .8, fill: c, 'fill-opacity': .18, stroke: c, 'stroke-width': 2.8 }, g);
}
function refreshDot(i) { const e = document.getElementById('d' + i); if (e) e.classList.toggle('captured', !!G.cap[i]); }
function markLast() {
  if (G.last < 0) { G.lastEl.setAttribute('opacity', 0); return; }
  G.lastEl.setAttribute('cx', px(G.last)); G.lastEl.setAttribute('cy', py(G.last));
  G.lastEl.setAttribute('stroke', G.who[G.own[G.last]].color); G.lastEl.setAttribute('opacity', .55);
}
// Lukis kepungan: isi segi empat/segi tiga dalam kawasan + garisan sempadan antara titik dinding
function drawRegion(reg, anim = true) {
  const { W, H } = G, p = reg.p, c = G.who[p].color;
  const R = new Uint8Array(G.N); reg.cells.forEach(i => R[i] = 1);
  const B = new Uint8Array(G.N);
  reg.cells.forEach(i => { const x = i % W, y = (i - x) / W;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (!R[j] && G.own[j] === p) B[j] = 1; } });
  const IN = i => i >= 0 && (R[i] || B[i]);
  const g = el('g', { class: 'region' + (anim ? ' reg-in' : '') }, G.regLayer);
  let fill = '';
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
    const a = y * W + x, b = a + 1, d = a + W, e = d + 1, cs = [a, b, e, d];
    const ins = cs.filter(IN); if (!cs.some(k => R[k])) continue;
    if (ins.length === 4 || ins.length === 3) fill += 'M' + ins.map(k => `${px(k)} ${py(k)}`).join('L') + 'Z';
  }
  el('path', { d: fill, fill: c, 'fill-opacity': .13, stroke: 'none' }, g);
  let line = '';
  const seg = (a, b) => { line += `M${px(a) + jit(a, 4) * 1.5} ${py(a) + jit(a, 5) * 1.5}L${px(b) + jit(b, 4) * 1.5} ${py(b) + jit(b, 5) * 1.5}`; };
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? -1 : y * W + x;
  for (let i = 0; i < G.N; i++) if (B[i]) {
    const x = i % W, y = (i - x) / W;
    // mendatar ke kanan
    let j = at(x + 1, y);
    if (j >= 0 && B[j]) { const up = [at(x, y - 1), at(x + 1, y - 1)].some(k => k >= 0 && R[k]), dn = [at(x, y + 1), at(x + 1, y + 1)].some(k => k >= 0 && R[k]); if (up !== dn) seg(i, j); }
    j = at(x, y + 1);
    if (j >= 0 && B[j]) { const lf = [at(x - 1, y), at(x - 1, y + 1)].some(k => k >= 0 && R[k]), rt = [at(x + 1, y), at(x + 1, y + 1)].some(k => k >= 0 && R[k]); if (lf !== rt) seg(i, j); }
    // pepenjuru
    for (const [dx, o1, o2] of [[1, at(x + 1, y), at(x, y + 1)], [-1, at(x - 1, y), at(x, y + 1)]]) {
      j = at(x + dx, y + 1); if (j < 0 || !B[j]) continue;
      const r1 = o1 >= 0 && R[o1], r2 = o2 >= 0 && R[o2], n1 = o1 >= 0 && !R[o1] && !B[o1], n2 = o2 >= 0 && !R[o2] && !B[o2];
      if ((r1 && (n2 || o2 < 0)) || (r2 && (n1 || o1 < 0))) seg(i, j);
    }
  }
  el('path', { d: line, stroke: c, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', class: anim ? 'wall-draw' : '' }, g);
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
  $('#turnLbl').innerHTML = G.over ? 'Tamat! 🎉' : isAiTurn() ? `${G.who[1].name} tengah fikir... 🤔` : `Giliran <b style="color:${G.who[G.turn].color}">${G.who[G.turn].name}</b> · letak satu titik`;
}
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); }
let bubbleT = 0;
function say(key) {
  if (!G.ai) return; const lines = G.who[1].talk && G.who[1].talk[key]; if (!lines) return;
  const b = $('#bubble'); b.textContent = lines[Math.floor(Math.random() * lines.length)]; b.classList.remove('hidden');
  clearTimeout(bubbleT); bubbleT = setTimeout(hideBubble, 2600);
}
function hideBubble() { $('#bubble').classList.add('hidden'); }

/* ---------- Input ---------- */
const isAiTurn = () => G && G.ai && G.turn === 1 && !G.over;
function pointAt(e) {
  const svg = $('#board'), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  const m = svg.getScreenCTM(); if (!m) return -1; const v = pt.matrixTransform(m.inverse());
  const x = Math.round((v.x - PAD) / CS), y = Math.round((v.y - PAD) / CS);
  if (x < 0 || y < 0 || x >= G.W || y >= G.H) return -1;
  if (Math.hypot(v.x - (PAD + x * CS), v.y - (PAD + y * CS)) > CS * .55) return -1;
  return y * G.W + x;
}
function showGhost(i) {
  G.ghost = i;
  if (i < 0) { G.ghostEl.setAttribute('opacity', 0); return; }
  G.ghostEl.setAttribute('cx', px(i)); G.ghostEl.setAttribute('cy', py(i));
  G.ghostEl.setAttribute('stroke', G.who[G.turn].color); G.ghostEl.setAttribute('opacity', .8);
}
$('#board').addEventListener('click', e => {
  if (!G || G.over || isAiTurn()) return;
  const i = pointAt(e); if (i < 0 || !canPlace(G, i)) { showGhost(-1); return; }
  // Kalau titik nampak kecik kat skrin, tekan sekali untuk pilih, tekan lagi untuk letak
  const gap = $('#board').getBoundingClientRect().width / ((G.W - 1) * CS + PAD * 2) * CS;
  if (gap < 26 && G.ghost !== i) { showGhost(i); tone(900, .04, 'sine', .06); return; }
  play(i);
});
$('#board').addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || !G || G.over || isAiTurn()) return;
  const i = pointAt(e); showGhost(i >= 0 && canPlace(G, i) ? i : -1);
});

/* ---------- Gerakan ---------- */
function applyRegions(p, regs) {
  let got = 0;
  regs.forEach(r => {
    r.p = p;
    r.cells.forEach(i => {
      if (G.own[i] === 1 - p && !G.cap[i]) { G.cap[i] = 1; got++; refreshDot(i); }
      else if (G.own[i] < 0) G.dead[i] = 1;
    });
    G.regions.push(r); drawRegion(r);
  });
  G.score[p] += got; return got;
}
function play(i) {
  if (!canPlace(G, i)) return;
  const p = G.turn;
  G.own[i] = p; G.moves++; showGhost(-1); drawDot(i); G.last = i; markLast(); SFX.tok(); buzz(8);
  let got = applyRegions(p, findRegions(G.own, G.cap, G.W, G.H, p));
  let lost = 0;
  if (!got) lost = applyRegions(1 - p, findRegions(G.own, G.cap, G.W, G.H, 1 - p));
  if (got) {
    setTimeout(() => SFX.pop(Math.min(got, 6)), 120); buzz(25);
    toast(got >= 5 ? `Kepung ${got} titik! 🔥` : got >= 2 ? `Kepung ${got}!` : 'Terkepung!');
    if (got >= 3) SFX.combo();
    if (G.ai && p === 1 && Math.random() < .5) say('cap');
  } else if (lost) { toast('Masuk perangkap! 😵'); SFX.pop(1); }
  G.turn ^= 1;
  if (!hasMove()) return endGame();
  updateHud();
  $('#board').classList.toggle('locked', isAiTurn());
  if (isAiTurn()) aiTimer = setTimeout(aiMove, 450);
}
function hasMove() { for (let i = 0; i < G.N; i++) if (canPlace(G, i)) return true; return false; }
function endGame() {
  clearTimeout(aiTimer);
  G.over = true; updateHud(); $('#board').classList.add('locked'); showGhost(-1);
  const [a, b] = G.score, win = a === b ? -1 : a > b ? 0 : 1;
  setTimeout(() => {
    const w = win < 0 ? null : G.who[win];
    $('#endAv').innerHTML = w ? avHTML(w) : '🤝';
    $('#endTitle').textContent = w ? `${w.name} menang! 🎉` : 'Seri!';
    $('#endText').textContent = `${G.who[0].name} tangkap ${a} titik · ${G.who[1].name} tangkap ${b} titik` + (w ? '' : ' — sama banyak!');
    $('#endModal').classList.remove('hidden');
    if (G.ai && win === 1) { SFX.lose(); say('win'); } else { SFX.win(); if (G.ai) say('lose'); }
    if (G.ai && win === 0) { const k = 'wins_' + S.level; store.set(k, store.get(k, 0) + 1); }
  }, 600);
}

/* ---------- AI ---------- */
const pick = a => a[Math.floor(Math.random() * a.length)];
function candidates(st) {
  const { W, H, N } = st, out = [], mark = new Uint8Array(N);
  let any = false;
  for (let i = 0; i < N; i++) if (st.own[i] >= 0 && !st.cap[i]) {
    any = true; const x = i % W, y = (i - x) / W;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const j = Y * W + X; if (!mark[j] && canPlace(st, j)) { mark[j] = 1; out.push(j); }
    }
  }
  if (!any || !out.length) for (let i = 0; i < N; i++) if (canPlace(st, i)) out.push(i);
  return out;
}
function shape(st, i, p) {
  const { W, H } = st, x = i % W, y = (i - x) / W; let s = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue; const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
    const o = st.own[Y * W + X]; if (st.cap[Y * W + X]) continue;
    if (o === p) s += dx && dy ? 1.6 : .6;      // sambung pepenjuru = dinding jimat titik
    else if (o === 1 - p) s += 1.2;              // dekat lawan = mula kepung
  }
  const edge = Math.min(x, y, W - 1 - x, H - 1 - y); if (edge === 0) s -= 2; else if (edge === 1) s -= .5;
  return s;
}
function chooseMove(level) {
  const st = G, me = 1, op = 0, cands = candidates(st);
  if (level === 'easy') {
    if (Math.random() < .6) for (const c of cands) if (simulate(st, c, me).gain) return c;
    return pick(cands.slice().sort((a, b) => shape(st, b, me) - shape(st, a, me)).slice(0, 8));
  }
  // ancaman lawan: titik yang kalau dia letak, dia dapat kepung
  const threats = [];
  for (const c of cands) { const s = simulate(st, c, op); if (s.gain) threats.push([c, s.gain]); }
  let scored = cands.map(c => {
    const mine = simulate(st, c, me), th = threats.find(t => t[0] === c);
    let v = mine.gain * 12 + (th ? th[1] * 10 : 0) + shape(st, c, me) + Math.random() * .8;
    if (mine.suicide) v -= 40;
    return [c, v];
  }).sort((a, b) => b[1] - a[1]);
  if (level === 'medium') return scored[0][0];
  // Susah: tengok selangkah ke depan untuk calon terbaik
  const top = scored.slice(0, 14);
  let best = top[0][0], bestV = -1e9;
  for (const [c, v0] of top) {
    const own = st.own.slice(); own[c] = me;
    const T = { ...st, own, cap: st.cap.slice() };
    findRegions(own, T.cap, st.W, st.H, me).forEach(r => r.cells.forEach(i => { if (own[i] === op) T.cap[i] = 1; }));
    const nc = candidates(T);
    let oppBest = 0, myThreats = 0;
    for (const d of nc) {
      if (Math.abs(d % st.W - c % st.W) > 4 || Math.abs(Math.floor(d / st.W) - Math.floor(c / st.W)) > 4) continue;
      const so = simulate(T, d, op); if (so.gain > oppBest) oppBest = so.gain;
      if (simulate(T, d, me).gain) myThreats++;
    }
    const v = v0 - oppBest * 9 + Math.min(myThreats, 3) * 3.5;
    if (v > bestV) { bestV = v; best = c; }
  }
  return best;
}
function aiMove() {
  if (!isAiTurn()) return;
  play(chooseMove(S.level));
}
window.addEventListener('resize', applyZoom);
renderMenu();
