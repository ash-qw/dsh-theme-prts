import assert from 'node:assert/strict'
import test from 'node:test'

import { createFacilityPath, FACILITY_GEOMETRY } from '../src/client/facility-geometry.js'

test('facility geometry keeps the confirmed fixed-pixel specification', () => {
  assert.deepEqual(FACILITY_GEOMETRY, {
    stroke: 1,
    corner: 1,
    sideDepth: 2,
    sideOpening: 10,
    sideInner: 6,
    topOpening: 50,
    topInner: 40,
    topDepth: 10 / 3,
    sessionTopOpening: 50,
    sessionTopInner: 36.5,
    sessionTopDepth: 4.5,
  })
})

test('facility face is one closed path with a centered top notch and symmetric side cuts', () => {
  const path = createFacilityPath({ width: 200, height: 38, topNotch: true })
  assert.ok(path.startsWith('M 1.5 0.5'))
  assert.ok(path.endsWith(' Z'))
  assert.match(path, /75 0\.5 L 80 3\.833 L 120 3\.833 L 125 0\.5/)
  assert.match(path, /199\.5 14 L 197\.5 16 L 197\.5 22 L 199\.5 24/)
  assert.match(path, /0\.5 24 L 2\.5 22 L 2\.5 16 L 0\.5 14/)
})

test('session cards use a slightly deeper centered notch with the same opening width', () => {
  const path = createFacilityPath({ width: 240, height: 38, topNotch: true, sessionNotch: true })
  assert.match(path, /95 0\.5 L 101\.75 5 L 138\.25 5 L 145 0\.5/)
})

test('button and spine geometry omit the top notch without changing the shared side cuts', () => {
  const button = createFacilityPath({ width: 33, height: 38 })
  const compactTopNotch = createFacilityPath({ width: 33, height: 38, topNotch: true })
  const spine = createFacilityPath({ width: 8, height: 38 })
  assert.equal(compactTopNotch, button, 'top notch must wait until the shared 53px width threshold')
  assert.doesNotMatch(button, /8\.5 0\.5 L 13\.5 3\.833/)
  assert.match(button, /32\.5 14 L 30\.5 16 L 30\.5 22 L 32\.5 24/)
  assert.match(spine, /7\.5 14 L 5\.5 16 L 5\.5 22 L 7\.5 24/)
  assert.ok(button.endsWith(' Z'))
  assert.ok(spine.endsWith(' Z'))
})

test('invalid or zero-sized facility boxes keep the polygon fallback active', () => {
  assert.equal(createFacilityPath({ width: 0, height: 38 }), '')
  assert.equal(createFacilityPath({ width: 33, height: 0 }), '')
  assert.equal(createFacilityPath({ width: Number.NaN, height: 38 }), '')
})
