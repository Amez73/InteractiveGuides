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
| [index.html](index.html) | Landing page. One linked card per guide (rendered from `GUIDES` in guides.js). Static — no passage engine. | ~100 lines |
| [communist-theory-interactive.html](communist-theory-interactive.html) | **Part 1 · The Engine** — how capitalism works. 8 stations + deep dives + myth cards. | ~1650 lines |
| [imperialism-guide.html](imperialism-guide.html) | **Part 2 · The Global Picture** — where the wealth went. 5 stations + deep dives. | ~635 lines |
| [palestine-guide.html](palestine-guide.html) | **Part 3 · The Case Study** — Palestine & Israel. 10 stations + deep dives + claim cards + video embeds + the interactive massacre timeline (§3k). | ~2730 lines |
| [deception-guide.html](deception-guide.html) | **Part 4 · The Deception** — what Western governments hid from their own people. 7 stations + deep dives + claim cards. | ~965 lines |
| [vc-genocide-guide.html](vc-genocide-guide.html) | **Part 5 · The Money** — venture capital, surveillance, and the genocide. 5 stations, claim cards + inline expandables only (no full deep-dive passages). | ~640 lines |
| [mirror-guide.html](mirror-guide.html) | **Part 6 · The Mirror** — the capstone: unlearning the double standard. 5 stations + 1 deep dive (the 1955 CIA file, dossier-styled) + "Who did it?" quiz cards + liberal/leftist lens matrix. | ~665 lines |

The six guides are a series and cross-link to each other in their final stations.
Read order is Part 1 → 2 → 3 → 4 → 5 → 6, but each works standalone ("No prior reading required").
Part 6 is deliberately last: it re-reads the record of Parts 1–5 through one new lens
(the double standard) and links back rather than re-teaching.

There is no shared stylesheet or JS file — **each guide duplicates the engine and
component CSS inline.** A change to a shared component must be made in each file
separately. This is intentional: every guide is portable as a single file.

---

## 2. Shared architecture (the "passage engine")

All five guides are single-page apps built on the same hand-rolled pattern. The
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

- Every button/nav element calls `onclick="go('s2')"` etc. The inline engines have
  no router of their own — but `guides.js` wraps `window.go()` at DOMContentLoaded
  to add hash routing and reading-state persistence on top (see §2b). Browser
  back/forward, deep links (`guide.html#s4`), and resume-where-you-left-off all
  work through that shared layer; the guide files themselves stay router-free.

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

### 2b. Shared routing + resume layer (guides.js, zero per-guide code)
`guides.js` (loaded after the inline engine via `data-guide-nav`) enhances every
guide at DOMContentLoaded — `enhanceGuide()`:

- **Hash routing.** Wraps `window.go()`: each navigation sets `location.hash` to the
  passage id (`#s4`, `#dive_cia`), so browser back/forward walks the stations, a
  refresh keeps your place, and any station is a shareable link. A `hashchange`
  listener handles back/forward; invalid hashes fall back to `start` and are
  stripped from the URL. Element ids are `passage-s4` while hashes are `s4`, so
  native fragment scrolling never fires.
- **Reading state.** Every navigation writes `localStorage["ig:v1:<file>.html"]`:
  `{ current, visited[], pct, label ("Station 4 of 7"), done, t }`. All storage
  access is try/catch-wrapped — private mode degrades to exactly the old behavior.
- **Resume toast.** On a plain load (no hash) with saved progress past `start`, a
  fixed bottom-center toast offers "Continue where you left off · Station N of M".
  Precedence: **URL hash > resume toast > start**. Visited chips are restored
  either way. Dismiss (✕/Escape) is session-only. Not shown once `done`.
- **Index cards.** `renderCards()` reads the same state: in-progress guides get a
  progress badge + "Continue →" deep link to the saved station; finished guides
  get "✓ Read" and a plain link.
- It reads the engine's top-level bindings (`progressMap`, `diveParent`, `visited`)
  by bare name with `typeof` guards, so per-guide gaps (vc-genocide has no
  `diveParent`, since it has no dives) are tolerated. As of 2026-07-31,
  communist-theory hoists `progressMap`/`diveParent` to top-level constants like
  every other guide; it previously declared `diveParent` inside `updateNav()`,
  which this doc used to flag as a deviation.
  A dive is credited to its parent station for the "Station N of M" label.
- **New guides get all of this for free** — the station list is derived from the
  `.nav-stop[data-passage]` chips, not hardcoded.

### Naming convention gotcha
- imperialism (`s1`…`s5`), vc-genocide (`s1`…`s5`), mirror (`s1`…`s5`), deception (`s1`…`s7`), palestine (`s1`…`s9`) use `sN`.
- communist-theory names them `station1`…`station8`.
- Deep-dive passages are always `dive_<slug>` (`dive_cia`, `dive_congo`, `dive_ussr`…).
- The intro passage is always `start`.
- vc-genocide has no `dive_*` passages (and no `diveParent` map) — it uses claim cards
  and inline `deep-expand` details only.

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

### d. Claim cards (`<details class="claim-card">`) — Palestine, Deception & VC guides
Self-sourcing collapsible cards. Collapsed shows a serif **headline** + a **blurb**;
expanded reveals `.claim-body` prose ending with a **Source:** line linking to the
primary source (HRW, CNN, UN OHCHR, WaPo, +972, CPJ…). The `+` / `–` affordance is a CSS
`::after`. Native `<details>`, no JS. This is the pattern for "many discrete, individually
sourced claims." Used heavily in Palestine (The Record, The Silence, The Lies, The Myths),
Deception (programs, cover-ups, Snowden), and VC-genocide (network, spyware, silencing).

### e. Myth cards (`.myth-card`) — communist-theory "Myths" station
JS-toggled (`onclick="toggleMyth(this)"`, toggles `.open`). Structure: a `Myth` tag +
the quoted misconception (`.myth-claim`) + chevron; body holds the rebuttal prose and a
green-checked `.myth-verdict` ("What the theory actually says: …"). Use for
"steelman a misconception, then answer it."

### f. Quiz cards (`.quiz-card`) — mirror guide's "Who did it?" station
A description of state conduct with the flag stripped, four `.quiz-opt` buttons, and a
hidden `.quiz-reveal` breakdown. JS `pickQuiz(this)` (the correct option carries
`data-answer="1"`): first click locks the card, marks the picked option `.wrong` if
wrong, highlights the correct one `.reveal-right`, and opens the reveal. The reveal ends
with a **Source:** line and a pointer to the sibling guide holding the full record.
Use for "let the reader catch their own bias" moments.

### g. Dossier (`.dossier`) — mirror guide's declassified-document facsimile
A monospaced facsimile of a real declassified file: `.dossier-band` header
(INFORMATION REPORT), `.dossier-row` field rows (COUNTRY/SUBJECT/DATE DISTR.),
rotated red `.dossier-stamp` (SECRET), boxed `.dossier-note` ("This is UNEVALUATED
Information" — reproduce caveats honestly, they're load-bearing), `.dossier-quote`
excerpt, and an "Approved For Release" `.dossier-footer`. Mimic the actual document's
layout, not a generic "top secret" look.

### h. Lens matrix (`.lens-block`) — mirror guide's liberal/leftist comparison
Per topic: a `.lens-topic` label and a two-column `.lens-pair` grid (stacks under
560px) of `.lens-box.lib` / `.lens-box.left` cards, color-coded left borders. Both
readings steelmanned — "framework, not verdict."

### i. Landing-page cards (`a.card`) — index.html only
Each is a link card: `Part N · Subtitle` eyebrow, `<h2>`, blurb with a `.go` "Start
reading →", and a `.badge-row` (read-time + format). Pure CSS hover lift.

### j. Repeating content components (shared CSS across guides)
| Class | Purpose |
|-------|---------|
| `.page-hook` | Bold summary paragraph at the top of a station (left border, sand `<strong>`). |
| `.pull` | Serif italic pull-quote, left border. |
| `.callout` (+ `.dark`/`.warn`/`.frame`) | Highlighted aside box; variant colors signal tone. |
| `.math-block` / `.math-row` | Ledger-style data block (`.val.pos` green, `.neg` red, `.gap` accent). |
| `.stat-grid` / `.stat-card` | Big-number cards; `.stat-number` + `.stat-label` + tiny `.stat-source`. |
| `.timeline` / `.t-item` | Vertical dotted timeline; `.t-item.red` flags atrocity/violence entries. |
| `.t-hit` (+ nested `<em>`) | The punch line of a timeline entry: large serif, accent-coloured, sits under `.t-title`. Nested `<em>`s are the small uppercase supporting lines (nought, one or two); `<b>` inside one marks a number. Palestine, Imperialism & Deception. |
| `.t-expand` | `details.deep-expand` variant with tighter padding, holds a timeline entry's full paragraph and its **Source:** line. |
| `.sc-grid` / `.sc-box.win`/`.loss` + `.sc-lesson` | Win/loss scorecard with a takeaway "lesson" box. |
| `.frame-box` | Definitional box (e.g. defining "settler colonialism"). |
| `.track-preview` | "Your route" map shown in the intro listing all stations. |
| `.video-wrap` (palestine) | 16:9 responsive YouTube iframe + fallback "Watch on YouTube" link. |
| `.final-quote` | Centered closing blockquote + cite. |
| `.companion-badge` | "Companion Guide · Part N" badge in the intro. |

### k. Interactive massacre timeline (`.mt-*`) — palestine `dive_massacres` only
The one JS-heavy component in the series: a horizontally scrolling stage of 80
documented mass killings, 1948–2026, rendered from an `EV` data array into a
10,000px canvas, with a bottom detail sheet per entry and the CPJ named roster
below it. All of it lives in one IIFE at the end of palestine-guide.html and every
class is namespaced `mt-` so nothing collides with the guide's own components.

- **Data.** One object per entry in `EV`: `y` decimal year · `c` category
  (`pal|leb|gaza|named`, which picks the colour) · `n` toll shown on the chip ·
  `g` one-line tagline · `k`/`kd` children counts · `total:1` for campaign
  aggregates (filled chip) · plus `t/loc/date/toll/unit/tags/body[]/resp/src` for
  the detail sheet. Adding an object rebuilds layout, wiring and axis automatically.
- **Compressed scale.** Every gap between consecutive event-years counts for at
  most `CAP` (3.0) effective years of width, so dense periods keep true relative
  spacing and idle decades don't eat the canvas. Skipped spans are drawn as
  hatched `.mt-skip` bands labelled "N yrs condensed" — the time is shown as
  removed, never silently dropped.
- **Lane packing.** 4 rings above and 4 below the axis. Chip heights are
  *measured from real rendered chips* (pass 1 builds each off-screen at
  `visibility:hidden` and reads its height), then pass 2 packs lanes using those
  real heights, so a longer tagline can't cause an overlap. Chips displaced from
  their true date get an orthogonal SVG leader line back to a dot on the axis.
- **Lazy build.** A `display:none` passage measures 0, so the renderer cannot run
  at parse time. An `IntersectionObserver` on `#mt-scroller` fires `build()` the
  first time the dive is actually on screen. **Any future change that measures
  layout must stay inside `build()`.**
- **Crop.** After layout the stage is cropped to the rows actually used
  (`translateY` up to the topmost chip, canvas height set to the bottommost) so
  the guide doesn't get a wall of empty black.
- **Full bleed.** `.mt-bleed` breaks out of the 680px column to viewport width
  using a measured `--mt-sbw` scrollbar width, so the page never gains a
  horizontal scrollbar of its own.
- Provenance: ported from a standalone light-themed prototype; the palette,
  fonts and chrome were remapped to the palestine tokens, category colours
  lightened for the dark background.

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
4. **Lead with the punch, collapse the rest.** The massacre timeline is the reference:
   the most damning thing about an event is the first and biggest thing on screen, and
   everything else (the account, the disputed numbers, who was responsible, the source)
   is one tap away. Someone who taps nothing still leaves with the point. Applied to
   timelines via `.t-hit` + `.t-expand`.

   **This is an intent, not a template.** What the punch *is* varies entirely by entry:
   the act and who ordered it ("The CIA overthrew an elected prime minister to keep
   Iran's oil British"), the lie ("The attack never happened"), the toll ("Israel
   expelled 750,000 Palestinians"), what it bought ("Six senators cited her voting for
   war"), or the sheer absurdity ("Disabled children were fed radioactive oatmeal").
   Supporting lines are optional: use nought, one or two as the entry earns. Some entries
   want a single sentence and nothing under it. Uneven entries are correct; uniform ones
   flatten back into wallpaper, which is the thing being fixed. Pick per entry, by what
   actually lands.
5. **Stations move in a deliberate arc**, e.g.:
   - Capitalism: Engine → Glitch → Band-Aids → Horizon → Dream → Myths → Now What? → Getting There
   - Imperialism: Thesis → How It Works → The Record → The Propaganda → Now What?
   - Palestine: The Frame → The History → The Occupation → US Role → Gaza Now → The Evidence → The Record → The Silence → The Lies → The Myths
   - Deception: The Pattern → The Wars → The Programs → The Crackdown → The Surveillance → The Cover-Ups → The Present
   - Money: The Money → The Weapons → Surveillance → Silencing → The Plan
   - Mirror: The Word → The Mirror → The Pattern → The Two Lenses → Now What?
   A recurring late beat is **"The Propaganda / The Silence"** (why you weren't told this)
   and a closing **"Now What?"** that lays out *options*, not a single prescription.
6. **Optional deep dives** hang off stations for country/case detail; **the main track
   is always completable without them.**
7. **Closes with a `final-quote`** + a framing line, then `btn-ext` links to the sibling
   guides. As of 2026-07-31 the framing line makes a deliberate two-part move rather than
   handing back an undifferentiated "framework, not a verdict": it says plainly that the
   *pattern* the guide documented is not still an open question (evidence across the
   stations resolved it; calling it undecided at the end would be the false balance the
   series refuses everywhere else), while leaving open which *political tradition* the
   reader builds from that diagnosis (reform, revolution, prefigurative politics, some
   mix). Conflating those two questions is what the earlier "framework, not verdict"
   phrasing did, and it let five guides establish a repeating pattern and then treat "is
   this a pattern" as unresolved in the closing line. See `communist-theory-interactive.html`
   Station 8, `mirror-guide.html` Station 4's closing callout, and `palestine-guide.html`'s
   closing (which names the Palestinian civil-society BDS call rather than declining to
   name any position) for the corrected pattern.

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
- **Framework for the tradition, not the pattern.** Endings hand the reader a menu of
  political traditions to build from (reform / revolution / prefigurative politics for
  Part 1, reparations / structural reform for Part 2) rather than ordering which one to
  join. That is different from treating *whether the documented pattern is real* as open;
  it isn't, by the guide's own evidence, and the ending should say so rather than
  softening it into equal-weight uncertainty. See §4.7.
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
| deception | steel `#5A8AAA` + warn `#C07040` | cold-file blue/grey |
| vc-genocide | gold `#C8A060` + blue `#7FB3C8` + red `#C06040` | money/valley gold |
| mirror | violet `#9C88C8` + flag-red `#C05050` | mirror-glass violet |

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
