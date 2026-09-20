const HOVER_SETTLE = 180
const STATIC_TIME = 2.4
const POINT_COUNT = 9

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function number(value) {
  return Number(value.toFixed(3))
}

function readGeometry(lifeline) {
  const start = Number(lifeline?.getAttribute?.('data-prts-lifeline-start'))
  const end = Number(lifeline?.getAttribute?.('data-prts-lifeline-end'))
  const baseline = Number(lifeline?.getAttribute?.('data-prts-lifeline-baseline'))
  const lift = Number(lifeline?.getAttribute?.('data-prts-lifeline-lift'))
  if (![start, end, baseline, lift].every(Number.isFinite) || end <= start || lift <= 0) return null
  return { start, end, baseline, lift }
}

function filamentNodes(lifeline) {
  if (!lifeline) return []
  if (lifeline.matches?.('[data-prts-session-lifeline-filament]')) return [lifeline]
  return Array.from(lifeline.querySelectorAll?.('[data-prts-session-lifeline-filament]') ?? [])
}

function createSmoothPath(points) {
  if (points.length < 2) return ''
  const commands = [`M ${number(points[0].x)} ${number(points[0].y)}`]
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)]
    const current = points[index]
    const next = points[index + 1]
    const following = points[Math.min(points.length - 1, index + 2)]
    const firstControl = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    }
    const secondControl = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6,
    }
    commands.push([
      'C',
      number(firstControl.x),
      number(firstControl.y),
      number(secondControl.x),
      number(secondControl.y),
      number(next.x),
      number(next.y),
    ].join(' '))
  }
  return commands.join(' ')
}

function sampleFlow(u, time, strand) {
  const edgeEnvelope = Math.sin(Math.PI * u) ** .88
  const slowTurn = Math.sin(time * .43 + u * Math.PI * 1.16 + Math.sin(time * .13) * .48)
  const crossCurrent = Math.sin(time * -.29 + u * Math.PI * 2.42 + .7)
  const fineCurrent = Math.sin(time * .19 + u * Math.PI * 3.76 - .9)
  const sharedFlow = slowTurn * .52 + crossCurrent * .24 + fineCurrent * .08

  const fan = Math.sin(Math.PI * u) ** 1.35
  const separation = strand * (.15 + Math.sin(time * .31 + u * Math.PI * 1.48 + strand * .8) * .1)
  const independentDrift = Math.sin(time * (.36 + strand * .021) + u * Math.PI * 2.18 + strand * 1.35) * .055
  return edgeEnvelope * clamp(sharedFlow + fan * separation + independentDrift, -.9, .9)
}

export function createSessionLifelinePath(geometry, time = STATIC_TIME, strength = 1, strand = 0) {
  const { start, end, baseline, lift } = geometry
  const span = end - start
  const tension = clamp(strength, 0, 1)
  const points = []
  for (let index = 0; index < POINT_COUNT; index += 1) {
    const u = index / (POINT_COUNT - 1)
    points.push({
      x: start + span * u,
      y: baseline - lift * sampleFlow(u, time, strand) * tension,
    })
  }
  return createSmoothPath(points)
}

export function configureSessionLifeline(lifeline, { start, end, baseline, lift }) {
  if (!lifeline) return false
  const geometry = { start, end, baseline, lift }
  lifeline.setAttribute('data-prts-lifeline-start', String(number(start)))
  lifeline.setAttribute('data-prts-lifeline-end', String(number(end)))
  lifeline.setAttribute('data-prts-lifeline-baseline', String(number(baseline)))
  lifeline.setAttribute('data-prts-lifeline-lift', String(number(lift)))
  filamentNodes(lifeline).forEach((filament, index, filaments) => {
    const strand = filaments.length === 1 ? 0 : index - (filaments.length - 1) / 2
    filament.setAttribute('d', createSessionLifelinePath(geometry, STATIC_TIME, 1, strand))
  })
  return true
}

export function createSessionLifelineAnimator({ document, window }) {
  const requestFrame = window?.requestAnimationFrame?.bind(window)
    ?? (callback => window?.setTimeout?.(() => callback(Date.now()), 1000 / 60))
  const cancelFrame = window?.cancelAnimationFrame?.bind(window)
    ?? window?.clearTimeout?.bind(window)
  const reducedMotion = window?.matchMedia?.('(prefers-reduced-motion: reduce)')
  const MotionObserver = window?.MutationObserver

  let frame
  let lastTime
  let flowTime = STATIC_TIME
  let strength = 1
  let row
  let lifeline
  let filaments = []
  let hovered = false
  let motionObserver

  function render() {
    const geometry = readGeometry(lifeline)
    if (!geometry || filaments.length === 0) return false
    filaments.forEach((filament, index) => {
      const strand = filaments.length === 1 ? 0 : index - (filaments.length - 1) / 2
      filament.setAttribute('d', createSessionLifelinePath(geometry, flowTime, strength, strand))
    })
    return true
  }

  function canAnimate() {
    return Boolean(
      row?.isConnected
      && lifeline?.isConnected
      && row.getAttribute('aria-selected') === 'true'
      && document?.visibilityState !== 'hidden'
      && document?.documentElement?.dataset?.prtsSessionFlow !== 'off'
      && document?.documentElement?.dataset?.prtsMotion !== 'reduced'
      && !reducedMotion?.matches
    )
  }

  function cancel() {
    if (frame !== undefined) cancelFrame?.(frame)
    frame = undefined
    lastTime = undefined
  }

  function needsFrame() {
    return canAnimate() && (!hovered || strength > 0)
  }

  function schedule() {
    if (frame !== undefined || !needsFrame()) return
    frame = requestFrame?.(tick)
  }

  function tick(time) {
    frame = undefined
    if (!canAnimate()) {
      lastTime = undefined
      return
    }
    const now = Number.isFinite(time) ? time : Date.now()
    if (lastTime === undefined) lastTime = now
    const elapsed = Math.min(100, Math.max(0, now - lastTime))
    lastTime = now
    flowTime += elapsed / 1000
    const target = hovered ? 0 : 1
    if (strength !== target) {
      const step = elapsed / HOVER_SETTLE
      strength = target > strength
        ? Math.min(target, strength + step)
        : Math.max(target, strength - step)
    }
    render()
    schedule()
  }

  function motionReduced() {
    return document?.documentElement?.dataset?.prtsMotion === 'reduced' || reducedMotion?.matches
  }

  function syncMotion() {
    if (canAnimate()) {
      schedule()
      return
    }
    cancel()
    if (lifeline && motionReduced()) {
      flowTime = STATIC_TIME
      strength = 1
      render()
    }
  }

  function onPointerEnter() {
    hovered = true
    syncMotion()
  }

  function onPointerLeave() {
    hovered = false
    syncMotion()
  }

  function detachRow() {
    row?.removeEventListener?.('pointerenter', onPointerEnter)
    row?.removeEventListener?.('pointerleave', onPointerLeave)
  }

  function attachObservers() {
    document?.addEventListener?.('visibilitychange', syncMotion)
    reducedMotion?.addEventListener?.('change', syncMotion)
    if (!motionObserver && typeof MotionObserver === 'function' && document?.documentElement) {
      motionObserver = new MotionObserver(syncMotion)
      motionObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-prts-motion', 'data-prts-session-flow'],
      })
    }
  }

  return {
    start() {
      attachObservers()
      syncMotion()
    },
    setTarget(nextRow, nextLifeline) {
      if (row === nextRow && lifeline === nextLifeline) {
        syncMotion()
        return
      }
      cancel()
      detachRow()
      row = nextRow
      lifeline = nextLifeline
      filaments = filamentNodes(lifeline)
      hovered = Boolean(row?.matches?.(':hover'))
      flowTime = STATIC_TIME
      strength = hovered ? 0 : 1
      row?.addEventListener?.('pointerenter', onPointerEnter)
      row?.addEventListener?.('pointerleave', onPointerLeave)
      render()
      syncMotion()
    },
    dispose() {
      cancel()
      detachRow()
      row = undefined
      lifeline = undefined
      filaments = []
      motionObserver?.disconnect()
      motionObserver = undefined
      document?.removeEventListener?.('visibilitychange', syncMotion)
      reducedMotion?.removeEventListener?.('change', syncMotion)
    },
  }
}
