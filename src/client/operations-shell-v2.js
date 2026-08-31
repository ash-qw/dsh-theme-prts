import { createThemeSettingsOverlay, themeSettingsMarkup } from './theme-settings-workbench.js'
import { createResizeShieldAdapter } from './resize-shield-adapter.js'

function setText(root, selector, value) {
  const node = root?.querySelector(selector)
  const next = String(value ?? '')
  if (node && node.textContent !== next) node.textContent = next
}

function markup(emblem) {
  return `<div data-prts-shell data-plugin="dsh-theme-prts">
    <button type="button" data-prts-rail-launcher aria-label="打开 P.R.T.S. 导航" aria-controls="prts-nav-rail" aria-expanded="false"><span aria-hidden="true">P.R.T.S.</span></button>
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
        <button type="button" data-prts-theme-disable aria-label="关闭 P.R.T.S. 主题"><b aria-hidden="true">×</b><small>关闭主题</small></button>
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
  onThemeDisable = () => {},
  onPreferenceChange = () => {},
  onVisualReset = () => {},
  getConversationScalePreview = () => ({ visible: false, reason: 'unmeasured', mode: 'hidden' }),
  onRetrySave = () => {},
}) {
  const root = document.documentElement
  const resizeShield = createResizeShieldAdapter({ window })
  let shell
  let navRail
  let railLauncher
  let railMode
  let railViewportQuery
  let settingsOverlay
  let schemeToggle
  let themeDisable
  let connectionIndicator
  let conversationObserver
  let schemeObserver
  let operationRegion
  function syncConversationState() {
    if (!operationRegion) return
    const candidate = operationRegion.querySelector(
      '[data-chat-flow-kind]:not([hidden]):not([aria-hidden="true"]), [data-message-role]:not([hidden]):not([aria-hidden="true"])',
    )
    const active = Boolean(candidate)
    root.dataset.prtsConversationState = active ? 'active' : 'idle'
    settingsOverlay?.refreshScalePreview()
  }

  function toggleScheme() {
    onSchemeToggle(root.dataset.prtsScheme === 'dark' ? 'light' : 'dark')
  }

  function syncSchemeToggle() {
    if (!schemeToggle) return
    const current = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
    schemeToggle.dataset.prtsSchemeCurrent = current
    schemeToggle.setAttribute('aria-label', current === 'dark' ? '切换到日间模式' : '切换到夜间模式')
  }

  function syncRailState() {
    if (!navRail || !railLauncher) return
    const overlay = railMode === 'overlay'
    const open = overlay && root.hasAttribute('data-prts-rail-open')
    railLauncher.setAttribute('aria-expanded', String(open))
    railLauncher.setAttribute('aria-label', open ? '关闭 P.R.T.S. 导航' : '打开 P.R.T.S. 导航')
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

  function setRailViewport(width = window.innerWidth) {
    const nextMode = Number(width) >= 1180 ? 'docked' : 'overlay'
    if (nextMode === railMode) return railMode
    railMode = nextMode
    root.dataset.prtsRailMode = nextMode
    if (nextMode === 'docked') root.removeAttribute('data-prts-rail-open')
    else root.removeAttribute('data-prts-rail-open')
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
    if (navRail?.contains?.(event.target) || railLauncher?.contains?.(event.target)) return
    closeRail()
  }

  function onRailAction(event) {
    const action = event.target?.closest?.('[data-prts-rail-brand], [data-prts-scheme-toggle]')
    if (action && navRail?.contains?.(action)) closeRail()
  }

  function onResponsiveChange() {
    setRailViewport(window.innerWidth)
    settingsOverlay?.scheduleScalePreviewRefresh?.()
  }

  function bindResponsiveQueries() {
    railViewportQuery = window.matchMedia?.('(min-width: 1180px)')
    railViewportQuery?.addEventListener?.('change', onResponsiveChange)
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
      onResetVisual: onVisualReset,
      onRetrySave,
      getConversationScalePreview,
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
    railLauncher.addEventListener('click', toggleRail)
    navRail.addEventListener('click', onRailAction)
    document.addEventListener('keydown', onRailKeydown)
    document.addEventListener('click', onDocumentClick)
    schemeToggle.addEventListener('click', toggleScheme)
    themeDisable.addEventListener('click', disableTheme)
    syncConversationState()
    syncSchemeToggle()
    return true
  }

  function dispose() {
    railLauncher?.removeEventListener('click', toggleRail)
    navRail?.removeEventListener('click', onRailAction)
    document.removeEventListener('keydown', onRailKeydown)
    document.removeEventListener('click', onDocumentClick)
    schemeToggle?.removeEventListener('click', toggleScheme)
    themeDisable?.removeEventListener('click', disableTheme)
    railViewportQuery?.removeEventListener?.('change', onResponsiveChange)
    railViewportQuery = undefined
    resizeShield.dispose()
    settingsOverlay?.dispose()
    conversationObserver?.disconnect()
    schemeObserver?.disconnect()
    shell?.remove()
    root.removeAttribute('data-prts-conversation-state')
    root.removeAttribute('data-prts-rail-mode')
    root.removeAttribute('data-prts-rail-open')
    navRail = railLauncher = railMode = undefined
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
      if (!mount()) return false
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
