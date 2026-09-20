import { normalizePreferences } from './preferences.js'

const ROOT_ATTRIBUTES = [
  'data-dsh-prts',
  'data-prts-scheme',
  'data-prts-texture',
  'data-prts-glass',
  'data-prts-motion',
  'data-prts-particle-pattern',
  'data-prts-session-flow',
  'data-prts-conversation-style',
]

const TRANSITION_ATTRIBUTE = 'data-prts-scheme-transition'
const TRANSITION_MODE_ATTRIBUTE = 'data-prts-scheme-transition-mode'
const TRANSITION_INTERACTIVE_ATTRIBUTE = 'data-prts-scheme-transition-interactive'
const TRANSITION_ARMED_ATTRIBUTE = 'data-prts-scheme-transition-armed'
const TRANSITION_COMPLETE_ATTRIBUTE = 'data-prts-scheme-transition-complete'
const TRANSITION_PROPERTIES = [
  '--prts-scheme-origin-x',
  '--prts-scheme-origin-y',
  '--prts-scheme-duration',
  '--prts-scheme-reveal-x',
  '--prts-scheme-control-progress',
  '--prts-scheme-control-meter-height',
  '--prts-scheme-control-value-image',
]
const REVEAL_EDGE_OVERSCAN = 32
const REVEAL_GRID_WIDTH = 220
const REVEAL_TIMING_LIMITS = {
  desktop: { minimum: 480, maximum: 560, widthFactor: .38 },
  mobile: { minimum: 320, maximum: 380, widthFactor: .9 },
}
const revealValueImages = new Map()

function revealValueImageUrl(value) {
  const percentage = Math.min(100, Math.max(0, Math.round(Number(value) || 0)))
  if (revealValueImages.has(percentage)) return revealValueImages.get(percentage)
  const label = String(percentage).padStart(3, '0')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="11" viewBox="0 0 24 11"><text x="0" y="9" fill="#ffd400" font-family="monospace" font-size="10" font-weight="700">${label}</text></svg>`
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  revealValueImages.set(percentage, url)
  return url
}

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
  if (!document || !window) {
    const gesture = { update() {}, finish() {}, cancel() {} }
    return { apply() {}, sync() {}, refresh() {}, setTheme() {}, beginThemeTransition() { return gesture }, toggle() {}, dispose() {} }
  }

  const root = document.documentElement
  let style
  let disposed = false
  let refreshRevision = 0
  let setRevision = 0
  let transitionRevision = 0
  let activeTransition

  let transitionStateActive = false

  function setTransitionState(active) {
    const next = Boolean(active)
    if (transitionStateActive === next) return
    transitionStateActive = next
    try { onTransitionStateChange(next) } catch {}
  }

  function clearTransitionState() {
    root.removeAttribute(TRANSITION_ATTRIBUTE)
    root.removeAttribute(TRANSITION_MODE_ATTRIBUTE)
    root.removeAttribute(TRANSITION_INTERACTIVE_ATTRIBUTE)
    root.removeAttribute(TRANSITION_ARMED_ATTRIBUTE)
    root.removeAttribute(TRANSITION_COMPLETE_ATTRIBUTE)
    for (const property of TRANSITION_PROPERTIES) root.style.removeProperty(property)
  }

  function cancelActiveTransition({ keepPaused = false } = {}) {
    const current = activeTransition
    activeTransition = undefined
    current?.cancel?.()
    current?.viewTransition?.skipTransition?.()
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
    if (activeTransition) {
      if (next === activeTransition.target) return root.dataset.prtsScheme
      if (activeTransition.interactive && next === activeTransition.source) return root.dataset.prtsScheme
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

  function canAnimateScheme(options) {
    const animationAvailable = typeof document.startViewTransition === 'function'
      && typeof root.animate === 'function'
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
    return { x, y }
  }

  function revealViewport(origin) {
    const geometry = transitionOrigin(origin)
    const width = Math.max(1, Number(window.innerWidth) || 0, Number(root.clientWidth) || 0)
    const height = Math.max(1, Number(window.innerHeight) || 0, Number(root.clientHeight) || 0)
    return { ...geometry, width, height }
  }

  function revealDuration(width) {
    const limits = width <= 720 ? REVEAL_TIMING_LIMITS.mobile : REVEAL_TIMING_LIMITS.desktop
    return Math.min(limits.maximum, Math.max(limits.minimum, Math.round(width * limits.widthFactor)))
  }

  function revealProgress(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return 0
    return Math.min(1, Math.max(0, numeric))
  }

  function removeRevealHud(session) {
    const hud = session?.hud
    if (!hud) return
    try {
      if (hud.matches?.(':popover-open')) hud.hidePopover?.()
    } catch {}
    hud.remove()
    session.hud = undefined
    session.hudGrid = undefined
    session.hudEdge = undefined
    session.hudMark = undefined
    session.hudMeterFill = undefined
    session.hudLabel = undefined
    session.hudValue = undefined
  }

  function updateRevealHud(session) {
    if (!session || session.settled) return
    const percentage = Math.round(revealProgress(session.progress) * 100)
    if (session.hudEdge) session.hudEdge.dataset.prtsSchemeRevealSide = 'left'
    root.style.setProperty('--prts-scheme-control-progress', String(session.progress))
    root.style.setProperty('--prts-scheme-control-meter-height', `${revealProgress(session.progress) * 48}px`)
    root.style.setProperty('--prts-scheme-control-value-image', revealValueImageUrl(percentage))
    root.toggleAttribute(TRANSITION_ARMED_ATTRIBUTE, session.interactive && session.progress >= .5)
  }

  function releaseRevealHud(session) {
    if (!session?.hud || session.settled) return Promise.resolve()
    session.hud.dataset.prtsSchemeRevealState = 'complete'
    root.setAttribute(TRANSITION_COMPLETE_ATTRIBUTE, '')
    return new Promise(resolve => window.setTimeout(resolve, 100))
  }

  function mountRevealHud(session) {
    if (session.settled || session.hud || !document.body) return
    const hud = document.createElement('div')
    hud.dataset.prtsSchemeReveal = session.target
    hud.dataset.prtsSchemeRevealMode = session.interactive ? 'interactive' : 'automatic'
    hud.setAttribute('aria-hidden', 'true')
    hud.setAttribute('popover', 'manual')
    const grid = document.createElement('i')
    grid.dataset.prtsSchemeRevealGrid = ''
    const edge = document.createElement('span')
    edge.dataset.prtsSchemeRevealEdge = ''
    const blend = document.createElement('i')
    blend.dataset.prtsSchemeRevealBlend = ''
    const node = document.createElement('span')
    node.dataset.prtsSchemeRevealNode = ''
    const meter = document.createElement('i')
    meter.dataset.prtsSchemeRevealMeter = ''
    const meterFill = document.createElement('i')
    meterFill.dataset.prtsSchemeRevealMeterFill = ''
    const label = document.createElement('span')
    label.dataset.prtsSchemeRevealLabel = ''
    label.textContent = 'CTRL'
    const mark = document.createElement('i')
    mark.dataset.prtsSchemeRevealMark = ''
    const value = document.createElement('span')
    value.dataset.prtsSchemeRevealValue = ''
    meter.appendChild(meterFill)
    node.append(meter, label, value, mark)
    edge.append(grid, blend, node)
    hud.appendChild(edge)
    document.body.appendChild(hud)
    session.hud = hud
    session.hudGrid = grid
    session.hudEdge = edge
    session.hudMark = mark
    session.hudMeterFill = meterFill
    session.hudLabel = label
    session.hudValue = value
    updateRevealHud(session)
    try { hud.showPopover?.() } catch {}
  }

  function revealTargetX(session, progress) {
    if (progress === 0) return -REVEAL_EDGE_OVERSCAN
    if (progress === 1) return session.geometry.width + REVEAL_EDGE_OVERSCAN
    return progress * session.geometry.width
  }

  function revealPixels(value) {
    const rounded = Math.round(value * 1000) / 1000
    return `${Object.is(rounded, -0) ? 0 : rounded}px`
  }

  function revealClipPath(session, x) {
    return `inset(0 ${revealPixels(Math.max(0, session.geometry.width - x))} 0 0)`
  }

  function revealEdgeTransform(x) {
    return `translate3d(${revealPixels(x - 1)}, 0, 0)`
  }

  function revealGridPosition(x) {
    return `${revealPixels(REVEAL_GRID_WIDTH - x)} 0px`
  }

  function revealGroupTranslate(x) {
    return `${revealPixels(x)} 0px`
  }

  function revealNamedAnimation(keyframes, options, pseudoElement) {
    return root.animate(keyframes, { ...options, pseudoElement })
  }

  function createInteractiveScrub(session) {
    if (!session.interactive || session.settled || session.scrubAnimations) return
    try {
      const options = {
        duration: session.duration,
        easing: 'linear',
        fill: 'both',
      }
      const clip = revealNamedAnimation([
        { clipPath: revealClipPath(session, 0) },
        { clipPath: revealClipPath(session, session.geometry.width) },
      ], options, '::view-transition-new(root)')
      const edge = revealNamedAnimation([
        { translate: revealGroupTranslate(0) },
        { translate: revealGroupTranslate(session.geometry.width) },
      ], options, '::view-transition-group(prts-scheme-edge)')
      const node = revealNamedAnimation([
        { translate: revealGroupTranslate(0) },
        { translate: revealGroupTranslate(session.geometry.width) },
      ], options, '::view-transition-group(prts-scheme-node)')
      const grid = revealNamedAnimation([
        { translate: revealGroupTranslate(0) },
        { translate: revealGroupTranslate(session.geometry.width) },
      ], options, '::view-transition-group(prts-scheme-grid)')
      const gridPhase = revealNamedAnimation([
        { backgroundPosition: revealGridPosition(0) },
        { backgroundPosition: revealGridPosition(session.geometry.width) },
      ], options, '::view-transition-new(prts-scheme-grid)')
      const mark = revealNamedAnimation([
        { offset: 0, translate: revealGroupTranslate(0), rotate: '45deg' },
        { offset: .49, translate: revealGroupTranslate(session.geometry.width * .49), rotate: '45deg' },
        { offset: .51, translate: revealGroupTranslate(session.geometry.width * .51), rotate: '225deg' },
        { offset: 1, translate: revealGroupTranslate(session.geometry.width), rotate: '225deg' },
      ], options, '::view-transition-group(prts-scheme-mark)')
      session.scrubAnimations = [clip, edge, node, grid, gridPhase, mark]
      for (const animation of session.scrubAnimations) {
        animation.pause?.()
        animation.currentTime = session.progress * session.duration
      }
    } catch {}
  }

  function setRevealProgress(session, value) {
    if (!session || session.settled) return
    session.progress = revealProgress(value)
    session.revealX = session.progress * session.geometry.width
    root.style.setProperty('--prts-scheme-reveal-x', `${session.revealX}px`)
    if (session.scrubAnimations) {
      try {
        for (const animation of session.scrubAnimations) {
          animation.pause?.()
          animation.currentTime = session.progress * session.duration
        }
      } catch {}
    }
    updateRevealHud(session)
  }

  function cancelRevealAnimation(session) {
    const animations = session?.progressAnimations || []
    session.progressAnimations = undefined
    for (const animation of animations) {
      try { animation?.cancel?.() } catch {}
    }
    for (const animation of session?.completedAnimations || []) {
      try { animation?.cancel?.() } catch {}
    }
    if (session) session.completedAnimations = undefined
    for (const animation of session?.scrubAnimations || []) {
      try { animation?.cancel?.() } catch {}
    }
    if (session) session.scrubAnimations = undefined
  }

  function animateRevealTo(session, value, duration, easing) {
    if (!session || session.settled) return Promise.resolve(false)
    cancelRevealAnimation(session)
    const targetProgress = revealProgress(value)
    const targetX = revealTargetX(session, targetProgress)
    if (!(duration > 0)) {
      setRevealProgress(session, targetProgress)
      return Promise.resolve(true)
    }
    let animations
    try {
      const options = {
        duration: Math.round(duration),
        easing,
        fill: 'forwards',
      }
      const clip = root.animate([
        { clipPath: revealClipPath(session, session.revealX) },
        { clipPath: revealClipPath(session, targetX) },
      ], {
        ...options,
        pseudoElement: '::view-transition-new(root)',
      })
      const edge = revealNamedAnimation([
        { translate: revealGroupTranslate(session.revealX) },
        { translate: revealGroupTranslate(targetX) },
      ], options, '::view-transition-group(prts-scheme-edge)')
      const node = revealNamedAnimation([
        { translate: revealGroupTranslate(session.revealX) },
        { translate: revealGroupTranslate(targetX) },
      ], options, '::view-transition-group(prts-scheme-node)')
      const grid = revealNamedAnimation([
        { translate: revealGroupTranslate(session.revealX) },
        { translate: revealGroupTranslate(targetX) },
      ], options, '::view-transition-group(prts-scheme-grid)')
      const gridPhase = revealNamedAnimation([
        { backgroundPosition: revealGridPosition(session.revealX) },
        { backgroundPosition: revealGridPosition(targetX) },
      ], options, '::view-transition-new(prts-scheme-grid)')
      const nodeProgress = revealNamedAnimation([
        { backgroundSize: `2px ${session.progress * 48}px` },
        { backgroundSize: `2px ${targetProgress * 48}px` },
      ], options, '::view-transition-new(prts-scheme-node)')
      const mark = revealNamedAnimation([
        { translate: revealGroupTranslate(session.revealX), rotate: session.progress >= .5 ? '225deg' : '45deg' },
        { translate: revealGroupTranslate(targetX), rotate: targetProgress >= .5 ? '225deg' : '45deg' },
      ], options, '::view-transition-group(prts-scheme-mark)')
      animations = [clip, edge, node, grid, gridPhase, nodeProgress, mark]
    } catch {
      setRevealProgress(session, targetProgress)
      return Promise.resolve(true)
    }
    session.progressAnimations = animations
    return Promise.all(animations.map(animation => Promise.resolve(animation?.finished).then(() => true, () => false))).then(results => {
      const completed = results.every(Boolean)
      if (!completed || session.settled || session.progressAnimations !== animations) return false
      session.progressAnimations = undefined
      session.completedAnimations = animations
      session.progress = targetProgress
      session.revealX = targetX
      root.style.setProperty('--prts-scheme-reveal-x', `${session.revealX}px`)
      updateRevealHud(session)
      return true
    })
  }

  function requestHostScheme(value) {
    try {
      return Promise.resolve(service?.setTheme?.(value)).then(() => true, () => false)
    } catch {
      return Promise.resolve(false)
    }
  }

  function restoreRevealSource(session) {
    if (!session) return Promise.resolve(false)
    session.restoreRequested = true
    if (session.restorePromise) return session.restorePromise
    session.restorePromise = Promise.resolve(session.hostRequest).then(async accepted => {
      if (accepted && !(await requestHostScheme(session.source))) return false
      applyScheme(session.source)
      session.hostAccepted = false
      return true
    })
    return session.restorePromise
  }

  function finishRevealSession(session, { commit }) {
    if (!session || session.settled) return
    session.committed = commit
    session.settled = true
    cancelRevealAnimation(session)
    if (!commit) applyScheme(session.source)
    try { session.viewTransition?.skipTransition?.() } catch {}
    removeRevealHud(session)
    if (activeTransition?.token === session.token) activeTransition = undefined
    clearTransitionState()
    setTransitionState(false)
  }

  function createRevealSession(target, options = {}) {
    cancelActiveTransition({ keepPaused: true })
    setTransitionState(true)
    const source = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
    const geometry = revealViewport(options.origin)
    const interactive = options.interactive === true
    const initialProgress = interactive ? revealProgress(options.progress) : 0
    const duration = revealDuration(geometry.width)
    const token = ++transitionRevision
    let resolveHostReady
    const session = {
      token,
      target,
      source,
      geometry,
      interactive,
      progress: initialProgress,
      revealX: interactive ? initialProgress * geometry.width : -REVEAL_EDGE_OVERSCAN,
      duration,
      settled: false,
      committed: false,
      hostAccepted: false,
      hostReady: new Promise(resolve => { resolveHostReady = resolve }),
    }
    root.style.setProperty('--prts-scheme-origin-x', `${geometry.x}px`)
    root.style.setProperty('--prts-scheme-origin-y', `${geometry.y}px`)
    root.style.setProperty('--prts-scheme-duration', `${interactive ? 3600000 : duration}ms`)
    root.style.setProperty('--prts-scheme-reveal-x', `${session.revealX}px`)
    root.style.setProperty('--prts-scheme-control-progress', String(initialProgress))
    root.style.setProperty('--prts-scheme-control-meter-height', `${initialProgress * 48}px`)
    root.style.setProperty('--prts-scheme-control-value-image', revealValueImageUrl(initialProgress * 100))
    root.setAttribute(TRANSITION_ATTRIBUTE, target)
    root.setAttribute(TRANSITION_MODE_ATTRIBUTE, 'view')
    root.toggleAttribute(TRANSITION_INTERACTIVE_ATTRIBUTE, interactive)

    session.cancel = () => {
      if (session.settled) return
      session.settled = true
      cancelRevealAnimation(session)
      if (session.interactive && !session.committed) void restoreRevealSource(session)
      removeRevealHud(session)
    }
    activeTransition = session

    let viewTransition
    try {
      viewTransition = document.startViewTransition(async () => {
        session.hostRequest = requestHostScheme(target)
        const accepted = await session.hostRequest
        session.hostAccepted = accepted
        if (!accepted) {
          applyScheme(source)
          resolveHostReady(false)
          return
        }
        if (session.settled || session.restoreRequested) {
          await restoreRevealSource(session)
          resolveHostReady(false)
          return
        }
        applyScheme(target)
        mountRevealHud(session)
        resolveHostReady(true)
      })
    } catch {
      resolveHostReady(false)
      if (activeTransition?.token === token) activeTransition = undefined
      removeRevealHud(session)
      clearTransitionState()
      applyScheme(source)
      setTransitionState(false)
      return undefined
    }
    session.viewTransition = viewTransition
    session.ready = Promise.all([
      Promise.resolve(viewTransition?.ready).then(() => true, () => false),
      session.hostReady,
    ]).then(([viewReady, hostReady]) => {
      const ready = viewReady && hostReady
      if (ready && activeTransition?.token === token && !session.settled) {
        createInteractiveScrub(session)
      }
      return ready
    })
    return session
  }

  async function commitRevealScheme(target, origin) {
    const session = createRevealSession(target, { origin })
    if (!session) return root.dataset.prtsScheme
    const ready = await session.ready
    if (!ready) {
      if (!session.settled) finishRevealSession(session, { commit: false })
      return session.source
    }
    if (activeTransition?.token !== session.token || session.settled) return root.dataset.prtsScheme
    await animateRevealTo(session, 1, session.duration, 'cubic-bezier(.4, 0, .2, 1)')
    await releaseRevealHud(session)
    if (activeTransition?.token === session.token && !session.settled) finishRevealSession(session, { commit: true })
    return target
  }

  function fallbackGesture(target, source) {
    let progress = 0
    let settled = false
    return {
      update(value) { if (!settled) progress = revealProgress(value) },
      finish(commit = progress >= .5) {
        if (settled) return root.dataset.prtsScheme
        settled = true
        return commit ? setTheme(target, { animate: false }) : source
      },
      cancel() {
        if (settled) return source
        settled = true
        return source
      },
    }
  }

  function beginThemeTransition(id, options = {}) {
    const target = id === 'dark' ? 'dark' : 'light'
    const source = root.dataset.prtsScheme === 'dark' ? 'dark' : 'light'
    if (disposed || target === source || !canAnimateScheme({ ...options, animate: true })) return fallbackGesture(target, source)
    const session = createRevealSession(target, { ...options, interactive: true })
    if (!session) return fallbackGesture(target, source)
    let finishPromise

    const finish = commit => {
      if (finishPromise) return finishPromise
      if (session.settled || activeTransition?.token !== session.token) return Promise.resolve(root.dataset.prtsScheme)
      root.removeAttribute(TRANSITION_INTERACTIVE_ATTRIBUTE)
      root.toggleAttribute(TRANSITION_ARMED_ATTRIBUTE, commit)
      if (session.hud) session.hud.dataset.prtsSchemeRevealMode = 'settling'
      const visualDuration = commit
        ? Math.max(90, Math.round(session.duration * (1 - session.progress)))
        : Math.max(90, Math.round(session.duration * session.progress * .72))
      const visual = session.ready.then(ready => {
        if (!ready || session.settled) return false
        return animateRevealTo(
          session,
          commit ? 1 : 0,
          visualDuration,
          commit ? 'cubic-bezier(.22, 1, .36, 1)' : 'cubic-bezier(.4, 0, .2, 1)',
        )
      })

      if (!commit) {
        finishPromise = visual.then(async () => {
          await releaseRevealHud(session)
          await restoreRevealSource(session)
          if (!session.settled) finishRevealSession(session, { commit: false })
          return session.source
        })
        return finishPromise
      }

      finishPromise = visual.then(async () => {
        if (!session.hostAccepted) {
          if (!session.settled) finishRevealSession(session, { commit: false })
          refresh()
          return root.dataset.prtsScheme
        }
        await releaseRevealHud(session)
        if (!session.settled) finishRevealSession(session, { commit: true })
        return target
      })
      return finishPromise
    }

    return {
      update(progress) {
        if (session.settled || activeTransition?.token !== session.token) return
        setRevealProgress(session, progress)
      },
      finish,
      cancel() { return finish(false) },
    }
  }

  function commitAnimatedScheme(target, origin) {
    return commitRevealScheme(target, origin)
  }

  function setTheme(id, options = {}) {
    const target = id === 'dark' ? 'dark' : 'light'
    const revision = ++setRevision
    const animate = canAnimateScheme(options) && target !== root.dataset.prtsScheme

    if (animate) return commitAnimatedScheme(target, options.origin)

    const commit = () => {
      if (disposed || revision !== setRevision) return root.dataset.prtsScheme
      return applyScheme(target)
    }
    const fail = () => {
      if (disposed || revision !== setRevision) return root.dataset.prtsScheme
      const result = refresh()
      if (result && typeof result.then === 'function') {
        return result.then(() => root.dataset.prtsScheme)
      }
      return root.dataset.prtsScheme
    }

    try {
      const result = service?.setTheme?.(target)
      if (result && typeof result.then === 'function') return result.then(commit).catch(fail)
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
        cancelActiveTransition()
        clearThemeState()
        return
      }
      root.setAttribute('data-dsh-prts', '')
      root.dataset.prtsTexture = preferences.texture
      root.dataset.prtsGlass = preferences.glass
      root.dataset.prtsMotion = preferences.motion
      root.dataset.prtsParticlePattern = 'orthogonal'
      root.dataset.prtsSessionFlow = preferences.sessionFlow ? 'on' : 'off'
      root.dataset.prtsConversationStyle = preferences.conversationStyle
      refresh()
    },
    sync,
    refresh,
    setTheme,
    beginThemeTransition,
    toggle,
    dispose: removeOwnedState,
  }
}
