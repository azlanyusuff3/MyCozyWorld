'use strict';
// Cozy Chess — chess biasa dengan character chibi + cinematic bertarung bila makan.
const GAME_VERSION = '1.0';
const $ = s => document.querySelector(s);
const NAMES = { k: 'King', q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', p: 'Pawn' };
const SKILL = { k: 'Royal Slam!', q: 'Starfall!', r: 'Tower Smash!', b: 'Holy Orb!', n: 'Gallop Charge!', p: 'Brave Poke!' };
const RANGED = { b: 1, q: 1 };
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const SAVE_KEY = 'cozychess-save-v1';

/* ================= ENGINE ================= */
// index 0 = a8 (atas kiri), 63 = h1. Putih bergerak ke atas (-8).
const KD = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const ND = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const DIAG = KD.filter(d => d[0] && d[1]), ORTH = KD.filter(d => !d[0] || !d[1]);
const on = (r, f) => r >= 0 && r < 8 && f >= 0 && f < 8;
const opp = c => c === 'w' ? 'b' : 'w';

function initState() {
  const b = Array(64).fill(null), back = 'rnbqkbnr';
  for (let i = 0; i < 8; i++) {
    b[i] = { t: back[i], c: 'b' }; b[8 + i] = { t: 'p', c: 'b' };
    b[48 + i] = { t: 'p', c: 'w' }; b[56 + i] = { t: back[i], c: 'w' };
  }
  return { b, turn: 'w', cr: { K: 1, Q: 1, k: 1, q: 1 }, ep: -1, half: 0, full: 1 };
}

function attacked(b, sq, by) {
  const r = sq >> 3, f = sq & 7, pd = by === 'w' ? 1 : -1;
  for (const df of [-1, 1]) { const rr = r + pd, ff = f + df; if (on(rr, ff)) { const p = b[rr * 8 + ff]; if (p && p.c === by && p.t === 'p') return true; } }
  for (const [dr, df] of ND) { const rr = r + dr, ff = f + df; if (on(rr, ff)) { const p = b[rr * 8 + ff]; if (p && p.c === by && p.t === 'n') return true; } }
  for (const [dr, df] of KD) {
    let rr = r + dr, ff = f + df, first = true; const diag = dr && df;
    while (on(rr, ff)) {
      const p = b[rr * 8 + ff];
      if (p) { if (p.c === by && (p.t === 'q' || (diag ? p.t === 'b' : p.t === 'r') || (first && p.t === 'k'))) return true; break; }
      rr += dr; ff += df; first = false;
    }
  }
  return false;
}

function pseudo(s) {
  const b = s.b, c = s.turn, o = opp(c), out = [];
  for (let i = 0; i < 64; i++) {
    const p = b[i]; if (!p || p.c !== c) continue;
    const r = i >> 3, f = i & 7;
    const add = (to, x) => out.push(Object.assign({ from: i, to, cap: b[to] }, x));
    if (p.t === 'p') {
      const d = c === 'w' ? -1 : 1, start = c === 'w' ? 6 : 1, last = c === 'w' ? 0 : 7;
      const pushP = (to, x) => { if ((to >> 3) === last) for (const pr of 'qrbn') add(to, Object.assign({ promo: pr }, x)); else add(to, x); };
      const r1 = r + d;
      if (on(r1, f) && !b[r1 * 8 + f]) { pushP(r1 * 8 + f); if (r === start && !b[(r + 2 * d) * 8 + f]) add((r + 2 * d) * 8 + f, { dbl: 1 }); }
      for (const df of [-1, 1]) {
        const ff = f + df; if (!on(r1, ff)) continue; const t = r1 * 8 + ff;
        if (b[t] && b[t].c === o) pushP(t);
        else if (t === s.ep) add(t, { epCap: r * 8 + ff, cap: b[r * 8 + ff] });
      }
    } else if (p.t === 'n' || p.t === 'k') {
      for (const [dr, df] of (p.t === 'n' ? ND : KD)) { const rr = r + dr, ff = f + df; if (!on(rr, ff)) continue; const t = rr * 8 + ff; if (!b[t] || b[t].c === o) add(t); }
      if (p.t === 'k' && i === (c === 'w' ? 60 : 4) && !attacked(b, i, o)) {
        const K = c === 'w' ? 'K' : 'k', Q = c === 'w' ? 'Q' : 'q', rk = x => x && x.t === 'r' && x.c === c;
        if (s.cr[K] && !b[i + 1] && !b[i + 2] && rk(b[i + 3]) && !attacked(b, i + 1, o)) add(i + 2, { castle: 'K' });
        if (s.cr[Q] && !b[i - 1] && !b[i - 2] && !b[i - 3] && rk(b[i - 4]) && !attacked(b, i - 1, o)) add(i - 2, { castle: 'Q' });
      }
    } else {
      for (const [dr, df] of (p.t === 'b' ? DIAG : p.t === 'r' ? ORTH : KD)) {
        let rr = r + dr, ff = f + df;
        while (on(rr, ff)) { const t = rr * 8 + ff; if (b[t]) { if (b[t].c === o) add(t); break; } add(t); rr += dr; ff += df; }
      }
    }
  }
  return out;
}

function apply(s, m) {
  const b = s.b.slice(), p = b[m.from], c = s.turn, cr = Object.assign({}, s.cr);
  b[m.to] = m.promo ? { t: m.promo, c } : p; b[m.from] = null;
  if (m.epCap != null) b[m.epCap] = null;
  if (m.castle === 'K') { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = null; }
  if (m.castle === 'Q') { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = null; }
  if (p.t === 'k') { if (c === 'w') cr.K = cr.Q = 0; else cr.k = cr.q = 0; }
  for (const sq of [m.from, m.to]) { if (sq === 63) cr.K = 0; if (sq === 56) cr.Q = 0; if (sq === 7) cr.k = 0; if (sq === 0) cr.q = 0; }
  return { b, turn: opp(c), cr, ep: m.dbl ? (m.from + m.to) / 2 : -1, half: (p.t === 'p' || m.cap) ? 0 : s.half + 1, full: s.full + (c === 'b' ? 1 : 0) };
}
const kingSq = (b, c) => b.findIndex(p => p && p.t === 'k' && p.c === c);
const inCheck = (s, c = s.turn) => attacked(s.b, kingSq(s.b, c), opp(c));
const legal = s => pseudo(s).filter(m => { const n = apply(s, m); return !attacked(n.b, kingSq(n.b, s.turn), n.turn); });
function insufficient(b) {
  const rest = b.filter(p => p && p.t !== 'k');
  return rest.length === 0 || (rest.length === 1 && (rest[0].t === 'n' || rest[0].t === 'b'));
}
const posKey = s => s.b.map(p => p ? (p.c === 'w' ? p.t.toUpperCase() : p.t) : '.').join('') + s.turn + JSON.stringify(s.cr) + s.ep;

/* ================= AI ================= */
function evalS(s) {
  let sc = 0;
  for (let i = 0; i < 64; i++) {
    const p = s.b[i]; if (!p) continue;
    const r = i >> 3, f = i & 7, cen = (3.5 - Math.abs(f - 3.5)) + (3.5 - Math.abs(r - 3.5));
    let v = VAL[p.t];
    if (p.t === 'n' || p.t === 'b') v += cen * 7;
    else if (p.t === 'q') v += cen * 2;
    else if (p.t === 'p') { const adv = p.c === 'w' ? 6 - r : r - 1; v += adv * adv * 3 + (f >= 2 && f <= 5 ? cen * 3 : 0); }
    else if (p.t === 'k') v += (p.c === 'w' ? r === 7 : r === 0) ? 18 : -12;
    sc += p.c === 'w' ? v : -v;
  }
  return sc;
}
const score = m => (m.cap ? VAL[m.cap.t] * 10 + 1000 : 0) + (m.promo === 'q' ? 9000 : 0);
const order = ms => ms.sort((a, b) => score(b) - score(a));
let nodes = 0;
function qs(s, a, bt, qd) {
  nodes++;
  const stand = (s.turn === 'w' ? 1 : -1) * evalS(s);
  if (stand >= bt) return stand; if (stand > a) a = stand; if (qd <= 0) return a;
  for (const m of order(pseudo(s).filter(m => m.cap))) {
    const n = apply(s, m); if (attacked(n.b, kingSq(n.b, s.turn), n.turn)) continue;
    const v = -qs(n, -bt, -a, qd - 1); if (v >= bt) return v; if (v > a) a = v;
  }
  return a;
}
function nega(s, d, a, bt, ply) {
  if (d === 0) return qs(s, a, bt, 4);
  const ms = order(legal(s));
  if (!ms.length) return inCheck(s) ? -100000 + ply : 0;
  for (const m of ms) { const v = -nega(apply(s, m), d - 1, -bt, -a, ply + 1); if (v >= bt) return v; if (v > a) a = v; }
  return a;
}
function bestMove(s, level) {
  const depth = [1, 2, 4][level], noise = [90, 18, 0][level];
  let best = null, bv = -Infinity;
  for (const m of order(legal(s))) {
    let v = -nega(apply(s, m), depth - 1, -Infinity, level === 2 ? -bv : Infinity, 1);
    v += Math.random() * noise;
    if (v > bv) { bv = v; best = m; }
  }
  return best;
}

/* ================= ART ================= */
// Kalau ChatGPT dah letak sprite dalam sprites/ dan tulis nama dalam list.json, game guna sprite tu.
// Kalau tak ada, guna placeholder chibi SVG.
let SPRITES = new Set();
const artCache = {};
const TEAM = {
  w: { body: '#fff4e2', trim: '#6aa6dc', dark: '#3f6f9e', skin: '#ffe0c8', hair: '#f3c46b' },
  b: { body: '#5c4a7c', trim: '#ef9ac0', dark: '#2e2342', skin: '#f2c7a5', hair: '#3a2a2a' },
};
function hatSVG(t, T) {
  const g = '#f7c948', gs = '#b8862a', o = 'stroke="#2b1d33" stroke-width="2.5" stroke-linejoin="round"';
  switch (t) {
    case 'k': return `<path d="M30 34 L32 16 L41 26 L50 10 L59 26 L68 16 L70 34 Z" fill="${g}" ${o}/><circle cx="50" cy="10" r="4" fill="${T.trim}" ${o}/><rect x="30" y="30" width="40" height="7" rx="3" fill="${gs}" ${o}/>`;
    case 'q': return `<path d="M32 33 L35 20 L42 28 L50 16 L58 28 L65 20 L68 33 Z" fill="${g}" ${o}/><circle cx="35" cy="19" r="3" fill="#ff8ad1"/><circle cx="50" cy="15" r="4" fill="#ff8ad1" ${o}/><circle cx="65" cy="19" r="3" fill="#ff8ad1"/>`;
    case 'b': return `<path d="M34 36 Q34 14 50 4 Q66 14 66 36 Z" fill="${T.body}" ${o}/><path d="M50 8 L50 34" stroke="${T.trim}" stroke-width="5"/><path d="M44 20 L56 20" stroke="${T.trim}" stroke-width="4"/>`;
    case 'n': return `<path d="M27 40 Q26 18 50 16 Q74 18 73 40 Z" fill="#c9cfd8" ${o}/><path d="M33 22 L28 6 L42 17 Z M67 22 L72 6 L58 17 Z" fill="#c9cfd8" ${o}/><path d="M50 16 Q60 2 76 6 Q64 10 58 18" fill="${T.trim}" ${o}/><rect x="30" y="34" width="40" height="6" rx="3" fill="${T.dark}"/>`;
    case 'r': return `<path d="M29 38 L29 18 L37 18 L37 24 L45 24 L45 18 L55 18 L55 24 L63 24 L63 18 L71 18 L71 38 Z" fill="#b8b2a6" ${o}/><path d="M34 31 L66 31" stroke="#8b8476" stroke-width="2"/>`;
    default: return `<path d="M31 38 Q30 20 50 19 Q70 20 69 38 Z" fill="${T.trim}" ${o}/><circle cx="50" cy="18" r="4" fill="${T.dark}" ${o}/>`;
  }
}
function weaponSVG(t, T) {
  const o = 'stroke="#2b1d33" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
  switch (t) {
    case 'k': return `<path d="M80 108 L84 68" ${o}/><path d="M80 108 L84 68" stroke="#f7c948" stroke-width="3"/><circle cx="84" cy="64" r="6" fill="#f7c948" ${o}/>`;
    case 'q': return `<path d="M82 106 L86 70" ${o}/><path d="M86 56 l4 8 9 1 -7 6 2 9 -8 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#ffe36e" ${o}/>`;
    case 'b': return `<path d="M82 112 L84 66" ${o}/><circle cx="84" cy="62" r="7" fill="#9fe6ff" ${o}/>`;
    case 'n': return `<path d="M78 112 L94 50" ${o}/><path d="M94 50 l-6 10 8 1z" fill="#c9cfd8" ${o}/>`;
    case 'r': return `<path d="M74 80 Q88 78 90 90 Q90 106 76 112 Q70 100 74 80 Z" fill="${T.trim}" ${o}/><path d="M80 88 L82 104" stroke="#fff" stroke-width="3"/>`;
    default: return `<path d="M80 110 L88 70" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/><path d="M88 70 l-3 -9 7 3z" fill="#c9cfd8" ${o}/>`;
  }
}
function placeholder(c, t, pose) {
  const T = TEAM[c], o = 'stroke="#2b1d33" stroke-width="2.5" stroke-linejoin="round"';
  const big = t === 'k' || t === 'q';
  let eyes;
  if (pose === 'hurt') eyes = `<path d="M38 50 l8 8 m0 -8 l-8 8 M54 50 l8 8 m0 -8 l-8 8" stroke="#2b1d33" stroke-width="3" stroke-linecap="round"/><ellipse cx="50" cy="68" rx="5" ry="4" fill="#2b1d33"/>`;
  else if (pose === 'attack') eyes = `<path d="M36 47 l11 4 M64 47 l-11 4" stroke="#2b1d33" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="56" r="3.5" fill="#2b1d33"/><circle cx="57" cy="56" r="3.5" fill="#2b1d33"/><path d="M44 66 Q50 70 56 66" stroke="#2b1d33" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else eyes = `<ellipse cx="42" cy="55" rx="3.5" ry="4.5" fill="#2b1d33"/><ellipse cx="58" cy="55" rx="3.5" ry="4.5" fill="#2b1d33"/><circle cx="43" cy="53.5" r="1.3" fill="#fff"/><circle cx="59" cy="53.5" r="1.3" fill="#fff"/><path d="M46 64 Q50 67 54 64" stroke="#2b1d33" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const glyph = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }[t];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 125">
<ellipse cx="52" cy="119" rx="30" ry="5" fill="#0003"/>
${weaponSVG(t, T)}
<path d="M${big ? 22 : 27} 116 Q${big ? 24 : 29} 74 50 70 Q${big ? 76 : 71} 74 ${big ? 78 : 73} 116 Z" fill="${T.body}" ${o}/>
<path d="M${big ? 26 : 30} 108 L${big ? 74 : 70} 108" stroke="${T.trim}" stroke-width="6"/>
<circle cx="50" cy="92" r="10" fill="${T.trim}" ${o}/><text x="50" y="97.5" font-size="14" text-anchor="middle" fill="#fff">${glyph}</text>
<path d="M36 76 Q29 88 33 98" stroke="${T.body}" stroke-width="9" stroke-linecap="round" fill="none"/>
<circle cx="50" cy="55" r="${big ? 22 : 20}" fill="${T.skin}" ${o}/>
<path d="M30 50 Q34 32 50 32 Q66 32 70 50 Q60 40 50 41 Q40 40 30 50Z" fill="${T.hair}"/>
<circle cx="37" cy="62" r="4" fill="#ff9aa8" opacity=".6"/><circle cx="63" cy="62" r="4" fill="#ff9aa8" opacity=".6"/>
${eyes}
<g transform="translate(0 ${big ? 0 : 3})">${hatSVG(t, T)}</g>
</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function art(c, t, pose = 'idle') {
  const key = `${c === 'w' ? 'white' : 'black'}_${NAMES[t].toLowerCase()}_${pose}`;
  if (artCache[key]) return artCache[key];
  let url = null;
  for (const ext of ['webp', 'png']) if (SPRITES.has(`${key}.${ext}`)) { url = `sprites/${key}.${ext}`; break; }
  if (!url && pose !== 'idle') { const idle = art(c, t, 'idle'); if (!idle.startsWith('data:')) url = idle; }
  return artCache[key] = url || placeholder(c, t, pose);
}

/* ================= SOUND ================= */
let AC = null, soundOn = localStorage.getItem('cozychess-sound') !== '0';
function tone(freq, dur, type = 'sine', vol = .15, slide = 0, delay = 0) {
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
    o.connect(g).connect(AC.destination); o.start(t0); o.stop(t0 + dur);
  } catch (e) {}
}
function noise(dur, vol = .25) {
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const buf = AC.createBuffer(1, AC.sampleRate * dur, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = AC.createBufferSource(), g = AC.createGain(); g.gain.value = vol; s.buffer = buf; s.connect(g).connect(AC.destination); s.start();
  } catch (e) {}
}
const SFX = {
  move: () => tone(420, .08, 'triangle', .12),
  select: () => tone(700, .05, 'sine', .07),
  whoosh: () => tone(300, .25, 'sawtooth', .05, 500),
  hit: () => { noise(.25, .35); tone(120, .3, 'square', .12, -60); },
  ko: () => tone(500, .4, 'triangle', .12, -380),
  check: () => { tone(880, .12, 'square', .07); tone(660, .18, 'square', .07, 0, .12); },
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .3, 'triangle', .13, 0, i * .13)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, .35, 'triangle', .12, 0, i * .18)),
};

/* ================= GAME STATE ================= */
let S, hist = [], sel = -1, moves = [], busy = false, over = false;
let mode = 'ai', human = 'w', level = 1, lastMove = null, caps = { w: [], b: [] }, reps = {};
let animOn = localStorage.getItem('cozychess-anim') !== '0';

const flipped = () => mode === 'ai' && human === 'b';
const sqEl = i => document.querySelector(`.sq[data-i="${i}"]`);

function buildBoard() {
  const el = $('#board'); el.innerHTML = '';
  for (let v = 0; v < 64; v++) {
    const i = flipped() ? 63 - v : v, r = i >> 3, f = i & 7;
    const d = document.createElement('div');
    d.className = 'sq ' + ((r + f) % 2 ? 'd' : 'l'); d.dataset.i = i;
    d.addEventListener('pointerdown', () => tap(i));
    el.appendChild(d);
  }
}
function render(hopTo = -1) {
  const chk = inCheck(S) ? kingSq(S.b, S.turn) : -1;
  const targets = new Map(moves.filter(m => m.from === sel).map(m => [m.to, m]));
  document.querySelectorAll('.sq').forEach(d => {
    const i = +d.dataset.i, p = S.b[i], r = i >> 3, f = i & 7, vr = flipped() ? 7 - r : r, vf = flipped() ? 7 - f : f;
    d.classList.toggle('sel', i === sel);
    d.classList.toggle('last', !!lastMove && (i === lastMove.from || i === lastMove.to));
    d.classList.toggle('check', i === chk);
    let h = '';
    if (p) h += `<img class="piece${i === hopTo ? ' hop' : ''}" src="${art(p.c, p.t)}" alt="${p.c === 'w' ? 'White' : 'Black'} ${NAMES[p.t]}">`;
    if (targets.has(i)) h += targets.get(i).cap ? '<span class="ring"></span>' : '<span class="dot"></span>';
    if (vf === 0) h += `<span class="coord r">${8 - r}</span>`;
    if (vr === 7) h += `<span class="coord f">${'abcdefgh'[f]}</span>`;
    d.innerHTML = h;
  });
  // players
  const topC = flipped() ? 'w' : 'b', botC = opp(topC);
  $('#topName').textContent = mode === 'ai' ? `🤖 AI (${['Senang', 'Biasa', 'Susah'][level]})` : (topC === 'b' ? '♚ Hitam' : '♔ Putih');
  $('#botName').textContent = mode === 'ai' ? '😊 Kau' : (botC === 'w' ? '♔ Putih' : '♚ Hitam');
  $('#topName').classList.toggle('turn', S.turn === topC && !over);
  $('#botName').classList.toggle('turn', S.turn === botC && !over);
  $('#topCaps').innerHTML = caps[topC].map(t => `<img src="${art(botC, t)}" alt="">`).join('');
  $('#botCaps').innerHTML = caps[botC].map(t => `<img src="${art(topC, t)}" alt="">`).join('');
  let st = '';
  if (!over) {
    const who = mode === 'ai' ? (S.turn === human ? 'Giliran kau' : 'AI tengah fikir…') : `Giliran ${S.turn === 'w' ? 'Putih' : 'Hitam'}`;
    st = inCheck(S) ? `⚠ CHECK! ${who}` : who;
  }
  $('#status').textContent = st;
  $('#animBtn').textContent = `🎬 Animasi: ${animOn ? 'ON' : 'OFF'}`;
}

function tap(i) {
  if (busy || over) return;
  if (mode === 'ai' && S.turn !== human) return;
  const p = S.b[i];
  const mv = moves.filter(m => m.from === sel && m.to === i);
  if (sel >= 0 && mv.length) {
    if (mv.length > 1) return askPromo(mv);
    return play(mv[0]);
  }
  if (p && p.c === S.turn) { sel = i === sel ? -1 : i; SFX.select(); }
  else sel = -1;
  render();
}

function askPromo(mv) {
  const row = $('#promoRow'); row.innerHTML = '';
  for (const t of 'qrbn') {
    const b = document.createElement('button'); b.innerHTML = `<img src="${art(S.turn, t)}" alt="${NAMES[t]}">`;
    b.onclick = () => { $('#promo').classList.add('hidden'); play(mv.find(m => m.promo === t)); };
    row.appendChild(b);
  }
  $('#promo').classList.remove('hidden');
}

async function play(m) {
  busy = true; sel = -1;
  const mover = S.b[m.from];
  if (m.cap && animOn) await cinematic(m, mover, m.cap);
  hist.push({ S, caps: JSON.parse(JSON.stringify(caps)), lastMove, reps: Object.assign({}, reps) });
  if (m.cap) caps[mover.c].push(m.cap.t);
  S = apply(S, m); lastMove = m;
  const k = posKey(S); reps[k] = (reps[k] || 0) + 1;
  moves = legal(S);
  if (!m.cap) SFX.move();
  render(m.to);
  save();
  if (checkEnd(k)) { busy = false; return; }
  if (inCheck(S)) { SFX.check(); toast('CHECK!'); }
  busy = false;
  if (mode === 'ai' && S.turn !== human) aiTurn();
}

function aiTurn() {
  busy = true; render();
  setTimeout(() => {
    const t0 = performance.now();
    const m = bestMove(S, level);
    const wait = Math.max(0, 450 - (performance.now() - t0));
    setTimeout(() => { busy = false; if (m) play(m); }, wait);
  }, 60);
}

function checkEnd(k) {
  let title = '', text = '', winner = null;
  if (!moves.length) {
    if (inCheck(S)) { winner = opp(S.turn); title = 'CHECKMATE!'; }
    else { title = 'Stalemate'; text = 'Tak ada move sah — seri!'; }
  } else if (S.half >= 100) { title = 'Seri'; text = 'Peraturan 50 move.'; }
  else if (reps[k] >= 3) { title = 'Seri'; text = 'Kedudukan sama berulang 3 kali.'; }
  else if (insufficient(S.b)) { title = 'Seri'; text = 'Piece tak cukup untuk checkmate.'; }
  else return false;
  over = true; localStorage.removeItem(SAVE_KEY);
  if (winner) {
    if (mode === 'ai') { text = winner === human ? 'Tahniah, kau kalahkan AI! 🎉' : 'AI menang kali ni. Cuba lagi!'; (winner === human ? SFX.win : SFX.lose)(); }
    else { text = `${winner === 'w' ? 'Putih' : 'Hitam'} menang! 🎉`; SFX.win(); }
  }
  render();
  setTimeout(() => {
    $('#resTitle').textContent = title; $('#resText').textContent = text;
    $('#resArt').innerHTML = winner ? `<img src="${art(winner, 'k', 'attack')}" alt=""><img src="${art(winner, 'q', 'attack')}" alt="">` : `<img src="${art('w', 'k')}" alt=""><img src="${art('b', 'k')}" alt="">`;
    $('#result').classList.remove('hidden');
  }, 700);
  return true;
}

/* ================= CINEMATIC ================= */
let pending = [], skipping = false;
const wait = ms => new Promise(res => { if (skipping) return res(); const t = setTimeout(res, ms); pending.push(() => { clearTimeout(t); res(); }); });
$('#battle').addEventListener('pointerdown', () => { skipping = true; pending.forEach(f => f()); pending = []; });

async function cinematic(m, attacker, victim) {
  skipping = false;
  const wrap = $('#boardWrap'), bt = $('#battle'), fx = $('#bFx');
  const target = sqEl(m.epCap != null ? m.epCap : m.to), wr = wrap.getBoundingClientRect(), tr = target.getBoundingClientRect();
  wrap.style.transformOrigin = `${tr.left - wr.left + tr.width / 2}px ${tr.top - wr.top + tr.height / 2}px`;
  wrap.classList.add('zoom'); SFX.whoosh();
  await wait(420);
  const atk = bt.querySelector('.fighter.atk'), def = bt.querySelector('.fighter.def');
  atk.querySelector('img').src = art(attacker.c, attacker.t, 'attack');
  def.querySelector('img').src = art(victim.c, victim.t, 'idle');
  atk.querySelector('.ftag').textContent = `${attacker.c === 'w' ? '♔' : '♚'} ${NAMES[attacker.t]}`;
  def.querySelector('.ftag').textContent = `${victim.c === 'w' ? '♔' : '♚'} ${NAMES[victim.t]}`;
  $('#bTitle').textContent = SKILL[attacker.t];
  fx.innerHTML = '';
  bt.className = `battle show side-${attacker.c}${RANGED[attacker.t] ? ' ranged' : ''}`;
  bt.setAttribute('aria-hidden', 'false');
  await wait(30); bt.classList.add('enter');
  await wait(380); bt.classList.add('title-in');
  await wait(420); bt.classList.add('windup');
  await wait(260); bt.classList.remove('windup'); bt.classList.add('dash'); SFX.whoosh();
  if (RANGED[attacker.t]) {
    const orb = document.createElement('div'); orb.className = 'orb'; fx.appendChild(orb);
    await wait(20); orb.classList.add('go'); await wait(280); orb.remove();
  } else await wait(160);
  // impact
  SFX.hit(); bt.classList.add('impact');
  def.querySelector('img').src = art(victim.c, victim.t, 'hurt');
  const dmg = document.createElement('div'); dmg.className = 'dmg'; dmg.textContent = ['POW!', 'BAM!', 'KO!', 'WHAM!'][Math.random() * 4 | 0]; fx.appendChild(dmg);
  const burst = document.createElement('div'); burst.className = 'burst';
  for (let i = 0; i < 12; i++) { const s = document.createElement('i'), a = i / 12 * Math.PI * 2; s.style.setProperty('--x', Math.cos(a) * 110 + 'px'); s.style.setProperty('--y', Math.sin(a) * 110 + 'px'); burst.appendChild(s); }
  fx.appendChild(burst);
  if (navigator.vibrate) try { navigator.vibrate(40); } catch (e) {}
  await wait(480);
  bt.classList.add('ko'); SFX.ko();
  await wait(520);
  bt.className = 'battle'; bt.setAttribute('aria-hidden', 'true');
  wrap.classList.remove('zoom');
  await wait(300);
  pending = []; skipping = false;
}

/* ================= UI ================= */
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1100); }
function show(v) { $('#menu').classList.toggle('hidden', v !== 'menu'); $('#game').classList.toggle('hidden', v !== 'game'); }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify({ S, mode, human, level, lastMove, caps, reps })); } catch (e) {} }

function start(m, h, lv) {
  mode = m; human = h; level = lv; S = initState(); hist = []; sel = -1; lastMove = null; caps = { w: [], b: [] }; reps = {}; over = false; busy = false;
  moves = legal(S); show('game'); buildBoard(); render(); save();
  if (mode === 'ai' && human === 'b') aiTurn();
}
function resume() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY)); if (!d) return;
    ({ S, mode, human, level, lastMove, caps, reps } = d); reps = reps || {};
    hist = []; sel = -1; over = false; busy = false; moves = legal(S); show('game'); buildBoard(); render();
    if (mode === 'ai' && S.turn !== human) aiTurn();
  } catch (e) { localStorage.removeItem(SAVE_KEY); }
}
function undo() {
  if (busy || !hist.length) return;
  const pop = () => { const h = hist.pop(); S = h.S; caps = h.caps; lastMove = h.lastMove; reps = h.reps; };
  pop();
  if (mode === 'ai') while (S.turn !== human && hist.length) pop();
  over = false; sel = -1; moves = legal(S); render(); save();
  if (mode === 'ai' && S.turn !== human) aiTurn();
}

function segPick(id, cb) {
  document.querySelectorAll(`#${id} button`).forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll(`#${id} button`).forEach(x => x.classList.toggle('on', x === b)); cb(b.dataset.v);
  }));
}
let pickLevel = 1, pickColor = 'w';
segPick('levelSeg', v => pickLevel = +v);
segPick('colorSeg', v => pickColor = v);
$('#aiBtn').onclick = () => start('ai', pickColor === 'r' ? (Math.random() < .5 ? 'w' : 'b') : pickColor, pickLevel);
$('#pvpBtn').onclick = () => start('pvp', 'w', 1);
$('#resumeBtn').onclick = resume;
$('#undoBtn').onclick = undo;
$('#menuBtn').onclick = () => { if (busy) return; refreshMenu(); show('menu'); };
$('#againBtn').onclick = () => { $('#result').classList.add('hidden'); start(mode, human, level); };
$('#resMenuBtn').onclick = () => { $('#result').classList.add('hidden'); refreshMenu(); show('menu'); };
const setAnim = v => { animOn = v; localStorage.setItem('cozychess-anim', v ? '1' : '0'); $('#animToggle').checked = v; if (S) render(); };
$('#animToggle').onchange = e => setAnim(e.target.checked);
$('#animBtn').onclick = () => setAnim(!animOn);
const setSound = v => { soundOn = v; localStorage.setItem('cozychess-sound', v ? '1' : '0'); $('#soundBtn').textContent = v ? '🔊' : '🔇'; };
$('#soundBtn').onclick = () => setSound(!soundOn);

function refreshMenu() {
  $('#resumeBtn').classList.toggle('hidden', !localStorage.getItem(SAVE_KEY));
  $('#titleArt').innerHTML = [['w', 'n'], ['w', 'k'], ['b', 'q']].map(([c, t]) => `<img src="${art(c, t)}" alt="">`).join('');
}

$('#ver').textContent = `Versi ${GAME_VERSION}`;
setSound(soundOn); $('#animToggle').checked = animOn;
fetch('sprites/list.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : []).catch(() => [])
  .then(list => {
    SPRITES = new Set(Array.isArray(list) ? list : []);
    // Discard placeholders cached while the sprite manifest was loading.
    for (const key of Object.keys(artCache)) delete artCache[key];
    refreshMenu();
    if (S) render();
  });
refreshMenu();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js').catch(() => {});
