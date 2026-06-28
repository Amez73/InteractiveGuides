# Codemap — Interactive Guides

A set of self-contained, single-file HTML guides that explain big political-economic
topics in plain English. No build step, no framework, no dependencies beyond a Google
Fonts import. Hosted on GitHub Pages. Each guide is one `.html` file that ships its own
CSS (`<style>`) and JS (`<script>`) inline.

This document is the map: **what is where**, **how the pieces are built**, and the
**editorial rules** (narrative structure, tone, sourcing) that every guide follows.

---

## 1. File layout

| File | Role | ~Length |
|------|------|--------|
| [index.html](index.html) | Landing page. Three linked cards, one per guide. Static — no passage engine. | 88 lines |
| [communist-theory-interactive.html](communist-theory-interactive.html) | **Part 1 · The Engine** — how capitalism works. 8 stations + deep dives + myth cards. | ~1640 lines |
| [imperialism-guide.html](imperialism-guide.html) | **Part 2 · The Global Picture** — where the wealth went. 5 stations + deep dives. | ~630 lines |
| [palestine-guide.html](palestine-guide.html) | **Part 3 · The Case Study** — Palestine & Israel. 7 stations + deep dives + claim cards + video embeds. | ~1195 lines |

The three guides are a trilogy and cross-link to each other in their final stations.
Read order is Part 1 → 2 → 3, but each works standalone ("No prior reading required").

There is no shared stylesheet or JS file — **each guide duplicates the engine and
component CSS inline.** A change to a shared component must be made in each file
separately. This is intentional: every guide is portable as a single file.

---

## 2. Shared architecture (the "passage engine")

All three guides are single-page apps built on the same hand-rolled pattern. The
landing page is the only exception (it's plain anchor links).

### The passage model
- The body is a series of `<div class="passage" id="passage-XXX">` blocks.
- Exactly one passage has `.active` at a time (`display:block`); the rest are
  `display:none`. A `fadeIn` keyframe animates entry.
- Navigation is a single JS function:

  ```js
  function go(id) {
    // remove .active from all .passage, add it to #passage-<id>,
    // scroll to top, mark visited, updateNav()
  }
  ```

- Every button/nav element calls `onclick="go('s2')"` etc. No router, no history API,
  no hash — back/forward is done with on-page **Back** buttons, not the browser.

### Fixed chrome (top of every guide)
- `#progress-bar` → `#progress-fill` : a thin top bar whose width is driven by
  `progressMap[currentPassage]` (a hardcoded percent per station).
- `#station-nav` : a fixed, blurred nav strip of `.nav-stop` chips (`data-passage` +
  `onclick="go()"`). `updateNav()` toggles `.current` / `.visited` classes.

### Deep-dive wiring (two lookup tables in the `<script>`)
```js
const progressMap = { start:0, s1:20, s2:40, ... dive_cia:40, dive_media:80 };
const diveParent  = { dive_cia:'s2', dive_debt:'s2', dive_media:'s4' };
```
- `progressMap` gives a deep dive the **same progress %** as the station it belongs to.
- `diveParent` makes the nav highlight the **parent station** while a dive is open, so
  a reader inside a deep dive still sees where they are on the main track.

### Naming convention gotcha
- imperialism & palestine name stations `s1`…`s7`.
- communist-theory names them `station1`…`station8`.
- Deep-dive passages are always `dive_<slug>` (`dive_cia`, `dive_congo`, `dive_ussr`…).
- The intro passage is always `start`.

---

## 3. How the structural pieces are built

### a. Stations (the main track)
A station is a `.passage` containing:
1. `<p class="eyebrow">Station N of M</p>`
2. `<h2>` title (often "The X — subtitle" form)
3. A **page-hook** (see §4) — bold one-paragraph summary, left border.
4. Body prose / cards / timelines / stat grids.
5. `<div class="btn-group">` at the bottom: optional `btn-dive` buttons, then a
   `btn-primary` that advances to the next station.

### b. Deep dives
A deep dive is a **separate full passage** (`id="passage-dive_x"`), not an inline expand.
- Opens with `<div class="dive-banner">Deep Dive — Topic</div>` (◆ prefix via CSS).
- Reached from a parent station's `btn-dive` (`↳ ◆` styling).
- Ends with a `btn-group` offering: **Back to Station N**, links to *sibling* deep dives
  (so you can hop between dives without returning to the station), and a `btn-primary`
  to continue the main track.
- Must be registered in both `progressMap` and `diveParent`.

### c. Inline expandables (`<details class="deep-expand">`)
A lighter-weight alternative to a full deep-dive passage — used inside Palestine's
timelines for "more detail here" without leaving the station. Native `<details>`/`<summary>`,
rotated `▸` marker, no JS.

### d. Claim cards (`<details class="claim-card">`) — Palestine "The Record"
Self-sourcing collapsible cards. Collapsed shows a serif **headline** + a **blurb**;
expanded reveals `.claim-body` prose ending with a **Source:** line linking to the
primary source (HRW, CNN, UN OHCHR, WaPo, +972, CPJ…). The `+` / `–` affordance is a CSS
`::after`. Native `<details>`, no JS. This is the pattern for "many discrete, individually
sourced claims."

### e. Myth cards (`.myth-card`) — communist-theory "Myths" station
JS-toggled (`onclick="toggleMyth(this)"`, toggles `.open`). Structure: a `Myth` tag +
the quoted misconception (`.myth-claim`) + chevron; body holds the rebuttal prose and a
green-checked `.myth-verdict` ("What the theory actually says: …"). Use for
"steelman a misconception, then answer it."

### f. Landing-page cards (`a.card`) — index.html only
Each is a link card: `Part N · Subtitle` eyebrow, `<h2>`, blurb with a `.go` "Start
reading →", and a `.badge-row` (read-time + format). Pure CSS hover lift.

### g. Repeating content components (shared CSS across guides)
| Class | Purpose |
|-------|---------|
| `.page-hook` | Bold summary paragraph at the top of a station (left border, sand `<strong>`). |
| `.pull` | Serif italic pull-quote, left border. |
| `.callout` (+ `.dark`/`.warn`/`.frame`) | Highlighted aside box; variant colors signal tone. |
| `.math-block` / `.math-row` | Ledger-style data block (`.val.pos` green, `.neg` red, `.gap` accent). |
| `.stat-grid` / `.stat-card` | Big-number cards; `.stat-number` + `.stat-label` + tiny `.stat-source`. |
| `.timeline` / `.t-item` | Vertical dotted timeline; `.t-item.red` flags atrocity/violence entries. |
| `.sc-grid` / `.sc-box.win`/`.loss` + `.sc-lesson` | Win/loss scorecard with a takeaway "lesson" box. |
| `.frame-box` | Definitional box (e.g. defining "settler colonialism"). |
| `.track-preview` | "Your route" map shown in the intro listing all stations. |
| `.video-wrap` (palestine) | 16:9 responsive YouTube iframe + fallback "Watch on YouTube" link. |
| `.final-quote` | Centered closing blockquote + cite. |
| `.companion-badge` | "Companion Guide · Part N" badge in the intro. |

### Button vocabulary
`btn-primary` (advance, → arrow) · `btn-dive` (open deep dive, ↳◆) ·
`btn-back` (← return) · `btn-ext` (open another guide in new tab, ↗).

---

## 4. Preferred narrative structure

This is the editorial template the guides converge on (most explicit in the recent
"hook on top, cards/prose below" restructuring commits):

1. **Intro passage**: companion badge → big serif `<h1>` → one-line subtitle → a
   `track-preview` "Your route" → 2–4 framing paragraphs that pose the question and
   state the thesis bluntly → single `btn-primary` into Station 1.
2. **Each station leads with a `page-hook`** — the whole argument of the station
   compressed into one bold sentence, so a skimmer gets the claim before the evidence.
3. **Hook on top, then cards/prose below.** Detail is pushed down and/or into deep dives
   and expandables. The reader chooses depth; the main track stays short.
4. **Stations move in a deliberate arc**, e.g.:
   - Capitalism: Engine → Glitch → Band-Aids → Horizon → Dream → Myths → Now What? → Getting There
   - Imperialism: Thesis → How It Works → The Record → The Propaganda → Now What?
   - Palestine: The Frame → The History → The Occupation → US Role → Gaza Now → The Record → The Silence
   A recurring late beat is **"The Propaganda / The Silence"** (why you weren't told this)
   and a closing **"Now What?"** that lays out *options*, not a single prescription.
5. **Optional deep dives** hang off stations for country/case detail; **the main track
   is always completable without them.**
6. **Closes with a `final-quote`** + a framing line that the guide gives a *framework,
   not a verdict*, then `btn-ext` links to the sibling guides.

---

## 5. Tone

- **Plain English, second person, confident.** Short declarative sentences. "Follow the
  money." "Skip the walls of text." Explains jargon the first time (defines "settler
  colonialism", "structural adjustment", "transfer pricing").
- **Name the actor and the reality — no passive euphemism.** Write "the CIA organised a
  coup," "Israel expelled 750,000 people," not "regime change occurred" / "people were
  displaced." (This is a standing user preference — see `feedback_avoid-passive-euphemism`.)
- **State the thesis up front, then evidence it.** The guides don't bury the lede or
  hedge toward false balance. Palestine explicitly rejects "both sides": "this is not a
  conflict between two equal sides … that asymmetry is the starting point, not a conclusion."
- **Pre-empt the bad-faith read.** Recurring "What this isn't saying" / "A note on
  balance" paragraphs head off strawmen (e.g. "not saying Western societies are uniquely
  evil," "not denying the Holocaust or the need of Jewish refugees for safety").
- **Framework, not verdict.** Endings hand the reader analytical tools and a menu of
  positions (reparations / structural reform / consumer) rather than ordering a conclusion.
- **Concede genuine uncertainty.** "These figures are contested in their exact size …
  what isn't contested is the direction." Distinguishes settled fact from open question.

---

## 6. Sourcing preferences

- **Cite inline, visibly, everywhere.** Stat cards carry a tiny `.stat-source`; claim
  cards end in a bold **Source:** link; the footer promises "Sources are cited throughout."
- **Prefer primary, academic, and adversarial-to-the-thesis sources.** Named scholars
  (Hickel, Utsa Patnaik, Ha-Joon Chang, Walter Rodney, Benny Morris, Ilan Pappé, Walid
  Khalidi, Patrick Wolfe, Lindsey O'Rourke); institutions (IMF, UNCTAD, OCHA, UNRWA, ICJ,
  CRS); rights orgs (HRW, Amnesty, B'Tselem); investigative journalism (Al Jazeera I-Unit,
  Democracy Now, WaPo, CNN, +972, CPJ).
- **Lean on the other side's own records** to defuse "biased source" objections —
  Israeli military archives and Israeli "New Historians" for the Nakba; declassified
  CIA documents and official apologies for the coups; soldiers' own posted videos.
- **Video evidence is vetted, not clips.** Palestine embeds only "full investigative
  documentaries … professionally produced, legally reviewed" — explicitly *not* social
  media clips — each with a YouTube fallback link.
- **Numbers come with provenance and ranges.** "107–120 villagers," "$45T (Patnaik)",
  attribute disputed framings to whoever makes them (Pappé vs. Morris on Plan Dalet).

---

## 7. Design tokens

Each guide has its own palette in `:root`, but the same structure (bg / surface / border
/ accent / muted / text) and the same fonts: **DM Serif Display** (headings, pull-quotes,
stat numbers) + **DM Sans** (body).

| Guide | Accent | Mood |
|-------|--------|------|
| index / palestine | olive `#7A9A3A` + sand `#C8B882` + red `#C04030` | earthy, military-olive |
| imperialism | gold `#C8942A` + rust `#B04A1A` | extraction/gold |
| communist-theory | red `#E03030` | revolutionary red |

Shared traits: near-black bg, 680px max content column, 17px/1.75 body, `red`-tinted
timeline dots for violence, green/red for gain/loss in data blocks.

---

## 8. Working on this project

- **No build.** Edit the HTML, open in a browser, commit. CSS and JS live inline in each file.
- **Adding a station:** add the `.passage`, add a `.nav-stop` to `#station-nav`, add it to
  `progressMap`, and wire the `btn-primary` chain from the previous station.
- **Adding a deep dive:** add the `dive_x` passage, a `btn-dive` in the parent station,
  entries in `progressMap` **and** `diveParent`, and Back/sibling/continue buttons.
- **Conventions to preserve:** lead each station with a `page-hook`; source every stat and
  claim; keep the main track completable without dives; name actors plainly.
- **Workflow:** commit immediately after a change and `git push` every commit — the site
  is live on GitHub Pages (standing user preferences).
