import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { createExactEmblemMask, createRhodesHeroMask, decodePngAlpha, findAlphaBounds } from '../scripts/png-alpha.mjs'
import { inspectOrthogonalCoverage } from '../src/client/particle-field-adapter.js'

const definitions = [
  ['rhodes-island', 0.86],
  ['lungmen', 0.84],
  ['penguin-logistics', 0.87],
  ['rhine-lab', 0.87],
  ['reunion', 0.85],
]

test('decodes all five official RGBA emblems and builds exact centered alpha masks', async () => {
  for (const [key, opticalScale] of definitions) {
    const bytes = await readFile(new URL(`../src/assets/faction-emblems/${key}.png`, import.meta.url))
    const decoded = decodePngAlpha(bytes)
    assert.ok(decoded.width > 0 && decoded.height > 0)
    assert.ok(findAlphaBounds(decoded.alpha, decoded.width, decoded.height))

    const mask = createExactEmblemMask(bytes, { size: 320, opticalScale })
    assert.equal(mask.width, 320)
    assert.equal(mask.height, 320)
    assert.equal(mask.alpha.length, 320 * 320)
    const bounds = findAlphaBounds(mask.alpha, mask.width, mask.height)
    assert.ok(bounds)
    assert.ok(bounds.width <= Math.ceil(320 * opticalScale) + 1)
    assert.ok(bounds.height <= Math.ceil(320 * opticalScale) + 1)
    assert.ok(Math.abs((bounds.left + bounds.right) / 2 - 159.5) <= 1)
    assert.ok(Math.abs((bounds.top + bounds.bottom) / 2 - 159.5) <= 1)
  }
})

test('derives a complete Rhodes hero mark with separately sampled wordmark components', async () => {
  const bytes = await readFile(new URL('../src/assets/faction-emblems/rhodes-island.png', import.meta.url))
  const mask = createRhodesHeroMask(bytes, { size: 320, opticalScale: 0.94 })
  const coverage = inspectOrthogonalCoverage(mask, 'standard')
  assert.ok(coverage.requiredComponents >= 20, 'the tower and RHODES ISLAND letters must remain separate mask components')
  assert.equal(coverage.coveredComponents, coverage.requiredComponents)
  assert.equal(coverage.missingComponents.length, 0)
})
