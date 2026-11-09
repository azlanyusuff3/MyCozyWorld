'use strict';
/* Titik Titik — Dots and Boxes gaya kertas buku latihan zaman sekolah.
   Art: semua dilukis guna SVG. Kalau ada sprite dalam sprites/list.json, sprite tu ganti lukisan SVG. */
const GAME_VERSION = 'v1';
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
  easy: { name: 'Koko', emoji: '🐤', sprite: 'av_koko', label: 'Senang', talk: { cap: ['Yeay dapat! 🐣', 'Ciap ciap!'], win: ['Koko menang?! Ciap!'], lose: ['Alaa... tahniah! 🐥'] } },
  medium: { name: 'Bubu', emoji: '🐰', sprite: 'av_bubu', label: 'Sederhana', talk: { cap: ['Hehe, kotak ni Bubu punya~', 'Hop hop!'], win: ['Bubu menang! 🥕'], lose: ['Pandai la awak!'] } },
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
/* ---------- Avatar ---------- */
function avHTML(who) { return SPR[who.sprite] ? `<img src="${SPR[who.sprite]}" alt="">` : who.emoji; }

/* ---------- Tetapan & menu ---------- */
const S = store.get('settings', { mode: 'ai', level: 'medium', size: 5 });
function renderMenu() {
  document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === S.mode));
  document.querySelectorAll('#sizeSeg button').forEach(b => b.classList.toggle('on', +b.dataset.v === S.size));
  $('#levelBox').classList.toggle('hidden', S.mode !== 'ai');
  $('#levelSeg').innerHTML = Object.keys(AIS).map(k => `<button data-v="${k}" type="button" class="${k === S.level ? 'on' : ''}"><span class="av">${avHTML(AIS[k])}</span>${AIS[k].name}<small>${AIS[k].label}</small></button>`).join('');
  $('#titleArt').innerHTML = `<svg viewBox="0 0 200 110"><g stroke-linecap="round" fill="none" stroke-width="4">
    <path d="M30 20 Q65 18 100 21" stroke="${P1.color}"/><path d="M30 20 Q28 55 31 90" stroke="${P2.color}"/><path d="M100 21 Q102 55 99 90" stroke="${P1.color}"/><path d="M31 90 Q65 92 99 90" stroke="${P2.color}"/>
    <path d="M100 21 Q135 19 170 22" stroke="${P2.color}"/><path d="M170 22 Q168 40 171 56" stroke="${P1.color}" stroke-dasharray="4 7"/></g>
    <text x="65" y="68" text-anchor="middle" font-family="Caveat" font-size="44" fill="${P2.color}" transform="rotate(-6 65 60)">P</text>
    ${[[30,20],[100,21],[170,22],[31,90],[99,90],[171,56],[170,90]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="#1d2440"/>`).join('')}</svg>`;
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
  
  const ground = el('g', {}, svg);
  // rumput dan bunga hiasan (tetap ikut seed supaya tak berubah bila render semula)
  let seed = n * 977 + 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let b = 0; b < n * n; b++) {
    const r = Math.floor(b / n), c = b % n, x = PAD + c * CS, y = PAD + r * CS;
    el('rect', { x: x + 4, y: y + 4, width: CS - 8, height: CS - 8, fill: 'transparent', class: 'plot-tint', id: 'plot' + b }, ground);
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
  for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) { el('circle', { cx: PAD + c * CS + (rnd() - .5) * 2, cy: PAD + r * CS + (rnd() - .5) * 2, r: 5.5 + rnd(), fill: '#1d2440' }, dotLayer); }
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
  const ink = G.who[G.lineOwner[l]].color;
  // garisan tangan: sikit bengkok, hujung tak tepat sangat (tetap ikut nombor garisan)
  const w = k => (Math.sin(l * 12.9898 + k * 78.233) * 43758.5453 % 1);
  const j = () => w(1) * 5, mx = (x1 + x2) / 2 + (horiz ? 0 : j()), my = (y1 + y2) / 2 + (horiz ? j() : 0);
  const d = `M${x1 + w(2) * 3} ${y1 + w(3) * 3} Q${mx} ${my} ${x2 + w(4) * 3} ${y2 + w(5) * 3}`;
  const g = el('g', { class: 'fence', id: 'f' + l, style: `--len:${CS + 10}` }, G.fenceLayer);
  el('path', { d, stroke: '#fff27a', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round', class: 'glow' }, g);
  el('path', { d, stroke: ink, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: .92, class: anim ? 'pole' : '' }, g);
}
function markLast() {
  document.querySelectorAll('.fence.last').forEach(f => f.classList.remove('last'));
  if (G.last >= 0) { const f = document.getElementById('f' + G.last); if (f) f.classList.add('last'); }
}
function drawPlot(b, owner, anim = true) {
  const n = G.geo.n, r = Math.floor(b / n), c = b % n, x = PAD + c * CS, y = PAD + r * CS, who = G.who[owner];
  const rot = (Math.sin(b * 91.7) * 9).toFixed(1);
  const outer = el('g', { transform: `translate(${x + 50},${y + 50}) rotate(${rot})` }, G.objLayer);
  const inner = el('g', { class: anim ? 'obj-in' : '' }, outer);
  const t = el('text', { x: 0, y: 22, 'text-anchor': 'middle', 'font-family': 'Caveat, cursive', 'font-weight': 700, 'font-size': 66, fill: who.color, opacity: .9 }, inner);
  t.textContent = who.name[0].toUpperCase();
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
  $('#turnLbl').innerHTML = G.over ? 'Semua kotak dah penuh! 🎉' : isAiTurn() ? `${G.who[1].name} tengah fikir... 🤔` : `Giliran <b style="color:${G.who[G.turn].color}">${G.who[G.turn].name}</b> · ${left} kotak lagi`;
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
    $('#endText').textContent = `${G.who[0].name} ${a} kotak · ${G.who[1].name} ${b} kotak` + (w ? '' : ' — sama banyak!');
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
