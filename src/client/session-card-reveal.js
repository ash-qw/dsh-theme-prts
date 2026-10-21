// Follow one navigation through native selection and subsequent list reflow.
// Keep the destination stable through unrelated reflow; retarget smoothly only when needed.
export function createSessionCardReveal({window, root, sessionId, onDone, onStart}) {
  let row, scroller, frame, timer, started = false, disposed = false, geometry, destination
  const findRow = () => [...root.querySelectorAll('[data-row-key], [data-session-id]')].find(el =>
    el.getAttribute('data-row-key') === `session:${sessionId}` || el.getAttribute('data-session-id') === sessionId)
  const instant = top => {
    try { scroller.scrollTo({top, behavior: 'instant'}) }
    catch { scroller.scrollTop = top }
  }
  function cancel() {
    if (disposed) return
    disposed = true
    window.cancelAnimationFrame(frame)
    window.clearTimeout(timer)
    resize?.disconnect()
    mutations.disconnect()
    root.removeEventListener('transitionend', schedule)
    root.removeEventListener('animationend', schedule)
    scroller?.removeEventListener('scrollend', scrollEnded)
  }
  function scrollEnded() {
    if (destination !== undefined && Math.abs(scroller.scrollTop - destination) <= 1) destination = undefined
    schedule()
  }
  function schedule() {
    if (!disposed && frame === undefined) frame = window.requestAnimationFrame(() => { frame = undefined; check() })
  }
  function check(final = false) {
    if (disposed) return
    const nextRow = findRow()
    if (!nextRow || nextRow.getAttribute('aria-selected') !== 'true') return
    const remounted = nextRow !== row
    if (remounted) {
      row = nextRow
      const previousScroller = scroller
      scroller?.removeEventListener('scrollend', scrollEnded)
      resize?.disconnect()
      scroller = undefined
      for (let node = row.parentElement; node && node !== root.parentElement; node = node.parentElement) {
        if (/^(auto|scroll)$/.test(window.getComputedStyle(node).overflowY) && node.clientHeight > 0) { scroller = node; break }
      }
      if (scroller !== previousScroller) destination = undefined
      for (let node = row; node && node !== root.parentElement; node = node.parentElement) {
        for (const animation of node.getAnimations?.() ?? []) {
          const timing = animation.effect?.getComputedTiming?.()
          if (animation.playState === 'running' && Number.isFinite(timing?.endTime)) animation.finished.then(schedule, schedule)
        }
      }
      resize?.observe(root)
      if (scroller) { resize?.observe(scroller); scroller.addEventListener('scrollend', scrollEnded) }
    }
    const first = !started
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      || root.ownerDocument.documentElement.getAttribute('data-prts-motion') === 'reduced'
    if (scroller) {
      // Read all geometry before writing scrollTop. Offset is independent of smooth-scroll progress.
      const card = row.getBoundingClientRect(), box = scroller.getBoundingClientRect()
      const current = scroller.scrollTop, height = scroller.clientHeight
      const top = card.top - box.top - scroller.clientTop, bottom = card.bottom - box.top - scroller.clientTop
      const next = [top + current, card.height, height, scroller.scrollHeight]
      const changed = remounted || !geometry || next.some((v, i) => Math.abs(v - geometry[i]) > 1)
      if (first || changed || final) {
        // Evaluate visibility at the pending destination, not at an intermediate animation frame.
        // Rows below the target may change scrollHeight without invalidating that destination.
        const base = destination ?? current
        const offset = next[0], bottomOffset = offset + card.height
        const limit = Math.max(0, next[3] - height)
        const nearest = position => Math.max(0, Math.min(limit,
          offset < position ? offset : bottomOffset > position + height ? bottomOffset - height : position))
        // A stale endpoint can lie on the other side of a card that is already visible.
        // Preserve valid endpoints, but correct invalid ones from the actual viewport.
        const target = Math.abs(nearest(base) - base) > 1 ? nearest(current) : base
        if (Math.abs(target - base) > 1) {
          destination = target
          if (!reduced && typeof scroller.scrollTo === 'function') scroller.scrollTo({top: target, behavior: 'smooth'})
          else instant(target)
        }
      }
      geometry = next
    } else if (first || remounted) {
      row.scrollIntoView?.({block:'nearest', inline:'nearest', behavior:!reduced ? 'smooth' : 'instant'})
    }
    if (first) {
      started = true
      onStart?.()
      // No idle-frame polling. Expiry still checks once, even after a blocked main thread.
      timer = window.setTimeout(() => { check(true); cancel(); onDone() }, 1000)
    }
  }
  const resize = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(schedule) : undefined
  const mutations = new window.MutationObserver(schedule)
  mutations.observe(root, {childList:true, subtree:true, attributes:true, attributeFilter:['aria-selected','aria-expanded']})
  root.addEventListener('transitionend', schedule)
  root.addEventListener('animationend', schedule)
  schedule()
  return {cancel, interrupt() { if (started && scroller) instant(scroller.scrollTop); cancel() }}
}
