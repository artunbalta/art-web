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

  const help = () => UI.custom(L({
    kicker: 'How this works', title: 'Walk. Poke. Repeat.', accent: 'teal',
    body: `<dl class="skills">
      <dt>Walk</dt><dd>WASD or arrow keys. Hold Shift to hurry. On a phone: tap where you want to go.</dd>
      <dt>Interact</dt><dd>E, Space or Enter when a little label pops up. Or just tap the thing.</dd>
      <dt>Map</dt><dd>M — fast travel and your secret journal.</dd>
      <dt>In a rush?</dt><dd>The CV button gives you the boring, complete version.</dd>
    </dl>
    <p class="aside">There are ${Object.keys(SECRETS).length} secrets. Some are behind things, some are inside conversations, one is in a bottle.</p>`,
  }, {
    kicker: 'Nasıl oynanır', title: 'Yürü. Dürt. Tekrarla.', accent: 'teal',
    body: `<dl class="skills">
      <dt>Yürü</dt><dd>WASD ya da ok tuşları. Acelen varsa Shift’e basılı tut. Telefonda: gitmek istediğin yere dokun.</dd>
      <dt>Etkileşim</dt><dd>Küçük bir etiket belirince E, Boşluk ya da Enter. Ya da o şeye dokunuver.</dd>
      <dt>Harita</dt><dd>M: hızlı seyahat ve sır defterin.</dd>
      <dt>Acelen mi var?</dt><dd>CV düğmesi sıkıcı ama eksiksiz hali veriyor.</dd>
    </dl>
    <p class="aside">Toplam ${Object.keys(SECRETS).length} sır var. Kimi bir şeylerin arkasında, kimi bir sohbetin içinde, biri de bir şişede.</p>`,
  }));

  // the static page text, in Turkish if that's the language (the Turkish sits next to the English in data-tr attributes)
  if (LANG === 'tr') {
    document.documentElement.lang = 'tr';
    for (const e of document.querySelectorAll('[data-tr]')) e.innerHTML = e.dataset.tr;
    for (const e of document.querySelectorAll('[data-tr-title]')) e.title = e.dataset.trTitle;
    for (const e of document.querySelectorAll('[data-tr-aria]')) e.setAttribute('aria-label', e.dataset.trAria);
  }

  // the language switch: two flags, drawn a pixel at a time like everything else
  const AY_YILDIZ = [   // the crescent and star, 24×16, # = white
    '', '', '',
    '.....###', '...####', '..###........#', '..##........####', '..##.......####', '..##.......####', '..##........####',
    '..###........#', '...####', '.....###',
  ];
  function drawFlag(cv, kind) {
    const W = 24, H = 16; cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let col;
      if (kind === 'tr') col = (AY_YILDIZ[y] || '')[x] === '#' ? '#fff' : '#e30a17';
      else {
        const u = x + 0.5, v = y + 0.5;
        const d = Math.min(Math.abs(H * u - W * v), Math.abs(H * u + W * v - W * H)) / Math.hypot(W, H);
        const cx = Math.abs(u - W / 2), cy = Math.abs(v - H / 2);
        col = cx < 2 || cy < 2 ? '#c8102e' : cx < 3 || cy < 3 ? '#fff' : d < 0.45 ? '#c8102e' : d < 1.6 ? '#fff' : '#012169';
      }
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
  }
  // picking the other language reloads the page in it (?lang=tr), and puts you back where you stood
  function setLang(l) {
    if (l === LANG) return;
    try { if (Game.G.mode === 'play') sessionStorage.setItem('artun.resume', JSON.stringify({ x: Game.player.x, y: Game.player.y, dir: Game.player.dir, touch: !!Game.G.touch })); } catch (e) { /* no storage: the title screen it is */ }
    const u = new URL(location.href);
    if (l === 'tr') u.searchParams.set('lang', 'tr'); else u.searchParams.delete('lang');
    location.replace(u.href);
  }
  const langBox = $('#lang');
  for (const b of langBox.querySelectorAll('button')) {
    drawFlag(b.querySelector('canvas'), b.dataset.lang);
    b.classList.toggle('on', b.dataset.lang === LANG);
    b.setAttribute('aria-pressed', String(b.dataset.lang === LANG));
    b.addEventListener('click', () => setLang(b.dataset.lang));
  }
  // the HUD sits just left of the flags
  const fitLang = () => document.documentElement.style.setProperty('--langw', langBox.offsetWidth + 'px');

  drawLogo();
  // blow the logo up by a whole number of device pixels, so every pixel is the same size (no shimmer)
  function fitLogo() {
    const L = $('#logo'), dpr = window.devicePixelRatio || 1;
    const k = Math.max(1, Math.floor(Math.min(innerWidth * 0.8, 540) * dpr / L.width));
    L.style.width = (L.width * k / dpr) + 'px';
    L.style.setProperty('--lp', (k / dpr) + 'px');
  }
  fitLogo(); addEventListener('resize', fitLogo);
  fitLang(); addEventListener('resize', fitLang);
  // show the title text only once its fonts are in, so nothing jumps when they arrive
  const ready = () => document.body.classList.add('ready');
  addEventListener('load', () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(ready));
  setTimeout(ready, 2000);
  UI.init();
  Game.init();
  // back from a language switch?
  try {
    const st = JSON.parse(sessionStorage.getItem('artun.resume') || 'null');
    sessionStorage.removeItem('artun.resume');
    if (st) Game.resume(st);
  } catch (e) { /* fine: the title screen */ }

  $('#title').addEventListener('pointerdown', e => { if (!e.target.closest('button')) { SFX.unlock(); Game.start(); } });
  $('[data-enter]').addEventListener('click', () => { SFX.unlock(); Game.start(); });
  $('[data-cv]').addEventListener('click', () => UI.toggleCV(true));
  $('[data-map]').addEventListener('click', () => UI.toggleMap(true));
  $('[data-journal]').addEventListener('click', () => UI.toggleMap(true));
  $('[data-cvbtn]').addEventListener('click', () => UI.toggleCV(true));
  $('[data-snd]').addEventListener('click', () => UI.setSound(SFX.toggle()));
  $('[data-help]').addEventListener('click', help);

  console.log('%c ARTUN BALTA ', 'background:#22467d;color:#fadb74;font:bold 18px monospace;padding:4px 10px;border:2px solid #2b2135',
    L('\nYou opened the console. We’re going to get along.\nEvery pixel here is drawn by code — there isn’t a single image file in this site.\nTry typing “hire” while you walk around. Or ↑ ↑ ↓ ↓ ← → ← → B A.',
      '\nKonsolu açtın. Seninle iyi anlaşacağız.\nBuradaki her piksel kodla çizildi; sitede tek bir görsel dosyası yok.\nGezinirken “hire” yazmayı dene. Ya da ↑ ↑ ↓ ↓ ← → ← → B A.'));
})();
