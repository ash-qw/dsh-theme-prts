import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { applyMenuLettering, createMenuLettering } from '../scripts/menu-lettering.mjs'

const css = applyMenuLettering(await readFile(new URL('../src/styles/menu-card.css', import.meta.url), 'utf8'))
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
  const caption = css.match(/\n  &::before\s*\{([^}]+)/)?.[1]
  assert.ok(caption)
  assert.match(caption, /content: "";/)
  assert.match(caption, /top: 0;/)
  assert.match(caption, /right: 0;/)
  assert.match(caption, /width: 65px;/)
  assert.match(caption, /height: 24px;/)
  assert.match(caption, /pointer-events: none;/)
  assert.doesNotMatch(caption, /top: -|bottom:|transform:/)
  assert.doesNotMatch(css, /content:\s*none/)
  assert.match(css, /\n  &::after\s*\{[\s\S]*?width: 24px;/)
})

test('credential stamp clips a separate palette-aware plate instead of simulating its edge with a gradient', () => {
  const plate = css.match(/\[aria-hidden="true"\]\[class\*="_material_"\]::after\s*\{([^}]+)/)?.[1]
  assert.ok(plate)
  assert.match(plate, /content: "";/)
  assert.match(plate, /width: 65px;/)
  assert.match(plate, /height: 24px;/)
  assert.match(plate, /background: color-mix\(in srgb, var\(--prts-yellow\) 86%, transparent\);/)
  assert.match(plate, /clip-path: polygon\(7px 0, 100% 0, 100% 100%, 0 100%\);/)
  assert.match(plate, /pointer-events: none;/)
  assert.doesNotMatch(css, /linear-gradient\(106|transparent 6\.(?:32|72)px/)
  assert.equal((css.match(/clip-path:/g) ?? []).length, 1)
})

test('credential rail lettering preserves open counters without small rotated font rendering', () => {
  const svg = createMenuLettering().rail.replaceAll("'", '"')
  assert.match(svg, /<title>P\.R\.T\.S\.<\/title>/)
  assert.match(svg, /viewBox="0 0 24 112"/)
  assert.match(svg, /transform="translate\(11 8\) rotate\(90\)"/)
  assert.match(svg, /fill="currentColor"/)
  assert.doesNotMatch(svg, /<text\b|font-/)
  assert.equal((svg.match(/<path\b/g) ?? []).length, 5)
  assert.equal((svg.match(/<use\b/g) ?? []).length, 8)
  assert.equal((svg.match(/href="#g46"/g) ?? []).length, 4)
})

test('credential roles reuse self-contained outlined glyphs without external fonts or synthetic strokes', () => {
  for (const image of Object.values(createMenuLettering())) {
    const { window } = new JSDOM(image, { contentType: 'image/svg+xml' })
    const document = window.document
    const paths = [...document.querySelectorAll('defs path')]
    assert.ok(paths.length > 0)
    assert.ok(paths.every(path => path.getAttribute('d')?.length > 0))
    const uses = [...document.querySelectorAll('use')]
    assert.ok(uses.length > paths.length)
    for (const use of uses) {
      const reference = use.getAttribute('href')
      assert.match(reference, /^#g\d+$/)
      assert.equal(document.querySelector(reference)?.tagName, 'path')
      assert.ok(Number.isFinite(Number(use.getAttribute('x'))))
      assert.ok(Number.isFinite(Number(use.getAttribute('y'))))
    }
    assert.doesNotMatch(image, /<text\b|font-|<image\b|<script\b|stroke=|shape-rendering=|scale\(/)
    window.close()
  }
  const first = createMenuLettering()
  first.rail = ''
  assert.notEqual(createMenuLettering().rail, '')
})

test('credential type assets retain all three source licenses and provenance', async () => {
  const root = new URL('../src/assets/menu-lettering/', import.meta.url)
  const provenance = await readFile(new URL('README.md', root), 'utf8')
  for (const [family, license] of [['Saira Stencil One', 'sairastencilone'], ['Montserrat', 'montserrat'], ['Orbitron', 'orbitron']]) {
    assert.ok(provenance.includes(family))
    const text = await readFile(new URL(`${license}-OFL.txt`, root), 'utf8')
    assert.match(text, /Copyright/)
    assert.match(text, /SIL OPEN FONT LICENSE/i)
    assert.match(text, /Version 1\.1/)
    assert.match(text, /DISCLAIMER/)
  }
})

test('credential headers and all semantic stamps use palette-aware vector masks', () => {
  const { header, captions } = createMenuLettering()
  assert.match(header, /<title>RHODES ISLAND<\/title>/)
  assert.match(captions, /viewBox='0 0 65 168'/)
  assert.match(header, /fill='currentColor'/)
  assert.match(captions, /fill='currentColor'/)
  for (const [index, label] of ['PRTS', 'MODEL', 'MODE', 'ACCESS', 'ACTION', 'TEAM', 'SYSTEM'].entries()) {
    assert.ok(captions.includes(`<title>${label}</title>`))
    assert.ok(css.includes(`--prts-menu-card-caption-y: ${index ? -index * 24 : 0}px;`))
  }
  assert.doesNotMatch(header + captions, /<text\b|font-|NaN|undefined/)
  assert.equal((captions.match(/<title>/g) ?? []).length, 7)
  assert.match(css, /background: var\(--prts-muted\);/)
  assert.match(css, /background: var\(--prts-yellow-ink\);/)
  assert.match(css, /mask: var\(--prts-menu-card-caption-mask\)/)
  assert.equal((css.match(/font-size: 0;/g) ?? []).length, 2)
  assert.doesNotMatch(css, /__PRTS_MENU_/)
  assert.throws(() => applyMenuLettering(''), /Missing menu lettering token/)
  assert.ok(Object.values(createMenuLettering()).reduce((bytes, svg) => bytes + Buffer.byteLength(svg), 0) < 10 * 1024)
})

test('credential decorations target native menu plates and preserve specialized and third-party popups', () => {
  assert.match(css, /\[data-menu-material\]:is\(\[data-prts-floating-glass="menu"\], \[data-prts-glass-menu\]\):not\(\[role="dialog"\]:not\(\[data-subagent-panel\]\), \[aria-modal="true"\], \[role="listbox"\], \[data-prts-floating-preserved\], \[data-prts-preserve-popup-style\]\):has\(> \[aria-hidden="true"\]\[class\*="_material_"\]\)/)
  assert.match(css, /\[aria-hidden="true"\]\[class\*="_material_"\]::before\s*\{\s*content: "RHODES ISLAND"/)
  assert.match(css, /\n  &::before\s*\{\s*content: "";/)
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
  assert.match(css, /& > \[aria-hidden="true"\]\[class\*="_material_"\] \{\s*background:[\s\S]*?var\(--prts-menu-card-surface\) !important;\s*backdrop-filter: var\(--prts-menu-card-filter\) !important/)
  assert.match(css, /\[data-prts-glass="off"\] \{\s*--prts-menu-card-surface: var\(--prts-panel\);\s*--prts-menu-card-filter: none/)
  assert.match(css, /overflow: visible !important/)
  assert.match(css, /:is\(\[data-prts-floating-item\], \[role="option"\]\):not\(\[data-prts-floating-danger\]\):is\(\[aria-checked="true"\]/)
  assert.match(css, /:focus-visible:not\(:disabled, \[aria-disabled="true"\]\)/)
  assert.match(css, /html\[data-dsh-prts\]\[data-prts-scheme="light"\]/)
  assert.match(css, /\[data-trigger-menu\]\[data-overflow-below\] > \[role="listbox"\]::after/)
})
