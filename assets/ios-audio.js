/* iPhone audio fix (shared): main bunyi walaupun suis silent ON, dan unlock audio masa sentuhan pertama. */
(function () {
  var C = window.AudioContext || window.webkitAudioContext, all = [];
  if (C) {
    var Wrapped = function (o) { var c = new C(o); all.push(c); return c; };
    Wrapped.prototype = C.prototype;
    window.AudioContext = Wrapped; if (window.webkitAudioContext) window.webkitAudioContext = Wrapped;
  }
  var silent = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=';
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    all.forEach(function (c) {
      try {
        if (c.state !== 'running') c.resume();
        var b = c.createBuffer(1, 1, 22050), s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0);
      } catch (e) {}
    });
    try { var a = new Audio(silent); a.setAttribute('playsinline', ''); a.play().catch(function () {}); } catch (e) {}
  }
  ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true, capture: true }); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) all.forEach(function (c) { try { c.resume(); } catch (e) {} }); });
})();
