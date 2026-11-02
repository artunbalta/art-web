'use strict';
/* =====================================================================
   touch.js — phone controls: a little joystick on the left, an action
   button (A) and a run toggle on the right. The joystick snaps to 8
   directions so movement stays on whole pixels.
   ===================================================================== */

const Pad = (() => {
  const st = { sx: 0, sy: 0, mag: 0, on: false, run: false };
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  let el, joy, knob, aBtn, aLbl, runBtn, pid = null, cx = 0, cy = 0, R = 40;

  function init() {
    el = document.getElementById('pad');
    if (!el) return;
    joy = el.querySelector('.joy'); knob = el.querySelector('.knob');
    aBtn = el.querySelector('[data-act]'); aLbl = aBtn.querySelector('.l'); runBtn = el.querySelector('[data-run]');
    joy.addEventListener('pointerdown', e => {
      e.preventDefault(); SFX.unlock();
      pid = e.pointerId; joy.setPointerCapture(pid);
      const r = joy.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2; R = r.width * 0.34;
      steer(e);
    });
    joy.addEventListener('pointermove', e => { if (e.pointerId === pid) steer(e); });
    const release = e => { if (e.pointerId !== pid) return; pid = null; st.sx = st.sy = st.mag = 0; st.on = false; knob.style.transform = ''; };
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) joy.addEventListener(ev, release);
    aBtn.addEventListener('pointerdown', e => { e.preventDefault(); SFX.unlock(); aBtn.classList.add('down'); Game.action(); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) aBtn.addEventListener(ev, () => aBtn.classList.remove('down'));
    runBtn.addEventListener('pointerdown', e => { e.preventDefault(); st.run = !st.run; runBtn.classList.toggle('on', st.run); SFX.select(); });
  }
  function steer(e) {
    let dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy), k = d > R ? R / d : 1;
    knob.style.transform = `translate(${Math.round(dx * k)}px, ${Math.round(dy * k)}px)`;
    st.mag = Math.min(1, d / R);
    if (st.mag < 0.3) { st.sx = st.sy = 0; st.on = false; return; }
    [st.sx, st.sy] = DIRS[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8];
    st.on = true;
  }
  // called every frame by the game: show/hide, and name the action under your thumb
  let shown = null, label = null;
  function sync(show, lbl) {
    if (!el) return;
    if (show !== shown) { el.classList.toggle('hide', !show); shown = show; if (!show && pid !== null) release(); }
    if (lbl !== label) { aLbl.textContent = lbl || ''; aBtn.classList.toggle('idle', !lbl); label = lbl; }
  }
  function release() { pid = null; st.sx = st.sy = st.mag = 0; st.on = false; if (knob) knob.style.transform = ''; }
  return { init, st, sync };
})();
