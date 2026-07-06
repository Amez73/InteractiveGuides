---
name: verify
description: Build/launch/drive recipe for verifying changes to the Interactive Guides static site in a real browser.
---

# Verifying the Interactive Guides site

Zero-build static site (plain HTML + guides.js). Verification = serve the folder,
drive it in headless Chrome, assert on the live DOM.

## Serve

No Python here. Use a Node one-liner static server (repo root as docroot), e.g.:

```js
require('http').createServer((q,r)=>{ /* read file from repo root, index.html for '/' */ })
  .listen(8791)
```

## Drive

- Playwright/Puppeteer are NOT installed; `npm i puppeteer-core` in the scratchpad
  and point it at the locally installed Chrome:
  `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
  with `headless: true, args: ['--no-sandbox','--disable-gpu']` and a fresh temp
  `userDataDir`. (Edge at the analogous path failed to launch under puppeteer —
  use Chrome.)
- Key DOM handles: active passage = `.passage.active` (id `passage-<id>`); station
  chips = `.nav-stop[data-passage]`; progress = `#progress-fill` style.width;
  navigate via `window.go(id)` or click `[onclick="go('<id>')"]` in the active
  passage; resume toast = `#guide-resume`; index cards = `.card` on index.html.
- Reading state lives in `localStorage["ig:v1:<file>.html"]`.

## Gotchas

- Badge text asserts: CSS `text-transform: uppercase` means `innerText` returns
  "STATION 4 OF 7" — match case-insensitively or use `textContent`.
- `page.goto()` between two hashes of the same file is a same-document navigation:
  no reload, only `hashchange` fires. Use it deliberately when testing the
  hashchange path vs the initial-load path.
- The test server 404s /favicon.ico — one console error per page load is
  environment noise, not a regression.

## Flows worth driving

Station click-through (hash + back/forward), deep link `#s3`, invalid hash,
dive enter/refresh/back, resume toast (appear/continue/dismiss), finish a guide
(done flag), index badges + Continue links, all 6 guides load + navigate once
(watch pageerror), localStorage-throwing degradation.
