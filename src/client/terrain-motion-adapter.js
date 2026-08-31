const PARALLAX_RATIO = 0.2
const TILE_HEIGHT = 4800
const DESKTOP_MAX_LAG = 42
const TABLET_MAX_LAG = 20
const PHONE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1024
const SETTLE_TIME_MS = 260

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function createTerrainMotionAdapter({ document, window }) {
  if (!document || !window) {
    return { update() {}, dispose() {}, inspect: () => ({ current: 0, target: 0 }) }
  }

  let preferences = {}
  let operation
  let scroller
  let layer
  let observer
  let frame
  let mediaQuery
  let mediaListener
  let lastFrameTime = 0
  let lastScroll = 0
  let viewportMode
  let current = 0
  let target = 0

  const motionReduced = () => preferences.motion === 'reduced' || Boolean(mediaQuery?.matches)
  const phoneStatic = () => window.innerWidth <= PHONE_BREAKPOINT
  const maxLag = () => window.innerWidth <= TABLET_BREAKPOINT ? TABLET_MAX_LAG : DESKTOP_MAX_LAG
  const targetFor = scrollTop => phoneStatic() ? 0 : scrollTop * PARALLAX_RATIO

  function paint() {
    if (!layer) return
    const wrapped = ((current % TILE_HEIGHT) + TILE_HEIGHT) % TILE_HEIGHT
    layer.style.transform = `translate3d(0, -${wrapped.toFixed(3)}px, 0)`
  }

  function cancelFrame() {
    if (frame !== undefined) window.cancelAnimationFrame?.(frame)
    frame = undefined
    lastFrameTime = 0
  }

  function animate(timestamp) {
    frame = undefined
    const elapsed = lastFrameTime ? Math.min(48, Math.max(1, timestamp - lastFrameTime)) : 16
    lastFrameTime = timestamp
    const response = SETTLE_TIME_MS / 3
    const alpha = 1 - Math.exp(-elapsed / response)
    current += (target - current) * alpha
    if (Math.abs(target - current) < 0.08) current = target
    paint()
    if (current !== target) frame = window.requestAnimationFrame(animate)
    else lastFrameTime = 0
  }

  function snap() {
    cancelFrame()
    current = target
    paint()
  }

  function schedule() {
    if (current === target || frame !== undefined) return
    frame = window.requestAnimationFrame(animate)
  }

  function syncFromScroll(forceSnap = false) {
    if (!scroller) return
    const nextScroll = Number(scroller.scrollTop) || 0
    const delta = Math.abs(nextScroll - lastScroll)
    lastScroll = nextScroll
    target = targetFor(nextScroll)
    const jumpThreshold = Math.max(720, (Number(scroller.clientHeight) || window.innerHeight || 800) * 0.9)
    if (forceSnap || phoneStatic() || motionReduced() || delta >= jumpThreshold) {
      snap()
      return
    }
    const lag = maxLag()
    current = clamp(current, target - lag, target + lag)
    paint()
    schedule()
  }

  function onScroll() {
    syncFromScroll(false)
  }

  function unbindScroller() {
    scroller?.removeEventListener('scroll', onScroll)
    scroller = undefined
    layer?.remove()
    layer = undefined
    cancelFrame()
  }

  function bindScroller(next) {
    if (next === scroller && layer?.isConnected) return
    unbindScroller()
    scroller = next
    if (!scroller || !operation) return
    layer = document.createElement('div')
    layer.setAttribute('data-prts-terrain-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    operation.insertBefore(layer, operation.firstChild)
    lastScroll = Number(scroller.scrollTop) || 0
    target = targetFor(lastScroll)
    current = target
    paint()
    scroller.addEventListener('scroll', onScroll, { passive: true })
  }

  function findScroller() {
    const nextOperation = document.querySelector('[data-prts-region="operation"]')
    if (nextOperation !== operation) {
      unbindScroller()
      observer?.disconnect()
      operation = nextOperation
      if (operation && window.MutationObserver) {
        observer = new window.MutationObserver(findScroller)
        observer.observe(operation, { childList: true, subtree: true })
      }
    }
    const nextScroller = operation?.querySelector('[data-conversation-scroll]')
    bindScroller(nextScroller)
  }

  function onViewportChange() {
    const nextMode = window.innerWidth <= PHONE_BREAKPOINT
      ? 'phone'
      : window.innerWidth <= TABLET_BREAKPOINT ? 'tablet' : 'desktop'
    if (nextMode === viewportMode) return
    viewportMode = nextMode
    syncFromScroll(true)
  }

  function attachMotionPreference() {
    mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    mediaListener = onViewportChange
    mediaQuery?.addEventListener?.('change', mediaListener)
    if (!mediaQuery?.addEventListener) mediaQuery?.addListener?.(mediaListener)
  }

  function detachMotionPreference() {
    if (mediaQuery && mediaListener) {
      mediaQuery.removeEventListener?.('change', mediaListener)
      mediaQuery.removeListener?.(mediaListener)
    }
    mediaQuery = undefined
    mediaListener = undefined
  }

  attachMotionPreference()
  viewportMode = window.innerWidth <= PHONE_BREAKPOINT ? 'phone' : window.innerWidth <= TABLET_BREAKPOINT ? 'tablet' : 'desktop'
  window.addEventListener?.('resize', onViewportChange, { passive: true })

  return {
    update(nextPreferences = {}) {
      preferences = nextPreferences
      if (!preferences.enabled) {
        unbindScroller()
        observer?.disconnect()
        observer = undefined
        operation = undefined
        return
      }
      findScroller()
      if (layer) layer.hidden = preferences.texture === 'off'
      syncFromScroll(true)
    },
    inspect() {
      return { current, target, lastScroll, mounted: Boolean(layer?.isConnected) }
    },
    dispose() {
      unbindScroller()
      observer?.disconnect()
      observer = undefined
      operation = undefined
      detachMotionPreference()
      window.removeEventListener?.('resize', onViewportChange)
    },
  }
}
