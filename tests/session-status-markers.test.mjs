import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { createRunningMarker, createSessionStatusSignal, sessionStatusSignalMarkup } from '../src/client/session-status-markers.js'

for (const state of ['ongoing', 'warning', 'done']) test('sidebar and settings share the ' + state + ' status signal', () => {
  const dom = new JSDOM('<main></main>')
  const { document } = dom.window
  const sidebar = createSessionStatusSignal(document, state)
  const template = document.createElement('template')
  template.innerHTML = sessionStatusSignalMarkup(state)
  assert.equal(sidebar.outerHTML, template.content.firstElementChild.outerHTML)
  assert.equal(sidebar.dataset.prtsSessionSummarySignal, state)
  assert.equal(sidebar.getAttribute('aria-hidden'), 'true')
  assert.equal(sidebar.namespaceURI, state === 'ongoing' ? 'http://www.w3.org/2000/svg' : 'http://www.w3.org/1999/xhtml')
  dom.window.close()
})

test('native running SVG and summary signals use the same A and segmented ring', () => {
  const dom = new JSDOM('')
  const { document } = dom.window
  const marker = createRunningMarker(document)
  assert.equal(marker.outerHTML, createSessionStatusSignal(document, 'ongoing').firstElementChild.outerHTML)
  assert.equal(marker.querySelector('text').textContent, 'A')
  assert.equal(marker.querySelector('circle').getAttribute('stroke-dasharray'), '4.5 11.208')
  dom.window.close()
})

test('unknown status cannot inject markup', () => {
  const dom = new JSDOM('')
  assert.equal(sessionStatusSignalMarkup('<img src=x onerror=alert(1)>'), '')
  assert.equal(createSessionStatusSignal(dom.window.document, 'unknown'), null)
  dom.window.close()
})
