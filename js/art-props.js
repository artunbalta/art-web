'use strict';
/* =====================================================================
   art-props.js — trees, furniture, street stuff and lab gear.
   A prop returns { img | frames, ox, gy, solid:[w,h]|null, shadow:[rx,ry]|null }
   anchored at the bottom-centre of its footprint.
   ===================================================================== */

/* ---------- canopy painter: clumps lit from the top-left ---------- */
function canopy(cv, clumps, pal, outline, opts = {}) {
  const W = cv.width, H = cv.height, g = cv.g;
  const owner = new Int16Array(W * H).fill(-1);
  clumps.forEach(([cx, cy, r], k) => {
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const d = Math.hypot(x + 0.5 - cx, (y + 0.5 - cy) * 1.08);
        if (d <= r) owner[y * W + x] = k;
      }
  });
  const shadeOf = (x, y, k) => {
    const [cx, cy, r] = clumps[k];
    const s = ((x + 0.5 - cx) * -0.62 + (y + 0.5 - cy) * -0.78) / r;
    return s;
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const k = owner[y * W + x];
      if (k < 0) continue;
      let s = shadeOf(x, y, k) + (hash2(x, y, opts.seed || 3) - 0.5) * 0.18;
      // global light: lower half of the whole canopy is darker
      s -= (y / H - 0.45) * 0.5;
      let c = s > 0.55 ? pal[3] : s > 0.12 ? pal[2] : s > -0.42 ? pal[1] : pal[0];
      // clump separation: a darker seam where a front clump overlaps a back one
      const up = y > 0 ? owner[(y - 1) * W + x] : -1;
      if (up >= 0 && up !== k && up < k) c = pal[0];
      px(g, x, y, c);
    }
  // speckles (leaves / blossoms / fruit)
  if (opts.dots) for (const [x, y, c] of opts.dots) if (owner[y * W + x] >= 0) px(g, x, y, c);
  // outline
  if (outline) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (owner[y * W + x] >= 0) continue;
      const n = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && owner[yy * W + xx] >= 0;
      if (n(x - 1, y) || n(x + 1, y) || n(x, y - 1) || n(x, y + 1)) px(g, x, y, outline);
    }
  }
  return owner;
}
function trunk(g, cx, top, bottom, w = 6) {
  const x = Math.round(cx - w / 2);
  for (let y = top; y <= bottom; y++) {
    rect(g, x, y, w, 1, C.k2); px(g, x + 1, y, C.k3); px(g, x + w - 2, y, C.k1); px(g, x + w - 1, y, C.k1);
    px(g, x, y, C.k0); px(g, x + w - 1, y, C.k0);
  }
  // root flare
  px(g, x - 1, bottom, C.k0); px(g, x + w, bottom, C.k0); px(g, x, bottom, C.k1); px(g, x + w - 1, bottom, C.k1);
  hl(g, x - 1, x + w, bottom + 1, C.k0);
}

const PROPS = {};
const TREE_PALS = {
  green: [[C.g1, C.g2, C.g3, C.g4], C.g0],
  deep: [[C.g0, C.g1, C.g2, C.g3], C.ink],
  cherry: [[C.p1, C.p2, C.p3, C.white], C.p0],
  autumn: [[C.y0, C.y1, C.y2, C.y3], C.k0],
  plane: [['#2f5a3f', '#467a45', '#669a4f', '#8fbb62'], C.g0],
  apple: [[C.g1, C.g2, C.g3, C.g4], C.g0],
};
function makeTree(kind = 'green', size = 1, seed = 1) {
  const r = mulberry32(seed * 97 + 13);
  const W = Math.round(34 * size), cH = Math.round(30 * size), tH = Math.round(9 * size) + 2;
  const H = cH + tH + 2;
  const cv = canvas(W, H);
  const cx = W / 2;
  trunk(cv.g, cx, cH - 6, H - 3, Math.max(5, Math.round(6 * size)));
  const cl = [];
  const R = 9 * size;
  // back row, middle, front — each clump a little random
  const base = [[-0.55, 0.15, 0.78], [0.55, 0.15, 0.78], [0, -0.35, 0.95], [-0.32, -0.62, 0.62], [0.36, -0.58, 0.6], [-0.28, 0.42, 0.8], [0.32, 0.45, 0.78], [0, 0.18, 0.9]];
  for (const [dx, dy, rr] of base) cl.push([cx + dx * R * 1.15 + (r() - 0.5) * 2, cH * 0.52 + dy * R + (r() - 0.5) * 2, R * rr * (0.92 + r() * 0.16)]);
  const [pal, ol] = TREE_PALS[kind];
  const dots = [];
  if (kind === 'apple') for (let k = 0; k < 9; k++) { const x = (r() * W) | 0, y = (r() * cH) | 0; dots.push([x, y, C.r2], [x, y - 1, C.r4]); }
  if (kind === 'cherry') for (let k = 0; k < 30; k++) dots.push([(r() * W) | 0, (r() * cH) | 0, r() > 0.5 ? C.white : C.p1]);
  if (kind === 'green' || kind === 'plane') for (let k = 0; k < 6; k++) { const x = (r() * W) | 0, y = (r() * cH * 0.5) | 0; dots.push([x, y, pal[3]]); }
  canopy(cv, cl, pal, ol, { seed, dots });
  return { img: cv, ox: W / 2, gy: H - 2, solid: [8, 6], shadow: [W * 0.4, 4 * size] };
}
PROPS.tree = (o = {}) => makeTree(o.kind || 'green', o.size || 1, o.seed || 1);
PROPS.cherry = (o = {}) => makeTree('cherry', o.size || 1, o.seed || 2);
PROPS.autumn = (o = {}) => makeTree('autumn', o.size || 1, o.seed || 3);
PROPS.plane = (o = {}) => makeTree('plane', o.size || 1.2, o.seed || 4);
PROPS.apple = (o = {}) => makeTree('apple', o.size || 1.1, o.seed || 5);

PROPS.pine = (o = {}) => {
  const s = o.size || 1, W = Math.round(26 * s), H = Math.round(44 * s), cv = canvas(W, H), g = cv.g;
  trunk(g, W / 2, H - 10, H - 3, 4);
  const tiers = 4;
  for (let t = 0; t < tiers; t++) {
    const top = Math.round((t * 8) * s), hgt = Math.round(14 * s), half = Math.round((5 + t * 2.6) * s);
    for (let y = 0; y < hgt; y++) {
      const w = Math.round(half * (y + 2) / hgt);
      for (let x = -w; x <= w; x++) {
        const lit = x < -w * 0.2;
        let c = y === hgt - 1 ? C.g0 : lit ? (y < 3 ? C.g3 : C.g2) : C.g1;
        if (x === -w || x === w) c = C.g0;
        if (hash2(x + t * 7, y, o.seed || 1) > 0.88 && !(x === -w || x === w)) c = C.g3;
        px(g, Math.round(W / 2 + x), top + y, c);
      }
    }
  }
  px(g, W / 2, 0, C.g0);
  return { img: cv, ox: W / 2, gy: H - 2, solid: [6, 5], shadow: [W * 0.38, 3] };
};

PROPS.bush = (o = {}) => {
  const W = 22, H = 16, cv = canvas(W, H);
  canopy(cv, [[6.5, 9, 6], [15.5, 9, 6], [11, 6.5, 6.5]], [C.g1, C.g2, C.g3, C.g4], C.g0, { seed: o.seed || 7, dots: o.flowers ? [[5, 6, o.flowers], [12, 4, o.flowers], [16, 8, o.flowers], [9, 10, o.flowers], [14, 11, C.white]] : [] });
  return { img: cv, ox: W / 2, gy: H - 2, solid: [16, 6], shadow: [10, 3] };
};
PROPS.hedge = (o = {}) => {
  const w = o.w || 32, W = w, H = 18, cv = canvas(W, H), g = cv.g;
  for (let y = 0; y < H - 2; y++) for (let x = 0; x < W; x++) {
    let c = y < 4 ? (hash2(x, y, 5) > 0.5 ? C.g4 : C.g3) : y < 8 ? C.g3 : C.g2;
    if (y > 4 && hash2(x, y, 6) > 0.86) c = C.g1;
    if (y === 0 && (x % 5 === 0)) continue;
    px(g, x, y, c);
  }
  hl(g, 0, W - 1, H - 3, C.g1); vl(g, 0, 1, H - 3, C.g0); vl(g, W - 1, 1, H - 3, C.g0); hl(g, 1, W - 2, 0, C.g0);
  return { img: cv, ox: W / 2, gy: H - 2, solid: [W, 8], shadow: null };
};
PROPS.rock = (o = {}) => {
  const big = o.big, W = big ? 20 : 12, H = big ? 14 : 9, cv = canvas(W, H), g = cv.g;
  ell(g, W / 2, H / 2 + 1, W / 2, H / 2 - 0.5, C.t0);
  ell(g, W / 2, H / 2 + 0.5, W / 2 - 1, H / 2 - 1.5, C.t2);
  ell(g, W / 2 - 1.5, H / 2 - 0.5, W / 2 - 3, H / 2 - 2.5, C.t3);
  ell(g, W / 2 - 2.5, H / 2 - 1.5, W / 4, H / 5, C.t4);
  if (o.moss) { ell(g, W / 2 + 1, 3, W / 3, 2, C.g3); px(g, W / 2 + 2, 2, C.g4); }
  return { img: cv, ox: W / 2, gy: H - 2, solid: [W - 4, 5], shadow: [W / 2, 2] };
};
PROPS.stump = (o = {}) => {
  const W = 18, H = o.axe ? 22 : 13, cv = canvas(W, H), g = cv.g, y0 = H - 12;
  rect(g, 3, y0 + 4, 12, 7, C.k2); px(g, 3, y0 + 4, C.k1); rect(g, 12, y0 + 4, 3, 7, C.k1); rect(g, 4, y0 + 4, 1, 7, C.k3);
  ell(g, 9, y0 + 4, 6, 3, C.k4); ell(g, 9, y0 + 4, 4, 2, C.k5); ell(g, 9, y0 + 4, 2, 1, C.k4); px(g, 9, y0 + 4, C.k2);
  rect(g, 1, y0 + 10, 3, 1, C.k1); rect(g, 14, y0 + 10, 3, 1, C.k1);
  hl(g, 2, 15, y0 + 11, C.k0);
  if (o.axe) {
    // the balta. family name. load-bearing.
    line(g, 12, y0 - 7, 8, y0 + 3, C.k3); line(g, 13, y0 - 7, 9, y0 + 3, C.k2);
    rect(g, 9, y0 + 1, 6, 4, C.t3); hl(g, 9, 14, y0 + 1, C.t5); rect(g, 14, y0 + 2, 1, 3, C.t1); px(g, 12, y0 - 8, C.k1);
  }
  return { img: cv, ox: W / 2, gy: H - 2, solid: [12, 5], shadow: [8, 2] };
};
PROPS.fence = (o = {}) => {
  // horizontal picket fence segment, 16px
  const col = o.white ? [C.t5, C.t4, C.t2] : [C.k4, C.k3, C.k1];
  const W = 16, H = 14, cv = canvas(W, H), g = cv.g;
  for (const x of [1, 6, 11]) { rect(g, x, 2, 4, 10, col[1]); vl(g, x, 2, 11, col[0]); vl(g, x + 3, 2, 11, col[2]); px(g, x + 1, 1, col[0]); px(g, x + 2, 1, col[1]); }
  rect(g, 0, 5, 16, 2, col[0]); hl(g, 0, 15, 6, col[2]); rect(g, 0, 9, 16, 1, col[2]);
  hl(g, 0, 15, 12, C.ink2);
  return { img: cv, ox: 8, gy: 12, solid: [16, 4], shadow: null };
};
PROPS.fenceV = (o = {}) => {
  const col = o.white ? [C.t5, C.t4, C.t2] : [C.k4, C.k3, C.k1];
  const W = 6, H = 26, cv = canvas(W, H), g = cv.g;
  rect(g, 1, 0, 4, 22, col[1]); vl(g, 1, 0, 21, col[0]); vl(g, 4, 0, 21, col[2]);
  for (const y of [3, 9, 15]) { px(g, 1, y, col[2]); px(g, 2, y, col[2]); }
  hl(g, 1, 4, 22, C.ink2);
  return { img: cv, ox: 3, gy: 22, solid: [4, 16], shadow: null };
};
PROPS.chain = () => {
  const W = 16, H = 22, cv = canvas(W, H), g = cv.g;
  for (let y = 2; y < 19; y++) for (let x = 0; x < 16; x++) if ((x + y) % 4 === 0 || (x - y + 64) % 4 === 0) px(g, x, y, C.t3);
  rect(g, 0, 0, 2, 20, C.t1); px(g, 0, 0, C.t4); hl(g, 0, 15, 2, C.t2);
  return { img: cv, ox: 8, gy: 19, solid: [16, 4], shadow: null };
};
PROPS.chainV = () => {
  const W = 4, H = 34, cv = canvas(W, H), g = cv.g;
  rect(g, 1, 0, 2, 32, C.t1); vl(g, 1, 0, 31, C.t3);
  return { img: cv, ox: 2, gy: 31, solid: [4, 16], shadow: null };
};

PROPS.lamp = (o = {}) => {
  const lon = o.london, W = 12, H = 40, cv = canvas(W, H), g = cv.g;
  const pole = lon ? C.ink : C.c0, poleL = lon ? C.t1 : C.c1;
  rect(g, 5, 10, 2, 28, pole); vl(g, 5, 10, 37, poleL);
  rect(g, 3, 35, 6, 3, pole); hl(g, 3, 8, 35, poleL);
  if (lon) {
    rect(g, 2, 2, 8, 9, C.ink); rect(g, 3, 4, 6, 6, C.y3); px(g, 4, 5, C.y4); hl(g, 1, 10, 2, C.ink); px(g, 5, 0, C.ink); px(g, 6, 0, C.ink); hl(g, 3, 8, 1, C.ink);
    hl(g, 3, 8, 7, C.ink2);
  } else {
    disc(g, 6, 6, 4.5, C.c0); disc(g, 6, 6, 3.5, C.y3); px(g, 5, 4, C.y4); hl(g, 3, 8, 1, C.c0); rect(g, 5, 0, 2, 2, C.c0);
  }
  return { img: cv, ox: 6, gy: 38, solid: [4, 3], shadow: [3, 1], light: [6, 6] };
};
PROPS.bench = (o = {}) => {
  const W = 26, H = 16, cv = canvas(W, H), g = cv.g;
  rect(g, 1, 2, 24, 3, C.k3); hl(g, 1, 24, 2, C.k4); hl(g, 1, 24, 4, C.k1);
  rect(g, 1, 7, 24, 3, C.k3); hl(g, 1, 24, 7, C.k4); hl(g, 1, 24, 9, C.k1);
  for (const x of [3, 21]) { rect(g, x, 1, 2, 14, C.ink2); vl(g, x, 1, 14, C.t1); }
  return { img: cv, ox: 13, gy: 14, solid: [24, 5], shadow: [12, 2] };
};
PROPS.signpost = (o = {}) => {
  const lines = o.lines || ['HELLO'];
  const tw = Math.max(...lines.map(textWidth)) + 9;
  const W = tw + 4, H = 22 + lines.length * 10, cv = canvas(W, H), g = cv.g;
  const px0 = Math.floor(W / 2) - 1;
  rect(g, px0, 4, 3, H - 6, C.k1); vl(g, px0, 4, H - 3, C.k2);
  lines.forEach((t, i) => {
    const y = 2 + i * 10, right = i % 2 === 0;
    const x = 2;
    rect(g, x, y, tw - 2, 8, C.k3); hl(g, x, x + tw - 3, y, C.k4); hl(g, x, x + tw - 3, y + 7, C.k1);
    if (right) { px(g, x + tw - 2, y + 2, C.k3); rect(g, x + tw - 2, y + 2, 1, 4, C.k3); px(g, x + tw - 1, y + 3, C.k3); px(g, x + tw - 1, y + 4, C.k3); }
    else { rect(g, x - 1, y + 2, 1, 4, C.k3); px(g, x - 2, y + 3, C.k3); px(g, x - 2, y + 4, C.k3); }
    text(g, t, x + 3, y + 2, C.k0);
  });
  hl(g, px0 - 1, px0 + 3, H - 2, C.k0);
  return { img: cv, ox: W / 2, gy: H - 2, solid: [6, 4], shadow: [5, 1] };
};
PROPS.bigsign = (o = {}) => {
  // two-post welcome board
  const lines = o.lines || ['WELCOME'];
  const tw = Math.max(...lines.map(textWidth)) + 12, W = tw + 4, H = 18 + lines.length * 8, cv = canvas(W, H), g = cv.g;
  for (const x of [5, W - 8]) { rect(g, x, 6, 3, H - 8, C.k1); vl(g, x, 6, H - 3, C.k2); }
  const bh = lines.length * 8 + 5;
  rect(g, 2, 2, W - 4, bh, C.k1); rect(g, 3, 3, W - 6, bh - 2, C.k3); hl(g, 3, W - 4, 3, C.k4);
  for (let y = 7; y < bh; y += 5) hl(g, 4, W - 5, y + 1, C.k2);
  lines.forEach((t, i) => textCenter(g, t, W / 2, 5 + i * 8, i === 0 ? C.white : C.k0, i === 0 ? C.k1 : null));
  return { img: cv, ox: W / 2, gy: H - 2, solid: [W - 6, 4], shadow: [W / 2 - 2, 2] };
};
PROPS.mailbox = () => {
  const W = 16, H = 26, cv = canvas(W, H), g = cv.g;
  rect(g, 7, 12, 2, 12, C.k1); vl(g, 7, 12, 23, C.k2);
  rect(g, 2, 4, 12, 9, C.b2); rect(g, 3, 3, 10, 1, C.b2); hl(g, 4, 11, 2, C.b2);
  outlineRect(g, 2, 4, 12, 9, C.ink); hl(g, 4, 11, 1, C.ink); px(g, 3, 2, C.ink); px(g, 12, 2, C.ink); px(g, 2, 3, C.ink); px(g, 13, 3, C.ink);
  hl(g, 3, 12, 4, C.b3); rect(g, 4, 6, 8, 1, C.b1);
  text(g, 'A', 6, 7, C.white);
  // the flag — goes up when there's mail for you
  rect(g, 13, 3, 1, 7, C.ink); rect(g, 14, 3, 2, 3, C.r2);
  hl(g, 5, 10, 24, C.k0);
  return { img: cv, ox: 8, gy: 24, solid: [6, 4], shadow: [5, 1] };
};
PROPS.pillarBox = () => {
  const W = 12, H = 24, cv = canvas(W, H), g = cv.g;
  rect(g, 2, 5, 8, 17, C.r2); vl(g, 2, 5, 21, C.r3); vl(g, 9, 5, 21, C.r1);
  ell(g, 6, 5, 5, 3, C.r2); ell(g, 5.5, 4.5, 3.5, 1.8, C.r3); hl(g, 1, 10, 7, C.r1);
  rect(g, 3, 10, 6, 1, C.ink); rect(g, 3, 14, 6, 3, C.white); rect(g, 1, 21, 10, 2, C.ink2);
  outlineRect(g, 1, 6, 10, 16, C.r0);
  return { img: cv, ox: 6, gy: 22, solid: [8, 4], shadow: [5, 1] };
};
PROPS.phoneBox = () => {
  const W = 20, H = 40, cv = canvas(W, H), g = cv.g;
  rect(g, 2, 6, 16, 32, C.r2); vl(g, 2, 6, 37, C.r3); vl(g, 17, 6, 37, C.r1);
  ell(g, 10, 6, 9, 3, C.r2); hl(g, 3, 16, 4, C.r3); outlineRect(g, 1, 5, 18, 34, C.r0); hl(g, 4, 15, 2, C.r0); px(g, 3, 3, C.r0); px(g, 16, 3, C.r0);
  rect(g, 4, 8, 12, 3, C.ink); text(g, 'TEL', 6, 7, C.white);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) { rect(g, 4 + x * 4, 13 + y * 4, 3, 3, C.b4); px(g, 4 + x * 4, 13 + y * 4, C.white); }
  rect(g, 4, 33, 12, 3, C.r1); px(g, 15, 24, C.y2);
  return { img: cv, ox: 10, gy: 38, solid: [16, 6], shadow: [8, 2] };
};
PROPS.bus = () => {
  const W = 56, H = 44, cv = canvas(W, H), g = cv.g;
  rect(g, 1, 4, 54, 34, C.r2); hl(g, 1, 54, 4, C.r3); hl(g, 1, 54, 21, C.r1);
  outlineRect(g, 0, 3, 56, 36, C.r0); hl(g, 2, 53, 2, C.r0);
  for (let i = 0; i < 6; i++) { rect(g, 4 + i * 8, 7, 7, 8, C.b1); rect(g, 4 + i * 8, 7, 7, 3, C.b2); px(g, 5 + i * 8, 8, C.b4); }
  for (let i = 0; i < 5; i++) { rect(g, 12 + i * 8, 24, 7, 8, C.b1); rect(g, 12 + i * 8, 24, 7, 3, C.b2); px(g, 13 + i * 8, 25, C.b4); }
  rect(g, 3, 23, 7, 14, C.ink2); rect(g, 4, 24, 5, 12, C.b2);
  rect(g, 42, 17, 12, 4, C.ink); text(g, '10', 44, 16, C.y3);
  hl(g, 1, 54, 16, C.white); hl(g, 1, 54, 33, C.ink2);
  for (const x of [10, 44]) { disc(g, x, 38, 4, C.ink); disc(g, x, 38, 2, C.t2); px(g, x, 38, C.t4); }
  return { img: cv, ox: 28, gy: 41, solid: [54, 10], shadow: [27, 3] };
};
PROPS.simitCart = () => {
  const W = 30, H = 32, cv = canvas(W, H), g = cv.g;
  // glass case full of simit
  rect(g, 3, 8, 24, 14, C.r1); rect(g, 4, 9, 22, 12, C.b4); outlineRect(g, 3, 8, 24, 14, C.r0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const x = 7 + i * 5.3, y = 12 + j * 5;
    disc(g, x, y, 2.6, C.y0); disc(g, x, y, 1.8, C.y1); px(g, Math.round(x - 0.5), Math.round(y - 0.5), C.b4); px(g, Math.round(x - 1.5), Math.round(y - 2), C.s3);
  }
  rect(g, 2, 21, 26, 4, C.r2); hl(g, 2, 27, 21, C.r3); outlineRect(g, 2, 21, 26, 4, C.r0);
  rect(g, 3, 4, 24, 4, C.r2); hl(g, 3, 26, 4, C.r3); outlineRect(g, 3, 3, 24, 5, C.r0); text(g, 'SIMIT', 6, 3, C.white);
  for (const x of [6, 23]) { disc(g, x, 27, 3, C.ink); disc(g, x, 27, 1.5, C.t3); }
  line(g, 27, 22, 29, 20, C.k1);
  return { img: cv, ox: 15, gy: 29, solid: [26, 6], shadow: [13, 2] };
};
PROPS.teaTable = () => {
  const W = 30, H = 18, cv = canvas(W, H), g = cv.g;
  for (const x of [3, 25]) { ell(g, x, 12, 3, 2, C.k1); ell(g, x, 11.5, 3, 1.6, C.k3); vl(g, x, 13, 16, C.k1); }
  ell(g, 15, 8, 8, 3, C.k1); ell(g, 15, 7.5, 7, 2.4, C.white); ell(g, 14, 7, 5, 1.6, C.t5);
  vl(g, 15, 10, 16, C.ink2); hl(g, 12, 18, 16, C.ink2);
  // tulip glasses, tavşan kanı
  for (const x of [12, 17]) { rect(g, x, 3, 3, 4, C.r1); px(g, x + 1, 4, C.r2); px(g, x, 2, C.white); px(g, x + 2, 2, C.white); px(g, x + 1, 7, C.white); }
  return { img: cv, ox: 15, gy: 16, solid: [22, 4], shadow: [12, 2] };
};
PROPS.pergola = (o = {}) => {
  const w = o.w || 80, W = w, H = 42, cv = canvas(W, H), g = cv.g;
  for (const x of [2, W - 6, (W >> 1) - 2]) { rect(g, x, 8, 4, 32, C.k2); vl(g, x, 8, 39, C.k3); vl(g, x + 3, 8, 39, C.k1); }
  rect(g, 0, 6, W, 4, C.k3); hl(g, 0, W - 1, 6, C.k4); hl(g, 0, W - 1, 9, C.k1);
  // vine with grapes
  const r = mulberry32(5);
  for (let x = 0; x < W; x++) {
    const h = 3 + ((r() * 5) | 0);
    for (let y = 0; y < h; y++) px(g, x, 2 + y, r() > 0.5 ? C.g3 : C.g2);
    if (r() > 0.85) { px(g, x, 2 + h, C.v1); px(g, x, 3 + h, C.v2); px(g, x + 1, 2 + h, C.v1); }
    if (r() > 0.6) px(g, x, 1, C.g4);
  }
  return { img: cv, ox: W >> 1, gy: 40, solid: null, shadow: null, solids: [[-(W >> 1) + 4, 0, 4, 3], [(W >> 1) - 4, 0, 4, 3]] };
};
PROPS.pot = (o = {}) => {
  const W = 12, H = 16, cv = canvas(W, H), g = cv.g;
  rect(g, 3, 9, 6, 5, C.r2); rect(g, 2, 8, 8, 2, C.r3); hl(g, 2, 9, 8, C.r4); vl(g, 8, 10, 13, C.r1); hl(g, 3, 8, 14, C.r0);
  canopy(cv, [[6, 5, 4.2]], [C.g1, C.g2, C.g3, C.g4], C.g0, { dots: [[4, 3, o.flower || C.p2], [7, 2, o.flower || C.p2], [8, 5, o.flower || C.p2], [5, 6, C.y3]] });
  return { img: cv, ox: 6, gy: 14, solid: [8, 4], shadow: [4, 1] };
};
PROPS.barrel = () => {
  const W = 14, H = 18, cv = canvas(W, H), g = cv.g;
  rect(g, 2, 3, 10, 13, C.k2); vl(g, 3, 3, 15, C.k3); vl(g, 10, 3, 15, C.k1); vl(g, 11, 3, 15, C.k1);
  hl(g, 2, 11, 5, C.t1); hl(g, 2, 11, 13, C.t1);
  ell(g, 7, 3, 5, 2, C.k3); ell(g, 7, 3, 3.5, 1.2, C.k4); outlineRect(g, 1, 3, 12, 14, C.k0);
  return { img: cv, ox: 7, gy: 16, solid: [10, 5], shadow: [6, 2] };
};
PROPS.crate = () => {
  const W = 16, H = 16, cv = canvas(W, H), g = cv.g;
  rect(g, 1, 2, 14, 12, C.k3); outlineRect(g, 1, 2, 14, 12, C.k1); line(g, 2, 3, 13, 12, C.k2); line(g, 13, 3, 2, 12, C.k2);
  hl(g, 2, 13, 3, C.k4); hl(g, 1, 14, 14, C.k0);
  return { img: cv, ox: 8, gy: 14, solid: [14, 6], shadow: [7, 2] };
};

/* ---------- fountain (3 frames) ---------- */
PROPS.fountain = () => {
  const frames = [];
  for (let f = 0; f < 3; f++) {
    const W = 50, H = 44, cv = canvas(W, H), g = cv.g;
    ell(g, 25, 33, 24, 9, C.t1); ell(g, 25, 32, 23, 8, C.t3); ell(g, 25, 31, 22, 7, C.t4);
    ell(g, 25, 32, 19, 5.5, C.w2); ell(g, 25, 32, 18, 4.6, C.w3);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + f * 0.6; px(g, Math.round(25 + Math.cos(a) * 12), Math.round(32 + Math.sin(a) * 3), C.w5); }
    rect(g, 22, 18, 6, 14, C.t3); vl(g, 22, 18, 31, C.t4); vl(g, 27, 18, 31, C.t2);
    ell(g, 25, 18, 8, 2.5, C.t2); ell(g, 25, 17.5, 7, 1.8, C.t4); ell(g, 25, 18, 5, 1.2, C.w3);
    // the jet
    const jh = [12, 14, 13][f];
    for (let y = 0; y < jh; y++) { px(g, 25, 17 - y, C.w5); px(g, 24, 17 - y, y % 3 === f ? C.white : C.w4); }
    for (const s of [-1, 1]) for (let k = 0; k < 7; k++) {
      const t = k / 6, x = 25 + s * (2 + t * 7), y = 17 - jh + t * t * 12 + (k > 4 ? 4 : 0);
      px(g, Math.round(x), Math.round(y), (k + f) % 3 ? C.w5 : C.white);
    }
    px(g, 25, 17 - jh - 1, C.white);
    frames.push(cv);
  }
  return { frames, fps: 6, ox: 25, gy: 41, solid: [44, 14], shadow: null };
};

/* ---------- lab gear ---------- */
PROPS.radar = () => {
  // a lattice tower; the dish is drawn at runtime so it can rotate
  const W = 30, H = 46, cv = canvas(W, H), g = cv.g;
  for (let y = 14; y < 44; y++) {
    const half = 3 + Math.round((y - 14) / 5);
    px(g, 15 - half, y, C.t1); px(g, 15 + half, y, C.t1);
    if (y % 5 === 0) { hl(g, 15 - half, 15 + half, y, C.t2); }
  }
  for (let y = 15; y < 44; y += 5) { const h1 = 3 + Math.round((y - 14) / 5); line(g, 15 - h1, y, 15 + h1, y + 4, C.t2); }
  rect(g, 10, 10, 10, 5, C.t3); outlineRect(g, 10, 10, 10, 5, C.ink2); hl(g, 4, 26, 44, C.t1);
  return { img: cv, ox: 15, gy: 44, solid: [18, 8], shadow: [11, 2] };
};
PROPS.tesla = () => {
  const W = 24, H = 52, cv = canvas(W, H), g = cv.g;
  rect(g, 3, 40, 18, 9, C.t1); hl(g, 3, 20, 40, C.t3); outlineRect(g, 2, 39, 20, 11, C.ink);
  rect(g, 6, 43, 4, 3, C.r2); px(g, 14, 44, C.c3); px(g, 17, 44, C.y2);
  // secondary coil: copper winding
  for (let y = 14; y < 40; y++) { rect(g, 9, y, 6, 1, y % 2 ? C.y1 : C.y0); px(g, 9, y, C.k1); px(g, 14, y, C.k0); if (y % 2) px(g, 10, y, C.y2); }
  // toroid
  ell(g, 12, 10, 11, 4.5, C.t1); ell(g, 12, 9.5, 10, 3.6, C.t4); ell(g, 10, 8.5, 6, 1.6, C.t5); ell(g, 12, 10, 4, 1.4, C.t2);
  return { img: cv, ox: 12, gy: 49, solid: [18, 7], shadow: [10, 2], top: [12, 8] };
};
PROPS.mri = () => {
  const W = 56, H = 40, cv = canvas(W, H), g = cv.g;
  // patient table
  rect(g, 0, 26, 30, 6, C.t4); hl(g, 0, 29, 26, C.t5); rect(g, 2, 32, 4, 6, C.t2); rect(g, 24, 32, 4, 6, C.t2); outlineRect(g, 0, 26, 30, 6, C.ink2);
  rect(g, 2, 24, 8, 3, C.b3);
  // the donut
  ell(g, 38, 22, 17, 17, C.ink2); ell(g, 38, 22, 16, 16, C.white); ell(g, 35, 18, 11, 11, C.t5);
  ell(g, 38, 23, 8, 8, C.t2); ell(g, 38, 23, 7, 7, C.ink); ell(g, 39, 24, 5, 5, C.b0);
  rect(g, 22, 34, 32, 4, C.t3); hl(g, 22, 53, 34, C.t4); outlineRect(g, 22, 34, 32, 4, C.ink2);
  rect(g, 44, 9, 7, 3, C.c2); px(g, 45, 10, C.c4);
  return { img: cv, ox: 28, gy: 38, solid: [54, 12], shadow: [26, 3] };
};
PROPS.eeg = () => {
  const W = 40, H = 34, cv = canvas(W, H), g = cv.g;
  // desk
  rect(g, 0, 18, 40, 4, C.k3); hl(g, 0, 39, 18, C.k4); outlineRect(g, 0, 18, 40, 4, C.k0);
  for (const x of [2, 35]) rect(g, x, 22, 3, 10, C.k1);
  // mannequin head with an electrode cap
  ell(g, 9, 11, 6, 7, C.sk2); ell(g, 8, 10, 4, 5, C.sk3);
  ell(g, 9, 8, 6.5, 5, C.t1); for (let k = 0; k < 9; k++) px(g, 4 + (k % 5) * 2.5 | 0, 5 + ((k / 5) | 0) * 4, k % 2 ? C.y2 : C.r3);
  rect(g, 7, 17, 5, 2, C.t3);
  // wires to the monitor
  line(g, 14, 8, 20, 12, C.ink2); line(g, 14, 10, 20, 14, C.ink2);
  rect(g, 18, 2, 21, 15, C.ink); rect(g, 19, 3, 19, 13, C.b0); rect(g, 26, 16, 6, 2, C.t1);
  return { img: cv, ox: 20, gy: 32, solid: [38, 8], shadow: [18, 2], screen: [19, 3, 19, 13] };
};
PROPS.table = (o = {}) => {
  const w = o.w || 32, W = w, H = 18, cv = canvas(W, H), g = cv.g;
  rect(g, 0, 4, W, 4, o.top || C.k3); hl(g, 0, W - 1, 4, o.topL || C.k4); outlineRect(g, 0, 4, W, 4, C.k0);
  for (const x of [2, W - 5]) rect(g, x, 8, 3, 8, C.k1);
  return { img: cv, ox: W >> 1, gy: 16, solid: [W - 2, 6], shadow: [W / 2, 2] };
};
PROPS.arcade = () => {
  const W = 20, H = 36, cv = canvas(W, H), g = cv.g;
  rect(g, 2, 2, 16, 32, C.v1); vl(g, 2, 2, 33, C.v2); vl(g, 17, 2, 33, C.v0); outlineRect(g, 1, 1, 18, 34, C.ink);
  rect(g, 3, 3, 14, 5, C.p1); text(g, 'M0+', 4, 3, C.y4);
  rect(g, 4, 10, 12, 10, C.ink); rect(g, 5, 11, 10, 8, C.b0);
  rect(g, 3, 21, 14, 5, C.t2); hl(g, 3, 16, 21, C.t3); disc(g, 7, 23, 1.5, C.r2); disc(g, 12, 23, 1.5, C.y2); disc(g, 15, 23, 1.2, C.c3);
  rect(g, 7, 28, 6, 3, C.ink2); px(g, 9, 29, C.y2);
  return { img: cv, ox: 10, gy: 34, solid: [16, 6], shadow: [9, 2], screen: [5, 11, 10, 8] };
};
PROPS.easels = () => {
  const W = 48, H = 34, cv = canvas(W, H), g = cv.g;
  const easel = (x) => { line(g, x + 3, 6, x, 32, C.k1); line(g, x + 14, 6, x + 17, 32, C.k1); line(g, x + 9, 4, x + 9, 31, C.k2); hl(g, x + 1, x + 16, 22, C.k2); };
  easel(2); easel(27);
  // portrait A: a plausible human
  rect(g, 3, 5, 16, 16, C.k4); rect(g, 4, 6, 14, 14, C.b4);
  ell(g, 11, 12, 4, 4.5, C.sk2); rect(g, 7, 7, 8, 3, C.k0); px(g, 9, 12, C.ink); px(g, 13, 12, C.ink); hl(g, 10, 12, 15, C.r2); rect(g, 6, 17, 10, 3, C.c1);
  // portrait B: synthetic. count the ears.
  rect(g, 28, 5, 16, 16, C.k4); rect(g, 29, 6, 14, 14, C.p3);
  ell(g, 36, 12, 4, 4.5, C.sk2); rect(g, 32, 7, 8, 3, C.y1); px(g, 34, 12, C.ink); px(g, 38, 11, C.ink); px(g, 36, 12, C.ink); hl(g, 34, 38, 15, C.r2);
  px(g, 31, 12, C.sk1); px(g, 41, 11, C.sk1); px(g, 41, 13, C.sk1); rect(g, 31, 17, 10, 3, C.v2); px(g, 40, 8, C.c3); px(g, 30, 16, C.y3);
  return { img: cv, ox: 24, gy: 32, solid: [44, 5], shadow: [22, 2] };
};
PROPS.xray = () => {
  const W = 26, H = 36, cv = canvas(W, H), g = cv.g;
  rect(g, 12, 22, 2, 12, C.t1); hl(g, 7, 18, 33, C.t1);
  rect(g, 1, 1, 24, 22, C.t2); rect(g, 2, 2, 22, 20, C.b4); outlineRect(g, 1, 1, 24, 22, C.ink2);
  rect(g, 4, 4, 18, 16, C.b0);
  // a hand. five fingers. checked twice.
  rect(g, 10, 13, 7, 5, C.t4);
  for (let k = 0; k < 4; k++) { const x = 10 + k * 2; vl(g, x, 6 + (k === 1 || k === 2 ? 0 : 1), 12, C.t5); }
  line(g, 17, 12, 19, 9, C.t5); line(g, 17, 13, 20, 10, C.t4);
  hl(g, 11, 15, 18, C.t4); vl(g, 13, 18, 19, C.t4);
  return { img: cv, ox: 13, gy: 34, solid: [10, 4], shadow: [8, 2] };
};
PROPS.chalkboard = (o = {}) => {
  const W = 40, H = 34, cv = canvas(W, H), g = cv.g;
  for (const x of [4, 34]) rect(g, x, 20, 2, 13, C.k1);
  rect(g, 0, 0, 40, 24, C.k2); rect(g, 2, 2, 36, 20, '#2f4a3f'); hl(g, 2, 37, 2, '#3c5c4e');
  const ln = o.lines || ['A+B=?', '1/2<3/4'];
  ln.forEach((t, i) => text(g, t, 5, 5 + i * 7, i === 0 ? C.white : C.t4));
  rect(g, 30, 19, 5, 2, C.white);
  return { img: cv, ox: 20, gy: 32, solid: [36, 4], shadow: [18, 2] };
};
PROPS.trophy = () => {
  const W = 20, H = 34, cv = canvas(W, H), g = cv.g;
  rect(g, 3, 20, 14, 12, C.t3); hl(g, 3, 16, 20, C.t5); vl(g, 16, 20, 31, C.t2); outlineRect(g, 3, 20, 14, 12, C.ink2);
  rect(g, 6, 24, 8, 4, C.y1); text(g, '1', 9, 23, C.y4);
  // gold cup
  rect(g, 7, 15, 6, 4, C.y1); rect(g, 8, 13, 4, 2, C.y2);
  ell(g, 10, 7, 6, 6, C.y1); ell(g, 9, 6, 4.5, 5, C.y2); rect(g, 4, 1, 12, 2, C.y2); hl(g, 4, 15, 1, C.y3);
  px(g, 7, 4, C.y4); px(g, 7, 5, C.y4); px(g, 2, 4, C.y1); px(g, 3, 6, C.y1); px(g, 17, 4, C.y1); px(g, 16, 6, C.y1);
  return { img: cv, ox: 10, gy: 32, solid: [14, 5], shadow: [7, 2] };
};
PROPS.bigCheck = () => {
  const W = 70, H = 30, cv = canvas(W, H), g = cv.g;
  for (const x of [12, 56]) rect(g, x, 20, 2, 9, C.k1);
  rect(g, 0, 2, W, 20, C.white); outlineRect(g, 0, 2, W, 20, C.ink2); rect(g, 1, 3, W - 2, 4, C.c2);
  text(g, 'BILKENTPRENEURS', 4, 8, C.ink); text(g, '$3,000', 4, 15, C.g1); text(g, '2ND', 52, 15, C.r2); line(g, 30, 19, 48, 16, C.b1);
  return { img: cv, ox: W / 2, gy: 28, solid: [W - 6, 4], shadow: [W / 2 - 2, 2] };
};
PROPS.voli = () => {
  const W = 30, H = 48, cv = canvas(W, H), g = cv.g;
  rect(g, 5, 36, 20, 10, C.v1); hl(g, 5, 24, 36, C.v2); outlineRect(g, 5, 36, 20, 10, C.ink); text(g, 'HI!', 10, 39, C.white);
  // Voli: one big friendly molar, wearing a headset because Voli takes calls
  const T = [
    '...oooooo..oooooo...',
    '..oWWWWWWooWWWWWWo..',
    '.oWWHHWWWWWWWWWWWWo.',
    '.oWHHWWWWWWWWWWWWWo.',
    '.oWHWWWWWWWWWWWWWso.',
    '.oWWWWeWWWWWWeWWWso.',
    '.oWWWWeWWWWWWeWWWso.',
    '.oWWbWWWWWWWWWWbWso.',
    '.oWWWWWWoWWoWWWWWso.',
    '.oWWWWWWWooWWWWWsso.',
    '..oWWWWWWWWWWWWWsso.',
    '..oWWWWWWWWWWWWsso..',
    '...oWWWWWWWWWWssso..',
    '...oWWWWWooWWWsso...',
    '...oWWWWo..oWWsso...',
    '...oWWWo....oWsso...',
    '....oWWo....oWso....',
    '....oooo....ooo.....',
  ];
  g.drawImage(sprite(T, { o: C.ink, W: C.white, H: C.b4, s: C.t4, e: C.ink, b: C.p2 }), 5, 16);
  // the headset: band over the top, an ear cup, a boom mic to the smile
  for (let x = 6; x <= 23; x++) { const y = 15 - Math.round(Math.sin((x - 6) / 17 * Math.PI) * 3); px(g, x, y, C.ink2); px(g, x, y + 1, C.v1); }
  rect(g, 4, 21, 4, 6, C.v1); outlineRect(g, 4, 21, 4, 6, C.ink); px(g, 5, 22, C.v3);
  line(g, 6, 27, 11, 30, C.ink2); rect(g, 11, 29, 3, 2, C.p2); px(g, 12, 29, C.p3);
  return { img: cv, ox: 15, gy: 46, solid: [20, 6], shadow: [11, 2] };
};
PROPS.lottery = () => {
  const W = 26, H = 36, cv = canvas(W, H), g = cv.g;
  rect(g, 6, 22, 14, 12, C.y1); hl(g, 6, 19, 22, C.y2); outlineRect(g, 6, 22, 14, 12, C.y0); rect(g, 11, 30, 4, 4, C.ink2);
  disc(g, 13, 12, 11, C.ink2); disc(g, 13, 12, 10, C.b4);
  const cols = [C.r2, C.y2, C.c2, C.p2, C.b2, C.white];
  for (let k = 0; k < 14; k++) { const a = k * 2.4, rr = 3 + (k % 4) * 1.6; disc(g, 13 + Math.cos(a) * rr, 14 + Math.sin(a) * rr * 0.7, 1.6, cols[k % 6]); }
  px(g, 8, 6, C.white); px(g, 9, 5, C.white);
  return { img: cv, ox: 13, gy: 34, solid: [16, 6], shadow: [8, 2] };
};
PROPS.booth = (o = {}) => {
  // an exhibit tent: striped awning on two poles, a sign on top
  const W = o.w || 44, H = 40, cv = canvas(W, H), g = cv.g;
  const c1 = o.c1 || C.r2, c2 = o.c2 || C.white;
  for (const x of [2, W - 4]) { rect(g, x, 10, 2, 28, C.k1); vl(g, x, 10, 37, C.k2); }
  for (let i = 0; i < W; i++) {
    const c = Math.floor(i / 5) % 2 ? c1 : c2;
    for (let j = 6; j < 13; j++) px(g, i, j, j === 6 ? C.ink2 : c);
    if (i % 5 !== 4) px(g, i, 13, c);
    if (i % 5 === 1 || i % 5 === 2) px(g, i, 14, c);
  }
  hl(g, 0, W - 1, 7, C.white);
  if (o.label) { const lw = textWidth(o.label) + 6; rect(g, (W - lw) >> 1, 0, lw, 7, C.ink); text(g, o.label, ((W - lw) >> 1) + 3, 1, o.lc || C.y3); }
  return { img: cv, ox: W >> 1, gy: 38, solid: null, shadow: null, solids: [[-(W >> 1) + 3, 0, 4, 3], [(W >> 1) - 3, 0, 4, 3]] };
};

/* ---------- boats, lighthouse, rails ---------- */
PROPS.rowboat = () => {
  const W = 30, H = 14, cv = canvas(W, H), g = cv.g;
  ell(g, 15, 7, 14, 5, C.k0); ell(g, 15, 6.5, 13, 4.2, C.k2); ell(g, 15, 6, 11, 3, C.k4); ell(g, 15, 6.5, 9, 2.2, C.k3);
  for (const x of [10, 20]) vl(g, x, 4, 9, C.k1);
  line(g, 4, 10, -1, 13, C.k1); line(g, 26, 10, 31, 13, C.k1);
  hl(g, 3, 27, 11, C.w5);
  return { img: cv, ox: 15, gy: 10, solid: null, shadow: null };
};
PROPS.ferry = () => {
  // a little Bosphorus vapur
  const W = 40, H = 26, cv = canvas(W, H), g = cv.g;
  ell(g, 20, 19, 19, 5, C.ink); ell(g, 20, 18.5, 18, 4.2, C.white); hl(g, 3, 36, 21, C.b1); hl(g, 4, 35, 22, C.b0);
  rect(g, 8, 10, 24, 8, C.white); outlineRect(g, 8, 10, 24, 8, C.ink2); for (let x = 10; x < 30; x += 4) rect(g, x, 12, 2, 3, C.b2);
  rect(g, 18, 3, 5, 8, C.r1); rect(g, 18, 3, 5, 2, C.ink); vl(g, 18, 5, 10, C.r2);
  hl(g, 2, 37, 24, C.w5);
  return { img: cv, ox: 20, gy: 21, solid: null, shadow: null };
};
PROPS.lighthouse = () => {
  const W = 26, H = 70, cv = canvas(W, H), g = cv.g;
  for (let y = 16; y < 66; y++) {
    const half = 5 + Math.round((y - 16) / 9);
    const band = Math.floor((y - 16) / 9) % 2 ? C.r2 : C.white;
    hl(g, 13 - half, 12 + half, y, band); px(g, 13 - half, y, C.ink2); px(g, 12 + half, y, C.ink2); px(g, 11 + half, y, band === C.white ? C.t4 : C.r1);
  }
  rect(g, 6, 12, 14, 4, C.ink); rect(g, 8, 4, 10, 8, C.y3); rect(g, 8, 4, 10, 1, C.ink); vl(g, 12, 5, 11, C.ink2);
  for (let k = 0; k < 5; k++) hl(g, 9 - k + 4, 16 + k - 4, k, C.r1); px(g, 12, 0, C.ink);
  rect(g, 11, 56, 4, 8, C.k1);
  return { img: cv, ox: 13, gy: 66, solid: [16, 8], shadow: null, light: [13, 8] };
};
PROPS.buffer = () => {
  const W = 14, H = 16, cv = canvas(W, H), g = cv.g;
  rect(g, 1, 4, 12, 6, C.r2); hl(g, 1, 12, 4, C.r3); outlineRect(g, 0, 3, 14, 8, C.ink); for (let x = 2; x < 12; x += 4) rect(g, x, 5, 2, 4, C.white);
  rect(g, 2, 10, 2, 5, C.t1); rect(g, 10, 10, 2, 5, C.t1);
  return { img: cv, ox: 7, gy: 14, solid: [12, 4], shadow: null };
};
PROPS.whiteRail = () => {
  const W = 16, H = 10, cv = canvas(W, H), g = cv.g;
  for (const x of [1, 9]) rect(g, x, 2, 2, 7, C.t5);
  rect(g, 0, 2, 16, 2, C.white); hl(g, 0, 15, 3, C.t3); hl(g, 0, 15, 8, C.ink2);
  return { img: cv, ox: 8, gy: 8, solid: [16, 3], shadow: null };
};
PROPS.finishPost = () => {
  const W = 14, H = 36, cv = canvas(W, H), g = cv.g;
  for (let y = 10; y < 34; y++) { px(g, 6, y, Math.floor(y / 4) % 2 ? C.r2 : C.white); px(g, 7, y, Math.floor(y / 4) % 2 ? C.r1 : C.t4); }
  disc(g, 7, 6, 6, C.ink); disc(g, 7, 6, 5, C.white); disc(g, 7, 6, 3, C.r2);
  return { img: cv, ox: 7, gy: 34, solid: [4, 3], shadow: null };
};
PROPS.umbrellas = () => {
  const W = 14, H = 22, cv = canvas(W, H), g = cv.g;
  rect(g, 2, 10, 10, 10, C.ink2); rect(g, 3, 11, 8, 8, C.t1); hl(g, 2, 11, 10, C.t2);
  for (const [x, col] of [[4, C.r2], [7, C.b2], [10, C.y2]]) { line(g, x, 2, x, 11, col); px(g, x - 1, 2, C.ink); px(g, x, 1, C.ink); }
  return { img: cv, ox: 7, gy: 20, solid: [10, 4], shadow: [5, 1] };
};
PROPS.mic = () => {
  const W = 10, H = 30, cv = canvas(W, H), g = cv.g;
  vl(g, 5, 8, 27, C.ink2); hl(g, 2, 8, 28, C.ink); line(g, 5, 27, 1, 29, C.ink); line(g, 5, 27, 9, 29, C.ink);
  rect(g, 4, 3, 3, 5, C.t2); disc(g, 5.5, 3, 2, C.t4); px(g, 5, 2, C.white);
  return { img: cv, ox: 5, gy: 28, solid: [6, 3], shadow: [3, 1] };
};
PROPS.platformSign = (o = {}) => {
  const t = o.text || 'PLATFORM 1', W = textWidth(t) + 10, H = 30, cv = canvas(W, H), g = cv.g;
  for (const x of [3, W - 5]) rect(g, x, 9, 2, 19, C.ink);
  rect(g, 0, 1, W, 9, C.ink); rect(g, 1, 2, W - 2, 7, o.bg || C.b1); text(g, t, 5, 3, C.white);
  return { img: cv, ox: W >> 1, gy: 28, solid: [W - 4, 3], shadow: null };
};
PROPS.bookie = () => {
  const W = 34, H = 34, cv = canvas(W, H), g = cv.g;
  rect(g, 2, 12, 30, 20, C.c1); hl(g, 2, 31, 12, C.c2); outlineRect(g, 2, 12, 30, 20, C.ink);
  rect(g, 6, 16, 22, 8, C.ink2); rect(g, 7, 17, 20, 6, C.y4); text(g, 'BETS', 10, 18, C.r1);
  rect(g, 0, 24, 34, 3, C.k3); hl(g, 0, 33, 24, C.k4);
  awning(g, 1, 6, 32, 3, C.c1, C.white);
  return { img: cv, ox: 17, gy: 32, solid: [30, 8], shadow: [15, 2] };
};
PROPS.balloons = () => {
  const W = 20, H = 34, cv = canvas(W, H), g = cv.g;
  for (const [x, y, c] of [[5, 6, C.r2], [12, 4, C.y2], [15, 10, C.c2], [8, 12, C.p2]]) { line(g, x, y + 4, 10, 30, C.ink2); ell(g, x, y, 3.5, 4.5, c); px(g, x - 1, y - 2, C.white); }
  rect(g, 8, 29, 4, 3, C.t1);
  return { img: cv, ox: 10, gy: 31, solid: [4, 2], shadow: null };
};

/* ---------- the Spike Train (side view, facing west) ---------- */
function makeTrain() {
  const loco = canvas(52, 34), g = loco.g;
  // cab at the back, boiler at the front (left)
  rect(g, 4, 14, 44, 12, C.c1); hl(g, 4, 47, 14, C.c2); hl(g, 4, 47, 25, C.c0); outlineRect(g, 3, 13, 46, 14, C.ink);
  // the waveform painted on the side: one action potential, proudly
  const ap = [0, 0, 0, 0, -1, -7, -8, -4, 1, 2, 1, 0, 0, 0];
  for (let i = 0; i < ap.length - 1; i++) line(g, 10 + i * 2, 21 + ap[i], 12 + i * 2, 21 + ap[i + 1], C.y3);
  rect(g, 34, 4, 15, 12, C.c1); rect(g, 36, 6, 5, 5, C.b4); rect(g, 43, 6, 4, 5, C.b4); hl(g, 33, 49, 3, C.ink); rect(g, 33, 2, 17, 2, C.r2); outlineRect(g, 33, 3, 17, 13, C.ink);
  rect(g, 10, 4, 6, 10, C.ink2); rect(g, 9, 3, 8, 2, C.ink); rect(g, 22, 8, 5, 6, C.y2); outlineRect(g, 21, 7, 7, 7, C.ink);
  // cow-catcher + lamp
  for (let k = 0; k < 4; k++) line(g, 3 - k, 24, 0, 27 + 0, C.r1);
  disc(g, 4, 17, 2, C.y3);
  // wheels
  for (const x of [11, 23, 37]) { disc(g, x, 28, 4.5, C.ink); disc(g, x, 28, 3, C.t2); px(g, x, 28, C.t4); }
  line(g, 11, 28, 37, 28, C.t3);
  const car = canvas(44, 34), h = car.g;
  rect(h, 2, 10, 40, 16, C.r2); hl(h, 2, 41, 10, C.r3); hl(h, 2, 41, 25, C.r1); outlineRect(h, 1, 9, 42, 18, C.ink);
  rect(h, 1, 6, 42, 4, C.c1); outlineRect(h, 1, 6, 42, 4, C.ink);
  for (let i = 0; i < 4; i++) { rect(h, 5 + i * 9, 13, 6, 6, C.b4); px(h, 5 + i * 9, 13, C.white); }
  text(h, 'SPIKE', 13, 20, C.y3);
  for (const x of [9, 35]) { disc(h, x, 28, 4, C.ink); disc(h, x, 28, 2.5, C.t2); }
  return { loco, locoE: flipX(loco), car, carE: flipX(car) };
}
PROPS.terminal = () => {
  const W = 18, H = 30, cv = canvas(W, H), g = cv.g;
  rect(g, 7, 16, 4, 12, C.t1); rect(g, 3, 27, 12, 2, C.t1);
  rect(g, 1, 1, 16, 16, C.ink); rect(g, 2, 2, 14, 12, C.c0); text(g, 'N=2', 3, 4, C.c3); rect(g, 3, 10, 12, 2, C.c2);
  return { img: cv, ox: 9, gy: 28, solid: [10, 4], shadow: [6, 2], screen: [2, 2, 14, 12] };
};
PROPS.bottle = () => {
  const W = 10, H = 8, cv = canvas(W, H), g = cv.g;
  rect(g, 1, 3, 6, 3, C.c3); rect(g, 7, 4, 2, 1, C.c2); px(g, 9, 4, C.k3); rect(g, 2, 3, 3, 1, C.c4); rect(g, 2, 4, 3, 1, C.white);
  outlineRect(g, 0, 2, 8, 5, C.c0);
  return { img: cv, ox: 5, gy: 6, solid: null, shadow: [4, 1] };
};
PROPS.pylon = () => {
  const W = 14, H = 64, cv = canvas(W, H), g = cv.g;
  for (const x of [2, 9]) { rect(g, x, 4, 3, 58, C.r2); vl(g, x, 4, 61, C.r3); vl(g, x + 2, 4, 61, C.r1); }
  for (const y of [6, 26, 44]) { rect(g, 2, y, 10, 3, C.r1); hl(g, 2, 11, y, C.r3); }
  outlineRect(g, 1, 3, 12, 60, C.ink); rect(g, 1, 0, 12, 4, C.t2); outlineRect(g, 1, 0, 12, 4, C.ink);
  return { img: cv, ox: 7, gy: 62, solid: [12, 4], shadow: null, light: [7, 1] };
};
PROPS.sailboat = () => {
  const W = 26, H = 32, cv = canvas(W, H), g = cv.g;
  ell(g, 13, 26, 12, 4, C.ink); ell(g, 13, 25.5, 11, 3.2, C.white); hl(g, 3, 23, 27, C.r2);
  vl(g, 12, 2, 24, C.k1);
  for (let y = 4; y < 22; y++) { const w = Math.round((y - 3) * 0.55); hl(g, 13, 13 + w, y, y % 5 ? C.white : C.t4); px(g, 13 + w, y, C.ink2); }
  for (let y = 8; y < 22; y++) { const w = Math.round((y - 7) * 0.45); hl(g, 11 - w, 11, y, C.r3); px(g, 11 - w, y, C.r1); }
  return { img: cv, ox: 13, gy: 27, solid: null, shadow: null };
};

PROPS.mirror = () => {
  const W = 14, H = 26, cv = canvas(W, H), g = cv.g;
  for (const x of [2, 10]) line(g, x + 1, 18, x - 1 + (x > 5 ? 3 : 0), 24, C.k1);
  ell(g, 7, 10, 6, 9.5, C.k1); ell(g, 7, 10, 5, 8.5, C.k3); ell(g, 7, 10, 4, 7.5, C.b3); ell(g, 6, 8, 2.5, 5, C.b4);
  line(g, 4, 13, 8, 5, C.white); px(g, 9, 6, C.white);
  return { img: cv, ox: 7, gy: 24, solid: [8, 4], shadow: [5, 1] };
};

/* ---------- echo: a doorway into a world that learns you ---------- */
PROPS.echo = () => {
  const W = 40, H = 52, cv = canvas(W, H), g = cv.g;
  // steps
  rect(g, 2, 44, 36, 6, C.t3); hl(g, 2, 37, 44, C.t5); rect(g, 5, 41, 30, 4, C.t4); hl(g, 5, 34, 41, C.t5); outlineRect(g, 2, 44, 36, 6, C.ink2); outlineRect(g, 5, 41, 30, 4, C.ink2);
  // two pillars + an arch
  for (const x of [6, 28]) { rect(g, x, 12, 6, 30, C.t4); vl(g, x, 12, 41, C.t5); vl(g, x + 5, 12, 41, C.t2); outlineRect(g, x - 1, 11, 8, 31, C.ink2); for (let y = 16; y < 40; y += 6) hl(g, x, x + 5, y, C.t3); }
  for (let k = 0; k < 4; k++) {
    for (let x = 5; x <= 34; x++) { const u = (x - 5) / 29, y = 12 - Math.round(Math.sin(u * Math.PI) * 9) + k; px(g, x, y, k === 0 ? C.ink2 : k === 1 ? C.t5 : k === 3 ? C.t2 : C.t4); }
  }
  return { img: cv, ox: 20, gy: 49, solid: null, shadow: null, solids: [[-11, 0, 8, 6], [11, 0, 8, 6]], portal: [12, 13, 16, 28] };
};

/* ---------- Scrollio: a phone the size of a person, feeding you facts ---------- */
PROPS.scrollio = () => {
  const W = 34, H = 44, cv = canvas(W, H), g = cv.g;
  rect(g, 15, 34, 4, 6, C.t1); rect(g, 10, 39, 14, 3, C.t1); hl(g, 10, 23, 39, C.t2);
  // phone body
  rect(g, 8, 1, 18, 34, C.ink); rect(g, 9, 0, 16, 36, C.ink); rect(g, 10, 3, 14, 28, C.white);
  rect(g, 14, 1, 6, 1, C.t1); disc(g, 17, 33, 1.2, C.t1);
  // name plate, spelled the way it's spelled
  const tw = textWidth('Scrollio') + 6;
  rect(g, (W - tw) >> 1, 36, tw, 8, C.ink); rect(g, ((W - tw) >> 1) + 1, 37, tw - 2, 6, C.y3); text(g, 'Scrollio', ((W - tw) >> 1) + 3, 37, C.ink);
  return { img: cv, ox: 17, gy: 42, solid: [16, 5], shadow: [9, 2], screen: [10, 3, 14, 28] };
};
