const rippleHighlight = { peaks: [.82, .5, .28], rise: .08, fade: .62, tail: .22 }

// Keep the native cursor and change its image only during a primary mouse gesture.
export function createCursorAdapter({ document, window, assets }) {
  const root = document?.documentElement
  let listening = false
  let animate = true
  let pointerId
  let timer
  let handPhase
  let gestureAssets = assets
  let textTarget
  let moveFrame, pendingMove
  let textRange
  let lastPoint
  const heroTextSelector = '[data-phase="hero"] [class$="_titleGroup"]'
  const contentSelector = '[data-markdown], [data-slot*="markdown" i], [class*="markdown" i], :is([data-chat-flow-kind="user"], [data-chat-flow-kind="steering"], [data-submission-echo], [data-pending-steering]) :is([data-message-bubble], [class$="_bubble"])'
  const controlSelector = 'a[href], button, summary, input, textarea, select, [contenteditable], [role="button"], [role="toolbar"], [role="tab"]'
  const interactiveSelector = 'a[href], button, summary, input, textarea, select, label, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [role="tab"], [role="treeitem"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="spinbutton"], [data-prts-workspace-row], [data-prts-session-row], .dsh-partner-sidebar-row'
  let feedbackHost, feedbackRoot, refractionFilter
  const ripples = new Set()
  const artwork = createRippleArtwork()
  const interference = createRippleInterference({ document, window, ripples, artwork, container: () => feedbackRoot })
  function ensureFeedbackLayer() {
    if (feedbackHost?.isConnected || !document.body) return
    feedbackHost = document.createElement('span')
    feedbackHost.setAttribute('data-prts-cursor-feedback', '')
    feedbackHost.setAttribute('aria-hidden', 'true')
    feedbackHost.style.cssText = 'all:initial;position:fixed;inset:0;display:block;z-index:2147483647;pointer-events:none!important;contain:strict;isolation:isolate'
    feedbackRoot = feedbackHost.attachShadow?.({ mode: 'open' }) || feedbackHost
    const style = document.createElement('style')
    style.textContent = assets.feedbackCss || ''
    feedbackRoot.append(style)
    if (assets.refractionMap && window.CSS?.supports?.('backdrop-filter', 'url(#prts-ripple-refraction)')) {
      const namespace = 'http://www.w3.org/2000/svg'
      const definitions = document.createElementNS(namespace, 'svg')
      definitions.setAttribute('width', '0')
      definitions.setAttribute('height', '0')
      definitions.style.position = 'absolute'
      const create = (name, attributes) => {
        const element = document.createElementNS(namespace, name)
        for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
        return element
      }
      const filter = create('filter', { id: 'prts-ripple-refraction', filterUnits: 'userSpaceOnUse', x: '0', y: '0', width: '96', height: '96', 'color-interpolation-filters': 'sRGB' })
      filter.append(create('feImage', { href: assets.refractionMap, x: '0', y: '0', width: '96', height: '96', preserveAspectRatio: 'none', result: 'field' }), create('feDisplacementMap', { in: 'SourceGraphic', in2: 'field', scale: '9', xChannelSelector: 'R', yChannelSelector: 'G' }))
      definitions.append(filter)
      feedbackRoot.append(definitions)
      refractionFilter = true
    }
    document.body.append(feedbackHost)
  }
  function interactiveTarget(target, cursor) {
    if (!target || target === root || target === document.body) return
    return target.closest(interactiveSelector) || (/,\s*pointer$/.test(cursor) ? target : undefined)
  }
  function unavailable(target) {
    const owner = target?.closest('label')?.control
    return target?.closest(':disabled, [aria-disabled="true"], [inert]')
      || owner?.matches(':disabled, [aria-disabled="true"]')
  }
  function removeRipple(entry, synchronize = true) {
    if (!ripples.delete(entry)) return
    for (const animation of entry.animations) animation.cancel()
    entry.refraction?.cancel()
    entry.node.remove()
    if (synchronize) interference.sync()
  }
  function clearRipples() {
    for (const entry of ripples) removeRipple(entry, false)
    interference.sync()
  }
  function ripple(event) {
    if (reduced() || document.hidden || document.pointerLockElement || !document.body
      || typeof window.Element?.prototype.animate !== 'function'
      || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return
    while (ripples.size >= 3) removeRipple(ripples.values().next().value, false)
    const node = document.createElement('span')
    node.setAttribute('data-prts-click-ripple', '')
    node.setAttribute('aria-hidden', 'true')
    node.style.setProperty('--prts-ripple-artwork', `url("${artwork.mask}")`)
    node.style.transform = `translate3d(${event.clientX - 80}px, ${event.clientY - 80}px, 0)`
    for (let index = 0; index < 3; index++) node.append(document.createElement('span'))
    const topLayer = !!event.target?.closest?.('dialog[open], [popover]')
    if (topLayer && typeof node.showPopover === 'function') node.setAttribute('popover', 'manual')
    feedbackRoot?.append(node)
    if (node.hasAttribute('popover')) {
      try { node.showPopover() } catch { node.removeAttribute('popover') }
    }
    const entry = { node, animations: [], x: event.clientX, y: event.clientY, topLayer }
    ripples.add(entry)
    let pending = 3
    try {
      for (const [index, ring] of [...node.children].entries()) {
        const rotation = [12, -25, 38][index]
        const scale = [1.45, 1.08, 0.78][index]
        const peak = rippleHighlight.peaks[index]
        const animation = ring.animate([
          { transform: `rotate(${rotation}deg) scale(.14)`, opacity: 0 },
          { opacity: peak, offset: rippleHighlight.rise },
          { opacity: peak * rippleHighlight.tail, offset: rippleHighlight.fade },
          { transform: `rotate(${rotation + 8}deg) scale(${scale})`, opacity: 0 },
        ], { duration: 560, delay: index * 45, easing: 'cubic-bezier(.16,.7,.3,1)', fill: 'both' })
        entry.animations.push(animation)
        animation.finished.then(() => {
          if (--pending === 0) removeRipple(entry)
        }, () => removeRipple(entry))
      }
      if (refractionFilter) {
        const lens = document.createElement('i')
        lens.setAttribute('data-prts-ripple-refraction', '')
        node.append(lens)
        entry.refraction = lens.animate([
          { transform: 'scale(.14)', opacity: 0 },
          { opacity: 1, offset: .06 },
          { opacity: 1, offset: .88 },
          { transform: 'scale(1.45)', opacity: 0 },
        ], { duration: 560, easing: 'cubic-bezier(.16,.7,.3,1)', fill: 'both' })
        entry.refraction.finished.catch(() => {})
      }
      interference.sync()
    } catch { removeRipple(entry) }
  }
  function motionChange() {
    if (reduced()) clearRipples()
    interference.prepare(animate && !reduced())
  }
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
  function prepareTextHit(target) {
    const content = target?.closest?.(`${contentSelector}, ${heroTextSelector}`)
    if (!content || (!content.matches(heroTextSelector) && !content.closest('[data-chat-flow-kind], [data-message-role], [data-submission-echo], [data-pending-steering]')) || target.closest(controlSelector)) return {target}
    const style = window.getComputedStyle(target)
    if (style.userSelect === 'none' || !style.cursor.includes('data:image/png')) return {target}
    return {target,content}
  }
  function findTextHit(event) {
    if (event.pointerType !== 'mouse') return
    lastPoint = { clientX: event.clientX, clientY: event.clientY, pointerType: 'mouse' }
    const target = event.target?.nodeType === 1 ? event.target : event.target?.parentElement
    const {content} = prepareTextHit(target)
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
  function followHand(target) {
    if (stopIfHandChanged()) return
    if (target === handTarget && target !== textTarget) return
    restoreHandTarget()
    if (!target || !handCursor || target === textTarget || unavailable(target)) return
    const cursor = window.getComputedStyle(target).cursor
    if (!interactiveTarget(target, cursor)) return
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
    if (!animate || !target || unavailable(target) || target.closest('[data-prts-region-stage]')) return
    const cursor = target ? window.getComputedStyle(target).cursor : ''
    if (!cursor.includes('data:image/png')) return
    if (/(?:,\s*(?:text|vertical-text|grab|grabbing|not-allowed|no-drop)|resize)$/.test(cursor)) return
    if (!interactiveTarget(target, cursor)) { ripple(event); return }
    gestureAssets = /,\s*pointer$/.test(cursor) && assets.link ? assets.link : assets
    pointerId = event.pointerId
    handCursor = cursor
    followHand(target)
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
    clearRipples()
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
  function visibility() {
    if (document.hidden) resetInteraction()
    interference.prepare(!document.hidden && animate && !reduced())
  }
  function over(event) {
    if (animate || event.pointerType !== 'mouse') return
    clearPendingMove()
    applyMove(event)
  }
  const events = [['pointerdown', down], ['pointerup', up], ['pointermove', move], ['pointerover', over], ['pointercancel', resetInteraction], ['blur', blur], ['dragstart', resetInteraction], ['pointerout', leave], ['scroll', refreshTextHit], ['resize', refreshTextHit]]
  function dispose() {
    resetInteraction()
    interference.dispose()
    feedbackHost?.remove()
    feedbackHost = feedbackRoot = refractionFilter = undefined
    textRange=undefined
    if (!listening) return
    for (const [name, handler] of events) window.removeEventListener(name, handler, true)
    document.removeEventListener('visibilitychange', visibility)
    reducedMedia?.removeEventListener?.('change', motionChange)
    listening = false
  }
  return {
    update(preferences) {
      if (preferences.cursorAnimation === false || preferences.motion === 'reduced') clearRipples()
      if (animate && preferences.cursorAnimation === false) reset()
      animate = preferences.cursorAnimation !== false
      if (!root || !assets || !preferences.enabled || preferences.cursor !== 'prts') { dispose(); return }
      ensureFeedbackLayer()
      interference.prepare(animate && preferences.motion !== 'reduced' && !reducedMedia?.matches)
      if (listening) return
      for (const [name, handler] of events) window.addEventListener(name, handler, true)
      document.addEventListener('visibilitychange', visibility)
      reducedMedia?.addEventListener?.('change', motionChange)
      listening = true
    },
    dispose,
  }
}

function createRippleArtwork() {
  const paths = [[-14, 58, .65], [76, 171, 1.05], [193, 252, .45], [277, 329, .8]].map(([start, end, weight]) => {
    const outer = [], inner = []
    for (let step = 0; step <= 24; step++) {
      const progress = step / 24
      const angle = (start + (end - start) * progress) * Math.PI / 180
      const width = .08 + weight * Math.sin(Math.PI * progress) ** 1.15
      const radius = 44 + .25 * Math.sin(3 * angle + .6)
      for (const [points, side] of [[outer, 1], [inner, -1]]) {
        points.push(`${(48 + Math.cos(angle) * (radius + side * width / 2)).toFixed(2)} ${(48 + Math.sin(angle) * (radius + side * width / 2)).toFixed(2)}`)
      }
    }
    return `M${outer.join('L')}L${inner.reverse().join('L')}Z`
  }).join('')
  const svg = content => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 96 96">${content}</svg>`)
  return {
    mask: svg(`<path d="${paths}" fill="white"/>`),
    field: svg(`<defs><path id="wave" d="${paths}"/></defs><use href="#wave" fill="#0f0" stroke="#0f0" stroke-width="3.5" stroke-linejoin="round"/><use href="#wave" fill="black" stroke="black" stroke-width="1.4" stroke-linejoin="round"/><use href="#wave" fill="#f00"/>`),
  }
}

function createRippleInterference({ document, window, ripples, artwork, container }) {
  let renderer, frame, idle, image, maskImage, imageReady = false, active = false, failed = false, group = []
  const waves = new Float32Array(36), axes = new Float32Array(18)
  const scales = [1.45, 1.08, .78], angles = [12, -25, 38]
  function cancelWarmup() {
    if (idle !== undefined) window.cancelIdleCallback?.(idle)
    idle = undefined
  }
  function stop() {
    if (frame !== undefined) window.cancelAnimationFrame(frame)
    frame = undefined
    renderer?.node.remove()
    for (const entry of group) entry.node.removeAttribute('data-prts-ripple-mixed')
    group = []
  }
  function create() {
    const node = document.createElement('canvas')
    const gl = node.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: false })
    if (!gl) { failed = true; return }
    const program = gl.createProgram(), shaders = []
    let buffer, texture
    try {
      for (const [type, source] of [
        [gl.VERTEX_SHADER, 'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}'],
        [gl.FRAGMENT_SHADER, `precision mediump float;
          uniform vec2 size;uniform float ratio;uniform vec3 ink;uniform vec4 waves[9];uniform vec2 axes[9];uniform sampler2D field;
          void main(){
            vec2 point=vec2(gl_FragCoord.x,size.y-gl_FragCoord.y)/ratio;
            float amplitude=0.;
            for(int index=0;index<9;index++){
              vec4 wave=waves[index];
              if(wave.w<=0.)continue;
              vec2 delta=(point-wave.xy)/wave.z;
              vec2 axis=axes[index];
              vec2 local=vec2(dot(delta,axis),dot(delta,vec2(-axis.y,axis.x)));
              if(abs(local.x)>1.||abs(local.y)>1.)continue;
              vec4 texel=texture2D(field,local*.5+.5);
              amplitude+=wave.w*(texel.r-.42*texel.g);
            }
            gl_FragColor=vec4(ink,clamp(amplitude,0.,.95));
          }`],
      ]) {
        const shader = gl.createShader(type)
        shaders.push(shader)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        gl.attachShader(program, shader)
      }
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Ripple shader unavailable')
      gl.useProgram(program)
      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const position = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
      texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.generateMipmap(gl.TEXTURE_2D)
      const uniforms = Object.fromEntries(['size', 'ratio', 'ink', 'waves', 'axes', 'field'].map(name => [name, gl.getUniformLocation(program, ['waves', 'axes'].includes(name) ? `${name}[0]` : name)]))
      gl.uniform1i(uniforms.field, 0)
      node.setAttribute('data-prts-ripple-interference', '')
      node.setAttribute('aria-hidden', 'true')
      const lost = event => { event.preventDefault(); failed = true; stop() }
      node.addEventListener('webglcontextlost', lost)
      return { node, gl, program, buffer, texture, shaders, uniforms, lost }
    } catch {
      failed = true
      if (buffer) gl.deleteBuffer(buffer)
      if (texture) gl.deleteTexture(texture)
      for (const shader of shaders) gl.deleteShader(shader)
      gl.deleteProgram(program)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }
  function render() {
    frame = undefined
    if (!group.length || !renderer || failed) return
    const { gl, node, uniforms, left, top } = renderer
    const scheme = document.documentElement.dataset.prtsScheme === 'light' ? 'light' : 'dark'
    if (renderer.scheme !== scheme) {
      gl.uniform3fv(uniforms.ink, (scheme === 'light' ? [21, 25, 28] : [237, 241, 242]).map(value => value / 255))
      renderer.scheme = scheme
    }
    waves.fill(0)
    let slot = 0, axisSlot = 0
    for (const entry of group) {
      for (const [index, animation] of entry.animations.entries()) {
        const progress = animation.effect?.getComputedTiming().progress
        if (progress != null) {
          const { rise, fade, tail } = rippleHighlight
          const peak = rippleHighlight.peaks[index]
          const opacity = progress < rise ? progress / rise * peak
            : progress < fade ? peak * (1 - (progress - rise) / (fade - rise) * (1 - tail))
              : (1 - progress) / (1 - fade) * peak * tail
          waves[slot] = entry.x - left
          waves[slot + 1] = entry.y - top
          waves[slot + 2] = 48 * (.14 + (scales[index] - .14) * progress)
          waves[slot + 3] = opacity
          const angle = (angles[index] + 8 * progress) * Math.PI / 180
          axes[axisSlot] = Math.cos(angle)
          axes[axisSlot + 1] = Math.sin(angle)
        }
        slot += 4
        axisSlot += 2
      }
    }
    gl.uniform4fv(uniforms.waves, waves)
    gl.uniform2fv(uniforms.axes, axes)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    if (node.isConnected) frame = window.requestAnimationFrame(render)
  }
  function sync() {
    const entries = [...ripples]
    const pair = entries.flatMap((entry, index) => entries.slice(index + 1).map(other => [entry, other]))
      .find(([first, second]) => Math.hypot(first.x - second.x, first.y - second.y) < 150)
    if (!pair || !renderer || failed) { stop(); return }
    const next = entries.filter(entry => pair.includes(entry) || pair.some(other => Math.hypot(entry.x - other.x, entry.y - other.y) < 150))
    if (frame !== undefined) window.cancelAnimationFrame(frame)
    frame = undefined
    for (const entry of group) if (!next.includes(entry)) entry.node.removeAttribute('data-prts-ripple-mixed')
    group = next
    const { node, gl, uniforms } = renderer
    const left = Math.min(...group.map(entry => entry.x)) - 80
    const top = Math.min(...group.map(entry => entry.y)) - 80
    const width = Math.ceil(Math.max(...group.map(entry => entry.x)) + 80 - left)
    const height = Math.ceil(Math.max(...group.map(entry => entry.y)) + 80 - top)
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    Object.assign(renderer, { left, top })
    const pixelsWide = Math.ceil(width * ratio), pixelsHigh = Math.ceil(height * ratio)
    if (node.width !== pixelsWide) node.width = pixelsWide
    if (node.height !== pixelsHigh) node.height = pixelsHigh
    node.style.cssText = `width:${width}px;height:${height}px;transform:translate3d(${left}px,${top}px,0)`
    gl.uniform2f(uniforms.size, node.width, node.height)
    gl.uniform1f(uniforms.ratio, ratio)
    gl.viewport(0, 0, node.width, node.height)
    if (group.some(entry => entry.topLayer) && typeof node.showPopover === 'function') {
      if (!node.hasAttribute('popover')) node.setAttribute('popover', 'manual')
    } else if (node.hasAttribute('popover')) node.removeAttribute('popover')
    if (!node.isConnected) container()?.append(node)
    if (node.hasAttribute('popover') && !node.matches(':popover-open')) {
      try { node.showPopover() } catch { node.removeAttribute('popover') }
    }
    render()
    for (const entry of group) if (!entry.node.hasAttribute('data-prts-ripple-mixed')) entry.node.setAttribute('data-prts-ripple-mixed', '')
  }
  function queueWarmup() {
    if (!active || failed || renderer || idle !== undefined || !imageReady || document.hidden) return
    idle = window.requestIdleCallback(deadline => {
      idle = undefined
      if (!active || failed || renderer || document.hidden) return
      if (deadline.timeRemaining() < 12) { queueWarmup(); return }
      try { renderer = create() } catch { failed = true }
      sync()
    })
  }
  return {
    sync,
    prepare(enabled) {
      active = enabled
      if (!active) { cancelWarmup(); return }
      if (!maskImage && window.Image) {
        maskImage = new window.Image()
        maskImage.src = artwork.mask
      }
      if (failed || renderer || !window.WebGLRenderingContext || !window.requestIdleCallback || !window.requestAnimationFrame || !window.Image) return
      if (!image) {
        image = new window.Image()
        image.onload = () => { imageReady = true; queueWarmup() }
        image.onerror = () => { failed = true }
        image.src = artwork.field
      }
      queueWarmup()
    },
    dispose() {
      active = false
      cancelWarmup()
      stop()
      if (image) { image.onload = null; image.onerror = null }
      image = undefined
      maskImage = undefined
      imageReady = false
      if (renderer) {
        const { node, gl, program, buffer, texture, shaders, lost } = renderer
        node.removeEventListener('webglcontextlost', lost)
        gl.deleteBuffer(buffer)
        gl.deleteTexture(texture)
        for (const shader of shaders) gl.deleteShader(shader)
        gl.deleteProgram(program)
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
      renderer = undefined
      failed = false
    },
  }
}
