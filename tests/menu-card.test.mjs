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

test('credential menus omit the external hanger without replacing native scroll indicators', () => {
  assert.doesNotMatch(css, /\n  &::before\s*\{/)
  assert.doesNotMatch(css, /content:\s*none/)
  assert.match(css, /\n  &::after\s*\{[\s\S]*?width: 24px;/)
})

test('credential decorations target native menu plates and preserve specialized and third-party popups', () => {
  assert.match(css, /\[data-menu-material\]:is\(\[data-prts-floating-glass="menu"\], \[data-prts-glass-menu\]\):not\(\[role="dialog"\]:not\(\[data-subagent-panel\]\), \[aria-modal="true"\], \[role="listbox"\], \[data-prts-floating-preserved\], \[data-prts-preserve-popup-style\]\):has\(> \[aria-hidden="true"\]\[class\*="_material_"\]\)/)
  assert.match(css, /\[aria-hidden="true"\]\[class\*="_material_"\]::before\s*\{\s*content: "RHODES ISLAND"/)
  assert.match(css, /\[aria-hidden="true"\]\[class\*="_material_"\]::after\s*\{\s*content: var\(--prts-menu-card-caption\)/)
  assert.doesNotMatch(css, /z-index:\s*\d|position:\s*fixed|transform:|animation:/)
})

test('team credentials opt in native subagent panels without overriding tree geometry or status colors', () => {
  const team = css.match(/&\[data-subagent-panel\] \{([\s\S]*?)\n  \}\n/)?.[1]
  assert.ok(team)
  assert.match(team, /--prts-menu-card-caption: "TEAM";/)
  assert.match(css, /--dsw-alias-label-tertiary: var\(--prts-muted\);/)
  assert.match(team, /\[data-team-panel\]\[data-with-members="true"\]/)
  assert.match(team, /\[role="treeitem"\]\[aria-current="true"\]/)
  assert.match(team, /:focus-visible:not\(:disabled, \[aria-disabled="true"\]\)/)
  assert.doesNotMatch(team, /--dsw-alias-state-|min-height:|padding:|overflow:|position:|\[data-state/)
})

test('preset credentials use their semantic category instead of the generic caption', () => {
  assert.match(css, /&\[data-prts-glass-menu="preset"\] \{\s*--prts-menu-card-caption: "MODE";/)
})

test('credential surfaces keep ordered translucent tiers and locally readable secondary text', () => {
  for (const [selector, expected] of [
    ['html[data-dsh-prts]', [.6, .46, .34]],
    ['html[data-dsh-prts][data-prts-scheme="light"]', [.66, .52, .4]],
  ]) {
    const block = css.slice(css.indexOf(`${selector} {`)).split('}')[0]
    const alphas = ['soft', 'standard', 'clear'].map(tier => Number(block.match(new RegExp(`--prts-menu-card-${tier}: rgba\\([^,]+,[^,]+,[^,]+, ([.\\d]+)\\)`))[1]))
    assert.deepEqual(alphas, expected)
    assert.ok(alphas[0] > alphas[1] && alphas[1] > alphas[2])
  }
  assert.match(css, /--prts-menu-card-filter: blur\(20px\)/)
  assert.match(css, /--prts-muted: var\(--prts-menu-card-muted\);/)
  for (const tone of ['secondary', 'tertiary', 'caption']) {
    assert.ok(css.includes(`--dsw-alias-label-${tone}: var(--prts-muted);`))
  }
})

test('selected credential rows rebind native and theme text tokens for nested labels', () => {
  const selected = css.match(/& :is\(\[data-prts-floating-item\], \[role="option"\]\):not\(\[data-prts-floating-danger\]\):is\([^\n]+\) \{([^}]+)/)?.[1]
  assert.ok(selected)
  assert.match(selected, /--prts-ink: var\(--prts-menu-card-selected-ink\);/)
  assert.match(selected, /--prts-muted: color-mix\(in srgb, var\(--prts-menu-card-selected-ink\) 80%, transparent\);/)
  assert.match(selected, /--dsw-alias-label-primary: var\(--prts-ink\);/)
  for (const tone of ['secondary', 'tertiary', 'caption']) {
    assert.ok(selected.includes(`--dsw-alias-label-${tone}: var(--prts-muted);`))
  }
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
