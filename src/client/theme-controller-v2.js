import { normalizePreferences } from './preferences.js'

const ROOT_ATTRIBUTES = [
  'data-dsh-prts',
  'data-prts-scheme',
  'data-prts-texture',
  'data-prts-glass',
  'data-prts-motion',
  'data-prts-particle-pattern',
]

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
  let setRevision = 0

  function clearThemeState() {
    for (const attribute of ROOT_ATTRIBUTES) root.removeAttribute(attribute)
  }

  function removeOwnedState() {
    disposed = true
    refreshRevision += 1
    setRevision += 1
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
      return value.then(next => {
        if (!disposed && revision === refreshRevision) sync(next)
        return next
      }).catch(() => {
        if (!disposed && revision === refreshRevision) sync(fallbackTheme())
      })
    }
    sync(value ?? fallbackTheme())
    return value
  }

  function setTheme(id) {
    const target = id === 'dark' ? 'dark' : 'light'
    const revision = ++setRevision
    try {
      const result = service?.setTheme?.(target)
      if (result && typeof result.then === 'function') {
        return result.then(() => {
          if (!disposed && revision === setRevision) sync(target)
          return target
        }).catch(() => {
          if (!disposed && revision === setRevision) refresh()
          return root.dataset.prtsScheme
        })
      }
      if (!disposed && revision === setRevision) sync(target)
    } catch {
      if (!disposed && revision === setRevision) sync(target)
    }
    return target
  }

  function toggle() {
    return setTheme(root.dataset.prtsScheme === 'dark' ? 'light' : 'dark')
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
      refresh()
    },
    sync,
    refresh,
    setTheme,
    toggle,
    dispose: removeOwnedState,
  }
}
