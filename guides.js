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
    desc:  "Fabricated wars, secret experiments on citizens, mass surveillance denied under oath, all confirmed by declassified files and the governments' own admissions.",
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
    desc:  'The capstone. Every charge levelled at "authoritarian" states, surveillance, crushed dissent, forced labor, rigged politics, with the flag stripped off. A declassified CIA file, a quiz that answers itself, and two lenses for reading everything you just learned.',
    badges: [{ text: '~15 min read' }, { text: 'Interactive Quiz', format: true }],
  },
];

/* ── The filename of the page we're currently on ────────────────────────── */
function currentFile() {
  const path = location.pathname.split('/').pop();
  return path || 'index.html';
}

/* ── Reading state: one localStorage entry per guide, fails silently ─────── */
const STORE_PREFIX = 'ig:v1:';

function readGuideState(file) {
  try {
    return JSON.parse(localStorage.getItem(STORE_PREFIX + file));
  } catch (_) { return null; }
}

function writeGuideState(file, state) {
  try {
    localStorage.setItem(STORE_PREFIX + file, JSON.stringify(state));
  } catch (_) {}
}

/* ── Landing page: build the guide cards ────────────────────────────────── */
function renderCards(container) {
  container.innerHTML = GUIDES.map(g => {
    const badges = g.badges
      .map(b => `<span class="badge${b.format ? ' format' : ''}">${b.text}</span>`)
      .join('');
    const st = readGuideState(g.file);
    const inProgress = !!(st && !st.done && st.current && st.current !== 'start');
    const progressBadge = st && st.done
      ? '<span class="badge format">✓ Read</span>'
      : (inProgress && st.pct > 0 ? `<span class="badge">${st.label} · ${st.pct}%</span>` : '');
    const href = inProgress ? `${g.file}#${st.current}` : g.file;
    const cta = inProgress ? 'Continue →' : 'Start reading →';
    return `
      <a class="card" href="${href}">
        <div class="part">${g.part}</div>
        <h2>${g.title}</h2>
        <p>${g.desc} <span class="go">${cta}</span></p>
        <div class="badge-row">${progressBadge}${badges}</div>
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

/* ── Guide pages: hash routing + resume-where-you-left-off ─────────────────
   Wraps the guide's inline go() so every navigation updates the URL hash
   (browser back/forward walks the stations, stations are shareable links)
   and persists reading state. Reads the engine's top-level bindings
   (progressMap, diveParent, visited) by bare name — the inline engine script
   runs before this file, and all reads are typeof-guarded because the
   bindings vary per guide (vc-genocide has no diveParent, etc.). */
function enhanceGuide() {
  const origGo = window.go;
  if (typeof origGo !== 'function' || typeof window.updateNav !== 'function') return;

  const file = currentFile();
  const exists = id => !!document.getElementById('passage-' + id);
  const stations = Array.from(document.querySelectorAll('.nav-stop[data-passage]'))
    .map(el => el.dataset.passage);
  const pctOf = id =>
    (typeof progressMap !== 'undefined' && progressMap[id] != null) ? progressMap[id] : 0;
  const parentOf = id =>
    (typeof diveParent !== 'undefined' && diveParent[id]) || null;
  const visitedSet =
    (typeof visited !== 'undefined' && visited instanceof Set) ? visited : null;
  const hashId = () => {
    try { return decodeURIComponent(location.hash.slice(1)); }
    catch (_) { return location.hash.slice(1); }
  };

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  let activeId = 'start';
  let fromHash = false;

  function save(id) {
    const prev = readGuideState(file) || {};
    const eff = parentOf(id) || id;   // credit a dive to its parent station
    const n = stations.indexOf(eff);
    const label = n > 0 ? `Station ${n} of ${stations.length - 1}`
                : n === 0 ? 'Intro'
                : prev.label || 'In progress';
    const pct = pctOf(id);
    writeGuideState(file, {
      current: id,
      visited: visitedSet ? Array.from(visitedSet) : [id],
      pct,
      label,
      done: prev.done === true || pct >= 100,
      t: Date.now(),
    });
  }

  window.go = function (id) {
    origGo(id);
    if (!exists(id)) return;   // origGo bailed early; nothing changed
    activeId = id;
    dismissResume();
    if (!fromHash && hashId() !== id &&
        !(id === 'start' && location.hash === '')) {
      location.hash = id;      // plain assignment → one history entry per step
    }
    save(id);
  };

  window.addEventListener('hashchange', () => {
    const id = hashId() || 'start';
    if (id === activeId) return;   // echo of our own hash write above
    if (id !== 'start' && !exists(id)) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    fromHash = true;
    window.go(exists(id) ? id : 'start');
    fromHash = false;
  });

  /* Initial load — precedence: URL hash > resume prompt > start. */
  const saved = readGuideState(file);
  if (visitedSet && saved && Array.isArray(saved.visited)) {
    saved.visited.forEach(v => { if (exists(v)) visitedSet.add(v); });
  }
  const h = hashId();
  if (h && exists(h)) {
    fromHash = true;
    window.go(h);
    fromHash = false;
  } else if (h) {
    history.replaceState(null, '', location.pathname + location.search);
    window.updateNav();
  } else {
    window.updateNav();   // repaint chips with the restored visited set
    if (saved && !saved.done && saved.current &&
        saved.current !== 'start' && exists(saved.current)) {
      showResumeBanner(saved);
    }
  }
}

function showResumeBanner(saved) {
  const style = document.createElement('style');
  style.textContent = `
    #guide-resume { position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
      z-index: 102; display: flex; align-items: center; gap: .5rem;
      background: rgba(18,18,14,.95); backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(200,184,130,.3); border-radius: 2rem;
      padding: .45rem .45rem .45rem 1rem; max-width: min(92vw, 480px);
      font-family: 'DM Sans', sans-serif; box-shadow: 0 8px 30px rgba(0,0,0,.5); }
    #guide-resume .gr-text { color: #C0B8A8; font-size: .8rem; line-height: 1.35; }
    #guide-resume .gr-text strong { color: #E4DCC4; font-weight: 600; }
    #guide-resume .gr-go { cursor: pointer; border: 1px solid rgba(200,184,130,.45);
      background: rgba(200,184,130,.12); color: #C8B882; border-radius: 2rem;
      font-family: inherit; font-size: .72rem; font-weight: 600; letter-spacing: .06em;
      text-transform: uppercase; padding: .38rem .85rem; line-height: 1;
      white-space: nowrap; transition: border-color .2s, color .2s; }
    #guide-resume .gr-go:hover { border-color: rgba(200,184,130,.8); color: #E4DCC4; }
    #guide-resume .gr-x { cursor: pointer; border: none; background: none;
      color: #8A8268; font-size: .95rem; line-height: 1; padding: .35rem .55rem; }
    #guide-resume .gr-x:hover { color: #E4DCC4; }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.id = 'guide-resume';
  wrap.innerHTML = `
    <span class="gr-text">Continue where you left off ·
      <strong>${saved.label || 'In progress'}</strong></span>
    <button class="gr-go" type="button">Continue</button>
    <button class="gr-x" type="button" aria-label="Dismiss">✕</button>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector('.gr-go').addEventListener('click', () => window.go(saved.current));
  wrap.querySelector('.gr-x').addEventListener('click', dismissResume);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dismissResume();
  });
}

function dismissResume() {
  const el = document.getElementById('guide-resume');
  if (el) el.remove();
}

/* ── Annotate mode: leave feedback notes directly on a guide page ─────────
   Opt-in and invisible to normal readers. Visit any guide once with
   ?annotate=1 to turn it on (persists via localStorage across all guides).
   While armed, clicking a paragraph/line opens a small note box; notes are
   saved locally and exported as JSON to hand to Claude in one batch. */
const ANNOT_FLAG = 'ig:annotate';
const ANNOT_STORE = 'ig:feedback:v1';

function annotateEnabled() {
  try { return localStorage.getItem(ANNOT_FLAG) === '1'; } catch (_) { return false; }
}

function readNotes() {
  try { return JSON.parse(localStorage.getItem(ANNOT_STORE)) || []; } catch (_) { return []; }
}

function writeNotes(notes) {
  try { localStorage.setItem(ANNOT_STORE, JSON.stringify(notes)); } catch (_) {}
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function initAnnotate() {
  try {
    if (new URLSearchParams(location.search).has('annotate')) {
      localStorage.setItem(ANNOT_FLAG, '1');
    }
  } catch (_) {}
  if (!annotateEnabled()) return;

  let armed = false;

  const style = document.createElement('style');
  style.textContent = `
    #ig-annot { position: fixed; bottom: 18px; right: 14px; z-index: 103;
      font-family: 'DM Sans', sans-serif; }
    #ig-annot .ia-btn { display: inline-flex; align-items: center; gap: .4rem; cursor: pointer;
      background: rgba(18,18,14,.95); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(200,184,130,.3); border-radius: 2rem; color: #C8B882;
      font-size: .72rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
      padding: .45rem .9rem; line-height: 1; transition: border-color .2s, color .2s; }
    #ig-annot .ia-btn:hover { border-color: rgba(200,184,130,.6); color: #E4DCC4; }
    #ig-annot.open .ia-btn { border-color: rgba(200,184,130,.6); color: #E4DCC4; }
    #ig-annot .ia-panel { position: absolute; bottom: calc(100% + 8px); right: 0;
      width: min(88vw, 340px); max-height: 70vh; overflow-y: auto;
      background: rgba(18,18,14,.97); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(200,184,130,.22); border-radius: 8px; padding: .6rem;
      box-shadow: 0 12px 40px rgba(0,0,0,.55); display: none; }
    #ig-annot.open .ia-panel { display: block; }
    #ig-annot .ia-row { display: flex; align-items: center; justify-content: space-between;
      gap: .5rem; padding: .3rem .2rem; }
    #ig-annot .ia-arm { cursor: pointer; border: 1px solid rgba(200,184,130,.4);
      background: rgba(200,184,130,.08); color: #C0B8A8; border-radius: 2rem;
      font-family: inherit; font-size: .68rem; font-weight: 600; letter-spacing: .05em;
      text-transform: uppercase; padding: .35rem .7rem; line-height: 1; }
    #ig-annot .ia-arm.on { background: rgba(200,184,130,.25); color: #E4DCC4;
      border-color: rgba(200,184,130,.7); }
    #ig-annot .ia-sep { height: 1px; background: rgba(200,184,130,.14); margin: .4rem .1rem; }
    #ig-annot .ia-note { padding: .5rem; border-radius: 5px; margin-bottom: .3rem;
      background: rgba(200,184,130,.05); position: relative; }
    #ig-annot .ia-note .ia-page { font-size: .58rem; letter-spacing: .08em; text-transform: uppercase;
      color: #8A8268; font-weight: 700; }
    #ig-annot .ia-note .ia-snip { font-size: .7rem; color: #8A8268; font-style: italic;
      margin: .2rem 0; line-height: 1.3; }
    #ig-annot .ia-note .ia-text { font-size: .8rem; color: #E4DCC4; line-height: 1.35; }
    #ig-annot .ia-note .ia-del { position: absolute; top: .3rem; right: .3rem; cursor: pointer;
      border: none; background: none; color: #8A8268; font-size: .8rem; padding: .1rem .3rem; }
    #ig-annot .ia-note .ia-del:hover { color: #E4DCC4; }
    #ig-annot .ia-empty { font-size: .75rem; color: #8A8268; padding: .5rem .2rem; }
    #ig-annot .ia-actions { display: flex; gap: .4rem; margin-top: .3rem; }
    #ig-annot .ia-actions button { flex: 1; cursor: pointer; border: 1px solid rgba(200,184,130,.3);
      background: none; color: #C0B8A8; border-radius: 5px; font-family: inherit;
      font-size: .65rem; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
      padding: .4rem .3rem; }
    #ig-annot .ia-actions button:hover { border-color: rgba(200,184,130,.6); color: #E4DCC4; }
    #ig-annot-modal { position: fixed; inset: 0; z-index: 104; display: flex;
      align-items: center; justify-content: center; background: rgba(0,0,0,.6); }
    #ig-annot-modal .ia-box { width: min(90vw, 420px); background: #16160F;
      border: 1px solid rgba(200,184,130,.3); border-radius: 10px; padding: 1rem 1.1rem;
      font-family: 'DM Sans', sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,.6); }
    #ig-annot-modal .ia-quote { font-size: .78rem; color: #8A8268; font-style: italic;
      line-height: 1.4; margin-bottom: .7rem; max-height: 4.5em; overflow: hidden; }
    #ig-annot-modal textarea { width: 100%; min-height: 80px; resize: vertical;
      background: rgba(255,255,255,.04); border: 1px solid rgba(200,184,130,.25);
      border-radius: 6px; color: #E4DCC4; font-family: inherit; font-size: .85rem;
      padding: .5rem; box-sizing: border-box; }
    #ig-annot-modal textarea:focus { outline: none; border-color: rgba(200,184,130,.6); }
    #ig-annot-modal .ia-modal-actions { display: flex; gap: .5rem; margin-top: .7rem;
      justify-content: flex-end; }
    #ig-annot-modal .ia-modal-actions button { cursor: pointer; border-radius: 2rem;
      font-family: inherit; font-size: .72rem; font-weight: 600; letter-spacing: .05em;
      text-transform: uppercase; padding: .4rem .9rem; line-height: 1; }
    #ig-annot-modal .ia-cancel { border: 1px solid rgba(200,184,130,.25); background: none;
      color: #8A8268; }
    #ig-annot-modal .ia-save { border: 1px solid rgba(200,184,130,.6);
      background: rgba(200,184,130,.15); color: #C8B882; }
    #ig-annot-modal .ia-save:hover { color: #E4DCC4; }
    .ig-annot-armed { cursor: crosshair !important; }
  `;
  document.head.appendChild(style);

  const wrap = document.createElement('div');
  wrap.id = 'ig-annot';
  document.body.appendChild(wrap);

  function setArmed(v) {
    armed = v;
    document.body.classList.toggle('ig-annot-armed', armed);
    render();
  }

  function flashBtn(btn, msg) {
    const orig = btn.textContent;
    btn.textContent = msg;
    setTimeout(() => { btn.textContent = orig; }, 1200);
  }

  function render() {
    const notes = readNotes();
    wrap.innerHTML = `
      <button class="ia-btn" type="button">📝 Feedback${notes.length ? ' · ' + notes.length : ''}</button>
      <div class="ia-panel">
        <div class="ia-row">
          <span style="font-size:.72rem;color:#C0B8A8;">Click text to leave feedback</span>
          <button class="ia-arm${armed ? ' on' : ''}" type="button">${armed ? 'ON' : 'OFF'}</button>
        </div>
        <div class="ia-sep"></div>
        ${notes.length
          ? notes.map((n, i) => `
            <div class="ia-note" data-i="${i}">
              <button class="ia-del" type="button" aria-label="Delete">✕</button>
              <div class="ia-page">${escapeHtml(n.page)}</div>
              <div class="ia-snip">&ldquo;${escapeHtml(n.snippet)}&rdquo;</div>
              <div class="ia-text">${escapeHtml(n.note)}</div>
            </div>`).join('')
          : '<div class="ia-empty">No notes yet. Turn feedback ON, then click any paragraph.</div>'}
        <div class="ia-actions">
          <button type="button" class="ia-copy">Copy JSON</button>
          <button type="button" class="ia-clear">Clear All</button>
          <button type="button" class="ia-off">Turn Off</button>
        </div>
      </div>`;

    wrap.querySelector('.ia-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('open');
    });
    wrap.querySelector('.ia-arm').addEventListener('click', (e) => {
      e.stopPropagation();
      setArmed(!armed);
    });
    wrap.querySelectorAll('.ia-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const i = Number(btn.closest('.ia-note').dataset.i);
        const list = readNotes();
        list.splice(i, 1);
        writeNotes(list);
        render();
      });
    });
    wrap.querySelector('.ia-copy').addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = JSON.stringify(readNotes(), null, 2);
      try {
        await navigator.clipboard.writeText(text);
        flashBtn(wrap.querySelector('.ia-copy'), 'Copied!');
      } catch (_) {
        window.prompt('Copy the feedback JSON:', text);
      }
    });
    wrap.querySelector('.ia-clear').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!window.confirm('Clear all saved feedback notes?')) return;
      writeNotes([]);
      render();
    });
    wrap.querySelector('.ia-off').addEventListener('click', (e) => {
      e.stopPropagation();
      try { localStorage.removeItem(ANNOT_FLAG); } catch (_) {}
      setArmed(false);
      document.removeEventListener('click', onDocClick, true);
      wrap.remove();
    });
  }

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) wrap.classList.remove('open');
  });

  const BLOCK_SEL = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, dt, dd, figcaption';
  const SKIP_SEL = 'button, a, input, textarea, select, [onclick], #ig-annot, #ig-annot-modal';

  function onDocClick(e) {
    if (!armed) return;
    if (e.target.closest(SKIP_SEL)) return;
    const block = e.target.closest(BLOCK_SEL) || e.target;
    const text = (block.innerText || block.textContent || '').trim();
    if (!text) return;
    e.preventDefault();
    e.stopPropagation();
    openModal(text);
  }
  document.addEventListener('click', onDocClick, true);

  function openModal(text) {
    const snippet = text.slice(0, 100);
    const modal = document.createElement('div');
    modal.id = 'ig-annot-modal';
    modal.innerHTML = `
      <div class="ia-box">
        <div class="ia-quote">&ldquo;${escapeHtml(snippet)}${text.length > 100 ? '…' : ''}&rdquo;</div>
        <textarea placeholder="What's the feedback?"></textarea>
        <div class="ia-modal-actions">
          <button type="button" class="ia-cancel">Cancel</button>
          <button type="button" class="ia-save">Save</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const ta = modal.querySelector('textarea');
    ta.focus();

    function onEsc(e) { if (e.key === 'Escape') close(); }
    function close() {
      modal.remove();
      document.removeEventListener('keydown', onEsc);
    }
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    modal.querySelector('.ia-cancel').addEventListener('click', close);
    modal.querySelector('.ia-save').addEventListener('click', () => {
      const note = ta.value.trim();
      if (!note) { close(); return; }
      const list = readNotes();
      list.push({ page: currentFile(), snippet, note, ts: Date.now() });
      writeNotes(list);
      close();
      render();
    });
    document.addEventListener('keydown', onEsc);
  }

  render();
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
      enhanceGuide();
    }
    initAnnotate();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
