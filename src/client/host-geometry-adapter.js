const TOP_INSET_PROPERTY = '--prts-host-top-inset'
const RESIZE_SETTLE_DELAY = 160

function finiteInset(value, viewportHeight) {
  const next = Number(value)
  if (!Number.isFinite(next)) return 0
  const limit = Math.max(0, Number(viewportHeight) || 0)
  return Math.min(Math.max(0, next), limit)
}

function cssPixels(value) {
  const rounded = Math.round(value * 100) / 100
  return `${Object.is(rounded, -0) ? 0 : rounded}px`
}

export function createHostGeometryAdapter({ document, window }) {
  const root = document?.documentElement
  let frame
  let resizeObserver
  let frameRequest
  let resizeSettleTimer
  let observedFrameHeight
  let previousValue
  let previousPriority
  let started = false

  function measure() {
    if (!started || !root || !frame?.isConnected) return 0
    const top = finiteInset(frame.getBoundingClientRect?.().top, window?.innerHeight)
    const value = cssPixels(top)
    if (root.style.getPropertyValue(TOP_INSET_PROPERTY) !== value) {
      root.style.setProperty(TOP_INSET_PROPERTY, value)
    }
    return top
  }

  function scheduleMeasure() {
    if (!started || frameRequest !== undefined) return
    if (typeof window?.requestAnimationFrame !== 'function') {
      measure()
      return
    }
    frameRequest = window.requestAnimationFrame(() => {
      frameRequest = undefined
      measure()
    })
  }

  function scheduleSettledMeasure() {
    scheduleMeasure()
  }

  function onWindowResize() {
    if (!started) return
    if (resizeSettleTimer !== undefined) window?.clearTimeout?.(resizeSettleTimer)
    resizeSettleTimer = window?.setTimeout?.(() => {
      resizeSettleTimer = undefined
      scheduleMeasure()
    }, RESIZE_SETTLE_DELAY)
  }

  function onGeometryResize(entries = []) {
    let shouldMeasure = false
    for (const entry of entries) {
      if (entry.target !== frame) continue
      const height = Number(entry.contentRect?.height)
      if (!Number.isFinite(height) || height <= 0) {
        shouldMeasure = true
      } else if (height !== observedFrameHeight) {
        observedFrameHeight = height
        shouldMeasure = true
      }
    }
    if (shouldMeasure || !entries.length) scheduleMeasure()
  }

  function stopObservation() {
    resizeObserver?.disconnect?.()
    resizeObserver = undefined
    window?.removeEventListener?.('resize', onWindowResize)
    if (resizeSettleTimer !== undefined) window?.clearTimeout?.(resizeSettleTimer)
    resizeSettleTimer = undefined
    if (frameRequest !== undefined) window?.cancelAnimationFrame?.(frameRequest)
    frameRequest = undefined
  }

  function dispose() {
    if (!started) return
    stopObservation()
    if (previousValue) root.style.setProperty(TOP_INSET_PROPERTY, previousValue, previousPriority)
    else root.style.removeProperty(TOP_INSET_PROPERTY)
    previousValue = undefined
    previousPriority = undefined
    frame = undefined
    observedFrameHeight = undefined
    started = false
  }

  return {
    start(nextFrame) {
      if (!root || !nextFrame) return false
      if (started && frame === nextFrame) {
        scheduleSettledMeasure()
        return true
      }
      if (started) dispose()
      frame = nextFrame
      previousValue = root.style.getPropertyValue(TOP_INSET_PROPERTY)
      previousPriority = root.style.getPropertyPriority(TOP_INSET_PROPERTY)
      started = true
      measure()
      if (typeof window?.ResizeObserver === 'function') {
        resizeObserver = new window.ResizeObserver(onGeometryResize)
        resizeObserver.observe(frame)
      }
      window?.addEventListener?.('resize', onWindowResize, { passive: true })
      scheduleSettledMeasure()
      return true
    },
    refresh: measure,
    dispose,
  }
}
