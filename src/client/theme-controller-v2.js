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
const CURTAIN_RASTER_THRESHOLD = 1_000_000
const CURTAIN_COVER_MS = 260
const CURTAIN_FADE_MS = 140

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

export function createThemeController({ document, window, cssText, service, onTransitionStateChange = () => {} }) {
  if (!document || !window) return { apply() {}, sync() {}, refresh() {}, setTheme() {}, toggle() {}, dispose() {} }

  const root = document.documentElement
  let style
  let disposed = false
  let refreshRevision = 0
  let setRevision = 0
  let transitionRevision = 0
  let activeTransition
  let animatedRequest

  let transitionStateActive = false

  function setTransitionState(active) {
    const next = Boolean(active)
    if (transitionStateActive === next) return
    transitionStateActive = next
    try { onTransitionStateChange(next) } catch {}
  }

  function clearTransitionState() {
    root.removeAttribute(TRANSITION_ATTRIBUTE)
    for (const property of TRANSITION_PROPERTIES) root.style.removeProperty(property)
  }

  function cancelActiveTransition({ keepPaused = false } = {}) {
    const current = activeTransition
    activeTransition = undefined
    current?.viewTransition?.skipTransition?.()
    current?.cancel?.()
    clearTransitionState()
    if (!keepPaused) setTransitionState(false)
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
    if (activeTransition) {
      if (next === activeTransition.target) return root.dataset.prtsScheme
      if (next !== root.dataset.prtsScheme) cancelActiveTransition()
    }
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

  function viewportRasterPixels() {
    const width = Math.max(Number(window.innerWidth) || 0, Number(root.clientWidth) || 0)
    const height = Math.max(Number(window.innerHeight) || 0, Number(root.clientHeight) || 0)
    const dpr = Math.max(1, Number(window.devicePixelRatio) || 1)
    return width * height * dpr * dpr
  }

  function canUseCurtain() {
    return viewportRasterPixels() >= CURTAIN_RASTER_THRESHOLD
      && Boolean(document.body)
      && typeof window.Element?.prototype?.animate === 'function'
  }

  function canAnimateScheme(options) {
    const animationAvailable = canUseCurtain()
      || typeof document.startViewTransition === 'function'
    return options?.animate === true
      && animationAvailable
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

  function commitViewTransitionScheme(target, origin) {
    cancelActiveTransition({ keepPaused: true })
    setTransitionState(true)
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
      setTransitionState(false)
      return target
    }

    activeTransition = { token, target, viewTransition }
    Promise.resolve(viewTransition?.finished).catch(() => {}).finally(() => {
      if (activeTransition?.token !== token) return
      activeTransition = undefined
      clearTransitionState()
      setTransitionState(false)
    })
    return target
  }

  async function commitCurtainScheme(target, origin) {
    cancelActiveTransition({ keepPaused: true })
    setTransitionState(true)
    const token = ++transitionRevision
    const geometry = transitionOrigin(origin)
    root.style.setProperty('--prts-scheme-origin-x', `${geometry.x}px`)
    root.style.setProperty('--prts-scheme-origin-y', `${geometry.y}px`)
    root.style.setProperty('--prts-scheme-radius', `${geometry.radius}px`)
    root.setAttribute(TRANSITION_ATTRIBUTE, target)

    const curtain = document.createElement('div')
    curtain.dataset.prtsSchemeCurtain = target
    curtain.setAttribute('aria-hidden', 'true')
    document.body.appendChild(curtain)
    const animations = []
    activeTransition = {
      token,
      target,
      cancel() {
        for (const animation of animations) animation.cancel?.()
        curtain.remove()
      },
    }

    try {
      const cover = curtain.animate([
        { clipPath: `circle(0 at ${geometry.x}px ${geometry.y}px)` },
        { clipPath: `circle(${geometry.radius}px at ${geometry.x}px ${geometry.y}px)` },
      ], {
        duration: CURTAIN_COVER_MS,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
        fill: 'forwards',
      })
      animations.push(cover)
      await cover.finished
      if (activeTransition?.token !== token) return root.dataset.prtsScheme

      applyScheme(target)
      const fade = curtain.animate([
        { opacity: 1 },
        { opacity: 0 },
      ], {
        duration: CURTAIN_FADE_MS,
        easing: 'ease-out',
        fill: 'forwards',
      })
      animations.push(fade)
      await fade.finished
      if (activeTransition?.token !== token) return root.dataset.prtsScheme
    } catch {
      if (activeTransition?.token !== token) return root.dataset.prtsScheme
      applyScheme(target)
    } finally {
      if (activeTransition?.token === token) {
        activeTransition = undefined
        curtain.remove()
        clearTransitionState()
        setTransitionState(false)
      }
    }
    return target
  }

  function commitAnimatedScheme(target, origin) {
    if (canUseCurtain()) return commitCurtainScheme(target, origin)
    return commitViewTransitionScheme(target, origin)
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
      return commitAnimatedScheme(target, options.origin)
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
