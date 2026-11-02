'use strict';
/* =====================================================================
   ui.js — dialogue (with a typewriter that blips), choices, panels,
   toasts, the HUD, the map/journal, and the plain-CV "recruiter mode".
   All HTML so text stays crisp and selectable.
   ===================================================================== */

const UI = (() => {
  const $ = s => document.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  let dlg, dlgName, dlgText, dlgPortrait, dlgChoices, dlgNext;
  let typing = null, waitAdvance = null, choiceState = null, open = false;
  let panelResolve = null, panelOnClose = null, panelOpen = false;

  function init() {
    dlg = $('#dlg'); dlgName = $('#dlg .name'); dlgText = $('#dlg .text'); dlgPortrait = $('#dlg .portrait'); dlgChoices = $('#dlg .choices'); dlgNext = $('#dlg .next');
    dlg.addEventListener('pointerdown', e => { e.stopPropagation(); if (!choiceState) advance(); });
    $('#panel').addEventListener('pointerdown', e => { if (e.target.id === 'panel') closePanel(); });
    $('#panel .x').addEventListener('click', closePanel);
    $('#cv .x').addEventListener('click', () => toggleCV(false));
    $('#map').addEventListener('pointerdown', e => { if (e.target.id === 'map') toggleMap(false); });
    $('#map .x').addEventListener('click', () => toggleMap(false));
    buildCV();
  }

  /* ---------- dialogue ---------- */
  function setSpeaker(who) {
    dlgName.textContent = who.name || '';
    dlgName.style.background = who.color || 'var(--teal)';
    dlgName.style.display = who.name ? '' : 'none';
    dlgPortrait.innerHTML = '';
    if (who.portrait) {
      const c = document.createElement('canvas'); c.width = who.portrait.width; c.height = who.portrait.height;
      c.getContext('2d').drawImage(who.portrait, 0, 0);
      dlgPortrait.appendChild(c); dlgPortrait.style.display = '';
    } else dlgPortrait.style.display = 'none';
  }
  function typeLine(text, voice = 0) {
    return new Promise(res => {
      dlgText.innerHTML = ''; dlgNext.classList.remove('on');
      const span = el('span'); dlgText.appendChild(span);
      const chars = [...text];
      let i = 0, done = false;
      const finish = () => { if (done) return; done = true; clearInterval(typing); typing = null; span.innerHTML = text; dlgNext.classList.add('on'); res(); };
      typing = setInterval(() => {
        i++;
        span.textContent = chars.slice(0, i).join('');
        if (i % 2 === 0 && chars[i - 1] !== ' ') SFX.blip(voice);
        if (i >= chars.length) finish();
      }, 22);
      typeLine.skip = finish;
    });
  }
  // say(who, 'line') or say(who, ['a','b'])
  async function say(who, lines) {
    if (typeof lines === 'string') lines = [lines];
    showDlg(); setSpeaker(who);
    for (const line of lines) {
      await typeLine(line, who.voice || 0);
      await new Promise(r => { waitAdvance = r; });
      waitAdvance = null;
    }
  }
  async function choose(who, line, options) {
    showDlg(); setSpeaker(who);
    await typeLine(line, who.voice || 0);
    dlgNext.classList.remove('on');
    return new Promise(res => {
      dlgChoices.innerHTML = '';
      const btns = options.map((o, i) => {
        const b = el('button', 'choice', o);
        b.addEventListener('pointerdown', e => { e.stopPropagation(); pickChoice(i); });
        b.addEventListener('pointerenter', () => { choiceState.sel = i; paint(); });
        dlgChoices.appendChild(b); return b;
      });
      choiceState = { sel: 0, btns, res };
      const paint = () => btns.forEach((b, i) => b.classList.toggle('sel', i === choiceState.sel));
      choiceState.paint = paint; paint();
      dlgChoices.classList.add('on');
    });
  }
  function pickChoice(i) {
    if (!choiceState) return;
    const r = choiceState.res; choiceState = null;
    dlgChoices.classList.remove('on'); dlgChoices.innerHTML = '';
    SFX.select(); r(i);
  }
  function moveChoice(d) { if (!choiceState) return; choiceState.sel = (choiceState.sel + d + choiceState.btns.length) % choiceState.btns.length; choiceState.paint(); SFX.blip(4); }
  function advance() {
    if (choiceState) { pickChoice(choiceState.sel); return; }
    if (typing && typeLine.skip) { typeLine.skip(); return; }
    if (waitAdvance) waitAdvance();
  }
  function showDlg() { if (!open) { open = true; dlg.classList.add('on'); } }
  function endDlg() { open = false; dlg.classList.remove('on'); dlgChoices.classList.remove('on'); if (typing) { clearInterval(typing); typing = null; } }

  /* ---------- panels ---------- */
  function panel(key) {
    const p = PANELS[key]();
    return custom(p);
  }
  function custom(p) {
    endDlg();
    const box = $('#panel .card');
    box.dataset.accent = p.accent || 'teal';
    $('#panel .kicker').textContent = p.kicker || '';
    $('#panel .title').textContent = p.title || '';
    const body = $('#panel .body');
    body.innerHTML = '';
    if (p.node) body.appendChild(p.node); else body.innerHTML = p.body || '';
    $('#panel').classList.add('on'); panelOpen = true;
    body.scrollTop = 0;
    SFX.open();
    panelOnClose = p.onClose || null;
    return new Promise(r => { panelResolve = r; });
  }
  function closePanel() {
    if (!panelOpen) return;
    panelOpen = false; $('#panel').classList.remove('on'); SFX.close();
    if (panelOnClose) panelOnClose();
    const r = panelResolve; panelResolve = null; if (r) r();
  }

  /* ---------- toasts, zone, HUD ---------- */
  let toastTimer = null;
  function toast(html, ms = 3200) {
    const t = $('#toast');
    t.innerHTML = html; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), ms);
  }
  let lastZone = '';
  function zone(name, city) {
    if (name === lastZone) return; lastZone = name;
    const z = $('#zone');
    z.querySelector('.zn').textContent = name;
    z.dataset.city = city || '';
    z.classList.remove('pop'); void z.offsetWidth; z.classList.add('pop');
  }
  function secrets(n, total) { $('#hud .secrets b').textContent = `${n}/${total}`; }
  function setSound(m) { $('#hud .snd').classList.toggle('off', m); }

  /* ---------- map + journal ---------- */
  let mapOpen = false;
  function toggleMap(force) {
    mapOpen = force ?? !mapOpen;
    $('#map').classList.toggle('on', mapOpen);
    if (mapOpen) { Game.drawMap($('#map canvas')); buildJournal(); SFX.open(); }
    else SFX.close();
  }
  function buildJournal() {
    const ul = $('#map .journal ul'); ul.innerHTML = '';
    const found = Game.found();
    for (const [id, name] of Object.entries(SECRETS)) {
      const li = el('li', found.has(id) ? 'got' : '', found.has(id) ? `✦ ${name}` : '· · · · · ·');
      ul.appendChild(li);
    }
    $('#map .journal h3 b').textContent = `${found.size}/${Object.keys(SECRETS).length}`;
  }

  /* ---------- recruiter mode ---------- */
  let cvOpen = false;
  function buildCV() {
    const c = $('#cv .doc');
    const sec = (title, inner) => `<section><h2>${title}</h2>${inner}</section>`;
    const row = e => `<article><header><h3>${e.org}${e.link ? ` · <a href="${e.link}" target="_blank" rel="noopener">${e.link.replace('https://', '')}</a>` : ''}</h3><span>${e.where} · ${e.when}</span></header><p class="role">${e.role}</p><ul>${e.points.map(p => `<li>${p}</li>`).join('')}</ul></article>`;
    c.innerHTML = `
      <header class="top"><h1>${ME.name}</h1><p>${ME.title}</p>
        <p class="contact"><a href="mailto:${ME.email}">${ME.email}</a> · <a href="${ME.github}" target="_blank" rel="noopener">github.com/artunbalta</a> · <a href="${ME.linkedin}" target="_blank" rel="noopener">linkedin.com/in/artunbalta</a></p>
        <p class="dl"><a class="btn" href="${ME.cv}" target="_blank" rel="noopener">Download the PDF ↓</a> <button class="btn ghost" data-back>← back to the world</button></p></header>
      ${sec('Profile', `<p>${CV.profile}</p>`)}
      ${sec('Education', CV.education.map(row).join(''))}
      ${sec('Research & Projects', CV.projects.map(p => `<article><header><h3>${p.name}${p.link ? ` · <a href="${p.link}" target="_blank" rel="noopener">${p.link.replace('https://', '')}</a>` : ''}</h3></header><ul>${p.points.map(x => `<li>${x}</li>`).join('')}</ul></article>`).join(''))}
      ${sec('Experience', CV.experience.map(row).join(''))}
      ${sec('Skills, Languages & Interests', `<dl>${CV.skills.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`)}
      <p class="foot">You skipped ${Object.keys(SECRETS).length} secrets to get here. Respect. They’ll wait.</p>`;
    c.querySelector('[data-back]').addEventListener('click', () => toggleCV(false));
  }
  function toggleCV(force) {
    cvOpen = force ?? !cvOpen;
    $('#cv').classList.toggle('on', cvOpen);
    if (cvOpen) { $('#cv .doc').scrollTop = 0; SFX.open(); if (window.Eggs && Eggs.observe) Eggs.observe('cv'); } else SFX.close();
  }

  return {
    init, say, choose, endDlg, advance, moveChoice, panel, custom, closePanel, toast, zone, secrets, setSound,
    toggleMap, toggleCV,
    get talking() { return open; }, get choosing() { return !!choiceState; },
    get panelOpen() { return panelOpen; }, get mapOpen() { return mapOpen; }, get cvOpen() { return cvOpen; },
    get busy() { return open || panelOpen || mapOpen || cvOpen; },
  };
})();
