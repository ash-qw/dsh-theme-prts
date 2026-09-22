import { normalizePreferences } from './preferences.js'

const ROOT_ATTRIBUTES = [
  'data-dsh-prts',
  'data-prts-scheme',
  'data-prts-texture',
  'data-prts-glass',
  'data-prts-motion',
  'data-prts-particle-pattern',
  'data-prts-session-flow',
  'data-prts-session-glow',
  'data-prts-session-flow-palette',
  'data-prts-session-flow-speed',
  'data-prts-conversation-style',
]
const SESSION_FLOW_COLOR_PROPERTIES = {
  '--prts-session-flow-back': 'sessionFlowColorBack',
  '--prts-session-flow-core': 'sessionFlowColorCore',
  '--prts-session-flow-front': 'sessionFlowColorFront',
}

function themeIdentity(value) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return ''
  const active = value.active
  if (active && typeof active === 'object') {
    const resolved = active.colorScheme || active.scheme || active.appearance || active.mode || active.id || active.name
    if (resolved) return resolved
  }
  return value.colorScheme || value.scheme || value.appearance || value.mode || value.id || value.name || value.preference || ''
}

function resolveScheme(value) {
  const identity = String(themeIdentity(value)).toLowerCase()
  return identity.includes('dark') || identity.includes('night') ? 'dark' : 'light'
}

export function createThemeController({ document, window, cssText, service }) {
  if (!document || !window) return { apply() {}, sync() {}, refresh() {}, setTheme() {}, toggle() {}, dispose() {} }

  const root = document.documentElement
  let style
  let disposed = false
  let refreshRevision = 0

  function clearThemeState() {
    for (const attribute of ROOT_ATTRIBUTES) root.removeAttribute(attribute)
    for (const property of Object.keys(SESSION_FLOW_COLOR_PROPERTIES)) root.style.removeProperty(property)
  }

  function removeOwnedState() {
    disposed = true
    refreshRevision += 1
    clearThemeState()
    root.removeAttribute('data-dsh-prts-settings')
    style?.remove()
    style = undefined
  }

  function ensureStyle() {
    if (!style?.isConnected) {
      style = document.createElement('style')
      style.dataset.plugin = 'dsh-theme-prts'
      style.dataset.pluginCss = 'dsh-theme-prts/prts.css'
      document.head.appendChild(style)
    }
    if (style.textContent !== cssText) style.textContent = cssText
    root.setAttribute('data-dsh-prts-settings', '')
  }

  function sync(value) {
    if (disposed) return
    root.dataset.prtsScheme = resolveScheme(value)
  }

  function fallbackTheme() {
    return root.dataset.theme || root.getAttribute('data-color-scheme') || root.style.colorScheme || 'light'
  }

  function refresh() {
    const revision = ++refreshRevision
    let value
    try { value = service?.getTheme?.() } catch { value = undefined }
    if (value && typeof value.then === 'function') {
      value.then(next => {
        if (!disposed && revision === refreshRevision) sync(next)
      }).catch(() => {
        if (!disposed && revision === refreshRevision) sync(fallbackTheme())
      })
      return
    }
    sync(value ?? fallbackTheme())
  }

  function setTheme(id) {
    const target = id === 'dark' ? 'dark' : 'light'
    sync(target)
    try {
      const result = service?.setTheme?.(target)
      result?.then?.(() => refresh()).catch?.(() => {})
    } catch {}
  }

  function toggle() {
    setTheme(root.dataset.prtsScheme === 'dark' ? 'light' : 'dark')
  }

  return {
    apply(value) {
      disposed = false
      const preferences = normalizePreferences(value)
      ensureStyle()
      if (!preferences.enabled) {
        clearThemeState()
        return
      }
      root.setAttribute('data-dsh-prts', '')
      root.dataset.prtsTexture = preferences.texture
      root.dataset.prtsGlass = preferences.glass
      root.dataset.prtsMotion = preferences.motion
      root.dataset.prtsParticlePattern = 'orthogonal'
      root.dataset.prtsSessionFlow = preferences.sessionFlow ? 'on' : 'off'
      root.dataset.prtsSessionGlow = preferences.sessionGlow ? 'on' : 'off'
      root.dataset.prtsSessionFlowPalette = preferences.sessionFlowPalette
      root.dataset.prtsSessionFlowSpeed = String(preferences.sessionFlowSpeed)
      for (const [property, key] of Object.entries(SESSION_FLOW_COLOR_PROPERTIES)) root.style.setProperty(property, preferences[key])
      root.dataset.prtsConversationStyle = preferences.conversationStyle
      refresh()
    },
    sync,
    refresh,
    setTheme,
    toggle,
    dispose: removeOwnedState,
  }
}
