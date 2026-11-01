'use strict';
// AI runs outside the main UI thread using the exact same chess engine.
importScripts('chess-core.js');
self.onmessage = e => {
  const { job, state, level } = e.data || {};
  try {
    if (!state || !Array.isArray(state.b) || state.b.length !== 64) throw Error('Invalid board');
    const lv = Math.min(2, Math.max(0, Number(level) || 0));
    self.postMessage({ job, move: bestMove(state, lv) });
  } catch (err) {
    self.postMessage({ job, error: String(err) });
  }
};
