'use strict';
/* =====================================================================
   game.js — the engine. camera, collision, entities, input (keys +
   tap-to-walk with pathfinding), day/night, London's rain, particles.
   ===================================================================== */

const Game = (() => {
  const G = {
    t: 0, dt: 0, scale: 3, vw: 400, vh: 240,
    cam: { x: 0, y: 0 }, objects: [], entities: [], inter: [], particles: [], decals: [], bubbles: [],
    keys: {}, mode: 'title', lockN: 0, flags: store.get('flags', {}),
    found: new Set(store.get('secrets', [])), timeShift: 0,
    touch: matchMedia('(hover: none)').matches || 'ontouchstart' in window, shake: 0, flash: 0, rain: [],
  };
  let cv, ctx, lightCv;

  /* ================= setup ================= */
  function init() {
    cv = document.getElementById('game'); ctx = cv.getContext('2d');
    lightCv = canvas(8, 8);
    G.tr = buildTerrain();
    G.ground = renderGround(G.tr);
    buildCollision();
    G.player = new Person(randomLook(store.get('lookSeed', (Math.random() * 1e9) | 0)), 73.5 * TILE, 25.4 * TILE, { speed: 60 });
    G.player.isPlayer = true;
    G.entities.push(G.player);
    populateWorld(api);
    resize();
    addEventListener('resize', resize);
    bindInput();
    Pad.init();
    if (G.touch) document.body.classList.add('touch');
    // start the camera somewhere pretty for the title screen
    G.cam.x = 64 * TILE; G.cam.y = 14 * TILE;
    UI.secrets(G.found.size, Object.keys(SECRETS).length);
    UI.setSound(SFX.muted);
    requestAnimationFrame(loop);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cw = innerWidth, ch = innerHeight;
    const short = Math.min(cw, ch) * dpr;
    const want = Math.min(cw, ch) < 600 ? 15 * TILE : 17 * TILE; // phones see a bit more of the world, so walking doesn't feel like sprinting
    G.scale = Math.max(1, Math.round(short / want));
    G.vw = Math.ceil(cw * dpr / G.scale); G.vh = Math.ceil(ch * dpr / G.scale);
    cv.width = G.vw + 1; cv.height = G.vh + 1;
    cv.style.width = ((G.vw + 1) * G.scale / dpr) + 'px'; cv.style.height = ((G.vh + 1) * G.scale / dpr) + 'px';
    ctx.imageSmoothingEnabled = false;
    lightCv.width = G.vw + 1; lightCv.height = G.vh + 1;
    G.dpr = dpr;
  }

  /* ================= collision ================= */
  const CW = MAP_W * 2, CH = MAP_H * 2;
  const solid = new Uint8Array(CW * CH);
  function buildCollision() {
    const tr = G.tr;
    for (let ty = 0; ty < MAP_H; ty++)
      for (let tx = 0; tx < MAP_W; tx++) {
        const i = ty * MAP_W + tx;
        const block = tr.t[i] === T.WATER || tr.overWater[i] || (tr.face[i] && !tr.stairs[i]);
        if (block) for (let k = 0; k < 4; k++) solid[(ty * 2 + (k >> 1)) * CW + tx * 2 + (k & 1)] = 1;
      }
    // sand right at the waterline is mostly foam — keep feet out of the sea
    for (let cy = 0; cy < CH; cy++) for (let cx = 0; cx < CW; cx++) {
      if (cx === 0 || cy === 0 || cx === CW - 1 || cy === CH - 1) solid[cy * CW + cx] = 1;
    }
  }
  function stamp(x, y, w, h, v = 1) {
    const x0 = Math.floor(x / 8), y0 = Math.floor(y / 8), x1 = Math.floor((x + w - 1) / 8), y1 = Math.floor((y + h - 1) / 8);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) if (cx >= 0 && cy >= 0 && cx < CW && cy < CH) solid[cy * CW + cx] = v;
  }
  const cellSolid = (cx, cy) => cx < 0 || cy < 0 || cx >= CW || cy >= CH || solid[cy * CW + cx] === 1;
  const pxSolid = (x, y) => cellSolid(Math.floor(x / 8), Math.floor(y / 8));
  function free(e, x, y) {
    const l = x - 4, r = x + 3, t = y - 3, b = y + 1;
    if (pxSolid(l, t) || pxSolid(r, t) || pxSolid(l, b) || pxSolid(r, b)) return false;
    for (const o of G.entities) {
      if (o === e || !o.blocks || o.hidden) continue;
      if (Math.abs(o.x - x) < 9 && Math.abs(o.y - y) < 5) return false;
    }
    return true;
  }

  /* ================= people ================= */
  class Person {
    constructor(look, x, y, o = {}) {
      this.look = look; this.frames = makePerson(look);
      this.x = x; this.y = y; this.dir = o.dir || 'd'; this.speed = o.speed || 44;
      this.moving = false; this.anim = 0; this.blocks = true; this.path = null;
      Object.assign(this, o);
    }
    setLook(look) { this.look = look; this.frames = makePerson(look); }
    face(tx, ty) {
      const dx = tx - this.x, dy = ty - this.y;
      this.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'l' : 'r') : (dy < 0 ? 'u' : 'd');
    }
    move(dx, dy) {
      let moved = false;
      if (dx) {
        if (free(this, this.x + dx, this.y)) { this.x += dx; moved = true; }
        else for (const n of [1, 2, 3, 4]) {
          if (free(this, this.x + dx, this.y - n) && free(this, this.x, this.y - 1)) { this.y -= 1; moved = true; break; }
          if (free(this, this.x + dx, this.y + n) && free(this, this.x, this.y + 1)) { this.y += 1; moved = true; break; }
        }
      }
      if (dy) {
        if (free(this, this.x, this.y + dy)) { this.y += dy; moved = true; }
        else for (const n of [1, 2, 3, 4]) {
          if (free(this, this.x - n, this.y + dy) && free(this, this.x - 1, this.y)) { this.x -= 1; moved = true; break; }
          if (free(this, this.x + n, this.y + dy) && free(this, this.x + 1, this.y)) { this.x += 1; moved = true; break; }
        }
      }
      return moved;
    }
    update(dt) {
      if (this.path && this.path.length) {
        // walk the path one whole pixel at a time (both axes together on diagonals), never on fractions
        this.stepAcc = (this.stepAcc || 0) + this.curSpeed() * dt;
        let n = 0;
        while (this.stepAcc >= 1 && this.path.length && n++ < 8) {
          this.stepAcc -= 1;
          const [wx, wy] = this.path[0];
          const ddx = wx - this.x, ddy = wy - this.y;
          this.dir = Math.abs(ddx) >= Math.abs(ddy) && ddx ? (ddx < 0 ? 'l' : 'r') : ddy ? (ddy < 0 ? 'u' : 'd') : this.dir;
          this.x += Math.sign(ddx); this.y += Math.sign(ddy);
          if (this.x === wx && this.y === wy) this.path.shift();
        }
        this.moving = true;
        if (!this.path.length) { this.path = null; this.moving = false; this.stepAcc = 0; if (this.onArrive) { const f = this.onArrive; this.onArrive = null; f(); } }
      }
      if (this.moving) this.anim += dt * (this.curSpeed() / 9);
      else this.anim = 0;
    }
    curSpeed() { return this.speed * (this.boost && G.t < this.boost ? 2 : 1) * (this.running || this.padRun ? 2 : 1); }
    frame() {
      if (!this.moving) return 0;
      const f = Math.floor(this.anim) % 4;
      return f === 1 ? 1 : f === 3 ? 2 : 0;
    }
    draw(g, cx, cy) {
      if (this.hidden) return;
      const f = this.frame();
      const img = this.frames[this.dir][f];
      const bob = f ? -1 : 0;
      g.drawImage(img, Math.round(this.x - 8 - cx), Math.round(this.y - 18 - cy + bob));
      if (this.hat) this.hat(g, Math.round(this.x - cx), Math.round(this.y - 18 - cy + bob), this.dir);
      if (this.carry) g.drawImage(this.carry, Math.round(this.x - cx + (this.dir === 'l' ? -9 : 3)), Math.round(this.y - cy - 9 + bob));
      if (this.umbrella) drawUmbrella(g, Math.round(this.x - cx), Math.round(this.y - cy - 26 + bob));
    }
  }
  function drawUmbrella(g, x, y) {
    ell(g, x, y + 3, 11, 5, C.ink); ell(g, x, y + 3, 10, 4, C.r2); ell(g, x - 3, y + 2, 5, 2, C.r3);
    rect(g, x - 10, y + 4, 21, 2, C.ink); vl(g, x, y + 6, y + 14, C.ink); px(g, x, y - 2, C.ink);
  }

  /* ================= api for world + eggs ================= */
  function addObj(o) {
    o.sortY = o.sortY ?? o.y;
    G.objects.push(o);
    for (const s of o.solids || []) stamp(...s);
    if (o.act) addInter({ x: o.ix ?? o.x, y: o.iy ?? o.y + 6, r: o.ir || 18, label: o.label || 'look', fn: o.act, obj: o, id: o.id });
    return o;
  }
  function addInter(it) { G.inter.push(it); return it; }
  function building(key, tx, groundRow, o = {}) {
    const b = BUILD[key](o.arg);
    const x = Math.round(tx * TILE), y = groundRow * TILE;
    const obj = addObj(Object.assign({
      kind: 'building', x, y, img: b.img, dx: -b.ox, dy: -b.gy, b,
      solids: [[x, y - b.depth, b.w, b.depth]],
      ix: x + b.door.x + b.door.w / 2, iy: y + 6, ir: 16, label: o.label || 'enter',
      windows: b.lights.map(l => [x - b.ox + l.x, y - b.gy + l.y, l.w, l.h]),
    }, o));
    return obj;
  }
  function prop(key, tx, ty, o = {}) {
    const p = PROPS[key](o.opts || {});
    const x = Math.round(tx * TILE), y = Math.round(ty * TILE);
    const solids = [];
    if (p.solid && !o.noSolid) solids.push([x - p.solid[0] / 2, y - p.solid[1] + 1, p.solid[0], p.solid[1]]);
    if (p.solids && !o.noSolid) for (const s of p.solids) solids.push([x + s[0] - s[2] / 2, y + s[1] - s[3] + 1, s[2], s[3]]);
    return addObj(Object.assign({ kind: 'prop', x, y, img: p.img, frames: p.frames, fps: p.fps, dx: -p.ox, dy: -p.gy, p, solids, shadow: p.shadow, light: p.light ? [x - p.ox + p.light[0], y - p.gy + p.light[1]] : null }, o));
  }
  function npc(look, tx, ty, o = {}) {
    const p = new Person(LOOKS[look] || look, tx * TILE, ty * TILE, Object.assign({ dir: 'd' }, o));
    p.npc = true; p.home = { x: p.x, y: p.y };
    G.entities.push(p);
    stamp(p.x - 4, p.y - 3, 8, 5);
    if (o.act) addInter({ ent: p, r: 18, label: o.label || 'talk', fn: o.act, id: o.id });
    return p;
  }
  function entity(e) { G.entities.push(e); return e; }
  function speaker(p, name, color, voice = 0) { return { name, color, voice, portrait: p ? portraitOf(p.frames) : null }; }

  /* ================= secrets & flags ================= */
  function secret(id) {
    if (!SECRETS[id] || G.found.has(id)) return false;
    G.found.add(id); store.set('secrets', [...G.found]);
    Eggs.observe('secret');
    const n = G.found.size, total = Object.keys(SECRETS).length;
    UI.secrets(n, total);
    UI.toast(`<b>✦ Secret</b> ${SECRETS[id]} <i>${n}/${total}</i>`);
    SFX.secret();
    burst(G.player.x, G.player.y - 20, 14, [C.y3, C.white, C.p2]);
    if (n === total) setTimeout(() => Eggs.allFound(), 1800);
    return true;
  }
  const flag = (k, v) => { if (v === undefined) return G.flags[k]; G.flags[k] = v; store.set('flags', G.flags); return v; };

  /* ================= particles ================= */
  function particle(p) { G.particles.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 1, age: 0, size: 1, col: C.white }, p)); }
  function burst(x, y, n, cols, spd = 40) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = spd * (0.4 + Math.random()); particle({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, g: 60, life: 0.6 + Math.random() * 0.6, col: pick(cols), size: Math.random() < 0.3 ? 2 : 1 }); } }
  function heart(x, y) { particle({ x, y, vy: -18, life: 1.3, kind: 'heart' }); }
  function bubble(ent, text, ms = 2500) { G.bubbles = G.bubbles.filter(b => b.ent !== ent); G.bubbles.push({ ent, text, until: G.t + ms / 1000 }); }

  /* ================= input ================= */
  const seq = [];
  function bindInput() {
    addEventListener('keydown', e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && !e.target.closest('input,textarea')) e.preventDefault();
      seq.push(e.key); if (seq.length > 16) seq.shift();
      Eggs.onKeys(seq);
      SFX.unlock();
      if (UI.cvOpen) { if (k === 'Escape') UI.toggleCV(false); return; }
      if (G.mode === 'title') { if (!e.metaKey && !e.ctrlKey && !e.altKey && k !== 'Tab') start(); return; }
      if (G.mode === 'starting') return;
      if (UI.mapOpen) { if (k === 'Escape' || k === 'm') UI.toggleMap(false); return; }
      if (UI.panelOpen) { if (k === 'Escape' || (k === 'e' && !G.panelKeys)) UI.closePanel(); if (G.panelKeys) G.panelKeys(e); return; }
      if (UI.talking) {
        if (UI.choosing && (k === 'ArrowUp' || k === 'w')) UI.moveChoice(-1);
        else if (UI.choosing && (k === 'ArrowDown' || k === 's')) UI.moveChoice(1);
        else if (k === 'e' || k === ' ' || k === 'Enter') UI.advance();
        else if (k === 'Escape' && !UI.choosing) UI.advance();
        return;
      }
      if (G.lockN > 0) { if (G.cutKey) G.cutKey(k); return; }
      G.keys[k] = true;
      if (k === 'e' || k === ' ' || k === 'Enter') interact();
      if (k === 'm') UI.toggleMap(true);
      if (k === 'Shift') G.player.running = true;
    });
    addEventListener('keyup', e => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      G.keys[k] = false;
      if (k === 'Shift') G.player.running = false;
    });
    addEventListener('blur', () => { G.keys = {}; G.player.running = false; });
    cv.addEventListener('pointerdown', e => {
      SFX.unlock();
      if (e.pointerType === 'touch' && !G.touch) { G.touch = true; document.body.classList.add('touch'); }
      if (G.mode === 'title') { start(); return; }
      if (G.mode === 'starting') return;
      if (UI.busy || G.lockN > 0) { if (G.lockN > 0 && G.cutTap) G.cutTap(); return; }
      const wx = (e.clientX * G.dpr) / G.scale + G.cam.x, wy = (e.clientY * G.dpr) / G.scale + G.cam.y;
      tapAt(wx, wy);
    });
  }
  function tapAt(wx, wy) {
    // tapped something interactive?
    let best = null, bd = 1e9;
    for (const it of G.inter) {
      const p = interPos(it);
      if (it.hidden) continue;
      let d = Math.hypot(p.x - wx, p.y - wy);
      const o = it.obj;
      if (o && o.img) {
        const x0 = o.x + o.dx, y0 = o.y + o.dy;
        if (wx >= x0 && wx < x0 + o.img.width && wy >= y0 && wy < y0 + o.img.height) d = Math.min(d, 10);
      }
      if (it.ent && Math.abs(it.ent.x - wx) < 10 && wy > it.ent.y - 22 && wy < it.ent.y + 3) d = 0;
      if (d < 22 && d < bd) { bd = d; best = it; }
    }
    if (best) {
      const p = interPos(best);
      const near = Math.hypot(p.x - G.player.x, p.y - G.player.y) < best.r + 4;
      if (near) { G.player.face(p.x, p.y); runInter(best); return; }
      if (walkTo(p.x, p.y, () => { G.player.face(p.x, p.y); if (Math.hypot(p.x - G.player.x, p.y - G.player.y) < best.r + 10) runInter(best); })) return;
    }
    walkTo(wx, wy);
    G.tapMark = { x: wx, y: wy, t: G.t };
  }

  /* ================= pathfinding (BFS on 8px cells) ================= */
  function walkTo(wx, wy, then) {
    const sx = Math.floor(G.player.x / 8), sy = Math.floor(G.player.y / 8);
    let tx = Math.floor(wx / 8), ty = Math.floor(wy / 8);
    if (cellSolid(tx, ty)) {
      // nearest free cell around the target
      let found = null;
      for (let r = 1; r < 6 && !found; r++)
        for (let dy = -r; dy <= r && !found; dy++) for (let dx = -r; dx <= r && !found; dx++)
          if (!cellSolid(tx + dx, ty + dy)) found = [tx + dx, ty + dy];
      if (!found) return false;
      [tx, ty] = found;
    }
    const prev = new Int32Array(CW * CH).fill(-1);
    const q = new Int32Array(CW * CH); let qh = 0, qt = 0;
    const s = sy * CW + sx, goal = ty * CW + tx;
    prev[s] = s; q[qt++] = s;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    let ok = false, n = 0;
    while (qh < qt && n++ < 60000) {
      const c = q[qh++]; if (c === goal) { ok = true; break; }
      const cx = c % CW, cy = (c / CW) | 0;
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (cellSolid(nx, ny)) continue;
        if (dx && dy && (cellSolid(cx + dx, cy) || cellSolid(cx, cy + dy))) continue;
        const ni = ny * CW + nx;
        if (prev[ni] !== -1) continue;
        prev[ni] = c; q[qt++] = ni;
      }
    }
    if (!ok) return false;
    const cells = [];
    for (let c = goal; c !== s; c = prev[c]) cells.push(c);
    cells.reverse();
    // drop collinear points
    const pts = [];
    let lastD = null;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i], p = i ? cells[i - 1] : s;
      const d = (c % CW - p % CW) + ',' + (((c / CW) | 0) - ((p / CW) | 0));
      if (d === lastD) pts.pop();
      pts.push([(c % CW) * 8 + 4, ((c / CW) | 0) * 8 + 5]);
      lastD = d;
    }
    G.player.path = pts;
    G.player.onArrive = then || null;
    if (!pts.length && then) then();
    return true;
  }

  /* ================= interaction ================= */
  function interPos(it) { return it.ent ? { x: it.ent.x, y: it.ent.y } : { x: it.x, y: it.y }; }
  function nearest() {
    const p = G.player;
    const fx = p.x + (p.dir === 'l' ? -9 : p.dir === 'r' ? 9 : 0), fy = p.y + (p.dir === 'u' ? -10 : p.dir === 'd' ? 7 : -2);
    let best = null, bd = 1e9;
    for (const it of G.inter) {
      if (it.hidden) continue;
      const q = interPos(it);
      const d = Math.min(Math.hypot(q.x - fx, q.y - fy), Math.hypot(q.x - p.x, q.y - p.y) + 6);
      if (d < it.r && d < bd) { bd = d; best = it; }
    }
    return best;
  }
  let interBusy = false;
  function interact() { const it = nearest(); if (it) runInter(it); }
  // the A button: advance a conversation if one is open, otherwise use whatever is in front of you
  function action() {
    if (G.mode !== 'play') return;
    if (UI.talking) { UI.advance(); return; }
    if (UI.busy || G.lockN > 0) return;
    interact();
  }
  async function runInter(it) {
    if (interBusy) return;
    interBusy = true;
    G.player.path = null; G.player.moving = false;
    Eggs.observe(it.label === 'pet' ? 'pet' : it.ent ? 'talk' : ['enter', 'read', 'open', 'browse', 'mail', 'look', 'knock'].includes(it.label) ? 'read' : 'play');
    if (it.ent) { if (it.ent.face) it.ent.face(G.player.x, G.player.y); G.player.face(it.ent.x, it.ent.y); G.bubbles = G.bubbles.filter(b => b.ent !== it.ent); }
    try { await it.fn(it); } catch (e) { console.error(e); }
    UI.endDlg();
    interBusy = false;
  }

  /* ================= cutscene helpers ================= */
  const lock = () => { G.lockN++; G.player.path = null; G.player.moving = false; G.keys = {}; };
  const unlock = () => { G.lockN = Math.max(0, G.lockN - 1); };
  const wait = s => new Promise(r => setTimeout(r, s * 1000));
  function fade(on) {
    const f = document.getElementById('fade');
    f.classList.toggle('on', on);
    return wait(0.45);
  }

  /* ================= main loop ================= */
  let last = performance.now();
  function loop(now) {
    G.dt = clamp((now - last) / 1000, 0, 0.05); last = now; G.t += G.dt;
    try { update(G.dt); render(); }
    catch (e) { if (!G.errLogged) { G.errLogged = true; console.error(e); } }
    requestAnimationFrame(loop);
  }
  async function start() {
    if (G.mode !== 'title') return;
    G.mode = 'starting';
    SFX.unlock(); SFX.musicStart();
    await fade(true);
    G.mode = 'play';
    document.body.classList.add('playing');
    G.cam.x = clamp(Math.round(G.player.x) - (G.vw >> 1), 0, MAP_W * TILE - G.vw); G.cam.y = clamp(Math.round(G.player.y - 12) - (G.vh >> 1), 0, MAP_H * TILE - G.vh);
    await wait(0.05); fade(false);
    setTimeout(() => Eggs.intro(), 700);
  }

  function update(dt) {
    const p = G.player;
    if (G.mode === 'title') {
      // a slow, steady drift around İstanbul, wide enough to show Ankara and London over time
      const fx = 50 * TILE + Math.sin(G.t * 0.021) * 26 * TILE, fy = 25 * TILE + Math.sin(G.t * 0.033 + 0.6) * 9 * TILE;
      G.cam.x = clamp(fx - G.vw / 2, 0, MAP_W * TILE - G.vw); G.cam.y = clamp(fy - G.vh / 2, 0, MAP_H * TILE - G.vh);
    } else {
      // movement
      // the player always stands on whole pixels (teleports can land on fractions)
      if (p.x % 1 || p.y % 1) { p.x = Math.round(p.x); p.y = Math.round(p.y); }
      p.padRun = Pad.st.run;
      if (!UI.busy && G.lockN === 0 && !interBusy) {
        let sx = 0, sy = 0;
        const K = G.keys;
        if (K.ArrowLeft || K.a) sx -= 1; if (K.ArrowRight || K.d) sx += 1;
        if (K.ArrowUp || K.w) sy -= 1; if (K.ArrowDown || K.s) sy += 1;
        if (Pad.st.on) { sx = Pad.st.sx; sy = Pad.st.sy; } // running only with the RUN button, never by pushing harder
        if (sx || sy) {
          p.path = null; p.onArrive = null;
          p.dir = sx < 0 ? 'l' : sx > 0 ? 'r' : sy < 0 ? 'u' : 'd';
          // one accumulator for both axes: diagonals step x and y on the same frame, so nothing shimmers
          p.stepAcc = (p.stepAcc || 0) + p.curSpeed() * dt;
          let n = 0;
          while (p.stepAcc >= 1 && n++ < 8) { p.stepAcc -= 1; if (sx) p.move(sx, 0); if (sy) p.move(0, sy); }
          p.moving = true;
        } else if (!p.path) { p.moving = false; p.stepAcc = 0; }
      }
      if (!(UI.busy || G.lockN > 0) || p.path) p.update(dt);
      // camera: whole pixels, locked to you (or to the train / the race), gliding only across big gaps
      const fx = G.camFocus ? G.camFocus.x : p.x, fy = G.camFocus ? G.camFocus.y : p.y - 12;
      const tx = clamp(Math.round(fx) - (G.vw >> 1), 0, MAP_W * TILE - G.vw), ty = clamp(Math.round(fy) - (G.vh >> 1), 0, MAP_H * TILE - G.vh);
      const ddx = tx - G.cam.x, ddy = ty - G.cam.y;
      if (Math.abs(ddx) <= 3 && Math.abs(ddy) <= 3) { G.cam.x = tx; G.cam.y = ty; }
      else { const k = 1 - Math.pow(0.002, dt); G.cam.x += ddx * k; G.cam.y += ddy * k; }
      // zone label
      const z = zoneAt(Math.floor(p.x / TILE), Math.floor(p.y / TILE));
      if (z) { UI.zone(z.name, z.city); if (z.id !== G.zoneId) { if (G.zoneId) Eggs.observe('zone'); G.zoneId = z.id; } }
      // what echo pays attention to: how far you walk, when you linger, when you hurry
      if (p.moving) { G.idleT = 0; G.idleSent = false; } else if (!UI.busy) { G.idleT = (G.idleT || 0) + dt; if (G.idleT > 8 && !G.idleSent) { G.idleSent = true; Eggs.observe('idle'); } }
      if (p.running && p.moving) { G.runT = (G.runT || 0) + dt; if (G.runT > 1.5 && !G.runSent) { G.runSent = true; Eggs.observe('run'); } } else { G.runT = 0; G.runSent = false; }
      Eggs.track(G.t, p);
      // footsteps & footprints
      if (p.moving) {
        p.stepT = (p.stepT || 0) + dt * p.curSpeed();
        if (p.stepT > 11) {
          p.stepT = 0;
          G.walkAcc = (G.walkAcc || 0) + 11; if (G.walkAcc > 240) { G.walkAcc = 0; Eggs.observe('walk'); }
          const t = groundAt(p.x, p.y);
          if (t === T.SAND) G.decals.push({ x: p.x + (p.foot = -p.foot || 2) , y: p.y, t: G.t, kind: 'print' });
          if (G.t - (p.lastStepSnd || 0) > 0.28) { SFX.step(t === T.BRIDGE || t === T.FLOOR ? 'wood' : t === T.COBBLE || t === T.PLAZA || t === T.PLATFORM ? 'stone' : 'soft'); p.lastStepSnd = G.t; }
          if (p.x < 27 * TILE && (t === T.COBBLE || t === T.PLATFORM) && Math.random() < 0.5) particle({ x: p.x, y: p.y, vy: -14, vx: (Math.random() - 0.5) * 20, g: 80, life: 0.3, col: C.w5 });
        }
      }
    }
    // everything else
    for (const e of G.entities) if (e !== p && e.update) e.update(dt);
    for (const o of G.objects) if (o.update) o.update(dt);
    // particles
    for (const q of G.particles) { q.age += dt; q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    G.particles = G.particles.filter(q => q.age < q.life);
    G.decals = G.decals.filter(d => G.t - d.t < 7);
    G.bubbles = G.bubbles.filter(b => b.until > G.t);
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 12);
    if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * 3);
    if (G.touch) {
      const canAct = G.mode === 'play' && !UI.busy && G.lockN === 0 && !interBusy;
      const it = canAct && !G.player.path ? nearest() : null;
      Pad.sync(canAct, it ? (it.label || 'use').toUpperCase() : null);
    }
    updateRain(dt);
    Eggs.tick(dt);
  }
  function groundAt(x, y) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= G.ground.W || y >= G.ground.H) return T.WATER;
    return G.ground.pt[y * G.ground.W + x];
  }
  function nearWater(x, y, r = 22) {
    for (let a = 0; a < 8; a++) { const xx = x + Math.cos(a * 0.785) * r, yy = y + Math.sin(a * 0.785) * r; if (groundAt(xx, yy) === T.WATER) return true; }
    return false;
  }

  /* ================= London rain ================= */
  const LONDON_X = 27 * TILE;
  function updateRain(dt) {
    const inLondon = G.cam.x < LONDON_X;
    const want = inLondon ? Math.round(G.vw * G.vh / 900) : 0;
    while (G.rain.length < want) G.rain.push({ x: G.cam.x + Math.random() * (G.vw + 40), y: G.cam.y + Math.random() * G.vh, s: 150 + Math.random() * 60, l: 3 + (Math.random() * 3 | 0) });
    if (G.rain.length > want) G.rain.length = want;
    for (const r of G.rain) {
      r.y += r.s * dt; r.x -= r.s * 0.25 * dt;
      if (r.y > G.cam.y + G.vh || r.x < G.cam.x - 10) {
        if (r.x < LONDON_X && groundAt(r.x, r.y) !== T.WATER && Math.random() < 0.5) G.decals.push({ x: r.x, y: r.y, t: G.t, kind: 'drop' });
        r.x = G.cam.x + Math.random() * (G.vw + 60); r.y = G.cam.y - Math.random() * 30;
      }
    }
    if (G.mode === 'play') SFX.rain(inLondon && G.player.x < LONDON_X + 6 * TILE, G.player.x < LONDON_X ? 1 : 0.4);
  }

  /* ================= day & night ================= */
  function dayPhase() {
    const d = new Date();
    const h = ((d.getHours() + d.getMinutes() / 60 + G.timeShift) % 24 + 24) % 24;
    // dark: how much night; warm: golden-hour tint
    let dark = 0, warm = 0;
    if (h < 5) dark = 0.52;
    else if (h < 6.5) dark = lerp(0.52, 0.1, (h - 5) / 1.5), warm = 0.12;
    else if (h < 8) dark = lerp(0.1, 0, (h - 6.5) / 1.5), warm = 0.1;
    else if (h < 17) dark = 0;
    else if (h < 19) warm = (h - 17) / 2 * 0.22, dark = (h - 17) / 2 * 0.12;
    else if (h < 21) dark = lerp(0.12, 0.52, (h - 19) / 2), warm = 0.22 * (1 - (h - 19) / 2);
    else dark = 0.52;
    return { h, dark, warm, lamps: dark > 0.18 };
  }

  /* ================= rendering ================= */
  function render() {
    const W = G.vw + 1, H = G.vh + 1;
    let cx = Math.round(G.cam.x), cy = Math.round(G.cam.y), ox = 0, oy = 0;
    if (G.mode === 'title') {
      cx = Math.floor(G.cam.x); cy = Math.floor(G.cam.y);
      ox = Math.round((G.cam.x - cx) * G.scale); oy = Math.round((G.cam.y - cy) * G.scale);
      if (ox >= G.scale) { cx++; ox = 0; } if (oy >= G.scale) { cy++; oy = 0; }
    }
    const tf = ox || oy ? `translate(${-ox / G.dpr}px, ${-oy / G.dpr}px)` : '';
    if (tf !== G.tf) { cv.style.transform = tf; G.tf = tf; }
    if (G.shake) { cx += Math.round((Math.random() - 0.5) * G.shake * 2); cy += Math.round((Math.random() - 0.5) * G.shake * 2); }
    G.cx = cx; G.cy = cy;
    ctx.fillStyle = C.w1; ctx.fillRect(0, 0, W, H);
    // ground + water shimmer
    const sx = Math.max(0, cx), sy = Math.max(0, cy);
    const sw = Math.min(W, G.ground.W - sx), sh = Math.min(H, G.ground.H - sy);
    ctx.drawImage(G.ground.canvas, sx, sy, sw, sh, sx - cx, sy - cy, sw, sh);
    const wf = [0, 1, 2, 1][Math.floor(G.t * 2.2) % 4];
    ctx.drawImage(G.ground.water[wf], sx, sy, sw, sh, sx - cx, sy - cy, sw, sh);
    drawSparkles(cx, cy);
    // decals
    for (const d of G.decals) {
      const a = 1 - (G.t - d.t) / 7;
      if (d.kind === 'print') { ctx.globalAlpha = a * 0.5; rect(ctx, d.x - cx, d.y - cy, 2, 1, C.s0); ctx.globalAlpha = 1; }
      else if (d.kind === 'drop' && G.t - d.t < 0.35) { const r = (G.t - d.t) * 14; ctx.globalAlpha = 0.6; ctx.strokeStyle = C.w5; ctx.strokeRect(Math.round(d.x - cx - r), Math.round(d.y - cy - r / 3), Math.round(r * 2), Math.max(1, Math.round(r * 0.6))); ctx.globalAlpha = 1; }
    }
    if (G.tapMark && G.t - G.tapMark.t < 0.5) { const k = (G.t - G.tapMark.t) * 2; ctx.globalAlpha = 1 - k; ell(ctx, G.tapMark.x - cx, G.tapMark.y - cy, 3 + k * 5, 1.5 + k * 2, C.white); ctx.globalAlpha = 1; }
    // draw list
    const list = [];
    const vis = (x0, y0, w, h) => x0 + w >= cx && y0 + h >= cy && x0 <= cx + W && y0 <= cy + H;
    for (const o of G.objects) {
      if (o.hidden) continue;
      const im = o.img || (o.frames && o.frames[0]);
      const w = o.vw || (im ? im.width : 32), h = o.vh || (im ? im.height : 32);
      const et = o.extraTop || 0;
      if (vis(o.x + (o.dx || 0), o.y + (o.dy || 0) - et, w, h + 8 + et)) list.push(o);
    }
    for (const e of G.entities) if (!e.hidden && vis(e.x - 40, e.y - 60, 80, 70)) list.push(e);
    list.sort((a, b) => (a.sortY ?? a.y) - (b.sortY ?? b.y));
    // shadows first
    ctx.globalAlpha = 0.22;
    for (const o of list) {
      if (o.shadow) ell(ctx, o.x - cx, o.y - cy + 0.5, o.shadow[0], o.shadow[1], C.ink);
      else if (o instanceof Person || o.shadowR) ell(ctx, o.x - cx, o.y - cy + 0.5, o.shadowR || 5, 2, C.ink);
    }
    ctx.globalAlpha = 1;
    for (const o of list) {
      if (o.draw && !(o instanceof Person)) o.draw(ctx, cx, cy, G.t);
      else if (o instanceof Person) o.draw(ctx, cx, cy);
      else {
        const im = o.frames ? o.frames[Math.floor(G.t * (o.fps || 4)) % o.frames.length] : o.img;
        ctx.drawImage(im, Math.round(o.x + o.dx - cx), Math.round(o.y + o.dy - cy));
        if (o.post) o.post(ctx, Math.round(o.x + o.dx - cx), Math.round(o.y + o.dy - cy), G.t);
      }
    }
    // particles
    for (const q of G.particles) {
      const x = Math.round(q.x - cx), y = Math.round(q.y - cy);
      if (q.kind === 'heart') { ctx.globalAlpha = 1 - q.age / q.life; text(ctx, '♥', x - 2, y, C.p1); ctx.globalAlpha = 1; }
      else if (q.kind === 'smoke') { ctx.globalAlpha = 0.5 * (1 - q.age / q.life); disc(ctx, x, y, 1.5 + q.age * 2.2, q.col); ctx.globalAlpha = 1; }
      else if (q.kind === 'text') { ctx.globalAlpha = 1 - q.age / q.life; textCenter(ctx, q.text, x, y, q.col, C.ink); ctx.globalAlpha = 1; }
      else rect(ctx, x, y, q.size, q.size, q.col);
    }
    // rain + London gloom
    if (G.cam.x < LONDON_X) {
      const edge = LONDON_X - cx;
      ctx.fillStyle = 'rgba(70,80,130,0.13)'; ctx.fillRect(0, 0, Math.min(W, edge), H);
      for (let i = 0; i < 24; i++) { ctx.globalAlpha = 0.13 * (1 - i / 24); ctx.fillRect(edge + i, 0, 1, H); }
      ctx.globalAlpha = 0.65;
      for (const r of G.rain) { if (r.x > LONDON_X) continue; ctx.fillStyle = C.w5; ctx.fillRect(Math.round(r.x - cx), Math.round(r.y - cy), 1, r.l); }
      ctx.globalAlpha = 1;
    }
    drawLighting(cx, cy);
    // overhead: bubbles + prompt
    for (const b of G.bubbles) { const bx = b.ent.x - cx, by = b.ent.y - cy; if (bx > -20 && bx < W + 20 && by > 10 && by < H + 20) drawBubble(bx, by - 24, b.text); }
    Eggs.overlay && Eggs.overlay(ctx, cx, cy, G.t);
    if (G.mode === 'play' && !UI.busy && G.lockN === 0 && !interBusy && !G.player.path) {
      const it = nearest();
      if (it) drawPrompt(it, cx, cy);
    }
    if (G.flash) { ctx.globalAlpha = G.flash; ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  }

  // tiny water glints
  const sparkles = [];
  function drawSparkles(cx, cy) {
    if (!sparkles.length) {
      const r = mulberry32(7);
      for (let i = 0; i < 700; i++) { const x = r() * G.ground.W, y = r() * G.ground.H; if (groundAt(x, y) === T.WATER && G.ground.wd[(y | 0) * G.ground.W + (x | 0)] > 10) sparkles.push([x | 0, y | 0, r() * 6]); }
    }
    for (const [x, y, ph] of sparkles) {
      if (x < cx || y < cy || x > cx + G.vw || y > cy + G.vh) continue;
      const k = (G.t * 0.9 + ph) % 6;
      if (k < 0.35) { px(ctx, x - cx, y - cy, C.white); px(ctx, x - cx - 1, y - cy, C.w5); px(ctx, x - cx + 1, y - cy, C.w5); }
      else if (k < 0.7) px(ctx, x - cx, y - cy, C.w5);
    }
  }

  function drawPrompt(it, cx, cy) {
    const p = interPos(it);
    const obj = it.obj;
    let x = Math.round(p.x - cx), y = Math.round(p.y - cy - 30);
    if (it.ent) y = Math.round(it.ent.y - cy - 30);
    else if (obj && obj.promptY != null) y = Math.round(obj.y + obj.promptY - cy);
    y += Math.round(Math.sin(G.t * 5) * 1);
    const key = G.touch ? '' : 'E';
    const label = (it.label || '').toUpperCase();
    const lw = textWidth(label);
    const w = (key ? 9 : 0) + lw + 6;
    const x0 = x - (w >> 1);
    rect(ctx, x0, y, w, 11, C.ink); rect(ctx, x0 + 1, y + 1, w - 2, 9, C.white); rect(ctx, x0 + 1, y + 9, w - 2, 1, C.t4);
    if (key) { rect(ctx, x0 + 2, y + 2, 7, 7, C.ink); text(ctx, key, x0 + 4, y + 3, C.y3); }
    text(ctx, label, x0 + (key ? 11 : 3), y + 3, C.ink);
    px(ctx, x, y + 11, C.ink); px(ctx, x - 1, y + 11, C.ink); px(ctx, x, y + 12, C.ink);
  }
  function drawBubble(x, y, s) {
    const lines = wrapText(s, 120);
    const w = Math.max(...lines.map(textWidth)) + 6, h = lines.length * 7 + 4;
    let x0 = Math.round(x - w / 2), y0 = Math.round(y - h);
    x0 = clamp(x0, 2, G.vw - w - 2); y0 = Math.max(2, y0);
    rect(ctx, x0, y0, w, h, C.ink); rect(ctx, x0 + 1, y0 + 1, w - 2, h - 2, C.white);
    lines.forEach((l, i) => text(ctx, l, x0 + 3, y0 + 3 + i * 7, C.ink));
    const tx = clamp(Math.round(x), x0 + 3, x0 + w - 4);
    rect(ctx, tx - 1, y0 + h - 1, 3, 1, C.white); px(ctx, tx, y0 + h, C.ink); px(ctx, tx - 1, y0 + h - 1, C.ink); px(ctx, tx + 1, y0 + h - 1, C.ink);
    px(ctx, tx, y0 + h - 1, C.white);
  }
  function wrapText(s, maxW) {
    const words = s.split(' '), out = [];
    let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (textWidth(t) > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur);
    return out;
  }

  function drawLighting(cx, cy) {
    const ph = dayPhase();
    G.phase = ph;
    if (ph.warm > 0) { ctx.fillStyle = `rgba(255,150,80,${ph.warm * 0.55})`; ctx.fillRect(0, 0, G.vw + 1, G.vh + 1); }
    if (ph.dark <= 0.01) return;
    // windows glow
    for (const o of G.objects) if (o.windows) for (const [x, y, w, h] of o.windows) {
      if (x + w < cx || y + h < cy || x > cx + G.vw || y > cy + G.vh) continue;
      ctx.fillStyle = C.y3; ctx.globalAlpha = Math.min(1, ph.dark * 1.6); ctx.fillRect(x - cx, y - cy, w, h); ctx.globalAlpha = 1;
    }
    const lg = lightCv.g;
    lg.globalCompositeOperation = 'source-over';
    lg.clearRect(0, 0, G.vw + 1, G.vh + 1);
    lg.fillStyle = `rgba(18,16,48,${ph.dark})`; lg.fillRect(0, 0, G.vw + 1, G.vh + 1);
    lg.globalCompositeOperation = 'destination-out';
    const lights = [];
    for (const o of G.objects) {
      if (o.light && !o.hidden) lights.push([o.light[0], o.light[1], o.lightR || 46]);
      if (o.windows) for (const [x, y, w, h] of o.windows) lights.push([x + w / 2, y + h / 2, 16 + w * 0.4]);
    }
    lights.push([G.player.x, G.player.y - 10, 30]);
    for (const q of G.particles) if (q.glow) lights.push([q.x, q.y, 8]);
    for (const [x, y, r] of lights) {
      const X = x - cx, Y = y - cy;
      if (X < -r || Y < -r || X > G.vw + r || Y > G.vh + r) continue;
      const gr = lg.createRadialGradient(X, Y, 0, X, Y, r);
      gr.addColorStop(0, 'rgba(0,0,0,0.95)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      lg.fillStyle = gr; lg.beginPath(); lg.arc(X, Y, r, 0, Math.PI * 2); lg.fill();
    }
    ctx.drawImage(lightCv, 0, 0);
    // warm halos
    ctx.globalCompositeOperation = 'lighter';
    for (const o of G.objects) if (o.light && !o.hidden) {
      const X = o.light[0] - cx, Y = o.light[1] - cy;
      if (X < -40 || Y < -40 || X > G.vw + 40 || Y > G.vh + 40) continue;
      const gr = ctx.createRadialGradient(X, Y, 0, X, Y, 22);
      gr.addColorStop(0, `rgba(255,200,110,${0.35 * ph.dark})`); gr.addColorStop(1, 'rgba(255,200,110,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(X, Y, 22, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    // fireflies in Ankara + İstanbul
    if (ph.dark > 0.3) for (let i = 0; i < 26; i++) {
      const fx = (hash2(i, 1, 9) * 70 + 26) * TILE + Math.sin(G.t * 0.7 + i) * 20, fy = (hash2(i, 2, 9) * 50 + 6) * TILE + Math.cos(G.t * 0.9 + i * 2) * 14;
      if ((G.t * 0.8 + i) % 3 < 1.8) { px(ctx, fx - cx, fy - cy, C.y4); ctx.globalAlpha = 0.4; px(ctx, fx - cx + 1, fy - cy, C.y3); px(ctx, fx - cx - 1, fy - cy, C.y3); ctx.globalAlpha = 1; }
    }
  }

  /* ================= map ================= */
  let mapImg = null;
  function drawMap(c) {
    const s = 4;
    if (!mapImg) {
      mapImg = canvas(G.ground.W / s, G.ground.H / s);
      mapImg.g.imageSmoothingEnabled = true;
      mapImg.g.drawImage(G.ground.canvas, 0, 0, mapImg.width, mapImg.height);
      for (const o of G.objects) if (o.kind === 'building') {
        const x = (o.x + o.dx) / s, y = (o.y + o.dy) / s;
        mapImg.g.drawImage(o.img, x, y, o.img.width / s, o.img.height / s);
      }
    }
    c.width = mapImg.width; c.height = mapImg.height;
    const g = c.getContext('2d');
    g.drawImage(mapImg, 0, 0);
    // you are here
    const x = G.player.x / s, y = G.player.y / s;
    g.fillStyle = C.ink; g.fillRect(x - 3, y - 3, 7, 7); g.fillStyle = C.r3; g.fillRect(x - 2, y - 2, 5, 5); g.fillStyle = C.white; g.fillRect(x - 1, y - 1, 2, 2);
    // labels
    const L = document.querySelector('#map .labels');
    L.innerHTML = '';
    for (const pl of TRAVEL) {
      const b = document.createElement('button');
      b.className = 'pin'; b.textContent = pl.name;
      b.style.left = (pl.x * TILE / G.ground.W * 100) + '%'; b.style.top = (pl.y * TILE / G.ground.H * 100) + '%';
      b.addEventListener('click', () => travel(pl));
      L.appendChild(b);
    }
  }
  async function travel(pl) {
    UI.toggleMap(false); Eggs.observe('travel');
    lock(); await fade(true);
    G.player.x = pl.x * TILE; G.player.y = pl.y * TILE; G.player.dir = 'd'; G.player.path = null;
    if (Eggs.follower) { Eggs.follower.x = G.player.x + 12; Eggs.follower.y = G.player.y; }
    G.player.x = Math.round(G.player.x); G.player.y = Math.round(G.player.y);
    G.cam.x = clamp(G.player.x - (G.vw >> 1), 0, MAP_W * TILE - G.vw); G.cam.y = clamp(G.player.y - 12 - (G.vh >> 1), 0, MAP_H * TILE - G.vh);
    await wait(0.15); await fade(false); unlock();
    if (pl.x < 27 && !flag('trainHint')) { flag('trainHint', 1); UI.toast('Fast travel works. The <b>spike train</b> is more fun, though.'); }
  }

  const api = {
    G, init, start, Person, building, prop, npc, entity, addObj, addInter, speaker, secret, flag, particle, burst, heart, bubble,
    lock, unlock, wait, fade, walkTo, stamp, nearWater, groundAt, drawMap, travel, free, action,
    get player() { return G.player; }, get t() { return G.t; }, found: () => G.found,
    setTimeShift(h) { G.timeShift = h; }, get phase() { return G.phase || dayPhase(); },
  };
  return api;
})();
