# Liquid Glass Conversation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable Apple-inspired liquid-glass message and composer surfaces without weakening P.R.T.S. identity, text readability, or topographic-map continuity.

**Architecture:** Extend the existing version-one preference payload with a normalized `glass` enum and project it to `data-prts-glass` on the document root. CSS owns all rendering and fallbacks; existing message/composer hooks remain the integration boundary. Playwright validates the real fixture in dark, light, mobile, and ultrawide layouts.

**Tech Stack:** JavaScript ES modules, CSS backdrop filters and pseudo-elements, Node test runner, JSDOM, Playwright Chromium.

**Spec:** Conversation-approved design in the Codex task dated 2026-08-23.

## Global Constraints

- Glass modes are exactly `off`, `soft`, and `liquid`; default is `soft`.
- Fixed plugin-owned setting labels remain Chinese; host-localized strings are not replaced.
- Messages and composer use glass; code, tables, quotes, tools, plans, and errors retain readable inner surfaces.
- Dark mode uses smoked glass, light mode uses milky glass, with yellow/cyan identity accents.
- Motion respects `data-prts-motion`, `prefers-reduced-motion`, touch input, and mobile performance.
- Unsupported `backdrop-filter` falls back to opaque current-theme panels.
- Docker deployment waits for explicit screenshot approval.

---

### Task 1: Preference and root-attribute contract

**Files:**
- Modify: `src/client/preferences.js`
- Modify: `src/client/theme-controller.js`
- Test: `tests/preferences.test.mjs`
- Test: `tests/theme-controller.test.mjs`

**Interfaces:**
- Consumes: stored version-one preference objects.
- Produces: normalized `glass: 'off' | 'soft' | 'liquid'` and root `data-prts-glass`.

- [ ] **Step 1: Write failing preference tests**

```js
assert.equal(api.DEFAULT_PREFERENCES.glass, 'soft')
assert.equal(api.normalizePreferences({ glass: 'liquid' }).glass, 'liquid')
assert.equal(api.normalizePreferences({ glass: 'unsupported' }).glass, 'soft')
```

- [ ] **Step 2: Run `node --test tests/preferences.test.mjs` and verify the assertions fail because `glass` is absent**

- [ ] **Step 3: Add `GLASS_MODES`, default `glass: 'soft'`, and enum normalization**

```js
const GLASS_MODES = new Set(['off', 'soft', 'liquid'])
glass: enumOr(input.glass, GLASS_MODES, DEFAULT_PREFERENCES.glass),
```

- [ ] **Step 4: Write and run failing theme-controller assertions for `data-prts-glass` apply and cleanup**

- [ ] **Step 5: Add `data-prts-glass` to owned attributes and set it from normalized preferences**

- [ ] **Step 6: Run both focused tests and verify they pass**

### Task 2: Independent Chinese setting controls

**Files:**
- Modify: `src/client/settings-page.js`
- Test: `tests/settings-section.test.mjs`
- Test: `tests/e2e/theme.spec.mjs`

**Interfaces:**
- Consumes: `preferences.glass` and existing `updatePreference(key, value)`.
- Produces: a fixed Chinese `玻璃对话框` group with `关闭 / 柔和 / 液态` pressed buttons.

- [ ] **Step 1: Add failing settings-tree assertions**

```js
for (const label of ['玻璃对话框', '关闭', '柔和', '液态']) assert.ok(text.includes(label))
assert.equal(buttons.filter(button => button.props['aria-pressed'] === true).length, 8)
```

- [ ] **Step 2: Run `node --test tests/settings-section.test.mjs` and verify the label/count assertions fail**

- [ ] **Step 3: Add the `glass` group to `GROUPS` and update fixture preference objects**

- [ ] **Step 4: Verify settings tests pass and the setting persists immediately through the existing runtime path**

### Task 3: Liquid-glass CSS rendering and safe fallback

**Files:**
- Modify: `src/styles/prts.css`
- Test: `tests/css-contract.test.mjs`

**Interfaces:**
- Consumes: `data-prts-glass`, `data-prts-scheme`, `data-prts-motion`, existing message/composer hooks.
- Produces: smoked/milky glass tokens, 18px hybrid rounded-cut geometry, identity rims, hover sheen, dense-content protection, mobile/reduced-motion behavior, and unsupported-filter fallback.

- [ ] **Step 1: Add a failing computed-style contract for soft, liquid, and off modes**

```js
assert.equal(soft.backdropFilter, 'blur(18px) saturate(145%)')
assert.equal(liquid.backdropFilter, 'blur(28px) saturate(175%)')
assert.equal(off.backdropFilter, 'none')
assert.match(css, /@supports not ((backdrop-filter: blur(1px)))/)
```

- [ ] **Step 2: Run `node --test tests/css-contract.test.mjs` and verify it fails on missing glass rules**

- [ ] **Step 3: Add theme tokens and scoped message/composer glass layers**

```css
html[data-dsh-prts][data-prts-glass="soft"] [data-message-role] {
  background: var(--prts-glass-surface) !important;
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  backdrop-filter: blur(18px) saturate(145%);
}
```

- [ ] **Step 4: Add opaque inner surfaces for `pre`, tables, blockquotes, tool/plan/goal/error states**

- [ ] **Step 5: Add CSS-only hover sheen, reduced-motion/touch/mobile rules, and opaque `@supports not` fallback**

- [ ] **Step 6: Run CSS contracts and verify all assertions pass**

### Task 4: Browser behavior and visual approval artifacts

**Files:**
- Modify: `tests/e2e/theme.spec.mjs`
- Update: `tests/e2e/screenshots/prts-dark-1440.png`
- Update: `tests/e2e/screenshots/prts-light-1440.png`
- Update: `tests/e2e/screenshots/prts-phone-390.png`
- Update: `tests/e2e/screenshots/prts-ultrawide-2560.png`

**Interfaces:**
- Consumes: fixture preferences and rendered theme.
- Produces: screenshot evidence and computed-style checks for the three modes.

- [ ] **Step 1: Add failing browser assertions for root mode, backdrop filter, rounded-cut geometry, opaque code, and mode switching**

- [ ] **Step 2: Run the focused Playwright tests and verify failure before rebuilding**

- [ ] **Step 3: Run `npm run build` and focused Playwright tests until behavior passes**

- [ ] **Step 4: Refresh dark, light, phone, and ultrawide screenshots**

- [ ] **Step 5: Run `npm test`, `npx playwright test`, and `git diff --check`**

- [ ] **Step 6: Present screenshots for user approval; do not package or deploy yet**
