import { normalizePreferences } from './preferences.js'

const ROOT_ATTRIBUTES = [
  'data-dsh-prts',
  'data-prts-scheme',
  'data-prts-texture',
  'data-prts-glass',
  'data-prts-motion',
  'data-prts-particle-pattern',
]

const TRANSITION_ATTRIBUTE = 'data-prts-scheme-transition'
const TRANSITION_PROPERTIES = [
  '--prts-scheme-origin-x',
  '--prts-scheme-origin-y',
  '--prts-scheme-radius',
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
  let transitionRevision = 0
  let activeTransition
  let animatedRequest

  function clearTransitionState() {
    root.removeAttribute(TRANSITION_ATTRIBUTE)
    for (const property of TRANSITION_PROPERTIES) root.style.removeProperty(property)
  }

  function cancelActiveTransition() {
    const current = activeTransition
    activeTransition = undefined
    current?.viewTransition?.skipTransition?.()
    clearTransitionState()
  }

  function clearThemeState() {
    for (const attribute of ROOT_ATTRIBUTES) root.removeAttribute(attribute)
    clearTransitionState()
  }

  function removeOwnedState() {
    disposed = true
    refreshRevision += 1
    setRevision += 1
    animatedRequest = undefined
    cancelActiveTransition()
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

  function applyScheme(value) {
    if (disposed) return
    const next = resolveScheme(value)
    root.dataset.prtsScheme = next
    return next
  }

  function sync(value) {
    if (disposed) return
    const next = resolveScheme(value)
    if (animatedRequest) {
      animatedRequest.hostScheme = next
      return root.dataset.prtsScheme
    }
    if (activeTransition && next !== root.dataset.prtsScheme) cancelActiveTransition()
    return applyScheme(next)
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

  function prefersReducedMotion() {
    if (root.dataset.prtsMotion === 'reduced') return true
    try { return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true } catch { return false }
  }

  function canAnimateScheme(options) {
    return options?.animate === true
      && typeof document.startViewTransition === 'function'
      && !prefersReducedMotion()
  }

  function transitionOrigin(origin) {
    const width = Math.max(Number(window.innerWidth) || 0, Number(root.clientWidth) || 0)
    const height = Math.max(Number(window.innerHeight) || 0, Number(root.clientHeight) || 0)
    const clamp = (value, maximum, fallback) => Math.min(maximum, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : fallback))
    const x = clamp(origin?.x, width, width / 2)
    const y = clamp(origin?.y, height, height / 2)
    const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 2
    return { x, y, radius }
  }

  function commitAnimatedScheme(target, origin) {
    cancelActiveTransition()
    const token = ++transitionRevision
    const geometry = transitionOrigin(origin)
    root.style.setProperty('--prts-scheme-origin-x', `${geometry.x}px`)
    root.style.setProperty('--prts-scheme-origin-y', `${geometry.y}px`)
    root.style.setProperty('--prts-scheme-radius', `${geometry.radius}px`)
    root.setAttribute(TRANSITION_ATTRIBUTE, target)

    let viewTransition
    try {
      viewTransition = document.startViewTransition(() => applyScheme(target))
    } catch {
      clearTransitionState()
      applyScheme(target)
      return target
    }

    activeTransition = { token, viewTransition }
    Promise.resolve(viewTransition?.finished).catch(() => {}).finally(() => {
      if (activeTransition?.token !== token) return
      activeTransition = undefined
      clearTransitionState()
    })
    return target
  }

  function setTheme(id, options = {}) {
    const target = id === 'dark' ? 'dark' : 'light'
    const revision = ++setRevision
    const manual = options?.animate === true
    const animationAvailable = canAnimateScheme(options)
    const animate = animationAvailable && target !== root.dataset.prtsScheme
    animatedRequest = undefined
    if (manual) animatedRequest = { revision, target, hostScheme: undefined }

    const clearAnimatedRequest = () => {
      if (animatedRequest?.revision === revision) animatedRequest = undefined
    }

    const commit = () => {
      if (disposed || revision !== setRevision) return root.dataset.prtsScheme
      clearAnimatedRequest()
      if (!animate) return applyScheme(target)
      return Promise.resolve(options.ready).catch(() => {}).then(() => {
        if (disposed || revision !== setRevision) return root.dataset.prtsScheme
        return commitAnimatedScheme(target, options.origin)
      })
    }

    const fail = () => {
      if (disposed || revision !== setRevision) return root.dataset.prtsScheme
      clearAnimatedRequest()
      const result = refresh()
      if (result && typeof result.then === 'function') {
        return result.then(() => root.dataset.prtsScheme)
      }
      return root.dataset.prtsScheme
    }

    try {
      const result = service?.setTheme?.(target)
      if (result && typeof result.then === 'function') {
        return result.then(commit).catch(fail)
      }
      return commit()
    } catch {
      return fail()
    }
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
        animatedRequest = undefined
        cancelActiveTransition()
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
