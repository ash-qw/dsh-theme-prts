import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import { createSidebarControlAdapter } from '../src/client/sidebar-control-adapter.js'

function flush(window, delay = 8) {
  return new Promise(resolve => window.setTimeout(resolve, delay))
}

test('sidebar adapter owns responsive decorative facility vectors without replacing native controls', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div role="tree">
      <div role="treeitem" aria-expanded="true">
        <span aria-hidden="true">folder</span><span aria-hidden="true">chevron</span><span class="projectTitle">Workspace</span>
        <span><span><button type="button" aria-label="Workspace actions">…</button></span><button type="button" aria-label="New workspace session">+</button></span>
      </div>
      <div role="treeitem" aria-selected="true">
        <span aria-hidden="true">status</span><span class="sessionTitle">Session</span><span class="sessionTime">now</span>
        <span><span><button type="button" aria-label="Session actions">…</button></span></span>
      </div>
    </div></div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  let faceWidth = 200
  const observed = new Set()
  let resizeCallback
  let disconnected = false
  dom.window.ResizeObserver = class {
    constructor(callback) { resizeCallback = callback }
    observe(node) { observed.add(node) }
    unobserve(node) { observed.delete(node) }
    disconnect() { disconnected = true; observed.clear() }
  }
  dom.window.requestAnimationFrame = callback => dom.window.setTimeout(callback, 0)
  dom.window.cancelAnimationFrame = id => dom.window.clearTimeout(id)
  Object.defineProperties(dom.window.Element.prototype, {
    clientWidth: {
      configurable: true,
      get() { return this.hasAttribute('data-prts-facility-spine') ? 8 : 0 },
    },
    clientHeight: {
      configurable: true,
      get() {
        if (!this.hasAttribute('data-prts-facility-spine')) return 0
        return this.parentElement.hasAttribute('data-prts-session-row') ? 40 : 38
      },
    },
  })
  dom.window.Element.prototype.getBoundingClientRect = function () {
    if (this.hasAttribute('data-prts-facility-face')) return { width: faceWidth, height: this.parentElement.hasAttribute('data-prts-session-row') ? 40 : 38 }
    if (this.hasAttribute('data-prts-facility-spine')) return { width: 2, height: this.parentElement.hasAttribute('data-prts-session-row') ? 40 : 38 }
    if (this.matches('button')) return { width: 33, height: this.closest('[aria-selected]') ? 40 : 38 }
    return { width: 0, height: 0 }
  }

  const nativeWorkspaceButton = document.querySelector('[aria-label="Workspace actions"]')
  const adapter = createSidebarControlAdapter({ document, window: dom.window })
  adapter.start()
  await flush(dom.window)

  assert.equal(document.querySelectorAll('[data-prts-facility-defs]').length, 1)
  assert.equal(document.querySelectorAll('[data-prts-facility-spine]').length, 2)
  assert.equal(document.querySelectorAll('[data-prts-facility-svg]').length, 7)
  assert.equal(document.querySelectorAll('[data-prts-facility-vector]').length, 7)
  assert.equal(nativeWorkspaceButton.getAttribute('aria-label'), 'Workspace actions')
  assert.equal(nativeWorkspaceButton.querySelector('svg').getAttribute('aria-hidden'), 'true')
  assert.equal(nativeWorkspaceButton.querySelector('svg').getAttribute('focusable'), 'false')
  assert.ok(document.querySelector('[data-prts-workspace-row]').hasAttribute('data-prts-spine-vector'))
  assert.ok(document.querySelector('[data-prts-session-row]').hasAttribute('data-prts-spine-vector'))
  assert.equal(document.querySelector('[data-prts-facility-spine="workspace"] svg').getAttribute('viewBox'), '0 0 8 38')

  const face = document.querySelector('[data-prts-facility-face="workspace"]')
  assert.equal(face.querySelector('svg').getAttribute('viewBox'), '0 0 200 38')
  faceWidth = 244
  resizeCallback([{ target: face, contentRect: { width: 244, height: 38 } }])
  await flush(dom.window, 180)
  assert.equal(face.querySelector('svg').getAttribute('viewBox'), '0 0 244 38')

  const session = document.querySelector('[data-prts-session-row]')
  const sessionOwners = Array.from(session.querySelectorAll('[data-prts-facility-vector]'))
  session.remove()
  await flush(dom.window)
  for (const owner of sessionOwners) assert.equal(observed.has(owner), false)

  adapter.dispose()
  assert.equal(disconnected, true)
  assert.equal(document.querySelectorAll('[data-prts-owned-facility-vector], [data-prts-owned-facility-spine], [data-prts-owned-facility-defs]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-facility-vector], [data-prts-spine-vector]').length, 0)
  assert.equal(document.querySelector('[aria-label="Workspace actions"]'), nativeWorkspaceButton)
})
