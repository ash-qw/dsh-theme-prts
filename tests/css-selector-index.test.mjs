import assert from 'node:assert/strict'
import test from 'node:test'
import { indexCssSelectors } from '../scripts/css-selector-index.mjs'

test('indexes equal-specificity attribute subjects without changing declarations', () => {
  const source = 'html[data-dsh-prts] :is([data-first], [data-second]) { color: var(--ink); }'
  assert.equal(indexCssSelectors(source), 'html[data-dsh-prts] [data-first],html[data-dsh-prts] [data-second] { color: var(--ink); }')
})

test('indexes tag and class subjects', () => {
  assert.equal(indexCssSelectors('main :is(p, li){color:red}'), 'main p,main li{color:red}')
  assert.equal(indexCssSelectors('main :is(h1, h2){color:red}'), 'main h1,main h2{color:red}')
  assert.equal(indexCssSelectors('main :is(.first, .second){color:red}'), 'main .first,main .second{color:red}')
})

test('keeps the complete branch specificity equal rather than counting only the last subject', () => {
  const descendants = 'html :is([data-shell], [data-shell] *){box-sizing:border-box}'
  assert.equal(indexCssSelectors(descendants), descendants)
  const source = 'html :is([data-shell] button, [data-control]){color:red}'
  assert.equal(indexCssSelectors(source), source)
})

test('preserves generated pseudo-elements and combinators', () => {
  assert.equal(indexCssSelectors('main > :is([data-first], [data-second])::before{content:""}'), 'main > [data-first]::before,main > [data-second]::before{content:""}')
  assert.equal(indexCssSelectors('main + :is(.first, .second)::after{content:""}'), 'main + .first::after,main + .second::after{content:""}')
})

test('preserves nested rules, declarations after nested rules and conditional groups', () => {
  const source = '@media (width > 700px){html[data-theme]{color:red;& :is(th,td){padding:14px}background:blue;}}'
  assert.equal(indexCssSelectors(source), '@media (width > 700px){html[data-theme]{color:red;& th,& td{padding:14px}background:blue;}}')
})

test('leaves compound subjects with an existing index key unchanged', () => {
  const sources = [
    'button:is([data-first], [data-second]){color:red}',
    '[data-control]:is(.first, .second){color:red}',
    ':is([data-first], [data-second])[hidden]{display:none}',
    ':is([data-first], [data-second]):hover{color:red}',
  ]
  for (const source of sources) assert.equal(indexCssSelectors(source), source)
})

test('does not expand ancestor groups', () => {
  const source = 'html :is([data-first], [data-second]) button{color:red}'
  assert.equal(indexCssSelectors(source), source)
})

test('does not lower specificity for mixed branches', () => {
  const sources = [
    ':is(button, [role="button"]){color:red}',
    ':is(.first, [data-second][hidden]){color:red}',
    ':is(.first, #second){color:red}',
    ':is(*, .second){color:red}',
  ]
  for (const source of sources) assert.equal(indexCssSelectors(source), source)
})

test('leaves functional pseudo-classes, nesting references and namespaces unsupported by the narrow grammar intact', () => {
  const sources = [
    ':is([data-first], :not([data-second])){color:red}',
    ':is(:hover, :focus-visible){color:red}',
    ':is(&, .second){color:red}',
    ':is(svg|a, svg|path){color:red}',
    ':is(.first\\:name, .second){color:red}',
  ]
  for (const source of sources) assert.equal(indexCssSelectors(source), source)
})

test('does not mistake punctuation inside quoted attribute values for selector syntax or specificity', () => {
  const source = ':is([data-first="a.b,(){};]"], [data-second="c,d"]){color:red}'
  assert.equal(indexCssSelectors(source), '[data-first="a.b,(){};]"],[data-second="c,d"]{color:red}')
})

test('preserves declaration strings, URLs, custom properties and at-rule preludes', () => {
  const source = '@supports selector(:is(.first,.second)){:root{--example: ":is(.first,.second){a;b}";background:url("data:image/svg+xml,<svg>{;}</svg>");} :is(.first,.second){content:"a;b{c}"}}'
  assert.equal(indexCssSelectors(source), '@supports selector(:is(.first,.second)){:root{--example: ":is(.first,.second){a;b}";background:url("data:image/svg+xml,<svg>{;}</svg>");} .first,.second{content:"a;b{c}"}}')
})

test('preserves sibling selectors in an existing list and remains idempotent', () => {
  const source = 'html :is(.first,.second),html button{color:red}'
  const indexed = indexCssSelectors(source)
  assert.equal(indexed, 'html .first,html .second,html button{color:red}')
  assert.equal(indexCssSelectors(indexed), indexed)
})

test('bounds expansion and ignores empty branches', () => {
  const oversized = `:is(${Array.from({ length: 17 }, (_, index) => `.item-${index}`).join(',')}){color:red}`
  assert.equal(indexCssSelectors(oversized), oversized)
  assert.equal(indexCssSelectors(':is(.first,){color:red}'), ':is(.first,){color:red}')
})


test('does not move complex branch ancestors inside the outer selector scope', () => {
  const source = 'main .scope :is(.outside .leaf, .alternate .leaf){color:red}'
  assert.equal(indexCssSelectors(source), source)
})

test('does not rewrite nested token blocks in custom properties', () => {
  const source = ':root{--tokens: { :is(.first,.second){color:red} };} :is(.first,.second){color:blue}'
  assert.equal(indexCssSelectors(source), ':root{--tokens: { :is(.first,.second){color:red} };} .first,.second{color:blue}')
})
