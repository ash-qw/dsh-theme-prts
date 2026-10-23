// Keep host content in place; mount upstream GlassSurface only as a background.
export function createComposerGlassSurface({document, window, mount}) {
  const surfaces = new Map()
  const observed = new Set()
  let observer, resize, frame
  function remove(card, entry) {
    window.clearTimeout(entry.resizeTimer)
    resize?.unobserve(card)
    observed.delete(card)
    entry.unmount()
    entry.container.remove()
    card.removeAttribute('data-prts-composer-glass-active')
    surfaces.delete(card)
  }
  function sync() {
    frame = undefined
    const cards = new Set(document.querySelectorAll('[data-composer-card], [data-prts-composer-fallback]'))
    for (const [card, entry] of surfaces) if (!cards.has(card)) remove(card, entry)
    for (const card of observed) {
      if (cards.has(card)) continue
      resize?.unobserve(card)
      observed.delete(card)
    }
    for (const card of cards) {
      // Hidden composers still need observation so their first visible size mounts glass.
      if (!observed.has(card)) { resize?.observe(card); observed.add(card) }
      // Use layout dimensions, unaffected by host entrance/resize transforms.
      const w = card.offsetWidth
      const h = card.offsetHeight
      if (!w || !h) continue
      let entry = surfaces.get(card)
      if (entry?.width === w && entry?.height === h) continue
      const points = [
        [3,0],[w/2-42,0],[w/2-37,5],[w/2+37,5],[w/2+42,0],
        [w-3,0],[w,3],[w,h-3],[w-3,h],[3,h],[0,h-3],[0,3],
      ].map(([x,y])=>[x+16,y+16].join(',')).join(' ')
      const outline = '<polygon fill="white" points="'+points+'"/>'
      const shape = 'data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="'+(w+32)+'" height="'+(h+32)+'" viewBox="0 0 '+(w+32)+' '+(h+32)+'">'+outline+'</svg>',
      )
      if (!entry) {
        const container = document.createElement('div')
        container.setAttribute('data-prts-composer-glass-surface', '')
        container.setAttribute('aria-hidden', 'true')
        card.prepend(container)
        entry = {container, shape, width:w, height:h, unmount:mount(container, {shape})}
        surfaces.set(card, entry)
        card.setAttribute('data-prts-composer-glass-active', '')
      } else if (entry.shape !== shape) {
        entry.shape = shape
        entry.width = w
        entry.height = h
        // CSS owns the live outline. Rebuild the costly refraction map once
        // resizing settles, instead of decoding a new image on every frame.
        window.clearTimeout(entry.resizeTimer)
        entry.resizeTimer = window.setTimeout(() => {
          entry.resizeTimer = undefined
          entry.unmount.update({shape:entry.shape})
        }, 100)
      }
    }
  }
  function queue() {
    if (frame === undefined) frame = window.requestAnimationFrame(sync)
  }
  return {
    start() {
      if (!mount) return
      document.documentElement.setAttribute('data-prts-composer-enhanced', '')
      if (!observer) {
        resize = new window.ResizeObserver(queue)
        observer = new window.MutationObserver(records => {
          const selector = '[data-composer-card], [data-prts-composer-fallback]'
          if (records.some(record => record.type === 'attributes'
            || [...record.addedNodes, ...record.removedNodes].some(node =>
              node.nodeType === 1 && (node.matches(selector) || node.querySelector(selector))))) queue()
        })
        observer.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:['data-composer-card','data-prts-composer-fallback']})
      }
      sync()
    },
    dispose() {
      document.documentElement.removeAttribute('data-prts-composer-enhanced')
      observer?.disconnect()
      observer = undefined
      resize?.disconnect()
      observed.clear()
      window.cancelAnimationFrame?.(frame)
      frame = undefined
      for (const [card, entry] of surfaces) remove(card, entry)
      resize = undefined
    },
  }
}
