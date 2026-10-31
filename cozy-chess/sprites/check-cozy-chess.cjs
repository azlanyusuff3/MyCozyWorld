const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, 'cozy-chess-work');
const names = JSON.parse(fs.readFileSync(path.join(root, 'cozy-chess/sprites/list.json')));
assert.equal(names.length, 36);
assert.equal(new Set(names).size, 36);
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, {
    innerHTML: '', textContent: '', checked: false,
    classList: { toggle() {}, add() {}, remove() {} },
    addEventListener() {},
  });
  return elements.get(selector);
}
let resolveManifest;
const context = vm.createContext({
  document: { querySelector: element, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  navigator: {}, window: {}, console,
  fetch: () => new Promise(resolve => { resolveManifest = resolve; }),
});
const run = code => vm.runInContext(code, context);
run(fs.readFileSync(path.join(root, 'cozy-chess/game.js'), 'utf8'));
assert.match(element('#titleArt').innerHTML, /data:image\/svg/);
// Start a game before the asynchronous manifest arrives, and ensure it rerenders.
run('S = initState(); globalThis.renderCount = 0; render = () => { renderCount++; };');
resolveManifest({ ok: true, json: async () => names });
setImmediate(() => {
  assert.doesNotMatch(element('#titleArt').innerHTML, /data:image/);
  assert.match(element('#titleArt').innerHTML, /sprites\/white_king_idle.webp/);
  assert.equal(run('renderCount'), 1);
  for (const [team, c] of [['white', 'w'], ['black', 'b']]) {
    for (const [piece, t] of [['king','k'], ['queen','q'], ['rook','r'], ['bishop','b'], ['knight','n'], ['pawn','p']]) {
      for (const pose of ['idle','attack','hurt']) {
        const expected = `${team}_${piece}_${pose}.webp`;
        assert(names.includes(expected), expected);
        assert.equal(run(`art('${c}', '${t}', '${pose}')`), `sprites/${expected}`);
        assert(fs.existsSync(path.join(root, 'cozy-chess/sprites', expected)));
      }
    }
  }
  run("SPRITES.delete('white_king_attack.webp'); delete artCache.white_king_attack;");
  assert.equal(run("art('w', 'k', 'attack')"), 'sprites/white_king_idle.webp');
  const sw = vm.createContext({ self: { addEventListener() {} } });
  const assets = vm.runInContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8') + '\nASSETS', sw);
  for (const name of names) assert(assets.includes(`cozy-chess/sprites/${name}`), name);
  console.log('PASS: 36 sprite paths, async placeholder invalidation, early-game rerender, idle fallback, and offline asset coverage');
});
