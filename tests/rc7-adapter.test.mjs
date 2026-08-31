import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import test from 'node:test'
import { createRc7Adapter, resolveRc7Regions } from '../src/client/rc7-adapter.js'

const fixture = await readFile(new URL('./fixtures/rc7-harness.html', import.meta.url), 'utf8')

test('marks the real rc.7 host columns without observing or rewriting native width', async () => {
  const dom = new JSDOM(fixture)
  const document = dom.window.document
  const original = resolveRc7Regions(document)
  original.sidebar.setAttribute('data-prts-region', 'host-owned')
  const adapter = createRc7Adapter({ document })

  const regions = adapter.mount()
  assert.equal(regions.frame.dataset.prtsRegion, 'frame')
  assert.equal(regions.sidebar.dataset.prtsRegion, 'sessions')
  assert.equal(regions.center.dataset.prtsRegion, 'operation')
  assert.equal(regions.details.dataset.prtsRegion, 'details')
  assert.equal(adapter.mount(), regions)
  assert.equal(regions.frame.style.getPropertyValue('--prts-native-sessions-column'), '')
  regions.frame.style.gridTemplateColumns = '148px minmax(0px, 1fr) 0px'
  await new Promise(resolve => dom.window.setTimeout(resolve, 0))
  assert.equal(regions.frame.style.getPropertyValue('--prts-native-sessions-column'), '')
  assert.equal(regions.frame.hasAttribute('data-prts-native-sessions-compact'), false)

  adapter.dispose()
  assert.equal(regions.frame.style.getPropertyValue('--prts-native-sessions-column'), '')
  assert.equal(regions.frame.hasAttribute('data-prts-region'), false)
  assert.equal(regions.sidebar.dataset.prtsRegion, 'host-owned')
  assert.equal(regions.center.hasAttribute('data-prts-region'), false)
  assert.equal(regions.details.hasAttribute('data-prts-region'), false)
})

test('resolves rc.7 regions when product wrappers sit between the frame and columns', () => {
  const dom = new JSDOM(fixture)
  const document = dom.window.document
  const frame = document.querySelector('[data-slot="root"] > :first-child')
  for (const selector of ['sidebar', 'conversation', 'details']) {
    const region = document.querySelector(`[data-slot="${selector}"]`).parentElement
    const wrapper = document.createElement('section')
    frame.insertBefore(wrapper, region)
    wrapper.appendChild(region)
  }

  const regions = resolveRc7Regions(document)
  assert.equal(regions.frame, frame)
  assert.equal(regions.sidebar, document.querySelector('[data-slot="sidebar"]').parentElement)
  assert.equal(regions.center, document.querySelector('[data-slot="conversation"]').parentElement)
  assert.equal(regions.details, document.querySelector('[data-slot="details"]').parentElement)

  const adapter = createRc7Adapter({ document })
  assert.ok(adapter.mount())
  adapter.dispose()
})

test('refuses partial rc.7 hosts without leaving theme markers', () => {
  const dom = new JSDOM('<div data-slot="root"><div><div data-slot="conversation"></div></div></div>')
  const document = dom.window.document
  const diagnostics = []
  const adapter = createRc7Adapter({ document, warn: (...args) => diagnostics.push(args) })

  assert.equal(resolveRc7Regions(document, (...args) => diagnostics.push(args)), null)
  assert.equal(adapter.mount(), null)
  assert.equal(adapter.mount(), null)
  assert.match(diagnostics[0][0], /required layout slots are unavailable/)
  assert.match(diagnostics[1][0], /\[dsh-theme-prts\] required layout slots are unavailable/)
  assert.equal(diagnostics.length, 2, 'adapter diagnostics should be deduplicated while the layout state is unchanged')
  assert.equal(document.querySelector('[data-prts-region]'), null)
  adapter.dispose()
})
