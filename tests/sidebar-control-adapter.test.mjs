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
  for (let i=0;i<20 && !opened.length;i++) await flush(dom.window)
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
  for (let i=0;i<200 && !opened.length;i++) await flush(dom.window)
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
  for (let i=0;i<20 && !opened.length;i++) await flush(dom.window)
  assert.deepEqual(opened, ['question'])
  adapter.dispose()
})

test('preview navigation reveals its nested workspace and hidden session card', async () => {
  const dom = new JSDOM('<html><body><aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div><span>工作区</span><button>搜索</button></div><div role="tree"><div role="treeitem" data-row-key="workspace:parent" aria-expanded="false"><span>Parent</span></div></div></div></aside></body></html>', {pretendToBeVisual:true})
  const {document} = dom.window
  const tree = document.querySelector('[role="tree"]')
  const opened = [], scrolled = [], expanded = []
  const parent = tree.firstElementChild
  parent.addEventListener('click', () => {
    expanded.push('parent')
    parent.setAttribute('aria-expanded', 'true')
    const owner = document.createElement('div')
    owner.setAttribute('role','treeitem')
    owner.setAttribute('data-row-key','workspace:owner')
    owner.setAttribute('aria-expanded','false')
    owner.innerHTML='<span>Owner</span>'
    owner.addEventListener('click',()=>{
      expanded.push('owner')
      owner.setAttribute('aria-expanded','true')
      const more=document.createElement('button')
      more.setAttribute('data-row-key','overflow:owner')
      more.setAttribute('aria-expanded','false')
      more.addEventListener('click',()=>{
        expanded.push('overflow')
        more.setAttribute('aria-expanded','true')
        const row=document.createElement('div')
        row.setAttribute('role','treeitem')
        row.setAttribute('aria-selected','true')
        row.setAttribute('data-row-key','session:target')
        row.innerHTML='<span data-state="ongoing"></span><span>Target</span>'
        row.scrollIntoView=options=>scrolled.push(options)
        tree.append(row)
      })
      tree.append(more)
    })
    tree.append(owner)
  })
  const adapter=createSidebarControlAdapter({
    document,window:dom.window,
    sessions:{list:createStore({ids:['target'],byId:{target:{id:'target',displayTitle:'Target',running:true}}})},
    workspaces:{list:createStore({items:[
      {workspaceId:'parent',path:'/root',sessionIds:[]},
      {workspaceId:'owner',path:'/root/project',sessionIds:['target']},
    ]})},
    getUiWorkspace:()=>({openSession:id=>{ assert.deepEqual(expanded, ['parent','owner','overflow']); assert.ok(scrolled.length, 'reveal the card before navigating'); opened.push(id) }}),
  })
  adapter.start()
  document.querySelector('[data-prts-session-summary-item="target"]').click()
  for(let i=0;i<25 && (!scrolled.length || !opened.length);i++)await flush(dom.window)
  assert.deepEqual(opened,['target'])
  assert.deepEqual(expanded,['parent','owner','overflow'])
  assert.deepEqual(scrolled,[{block:'nearest',inline:'nearest',behavior:'smooth'}])
  adapter.dispose()
  dom.window.close()
})

test('late services keep summary states alive after workspace cards are unmounted',async()=>{
  const dom=new JSDOM('<html><body><aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div><span>工作区</span><button>搜索</button></div><div role="tree"><div role="treeitem" aria-selected="false" data-row-key="session:late"><span data-state="warning"></span><span>Late session</span></div></div></div></aside></body></html>',{pretendToBeVisual:true})
  const {document}=dom.window
  let sessions,workspaces,status
  const adapter=createSidebarControlAdapter({document,window:dom.window,getSessions:()=>sessions,getWorkspaces:()=>workspaces,getSessionStatus:()=>status})
  adapter.start()
  assert.ok(document.querySelector('[data-prts-session-summary-trigger="warning"]'))
  sessions={list:createStore({ids:['late'],byId:{late:{id:'late',displayTitle:'Late session',running:true}}})}
  workspaces={list:createStore({items:[],archivedSessionIds:[]})}
  status=createStore(new Map([['late',{running:true,pendingInteraction:{kind:'question'}}]]))
  document.querySelector('[data-row-key="session:late"]').remove()
  await flush(dom.window)
  assert.equal(document.querySelector('[data-prts-session-summary-count]').textContent,'1')
  assert.ok(document.querySelector('[data-prts-session-summary-trigger="warning"]'))
  workspaces.list.update({items:[],archivedSessionIds:['late']})
  await flush(dom.window)
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="warning"]'),null)
  workspaces.list.update({items:[],archivedSessionIds:[]})
  await flush(dom.window)
  assert.ok(document.querySelector('[data-prts-session-summary-trigger="warning"]'))
  sessions.list.update({ids:[],byId:{}})
  await flush(dom.window)
  assert.equal(document.querySelector('[data-prts-session-summary-trigger="warning"]'),null)
  adapter.dispose()
  dom.window.close()
})

test('preview subscriptions follow its own switch and reacquire services after restarting',async()=>{
  const dom=new JSDOM('<html><body><aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div><span>工作区</span><button>搜索</button></div><div role="tree"><div role="treeitem" aria-selected="false" data-row-key="session:x"><span data-state="ongoing"></span><span>Card</span></div></div></div></aside></body></html>',{pretendToBeVisual:true})
  const tracked=snapshot=>{
    const store=createStore(snapshot)
    const subscribe=store.subscribe
    store.count=0
    store.subscribe=fn=>{store.count++;const stop=subscribe(fn);return()=>{store.count--;stop()}}
    return store
  }
  let getters=0
  let sessions={list:tracked({ids:['x'],byId:{x:{id:'x',running:true,displayTitle:'Card'}}})}
  const workspaces={list:tracked({items:[]})}
  const status=tracked(new Map([['x',{running:true}]]))
  const adapter=createSidebarControlAdapter({document:dom.window.document,window:dom.window,
    getSessions:()=>{getters++;return sessions},getWorkspaces:()=>{getters++;return workspaces},getSessionStatus:()=>{getters++;return status}})
  const counts=()=>[sessions.list.count,workspaces.list.count,status.count]
  adapter.start({sessionPreview:false})
  await flush(dom.window)
  assert.equal(getters,0)
  assert.ok(dom.window.document.querySelector('[data-prts-session-state="ongoing"]'))
  adapter.start({sessionPreview:true})
  assert.deepEqual(counts(),[1,1,1])
  adapter.start({sessionPreview:true})
  assert.deepEqual(counts(),[1,1,1])
  adapter.start({sessionPreview:false})
  assert.deepEqual(counts(),[0,0,0])
  const before=getters
  await flush(dom.window)
  assert.equal(getters,before)
  const old=sessions.list
  sessions={list:tracked({ids:['x'],byId:{x:{id:'x',running:true,displayTitle:'Updated'}}})}
  adapter.start({sessionPreview:true})
  assert.equal(old.count,0)
  assert.deepEqual(counts(),[1,1,1])
  adapter.dispose()
  assert.deepEqual(counts(),[0,0,0])
  adapter.start({sessionPreview:true})
  assert.deepEqual(counts(),[1,1,1])
  adapter.dispose()
  dom.window.close()
})

test('preview waits for missing services without needing a sidebar DOM mutation',async()=>{
  const dom=new JSDOM('<html><body><aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div><span>工作区</span><button>搜索</button></div><div role="tree"></div></div></aside></body></html>',{pretendToBeVisual:true})
  let sessions
  const adapter=createSidebarControlAdapter({document:dom.window.document,window:dom.window,getSessions:()=>sessions})
  adapter.start({sessionPreview:true})
  await flush(dom.window)
  sessions={list:createStore({ids:['late'],byId:{late:{id:'late',running:true,displayTitle:'Late'}}})}
  await new Promise(resolve=>dom.window.setTimeout(resolve,300))
  assert.ok(dom.window.document.querySelector('[data-prts-session-summary-item="late"]'))
  adapter.dispose()
  dom.window.close()
})

test('a second preview navigation cancels the first pending destination', async () => {
  const dom=new JSDOM('<aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div><span>工作区</span><button>搜索</button></div><div role="tree"></div></div></aside>',{pretendToBeVisual:true})
  const {document}=dom.window,opened=[]
  const adapter=createSidebarControlAdapter({document,window:dom.window,
    sessions:{list:createStore({ids:['a','b'],byId:{a:{id:'a',running:true},b:{id:'b',running:true}}})},
    getUiWorkspace:()=>({openSession:id=>opened.push(id)})})
  try {
    adapter.start()
    document.querySelector('[data-prts-session-summary-item="a"]').click()
    await flush(dom.window)
    document.querySelector('[data-prts-session-summary-item="b"]').click()
    const row=document.createElement('div')
    row.setAttribute('role','treeitem');row.setAttribute('aria-selected','false');row.setAttribute('data-session-id','b')
    row.innerHTML='<span>B</span>'
    document.querySelector('[role="tree"]').append(row)
    for(let i=0;i<30 && !opened.length;i++)await flush(dom.window)
    assert.deepEqual(opened,['b'])
    await flush(dom.window);assert.deepEqual(opened,['b'])
  } finally {adapter.dispose();dom.window.close()}
})

test('adapts direct context menu triggers without confusing workspace creation or session quick actions', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div role="tree">
      <div role="treeitem" aria-expanded="true" data-workspace>
        <span>folder</span><span>chevron</span><span>Workspace</span>
        <span data-actions>
          <button type="button" data-context-menu-trigger="true" aria-haspopup="menu" aria-expanded="false" data-menu>…</button>
          <button type="button" data-create>+</button>
        </span>
      </div>
      <div role="treeitem" aria-selected="false" data-session>
        <span>status</span><span class="title">Session</span><span class="rowResting">time</span>
        <span data-actions>
          <button type="button" data-context-menu-trigger="" data-menu>…</button>
          <span data-quick><div data-slot="sidebar.workspaces.session.row.action"><button type="button">Archive</button><button type="button">Pin</button></div></span>
        </span>
      </div>
    </div></div></aside></body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createSidebarControlAdapter({ document, window: dom.window })
  try {
    adapter.start()
    for (const kind of ['workspace', 'session']) {
      const row = document.querySelector(`[data-${kind}]`)
      const menu = row.querySelector('[data-menu]')
      assert.equal(row.querySelector(`[data-prts-${kind}-actions]`), row.querySelector('[data-actions]'))
      assert.equal(row.querySelector(`[data-prts-${kind}-menu]`), menu)
      assert.equal(row.querySelector(`[data-prts-${kind}-menu-anchor]`), menu)
      assert.ok(menu.querySelector('[data-prts-facility-svg]'))
    }
    const workspace = document.querySelector('[data-workspace]')
    assert.equal(workspace.querySelector('[data-prts-workspace-create]'), workspace.querySelector('[data-create]'))
    assert.ok(workspace.querySelector('[data-create] [data-prts-facility-svg]'))
    assert.equal(document.querySelector('[data-prts-session-quick-actions]'), document.querySelector('[data-quick]'))
    const session = document.querySelector('[data-session]')
    session.classList.add('native_menuOpen')
    await flush(dom.window)
    assert.ok(session.hasAttribute('data-prts-row-menu-open'))
    session.classList.remove('native_menuOpen')
    await flush(dom.window)
    assert.equal(session.hasAttribute('data-prts-row-menu-open'), false)
    workspace.querySelector('[data-menu]').setAttribute('aria-expanded', 'true')
    await flush(dom.window)
    assert.ok(workspace.hasAttribute('data-prts-row-menu-open'))
    adapter.dispose()
    assert.equal(document.querySelector('[data-prts-workspace-menu], [data-prts-session-menu], [data-prts-session-quick-actions]'), null)
    assert.equal(document.querySelectorAll('[data-menu], [data-create], [data-quick]').length, 4)
  } finally {
    adapter.dispose()
    dom.window.close()
  }
})

test('adapts the ungrouped workspace create button without a management menu', () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces">
      <div role="tree"><div role="treeitem" aria-expanded="true" data-row-key="workspace:">
        <span>folder</span><span>chevron</span><span>未分组</span>
        <span><button type="button" aria-label="新建会话">+</button></span>
      </div></div>
    </div></aside></body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createSidebarControlAdapter({ document, window: dom.window })
  adapter.start()
  const button = document.querySelector('button')
  assert.ok(button.hasAttribute('data-prts-workspace-create'))
  assert.ok(button.parentElement.hasAttribute('data-prts-workspace-actions'))
  assert.ok(button.querySelector('[data-prts-facility-svg]'))
  assert.equal(document.querySelector('[data-prts-workspace-menu]'), null)
  assert.equal(document.querySelector('[data-prts-row-title]').textContent, '未分组')
  adapter.dispose()
  assert.equal(button.hasAttribute('data-prts-workspace-create'), false)
  assert.equal(button.parentElement.hasAttribute('data-prts-workspace-actions'), false)
  dom.window.close()
})

test('unchanged streaming summaries do not rescan all sidebar cards', async () => {
  const rows=Array.from({length:40},(_,i)=>`<div role="treeitem" aria-selected="false" data-row-key="session:${i}"><span data-state="ongoing"></span><span data-session-title>会话${i}</span><span><span><button type="button">…</button></span></span></div>`).join('')
  const dom=new JSDOM(`<aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><header><span>工作区</span><button>搜索</button></header><div role="tree">${rows}</div></div></aside>`,{pretendToBeVisual:true})
  const snapshot={ids:Array.from({length:40},(_,i)=>String(i)),byId:Object.fromEntries(Array.from({length:40},(_,i)=>[String(i),{displayTitle:'会话'+i,running:true}]))}
  const list=createStore(snapshot)
  const adapter=createSidebarControlAdapter({document:dom.window.document,window:dom.window,sessions:{list}})
  adapter.start();await flush(dom.window);await flush(dom.window)
  const root=dom.window.document.querySelector('[data-slot="sidebar.workspaces"]'),query=root.querySelectorAll.bind(root)
  let scans=0
  root.querySelectorAll=selector=>{if(selector==='div[role="treeitem"][aria-selected]')scans++;return query(selector)}
  for(let i=0;i<5;i++){list.update({...snapshot});await flush(dom.window)}
  console.log('unchanged summary full scans:',scans)
  assert.equal(scans,0)
  list.update({...snapshot,byId:{...snapshot.byId,'0':{displayTitle:'已更名',running:true}}})
  await flush(dom.window)
  assert.ok(scans>0)
  assert.ok(root.textContent.includes('已更名'))
  adapter.dispose();dom.window.close()
})

test('quiet scrollbar changes skip scans and short pickup hovers cancel activation', async () => {
  const dom = new JSDOM(`<aside data-prts-region="sessions" class="host_root host_quietBars"><div data-slot="sidebar.workspaces"><div role="tree"><div role="treeitem" aria-selected="false"><span>会话</span></div></div></div></aside>`, {pretendToBeVisual:true})
  const {document}=dom.window
  const adapter=createSidebarControlAdapter({document,window:dom.window})
  adapter.start();await flush(dom.window);await flush(dom.window)
  const root=document.querySelector('[data-slot="sidebar.workspaces"]'),row=document.querySelector('[role="treeitem"]'),aside=document.querySelector('aside')
  let scans=0;const query=root.querySelectorAll.bind(root)
  root.querySelectorAll=selector=>{if(selector==='div[role="treeitem"][aria-selected]')scans++;return query(selector)}
  for(let i=0;i<4;i++){aside.classList.toggle('host_quietBars');await flush(dom.window)}
  assert.equal(scans,0)
  row.setAttribute('aria-selected','true');await flush(dom.window)
  assert.ok(scans>0)
  row.dispatchEvent(new dom.window.MouseEvent('pointerover',{bubbles:true}))
  assert.equal(row.hasAttribute('data-prts-pickup-ready'),false)
  row.dispatchEvent(new dom.window.MouseEvent('pointerout',{bubbles:true}))
  await new Promise(r=>dom.window.setTimeout(r,120))
  assert.equal(row.hasAttribute('data-prts-pickup-ready'),false)
  row.dispatchEvent(new dom.window.MouseEvent('pointerover',{bubbles:true}))
  await new Promise(r=>dom.window.setTimeout(r,120))
  assert.equal(row.hasAttribute('data-prts-pickup-ready'),true)
  row.dispatchEvent(new dom.window.MouseEvent('pointerout',{bubbles:true}))
  assert.equal(row.hasAttribute('data-prts-pickup-ready'),false)
  adapter.dispose();dom.window.close()
})
test('separates nested native pin indicators from timestamps across pin and selection updates', async () => {
  const dom = new JSDOM(`<!doctype html><html><body>
    <aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div role="tree">
      <div role="treeitem" aria-selected="false">
        <span>status</span><span class="title">Pinned session</span>
        <span class="native_rowResting"><span class="native_time native_timestamp">1d</span><span data-slot="sidebar.session.row.trailing"></span><span class="native_pinIndicator" role="img" aria-label="已置顶"><svg></svg></span></span>
        <span><button type="button" data-context-menu-trigger>…</button></span>
      </div>
    </div></div></aside></body></html>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createSidebarControlAdapter({ document, window: dom.window })
  try {
    adapter.start()
    const row = document.querySelector('[role="treeitem"]')
    const resting = row.querySelector('.native_rowResting')
    const timestamp = row.querySelector('.native_timestamp')
    const pin = row.querySelector('.native_pinIndicator')
    assert.equal(row.querySelector('[data-prts-session-time]'), timestamp)
    assert.equal(row.querySelector('[data-prts-session-resting]'), resting)
    assert.equal(row.querySelector('[data-prts-session-pin]'), pin)
    assert.equal(pin.parentElement, resting)
    row.setAttribute('aria-selected', 'true')
    await flush(dom.window)
    assert.equal(row.querySelector('[data-prts-session-pin]'), pin)
    pin.remove()
    await flush(dom.window)
    assert.equal(row.querySelector('[data-prts-session-pin]'), null)
    assert.equal(pin.hasAttribute('data-prts-session-pin'), false)
    resting.append(pin)
    await flush(dom.window)
    assert.equal(row.querySelector('[data-prts-session-pin]'), pin)
    adapter.dispose()
    assert.equal(document.querySelector('[data-prts-session-resting], [data-prts-session-pin], [data-prts-session-time]'), null)
    assert.equal(pin.parentElement, resting)
  } finally {
    adapter.dispose()
    dom.window.close()
  }
})

function nativeMenuFixture(testContext, getContextMenus) {
  const dom = new JSDOM(`<body><aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div role="tree">
    <div role="treeitem" aria-expanded="true" data-row-key="workspace:workspace-a"><span>folder</span><span>chevron</span><span>Workspace</span><span><button type="button" data-context-menu-trigger>…</button><button type="button">+</button></span></div>
    <div role="treeitem" aria-selected="true" data-row-key="session:session-a"><span>status</span><span class="title">Session A</span><span>time</span><span><button type="button" data-context-menu-trigger>…</button></span></div>
    <div role="treeitem" aria-selected="false" data-row-key="session:session-a"><span>status</span><span class="title">Pinned A</span><span>time</span><span><button type="button" data-context-menu-trigger>…</button></span></div>
    <div role="treeitem" aria-selected="false" data-row-key="session:session-b"><span>status</span><span class="title">Session B</span><span>time</span><span><button type="button" data-context-menu-trigger>…</button></span></div>
    <div role="treeitem" aria-selected="false" data-blank-session data-row-key="session:blank"><span>status</span><span>Blank</span></div>
  </div></div></aside></body>`, { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createSidebarControlAdapter({ document, window: dom.window, getContextMenus })
  testContext.after(() => { adapter.dispose(); dom.window.close() })
  adapter.start({ sessionPreview: false })
  const root = document.querySelector('[data-slot="sidebar.workspaces"]')
  const query = root.querySelectorAll.bind(root)
  let scans = 0
  root.querySelectorAll = selector => {
    if (selector === 'div[role="treeitem"][aria-selected]') scans++
    return query(selector)
  }
  return { dom, document, adapter, scans: () => scans,
    openKeys: () => Array.from(root.querySelectorAll('[data-prts-row-menu-open]'), row => row.getAttribute('data-row-key')) }
}

function menuTarget(kind, id) {
  return { kind, value: kind === 'workspace' ? { workspaceId: id } : { sessionId: id } }
}

test('native context menu snapshots update only matching rows without rescanning cards', async testContext => {
  const active = createStore(null)
  const fixture = nativeMenuFixture(testContext, () => ({ active }))
  active.update(menuTarget('session', 'session-a'))
  assert.deepEqual(fixture.openKeys(), ['session:session-a', 'session:session-a'])
  fixture.document.querySelector('[data-row-key="session:session-a"]').classList.add('_menuOpen_randomhash_12')
  await flush(fixture.dom.window)
  active.update(menuTarget('workspace', 'workspace-a'))
  assert.deepEqual(fixture.openKeys(), ['workspace:workspace-a'])
  active.update(menuTarget('session', 'session-b'))
  assert.deepEqual(fixture.openKeys(), ['session:session-b'])
  active.update(menuTarget('session', 'blank'))
  assert.deepEqual(fixture.openKeys(), [])
  active.update({ kind: 'file', value: { path: '/example' } })
  active.update(null)
  await flush(fixture.dom.window)
  assert.deepEqual(fixture.openKeys(), [])
  assert.equal(fixture.scans(), 0)
})

test('menu-only DOM fallback updates do not rebuild cards while real row changes still do', async testContext => {
  const fixture = nativeMenuFixture(testContext)
  const row = fixture.document.querySelector('[data-row-key="session:session-a"]')
  const trigger = row.querySelector('[data-context-menu-trigger]')
  row.classList.add('_menuOpen_arbitrary_12')
  await flush(fixture.dom.window)
  assert.deepEqual(fixture.openKeys(), ['session:session-a'])
  row.classList.remove('_menuOpen_arbitrary_12')
  await flush(fixture.dom.window)
  trigger.setAttribute('aria-expanded', 'true')
  await flush(fixture.dom.window)
  assert.deepEqual(fixture.openKeys(), ['session:session-a'])
  trigger.setAttribute('aria-expanded', 'false')
  await flush(fixture.dom.window)
  assert.deepEqual(fixture.openKeys(), [])
  assert.equal(fixture.scans(), 0)
  row.className = '_menuOpen_arbitrary_12 archived'
  await flush(fixture.dom.window)
  assert.equal(fixture.scans(), 1)
  fixture.document.querySelector('[data-prts-workspace-row]').setAttribute('aria-expanded', 'false')
  await flush(fixture.dom.window)
  assert.equal(fixture.scans(), 2)
})

test('native menu source replacement disposal and restart release stale subscriptions', async testContext => {
  const first = createStore(menuTarget('session', 'session-a'))
  const second = createStore(menuTarget('workspace', 'workspace-a'))
  let active = first
  const fixture = nativeMenuFixture(testContext, () => ({ active }))
  assert.deepEqual(fixture.openKeys(), ['session:session-a', 'session:session-a'])
  active = second
  fixture.adapter.start({ sessionPreview: false })
  assert.deepEqual(fixture.openKeys(), ['workspace:workspace-a'])
  first.update(menuTarget('session', 'session-b'))
  assert.deepEqual(fixture.openKeys(), ['workspace:workspace-a'])
  fixture.adapter.dispose()
  second.update(menuTarget('session', 'session-b'))
  assert.deepEqual(fixture.openKeys(), [])
  fixture.adapter.start({ sessionPreview: false })
  assert.deepEqual(fixture.openKeys(), ['session:session-b'])
  second.update(null)
  assert.deepEqual(fixture.openKeys(), [])
})

test('late native menu services and newly mounted duplicate rows adopt current state', async testContext => {
  const active = createStore(menuTarget('session', 'session-a'))
  let service
  const fixture = nativeMenuFixture(testContext, () => service)
  service = { active }
  const row = fixture.document.querySelector('[data-row-key="session:session-a"]')
  const copy = fixture.document.createElement('div')
  copy.innerHTML = '<div role="treeitem" aria-selected="false" data-row-key="session:session-a"><span>status</span><span class="title">New A</span><span>time</span><span><button type="button" data-context-menu-trigger>…</button></span></div>'
  row.parentElement.append(copy.firstElementChild)
  await flush(fixture.dom.window)
  assert.deepEqual(fixture.openKeys(), ['session:session-a', 'session:session-a', 'session:session-a'])
  active.update(null)
  assert.deepEqual(fixture.openKeys(), [])
  assert.equal(fixture.scans(), 1)
})

test('auxiliary hover announcements do not rescan cards while real status and row mounts still do', async testContext => {
  const fixture = nativeMenuFixture(testContext)
  const row = fixture.document.querySelector('[data-row-key="session:session-a"]')
  const announcement = fixture.document.createElement('span')
  announcement.setAttribute('role', 'status')
  for (let iteration = 0; iteration < 3; iteration++) {
    row.parentElement.append(announcement)
    await flush(fixture.dom.window)
    announcement.remove()
    await flush(fixture.dom.window)
  }
  assert.equal(fixture.scans(), 0)
  const status = fixture.document.createElement('span')
  status.setAttribute('role', 'status')
  status.dataset.state = 'warning'
  row.append(status)
  await flush(fixture.dom.window)
  assert.equal(fixture.scans(), 1)
  assert.equal(row.dataset.prtsSessionState, 'warning')
  const scansBeforeMount = fixture.scans()
  const container = fixture.document.createElement('span')
  container.setAttribute('role', 'status')
  container.innerHTML = '<div role="treeitem" aria-selected="false"><span>status</span><span class="title">New row</span></div>'
  row.parentElement.append(container)
  await flush(fixture.dom.window)
  assert.ok(fixture.scans() > scansBeforeMount, 'mounting a real row still triggers a full scan')
  assert.ok(container.querySelector('[data-prts-session-row]'))
})


test('running SVG ownership follows status changes and restores native children on disposal', async context => {
  const dom = new JSDOM('<aside data-prts-region="sessions"><div data-slot="sidebar.workspaces"><div role="treeitem" aria-selected="true" data-row-key="session:running"><span><svg data-state="ongoing"><path data-native-orbit></path></svg></span><span>Session</span></div></div></aside>', { pretendToBeVisual: true })
  const { document } = dom.window
  const adapter = createSidebarControlAdapter({ document, window: dom.window })
  context.after(() => { adapter.dispose(); dom.window.close() })
  const spinner = document.querySelector('svg[data-state]')
  const nativeChild = spinner.querySelector('[data-native-orbit]')
  adapter.start()
  assert.equal(spinner.hasAttribute('data-prts-running-surface'), true)
  assert.equal(spinner.querySelectorAll('[data-prts-running-marker]').length, 1)
  adapter.start()
  assert.equal(spinner.querySelectorAll('[data-prts-running-marker]').length, 1)
  spinner.setAttribute('data-state', 'done')
  await flush(dom.window)
  assert.equal(spinner.hasAttribute('data-prts-running-surface'), false)
  assert.equal(spinner.querySelector('[data-prts-running-marker]'), null)
  assert.equal(nativeChild.parentElement, spinner)
  spinner.setAttribute('data-state', 'ongoing')
  await flush(dom.window)
  assert.equal(spinner.hasAttribute('data-prts-running-surface'), true)
  assert.equal(spinner.querySelectorAll('[data-prts-running-marker]').length, 1)
  adapter.dispose()
  assert.equal(spinner.hasAttribute('data-prts-running-surface'), false)
  assert.equal(spinner.querySelector('[data-prts-running-marker]'), null)
  assert.equal(nativeChild.parentElement, spinner)
})
