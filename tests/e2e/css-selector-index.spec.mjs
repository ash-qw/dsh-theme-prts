import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { indexCssSelectors } from '../../scripts/css-selector-index.mjs'

const styleNames = ['prts', 'stabilization', 'refinement', 'theme-settings-workbench', 'facility-vector', 'startup-sequence', 'custom-background', 'cursor']
const sources = await Promise.all(styleNames.map(name => readFile(new URL(`../../src/styles/${name}.css`, import.meta.url), 'utf8')))
const glass = await readFile(new URL('../../src/vendor/react-bits/GlassSurface.css', import.meta.url), 'utf8')
const themeCss = [...sources, `[data-prts-composer-glass-surface] { ${glass} }`].join('\n')

test('indexed subjects preserve browser matching, specificity and generated content', async ({ page }) => {
  const source = `
    main .first { color: rgb(200, 0, 0); }
    main :is([data-first], [data-second]) { color: rgb(0, 100, 0); }
    main { & :is(h1, h2) { padding: 7px; } }
    main > :is(.first, .second)::before { content: "indexed"; border: 2px solid red; }
    @media (width > 1px) { main :is(h1, h2) { margin: 3px; } }
    main :is([data-first] span, [data-second]) { background: rgb(0, 0, 150); }
    .scope :is(.outside .leaf, .alternate .leaf) { color: rgb(120, 0, 120); }
    :root { --tokens: { :is(.first,.second) { color: red } }; }
  `
  const indexed = indexCssSelectors(source)
  expect(indexed).not.toBe(source)
  await page.setContent(`
    <main><h1 id="first" class="first" data-first>First <span id="child">child</span></h1>
      <h2 id="second" class="second" data-second>Second</h2></main>
    <div class="outside"><section class="scope"><span id="leaf" class="leaf">Leaf</span></section></div>
  `)
  const result = await page.evaluate(({ source, indexed }) => {
    const style = document.createElement('style')
    document.head.append(style)
    const read = () => Array.from(document.querySelectorAll('[id]')).map(node => ({
      id: node.id,
      values: ['', '::before', '::after'].map(pseudo => {
        const computed = getComputedStyle(node, pseudo || null)
        return Object.fromEntries(['color', 'backgroundColor', 'content', 'border', 'padding', 'margin', 'display'].map(name => [name, computed[name]]))
      }),
    }))
    style.textContent = source
    const before = read()
    style.textContent = indexed
    return { before, after: read() }
  }, { source, indexed })
  expect(result.after).toEqual(result.before)
  expect(result.before.find(node => node.id === 'first').values[0].color).toBe('rgb(0, 100, 0)')
  expect(result.before.find(node => node.id === 'leaf').values[0].color).toBe('rgb(120, 0, 120)')
  expect(result.before.find(node => node.id === 'first').values[1].content).toBe('"indexed"')
})

test('indexing preserves every theme declaration and conditional rule hierarchy', async ({ page }) => {
  const indexed = indexCssSelectors(themeCss)
  expect(indexed).not.toBe(themeCss)
  const result = await page.evaluate(({ source, indexed }) => {
    const read = text => {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(text)
      const visit = rules => Array.from(rules).map(rule => ({
        kind: rule.constructor.name,
        declarations: rule.style?.cssText,
        condition: rule.conditionText,
        name: rule.name,
        syntax: rule.syntax,
        inherits: rule.inherits,
        initialValue: rule.initialValue,
        children: rule.cssRules ? visit(rule.cssRules) : undefined,
      }))
      return visit(sheet.cssRules)
    }
    return { before: read(source), after: read(indexed) }
  }, { source: themeCss, indexed })
  expect(result.before.length).toBeGreaterThan(300)
  expect(result.after).toEqual(result.before)
})
