// Keep the native cursor and change its image only during a primary mouse gesture.
export function createCursorAdapter({ document, window, assets }) {
  const root = document?.documentElement
  let listening = false
  let animate = true
  let pointerId
  let timer
  let compact = false, pressedAt = 0
  let handPhase
  let gestureAssets = assets
  let textTarget
  let moveFrame, pendingMove
  let textRange
  let lastPoint
  const heroTextSelector = '[data-phase="hero"] [class$="_titleGroup"]'
  const contentSelector = '[data-markdown], [data-slot*="markdown" i], [class*="markdown" i], :is([data-chat-flow-kind="user"], [data-chat-flow-kind="steering"], [data-submission-echo], [data-pending-steering]) [class$="_bubble"]'
  const controlSelector = 'a[href], button, summary, input, textarea, select, [contenteditable], [role="button"], [role="toolbar"], [role="tab"]'
  function clearTextHit() {
    textTarget?.removeAttribute('data-prts-text-hit')
    textTarget = undefined
  }
  function updateTextHit(event) {
    const nextTarget = findTextHit(event)
    if (nextTarget === textTarget) return
    clearTextHit()
    textTarget = nextTarget
    textTarget?.setAttribute('data-prts-text-hit', '')
  }
  function prepareTextHit(target, semanticOnly = true) {
    const content = target?.closest?.(`${contentSelector}, ${heroTextSelector}`)
    if (!content || (!content.matches(heroTextSelector) && !content.closest('[data-chat-flow-kind], [data-message-role], [data-submission-echo], [data-pending-steering]')) || target.closest(controlSelector)) return {target}
    const style = window.getComputedStyle(target)
    if (style.userSelect === 'none' || (!semanticOnly && !style.cursor.includes('data:image/png'))) return {target}
    return {target,content}
  }
  function findTextHit(event, semanticOnly = false, prepared) {
    if (event.pointerType !== 'mouse') return
    lastPoint = { clientX: event.clientX, clientY: event.clientY, pointerType: 'mouse' }
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
    const {content} = prepared?.target===target ? prepared : prepareTextHit(target,semanticOnly)
    if (!content) return
    // Caret APIs return the nearest insertion point even over empty space.
    // Check its adjacent character rectangles before treating it as a text hit.
    const caret = document.caretPositionFromPoint?.(event.clientX, event.clientY)
    const fallback = caret ? undefined : document.caretRangeFromPoint?.(event.clientX, event.clientY)
    const node = caret?.offsetNode ?? fallback?.startContainer
    const offset = caret?.offset ?? fallback?.startOffset
    if (node?.nodeType !== 3 || !content.contains(node) || node.parentElement?.closest(controlSelector)) return
    if (node.parentElement !== target && window.getComputedStyle(node.parentElement).userSelect === 'none') return
    const range = textRange ||= document.createRange()
    for (const index of [offset - 1, offset]) {
      if (index < 0 || index >= node.length) continue
      range.setStart(node, index)
      range.setEnd(node, index + 1)
      for (const rect of range.getClientRects()) {
        if (rect.width > 0 && event.clientX >= rect.left && event.clientX < rect.right && event.clientY >= rect.top && event.clientY < rect.bottom) {
          return target
        }
      }
    }
  }
  function refreshTextHit() {
    if (!lastPoint) return
    updateTextHit({ ...lastPoint, target: document.elementFromPoint(lastPoint.clientX, lastPoint.clientY) })
  }
  let resizeTarget
  let resizeOriginal
  let resizePriority
  let resizeApplied
  function clearResize() {
    if (resizeTarget && resizeTarget.style.cursor === resizeApplied) {
      if (resizeOriginal) resizeTarget.style.setProperty('cursor', resizeOriginal, resizePriority)
      else resizeTarget.style.removeProperty('cursor')
    }
    resizeTarget = undefined
  }
  function updateResize(event) {
    if (event.pointerType !== 'mouse' || !assets.resize) return
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
    if (target === resizeTarget && target.style.cursor === resizeApplied) return
    clearResize()
    if (!target || target.closest('[data-prts-region-stage]')) return
    const cursor = window.getComputedStyle(target).cursor
    const direction = { 'n-resize': 'ns', 's-resize': 'ns', 'ns-resize': 'ns', 'row-resize': 'ns',
      'e-resize': 'ew', 'w-resize': 'ew', 'ew-resize': 'ew', 'col-resize': 'ew',
      'ne-resize': 'nesw', 'sw-resize': 'nesw', 'nesw-resize': 'nesw',
      'nw-resize': 'nwse', 'se-resize': 'nwse', 'nwse-resize': 'nwse' }[cursor]
    if (!direction) return
    resizeTarget = target
    resizeOriginal = target.style.getPropertyValue('cursor')
    resizePriority = target.style.getPropertyPriority('cursor')
    target.style.setProperty('cursor', `url("${assets.resize[direction]}") 16 16, ${cursor}`, resizePriority)
    resizeApplied = target.style.cursor
  }
  const reducedMedia = window?.matchMedia?.('(prefers-reduced-motion: reduce)')
  let handTarget
  let handCursor
  let originalCursor
  let originalPriority
  let appliedCursor
  let appliedPriority
  let lastHandFrame
  function ownsHandCursor() {
    return handTarget?.style.cursor === appliedCursor
      && handTarget.style.getPropertyPriority('cursor') === appliedPriority
  }
  function stopIfHandChanged() {
    if (!handTarget || ownsHandCursor()) return false
    reset()
    return true
  }
  function restoreHandTarget() {
    if (handTarget && ownsHandCursor()) {
      if (originalCursor) handTarget.style.setProperty('cursor', originalCursor, originalPriority)
      else handTarget.style.removeProperty('cursor')
    }
    handTarget?.removeAttribute('data-prts-hand-active')
    handTarget = undefined
    lastHandFrame = undefined
  }
  // Cursor is inherited. Animating a large container still restyles its subtree.
  // Use one pressed pose for medium containers; keep larger backgrounds static.
  const maxAnimatedDescendants = 128
  function canAnimate(target) {
    return target && target.getElementsByTagName('*').length <= maxAnimatedDescendants
  }
  function followHand(target) {
    if (stopIfHandChanged()) return
    if (target === handTarget && target !== textTarget) return
    if(compact && handTarget && target!==handTarget){reset();return}
    restoreHandTarget()
    if ((!compact && !canAnimate(target)) || !handCursor || target === textTarget) return
    const cursor = window.getComputedStyle(target).cursor
    if (!cursor.includes('data:image/png') || /(?:,\s*(?:text|grab|grabbing|not-allowed|no-drop)|resize)$/.test(cursor)) return
    handTarget = target
    originalCursor = target.style.getPropertyValue('cursor')
    originalPriority = target.style.getPropertyPriority('cursor')
    appliedCursor = originalCursor
    appliedPriority = originalPriority
    target.setAttribute('data-prts-hand-active', '')
    applyHandFrame()
  }
  function applyHandFrame() {
    if (stopIfHandChanged() || !handTarget) return
    if(lastHandFrame === handCursor && ownsHandCursor())return
    handTarget.style.setProperty('cursor', handCursor)
    lastHandFrame = handCursor
    appliedCursor = handTarget.style.cursor
    appliedPriority = handTarget.style.getPropertyPriority('cursor')
  }
  function clearTimer() {
    if (timer !== undefined) window.clearTimeout(timer)
    timer = undefined
  }
  function reset() {
    clearTimer()
    pointerId = undefined
    restoreHandTarget()
    handCursor = undefined
    root?.style.removeProperty('--prts-text-frame')
    handPhase = undefined
    compact=false
  }
  function show(url) {
    const [x, y] = gestureAssets.hotspot
    handCursor = `url("${url}") ${x} ${y}, pointer`
    applyHandFrame()
  }
  function reduced() {
    return root.dataset.prtsMotion === 'reduced' || reducedMedia?.matches
  }
  function play(frames, done) {
    clearTimer()
    const started = window.performance.now()
    let index = 0, deadline = frames[0]?.duration ?? 0
    function next() {
      timer = undefined
      if (stopIfHandChanged()) return
      const elapsed = window.performance.now() - started
      // Skip expired frames after a busy main thread; never replay a backlog.
      while (index < frames.length - 1 && elapsed >= deadline) {
        index += 1
        deadline += frames[index]?.duration ?? 0
      }
      // The source ANI ends with a 60-second hold frame, which is not animated.
      if (index >= frames.length - 1) { done(); return }
      show(frames[index].url)
      if (!handCursor) return
      timer = window.setTimeout(next, Math.max(1, deadline - (window.performance.now() - started)))
    }
    next()
  }
  function down(event) {
    clearPendingMove()
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.isPrimary === false) return
    updateResize(event)
    updateTextHit(event)
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
    reset()
    if (!animate) return
    const cursor = target ? window.getComputedStyle(target).cursor : ''
    if (!cursor.includes('data:image/png')) return
    if (/(?:,\s*(?:text|grab|grabbing|not-allowed|no-drop)|resize)$/.test(cursor)) return
    const descendants=target.getElementsByTagName('*').length
    if(descendants>256)return
    compact=descendants>maxAnimatedDescendants
    pressedAt=window.performance.now()
    gestureAssets = /,\s*pointer$/.test(cursor) && assets.link ? assets.link : assets
    pointerId = event.pointerId
    handCursor = compact ? `url("${gestureAssets.hold}") ${gestureAssets.hotspot[0]} ${gestureAssets.hotspot[1]}, pointer` : cursor
    followHand(target)
    if(compact){handPhase='hold';return}
    if (reduced()) { clearTimer(); show(gestureAssets.hold); return }
    handPhase = 'press'
    play(gestureAssets.press, () => {
      handPhase = 'hold'
      show(gestureAssets.hold)
      // A quick tap must still reach a visible pressed pose before recovering.
      if (pointerId === undefined) timer = window.setTimeout(releaseHand, 48)
    })
  }
  function releaseHand() {
    handPhase = 'release'
    play(gestureAssets.release, reset)
  }
  function up(event) {
    if (stopIfHandChanged()) return
    if (pointerId === undefined || event.pointerId !== pointerId || event.button !== 0) return
    pointerId = undefined
    if (reduced()) { reset(); return }
    if(compact){
      const remaining=80-(window.performance.now()-pressedAt)
      if(remaining>0)timer=window.setTimeout(reset,remaining)
      else reset()
      return
    }
    if (handPhase === 'press') return
    releaseHand()
  }
  function applyMove(event) {
    updateResize(event)
    updateTextHit(event)
    if (handCursor) followHand(event.target?.nodeType === 1 ? event.target : event.target?.parentElement)
    if (pointerId !== undefined && event.pointerId === pointerId && !(event.buttons & 1)) reset()
  }
  function clearPendingMove() {
    if (moveFrame !== undefined) window.cancelAnimationFrame?.(moveFrame)
    moveFrame = undefined
    pendingMove = undefined
  }
  function move(event) {
    if (event.pointerType !== 'mouse') return
    // Lost releases must clear synchronously even when the next paint is delayed.
    if (pointerId !== undefined && event.pointerId === pointerId && !(event.buttons & 1)) reset()
    if (!window.requestAnimationFrame) { applyMove(event); return }
    pendingMove = { target:event.target, pointerType:event.pointerType, pointerId:event.pointerId,
      buttons:event.buttons, clientX:event.clientX, clientY:event.clientY }
    if (moveFrame === undefined) moveFrame = window.requestAnimationFrame(() => {
      const latest = pendingMove
      clearPendingMove()
      if (latest?.target?.isConnected) applyMove(latest)
    })
  }
  function resetInteraction() {
    clearPendingMove()
    reset()
    clearResize()
    clearTextHit()
    lastPoint = undefined
  }
  function leave(event) { if (!event.relatedTarget) resetInteraction() }
  function blur(event) {
    // Captured element blur also reaches window when focus changes inside the app.
    if (event.target === window) resetInteraction()
  }
  function visibility() { if (document.hidden) resetInteraction() }
  function over(event) {
    if (animate || event.pointerType !== 'mouse') return
    clearPendingMove()
    applyMove(event)
  }
  const events = [['pointerdown', down], ['pointerup', up], ['pointermove', move], ['pointerover', over], ['pointercancel', resetInteraction], ['blur', blur], ['dragstart', resetInteraction], ['pointerout', leave], ['scroll', refreshTextHit], ['resize', refreshTextHit]]
  function dispose() {
    resetInteraction()
    textRange=undefined
    if (!listening) return
    for (const [name, handler] of events) window.removeEventListener(name, handler, true)
    document.removeEventListener('visibilitychange', visibility)
    listening = false
  }
  return {
    prepareTextHit,
    textHit: (event, prepared) => findTextHit(event, true, prepared),
    update(preferences) {
      if (animate && preferences.cursorAnimation === false) reset()
      animate = preferences.cursorAnimation !== false
      if (!root || !assets || !preferences.enabled || preferences.cursor !== 'prts') { dispose(); return }
      if (listening) return
      for (const [name, handler] of events) window.addEventListener(name, handler, true)
      document.addEventListener('visibilitychange', visibility)
      listening = true
    },
    dispose,
  }
}
