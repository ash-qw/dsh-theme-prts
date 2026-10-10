// Keep the native cursor and change its image only during a primary mouse gesture.
export function createCursorAdapter({ document, window, assets }) {
  const root = document?.documentElement
  let listening = false
  let pointerId
  let timer
  let handPhase
  let textTarget
  let lastPoint
  const contentSelector = '[data-markdown], [data-slot*="markdown" i], [class*="markdown" i], [data-chat-flow-kind="user"] [class$="_bubble"]'
  const controlSelector = 'a[href], button, summary, input, textarea, select, [contenteditable], [role="button"], [role="toolbar"], [role="tab"]'
  function clearTextHit() {
    textTarget?.removeAttribute('data-prts-text-hit')
    textTarget = undefined
  }
  function updateTextHit(event) {
    clearTextHit()
    if (event.pointerType !== 'mouse') return
    lastPoint = { clientX: event.clientX, clientY: event.clientY, pointerType: 'mouse' }
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
    const content = target?.closest?.(contentSelector)
    if (!content?.closest('[data-chat-flow-kind], [data-message-role]') || target.closest(controlSelector)) return
    const style = window.getComputedStyle(target)
    if (style.userSelect === 'none' || !style.cursor.includes('data:image/png')) return
    // Caret APIs return the nearest insertion point even over empty space.
    // Check its adjacent character rectangles before treating it as a text hit.
    const caret = document.caretPositionFromPoint?.(event.clientX, event.clientY)
    const fallback = caret ? undefined : document.caretRangeFromPoint?.(event.clientX, event.clientY)
    const node = caret?.offsetNode ?? fallback?.startContainer
    const offset = caret?.offset ?? fallback?.startOffset
    if (node?.nodeType !== 3 || !content.contains(node) || node.parentElement?.closest(controlSelector)) return
    if (window.getComputedStyle(node.parentElement).userSelect === 'none') return
    const range = document.createRange()
    for (const index of [offset - 1, offset]) {
      if (index < 0 || index >= node.length) continue
      range.setStart(node, index)
      range.setEnd(node, index + 1)
      for (const rect of range.getClientRects()) {
        if (rect.width > 0 && event.clientX >= rect.left && event.clientX < rect.right && event.clientY >= rect.top && event.clientY < rect.bottom) {
          textTarget = target
          target.setAttribute('data-prts-text-hit', '')
          return
        }
      }
    }
  }
  function refreshTextHit() {
    if (!lastPoint) return
    updateTextHit({ ...lastPoint, target: document.elementFromPoint(lastPoint.clientX, lastPoint.clientY) })
  }
  const reducedMedia = window?.matchMedia?.('(prefers-reduced-motion: reduce)')
  const frameProperty = '--prts-hand-frame'
  function clearTimer() {
    if (timer !== undefined) window.clearTimeout(timer)
    timer = undefined
  }
  function reset() {
    clearTimer()
    pointerId = undefined
    root?.style.removeProperty(frameProperty)
    root?.style.removeProperty('--prts-text-frame')
    handPhase = undefined
  }
  function show(url) {
    const [x, y] = assets.hotspot
    root.style.setProperty(frameProperty, `url("${url}") ${x} ${y}`)
  }
  function reduced() {
    return root.dataset.prtsMotion === 'reduced' || reducedMedia?.matches
  }
  function play(frames, done) {
    clearTimer()
    let index = 0
    function next() {
      timer = undefined
      // The source ANI ends with a 60-second hold frame. Use the static state instead.
      if (index >= frames.length - 1) { done(); return }
      const frame = frames[index++]
      show(frame.url)
      timer = window.setTimeout(next, frame.duration)
    }
    next()
  }
  function down(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.isPrimary === false) return
    updateTextHit(event)
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
    const cursor = target ? window.getComputedStyle(target).cursor : ''
    reset()
    if (!cursor.includes('data:image/png')) return
    if (/,\s*text$/.test(cursor)) return
    pointerId = event.pointerId
    if (reduced()) { clearTimer(); show(assets.hold); return }
    handPhase = 'press'
    play(assets.press, () => {
      handPhase = 'hold'
      show(assets.hold)
      // A quick tap must still reach a visible pressed pose before recovering.
      if (pointerId === undefined) timer = window.setTimeout(releaseHand, 48)
    })
  }
  function releaseHand() {
    handPhase = 'release'
    play(assets.release, reset)
  }
  function up(event) {
    if (pointerId === undefined || event.pointerId !== pointerId || event.button !== 0) return
    pointerId = undefined
    if (reduced()) { reset(); return }
    if (handPhase === 'press') return
    releaseHand()
  }
  function move(event) {
    updateTextHit(event)
    if (pointerId !== undefined && event.pointerId === pointerId && !(event.buttons & 1)) reset()
  }
  function leave(event) { if (!event.relatedTarget) { reset(); clearTextHit(); lastPoint = undefined } }
  function blur(event) {
    // Captured element blur also reaches window when focus changes inside the app.
    if (event.target === window) { reset(); clearTextHit(); lastPoint = undefined }
  }
  function visibility() { if (document.hidden) reset() }
  const events = [['pointerdown', down], ['pointerup', up], ['pointermove', move], ['pointercancel', reset], ['blur', blur], ['dragstart', reset], ['pointerout', leave], ['scroll', refreshTextHit], ['resize', refreshTextHit]]
  function dispose() {
    reset()
    clearTextHit()
    lastPoint = undefined
    if (!listening) return
    for (const [name, handler] of events) window.removeEventListener(name, handler, true)
    document.removeEventListener('visibilitychange', visibility)
    listening = false
  }
  return {
    update(preferences) {
      if (!root || !assets || !preferences.enabled || preferences.cursor !== 'prts') { dispose(); return }
      if (listening) return
      for (const [name, handler] of events) window.addEventListener(name, handler, true)
      document.addEventListener('visibilitychange', visibility)
      listening = true
    },
    dispose,
  }
}
