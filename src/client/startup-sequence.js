export const PRTS_STARTUP_TIMINGS = Object.freeze({
  enter: 20,
  minimum: 1350,
  intro: 560,
  approach: 2400,
  finish: 260,
  copyFade: 90,
  readyHold: 280,
  exitLead: 120,
  exit: 470,
  completePadding: 40,
  reducedExit: 160,
  timeout: 20000,
  timeoutHold: 700,
  watchdog: 22000,
})

const STARTUP_STAGES = Object.freeze({
  linking: Object.freeze({ label: 'LINKING', detail: '神经链路接入' }),
  authenticating: Object.freeze({ label: 'AUTHENTICATING', detail: '博士身份校验' }),
  visualOnline: Object.freeze({ label: 'VISUAL LAYER ONLINE', detail: '视觉层已上线' }),
  ready: Object.freeze({ label: 'P.R.T.S. READY', detail: '终端接管完成' }),
})

function startupMarkup(prtsEmblem = '', rhodesEmblem = '') {
  const ticks = Array.from({ length: 21 }, (_, index) => `<i${index % 5 === 0 ? ' data-major' : ''}></i>`).join('')
  return `<section data-prts-startup data-stage="boot" popover="manual" role="status" aria-live="assertive" aria-label="P.R.T.S. 启动序列" tabindex="-1">
    <div data-prts-startup-grid aria-hidden="true"></div>
    <div data-prts-startup-scan aria-hidden="true"></div>
    <div data-prts-startup-cut="left" aria-hidden="true"></div>
    <div data-prts-startup-cut="right" aria-hidden="true"></div>
    <header data-prts-startup-header aria-hidden="true">
      <span>P.R.T.S. // RHODES ISLAND</span>
      <small>NEURAL TERMINAL CONNECTION</small>
    </header>
    <aside data-prts-startup-telemetry aria-hidden="true">
      <span>ORIGIN // RI-001</span>
      <span>PROTOCOL // TACTICAL</span>
      <span>LINK // ENCRYPTED</span>
    </aside>
    <main data-prts-startup-core>
      <div data-prts-startup-frame aria-hidden="true">
        <span data-prts-startup-frame-outer></span>
        <span data-prts-startup-frame-inner></span>
        <span data-prts-startup-reticle></span>
        <img data-prts-startup-emblem src="${prtsEmblem}" alt="">
      </div>
      <div data-prts-startup-signature aria-hidden="true">
        <span>${rhodesEmblem}</span>
        <small>RHODES ISLAND<br>RI-001</small>
      </div>
      <div data-prts-startup-state>
        <strong data-prts-startup-label>INITIALIZING</strong>
        <span data-prts-startup-detail>启动序列初始化</span>
      </div>
    </main>
    <footer data-prts-startup-progress>
      <output aria-hidden="true">BOOT SEQUENCE // <span data-prts-startup-percent>000%</span></output>
      <div data-prts-startup-track aria-hidden="true">
        <b data-prts-startup-fill></b>
        <span data-prts-startup-ticks>${ticks}</span>
      </div>
    </footer>
    <div data-prts-startup-coordinate aria-hidden="true">X 061.38&nbsp;&nbsp;Y 109.42</div>
  </section>`
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - clamp01(value), 3)
}

export function findNativeHarnessLoader(document) {
  return document?.querySelector?.('[data-dsh-boot]') ?? null
}

export function createPrtsStartupSequence({
  document,
  window,
  prtsEmblem = '',
  rhodesEmblem = '',
  timings = PRTS_STARTUP_TIMINGS,
} = {}) {
  const schedule = { ...PRTS_STARTUP_TIMINGS, ...timings }
  let overlay
  let frame
  let inertRecords = []
  let previousFocus
  let startedAt
  let waitForReady = false
  let readyWhen
  let hostReady = false
  let finishStartedAt
  let finishStartedProgress = 0
  let readyStartedAt
  let exitStartedAt
  let timeoutStartedAt
  let currentStage = 'boot'
  let pendingStage
  let copyTransitionStartedAt
  let lastProgress = -1
  let useReducedMotion = false

  const now = () => window?.performance?.now?.() ?? Date.now()
  const requestFrame = callback => window?.requestAnimationFrame?.(callback)
    ?? window?.setTimeout?.(() => callback(now()), 16)
  const cancelFrame = id => {
    if (id === undefined) return
    if (window?.cancelAnimationFrame) window.cancelAnimationFrame(id)
    else window?.clearTimeout?.(id)
  }

  function restoreInteractivity() {
    for (const record of inertRecords) {
      if (!record.node?.isConnected) continue
      record.node.inert = record.inert
      if (record.hadAttribute) record.node.setAttribute('inert', '')
      else record.node.removeAttribute('inert')
    }
    inertRecords = []
  }

  function cleanup({ restoreFocus = true } = {}) {
    cancelFrame(frame)
    frame = undefined
    document?.removeEventListener?.('visibilitychange', onVisibilityChange)
    document?.documentElement?.removeAttribute?.('data-prts-startup-active')
    try {
      overlay?.hidePopover?.()
    } catch {
      // The overlay may already have left the top layer during page teardown.
    }
    overlay?.remove?.()
    overlay = undefined
    restoreInteractivity()
    if (restoreFocus && previousFocus?.isConnected) previousFocus.focus?.()
    previousFocus = undefined
  }

  function updateProgress(progress) {
    if (!overlay) return
    const safeProgress = Math.max(0, Math.min(100, progress))
    if (Math.abs(safeProgress - lastProgress) < .01) return
    lastProgress = safeProgress
    overlay.style.setProperty('--prts-startup-progress', (safeProgress / 100).toFixed(4))
    const percent = overlay.querySelector('[data-prts-startup-percent]')
    if (percent) percent.textContent = `${String(Math.round(safeProgress)).padStart(3, '0')}%`
  }

  function applyStage(name) {
    if (!overlay) return
    const stage = STARTUP_STAGES[name]
    if (!stage) return
    currentStage = name
    overlay.dataset.stage = name
    const label = overlay.querySelector('[data-prts-startup-label]')
    const detail = overlay.querySelector('[data-prts-startup-detail]')
    if (label) label.textContent = stage.label
    if (detail) detail.textContent = stage.detail
    overlay.setAttribute('aria-label', `P.R.T.S. 启动序列：${stage.detail}`)
  }

  function requestStage(name, elapsed) {
    if (!overlay || name === currentStage && !pendingStage) return
    if (!pendingStage) {
      copyTransitionStartedAt = elapsed
      overlay.setAttribute('data-copy-transition', '')
    }
    pendingStage = name
  }

  function advanceStageTransition(elapsed) {
    if (!pendingStage || copyTransitionStartedAt === undefined) return
    if (elapsed - copyTransitionStartedAt < schedule.copyFade) return
    const next = pendingStage
    pendingStage = undefined
    copyTransitionStartedAt = undefined
    applyStage(next)
    overlay?.removeAttribute('data-copy-transition')
    if (next === 'ready') readyStartedAt = elapsed
  }

  function stageForProgress(progress) {
    if (progress >= 68) return 'visualOnline'
    if (progress >= 32) return 'authenticating'
    return 'linking'
  }

  function beginExit(elapsed, { failOpen = false } = {}) {
    if (!overlay || exitStartedAt !== undefined) return
    exitStartedAt = elapsed
    overlay.toggleAttribute('data-fail-open', failOpen)
    overlay.setAttribute('data-exit-content', '')
    if (useReducedMotion) overlay.setAttribute('data-exiting', '')
  }

  function onVisibilityChange() {
    if (document?.visibilityState === 'hidden') cleanup({ restoreFocus: false })
  }

  function reducedMotionRequested(forceReduced) {
    if (typeof forceReduced === 'boolean') return forceReduced
    return document?.documentElement?.dataset?.prtsMotion === 'reduced'
      || window?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true
  }

  function lockSiblings() {
    inertRecords = [...(document?.body?.children ?? [])]
      .filter(node => node !== overlay)
      .map(node => ({ node, hadAttribute: node.hasAttribute('inert'), inert: Boolean(node.inert) }))
    for (const record of inertRecords) {
      record.node.inert = true
      record.node.setAttribute('inert', '')
    }
  }

  function promoteToTopLayer() {
    if (typeof overlay?.showPopover !== 'function') return
    try {
      overlay.showPopover()
    } catch {
      // A recognized but unavailable Popover API must not hide the fixed fallback.
      overlay.removeAttribute('popover')
    }
  }

  function checkHostReady() {
    if (hostReady) return true
    if (!waitForReady) return (hostReady = true)
    try {
      if (readyWhen?.() === true) hostReady = true
    } catch {
      // A transient Host DOM read must not break the fail-open timeline.
    }
    return hostReady
  }

  function tick(timestamp) {
    if (!overlay) return
    const time = Number.isFinite(timestamp) ? timestamp : now()
    startedAt ??= time
    const elapsed = Math.max(0, time - startedAt)
    checkHostReady()

    if (!overlay.hasAttribute('data-visible') && elapsed >= schedule.enter) {
      overlay.setAttribute('data-visible', '')
    }

    if (useReducedMotion) {
      if (!hostReady && timeoutStartedAt === undefined && elapsed >= schedule.timeout) {
        timeoutStartedAt = elapsed
      }
      if (timeoutStartedAt !== undefined && elapsed - timeoutStartedAt >= schedule.timeoutHold) {
        beginExit(elapsed, { failOpen: true })
      } else if (hostReady) {
        beginExit(elapsed)
      }
      if (exitStartedAt !== undefined && elapsed - exitStartedAt >= schedule.reducedExit + schedule.completePadding) {
        cleanup()
        return
      }
    } else if (timeoutStartedAt !== undefined) {
      updateProgress(90)
      if (elapsed - timeoutStartedAt >= schedule.timeoutHold) beginExit(elapsed, { failOpen: true })
    } else {
      const approachProgress = 90 * easeOutCubic(elapsed / schedule.approach)
      let progress = Math.min(90, approachProgress)

      if (!hostReady && elapsed >= schedule.timeout) {
        timeoutStartedAt = elapsed
      } else if (hostReady && elapsed >= schedule.intro) {
        if (finishStartedAt === undefined) {
          finishStartedAt = elapsed
          finishStartedProgress = progress
        }
        progress = finishStartedProgress
          + (100 - finishStartedProgress) * easeOutCubic((elapsed - finishStartedAt) / schedule.finish)
        if (elapsed - finishStartedAt >= schedule.finish) {
          progress = 100
          requestStage('ready', elapsed)
        } else {
          requestStage(stageForProgress(progress), elapsed)
        }
      } else {
        requestStage(stageForProgress(progress), elapsed)
      }

      updateProgress(progress)
      if (readyStartedAt !== undefined) {
        const earliestExit = Math.max(
          readyStartedAt + schedule.readyHold,
          schedule.minimum - schedule.exit - schedule.completePadding,
        )
        if (elapsed >= earliestExit) beginExit(elapsed)
      }
    }

    advanceStageTransition(elapsed)

    if (exitStartedAt !== undefined) {
      if (!useReducedMotion && elapsed - exitStartedAt >= schedule.exitLead) {
        overlay?.setAttribute('data-exiting', '')
      }
      const exitDuration = useReducedMotion ? schedule.reducedExit : schedule.exit
      if (elapsed - exitStartedAt >= exitDuration + schedule.completePadding) {
        cleanup()
        return
      }
    }
    if (elapsed >= schedule.watchdog) {
      cleanup()
      return
    }
    frame = requestFrame(tick)
  }

  function play({ reduced, waitForReady: shouldWait = false, readyWhen: isReady } = {}) {
    if (overlay?.isConnected || !document?.body) return false
    const template = document.createElement('template')
    template.innerHTML = startupMarkup(prtsEmblem, rhodesEmblem).trim()
    overlay = template.content.firstElementChild
    if (!overlay) return false

    startedAt = undefined
    waitForReady = Boolean(shouldWait)
    readyWhen = typeof isReady === 'function' ? isReady : undefined
    hostReady = !waitForReady
    finishStartedAt = undefined
    readyStartedAt = undefined
    exitStartedAt = undefined
    timeoutStartedAt = undefined
    currentStage = 'boot'
    pendingStage = undefined
    copyTransitionStartedAt = undefined
    lastProgress = -1
    useReducedMotion = reducedMotionRequested(reduced)

    previousFocus = document.activeElement
    document.body.appendChild(overlay)
    promoteToTopLayer()
    document.documentElement.setAttribute('data-prts-startup-active', '')
    lockSiblings()
    overlay.focus?.({ preventScroll: true })
    document.addEventListener('visibilitychange', onVisibilityChange)

    if (useReducedMotion) {
      overlay.setAttribute('data-reduced-motion', '')
      overlay.setAttribute('data-visible', '')
      applyStage('visualOnline')
      updateProgress(90)
    }
    frame = requestFrame(tick)
    return true
  }

  return {
    play,
    ready() { hostReady = true },
    stop: cleanup,
    dispose: cleanup,
    isActive: () => Boolean(overlay?.isConnected),
  }
}
