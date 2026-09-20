import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import { createSidebarControlAdapter } from '../src/client/sidebar-control-adapter.js'

function flush(window) {
  return new Promise(resolve => window.setTimeout(resolve, 24))
}

test('marks workspace and session hierarchy from stable role structure', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div role="tree">
        <div role="treeitem" aria-expanded="true">
          <span>folder</span><span>chevron</span><span>Workspace</span>
          <span><span><button type="button" aria-label="管理">…</button></span><button type="button" aria-label="新建">+</button></span>
        </div>
        <div role="treeitem" aria-selected="true">
          <span>status</span><span>Session</span><span>time</span>
          <span><span><button type="button" aria-label="操作">…</button></span></span>
        </div>
        <div role="treeitem" aria-selected="true" data-blank-session>
          <span>status</span><span>新会话</span>
        </div>
      </div>
    </div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createSidebarControlAdapter({ document, window: dom.window })
  adapter.start()

  assert.ok(document.querySelector('[data-prts-workspace-row]'))
  assert.ok(document.querySelector('[data-prts-workspace-actions]'))
  assert.ok(document.querySelector('[data-prts-workspace-menu]'))
  assert.ok(document.querySelector('[data-prts-workspace-create]'))
  assert.ok(document.querySelector('[data-prts-session-row]'))
  assert.ok(document.querySelector('[data-prts-session-actions]'))
  assert.ok(document.querySelector('[data-prts-session-menu]'))
  assert.ok(document.querySelector('[data-prts-workspace-menu-anchor]'))
  assert.ok(document.querySelector('[data-prts-session-menu-anchor]'))
  const projections = Array.from(document.querySelectorAll('[data-prts-row-projection]'))
  assert.equal(projections.length, 0)
  assert.equal(document.querySelector('[data-prts-workspace-row] > [data-prts-row-projection]'), null)
  assert.ok(document.querySelector('[data-prts-workspace-icon]'))
  assert.equal(document.querySelector('[data-prts-workspace-icon]').textContent, 'folder')
  assert.equal(document.querySelector('[data-prts-workspace-disclosure]').textContent, 'chevron')
  assert.ok(document.querySelector('[data-prts-session-time]'))
  assert.equal(document.querySelectorAll('[data-prts-facility-face="workspace"]').length, 1)
  assert.equal(document.querySelectorAll('[data-prts-facility-face="session"]').length, 2)
  assert.equal(document.querySelector('[data-prts-facility-face="workspace"]').dataset.prtsFacilityTexture, 'silhouette')
  assert.deepEqual(
    Array.from(document.querySelectorAll('[data-prts-facility-face="session"]')).map(node => node.dataset.prtsFacilityTexture),
    ['pickup', 'pickup'],
  )
  for (const face of document.querySelectorAll('[data-prts-facility-face="session"]')) {
    assert.ok(face.querySelector('[data-prts-session-pickup]'))
    assert.equal(face.querySelectorAll('[data-prts-session-pickup-bar]').length, 11)
    assert.ok(face.querySelector('[data-prts-session-lifeline]'))
    assert.ok(face.querySelector('[data-prts-session-lifeline-filament]'))
  }

  assert.deepEqual(Array.from(document.querySelectorAll('[data-prts-session-row]')).map(node => node.dataset.prtsSessionIndex), ['01', '02'])
  const blank = document.querySelector('[data-blank-session]')
  const blankTitle = Array.from(blank.children).find(node => node.textContent === '新会话')
  assert.ok(blankTitle.hasAttribute('data-prts-row-title'))
  assert.equal(blankTitle.hasAttribute('data-prts-session-actions'), false)
  assert.equal(blank.querySelector('[data-prts-session-actions]'), null)
  assert.equal(blank.querySelector('[data-prts-session-menu]'), null)

  const workspace = document.querySelector('[data-prts-workspace-row]')
  workspace.classList.add('menuOpen')
  await flush(dom.window)
  assert.equal(workspace.hasAttribute('data-prts-row-menu-open'), true)
  workspace.classList.remove('menuOpen')
  await flush(dom.window)
  assert.equal(workspace.hasAttribute('data-prts-row-menu-open'), false)

  const session = document.querySelector('[data-prts-session-row]')
  session.remove()
  await flush(dom.window)
  assert.equal(session.hasAttribute('data-prts-session-row'), false)

  adapter.dispose()
  for (const attribute of [
    'data-prts-row-title',
    'data-prts-workspace-disclosure',
    'data-prts-workspace-icon',
    'data-prts-row-menu-open',
    'data-prts-session-index',
    'data-prts-facility-face',
    'data-prts-workspace-menu-anchor',
    'data-prts-session-menu-anchor',
    'data-prts-workspace-row',
    'data-prts-workspace-actions',
    'data-prts-workspace-menu',
    'data-prts-workspace-create',
    'data-prts-session-row',
    'data-prts-session-actions',
    'data-prts-session-menu',
    'data-prts-session-time',
  ]) assert.equal(document.querySelectorAll(`[${attribute}]`).length, 0)
  assert.equal(document.querySelectorAll('[data-prts-owned-projection]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-owned-facility]').length, 0)
})
