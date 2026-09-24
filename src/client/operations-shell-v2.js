import { createThemeSettingsOverlay, themeSettingsMarkup } from './theme-settings-workbench.js'
import { createResizeShieldAdapter } from './resize-shield-adapter.js'

const PHONE_RAIL_BREAKPOINT = 640
const RAIL_HOLD_DELAY_MS = 350
const RAIL_HOLD_MOVE_TOLERANCE = 8
const RAIL_SWIPE_THRESHOLD = 32
const RAIL_SWIPE_AXIS_RATIO = 1.25

function setText(root, selector, value) {
  const node = root?.querySelector(selector)
  const next = String(value ?? '')
  if (node && node.textContent !== next) node.textContent = next
}

function markup(emblem) {
  return `<div data-prts-shell data-plugin="dsh-theme-prts">
    <button type="button" data-prts-rail-launcher aria-label="打开 P.R.T.S. 导航" aria-controls="prts-nav-rail" aria-expanded="false"><span aria-hidden="true">P.R.T.S.</span><i data-prts-rail-gesture-cue aria-hidden="true">⌄<br>⌄</i></button>
    <nav id="prts-nav-rail" data-prts-nav-rail aria-label="P.R.T.S. 导航">
      <button type="button" data-prts-rail-brand aria-label="P.R.T.S. 终端设置" aria-controls="prts-theme-settings" aria-expanded="false">${emblem || ''}<span>P.R.T.S.</span></button>
      <div data-prts-nav-bottom>
        <div data-prts-connection-indicator data-state="unknown" tabindex="0" role="status" aria-label="Harness 主机连接状态：未知">
          <i aria-hidden="true"></i><span data-prts-connection-label>未知</span>
        </div>
        <button type="button" data-prts-scheme-toggle aria-label="切换明暗模式">
          <svg data-prts-scheme-icon="light" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path></svg>
          <svg data-prts-scheme-icon="dark" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.4A8.4 8.4 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z"></path></svg>
          <small>明暗</small>
        </button>
        <button type="button" data-prts-theme-disable aria-label="退出 P.R.T.S.，返回 Harness 原生界面">
          <svg data-prts-theme-disable-icon viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8"></path><path d="M7.1 6.8a7 7 0 1 0 9.8 0"></path></svg>
          <small>退出 P.R.T.S.</small>
        </button>
      </div>
    </nav>
    ${themeSettingsMarkup()}
  </div>`
}

export function createOperationsShell({
  document,
  window,
  assets = {},
  adapter,
  hostGeometry,
  onSchemeToggle = () => {},
  onSchemeDragStart = () => undefined,
  onThemeDisable = () => {},
  onPreferenceChange = () => {},
  onPreferencePreview = () => {},
  onVisualReset = () => {},
  onRetrySave = () => {},
}) {
  const root = document.documentElement
  const resizeShield = createResizeShieldAdapter({ window })
  let shell
  let navRail
  let railLauncher
  let railMode
  let railViewport
  let railDefaultHidden = false
  let railViewportQuery
  let railPointerQuery
  let railHoverQuery
  let railPointer
  let railHoldTimer
  let settingsOverlay
  let schemeToggle
  let schemeIntent
  let schemePressRevision = 0
  let schemePressAnimation
  let schemePointer
  let suppressSchemeClick = false
  let suppressSchemeClickTimer
  let themeDisable
  let connectionIndicator
  let conversationObserver
  let schemeObserver
  let operationRegion
  const schemePressDelays = new Set()

  function reducedMotion() {
    if (root.dataset.prtsMotion === 'reduced') return true
    try { return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true } catch { return false }
  }

  function phoneRailGesture() {
    if (railMode !== 'overlay' || Number(window.innerWidth) > PHONE_RAIL_BREAKPOINT) return false
    return railPointerQuery?.matches === true
      || railHoverQuery?.matches === true
      || Number(window.navigator?.maxTouchPoints) > 0
  }

  function clearRailGesture({ release = true } = {}) {
    if (railHoldTimer !== undefined) window.clearTimeout(railHoldTimer)
    railHoldTimer = undefined
    const pointer = railPointer
    railPointer = undefined
    if (release && pointer) {
      try { railLauncher?.releasePointerCapture?.(pointer.pointerId) } catch {}
    }
    railLauncher?.removeAttribute('data-prts-rail-gesture-active')
    railLauncher?.removeAttribute('data-prts-rail-gesture-ready')
    railLauncher?.style?.removeProperty('--prts-rail-gesture-progress')
  }

  function armRailGesture() {
    railHoldTimer = undefined
    if (!railPointer || !phoneRailGesture()) return
    railPointer.armed = true
    railLauncher?.setAttribute('data-prts-rail-gesture-active', '')
  }

  function onRailPointerDown(event) {
    if (!phoneRailGesture() || railPointer || (event.button ?? 0) !== 0) return
    const pointerId = event.pointerId ?? 1
    railPointer = {
      pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      armed: false,
      ready: false,
    }
    try { railLauncher?.setPointerCapture?.(pointerId) } catch {}
    railHoldTimer = window.setTimeout(armRailGesture, RAIL_HOLD_DELAY_MS)
  }

  function onRailPointerMove(event) {
    const pointer = railPointer
    if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
    const deltaX = (Number(event.clientX) || 0) - pointer.startX
    const deltaY = (Number(event.clientY) || 0) - pointer.startY
    if (!pointer.armed) {
      if (Math.hypot(deltaX, deltaY) > RAIL_HOLD_MOVE_TOLERANCE) clearRailGesture()
      return
    }
    event.preventDefault?.()
    if (Math.abs(deltaX) > Math.max(RAIL_HOLD_MOVE_TOLERANCE, Math.max(0, deltaY) / RAIL_SWIPE_AXIS_RATIO)) {
      clearRailGesture()
      return
    }
    const progress = Math.min(1, Math.max(0, deltaY) / RAIL_SWIPE_THRESHOLD)
    pointer.ready = deltaY >= RAIL_SWIPE_THRESHOLD
      && deltaY >= Math.abs(deltaX) * RAIL_SWIPE_AXIS_RATIO
    railLauncher?.style?.setProperty('--prts-rail-gesture-progress', Math.round(progress * 12) + 'px')
    railLauncher?.toggleAttribute('data-prts-rail-gesture-ready', pointer.ready)
  }

  function onRailPointerUp(event) {
    const pointer = railPointer
    if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
    const shouldOpen = pointer.armed && pointer.ready
    clearRailGesture()
    if (shouldOpen) openRail()
  }

  function onRailLostPointerCapture(event) {
    if (!railPointer || (event.pointerId ?? 1) !== railPointer.pointerId) return
    clearRailGesture({ release: false })
  }

  function onRailClick(event) {
    if (phoneRailGesture() && Number(event?.detail) > 0) {
      event.preventDefault?.()
      return
    }
    toggleRail()
  }

  function playSchemePress() {
    if (!schemeToggle || reducedMotion()) return
    const revision = ++schemePressRevision
    schemePressAnimation?.cancel?.()
    schemePressAnimation = undefined
    schemeToggle.removeAttribute('data-prts-scheme-press')

    if (typeof schemeToggle.animate === 'function') {
      const animation = schemeToggle.animate([
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(0) scale(.96)', offset: 0.5 },
        { transform: 'translateY(0) scale(1)' },
      ], { duration: 100, easing: 'cubic-bezier(.22, 1, .36, 1)' })
      schemePressAnimation = animation
      Promise.resolve(animation.finished).catch(() => {}).finally(() => {
        if (revision === schemePressRevision && schemePressAnimation === animation) schemePressAnimation = undefined
      })
      return
    }

    schemeToggle.setAttribute('data-prts-scheme-press', '')
    const entry = { timer: undefined }
    entry.timer = window.setTimeout(() => {
      schemePressDelays.delete(entry)
      if (revision === schemePressRevision) schemeToggle?.removeAttribute('data-prts-scheme-press')
    }, 100)
    schemePressDelays.add(entry)
  }

  function clearSchemePressDelays() {
    schemePressRevision += 1
    schemePressAnimation?.cancel?.()
    schemePressAnimation = undefined
    schemeToggle?.removeAttribute('data-prts-scheme-press')
    for (const entry of schemePressDelays) {
      window.clearTimeout(entry.timer)
    }
    schemePressDelays.clear()
  }

  function schemeTarget() {
    const current = schemeIntent ?? (root.dataset.prtsScheme === 'dark' ? 'dark' : 'light')
    return current === 'dark' ? 'light' : 'dark'
  }

  function schemeOrigin() {
    const rect = schemeToggle?.getBoundingClientRect?.()
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : undefined
  }

  function syncConversationState() {
    if (!operationRegion) return
    const candidate = operationRegion.querySelector(
      '[data-chat-flow-kind]:not([hidden]):not([aria-hidden="true"]), [data-message-role]:not([hidden]):not([aria-hidden="true"])',
    )
    const active = Boolean(candidate)
    root.dataset.prtsConversationState = active ? 'active' : 'idle'
  }

  function toggleScheme(event) {
    if (suppressSchemeClick && Number(event?.detail) > 0) {
      event?.preventDefault?.()
      clearSchemeClickSuppression()
      return
    }
    clearSchemeClickSuppression()
    const next = schemeTarget()
    schemeIntent = next
    playSchemePress()
    let request
    try { request = onSchemeToggle(next, { origin: schemeOrigin() }) } catch { request = undefined }
    Promise.resolve(request).catch(() => {}).finally(() => {
      if (schemeIntent === next) schemeIntent = undefined
    })
  }

  function schemePointerProgress(event) {
    const width = Math.max(1, Number(window.innerWidth) || Number(root.clientWidth) || 1)
    return Math.min(1, Math.max(0, Number(event?.clientX) / width || 0))
  }

  function clearSchemeClickSuppression() {
    if (suppressSchemeClickTimer !== undefined) window.clearTimeout(suppressSchemeClickTimer)
    suppressSchemeClickTimer = undefined
    suppressSchemeClick = false
  }

  function suppressNextSchemeClick() {
    clearSchemeClickSuppression()
    suppressSchemeClick = true
    suppressSchemeClickTimer = window.setTimeout(() => {
      suppressSchemeClickTimer = undefined
      suppressSchemeClick = false
    }, 1000)
  }

  function settleSchemePointer({ commit = false } = {}) {
    const pointer = schemePointer
    if (!pointer) return
    schemePointer = undefined
    try { schemeToggle?.releasePointerCapture?.(pointer.pointerId) } catch {}
    if (!pointer.dragging) return
    suppressNextSchemeClick()
    let result
    try { result = pointer.gesture?.finish?.(commit) } catch { result = undefined }
    Promise.resolve(result).catch(() => {}).finally(() => {
      if (schemeIntent === pointer.target) schemeIntent = undefined
    })
  }

  function onSchemePointerDown(event) {
    if ((event.button ?? 0) !== 0 || schemePointer) return
    clearSchemeClickSuppression()
    const pointerId = event.pointerId ?? 1
    schemePointer = {
      pointerId,
      startX: Number(event.clientX) || 0,
      startY: Number(event.clientY) || 0,
      target: schemeTarget(),
      origin: schemeOrigin(),
      dragging: false,
      gesture: undefined,
    }
    try { schemeToggle?.setPointerCapture?.(pointerId) } catch {}
  }

  function onSchemePointerMove(event) {
    const pointer = schemePointer
    if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
    const deltaX = (Number(event.clientX) || 0) - pointer.startX
    if (!pointer.dragging) {
      if (deltaX < 8) return
      pointer.dragging = true
      schemeIntent = pointer.target
      playSchemePress()
      const progress = schemePointerProgress(event)
      try {
        pointer.gesture = onSchemeDragStart(pointer.target, {
          origin: pointer.origin,
          progress,
          clientX: Number(event.clientX) || 0,
        })
      } catch {
        pointer.gesture = undefined
      }
    }
    event.preventDefault?.()
    pointer.gesture?.update?.(schemePointerProgress(event))
  }

  function onSchemePointerUp(event) {
    const pointer = schemePointer
    if (!pointer || (event.pointerId ?? 1) !== pointer.pointerId) return
    const commit = pointer.dragging && schemePointerProgress(event) >= .5
    settleSchemePointer({ commit })
  }

  function cancelSchemePointer() {
    const pointer = schemePointer
    if (!pointer) return
    if (pointer.dragging) {
      try { pointer.gesture?.cancel?.() } catch {}
    }
    schemePointer = undefined
    try { schemeToggle?.releasePointerCapture?.(pointer.pointerId) } catch {}
    if (pointer.dragging) suppressNextSchemeClick()
    if (schemeIntent === pointer.target) schemeIntent = undefined
  }

  function onSchemeLostPointerCapture(event) {
    if (!schemePointer || (event.pointerId ?? 1) !== schemePointer.pointerId) return
    cancelSchemePointer()
  }

  function syncSchemeToggle() {
    if (!schemeToggle) return
    const current = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
    if (schemeIntent === current) schemeIntent = undefined
    schemeToggle.dataset.prtsSchemeCurrent = current
    schemeToggle.setAttribute('aria-label', current === 'dark' ? '切换到日间模式' : '切换到夜间模式')
  }

  function syncRailState() {
    if (!navRail || !railLauncher) return
    const overlay = railMode === 'overlay'
    const open = overlay && root.hasAttribute('data-prts-rail-open')
    railLauncher.setAttribute('aria-expanded', String(open))
    const closedLabel = phoneRailGesture() ? '长按并向下滑动打开 P.R.T.S. 导航' : '打开 P.R.T.S. 导航'
    railLauncher.setAttribute('aria-label', open ? '关闭 P.R.T.S. 导航' : closedLabel)
    if (overlay && !open) {
      navRail.setAttribute('aria-hidden', 'true')
      navRail.setAttribute('inert', '')
    } else {
      navRail.removeAttribute('aria-hidden')
      navRail.removeAttribute('inert')
    }
  }

  function closeRail({ returnFocus = false } = {}) {
    if (railMode !== 'overlay') return
    const wasOpen = root.hasAttribute('data-prts-rail-open')
    root.removeAttribute('data-prts-rail-open')
    syncRailState()
    if (returnFocus && wasOpen) railLauncher?.focus?.()
  }

  function openRail() {
    if (railMode !== 'overlay') return
    root.setAttribute('data-prts-rail-open', '')
    syncRailState()
    const focusFirst = () => {
      if (root.hasAttribute('data-prts-rail-open')) navRail?.querySelector('button')?.focus?.()
    }
    if (window?.requestAnimationFrame) window.requestAnimationFrame(focusFirst)
    else window?.setTimeout?.(focusFirst, 0)
  }

  function setRailViewport(width = window.innerWidth, { forceClose = false } = {}) {
    const nextViewport = Number(width) >= 1180 ? 'wide' : 'narrow'
    const viewportChanged = nextViewport !== railViewport
    const nextMode = railDefaultHidden || nextViewport === 'narrow' ? 'overlay' : 'docked'
    const modeChanged = nextMode !== railMode
    if (!viewportChanged && !modeChanged && !forceClose) return railMode
    railViewport = nextViewport
    railMode = nextMode
    clearRailGesture()
    root.dataset.prtsRailMode = nextMode
    root.removeAttribute('data-prts-rail-open')
    syncRailState()
    return nextMode
  }

  function toggleRail() {
    if (root.hasAttribute('data-prts-rail-open')) closeRail()
    else openRail()
  }

  function onRailKeydown(event) {
    if (event.key !== 'Escape' || railMode !== 'overlay' || !root.hasAttribute('data-prts-rail-open')) return
    event.preventDefault()
    closeRail({ returnFocus: true })
  }

  function onDocumentClick(event) {
    if (railMode !== 'overlay' || !root.hasAttribute('data-prts-rail-open')) return
    const settingsPanel = shell?.querySelector?.('[data-prts-theme-settings]')
    const insideSettingsContent = settingsPanel?.contains?.(event.target) && event.target !== settingsPanel
    if (navRail?.contains?.(event.target) || railLauncher?.contains?.(event.target) || insideSettingsContent) return
    closeRail()
  }

  function onResponsiveChange() {
    clearRailGesture()
    setRailViewport(window.innerWidth)
    syncRailState()
  }

  function bindResponsiveQueries() {
    railViewportQuery = window.matchMedia?.('(min-width: 1180px)')
    railPointerQuery = window.matchMedia?.('(pointer: coarse)')
    railHoverQuery = window.matchMedia?.('(hover: none)')
    railViewportQuery?.addEventListener?.('change', onResponsiveChange)
    railPointerQuery?.addEventListener?.('change', onResponsiveChange)
    railHoverQuery?.addEventListener?.('change', onResponsiveChange)
  }
  function disableTheme() { onThemeDisable() }

  function mount() {
    if (shell?.isConnected) return true
    const regions = adapter.mount()
    if (!regions) return false
    const template = document.createElement('template')
    template.innerHTML = markup(assets.emblem).trim()
    shell = template.content.firstElementChild
    document.body.appendChild(shell)
    bindResponsiveQueries()
    navRail = shell.querySelector('[data-prts-nav-rail]')
    railLauncher = shell.querySelector('[data-prts-rail-launcher]')
    setRailViewport(window.innerWidth)
    schemeToggle = shell.querySelector('[data-prts-scheme-toggle]')
    themeDisable = shell.querySelector('[data-prts-theme-disable]')
    connectionIndicator = shell.querySelector('[data-prts-connection-indicator]')
    hostGeometry?.start?.(regions.frame)
    operationRegion = regions.center
    settingsOverlay = createThemeSettingsOverlay({
      document,
      trigger: shell.querySelector('[data-prts-rail-brand]'),
      panel: shell.querySelector('[data-prts-theme-settings]'),
      backdrop: shell.querySelector('[data-prts-settings-backdrop]'),
      onPreferenceChange,
      onPreferencePreview,
      onResetVisual: onVisualReset,
      onRetrySave,
    })
    resizeShield.start([
      operationRegion,
      shell.querySelector('[data-prts-theme-settings]'),
      shell.querySelector('[data-prts-settings-backdrop]'),
    ])
    conversationObserver = new window.MutationObserver(syncConversationState)
    conversationObserver.observe(operationRegion, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-chat-flow-kind', 'data-message-role'] })
    schemeObserver = new window.MutationObserver(syncSchemeToggle)
    schemeObserver.observe(root, { attributes: true, attributeFilter: ['data-prts-scheme'] })
    railLauncher.addEventListener('click', onRailClick)
    railLauncher.addEventListener('pointerdown', onRailPointerDown)
    railLauncher.addEventListener('pointermove', onRailPointerMove)
    railLauncher.addEventListener('pointerup', onRailPointerUp)
    railLauncher.addEventListener('pointercancel', clearRailGesture)
    railLauncher.addEventListener('lostpointercapture', onRailLostPointerCapture)
    document.addEventListener('keydown', onRailKeydown)
    document.addEventListener('click', onDocumentClick)
    schemeToggle.addEventListener('click', toggleScheme)
    schemeToggle.addEventListener('pointerdown', onSchemePointerDown)
    schemeToggle.addEventListener('pointermove', onSchemePointerMove)
    schemeToggle.addEventListener('pointerup', onSchemePointerUp)
    schemeToggle.addEventListener('pointercancel', cancelSchemePointer)
    schemeToggle.addEventListener('lostpointercapture', onSchemeLostPointerCapture)
    window.addEventListener?.('blur', cancelSchemePointer)
    themeDisable.addEventListener('click', disableTheme)
    syncConversationState()
    syncSchemeToggle()
    return true
  }

  function dispose() {
    clearRailGesture()
    cancelSchemePointer()
    clearSchemeClickSuppression()
    clearSchemePressDelays()
    railLauncher?.removeEventListener('click', onRailClick)
    railLauncher?.removeEventListener('pointerdown', onRailPointerDown)
    railLauncher?.removeEventListener('pointermove', onRailPointerMove)
    railLauncher?.removeEventListener('pointerup', onRailPointerUp)
    railLauncher?.removeEventListener('pointercancel', clearRailGesture)
    railLauncher?.removeEventListener('lostpointercapture', onRailLostPointerCapture)
    document.removeEventListener('keydown', onRailKeydown)
    document.removeEventListener('click', onDocumentClick)
    schemeToggle?.removeEventListener('click', toggleScheme)
    schemeToggle?.removeEventListener('pointerdown', onSchemePointerDown)
    schemeToggle?.removeEventListener('pointermove', onSchemePointerMove)
    schemeToggle?.removeEventListener('pointerup', onSchemePointerUp)
    schemeToggle?.removeEventListener('pointercancel', cancelSchemePointer)
    schemeToggle?.removeEventListener('lostpointercapture', onSchemeLostPointerCapture)
    window.removeEventListener?.('blur', cancelSchemePointer)
    themeDisable?.removeEventListener('click', disableTheme)
    railViewportQuery?.removeEventListener?.('change', onResponsiveChange)
    railPointerQuery?.removeEventListener?.('change', onResponsiveChange)
    railHoverQuery?.removeEventListener?.('change', onResponsiveChange)
    railViewportQuery = undefined
    railPointerQuery = undefined
    railHoverQuery = undefined
    resizeShield.dispose()
    settingsOverlay?.dispose()
    conversationObserver?.disconnect()
    schemeObserver?.disconnect()
    shell?.remove()
    root.removeAttribute('data-prts-conversation-state')
    root.removeAttribute('data-prts-rail-mode')
    root.removeAttribute('data-prts-rail-open')
    root.removeAttribute('data-prts-rail-default-hidden')
    navRail = railLauncher = railMode = railViewport = undefined
    railDefaultHidden = false
    schemeIntent = undefined
    shell = settingsOverlay = schemeToggle = themeDisable = connectionIndicator = undefined
    conversationObserver = schemeObserver = undefined
    operationRegion = undefined
    hostGeometry?.dispose?.()
    adapter.dispose()
  }

  return {
    update(preferences, status, persistenceState) {
      if (!preferences?.enabled) {
        dispose()
        return false
      }
      const nextRailDefaultHidden = Boolean(preferences.railDefaultHidden)
      const railPreferenceChanged = nextRailDefaultHidden !== railDefaultHidden
      railDefaultHidden = nextRailDefaultHidden
      if (!mount()) return false
      root.toggleAttribute('data-prts-rail-default-hidden', railDefaultHidden)
      setRailViewport(window.innerWidth, { forceClose: railPreferenceChanged })
      const connection = status?.connection || 'unknown'
      const connectionLabel = status?.connectionLabel || '未知'
      connectionIndicator.dataset.state = connection
      connectionIndicator.setAttribute('aria-label', `Harness 主机连接状态：${connectionLabel}`)
      setText(connectionIndicator, '[data-prts-connection-label]', connectionLabel)
      settingsOverlay.update(preferences, status, persistenceState)
      syncConversationState()
      syncSchemeToggle()
      return true
    },
    dispose,
  }
}
