// Tukar VERSION setiap kali update game supaya phone ambil versi baru.
const VERSION = 'cozy-arena-v8';
const ASSETS = [
  './', 'index.html', 'game.js', 'manifest.json',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/apple-touch-icon.png',
  ...['knight', 'archer', 'mage', 'healer'].flatMap(t => [`assets/heroes/opt/${t}_idle.webp`, `assets/heroes/opt/${t}_attack.webp`]),
  ...['knight', 'archer', 'healer'].flatMap(t => ['windup', 'hurt', 'walk1', 'walk2', 'victory', 'cast'].map(n => `assets/heroes/opt/${t}_${n}.webp`)),
  ...['windup', 'hurt', 'walk1', 'walk2', 'victory', 'cast'].map(n => `assets/heroes/opt/mage_${n}.webp`),
  ...['assassin', 'bear', 'pyro', 'gunner'].flatMap(t => ['idle', 'attack', 'windup', 'hurt', 'walk1', 'walk2', 'victory', 'cast'].map(n => `assets/heroes/opt/${t}_${n}.webp`)),
  'assets/ui/logo.webp',
  ...['forest', 'desert', 'snow', 'volcano'].map(d => `assets/arena/${d}.webp`),
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return res;
  })));
});
