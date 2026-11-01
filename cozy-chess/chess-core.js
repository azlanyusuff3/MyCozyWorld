'use strict';
// Shared rules and AI search, loaded both by game.js and the AI Web Worker.
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

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
    const add = (to, x) => { if (b[to]?.t === 'k') return; out.push(Object.assign({ from: i, to, cap: b[to] }, x)); };
    if (p.t === 'p') {
      const d = c === 'w' ? -1 : 1, start = c === 'w' ? 6 : 1, last = c === 'w' ? 0 : 7;
      const pushP = (to, x) => { if ((to >> 3) === last) for (const pr of 'qrbn') add(to, Object.assign({ promo: pr }, x)); else add(to, x); };
      const r1 = r + d;
      if (on(r1, f) && !b[r1 * 8 + f]) { pushP(r1 * 8 + f); if (r === start && !b[(r + 2 * d) * 8 + f]) add((r + 2 * d) * 8 + f, { dbl: 1 }); }
      for (const df of [-1, 1]) {
        const ff = f + df; if (!on(r1, ff)) continue; const t = r1 * 8 + ff;
        if (b[t] && b[t].c === o) pushP(t);
        else if (t === s.ep && !b[t] && b[r * 8 + ff]?.t === 'p' && b[r * 8 + ff]?.c === o) add(t, { epCap: r * 8 + ff, cap: b[r * 8 + ff] });
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
  const rest = [];
  for (let i = 0; i < 64; i++) if (b[i] && b[i].t !== 'k') rest.push({ t: b[i].t, color: ((i >> 3) + (i & 7)) & 1 });
  if (!rest.length || (rest.length === 1 && ['n', 'b'].includes(rest[0].t))) return true;
  return rest.every(p => p.t === 'b' && p.color === rest[0].color);
}
// An en-passant marker only distinguishes repetitions if capture is legal.
const posKey = s => {
  const ep = s.ep >= 0 && legal(s).some(m => m.epCap != null) ? s.ep : -1;
  return s.b.map(p => p ? (p.c === 'w' ? p.t.toUpperCase() : p.t) : '.').join('') + s.turn + JSON.stringify(s.cr) + ep;
};

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
  const check = inCheck(s), stand = (s.turn === 'w' ? 1 : -1) * evalS(s);
  if (qd <= 0) return stand;
  if (!check) {
    if (stand >= bt) return stand;
    if (stand > a) a = stand;
  }
  const candidates = check ? legal(s) : pseudo(s).filter(m => m.cap);
  if (check && !candidates.length) return -100000;
  for (const m of order(candidates)) {
    const n = apply(s, m);
    if (!check && attacked(n.b, kingSq(n.b, s.turn), n.turn)) continue;
    const v = -qs(n, -bt, -a, qd - 1);
    if (v >= bt) return v;
    if (v > a) a = v;
  }
  return a;
}
function nega(s, d, a, bt, ply) {
  if (d === 0) {
    const ms = legal(s);
    if (!ms.length) return inCheck(s) ? -100000 + ply : 0;
    return qs(s, a, bt, 4);
  }
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

