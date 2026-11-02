'use strict';
/* =====================================================================
   chars.js — people & animals. People are layered (body + hair +
   accessory) and palette-swapped, so one set of drawings makes a
   whole town. 16×20 frames, feet on row 18.
   ===================================================================== */

// body layers: d = facing down, u = up, s = side (facing right)
const BODY = {
  head_d: [
    '................', '................', '................',
    '.....oooooo.....',
    '....oSSSSSSo....',
    '...oSSSSSSSSo...',
    '...oSSSSSSSso...',
    '...oSSSSSSSso...',
    '...oSeSSSSeso...',
    '...oSeSSSSeso...',
    '...oSbSSSSbso...',
    '....oSSSSSso....',
  ],
  head_u: [
    '................', '................', '................',
    '.....oooooo.....',
    '....oSSSSSSo....',
    '...oSSSSSSSSo...',
    '...oSSSSSSSso...',
    '...oSSSSSSSso...',
    '...oSSSSSSSso...',
    '...oSSSSSSSso...',
    '...oSSSSSSSso...',
    '....oSSSSSso....',
  ],
  head_s: [
    '................', '................', '................',
    '.....ooooo......',
    '....oSSSSSoo....',
    '...oSSSSSSSSo...',
    '...osSSSSSSSo...',
    '...osSSSSSSSSo..',
    '...osSSSSSeSSo..',
    '...osSSSSSeSSo..',
    '...osSSSSSSbo...',
    '....osSSSSSo....',
  ],
  torso_d: [
    '.....oTTTTo.....',
    '....oUTTTTto....',
    '...oUTTTTTTto...',
    '...oSUTTTTtSo...',
  ],
  torso_u: [
    '.....oTTTTo.....',
    '....oTTTTTto....',
    '...oTTTTTTTto...',
    '...oSTTTTTtSo...',
  ],
  torso_s: [
    '.....oTTTo......',
    '....oUTTTto.....',
    '....oUTTTto.....',
    '....otTSTto.....',
  ],
  // legs: [stand, walkA, walkB]
  legs_d: [
    ['....oPPPPPPo....', '....oPPooPPo....', '....oFFooFFo....'],
    ['....oPPPPPPo....', '....oPPooFFo....', '....oFFo.oo.....'],
    ['....oPPPPPPo....', '....oFFooPPo....', '.....oo.oFFo....'],
  ],
  legs_u: [
    ['....oPPPPPPo....', '....oPPooPPo....', '....oFFooFFo....'],
    ['....oPPPPPPo....', '....oPPooFFo....', '....oFFo.oo.....'],
    ['....oPPPPPPo....', '....oFFooPPo....', '.....oo.oFFo....'],
  ],
  legs_s: [
    ['.....oPPPo......', '.....oPPPo......', '.....oFFFFo.....'],
    ['.....oPPPPo.....', '....oPpo.oPo....', '...oFFo..oFFo...'],
    ['.....oPPPo......', '....oPpoPPo.....', '...oFFooFFo.....'],
  ],
};

// hair & hats: overlays on rows 0..12. '.' = see-through
const HAIR = {
  short: {
    d: ['................', '.....oooooo.....', '....oHHHHHHo....', '...oHHHHHHLHo...', '..oHHHHHHHHLHo..', '..oHHHHHHHHHHo..', '..oHhHHhhHHhHo..', '..ohh......hho..', '...o........o...'],
    u: ['................', '.....oooooo.....', '....oHHHHHHo....', '...oHHHHHHHHo...', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..ohHHHHHHHHho..', '...ohhhhhhhho...', '....oooooooo....'],
    s: ['................', '.....ooooo......', '....oHHHHHoo....', '...oHHHHHHLHo...', '..oHHHHHHHHHLo..', '..oHHHHHHHHHHo..', '..oHHHHHhhhhho..', '..oHHHHo.....o..', '..ohHHo.........', '...ohho.........', '....oo..........'],
  },
  long: {
    d: ['................', '.....oooooo.....', '....oHHHHHHo....', '...oHHHHHHLHo...', '..oHHHHHHHHLHo..', '..oHHHHHHHHHHo..', '..oHhHHhhHHhHo..', '..oHh......hHo..', '..oHh......hHo..', '..oHh......hHo..', '..oHho....ohHo..', '..ohho....ohho..', '...oo......oo...'],
    u: ['................', '.....oooooo.....', '....oHHHHHHo....', '...oHHHHHHHHo...', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..ohhHHHHHHhho..', '...oooooooooo...'],
    s: ['................', '.....ooooo......', '....oHHHHHoo....', '...oHHHHHHLHo...', '..oHHHHHHHHHLo..', '..oHHHHHHHHHHo..', '..oHHHHHhhhhho..', '..oHHHHo.....o..', '..oHHHHo........', '..oHHHo.........', '..oHHHo.........', '..ohho..........', '...oo...........'],
  },
  bun: {
    d: ['......oooo......', '.....oHHLHo.....', '....oohHHhoo....', '...oHHHHHHLHo...', '..oHHHHHHHHLHo..', '..oHHHHHHHHHHo..', '..oHhHHHHHHhHo..', '..ohh......hho..', '...o........o...'],
    u: ['......oooo......', '.....oHHHHo.....', '....oohHHhoo....', '...oHHHHHHHHo...', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..ohHHHHHHHHho..', '...ohhhhhhhho...', '....oooooooo....'],
    s: ['...oooo.........', '..oHHLHo........', '..ohHHho........', '...ooHHHHoo.....', '..oHHHHHHHLHo...', '..oHHHHHHHHHLo..', '..oHHHHHhhhhho..', '..oHHHHo.....o..', '..ohHHo.........', '...ooo..........'],
  },
  scarf: {
    d: ['................', '.....oooooo.....', '....oHHHHHHo....', '...oHHLHHHHHo...', '..oHHHHHHLHHHo..', '..oHHHHHHHHHHo..', '..oHHhhhhhhHHo..', '..oHh......hHo..', '..oHh......hHo..', '..oHh......hHo..', '..oHHh....hHHo..', '...oHHHhhHHHo...', '....oooHHooo....'],
    u: ['................', '.....oooooo.....', '....oHHHHHHo....', '...oHHHHHHHHo...', '..oHHHHHHLHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..ohHHHHHHHHho..', '...ohhhHHhhho...', '....ooooHHoo....'],
    s: ['................', '.....ooooo......', '....oHHHHHoo....', '...oHHHHHHLHo...', '..oHHHHHHHHHLo..', '..oHHHHHHHHHHo..', '..oHHHHHhhhhHo..', '..oHHHHh....ho..', '..oHHHHh....ho..', '..oHHHHh...hHo..', '..ohHHHHhhhHo...', '...ooohHHho.....', '.......oo.......'],
  },
  cap: {
    d: ['................', '....oooooooo....', '...oHHHHHHHHo...', '..oHHHHLLHHHHo..', '..oHHHHHHHHHHo..', '..ohhhhhhhhhho..', '.oVVVVVVVVVVVVo.', '..oooooooooooo..', '..oh........ho..'],
    u: ['................', '....oooooooo....', '...oHHHHHHHHo...', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..ohhhhhhhhhho..', '..oNNNNNNNNNNo..', '..oNNNNNNNNNNo..', '..ohNNNNNNNNho..', '...ohhNNNNhho...', '....oooooooo....'],
    s: ['................', '....oooooo......', '...oHHHHHHoo....', '..oHHHHHLLHHo...', '..oHHHHHHHHHo...', '..ohhhhhhhhhVVo.', '..oNNNNooooooo..', '..oNNNo.........', '..ohNNo.........', '...ooo..........'],
  },
  spiky: {
    d: ['..o..o.oo.o..o..', '.oHooHoHHoHooHo.', '.oHHoHHHHHHoHHo.', '..oHHHHHHHHHHo..', '..oHHHHHHHHLHo..', '..oHHHHHHHHHHo..', '..oHhHHhhHHhHo..', '..ohh......hho..', '...o........o...'],
    u: ['..o..o.oo.o..o..', '.oHooHoHHoHooHo.', '.oHHoHHHHHHoHHo.', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..oHHHHHHHHHHo..', '..ohHHHHHHHHho..', '...ohhhhhhhho...', '....oooooooo....'],
    s: ['...o..o.o.o.....', '..oHooHoHoHoo...', '..oHHoHHHHHLHo..', '..oHHHHHHHHHLo..', '..oHHHHHHHHHHHo.', '..oHHHHHHHHHHo..', '..oHHHHHhhhhho..', '..oHHHHo.....o..', '..ohHHo.........', '...ohho.........', '....oo..........'],
  },
  bald: {
    d: ['................', '................', '................', '.....oooooo.....', '....oSSSLSSo....', '...ohSSSSSSho...', '..ohhSSSSSShho..', '..ohh......hho..', '...o........o...'],
    u: ['................', '................', '................', '.....oooooo.....', '....oSSSLSSo....', '...oSSSSSSSSo...', '...ohSSSSSSho...', '..ohhhSSSShhho..', '..ohhhhhhhhhho..', '...ohhhhhhhho...', '....oooooooo....'],
    s: ['................', '................', '................', '.....ooooo......', '....oSSSSLoo....', '...oSSSSSSSSo...', '..ohhSSSSSSSo...', '..ohhhSo.....o..', '..ohhho.........', '...ooo..........'],
  },
};
// little extras drawn over the face
const ACC = {
  glasses: { d: [[4, 8, 'G'], [5, 7, 'G'], [6, 8, 'G'], [9, 8, 'G'], [10, 7, 'G'], [11, 8, 'G'], [7, 8, 'G'], [8, 8, 'G'], [4, 9, 'G'], [6, 9, 'G'], [9, 9, 'G'], [11, 9, 'G'], [5, 10, 'G'], [10, 10, 'G']], s: [[9, 8, 'G'], [11, 8, 'G'], [10, 7, 'G'], [9, 9, 'G'], [11, 9, 'G'], [10, 10, 'G'], [8, 8, 'G']] },
  mustache: { d: [[5, 10, 'M'], [6, 10, 'M'], [7, 10, 'M'], [8, 10, 'M'], [9, 10, 'M'], [10, 10, 'M'], [5, 11, 'M'], [10, 11, 'M']], s: [[9, 10, 'M'], [10, 10, 'M'], [11, 10, 'M'], [11, 11, 'M']] },
  beard: { d: [[4, 10, 'M'], [5, 11, 'M'], [6, 11, 'M'], [7, 11, 'M'], [8, 11, 'M'], [9, 11, 'M'], [10, 11, 'M'], [11, 10, 'M'], [6, 12, 'M'], [7, 12, 'M'], [8, 12, 'M'], [9, 12, 'M']], s: [[5, 10, 'M'], [6, 11, 'M'], [7, 11, 'M'], [8, 11, 'M'], [9, 11, 'M'], [10, 11, 'M'], [8, 12, 'M'], [9, 12, 'M']] },
  loupe: { d: [[9, 8, 'G'], [10, 8, 'G'], [11, 8, 'G'], [9, 9, 'G'], [11, 9, 'G'], [10, 10, 'G'], [10, 9, 'W']], s: [[10, 8, 'G'], [11, 8, 'G'], [12, 8, 'G'], [11, 9, 'W'], [12, 9, 'G']] },
};

const SKINS = [
  [C.sk3, C.sk2], [C.sk2, C.sk1], ['#e2a77d', '#bf7f5c'], [C.sk1, C.sk0], ['#8f5a45', '#6e4234'],
];
const HAIRS = [
  ['#3b2a2d', '#2a1d22', '#5a4040'], ['#5c3a2e', '#3e2620', '#7a5040'], ['#a4673a', '#7a4a2a', '#c98a52'],
  ['#e7c36a', '#c49a45', '#f7e0a0'], ['#1f1c2c', '#121019', '#3a3550'], ['#b9b5c6', '#8d889e', '#e2dfe9'], ['#c45a3c', '#93402c', '#e07a55'],
];

function makePerson(o) {
  const skin = o.skin || SKINS[0], hair = o.hair || HAIRS[0];
  const top = o.top || [C.b2, C.b1, C.b3];
  const pants = o.pants || [C.t1, C.t0];
  const shoes = o.shoes || C.k1;
  const style = HAIR[o.style || 'short'];
  const map = {
    o: C.ink, S: skin[0], s: skin[1], e: C.ink, b: o.blush || C.p2,
    H: hair[0], h: hair[1], L: hair[2],
    T: top[0], t: top[1], U: top[2],
    P: pants[0], p: pants[1], F: shoes, G: o.glassCol || C.ink, M: o.beardCol || hair[1], W: C.b4,
    V: o.visor || hair[1], N: o.capBack || hair[1],
  };
  const accs = (o.acc || []).map(a => ACC[a]);
  const frames = {};
  for (const dir of ['d', 'u', 's']) {
    frames[dir] = [0, 1, 2].map(f => {
      const rows = [...BODY['head_' + dir], ...BODY['torso_' + dir], ...BODY['legs_' + dir][f], '................'];
      const cv = sprite(rows, map);
      // hair on top
      const hr = style[dir];
      const hc = sprite(hr, map);
      cv.g.drawImage(hc, 0, 0);
      // accessories (face only when visible)
      if (dir !== 'u') for (const a of accs) for (const [x, y, k] of (a[dir] || [])) px(cv.g, x, y, map[k]);
      if (o.apron && dir !== 'u') { for (let y = 13; y < 17; y++) for (let x = 6; x < 10; x++) px(cv.g, x - (dir === 's' ? 0 : 0), y, o.apron); }
      if (o.tie && dir === 'd') { px(cv.g, 7, 13, o.tie); px(cv.g, 8, 13, o.tie); px(cv.g, 7, 14, o.tie); px(cv.g, 8, 15, o.tie); }
      if (o.scarf && dir !== 'u') { for (let x = 5; x < 11; x++) px(cv.g, x - (dir === 's' ? 1 : 0), 12, o.scarf); if (dir === 'd') { px(cv.g, 9, 13, o.scarf); px(cv.g, 9, 14, o.scarf); } }
      if (o.lanyard && dir === 'd') { px(cv.g, 6, 13, o.lanyard); px(cv.g, 9, 13, o.lanyard); px(cv.g, 7, 14, o.lanyard); px(cv.g, 8, 14, o.lanyard); px(cv.g, 7, 15, C.white); px(cv.g, 8, 15, C.white); }
      return cv;
    });
  }
  frames.l = frames.s.map(flipX);
  frames.r = frames.s;
  return frames;
}

// a few named looks used around the world
const LOOKS = {
  artun: { skin: SKINS[1], hair: HAIRS[0], style: 'short', top: [C.c1, C.c0, C.c2], pants: [C.b0, C.ink2], shoes: C.ink2 },
  teyze: { skin: SKINS[2], hair: [C.p1, C.p0, C.p2], style: 'scarf', top: [C.v2, C.v1, C.v3], pants: [C.v1, C.v0], blush: C.p1 },
  simitci: { skin: SKINS[3], hair: [C.r2, C.r1, C.r3], style: 'cap', top: [C.white, C.t4, C.white], pants: [C.t1, C.t0], acc: ['mustache'], beardCol: '#2a1d22', visor: C.r1, capBack: C.r1 },
  garson: { skin: SKINS[2], hair: HAIRS[4], style: 'short', top: [C.white, C.t4, C.white], pants: [C.ink2, C.ink], acc: ['mustache'], beardCol: '#121019', apron: C.ink2 },
  fisher: { skin: SKINS[3], hair: [C.b1, C.b0, C.b2], style: 'cap', top: [C.y2, C.y1, C.y3], pants: [C.b1, C.b0], acc: ['beard'], beardCol: '#b9b5c6', visor: C.b0, capBack: C.b0 },
  prof: { skin: SKINS[0], hair: HAIRS[5], style: 'short', top: [C.k2, C.k1, C.k3], pants: [C.t1, C.t0], acc: ['glasses'], tie: C.r2 },
  watchmaker: { skin: SKINS[1], hair: HAIRS[5], style: 'bald', top: [C.c1, C.c0, C.c2], pants: [C.ink2, C.ink], acc: ['loupe', 'mustache'], beardCol: '#8d889e', apron: C.c0 },
  bookie: { skin: SKINS[0], hair: [C.k2, C.k1, C.k3], style: 'cap', top: [C.r2, C.r1, C.r3], pants: [C.k1, C.k0], visor: C.k1, capBack: C.k1, acc: ['mustache'], beardCol: '#5a4040' },
  conductor: { skin: SKINS[2], hair: [C.b0, C.ink2, C.b1], style: 'cap', top: [C.b1, C.b0, C.b2], pants: [C.b0, C.ink], visor: C.ink, capBack: C.b0, lanyard: C.y2 },
  guard: { skin: SKINS[1], hair: [C.ink2, C.ink, C.t1], style: 'cap', top: [C.b0, C.ink, C.b1], pants: [C.b0, C.ink], visor: C.ink, capBack: C.ink, acc: ['mustache'], beardCol: '#1f1c2c' },
  student1: { skin: SKINS[0], hair: HAIRS[2], style: 'long', top: [C.p2, C.p1, C.p3], pants: [C.b1, C.b0] },
  student2: { skin: SKINS[3], hair: HAIRS[4], style: 'short', top: [C.y2, C.y1, C.y3], pants: [C.t1, C.t0], acc: ['glasses'] },
  guestA: { skin: SKINS[0], hair: HAIRS[3], style: 'long', top: [C.r2, C.r1, C.r3], pants: [C.ink2, C.ink] },
  guestB: { skin: SKINS[4], hair: HAIRS[4], style: 'short', top: [C.c2, C.c1, C.c3], pants: [C.t1, C.t0], tie: C.y2 },
  guestC: { skin: SKINS[1], hair: HAIRS[6], style: 'bun', top: [C.v2, C.v1, C.v3], pants: [C.v0, C.ink] },
  guestD: { skin: SKINS[2], hair: HAIRS[1], style: 'short', top: [C.g3, C.g2, C.g4], pants: [C.k1, C.k0], acc: ['beard'] },
  comic: { skin: SKINS[1], hair: HAIRS[1], style: 'long', top: [C.ink2, C.ink, C.t1], pants: [C.b0, C.ink] },
  volina: { skin: SKINS[2], hair: HAIRS[4], style: 'long', top: [C.v1, C.v0, C.v2], pants: [C.ink2, C.ink], lanyard: C.p2 },
  tea: { skin: SKINS[0], hair: HAIRS[5], style: 'bun', top: [C.p3, C.p2, C.white], pants: [C.t2, C.t1], acc: ['glasses'] },
  keeper: { skin: SKINS[0], hair: HAIRS[3], style: 'short', top: [C.c3, C.c2, C.c4], pants: [C.k1, C.k0] },
};
// the visitor gets a random look every visit (you can reroll it at the mirror)
function randomLook(seed) {
  const r = mulberry32(seed);
  const tops = [[C.r2, C.r1, C.r3], [C.y2, C.y1, C.y3], [C.p2, C.p1, C.p3], [C.c2, C.c1, C.c3], [C.v2, C.v1, C.v3], [C.b2, C.b1, C.b3], [C.g3, C.g2, C.g4]];
  const pants = [[C.b1, C.b0], [C.t1, C.t0], [C.k2, C.k1], [C.ink2, C.ink], [C.g2, C.g1]];
  return {
    skin: pick(SKINS, r()), hair: pick(HAIRS, r()), style: pick(['short', 'long', 'bun', 'short', 'long'], r()),
    top: pick(tops, r()), pants: pick(pants, r()), shoes: pick([C.k1, C.ink2, C.r1, C.white], r()),
    acc: r() < 0.25 ? ['glasses'] : [],
  };
}

/* ---------- animals ---------- */
const CAT_SIDE = [
  ['..........o...o.', '.........oOo.oOo', '.........oOOOOOo', '.o.......oOeOOeo', 'oOo......oOOnOOo', 'oOo.ooooooOOOOo.', '.oOoOOOOOOOOOo..', '..oOOOOOOOOOOo..', '..oOOOOOOOOOOo..', '..oOoOo..oOoOo..', '..oo.oo..oo.oo..'],
  ['..........o...o.', '.........oOo.oOo', '.........oOOOOOo', '.........oOeOOeo', '.o.......oOOnOOo', 'oOo.ooooooOOOOo.', 'oOooOOOOOOOOOo..', '.ooOOOOOOOOOOo..', '..oOOOOOOOOOOo..', '..ooOo....oOOo..', '...oo......oo...'],
];
const CAT_SIT = ['.o......o...', 'oOo....oOo..', 'oOOooooOOo..', 'oOOOOOOOOo..', 'oOeOOOOeOo..', 'oOOOnnOOOo..', '.oOOOOOOo...', '.oOOOOOOo.o.', 'oOOOOOOOOoOo', 'oOOOOOOOOoOo', 'oOOoOOoOOOo.', '.oo.oo.ooo..'];
const CAT_LOAF = ['..o......o..', '.oOo....oOo.', '.oOOooooOOo.', '.oOOOOOOOOo.', '.oOccOOccOo.', '.oOOOnnOOOo.', 'ooOOOOOOOOoo', 'oOOOOOOOOOOo', 'oOOOOOOOOOOo', '.oooooooooo.'];
function makeCat(fur, furD, eye = C.c2) {
  const map = { o: C.ink, O: fur, e: eye, n: C.p2, c: furD };
  const mapD = { o: C.ink, O: fur, e: eye, n: C.p2, c: C.ink };
  const side = CAT_SIDE.map(r => sprite(r, map));
  // subtle stripes/patches for non-white cats
  const deco = (cv, rows) => { for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (rows[y] && rows[y][x] === 'O' && (x + y * 2) % 5 === 0 && y > 4) px(cv.g, x, y, furD); };
  side.forEach((cv, i) => deco(cv, CAT_SIDE[i]));
  return {
    r: side, l: side.map(flipX),
    sit: sprite(CAT_SIT, map), loaf: sprite(CAT_LOAF, mapD),
  };
}
function makeGull() {
  const map = { o: C.ink, W: C.white, w: C.t4, y: C.y2, g: C.t3 };
  return [
    sprite(['o...........o', 'Wo.........oW', 'gWo.oooo..oWg', '.gWWWWWWWWWg.', '...oWWWWWo...', '....oyyo.....'], map),
    sprite(['.............', '.............', 'oooooooooo...', 'gWWWWWWWWWWoo', '.gwWWWWWWWg.y', '...ooooooo...'], map),
    // standing
    sprite(['...ooo..', '..oWWWo.', '..oWoWyy', '.ooWWWo.', 'oggWWWo.', '.oggWwo.', '..ooyo..', '...y.y..'], map),
  ];
}
function makePigeon() {
  const map = { o: C.ink, G: C.t2, g: C.t1, l: C.t3, p: C.c2, y: C.r3 };
  return [
    sprite(['...oo...', '..oGGo..', '..oGoyy.', '.ooppo..', 'olGGGo..', 'oglGGo..', '.ooooo..', '..y.y...'], map),
    sprite(['........', '...oo...', '..oGGo..', '..oGoyy.', 'oolppo..', 'ogGGGo..', '.ooooo..', '..y.y...'], map),
  ];
}
function makeButterfly(col) {
  const map = { o: C.ink, W: col, w: C.white };
  return [sprite(['oW.Wo', 'WWoWW', '.WoW.', '..o..'], map), sprite(['.....', 'oWoWo', '.WoW.', '..o..'], map)];
}
// Paşa — Artun's dog. drawn with code, then outlined, so his legs can trot and his tail can wag
function makeDog(fur = C.k4, furD = C.k3, ear = C.k2, cream = C.m3) {
  const side = (f) => {
    const cv = canvas(20, 15), g = cv.g;
    // tail (wags)
    const tw = [0, 1, -1][f];
    line(g, 4, 7, 1, 3 + tw, furD); line(g, 4, 6, 2, 3 + tw, fur);
    // legs: back pair, front pair (trot)
    const lg = [[0, 0, 0, 0], [1, -1, -1, 1], [-1, 1, 1, -1]][f];
    for (const [x, o, d] of [[4, lg[0], furD], [6, lg[1], fur], [11, lg[2], furD], [13, lg[3], fur]]) { rect(g, x + o, 10, 2, 3, d); px(g, x + o, 13, ear); px(g, x + o + 1, 13, ear); }
    // body
    rect(g, 3, 5, 12, 6, fur); hl(g, 4, 13, 5, C.k5); rect(g, 5, 10, 8, 1, cream); hl(g, 3, 14, 10, furD);
    // head + snout + floppy ear
    disc(g, 14.5, 4.5, 3.5, fur); rect(g, 16, 4, 3, 3, cream); px(g, 18, 4, C.ink); px(g, 17, 6, C.p1);
    rect(g, 12, 2, 2, 5, ear); px(g, 12, 7, ear); px(g, 15, 3, C.ink); px(g, 14, 2, C.k5);
    // collar with a gold tag — he is, after all, a paşa
    vl(g, 11, 5, 8, C.r2); vl(g, 12, 7, 8, C.r2); px(g, 12, 9, C.y2);
    return outlined(cv, C.ink);
  };
  const sit = (f) => {
    const cv = canvas(16, 16), g = cv.g;
    // tail wagging out to the side
    const tw = f ? 0 : 1;
    line(g, 12, 13, 14, 10 + tw, fur); px(g, 15, 9 + tw, furD);
    // body + chest
    ell(g, 8, 12, 5, 3.5, fur); ell(g, 8, 11, 3, 3, cream); rect(g, 4, 13, 3, 2, fur); rect(g, 9, 13, 3, 2, fur);
    hl(g, 4, 6, 15, cream); hl(g, 9, 11, 15, cream);
    // head
    disc(g, 8, 5.5, 4.5, fur); ell(g, 8, 7.5, 2.6, 2, cream);
    rect(g, 2, 3, 2, 6, ear); rect(g, 12, 3, 2, 6, ear); px(g, 4, 3, ear); px(g, 11, 3, ear);
    px(g, 6, 5, C.ink); px(g, 10, 5, C.ink); px(g, 6, 4, C.k5); px(g, 10, 4, C.k5);
    rect(g, 7, 6, 2, 1, C.ink); px(g, 8, 8, C.p1); px(g, 8, 9, f ? C.p2 : C.p1);
    hl(g, 5, 11, 10, C.r2); px(g, 8, 11, C.y2);
    return outlined(cv, C.ink);
  };
  const r = [side(0), side(1), side(2)];
  return { r, l: r.map(flipX), sit: [sit(0), sit(1)] };
}

// horses are drawn with code so the legs can actually gallop
function makeHorse(coat, coatD, silk) {
  const frames = [];
  for (let f = 0; f < 4; f++) {
    const cv = canvas(26, 22), g = cv.g;
    const ph = f / 4 * Math.PI * 2;
    // legs
    const leg = (x, a, front) => {
      const sw = Math.sin(ph + a) * 3;
      line(g, x, 13, x + Math.round(sw), 19, coatD); line(g, x + 1, 13, x + 1 + Math.round(sw), 19, coatD);
      px(g, x + Math.round(sw), 20, C.ink); px(g, x + 1 + Math.round(sw), 20, C.ink);
    };
    leg(6, 0); leg(9, Math.PI); leg(16, Math.PI * 0.5); leg(19, Math.PI * 1.5);
    // tail
    line(g, 4, 9, 1, 13 + (f % 2), C.k0); line(g, 4, 10, 2, 14 + (f % 2), C.k0);
    // body + neck + head (facing right)
    ell(g, 13, 10, 9, 4.5, C.ink); ell(g, 13, 9.5, 8, 3.6, coat); ell(g, 11, 8.5, 5, 1.5, coatD === C.k1 ? C.k3 : C.t5);
    for (let k = 0; k < 6; k++) rect(g, 18 + k, 7 - k, 3, 4, coat);
    rect(g, 22, 1, 4, 4, coat); px(g, 25, 4, C.ink); px(g, 23, 2, C.ink); px(g, 22, 0, coat); px(g, 22, -1, C.ink);
    line(g, 18, 6, 22, 1, C.ink); hl(g, 22, 25, 0, C.ink); vl(g, 26, 1, 4, C.ink);
    // mane
    for (let k = 0; k < 5; k++) px(g, 18 + k, 5 - k, C.k0);
    // jockey
    rect(g, 11, 2, 5, 4, silk); rect(g, 12, 0, 3, 2, C.sk2); px(g, 12, -1, C.ink); rect(g, 12, -1, 3, 1, silk);
    rect(g, 13, 6, 3, 2, C.white); px(g, 16, 4, C.sk2);
    frames.push(cv);
  }
  return { r: frames, l: frames.map(flipX) };
}

// portrait: the head of a person (front, idle) for dialogue boxes
function portraitOf(frames) {
  const src = frames.d[0];
  const cv = canvas(16, 15);
  cv.g.drawImage(src, 0, 0, 16, 15, 0, 0, 16, 15);
  return cv;
}

// dev sheet hook
window.SHEET = (place) => {
  for (const k of Object.keys(LOOKS)) { const f = makePerson(LOOKS[k]); for (const d of ['d', 's', 'u']) for (const fr of f[d]) place(fr, ''); place(canvas(4, 4), k); }
  for (let i = 0; i < 6; i++) { const f = makePerson(randomLook(i + 1)); place(f.d[0], ''); place(f.s[1], ''); }
  const dog = makeDog(); for (const f of [...dog.r, ...dog.l, ...dog.sit]) place(f, ''); place(canvas(2, 2), 'pasa');
  const cat = makeCat(C.white, C.t4); place(cat.r[0], ''); place(cat.r[1], ''); place(cat.sit, ''); place(cat.loaf, 'cat');
  const cat2 = makeCat(C.y2, C.y1); place(cat2.r[0], ''); place(cat2.sit, 'cat2');
  for (const s of makeGull()) place(s, ''); for (const s of makePigeon()) place(s, '');
  for (const s of makeButterfly(C.p2)) place(s, '');
  const h = makeHorse(C.k2, C.k1, C.r2); for (const fr of h.r) place(fr, 'horse');
  const sp = makePerson(Object.assign({}, LOOKS.artun, { style: 'spiky' })); place(sp.d[0], ''); place(sp.s[0], 'zapped');
};
