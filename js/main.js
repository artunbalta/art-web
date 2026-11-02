'use strict';
/* =====================================================================
   main.js — boot. draws the title logo, wires the buttons, says hi
   to anyone who opens the console.
   ===================================================================== */

(function boot() {
  const $ = s => document.querySelector(s);

  // the title logo: a chunky 6×7 face drawn just for these seven letters
  const LOGO_FONT = {
    A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
    R: ['#####.', '##..##', '##..##', '#####.', '##.##.', '##..##', '##..##'],
    T: ['######', '######', '..##..', '..##..', '..##..', '..##..', '..##..'],
    U: ['##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
    N: ['##..##', '###.##', '######', '##.###', '##..##', '##..##', '##..##'],
    B: ['#####.', '##..##', '##..##', '#####.', '##..##', '##..##', '#####.'],
    L: ['##....', '##....', '##....', '##....', '##....', '##....', '######'],
  };
  function drawLogo() {
    const lines = ['ARTUN', 'BALTA'];
    const S = 5, ext = 3, gap = 1, lh = 7, lgap = 3;
    const w = 5 * 6 + 4 * gap, h = lines.length * lh + (lines.length - 1) * lgap;
    const on = (x, y) => {
      const li = Math.floor(y / (lh + lgap)), ly = y - li * (lh + lgap);
      if (li < 0 || li >= lines.length || ly >= lh || x < 0 || y < 0) return false;
      const ci = Math.floor(x / (6 + gap)), cx = x - ci * (6 + gap);
      const ch = lines[li][ci];
      return !!ch && cx < 6 && LOGO_FONT[ch][ly][cx] === '#';
    };
    const L = $('#logo'), pad = 3;
    L.width = w * S + pad * 2; L.height = h * S + ext + pad * 2;
    const g = L.getContext('2d');
    const block = (col, dy, grow) => { g.fillStyle = col; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (on(x, y)) g.fillRect(pad + x * S - grow, pad + y * S + dy - grow, S + grow * 2, S + grow * 2); };
    for (let k = ext; k > 0; k--) block(k === ext ? C.ink : '#7e3159', k, 3);
    block(C.ink, 0, 3);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!on(x, y)) continue;
      const ly = y % (lh + lgap);
      g.fillStyle = ly < 2 ? C.y4 : ly < 5 ? C.y3 : C.y2;
      g.fillRect(pad + x * S, pad + y * S, S, S);
      if (!on(x, y - 1)) { g.fillStyle = C.white; g.fillRect(pad + x * S, pad + y * S, S, 1); }
      if (!on(x, y + 1)) { g.fillStyle = C.y1; g.fillRect(pad + x * S, pad + y * S + S - 1, S, 1); }
    }
  }

  const help = () => UI.custom({
    kicker: 'How this works', title: 'Walk. Poke. Repeat.', accent: 'teal',
    body: `<dl class="skills">
      <dt>Walk</dt><dd>WASD or arrow keys. Hold Shift to hurry. On a phone: tap where you want to go.</dd>
      <dt>Interact</dt><dd>E, Space or Enter when a little label pops up. Or just tap the thing.</dd>
      <dt>Map</dt><dd>M — fast travel and your secret journal.</dd>
      <dt>In a rush?</dt><dd>The CV button gives you the boring, complete version.</dd>
    </dl>
    <p class="aside">There are ${Object.keys(SECRETS).length} secrets. Some are behind things, some are inside conversations, one is in a bottle.</p>`,
  });

  drawLogo();
  UI.init();
  Game.init();

  $('#title').addEventListener('pointerdown', e => { if (!e.target.closest('button')) { SFX.unlock(); Game.start(); } });
  $('[data-enter]').addEventListener('click', () => { SFX.unlock(); Game.start(); });
  $('[data-cv]').addEventListener('click', () => UI.toggleCV(true));
  $('[data-map]').addEventListener('click', () => UI.toggleMap(true));
  $('[data-journal]').addEventListener('click', () => UI.toggleMap(true));
  $('[data-cvbtn]').addEventListener('click', () => UI.toggleCV(true));
  $('[data-snd]').addEventListener('click', () => UI.setSound(SFX.toggle()));
  $('[data-help]').addEventListener('click', help);

  console.log('%c ARTUN BALTA ', 'background:#22467d;color:#fadb74;font:bold 18px monospace;padding:4px 10px;border:2px solid #2b2135',
    '\nYou opened the console. We’re going to get along.\nEvery pixel here is drawn by code — there isn’t a single image file in this site.\nTry typing “hire” while you walk around. Or ↑ ↑ ↓ ↓ ← → ← → B A.');
})();
