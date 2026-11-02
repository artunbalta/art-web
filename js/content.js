'use strict';
/* =====================================================================
   content.js — every word in the world lives here.
   Edit freely: the CV data feeds both the in-world panels and the
   plain "recruiter mode" page.
   ===================================================================== */

const ME = {
  name: 'Artun Balta',
  title: 'Electrical & electronics engineer · neural signal processing · applied ML',
  city: 'London (via Ankara)',
  email: 'artun.balta@outlook.com',
  github: 'https://github.com/artunbalta',
  linkedin: 'https://linkedin.com/in/artunbalta',
  volina: 'https://volina.ai',
  echo: 'https://echovirtualworld.com',
  scrollio: 'https://scrollio.co',
  cv: 'assets/Artun_Balta_CV.pdf',
};

const CV = {
  profile: 'Electrical and electronics engineer working at the intersection of neural signal processing and applied machine learning. MRes Neurotechnology researcher at Imperial College London, decoding auditory attention from single-neuron recordings, and co-founder of a funded AI voice-agent company with a shipped product and five clinic pilots.',
  education: [
    { id: 'imperial', org: 'Imperial College London', role: 'MRes Neurotechnology', where: 'London, UK', when: '2026 – 2027',
      points: ['Thesis (supervisor: Dr. Andriy Kozlov): <em>Auditory Attention Decoding — Adapting Dynamic Spectrotemporal Receptive Fields to Single-Neuron Spike Recordings.</em> Extends deep-network dSTRF estimation from population-level ECoG to single-unit spike trains, introducing Poisson likelihood formulations and sparsity handling to characterise nonlinear tuning in the auditory pathway.'] },
    { id: 'bilkent', org: 'İhsan Doğramacı Bilkent University', role: 'B.Sc. Electrical and Electronics Engineering', where: 'Ankara, Türkiye', when: '2021 – 2026',
      points: ['<b>1st Place</b> (12 teams), Graduation Project Competition — with <a href="https://scrollio.co" target="_blank" rel="noopener">Scrollio</a>', '<b>2nd Place</b> (45 teams), Bilkentpreneurs Challenge 2026 — $3,000 in prize funding', 'Bilkent Entrepreneurship Award'] },
    { id: 'lycee', org: 'Lycée Tevfik Fikret', role: 'High School, Mathematics & Sciences', where: 'Ankara, Türkiye', when: '2010 – 2021',
      points: ['High Honour graduate on academic scholarship', 'Top 0.2% nationally in the YKS 2021 entrance exam, among 3M+ candidates', '<b>2nd Place</b>, Mathématiques Sans Frontières'] },
  ],
  projects: [
    { id: 'mri', name: 'Parallel MRI Reconstruction: Kernel Geometry under Anisotropic Sampling',
      points: ['Gained <b>0.65 dB</b> and matched — with <b>11</b> calibration taps — the reconstruction quality the standard rule needed <b>19</b> taps to reach, by deriving the kernel-support rule from acquisition physics rather than an arbitrary index-space convention. Validated across <b>8,947</b> paired reconstructions against an exact null control.',
        'Showed that a published kernel-shape equivalence breaks down on anisotropic acquisition grids, and exposed a fault in the reference pipeline that invalidated <b>27 of 36</b> cells in the comparison it was built to support.'] },
    { id: 'eeg', name: 'Decoding Imagined Speech from Non-Invasive EEG',
      points: ['Reached <b>46%</b> cross-validated accuracy against a <b>25%</b> chance baseline. Built a kernel SVM with sequential minimal optimisation, Bayesian logistic regression and an EEGNet-class convolutional network from first principles in NumPy, hand-deriving every gradient with no autograd.',
        'A cross-corpus control isolated the near-chance ceiling as a property of the dataset rather than the pipeline.'] },
    { id: 'jenga', name: 'Autonomous Jenga-Playing Robot',
      points: ['Hierarchical control stack coupling a learned discrete block-selection policy to an optimisation-based motion planner, bridging reinforcement learning and continuous trajectory synthesis for contact-rich manipulation.'] },
    { id: 'scrollio', name: 'Scrollio — graduation project', link: 'https://scrollio.co',
      points: ['<b>Turn scrolling into learning.</b> An AI-powered learning playground that borrows the pull of short-video feeds for education.',
        '<b>Scrollio Kids:</b> drawing is the first interface — a child draws a mentor, and Scrollio turns the drawing into one. <b>Scrollio Core:</b> a feed of short clips, because one short clip can land harder than a long lecture.',
        '<b>1st place</b> among 12 teams at Bilkent’s Graduation Project Competition.'] },
    { id: 'echo', name: 'echo — side project', link: 'https://echovirtualworld.com',
      points: ['<b>A world that learns you.</b> An open world that reads human intention from play alone: every move a player makes is recorded and folded into a Bayesian model, until the world has their <em>echo</em>.',
        '“A living world. A place of your own.”'] },
    { id: 'more', name: 'Further coursework projects',
      points: ['Medical visual question answering by low-rank adaptation (LoRA) of a vision-language model', 'Convolutional classifier built from scratch to discriminate real from synthetic faces', 'FPGA colour-sensing joint controller in VHDL', 'ARM Cortex-M0+ interactive embedded system', 'Tesla coil, and a JFET high-impedance probe for non-contact electric-field measurement'] },
  ],
  experience: [
    { id: 'volina', org: 'volina.', role: 'Co-Founder', where: 'Ankara, Türkiye', when: '2025 – present', link: 'https://volina.ai',
      points: ['AI voice-agent platform for Turkish health-tourism dental clinics, re-engaging dormant international leads with agents that profile callers in real time and adapt tone, objection handling and pacing mid-conversation.',
        'Delivered <b>five clinic pilots</b> covering roughly <b>40,000 leads</b>, with per-pilot conversion rates of <b>1.2% to 3.8%</b>. Raised <b>$25K at $833K pre-money</b>, with KVKK and GDPR-compliant call handling and consent capture built into the platform.'] },
    { id: 'mimlab', org: 'Boğaziçi University MIMLAB', role: 'Volunteer Researcher', where: 'İstanbul, Türkiye', when: '2025 – 2026',
      points: ['Multimodal EEG preprocessing and classification: adaptive filtering against physiological reference channels, artefact evaluation, ERP extraction from n-back tasks, and machine-learning models for cognitive-workload state classification.'] },
    { id: 'aselsan', org: 'ASELSAN', role: 'Radar Systems Engineering Intern', where: 'Ankara, Türkiye', when: 'July – August 2024',
      points: ['Signal-processing optimisation for airborne radar systems: CFAR detection, pulse compression and pulse integration, improving detection accuracy and range through SNR enhancement.'] },
    { id: 'girvak', org: 'Turkish Entrepreneurship Foundation (GirVak)', role: 'Fellow', where: 'İstanbul, Türkiye', when: '2023 – 2026',
      points: ['One of <b>28 Fellows</b> selected from <b>154,558</b> applicants to Türkiye’s leading entrepreneurship programme; previously one of 100 Challengers selected from 149,766 applicants.'] },
    { id: 'ta', org: 'Bilkent University Physics Laboratory', role: 'Teaching Assistant', where: 'Ankara, Türkiye', when: '2023 – 2024',
      points: ['Teaching assistant for PHYS102 (General Physics II) and laboratory tutor for PHYS101 (General Physics I).'] },
  ],
  skills: [
    ['Programming', 'Python (NumPy, SciPy, PyTorch, scikit-learn, MNE, pandas), MATLAB, C, C++, JavaScript/TypeScript, VHDL'],
    ['Methods', 'Neural signal processing (EEG, ECoG, ERP, spike trains), Bayesian inference, Monte Carlo simulation, deep learning, parallel MRI reconstruction, LLM fine-tuning (LoRA)'],
    ['Tools', 'Git, Docker, LTspice, LaTeX'],
    ['Languages', 'Turkish (native) · English (IELTS Academic 7.5) · French (DELF B2)'],
    ['Interests', 'Stand-up comedy, mechanical watches, quantitative horse-racing form modelling'],
  ],
};

/* ---------- panel builders ---------- */
const byId = (list, id) => list.find(e => e.id === id);
function entryHTML(e, extra = '') {
  return `<div class="meta"><span>${e.role || ''}</span><span>${e.where} · ${e.when}</span></div>
    <ul>${e.points.map(p => `<li>${p}</li>`).join('')}</ul>${extra}`;
}
function projectHTML(p, extra = '') { return `<ul>${p.points.map(x => `<li>${x}</li>`).join('')}</ul>${extra}`; }
const aside = (t) => `<p class="aside">${t}</p>`;

const PANELS = {
  home: () => ({
    kicker: 'Home · Ankara', title: ME.name, accent: 'teal',
    body: `<p class="lead">${CV.profile}</p>
      <p>Grew up in Ankara, studied electrical engineering, fell into brains, and moved to London in September 2026. I like problems where the data is noisy and the answer is hiding in it.</p>
      <p>When I’m not doing that: <a href="${ME.echo}" target="_blank" rel="noopener">echo</a>, a world that learns you — and my graduation project, <a href="${ME.scrollio}" target="_blank" rel="noopener">Scrollio</a>, which turns scrolling into learning.</p>
      <div class="facts">
        <div><b>Now</b><span>MRes Neurotechnology, Imperial</span></div>
        <div><b>Building</b><span>volina. (co-founder) · echo</span></div>
        <div><b>Speaks</b><span>Turkish · English · French</span></div>
        <div><b>Off-duty</b><span>stand-up, watches, horses (in spreadsheets)</span></div>
      </div>
      ${linksHTML()}
      ${aside('This house is mostly door. Everything else is outside — go poke at it.')}`,
  }),
  contact: () => ({
    kicker: 'Mailbox', title: 'Write to Artun', accent: 'blue',
    body: `<p class="lead">The flag is up. That means I’d genuinely like to hear from you — research, startups, a good joke, a watch recommendation.</p>${linksHTML(true)}`,
  }),
  skills: () => ({
    kicker: 'The Tool Shed', title: 'Skills & languages', accent: 'brown',
    body: `<dl class="skills">${CV.skills.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>${aside('Every tool on the wall has been used in anger at least once. The soldering iron twice.')}`,
  }),
  imperial: () => ({ kicker: 'South Kensington · now', title: 'Imperial College London', accent: 'navy',
    body: `<p class="lead">Picture a loud party. Somehow your brain locks onto one voice and turns the rest into soup. My thesis asks how single neurons in the auditory pathway pull that off.</p>${entryHTML(byId(CV.education, 'imperial'))}${aside('Stand next to someone at the party on the lawn. Watch what happens to the other voices.')}` }),
  bilkent: () => ({ kicker: 'School Hill · 2021–2026', title: 'Bilkent University · EEE', accent: 'brick', body: entryHTML(byId(CV.education, 'bilkent')) + aside('The trophy outside is real-ish. The cheque is definitely too big to cash.') }),
  lycee: () => ({ kicker: 'School Hill · 2010–2021', title: 'Lycée Tevfik Fikret', accent: 'blue', body: entryHTML(byId(CV.education, 'lycee')) + aside('Eleven years at a French lycée in Ankara. Hence the DELF B2, and the strong opinions about croissants.') }),
  ta: () => ({ kicker: 'School Hill · 2023–2024', title: 'Physics Lab · Teaching Assistant', accent: 'blue', body: entryHTML(byId(CV.experience, 'ta')) + aside('Most-asked question: “Is this on the exam?” Answer, every time: gravity is on every exam. You’re taking it right now.') }),
  volina: () => ({ kicker: 'Work Street · 2025–now', title: 'volina.', accent: 'violet', body: entryHTML(byId(CV.experience, 'volina'), `<p><a href="${ME.volina}" target="_blank" rel="noopener">volina.ai ↗</a></p>`) + aside('Voli, our mascot, is standing outside. If a phone rings somewhere in London, that’s probably Voli too.') }),
  scrollio: () => ({ kicker: 'School Hill · graduation project', title: 'Scrollio', accent: 'gold', body: projectHTML(byId(CV.projects, 'scrollio'), `<p><a href="${ME.scrollio}" target="_blank" rel="noopener">scrollio.co ↗</a></p>`) + aside('The giant phone outside lets you draw a mentor. It moves in next to the phone.') }),
  echo: () => ({ kicker: 'Lab Garden · side project', title: 'echo', accent: 'violet', body: projectHTML(byId(CV.projects, 'echo'), `<p><a href="${ME.echo}" target="_blank" rel="noopener">echovirtualworld.com ↗</a></p>`) + aside('This little world has been doing a tiny version of the same thing to you since you arrived. Step through the doorway.') }),
  aselsan: () => ({ kicker: 'Work Street · summer 2024', title: 'ASELSAN · Radar Intern', accent: 'navy', body: entryHTML(byId(CV.experience, 'aselsan')) + aside('The radar in the yard still works. Ask the guard nicely.') }),
  mimlab: () => ({ kicker: 'Boğaziçi Hill · 2025–2026', title: 'Boğaziçi MIMLAB', accent: 'red', body: entryHTML(byId(CV.experience, 'mimlab')) + aside('There’s a workload test at the terminal by the door. Your brain will hate it.') }),
  girvak: () => ({ kicker: 'İstanbul · 2023–2026', title: 'GirVak Fellowship', accent: 'gold', body: entryHTML(byId(CV.experience, 'girvak')) + aside('28 out of 154,558 is 0.018%. The lottery machine outside has better odds. Slightly.') }),
  mri: () => ({ kicker: 'Lab Garden · research', title: 'Parallel MRI reconstruction', accent: 'teal', body: projectHTML(byId(CV.projects, 'mri')) }),
  eeg: () => ({ kicker: 'Lab Garden · research', title: 'Imagined speech from EEG', accent: 'violet', body: projectHTML(byId(CV.projects, 'eeg')) }),
  jenga: () => ({ kicker: 'Lab Garden · robotics', title: 'Autonomous Jenga robot', accent: 'brown', body: projectHTML(byId(CV.projects, 'jenga')) }),
  more: () => ({ kicker: 'Lab Garden · coursework', title: 'More things I built', accent: 'teal', body: projectHTML(byId(CV.projects, 'more')) + aside('Most of these are standing around this garden. The Tesla coil bites.') }),
  comedy: () => ({ kicker: 'Interest #1', title: 'Stand-up comedy', accent: 'violet', body: `<p class="lead">A room full of strangers, five minutes, no slides. Turns out it’s the best training for explaining neuroscience at parties.</p>` }),
  watches: () => ({ kicker: 'Interest #2', title: 'Mechanical watches', accent: 'gold', body: `<p class="lead">A balance wheel beating 28,800 times an hour, no battery, a few seconds of drift a day. Strictly worse than a phone. Strictly better than a phone.</p>` }),
  horses: () => ({ kicker: 'Interest #3', title: 'Quantitative form modelling', accent: 'green', body: `<p class="lead">Racing form is a gloriously messy dataset: tiny samples, hidden state, and a target that occasionally eats a sandwich. Bayesian priors and Monte Carlo help. The horse still doesn’t care.</p>` }),
};
function linksHTML(big) {
  return `<div class="links${big ? ' big' : ''}">
    <a href="mailto:${ME.email}">✉ ${ME.email}</a>
    <a href="${ME.github}" target="_blank" rel="noopener">GitHub ↗</a>
    <a href="${ME.linkedin}" target="_blank" rel="noopener">LinkedIn ↗</a>
    <a href="${ME.cv}" target="_blank" rel="noopener">CV (PDF) ↓</a>
  </div>`;
}

/* ---------- secrets ---------- */
const SECRETS = {
  pasa: 'Paşa approves', balta: 'The family axe', bench: 'Time flies', zap: 'Conductive hair',
  mri: 'Brain scan: unremarkable', mind: 'Mind, read (46%)', jenga: 'Contact-rich failure', arcade: 'Reaction time',
  faces: 'Real or synthetic?', xray: 'Ask the X-ray', radar: 'Constant false alarm rate', apple: 'Gravity, applied',
  msf: 'Mathématiques Sans Frontières', trophy: 'Polished the trophy', nback: 'Cognitive workload', lottery: 'Persistence noted',
  cay: 'Tavşan kanı', gull: 'İstanbul tax', fish: 'Rastgele', island: 'Message in a bottle', train: 'Rode the spike train',
  party: 'Cocktail party effect', chime: 'Westminster quarters', tenten: '10:10', comedy: 'Tight five', volina: 'Dormant lead, re-engaged',
  race: 'Beat the form model', milktea: 'Diplomatic incident', konami: '↑↑↓↓←→←→BA', teyze: 'Fed by teyze', mouser: 'Chief Mouser (Acting)',
  echo: 'Met your echo', mentor: 'Drew a mentor',
};

/* ---------- writing that isn't a CV ---------- */
const JOKES = [
  'My thesis is auditory attention decoding — a machine that can tell who you’re actually listening to. My mum has had this technology since 1999.',
  'My startup builds AI agents that call people who stopped replying. My friends say I’ve finally found a way to scale my personality.',
  'I moved from Ankara to London. The weather’s basically the same. The only difference is the rain now has an accent.',
  'In London they put milk in tea. In Turkey, if you put milk in tea, the tea calls the police.',
  'I worked on radar. CFAR — Constant False Alarm Rate. It’s also how my mum calls me: steady, reliable, and every single one is a false alarm.',
  'I decoded imagined speech from EEG at 46% accuracy. Chance is 25%. So I can read your mind about as well as a coin with ambition.',
  'I built a neural network in NumPy and derived every gradient by hand. No autograd. Was it necessary? No. Was it character-building? Also no.',
  'In MRI you can skip half the measurements and reconstruct the rest. I tried that with my lecture notes. The professor called it “aliasing”.',
  'Top 0.2% in the national exam. Bottom 0.2% in parallel parking.',
  'I collect mechanical watches. Less accurate than my phone, more expensive than my phone, and they need winding. It’s not a hobby. It’s a hostage situation.',
  'I model horse races with Bayesian priors and Monte Carlo simulation. Net result: the horse doesn’t care.',
  'I study single neurons. They fire, they rest, they fire again for no clear reason. Honestly? Relatable.',
  'In Turkey, when a guest says “no thanks” to tea, that’s the opening bid.',
];
const CATCHES = [
  ['a fish', 'It’s a fish. Respect the classics.'],
  ['an old boot', 'Size 43. Not yours. Probably.'],
  ['a 2021 exam booklet', 'Top 0.2%. Someone dropped this on purpose.'],
  ['a mechanical watch', 'It’s still ticking. 28,800 beats an hour, underwater. Impressive.'],
  ['an EEG electrode', 'Still has gel on it. Put it back.'],
  ['a GRAPPA kernel', '11 taps. Physics-derived. Someone’s been here.'],
  ['a simit', 'Soggy. The seagulls will still fight you for it.'],
  ['nothing', 'The fish are in a meeting.'],
];
const PARTY = [
  { clear: '...SO I SAID THE STRF IS JUST A FANCY LINEAR FILTER. HE DID NOT LIKE THAT.', say: '…so I said the STRF is just a fancy linear filter. He did not like that.' },
  { clear: 'SPIKES ARE COUNTS! POISSON! I WILL DIE ON THIS HILL.', say: 'Spikes are counts! Poisson! I will die on this hill.' },
  { clear: 'YOUR BRAIN PICKS ONE VOICE OUT OF A CROWD. IT IS DOING IT RIGHT NOW.', say: 'You know your brain picks one voice out of a crowd? It’s doing it right now.' },
  { clear: 'MOSTLY I AM HERE FOR THE CANAPÉS.', say: 'Honestly? Mostly here for the canapés.' },
];
const MENTOR_FACTS = [
  'Your brain runs on about 20 watts. A fridge light bulb uses more.',
  'You can’t tickle yourself. Your brain predicts the touch and turns it down.',
  'After a neuron fires, it needs a short rest before it can fire again. That pause is called the refractory period.',
  'An MRI scanner doesn’t take a photo. It listens to protons wobbling in a magnetic field.',
  'Octopuses keep most of their neurons in their arms.',
  'The cocktail party effect is why you hear your own name across a loud room.',
  'Every colour on a screen is just red, green and blue light, mixed.',
  'Sound travels about four times faster in water than in air.',
];
const HINTS = [
  'At the bottom of the Lab Garden there’s a doorway that has been watching you. Kindly.',
  'On School Hill there’s a phone the size of a person. Draw on it.',
  'The guard at ASELSAN will let you use the radar. It sees things you haven’t found yet.',
  'Somebody keeps calling the red phone box in London. Pick up.',
  'There’s a bench by the fountain. Sitting on it is… time-consuming.',
  'Never hold a simit near the sea in İstanbul.',
  'The island in the Channel isn’t on any tourist map. There’s a rowboat at the pier.',
  'Old video game codes still work in some places. ↑↑↓↓…',
  'The clock tower is real. As in, it shows the actual time in London right now.',
];
