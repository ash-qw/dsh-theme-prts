import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const css = await readFile(new URL('../src/styles/menu-card.css', import.meta.url), 'utf8')
const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8')
const refinement = await readFile(new URL('../src/styles/refinement.css', import.meta.url), 'utf8')

test('composer layering preserves the native zero-height absolute command-menu anchor', () => {
  for (const marker of ['data-composer-card', 'data-prts-composer-fallback']) {
    assert.ok(refinement.includes(`[${marker}] > :not([data-prts-composer-signal]):not([data-slot="conversation.input.attachments"]):not([data-composer-overlay])`))
    assert.ok(refinement.includes(`[${marker}] > [data-composer-overlay]`))
  }
  assert.match(refinement, /\[data-prts-composer-fallback\] > \[data-composer-overlay\]\s*\{\s*z-index: 2;\s*\}/)
})

test('credential menus are bundled after the existing shared glass materials', () => {
  assert.match(build, /readFile\(resolve\(root, 'src\/styles\/menu-card.css'\), 'utf8'\)/)
  assert.match(build, /\$\{backgroundCss\}\\n\$\{menuCardCss\}/)
})

test('credential decorations target native menu plates and preserve specialized and third-party popups', () => {
  assert.match(css, /\[data-menu-material\]:is\(\[data-prts-floating-glass="menu"\], \[data-prts-glass-menu\]\):not\(\[role="dialog"\], \[role="listbox"\], \[data-prts-floating-preserved\], \[data-prts-preserve-popup-style\]\):has\(> \[aria-hidden="true"\]\[class\*="_material_"\]\)/)
  assert.match(css, /\[aria-hidden="true"\]\[class\*="_material_"\]::before\s*\{\s*content: "RHODES ISLAND"/)
  assert.match(css, /\[aria-hidden="true"\]\[class\*="_material_"\]::after\s*\{\s*content: var\(--prts-menu-card-caption\)/)
  assert.doesNotMatch(css, /z-index:\s*\d|position:\s*fixed|transform:|animation:/)
})

test('credential menus keep shared glass preferences, native scrolling and independent danger states', () => {
  assert.doesNotMatch(css, /\bopacity:|max-height:|overflow-y:|background:\s*#[\da-f]/i)
  assert.match(css, /background: transparent !important;\s*backdrop-filter: none !important/)
  assert.match(css, /& > \[aria-hidden="true"\]\[class\*="_material_"\] \{\s*background: var\(--prts-menu-card-surface\) !important;\s*backdrop-filter: var\(--prts-menu-card-filter\) !important/)
  assert.match(css, /\[data-prts-glass="off"\] \{\s*--prts-menu-card-surface: var\(--prts-panel\);\s*--prts-menu-card-filter: none/)
  assert.match(css, /overflow: visible !important/)
  assert.match(css, /:is\(\[data-prts-floating-item\], \[role="option"\]\):not\(\[data-prts-floating-danger\]\):is\(\[aria-checked="true"\]/)
  assert.match(css, /:focus-visible:not\(:disabled, \[aria-disabled="true"\]\)/)
  assert.match(css, /html\[data-dsh-prts\]\[data-prts-scheme="light"\]/)
  assert.match(css, /\[data-trigger-menu\]\[data-overflow-below\] > \[role="listbox"\]::after/)
})
