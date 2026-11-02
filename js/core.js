'use strict';
/* =====================================================================
   core.js — the boring-but-load-bearing bits.
   rng + noise, the palette, pixel drawing primitives, and a tiny
   bitmap font so signs in the world are real pixels, not webfonts.
   ===================================================================== */

const TILE = 16;

/* ---------- random & noise ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash2(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s);
  const c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s = 0) {
  return vnoise(x, y, s) * 0.62 + vnoise(x * 2.03, y * 2.03, s + 17) * 0.28 + vnoise(x * 4.1, y * 4.1, s + 31) * 0.1;
}
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
const pick = (arr, r = Math.random()) => arr[Math.floor(r * arr.length) % arr.length];

/* ---------- palette ----------
   one hand-tuned palette for everything. ramps are hue-shifted:
   shadows lean teal/plum, highlights lean warm.                    */
const C = {
  ink: '#2b2135', ink2: '#46344f', white: '#fff9ee', black: '#1a1422',
  // grass
  g0: '#1d3d3c', g1: '#2a5c45', g2: '#3e7c45', g3: '#5a9a48', g4: '#76b552', g5: '#9ccc5e', g6: '#cfe68a',
  // dirt
  d0: '#5c3b33', d1: '#87573d', d2: '#b07d4c', d3: '#d0a066', d4: '#e6c28a', d5: '#f3dcac',
  // sand
  s0: '#bf9a66', s1: '#dcbc86', s2: '#ecd6a4', s3: '#f8ecc9',
  // water
  w0: '#1b2f5c', w1: '#22467d', w2: '#2b5f9a', w3: '#3a7db7', w4: '#5aa4d0', w5: '#93cfe2', w6: '#e3f6f2',
  // stone (cool)
  t0: '#34324a', t1: '#56556f', t2: '#7a7a94', t3: '#a3a3b8', t4: '#cfcedb', t5: '#ebeaf0',
  // wood
  k0: '#3f2829', k1: '#653d33', k2: '#8d573d', k3: '#b4784d', k4: '#d69e67', k5: '#efc690',
  // reds
  r0: '#561c30', r1: '#86283b', r2: '#bb3f48', r3: '#e2655a', r4: '#f49a84',
  // blues
  b0: '#202a55', b1: '#314a89', b2: '#4b74bf', b3: '#79a3e4', b4: '#b5d0f4',
  // teals
  c0: '#14444a', c1: '#206b69', c2: '#33988a', c3: '#64c4a9', c4: '#a8e6cf',
  // yellows
  y0: '#8a501d', y1: '#cf812a', y2: '#f0b43f', y3: '#fadb74', y4: '#fdf0b4',
  // pinks
  p0: '#7e3159', p1: '#bd5279', p2: '#e98ba7', p3: '#f7c0cd',
  // purples
  v0: '#3a2858', v1: '#5b3f86', v2: '#8664b6', v3: '#b698df',
  // skin
  sk0: '#9a5848', sk1: '#cf8a69', sk2: '#efba91', sk3: '#f9d8b8',
  // plaster / cream
  m0: '#9c8670', m1: '#c6ad8c', m2: '#e4d1ac', m3: '#f6ead0',
  // cliff rock
  q0: '#4a3434', q1: '#6e4f45', q2: '#93705d', q3: '#b8957a', q4: '#d6b896',
};

const _rgbCache = {};
function rgb(hex) {
  if (_rgbCache[hex]) return _rgbCache[hex];
  const n = parseInt(hex.slice(1), 16);
  return (_rgbCache[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
}

/* ---------- canvas + pixel primitives ---------- */
function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0);
  c.g = c.getContext('2d');
  c.g.imageSmoothingEnabled = false;
  return c;
}
function px(g, x, y, c) { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); }
function rect(g, x, y, w, h, c) { if (w <= 0 || h <= 0) return; g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); }
function hl(g, x0, x1, y, c) { rect(g, Math.min(x0, x1), y, Math.abs(x1 - x0) + 1, 1, c); }
function vl(g, x, y0, y1, c) { rect(g, x, Math.min(y0, y1), 1, Math.abs(y1 - y0) + 1, c); }
// pixel-perfect filled ellipse (center may be .5 for even sizes)
function ell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    const dy = (y + 0.5 - cy) / ry;
    if (Math.abs(dy) > 1) continue;
    const w = rx * Math.sqrt(1 - dy * dy);
    const x0 = Math.round(cx - w), x1 = Math.round(cx + w);
    if (x1 > x0) g.fillRect(x0, y, x1 - x0, 1);
  }
}
function disc(g, cx, cy, r, c) { ell(g, cx, cy, r, r, c); }
function line(g, x0, y0, x1, y1, c) {
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = c;
  for (;;) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// ascii → canvas. rows: array of strings, map: char → color ('.' and ' ' are clear)
function sprite(rows, map) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const cv = canvas(w, h);
  for (let y = 0; y < h; y++) {
    const r = rows[y];
    for (let x = 0; x < r.length; x++) {
      const col = map[r[x]];
      if (col) { cv.g.fillStyle = col; cv.g.fillRect(x, y, 1, 1); }
    }
  }
  return cv;
}
function flipX(src) {
  const c = canvas(src.width, src.height);
  c.g.translate(src.width, 0); c.g.scale(-1, 1); c.g.drawImage(src, 0, 0);
  return c;
}
// draw a 1px outline around every opaque pixel (outside only)
function outlined(src, color, diagonals = false) {
  const w = src.width + 2, h = src.height + 2;
  const c = canvas(w, h);
  const d = src.g ? src.g.getImageData(0, 0, src.width, src.height).data : null;
  const solid = (x, y) => x >= 0 && y >= 0 && x < src.width && y < src.height && d[(y * src.width + x) * 4 + 3] > 0;
  c.g.fillStyle = color;
  for (let y = -1; y <= src.height; y++)
    for (let x = -1; x <= src.width; x++) {
      if (solid(x, y)) continue;
      if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1) ||
        (diagonals && (solid(x - 1, y - 1) || solid(x + 1, y - 1) || solid(x - 1, y + 1) || solid(x + 1, y + 1))))
        c.g.fillRect(x + 1, y + 1, 1, 1);
    }
  c.g.drawImage(src, 1, 1);
  return c;
}
// swap exact colors in a canvas (palette swap)
function recolor(src, map) {
  const c = canvas(src.width, src.height);
  c.g.drawImage(src, 0, 0);
  const id = c.g.getImageData(0, 0, c.width, c.height), d = id.data;
  const pairs = Object.entries(map).map(([a, b]) => [rgb(a), rgb(b)]);
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    for (const [a, b] of pairs)
      if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; }
  }
  c.g.putImageData(id, 0, 0);
  return c;
}

/* ---------- 3×5 bitmap font (variable width) ----------
   glyph: rows of '#'. optional `t` (row above) / `b` (row below)
   for Turkish diacritics, because ÇAY deserves its cedilla.        */
const GLYPHS = (() => {
  const g = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
    C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
    E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
    G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
    I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
    K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
    M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
    O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
    Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
    S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
    U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
    W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
    0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
    2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
    4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
    6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
    8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
    '.': ['.', '.', '.', '.', '#'], ',': ['..', '..', '..', '.#', '#.'], '!': ['#', '#', '#', '.', '#'],
    '?': ['##.', '..#', '.#.', '...', '.#.'], ':': ['.', '#', '.', '#', '.'], '-': ['...', '...', '###', '...', '...'],
    "'": ['#', '#', '.', '.', '.'], '/': ['..#', '..#', '.#.', '#..', '#..'], '+': ['...', '.#.', '###', '.#.', '...'],
    '$': ['.##', '##.', '.#.', '.##', '##.'], '£': ['.##', '.#.', '###', '.#.', '###'], '%': ['#.#', '..#', '.#.', '#..', '#.#'],
    '&': ['.#.', '#.#', '.#.', '#.#', '.##'], '(': ['.#', '#.', '#.', '#.', '.#'], ')': ['#.', '.#', '.#', '.#', '#.'],
    '=': ['...', '###', '...', '###', '...'], '>': ['#..', '.#.', '..#', '.#.', '#..'], '<': ['..#', '.#.', '#..', '.#.', '..#'],
    '*': ['...', '#.#', '.#.', '#.#', '...'], '"': ['#.#', '#.#', '...', '...', '...'], '#': ['#.#', '###', '#.#', '###', '#.#'],
    '♥': ['.#.#.', '#####', '#####', '.###.', '..#..'], '~': ['....', '.#.#', '#.#.', '....', '....'],
    '_': ['...', '...', '...', '...', '###'], '·': ['.', '.', '#', '.', '.'], '♪': ['.##', '.#.', '.#.', '##.', '##.'],
    '↑': ['..#..', '.###.', '#.#.#', '..#..', '..#..'], '↓': ['..#..', '..#..', '#.#.#', '.###.', '..#..'],
    ' ': ['..', '..', '..', '..', '..'],
  };
  g['Ç'] = { rows: g.C, b: '.#.' }; g['Ş'] = { rows: g.S, b: '.#.' };
  g['Ğ'] = { rows: g.G, t: '###' }; g['Ö'] = { rows: g.O, t: '#.#' };
  g['Ü'] = { rows: g.U, t: '#.#' }; g['İ'] = { rows: g.I, t: '.#.' };
  g['É'] = { rows: g.E, t: '.#.' };
  // lowercase, x-height 4 — so brand names can be written the way they're spelled (volina., echo)
  Object.assign(g, {
    a: ['...', '##.', '..#', '#.#', '.##'], b: ['#..', '#..', '##.', '#.#', '##.'], c: ['...', '.##', '#..', '#..', '.##'],
    d: ['..#', '..#', '.##', '#.#', '.##'], e: ['...', '.#.', '#.#', '##.', '.##'], f: ['.##', '#..', '###', '#..', '#..'],
    g: { rows: ['...', '.##', '#.#', '.##', '..#'], b: '##.' }, h: ['#..', '#..', '##.', '#.#', '#.#'], i: ['#', '.', '#', '#', '#'],
    j: { rows: ['.#', '..', '.#', '.#', '.#'], b: '#.' }, k: ['#..', '#.#', '##.', '#.#', '#.#'], l: ['#.', '#.', '#.', '#.', '.#'],
    m: ['.....', '##.#.', '#.#.#', '#.#.#', '#.#.#'], n: ['...', '##.', '#.#', '#.#', '#.#'], o: ['...', '.#.', '#.#', '#.#', '.#.'],
    p: { rows: ['...', '##.', '#.#', '##.', '#..'], b: '#..' }, q: { rows: ['...', '.##', '#.#', '.##', '..#'], b: '..#' },
    r: ['...', '#.#', '##.', '#..', '#..'], s: ['...', '.##', '#..', '..#', '##.'], t: ['.#.', '###', '.#.', '.#.', '..#'],
    u: ['...', '#.#', '#.#', '#.#', '.##'], v: ['...', '#.#', '#.#', '#.#', '.#.'], w: ['.....', '#...#', '#.#.#', '#.#.#', '.#.#.'],
    x: ['...', '#.#', '.#.', '.#.', '#.#'], y: { rows: ['...', '#.#', '#.#', '.##', '..#'], b: '##.' }, z: ['...', '###', '..#', '.#.', '###'],
  });
  g['ş'] = { rows: g.s, b: '.#.' }; g['ç'] = { rows: g.c, b: '.#.' }; g['ı'] = ['.', '.', '#', '#', '#'];
  g['ö'] = { rows: ['...', '#.#', '.#.', '#.#', '.#.'] }; g['ü'] = { rows: ['#.#', '...', '#.#', '#.#', '.##'] };
  g['ğ'] = { rows: ['###', '.##', '#.#', '.##', '..#'], b: '##.' }; g['é'] = { rows: ['.#.', '.#.', '#.#', '##.', '.##'] };
  return g;
})();
function glyph(ch) {
  let gl = GLYPHS[ch] || GLYPHS[ch.toUpperCase()] || GLYPHS['?'];
  if (Array.isArray(gl)) gl = { rows: gl };
  return gl;
}
function textWidth(s) {
  let w = 0;
  for (const ch of s) w += glyph(ch).rows[0].length + 1;
  return Math.max(0, w - 1);
}
// draws text with top-left at (x,y). cap height = 5px.
function text(g, s, x, y, col, shadow) {
  if (shadow) text(g, s, x, y + 1, shadow);
  g.fillStyle = col;
  let cx = x | 0;
  for (const ch of s) {
    const gl = glyph(ch), w = gl.rows[0].length;
    gl.rows.forEach((row, ry) => { for (let i = 0; i < w; i++) if (row[i] === '#') g.fillRect(cx + i, y + ry, 1, 1); });
    if (gl.t) for (let i = 0; i < w; i++) if (gl.t[i] === '#') g.fillRect(cx + i, y - 2, 1, 1);
    if (gl.b) for (let i = 0; i < w; i++) if (gl.b[i] === '#') g.fillRect(cx + i, y + 5, 1, 1);
    cx += w + 1;
  }
  return cx - x - 1;
}
function textCenter(g, s, cx, y, col, shadow) { return text(g, s, Math.round(cx - textWidth(s) / 2), y, col, shadow); }
// the same font, blown up k× — for neon signs and wordmarks
function textScaled(g, s, x, y, col, k = 2) {
  const tmp = canvas(textWidth(s) + 2, 9);
  text(tmp.g, s, 0, 2, col);
  g.drawImage(tmp, 0, 0, tmp.width, tmp.height, x, y - 2 * k, tmp.width * k, tmp.height * k);
  return textWidth(s) * k;
}

/* ---------- misc ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('artun.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('artun.' + k, JSON.stringify(v)); } catch (e) { /* private mode: fine */ } },
};
function londonTime(d = new Date(), tz = 'Europe/London') {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
    const get = t => +parts.find(p => p.type === t).value;
    return { h: get('hour') % 24, m: get('minute'), s: get('second') };
  } catch (e) { return { h: d.getUTCHours(), m: d.getUTCMinutes(), s: d.getUTCSeconds() }; }
}
