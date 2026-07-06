/* ============================================================================
   guides.js — single source of truth for the Interactive Guides.

   TO ADD A NEW GUIDE:
     1. Create the guide's .html file in this folder.
     2. Add ONE entry to the GUIDES array below.
     3. In the new .html file, add this line just before </body>:
          <script src="guides.js" data-guide-nav></script>

   That's it. The landing-page cards (index.html) and the "Guides" switcher on
   every page are both generated from this list, so they stay in sync.
   ========================================================================== */

const GUIDES = [
  {
    file:  'communist-theory-interactive.html',
    part:  'Part 1 · The Engine',
    title: 'How Capitalism Actually Works',
    short: 'The Engine',
    desc:  'A zero-to-hero walk through the mechanics: where profit comes from, why crises recur, and what the alternatives actually propose.',
    badges: [{ text: '~25 min read' }, { text: 'Interactive', format: true }],
  },
  {
    file:  'imperialism-guide.html',
    part:  'Part 2 · The Global Picture',
    title: 'Where Did the Wealth Actually Go?',
    short: 'The Global Picture',
    desc:  'The system extended outward: colonial extraction, debt, coups, and why there are no poor nations, only extracted ones.',
    badges: [{ text: '~15 min read' }, { text: 'Interactive', format: true }],
  },
  {
    file:  'palestine-guide.html',
    part:  'Part 3 · The Case Study',
    title: 'Palestine &amp; Israel: Understanding the Context',
    short: 'The Case Study',
    desc:  'Cut through the noise and the 30-second video clips. A clear, chronological history of the region from its origins to the present, built on verified facts and cited sources.',
    badges: [{ text: '~12 min read' }, { text: 'Interactive Timeline', format: true }],
  },
  {
    file:  'deception-guide.html',
    part:  'Part 4 · The Deception',
    title: 'What Western Governments Hid From Their Own People',
    short: 'The Deception',
    desc:  "Fabricated wars, secret experiments on citizens, mass surveillance denied under oath — all confirmed by declassified files and the governments' own admissions.",
    badges: [{ text: '~20 min read' }, { text: 'Interactive', format: true }],
  },
  {
    file:  'vc-genocide-guide.html',
    part:  'Part 5 · The Money',
    title: 'The Money Behind It: Venture Capital and the Genocide',
    short: 'The Money',
    desc:  'Who is funding it. What they built. How they are watching you. The venture capital network, the surveillance apparatus, and the plan for what comes next.',
    badges: [{ text: '~15 min read' }, { text: 'Interactive', format: true }],
  },
  {
    file:  'mirror-guide.html',
    part:  'Part 6 · The Mirror',
    title: 'Unlearning the Double Standard',
    short: 'The Mirror',
    desc:  'The capstone. Every charge levelled at "authoritarian" states — surveillance, crushed dissent, forced labor, rigged politics — with the flag stripped off. A declassified CIA file, a quiz that answers itself, and two lenses for reading everything you just learned.',
    badges: [{ text: '~15 min read' }, { text: 'Interactive Quiz', format: true }],
  },
];

/* ── The filename of the page we're currently on ────────────────────────── */
function currentFile() {
  const path = location.pathname.split('/').pop();
  return path || 'index.html';
}

/* ── Landing page: build the guide cards ────────────────────────────────── */
function renderCards(container) {
  container.innerHTML = GUIDES.map(g => {
    const badges = g.badges
      .map(b => `<span class="badge${b.format ? ' format' : ''}">${b.text}</span>`)
      .join('');
    return `
      <a class="card" href="${g.file}">
        <div class="part">${g.part}</div>
        <h2>${g.title}</h2>
        <p>${g.desc} <span class="go">Start reading →</span></p>
        <div class="badge-row">${badges}</div>
      </a>`;
  }).join('');
}

/* ── Guide pages: inject the floating home button + switcher ─────────────── */
function injectNav() {
  const here = currentFile();

  const style = document.createElement('style');
  style.textContent = `
    #guide-switcher { position: fixed; top: 6px; left: 10px; z-index: 101;
      font-family: 'DM Sans', sans-serif; }
    #guide-switcher .gs-btn {
      display: inline-flex; align-items: center; gap: .4rem; cursor: pointer;
      background: rgba(18,18,14,.95); backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(200,184,130,.3); border-radius: 2rem;
      color: #C8B882; font-size: .72rem; font-weight: 600;
      letter-spacing: .08em; text-transform: uppercase;
      padding: .35rem .8rem; line-height: 1; transition: border-color .2s, color .2s; }
    #guide-switcher .gs-btn:hover { border-color: rgba(200,184,130,.6); color: #E4DCC4; }
    #guide-switcher .gs-btn .gs-caret { font-size: .6rem; opacity: .7; }
    #guide-switcher .gs-panel {
      position: absolute; top: calc(100% + 6px); left: 0;
      min-width: 240px; max-width: min(88vw, 320px);
      max-height: 78vh; overflow-y: auto;
      background: rgba(18,18,14,.97); backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(200,184,130,.22); border-radius: 8px;
      padding: .4rem; box-shadow: 0 12px 40px rgba(0,0,0,.55);
      display: none; }
    #guide-switcher.open .gs-panel { display: block; }
    #guide-switcher.open .gs-btn { border-color: rgba(200,184,130,.6); color: #E4DCC4; }
    #guide-switcher .gs-item {
      display: block; text-decoration: none; color: #C0B8A8;
      padding: .55rem .7rem; border-radius: 5px; transition: background .15s, color .15s; }
    #guide-switcher .gs-item:hover { background: rgba(200,184,130,.08); color: #E4DCC4; }
    #guide-switcher .gs-item .gs-part {
      display: block; font-size: .6rem; letter-spacing: .12em; text-transform: uppercase;
      color: #8A8268; font-weight: 700; margin-bottom: .15rem; }
    #guide-switcher .gs-item .gs-title { font-size: .9rem; line-height: 1.3; }
    #guide-switcher .gs-item.current { color: #C8B882; cursor: default; }
    #guide-switcher .gs-item.current:hover { background: rgba(200,184,130,.06); }
    #guide-switcher .gs-item.current .gs-title::after { content: ' ·'; }
    #guide-switcher .gs-home { color: #C8B882; font-weight: 600; }
    #guide-switcher .gs-home .gs-title { font-size: .82rem; letter-spacing: .05em;
      text-transform: uppercase; }
    #guide-switcher .gs-sep { height: 1px; background: rgba(200,184,130,.14);
      margin: .35rem .3rem; }
  `;
  document.head.appendChild(style);

  const items = GUIDES.map(g => {
    const isCurrent = g.file === here;
    if (isCurrent) {
      return `<span class="gs-item current"><span class="gs-part">${g.part}</span>` +
             `<span class="gs-title">${g.title}</span></span>`;
    }
    return `<a class="gs-item" href="${g.file}"><span class="gs-part">${g.part}</span>` +
           `<span class="gs-title">${g.title}</span></a>`;
  }).join('');

  const wrap = document.createElement('div');
  wrap.id = 'guide-switcher';
  wrap.innerHTML = `
    <button class="gs-btn" type="button" aria-haspopup="true" aria-expanded="false">
      <span aria-hidden="true">☰</span> Guides <span class="gs-caret" aria-hidden="true">▾</span>
    </button>
    <div class="gs-panel" role="menu">
      <a class="gs-item gs-home" href="index.html"><span class="gs-title">⌂ All Guides · Home</span></a>
      <div class="gs-sep"></div>
      ${items}
    </div>`;
  document.body.appendChild(wrap);

  const btn = wrap.querySelector('.gs-btn');
  const setOpen = (open) => {
    wrap.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!wrap.classList.contains('open'));
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

/* ── Dispatch based on the flag on this script's own tag ─────────────────── */
(function () {
  const mode = document.currentScript.dataset;
  const run = () => {
    if ('guideIndex' in mode) {
      const container = document.getElementById('guides-list');
      if (container) renderCards(container);
    } else if ('guideNav' in mode) {
      injectNav();
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
