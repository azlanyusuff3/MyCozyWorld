/* Congkak — MyCozyWorld
   Papan: 0-6 lubang P0 (kanan, atas→bawah), 7 rumah P0 (bawah),
          8-14 lubang P1 (kiri, bawah→atas), 15 rumah P1 (atas).
   Lubang bertentangan: i <-> 14-i. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SEEDS = 7;
  var STORE = [7, 15];
  var LEVELS = [
    { name: 'Tok Wan', emoji: '👵' },
    { name: 'Mira', emoji: '👧' },
    { name: 'Pak Abu', emoji: '🧔' }
  ];
  var SEED_COLORS = ['#e8584a', '#3b9ae0', '#5cc97a', '#f5b942', '#b07ae0', '#ff8fb1', '#44c7c2', '#f07c35'];

  var S = {
    mode: localStorage.getItem('congkak_mode') || 'ai',
    level: +(localStorage.getItem('congkak_level') || 1),
    sound: localStorage.getItem('congkak_sound') !== '0'
  };
  var G = null; // game state

  /* ---------- rules (pure) ---------- */
  function owner(pos) { return pos < 7 ? 0 : (pos > 7 && pos < 15 ? 1 : -1); }
  function sideEmpty(b, p) { var o = p * 8; for (var i = o; i < o + 7; i++) if (b[i]) return false; return true; }

  // Generator: agih guli, yield setiap peristiwa (untuk animasi). Ubah b terus.
  function* sow(b, p, pit) {
    var my = STORE[p], their = STORE[1 - p], hand = b[pit], pos = pit, guard = 0;
    b[pit] = 0;
    yield { t: 'pick', pos: pit, n: hand };
    for (;;) {
      while (hand > 0) {
        pos = (pos + 1) % 16;
        if (pos === their) continue;
        b[pos]++; hand--;
        yield { t: 'drop', pos: pos, left: hand };
        if (++guard > 3000) return { extra: false };
      }
      if (pos === my) { yield { t: 'extra' }; return { extra: true }; }
      if (b[pos] > 1) { hand = b[pos]; b[pos] = 0; yield { t: 'pick', pos: pos, n: hand, relay: true }; continue; }
      // lubang kosong
      var opp = 14 - pos;
      if (owner(pos) === p && b[opp] > 0) {
        var got = b[opp] + 1;
        yield { t: 'shoot', pos: pos, opp: opp, n: got };
        b[my] += got; b[opp] = 0; b[pos] = 0;
      } else yield { t: 'stop', pos: pos };
      return { extra: false };
    }
  }
  function simulate(b, p, pit) {
    var g = sow(b, p, pit), r;
    while (!(r = g.next()).done);
    return r.value;
  }
  function moves(b, p) { var m = [], o = p * 8; for (var i = o; i < o + 7; i++) if (b[i]) m.push(i); return m; }

  /* ---------- AI ---------- */
  // nilai terbaik giliran penuh (termasuk main lagi), dari sudut p
  function bestTurn(b, p, depth) {
    var ms = moves(b, p), best = -1e9, bestMove = ms[0];
    for (var k = 0; k < ms.length; k++) {
      var c = b.slice(), r = simulate(c, p, ms[k]), v;
      if (r.extra && depth > 0 && !sideEmpty(c, p)) v = bestTurn(c, p, depth - 1).v;
      else v = c[STORE[p]] - c[STORE[1 - p]] + (r.extra ? 2 : 0);
      if (v > best) { best = v; bestMove = ms[k]; }
    }
    return { v: best, m: bestMove };
  }
  // semua hasil satu giliran penuh (rantai main lagi), dengan langkah pertama
  function outcomes(b, p, depth, out, first) {
    var ms = moves(b, p);
    for (var k = 0; k < ms.length; k++) {
      var c = b.slice(), r = simulate(c, p, ms[k]), f = first === undefined ? ms[k] : first;
      if (r.extra && depth > 0 && !sideEmpty(c, p)) outcomes(c, p, depth - 1, out, f);
      else out.push({ b: c, m: f });
    }
    return out;
  }
  function score(b, p) { // dengan sapuan kalau tamat
    var a = b[STORE[p]], o = b[STORE[1 - p]];
    if (sideEmpty(b, 0) || sideEmpty(b, 1)) for (var i = 0; i < 7; i++) { a += b[p * 8 + i]; o += b[(1 - p) * 8 + i]; }
    return a - o;
  }
  function aiMove(b, p, level) {
    var ms = moves(b, p);
    if (level === 0 && Math.random() < 0.55) return ms[Math.floor(Math.random() * ms.length)];
    if (level <= 1) return bestTurn(b, p, level === 0 ? 0 : 3).m;
    // Susah: giliran aku vs balasan terbaik lawan
    var mine = outcomes(b, p, 3, []), best = -1e9, bm = ms[0];
    for (var k = 0; k < mine.length; k++) {
      var c = mine[k].b, v;
      if (sideEmpty(c, 1 - p) || sideEmpty(c, p)) v = score(c, p);
      else {
        var th = outcomes(c, 1 - p, 3, []), worst = 1e9;
        for (var j = 0; j < th.length; j++) { var w = score(th[j].b, p); if (w < worst) worst = w; }
        v = worst;
      }
      if (v > best) { best = v; bm = mine[k].m; }
    }
    return bm;
  }

  /* ---------- audio ---------- */
  var ac = null;
  function tone(f, d, type, vol) {
    if (!S.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + (d || 0.12));
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + (d || 0.12));
    } catch (e) {}
  }
  var clack = function (combo) { tone(520 + Math.min(combo, 12) * 45, 0.07, 'triangle', 0.16); };

  /* ---------- UI build ---------- */
  var board = $('board'), cells = [];
  function seedPos(i, store) {
    // susunan spiral stabil
    var a = i * 2.39996, r = Math.sqrt(i + 0.6) / Math.sqrt(store ? 40 : 15);
    return store ? [50 + Math.cos(a) * r * 38, 50 + Math.sin(a) * r * 34] : [50 + Math.cos(a) * r * 30, 50 + Math.sin(a) * r * 30];
  }
  function buildBoard() {
    board.innerHTML = ''; cells = [];
    for (var i = 0; i < 16; i++) {
      var el = document.createElement('div');
      if (i === 7 || i === 15) {
        el.className = 'store ' + (i === 15 ? 'top' : 'bot');
        el.innerHTML = '<span class="lbl">' + (i === 15 ? 'RUMAH ' + G.names[1].toUpperCase() : 'RUMAH ' + G.names[0].toUpperCase()) + '</span>';
      } else if (i < 7) {
        el.className = 'pit mine'; el.style.gridColumn = 2; el.style.gridRow = 2 + i;
        el.dataset.i = i;
      } else {
        el.className = 'pit theirs'; el.style.gridColumn = 1; el.style.gridRow = 2 + (6 - (i - 8));
        el.dataset.i = i;
      }
      var c = document.createElement('span'); c.className = 'cnt'; el.appendChild(c);
      var sl = document.createElement('div'); sl.className = 'seeds'; sl.style.cssText = 'position:absolute;inset:0'; el.appendChild(sl);
      el._cnt = c; el._seeds = sl; el._n = -1;
      board.appendChild(el); cells.push(el);
    }
  }
  function renderPit(i) {
    var el = cells[i], n = G.b[i], store = i === 7 || i === 15;
    var max = store ? 40 : 15, show = Math.min(n, max);
    el._cnt.textContent = n;
    if (el._n === n) return;
    var sl = el._seeds, have = sl.children.length;
    while (have > show) { sl.removeChild(sl.lastChild); have--; }
    for (var k = have; k < show; k++) {
      var s = document.createElement('i'), p = seedPos(k, store);
      s.className = 'seed';
      s.style.left = p[0] + '%'; s.style.top = p[1] + '%';
      s.style.background = 'radial-gradient(circle at 35% 30%,#fff9,' + SEED_COLORS[(k * 5 + i) % SEED_COLORS.length] + ' 55%)';
      sl.appendChild(s);
    }
    if (store) { // guli emas
      var gold = G.gold[i === 7 ? 0 : 1];
      for (var q = 0; q < sl.children.length; q++) sl.children[q].classList.toggle('gold', q < gold);
    }
    el._n = n;
  }
  function render() {
    for (var i = 0; i < 16; i++) renderPit(i);
    $('meScore').textContent = G.b[7]; $('oppScore').textContent = G.b[15];
    var meTurn = G.turn === 0;
    document.querySelector('.who.me').classList.toggle('turn', meTurn && !G.over);
    document.querySelector('.who.opp').classList.toggle('turn', !meTurn && !G.over);
    var canP = !G.busy && !G.over && isHuman(G.turn);
    cells.forEach(function (el, i) {
      if (i === 7 || i === 15) return;
      var mine = owner(i) === G.turn && canP && G.b[i] > 0;
      el.classList.toggle('can', mine);
      // dalam 2 pemain, lubang kiri boleh ditekan oleh P2
      el.classList.toggle('mine', owner(i) === 0);
      el.style.cursor = mine ? 'pointer' : 'default';
    });
  }
  function isHuman(p) { return p === 0 || S.mode === 'pvp'; }
  function say(t) { $('msg').innerHTML = t; }
  function pop(t, color) {
    var el = $('pop'); el.textContent = t; el.style.color = color || '#fff';
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- rhythm ---------- */
  var R = { active: false, land: 0, tapped: false, combo: 0, meter: 0, dur: 360, player: 0 };
  function rhythmUI() {
    $('combo').textContent = 'Combo ' + R.combo;
    $('goldFill').style.width = (R.meter / 5 * 100) + '%';
    $('goldTxt').textContent = '🟡 ' + G.gold[S.mode === 'pvp' ? G.turn : 0];
  }
  function onTap(e) {
    if (!R.active || R.tapped) return;
    R.tapped = true;
    var dt = performance.now() - R.land, ad = Math.abs(dt), x = e.clientX, y = e.clientY, label, col;
    if (e.touches && e.touches[0]) { x = e.touches[0].clientX; y = e.touches[0].clientY; }
    if (ad < 90) { label = 'TEPAT!'; col = '#f3a62b'; R.combo++; R.meter++; R.dur = Math.max(170, R.dur - 30); tone(880 + R.combo * 30, 0.08, 'sine', 0.2); }
    else if (ad < 180) { label = 'Ok'; col = '#5cc97a'; R.dur = Math.max(200, R.dur - 10); }
    else { label = dt < 0 ? 'Awal' : 'Lambat'; col = '#b0805c'; R.combo = 0; R.meter = 0; R.dur = 360; }
    var f = document.createElement('div'); f.className = 'tapfx'; f.textContent = label; f.style.color = col;
    f.style.left = x + 'px'; f.style.top = y + 'px'; document.body.appendChild(f);
    setTimeout(function () { f.remove(); }, 650);
    if (R.meter >= 5) {
      R.meter = 0;
      var p = R.player;
      G.b[STORE[p]]++; G.gold[p]++; G.bonus[p]++;
      pop('+1 GULI EMAS! 🟡', '#ffe066'); tone(1320, 0.25, 'triangle', 0.22);
      renderPit(STORE[p]); render();
    }
    rhythmUI();
  }
  document.addEventListener('pointerdown', function (e) { if (G && !$('game').classList.contains('hidden')) onTap(e); });

  /* ---------- turn flow ---------- */
  async function play(pit) {
    if (G.busy || G.over) return;
    var p = G.turn;
    G.busy = true; render();
    var human = isHuman(p), g = sow(G.b, p, pit), r, combo0 = R.combo;
    R.player = p;
    var stepDur = human ? R.dur : 230;
    while (!(r = g.next()).done) {
      var ev = r.value;
      if (ev.t === 'pick') {
        cells[ev.pos].classList.add('hand');
        renderPit(ev.pos);
        if (ev.relay) { say('Kaut ' + ev.n + ' guli, sambung!'); tone(330, 0.1, 'square', 0.06); }
        await wait(human ? 160 : 160);
        cells[ev.pos].classList.remove('hand');
      } else if (ev.t === 'drop') {
        var el = cells[ev.pos];
        if (human) {
          stepDur = R.dur;
          var ring = document.createElement('div'); ring.className = 'ring'; ring.style.setProperty('--d', stepDur + 'ms');
          el.appendChild(ring);
          R.active = true; R.tapped = false; R.land = performance.now() + stepDur;
          await wait(stepDur + 90); // tetingkap tap lepas mendarat
          ring.remove();
          if (!R.tapped) { R.combo = 0; R.meter = Math.max(0, R.meter - 1); R.dur = Math.min(360, R.dur + 20); }
          R.active = false;
          rhythmUI();
        } else await wait(stepDur);
        el.classList.add('hit'); setTimeout(function (e) { e.classList.remove('hit'); }.bind(null, el), 110);
        clack(R.combo);
        renderPit(ev.pos);
        $('meScore').textContent = G.b[7]; $('oppScore').textContent = G.b[15];
      } else if (ev.t === 'shoot') {
        cells[ev.pos].classList.add('hand'); cells[ev.opp].classList.add('hand');
        board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
        pop('TEMBAK! +' + ev.n, '#fff'); tone(196, 0.3, 'sawtooth', 0.12); tone(392, 0.25, 'square', 0.08);
        await wait(650);
        cells[ev.pos].classList.remove('hand'); cells[ev.opp].classList.remove('hand');
      } else if (ev.t === 'extra') {
        pop('MAIN LAGI!', '#ffe066'); tone(660, 0.12); setTimeout(function () { tone(990, 0.15); }, 110);
        await wait(450);
      } else if (ev.t === 'stop') {
        await wait(200);
      }
    }
    render();
    var extra = r.value.extra;
    G.busy = false;
    nextTurn(extra ? p : 1 - p);
  }

  function nextTurn(p) {
    if (sideEmpty(G.b, p)) {
      // sapu baki ke rumah tuan masing-masing
      for (var q = 0; q < 2; q++) for (var i = q * 8; i < q * 8 + 7; i++) { G.b[STORE[q]] += G.b[i]; G.b[i] = 0; }
      G.over = true; render(); return endGame();
    }
    G.turn = p; render(); rhythmUI();
    if (isHuman(p)) say(S.mode === 'pvp' ? 'Giliran <b>' + G.names[p] + '</b>' : 'Giliran kau, pilih lubang');
    else {
      say(G.names[1] + ' tengah fikir…');
      setTimeout(function () { if (!G.over) play(aiMove(G.b.slice(), 1, S.level)); }, 650);
    }
  }

  function endGame() {
    var a = G.b[7], b = G.b[15], t, txt;
    if (S.mode === 'pvp') {
      t = a === b ? 'Seri!' : (a > b ? G.names[0] : G.names[1]) + ' menang!';
    } else {
      t = a > b ? 'Kau menang! 🎉' : a < b ? 'Alamak, kalah…' : 'Seri!';
      if (a > b) { tone(660, .15); setTimeout(function () { tone(880, .15); }, 150); setTimeout(function () { tone(1320, .3); }, 300); }
    }
    txt = G.names[0] + ' <b>' + a + '</b> — <b>' + b + '</b> ' + G.names[1] +
      (G.bonus[0] || G.bonus[1] ? '<br>🟡 Guli emas: ' + G.bonus[0] + (S.mode === 'pvp' ? ' / ' + G.bonus[1] : '') : '');
    if (S.mode === 'ai' && a > b) {
      var k = 'congkak_win_' + S.level; localStorage.setItem(k, (+(localStorage.getItem(k) || 0) + 1));
    }
    $('endTitle').textContent = t; $('endText').innerHTML = txt;
    say('Tamat');
    setTimeout(function () { $('endBox').classList.remove('hidden'); }, 600);
  }

  function start() {
    var b = []; for (var i = 0; i < 16; i++) b.push(i === 7 || i === 15 ? 0 : SEEDS);
    var lv = LEVELS[S.level];
    G = { b: b, turn: 0, busy: false, over: false, gold: [0, 0], bonus: [0, 0],
      names: S.mode === 'pvp' ? ['Pemain 1', 'Pemain 2'] : ['Kau', lv.name] };
    R.combo = 0; R.meter = 0; R.dur = 360;
    $('meName').textContent = (S.mode === 'pvp' ? '🟠 ' : '') + G.names[0];
    $('oppName').textContent = (S.mode === 'pvp' ? '🔵 ' : lv.emoji + ' ') + G.names[1];
    $('menu').classList.add('hidden'); $('game').classList.remove('hidden'); $('endBox').classList.add('hidden');
    buildBoard(); render(); rhythmUI();
    nextTurn(S.mode === 'pvp' ? 0 : 0);
  }

  board.addEventListener('click', function (e) {
    var el = e.target.closest('.pit'); if (!el || !G || G.busy || G.over) return;
    var i = +el.dataset.i;
    if (!isHuman(G.turn) || owner(i) !== G.turn || !G.b[i]) return;
    play(i);
  });

  /* ---------- menu ---------- */
  function seg(id, key, cb) {
    var box = $(id);
    function upd() { [].forEach.call(box.children, function (b) { b.classList.toggle('on', b.dataset.v == S[key]); }); if (cb) cb(); }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S[key] = key === 'level' ? +b.dataset.v : b.dataset.v;
      localStorage.setItem('congkak_' + key, S[key]); upd();
    });
    upd();
  }
  seg('modeSeg', 'mode', function () { $('levelBox').style.display = S.mode === 'ai' ? '' : 'none'; });
  seg('levelSeg', 'level');
  $('startBtn').onclick = start;
  $('againBtn').onclick = start;
  $('menuBtn').onclick = function () { $('endBox').classList.add('hidden'); $('game').classList.add('hidden'); $('menu').classList.remove('hidden'); G = null; };
  function soundUI() { $('soundBtn').textContent = S.sound ? '🔊' : '🔇'; }
  $('soundBtn').onclick = function () { S.sound = !S.sound; localStorage.setItem('congkak_sound', S.sound ? '1' : '0'); soundUI(); };
  soundUI();

  // untuk ujian
  window.__congkak = { sow: sow, simulate: simulate, aiMove: aiMove };
})();
