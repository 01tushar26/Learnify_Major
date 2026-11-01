let ctx;

function tone(freq, start, dur, type = "sine", gain = 0.12, endFreq) {
  const c = ctx;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime + start);
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + start + dur);
  g.gain.setValueAtTime(gain, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.02);
}

export function playSound(kind) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    if (kind === "know") { tone(660, 0, 0.12); tone(880, 0.09, 0.18); }          // happy two-note
    else if (kind === "review") { tone(300, 0, 0.18, "triangle", 0.1, 200); }   // soft low whoosh
    else if (kind === "flip") { tone(500, 0, 0.06, "sine", 0.06, 700); }        // tiny tick
    else if (kind === "done") { tone(523, 0, 0.12); tone(659, 0.12, 0.12); tone(784, 0.24, 0.25); }
  } catch {
    /* sound is optional */
  }
}