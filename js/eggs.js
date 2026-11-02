'use strict';
/* =====================================================================
   eggs.js — what happens when you poke things. Every place has a
   story, most have a toy. Minigames: brain scan, mind reader, Jenga,
   reaction time, 2-back, radar sweep, horse race, the Spike Train.
   ===================================================================== */

const Eggs = (() => {
  const E = {};
  const say = (...a) => UI.say(...a), choose = (...a) => UI.choose(...a);
  const NAR = { name: '', voice: 2 };
  const SP = {};                      // speakers, filled in populate()
  const total = () => Object.keys(SECRETS).length;
  const P = () => Game.player;
  const secret = id => Game.secret(id);
  const html = (s) => { const d = document.createElement('div'); d.innerHTML = s; return d; };

  const ICON = {
    simit: sprite(['.oooo.', 'oyYYyo', 'oY..Yo', 'oY..Yo', 'oyYYyo', '.oooo.'], { o: C.y0, Y: C.y1, y: C.s3 }),
    borek: sprite(['.oooooo.', 'oYyYyYYo', 'oYYYYYYo', '.oooooo.'], { o: C.y0, Y: C.y2, y: C.y4 }),
  };

  /* ================= people ================= */
  E.intro = async () => {
    const back = Game.flag('met');
    UI.toast(Game.G.touch ? 'Tap to walk · tap things to use them' : '<b>WASD</b> / arrows to walk · <b>E</b> to interact · <b>M</b> for the map', 6500);
    if (!back) setTimeout(() => Game.bubble(E.artunEnt, 'HEY! OVER HERE!', 3500), 900);
    else setTimeout(() => UI.toast(`Welcome back. <b>✦ ${Game.found().size}/${total()}</b> secrets so far.`), 7000);
  };
  E.artun = async () => {
    const s = SP.artun;
    if (!Game.flag('met')) {
      Game.flag('met', 1);
      await say(s, ['Oh — a visitor! Hi. I’m Artun.', 'This is my little world. Everything in it is something I’ve done… or something I would absolutely do.', 'Walk around. Poke things. Most things poke back.',
        `In a hurry? There’s a CV button up top. Not in a hurry? There are ${total()} secrets hidden around here. No pressure. (Some pressure.)`]);
    }
    const c = await choose(s, pick(['Need anything?', 'Hm?', 'What’s up?']), ['Who are you, really?', 'What are you working on?', 'Give me a hint', 'Bye!']);
    if (c === 0) await say(s, ['An electrical engineer who wandered into neuroscience and never found the exit.', 'I decode signals from brains — EEG, ECoG, single neurons — and build machine learning for data that’s noisy on purpose.', 'On the side, I co-founded volina. — voice agents that call people back. Politely.']);
    else if (c === 1) await say(s, ['An MRes in Neurotechnology at Imperial: auditory attention decoding. Which voice is a brain listening to — one neuron at a time.', 'And for fun: echo, an open world that learns who you are from how you play. There’s a doorway to it at the bottom of the Lab Garden.', 'Take the Spike Train from İstanbul and I’ll show you London. I’ll meet you there. Don’t ask how.']);
    else if (c === 2) await say(s, [nextHint()]);
    else await say(s, ['Have fun. Mind the Tesla coil.']);
  };
  let hintI = store.get('hintI', 0);
  function nextHint() { const h = HINTS[hintI % HINTS.length]; hintI++; store.set('hintI', hintI); return h; }
  E.artunIst = async () => {
    await say(SP.artun, ['Of course I’m at the tea garden. Where else would I be?', 'Boğaziçi is up the hill — I did EEG workload research at MIMLAB. There’s a test at the terminal. It’s humbling.']);
  };
  E.artunLon = async () => {
    if (!Game.flag('lonMet')) { Game.flag('lonMet', 1); await say(SP.artun, ['How did I get here before you? I took an earlier spike.', 'Neurons do it all the time.']); }
    const c = await choose(SP.artun, 'Welcome to South Kensington. It’s raining. It’s always raining.', ['What’s the thesis, simply?', 'How’s London?', 'Bye']);
    if (c === 0) await say(SP.artun, ['At a party, your brain locks onto one voice and turns the rest into soup.', 'Deep-network models called dSTRFs describe what auditory neurons “listen for” — so far, mostly from population recordings like ECoG.', 'I adapt them to single neurons: spike trains, Poisson likelihoods, lots of silence. Then ask what attention does to them.', 'Go stand next to someone at the party on the lawn. You’ll get it.']);
    else if (c === 1) await say(SP.artun, ['Great museums, great comedy, terrible tea.', 'They put milk in it. On purpose.']);
  };
  E.teyze = async () => {
    const n = (Game.flag('teyzeN') || 0) + 1; Game.flag('teyzeN', n);
    if (n === 1) await say(SP.teyze, ['Ay, hoş geldin! You’re Artun’s friend? Such a polite boy. Always fixing my radio.', 'Now he’s in London, fixing brains. Brains!', 'I told him: son, just call your mother. That’s the neuron she wants decoded.']);
    else if (n === 2) await say(SP.teyze, ['Did you eat? You look thin.', 'They don’t have proper bread in London, you know. I checked. On the internet.']);
    else {
      await say(SP.teyze, ['Here. Take this. Don’t argue.']);
      P().carry = ICON.borek; P().carryKind = 'börek';
      await say(NAR, ['(You received a börek. It is still warm. It will always be warm.)']);
      secret('teyze');
    }
  };
  E.student = async (it) => {
    if (it.ent.name === 'Ece') await say(SP.ece, ['Is this going to be on the exam?', '…Our TA used to say “gravity is on every exam. You’re taking it right now.” I still don’t know if that was a joke.']);
    else await say(SP.mert, ['PHYS102 lab report due Friday. I measured g as 11.2.', 'The TA wrote “bold” in the margin. Just “bold”.']);
  };
  E.guard = async () => {
    if (!Game.flag('radarOk')) {
      await say(SP.guard, ['Restricted area.', '…', 'You know Artun? He interned here in summer 2024. Kept saying “constant false alarm rate” at lunch.', 'Fine. You can use the radar in the yard. Five minutes. Don’t tell anyone. Especially not the radar.']);
      Game.flag('radarOk', 1); openGate();
    } else await say(SP.guard, ['The radar sees things you haven’t found yet. That’s the whole point of radar.']);
  };
  function openGate() {
    const g = E.guardEnt; if (!g) return;
    Game.stamp(g.x - 4, g.y - 3, 8, 5, 0);
    g.x = 91.6 * 16; g.y = 30.6 * 16; g.home = { x: g.x, y: g.y }; g.dir = 'l';
    Game.stamp(g.x - 4, g.y - 3, 8, 5, 1);
  }
  E.prof = async () => {
    await say(SP.prof, ['Looking for Artun? Probably fitting a Poisson model.', 'Or out on the lawn “doing fieldwork” at the cocktail party. Fieldwork. Honestly.']);
  };
  E.watchmaker = async () => {
    const c = await choose(SP.watch, 'Escapement & Sons. Est. 1761. We don’t sell watches; we let you look at them.', ['Why do they all say 10:10?', 'Is a mechanical watch accurate?', 'Can I buy one?']);
    if (c === 0) { await say(SP.watch, ['Advertising. The hands frame the logo like a smile.', 'Your friend Artun sets his to the real time. Checks it daily. Against an atomic clock. We are a little afraid of him.']); secret('tenten'); }
    else if (c === 1) await say(SP.watch, ['A balance wheel beating 28,800 times an hour. Plus or minus a few seconds a day.', 'Your phone is more accurate. That is not the point. Nothing about this is the point.']);
    else await say(SP.watch, ['No.', '(He says it kindly.)']);
  };

  /* ================= Ankara ================= */
  E.home = async () => {
    const k = (Game.flag('knocks') || 0) + 1; Game.flag('knocks', k);
    if (k === 1) { SFX.thud(); await say(NAR, ['*knock knock*', '(Nobody answers. Artun is standing right behind you, waving.)']); }
    await UI.panel('home');
  };
  E.shed = () => UI.panel('skills');
  E.mirror = async () => {
    const c = await choose(NAR, 'A standing mirror. You look… like a visitor. A good one, honestly.', ['Try a new look', 'I’m perfect as I am']);
    if (c) { await say(NAR, ['Correct.']); return; }
    const seed = (Math.random() * 1e9) | 0; store.set('lookSeed', seed);
    P().setLook(randomLook(seed)); SFX.pop(); Game.burst(P().x, P().y - 12, 10, [C.white, C.y3, C.p2], 30);
    await say(NAR, ['Fresh look. Same you.']);
  };
  E.mailbox = async () => { Game.flag('mailRead', 1); await UI.panel('contact'); };
  E.balta = async () => {
    const c = await choose(NAR, 'An axe, stuck in a stump. A tiny brass plate on the handle says: BALTA.', ['Pull it out', 'Leave it']);
    if (c) return;
    SFX.thud(); Game.G.shake = 3;
    await say(NAR, ['You pull with everything you’ve got.', 'It doesn’t move. Not even a little.', '(“Balta” is Turkish for “axe”. It’s also Artun’s surname. The family has been stuck here for generations.)']);
    secret('balta');
  };
  E.fountain = async () => {
    const c = await choose(NAR, 'A fountain. Coins at the bottom, and one suspiciously shiny lira.', ['Toss a coin', 'Just listen']);
    if (c === 0) {
      SFX.coin(); setTimeout(() => SFX.splash(), 250);
      Game.burst(73.5 * 16, 28 * 16, 10, [C.w5, C.white], 30);
      await say(NAR, [pick(['Plink. Your wish has been logged. Expected delivery: 6–8 business years.', 'Plink. The fountain thinks about it. The fountain says “maybe”.', 'Plink. Somewhere, a PhD application gets very slightly better.'])]);
    } else await say(NAR, ['It sounds like white noise. Artun would like you to know that white noise has a flat power spectral density.', 'Artun is not invited to many parties. (He is invited to one. It’s in London.)']);
  };
  E.bench = async () => {
    const c = await choose(NAR, 'A sunny bench. The kind where you sit for five minutes and lose four hours.', ['Sit down', 'Not now']);
    if (c) return;
    UI.endDlg(); Game.lock(); await Game.fade(true);
    Game.setTimeShift((Game.G.timeShift + 7) % 24);
    await Game.wait(0.7); await Game.fade(false); Game.unlock();
    await say(NAR, [Game.phase.dark > 0.3 ? 'You sat down for “five minutes”. It’s night now. The lamps came on without asking.' : 'You sat down for “five minutes”. The light has changed. So have you, a little.']);
    secret('bench');
  };
  E.welcome = () => say(NAR, ['HOŞ GELDİN — welcome to Baltaköy. Population: 1 (+ you).', '(“Köy” means village. “Balta” means axe. The axe is around here somewhere.)']);
  E.signpost = () => say(NAR, ['West: İstanbul, over the Bosphorus bridge. South: the Lab Garden. Up the stairs: School Hill. East: Work Street.', 'London is not on this sign. London is a train ride away.']);
  E.lycee = async () => { await say(NAR, ['Bonjour ! The corridors smell faintly of croissants and exam anxiety.']); await UI.panel('lycee'); };
  E.msf = async () => {
    await say(NAR, ['A chalkboard. “Mathématiques Sans Frontières — problème du jour.”']);
    for (;;) {
      const c = await choose(NAR, 'A bat and a ball cost 1.10 in total. The bat costs 1.00 more than the ball. How much is the ball?', ['0.10', '0.05', '0.01', 'Walk away']);
      if (c === 1) { await say(NAR, ['Exact ! The ball is 0.05, the bat is 1.05.', 'Second-place-at-Mathématiques-Sans-Frontières material. (That’s a compliment. Artun got second.)']); secret('msf'); return; }
      if (c === 3) return;
      await say(NAR, [c === 0 ? 'That’s the answer everyone’s fast brain gives. If the ball were 0.10, the bat would be 1.10, and together 1.20.' : 'Close, but then the bat is 1.01. Try again.']);
    }
  };
  E.bilkent = async () => { await say(NAR, ['The EE building. Somewhere inside, an oscilloscope is still showing a signal someone forgot about in 2023.']); await UI.panel('bilkent'); };
  E.trophy = async () => {
    const c = await choose(NAR, '1ST PLACE — Graduation Project Competition, out of 12 teams. Engraved underneath: “Scrollio”.', ['Polish it', 'Admire from a distance']);
    if (c === 0) { Game.burst(77.4 * 16, 11.4 * 16, 16, [C.y3, C.white, C.y4], 35); SFX.coin(); await say(NAR, ['You polish it until you can see your own sprite in it.']); secret('trophy'); }
  };
  E.check = () => say(NAR, ['A comically large cheque: Bilkentpreneurs Challenge 2026, 2nd place out of 45 teams — $3,000 in prize funding.', 'The bank refused to accept it. Not the money. The cheque. Physically. Too big for the slot.']);
  E.physics = async () => { await UI.panel('ta'); };
  E.apple = async () => {
    const c = await choose(NAR, 'An apple tree by the physics lab. Feels symbolic.', ['Shake it', 'Leave it alone']);
    if (c) return;
    UI.endDlg(); Game.lock();
    const p = P(); let y = p.y - 46; const x = p.x;
    await new Promise(res => {
      const t0 = Game.t;
      const fall = { x, y, sortY: 1e9, draw(g, cx, cy) { const k = Game.t - t0; const yy = y + 0.5 * 600 * k * k; rect(g, x - 2 - cx, Math.min(yy, p.y - 22) - cy, 4, 4, C.r2); px(g, x - cx, Math.min(yy, p.y - 22) - cy - 1, C.g2); if (yy >= p.y - 22 && !fall.hit) { fall.hit = 1; res(); } } };
      Game.addObj(fall); setTimeout(() => { fall.hidden = true; }, 1400);
    });
    SFX.thud(); Game.G.shake = 4; Game.particle({ x, y: p.y - 26, vy: -20, life: 1.2, kind: 'text', text: 'BONK', col: C.y3 });
    Game.unlock();
    await say(NAR, ['BONK.', '9.81 m/s², applied directly to the head. You now understand gravity, PHYS101-style.', 'The TA would like you to write that up. With error bars.']);
    secret('apple');
  };
  E.volina = async () => { await say(NAR, ['volina. — inside, someone is saying “the agent just handled that objection better than I would have”, out loud, to nobody.']); await UI.panel('volina'); };
  E.voli = async () => {
    await say(SP.voli, ['Hi! I’m Voli — volina.’s mascot. Here for you!', 'I make the calls, I do the follow-ups, and I never let a good conversation go cold.', 'Also I’m a tooth. Don’t make it weird.']);
    const c = await choose(SP.voli, 'High five?', ['High five!', 'Do teeth even have hands?']);
    if (c === 0) { SFX.pop(); for (let i = 0; i < 5; i++) Game.heart(91.6 * 16 + (Math.random() - 0.5) * 16, 23.2 * 16); await say(SP.voli, ['Yesss. A little nudge from Voli: floss tonight. I’ll know.']); }
    else await say(SP.voli, ['…', 'That’s a very personal question.']);
  };
  E.aselsan = () => UI.panel('aselsan');
  E.labSign = () => UI.panel('more');

  /* ---------- radar: shows where the secrets you haven't found are ---------- */
  E.radar = async () => {
    if (!Game.flag('radarOk')) { await say(NAR, ['A big radar dish. It is spinning with great confidence.', '(The guard at the gate is watching you very hard.)']); return; }
    const c = canvas(220, 220); c.className = 'scope';
    const node = html(`<p class="lead">Airborne-radar habits die hard. CFAR thresholding, tuned to find <b>things you haven’t found yet</b>.</p>`);
    node.appendChild(c);
    const legend = html(''); legend.className = 'scopeLegend'; node.appendChild(legend);
    const targets = Object.keys(SECRETS).filter(id => !Game.found().has(id) && E.secretPos[id]).map(id => ({ id, x: E.secretPos[id][0], y: E.secretPos[id][1], seen: -9 }));
    legend.innerHTML = targets.length ? `<b>${targets.length}</b> contacts. False alarm rate: constant. Blinking dot: you.` : 'No contacts. You found everything. The radar is, frankly, impressed.';
    // land mask once
    const land = canvas(220, 220);
    const s = 220 / (MAP_W * 16);
    const yo = (220 - MAP_H * 16 * s) / 2;
    for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if (Game.G.tr.get(x, y) !== T.WATER) { land.g.fillStyle = '#1d5a3a'; land.g.fillRect(x * 16 * s, yo + y * 16 * s, 16 * s + 0.5, 16 * s + 0.5); }
    let run = true, a0 = performance.now();
    const cx = 110, cy = 110;
    const draw = () => {
      if (!run) return;
      const g = c.g, tt = (performance.now() - a0) / 1000, ang = tt * 2.2;
      g.fillStyle = '#0b1a14'; g.fillRect(0, 0, 220, 220);
      g.globalAlpha = 0.6; g.drawImage(land, 0, 0); g.globalAlpha = 1;
      g.strokeStyle = '#2f8f5a'; g.lineWidth = 1;
      for (const r of [35, 70, 105]) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.moveTo(cx, 5); g.lineTo(cx, 215); g.moveTo(5, cy); g.lineTo(215, cy); g.stroke();
      for (let k = 0; k < 24; k++) { g.globalAlpha = 0.25 * (1 - k / 24); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 108, ang - k * 0.03 - 0.03, ang - k * 0.03); g.fillStyle = '#5cff9a'; g.fill(); }
      g.globalAlpha = 1;
      for (const t of targets) {
        const X = t.x * s, Y = yo + t.y * s;
        let ta = Math.atan2(Y - cy, X - cx); const d = ((ang - ta) % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2);
        if (d < 0.08) { t.seen = tt; }
        const age = tt - t.seen;
        if (age < 2.6) { g.globalAlpha = 1 - age / 2.6; g.fillStyle = '#b8ffcf'; g.fillRect(Math.round(X) - 1, Math.round(Y) - 1, 3, 3); g.globalAlpha = 1; }
      }
      const px0 = P().x * s, py0 = yo + P().y * s;
      if (Math.floor(tt * 3) % 2) { g.fillStyle = '#fadb74'; g.fillRect(Math.round(px0) - 2, Math.round(py0) - 2, 4, 4); }
      requestAnimationFrame(draw);
    };
    SFX.radar(); const ping = setInterval(() => SFX.radar(), 2860);
    draw();
    secret('radar');
    await UI.custom({ kicker: 'ASELSAN · yard', title: 'Radar sweep', accent: 'green', node, onClose: () => { run = false; clearInterval(ping); } });
  };
  let dishA = 0;
  E.drawRadarDish = (g, x, y, t) => {
    const a = t * 1.6, w = Math.cos(a), back = Math.sin(a) < 0;
    const rw = Math.max(1, Math.round(Math.abs(w) * 10));
    ell(g, x, y, rw + 1, 7, C.ink); ell(g, x, y, rw, 6, back ? C.t2 : C.t4);
    if (!back && rw > 3) ell(g, x - Math.sign(w), y - 1, rw - 3, 3.5, C.t5);
    line(g, x, y, x + Math.round(w * 6), y - 2, C.ink2); px(g, x + Math.round(w * 6), y - 3, C.r3);
  };

  /* ---------- the Lab Garden ---------- */
  E.mri = async () => {
    const c = await choose(NAR, 'An MRI scanner. The sign says: PARALLEL IMAGING DEMO · LIE STILL · 11 TAPS.', ['Scan my brain', 'Read about the research', 'No thanks']);
    if (c === 1) return UI.panel('mri');
    if (c === 2) return;
    const node = html(`<p class="lead" data-step>Lie still. Acquiring k-space at twice the speed — by skipping every other line.</p>`);
    const cvs = canvas(64, 64); cvs.className = 'mri'; node.appendChild(cvs);
    const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'Reconstruct ▸'; node.appendChild(btn);
    const note = html(''); note.className = 'mriNote'; node.appendChild(note);
    const brain = makeBrain();
    let step = 0;
    const render = () => {
      const g = cvs.g; g.clearRect(0, 0, 64, 64); g.fillStyle = '#000'; g.fillRect(0, 0, 64, 64);
      const ghost = [0.5, 0.28, 0][step];
      g.drawImage(brain, 0, 0);
      if (ghost) { g.globalAlpha = ghost; g.drawImage(brain, 0, 32); g.drawImage(brain, 0, -32); g.globalAlpha = 1; }
      const noise = [0.22, 0.1, 0.03][step];
      for (let i = 0; i < 64 * 64 * noise; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`; g.fillRect((Math.random() * 64) | 0, (Math.random() * 64) | 0, 1, 1); }
    };
    render();
    const texts = [
      ['Standard kernel rule: 19 calibration taps. Ghosts mostly gone. Mostly.', 'Physics-derived kernel ▸'],
      ['Kernel support derived from the acquisition physics: 11 taps, +0.65 dB. Clean.', 'Diagnosis ▸'],
      ['Radiology report: unremarkable. One small dog in the left frontal lobe — answers to Paşa. Probably fine. Very common in dog people.', 'Done'],
    ];
    btn.addEventListener('click', () => {
      if (step >= 2) { UI.closePanel(); return; }
      step++; render(); SFX.select();
      node.querySelector('[data-step]').textContent = texts[step - 1][0];
      btn.textContent = texts[step - 1][1];
      if (step === 2) { note.innerHTML = 'Want the real version? <a href="#" data-more>Read about the research ↗</a>'; note.querySelector('[data-more]').onclick = (e) => { e.preventDefault(); UI.closePanel(); setTimeout(() => UI.panel('mri'), 50); }; secret('mri'); }
    });
    await UI.custom({ kicker: 'Lab Garden', title: 'Brain scan', accent: 'teal', node });
  };
  function makeBrain() {
    const c = canvas(64, 64), g = c.g;
    ell(g, 32, 33, 25, 28, '#5a5a5a'); ell(g, 32, 33, 23, 26, '#1b1b1b'); ell(g, 32, 33, 21, 24, '#8c8c8c');
    for (let y = 9; y < 58; y++) for (let x = 11; x < 54; x++) {
      const d = Math.hypot((x - 32) / 20, (y - 33) / 23); if (d > 1) continue;
      const v = Math.sin(x * 0.55 + Math.sin(y * 0.3) * 2) + Math.sin(y * 0.5 + Math.cos(x * 0.25) * 2);
      if (d < 0.75 && Math.abs(v) < 0.35) px(g, x, y, '#b9b9b9');
      if (Math.abs(v) > 1.6 && d > 0.3) px(g, x, y, '#4a4a4a');
    }
    ell(g, 27, 34, 2.5, 7, '#222'); ell(g, 37, 34, 2.5, 7, '#222');
    vl(g, 32, 12, 54, '#3a3a3a');
    // the dog
    const dog = ['....oo.', 'o..oooo', 'ooooo..', 'o.o..o.'];
    dog.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === 'o') px(g, 19 + x, 20 + y, '#fff'); }));
    return c;
  }
  let mindStats = store.get('mind', [0, 0]);
  E.eeg = async () => {
    const c = await choose(NAR, 'A mannequin head in an EEG cap, wired to a monitor. A sign: “IMAGINED SPEECH DECODER · 4 CLASSES · 46%”.', ['Try it', 'Read about the research', 'Leave']);
    if (c === 1) return UI.panel('eeg');
    if (c === 2) return;
    await say(NAR, ['Think of one direction: UP, DOWN, LEFT or RIGHT.', 'Don’t say it. Don’t press anything. Just… imagine saying it.']);
    E.eegBusy = Game.t;
    await say(NAR, ['Recording… (the squiggles get very excited)', 'Decoding…']);
    const guess = pick(['UP', 'DOWN', 'LEFT', 'RIGHT']);
    const r = await choose(NAR, `You were thinking… ${guess}. Was I right?`, ['Yes!', 'No']);
    mindStats[1]++; if (r === 0) mindStats[0]++; store.set('mind', mindStats);
    const pct = Math.round(100 * mindStats[0] / mindStats[1]);
    await say(NAR, [r === 0 ? 'Told you.' : 'Within the confidence interval, then.', `Running accuracy on this device: ${mindStats[0]}/${mindStats[1]} (${pct}%). The real decoder: 46% against 25% chance.`, '(The real one used actual EEG. This one used Math.random. Science is about being honest with your baseline.)']);
    secret('mind');
  };
  E.drawEEGScreen = (g, x, y, w, h, t) => {
    const hot = Game.t - (E.eegBusy || -9) < 4;
    rect(g, x, y, w, h, C.b0);
    for (let ch = 0; ch < 3; ch++) {
      const col = [C.c3, C.y3, C.p2][ch];
      let prev = null;
      for (let i = 0; i < w; i++) {
        const k = t * (hot ? 26 : 9) - i;
        const v = Math.sin(k * 0.6 + ch) * (hot ? 2 : 1) + Math.sin(k * 1.7 + ch * 2) * (hot ? 1.2 : 0.4) + (hash2(Math.floor(k), ch, 3) - 0.5) * (hot ? 2.4 : 0.8);
        const yy = Math.round(y + 2 + ch * 4 + v * 0.8);
        px(g, x + i, clamp(yy, y, y + h - 1), col);
      }
    }
  };
  E.faces = async () => {
    const c = await choose(NAR, 'Two portraits. A small card: “One is a real person. One is synthetic. Which is real?”', ['The left one', 'The right one']);
    await say(NAR, [c === 0 ? 'Good instinct. The right one has three ears, two of them on one side.' : 'Bold. The right one has three ears. That’s usually the tell.', 'Trick question, though: they’re both sixteen pixels wide.', '(Artun built a CNN from scratch to tell real faces from synthetic ones. It would have caught the ears too.)']);
    secret('faces');
  };
  // Jenga: the robot pulls, the tower grows, physics eventually wins
  const J = { n: 0, fallen: 0, best: store.get('jenga', 0), anim: 0 };
  E.jenga = async () => {
    if (!Game.flag('jengaIntro')) { Game.flag('jengaIntro', 1); await say(NAR, ['A robot arm, a Jenga tower, and a sign: “LEARNED BLOCK SELECTION + OPTIMISATION-BASED MOTION PLANNING. DO NOT BUMP THE TABLE.”']); }
    const c = await choose(NAR, J.fallen ? 'The tower is back up. The robot looks determined.' : `Blocks pulled this round: ${J.n}. Record: ${J.best}.`, ['Let the robot pull one', 'Read about it', 'Leave']);
    if (c === 1) return UI.panel('jenga');
    if (c === 2) return;
    UI.endDlg(); J.fallen = 0; J.anim = Game.t;
    await Game.wait(0.9);
    const pFall = 0.04 + J.n * 0.035;
    if (Math.random() < pFall) {
      J.fall = Game.t; SFX.crash(); Game.G.shake = 3;
      await Game.wait(0.8);
      await say(NAR, [`CRASH. After ${J.n} block${J.n === 1 ? '' : 's'}.`, 'Contact-rich manipulation remains an open problem. The robot pretends it meant to do that.']);
      J.best = Math.max(J.best, J.n); store.set('jenga', J.best); J.n = 0; J.fallen = 1; J.fall = 0;
      secret('jenga');
    } else { J.n++; SFX.tick(); await say(NAR, [pick(['Clean pull. Block placed on top.', 'The arm hesitates, re-plans, and slides it out.', 'Wobble. No fall.']) + ` (${J.n})`]); }
  };
  E.drawJenga = (g, x, y, t) => {
    // tower: 18 levels of 3 blocks, centered at x
    const levels = 14 + J.n;
    const falling = J.fall && Game.t - J.fall < 1.2;
    for (let l = 0; l < levels; l++) {
      const yy = y - 2 - l * 2;
      let dx = 0;
      if (falling) { const k = (Game.t - J.fall) * (1 + l * 0.15); dx = Math.round(Math.sin(l) * k * 18); }
      const missing = l > 1 && l < levels - 2 && (l * 7 + 3) % 5 === 0 && l < 14 ? ((l % 2) ? 1 : 2) : -1;
      if (l % 2 === 0) for (let b = 0; b < 3; b++) { if (b === missing) continue; rect(g, x - 5 + b * 3 + dx, yy, 3, 2, b % 2 ? C.k4 : C.k5); px(g, x - 5 + b * 3 + dx, yy + 1, C.k2); }
      else { rect(g, x - 5 + dx, yy, 9, 2, C.k4); hl(g, x - 5 + dx, x + 3 + dx, yy + 1, C.k2); }
    }
    // the arm
    const k = Math.min(1, (Game.t - J.anim) / 0.9), reach = Math.sin(k * Math.PI);
    const bx = x + 16, by = y;
    rect(g, bx - 3, by - 3, 7, 3, C.t1);
    const ex = bx - 2 - Math.round(reach * 7), ey = by - 14 - Math.round(reach * 4);
    line(g, bx, by - 3, bx + 2, by - 12, C.y2); line(g, bx + 1, by - 3, bx + 3, by - 12, C.y1);
    line(g, bx + 2, by - 12, ex, ey, C.y2); line(g, bx + 2, by - 11, ex, ey + 1, C.y1);
    disc(g, bx + 2, by - 12, 1.5, C.ink2); rect(g, ex - 2, ey - 1, 3, 3, C.t2); px(g, ex - 2, ey + 2, C.ink);
  };
  let fpgaMode = 0;
  E.fpga = async () => {
    const c = await choose(NAR, 'An FPGA board running a colour-sensing joint controller written in VHDL.', ['Flash a new bitstream', 'Read the label']);
    if (c === 0) { await say(NAR, ['Synthesising…', 'Place and route…', 'Timing met on the first try.', 'Suspicious.']); fpgaMode = (fpgaMode + 1) % 3; SFX.select(); }
    else await UI.panel('more');
  };
  E.drawFPGA = (g, x, y, t) => {
    rect(g, x + 4, y - 7, 22, 8, C.g1); outlineRect(g, x + 4, y - 7, 22, 8, C.ink); rect(g, x + 12, y - 5, 6, 4, C.ink2);
    for (let i = 0; i < 6; i++) { const on = fpgaMode === 0 ? (Math.floor(t * 4) + i) % 6 < 2 : fpgaMode === 1 ? (Math.floor(t * 2) >> i) & 1 : Math.sin(t * 3 + i) > 0; px(g, x + 6 + i * 3, y - 6, on ? [C.r3, C.y3, C.c3][i % 3] : C.g0); }
    // the colour sensor + a tiny joint
    rect(g, x + 24, y - 12, 3, 6, C.t2); disc(g, x + 25.5, y - 13, 2, [C.r3, C.c3, C.b3][Math.floor(t / 2) % 3]);
  };
  let best = store.get('react', 0);
  E.arcade = async () => {
    const node = html(`<p class="lead">ARM Cortex-M0+, 48 MHz, one button. Wait for green, then press as fast as you can.</p>
      <div class="react" data-r>PRESS TO START</div><p class="mriNote" data-res>${best ? `Best on this device: <b>${best} ms</b>` : '&nbsp;'}</p>`);
    const pad = node.querySelector('[data-r]'), res = node.querySelector('[data-res]');
    let state = 'idle', t0 = 0, to = null;
    const go = () => {
      if (state === 'idle' || state === 'done') { state = 'wait'; pad.className = 'react wait'; pad.textContent = 'wait for green…'; to = setTimeout(() => { state = 'go'; pad.className = 'react go'; pad.textContent = 'NOW!'; t0 = performance.now(); SFX.select(); }, 1200 + Math.random() * 2600); }
      else if (state === 'wait') { clearTimeout(to); state = 'done'; pad.className = 'react'; pad.textContent = 'TOO SOON — press to retry'; res.innerHTML = 'False alarm. A CFAR detector would be disappointed in you.'; }
      else if (state === 'go') {
        const ms = Math.round(performance.now() - t0); state = 'done'; pad.className = 'react'; pad.textContent = `${ms} ms — press to retry`;
        if (!best || ms < best) { best = ms; store.set('react', ms); }
        res.innerHTML = `${ms < 180 ? 'Are you a spinal reflex?' : ms < 250 ? 'Radar-grade reflexes.' : ms < 350 ? 'Solidly human.' : 'Were you on the Tube?'} · Best: <b>${best} ms</b>`;
        secret('arcade');
      }
    };
    pad.addEventListener('pointerdown', e => { e.preventDefault(); go(); });
    Game.G.panelKeys = (e) => { if (e.key !== 'Escape') { e.preventDefault(); go(); } };
    await UI.custom({ kicker: 'Lab Garden · arcade', title: 'M0+ reaction test', accent: 'violet', node, onClose: () => { clearTimeout(to); Game.G.panelKeys = null; } });
  };
  E.drawArcade = (g, x, y, t) => {
    rect(g, x, y, 10, 8, C.b0);
    const k = Math.floor(t * 2) % 4;
    if (k < 3) { rect(g, x + 1 + k * 3, y + 5, 2, 2, C.y3); }
    px(g, x + 2, y + 2, C.c3); px(g, x + 7, y + 1, C.p2);
  };
  E.xray = async () => {
    await say(NAR, ['A lightbox with a hand X-ray. Sticker: “ASK ME — medical VQA, low-rank adapted.”']);
    const c = await choose(NAR, 'Ask the X-ray a question:', ['Is there a fracture?', 'How many fingers?', 'What’s LoRA?']);
    const ans = [
      'No fracture. Mild wear on the index finger, consistent with hand-deriving gradients in NumPy.',
      'Five. Unlike the portrait on the easel. (Checked twice.)',
      'Low-Rank Adaptation: instead of retraining a huge model, you learn a small low-rank update to its weights. Like adapting to London by only changing the necessary opinions.',
    ][c];
    await say({ name: 'X-RAY', color: 'var(--navy)', voice: 6 }, [ans]);
    secret('xray');
  };
  E.tesla = async () => {
    const c = await choose(NAR, 'A home-made Tesla coil, humming. Small purple lightning is licking the air.', ['Touch it', 'Absolutely not']);
    if (c) { await say(NAR, ['Wise. The coil seems disappointed in you.']); return; }
    UI.endDlg(); Game.lock();
    SFX.zap(); Game.G.flash = 1; Game.G.shake = 6;
    const p = P(); const old = p.look;
    p.setLook(Object.assign({}, old, { style: 'spiky' }));
    Game.burst(p.x, p.y - 16, 22, [C.v3, C.white, C.y3], 60);
    await Game.wait(0.6); Game.unlock();
    await say(NAR, ['ZAP.', 'Your hair is now 100% conductive. It will calm down in a minute. Probably.']);
    secret('zap');
    setTimeout(() => { if (p.look.style === 'spiky') p.setLook(old); }, 16000);
  };
  E.probe = () => say(NAR, ['DANGER — HIGH VOLTAGE.', 'Smaller print: “Field measured with a home-made JFET high-impedance probe. Non-contact. Like a good first date.”']);
  E.drawSparks = (g, x, y, t) => {
    const near = Math.hypot(P().x - x - 0, P().y - y - 36) < 40;
    const n = near ? 3 : (Math.floor(t * 10) % 3 === 0 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      let a = Math.random() * Math.PI * 2, xx = x, yy = y, len = 6 + Math.random() * (near ? 16 : 8);
      if (near) a = Math.atan2(P().y - 14 - y, P().x - x) + (Math.random() - 0.5) * 0.9;
      for (let s = 0; s < len; s += 3) { const nx = xx + Math.cos(a) * 3 + (Math.random() - 0.5) * 3, ny = yy + Math.sin(a) * 3 + (Math.random() - 0.5) * 3; line(g, xx, yy, nx, ny, Math.random() < 0.5 ? C.v3 : C.white); xx = nx; yy = ny; }
    }
    if (near && Math.random() < 0.05) SFX.crackle();
  };
  E.drawBridgeTop = (g, cx, cy) => {
    // suspension cables between the pylons + the top railing
    const x0 = 56.4 * 16 - cx, x1 = 60.6 * 16 - cx, top = 27.1 * 16 - 60 - cy, deck = 27 * 16 + 1 - cy;
    for (let i = 0; i <= 1; i++) {
      for (let x = Math.floor(x0); x <= x1; x++) {
        const u = (x - x0) / (x1 - x0), y = top + 4 + i + (1 - Math.pow(2 * u - 1, 2)) * 44;
        px(g, x, y, C.t1);
        if (i === 0 && (x - Math.floor(x0)) % 6 === 3) vl(g, x, y + 1, deck - 2, C.t3);
      }
    }
    hl(g, 56 * 16 - cx, 62 * 16 - cx - 1, deck - 2, C.r2); hl(g, 56 * 16 - cx, 62 * 16 - cx - 1, deck - 1, C.r1);
  };
  E.drawBridgeRail = (g, cx, cy) => {
    const y = 29 * 16 - 1 - cy;
    for (let x = 56 * 16 - cx; x < 62 * 16 - cx; x++) { px(g, x, y - 5, C.r2); if ((x + cx) % 6 === 0) vl(g, x, y - 5, y - 1, C.r1); }
    hl(g, 56 * 16 - cx, 62 * 16 - cx - 1, y - 6, C.r3);
  };

  /* ================= İstanbul ================= */
  E.mimlab = async () => { await say(NAR, ['Boğaziçi. The view of the Bosphorus from here is so good that nobody gets any work done. (They do. Mostly EEG.)']); await UI.panel('mimlab'); };
  // 2-back: press MATCH when the letter equals the one two steps back
  E.nback = async () => {
    const node = html(`<p class="lead">A 2-back task, the kind used to load up working memory during EEG recordings. Press <b>MATCH</b> (or Space) when the letter is the same as the one <b>two steps back</b>.</p>
      <div class="nback"><div class="nl" data-l>·</div><button class="btn" data-m>MATCH</button></div><p class="mriNote" data-res>15 letters. Ready when you are.</p><button class="btn ghost" data-go>Start</button>`);
    const L = node.querySelector('[data-l]'), M = node.querySelector('[data-m]'), R = node.querySelector('[data-res]'), GO = node.querySelector('[data-go]');
    let seqL = [], i = -1, timer = null, pressed = false, hits = 0, misses = 0, fas = 0, crs = 0;
    const letters = 'BCDFGHKLMNPQRSTVXZ';
    const makeSeq = () => { const s = []; for (let k = 0; k < 15; k++) s.push(k >= 2 && Math.random() < 0.33 ? s[k - 2] : letters[(Math.random() * letters.length) | 0]); return s; };
    const step = () => {
      if (i >= 2) { const target = seqL[i] === seqL[i - 2]; if (target) pressed ? hits++ : misses++; else pressed ? fas++ : crs++; }
      i++; pressed = false; M.classList.remove('hit');
      if (i >= seqL.length) return finish();
      L.textContent = seqL[i]; L.classList.remove('pop'); void L.offsetWidth; L.classList.add('pop'); SFX.tick();
      timer = setTimeout(step, 1700);
    };
    const press = () => { if (i < 0 || i >= seqL.length || pressed) return; pressed = true; M.classList.add('hit'); SFX.select(); };
    const finish = () => {
      L.textContent = '✓';
      const z = p => { p = clamp(p, 0.01, 0.99); const a = [2.50662823884, -18.61500062529, 41.39119773534, -25.44106049637], b = [-8.47351093090, 23.08336743743, -21.06224101826, 3.13082909833]; const q = p - 0.5; if (Math.abs(q) < 0.42) { const r = q * q; return q * (((a[3] * r + a[2]) * r + a[1]) * r + a[0]) / ((((b[3] * r + b[2]) * r + b[1]) * r + b[0]) * r + 1); } let r = p; if (q > 0) r = 1 - p; r = Math.log(-Math.log(r)); const c = [0.3374754822726147, 0.9761690190917186, 0.1607979714918209, 0.0276438810333863, 0.0038405729373609, 0.0003951896511919, 0.0000321767881768, 0.0000002888167364, 0.0000003960315187]; let x = c[0] + r * (c[1] + r * (c[2] + r * (c[3] + r * (c[4] + r * (c[5] + r * (c[6] + r * (c[7] + r * c[8]))))))); return q < 0 ? -x : x; };
      const hr = (hits + 0.5) / (hits + misses + 1), far = (fas + 0.5) / (fas + crs + 1);
      const dp = (z(hr) - z(far)).toFixed(2);
      R.innerHTML = `Hits ${hits} · misses ${misses} · false alarms ${fas}. Your sensitivity: <b>d′ = ${dp}</b>.<br>Cognitive workload: <b>${dp > 2 ? 'handled it' : 'HIGH'}</b>. Recommended intervention: çay.`;
      GO.textContent = 'Again'; GO.style.display = '';
      secret('nback');
    };
    GO.addEventListener('click', () => { seqL = makeSeq(); i = -1; hits = misses = fas = crs = 0; GO.style.display = 'none'; R.textContent = 'Focus…'; setTimeout(step, 600); });
    M.addEventListener('pointerdown', e => { e.preventDefault(); press(); });
    Game.G.panelKeys = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(); } };
    await UI.custom({ kicker: 'MIMLAB · terminal', title: 'The 2-back test', accent: 'red', node, onClose: () => { clearTimeout(timer); Game.G.panelKeys = null; } });
  };
  E.girvak = () => UI.panel('girvak');
  let spins = store.get('spins', 0);
  E.lottery = async () => {
    const c = await choose(NAR, 'A lottery machine. Label: “GirVak odds simulator — 28 in 154,558.”', ['Spin it', 'Leave']);
    if (c) return;
    spins++; store.set('spins', spins); SFX.coin();
    if (spins < 4) await say(NAR, [`Ball #${(Math.random() * 154558 + 1) | 0}. Not selected.`, `(Odds: 0.018%. Spins so far: ${spins}.)`]);
    else { await say(NAR, ['Ball #28. …Selected?!', 'Persistence noted. Fellowship granted.', '(That is not how it works. But it is how it felt.)']); secret('lottery'); spins = 0; store.set('spins', 0); }
  };
  E.cay = async () => {
    const c = await choose(SP.garson, 'Çay?', ['Evet, lütfen (yes please)', 'Hayır, teşekkürler (no thanks)']);
    if (c === 1) await say(SP.garson, ['…', '(He brings you one anyway. That’s not rudeness. That’s hospitality with a mandate.)']);
    else await say(SP.garson, ['Buyrun. Tavşan kanı — “rabbit’s blood”, the perfect colour.']);
    SFX.tea();
    P().boost = Game.t + 40;
    for (let i = 0; i < 6; i++) Game.particle({ x: P().x + (Math.random() - 0.5) * 6, y: P().y - 20, vy: -12 - Math.random() * 8, life: 1.2, kind: 'smoke', col: C.white });
    await say(NAR, ['(You feel faster. Çay-powered. For about forty seconds.)']);
    secret('cay');
  };
  E.simit = async () => {
    if (P().carry) { await say(SP.simitci, ['Your hands are full, abi. Eat that first!']); return; }
    await say(SP.simitci, ['SİMİT! Taze simit!', 'For you? On the house. Just… watch out for the seagulls. They have no shame.']);
    P().carry = ICON.simit; P().carryKind = 'simit'; SFX.pop();
  };
  E.stationInfo = () => say(NAR, ['İSTANBUL — Spike Train to London.', 'Departures: whenever a neuron feels like it. Arrivals: roughly Poisson.']);
  E.stationInfoL = () => say(NAR, ['LONDON — Spike Train to İstanbul.', 'A note taped to the door: “Simit requests to the conductor, please.”']);
  E.conductor = async () => {
    const c = await choose(SP.conductor, 'All aboard the Spike Train! İstanbul → London, non-stop. Please mind the refractory period.', ['Board', 'Not yet']);
    if (c === 0) await ride(-1);
  };
  E.conductorL = async () => {
    const c = await choose(SP.conductorL, 'Back to İstanbul? Lovely city. Bring me a simit.', ['Board', 'Not yet']);
    if (c === 0) await ride(1);
  };
  E.fish = async () => {
    const c = await choose(SP.fisher, 'Rastgele! — that’s what we say here instead of “good luck”. Want to try?', ['Cast a line', 'Just watching']);
    if (c) { await say(SP.fisher, ['Watching is half of fishing. The other half is lying about it later.']); return; }
    UI.endDlg(); Game.lock();
    const bx = P().x - 26, by = P().y + 4;
    const bob = { x: bx, y: by, sortY: by, draw(g, cx, cy) { const k = Math.sin(Game.t * 6) > 0.6 ? 1 : 0; rect(g, bx - 1 - cx, by - cy + k, 3, 2, C.r2); px(g, bx - cx, by - 1 - cy + k, C.white); } };
    Game.addObj(bob); SFX.splash();
    await Game.wait(1.6 + Math.random() * 1.6);
    SFX.splash(); bob.hidden = true; Game.burst(bx, by, 8, [C.w5, C.white], 25); Game.unlock();
    const [what, line2] = pick(CATCHES);
    await say(NAR, [`You caught ${what}!`, line2]);
    secret('fish');
  };
  E.row = async () => {
    const onIsland = P().x < 37 * 16 && P().y < 20 * 16;
    const c = await choose(NAR, onIsland ? 'Row back to the İstanbul pier?' : 'A little rowboat. The oars look borrowed. Row out to the island in the Channel?', ['Row', 'Stay']);
    if (c) return;
    UI.endDlg(); Game.lock(); await Game.fade(true);
    if (onIsland) { P().x = 36.4 * 16; P().y = 46 * 16; } else { P().x = 33.4 * 16; P().y = 12.6 * 16; }
    P().dir = 'd'; if (E.follower) { E.follower.x = P().x + 10; E.follower.y = P().y; }
    await Game.wait(0.4); await Game.fade(false); Game.unlock();
  };
  E.bottle = async () => {
    await say(NAR, ['A message in a bottle. The handwriting is neat, the ink a little smudged.']);
    await say({ name: 'THE NOTE', color: 'var(--teal)', voice: 3 }, ['“If you found this, you’re thorough. I like thorough.', 'Write to me — artun.balta@outlook.com — and mention the bottle. I’ll know what it means.', '— A.”']);
    secret('island');
  };
  E.lighthouse = () => say(NAR, ['The lighthouse keeper’s log, last entry: “Nothing happened today. Again. Excellent.”']);

  /* ================= London ================= */
  E.queensTower = () => say(NAR, ['The Queen’s Tower — the last standing piece of the old Imperial Institute. There are bells up there.', 'They ring on royal occasions. Not on request. Artun asked.']);
  E.imperial = async () => { await say(NAR, ['Imperial College. Somewhere inside, a single neuron is being listened to very carefully.']); await UI.panel('imperial'); };
  E.partyTalk = async (it) => {
    const i = it.ent.partyIndex;
    await say({ name: 'GUEST', color: 'var(--violet)', voice: 1 + i, portrait: portraitOf(it.ent.frames) }, [PARTY[i].say]);
    await say(NAR, ['(Notice how the other voices turn to mush when you focus on one? That’s the cocktail party effect — and decoding which voice a brain is attending to is exactly Artun’s thesis.)']);
    secret('party');
  };
  E.clock = async () => {
    const t = londonTime(), hh = String(t.h).padStart(2, '0'), mm = String(t.m).padStart(2, '0');
    SFX.chime();
    const h = t.h;
    const doing = h < 6 ? 'asleep. Or spike-sorting. From the outside, it looks the same.' : h < 9 ? 'on the Tube, pretending to read a paper.' : h < 12 ? 'in the lab, fitting receptive fields.' : h < 14 ? 'at lunch, quietly missing a proper Turkish breakfast.' : h < 18 ? 'arguing with a Poisson likelihood. The likelihood is winning.' : h < 21 ? 'at an open mic. Or explaining neuroscience to someone who asked a simple question.' : 'winding a mechanical watch and calling it “self-care”.';
    await say(NAR, [`*Westminster chimes*`, `It is ${hh}:${mm} in London. Really — this clock is live.`, `So Artun is probably ${doing}`]);
    secret('chime');
  };
  E.drawClock = (g, x, y, r, tz) => {
    const t = londonTime(new Date(), tz);
    const ms = (Date.now() % 1000) / 1000;
    const hand = (a, len, col) => line(g, Math.round(x - 0.5), Math.round(y - 0.5), Math.round(x - 0.5 + Math.sin(a) * len), Math.round(y - 0.5 - Math.cos(a) * len), col);
    hand(((t.h % 12) + t.m / 60) / 12 * Math.PI * 2, r * 0.5, C.ink);
    hand((t.m + t.s / 60) / 60 * Math.PI * 2, r * 0.82, C.ink);
    hand((t.s + ms) / 60 * Math.PI * 2, r * 0.85, C.r2); // sweeps, doesn't tick. it's mechanical.
    px(g, Math.round(x - 0.5), Math.round(y - 0.5), C.y1);
  };
  E.watchShop = async () => {
    await say(NAR, ['Every watch in the window says 10:10.']);
    secret('tenten');
    await UI.panel('watches');
  };
  E.phone = async () => {
    E.phoneAnswered = true;
    const c = await choose(NAR, 'The red phone box is ringing. It has been ringing since you got to London.', ['Pick up', 'Let it ring']);
    if (c) { E.phoneAnswered = false; await say(NAR, ['It keeps ringing. Patiently. Persistently. Professionally.']); return; }
    const V = SP.voli;
    await say(V, ['Hi! It’s Voli, calling from volina. on behalf of a dental clinic in İstanbul.', 'You asked about a smile makeover a while ago — is now a good time?']);
    const a = await choose(V, 'How can I help?', ['Who is this?', 'I’m not interested.', 'How did you get this number?!']);
    if (a === 0) await say(V, ['I’m Voli, an AI voice agent! I call people who once asked about treatment and then went quiet.', 'I listen to how you talk, and adapt my tone and pacing as we go. Right now you sound… curious. I like that.']);
    if (a === 1) {
      await say(V, ['Totally understand. Most people say that right before their free consultation.']);
      const b = await choose(V, 'Would Tuesday or Thursday suit you better?', ['Neither!', 'Thursday, I guess']);
      await say(V, b === 0 ? ['Noted: “neither”. Adjusting tone to “gently persistent”. Objection handled — I’ll stop here.'] : ['Wonderful! Thursday it is. (That’s a conversion. Somewhere, a dashboard just went up by 0.01%.)']);
    }
    if (a === 2) await say(V, ['You filled in a form — with consent! Logged, timestamped, KVKK- and GDPR-compliant.', 'Honestly, it’s my favourite part of me.']);
    await say(V, ['Have a lovely day! Follow-ups that follow through — that’s our whole thing.', 'Your teeth look great, by the way. (I can’t see them. I’m a phone.)']);
    await say(NAR, ['(That’s roughly what volina. does: real-time caller profiling, adaptive tone, objection handling. Five clinic pilots, ~40,000 leads.)']);
    secret('volina');
  };
  E.post = async () => {
    const c = await choose(NAR, 'A red pillar box. Post a letter to Artun?', ['Write a letter (opens email)', 'Not now']);
    if (c === 0) window.location.href = `mailto:${ME.email}?subject=${encodeURIComponent('A letter from the pixel world')}`;
  };
  E.drawBulbs = (g, x, y, b, t) => {
    const k = Math.floor(t * 6);
    (b.c.bulbs || []).forEach(([bx, by], i) => { const on = (i + k) % 3 !== 0; px(g, x + bx, y + by, on ? C.y4 : C.y0); if (on) px(g, x + bx, y + by - 1, 'rgba(250,219,116,.35)'); });
  };
  E.comedyClub = async () => { await say(NAR, ['THE REFRACTORY PERIOD — comedy every night. (In neurons, the refractory period is the pause after firing when you can’t fire again. In comedy, it’s the silence after a joke bombs.)']); await UI.panel('comedy'); };
  let jokeI = store.get('jokeI', 0), jokesHeard = 0;
  E.comedy = async () => {
    const j = JOKES[jokeI % JOKES.length]; jokeI++; store.set('jokeI', jokeI); jokesHeard++;
    await say(SP.comic, [j]);
    if (Math.random() < 0.72) { SFX.rimshot(); setTimeout(() => SFX.laugh(), 700); Game.particle({ x: 10 * 16, y: 25 * 16, vy: -14, life: 1.4, kind: 'text', text: 'HA HA', col: C.y3 }); }
    else { SFX.crickets(); await say(NAR, ['(crickets)']); }
    if (jokesHeard >= 5) { await say(SP.comic, ['That’s my time — you’ve been great! Tip your bartender, cite your sources.']); secret('comedy'); jokesHeard = 0; }
  };
  E.tearoom = async () => {
    const c = await choose(SP.tea, 'Tea, love? With milk?', ['Yes, milk please', 'No milk, thank you', 'Do you have tulip glasses?']);
    if (c === 0) { SFX.tea(); await say(NAR, ['You sip a very proper cup of tea.', '(Somewhere in Ankara, a tulip glass quietly shatters.)']); secret('milktea'); }
    else if (c === 1) await say(SP.tea, ['A purist! Your friend Artun is the same. Stares at the milk jug like it insulted his family.']);
    else await say(SP.tea, ['Tulip what, dear?']);
  };
  E.bus = () => say(NAR, ['Route 10 → IMPERIAL. Next bus: due in 2 minutes, for the last 20 minutes.']);
  E.umbrella = async () => {
    const p = P();
    if (p.umbrella) { p.umbrella = false; await say(NAR, ['You return the umbrella. Brave.']); return; }
    p.umbrella = true; SFX.pop();
    await say(NAR, ['You borrow an umbrella. It’s London. Nobody will ever ask for it back.']);
  };
  E.horsesInfo = () => UI.panel('horses');

  /* ---------- the race ---------- */
  const HORSES = [
    { name: 'Prior Knowledge', p: 0.38, coat: C.k2, coatD: C.k1, silk: C.r2 },
    { name: 'Gradient Descent', p: 0.27, coat: C.ink2, coatD: C.ink, silk: C.b2 },
    { name: 'Overfit', p: 0.21, coat: C.t4, coatD: C.t2, silk: C.y2 },
    { name: 'Null Hypothesis', p: 0.14, coat: C.k3, coatD: C.k2, silk: C.g3 },
  ];
  const R = { cx: 14 * 16, cy: 49.6 * 16, rx: 9.1 * 16, ry: 4.4 * 16, running: false };
  E.bookie = async () => {
    if (R.running) return;
    const c = await choose(SP.bookie, 'Fancy a flutter? My form model gives each horse a probability. The horses haven’t read it.',
      HORSES.map(h => `${h.name} · ${Math.round(h.p * 100)}%`).concat(['No thanks']));
    if (c === 4) return;
    await race(c);
  };
  async function race(pickI) {
    // sample the winner from the model, then let the race tell the story
    let r = Math.random(), win = 0;
    for (let i = 0; i < 4; i++) { r -= HORSES[i].p; if (r <= 0) { win = i; break; } }
    const order = [win, ...[0, 1, 2, 3].filter(i => i !== win).sort(() => Math.random() - 0.5)];
    const T = order.map((h, k) => ({ h, T: 7.2 + k * (0.25 + Math.random() * 0.3) }));
    for (const { h, T: tt } of T) HORSES[h].T = tt;
    UI.endDlg(); Game.lock(); R.running = true; R.t0 = Game.t;
    Game.G.camFocus = { x: R.cx, y: R.cy - 10 };
    SFX.whistle();
    const gal = setInterval(() => SFX.gallop(), 360);
    await Game.wait(7.2 + 1.6);
    clearInterval(gal);
    R.running = false; R.done = Game.t;
    Game.G.camFocus = null; Game.unlock();
    const w = HORSES[win], mine = HORSES[pickI];
    if (win === pickI) { await say(SP.bookie, [`${w.name} wins! You picked it.`, `The model gave it ${Math.round(w.p * 100)}%. You either trusted the model or got lucky. Same thing, statistically.`]); secret('race'); }
    else await say(SP.bookie, [`${w.name} wins. Your horse, ${mine.name}, had ${Math.round(mine.p * 100)}% — and ${Math.round(mine.p * 100)}% is not a promise.`, 'Probability is just confidence with a calculator. Again?']);
  }
  function horsePos(i, k) {
    const lane = [-13, -4.5, 4.5, 13][i];
    const a = -Math.PI / 2 + 0.32 - k * Math.PI * 2;
    return [R.cx + (R.rx + lane) * Math.cos(a), R.cy + (R.ry + lane * 0.62) * Math.sin(a), a];
  }

  /* ---------- the Spike Train ---------- */
  const STOP_I = 42.6 * 16, STOP_L = 7 * 16;
  const TR = { y: 37 * 16 + 12, front: STOP_I, dir: -1, v: 0, state: 'idle' };
  const TRAIN = makeTrain();
  const LEN = 52 + 44 * 2;
  // a parked train blocks the track (you can't walk through it)
  function parkTrain(on) {
    const x0 = TR.dir < 0 ? TR.front : TR.front - LEN;
    Game.stamp(x0 + 2, 37 * 16, LEN - 4, 16, on ? 1 : 0);
  }
  async function ride(dir) {
    // dir -1: İstanbul → London. dir +1: London → İstanbul
    UI.endDlg(); Game.lock();
    const p = P();
    // make sure the train is waiting at this station, facing the right way
    parkTrain(false);
    TR.dir = dir;
    TR.front = dir < 0 ? STOP_I : STOP_L + LEN;
    TR.target = dir < 0 ? STOP_L : STOP_I + LEN;
    await Game.fade(true);
    p.hidden = true; if (E.follower) E.follower.hidden = true;
    TR.state = 'board';
    Game.G.camFocus = { x: TR.front - dir * 60, y: TR.y - 20 };
    await Game.wait(0.3); await Game.fade(false);
    SFX.whistle();
    UI.toast(dir < 0 ? 'Next stop: <b>London</b>. Please mind the refractory period.' : 'Next stop: <b>İstanbul</b>. Simit service in the buffet car.', 5200);
    await Game.wait(0.9);
    TR.state = 'run'; TR.v = 0;
    await new Promise(res => { TR.onArrive = res; });
    parkTrain(true);
    await Game.wait(0.5);
    p.x = dir < 0 ? 17.5 * 16 : 46 * 16; p.y = 35.7 * 16; p.dir = 'd';
    if (E.follower) { E.follower.x = p.x + 12; E.follower.y = p.y; E.follower.hidden = false; }
    p.hidden = false;
    Game.G.camFocus = null; Game.unlock();
    SFX.pop();
    if (secret('train')) setTimeout(() => UI.toast(dir < 0 ? 'Welcome to London. It’s raining. It’s fine.' : 'Back in İstanbul. Someone is selling simit.'), 3600);
  }
  function trainUpdate(dt) {
    if (TR.state === 'run') {
      const dist = (TR.target - TR.front) * TR.dir;
      const vmax = 120;
      if (dist < 70) TR.v = Math.max(18, TR.v - 140 * dt); else TR.v = Math.min(vmax, TR.v + 60 * dt);
      TR.front += TR.dir * TR.v * dt;
      if ((TR.target - TR.front) * TR.dir <= 0) { TR.front = TR.target; TR.state = 'idle'; TR.v = 0; SFX.whistle(); TR.onArrive && TR.onArrive(); }
      if (Math.random() < dt * 2.2) { Game.particle({ x: TR.front - TR.dir * 12, y: TR.y - 32, vx: -TR.dir * 10, vy: -16, life: 1.6, kind: 'smoke', col: C.t5 }); SFX.chug(); }
      Game.G.camFocus = { x: TR.front - TR.dir * 60, y: TR.y - 20 };
    } else if (Math.random() < dt * 0.6) Game.particle({ x: TR.front - TR.dir * 12, y: TR.y - 32, vx: -TR.dir * 4, vy: -10, life: 1.4, kind: 'smoke', col: C.t5 });
  }
  function trainDraw(g, cx, cy) {
    const d = TR.dir;
    const y = Math.round(TR.y - 30 - cy);
    let x = Math.round(TR.front - cx);
    const bob = TR.state === 'run' ? (Math.floor(Game.t * 12) % 2) : 0;
    if (d < 0) { g.drawImage(TRAIN.loco, x, y + bob); g.drawImage(TRAIN.car, x + 52, y); g.drawImage(TRAIN.car, x + 96, y + bob); }
    else { g.drawImage(TRAIN.locoE, x - 52, y + bob); g.drawImage(TRAIN.carE, x - 96, y); g.drawImage(TRAIN.carE, x - 140, y + bob); }
  }

  /* ---------- cats, gulls, pigeons, butterflies, boats ---------- */
  class Cat {
    constructor(fur, furD, x, y, o = {}) { this.s = makeCat(fur, furD, o.eye); this.x = x; this.y = y; this.dir = 'r'; this.state = o.state || 'sit'; this.blocks = false; this.trail = []; Object.assign(this, o); }
    update(dt) {
      if (this.state === 'follow') {
        const p = P();
        if (p.hidden) return;
        this.trail.push([p.x, p.y]); if (this.trail.length > 18) this.trail.shift();
        const [tx, ty] = this.trail[0];
        const d = Math.hypot(tx - this.x, ty - this.y);
        if (d > 14) { const sp = Math.min(d, (p.curSpeed() + 10) * dt); this.x += (tx - this.x) / d * sp; this.y += (ty - this.y) / d * sp; this.moving = true; this.dir = tx < this.x ? 'l' : 'r'; }
        else this.moving = false;
        if (d > 160) { this.x = p.x + 10; this.y = p.y; }
      }
    }
    draw(g, cx, cy) {
      if (this.hidden) return;
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      if (this.moving) g.drawImage(this.s[this.dir][Math.floor(Game.t * 8) % 2], x - 8, y - 11);
      else g.drawImage(this.state === 'loaf' ? this.s.loaf : this.s.sit, x - 6, y - (this.state === 'loaf' ? 9 : 11));
      if (this.collar) { px(g, x - 2, y - 6, C.r2); px(g, x - 1, y - 6, C.y2); px(g, x, y - 6, C.r2); }
    }
  }
  class Dog {
    // follows the exact path you walked, a fixed distance behind — no catching up, no stop-start flicker
    constructor(x, y) { this.s = makeDog(); this.x = x; this.y = y; this.dir = 'r'; this.state = 'sit'; this.blocks = false; this.shadowR = 6; this.path = [[x, y]]; this.walked = 0; this.stillT = 9; }
    update(dt) {
      if (this.state !== 'follow') return;
      const p = P();
      if (p.hidden) return;
      const last = this.path[this.path.length - 1];
      if (Math.hypot(p.x - last[0], p.y - last[1]) > 64) this.path = [[this.x, this.y]]; // you teleported (map, train, boat)
      const tail = this.path[this.path.length - 1];
      if (Math.hypot(p.x - tail[0], p.y - tail[1]) >= 1) this.path.push([p.x, p.y]);
      // the point LAG px back along your trail
      const LAG = 24;
      let need = LAG, ax = p.x, ay = p.y, tx = this.x, ty = this.y, found = false;
      for (let i = this.path.length - 1; i >= 0; i--) {
        const [qx, qy] = this.path[i], seg = Math.hypot(ax - qx, ay - qy);
        if (seg >= need) { const k = need / seg; tx = ax + (qx - ax) * k; ty = ay + (qy - ay) * k; found = true; if (i > 1) this.path.splice(0, i - 1); break; }
        need -= seg; ax = qx; ay = qy;
      }
      if (!found) { tx = this.x; ty = this.y; } // trail shorter than LAG: you're right next to him, he waits
      const dx = tx - this.x, dy = ty - this.y, step = Math.hypot(dx, dy);
      if (step > 0.05) {
        this.x = tx; this.y = ty; this.walked += step; this.stillT = 0;
        if (Math.abs(dx) > step * 0.35) this.dir = dx < 0 ? 'l' : 'r';
      } else this.stillT += dt;
      if (this.stillT === 0 && Math.random() < dt * 0.02) Game.bubble(this, pick(['HAV!', 'HAV HAV!']), 1100);
    }
    draw(g, cx, cy) {
      if (this.hidden) return;
      const x = Math.round(this.x - cx), y = Math.round(this.y - cy);
      if (this.stillT > 0.7) { g.drawImage(this.s.sit[Math.floor(Game.t * 2.2) % 2], x - 9, y - 17); return; }
      // trot: step, neutral, other step, neutral — paced by distance, not by the clock
      const f = this.stillT < 0.12 ? [1, 0, 2, 0][Math.floor(this.walked / 6) % 4] : 0;
      g.drawImage(this.s[this.dir][f], x - 11, y - 15);
    }
  }
  class Flyers {
    constructor() { this.birds = []; this.next = 3; this.gull = makeGull(); }
    update(dt) {
      this.next -= dt;
      if (this.next < 0) {
        this.next = 6 + Math.random() * 8;
        const y = (8 + Math.random() * 44) * 16, dir = Math.random() < 0.5 ? 1 : -1;
        this.birds.push({ x: dir > 0 ? 28 * 16 : 62 * 16, y, dir, v: 38 + Math.random() * 20, ph: Math.random() * 6 });
      }
      for (const b of this.birds) { b.x += b.dir * b.v * dt; b.y += Math.sin(Game.t + b.ph) * 6 * dt; }
      this.birds = this.birds.filter(b => b.x > 20 * 16 && b.x < 70 * 16);
      // the simit thief
      const p = P();
      if (p.carry && p.x > 32 * 16 && p.x < 63 * 16 && !this.thief && Game.nearWater(p.x, p.y, 24) && !p.hidden) {
        this.thief = { x: p.x - 120, y: p.y - 80, t: 0, item: p.carry, kind: p.carryKind }; SFX.gull();
      }
      if (this.thief) {
        const th = this.thief; th.t += dt;
        if (!th.got) { th.x += (p.x - th.x) * Math.min(1, dt * 4); th.y += (p.y - 22 - th.y) * Math.min(1, dt * 4); if (Math.hypot(p.x - th.x, p.y - 22 - th.y) < 6) { th.got = true; p.carry = null; SFX.gull(); Game.G.shake = 2; if (E.follower && !E.follower.hidden) Game.bubble(E.follower, 'HAV! HAV!', 1600); setTimeout(async () => { await UI.say(NAR, [`A seagull just stole your ${th.kind}. Mid-air. No eye contact.`, E.follower ? 'Paşa barked heroically. The seagull did not care.' : 'Locals call this the İstanbul tax.']); UI.endDlg(); secret('gull'); }, 300); } }
        else { th.x += 70 * dt; th.y -= 60 * dt; if (th.t > 6) this.thief = null; }
      }
    }
    draw(g, cx, cy) {
      for (const b of this.birds) {
        const f = this.gull[Math.floor(Game.t * 5 + b.ph) % 2];
        g.globalAlpha = 0.18; ell(g, b.x - cx, b.y - cy + 40, 5, 1.5, C.ink); g.globalAlpha = 1;
        g.drawImage(b.dir < 0 ? f : (this.gullR || (this.gullR = this.gull.slice(0, 2).map(flipX)))[Math.floor(Game.t * 5 + b.ph) % 2], Math.round(b.x - cx - 6), Math.round(b.y - cy));
      }
      const th = this.thief;
      if (th) { g.drawImage(this.gull[Math.floor(Game.t * 8) % 2], Math.round(th.x - cx - 6), Math.round(th.y - cy - 4)); if (th.got) g.drawImage(th.item, Math.round(th.x - cx - 2), Math.round(th.y - cy + 3)); }
    }
  }
  class Pigeons {
    constructor(x, y) { this.list = []; const s = makePigeon(); this.s = s; this.sR = s.map(flipX); for (let i = 0; i < 5; i++) this.list.push({ hx: x + (Math.random() - 0.5) * 50, hy: y + (Math.random() - 0.5) * 18, fly: 0, ph: Math.random() * 6 }); this.list.forEach(p => { p.x = p.hx; p.y = p.hy; }); }
    update(dt) {
      for (const p of this.list) {
        if (!p.fly && Math.hypot(P().x - p.x, P().y - p.y) < 22) { p.fly = 1; p.vx = (p.x - P().x) > 0 ? 50 : -50; p.vy = -70; SFX.pop(); }
        if (p.fly) { p.fly += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.fly > 5) { p.fly = 0; p.x = p.hx; p.y = p.hy; } }
        else if (Math.random() < dt * 0.4) p.x += (Math.random() - 0.5) * 4;
      }
    }
    draw(g, cx, cy) {
      for (const p of this.list) {
        if (p.fly > 2.5) continue;
        const peck = !p.fly && Math.sin(Game.t * 3 + p.ph) > 0.7;
        const im = (p.vx > 0 ? this.sR : this.s)[peck ? 1 : 0];
        g.drawImage(im, Math.round(p.x - cx - 4), Math.round(p.y - cy - 8 - (p.fly ? p.fly * 4 : 0)));
      }
    }
  }
  class Butterflies {
    constructor(spots) { this.list = spots.map(([x, y], i) => ({ hx: x * 16, hy: y * 16, ph: i * 1.7, s: makeButterfly([C.p2, C.y3, C.white, C.b3][i % 4]) })); }
    draw(g, cx, cy) {
      for (const b of this.list) {
        const t = Game.t + b.ph, x = b.hx + Math.sin(t * 0.7) * 22 + Math.sin(t * 1.9) * 6, y = b.hy + Math.cos(t * 0.5) * 12 - 14 + Math.sin(t * 5) * 2;
        g.drawImage(b.s[Math.floor(t * 8) % 2], Math.round(x - cx), Math.round(y - cy));
      }
    }
  }

  /* ================= Scrollio: draw a mentor ================= */
  const MPAL = [null, C.ink, C.white, C.sk2, C.r2, C.y2, C.g3, C.b2, C.v2, C.k2];
  let mentorObj = null, factI = store.get('factI', 0);
  E.drawFeed = (g, x, y, w, h, t) => {
    // a vertical feed of tiny cards, scrolling forever
    rect(g, x, y, w, h, C.t5);
    const cols = [[C.c2, C.c4], [C.p1, C.p3], [C.y1, C.y3], [C.b2, C.b4], [C.g3, C.g5]];
    const off = (t * 9) % 12;
    for (let k = -1; k < 4; k++) {
      const cy = Math.round(y + k * 12 - off + 12), [a, b] = cols[(k + Math.floor(t * 9 / 12) + 50) % 5];
      if (cy > y + h - 2 || cy + 10 < y) continue;
      const top = Math.max(y, cy), bot = Math.min(y + h, cy + 10);
      rect(g, x + 1, top, w - 2, bot - top, b);
      if (cy + 2 >= y && cy + 6 <= y + h) { rect(g, x + 2, cy + 2, 4, 4, a); hl(g, x + 7, x + w - 3, cy + 3, a); hl(g, x + 7, x + w - 5, cy + 5, C.ink2); }
    }
  };
  function mentorSprite(data) {
    const c = canvas(16, 16);
    for (let i = 0; i < 256; i++) if (data[i]) { c.g.fillStyle = MPAL[data[i]]; c.g.fillRect(i % 16, (i / 16) | 0, 1, 1); }
    return outlined(c, C.ink);
  }
  function spawnMentor(data) {
    const img = mentorSprite(data);
    const x = 82.4 * 16, y = 12.7 * 16;
    if (!mentorObj) {
      mentorObj = Game.addObj({ x, y, img, dx: -9, dy: -19, shadow: [6, 2], act: E.mentor, label: 'ask', id: 'mentor', ir: 16,
        draw(g, cx, cy, t) { g.drawImage(this.img, Math.round(this.x - 9 - cx), Math.round(this.y - 19 - cy + Math.round(Math.sin(t * 3) * 1))); } });
    } else mentorObj.img = img;
    mentorObj.data = data;
  }
  E.mentor = async () => {
    const pc = canvas(16, 15); pc.g.drawImage(mentorObj.img, -1, 0);
    const f = MENTOR_FACTS[factI % MENTOR_FACTS.length]; factI++; store.set('factI', factI);
    await say({ name: 'YOUR MENTOR', color: 'var(--gold)', voice: 4, portrait: pc }, ['Did you know? ' + f, pick(['(One short clip. That’s the whole lesson.)', '(Curious? Ask me again.)', '(No quiz. Promise.)'])]);
  };
  E.scrollio = async () => {
    const c = await choose(NAR, 'A phone the size of a person. The feed on it is… educational? A sticker: “Scrollio — turn scrolling into learning.”', ['Draw a mentor', 'What is Scrollio?', 'Leave']);
    if (c === 1) return UI.panel('scrollio');
    if (c === 2) return;
    const data = new Uint8Array(256);
    if (mentorObj) data.set(mentorObj.data);
    const node = html(`<p class="lead">In Scrollio Kids, drawing is the first interface: a child draws a mentor, and the drawing becomes one. Draw yours — it will move in next to the phone.</p>
      <div class="drawpad"><canvas width="16" height="16"></canvas><div class="pal"></div></div>
      <p class="mriNote" data-msg>Tip: big shapes and two eyes go a long way.</p>
      <div class="row"><button class="btn ghost" data-clear>Clear</button><button class="btn" data-make>Create mentor ▸</button></div>`);
    const pad = node.querySelector('canvas'), pg = pad.getContext('2d'), palEl = node.querySelector('.pal'), msg = node.querySelector('[data-msg]');
    let cur = 1;
    const paint = () => { pg.clearRect(0, 0, 16, 16); for (let i = 0; i < 256; i++) { const x = i % 16, y = (i / 16) | 0; pg.fillStyle = data[i] ? MPAL[data[i]] : ((x + y) & 1 ? '#efe4c8' : '#e4d1ac'); pg.fillRect(x, y, 1, 1); } };
    MPAL.forEach((col, i) => {
      const b = document.createElement('button'); b.className = 'sw' + (i === cur ? ' on' : ''); b.title = i ? 'colour' : 'eraser';
      b.style.background = col || 'repeating-linear-gradient(45deg,#f6ead0 0 4px,#c6ad8c 4px 8px)';
      b.addEventListener('click', () => { cur = i; palEl.querySelectorAll('.sw').forEach((e, k) => e.classList.toggle('on', k === cur)); });
      palEl.appendChild(b);
    });
    let down = false;
    const at = (e) => { const r = pad.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / r.width * 16), y = Math.floor((e.clientY - r.top) / r.height * 16); if (x >= 0 && y >= 0 && x < 16 && y < 16) { data[y * 16 + x] = cur; paint(); } };
    pad.addEventListener('pointerdown', e => { down = true; pad.setPointerCapture(e.pointerId); at(e); });
    pad.addEventListener('pointermove', e => { if (down) at(e); });
    pad.addEventListener('pointerup', () => { down = false; });
    node.querySelector('[data-clear]').addEventListener('click', () => { data.fill(0); paint(); });
    node.querySelector('[data-make]').addEventListener('click', () => {
      const n = data.reduce((a, v) => a + (v ? 1 : 0), 0);
      if (n < 10) { msg.textContent = 'A few more pixels — mentors need at least a little body.'; return; }
      spawnMentor(data); store.set('mentor', Array.from(data)); SFX.secret();
      UI.closePanel();
      setTimeout(async () => { Game.burst(82.4 * 16, 11.6 * 16, 16, [C.y3, C.white, C.p2], 40); await say(NAR, ['Your drawing blinks, stretches, and steps off the screen.', 'It’s standing next to the phone now. Ask it something.']); UI.endDlg(); secret('mentor'); }, 250);
    });
    paint();
    await UI.custom({ kicker: 'School Hill · Scrollio Kids', title: 'Draw a mentor', accent: 'gold', node });
  };

  /* ================= echo: a world that learns you ================= */
  // a toy version of the idea: every thing you do updates a Bayesian posterior over who you are
  const ARCH = ['Explorer', 'Completionist', 'Reader', 'Socialite', 'Recruiter'];
  const ARCH_NOTE = ['walks first, reads later', 'will find all of them. has already started', 'opens every door, reads every sign', 'talks to everyone, pets every dog', 'opened the CV. respect'];
  const LIKE = {
    zone: [0.40, 0.22, 0.10, 0.14, 0.14], walk: [0.36, 0.22, 0.12, 0.18, 0.12], talk: [0.12, 0.18, 0.10, 0.48, 0.12],
    read: [0.08, 0.14, 0.46, 0.06, 0.26], play: [0.20, 0.36, 0.06, 0.26, 0.12], pet: [0.14, 0.16, 0.06, 0.58, 0.06],
    secret: [0.18, 0.56, 0.06, 0.12, 0.08], cv: [0.04, 0.06, 0.20, 0.04, 0.66], travel: [0.10, 0.26, 0.12, 0.08, 0.44],
    idle: [0.08, 0.10, 0.40, 0.30, 0.12], run: [0.26, 0.24, 0.04, 0.06, 0.40],
  };
  const VERB = { zone: 'wander somewhere new', talk: 'talk to someone', read: 'read something', play: 'poke a machine', pet: 'pet Paşa', secret: 'find a secret', cv: 'open the CV', travel: 'fast-travel' };
  const ECHO = { logp: ARCH.map(() => 0), n: 0, counts: {} };
  E.observe = (type) => {
    const L = LIKE[type]; if (!L) return;
    for (let i = 0; i < ARCH.length; i++) ECHO.logp[i] += 0.5 * Math.log(L[i] * ARCH.length);
    ECHO.n++; ECHO.counts[type] = (ECHO.counts[type] || 0) + 1;
  };
  function posterior() { const m = Math.max(...ECHO.logp), e = ECHO.logp.map(v => Math.exp(v - m)), z = e.reduce((a, b) => a + b, 0); return e.map(v => v / z); }
  function predictNext(post) {
    // posterior predictive with a Dirichlet(1) over what you've done so far
    const types = Object.keys(VERB);
    const sc = types.map(t => (ECHO.counts[t] || 0) + 1).map((c, k) => c * post.reduce((a, p, i) => a + p * LIKE[types[k]][i], 0));
    const z = sc.reduce((a, b) => a + b, 0), k = sc.indexOf(Math.max(...sc));
    return [VERB[types[k]], Math.round(sc[k] / z * 100)];
  }
  // the ghost: your own moves, replayed a beat late
  const trail = [];
  E.track = (t, p) => { trail.push([t, p.x, p.y, p.dir, p.frame(), p.hidden]); if (trail.length > 300) trail.shift(); };
  const ghostCv = canvas(16, 20);
  const ghost = { x: 0, y: 0, sortY: 0, vw: 1e5, vh: 1e5, dx: 0, dy: 0, until: 0,
    update() {
      this.on = false;
      if (Game.t > this.until) return;
      const want = Game.t - 1.1;
      let s = trail[0];
      for (let i = trail.length - 1; i >= 0; i--) if (trail[i][0] <= want) { s = trail[i]; break; }
      if (!s) return;
      this.on = true;
      [, this.x, this.y, this.dir, this.f, this.hid] = s; this.sortY = this.y - 0.5;
      if (Math.random() < 0.08) Game.particle({ x: this.x + (Math.random() - 0.5) * 10, y: this.y - 8 - Math.random() * 10, vy: -10, life: 0.8, col: C.v3 });
    },
    draw(g, cx, cy) {
      if (!this.on || this.hid || !P().frames[this.dir]) return;
      const img = P().frames[this.dir][this.f || 0];
      ghostCv.g.clearRect(0, 0, 16, 20); ghostCv.g.globalCompositeOperation = 'source-over'; ghostCv.g.drawImage(img, 0, 0);
      ghostCv.g.globalCompositeOperation = 'source-atop'; ghostCv.g.fillStyle = 'rgba(182,152,223,.55)'; ghostCv.g.fillRect(0, 0, 16, 20);
      g.globalAlpha = 0.6; g.drawImage(ghostCv, Math.round(this.x - 8 - cx), Math.round(this.y - 18 - cy - (this.f ? 1 : 0))); g.globalAlpha = 1;
    } };
  E.drawPortal = (g, x, y, w, h, t) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const v = Math.sin(i * 0.7 + t * 2.2) + Math.sin(j * 0.45 - t * 1.7) + Math.sin((i + j) * 0.3 + t);
      px(g, x + i, y + j, v > 1.2 ? C.white : v > 0.3 ? C.v3 : v > -0.8 ? C.c3 : C.v2);
    }
    // the word, floating above the arch
    const by = y - 21 + Math.round(Math.sin(t * 2) * 1);
    text(g, 'echo', x + w / 2 - textWidth('echo') / 2, by, C.white, C.v1);
  };
  E.echo = async () => {
    const c = await choose(NAR, 'A shimmering doorway. A small brass plate: “echo — a world that learns you.”', ['Step closer', 'What is echo?', 'Leave']);
    if (c === 1) return UI.panel('echo');
    if (c === 2) return;
    const post = posterior(), top = post.indexOf(Math.max(...post)), [verb, pct] = predictNext(post);
    const bars = ARCH.map((a, i) => `<div class="bar${i === top ? ' top' : ''}"><span>${a}</span><i style="--w:${Math.max(2, Math.round(post[i] * 100))}%"></i><b>${Math.round(post[i] * 100)}%</b></div>`).join('');
    const node = html(`<p class="lead">echo is an open world that reads human intention from play alone. Every move is recorded and folded into a Bayesian model — until the world has your echo.</p>
      <p>This little world has been quietly doing a tiny version of that to you: <b>${ECHO.n}</b> observations since you arrived.</p>
      <div class="bars">${bars}</div>
      <p>Most likely, you are <b>the ${ARCH[top]}</b> — ${ARCH_NOTE[top]}. Your echo predicts your next move: <b>${verb}</b> (${pct}%).</p>
      <div class="cast"></div>
      <p><a href="${ME.echo}" target="_blank" rel="noopener">echovirtualworld.com ↗</a> — “A living world. A place of your own.”</p>`);
    const cast = node.querySelector('.cast');
    for (const k of ['artun', 'teyze', 'simitci', 'prof', 'guestA', 'guestB', 'fisher', 'tea']) cast.appendChild(makePerson(LOOKS[k]).d[0]);
    const me = P().frames.d[0], you = document.createElement('div'); you.className = 'you'; const mc = canvas(16, 20); mc.g.drawImage(me, 0, 0); you.appendChild(mc); cast.appendChild(you);
    await UI.custom({ kicker: 'Lab Garden · side project', title: 'echo', accent: 'violet', node });
    ghost.until = Game.t + 60;
    UI.toast('Your <b>echo</b> is walking with you now — your own moves, a beat late.', 5000);
    secret('echo');
  };

  /* ================= wiring ================= */
  E.populate = (W) => {
    const ents = Game.G.entities;
    const byLook = (l) => ents.filter(e => e.look === LOOKS[l]);
    const spk = (look, name, color, voice) => ({ name, color, voice, portrait: portraitOf(makePerson(LOOKS[look])) });
    Object.assign(SP, {
      artun: spk('artun', 'ARTUN', 'var(--teal)', 0), teyze: spk('teyze', 'TEYZE', 'var(--violet)', 5), ece: spk('student1', 'ECE', 'var(--red)', 3), mert: spk('student2', 'MERT', 'var(--gold)', 1),
      guard: spk('guard', 'GUARD', 'var(--navy)', -2), prof: spk('prof', 'PROFESSOR', 'var(--brown)', -1), watch: spk('watchmaker', 'WATCHMAKER', 'var(--teal)', -1),
      voli: { name: 'VOLI', color: 'var(--violet)', voice: 7, portrait: (() => { const c = canvas(16, 15); c.g.drawImage(PROPS.voli().img, -7, -14); return c; })() },
      garson: spk('garson', 'GARSON', 'var(--red)', 1), simitci: spk('simitci', 'SİMİTÇİ', 'var(--red)', -1), conductor: spk('conductor', 'CONDUCTOR', 'var(--blue)', 0), conductorL: spk('conductor', 'CONDUCTOR', 'var(--blue)', 2),
      fisher: spk('fisher', 'BALIKÇI', 'var(--gold)', -2), comic: spk('comic', 'THE COMIC', 'var(--violet)', 2), tea: spk('tea', 'TEA ROOM', 'var(--red)', 5), bookie: spk('bookie', 'BOOKIE', 'var(--green)', -1),
    });
    E.artunEnt = ents.find(e => e.look === LOOKS.artun);
    E.guardEnt = byLook('guard')[0];
    if (Game.flag('radarOk')) openGate();
    // Paşa — Artun's dog — waits by the door
    const pasa = Game.entity(new Dog(71.4 * 16, 25.2 * 16));
    Game.addInter({ ent: pasa, r: 16, label: 'pet', fn: async () => {
      SFX.bark(); for (let i = 0; i < 3; i++) setTimeout(() => Game.heart(pasa.x, pasa.y - 14), i * 180);
      if (pasa.state !== 'follow') {
        await UI.say(NAR, ['Paşa — Artun’s dog — sniffs your hand, considers it very carefully, and approves.', 'He has appointed himself your escort. He will follow you everywhere. This is not negotiable.']);
        pasa.state = 'follow'; E.follower = pasa; secret('pasa');
      } else {
        await UI.say(NAR, [pick(['Paşa rolls onto his back. Belly rubs are now mandatory.', 'Paşa offers you his paw, very formally. (“Paşa” was an Ottoman general’s title. He takes it seriously.)', 'Hav! (Turkish for “woof”.)', 'Paşa leans his whole weight against your leg. That’s a hug.'])]);
      }
    } });
    const tarcin = Game.entity(new Cat(C.y2, C.y1, 54.4 * 16, 21.6 * 16, { state: 'loaf', eye: C.g4 }));
    Game.addInter({ ent: tarcin, r: 16, label: 'pet', fn: async () => { SFX.purr(); Game.heart(tarcin.x, tarcin.y - 10); await UI.say(NAR, ['Tarçın (“cinnamon”) is the real owner of this tea garden. The waiter just works here.']); } });
    const mouser = Game.entity(new Cat(C.ink2, C.ink, 21.4 * 16, 13.9 * 16, { state: 'loaf', eye: C.y3, collar: true }));
    Game.addInter({ ent: mouser, r: 16, label: 'pet', fn: async () => { await UI.say(NAR, ['A cat in an official-looking collar. The tag reads: CHIEF MOUSER (ACTING).', 'He does not acknowledge you. In London, that is the highest honour.']); secret('mouser'); } });
    // ambient life
    Game.addObj({ x: 0, y: 0, sortY: 1e9, vw: 1e5, vh: 1e5, dx: 0, dy: 0, update: dt => flyers.update(dt), draw: (g, cx, cy) => flyers.draw(g, cx, cy) });
    const flyers = new Flyers();
    const pig = new Pigeons(14 * 16, 33.4 * 16);
    Game.addObj({ x: 14 * 16, y: 33.4 * 16, sortY: 33.4 * 16, vw: 200, vh: 60, dx: -100, dy: -40, update: dt => pig.update(dt), draw: (g, cx, cy) => pig.draw(g, cx, cy) });
    const bf = new Butterflies([[68.5, 44], [78.5, 43], [69, 21], [79, 21.5], [91, 21], [61.8, 6], [52, 44], [78, 56]]);
    Game.addObj({ x: 0, y: 0, sortY: 1e9 - 1, vw: 1e5, vh: 1e5, dx: 0, dy: 0, draw: (g, cx, cy) => bf.draw(g, cx, cy) });
    // the train
    parkTrain(true);
    Game.addObj({ x: 0, y: TR.y + 2, sortY: TR.y + 2, vw: 1e5, vh: 1e5, dx: 0, dy: 0, update: trainUpdate, draw: trainDraw });
    // white rails around the racetrack, painted straight onto the ground
    const hp = Game.G.tr.hippo, gg = Game.G.ground.canvas.g;
    for (const [rx, ry, off] of [[hp.ORX + 2, hp.ORY + 2, 0], [hp.IRX - 2, hp.IRY - 2, 3]]) {
      const n = Math.round((rx + ry) * 3.2);
      for (let k = 0; k < n; k++) {
        const a = k / n * Math.PI * 2, x = Math.round(hp.HX + Math.cos(a) * rx), y = Math.round(hp.HY + Math.sin(a) * ry);
        gg.fillStyle = C.white; gg.fillRect(x, y - 3, 1, 1); gg.fillStyle = C.t3; gg.fillRect(x, y - 2, 1, 1);
        if ((k + off) % 9 === 0) { gg.fillStyle = C.t5; gg.fillRect(x, y - 3, 1, 4); gg.fillStyle = C.ink2; gg.fillRect(x, y + 1, 1, 1); }
      }
    }
    // horses at the start
    const H = HORSES.map(h => makeHorse(h.coat, h.coatD, h.silk));
    Game.addObj({ x: 0, y: 0, vw: 1e5, vh: 1e5, dx: 0, dy: 0, draw: (g, cx, cy) => {
      HORSES.forEach((h, i) => {
        let k = 0;
        if (R.running) { const t = Game.t - R.t0; k = Math.min(1, t / h.T); k = k * k * (3 - 2 * k) * 0.25 + k * 0.75; }
        else if (R.done) k = 1;
        const [x, y, a] = horsePos(i, k % 1);
        const dx = -Math.sin(a) * -1;
        const img = (Math.cos(a + Math.PI / 2) > 0 ? H[i].l : H[i].r)[R.running && k < 1 ? Math.floor(Game.t * 10 + i) % 4 : 0];
        g.globalAlpha = 0.2; ell(g, x - cx, y - cy, 9, 2, C.ink); g.globalAlpha = 1;
        g.drawImage(img, Math.round(x - cx - 13), Math.round(y - cy - 20));
      });
    }, sortY: 49.6 * 16 - 80 });
    // rowboat on the island too, and bobbing boats
    const ib = W.prop('rowboat', 34.8, 13.6, { act: E.row, label: 'row', ix: 34.4 * 16, iy: 12.9 * 16, ir: 14 });
    for (const o of Game.G.objects) if (o.p && o.p.img && (o.img === o.p.img) && (o === ib || o.bob)) { const base = o; base.draw = (g, cx, cy, t) => g.drawImage(base.img, Math.round(base.x + base.dx - cx), Math.round(base.y + base.dy - cy + Math.round(Math.sin(t * 2 + base.x) * 1))); }
    const ferry = PROPS.ferry().img, sail = PROPS.sailboat().img;
    Game.addObj({ x: 58.5 * 16, y: 45 * 16, sortY: 45 * 16, vw: 60, vh: 40, dx: -20, dy: -24, update() { this.y = (44 + Math.sin(Game.t * 0.05) * 11) * 16; this.x = (58.6 + Math.sin(this.y / 16 * 0.19) * 0.8) * 16; this.sortY = this.y; }, draw(g, cx, cy, t) { g.drawImage(ferry, Math.round(this.x - 20 - cx), Math.round(this.y - 21 - cy + Math.sin(t * 2))); } });
    Game.addObj({ x: 31 * 16, y: 26 * 16, sortY: 26 * 16, vw: 40, vh: 40, dx: -13, dy: -27, update() { this.y = (26 + Math.sin(Game.t * 0.04) * 6) * 16; this.sortY = this.y; }, draw(g, cx, cy, t) { g.drawImage(sail, Math.round(this.x - 13 - cx), Math.round(this.y - 27 - cy + Math.sin(t * 1.6) * 1.2)); } });
    // chimney smoke from home
    const home = Game.G.objects.find(o => o.id === 'home');
    if (home && home.b.c.smoke) { const [sx, sy] = home.b.c.smoke; home.update = () => { if (Math.random() < 0.03) Game.particle({ x: home.x + home.dx + sx + Math.random() * 2, y: home.y + home.dy + sy, vx: 4 + Math.random() * 3, vy: -9, life: 2.6, kind: 'smoke', col: C.t4 }); }; }
    // your echo, and any mentor you drew before
    Game.addObj(ghost);
    const saved = store.get('mentor', null);
    if (saved && saved.length === 256) spawnMentor(Uint8Array.from(saved));
    // where secrets live (for the radar)
    const at = (id) => { const o = Game.G.objects.find(o => o.id === id); return o ? [o.x + (o.kind === 'building' ? o.b.w / 2 : 0), o.y] : null; };
    E.secretPos = {
      pasa: [pasa.x, pasa.y], balta: at('balta'), bench: at('bench'), zap: at('tesla'), mri: at('mri'), mind: at('eeg'), jenga: at('jenga'), arcade: at('arcade'),
      faces: [68.6 * 16, 50.2 * 16], xray: [77.6 * 16, 50.6 * 16], radar: at('radar'), apple: at('apple'), msf: [66.5 * 16, 12.9 * 16], trophy: [77.4 * 16, 12.9 * 16],
      nback: at('nback'), lottery: at('lottery'), cay: [52.3 * 16, 17.3 * 16], gull: [45.8 * 16, 26.2 * 16], fish: [33.8 * 16, 46 * 16], island: at('bottle'), train: [52.2 * 16, 35.6 * 16],
      echo: at('echo'), mentor: at('scrollio'), party: [9.3 * 16, 15.6 * 16], chime: at('clock'), tenten: at('watch'), comedy: at('mic'), volina: at('phone'), race: at('bookie'), milktea: at('tearoom'), konami: null, teyze: [69 * 16, 29 * 16], mouser: [mouser.x, mouser.y],
    };
  };

  /* ================= per-frame ================= */
  let partyFocus = -1, ringT = 0;
  const MURMUR = ['BLAH BLAH', 'MM-HM', 'HAHA', '...SO THEN...', 'RIGHT?!', 'NO WAY', '~ ~ ~', 'ANYWAY...', 'P < 0.05', 'TOTALLY', 'WAIT WHAT', 'MHM MHM', '...GRANT...', 'CANAPÉ?'];
  const garble = () => pick(MURMUR);
  let garbles = [garble(), garble(), garble(), garble()], garbleT = 0;
  E.tick = (dt) => {
    const p = P();
    // the phone keeps ringing in London until answered
    if (!E.phoneAnswered && p.x < 27 * 16 && Math.hypot(p.x - 20.4 * 16, p.y - 17.7 * 16) < 150 && Game.t - ringT > 4.5) { ringT = Game.t; SFX.ring(); const ph = Game.G.objects.find(o => o.id === 'phone'); if (ph) Game.particle({ x: ph.x + 8, y: ph.y - 40, vy: -8, life: 1, kind: 'text', text: 'RING', col: C.y3 }); }
    // the cocktail party
    partyFocus = -1;
    if (E.partyGuests) E.partyGuests.forEach((g, i) => { if (Math.hypot(g.x - p.x, g.y - p.y) < 22) partyFocus = i; });
    garbleT -= dt; if (garbleT < 0) { garbleT = 0.7; const k = (Math.random() * 4) | 0; garbles[k] = garble(); }
    if (partyFocus >= 0 && !Game.flag('partySeen')) { Game.flag('partySeen', 1); UI.toast('Notice the other voices fade when you focus on one?', 4500); }
  };
  E.overlay = (g, cx, cy) => {
    if (!E.partyGuests) return;
    const p = P();
    if (Math.hypot(p.x - 9.3 * 16, p.y - 15.6 * 16) > 130) return;
    E.partyGuests.forEach((gst, i) => {
      const focused = partyFocus === i, muted = partyFocus >= 0 && !focused;
      const x = Math.round(gst.x - cx), y = Math.round(gst.y - cy - 26 - (i % 2) * 7);
      if (muted) { const mx = x - 6, my = y - 7; g.globalAlpha = 0.55; rect(g, mx, my, 13, 7, C.ink2); rect(g, mx + 1, my + 1, 11, 5, C.t4); px(g, mx + 3, my + 3, C.t1); px(g, mx + 6, my + 3, C.t1); px(g, mx + 9, my + 3, C.t1); g.globalAlpha = 1; return; }
      let txt = focused ? PARTY[i].clear : garbles[i];
      const lines = []; let cur = '';
      for (const w of txt.split(' ')) { const t = cur ? cur + ' ' + w : w; if (textWidth(t) > 84 && cur) { lines.push(cur); cur = w; } else cur = t; }
      lines.push(cur);
      const w = Math.max(...lines.map(textWidth)) + 6, h = lines.length * 7 + 4;
      const x0 = clamp(x - (w >> 1), 2, G_vw() - w - 2), y0 = y - h;
      g.globalAlpha = muted ? 0.45 : 1;
      rect(g, x0, y0, w, h, focused ? C.ink : C.ink2); rect(g, x0 + 1, y0 + 1, w - 2, h - 2, focused ? C.y4 : C.white);
      lines.forEach((l, k) => text(g, l, x0 + 3, y0 + 3 + k * 7, focused ? C.ink : C.t1));
      px(g, x, y0 + h, focused ? C.ink : C.ink2);
      g.globalAlpha = 1;
    });
  };
  const G_vw = () => Game.G.vw;

  /* ================= keys ================= */
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  E.onKeys = (seq) => {
    const tail = (n) => seq.slice(-n);
    if (tail(10).map(k => k.length === 1 ? k.toLowerCase() : k).join() === KONAMI.join()) {
      seq.length = 0;
      if (Game.G.mode !== 'play') return;
      E.party = !E.party;
      for (const e of Game.G.entities) e.hat = E.party ? partyHat : null;
      for (let i = 0; i < 60; i++) Game.particle({ x: P().x + (Math.random() - 0.5) * 200, y: P().y - 120 - Math.random() * 40, vx: (Math.random() - 0.5) * 30, vy: 20 + Math.random() * 30, g: 10, life: 4, col: pick([C.r3, C.y3, C.c3, C.p2, C.b3]), size: 2 });
      SFX.secret(); UI.toast(E.party ? 'Party mode. Everyone gets a hat.' : 'Party’s over. Hats returned.');
      secret('konami');
    }
    const word = tail(4).join('').toLowerCase();
    if (word === 'hire' && Game.G.mode === 'play' && !UI.busy) { UI.toggleCV(true); UI.toast('You typed “hire”. Excellent instincts.'); }
  };
  function partyHat(g, x, y, dir) {
    const c = [C.r3, C.y3, C.c3][(x * 7 + y) % 3 < 0 ? 0 : ((x * 7) % 3 + 3) % 3];
    for (let k = 0; k < 6; k++) hl(g, x - 3 + Math.ceil(k / 2), x + 2 - Math.floor(k / 2), y + 2 - k, k % 2 ? C.white : c);
    px(g, x, y - 4, C.y4);
  }

  E.allFound = async () => {
    await UI.custom({ kicker: '✦ ' + total() + '/' + total(), title: 'You found everything.', accent: 'gold', body: `<p class="lead">Every secret. Every cat. Every bad joke. That’s thoroughness — the trait I value most in a collaborator.</p><p>So let’s actually talk. Tell me you finished the world and I’ll owe you a çay (or, fine, a tea with milk).</p>${linksHTML(true)}` });
  };

  return E;
})();
