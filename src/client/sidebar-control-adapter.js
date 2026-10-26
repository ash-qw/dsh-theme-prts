import { createSessionCardReveal } from './session-card-reveal.js'
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
  'data-prts-selection-target',
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

function setSidebarAttribute(node, attribute, value) {
  if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value)
}

function markSidebarNode(node, attribute, next) {
  if (!node) return
  setSidebarAttribute(node, attribute, '')
  next.add(node)
}

function resolveRowControls(row, kind) {
  const menu = row.querySelector(':scope > span > span > button[type="button"]')
  const anchor = menu?.parentElement
  // Ungrouped workspaces have a create button but no management menu.
  const actions = anchor?.parentElement ?? (kind === 'workspace'
    ? Array.from(row.children).find(node => node.matches('span') && node.querySelector(':scope > button[type="button"]'))
    : undefined)
  if (actions?.parentElement !== row) return {}
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
  setSidebarAttribute(face, 'data-prts-facility-face', kind)
  setSidebarAttribute(face, 'data-prts-facility-texture', kind === 'workspace' ? 'silhouette' : 'pickup')
  setSidebarAttribute(face, 'aria-hidden', 'true')
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
  setSidebarAttribute(spine, 'data-prts-facility-spine', kind)
  setSidebarAttribute(spine, 'aria-hidden', 'true')
  next.add(spine)
  return spine
}


function createRunningMarker(document) {
  const svgNode = name => document.createElementNS('http://www.w3.org/2000/svg', name)
  const marker = svgNode('g')
  marker.setAttribute('data-prts-running-marker', '')
  const letter = svgNode('text')
  letter.setAttribute('x', '12')
  letter.setAttribute('y', '16')
  letter.textContent = 'A'
  const ring = svgNode('circle')
  for (const [key, value] of Object.entries({cx:12, cy:12, r:10, 'stroke-dasharray':'4.5 11.208'})) ring.setAttribute(key, value)
  marker.append(letter, ring)
  return marker
}

export function createSidebarControlAdapter({ document, window, sessions, workspaces, getSessionStatus, getUiWorkspace, getUiConversation, getSessions, getWorkspaces }) {
  let previewPreferences = {}
  let adapterActive = false, sourceRetryTimer
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
  let sourceSummarySignature = ''
  let heldPreviewState
  let hoveredSummary, summaryLeaveTimer
  let summaryDismissed = false, pointerLeftSummary = false
  function resumeSummaryHover(event) {
    if (!summaryDismissed) return
    const trigger = event.target.closest?.('[data-prts-session-summary-trigger]')
    if (!trigger || !summaryRoot?.contains(trigger)) { pointerLeftSummary = true; return }
    if (!pointerLeftSummary) return
    summaryDismissed = false
    summaryRoot.removeAttribute('data-prts-summary-dismissed')
    document.removeEventListener('pointermove', resumeSummaryHover)
    keepSummaryHover(trigger.closest('[data-prts-session-summary-group]'))
  }
  function closeNavigationPreview() {
    heldPreviewState = undefined
    preview.stop()
    clearSummaryHover()
    summaryDismissed = true
    pointerLeftSummary = false
    summaryRoot?.setAttribute('data-prts-summary-dismissed', '')
    for (const group of summaryRoot?.querySelectorAll('[data-prts-session-summary-group]') ?? []) group.removeAttribute('data-prts-preview-open')
    document.addEventListener('pointermove', resumeSummaryHover)
  }
  function clearSummaryHover() {
    window.clearTimeout(summaryLeaveTimer)
    hoveredSummary?.removeAttribute('data-prts-summary-hover-open')
    hoveredSummary?.removeAttribute('data-prts-summary-instant')
    hoveredSummary = undefined
  }
  function keepSummaryHover(group) {
    if (summaryDismissed) return
    window.clearTimeout(summaryLeaveTimer)
    if (!hoveredSummary) group.removeAttribute('data-prts-summary-instant')
    if (hoveredSummary && hoveredSummary !== group) {
      hoveredSummary.setAttribute('data-prts-summary-instant', '')
      hoveredSummary.removeAttribute('data-prts-summary-hover-open')
      group.setAttribute('data-prts-summary-instant', '')
    }
    hoveredSummary = group
    group.setAttribute('data-prts-summary-hover-open', '')
  }
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
  function clearSummaryEffects() { clearSummaryHover(); preview.stop(false); for (const entry of summaryGroups.values()) entry.dispose(); for (const stop of stopTitles.values()) stop(); stopTitles.clear(); summaryGroups.clear() }
  let owned = new Set()
  let vectorOwners = new Set()
  const dirtyVectors = new Map()
  const vectorSizes = new WeakMap()
  const lifelineAnimator = createSessionLifelineAnimator({ document, window })

  let subscribedSessions, subscribedWorkspaces
  function disconnectSummarySources() {
    statusSourcesStarted = false
    window.clearTimeout(sourceRetryTimer)
    sourceRetryTimer = undefined
    stopSessionList()
    stopWorkspaceList()
    stopSessionStatus()
    stopSessionList = stopWorkspaceList = stopSessionStatus = () => {}
    subscribedSessions = subscribedWorkspaces = sessionStatus = undefined
    if (getSessions) sessions = undefined
    if (getWorkspaces) workspaces = undefined
    cancelReveal()
    cancelPendingNavigation()
    clearSelectionTarget()
    heldPreviewState = undefined
    summaryDismissed = false
    document?.removeEventListener('pointermove', resumeSummaryHover)
    document?.removeEventListener('pointerdown', dismissHeldPreview)
    document?.removeEventListener('keydown', dismissHeldPreview)
    preview.stop()
  }
  function syncSummarySources() {
    if (previewPreferences.sessionPreview === false) {
      if (statusSourcesStarted) disconnectSummarySources()
      return
    }
    if (!statusSourcesStarted) {
      statusSourcesStarted = true
      document.addEventListener('pointerdown', dismissHeldPreview)
      document.addEventListener('keydown', dismissHeldPreview)
    }
    connectSummarySources()
    connectSessionStatus()
    const waiting = (getSessions && !subscribedSessions) || (getWorkspaces && !subscribedWorkspaces)
      || (getSessionStatus && !sessionStatus)
    if (waiting && sourceRetryTimer === undefined) {
      sourceRetryTimer = window.setTimeout(() => { sourceRetryTimer = undefined; queueScan() }, 250)
    } else if (!waiting) {
      window.clearTimeout(sourceRetryTimer)
      sourceRetryTimer = undefined
    }
  }
  function onSummarySourceChange() {
    // Streaming activity often republishes unchanged title/status summaries.
    // Native DOM mutations still handle row mounts, selection and hierarchy.
    const signature = JSON.stringify(visibleSessionSummaries(sessions, workspaces, sessionStatus))
    if (signature === sourceSummarySignature && !pendingReveal) return
    sourceSummarySignature = signature
    queueScan()
  }
  function connectSummarySources() {
    if (getSessions) sessions = getSessions()
    if (getWorkspaces) workspaces = getWorkspaces()
    if (subscribedSessions !== sessions?.list) {
      stopSessionList()
      subscribedSessions = sessions?.list
      stopSessionList = subscribedSessions?.subscribe?.(onSummarySourceChange) ?? (() => {})
    }
    if (subscribedWorkspaces !== workspaces?.list) {
      stopWorkspaceList()
      subscribedWorkspaces = workspaces?.list
      stopWorkspaceList = subscribedWorkspaces?.subscribe?.(onSummarySourceChange) ?? (() => {})
    }
  }
  function connectSessionStatus() {
    const source = getSessionStatus?.()
    if (source === sessionStatus) return
    stopSessionStatus()
    sessionStatus = source
    stopSessionStatus = source?.subscribe?.(onSummarySourceChange) ?? (() => {})
  }

  let selectionTarget, selectionTargetTimer
  function clearSelectionTarget() {
    selectionTarget = undefined
    window.clearTimeout(selectionTargetTimer)
    document?.removeEventListener('pointerdown', interruptSelectionTarget, true)
    queueScan()
  }
  function interruptSelectionTarget(event) {
    if (event.target.closest?.('[data-prts-session-row]')) {
      cancelPendingNavigation()
      cancelReveal()
      clearSelectionTarget()
    }
  }
  function setSelectionTarget(id) {
    clearSelectionTarget()
    selectionTarget = id
    selectionTargetTimer = window.setTimeout(clearSelectionTarget, 4000)
    document.addEventListener('pointerdown', interruptSelectionTarget, true)
  }

  let pendingReveal, revealTimer
  let navigationFrame, navigationGeneration = 0
  function cancelPendingNavigation() {
    navigationGeneration++
    window.cancelAnimationFrame?.(navigationFrame)
  }
  function cancelReveal() {
    pendingReveal?.tracker?.cancel()
    pendingReveal = undefined
    window.clearTimeout(revealTimer)
    for (const type of ['wheel','touchmove','pointerdown','keydown']) document.removeEventListener(type, interruptReveal, true)
  }
  function interruptReveal(event) {
    if (!event.target?.closest?.('[data-prts-region="sessions"]')) return
    if (event.type === 'keydown' && !['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) return
    cancelPendingNavigation()
    cancelReveal()
    clearSelectionTarget()
  }
  function revealSessionCard(sessionId, onDone) {
    pendingReveal?.tracker?.interrupt()
    cancelReveal()
    pendingReveal = {sessionId, onDone}
    revealTimer = window.setTimeout(finishReveal, 4000)
    for (const type of ['wheel','touchmove','pointerdown','keydown']) document.addEventListener(type, interruptReveal, {capture:true, passive:true})
    const root = document?.querySelector?.('[data-prts-region="sessions"] [data-slot="sidebar.workspaces"]')
    syncSessionReveal(root)
    queueScan()
    return Boolean(pendingReveal?.expanding)
  }
  function finishReveal() {
    const onDone = pendingReveal?.onDone
    cancelReveal()
    onDone?.()
  }
  function syncSessionReveal(root) {
    if (!pendingReveal || !root) return
    const {sessionId} = pendingReveal
    const rows = Array.from(root.querySelectorAll('[data-row-key], [data-session-id]'))
    const row = rows.find(el => el.getAttribute('data-row-key') === `session:${sessionId}`
      || el.getAttribute('data-session-id') === sessionId)
    if (row) {
      if (!pendingReveal.tracker) {
        const request = pendingReveal
        request.tracker = createSessionCardReveal({window, root, sessionId, onStart: () => window.clearTimeout(revealTimer), onDone: () => {
          if (pendingReveal === request) finishReveal()
        }})
      }
      return
    }
    const items = snapshotOf(workspaces?.list)?.items ?? []
    const owner = items.find(item => item.sessionIds?.includes(sessionId))
    const key = owner?.workspaceId ?? ''
    const keyed = key => rows.find(el => el.getAttribute('data-row-key') === key)
    const group = keyed(`workspace:${key}`)
    if (group?.getAttribute('aria-expanded') === 'false') { pendingReveal.expanding = true; group.click(); return }
    if (!group && owner?.path) {
      // Nested workspaces may not mount until their visible ancestor is expanded.
      const path = value => value?.replace(/\\/g, '/').replace(/\/$/, '')
      const target = path(owner.path)
      const ancestors = items.filter(item => item !== owner && item.path && target.startsWith(path(item.path) + '/'))
        .sort((a,b) => b.path.length - a.path.length)
      for (const ancestor of ancestors) {
        const parent = keyed(`workspace:${ancestor.workspaceId}`)
        if (parent?.getAttribute('aria-expanded') === 'false') { pendingReveal.expanding = true; parent.click(); return }
      }
    }
    const overflow = keyed(`overflow:${key}`)
    if (overflow?.getAttribute('aria-expanded') === 'false') { pendingReveal.expanding = true; overflow.click() }
  }

  function openSession(sessionId) {
    closeNavigationPreview()
    cancelPendingNavigation()
    setSelectionTarget(sessionId)
    const generation = navigationGeneration
    const navigate = () => {
      if (generation !== navigationGeneration || !adapterActive) return
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
      if (row) row.click?.()
      else clearSelectionTarget()
    }
    // Finish sidebar motion first, then paint its final position before the host can block.
    revealSessionCard(sessionId, () => {
      if (generation !== navigationGeneration || !adapterActive) return
      setSelectionTarget(sessionId)
      navigationFrame = window.requestAnimationFrame(() => {
        if (generation !== navigationGeneration) return
        navigationFrame = window.requestAnimationFrame(navigate)
      })
    })
  }

  function statusSignal(document, state) {
    const signal = state === 'ongoing'
      ? document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      : document.createElement('span')
    if (state === 'ongoing') {
      signal.setAttribute('viewBox', '0 0 24 24')
      signal.append(createRunningMarker(document))
    }
    signal.setAttribute('data-prts-session-summary-signal', state)
    signal.setAttribute('aria-hidden', 'true')
    return signal
  }

  function buildSummaryGroup(state, label, items) {
    const group = document.createElement('span')
    group.setAttribute('data-prts-session-summary-group', state)
    const deferHoverClose = () => {
      window.clearTimeout(summaryLeaveTimer)
      summaryLeaveTimer = window.setTimeout(() => { if (hoveredSummary === group) clearSummaryHover() }, 350)
    }
    group.addEventListener('pointerenter', () => keepSummaryHover(group))
    group.addEventListener('pointerleave', deferHoverClose)

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
    trigger.addEventListener('focus', () => {
      if (trigger.matches(':focus-visible')) {
        summaryDismissed = false
        summaryRoot?.removeAttribute('data-prts-summary-dismissed')
        document.removeEventListener('pointermove', resumeSummaryHover)
      }
      enterPreviewState(state)
    })

    const popover = document.createElement('span')
    popover.setAttribute('data-prts-session-summary-popover', state)
    popover.setAttribute('role', 'menu')
    popover.setAttribute('popover', 'manual')
    popover.setAttribute('aria-label', label)
    // The popover lives in the browser top layer; crossing into it can leave
    // the trigger's hit area even though it remains a DOM descendant.
    popover.addEventListener('pointerenter', () => keepSummaryHover(group))
    popover.addEventListener('pointerleave', deferHoverClose)
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
    const spaceNotice = document.createElement('div')
    spaceNotice.setAttribute('data-prts-summary-space-notice', '')
    spaceNotice.textContent = '空间不足，无法显示会话预览。建议扩大窗口，或在辅助功能中关闭预览。'
    popover.append(spaceNotice)
    let boundsFrame
    const checkBounds = () => {
      window.cancelAnimationFrame(boundsFrame)
      boundsFrame = undefined
      if (!group.isConnected) return
      // Escape the host sidebar's clipped region without changing its layout.
      if (typeof popover.showPopover === 'function' && !popover.matches(':popover-open')) popover.showPopover()
      const header = group.closest('[data-prts-session-summary-header]')?.getBoundingClientRect()
      if (!header) return
      Object.assign(popover.style, {position:'fixed', boxSizing:'border-box', margin:'0', left:header.left+'px',
        width:header.width+'px', right:'auto', bottom:'auto'})
      popover.removeAttribute('data-prts-summary-no-space')
      popover.removeAttribute('data-prts-summary-no-room')
      const viewport = window.visualViewport
      const left = viewport?.offsetLeft ?? 0, top = viewport?.offsetTop ?? 0
      const right = left + (viewport?.width ?? window.innerWidth) - 8
      const bottom = top + (viewport?.height ?? window.innerHeight) - 8
      const fits = rect => rect.left >= left + 8 && rect.top >= top + 8 && rect.right <= right && rect.bottom <= bottom
      // Measure the final layout, independent of the opening transform animation.
      const place = () => {
        popover.removeAttribute('data-prts-summary-above')
        const parent = header
        const rect = popover.getBoundingClientRect()
        const height = popover.offsetHeight
        const below = parent.bottom + 6
        const above = parent.top - 6 - height
        const candidate = y => ({left: rect.left, right: rect.right, top: y, bottom: y + height})
        popover.style.top = below + 'px'
        if (fits(candidate(below))) return true
        popover.setAttribute('data-prts-summary-above', '')
        if (fits(candidate(above))) { popover.style.top = above + 'px'; return true }
        popover.removeAttribute('data-prts-summary-above')
        return false
      }
      if (place()) { trigger.removeAttribute('title'); return }
      popover.setAttribute('data-prts-summary-no-space', '')
      trigger.title = spaceNotice.textContent
      if (!place()) popover.setAttribute('data-prts-summary-no-room', '')
    }
    const scheduleBounds = () => {
      if (boundsFrame === undefined) boundsFrame = window.requestAnimationFrame(checkBounds)
    }
    const boundsObserver = window.ResizeObserver ? new window.ResizeObserver(scheduleBounds) : undefined
    boundsObserver?.observe(popover)
    // Re-entering the trigger need not re-enter its group (the list is a descendant).
    // Run after enterPreviewState so measurement sees the current status list.
    trigger.addEventListener('pointerenter', checkBounds)
    trigger.addEventListener('focus', checkBounds)
    window.addEventListener('resize', scheduleBounds)
    document.addEventListener('scroll', scheduleBounds, true)
    window.visualViewport?.addEventListener('resize', scheduleBounds)
    window.visualViewport?.addEventListener('scroll', scheduleBounds)
    const entries = new Map()
    const update = items => {
      scheduleBounds()
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
        if (summaryDismissed) return
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
      boundsObserver?.disconnect()
      window.cancelAnimationFrame(boundsFrame)
      window.removeEventListener('resize', scheduleBounds)
      document.removeEventListener('scroll', scheduleBounds, true)
      window.visualViewport?.removeEventListener('resize', scheduleBounds)
      window.visualViewport?.removeEventListener('scroll', scheduleBounds)
      for (const {button} of entries.values()) { stopTitles.get(button)?.(); stopTitles.delete(button) }
      if (hoveredSummary === group) clearSummaryHover()
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
    summaryRoot.toggleAttribute('data-prts-summary-dismissed', summaryDismissed)
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
    if (!adapterActive || scanFrame !== undefined) return
    const requestFrame = window?.requestAnimationFrame?.bind(window) ?? (callback => window?.setTimeout?.(callback, 0))
    scanFrame = requestFrame(() => {
      scanFrame = undefined
      scan()
    })
  }

  function scan() {
    if (!adapterActive) return
    syncSummarySources()
    sourceSummarySignature = JSON.stringify(visibleSessionSummaries(sessions, workspaces, sessionStatus))
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
      const rowSessionId = row => row.getAttribute('data-session-id') || row.getAttribute('data-row-key')?.replace(/^session:/, '')
      if (selectionTarget && Array.from(root.querySelectorAll('[role="treeitem"][aria-selected="true"]')).some(row => rowSessionId(row) === selectionTarget)) clearSelectionTarget()
      let sessionOrdinal = 0
      for (const row of root.querySelectorAll('div[role="treeitem"][aria-selected]')) {
        const sessionIndex = String(++sessionOrdinal).padStart(2, '0')
        const controls = resolveRowControls(row, 'session')
        const state = nativeSessionState(row)
        const spinner = state === 'ongoing' ? row.querySelector('svg[data-state="ongoing"]') : undefined
        if (spinner) {
          let marker = spinner.querySelector('[data-prts-running-marker]')
          if (!marker) {
            marker = createRunningMarker(document)
            spinner.append(marker)
          }
          next.add(marker)
        }

        const face = ensureFacilityFace(document, row, 'session', next)
        const spine = ensureFacilitySpine(document, row, 'session', next)
        registerVector(face, { kind: 'face', topNotch: true, sessionNotch: true, texture: 'pickup' }, next, nextVectorOwners)
        registerVector(spine, { kind: 'spine' }, next, nextVectorOwners)
        const selected = selectionTarget ? rowSessionId(row) === selectionTarget : row.getAttribute('aria-selected') === 'true'
        if (selectionTarget) row.setAttribute('data-prts-selection-target', String(selected))
        else row.removeAttribute('data-prts-selection-target')
        if (!activeLifelineRow && selected) {
          activeLifelineRow = row
          activeLifeline = face.querySelector('[data-prts-session-lifeline]')
        }
        markSidebarNode(row, 'data-prts-session-row', next)
        if (state) {
          setSidebarAttribute(row, 'data-prts-session-state', state)
          next.add(row)
        } else {
          row.removeAttribute('data-prts-session-state')
        }
        setSidebarAttribute(row, 'data-prts-session-index', sessionIndex)
        const title = resolveRowTitle(row, 'session', controls.actions)
        markSidebarNode(title, 'data-prts-row-title', next)
        markSidebarNode(resolveSessionTime(row, title, controls.actions), 'data-prts-session-time', next)
        if (title) setSidebarAttribute(title, 'data-prts-session-index', sessionIndex)
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
      if (node.hasAttribute?.('data-prts-running-marker')
        || node.hasAttribute?.('data-prts-owned-projection')
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
    syncSessionReveal(root)
  }

  function clear() {
    preview.stop()
    clearSummaryEffects()
    lifelineAnimator.setTarget(undefined, undefined)
    for (const node of document?.querySelectorAll?.('[data-prts-running-marker], [data-prts-owned-projection], [data-prts-owned-facility], [data-prts-owned-facility-spine], [data-prts-owned-facility-vector], [data-prts-owned-facility-defs]') ?? []) node.remove()
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
      const keys = ['sessionPreview','previewOngoing','previewTools','previewWarning','previewDone','previewDoubleClick', 'previewFollowOngoing', 'previewFollowWarning', 'previewReplyLimit']
      if (keys.some(key => previewPreferences[key] !== preferences[key])) preview.stop()
      previewPreferences = Object.fromEntries(keys.map(key => [key, preferences[key]]))
      if (!document) return
      adapterActive = true
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
      scan()
      if (observer || !window?.MutationObserver) return
      const observationRoot = document.querySelector('[data-prts-region="sessions"]')
      if (!observationRoot) return
      observer = new window.MutationObserver(mutations => {
        const relevant = mutations.filter(mutation => !mutation.target.closest?.('[data-prts-owned-session-summary]'))
        const freshRow = 'div[role="treeitem"]:not([data-prts-session-row]):not([data-prts-workspace-row])'
        const mountsRows = relevant.some(mutation => mutation.type === 'childList'
          && Array.from(mutation.addedNodes).some(node => node.nodeType === 1
            && (node.matches(freshRow) || node.querySelector(freshRow))))
        if (mountsRows) {
          // React has mounted expanded rows. Finish theme geometry before their first paint.
          window.cancelAnimationFrame?.(scanFrame)
          scanFrame = undefined
          scan()
          flushVectors()
        } else if (relevant.length) queueScan()
      })
      observer.observe(observationRoot, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['aria-expanded', 'aria-selected', 'class', 'data-state'],
      })
    },
    dispose() {
      adapterActive = false
      disconnectSummarySources()
      cancelReveal()
      document.removeEventListener('pointermove', resumeSummaryHover)
      summaryDismissed = false
      heldPreviewState = undefined
      document?.removeEventListener('pointerdown', dismissHeldPreview)
      document?.removeEventListener('keydown', dismissHeldPreview)
      observer?.disconnect()
      observer = undefined
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
