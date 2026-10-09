// Keep the native cursor and change its image only during a primary mouse gesture.
export function createCursorAdapter({ document, window, assets }) {
  const root = document?.documentElement
  let listening = false
  let pointerId
  let timer
  let mode
  let pressX
  let pressY
  let handPhase
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
    mode = undefined
    handPhase = undefined
  }
  function show(url) {
    const [x, y] = mode === 'text' ? assets.textHotspot : assets.hotspot
    root.style.setProperty(mode === 'text' ? '--prts-text-frame' : frameProperty, `url("${url}") ${x} ${y}`)
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
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
    const cursor = target ? window.getComputedStyle(target).cursor : ''
    reset()
    if (!cursor.includes('data:image/png')) return
    mode = /,\s*text$/.test(cursor) ? 'text' : 'hand'
    pointerId = event.pointerId
    pressX = event.clientX
    pressY = event.clientY
    if (mode === 'text') {
      if (reduced() || !assets.textClick) { reset(); return }
      play(assets.textClick, reset)
      return
    }
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
    if (mode === 'text') return
    if (reduced()) { reset(); return }
    if (handPhase === 'press') return
    releaseHand()
  }
  function move(event) {
    if (mode === 'text') {
      const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
      const cursor = target ? window.getComputedStyle(target).cursor : ''
      const selecting = pointerId === event.pointerId && (event.buttons & 1) && Math.hypot(event.clientX - pressX, event.clientY - pressY) > 4
      if (!/,\s*text$/.test(cursor) || selecting) reset()
      return
    }
    if (pointerId !== undefined && event.pointerId === pointerId && !(event.buttons & 1)) reset()
  }
  function leave(event) { if (!event.relatedTarget) reset() }
  function blur(event) {
    // Captured element blur also reaches window when focus changes inside the app.
    if (event.target === window) reset()
  }
  function visibility() { if (document.hidden) reset() }
  const events = [['pointerdown', down], ['pointerup', up], ['pointermove', move], ['pointercancel', reset], ['blur', blur], ['dragstart', reset], ['pointerout', leave]]
  function dispose() {
    reset()
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
