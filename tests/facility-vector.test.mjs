import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import {
  ensureFacilityGraphic,
  ensureFacilityTextureDefs,
  FACILITY_TEXTURES,
  renderFacilityGraphic,
} from '../src/client/facility-vector.js'

test('facility vectors expose one shared texture registry without entering the accessibility tree', () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  const { document } = dom.window
  const first = ensureFacilityTextureDefs(document)
  const second = ensureFacilityTextureDefs(document)
  assert.equal(first, second)
  assert.deepEqual(FACILITY_TEXTURES, ['none', 'grid', 'scanline', 'silhouette', 'pickup'])
  assert.equal(document.querySelectorAll('[data-prts-facility-defs]').length, 1)
  assert.ok(document.querySelector('#prts-facility-grid-mask'))
  assert.equal(document.querySelector('#prts-facility-silhouette-mask'), null, 'long scenes are clipped per card instead of sharing a repeating mask')
  assert.ok(document.querySelector('#prts-facility-scanline-mask'))
  assert.equal(first.getAttribute('aria-hidden'), 'true')
  assert.equal(first.getAttribute('focusable'), 'false')
})

test('facility graphic accepts a non-destructive default texture', () => {
  const dom = new JSDOM('<!doctype html><html><body><span id="face"></span></body></html>')
  const { document } = dom.window
  const owner = document.querySelector('#face')
  const graphic = ensureFacilityGraphic(document, owner, { kind: 'face', texture: 'silhouette' })
  assert.equal(owner.getAttribute('data-prts-facility-texture'), 'silhouette')
  assert.equal(renderFacilityGraphic(owner, { width: 240, height: 38 }), true)
  assert.equal(graphic.querySelectorAll('[data-prts-silhouette-layer]').length, 2)
  assert.equal(graphic.querySelectorAll('[data-prts-silhouette-layer="far"] > path').length, 2)
  assert.equal(graphic.querySelectorAll('[data-prts-silhouette-layer="near"] > path').length, 2)
  const farPath = graphic.querySelector('[data-prts-silhouette-layer=far] > path').getAttribute("d")
  const nearPath = graphic.querySelector('[data-prts-silhouette-layer=near] > path').getAttribute("d")
  const verticalProfile = path => [...path.matchAll(/V(\d+)/g)].map(([, value]) => Number(value)).filter(value => value < 38)
  const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
  assert.ok(Math.min(...verticalProfile(farPath)) < Math.min(...verticalProfile(nearPath)), 'far skyline owns the tallest landmarks')
  assert.ok(median(verticalProfile(farPath)) + 8 < median(verticalProfile(nearPath)), 'far skyline is higher overall while the near track stays low')
  assert.ok((farPath.match(/M/g) || []).length >= 3, 'far skyline includes distinct landmark structures')
  assert.equal(graphic.querySelector('[data-prts-facility-clip]').getAttribute('d'), graphic.querySelector('[data-prts-facility-layer="surface"]').getAttribute('d'))
  assert.match(graphic.querySelector('[data-prts-facility-silhouette]').getAttribute('clip-path'), /^url\(#prts-facility-silhouette-clip-\d+\)$/)
  assert.equal(graphic.querySelector('[data-prts-facility-silhouette]').getAttribute('transform'), 'translate(0 1) scale(1 0.94737)')
  assert.equal(renderFacilityGraphic(owner, { width: 240, height: 34 }), true)
  assert.equal(graphic.getAttribute('viewBox'), '0 0 240 34')
  assert.equal(graphic.querySelector('[data-prts-facility-silhouette]').getAttribute('transform'), 'translate(0 1) scale(1 0.84211)')


  owner.setAttribute('data-prts-facility-texture', 'grid')
  ensureFacilityGraphic(document, owner, { kind: 'face', texture: 'silhouette' })
  assert.equal(owner.getAttribute('data-prts-facility-texture'), 'grid')
})

test('session pickup supplements an existing vector with a clipped active filament', () => {
  const dom = new JSDOM('<!doctype html><html><body><div data-prts-session-row><span id="face"></span><span id="title" data-prts-row-title>R.R.T.S. UI 重构</span></div></body></html>')
  const { document } = dom.window
  const owner = document.querySelector('#face')
  owner.getBoundingClientRect = () => ({ left: 10, right: 250, top: 0, bottom: 38, width: 240, height: 38 })
  document.querySelector('#title').getBoundingClientRect = () => ({ left: 60, right: 160, top: 0, bottom: 38, width: 100, height: 38 })
  const graphic = ensureFacilityGraphic(document, owner, { kind: 'face' })

  ensureFacilityGraphic(document, owner, { kind: 'face', topNotch: true, sessionNotch: true, texture: 'pickup' })
  owner.setAttribute('data-prts-facility-texture', 'pickup')
  assert.equal(renderFacilityGraphic(owner, { width: 240, height: 38 }), true)
  const statusUnderlay = graphic.querySelector('[data-prts-session-status-underlay]')
  const idleIndicator = graphic.querySelector('[data-prts-session-idle-indicator]')
  const surface = graphic.querySelector('[data-prts-facility-layer="surface"]')
  assert.ok(statusUnderlay)
  assert.ok(idleIndicator)
  assert.ok(statusUnderlay.compareDocumentPosition(surface) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING)
  assert.ok(idleIndicator.compareDocumentPosition(surface) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING)
  assert.equal(statusUnderlay.getAttribute('transform'), 'translate(3 2)')
  assert.equal(statusUnderlay.getAttribute('shape-rendering'), 'geometricPrecision')
  assert.equal(statusUnderlay.getAttribute('aria-hidden'), 'true')
  assert.match(statusUnderlay.getAttribute('d'), /^M 1\.5 0\.5 L 238\.5 0\.5/)
  assert.doesNotMatch(statusUnderlay.getAttribute('d'), /85 7\.5 L 155 7\.5/)
  assert.equal(idleIndicator.getAttribute('x'), '95')
  assert.equal(idleIndicator.getAttribute('y'), '2.5')
  assert.equal(idleIndicator.getAttribute('width'), '50')
  assert.equal(idleIndicator.getAttribute('height'), '2.5')
  assert.match(surface.getAttribute('d'), /95 0\.5 L 101\.75 5 L 138\.25 5 L 145 0\.5/)
  assert.equal(graphic.querySelectorAll('[data-prts-session-pickup]').length, 1)
  assert.equal(graphic.querySelectorAll('[data-prts-session-pickup-bar]').length, 11)
  assert.ok(graphic.querySelector('[data-prts-session-pickup-baseline]'))
  assert.ok(graphic.querySelector('[data-prts-session-pickup-indicator]'))
  assert.equal(graphic.querySelectorAll('[data-prts-session-lifeline]').length, 1)
  assert.equal(graphic.querySelectorAll('[data-prts-session-lifeline-filament]').length, 3)
  assert.equal(graphic.querySelectorAll('[data-prts-session-lifeline-layer]').length, 9)
  assert.equal(graphic.querySelector('[data-prts-session-pickup-baseline]').getAttribute('y1'), '19')
  const lifeline = graphic.querySelector('[data-prts-session-lifeline]')
  const coreFilament = lifeline.querySelector('[data-prts-session-lifeline-filament="core"]')
  const coreLayers = Array.from(coreFilament.querySelectorAll('[data-prts-session-lifeline-layer]'))
  const lifelinePath = coreLayers[1].getAttribute('d')
  assert.equal(new Set(coreLayers.map(layer => layer.getAttribute('d'))).size, 1)
  assert.match(lifelinePath, /^M /)
  assert.equal((lifelinePath.match(/ C /g) || []).length, 8)
  assert.equal((lifelinePath.match(/ L /g) || []).length, 0)
  assert.equal(lifeline.getAttribute('data-prts-lifeline-start'), '9.6')
  assert.equal(lifeline.getAttribute('data-prts-lifeline-end'), '232')
  assert.equal(lifeline.getAttribute('data-prts-lifeline-baseline'), '21.28')
  assert.equal(lifeline.getAttribute('data-prts-lifeline-lift'), '13.3')
  assert.equal(graphic.querySelector('[data-prts-session-lifeline-mask]'), null)
  assert.equal(renderFacilityGraphic(owner, { width: 240, height: 32 }), true)
  assert.equal(graphic.querySelector('[data-prts-session-pickup-baseline]').getAttribute('y2'), '16')
  assert.equal(graphic.querySelector('[data-prts-session-pickup-indicator]').getAttribute('cy'), '16')
  assert.equal(graphic.querySelector('[data-prts-session-pickup-bar]').getAttribute('y'), '13.5')
  assert.notEqual(coreLayers[1].getAttribute('d'), lifelinePath)
  assert.equal(graphic.querySelector('[data-prts-facility-layer="outline"]').getAttribute('stroke-width'), '1')

  assert.equal(
    graphic.querySelector('[data-prts-session-pickup] [data-prts-facility-clip]'),
    null,
  )
  assert.equal(
    graphic.querySelector('[data-prts-facility-clip]').getAttribute('d'),
    graphic.querySelector('[data-prts-facility-layer="surface"]').getAttribute('d'),
  )
  assert.match(graphic.querySelector('[data-prts-session-pickup]').getAttribute('clip-path'), /^url\(#prts-facility-pickup-clip-\d+\)$/)
  assert.equal(
    graphic.querySelector('[data-prts-session-lifeline]').getAttribute('clip-path'),
    graphic.querySelector('[data-prts-session-pickup]').getAttribute('clip-path'),
  )
  assert.equal(graphic.getAttribute('aria-hidden'), 'true')
})

test('facility graphic uses one closed path for its surface texture and true outline', () => {
  const dom = new JSDOM('<!doctype html><html><body><span id="face"></span></body></html>')
  const { document } = dom.window
  const owner = document.querySelector('#face')
  const graphic = ensureFacilityGraphic(document, owner, { kind: 'face', topNotch: true })
  assert.equal(renderFacilityGraphic(owner, { width: 200, height: 38 }), true)
  assert.equal(graphic.getAttribute('viewBox'), '0 0 200 38')
  assert.equal(graphic.getAttribute('aria-hidden'), 'true')
  assert.equal(graphic.getAttribute('focusable'), 'false')
  assert.equal(owner.getAttribute('data-prts-facility-texture'), 'none')
  assert.ok(owner.hasAttribute('data-prts-facility-vector'))

  const paths = Array.from(graphic.querySelectorAll('[data-prts-facility-layer]'))
  assert.equal(paths.length, 3)
  assert.equal(new Set(paths.map(path => path.getAttribute('d'))).size, 1)
  assert.ok(paths[0].getAttribute('d').endsWith(' Z'))
  const outline = graphic.querySelector('[data-prts-facility-layer="outline"]')
  assert.equal(outline.getAttribute('fill'), 'none')
  assert.equal(outline.getAttribute('stroke-width'), '1')
  assert.equal(outline.getAttribute('stroke-linejoin'), 'miter')
  assert.equal(outline.getAttribute('vector-effect'), 'non-scaling-stroke')
  assert.equal(outline.getAttribute('shape-rendering'), 'geometricPrecision')
})

test('zero-sized vectors retain fallback and a recovered size activates it atomically', () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="row"><span id="spine" data-prts-facility-spine="session"></span></div></body></html>')
  const { document } = dom.window
  const owner = document.querySelector('#spine')
  ensureFacilityGraphic(document, owner, { kind: 'spine' })
  assert.equal(renderFacilityGraphic(owner, { width: 0, height: 38 }), false)
  assert.equal(owner.hasAttribute('data-prts-facility-vector'), false)
  assert.equal(owner.parentElement.hasAttribute('data-prts-spine-vector'), false)
  assert.equal(renderFacilityGraphic(owner, { width: 8, height: 38 }), true)
  assert.ok(owner.hasAttribute('data-prts-facility-vector'))
  assert.ok(owner.parentElement.hasAttribute('data-prts-spine-vector'))
})
