const RESIZE_SHIELD_ATTRIBUTE = 'data-prts-resize-shield'
const DEFAULT_SETTLE_DELAY = 180

export function createResizeShieldAdapter({
  window,
  settleDelay = DEFAULT_SETTLE_DELAY,
} = {}) {
  let targets = []
  let settleTimer
  let started = false

  function setActive(active) {
    for (const node of targets) {
      if (!node || node.hasAttribute?.(RESIZE_SHIELD_ATTRIBUTE) === active) continue
      node.toggleAttribute?.(RESIZE_SHIELD_ATTRIBUTE, active)
    }
  }

  function clearTimer() {
    if (settleTimer === undefined) return
    window?.clearTimeout?.(settleTimer)
    settleTimer = undefined
  }

  function settle() {
    settleTimer = undefined
    setActive(false)
  }

  function onResize() {
    if (!started) return
    if (Number(window?.innerWidth) <= 640) {
      clearTimer()
      setActive(false)
      return
    }
    setActive(true)
    clearTimer()
    settleTimer = window?.setTimeout?.(settle, settleDelay)
  }

  function dispose() {
    clearTimer()
    window?.removeEventListener?.('resize', onResize)
    setActive(false)
    targets = []
    started = false
  }

  return {
    start(nextTargets = []) {
      const resolved = [...new Set(nextTargets)].filter(Boolean)
      if (!window || !resolved.length) {
        dispose()
        return false
      }
      if (started) {
        clearTimer()
        setActive(false)
        window.removeEventListener?.('resize', onResize)
      }
      targets = resolved
      started = true
      window.addEventListener?.('resize', onResize, { passive: true })
      return true
    },
    dispose,
  }
}
