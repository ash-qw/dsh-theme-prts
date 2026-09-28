import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'

import { createSidebarControlAdapter } from '../src/client/sidebar-control-adapter.js'

function flush(window) {
  return new Promise(resolve => window.setTimeout(resolve, 24))
}

function createStore(snapshot) {
  const listeners = new Set()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update(next) {
      snapshot = next
      for (const listener of listeners) listener()
    },
  }
}

test('marks workspace and session hierarchy from stable role structure', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div class="workspaceSectionHeader"><span>工作区</span><button type="button" aria-label="搜索">搜索</button></div>
      <div role="tree">
        <div role="treeitem" aria-expanded="true">
          <span>folder</span><span>chevron</span><span>Workspace</span>
          <span><span><button type="button" aria-label="管理">…</button></span><button type="button" aria-label="新建">+</button></span>
        </div>
        <div role="treeitem" aria-selected="true">
          <span data-state="ongoing">status</span><span>Session</span><span>time</span>
          <span><span><button type="button" aria-label="操作">…</button></span><div><button type="button">归档</button><button type="button">置顶</button></div></span>
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
  assert.equal(document.querySelectorAll('[data-prts-session-quick-actions] button').length, 2)
  assert.equal(document.querySelector('[data-prts-session-row]').dataset.prtsSessionState, 'ongoing')
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="ongoing"] [data-prts-session-summary-count]').textContent, '1')
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
  const [statefulFace, idleFace] = document.querySelectorAll('[data-prts-facility-face="session"]')
  assert.ok(statefulFace.querySelector('[data-prts-facility-svg]').hasAttribute('data-prts-session-notch'))
  assert.equal(idleFace.querySelector('[data-prts-facility-svg]').hasAttribute('data-prts-session-notch'), true)
  assert.ok(idleFace.querySelector('[data-prts-session-idle-indicator]'))

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
    'data-prts-session-state',
    'data-prts-session-summary-header',
    'data-prts-session-summary-label',
    'data-prts-facility-face',
    'data-prts-workspace-menu-anchor',
    'data-prts-session-menu-anchor',
    'data-prts-workspace-row',
    'data-prts-workspace-actions',
    'data-prts-workspace-menu',
    'data-prts-workspace-create',
    'data-prts-session-row',
    'data-prts-session-actions',
    'data-prts-session-quick-actions',
    'data-prts-session-menu',
    'data-prts-session-time',
  ]) assert.equal(document.querySelectorAll(`[${attribute}]`).length, 0)
  assert.equal(document.querySelectorAll('[data-prts-owned-projection]').length, 0)
  assert.equal(document.querySelectorAll('[data-prts-owned-facility]').length, 0)
})

test('keeps the pending status slot separate from the trailing time label', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div class="workspaceSectionHeader"><span>工作区</span><button type="button">搜索</button></div>
      <div role="tree">
        <div role="treeitem" aria-selected="false" data-row-key="session:question">
          <span class="slot"><span data-state="warning"></span><span>Waiting for answer</span></span>
          <span class="title">请选择下一步</span>
          <span class="time" aria-hidden="true">Answer</span>
          <span><span><button type="button" aria-label="操作">…</button></span></span>
        </div>
      </div>
    </div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const adapter = createSidebarControlAdapter({ document: dom.window.document, window: dom.window })
  adapter.start()

  const row = dom.window.document.querySelector('[data-prts-session-row]')
  assert.equal(row.dataset.prtsSessionState, 'warning')
  assert.ok(row.querySelector(':scope > .time[data-prts-session-time]'))
  assert.equal(row.querySelector(':scope > .slot[data-prts-session-time]'), null)
  adapter.dispose()
})

test('summarizes service-backed session states and opens the selected session', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div class="workspaceSectionHeader"><span>工作区</span><button type="button" aria-label="搜索">搜索</button></div>
      <div role="tree">
        <div role="treeitem" aria-expanded="true">
          <span>folder</span><span>chevron</span><span>Workspace</span>
          <span><span><button type="button" aria-label="管理">…</button></span><button type="button" aria-label="新建">+</button></span>
        </div>
        <div role="treeitem" aria-selected="false" data-session-id="run-1">
          <span data-state="ongoing">status</span><span class="title">正在执行</span><span class="time">刚刚</span>
          <span><span><button type="button" aria-label="操作">…</button></span></span>
        </div>
        <div role="treeitem" aria-selected="false" data-session-id="done-1">
          <span data-state="done">status</span><span class="title">尚未查看</span><span class="time">1 分钟</span>
          <span><span><button type="button" aria-label="操作">…</button></span></span>
        </div>
      </div>
    </div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const sessionList = createStore({
    ids: ['run-1', 'done-1', 'archived-1', 'subagent-1'],
    byId: {
      'run-1': { displayTitle: '正在执行', running: true },
      'done-1': { displayTitle: '尚未查看', completed: true },
      'archived-1': { displayTitle: '已归档', completed: true },
      'subagent-1': { displayTitle: '子代理', running: true, origin: 'subagent' },
    },
  })
  const workspaceList = createStore({ archivedSessionIds: ['archived-1'] })
  const opened = []
  const sessions = { list: sessionList, open: id => opened.push(id) }
  const workspaces = { list: workspaceList }
  const adapter = createSidebarControlAdapter({ document, window: dom.window, sessions, workspaces })
  adapter.start()

  assert.equal(document.querySelector('[data-prts-session-summary-trigger="ongoing"] [data-prts-session-summary-count]').textContent, '1')
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="done"] [data-prts-session-summary-count]').textContent, '1')
  assert.equal(document.querySelectorAll('[data-prts-session-summary-item]').length, 2)
  assert.equal(document.querySelector('[data-prts-session-summary-item="done-1"] span:last-child').textContent, '尚未查看')

  document.querySelector('[data-prts-session-summary-item="done-1"]').click()
  assert.deepEqual(opened, ['done-1'])

  document.querySelector('[data-session-id="run-1"] [data-state]').setAttribute('data-state', 'done')
  sessionList.update({
    ids: ['run-1', 'done-1'],
    byId: {
      'run-1': { displayTitle: '执行完成', completed: true },
      'done-1': { displayTitle: '尚未查看', completed: true },
    },
  })
  await flush(dom.window)
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="ongoing"]'), null)
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="done"] [data-prts-session-summary-count]').textContent, '2')

  const headerLabel = document.querySelector('[data-prts-session-summary-label]')
  headerLabel.classList.add('searchHidden')
  await flush(dom.window)
  assert.ok(document.querySelector('[data-prts-session-summary]').hasAttribute('data-prts-summary-search-hidden'))

  const ongoingState = document.querySelector('[data-session-id="run-1"] [data-state]')
  ongoingState.setAttribute('data-state', 'error')
  await flush(dom.window)
  assert.equal(document.querySelector('[data-session-id="run-1"]').dataset.prtsSessionState, 'error')

  ongoingState.removeAttribute('data-state')
  await flush(dom.window)
  assert.equal(document.querySelector('[data-session-id="run-1"]').hasAttribute('data-prts-session-state'), false)
  assert.equal(document.querySelector('[data-session-id="run-1"] [data-prts-facility-face] [data-prts-facility-svg]').hasAttribute('data-prts-session-notch'), true)

  adapter.dispose()
  assert.equal(document.querySelector('[data-prts-session-summary]'), null)
})

test('shows pending questions before running and completion states', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div class="workspaceSectionHeader"><span>工作区</span><button type="button">搜索</button></div>
      <div role="tree"></div>
    </div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const sessionList = createStore({
    ids: ['question', 'approval', 'plan', 'running', 'done', 'archived'],
    byId: {
      question: { displayTitle: '选择方案', running: true },
      approval: { displayTitle: '工具授权', running: true },
      plan: { displayTitle: '审阅计划', running: false },
      running: { displayTitle: '后台运行', running: true },
      done: { displayTitle: '执行完成' },
      archived: { displayTitle: '已归档', running: true },
    },
  })
  const sessionStatus = createStore(new Map([
    ['question', { running: true, pendingInteraction: { kind: 'question' } }],
    ['approval', { running: true, pendingInteraction: { kind: 'approval' } }],
    ['plan', { running: false, pendingInteraction: { kind: 'plan-review' } }],
    ['running', { running: true }],
    ['done', { running: false, completionUnread: true }],
  ]))
  const opened = []
  const adapter = createSidebarControlAdapter({
    document,
    window: dom.window,
    sessions: { list: sessionList, open: id => opened.push(id) },
    workspaces: { list: createStore({ archivedSessionIds: ['archived'] }) },
    getSessionStatus: () => sessionStatus,
  })
  adapter.start()

  const count = state => document.querySelector(`[data-prts-session-summary-trigger="${state}"] [data-prts-session-summary-count]`)?.textContent
  assert.equal(count('warning'), '3')
  assert.equal(count('ongoing'), '1')
  assert.equal(count('done'), '1')
  assert.equal(document.querySelector('[data-prts-session-summary-item="question"]').getAttribute('aria-label'), '选择方案，待回答')
  assert.equal(document.querySelector('[data-prts-session-summary-item="approval"] [data-prts-session-summary-item-status]').textContent, '待授权')
  assert.equal(document.querySelector('[data-prts-session-summary-item="plan"] [data-prts-session-summary-item-status]').textContent, '待审阅')
  assert.equal(document.querySelector('[data-prts-session-summary-item="archived"]'), null)
  document.querySelector('[data-prts-session-summary-item="question"]').click()
  assert.deepEqual(opened, ['question'])

  sessionStatus.update(new Map([
    ['question', { running: true }],
    ['approval', { running: true, pendingInteraction: { kind: 'approval' } }],
    ['plan', { running: false, pendingInteraction: { kind: 'plan-review' } }],
    ['running', { running: true }],
    ['done', { running: false, completionUnread: true }],
  ]))
  await flush(dom.window)
  assert.equal(count('warning'), '2')
  assert.equal(count('ongoing'), '2')
  assert.equal(document.querySelector('[data-prts-session-summary-item="question"] [data-prts-session-summary-item-status]'), null)

  adapter.dispose()
})

test('keeps native running status for a session with active subagents', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div class="workspaceSectionHeader"><span>工作区</span><button type="button">搜索</button></div>
      <div role="tree">
        <div role="treeitem" aria-selected="false" data-row-key="session:parent">
          <span data-state="ongoing">status</span><span class="title">主会话</span>
          <span><button type="button">…</button></span>
        </div>
      </div>
    </div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const sessionStatus = createStore(new Map([['parent', { running: false, completionUnread: false }]]))
  const adapter = createSidebarControlAdapter({
    document: dom.window.document,
    window: dom.window,
    sessions: {
      list: createStore({ ids: ['parent'], byId: { parent: { displayTitle: '主会话', running: false } } }),
    },
    getSessionStatus: () => sessionStatus,
  })
  adapter.start()

  assert.equal(dom.window.document.querySelector('[data-prts-session-summary-trigger="ongoing"] [data-prts-session-summary-count]').textContent, '1')
  assert.ok(dom.window.document.querySelector('[data-prts-session-summary-item="parent"]'))
  adapter.dispose()
})

test('counts a running subagent when its parent session row is not visible', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div class="workspaceSectionHeader"><span>工作区</span><button type="button">搜索</button></div>
      <div role="tree"></div>
    </div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const sessionList = createStore({
    ids: ['parent', 'child'],
    byId: {
      parent: { displayTitle: '主会话', running: false },
      child: { displayTitle: '子代理', running: true, origin: 'subagent' },
    },
    projectionsBySession: {
      parent: { values: { subagentCatalog: [{ id: 'child' }] } },
    },
  })
  const sessionStatus = createStore(new Map([
    ['parent', { running: false }],
    ['child', { running: true }],
  ]))
  const adapter = createSidebarControlAdapter({
    document: dom.window.document,
    window: dom.window,
    sessions: { list: sessionList },
    getSessionStatus: () => sessionStatus,
  })
  adapter.start()

  assert.equal(dom.window.document.querySelector('[data-prts-session-summary-trigger="ongoing"] [data-prts-session-summary-count]').textContent, '1')
  sessionStatus.update(new Map([
    ['parent', { running: false }],
    ['child', { running: false }],
  ]))
  await flush(dom.window)
  assert.equal(dom.window.document.querySelector('[data-prts-session-summary-trigger="ongoing"]'), null)
  adapter.dispose()
})

test('keeps the workspace warning shortcut when the service list omits a visible session', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div class="workspaceSectionHeader"><span>工作区</span><button type="button">搜索</button></div>
      <div role="tree">
        <div role="treeitem" aria-selected="false" data-row-key="session:question">
          <span data-state="warning">!</span><span class="title">选择方案</span><span class="time">回答</span>
          <span><span><button type="button">…</button></span></span>
        </div>
      </div>
    </div></aside>
  </body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const opened = []
  const sessionStatus = createStore(new Map())
  const adapter = createSidebarControlAdapter({
    document,
    window: dom.window,
    sessions: {
      list: createStore({ ids: [], byId: {} }),
      open: () => assert.fail('use the DSH workspace navigation service'),
    },
    getSessionStatus: () => sessionStatus,
    getUiWorkspace: () => ({ openSession: id => opened.push(id) }),
  })
  adapter.start()
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="warning"] [data-prts-session-summary-count]').textContent, '1')
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="ongoing"]'), null)
  document.querySelector('[data-prts-session-summary-item="question"]').click()
  assert.deepEqual(opened, ['question'])
  adapter.dispose()
})
