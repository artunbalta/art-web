'use strict';
/* =====================================================================
   art-buildings.js — every building is drawn here with code, at 1×.
   A building returns { img, ox, gy, w, depth, door, lights }:
     img   the canvas
     ox    px from image-left to the wall's left edge
     gy    px from image-top to the ground line (bottom of the wall)
     w     wall width in px      depth  how deep the footprint is
     door  {x, w} relative to the wall's left edge
     lights  window glass rects (image coords) that glow at night
   ===================================================================== */

/* ---------- materials ---------- */
function roofTiles(g, x0, y0, w, h, pal, maskFn, opts = {}) {
  const course = opts.course || 4, seamEvery = opts.seam || 6;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const m = maskFn ? maskFn(x, y) : 1;
      if (!m) continue;
      const ry = (opts.rowY ? opts.rowY(x, y) : y);
      const row = Math.floor(ry / course), r = ((ry % course) + course) % course;
      const off = (row & 1) * (seamEvery >> 1);
      const seam = ((x + off) % seamEvery) === 0;
      let c;
      if (m === 2) c = (r === course - 1 || (seam && r === 1)) ? pal.d : pal.s;
      else if (r === course - 1) c = pal.d;
      else if (r === 0) c = pal.l;
      else c = (seam && r === 1) ? pal.d : pal.b;
      if (opts.speckle && hash2(x + x0, y + y0, 77) > 0.94 && c === pal.b) c = pal.l;
      px(g, x0 + x, y0 + y, c);
    }
}
function wall(g, x, y, w, h, style, pal) {
  if (style === 'plaster') {
    rect(g, x, y, w, h, pal.b);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (hash2(i + x, j + y, 13) > 0.965) px(g, x + i, y + j, pal.s);
  } else if (style === 'brick') {
    for (let j = 0; j < h; j++) {
      const row = Math.floor(j / 3), r = j % 3, off = (row & 1) * 3;
      for (let i = 0; i < w; i++) {
        const seg = Math.floor((i + off) / 6), sx = (i + off) % 6;
        const v = hash2(seg, row, 21);
        let c = r === 2 || sx === 5 ? pal.m : v > 0.8 ? pal.l : v < 0.2 ? pal.d : pal.b;
        if (r === 0 && sx < 5 && c === pal.b && v > 0.5) c = pal.l;
        px(g, x + i, y + j, c);
      }
    }
  } else if (style === 'stone') {
    for (let j = 0; j < h; j++) {
      const row = Math.floor(j / 6), r = j % 6, off = (row & 1) * 5;
      for (let i = 0; i < w; i++) {
        const seg = Math.floor((i + off) / 10), sx = (i + off) % 10;
        const v = hash2(seg, row, 23);
        let c = r === 5 || sx === 9 ? pal.m : v > 0.75 ? pal.l : v < 0.25 ? pal.s : pal.b;
        if (r === 0 && sx < 9) c = pal.l;
        px(g, x + i, y + j, c);
      }
    }
  } else if (style === 'wood') {
    for (let j = 0; j < h; j++) { const r = j % 4; rect(g, x, y + j, w, 1, r === 3 ? pal.d : r === 0 ? pal.l : pal.b); }
    for (let i = 5; i < w; i += 11) for (let j = 1; j < h; j += 4) px(g, x + i + (j % 8 ? 0 : 4), y + j, pal.d);
  } else if (style === 'panel') {
    rect(g, x, y, w, h, pal.b);
    for (let i = 0; i < w; i += 16) vl(g, x + i, y, y + h - 1, pal.s);
  }
  // shadow under the eave + plinth
  rect(g, x, y, w, 2, pal.e || pal.s);
  if (pal.p) { rect(g, x, y + h - 3, w, 3, pal.p); hl(g, x, x + w - 1, y + h - 3, pal.pl || pal.p); }
}
function windowAt(g, x, y, w, h, o = {}) {
  const fr = o.frame || C.white, frD = o.frameD || C.t3;
  const lights = [];
  if (o.shutter) {
    for (const sx of [x - 5, x + w + 1]) {
      rect(g, sx, y - 1, 4, h + 2, o.shutter); rect(g, sx + 3, y - 1, 1, h + 2, o.shutterD || C.ink2);
      for (let j = y + 1; j < y + h; j += 2) hl(g, sx, sx + 2, j, o.shutterD || C.ink2);
    }
  }
  rect(g, x - 1, y - 1, w + 2, h + 2, fr);
  rect(g, x - 1, y + h, w + 2, 1, frD);
  // glass: lighter at top, reflection diagonal
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (o.arch && j < 3) { const cut = [2, 1, 0][j]; if (i < cut || i >= w - cut) { px(g, x + i, y + j, fr); continue; } }
    let c = j < h * 0.45 ? (o.glassL || C.b3) : (o.glass || C.b2);
    if ((i + j) % 7 === 2 && i + j < Math.min(w, h)) c = C.b4;
    px(g, x + i, y + j, c);
  }
  if (o.panes !== 'none') {
    if (w >= 6) vl(g, x + (w >> 1), y, y + h - 1, fr);
    if (h >= 8 && o.panes !== 'v') hl(g, x, x + w - 1, y + Math.floor(h * 0.45), fr);
  }
  if (o.curtain) { for (let j = 0; j < h; j++) { px(g, x, y + j, o.curtain); if (j < h - 2) px(g, x + w - 1, y + j, o.curtain); } rect(g, x, y, w, 1, o.curtain); }
  hl(g, x - 2, x + w + 1, y + h + 1, o.sill || C.t4);
  if (o.box) {
    rect(g, x - 1, y + h + 2, w + 2, 3, C.k2); hl(g, x - 1, x + w, y + h + 2, C.k3);
    for (let i = 0; i < w + 2; i++) {
      const v = hash2(x + i, y, 31);
      px(g, x - 1 + i, y + h + 1, v > 0.5 ? C.g3 : C.g2);
      if (v > 0.55) px(g, x - 1 + i, y + h, i % 3 === 0 ? o.box : v > 0.8 ? C.y3 : C.g3);
    }
  }
  lights.push({ x, y, w, h });
  return lights;
}
function doorAt(g, x, y, w, h, o = {}) {
  const col = o.color || C.k2, colD = o.colorD || C.k1, colL = o.colorL || C.k3, fr = o.frame || C.k1;
  rect(g, x - 1, y - 1, w + 2, h + 1, fr);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (o.arch && j < 3) { const cut = [3, 1, 0][j]; if (i < cut || i >= w - cut) { px(g, x + i, y + j, fr); continue; } }
    let c = col;
    if (o.glass) c = j < h - 3 ? (j < 4 ? C.b3 : C.b2) : colD;
    else if (i === 0 || j === 0) c = colL;
    else if (i === w - 1) c = colD;
    px(g, x + i, y + j, c);
  }
  if (!o.glass) {
    if (o.double) vl(g, x + (w >> 1), y + 1, y + h - 1, colD);
    // panels
    const pw = o.double ? (w >> 1) - 3 : w - 4;
    for (const bx of o.double ? [x + 1, x + (w >> 1) + 2] : [x + 2]) {
      if (pw < 2) continue;
      rect(g, bx, y + 4, pw, 5, colD); rect(g, bx, y + 4, pw, 1, colL);
      rect(g, bx, y + 11, pw, h - 15, colD); rect(g, bx, y + 11, pw, 1, colL);
    }
    if (o.window) { rect(g, x + 2, y + 2, w - 4, 4, C.b3); px(g, x + 3, y + 3, C.b4); }
    px(g, x + (o.double ? (w >> 1) - 2 : w - 3), y + (h >> 1) + 1, C.y2);
    if (o.double) px(g, x + (w >> 1) + 1, y + (h >> 1) + 1, C.y2);
  } else {
    vl(g, x + (w >> 1), y, y + h - 1, fr);
    px(g, x + 2, y + 2, C.b4); px(g, x + 3, y + 3, C.b4);
  }
  // step
  rect(g, x - 2, y + h, w + 4, 2, o.step || C.t3); hl(g, x - 2, x + w + 1, y + h, o.stepL || C.t4);
}
function plank(g, txt, cx, y, o = {}) {
  const tw = textWidth(txt), w = tw + (o.pad ?? 6), h = 9;
  const x = Math.round(cx - w / 2);
  rect(g, x, y, w, h, o.edge || C.k1);
  rect(g, x + 1, y + 1, w - 2, h - 2, o.bg || C.k3);
  hl(g, x + 1, x + w - 2, y + 1, o.bgL || C.k4);
  text(g, txt, Math.round(cx - tw / 2), y + 2, o.fg || C.k0);
  return { x, y, w, h };
}
function outlineRect(g, x, y, w, h, c) { hl(g, x, x + w - 1, y, c); hl(g, x, x + w - 1, y + h - 1, c); vl(g, x, y, y + h - 1, c); vl(g, x + w - 1, y, y + h - 1, c); }

/* ---------- generic building ---------- */
// o: { w, wallH, roofH, roof:'hip'|'gable'|'flat'|'frontgable'|'mansard', roofPal, wallStyle, wallPal, top (extra px above roof) }
function building(o) {
  const ov = o.over ?? 3;
  const top = o.top || 0;
  const W = o.w + ov * 2, H = top + o.roofH + o.wallH + 3;
  const cv = canvas(W, H), g = cv.g;
  const wallY = top + o.roofH, wx = ov;
  const lights = [];
  const ctx = { g, W, H, wallY, wx, top, ov, lights, w: o.w, wallH: o.wallH, roofH: o.roofH };
  // walls
  wall(g, wx, wallY, o.w, o.wallH, o.wallStyle || 'plaster', o.wallPal);
  vl(g, wx, wallY, wallY + o.wallH - 1, C.ink2); vl(g, wx + o.w - 1, wallY, wallY + o.wallH - 1, C.ink2);
  hl(g, wx, wx + o.w - 1, wallY + o.wallH - 1, C.ink2);
  if (o.walls) o.walls(ctx);
  // roof
  const rp = o.roofPal;
  const rt = top, rh = o.roofH;
  if (o.roof === 'hip' || o.roof === 'gable') {
    const inset = o.roof === 'hip' ? Math.round(rh * (o.hipK ?? 0.8)) : 0;
    roofTiles(g, 0, rt, W, rh, rp, (x, y) => {
      const xl = inset * (1 - y / rh);
      if (x < xl - 0.5 || x > W - 1 - xl + 0.5) return 0;
      if (inset && (x < inset * (1 - y / rh) + 2 || x > W - 1 - inset * (1 - y / rh) - 2) && o.roof === 'hip') return y < rh - 1 ? 2 : 1;
      return 1;
    }, { course: o.course || 4, seam: o.seam || 6 });
    // outline + ridge + eave
    for (let y = 0; y < rh; y++) {
      const xl = Math.round(inset * (1 - y / rh));
      px(g, xl, rt + y, rp.o || C.ink); px(g, W - 1 - xl, rt + y, rp.o || C.ink);
    }
    hl(g, inset, W - 1 - inset, rt, rp.o || C.ink);
    hl(g, inset + 1, W - 2 - inset, rt + 1, rp.h || rp.l);
    hl(g, 0, W - 1, rt + rh - 1, rp.o || C.ink);
    hl(g, wx, wx + o.w - 1, rt + rh, C.ink2); hl(g, wx, wx + o.w - 1, rt + rh + 1, o.wallPal.e || o.wallPal.s);
  } else if (o.roof === 'flat') {
    const lip = 3;
    rect(g, 0, rt, W, rh, rp.b);
    for (let y = lip; y < rh - lip; y++) for (let x = lip; x < W - lip; x++) if (hash2(x, y, 41) > 0.9) px(g, x, rt + y, rp.s);
    rect(g, 0, rt, W, lip, rp.l); hl(g, 0, W - 1, rt, rp.h || rp.l);
    rect(g, 0, rt + rh - lip, W, lip, rp.d); hl(g, 0, W - 1, rt + rh - lip, rp.l);
    rect(g, 0, rt + lip, lip, rh - lip * 2, rp.l); rect(g, W - lip, rt + lip, lip, rh - lip * 2, rp.d);
    outlineRect(g, 0, rt, W, rh, rp.o || C.ink);
    hl(g, wx, wx + o.w - 1, rt + rh, C.ink2);
  } else if (o.roof === 'mansard') {
    // a flat zinc top, then a steep slate skirt with dormers
    const flatH = Math.round(rh * 0.28);
    rect(g, 2, rt, W - 4, flatH, rp.t || C.t3); hl(g, 2, W - 3, rt, C.t4);
    roofTiles(g, 0, rt + flatH, W, rh - flatH, rp, (x, y) => 1, { course: 3, seam: 4 });
    outlineRect(g, 2, rt, W - 4, flatH + 1, rp.o || C.ink);
    for (let y = flatH; y < rh; y++) { px(g, 0, rt + y, rp.o || C.ink); px(g, W - 1, rt + y, rp.o || C.ink); }
    hl(g, 0, W - 1, rt + rh - 1, rp.o || C.ink); hl(g, 1, W - 2, rt + flatH, rp.h || C.t4);
    hl(g, wx, wx + o.w - 1, rt + rh, C.ink2);
    ctx.flatH = flatH;
  } else if (o.roof === 'frontgable') {
    const cx = W / 2, peak = rt, eave = rt + rh + 1;
    const slab = o.slab || 12;
    const k = (eave - slab - peak) / (cx - 0.5);
    const yb = x => Math.round(peak + Math.abs(x + 0.5 - cx) * k);
    const yf = x => yb(x) + slab;
    for (let x = 0; x < W; x++) {
      // gable face under the rake
      for (let y = yf(x) + 1; y < wallY + 1; y++) px(g, x, y, o.wallPal.b);
      for (let y = yb(x); y <= Math.min(yf(x), eave); y++) {
        const r = y - yb(x);
        const left = x + 0.5 < cx;
        const course = Math.floor(r / 3), rr = r % 3;
        const seam = ((x + (course & 1) * 3) % 6) === 0;
        let c = rr === 2 ? rp.d : rr === 0 ? rp.l : (seam ? rp.d : rp.b);
        if (!left) c = rr === 2 ? rp.d : rr === 0 ? rp.b : (seam ? rp.d : rp.s);
        if (y === yb(x)) c = rp.o || C.ink;
        if (y === yf(x)) c = rp.o || C.ink;
        px(g, x, y, c);
      }
      // white bargeboard under the rake
      if (yf(x) + 1 < wallY) px(g, x, yf(x) + 1, o.trim || C.white);
    }
    // ridge
    vl(g, Math.floor(cx) - 1, yb(Math.floor(cx)) + 1, yb(Math.floor(cx)) + slab - 1, rp.h || rp.l);
    vl(g, Math.floor(cx), yb(Math.floor(cx)) + 1, yb(Math.floor(cx)) + slab - 1, rp.s);
    hl(g, wx, wx + o.w - 1, wallY, C.ink2);
    ctx.yb = yb; ctx.yf = yf; ctx.cx = cx;
  }
  if (o.roofDeco) o.roofDeco(ctx);
  if (o.deco) o.deco(ctx);
  return {
    img: cv, ox: ov, gy: wallY + o.wallH, w: o.w,
    depth: o.depth ?? Math.round((o.roofH + o.wallH) * 0.62),
    door: o.door || { x: (o.w >> 1) - 6, w: 12 }, lights, c: ctx,
  };
}

/* ---------- reusable bits ---------- */
function chimney(g, x, y, h, smokeHole = true) {
  rect(g, x, y, 8, h, C.r1); rect(g, x + 1, y, 6, h, C.r2);
  for (let j = 1; j < h; j += 3) { hl(g, x + 1, x + 6, y + j, C.r1); }
  rect(g, x - 1, y - 2, 10, 3, C.t2); hl(g, x - 1, x + 8, y - 2, C.t4); outlineRect(g, x - 1, y - 2, 10, 3, C.ink);
  vl(g, x, y + 1, y + h - 1, C.ink); vl(g, x + 7, y + 1, y + h - 1, C.ink);
  if (smokeHole) hl(g, x + 1, x + 6, y - 2, C.ink2);
}
function awning(g, x, y, w, h, c1, c2) {
  for (let i = 0; i < w; i++) {
    const c = Math.floor(i / 4) % 2 ? c1 : c2;
    for (let j = 0; j < h; j++) px(g, x + i, y + j, j === 0 ? C.ink2 : c);
    // scalloped edge
    if (i % 4 !== 3) px(g, x + i, y + h, c);
    if (i % 4 === 1 || i % 4 === 2) px(g, x + i, y + h + 1, c);
  }
  hl(g, x, x + w - 1, y + 1, C.white);
}
function nazar(g, x, y) {
  // the evil-eye bead, hanging from a string
  vl(g, x + 2, y - 3, y - 1, C.k1);
  disc(g, x + 2.5, y + 2.5, 2.5, C.b1); disc(g, x + 2.5, y + 2.5, 1.6, C.white); disc(g, x + 2.5, y + 2.5, 1, C.b3); px(g, x + 2, y + 2, C.ink);
}

/* ======================= the buildings ======================= */
const BUILD = {};

BUILD.home = () => building({
  w: 80, wallH: 30, roofH: 34, roof: 'frontgable', slab: 13, top: 8, over: 4,
  roofPal: { d: C.r1, b: C.r2, l: C.r3, s: '#a1363f', h: C.r4, o: C.r0 },
  wallPal: { b: C.m3, s: C.m2, e: C.m1, p: C.m1, pl: C.m2 },
  door: { x: 34, w: 12 }, depth: 34,
  deco(c) {
    const { g, wx, wallY } = c;
    // timber corner posts
    rect(g, wx + 1, wallY + 1, 2, 26, C.k2); rect(g, wx + 77, wallY + 1, 2, 26, C.k2);
    c.lights.push(...windowAt(g, wx + 11, wallY + 8, 13, 11, { shutter: C.b2, shutterD: C.b1, box: C.p2 }));
    c.lights.push(...windowAt(g, wx + 56, wallY + 8, 13, 11, { shutter: C.b2, shutterD: C.b1, box: C.r3 }));
    doorAt(g, wx + 34, wallY + 9, 12, 20, { color: C.c1, colorD: C.c0, colorL: C.c2, arch: true, frame: C.k1 });
    nazar(g, wx + 48, wallY + 9);
    // round attic window in the gable
    const ax = Math.round(c.cx) - 4, ay = wallY - 13;
    disc(g, ax + 4, ay + 4, 4.5, C.white); disc(g, ax + 4, ay + 4, 3.3, C.b2); disc(g, ax + 3.5, ay + 3.5, 1.5, C.b3);
    vl(g, ax + 4, ay + 1, ay + 7, C.white); hl(g, ax + 1, ax + 7, ay + 4, C.white);
    c.lights.push({ x: ax + 1, y: ay + 1, w: 7, h: 7 });
    // chimney poking out of the right slope
    chimney(g, c.W - 24, c.yb(c.W - 20) - 7, 11);
    c.smoke = [c.W - 20, c.yb(c.W - 20) - 10];
    // house number, because of course
    rect(g, wx + 27, wallY + 12, 5, 7, C.b1); text(g, '7', wx + 28, wallY + 13, C.white);
    // doormat
    rect(g, wx + 33, c.H - 2, 14, 2, C.r2); hl(g, wx + 33, wx + 46, c.H - 2, C.r3);
  },
});

BUILD.lycee = () => building({
  w: 144, wallH: 46, roofH: 26, roof: 'mansard', top: 10,
  roofPal: { d: C.t0, b: C.t1, l: C.t2, s: C.t1, h: C.t3, t: C.t3, o: C.ink },
  wallPal: { b: C.m3, s: C.m2, e: C.m1, p: C.m1, pl: C.m2 },
  door: { x: 62, w: 20 }, depth: 40,
  deco(c) {
    const { g, wx, wallY, top } = c;
    // stone quoins + a frieze band between floors
    for (let j = 0; j < 46; j += 6) { rect(g, wx + 1, wallY + j, 5, 3, C.m2); rect(g, wx + 138, wallY + j, 5, 3, C.m2); }
    rect(g, wx, wallY + 19, 144, 5, C.m2); hl(g, wx, wx + 143, wallY + 19, C.white); hl(g, wx, wx + 143, wallY + 23, C.m1);
    text(g, 'LYCÉE TEVFIK FIKRET', wx + 72 - (textWidth('LYCÉE TEVFIK FIKRET') >> 1), wallY + 19, C.b0);
    for (let i = 0; i < 6; i++) {
      const x = wx + 10 + i * 23 + (i >= 3 ? 8 : 0) - (i >= 3 ? 8 : 0);
      if (i === 3 || i === 2) continue;
      c.lights.push(...windowAt(g, x, wallY + 4, 9, 12, { shutter: C.c1, shutterD: C.c0 }));
    }
    for (const i of [0, 1, 4, 5]) c.lights.push(...windowAt(g, wx + 10 + i * 23, wallY + 28, 9, 13, { shutter: C.c1, shutterD: C.c0 }));
    c.lights.push(...windowAt(g, wx + 58, wallY + 4, 9, 12, { arch: true }), ...windowAt(g, wx + 77, wallY + 4, 9, 12, { arch: true }));
    doorAt(g, wx + 62, wallY + 26, 20, 19, { color: C.b1, colorD: C.b0, colorL: C.b2, double: true, arch: true, frame: C.m1 });
    // dormers on the slate
    for (const dx of [16, 44, 92, 120]) {
      const x = dx, y = top + c.flatH + 3;
      rect(g, x, y, 12, 13, C.m3); outlineRect(g, x, y, 12, 13, C.ink2);
      for (let k = 0; k < 6; k++) hl(g, x + 5 - k, x + 6 + k, y - 5 + k, k === 0 ? C.ink : C.t1);
      hl(g, x - 1, x + 12, y, C.ink);
      c.lights.push(...windowAt(g, x + 3, y + 3, 6, 8, { panes: 'v' }));
    }
    // little bell gable on top
    const bx = 66;
    rect(g, bx, top - 8, 12, 14, C.m3); outlineRect(g, bx, top - 8, 12, 14, C.ink2);
    for (let k = 0; k < 6; k++) hl(g, bx + 5 - k, bx + 6 + k, top - 14 + k, k === 0 ? C.ink : C.t1);
    rect(g, bx + 3, top - 5, 6, 7, C.ink2); disc(g, bx + 6, top - 1, 2.2, C.y2); px(g, bx + 5, top - 2, C.y3);
  },
});

BUILD.bilkent = () => building({
  w: 160, wallH: 48, roofH: 16, roof: 'flat', top: 22,
  roofPal: { d: C.t2, b: C.t3, l: C.t4, s: C.t2, h: C.t5, o: C.ink },
  wallStyle: 'brick', wallPal: { b: '#b65a42', l: '#cc7154', d: '#934237', m: '#e3b79a', s: '#934237', e: '#7c3631', p: C.t2, pl: C.t3 },
  door: { x: 30, w: 20 }, depth: 40,
  deco(c) {
    const { g, wx, wallY, top } = c;
    // two ribbon window bands
    for (const y of [wallY + 6, wallY + 24]) {
      rect(g, wx + 4, y - 1, 152, 12, C.m3);
      for (let x = wx + 6; x < wx + 154; x += 12) {
        if (y > wallY + 20 && x > wx + 24 && x < wx + 56) continue;
        c.lights.push(...windowAt(g, x, y + 1, 9, 8, { frame: C.m3, panes: 'v', sill: C.m2 }));
      }
    }
    // entrance with a concrete canopy
    doorAt(g, wx + 30, wallY + 28, 20, 18, { glass: true, frame: C.t1, step: C.t3 });
    rect(g, wx + 24, wallY + 24, 32, 4, C.t4); hl(g, wx + 24, wx + 55, wallY + 27, C.t2); outlineRect(g, wx + 24, wallY + 24, 32, 4, C.ink2);
    // big letters
    const bw = textWidth('BILKENT EEE') + 6;
    rect(g, wx + 150 - bw, wallY + 36, bw, 9, C.t5); outlineRect(g, wx + 150 - bw, wallY + 36, bw, 9, C.ink2);
    text(g, 'BILKENT EEE', wx + 153 - bw, wallY + 38, C.b0);
    // roof gear: antenna mast, a dish, two HVAC boxes — it's the EE building
    const mx = 120;
    vl(g, mx, top - 20, top + 6, C.t1); vl(g, mx + 1, top - 20, top + 6, C.t3);
    for (let j = -16; j < 4; j += 5) { hl(g, mx - 3, mx + 4, top + j, C.t1); }
    px(g, mx, top - 22, C.r3); px(g, mx + 1, top - 22, C.r3);
    // satellite dish
    ell(g, 40, top + 4, 7, 5, C.t4); ell(g, 40, top + 4, 5, 3.5, C.t5); line(g, 40, top + 4, 45, top - 1, C.t1); px(g, 45, top - 1, C.r3);
    for (const hx of [70, 90]) { rect(g, hx, top + 3, 12, 8, C.t2); rect(g, hx, top + 3, 12, 2, C.t4); outlineRect(g, hx, top + 3, 12, 8, C.ink2); disc(g, hx + 6, top + 7, 2.5, C.t1); }
  },
});

BUILD.physics = () => building({
  w: 80, wallH: 30, roofH: 14, roof: 'flat', top: 18,
  roofPal: { d: C.t2, b: C.t3, l: C.t4, s: C.t2, h: C.t5, o: C.ink },
  wallPal: { b: C.white, s: C.m3, e: C.m2, p: C.t2, pl: C.t3 },
  door: { x: 50, w: 14 }, depth: 30,
  deco(c) {
    const { g, wx, wallY, top } = c;
    c.lights.push(...windowAt(g, wx + 8, wallY + 9, 12, 11, {}), ...windowAt(g, wx + 28, wallY + 9, 12, 11, {}));
    doorAt(g, wx + 50, wallY + 11, 14, 18, { color: C.b2, colorD: C.b1, colorL: C.b3, window: true });
    plank(g, 'PHYSICS LAB', wx + 40, wallY + 2, { bg: C.b1, bgL: C.b2, edge: C.b0, fg: C.white });
    // an observatory dome, slightly cracked open
    const dx = 46, dy = top + 2;
    ell(g, dx, dy, 15, 13, C.ink); ell(g, dx, dy, 14, 12, C.t3); ell(g, dx - 3, dy - 3, 8, 7, C.t4); ell(g, dx - 5, dy - 5, 3, 2, C.t5);
    rect(g, dx - 2, dy - 12, 4, 13, C.ink2); rect(g, dx - 1, dy - 12, 2, 13, C.b0);
    rect(g, dx - 16, dy, 32, 4, C.t2); hl(g, dx - 16, dx + 15, dy, C.t4); outlineRect(g, dx - 16, dy, 32, 4, C.ink);
  },
});

BUILD.volina = () => building({
  w: 112, wallH: 36, roofH: 12, roof: 'flat', top: 16,
  roofPal: { d: C.v0, b: C.t2, l: C.t3, s: C.t1, h: C.t4, o: C.ink },
  wallStyle: 'panel', wallPal: { b: C.v1, s: C.v0, e: C.v0, p: C.ink2, pl: C.v0 },
  door: { x: 50, w: 14 }, depth: 30,
  deco(c) {
    const { g, wx, wallY, top } = c;
    // full-height glass storefront
    for (const [x, w] of [[6, 40], [68, 38]]) {
      rect(g, wx + x - 1, wallY + 9, w + 2, 22, C.ink2);
      for (let j = 0; j < 20; j++) for (let i = 0; i < w; i++) {
        let col = j < 8 ? C.b3 : C.b2;
        if ((i - j + 40) % 13 < 2) col = C.b4;
        px(g, wx + x + i, wallY + 10 + j, col);
      }
      for (let i = 10; i < w; i += 10) vl(g, wx + x + i, wallY + 10, wallY + 29, C.ink2);
      c.lights.push({ x: wx + x, y: wallY + 10, w, h: 20 });
    }
    // people working inside (silhouettes)
    for (const [x, col] of [[16, C.ink2], [30, C.v0], [84, C.ink2]]) { disc(g, wx + x, wallY + 19, 2.5, col); rect(g, wx + x - 3, wallY + 22, 7, 8, col); }
    rect(g, wx + 10, wallY + 26, 32, 2, C.k2); rect(g, wx + 72, wallY + 26, 30, 2, C.k2);
    doorAt(g, wx + 50, wallY + 13, 14, 22, { glass: true, frame: C.ink2, step: C.t2 });
    // a fascia, then the wordmark up on the roof in pink neon: lowercase, with its full stop
    rect(g, wx + 2, wallY + 2, 108, 5, C.v0); hl(g, wx + 2, wx + 109, wallY + 2, C.v2);
    const nw = textWidth('volina.') * 2 + 12, nx = Math.round(c.W / 2 - nw / 2), ny = 0;
    vl(g, nx + 6, ny + 13, top + 2, C.t1); vl(g, nx + nw - 7, ny + 13, top + 2, C.t1);
    rect(g, nx, ny, nw, 14, C.ink); rect(g, nx + 1, ny + 1, nw - 2, 12, '#241a33');
    textScaled(g, 'volina.', nx + 6, ny + 3, C.p2, 2);
    c.neon = { x: nx + 1, y: ny + 1, w: nw - 2, h: 12 };
  },
});

BUILD.aselsan = () => building({
  w: 96, wallH: 30, roofH: 12, roof: 'flat', top: 6,
  roofPal: { d: C.t2, b: C.t3, l: C.t4, s: C.t2, h: C.t5, o: C.ink },
  wallPal: { b: C.t5, s: C.t4, e: C.t3, p: C.t2, pl: C.t3 },
  door: { x: 40, w: 16 }, depth: 28,
  deco(c) {
    const { g, wx, wallY } = c;
    rect(g, wx, wallY + 4, 96, 6, C.b1); hl(g, wx, wx + 95, wallY + 4, C.b2);
    text(g, 'ASELSAN', wx + 48 - (textWidth('ASELSAN') >> 1), wallY + 5, C.white);
    for (const x of [8, 22, 64, 78]) c.lights.push(...windowAt(g, wx + x, wallY + 14, 10, 8, { panes: 'v' }));
    doorAt(g, wx + 40, wallY + 12, 16, 17, { glass: true, frame: C.t1 });
  },
});

BUILD.mimlab = () => building({
  w: 128, wallH: 40, roofH: 26, roof: 'hip', top: 4, hipK: 0.9,
  roofPal: { d: C.r1, b: C.r2, l: C.r3, s: '#9a3442', h: C.r4, o: C.r0 },
  wallStyle: 'stone', wallPal: { b: C.t3, l: C.t4, s: C.t2, m: C.t2, e: C.t1, p: C.t1, pl: C.t2 },
  door: { x: 56, w: 16 }, depth: 40,
  deco(c) {
    const { g, wx, wallY } = c;
    for (const x of [10, 30, 86, 106]) {
      c.lights.push(...windowAt(g, wx + x, wallY + 8, 10, 13, { arch: true, frame: C.t5 }));
      c.lights.push(...windowAt(g, wx + x, wallY + 27, 10, 9, { frame: C.t5 }));
    }
    rect(g, wx + 48, wallY + 4, 32, 35, C.t4); outlineRect(g, wx + 48, wallY + 4, 32, 35, C.t2);
    doorAt(g, wx + 56, wallY + 19, 16, 20, { color: C.k1, colorD: C.k0, colorL: C.k2, arch: true, double: true });
    plank(g, 'BOĞAZİÇİ · MIMLAB', wx + 64, wallY + 7, { bg: C.b1, bgL: C.b2, edge: C.b0, fg: C.white });
  },
});

BUILD.girvak = () => building({
  w: 96, wallH: 30, roofH: 12, roof: 'flat', top: 14,
  roofPal: { d: C.t2, b: C.t3, l: C.t4, s: C.t2, h: C.t5, o: C.ink },
  wallPal: { b: C.white, s: C.m3, e: C.m2, p: C.y1, pl: C.y2 },
  door: { x: 14, w: 14 }, depth: 28,
  deco(c) {
    const { g, wx, wallY, top } = c;
    rect(g, wx + 38, wallY + 6, 52, 18, C.y2); outlineRect(g, wx + 38, wallY + 6, 52, 18, C.y0);
    text(g, 'GIRVAK', wx + 64 - (textWidth('GIRVAK') >> 1), wallY + 9, C.ink);
    text(g, 'FELLOWS', wx + 64 - (textWidth('FELLOWS') >> 1), wallY + 16, C.y0);
    doorAt(g, wx + 14, wallY + 11, 14, 18, { glass: true, frame: C.y0 });
    c.lights.push({ x: wx + 14, y: wallY + 11, w: 14, h: 14 });
    // a rocket on the roof. every startup building has one, it's the law
    const rx = 70, ry = top - 14;
    rect(g, rx, ry + 4, 6, 12, C.white); outlineRect(g, rx - 1, ry + 3, 8, 14, C.ink);
    for (let k = 0; k < 4; k++) hl(g, rx + 2 - k + 0, rx + 3 + k, ry + k, k === 0 ? C.ink : C.r2);
    rect(g, rx - 3, ry + 12, 3, 5, C.r2); rect(g, rx + 6, ry + 12, 3, 5, C.r2);
    disc(g, rx + 3, ry + 8, 1.5, C.b3);
  },
});

BUILD.station = (label) => building({
  w: 144, wallH: 40, roofH: 22, roof: 'hip', top: 22, hipK: 0.7,
  roofPal: { d: C.c0, b: C.c1, l: C.c2, s: '#1a5b5c', h: C.c3, o: C.ink },
  wallPal: { b: C.m3, s: C.m2, e: C.m1, p: C.r1, pl: C.r2 },
  door: { x: 62, w: 20 }, depth: 36,
  deco(c) {
    const { g, wx, wallY, top } = c;
    // striped horseshoe arches, Sirkeci-style
    const arch = (x, y, w, h) => {
      for (let k = 0; k < w + 6; k++) {
        const col = Math.floor(k / 3) % 2 ? C.r2 : C.m3;
        for (let j = 0; j < 4; j++) px(g, x - 3 + k, y - 4 + j, col);
      }
      for (let k = 0; k < 3; k++) { hl(g, x - 3 + k, x + w + 2 - k, y - 5 - k, k === 2 ? C.ink2 : C.r1); }
    };
    for (const x of [10, 32, 98, 120]) { arch(wx + x, wallY + 12, 12, 16); c.lights.push(...windowAt(g, wx + x, wallY + 12, 12, 16, { arch: true, frame: C.m3, glass: C.c1, glassL: C.c2 })); }
    arch(wx + 62, wallY + 18, 20, 21);
    doorAt(g, wx + 62, wallY + 18, 20, 21, { glass: true, frame: C.k1 });
    plank(g, label, wx + 72, wallY + 3, { bg: C.c1, bgL: C.c2, edge: C.c0, fg: C.white });
    // central clock gable
    const gx = c.W / 2 - 14;
    rect(g, gx, top - 20, 28, 26, C.m3); outlineRect(g, gx, top - 20, 28, 26, C.ink2);
    for (let k = 0; k < 8; k++) hl(g, gx + 13 - k * 2, gx + 14 + k * 2, top - 28 + k, k === 0 ? C.ink : C.c1);
    disc(g, gx + 14, top - 6, 8, C.ink2); disc(g, gx + 14, top - 6, 7, C.white);
    c.clock = { x: gx + 14, y: top - 6, r: 6 };
  },
});

BUILD.imperial = () => building({
  w: 144, wallH: 52, roofH: 14, roof: 'flat', top: 8,
  roofPal: { d: C.t2, b: C.t3, l: C.t4, s: C.t2, h: C.t5, o: C.ink },
  wallPal: { b: C.t4, s: C.t3, e: C.t2, p: C.t2, pl: C.t3 },
  door: { x: 64, w: 20 }, depth: 44,
  deco(c) {
    const { g, wx, wallY } = c;
    // concrete grid with deep blue glass
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 9; col++) {
        const x = wx + 5 + col * 15, y = wallY + 5 + row * 14;
        if (row === 2 && col >= 4 && col <= 4) continue;
        rect(g, x, y, 12, 10, C.b1);
        for (let j = 0; j < 10; j++) for (let i = 0; i < 12; i++) if ((i + j) % 9 === 1) px(g, x + i, y + j, C.b2);
        hl(g, x, x + 11, y, C.b3);
        c.lights.push({ x, y, w: 12, h: 10 });
      }
    doorAt(g, wx + 64, wallY + 33, 20, 18, { glass: true, frame: C.t1 });
    rect(g, wx + 40, wallY - 1, 64, 7, C.b0);
    text(g, 'IMPERIAL', wx + 72 - (textWidth('IMPERIAL') >> 1), wallY, C.white);
  },
});

BUILD.queensTower = () => {
  const W = 36, H = 150, cv = canvas(W, H), g = cv.g;
  const x0 = 6, w = 24, base = H - 2;
  // shaft
  for (let y = 40; y < base; y++) {
    rect(g, x0, y, w, 1, C.m3);
    px(g, x0, y, C.ink2); px(g, x0 + w - 1, y, C.ink2); px(g, x0 + 1, y, C.white); px(g, x0 + w - 3, y, C.m2); px(g, x0 + w - 2, y, C.m1);
    if (y % 7 === 0) hl(g, x0 + 1, x0 + w - 2, y, C.m2);
  }
  // red-brick banding, very Victorian
  for (const y of [60, 61, 90, 91, 118, 119]) hl(g, x0 + 1, x0 + w - 2, y, C.r2);
  for (const y of [48, 70, 98]) { rect(g, x0 + 9, y, 6, 14, C.ink2); rect(g, x0 + 10, y + 1, 4, 12, C.b1); px(g, x0 + 10, y + 1, C.b3); }
  // belfry with arches
  rect(g, x0 - 2, 30, w + 4, 12, C.m3); outlineRect(g, x0 - 2, 30, w + 4, 12, C.ink2);
  for (const ax of [x0 + 2, x0 + 9, x0 + 16]) { rect(g, ax, 33, 5, 8, C.ink2); px(g, ax, 33, C.m3); px(g, ax + 4, 33, C.m3); }
  // copper dome + lantern
  for (let y = 0; y < 18; y++) {
    const r = Math.sqrt(Math.max(0, 1 - ((y - 17) / 17) ** 2)) * 14;
    hl(g, Math.round(W / 2 - r), Math.round(W / 2 + r) - 1, 12 + y, y < 3 ? C.c3 : C.c2);
    if (r > 2) { px(g, Math.round(W / 2 - r), 12 + y, C.c0); px(g, Math.round(W / 2 + r) - 1, 12 + y, C.c0); px(g, Math.round(W / 2 + r) - 2, 12 + y, C.c1); px(g, Math.round(W / 2 - r) + 2, 12 + y, C.c4); }
  }
  for (const vx of [12, 18, 24]) for (let y = 16; y < 29; y++) if (y % 2) px(g, vx, y, C.c1);
  rect(g, 15, 4, 6, 9, C.c2); outlineRect(g, 15, 4, 6, 9, C.c0); vl(g, 18, 0, 4, C.y2); px(g, 18, 0, C.y3);
  return { img: cv, ox: x0, gy: base, w, depth: 14, lights: [], door: { x: 4, w: 16 } };
};

BUILD.clockTower = () => {
  const W = 44, H = 176, cv = canvas(W, H), g = cv.g;
  const x0 = 6, w = 32, base = H - 2;
  // limestone shaft with gothic panelling
  for (let y = 66; y < base; y++) {
    rect(g, x0, y, w, 1, C.s1);
    px(g, x0, y, C.ink2); px(g, x0 + w - 1, y, C.ink2); px(g, x0 + 1, y, C.s3); px(g, x0 + w - 2, y, C.s0);
    if (y % 9 === 0) hl(g, x0 + 1, x0 + w - 2, y, C.s0);
  }
  for (const vx of [x0 + 6, x0 + 12, x0 + 19, x0 + 25]) for (let y = 70; y < base - 4; y++) if (y % 9 > 1) px(g, vx, y, C.s0);
  for (let y = 80; y < base - 8; y += 18) for (const vx of [x0 + 8, x0 + 21]) { rect(g, vx, y, 3, 8, C.ink2); px(g, vx + 1, y, C.s1); }
  // clock stage
  rect(g, x0 - 3, 30, w + 6, 36, C.s1); outlineRect(g, x0 - 3, 30, w + 6, 36, C.ink2);
  hl(g, x0 - 2, x0 + w + 1, 31, C.s3); rect(g, x0 - 3, 62, w + 6, 4, C.s0);
  disc(g, W / 2, 47, 13.5, C.y1); disc(g, W / 2, 47, 12.5, C.y2); disc(g, W / 2, 47, 11, C.white);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; px(g, Math.round(W / 2 + Math.sin(a) * 9.5 - 0.5), Math.round(47 - Math.cos(a) * 9.5 - 0.5), k % 3 ? C.t2 : C.ink); }
  // belfry + spire with gold bits
  rect(g, x0 - 1, 18, w + 2, 12, C.s1); outlineRect(g, x0 - 1, 18, w + 2, 12, C.ink2);
  for (const ax of [x0 + 3, x0 + 11, x0 + 19, x0 + 26]) rect(g, ax, 21, 3, 7, C.ink2);
  for (let k = 0; k < 16; k++) { const hw = Math.max(1, Math.round(16 - k)); hl(g, W / 2 - hw, W / 2 + hw - 1, 18 - k, k % 4 === 0 ? C.y2 : C.t1); px(g, W / 2 - hw, 18 - k, C.ink); px(g, W / 2 + hw - 1, 18 - k, C.ink); }
  vl(g, W / 2 - 1, 0, 3, C.y2); px(g, W / 2 - 1, 0, C.y3);
  return { img: cv, ox: x0, gy: base, w, depth: 14, lights: [], clock: { x: W / 2, y: 47, r: 10 }, door: { x: 8, w: 16 } };
};

BUILD.watchShop = () => building({
  w: 64, wallH: 32, roofH: 18, roof: 'gable', top: 4,
  roofPal: { d: C.t0, b: C.t1, l: C.t2, s: C.t1, h: C.t3, o: C.ink },
  wallStyle: 'brick', wallPal: { b: '#a65e45', l: '#bd7357', d: '#8a4a3a', m: '#d8b09a', s: '#8a4a3a', e: '#6e3a33' },
  door: { x: 44, w: 12 }, depth: 30,
  deco(c) {
    const { g, wx, wallY } = c;
    rect(g, wx, wallY + 6, 64, 26, C.c0); hl(g, wx, wx + 63, wallY + 6, C.c1);
    rect(g, wx + 1, wallY + 7, 62, 7, C.c1); text(g, 'ESCAPEMENT', wx + 32 - (textWidth('ESCAPEMENT') >> 1), wallY + 8, C.y2);
    // display window full of tiny watches, all at 10:10
    rect(g, wx + 4, wallY + 16, 34, 14, C.y4); outlineRect(g, wx + 3, wallY + 15, 36, 16, C.y1);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
      const x = wx + 8 + i * 8, y = wallY + 19 + j * 6;
      disc(g, x, y, 2.6, j ? C.y1 : C.t3); px(g, x - 1, y - 1, C.white); px(g, x, y - 1, C.white); px(g, x - 1, y, C.white); px(g, x, y, C.white);
      px(g, x - 2, y - 2, C.ink); px(g, x + 1, y - 2, C.ink);
    }
    c.lights.push({ x: wx + 4, y: wallY + 16, w: 34, h: 14 });
    doorAt(g, wx + 44, wallY + 13, 12, 18, { color: C.c1, colorD: C.c0, colorL: C.c2, window: true, frame: C.y1 });
    // hanging pocket-watch sign
    hl(g, wx + 58, wx + 66, wallY + 2, C.ink); vl(g, wx + 65, wallY + 2, wallY + 4, C.ink);
    disc(g, wx + 65.5, wallY + 9, 4.5, C.y1); disc(g, wx + 65.5, wallY + 9, 3.5, C.white); px(g, wx + 65, wallY + 8, C.ink); px(g, wx + 64, wallY + 7, C.ink); px(g, wx + 66, wallY + 7, C.ink);
  },
});

BUILD.comedy = () => building({
  w: 96, wallH: 38, roofH: 14, roof: 'flat', top: 18,
  roofPal: { d: C.t1, b: C.t2, l: C.t3, s: C.t1, h: C.t4, o: C.ink },
  wallStyle: 'brick', wallPal: { b: '#7a3f4f', l: '#8f4f5c', d: '#5f2f40', m: '#3d2335', s: '#5f2f40', e: '#4a2436' },
  door: { x: 40, w: 16 }, depth: 32,
  deco(c) {
    const { g, wx, wallY, top } = c;
    // the marquee, bulbs get animated at runtime
    rect(g, wx + 10, top - 14, 76, 18, C.ink); rect(g, wx + 12, top - 12, 72, 14, C.v0);
    text(g, 'THE REFRACTORY', wx + 48 - (textWidth('THE REFRACTORY') >> 1), top - 10, C.y3);
    text(g, 'PERIOD', wx + 48 - (textWidth('PERIOD') >> 1), top - 3, C.p2);
    c.bulbs = [];
    for (let i = 0; i < 19; i++) { c.bulbs.push([wx + 11 + i * 4, top - 13]); c.bulbs.push([wx + 11 + i * 4, top + 3]); }
    vl(g, wx + 20, top + 4, top + 10, C.ink); vl(g, wx + 76, top + 4, top + 10, C.ink);
    doorAt(g, wx + 40, wallY + 18, 16, 19, { color: C.r1, colorD: C.r0, colorL: C.r2, double: true });
    awning(g, wx + 36, wallY + 13, 24, 3, C.r2, C.white);
    // posters
    for (const [x, col, t] of [[8, C.y3, 'OPEN'], [70, C.p3, 'MIC']]) {
      rect(g, wx + x, wallY + 14, 18, 18, col); outlineRect(g, wx + x, wallY + 14, 18, 18, C.ink2);
      text(g, t, wx + x + 9 - (textWidth(t) >> 1), wallY + 16, C.ink);
      disc(g, wx + x + 9, wallY + 26, 3, C.ink2); rect(g, wx + x + 8, wallY + 23, 2, 2, C.t3);
    }
    c.lights.push({ x: wx + 40, y: wallY + 18, w: 16, h: 10 });
  },
});

BUILD.tearoom = () => building({
  w: 80, wallH: 32, roofH: 22, roof: 'hip', top: 4, hipK: 0.7,
  roofPal: { d: C.t0, b: C.t1, l: C.t2, s: '#47465f', h: C.t3, o: C.ink },
  wallPal: { b: C.p3, s: C.p2, e: C.p2, p: C.p1, pl: C.p2 },
  door: { x: 34, w: 12 }, depth: 32,
  deco(c) {
    const { g, wx, wallY } = c;
    rect(g, wx + 2, wallY + 2, 76, 7, C.p1); text(g, 'TEA ROOM', wx + 40 - (textWidth('TEA ROOM') >> 1), wallY + 3, C.white);
    awning(g, wx + 4, wallY + 10, 72, 3, C.p1, C.white);
    c.lights.push(...windowAt(g, wx + 8, wallY + 16, 20, 11, { frame: C.white, curtain: C.p2 }), ...windowAt(g, wx + 52, wallY + 16, 20, 11, { frame: C.white, curtain: C.p2 }));
    doorAt(g, wx + 34, wallY + 13, 12, 18, { color: C.c2, colorD: C.c1, colorL: C.c3, window: true, frame: C.white });
  },
});

BUILD.londonStation = () => building({
  w: 112, wallH: 34, roofH: 20, roof: 'gable', top: 10,
  roofPal: { d: C.b0, b: C.b1, l: C.b2, s: C.b1, h: C.b3, o: C.ink },
  wallStyle: 'brick', wallPal: { b: '#b8794f', l: '#cb8d61', d: '#9a6341', m: '#ead2b0', s: '#9a6341', e: '#7f5038' },
  door: { x: 48, w: 16 }, depth: 30,
  deco(c) {
    const { g, wx, wallY, top } = c;
    // glass barrel roof showing through
    for (let x = 6; x < c.W - 6; x++) { const y = top + 2 + Math.round(Math.abs(x - c.W / 2) / 12); if (x % 6 === 0) vl(g, x, y, top + 18, C.b3); }
    for (const x of [8, 28, 70, 90]) c.lights.push(...windowAt(g, wx + x, wallY + 9, 12, 14, { arch: true, frame: C.m3 }));
    doorAt(g, wx + 48, wallY + 14, 16, 19, { glass: true, frame: C.k1 });
    rect(g, wx + 36, wallY + 2, 40, 8, C.r2); outlineRect(g, wx + 36, wallY + 2, 40, 8, C.ink);
    text(g, 'LONDON', wx + 56 - (textWidth('LONDON') >> 1), wallY + 4, C.white);
  },
});

BUILD.kiosk = () => building({
  w: 48, wallH: 24, roofH: 12, roof: 'gable', top: 10, over: 4,
  roofPal: { d: C.r1, b: C.r2, l: C.r3, s: C.r2, h: C.r4, o: C.r0 },
  wallStyle: 'wood', wallPal: { b: C.k3, l: C.k4, d: C.k1, s: C.k2, e: C.k1 },
  door: { x: 18, w: 12 }, depth: 18,
  deco(c) {
    const { g, wx, wallY, top } = c;
    // serving hatch with a samovar and tulip glasses
    rect(g, wx + 6, wallY + 6, 36, 12, C.k0); rect(g, wx + 7, wallY + 7, 34, 10, C.y1);
    rect(g, wx + 4, wallY + 17, 40, 3, C.k4); hl(g, wx + 4, wx + 43, wallY + 17, C.k5);
    rect(g, wx + 10, wallY + 8, 7, 9, C.t3); rect(g, wx + 11, wallY + 7, 5, 2, C.t4); px(g, wx + 13, wallY + 6, C.ink);
    for (const tx of [22, 27, 32, 37]) { rect(g, tx + wx, wallY + 13, 3, 4, C.r1); px(g, tx + wx, wallY + 12, C.white); px(g, tx + wx + 2, wallY + 12, C.white); px(g, tx + wx + 1, wallY + 13, C.r2); }
    c.lights.push({ x: wx + 7, y: wallY + 7, w: 34, h: 10 });
    plank(g, 'ÇAY', wx + 24, top - 9, { bg: C.r2, bgL: C.r3, edge: C.r0, fg: C.white });
    vl(g, wx + 24, top, top + 1, C.ink);
  },
});

BUILD.grandstand = () => {
  const W = 128, H = 52, cv = canvas(W, H), g = cv.g, base = H - 2;
  // tiers of seats
  for (let k = 0; k < 4; k++) {
    const y = 18 + k * 7;
    rect(g, 4, y, W - 8, 7, k % 2 ? C.t4 : C.t5); hl(g, 4, W - 5, y + 6, C.t2);
    for (let x = 8; x < W - 8; x += 6) { rect(g, x, y + 2, 4, 3, [C.r2, C.b2, C.y2, C.c2][(x / 6 + k) % 4 | 0]); }
  }
  outlineRect(g, 4, 18, W - 8, 30, C.ink2);
  // striped canopy on posts
  for (const x of [6, W / 2 - 1, W - 8]) rect(g, x, 12, 2, 36, C.t1);
  for (let i = 0; i < W; i++) { const col = Math.floor(i / 6) % 2 ? C.r2 : C.white; for (let j = 4; j < 12; j++) px(g, i, j, col); px(g, i, 12, i % 6 < 4 ? col : C.ink2); }
  hl(g, 0, W - 1, 3, C.ink); hl(g, 0, W - 1, 4, C.r1);
  plank(g, 'HIPPODROME', W / 2, 0, { bg: C.c1, bgL: C.c2, edge: C.c0, fg: C.white });
  return { img: cv, ox: 0, gy: base, w: W, depth: 26, lights: [], door: { x: W / 2 - 8, w: 16 } };
};

BUILD.shed = () => building({
  w: 48, wallH: 24, roofH: 14, roof: 'gable', top: 4, over: 4,
  roofPal: { d: C.g1, b: C.g2, l: C.g3, s: C.g2, h: C.g4, o: C.g0 },
  wallStyle: 'wood', wallPal: { b: C.k3, l: C.k4, d: C.k1, s: C.k2, e: C.k1 },
  door: { x: 17, w: 14 }, depth: 18,
  deco(c) {
    const { g, wx, wallY } = c;
    // tools on the outside wall: a saw, a hammer, a soldering iron
    line(g, wx + 4, wallY + 6, wx + 12, wallY + 6, C.t4); for (let i = 5; i < 12; i += 2) px(g, wx + i, wallY + 7, C.t3); rect(g, wx + 2, wallY + 5, 3, 3, C.r2);
    vl(g, wx + 9, wallY + 10, wallY + 17, C.k1); rect(g, wx + 7, wallY + 10, 5, 2, C.t2);
    line(g, wx + 36, wallY + 8, wx + 44, wallY + 16, C.t2); rect(g, wx + 35, wallY + 6, 3, 4, C.y2); px(g, wx + 44, wallY + 16, C.r3);
    doorAt(g, wx + 17, wallY + 7, 14, 16, { color: C.g2, colorD: C.g1, colorL: C.g3, frame: C.k1 });
    plank(g, 'TOOLS', wx + 24, wallY - 7, { bg: C.k4, bgL: C.k5, edge: C.k1, fg: C.k0 });
  },
});
