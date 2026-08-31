import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { JSDOM } from 'jsdom'

const assetUrl = new URL('../src/assets/topographic-map.svg', import.meta.url)

test('ships a sparse rounded 4800px contour field with a seamless survey layer', async () => {
  const svg = await readFile(assetUrl, 'utf8')

  assert.doesNotThrow(
    () => new JSDOM(svg, { contentType: 'image/svg+xml' }),
    'the contour asset must be valid XML so browsers can decode it as an SVG image',
  )

  assert.match(svg, /viewBox="0 0 1600 4800"/)
  assert.match(svg, /preserveAspectRatio="none"/)
  assert.match(svg, /id="survey-grid"/)
  assert.match(svg, /data-survey-marks/)
  assert.match(svg, /opacity="\.0(?:45|9)"/)

  const landforms = [...svg.matchAll(/<g data-landform="([^"]+)"/g)].map(([, name]) => name)
  assert.ok(landforms.length >= 7 && landforms.length <= 8)
  assert.equal(new Set(landforms).size, landforms.length)

  const contours = [...svg.matchAll(/<path data-contour="([^"]+)" d="([^"]+)"/g)]
  assert.ok(contours.length >= 28 && contours.length <= 36)
  assert.ok(contours.every(([, kind, d]) => ['index', 'minor'].includes(kind) && d.includes('C') && d.endsWith('Z')))
  assert.ok(contours.every(([, , d]) => !d.includes('L')), 'contours should use rounded cubic curves, not angular line segments')

  const seamTop = contours.filter(([, , d]) => /^M-?\d+ 0C/.test(d))
  const seamBottom = contours.filter(([, , d]) => /^M-?\d+ 4800C/.test(d))
  assert.equal(seamTop.length, 4)
  assert.equal(seamBottom.length, seamTop.length)

  const topStarts = seamTop.map(([, , d]) => d.match(/^M(-?\d+) 0C/)[1])
  const bottomStarts = seamBottom.map(([, , d]) => d.match(/^M(-?\d+) 4800C/)[1])
  assert.deepEqual(bottomStarts, topStarts)

  const bytes = Buffer.byteLength(svg)
  assert.ok(bytes < 18_000, `contour asset should stay intentionally sparse, got ${bytes} bytes`)
})
