const USER_TURN_SELECTOR = [
  '[data-chat-flow-kind="user"]',
  '[data-chat-flow-kind="user-step"]',
  '[data-message-role="user"]',
].join(',')

const RECORD_LIMIT = 240

function nodeLabel(node) {
  if (!node?.tagName) return ''
  const role = node.getAttribute?.('data-chat-flow-kind')
    || node.getAttribute?.('data-message-role')
    || node.getAttribute?.('data-prts-conversation-control')
    || node.getAttribute?.('data-prts-to-bottom')
  return `${node.tagName.toLowerCase()}${role ? `[${role}]` : ''}`
}

export function createLayoutStabilityDiagnostics({ document, window }) {
  let frame
  let performanceObserver
  let mutationObserver
  let started = false
  let lastSample
  let lastUserInput = 0
  const records = []

  function enabled() {
    if (document?.documentElement?.dataset?.prtsDiagnostics === 'layout') return true
    try {
      return new URLSearchParams(window?.location?.search ?? '').get('prtsDiagnostics') === 'layout'
    } catch {
      return false
    }
  }

  function push(type, detail = {}) {
    records.push({
      type,
      time: Number((window?.performance?.now?.() ?? Date.now()).toFixed?.(2) ?? Date.now()),
      sinceUserInput: Math.max(0, Date.now() - lastUserInput),
      ...detail,
    })
    if (records.length > RECORD_LIMIT) records.splice(0, records.length - RECORD_LIMIT)
  }

  function visibleAnchor(scroller) {
    const scrollerBox = scroller?.getBoundingClientRect?.()
    if (!scrollerBox) return {}
    for (const turn of scroller.querySelectorAll?.(USER_TURN_SELECTOR) ?? []) {
      const box = turn.getBoundingClientRect?.()
      if (box && box.bottom > scrollerBox.top && box.top < scrollerBox.bottom) {
        return { node: nodeLabel(turn), top: Number(box.top.toFixed(2)) }
      }
    }
    return {}
  }

  function sample() {
    frame = undefined
    if (!started) return
    const scroller = document?.querySelector?.('[data-prts-region="operation"] [data-conversation-scroll]')
    if (scroller) {
      const anchor = visibleAnchor(scroller)
      const next = {
        scrollTop: Number(Number(scroller.scrollTop).toFixed(2)),
        scrollHeight: Number(scroller.scrollHeight),
        clientHeight: Number(scroller.clientHeight),
        anchor: anchor.node,
        anchorTop: anchor.top,
      }
      if (lastSample) {
        const scrollDelta = next.scrollTop - lastSample.scrollTop
        const heightDelta = next.scrollHeight - lastSample.scrollHeight
        const anchorDelta = next.anchor === lastSample.anchor && Number.isFinite(next.anchorTop) && Number.isFinite(lastSample.anchorTop)
          ? Number((next.anchorTop - lastSample.anchorTop).toFixed(2))
          : undefined
        if (scrollDelta || heightDelta || anchorDelta) {
          push('geometry', { scrollDelta, heightDelta, anchorDelta, anchor: next.anchor })
        }
      }
      lastSample = next
    } else {
      lastSample = undefined
    }
    frame = window?.requestAnimationFrame?.(sample)
  }

  function onUserInput(event) {
    lastUserInput = Date.now()
    push('input', { event: event.type, key: event.key })
  }

  function startPerformanceObserver() {
    const PerformanceObserver = window?.PerformanceObserver
    if (typeof PerformanceObserver !== 'function') return
    try {
      performanceObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            push('layout-shift', {
              value: entry.value,
              recentInput: entry.hadRecentInput,
              sources: (entry.sources ?? []).map(source => nodeLabel(source.node)).filter(Boolean),
            })
          } else if (entry.entryType === 'longtask') {
            push('long-task', { duration: Number(entry.duration.toFixed(2)) })
          }
        }
      })
      performanceObserver.observe({ type: 'layout-shift', buffered: true })
      performanceObserver.observe({ type: 'longtask', buffered: true })
    } catch {
      performanceObserver?.disconnect?.()
      performanceObserver = undefined
    }
  }

  return {
    start() {
      if (started || !enabled()) return false
      started = true
      window.__PRTS_LAYOUT_DIAGNOSTICS__ = records
      for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        document?.addEventListener?.(type, onUserInput, { capture: true, passive: true })
      }
      if (window?.MutationObserver && document?.body) {
        mutationObserver = new window.MutationObserver(mutations => {
          for (const mutation of mutations) {
            if (mutation.type === 'attributes') {
              push('adapter-style', {
                attribute: mutation.attributeName,
                node: nodeLabel(mutation.target),
              })
            }
          }
        })
        mutationObserver.observe(document.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ['data-prts-conversation-control', 'data-prts-to-bottom'],
        })
      }
      startPerformanceObserver()
      frame = window?.requestAnimationFrame?.(sample)
      return true
    },
    dispose() {
      started = false
      if (frame !== undefined) window?.cancelAnimationFrame?.(frame)
      frame = undefined
      performanceObserver?.disconnect?.()
      mutationObserver?.disconnect?.()
      performanceObserver = undefined
      mutationObserver = undefined
      for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        document?.removeEventListener?.(type, onUserInput, { capture: true })
      }
      if (window?.__PRTS_LAYOUT_DIAGNOSTICS__ === records) delete window.__PRTS_LAYOUT_DIAGNOSTICS__
      lastSample = undefined
    },
  }
}
