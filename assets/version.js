/* Label versi + butang "Paksa update". Baca VERSION terus dari sw.js kat server (tak guna cache). */
(function () {
  var me = document.currentScript, base = me.src.replace(/assets\/version\.js.*$/, '');
  function boot() {
    var box = document.createElement('div');
    box.id = 'verBox';
    box.style.cssText = 'position:fixed;left:8px;bottom:calc(6px + env(safe-area-inset-bottom));z-index:50;font:12px/1.2 system-ui,sans-serif;background:#fffef8ee;color:#555;border-radius:10px;padding:5px 8px;box-shadow:0 2px 6px #0002;display:flex;gap:6px;align-items:center';
    var page = me.getAttribute('data-game') || '';
    box.innerHTML = '<span id="verTxt">' + page + ' · semak versi…</span><button id="verBtn" type="button" style="border:0;border-radius:8px;padding:4px 7px;background:#2346b0;color:#fff;font:inherit;font-weight:700">↻ Update</button>';
    document.body.appendChild(box);
    var txt = box.querySelector('#verTxt');
    var cur = null;
    var cacheP = window.caches ? caches.keys().then(function (k) { return k.filter(function (x) { return /^mycozyworld-/.test(x); }).sort().pop() || null; }) : Promise.resolve(null);
    var srvP = fetch(base + 'sw.js?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) { var m = t.match(/VERSION\s*=\s*'([^']+)'/); return m ? m[1] : null; }).catch(function () { return null; });
    Promise.all([cacheP, srvP]).then(function (v) {
      cur = v[0]; var srv = v[1], show = function (s) { return s ? s.replace('mycozyworld-', '') : '?'; };
      if (srv && cur && srv !== cur) { txt.innerHTML = page + ' · <b style="color:#d1342f">' + show(cur) + ' → ' + show(srv) + ' ada update!</b>'; box.querySelector('#verBtn').style.background = '#d1342f'; }
      else txt.textContent = page + ' · ' + show(srv || cur) + (srv && srv === cur ? ' ✓ terkini' : '');
    });
    box.querySelector('#verBtn').onclick = function () {
      txt.textContent = 'Tengah update…';
      var jobs = [];
      if (window.caches) jobs.push(caches.keys().then(function (k) { return Promise.all(k.map(function (x) { return caches.delete(x); })); }));
      if (navigator.serviceWorker) jobs.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }));
      Promise.all(jobs).catch(function () {}).then(function () { var u = new URL(location.href); u.searchParams.set('v', Date.now()); location.replace(u.toString()); });
    };
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
