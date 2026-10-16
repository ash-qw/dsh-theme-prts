import { createSessionSummaryPreview, scrollSummaryTitle } from './session-summary-preview.js'
import { ensureFacilityGraphic, ensureFacilityTextureDefs, renderFacilityGraphic } from './facility-vector.js'
import { createSessionLifelineAnimator } from './session-lifeline.js'

const OWNED_ATTRIBUTES = [
  'data-prts-row-title',
  'data-prts-workspace-disclosure',
  'data-prts-workspace-icon',
  'data-prts-row-menu-open',
  'data-prts-workspace-row',
  'data-prts-workspace-actions',
  'data-prts-workspace-menu-anchor',
  'data-prts-workspace-menu',
  'data-prts-workspace-create',
  'data-prts-session-row',
  'data-prts-session-actions',
  'data-prts-session-quick-actions',
  'data-prts-session-menu-anchor',
  'data-prts-session-menu',
  'data-prts-session-time',
  'data-prts-session-index',
  'data-prts-session-state',
  'data-prts-session-summary-header',
  'data-prts-session-summary-label',
  'data-prts-facility-face',
  'data-prts-facility-spine',
  'data-prts-facility-vector',
  'data-prts-facility-size',
  'data-prts-facility-texture',
  'data-prts-spine-vector',
]

const SESSION_STATES = Object.freeze(['warning', 'ongoing', 'error', 'done'])
const PENDING_LABELS = Object.freeze({
  approval: '待授权',
  'plan-review': '待审阅',
  question: '待回答',
})

function snapshotOf(source) {
  try {
    return source?.getSnapshot?.()
  } catch {
    return undefined
  }
}

function nativeSessionState(row) {
  for (const state of SESSION_STATES) {
    if (row.querySelector(`[data-state="${state}"]:not([data-prts-owned-session-status])`)) return state
  }
  return undefined
}

function resolveSectionHeader(root) {
  const tree = root?.querySelector?.('[role="tree"]')
  if (!tree) return {}
  for (const candidate of root.querySelectorAll('div')) {
    if (candidate.contains(tree)) continue
    const label = Array.from(candidate.children).find(child => (
      child.tagName === 'SPAN'
      && child.textContent.trim()
      && !child.querySelector('button, input')
    ))
    if (!label || candidate.querySelectorAll('button').length < 1) continue
    return { header: candidate, label }
  }
  return {}
}

function visibleSessionSummaries(sessions, workspaces, sessionStatus) {
  const list = snapshotOf(sessions?.list)
  if (!list?.byId) return []
  const statuses = snapshotOf(sessionStatus)
  const workspaceList = snapshotOf(workspaces?.list)
  const archived = new Set(workspaceList?.archivedSessionIds ?? [])
  const ids = Array.isArray(list.ids) ? list.ids : Object.keys(list.byId)
  return ids.flatMap(id => {
    const summary = list.byId[id]
    if (!summary || summary.blank || summary.origin === 'subagent' || archived.has(id)) return []
    const status = statuses?.get?.(id)
    const pendingLabel = PENDING_LABELS[status?.pendingInteraction?.kind]
    if (pendingLabel) return [{ id, title: summary.displayTitle || id, state: 'warning', statusLabel: pendingLabel }]
    const runningSubagent = list.projectionsBySession?.[id]?.values?.subagentCatalog?.some(child =>
      (statuses?.get?.(child.id)?.running ?? list.byId[child.id]?.running) === true)
    if ((status?.running ?? summary.running) || runningSubagent) {
      return [{ id, title: summary.displayTitle || id, state: 'ongoing' }]
    }
    if (status ? status.completionUnread === true : summary.completed === true) {
      return [{ id, title: summary.displayTitle || id, state: 'done' }]
    }
    return []
  })
}

function markSidebarNode(node, attribute, next) {
  if (!node) return
  node.setAttribute(attribute, '')
  next.add(node)
}

function resolveRowControls(row, kind) {
  const menu = row.querySelector(':scope > span > span > button[type="button"]')
  const anchor = menu?.parentElement
  const actions = anchor?.parentElement
  if (!menu || !anchor || actions?.parentElement !== row) return {}
  const create = kind === 'workspace'
    ? actions.querySelector(':scope > button[type="button"]')
    : undefined
  const quickActions = kind === 'session'
    ? Array.from(actions.children).filter(child => child !== anchor && child.querySelector('button'))
    : []
  return { actions, anchor, create, menu, quickActions }
}

function resolveRowTitle(row, kind, actions) {
  const candidates = Array.from(row.querySelectorAll(':scope > span')).filter(node => (
    node !== actions
    && !node.hasAttribute('data-prts-row-projection')
    && node.getAttribute('aria-hidden') !== 'true'
    && !node.querySelector('button')
    && node.textContent.trim()
  ))
  if (kind === 'session') return candidates.find(node => node.matches('[class*="title"], [data-session-title]')) ?? candidates.at(-1)
  return candidates.find(node => node.matches('[class*="project"], [class*="workspace"], [data-workspace-title]')) ?? candidates.at(-1)
}

function resolveWorkspaceIcon(row, title, actions) {
  return Array.from(row.children).find(node => (
    node.tagName === 'SPAN'
    && node !== title
    && node !== actions
    && !node.hasAttribute('data-prts-facility-face')
    && !node.hasAttribute('data-prts-facility-spine')
    && !node.hasAttribute('data-prts-row-projection')
  ))
}

function resolveWorkspaceDisclosure(row, title, actions, icon) {
  return Array.from(row.children).find(node => (
    node.tagName === 'SPAN'
    && node !== title
    && node !== actions
    && node !== icon
    && !node.hasAttribute('data-prts-facility-face')
    && !node.hasAttribute('data-prts-facility-spine')
    && !node.hasAttribute('data-prts-row-projection')
    && !node.querySelector('button')
  ))
}

function resolveSessionTime(row, title, actions) {
  const candidates = Array.from(row.querySelectorAll(':scope > span')).filter(node => (
    node !== title
    && node !== actions
    && !node.hasAttribute('data-prts-facility-face')
    && !node.hasAttribute('data-prts-row-projection')
    && !node.querySelector('button')
    && node.textContent.trim()
  ))
  return candidates.find(node => node.matches('[class*="time" i], time, [data-session-time]'))
    ?? candidates.filter(node => node.getAttribute('aria-hidden') !== 'true' && !node.querySelector('[data-state]')).at(-1)
}

function ensureFacilityFace(document, row, kind, next) {
  let face = row.querySelector(':scope > [data-prts-facility-face]')
  if (!face) {
    face = document.createElement('span')
    face.setAttribute('data-prts-owned-facility', '')
    row.insertBefore(face, row.firstChild)
  }
  face.setAttribute('data-prts-facility-face', kind)
  face.setAttribute('data-prts-facility-texture', kind === 'workspace' ? 'silhouette' : 'pickup')
  face.setAttribute('aria-hidden', 'true')
  next.add(face)
  return face
}

function ensureFacilitySpine(document, row, kind, next) {
  let spine = row.querySelector(':scope > [data-prts-facility-spine]')
  if (!spine) {
    spine = document.createElement('span')
    spine.setAttribute('data-prts-owned-facility-spine', '')
    row.insertBefore(spine, row.firstChild)
  }
  spine.setAttribute('data-prts-facility-spine', kind)
  spine.setAttribute('aria-hidden', 'true')
  next.add(spine)
  return spine
}


export function createSidebarControlAdapter({ document, window, sessions, workspaces, getSessionStatus, getUiWorkspace, getUiConversation, getSessions }) {
  let previewPreferences = {}
  let observer
  let resizeObserver
  let resizeFrame
  let scanFrame
  let stopSessionList = () => {}
  let stopWorkspaceList = () => {}
  let stopSessionStatus = () => {}
  let sessionStatus
  let statusSourcesStarted = false
  let summaryRoot
  let summarySignature = ''
  let heldPreviewState
  function dismissHeldPreview(event) {
    if (!heldPreviewState || (event?.type === 'keydown' && event.key !== 'Escape')) return
    if (event?.type === 'pointerdown' && (summaryRoot?.contains(event.target) || event.target.closest?.('[data-prts-summary-reply]'))) return
    heldPreviewState = undefined
    queueScan()
  }
  function enterPreviewState(state) {
    if (heldPreviewState && heldPreviewState !== state) { heldPreviewState = undefined; queueScan() }
    preview.enterState(state)
  }
  const preview = createSessionSummaryPreview({ document, window, sessions, getUiConversation, getSessions, getSessionStatus, openSession, getPreviewPreferences: () => previewPreferences, onPreviewClosed: () => { if (statusSourcesStarted) queueScan() }, onAnswerSubmitted: state => { heldPreviewState = state; queueScan() } })
  const stopTitles = new Map()
  const summaryGroups = new Map()
  function clearSummaryEffects() { preview.stop(false); for (const stop of stopTitles.values()) stop(); stopTitles.clear(); summaryGroups.clear() }
  let owned = new Set()
  let vectorOwners = new Set()
  const dirtyVectors = new Map()
  const vectorSizes = new WeakMap()
  const lifelineAnimator = createSessionLifelineAnimator({ document, window })

  function connectSessionStatus() {
    const source = getSessionStatus?.()
    if (source === sessionStatus) return
    stopSessionStatus()
    sessionStatus = source
    stopSessionStatus = source?.subscribe?.(queueScan) ?? (() => {})
  }

  function openSession(sessionId) {
    dismissHeldPreview()
    try {
      const uiWorkspace = getUiWorkspace?.()
      if (typeof uiWorkspace?.openSession === 'function') {
        uiWorkspace.openSession(sessionId)
        return
      }
      if (typeof sessions?.open === 'function') {
        sessions.open(sessionId)
        return
      }
    } catch {}
    const row = Array.from(document.querySelectorAll('[data-prts-session-row]')).find(candidate => (
      candidate.getAttribute('data-row-key') === `session:${sessionId}`
      || candidate.getAttribute('data-session-id') === sessionId
      || candidate.querySelector('[data-prts-row-title]')?.textContent.trim() === sessionId
    ))
    row?.click?.()
  }

  function statusSignal(document, state) {
    const signal = document.createElement('span')
    signal.setAttribute('data-prts-session-summary-signal', state)
    signal.setAttribute('aria-hidden', 'true')
    return signal
  }

  function buildSummaryGroup(state, label, items) {
    const group = document.createElement('span')
    group.setAttribute('data-prts-session-summary-group', state)

    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.setAttribute('data-prts-session-summary-trigger', state)
    trigger.setAttribute('aria-haspopup', 'menu')
    trigger.setAttribute('aria-label', `${label} ${items.length}`)
    trigger.append(statusSignal(document, state))
    const count = document.createElement('span')
    count.setAttribute('data-prts-session-summary-count', '')
    count.textContent = String(items.length)
    trigger.append(count)
    trigger.addEventListener('pointerenter', () => enterPreviewState(state))
    trigger.addEventListener('focus', () => enterPreviewState(state))

    const popover = document.createElement('span')
    popover.setAttribute('data-prts-session-summary-popover', state)
    popover.setAttribute('role', 'menu')
    popover.setAttribute('aria-label', label)
    const heading = document.createElement('span')
    heading.setAttribute('data-prts-session-summary-heading', '')
    const headingLabel = document.createElement('strong')
    headingLabel.textContent = label
    const hint = document.createElement('small')
    hint.textContent = '选择会话'
    heading.append(headingLabel, hint)
    popover.append(heading)
    const reply = document.createElement('section')
    reply.setAttribute('data-prts-summary-reply', '')
    reply.setAttribute('role', 'note')
    reply.setAttribute('popover', 'manual')
    reply.hidden = true
    reply.append(document.createElement('strong'), document.createElement('p'))
    group.addEventListener('pointerleave', () => preview.leave())
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) preview.leave()
    })
    const list = document.createElement('span')
    list.setAttribute('data-prts-summary-list', '')
    popover.append(list)
    const entries = new Map()
    const update = items => {
      count.textContent = String(items.length)
      trigger.setAttribute('aria-label', `${label} ${items.length}`)
      const ids = new Set(items.map(item => item.id))
      for (const [id, entry] of entries) {
        if (ids.has(id)) continue
        stopTitles.get(entry.button)?.()
        stopTitles.delete(entry.button)
        entry.button.remove()
        entries.delete(id)
      }
      for (const [index, incoming] of items.entries()) {
        const existing = entries.get(incoming.id)
        if (existing) {
          if (existing.item.title !== incoming.title) {
            stopTitles.get(existing.button)?.()
            existing.button.querySelector('[data-prts-summary-title] > span').textContent = incoming.title
          }
          Object.assign(existing.item, incoming)
          let detail = existing.button.querySelector('[data-prts-session-summary-item-status]')
          if (incoming.statusLabel && !detail) { detail = document.createElement('small'); detail.setAttribute('data-prts-session-summary-item-status',''); existing.button.append(detail) }
          if (incoming.statusLabel) detail.textContent = incoming.statusLabel
          else detail?.remove()
          existing.button.setAttribute('aria-label', incoming.statusLabel ? `${incoming.title}，${incoming.statusLabel}` : incoming.title)
          if (list.children[index] !== existing.button) list.insertBefore(existing.button, list.children[index] ?? null)
          continue
        }
        const item = {...incoming}
      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('role', 'menuitem')
      button.setAttribute('data-prts-session-summary-item', item.id)
      button.append(statusSignal(document, state))
      const title = document.createElement('span')
      title.setAttribute('data-prts-summary-title', '')
      const text = document.createElement('span')
      text.textContent = item.title
      title.append(text)
      button.append(title)
      const viewing = document.createElement('em')
      viewing.setAttribute('data-prts-preview-marker', '')
      viewing.textContent = '预览中'
      button.append(viewing)
      button.setAttribute('aria-label', item.title)
      stopTitles.set(button, scrollSummaryTitle(button, title, text, window))
      const showReply = () => {
        const key = {ongoing:'previewOngoing',warning:'previewWarning',done:'previewDone'}[state]
        if (previewPreferences[key] === false) { preview.stop(); return }
        preview.show(item.id, reply, item.title, button)
      }
      button.addEventListener('pointermove', showReply)
      button.addEventListener('pointerleave', () => preview.leave())
      button.addEventListener('focus', showReply)
      if (item.statusLabel) {
        const detail = document.createElement('small')
        detail.setAttribute('data-prts-session-summary-item-status', '')
        detail.textContent = item.statusLabel
        button.append(detail)
        button.setAttribute('aria-label', `${item.title}，${item.statusLabel}`)
      }
      button.addEventListener('click', event => {
        event.stopPropagation()
        preview.stop()
        openSession(item.id)
      })
      list.insertBefore(button, list.children[index] ?? null)
      entries.set(item.id, {item, button})
      }
    }
    update(items)
    summaryGroups.set(state, {group, update, dispose: () => {
      for (const {button} of entries.values()) { stopTitles.get(button)?.(); stopTitles.delete(button) }
      group.remove()
    }})
    popover.append(reply)
    group.append(trigger, popover)
    return group
  }

  function syncSummary(root, next) {
    const { header, label } = resolveSectionHeader(root)
    if (previewPreferences.sessionPreview === false || !header || !label) {
      heldPreviewState = undefined
      preview.stop()
      clearSummaryEffects()
      summaryRoot?.remove()
      summaryRoot = undefined
      summarySignature = ''
      return
    }
    header.setAttribute('data-prts-session-summary-header', '')
    label.setAttribute('data-prts-session-summary-label', '')
    next.add(header)
    next.add(label)
    const fromService = visibleSessionSummaries(sessions, workspaces, sessionStatus)
    const nativeRows = Array.from(root.querySelectorAll('[data-prts-session-row]')).flatMap(row => {
      const state = row.getAttribute('data-prts-session-state')
      if (state !== 'warning' && state !== 'ongoing' && state !== 'done') return []
      const title = row.querySelector('[data-prts-row-title]')?.textContent.trim()
      const rowKey = row.getAttribute('data-row-key')
      const id = row.getAttribute('data-session-id') || (rowKey?.startsWith('session:') ? rowKey.slice(8) : title)
      return title ? [{ id, title, state }] : []
    })
    const rows = [...fromService]
    const statePriority = { done: 1, ongoing: 2, warning: 3 }
    for (const nativeRow of nativeRows) {
      const index = rows.findIndex(item => item.id === nativeRow.id || item.title === nativeRow.title)
      if (index === -1) {
        rows.push(nativeRow)
      } else if (statePriority[nativeRow.state] > statePriority[rows[index].state]) {
        rows[index] = { ...rows[index], state: nativeRow.state }
      }
    }
    // Do not move the row/menu to another status behind a frozen preview.
    const pinned = preview.pinnedState()
    if (pinned?.state) {
      const item = rows.find(item => item.id === pinned.id)
      if (item) { item.state = pinned.state; item.statusLabel = undefined }
    }
    // While reading a preview, preserve surviving rows' positions and append
    // newcomers. No persistent ordering: the next idle sync uses host order.
    const orderedState = state => {
      const items = rows.filter(item => item.state === state)
      if (!preview.isOpen() || !summaryRoot) return items
      const remaining = new Map(items.map(item => [item.id, item]))
      const stable = []
      for (const row of summaryRoot.querySelectorAll(`[data-prts-session-summary-group="${state}"] [data-prts-session-summary-item]`)) {
        const id = row.getAttribute('data-prts-session-summary-item')
        if (remaining.has(id)) { stable.push(remaining.get(id)); remaining.delete(id) }
      }
      return [...stable, ...remaining.values()]
    }
    const warning = orderedState('warning')
    const ongoing = orderedState('ongoing')
    const done = orderedState('done')
    if (heldPreviewState && !rows.some(item => item.state === heldPreviewState)) heldPreviewState = undefined
    const signature = JSON.stringify({
      heldPreviewState,
      warning: warning.map(item => [item.id, item.title, item.statusLabel]),
      ongoing: ongoing.map(item => [item.id, item.title]),
      done: done.map(item => [item.id, item.title]),
    })
    if (!summaryRoot) {
      summaryRoot = document.createElement('span')
      summaryRoot.setAttribute('data-prts-owned-session-summary', '')
      summaryRoot.setAttribute('data-prts-session-summary', '')
      summaryRoot.setAttribute('role', 'group')
      summaryRoot.setAttribute('aria-label', '会话状态总览')
      label.insertAdjacentElement('afterend', summaryRoot)
    } else if (summaryRoot.parentElement !== header) {
      label.insertAdjacentElement('afterend', summaryRoot)
    }
    const labelHidden = Array.from(label.classList).some(name => /hidden/i.test(name))
    summaryRoot.toggleAttribute('data-prts-summary-search-hidden', labelHidden)
    summaryRoot.hidden = warning.length === 0 && ongoing.length === 0 && done.length === 0
    if (signature === summarySignature) return
    summarySignature = signature
    for (const [state, title, items] of [['warning','等待处理的会话',warning],['ongoing','运行中的会话',ongoing],['done','完成未查看',done]]) {
      const existing = summaryGroups.get(state)
      if (!items.length) { existing?.dispose(); summaryGroups.delete(state); continue }
      if (existing) existing.update(items)
      else summaryRoot.append(buildSummaryGroup(state, title, items))
    }
    let position = 0
    for (const state of ['warning','ongoing','done']) {
      const group = summaryGroups.get(state)?.group
      if (group && summaryRoot.children[position++] !== group) summaryRoot.insertBefore(group, summaryRoot.children[position - 1] ?? null)
      group?.removeAttribute('data-prts-preview-open')
    }
    preview.reanchor(summaryRoot)
    if (heldPreviewState) summaryRoot.querySelector(`[data-prts-session-summary-group="${heldPreviewState}"]`)?.setAttribute('data-prts-preview-open', '')
  }

  function scheduleVectors() {
    if (resizeFrame !== undefined) return
    const requestFrame = window?.requestAnimationFrame?.bind(window) ?? (callback => window?.setTimeout?.(callback, 0))
    resizeFrame = requestFrame?.(flushVectors)
  }

  function flushVectors() {
    if (resizeFrame !== undefined) {
      if (window?.cancelAnimationFrame) window.cancelAnimationFrame(resizeFrame)
      else window?.clearTimeout?.(resizeFrame)
    }
    resizeFrame = undefined
    const measurements = []
    for (const [owner, observedSize] of dirtyVectors) {
      if (!vectorOwners.has(owner) || !owner.isConnected) continue
      let size = observedSize
      if (!size) {
        const box = owner.getBoundingClientRect?.()
        size = {
          width: owner.clientWidth || owner.offsetWidth || box?.width || 0,
          height: owner.clientHeight || owner.offsetHeight || box?.height || 0,
        }
      }
      const previous = vectorSizes.get(owner)
      if (previous?.width === size.width && previous?.height === size.height) continue
      vectorSizes.set(owner, size)
      measurements.push([owner, size])
    }
    dirtyVectors.clear()
    for (const [owner, size] of measurements) renderFacilityGraphic(owner, size)
  }

  function registerVector(owner, options, next, nextVectorOwners) {
    if (!owner) return
    const previousSessionNotch = owner.querySelector?.(':scope > svg[data-prts-facility-svg]')
      ?.hasAttribute('data-prts-session-notch') ?? false
    const graphic = ensureFacilityGraphic(document, owner, options)
    if (!graphic) return
    next.add(graphic)
    nextVectorOwners.add(owner)
    if (!vectorOwners.has(owner)) resizeObserver?.observe(owner)
    if (previousSessionNotch !== Boolean(options.sessionNotch)) vectorSizes.delete(owner)
    if (!vectorSizes.has(owner)) {
      dirtyVectors.set(owner, undefined)
    }
  }

  function syncVectorOwners(next) {
    for (const owner of vectorOwners) {
      if (next.has(owner)) continue
      resizeObserver?.unobserve?.(owner)
      dirtyVectors.delete(owner)
    }
    vectorOwners = next
    scheduleVectors()
  }


  function queueScan() {
    if (scanFrame !== undefined) return
    const requestFrame = window?.requestAnimationFrame?.bind(window) ?? (callback => window?.setTimeout?.(callback, 0))
    scanFrame = requestFrame(() => {
      scanFrame = undefined
      scan()
    })
  }

  function scan() {
    connectSessionStatus()
    const root = document?.querySelector?.('[data-prts-region="sessions"] [data-slot="sidebar.workspaces"]')
    const next = new Set()
    const nextVectorOwners = new Set()
    let activeLifelineRow
    let activeLifeline
    if (root) {
      for (const projection of root.querySelectorAll('[data-prts-owned-projection]')) projection.remove()
      for (const row of root.querySelectorAll('div[role="treeitem"][aria-expanded]')) {
        const controls = resolveRowControls(row, 'workspace')
        const face = ensureFacilityFace(document, row, 'workspace', next)
        const spine = ensureFacilitySpine(document, row, 'workspace', next)
        registerVector(face, { kind: 'face', topNotch: true, texture: 'silhouette' }, next, nextVectorOwners)
        registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
        markSidebarNode(row, 'data-prts-workspace-row', next)
        const title = resolveRowTitle(row, 'workspace', controls.actions)
        markSidebarNode(title, 'data-prts-row-title', next)
        const icon = resolveWorkspaceIcon(row, title, controls.actions)
        markSidebarNode(icon, 'data-prts-workspace-icon', next)
        markSidebarNode(resolveWorkspaceDisclosure(row, title, controls.actions, icon), 'data-prts-workspace-disclosure', next)
        row.toggleAttribute('data-prts-row-menu-open', controls.menu?.getAttribute('aria-expanded') === 'true'
          || row.classList.contains('menuOpen'))
        markSidebarNode(controls.actions, 'data-prts-workspace-actions', next)
        markSidebarNode(controls.anchor, 'data-prts-workspace-menu-anchor', next)
        markSidebarNode(controls.menu, 'data-prts-workspace-menu', next)
        markSidebarNode(controls.create, 'data-prts-workspace-create', next)
        registerVector(controls.menu, { kind: 'button' }, next, nextVectorOwners)
        registerVector(controls.create, { kind: 'button' }, next, nextVectorOwners)
      }
      let sessionOrdinal = 0
      for (const row of root.querySelectorAll('div[role="treeitem"][aria-selected]')) {
        const sessionIndex = String(++sessionOrdinal).padStart(2, '0')
        const controls = resolveRowControls(row, 'session')
        const state = nativeSessionState(row)
        const face = ensureFacilityFace(document, row, 'session', next)
        const spine = ensureFacilitySpine(document, row, 'session', next)
        registerVector(face, { kind: 'face', topNotch: true, sessionNotch: true, texture: 'pickup' }, next, nextVectorOwners)
        registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
        if (!activeLifelineRow && row.getAttribute('aria-selected') === 'true') {
          activeLifelineRow = row
          activeLifeline = face.querySelector('[data-prts-session-lifeline]')
        }
        markSidebarNode(row, 'data-prts-session-row', next)
        if (state) {
          row.setAttribute('data-prts-session-state', state)
          next.add(row)
        } else {
          row.removeAttribute('data-prts-session-state')
        }
        row.dataset.prtsSessionIndex = sessionIndex
        const title = resolveRowTitle(row, 'session', controls.actions)
        markSidebarNode(title, 'data-prts-row-title', next)
        markSidebarNode(resolveSessionTime(row, title, controls.actions), 'data-prts-session-time', next)
        if (title) title.dataset.prtsSessionIndex = sessionIndex
        row.toggleAttribute('data-prts-row-menu-open', controls.menu?.getAttribute('aria-expanded') === 'true'
          || row.classList.contains('menuOpen'))
        markSidebarNode(controls.actions, 'data-prts-session-actions', next)
        for (const action of controls.quickActions ?? []) markSidebarNode(action, 'data-prts-session-quick-actions', next)
        markSidebarNode(controls.anchor, 'data-prts-session-menu-anchor', next)
        markSidebarNode(controls.menu, 'data-prts-session-menu', next)
        registerVector(controls.menu, { kind: 'button' }, next, nextVectorOwners)
      }
      syncSummary(root, next)
    } else {
      preview.stop()
      clearSummaryEffects()
      summaryRoot?.remove()
      summaryRoot = undefined
      summarySignature = ''
    }
    lifelineAnimator.setTarget(activeLifelineRow, activeLifeline)
    for (const node of owned) {
      if (next.has(node)) continue
      if (node.hasAttribute?.('data-prts-owned-projection')
        || node.hasAttribute?.('data-prts-owned-facility')
        || node.hasAttribute?.('data-prts-owned-facility-spine')
        || node.hasAttribute?.('data-prts-owned-facility-vector')) {
        node.remove()
        continue
      }
      for (const attribute of OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
    }
    syncVectorOwners(nextVectorOwners)
    owned = next
  }

  function clear() {
    preview.stop()
    clearSummaryEffects()
    lifelineAnimator.setTarget(undefined, undefined)
    for (const node of document?.querySelectorAll?.('[data-prts-owned-projection], [data-prts-owned-facility], [data-prts-owned-facility-spine], [data-prts-owned-facility-vector], [data-prts-owned-facility-defs]') ?? []) node.remove()
    for (const node of owned) {
      for (const attribute of OWNED_ATTRIBUTES) node.removeAttribute?.(attribute)
    }
    for (const attribute of OWNED_ATTRIBUTES) {
      for (const node of document?.querySelectorAll?.(`[${attribute}]`) ?? []) node.removeAttribute(attribute)
    }
    vectorOwners.clear()
    dirtyVectors.clear()
    owned.clear()
    summaryRoot?.remove()
    summaryRoot = undefined
    summarySignature = ''
  }

  return {
    start(preferences = {}) {
      const keys = ['sessionPreview','previewOngoing','previewWarning','previewDone','previewDoubleClick', 'previewFollowOngoing', 'previewFollowWarning', 'previewReplyLimit']
      if (keys.some(key => previewPreferences[key] !== preferences[key])) preview.stop()
      previewPreferences = Object.fromEntries(keys.map(key => [key, preferences[key]]))
      if (!document) return
      lifelineAnimator.start()
      ensureFacilityTextureDefs(document)
      const ResizeObserver = window?.ResizeObserver
      if (!resizeObserver && typeof ResizeObserver === 'function') {
        resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const rect = entry.contentRect
            dirtyVectors.set(entry.target, rect ? { width: rect.width, height: rect.height } : undefined)
          }
          // ResizeObserver runs before paint. Update only the SVG geometry here so
          // the previous viewBox is never stretched across the new card width.
          flushVectors()
        })
      }
      document.addEventListener('pointerdown', dismissHeldPreview)
      document.addEventListener('keydown', dismissHeldPreview)
      scan()
      if (!statusSourcesStarted) {
        statusSourcesStarted = true
        stopSessionList = sessions?.list?.subscribe?.(queueScan) ?? (() => {})
        stopWorkspaceList = workspaces?.list?.subscribe?.(queueScan) ?? (() => {})
      }
      if (observer || !window?.MutationObserver) return
      const observationRoot = document.querySelector('[data-prts-region="sessions"]')
      if (!observationRoot) return
      observer = new window.MutationObserver(mutations => {
        if (mutations.some(mutation => !mutation.target.closest?.('[data-prts-owned-session-summary]'))) queueScan()
      })
      observer.observe(observationRoot, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['aria-expanded', 'aria-selected', 'class', 'data-state'],
      })
    },
    dispose() {
      heldPreviewState = undefined
      document?.removeEventListener('pointerdown', dismissHeldPreview)
      document?.removeEventListener('keydown', dismissHeldPreview)
      observer?.disconnect()
      observer = undefined
      stopSessionList()
      stopSessionList = () => {}
      stopWorkspaceList()
      stopWorkspaceList = () => {}
      stopSessionStatus()
      stopSessionStatus = () => {}
      sessionStatus = undefined
      statusSourcesStarted = false
      if (scanFrame !== undefined) {
        if (window?.cancelAnimationFrame) window.cancelAnimationFrame(scanFrame)
        else window?.clearTimeout?.(scanFrame)
      }
      scanFrame = undefined
      resizeObserver?.disconnect()
      resizeObserver = undefined
      if (resizeFrame !== undefined) {
        if (window?.cancelAnimationFrame) window.cancelAnimationFrame(resizeFrame)
        else window?.clearTimeout?.(resizeFrame)
      }
      resizeFrame = undefined
      lifelineAnimator.dispose()
      clear()
    },
  }
}
