'use strict';
/* =====================================================================
   terrain.js — tile map + a per-pixel ground painter.
   Tiles are blended with bilinear "soft majority" so coastlines and
   paths come out round instead of staircase-y. Everything is baked
   once into a big canvas; water shimmer lives in 2 overlay frames.
   ===================================================================== */

const T = { WATER: 0, GRASS: 1, PATH: 2, SAND: 3, COBBLE: 4, PLAZA: 5, BRIDGE: 6, RAIL: 7, TRACK: 8, MEADOW: 9, FLOOR: 10, PLATFORM: 11 };
const HARD = new Uint8Array(16); HARD[T.COBBLE] = HARD[T.PLAZA] = HARD[T.BRIDGE] = HARD[T.RAIL] = HARD[T.FLOOR] = HARD[T.PLATFORM] = 1;
const BIAS = new Float32Array(16); BIAS[T.PATH] = 0.05; BIAS[T.WATER] = -0.03; BIAS[T.SAND] = 0.01;
const grassy = t => t === T.GRASS || t === T.MEADOW;
// in-between grass shades so patches read as light, not camouflage
const GR_D = '#6aaa4e', GR_L = '#82bd57', GR_M = '#8cc45b';
const DT_L = '#dcb074', DT_D = '#c39159';
const CB_D = '#8f8fa6';

class Terrain {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.t = new Uint8Array(w * h);        // terrain type
    this.hgt = new Uint8Array(w * h);      // 0 = ground, 1 = plateau
    this.face = new Uint8Array(w * h);     // cliff face tiles (solid)
    this.stairs = new Uint8Array(w * h);   // stairs through a face
    this.overWater = new Uint8Array(w * h);// rail / bridge built over the sea
    this.bdir = new Uint8Array(w * h);     // bridge plank orientation (0: walk E-W, 1: walk N-S)
  }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.in(x, y) ? this.t[y * this.w + x] : T.WATER; }
  set(x, y, v) { if (this.in(x, y)) this.t[y * this.w + x] = v; }
  rect(x0, y0, x1, y1, v) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, v); }
  // only paint over land (handy for paths that shouldn't eat the sea)
  rectLand(x0, y0, x1, y1, v) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (this.get(x, y) !== T.WATER) this.set(x, y, v); }
  ellipse(cx, cy, rx, ry, v, landOnly = false) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!landOnly || this.get(x, y) !== T.WATER)) this.set(x, y, v);
      }
  }
  hRect(x0, y0, x1, y1, h) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (this.in(x, y)) this.hgt[y * this.w + x] = h; }
  isWater(x, y) { return this.get(x, y) === T.WATER || (this.in(x, y) && this.overWater[y * this.w + x] === 1); }
  // after plateaus are painted: the row under each plateau's south edge becomes a cliff face
  computeFaces() {
    for (let y = 1; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = y * this.w + x;
        if (this.hgt[i] === 0 && this.hgt[i - this.w] === 1 && this.t[i] !== T.WATER) this.face[i] = 1;
      }
  }
}

// jittered-grid voronoi → chunky boulders for cliff faces
function rockAt(x, y) {
  const cw = 7, ch = 6;
  const cx = Math.floor(x / cw), cy = Math.floor(y / ch);
  let d1 = 1e9, d2 = 1e9, best = null;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const gx = cx + i, gy = cy + j;
    const ox = gx * cw + hash2(gx, gy, 3) * cw, oy = gy * ch + hash2(gx, gy, 4) * ch;
    const d = Math.hypot((x - ox) * 0.9, (y - oy) * 1.15);
    if (d < d1) { d2 = d1; d1 = d; best = [gx, gy, oy]; } else if (d < d2) d2 = d;
  }
  return { edge: d2 - d1 < 1.1, tone: hash2(best[0], best[1], 5), fy: clamp((y - best[2] + 3.5) / 7, 0, 1) };
}

/* ---------- the ground painter ---------- */
function renderGround(tr) {
  const W = tr.w * TILE, H = tr.h * TILE, N = W * H;
  const pt = new Uint8Array(N);

  // 1) per-pixel terrain type (soft majority with wobble)
  const types = [0, 0, 0, 0], ws = [0, 0, 0, 0];
  for (let py = 0; py < H; py++) {
    const v = py / TILE - 0.5, j0 = Math.floor(v), fv = v - j0, ty = (py / TILE) | 0;
    for (let px = 0; px < W; px++) {
      const tx = (px / TILE) | 0;
      const own = tr.t[ty * tr.w + tx];
      if (tr.override) { const o = tr.override(px, py); if (o >= 0) { pt[py * W + px] = o; continue; } }
      if (HARD[own]) { pt[py * W + px] = own; continue; }
      const u = px / TILE - 0.5, i0 = Math.floor(u), fu = u - i0;
      let a = tr.get(i0, j0), b = tr.get(i0 + 1, j0), c = tr.get(i0, j0 + 1), d = tr.get(i0 + 1, j0 + 1);
      if (HARD[a]) a = own; if (HARD[b]) b = own; if (HARD[c]) c = own; if (HARD[d]) d = own;
      if (a === b && b === c && c === d) { pt[py * W + px] = a; continue; }
      types[0] = a; types[1] = b; types[2] = c; types[3] = d;
      ws[0] = (1 - fu) * (1 - fv); ws[1] = fu * (1 - fv); ws[2] = (1 - fu) * fv; ws[3] = fu * fv;
      let best = own, bestW = -9;
      for (let k = 0; k < 4; k++) {
        const t = types[k];
        let dup = false;
        for (let m = 0; m < k; m++) if (types[m] === t) dup = true;
        if (dup) continue;
        let s = 0;
        for (let m = 0; m < 4; m++) if (types[m] === t) s += ws[m];
        s += (vnoise(px * 0.12, py * 0.12, t * 7 + 3) - 0.5) * 0.34 + BIAS[t];
        if (s > bestW) { bestW = s; best = t; }
      }
      pt[py * W + px] = best;
    }
  }
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.WATER : pt[y * W + x];
  const tileOver = (x, y) => tr.overWater[((y / TILE) | 0) * tr.w + ((x / TILE) | 0)];

  // 2) distance (in px) from every water pixel to the nearest land — chamfer 3/4
  const dist = new Uint16Array(N);
  const INF = 60000;
  for (let i = 0; i < N; i++) dist[i] = pt[i] === T.WATER ? INF : 0;
  // bridges & rails over the sea still count as sea for depth
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) if (tileOver(px, py)) dist[py * W + px] = INF;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; if (!dist[i]) continue;
    let m = dist[i];
    if (x > 0) m = Math.min(m, dist[i - 1] + 3);
    if (y > 0) { m = Math.min(m, dist[i - W] + 3); if (x > 0) m = Math.min(m, dist[i - W - 1] + 4); if (x < W - 1) m = Math.min(m, dist[i - W + 1] + 4); }
    dist[i] = m;
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x; if (!dist[i]) continue;
    let m = dist[i];
    if (x < W - 1) m = Math.min(m, dist[i + 1] + 3);
    if (y < H - 1) { m = Math.min(m, dist[i + W] + 3); if (x < W - 1) m = Math.min(m, dist[i + W + 1] + 4); if (x > 0) m = Math.min(m, dist[i + W - 1] + 4); }
    dist[i] = m;
  }
  const wd = new Uint8Array(N); // water depth in px (capped)
  for (let i = 0; i < N; i++) wd[i] = Math.min(255, Math.round(dist[i] / 3));

  // 3) colour pass
  const img = new ImageData(W, H), D = img.data;
  const put = (i, hex) => { const c = rgb(hex); const o = i * 4; D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255; };
  const lower = t => !grassy(t); // anything that isn't grass reads as "below" the grass

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const i = py * W + px, t = pt[i];
      const bj = bayer(px, py) - 0.5;
      let col;
      if (t === T.WATER) {
        const d = wd[i];
        if (d <= 1) col = C.w6;
        else if (d <= 3) col = d === 3 && bj > 0.2 ? C.w4 : C.w5;
        else if (d < 11 + bj * 4) col = C.w4;
        else if (d < 30 + bj * 6) col = C.w3;
        else if (d < 56 + bj * 8) col = C.w2;
        else col = C.w1;
      } else if (grassy(t)) {
        const n = vnoise(px / 46, py / 46, 11) * 0.7 + vnoise(px / 15, py / 15, 12) * 0.3;
        col = n > 0.63 + bj * 0.05 ? GR_L : n < 0.35 + bj * 0.05 ? GR_D : C.g4;
        if (t === T.MEADOW) col = n > 0.45 + bj * 0.05 ? GR_M : GR_L;
        const below = at(px, py + 1);
        if (lower(below)) col = below === T.WATER ? C.g2 : C.g3;
        if (at(px, py + 1) !== T.WATER && lower(at(px, py + 2)) && at(px, py + 2) !== T.WATER && col === C.g5) col = C.g4;
      } else if (t === T.PATH || t === T.TRACK) {
        const n = vnoise(px / 11, py / 11, 21);
        const light = t === T.TRACK;
        const n2 = vnoise(px / 4, py / 4, 23);
        col = light ? (n > 0.62 + bj * 0.08 ? C.d5 : C.d4) : (n > 0.66 + bj * 0.08 ? DT_L : n < 0.2 + bj * 0.06 && n2 > 0.5 ? DT_D : C.d3);
        if (grassy(at(px, py - 1))) col = light ? C.d2 : C.d1;
        else if (grassy(at(px, py - 2))) col = light ? C.d3 : C.d2;
        else if (grassy(at(px - 1, py)) || grassy(at(px + 1, py))) col = light ? C.d3 : C.d2;
      } else if (t === T.SAND) {
        const n = vnoise(px / 12, py / 12, 31);
        col = n > 0.7 + bj * 0.06 ? C.s3 : n < 0.28 + bj * 0.06 ? C.s1 : C.s2;
        // wet band near the water
        let nearWater = 0;
        for (let k = 1; k <= 3 && !nearWater; k++)
          if (at(px, py + k) === T.WATER || at(px, py - k) === T.WATER || at(px + k, py) === T.WATER || at(px - k, py) === T.WATER) nearWater = k;
        if (nearWater === 1) col = C.s0; else if (nearWater && nearWater <= 3) col = bj > 0 || nearWater === 2 ? C.s1 : col;
        if (grassy(at(px, py - 1))) col = C.s1;
      } else if (t === T.COBBLE) {
        // rows of 5px: 4 stone + 1 mortar, staggered; a pale curb where it meets soft ground
        const row = Math.floor(py / 5), ry = py % 5;
        const off = (row % 2) * 4 + Math.floor(hash2(row, 7, 5) * 3);
        const seg = Math.floor((px + off) / 7), sx = (px + off) % 7;
        const shade = hash2(seg, row, 9);
        if (ry === 4 || sx === 6) col = C.t2;
        else {
          col = shade > 0.82 ? C.t4 : shade < 0.18 ? CB_D : C.t3;
          if (ry === 0 && sx < 5) col = shade < 0.18 ? C.t3 : C.t4;
          if (ry === 3 && sx > 0) col = shade < 0.18 ? C.t2 : CB_D;
        }
        const soft = q => !HARD[q] && q !== T.WATER;
        const e1 = soft(at(px - 1, py)) || soft(at(px + 1, py)) || soft(at(px, py - 1)) || soft(at(px, py + 1));
        const e2 = !e1 && (soft(at(px - 2, py)) || soft(at(px + 2, py)) || soft(at(px, py - 2)) || soft(at(px, py + 2)));
        if (e1) col = C.t4; else if (e2) col = C.t2;
        if (at(px, py + 1) === T.WATER || at(px, py + 2) === T.WATER) col = C.t1;
      } else if (t === T.PLAZA) {
        const cx = px % 8, cy = py % 8, chk = ((px >> 3) + (py >> 3)) & 1;
        if (cx === 7 || cy === 7) col = C.m1;
        else if (cx === 0 || cy === 0) col = chk ? C.m3 : C.m2;
        else col = chk ? C.m2 : C.m3;
        if (hash2(px >> 3, py >> 3, 41) > 0.93 && cx > 1 && cy > 1 && cx < 6 && cy < 6 && (cx + cy) % 3 === 0) col = C.m1;
      } else if (t === T.PLATFORM) {
        // station platform: pale slabs + the yellow line you must stand behind
        const sx = px % 12, sy = py % 8;
        col = (sx === 11 || sy === 7) ? C.t3 : (sx === 0 || sy === 0) ? C.t5 : C.t4;
        if (at(px, py + 1) === T.RAIL || at(px, py + 2) === T.RAIL) col = C.t1;
        else if (at(px, py + 4) === T.RAIL) col = C.y3;
        else if (at(px, py + 5) === T.RAIL) col = C.y2;
        else if (at(px, py - 1) !== T.PLATFORM && !HARD[at(px, py - 1)]) col = C.t2;
      } else if (t === T.FLOOR) {
        // warm wooden deck (station platforms, piers)
        const vert = tr.bdir[((py / TILE) | 0) * tr.w + ((px / TILE) | 0)];
        const a = vert ? py : px, b = vert ? px : py;
        const plank = Math.floor(a / 4), pa = a % 4;
        const sh = hash2(plank, Math.floor(b / 23), 51);
        col = pa === 3 ? C.k2 : pa === 0 ? C.k4 : sh > 0.8 ? C.k2 : C.k3;
        if ((b + plank * 9) % 23 === 0) col = C.k2;
        if (at(px, py + 1) === T.WATER) col = C.k1;
      } else if (t === T.BRIDGE) {
        // a proper road deck: asphalt, kerbs, a dashed centre line
        const n = hash2(px, py, 61);
        col = n > 0.86 ? C.t2 : n < 0.1 ? C.t0 : C.t1;
        const up = at(px, py - 1), dn = at(px, py + 1), up2 = at(px, py - 2), dn2 = at(px, py + 2);
        if (up !== T.BRIDGE || dn !== T.BRIDGE) col = C.t4;
        else if (up2 !== T.BRIDGE || dn2 !== T.BRIDGE) col = C.t3;
        if (py % 32 === 0 && (px >> 2) % 3 !== 0) col = C.y3;
      } else if (t === T.RAIL) {
        const n = hash2(px, py, 71);
        col = tileOver(px, py) ? (n > 0.5 ? C.k2 : C.k1) : (n > 0.7 ? C.t3 : n > 0.35 ? C.t2 : C.d2);
      }
      put(i, col);
    }
  }

  // 4) cliffs: faces, stairs and plateau rims (tile-exact, hand-styled)
  const setp = (x, y, hex) => { if (x >= 0 && y >= 0 && x < W && y < H) put(y * W + x, hex); };
  for (let ty = 0; ty < tr.h; ty++)
    for (let tx = 0; tx < tr.w; tx++) {
      const i = ty * tr.w + tx;
      const X = tx * TILE, Y = ty * TILE;
      if (tr.face[i]) {
        const L = tr.face[i - 1] || tr.stairs[i - 1], R = tr.face[i + 1] || tr.stairs[i + 1];
        if (tr.stairs[i]) {
          for (let ly = 0; ly < 16; ly++) for (let lx = 0; lx < 16; lx++) {
            let col;
            if (lx < 2 || lx > 13) col = (lx === 0 || lx === 15) ? C.q0 : C.q1;
            else { const st = ly % 4; col = st === 0 ? C.t5 : st === 1 ? C.t4 : st === 2 ? C.t3 : C.t1; if (lx === 2 || lx === 13) col = C.t2; }
            setp(X + lx, Y + ly, col);
          }
          continue;
        }
        for (let lx = 0; lx < 16; lx++) {
          const gx = X + lx;
          const lip = 2 + (hash2(gx >> 1, ty, 81) > 0.55 ? 1 : 0);
          for (let ly = 0; ly < 16; ly++) {
            const gy = Y + ly;
            let col;
            if (ly < lip) col = ly === lip - 1 ? C.g2 : (ly === 0 ? C.g4 : C.g3);
            else {
              const r = rockAt(gx, gy - Y + ty * 7);
              if (r.edge) col = C.q1;
              else {
                const k = r.fy + (r.tone - 0.5) * 0.35;
                col = k < 0.22 ? C.q4 : k < 0.5 ? C.q3 : k < 0.8 ? C.q2 : C.q1;
              }
              if (ly === lip) col = C.q0;
              if (ly === 15) col = C.q0;
              else if (ly === 14 && col !== C.q1) col = C.q1;
            }
            if (!L && lx === 0) col = ly < lip ? C.g2 : C.q0;
            if (!R && lx === 15) col = ly < lip ? C.g2 : C.q0;
            setp(gx, gy, col);
          }
        }
        // shadow cast on the ground below the cliff
        for (let lx = 0; lx < 16; lx++) {
          const gx = X + lx, gy = Y + 16;
          if (!tr.in(tx, ty + 1) || tr.face[i + tr.w]) continue;
          const b = pt[gy * W + gx];
          if (grassy(b)) { setp(gx, gy, C.g2); setp(gx, gy + 1, C.g3); }
          else if (b === T.PATH) { setp(gx, gy, C.d1); setp(gx, gy + 1, C.d2); }
        }
      } else if (tr.hgt[i] === 1) {
        // rims where the plateau drops to lower ground on W / E / N
        const lowW = tx > 0 && tr.hgt[i - 1] === 0 && !tr.face[i - 1] && tr.t[i - 1] !== T.WATER;
        const lowE = tx < tr.w - 1 && tr.hgt[i + 1] === 0 && !tr.face[i + 1] && tr.t[i + 1] !== T.WATER;
        const lowN = ty > 0 && tr.hgt[i - tr.w] === 0 && tr.t[i - tr.w] !== T.WATER;
        if (lowW) for (let ly = 0; ly < 16; ly++) { setp(X, Y + ly, C.q1); setp(X + 1, Y + ly, C.g2); setp(X - 1, Y + ly, C.g3); }
        if (lowE) for (let ly = 0; ly < 16; ly++) { setp(X + 15, Y + ly, C.q1); setp(X + 14, Y + ly, C.g2); setp(X + 16, Y + ly, C.g3); }
        if (lowN) for (let lx = 0; lx < 16; lx++) { setp(X + lx, Y, C.g2); setp(X + lx, Y + 1, C.g5); }
      }
    }

  // 5) little things: tufts, flowers, pebbles, shells
  const rnd = mulberry32(1234);
  const okAround = (x, y, r, test) => { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (!test(at(x + xx, y + yy))) return false; return true; };
  const notFace = (x, y) => { const i = ((y / TILE) | 0) * tr.w + ((x / TILE) | 0); return !tr.face[i] && !tr.stairs[i]; };
  const FLOWERS = [[C.white, C.y3], [C.p2, C.y3], [C.y3, C.y1], [C.b3, C.white], [C.r3, C.y3], [C.v3, C.y4]];
  for (let ty = 0; ty < tr.h; ty++)
    for (let tx = 0; tx < tr.w; tx++) {
      const tt = tr.t[ty * tr.w + tx];
      const X = tx * TILE, Y = ty * TILE;
      if (grassy(tt)) {
        const nt = tt === T.MEADOW ? 3 : 1 + (rnd() < 0.5 ? 1 : 0);
        for (let k = 0; k < nt; k++) {
          const x = X + 2 + ((rnd() * 12) | 0), y = Y + 2 + ((rnd() * 12) | 0);
          if (!okAround(x, y, 2, grassy) || !notFace(x, y)) continue;
          if (rnd() < 0.75) { setp(x, y, C.g3); setp(x + 2, y, C.g3); setp(x + 1, y + 1, C.g3); if (rnd() < 0.4) setp(x + 1, y - 1, C.g5); }
          else { setp(x, y, C.g6); setp(x + 1, y + 1, C.g5); }
        }
        const fl = tt === T.MEADOW ? 0.85 : 0.07;
        if (rnd() < fl) {
          const cl = tt === T.MEADOW ? 1 + ((rnd() * 3) | 0) : 1;
          const [pc, cc] = FLOWERS[(rnd() * FLOWERS.length) | 0];
          for (let k = 0; k < cl; k++) {
            const x = X + 2 + ((rnd() * 11) | 0), y = Y + 2 + ((rnd() * 11) | 0);
            if (!okAround(x, y, 2, grassy) || !notFace(x, y)) continue;
            setp(x, y + 2, C.g2);
            setp(x, y - 1, pc); setp(x - 1, y, pc); setp(x + 1, y, pc); setp(x, y + 1, pc); setp(x, y, cc);
          }
        }
      } else if (tt === T.PATH && rnd() < 0.55) {
        const x = X + 2 + ((rnd() * 12) | 0), y = Y + 3 + ((rnd() * 10) | 0);
        if (okAround(x, y, 2, t => t === T.PATH)) { setp(x, y, C.d1); setp(x + 1, y, C.d2); setp(x, y - 1, C.d5); }
      } else if (tt === T.SAND && rnd() < 0.12) {
        const x = X + 3 + ((rnd() * 10) | 0), y = Y + 3 + ((rnd() * 10) | 0);
        if (okAround(x, y, 3, t => t === T.SAND)) {
          if (rnd() < 0.5) { setp(x, y, C.p2); setp(x - 1, y, C.p2); setp(x + 1, y, C.p2); setp(x, y - 1, C.p2); setp(x, y + 1, C.p1); }
          else { setp(x, y, C.white); setp(x + 1, y, C.p3); setp(x, y + 1, C.s0); }
        }
      }
    }

  const ground = canvas(W, H);
  ground.g.putImageData(img, 0, 0);

  // 6) rails, sleepers and the trestle under the sea bridge
  const g = ground.g;
  for (let ty = 0; ty < tr.h; ty++)
    for (let tx = 0; tx < tr.w; tx++) {
      const i = ty * tr.w + tx;
      if (tr.t[i] !== T.RAIL) continue;
      const X = tx * TILE, Y = ty * TILE, over = tr.overWater[i];
      if (over) {
        rect(g, X, Y + 1, 16, 1, C.k0); rect(g, X, Y + 14, 16, 2, C.k0); rect(g, X, Y + 15, 16, 1, C.k1);
        // legs into the water below
        if (tx % 2 === 0) {
          rect(g, X + 3, Y + 16, 3, 11, C.k1); rect(g, X + 3, Y + 16, 1, 11, C.k2); rect(g, X + 3, Y + 27, 3, 1, C.w5);
          rect(g, X + 11, Y + 16, 3, 11, C.k1); rect(g, X + 11, Y + 16, 1, 11, C.k2); rect(g, X + 11, Y + 27, 3, 1, C.w5);
          line(g, X + 5, Y + 17, X + 12, Y + 24, C.k0); line(g, X + 12, Y + 17, X + 5, Y + 24, C.k0);
        }
      }
      for (let s = 0; s < 16; s += 5) { rect(g, X + s + 1, Y + 3, 3, 11, C.k1); rect(g, X + s + 1, Y + 3, 3, 1, C.k2); }
      for (const ry of [5, 11]) { rect(g, X, Y + ry - 1, 16, 1, C.t4); rect(g, X, Y + ry, 16, 1, C.t2); rect(g, X, Y + ry + 1, 16, 1, C.t0); }
    }

  // 7) shimmering water overlays (2 frames): shore foam pulses, wave dashes drift
  const frames = [canvas(W, H), canvas(W, H), canvas(W, H)];
  const wr = mulberry32(99);
  const waves = [];
  for (let k = 0; k < (W * H) / 900; k++) {
    const x = (wr() * W) | 0, y = (wr() * H) | 0, i = y * W + x;
    if (pt[i] !== T.WATER || tileOver(x, y) || wd[i] < 7) continue;
    waves.push([x, y, 3 + ((wr() * 4) | 0), wd[i]]);
  }
  frames.forEach((fc, f) => {
    const fg = fc.g;
    // foam band breathing in and out
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const i = py * W + px;
      if (pt[i] !== T.WATER) continue;
      const d = wd[i];
      if (f === 1 && d === 2) { fg.fillStyle = C.w6; fg.fillRect(px, py, 1, 1); }
      else if (f === 2 && d === 3 && ((px + py) & 1)) { fg.fillStyle = C.w5; fg.fillRect(px, py, 1, 1); }
      else if (f === 0 && d === 5 && hash2(px >> 1, py, 7) > 0.6) { fg.fillStyle = C.w5; fg.fillRect(px, py, 1, 1); }
    }
    for (const [x, y, len, d] of waves) {
      const xx = x + f * 2;
      const deep = d > 30;
      fg.fillStyle = deep ? C.w3 : C.w5;
      if (f !== 1 || hash2(x, y, 3) > 0.5) fg.fillRect(xx, y, len, 1);
      fg.fillStyle = deep ? C.w4 : C.w6;
      if (f === 2) fg.fillRect(xx + 1, y - 1, len - 2, 1);
    }
  });

  return { canvas: ground, W, H, pt, wd, water: frames };
}
