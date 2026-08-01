---
name: testreader
description: Read the Interactive Guides as four specific strangers and report where they got bored, skeptical, surprised, and hooked.
---

# testreader

Runs four fictional-but-specifically-drawn readers through the guides cold and
reports where each one disengaged, got skeptical, got surprised, got hooked
forward, and what they walked away believing. Output is reader reactions, not
craft advice — turning a reaction into an edit is the author's job.

The hard problem this fights is sycophancy. Told to "be a 45 year old
tradesman," a model will happily produce "I found this compelling!" Fresh
per-reader contexts, mandatory friction quotas, verbatim anchoring, a forced
bail point, a ban on craft advice, and cross-persona convergence scoring in the
synthesis all exist to keep the reactions load-bearing instead of flattering.

## The four readers

Full persona files live in `personas/`, read one verbatim into each reader's
prompt:

- `personas/ray-45-us-trades.md` — Ray, 45, HVAC tech, Ohio. Phone reader,
  low stamina for theory, high stamina for wage math. The test of whether the
  writing is readable by the people it's about.
- `personas/dan-30-toronto-pm.md` — Dan, 30, Toronto PM. Laptop, checks
  sources, persuadable on mechanism and money, guarded on framing/identity
  language.
- `personas/margaret-60-professional.md` — Margaret, 60, retired professional.
  Highest stamina, reads every source line, one hard trigger (any perceived
  minimizing of the Soviet/Chinese record loses her instantly).
- `personas/chloe-19-biology.md` — Chloe, 19, incoming biology student. Phone
  reader, shortest attention, zero economic vocabulary going in — the jargon
  canary — but the most persuadable if the opening holds her.

## Scope resolution

No argument: run all six guides in series order, in one run, each reader
reading all six back to back. Order and files, from the `GUIDES` array in
`guides.js`:

1. `communist-theory-interactive.html` — Part 1, The Engine
2. `imperialism-guide.html` — Part 2, The Global Picture
3. `palestine-guide.html` — Part 3, The Case Study
4. `deception-guide.html` — Part 4, The Deception
5. `vc-genocide-guide.html` — Part 5, The Money
6. `mirror-guide.html` — Part 6, The Mirror

With an argument, narrow to matching guide(s) by loose match against filename,
`short`, or `part` (e.g. `/testreader mirror`, `/testreader part6`,
`/testreader palestine`). Never include `massacres-timeline-1.html` — it's an
untracked orphan prototype referenced by nothing, not a live guide.

## Run

1. Create a run directory: `<scratchpad>/testreader/<YYYY-MM-DD-HHMM>/`.
2. In a single message, spawn four `Agent` calls (`subagent_type:
   general-purpose`, `run_in_background: false` so all four return together).
   Each prompt is, in order:
   - The matching persona file, pasted in full.
   - The "Reading rules" and "Per-guide report format" sections below, pasted
     in full.
   - The resolved ordered list of absolute paths to the guide(s) in scope.
   - An instruction to write its complete report to
     `<run-dir>/<reader-first-name-lowercase>.md` and return only a plain-text
     digest under 10 lines to the orchestrator (arrival station per guide, one
     bail point per guide, one belief-change per guide) — full detail stays on
     disk so the orchestrator's context stays clear.
3. Once all four land, read all four report files and write
   `<run-dir>/synthesis.md` (see "Synthesis" below).
4. Reply to the user with a short chat summary of the top synthesis findings
   and the run directory path. Write nothing to the repo — a testreader run
   produces no diff and needs no commit.

## Reading rules (give verbatim to every reader agent)

- You do not know who wrote this and you are not judging the writing. You are
  a person reading a web page. React, do not evaluate.
- Read straight through in order, station by station, top to bottom. Do not
  read the whole file first and summarize after. Log reactions in the order
  they happen — the question is where a reader falls off, and that's a
  position, not an average.
- Read ONLY the guide `.html` file(s) you're given. Do not open `CODEMAP.md`,
  `guides.js`, git history, or any other repo file. Knowing the author's
  intent contaminates the reaction.
- Anchor every reaction: quote the exact sentence or heading that caused it,
  and name the station id it sits in (e.g. `passage-s3`, or `station4` — use
  whatever id the file actually has). An unanchored reaction gets discarded,
  don't include it.
- Quota: at least three boredom points and three skepticism points per guide.
  If a guide genuinely produced fewer, say so explicitly and defend why.
  Praise without a matching count of friction means you didn't actually read
  as this person.
- Name exactly one bail point per guide: the single place you would have
  actually closed the tab. If you would have finished anyway, name the
  closest you came and say what specifically kept you reading past it.
- Never give craft advice. Don't write "consider adding a chart" or "this
  section could be tightened." Write "I stopped believing this here" or "I
  skimmed the next four paragraphs." Turning reactions into edits is the
  author's job, not yours.
- Open a deep dive / expandable section only if your persona actually would.
  Say when you skipped one and why — that's data too.

## Per-guide report format

For each guide, in this order:

- **Arrived at station N of M** — and whether you finished the guide.
- **Bail point** — anchor + what specifically pushed you out (or the closest
  you came, and what kept you in).
- **Boredom** — each entry: anchor, and what made it drag (repetition,
  abstraction with no payoff yet, a number with no stake, unfamiliar
  vocabulary).
- **Skepticism** — each entry: anchor, the objection in your own words, and a
  resolution tag — `resolved` / `partly` / `not addressed` / `made worse` —
  plus where the resolution landed, if it did.
- **Surprise** — anchor + why it landed as new rather than as an assertion you
  already half-believed.
- **Hooks** — what pulled you into the next station, anchored.
- **Belief ledger** — three lines: what I now believe that I didn't before,
  what I still don't buy, what would have to be true for me to buy it.
- **Dives** — which you clicked, which you skipped, why.

After the last guide in a multi-guide run, add a **Series arc** section: where
in the series you'd have quit entirely, whether the guide you started on was
the right door for you, which part should have been your first, and whether
your view at the end differs from your view after the first guide.

## Synthesis

Rank findings by convergence across the four reports — convergence is the
whole signal:

- Bored or lost **3-4 readers** at the same anchor → structural problem, list
  first.
- **2 readers** → a real weakness worth a look, list second.
- **1 reader** → usually a persona artifact, not a defect. List separately
  under "single-reader reactions," don't let it drive edits.
- A dedicated list: skepticism a guide raised in some reader and never
  resolved (`not addressed` or `made worse` tags) — this is the highest-value
  output, an objection the reader formed that the guide walked past.

## Gotchas

- Guides are large — `palestine-guide.html` is ~2,860 lines and needs several
  `Read` calls with `offset`. Prose sits in literal `<p>`/`<h2>` inside
  `<div class="passage" id="passage-sN">`; skip the inline `<style>`/`<script>`
  blocks duplicated in every file by design.
- Station id naming is inconsistent: `communist-theory-interactive.html` uses
  `station1..station8`, every other guide uses `s1..sN`. Anchor with whatever
  id the file actually uses.
- `palestine-guide.html`'s massacre timeline dive is built from an `EV` JS
  array near the end of the file, not from markup. A reader who opens it
  should react to the data shown, not to the code.
- Read-time badges in `guides.js` undercount some guides badly (Part 3 is
  tagged "~12 min" against roughly 20k words of prose). Don't tell reader
  agents an expected reading time — it would bias the boredom signal.
- Four parallel agents each reading up to six large files is a heavy run.
  Use a single-guide argument as the fast path while iterating on one guide.
- If two readers bail at the exact same sentence for the exact same stated
  reason, be suspicious the personas collapsed into each other rather than
  concluding it's automatically a structural problem — check the anchors are
  genuinely independent reactions, not copied phrasing.
