// Tukar VERSION setiap kali update game supaya phone ambil versi baru.
const VERSION = 'cozy-arena-v14';
const ASSETS = [
  './', 'index.html', 'game.js', 'manifest.json',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png',
  ...['knight', 'archer', 'mage', 'healer'].flatMap(t => [`assets/heroes/opt/${t}_idle.webp`, `assets/heroes/opt/${t}_attack.webp`]),
  ...['knight', 'archer', 'healer'].flatMap(t => ['windup', 'hurt', 'walk1', 'walk2', 'victory', 'cast'].map(n => `assets/heroes/opt/${t}_${n}.webp`)),
  ...['windup', 'hurt', 'walk1', 'walk2', 'victory', 'cast'].map(n => `assets/heroes/opt/mage_${n}.webp`),
  ...['assassin', 'bear', 'pyro', 'gunner'].flatMap(t => ['idle', 'attack', 'windup', 'hurt', 'walk1', 'walk2', 'victory', 'cast'].map(n => `assets/heroes/opt/${t}_${n}.webp`)),
  ...['back', 'side'].flatMap(d => ['idle', 'walk1', 'walk2', 'windup', 'attack', 'hurt'].map(n => ['knight', 'archer', 'mage', 'healer', 'assassin', 'bear', 'pyro', 'gunner'].map(t => `assets/heroes/opt/${t}_${d}_${n}.webp`)).flat()),
  'assets/ui/logo.webp',
  ...['bg_forest_night', 'panel_wood', 'card_frame', 'btn_gold', 'btn_purple', 'icon_coin', 'icon_heart', 'icon_dice', 'icon_swords', 'icon_star', 'tile_stone_light', 'tile_stone_dark'].map(n => `assets/ui/${n}.webp`),
  ...['knight', 'archer', 'mage', 'healer', 'assassin', 'bear', 'pyro', 'gunner'].map(t => `assets/ui/portrait_${t}.webp`),
  ...['forest', 'desert', 'snow', 'volcano'].map(d => `assets/arena/${d}.webp`),
];
self.addEventListener('install', e => {
  // cache: 'reload' skips the browser's HTTP cache, so a new version never stores stale files
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const code = e.request.mode === 'navigate' || /\/(index\.html|game\.js|manifest\.json)?$/.test(url.pathname) || url.pathname.endsWith('.js');
  if (code) {
    // game code: network first (always newest when online), cache when offline
    e.respondWith(fetch(new Request(e.request, { cache: 'no-cache' })).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('index.html'))));
    return;
  }
  // images & sounds: cache first
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  })));
});
