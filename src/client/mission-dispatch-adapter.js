// Decorate the host's recorded Turn triggers without replacing its controls or text.
export function createMissionDispatchAdapter({ document, window, emblemImage }) {
  let operation
  let observer
  const owned = new Map()

  function stopMotion(card, record) {
    record.animation?.cancel()
    record.motionNode?.removeAttribute('data-prts-mission-motion')
    record.ghost?.remove()
    record.animation = record.motionNode = record.ghost = undefined
    card.removeAttribute('data-prts-mission-transition')
  }

  function updateBody(card, record) {
    const body = card.querySelector(':scope > div:not([data-prts-mission-exit])')
    const expanded = record.header.getAttribute('aria-expanded') === 'true'
    if (body === record.body && expanded === record.expanded) return
    const previous = record.body
    const previousHeight = record.bodyHeight
    stopMotion(card, record)
    record.body = body
    record.expanded = expanded
    record.bodyHeight = body?.getBoundingClientRect().height || 0
    if (!window?.Element?.prototype.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let node, frames
    if (body && expanded) {
      node = body
      frames = [{ height: '0px', opacity: 0 }, { height: `${record.bodyHeight}px`, opacity: 1 }]
    } else if (previous && !body && previousHeight > 0) {
      node = previous.cloneNode(true)
      node.setAttribute('data-prts-mission-exit', '')
      node.setAttribute('aria-hidden', 'true')
      node.setAttribute('inert', '')
      for (const element of [node, ...node.querySelectorAll('[id]')]) element.removeAttribute('id')
      record.ghost = node
      card.append(node)
      frames = [{ height: `${previousHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }]
    }
    if (!node) return
    node.setAttribute('data-prts-mission-motion', '')
    card.setAttribute('data-prts-mission-transition', '')
    record.motionNode = node
    const animation = node.animate(frames, { duration: expanded ? 240 : 200, easing: 'cubic-bezier(.22,.61,.36,1)' })
    record.animation = animation
    animation.onfinish = () => { if (record.animation === animation) stopMotion(card, record) }
  }

  function release(card) {
    const record = owned.get(card)
    if (!record) return
    stopMotion(card, record)
    record.header.removeEventListener('click', record.capture, true)
    for (const node of record.decorations) node.remove()
    for (const node of record.parts) node.removeAttribute('data-prts-mission-part')
    card.removeAttribute('data-prts-mission')
    owned.delete(card)
  }

  function decoration(kind, text) {
    const node = document.createElement('span')
    node.setAttribute('data-prts-mission-decoration', kind)
    node.setAttribute('aria-hidden', 'true')
    if (text) node.textContent = text
    return node
  }

  function decorate(card) {
    if (!operation?.contains(card)) { release(card); return }
    const header = card.querySelector(':scope > button[aria-expanded]')
    const spans = header?.querySelectorAll(':scope > span:not([data-prts-mission-decoration])')
    const icon = spans?.[0]
    const title = spans?.[1]
    const time = header?.querySelector(':scope > time')
    const chevron = header?.querySelector(':scope > svg')
    if (!icon?.querySelector('svg') || !title || !time || !chevron) { release(card); return }
    const record = owned.get(card)
    const parts = [icon, title, time, chevron]
    if (record?.header === header && parts.every((node, index) => record.parts[index] === node)
      && record.decorations.every(node => node.parentElement === header)) { updateBody(card, record); return }
    release(card)
    for (const [index, node] of parts.entries()) {
      node.setAttribute('data-prts-mission-part', ['icon', 'title', 'time', 'chevron'][index])
    }
    const category = decoration('category', '任务下达')
    const caption = decoration('caption', 'MISSION DISPATCH')
    const action = decoration('action')
    action.append(decoration('expand', '展开'), decoration('collapse', '收起'), decoration('details', 'DETAILS'))
    if (emblemImage) {
      const emblem = document.createElement('img')
      emblem.src = emblemImage
      emblem.alt = ''
      action.append(emblem)
    }
    const decorations = [category, caption, action]
    header.append(...decorations)
    card.setAttribute('data-prts-mission', '')
    const next = { header, parts, decorations, body: card.querySelector(':scope > div'), expanded: header.getAttribute('aria-expanded') === 'true' }
    next.bodyHeight = next.body?.getBoundingClientRect().height || 0
    // Capture before React removes the native body, including an interrupted opening.
    next.capture = () => { if (next.body?.isConnected) next.bodyHeight = next.body.getBoundingClientRect().height }
    header.addEventListener('click', next.capture, true)
    owned.set(card, next)
  }

  function collect(node, pending) {
    if (node?.nodeType !== 1) return
    const card = node.closest('[data-turn-trigger]')
    if (card) pending.add(card)
    for (const child of node.querySelectorAll('[data-turn-trigger]')) pending.add(child)
  }

  return {
    start() {
      const next = document?.querySelector('[data-prts-region="operation"]')
      if (operation !== next) {
        observer?.disconnect()
        observer = undefined
        for (const card of owned.keys()) release(card)
      }
      operation = next
      if (!operation) return
      for (const card of operation.querySelectorAll('[data-turn-trigger]')) decorate(card)
      if (observer || !window?.MutationObserver) return
      observer = new window.MutationObserver(mutations => {
        const pending = new Set()
        for (const mutation of mutations) {
          // The host can replace a header's children while keeping its button.
          collect(mutation.target, pending)
          for (const node of mutation.addedNodes) collect(node, pending)
        }
        for (const card of owned.keys()) if (!operation.contains(card)) release(card)
        for (const card of pending) decorate(card)
      })
      observer.observe(operation, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded'] })
    },
    dispose() {
      observer?.disconnect()
      observer = undefined
      for (const card of owned.keys()) release(card)
      operation = undefined
    },
  }
}
