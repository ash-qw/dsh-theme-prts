# DSH P.R.T.S. Personal UI Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, package, install, and validate an unmistakable Arknights/P.R.T.S. personal UI plugin for the deployed DeepSeek Harness Web `0.1.0-rc.7`.

**Architecture:** A browser-only `dsh.client` plugin follows the rc.7-compatible Stardew package shape: an empty Host entry, a module-loader client bundle, a native General Settings slot, scoped theme CSS, and a reversible tactical-shell controller. A small Node build script embeds local CSS/SVG/PNG assets into the client bundle, while pure helpers and DOM lifecycle code remain directly testable.

**Tech Stack:** JavaScript ESM/CommonJS loader wrapper, Node.js 18+, Node test runner, jsdom 24, Playwright 1.55, CSS/SVG, npm package tarball, DeepSeek Harness `dsh plugin` CLI, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-08-21-dsh-theme-prts-design.md`

## Global Constraints

- Target the running `deepseek-harness:0.1.0-rc.7` Web profile.
- Package name and client module id are exactly `dsh-theme-prts`.
- Use the supported `dsh.client`/`dsh.bundle.patch` mechanism; do not modify the Harness image or frontend files.
- Default the theme to disabled; `?prts-safe=1` prevents every visual mount.
- Scope active visual rules under `html[data-dsh-prts]` and remove every owned node, attribute, listener, observer, and style on disable.
- Keep all fonts and art local; make no runtime network requests and add no telemetry.
- Provide complete dark/light/system appearances, optional dossier art, three texture levels, three motion levels, and two density levels.
- Preserve existing chat, code, attachment, model, permission, tool, agent, Goal, Plan, and Deliverable behaviors.
- Support desktop at 1440px+, tablet at 768–1024px, phone fallback, 200% zoom, keyboard navigation, WCAG AA text contrast, and reduced motion.
- Treat the code license separately from redrawn franchise-identifying assets.

## File Map

- `package.json` — package metadata, DSH manifest, scripts, files list, and development dependencies.
- `cordis.patch.yml` — inserts the client plugin into the Web profile roster.
- `src/index.js` — empty Cordis-compatible Host entry.
- `src/client/index.js` — browser plugin apply function, locale/slot registration, state wiring, and exported test seam.
- `src/client/preferences.js` — serializable preference defaults, validation, persistence, and safe-mode parsing.
- `src/client/theme-controller.js` — root attributes, scheme tracking, CSS injection, lifecycle cleanup.
- `src/client/tactical-shell.js` — status bar, tactical panel, telemetry projection, collapse controls, observer, and cleanup.
- `src/client/settings-row.js` — React-without-JSX settings component and its injected action contract.
- `src/client/settings-store.js` — Harness `defineStore` adapter for the settings row.
- `src/styles/prts.css` — scoped dark/light visual system, DSH selector adaptations, responsive behavior, and reduced-motion rules.
- `src/assets/rhodes-dsh.svg` — redrawn triangular Rhodes/DSH emblem.
- `src/assets/class-icons.svg` — original DSH pictograms using Arknights class-icon grammar.
- `src/assets/amiya-dossier.png` — redrawn fan-art dossier crop, stored separately from code licensing.
- `scripts/build.mjs` — bundles local modules/assets into `lib/client.js` and writes `lib/index.js`.
- `scripts/crop-dossier.mjs` — deterministic crop recipe from the approved concept art.
- `tests/preferences.test.mjs` — preference validation, storage, migration, and safe-mode tests.
- `tests/theme-controller.test.mjs` — root attributes, scheme tracking, style lifecycle, and cleanup tests.
- `tests/settings-slot.test.mjs` — mocked Harness locale/slot/store integration tests.
- `tests/tactical-shell.test.mjs` — jsdom render, telemetry, interaction, mutation, and cleanup tests.
- `tests/package.test.mjs` — package/patch/build output contract tests.
- `tests/e2e/theme.spec.mjs` — Playwright desktop/tablet/light/dark/safe-mode/live smoke coverage.
- `tests/fixtures/harness.html` — deterministic rc.7-like DOM fixture with DSH data hooks.
- `README.md` — Chinese installation, enable, update, safe-mode, and removal instructions.
- `README.en.md` — concise English counterpart.
- `THIRD_PARTY_NOTICES.md` — code/font/art rights boundary.
- `LICENSE` — MIT license for code only.

---

### Task 1: Package Contract and Deterministic Build

**Files:**
- Create: `package.json`
- Create: `cordis.patch.yml`
- Create: `src/index.js`
- Create: `scripts/build.mjs`
- Create: `tests/package.test.mjs`

**Interfaces:**
- Produces: `npm run build`, `lib/index.js`, `lib/client.js`, and the `dsh-theme-prts/client` export consumed by the Harness module loader.
- Consumes: no earlier task.

- [ ] **Step 1: Write the failing package contract test**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url)))

test('declares the rc.7 DSH client bundle contract', async () => {
  assert.equal(pkg.name, 'dsh-theme-prts')
  assert.deepEqual(pkg.dsh.client, { platform: 'web', immediately: true })
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(pkg.exports['./client'].default, './lib/client.js')
  const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
  assert.match(patch, /id: theme-prts/)
  assert.match(patch, /name: 'dsh-theme-prts'/)
})
```

- [ ] **Step 2: Run the test and verify the contract is absent**

Run: `node --test tests/package.test.mjs`
Expected: FAIL because `package.json` and `cordis.patch.yml` do not exist.

- [ ] **Step 3: Add the minimal package, Host entry, patch, and build script**

Use this DSH metadata in `package.json`:

```json
{
  "name": "dsh-theme-prts",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Personal non-commercial Arknights P.R.T.S. fan UI for DeepSeek Harness",
  "license": "MIT",
  "dsh": {
    "client": { "platform": "web", "immediately": true },
    "bundle": { "patch": "./cordis.patch.yml" }
  },
  "main": "lib/index.js",
  "exports": {
    ".": { "default": "./lib/index.js" },
    "./client": { "default": "./lib/client.js" },
    "./cordis.patch.yml": "./cordis.patch.yml",
    "./package.json": "./package.json"
  },
  "files": ["lib", "src", "cordis.patch.yml", "README.md", "README.en.md", "LICENSE", "THIRD_PARTY_NOTICES.md"],
  "scripts": {
    "build": "node scripts/build.mjs",
    "test": "node --test tests/*.test.mjs",
    "test:e2e": "playwright test",
    "check": "npm run build && npm test",
    "pack:plugin": "npm run check && npm pack"
  },
  "engines": { "node": ">=18" },
  "devDependencies": { "@playwright/test": "1.55.0", "jsdom": "24.1.3" }
}
```

`cordis.patch.yml` must insert `{ id: theme-prts, name: 'dsh-theme-prts' }`. `src/index.js` exports `THEME_PLUGIN_ID` and an empty `apply()`. `scripts/build.mjs` reads ordered client modules and assets, substitutes serialized payload constants, wraps the result in `window.__ModuleLoader__.load({ id: 'dsh-theme-prts', factory(require) { ... } })`, and writes both `lib` entries atomically.

- [ ] **Step 4: Run the package test and build**

Run: `node --test tests/package.test.mjs && npm run build`
Expected: PASS; `lib/index.js` and `lib/client.js` exist and contain no unresolved `__PRTS_*__` tokens.

- [ ] **Step 5: Commit the package contract**

```bash
git add package.json cordis.patch.yml src/index.js scripts/build.mjs tests/package.test.mjs lib/index.js lib/client.js
git commit -m "build: scaffold PRTS client plugin"
```

### Task 2: Preferences, Persistence, and Safe Mode

**Files:**
- Create: `src/client/preferences.js`
- Create: `tests/preferences.test.mjs`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Produces: `PRTS_STORAGE_KEY`, `DEFAULT_PREFERENCES`, `normalizePreferences(value)`, `loadPreferences(storage)`, `savePreferences(storage, value)`, and `isSafeMode(search)`.
- Consumes: Task 1 build module ordering.

- [ ] **Step 1: Write failing preference tests**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_PREFERENCES, isSafeMode, loadPreferences, normalizePreferences } from '../src/client/preferences.js'

test('normalizes unsupported values without enabling the theme', () => {
  assert.deepEqual(normalizePreferences({ enabled: 'yes', scheme: 'neon', dossier: 0 }), DEFAULT_PREFERENCES)
})

test('loads a valid version-one payload', () => {
  const storage = { getItem: () => JSON.stringify({ version: 1, enabled: true, scheme: 'dark', dossier: false, texture: 'full', motion: 'reduced', density: 'tactical', panelOpen: true }) }
  assert.equal(loadPreferences(storage).enabled, true)
  assert.equal(loadPreferences(storage).texture, 'full')
})

test('recognizes only the explicit safe-mode query', () => {
  assert.equal(isSafeMode('?prts-safe=1'), true)
  assert.equal(isSafeMode('?prts-safe=0'), false)
  assert.equal(isSafeMode('?mode=prts-safe'), false)
})
```

- [ ] **Step 2: Verify the tests fail**

Run: `node --test tests/preferences.test.mjs`
Expected: FAIL because `src/client/preferences.js` does not exist.

- [ ] **Step 3: Implement strict version-one preferences**

Define:

```js
export const PRTS_STORAGE_KEY = 'dsh.ui.prts.v1'
export const DEFAULT_PREFERENCES = Object.freeze({
  version: 1,
  enabled: false,
  scheme: 'system',
  dossier: true,
  texture: 'full',
  motion: 'system',
  density: 'tactical',
  panelOpen: true,
})
```

Accept only `boolean` values for `enabled`, `dossier`, and `panelOpen`, and exact enum members for the remaining fields. Catch storage and JSON errors and return a fresh default object. `savePreferences` writes the normalized full payload. `isSafeMode` uses `new URLSearchParams(search).get('prts-safe') === '1'`.

- [ ] **Step 4: Run preference tests**

Run: `node --test tests/preferences.test.mjs`
Expected: PASS for defaults, valid storage, corrupted JSON, storage exceptions, enum validation, and safe mode.

- [ ] **Step 5: Commit preference state**

```bash
git add src/client/preferences.js tests/preferences.test.mjs scripts/build.mjs
git commit -m "feat: add PRTS preference store and safe mode"
```

### Task 3: Theme Controller and Recognizable Asset System

**Files:**
- Create: `src/client/theme-controller.js`
- Create: `src/styles/prts.css`
- Create: `src/assets/rhodes-dsh.svg`
- Create: `src/assets/class-icons.svg`
- Create: `scripts/crop-dossier.mjs`
- Create: `src/assets/amiya-dossier.png`
- Create: `tests/theme-controller.test.mjs`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Produces: `createThemeController({ document, window, cssText, assets })` returning `{ apply(preferences), dispose() }`.
- Consumes: `normalizePreferences` and the exact preference fields from Task 2.

- [ ] **Step 1: Write failing lifecycle tests with jsdom**

```js
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import test from 'node:test'
import { createThemeController } from '../src/client/theme-controller.js'

const enabled = { version: 1, enabled: true, scheme: 'dark', dossier: true, texture: 'full', motion: 'system', density: 'tactical', panelOpen: true }

test('applies and fully removes owned theme state', () => {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>')
  const controller = createThemeController({ document: dom.window.document, window: dom.window, cssText: 'html[data-dsh-prts]{color:red}', assets: {} })
  controller.apply(enabled)
  assert.equal(dom.window.document.documentElement.dataset.dshPrts, '')
  assert.equal(dom.window.document.documentElement.dataset.prtsScheme, 'dark')
  assert.ok(dom.window.document.querySelector('style[data-plugin-css="dsh-theme-prts/prts.css"]'))
  controller.dispose()
  assert.equal(dom.window.document.documentElement.hasAttribute('data-dsh-prts'), false)
  assert.equal(dom.window.document.querySelector('[data-plugin="dsh-theme-prts"]'), null)
})
```

- [ ] **Step 2: Verify lifecycle tests fail**

Run: `node --test tests/theme-controller.test.mjs`
Expected: FAIL because the controller does not exist.

- [ ] **Step 3: Implement controller, SVG assets, and asset embedding**

`createThemeController` owns exactly one style element, root attributes, a `matchMedia('(prefers-color-scheme: dark)')` listener for system mode, and a body-attribute observer for Harness theme changes. `apply()` updates attributes without duplicating listeners. `dispose()` removes all owned state.

Draw `rhodes-dsh.svg` as a triangular tower emblem and `class-icons.svg` as a symbol sheet for goal, plan, agent, tool, and output. Crop the approved concept's dossier region deterministically into `src/assets/amiya-dossier.png`; do not use the entire concept image at runtime. The build script embeds SVG strings and the dossier as a PNG data URI.

Start `prts.css` with the complete semantic token matrix for `data-prts-scheme="dark"` and `"light"`. Every active visual selector must begin with `html[data-dsh-prts]`; only the settings-row classes may be ungated so the disabled theme remains configurable.

- [ ] **Step 4: Run controller tests and scan CSS scope**

Run: `node --test tests/theme-controller.test.mjs && node -e "const s=require('fs').readFileSync('src/styles/prts.css','utf8'); if (/^(?!\s*(?:@|\/\*|$|html\[data-dsh-prts\]|\.prts-settings))/m.test(s)) process.exit(1)"`
Expected: PASS; repeated apply does not duplicate state and dispose removes all owned state.

- [ ] **Step 5: Commit theme lifecycle and assets**

```bash
git add src/client/theme-controller.js src/styles/prts.css src/assets scripts/crop-dossier.mjs tests/theme-controller.test.mjs scripts/build.mjs
git commit -m "feat: add PRTS theme lifecycle and fan assets"
```

### Task 4: Native Harness Settings Integration

**Files:**
- Create: `src/client/settings-store.js`
- Create: `src/client/settings-row.js`
- Create: `src/client/index.js`
- Create: `tests/settings-slot.test.mjs`
- Modify: `src/styles/prts.css`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Produces: browser exports `inject = ['slots', 'locale']` and `apply(ctx)`; `createPrtsSettingsStore(defineStore)`; `createSettingsRow(React)`; injected actions `{ updatePreference(key, value), resetPreferences() }`.
- Consumes: Task 2 preferences and Task 3 controller.

- [ ] **Step 1: Write a failing mocked Harness registration test**

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { applyPrtsPlugin } from '../src/client/index.js'

test('registers locale and settings.general.item through declaration injection', () => {
  const calls = []
  const ctx = {
    effect: fn => fn(),
    locale: { register: (ns, dict) => { calls.push(['locale', ns, dict]); return () => {} } },
    slots: {
      inject: (name, fn) => { calls.push(['inject', name]); return fn() },
      register: (options, component) => { calls.push(['register', options, component]); return () => {} },
    },
  }
  applyPrtsPlugin(ctx, { document: undefined, window: undefined, React: { createElement() {} }, defineStore: spec => spec })
  assert.deepEqual(calls[1], ['inject', 'settings.general.item'])
  assert.equal(calls[2][1].id, 'prts-theme')
  assert.equal(calls[2][1].locale, 'settings.prts')
})
```

- [ ] **Step 2: Verify the settings test fails**

Run: `node --test tests/settings-slot.test.mjs`
Expected: FAIL because the browser plugin assembly does not exist.

- [ ] **Step 3: Implement the rc.7-compatible store, component, and apply assembly**

Mirror the installed Stardew plugin's proven pattern:

```js
ctx.slots.inject('settings.general.item', () => ctx.slots.register({
  name: 'settings.general.item',
  id: 'prts-theme',
  order: 21,
  store,
  locale: 'settings.prts',
  inject: injectedActions,
}, PrtsSettingsRow))
```

The row uses `React.createElement` rather than JSX and renders labeled native buttons for enabled, scheme, dossier, texture, motion, and density plus Reset. Buttons expose `aria-pressed`. Chinese and English dictionaries use identical key sets. Updating any preference normalizes, persists, applies the theme controller, syncs the store with a monotonic revision, and mounts or disposes the tactical shell as needed. In safe mode, register settings but do not apply theme CSS, root attributes, or tactical nodes.

- [ ] **Step 4: Run slot and preference tests**

Run: `node --test tests/settings-slot.test.mjs tests/preferences.test.mjs tests/theme-controller.test.mjs`
Expected: PASS; locale, slot options, revision ordering, safe mode, and update/reset actions are covered.

- [ ] **Step 5: Commit native settings integration**

```bash
git add src/client/index.js src/client/settings-store.js src/client/settings-row.js src/styles/prts.css scripts/build.mjs tests/settings-slot.test.mjs
git commit -m "feat: add native PRTS theme settings"
```

### Task 5: Tactical Shell and Live Telemetry Projection

**Files:**
- Create: `src/client/tactical-shell.js`
- Create: `tests/fixtures/harness.html`
- Create: `tests/tactical-shell.test.mjs`
- Modify: `src/client/index.js`
- Modify: `src/styles/prts.css`
- Modify: `scripts/build.mjs`

**Interfaces:**
- Produces: `collectTelemetry(document, location)`, `renderTacticalMarkup(state, assets)`, and `createTacticalShell({ document, window, assets, onPanelChange })` returning `{ update(preferences), dispose() }`.
- Consumes: Task 2 `panelOpen` preference and Task 3 embedded assets.

- [ ] **Step 1: Write failing telemetry and lifecycle tests**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import test from 'node:test'
import { collectTelemetry, createTacticalShell } from '../src/client/tactical-shell.js'

const fixture = await readFile(new URL('./fixtures/harness.html', import.meta.url), 'utf8')

test('projects visible Harness operation state', () => {
  const dom = new JSDOM(fixture, { url: 'http://localhost/session/op-06' })
  const state = collectTelemetry(dom.window.document, dom.window.location)
  assert.equal(state.goal, '实现 P.R.T.S. UI 插件')
  assert.equal(state.plan.completed, 2)
  assert.equal(state.plan.total, 6)
  assert.equal(state.agents, 2)
  assert.equal(state.tools, 3)
})

test('mounts one shell, toggles the panel, and cleans up', () => {
  const dom = new JSDOM(fixture, { url: 'http://localhost/session/op-06', pretendToBeVisual: true })
  const shell = createTacticalShell({ document: dom.window.document, window: dom.window, assets: {}, onPanelChange() {} })
  shell.update({ panelOpen: true, dossier: true })
  assert.equal(dom.window.document.querySelectorAll('[data-prts-shell]').length, 1)
  dom.window.document.querySelector('[data-prts-panel-toggle]').click()
  assert.equal(dom.window.document.documentElement.dataset.prtsPanel, 'closed')
  shell.dispose()
  assert.equal(dom.window.document.querySelector('[data-prts-shell]'), null)
})
```

- [ ] **Step 2: Verify tactical tests fail**

Run: `node --test tests/tactical-shell.test.mjs`
Expected: FAIL because the shell module does not exist.

- [ ] **Step 3: Implement the status bar, panel, observer, and fallback semantics**

Mount one `[data-prts-shell]` containing:

- a global P.R.T.S./DeepSeek Harness operation bar;
- DSH link, scheme, current session code, and clearance labels;
- a collapse button with `aria-expanded` and `aria-controls`;
- a right `TACTICAL OVERVIEW` panel;
- Goal and Plan projections;
- Agent and Tool counts;
- Deliverables state;
- context/status strip;
- optional dossier image and redrawn emblem.

`collectTelemetry` checks stable hooks first (`[data-slot*="goal"]`, `[data-testid*="goal"]`, `[data-slot*="plan"]`, `[data-testid*="subagent"]`, `[data-testid*="tool"]`, `[data-testid*="deliverable"]`) and then isolated rc.7 text/class fallbacks. Missing values render localized `STANDBY` or `NO ACTIVE DATA`; they never fabricate counts.

A `MutationObserver` schedules one `requestAnimationFrame` refresh, updates only changed text/attributes, and never replaces the active button. Dispose cancels the frame, disconnects the observer, removes event listeners and nodes, and clears root layout attributes.

- [ ] **Step 4: Run tactical tests including mutation and cleanup cases**

Run: `node --test tests/tactical-shell.test.mjs`
Expected: PASS for initial telemetry, missing hooks, mutation refresh, keyboard activation, panel persistence callback, no duplicate mount, and complete cleanup.

- [ ] **Step 5: Commit the tactical shell**

```bash
git add src/client/tactical-shell.js src/client/index.js src/styles/prts.css scripts/build.mjs tests/fixtures/harness.html tests/tactical-shell.test.mjs
git commit -m "feat: add PRTS tactical operations shell"
```

### Task 6: High-Fidelity DSH Styling, Responsive Layout, and Accessibility

**Files:**
- Modify: `src/styles/prts.css`
- Modify: `tests/fixtures/harness.html`
- Modify: `tests/tactical-shell.test.mjs`
- Create: `tests/css-contract.test.mjs`

**Interfaces:**
- Produces: final visual contract for root tokens, Harness surfaces, shell, responsive drawers, light/dark modes, focus, zoom, and reduced motion.
- Consumes: Tasks 3–5 attributes and markup; no new JavaScript API.

- [ ] **Step 1: Write failing CSS contract tests**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const css = await readFile(new URL('../src/styles/prts.css', import.meta.url), 'utf8')

test('contains every confirmed visual and accessibility state', () => {
  for (const token of [
    'html[data-dsh-prts][data-prts-scheme="dark"]',
    'html[data-dsh-prts][data-prts-scheme="light"]',
    '[data-prts-shell]',
    '[data-prts-dossier]',
    '[data-composer-card]',
    '[data-conversation-scroll]',
    ':focus-visible',
    '@media (max-width: 1024px)',
    '@media (max-width: 640px)',
    '@media (prefers-reduced-motion: reduce)',
  ]) assert.ok(css.includes(token), token)
})
```

- [ ] **Step 2: Verify the visual contract test fails on missing states**

Run: `node --test tests/css-contract.test.mjs`
Expected: FAIL listing the still-missing selectors or media rules.

- [ ] **Step 3: Complete the approved high-fidelity visual system**

Implement the concept image's defining features rather than generic industrial styling:

- dark navigation rail with redrawn Rhodes emblem;
- condensed operation titles and oversized numbers;
- monospaced status telemetry and bilingual microcopy;
- fractured light panels and near-black dark panels;
- yellow active/session/execution geometry;
- cyan link/tool activity and red error/denial states;
- barcodes, halftone masks, diagonal cuts, warning strips, map contours, and low-opacity scanlines;
- square/cut-corner controls with no SaaS pills or glassmorphism;
- user/assistant blocks that preserve long-form readability;
- compact tool/agent strips and a dossier-style right panel;
- desktop root offsets for the top bar/right panel;
- tablet drawer behavior and phone fallback;
- visible focus, text/icon status redundancy, AA contrast, reduced motion, and no content smaller than 11px for essential information.

Keep rc.7 fallback class selectors inside one commented section named `RC.7 COMPATIBILITY FALLBACKS`.

- [ ] **Step 4: Run all unit and contract tests**

Run: `npm test`
Expected: PASS with no skipped tests, duplicate-node failures, unscoped active CSS, or lifecycle leaks.

- [ ] **Step 5: Commit the visual system**

```bash
git add src/styles/prts.css tests/fixtures/harness.html tests/tactical-shell.test.mjs tests/css-contract.test.mjs
git commit -m "feat: complete Arknights PRTS visual system"
```

### Task 7: Documentation, Packaging, and Static Verification

**Files:**
- Create: `README.md`
- Create: `README.en.md`
- Create: `THIRD_PARTY_NOTICES.md`
- Create: `LICENSE`
- Modify: `tests/package.test.mjs`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `dsh-theme-prts-0.1.0.tgz` and exact Docker install/update/remove/recovery instructions.
- Consumes: all source/build outputs from Tasks 1–6.

- [ ] **Step 1: Extend package tests to inspect the npm tarball**

Add assertions that `npm pack --json --dry-run` includes `lib/client.js`, `lib/index.js`, `cordis.patch.yml`, source/assets, both READMEs, license, and notices, and excludes tests, design concept art, `node_modules`, and temporary screenshots.

- [ ] **Step 2: Verify the documentation/package test fails**

Run: `node --test tests/package.test.mjs`
Expected: FAIL because the documentation, notices, license, or files contract is incomplete.

- [ ] **Step 3: Write the user and rights documentation**

`README.md` must include exact commands for:

```bash
npm ci
npm run check
npm run pack:plugin
docker cp dsh-theme-prts-0.1.0.tgz deepseek-harness:/workspace/
docker exec deepseek-harness dsh plugin --profile web add /workspace/dsh-theme-prts-0.1.0.tgz
docker restart deepseek-harness
docker exec deepseek-harness dsh plugin --profile web remove dsh-theme-prts
```

Document Settings enablement, `?prts-safe=1`, theme reset, update behavior, persisted `/data`, and interaction with other skins. `THIRD_PARTY_NOTICES.md` must state that MIT covers code only, while redrawn Rhodes/Amiya/Arknights-identifying art is personal non-commercial fan art with original rights retained by their owners.

- [ ] **Step 4: Build, test, and inspect the tarball**

Run: `npm run check && npm pack --json --dry-run && npm pack`
Expected: PASS and create exactly one `dsh-theme-prts-0.1.0.tgz` containing the declared files.

- [ ] **Step 5: Commit packaging and docs**

```bash
git add README.md README.en.md THIRD_PARTY_NOTICES.md LICENSE .gitignore tests/package.test.mjs package.json
git commit -m "docs: add PRTS plugin delivery guide"
```

### Task 8: Playwright and Live Docker Acceptance

**Files:**
- Create: `playwright.config.mjs`
- Create: `tests/e2e/theme.spec.mjs`
- Create: `tests/e2e/fixture-server.mjs`
- Create: `tests/e2e/screenshots/.gitkeep`
- Modify: `README.md` only if live commands differ from the documented rc.7 flow.

**Interfaces:**
- Produces: screenshot evidence for fixture dark/light/desktop/tablet plus a passing live rc.7 smoke test and installed `/data/profiles/web/node_modules/dsh-theme-prts` package.
- Consumes: Task 7 tarball and current Docker service at `http://192.168.10.106:3080`.

- [ ] **Step 1: Write failing fixture and live Playwright tests**

The fixture tests must:

```js
await page.goto('/tests/fixtures/harness.html')
await page.evaluate(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 1, enabled: true, scheme: 'dark', dossier: true, texture: 'full', motion: 'reduced', density: 'tactical', panelOpen: true })))
await page.reload()
await expect(page.locator('[data-prts-shell]')).toHaveCount(1)
await expect(page.locator('[data-prts-tactical]')).toBeVisible()
await expect(page).toHaveScreenshot('prts-dark-1440.png', { fullPage: true })
```

Add light 1440px, tablet 1024px, phone 390px, panel collapse/focus, enable-disable cleanup, and `?prts-safe=1` cases. The live test uses `PRTS_LIVE_URL` and verifies the boot payload contains `dsh-theme-prts`, the settings page loads without console errors, enabling via local storage mounts one shell, and safe mode mounts none.

- [ ] **Step 2: Verify tests fail before browser/deployment setup**

Run: `npx playwright test tests/e2e/theme.spec.mjs --project=chromium`
Expected: FAIL because Chromium, the fixture loader, or live plugin is not yet available.

- [ ] **Step 3: Install Chromium and validate deterministic fixture screenshots**

Run: `npx playwright install chromium && npm run build && npx playwright test tests/e2e/theme.spec.mjs --project=chromium --grep-invert @live`
Expected: PASS at 1440px, 1024px, and 390px with no overlap, clipping, horizontal page overflow, or console errors.

- [ ] **Step 4: Install the tarball into the persisted Web profile**

Run:

```bash
docker cp dsh-theme-prts-0.1.0.tgz deepseek-harness:/workspace/dsh-theme-prts-0.1.0.tgz
docker exec deepseek-harness dsh plugin --profile web add /workspace/dsh-theme-prts-0.1.0.tgz
docker restart deepseek-harness
```

Wait for `docker inspect --format '{{.State.Health.Status}}' deepseek-harness` to report `healthy`. Confirm `dsh plugin --profile web list --depth 0` lists `dsh-theme-prts@0.1.0` and the homepage boot payload contains the module id.

- [ ] **Step 5: Run live rc.7 acceptance and rollback checks**

Run: `PRTS_LIVE_URL=http://192.168.10.106:3080 npx playwright test tests/e2e/theme.spec.mjs --project=chromium --grep @live`
Expected: PASS; default-disabled page, enabled dark/light state, panel collapse, full disable cleanup, and `?prts-safe=1` all remain usable with no page errors.

- [ ] **Step 6: Run the complete verification suite**

Run:

```bash
npm run check
npx playwright test --project=chromium
docker exec deepseek-harness dsh plugin --profile web list --depth 0
curl -L --fail --silent --show-error http://192.168.10.106:3080/
git status --short
```

Expected: unit/build/package/fixture/live tests pass; DSH reports healthy; the boot payload includes `dsh-theme-prts`; Git contains only expected generated screenshot or tarball exclusions.

- [ ] **Step 7: Commit acceptance coverage and final generated bundle**

```bash
git add playwright.config.mjs tests/e2e src lib README.md
git commit -m "test: verify PRTS theme on DeepSeek Harness rc.7"
```
