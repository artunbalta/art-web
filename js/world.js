'use strict';
/* =====================================================================
   world.js — the geography. London (west) · the Channel · İstanbul ·
   the Bosphorus · Ankara (east). Coordinates are in tiles (16px).
   ===================================================================== */

const MAP_W = 96, MAP_H = 60;

// named places, used for zone toasts + the map screen
const ZONES = [
  { id: 'imperial', name: L('London · South Kensington', 'Londra · South Kensington'), x0: 2, y0: 2, x1: 18, y1: 19, city: 'london' },
  { id: 'westminster', name: L('London · Clock & Watch', 'Londra · Saat Kulesi'), x0: 18, y0: 2, x1: 27, y1: 19, city: 'london' },
  { id: 'soho', name: L('London · Open Mic Street', 'Londra · Açık Mikrofon Sokağı'), x0: 2, y0: 19, x1: 27, y1: 39, city: 'london' },
  { id: 'hippodrome', name: L('London · The Hippodrome', 'Londra · Hipodrom'), x0: 2, y0: 39, x1: 27, y1: 58, city: 'london' },
  { id: 'channel', name: L('The Channel', 'Manş Denizi'), x0: 27, y0: 0, x1: 38, y1: 60, city: 'sea' },
  { id: 'bogazici', name: L('İstanbul · Boğaziçi Hill', 'İstanbul · Boğaziçi Tepesi'), x0: 38, y0: 2, x1: 57, y1: 13, city: 'istanbul' },
  { id: 'cay', name: L('İstanbul · Tea Garden', 'İstanbul · Çay Bahçesi'), x0: 38, y0: 13, x1: 57, y1: 31, city: 'istanbul' },
  { id: 'station', name: L('İstanbul · Spike Train Station', 'İstanbul · Spike Treni Garı'), x0: 38, y0: 31, x1: 57, y1: 42, city: 'istanbul' },
  { id: 'harbour', name: L('İstanbul · Harbour', 'İstanbul · Liman'), x0: 38, y0: 42, x1: 57, y1: 60, city: 'istanbul' },
  { id: 'bosphorus', name: L('The Bosphorus', 'Boğaz'), x0: 56, y0: 0, x1: 61, y1: 60, city: 'sea' },
  { id: 'hill', name: L('Ankara · School Hill', 'Ankara · Okul Tepesi'), x0: 61, y0: 2, x1: 95, y1: 15, city: 'ankara' },
  { id: 'home', name: L('Ankara · Home', 'Ankara · Ev'), x0: 61, y0: 15, x1: 82, y1: 33, city: 'ankara' },
  { id: 'work', name: L('Ankara · Work Street', 'Ankara · İş Sokağı'), x0: 82, y0: 15, x1: 95, y1: 42, city: 'ankara' },
  { id: 'lab', name: L('Ankara · The Lab Garden', 'Ankara · Lab Bahçesi'), x0: 61, y0: 33, x1: 86, y1: 58, city: 'ankara' },
];
function zoneAt(tx, ty) {
  for (const z of ZONES) if (tx >= z.x0 && tx < z.x1 && ty >= z.y0 && ty < z.y1) return z;
  return null;
}

function buildTerrain() {
  const tr = new Terrain(MAP_W, MAP_H);

  // --- land: rounded boxes + coastal noise ---
  const rr = (x0, y0, x1, y1, r) => (x, y) => {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hx = (x1 - x0) / 2, hy = (y1 - y0) / 2;
    const qx = Math.abs(x - cx) - (hx - r), qy = Math.abs(y - cy) - (hy - r);
    const out = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    return -out;
  };
  const ellS = (cx, cy, rx, ry) => (x, y) => (1 - Math.hypot((x - cx) / rx, (y - cy) / ry)) * Math.min(rx, ry);
  const shapes = [
    rr(2, 3, 27, 58, 5),        // London
    rr(38, 3, 95, 58, 6),       // Türkiye
    ellS(33, 11, 3.2, 2.6),     // a tiny island nobody talks about
    ellS(30.5, 53, 1.8, 1.6),   // lighthouse rock
  ];
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      let d = -99;
      for (const s of shapes) d = Math.max(d, s(x + 0.5, y + 0.5));
      d += (fbm(x * 0.17, y * 0.17, 5) - 0.5) * 3.2;
      tr.set(x, y, d > 0 ? T.GRASS : T.WATER);
    }

  // --- the Bosphorus: a lazy S down the middle of Türkiye ---
  const riverX = y => 58.6 + Math.sin(y * 0.19) * 0.8 + Math.sin(y * 0.071 + 1.3) * 0.5;
  for (let y = 0; y < MAP_H; y++)
    for (let x = 52; x < 64; x++) if (Math.abs(x + 0.5 - riverX(y)) < 2.05) tr.set(x, y, T.WATER);

  // --- sand rims on every coast ---
  const isW = (x, y) => tr.get(x, y) === T.WATER;
  const sandy = [];
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      if (isW(x, y)) continue;
      let near = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (isW(x + dx, y + dy)) near = true;
      if (near) sandy.push([x, y]);
    }
  for (const [x, y] of sandy) tr.set(x, y, T.SAND);
  // wide beaches
  tr.rectLand(39, 52, 55, 57, T.SAND);
  tr.ellipse(47, 51.5, 7, 2.2, T.SAND, true);
  tr.ellipse(33, 11, 2.2, 1.6, T.SAND, true);
  tr.ellipse(33.2, 10.6, 1.2, 0.9, T.GRASS, true);
  tr.ellipse(30.5, 53, 1.2, 1.0, T.SAND, true);

  // --- plateaus (then faces get computed) ---
  tr.hRect(60, 0, 95, 12, 1);   // Ankara: School Hill (coast to coast)
  tr.hRect(36, 0, 59, 10, 1);   // İstanbul: Boğaziçi Hill (sea to river)
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (tr.get(x, y) === T.WATER) tr.hgt[y * MAP_W + x] = 0;
  tr.computeFaces();
  const stairs = [[70, 13], [85, 13], [48, 11]];
  for (const [x, y] of stairs) tr.stairs[y * MAP_W + x] = 1;

  /* ================= ANKARA ================= */
  // School Hill: one long path in front of the schools, stairs down the cliff
  tr.rect(63, 10, 92, 11, T.PATH);
  tr.rect(70, 12, 70, 12, T.PATH); tr.rect(85, 12, 85, 12, T.PATH);
  tr.ellipse(61.8, 6, 1.6, 3.4, T.MEADOW);
  // the avenue under the hill
  tr.rect(62, 15, 93, 16, T.PATH);
  tr.rect(70, 14, 70, 14, T.PATH); tr.rect(85, 14, 85, 14, T.PATH);
  // home + plaza
  tr.rect(66, 17, 67, 23, T.PATH); tr.rect(81, 17, 82, 25, T.PATH);
  tr.rect(66, 24, 80, 30, T.PLAZA);
  tr.ellipse(68.6, 21.2, 1.7, 1.5, T.MEADOW); tr.ellipse(78.8, 21.4, 1.6, 1.4, T.MEADOW);
  tr.rect(61, 27, 65, 28, T.PATH);                     // to the Bosphorus bridge
  tr.rect(81, 26, 93, 27, T.PATH);                     // Work Street
  tr.rect(89, 28, 90, 31, T.PATH);                     // ASELSAN gate
  tr.rect(86, 32, 92, 40, T.PATH);                     // ASELSAN yard
  tr.rect(85, 40, 91, 41, T.PATH);                     // ASELSAN forecourt, off the Lab Garden path
  // the Lab Garden: a loop with a spine
  tr.rect(72, 31, 74, 35, T.PATH);
  tr.rect(64, 36, 84, 37, T.PATH); tr.rect(64, 36, 65, 52, T.PATH); tr.rect(83, 36, 84, 52, T.PATH);
  tr.rect(64, 51, 84, 52, T.PATH); tr.rect(72, 37, 74, 51, T.PATH); tr.rect(72, 53, 74, 55, T.PATH);
  tr.ellipse(68.5, 44, 2.4, 4.6, T.MEADOW); tr.ellipse(78.5, 44, 2.6, 4.6, T.MEADOW);
  tr.rect(85, 44, 86, 45, T.PATH);
  tr.ellipse(89, 51.5, 3.4, 2.4, T.SAND); tr.ellipse(89, 51.6, 2.3, 1.4, T.WATER);
  tr.ellipse(91, 21, 2.2, 1.8, T.MEADOW); tr.ellipse(63.2, 21, 1.4, 2.4, T.MEADOW); tr.ellipse(78, 56, 4, 1.2, T.MEADOW);

  /* ================= İSTANBUL ================= */
  tr.rect(44, 9, 53, 9, T.PATH); tr.rect(48, 10, 48, 10, T.PATH);
  tr.rect(48, 12, 49, 28, T.PATH);
  tr.rect(39, 27, 55, 28, T.PATH);                     // waterfront road from the bridge
  tr.rect(55, 27, 55, 28, T.PATH);
  tr.rect(40, 18, 41, 26, T.PATH);                     // GirVak
  tr.rect(50, 16, 54, 21, T.PLAZA);                    // tea garden floor
  tr.rect(50, 29, 51, 34, T.PATH);                     // round the station to the platform
  tr.rect(39, 35, 55, 36, T.PLATFORM);
  tr.rect(40, 38, 41, 44, T.PATH);                     // down to the harbour
  tr.rectLand(38, 39, 41, 56, T.SAND);
  tr.rect(40, 38, 41, 44, T.PATH);
  tr.rect(33, 45, 41, 46, T.FLOOR);                    // the pier, pointing at London
  tr.ellipse(52, 44, 3, 2, T.MEADOW); tr.ellipse(45, 22.5, 1.6, 1.3, T.MEADOW);

  // the Bosphorus bridge
  tr.rect(56, 27, 61, 28, T.BRIDGE);

  /* ================= LONDON ================= */
  tr.rect(3, 12, 25, 13, T.COBBLE);                    // Exhibition Rd-ish
  tr.rect(16, 3, 17, 34, T.COBBLE);                    // the long road south
  tr.ellipse(9.5, 15.8, 5.6, 2.9, T.MEADOW);           // Imperial lawn (cocktail party)
  tr.rect(3, 19, 25, 20, T.COBBLE);                    // the high street
  tr.rect(12, 21, 13, 25, T.COBBLE);
  tr.rect(3, 26, 25, 27, T.COBBLE);                    // open mic street
  tr.rect(3, 30, 13, 32, T.COBBLE);                    // bus lay-by
  tr.rect(10, 35, 25, 36, T.PLATFORM);
  tr.rect(18, 38, 20, 42, T.COBBLE);
  // hippodrome: an oval track round a grass infield (exact at pixel level)
  const HX = 14 * 16, HY = 49.6 * 16, ORX = 10.4 * 16, ORY = 5.6 * 16, IRX = 7.8 * 16, IRY = 3.2 * 16;
  for (let y = 42; y <= 57; y++)
    for (let x = 3; x <= 25; x++) {
      const r = Math.hypot((x * 16 + 8 - HX) / ORX, (y * 16 + 8 - HY) / ORY);
      const ri = Math.hypot((x * 16 + 8 - HX) / IRX, (y * 16 + 8 - HY) / IRY);
      if (r <= 1.04 && ri > 0.96 && tr.get(x, y) !== T.WATER) tr.set(x, y, T.TRACK);
    }
  tr.override = (px, py) => {
    if (px < 2 * 16 || px > 26 * 16 || py < 41 * 16 || py > 57 * 16) return -1;
    const r = Math.hypot((px - HX) / ORX, (py - HY) / ORY), ri = Math.hypot((px - HX) / IRX, (py - HY) / IRY);
    if (r <= 1 && ri >= 1) return T.TRACK;
    if (r < 1.12 || ri < 1) return T.GRASS;
    return -1;
  };
  tr.hippo = { HX, HY, ORX, ORY, IRX, IRY };

  /* ================= THE SPIKE TRAIN LINE ================= */
  for (let x = 6; x <= 55; x++) {
    const i = 37 * MAP_W + x;
    if (tr.get(x, 37) === T.WATER) tr.overWater[i] = 1;
    tr.set(x, 37, T.RAIL);
  }

  return tr;
}

/* =====================================================================
   populateWorld — every building, prop and person, placed by hand.
   ===================================================================== */
// the ASELSAN gate: a two-tile gap in the fence line (px), closed by a boom until the guard lets you in
const ASELSAN_GATE = { x: 89 * 16, y: Math.round(31.9 * 16), w: 32 };
// the interaction prompt in Turkish (labels are given in English where things are placed)
const LABEL_TR = {
  talk: 'konuş', read: 'oku', enter: 'gir', look: 'bak', pet: 'sev', sit: 'otur', row: 'kürek çek', play: 'oyna', open: 'aç',
  listen: 'dinle', board: 'bin', bet: 'bahse gir', ask: 'sor', wish: 'dilek tut', use: 'kullan', touch: 'dokun', think: 'düşün',
  test: 'test et', 'step closer': 'yaklaş', spin: 'çevir', solve: 'çöz', simit: 'simit al', shake: 'salla', scroll: 'kaydır',
  scan: 'tara', 'say hi': 'selam ver', pull: 'çek', post: 'postala', polish: 'parlat', order: 'sipariş ver', mic: 'sahneye çık',
  mail: 'postaya bak', knock: 'kapıyı çal', heckle: 'laf at', flash: 'yükle', fish: 'balık tut', browse: 'göz at',
  borrow: 'ödünç al', answer: 'telefonu aç',
};
const labelText = s => (LANG === 'tr' && LABEL_TR[s]) || s;
const TRAVEL = [
  { name: L('Home', 'Ev'), x: 73.5, y: 25.6 }, { name: L('School Hill', 'Okul Tepesi'), x: 70, y: 11.6 }, { name: L('Lab Garden', 'Lab Bahçesi'), x: 73.5, y: 36.6 },
  { name: L('Work Street', 'İş Sokağı'), x: 86.5, y: 27.2 }, { name: 'Boğaziçi', x: 48.5, y: 10.4 }, { name: L('Tea Garden', 'Çay Bahçesi'), x: 49, y: 22 },
  { name: L('İstanbul Station', 'İstanbul Garı'), x: 50.5, y: 35.8 }, { name: L('Harbour', 'Liman'), x: 39, y: 45.8 }, { name: L('London Station', 'Londra Garı'), x: 18.5, y: 35.8 },
  { name: 'Imperial', x: 9.4, y: 13.6 }, { name: L('Clock Tower', 'Saat Kulesi'), x: 20.4, y: 13.6 }, { name: L('Open Mic St.', 'Açık Mikrofon'), x: 12.5, y: 27.2 }, { name: L('Hippodrome', 'Hipodrom'), x: 19, y: 41.6 },
];

function populateWorld(W) {
  const E = Eggs;
  const tree = (x, y, kind = 'green', size = 1, seed) => W.prop(kind === 'pine' ? 'pine' : 'tree', x, y, { opts: { kind, size, seed: seed ?? ((x * 7 + y * 13) | 0) } });
  const lamp = (x, y, london) => W.prop('lamp', x, y, { opts: { london }, lightR: 52 });

  /* ---------------- ANKARA · School Hill ---------------- */
  W.building('lycee', 63.5, 10, { act: E.lycee, label: 'enter', id: 'lycee' });
  W.building('bilkent', 75, 10, { act: E.bilkent, label: 'enter', id: 'bilkent' });
  W.building('physics', 87, 10, { act: E.physics, label: 'enter', id: 'physics' });
  W.prop('apple', 86, 9.9, { act: E.apple, label: 'shake', ix: 86 * 16, iy: 9.9 * 16 + 8, id: 'apple' });
  W.prop('chalkboard', 66.5, 12.9, { act: E.msf, label: 'solve', opts: { lines: ['MSF 2021', L('BALL = ?', 'TOP = ?')] } });
  W.prop('bigCheck', 73.6, 12.9, { act: E.check, label: 'read' });
  W.prop('trophy', 77.4, 12.9, { act: E.trophy, label: 'polish' });
  const sc = W.prop('scrollio', 80.2, 12.9, { act: E.scrollio, label: 'scroll', id: 'scrollio' });
  sc.post = (g, x, y, t) => E.drawFeed(g, x + 10, y + 3, 14, 28, t);
  W.npc('student1', 89.4, 12.5, { act: E.student, name: 'Ece', dir: 'r' });
  W.npc('student2', 90.6, 12.5, { act: E.student, name: 'Mert', dir: 'l' });
  for (const [x, y, k] of [[61.3, 3.5, 'pine'], [62.4, 9.6, 'green'], [60.8, 12.2, 'pine'], [73.6, 4.2, 'cherry'], [93.6, 5, 'pine']]) tree(x, y, k, k === 'pine' ? 1 : 0.95);
  W.prop('bush', 72.8, 9.8, { opts: { flowers: C.p2 } }); W.prop('bush', 92.4, 9.8, { opts: { flowers: C.y3 } });
  lamp(68.2, 11.9); lamp(83.6, 11.9);

  /* ---------------- ANKARA · Home ---------------- */
  W.building('home', 71, 24, { act: E.home, label: 'knock', id: 'home' });
  W.building('shed', 77, 24, { act: E.shed, label: 'open', id: 'shed' });
  W.prop('mailbox', 69.6, 24.5, { act: E.mailbox, label: 'mail', id: 'mailbox', post: (g, x, y) => { if (!Game.flag('mailRead')) { rect(g, x + 14, y + 3, 2, 3, C.r2); } } });
  W.prop('mirror', 79.6, 24.7, { act: E.mirror, label: 'look' });
  W.prop('pot', 72.3, 24.4, { opts: { flower: C.p2 } }); W.prop('pot', 74.75, 24.4, { opts: { flower: C.y3 } });
  W.prop('stump', 67.8, 22.4, { opts: { axe: true }, act: E.balta, label: 'pull', id: 'balta' });
  W.prop('fountain', 73.5, 28.7, { act: E.fountain, label: 'wish', ix: 73.5 * 16, iy: 28.9 * 16 + 4, ir: 22 });
  W.prop('bench', 69, 27.6, { label: 'sit' });
  W.prop('bench', 78.2, 27.6, { act: E.bench, label: 'sit', id: 'bench' });
  W.prop('bigsign', 70.2, 31.7, { opts: { lines: L(['HOŞ GELDİN', 'WELCOME TO BALTAKÖY', 'POP. 1 (+YOU)'], ['WELCOME', "BALTAKÖY'E HOŞ GELDİN", 'NÜFUS 1 (+SEN)']) }, act: E.welcome, label: 'read' });
  W.prop('signpost', 77, 31.5, { opts: { lines: [[L('SCHOOL HILL', 'OKUL TEPESİ'), 'u'], [L('ISTANBUL', 'İSTANBUL'), 'l'], [L('WORK ST.', 'İŞ SOKAĞI'), 'r'], [L('LAB GARDEN', 'LAB BAHÇESİ'), 'd']] }, act: E.signpost, label: 'read' });
  lamp(66.4, 24.6); lamp(80.6, 24.6); lamp(66.4, 30.9); lamp(80.6, 30.9);
  W.npc('artun', 76.2, 26.3, { act: E.artun, label: 'talk', dir: 'l', id: 'artun' });
  W.npc('teyze', 69, 29, { act: E.teyze, label: 'talk', id: 'teyze' });
  for (const [x, y, k, s] of [[64.4, 18.4, 'green', 1.05], [69.1, 18.2, 'cherry', 1], [78.2, 18.1, 'green', 0.95], [84.2, 18.6, 'autumn', 1], [63.2, 24, 'green', 1.1], [63.6, 31.5, 'pine', 1], [61.8, 22.8, 'green', 0.9]]) tree(x, y, k, s);
  W.prop('bush', 75.9, 22.2, { opts: { flowers: C.r3 } }); W.prop('hedge', 70.5, 22.6, { opts: { w: 22 } });

  /* ---------------- ANKARA · Work Street ---------------- */
  W.building('volina', 83, 25, { act: E.volina, label: 'enter', id: 'volina' });
  W.prop('voli', 91.6, 25.3, { act: E.voli, label: 'say hi', id: 'voli' });
  W.prop('bench', 88.4, 29.4);
  // ASELSAN compound: the building is the south wall, door facing the public forecourt; the radar yard behind it is the guarded bit
  for (let x = 86; x <= 93; x++) if (x !== 89 && x !== 90) W.prop('chain', x + 0.5, 31.9);
  for (let y = 33.6; y <= 39.6; y += 2) { W.prop('chainV', 85.6, y); W.prop('chainV', 93.4, y); }
  W.prop('chain', 86.1, 39.6); W.prop('chain', 93, 39.6);   // close the slivers either side of the building
  W.building('aselsan', 86.6, 39.6, { act: E.aselsan, label: 'enter', id: 'aselsan' });
  const radar = W.prop('radar', 91.4, 35.2, { act: E.radar, label: 'use', id: 'radar' });
  radar.post = (g, x, y, t) => E.drawRadarDish(g, x + 15, y + 9, t);
  W.npc('guard', 89.5, 31.4, { act: E.guard, label: 'talk', id: 'guard' });
  // the boom across the gate: down, and solid, until the guard has had a word with you
  const gate = ASELSAN_GATE;
  W.addObj({ x: gate.x, y: gate.y, sortY: gate.y, vw: gate.w + 10, vh: 50, dx: 0, dy: -46, draw: E.drawBoom });
  W.stamp(gate.x, gate.y - 3, gate.w, 4);
  W.prop('signpost', 87.6, 30.6, { opts: { lines: [L('RESTRICTED', 'YASAK BÖLGE')] }, act: E.guard, label: 'read' });
  for (const [x, y, k] of [[93.2, 18.6, 'pine'], [92.9, 23, 'green'], [84.5, 31.5, 'green'], [94.2, 29.5, 'pine']]) tree(x, y, k);
  lamp(85.4, 27.9); lamp(92.4, 27.9);

  /* ---------------- ANKARA · Lab Garden ---------------- */
  W.prop('bigsign', 70.6, 34.6, { opts: { lines: L(['THE LAB GARDEN', 'PLEASE TOUCH'], ['LAB BAHÇESİ', 'LÜTFEN DOKUNUN']) }, act: E.labSign, label: 'read' });
  // echo: a doorway at the end of the garden's spine
  const echo = W.prop('echo', 73.5, 55.5, { act: E.echo, label: 'step closer', id: 'echo', iy: 55.5 * 16 + 6 });
  echo.post = (g, x, y, t) => E.drawPortal(g, x + 12, y + 13, 16, 28, t);
  echo.extraTop = 24;
  W.prop('mri', 68.6, 40.7, { act: E.mri, label: 'scan', id: 'mri', ix: 68.6 * 16, iy: 40.7 * 16 + 6 });
  const eeg = W.prop('eeg', 68.6, 46, { act: E.eeg, label: 'think', id: 'eeg' });
  eeg.post = (g, x, y, t) => E.drawEEGScreen(g, x + 19, y + 3, 19, 13, t);
  W.prop('easels', 68.6, 50.2, { act: E.faces, label: 'look' });
  const jt = W.prop('table', 78.5, 41, { opts: { w: 40 }, act: E.jenga, label: 'play', id: 'jenga' });
  jt.post = (g, x, y, t) => E.drawJenga(g, x + 20, y + 4, t);
  jt.extraTop = 64;
  const ft = W.prop('table', 77.2, 46, { opts: { w: 30, top: C.g2, topL: C.g3 }, act: E.fpga, label: 'flash' });
  ft.post = (g, x, y, t) => E.drawFPGA(g, x, y + 4, t);
  const arc = W.prop('arcade', 81.4, 46.2, { act: E.arcade, label: 'play', id: 'arcade' });
  arc.post = (g, x, y, t) => E.drawArcade(g, x + 5, y + 11, t);
  W.prop('xray', 77.6, 50.6, { act: E.xray, label: 'ask' });
  // the Tesla coil, fenced off like it deserves
  const tc = W.prop('tesla', 88.6, 46.4, { act: E.tesla, label: 'touch', id: 'tesla', ir: 22, iy: 46.4 * 16 + 8 });
  tc.post = (g, x, y, t) => E.drawSparks(g, x + 12, y + 8, t);
  tc.extraTop = 24;
  for (const x of [86.6, 87.6, 89.6, 90.6]) W.prop('fence', x, 48.4, { opts: { white: true } });
  W.prop('signpost', 86.4, 44.6, { opts: { lines: L(['DANGER', 'HIGH VOLTAGE'], ['TEHLİKE', 'YÜKSEK GERİLİM']) }, act: E.probe, label: 'read' });
  for (const [x, y, k, s] of [[62.4, 38, 'green', 1], [62.6, 45, 'pine', 1], [62.3, 51.4, 'green', 1], [70.8, 54.6, 'cherry', 1], [76.4, 54.8, 'green', 1], [91.8, 46.6, 'green', 1], [93.2, 51.2, 'pine', 1], [81.6, 55, 'green', 1.1], [66.6, 55.2, 'autumn', 1]]) tree(x, y, k, s);
  for (const [x, y] of [[71.4, 38.8], [75.6, 38.8], [71.4, 49], [75.6, 47.6]]) W.prop('pot', x, y, { opts: { flower: pick([C.p2, C.y3, C.r3, C.b3], hash2(x, y)) } });
  lamp(71.6, 36.0); lamp(75.4, 36.0); lamp(71.6, 50.8); lamp(75.4, 50.8);

  /* ---------------- the Bosphorus ---------------- */
  W.prop('pylon', 56.4, 27.1, { noSolid: true }); W.prop('pylon', 60.6, 27.1, { noSolid: true });
  W.addObj({ x: 56 * 16, y: 27 * 16 + 1, sortY: 27 * 16 + 1, vw: 6 * 16, vh: 70, dx: 0, dy: -70, draw: (g, cx, cy) => E.drawBridgeTop(g, cx, cy) });
  W.addObj({ x: 56 * 16, y: 29 * 16 - 1, sortY: 29 * 16 - 1, vw: 6 * 16, vh: 10, dx: 0, dy: -8, draw: (g, cx, cy) => E.drawBridgeRail(g, cx, cy) });

  /* ---------------- İSTANBUL ---------------- */
  W.building('mimlab', 44, 9, { act: E.mimlab, label: 'enter', id: 'mimlab' });
  const term = W.prop('terminal', 52.6, 9.9, { act: E.nback, label: 'test', id: 'nback' });
  for (const [x, y, k] of [[38.6, 4.5, 'cherry'], [42.2, 8.8, 'cherry'], [54.6, 5.5, 'pine'], [39.4, 9.2, 'green'], [55.2, 9.8, 'cherry']]) tree(x, y, k, 0.95);
  W.building('girvak', 39.5, 18, { act: E.girvak, label: 'enter', id: 'girvak' });
  W.prop('lottery', 46.4, 18.6, { act: E.lottery, label: 'spin', id: 'lottery' });
  W.building('kiosk', 50.5, 16, { act: E.cay, label: 'order' });
  for (const [x, y] of [[51, 18.5], [53.6, 18.5], [51, 20.8], [53.6, 20.8]]) W.prop('teaTable', x, y);
  W.npc('garson', 52.3, 17.3, { act: E.cay, label: 'talk', id: 'garson' });
  W.npc('artun', 49.8, 20.5, { act: E.artunIst, label: 'talk', dir: 'r' });
  W.prop('simitCart', 45.8, 26.2, { act: E.simit, label: 'simit', id: 'simit' });
  W.npc('simitci', 44.2, 26.4, { act: E.simit, label: 'talk', dir: 'r' });
  for (const [x, y, k, s] of [[55, 14.2, 'cherry', 1], [43.6, 13.6, 'green', 1], [38.8, 13.4, 'pine', 1], [55.2, 23.2, 'green', 0.95], [43.8, 22.6, 'cherry', 0.9], [38.8, 23.6, 'green', 1]]) tree(x, y, k, s);
  lamp(47.6, 15.2); lamp(50.0, 26.6); lamp(44.8, 22.0);
  const st = W.building('station', 40, 35, { arg: 'İSTANBUL', act: E.stationInfo, label: 'read', id: 'istStation' });
  st.post = (g, x, y) => E.drawClock(g, x + st.b.c.clock.x, y + st.b.c.clock.y, st.b.c.clock.r, 'Europe/Istanbul');
  W.npc('conductor', 52.2, 35.6, { act: E.conductor, label: 'board', id: 'conductorI' });
  W.prop('platformSign', 54, 35.5, { opts: { text: L('SPIKE TRAIN · 1', 'SPIKE TRENİ · 1') } });
  W.prop('buffer', 55.6, 37.9, { noSolid: true });
  W.prop('bench', 53.4, 34.7);
  // the harbour
  W.npc('fisher', 33.8, 46, { act: E.fish, label: 'fish', dir: 'l', id: 'fisher' });
  const boat = W.prop('rowboat', 34.6, 47.7, { act: E.row, label: 'row', ix: 35.2 * 16, iy: 46.6 * 16, ir: 14, id: 'rowboat' });
  boat.post = null; boat.bob = true;
  W.prop('barrel', 40.7, 44.6); W.prop('crate', 39.2, 44.8);
  for (const [x, y, k] of [[44.5, 40.5, 'green'], [48, 42, 'cherry'], [55, 41.5, 'pine'], [50.8, 47.2, 'green'], [55.4, 47.4, 'green'], [46.2, 47.6, 'pine']]) tree(x, y, k);

  /* ---------------- LONDON ---------------- */
  W.building('queensTower', 3.4, 12, { act: E.queensTower, label: 'look' });
  W.building('imperial', 6, 12, { act: E.imperial, label: 'enter', id: 'imperial' });
  W.npc('prof', 12.6, 13.4, { act: E.prof, label: 'talk', id: 'prof' });
  const party = [['guestA', 7.6, 15.6, 'r'], ['guestB', 9.3, 14.7, 'd'], ['guestC', 11, 15.7, 'l'], ['guestD', 9.2, 16.9, 'u']];
  E.partyGuests = party.map(([k, x, y, d], i) => W.npc(k, x, y, { dir: d, act: E.partyTalk, label: 'listen', partyIndex: i }));
  W.npc('artun', 13.8, 16.6, { act: E.artunLon, label: 'talk', dir: 'l', id: 'artunL' });
  const ct = W.building('clockTower', 18.6, 12, { act: E.clock, label: 'listen', id: 'clock' });
  ct.post = (g, x, y) => E.drawClock(g, x + ct.b.clock.x, y + ct.b.clock.y, ct.b.clock.r);
  W.building('watchShop', 21.5, 12, { act: E.watchShop, label: 'browse', id: 'watch' });
  W.npc('watchmaker', 22.4, 13.1, { act: E.watchmaker, label: 'talk' });
  W.prop('phoneBox', 20.4, 17.7, { act: E.phone, label: 'answer', id: 'phone', ir: 18 });
  W.prop('pillarBox', 23.6, 17.8, { act: E.post, label: 'post' });
  W.prop('bench', 22.4, 15.6);
  const club = W.building('comedy', 3.5, 26, { act: E.comedyClub, label: 'enter', id: 'club' });
  club.post = (g, x, y, t) => E.drawBulbs(g, x, y, club.b, t);
  W.prop('mic', 10.6, 26.9, { act: E.comedy, label: 'mic', id: 'mic' });
  W.npc('comic', 9.6, 26.8, { act: E.comedy, label: 'heckle', dir: 'r' });
  W.building('tearoom', 19, 26, { act: E.tearoom, label: 'enter', id: 'tearoom' });
  W.npc('tea', 23.8, 26.9, { act: E.tearoom, label: 'talk' });
  W.prop('bus', 8, 31.8, { act: E.bus, label: 'read' });
  W.building('londonStation', 18, 35, { act: E.stationInfoL, label: 'read' });
  W.npc('conductor', 16.4, 35.6, { act: E.conductorL, label: 'board', id: 'conductorL' });
  W.prop('umbrellas', 12.4, 35.5, { act: E.umbrella, label: 'borrow' });
  W.prop('buffer', 6.4, 37.9, { noSolid: true });
  W.prop('platformSign', 24, 35.5, { opts: { text: 'LONDON · SPIKE' } });
  W.building('grandstand', 5.6, 43, { act: E.horsesInfo, label: 'read' });
  W.prop('bookie', 20, 42.6, { act: E.bookie, label: 'bet', id: 'bookie' });
  W.npc('bookie', 22.4, 42.9, { act: E.bookie, label: 'bet', dir: 'l' });
  W.prop('finishPost', 16.2, 44.5, { noSolid: true });
  for (const [x, y, k, s] of [[3.2, 16.6, 'plane', 1.1], [14.8, 18.1, 'plane', 1], [25.3, 16.5, 'plane', 1], [3.4, 23.6, 'plane', 1], [25.2, 23.6, 'plane', 1], [3.2, 34.4, 'plane', 1.05], [24.8, 40.4, 'plane', 1], [10.5, 40.6, 'plane', 1], [4.5, 40.2, 'pine', 1]]) tree(x, y, k, s);
  for (const [x, y] of [[4.6, 18.6], [15.2, 13.9], [21.4, 18.6], [11.4, 25.4], [18.4, 25.4], [15, 30.8], [22.2, 30.8], [14.6, 34.4]]) lamp(x, y, true);

  /* ---------------- the sea ---------------- */
  W.prop('lighthouse', 30.6, 53.6, { lightR: 70, act: E.lighthouse, label: 'look', ix: 30.6 * 16, iy: 53.6 * 16 + 4 });
  W.prop('tree', 33.2, 10.9, { opts: { kind: 'green', size: 0.8, seed: 99 } });
  W.prop('bottle', 34.4, 11.9, { act: E.bottle, label: 'open', id: 'bottle' });

  E.populate(W);
}
