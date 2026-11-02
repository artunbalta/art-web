'use strict';
/* =====================================================================
   audio.js — no sound files. Everything is synthesised: blips,
   chimes, the Westminster quarters, a phone ring, rimshots, rain.
   ===================================================================== */

const SFX = (() => {
  let ac = null, master = null, muted = store.get('muted', false), musicOn = store.get('music', true);
  let rainNode = null, rainGain = null, ambGain = null, musicTimer = null;
  const ensure = () => {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(ac.destination);
      return true;
    } catch (e) { return false; }
  };
  const now = () => ac.currentTime;
  function tone(freq, dur, { type = 'square', vol = 0.12, at = 0, slide = 0, attack = 0.005, vib = 0 } = {}) {
    if (!ensure()) return;
    const t = now() + at;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 6; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, { vol = 0.15, at = 0, hp = 0, lp = 0, bp = 0, q = 1 } = {}) {
    if (!ensure()) return;
    const t = now() + at, len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = buf;
    let node = s;
    const add = (type, f) => { const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; node.connect(fl); node = fl; };
    if (hp) add('highpass', hp); if (lp) add('lowpass', lp); if (bp) add('bandpass', bp);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); g.connect(master); s.start(t); s.stop(t + dur);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12); // midi → Hz

  const api = {
    unlock: ensure,
    get muted() { return muted; },
    toggle() { muted = !muted; store.set('muted', muted); if (ensure()) master.gain.value = muted ? 0 : 0.55; if (muted) api.musicStop(); else api.musicStart(); return muted; },
    blip(p = 0) { tone(520 + p * 40 + Math.random() * 30, 0.035, { vol: 0.045 }); },
    step(surface) { noise(0.03, { vol: surface === 'wood' ? 0.05 : 0.025, bp: surface === 'wood' ? 900 : surface === 'stone' ? 2200 : 700, q: 2 }); },
    open() { tone(N(76), 0.08, { vol: 0.07 }); tone(N(83), 0.12, { vol: 0.07, at: 0.06 }); },
    close() { tone(N(79), 0.07, { vol: 0.06 }); tone(N(72), 0.1, { vol: 0.06, at: 0.05 }); },
    select() { tone(N(84), 0.05, { vol: 0.06 }); },
    secret() { [72, 76, 79, 84, 88].forEach((n, i) => tone(N(n), 0.18, { vol: 0.08, at: i * 0.07, type: i % 2 ? 'triangle' : 'square' })); tone(N(96), 0.4, { vol: 0.04, at: 0.38, type: 'sine' }); },
    zap() { noise(0.35, { vol: 0.35, hp: 1800 }); tone(110, 0.3, { type: 'sawtooth', vol: 0.12, slide: -60 }); tone(2400, 0.08, { vol: 0.05, at: 0.05 }); },
    crackle() { noise(0.05, { vol: 0.06, hp: 3000 }); },
    bark() { for (const at of [0, 0.2]) { tone(260, 0.12, { type: 'sawtooth', vol: 0.09, slide: -120, at }); noise(0.08, { vol: 0.08, bp: 900, q: 2, at }); } },
    meow() { tone(720, 0.28, { type: 'triangle', vol: 0.09, slide: 260, vib: 30 }); tone(980, 0.18, { type: 'triangle', vol: 0.06, at: 0.2, slide: -420 }); },
    purr() { for (let i = 0; i < 6; i++) noise(0.12, { vol: 0.05, lp: 180, at: i * 0.16 }); },
    gull() { for (let i = 0; i < 3; i++) tone(1300, 0.13, { type: 'sawtooth', vol: 0.05, at: i * 0.17, slide: -500 }); },
    coin() { tone(N(88), 0.07, { vol: 0.06 }); tone(N(95), 0.22, { vol: 0.06, at: 0.07 }); },
    radar() { tone(1250, 0.6, { type: 'sine', vol: 0.12 }); tone(1250, 0.5, { type: 'sine', vol: 0.04, at: 0.35 }); },
    splash() { noise(0.4, { vol: 0.12, lp: 1400 }); },
    thud() { tone(90, 0.2, { type: 'sine', vol: 0.25, slide: -40 }); noise(0.12, { vol: 0.08, lp: 500 }); },
    crash() { for (let i = 0; i < 9; i++) { tone(200 + Math.random() * 500, 0.08, { type: 'square', vol: 0.05, at: i * 0.05 }); noise(0.06, { vol: 0.06, bp: 900, at: i * 0.05 }); } },
    rimshot() { tone(180, 0.12, { type: 'sine', vol: 0.25, slide: -60 }); tone(140, 0.14, { type: 'sine', vol: 0.25, at: 0.16, slide: -50 }); noise(0.6, { vol: 0.16, hp: 6000, at: 0.34 }); },
    laugh() { for (let i = 0; i < 7; i++) noise(0.11, { vol: 0.05 + Math.random() * 0.03, bp: 600 + Math.random() * 500, q: 3, at: i * 0.09 + Math.random() * 0.03 }); },
    crickets() { for (let i = 0; i < 6; i++) { tone(4300, 0.04, { type: 'sine', vol: 0.03, at: i * 0.22 }); tone(4300, 0.04, { type: 'sine', vol: 0.03, at: i * 0.22 + 0.06 }); } },
    ring() { for (let r = 0; r < 2; r++) for (const at of [0, 0.6]) { tone(400, 0.38, { type: 'sine', vol: 0.07, at: at + r * 2.2 }); tone(450, 0.38, { type: 'sine', vol: 0.07, at: at + r * 2.2 }); } },
    whistle() { tone(N(81), 0.55, { type: 'sine', vol: 0.09, vib: 8 }); tone(N(85), 0.55, { type: 'sine', vol: 0.06, vib: 8 }); },
    chug(i) { noise(0.08, { vol: 0.07, lp: 600 }); },
    gallop() { [0, 0.09, 0.2, 0.28].forEach(a => tone(150, 0.05, { type: 'sine', vol: 0.12, at: a })); },
    chime() {
      // Westminster quarters, first two changes
      const E = 64, Fs = 66, Gs = 68, B = 59;
      [[Gs, Fs, E, B], [E, Gs, Fs, B]].flat().forEach((n, i) => tone(N(n), 1.1, { type: 'triangle', vol: 0.12, at: i * 0.55 + (i >= 4 ? 0.5 : 0) }));
    },
    tick() { tone(3000, 0.015, { vol: 0.03 }); },
    pop() { tone(600, 0.06, { type: 'sine', vol: 0.08, slide: 500 }); },
    tea() { [0, 0.1, 0.2].forEach(a => noise(0.09, { vol: 0.05, bp: 3000 + a * 4000, at: a })); tone(N(91), 0.08, { type: 'sine', vol: 0.05, at: 0.35 }); },
    rain(on, level = 1) {
      if (!ensure()) return;
      if (!rainNode) {
        const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.002 ? 3 : 0.5);
        rainNode = ac.createBufferSource(); rainNode.buffer = buf; rainNode.loop = true;
        const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1200;
        rainGain = ac.createGain(); rainGain.gain.value = 0;
        rainNode.connect(f); f.connect(rainGain); rainGain.connect(master); rainNode.start();
      }
      rainGain.gain.setTargetAtTime(on ? 0.06 * level : 0, now(), 0.6);
    },
    // a soft little waltz. two bars of chords, a melody that wanders.
    musicStart() {
      if (!musicOn || muted || musicTimer || !ensure()) return;
      const prog = [[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]];
      const mel = [72, 0, 74, 76, 0, 72, 69, 0, 72, 74, 0, 0, 70, 0, 72, 74, 0, 77, 76, 0, 74, 72, 0, 0];
      let beat = 0;
      const tick = () => {
        if (muted || !musicOn) return;
        const bar = Math.floor(beat / 3) % 4, b = beat % 3;
        const ch = prog[bar];
        if (b === 0) tone(N(ch[0] - 12), 0.9, { type: 'triangle', vol: 0.05 });
        else tone(N(ch[b]), 0.25, { type: 'triangle', vol: 0.025 });
        const m = mel[beat % mel.length];
        if (m) tone(N(m), 0.42, { type: 'square', vol: 0.016, attack: 0.02, vib: 3 });
        beat++;
      };
      musicTimer = setInterval(tick, 400);
    },
    musicStop() { clearInterval(musicTimer); musicTimer = null; },
    get music() { return musicOn; },
    toggleMusic() { musicOn = !musicOn; store.set('music', musicOn); if (musicOn) api.musicStart(); else api.musicStop(); return musicOn; },
  };
  return api;
})();
