import { createMobileInspect } from './mobile-inspect.js'
import { createMobileReplay } from './mobile-replay.js'

// Restore host metadata when the theme is disabled or hot-reloaded.
export function createMobileViewport({ document, window }) {
  if (new window.URLSearchParams(window.location.search).get('prts-mobile-inspect') === 'replay') return createMobileReplay({ document, window })
  const edits = new Map()
  const hostColors = new Map()
  let themeColor, tint, inspect
  const root = document.documentElement
  let active = false, frame, image, imageUrl, sampled, inputs
  const raf = window.requestAnimationFrame?.bind(window) ?? (fn => window.setTimeout(fn, 16))
  const cancel = window.cancelAnimationFrame?.bind(window) ?? window.clearTimeout.bind(window)
  const observer = new window.MutationObserver(() => {
    // Ignore cursor/transition variables and our own tint writes.
    const next = ['full', 'conversation'].flatMap(slot => [
      root.getAttribute(`data-prts-background-${slot}`),
      ...[`--prts-background-${slot}`, `--prts-protected-${slot}-x`, `--prts-protected-${slot}-y`].map(name => root.style.getPropertyValue(name)),
    ]).concat(root.dataset.prtsBackgroundMode, root.style.getPropertyValue('--prts-background-shade')).join('|')
    if (inputs !== next) { inputs = next; schedule() }
  })
  const colorObserver = new window.MutationObserver(records => {
    // Head styles may change independently; only meta changes need reconciliation.
    if (records.some(record => record.type === 'attributes' ? record.target.tagName === 'META'
      : [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === 1 && (node.tagName === 'META' || node.querySelector('meta'))))) syncHostColors()
  })

  function restoreColor(node, edit) {
    if (node.getAttribute('content') !== edit.applied) return
    if (edit.original === null) node.removeAttribute('content')
    else node.setAttribute('content', edit.original)
  }

  function syncHostColors() {
    if (!active || !tint) return
    // Safari can retain the host declaration despite a preceding theme-owned node.
    // Keep every candidate in agreement, including nodes added after theme startup.
    const nodes = new Set(document.head.querySelectorAll('meta[name="theme-color" i]'))
    for (const [node, edit] of hostColors) if (!nodes.has(node)) { restoreColor(node, edit); hostColors.delete(node) }
    for (const node of nodes) {
      const content = node.getAttribute('content')
      if (node !== themeColor) {
        let edit = hostColors.get(node)
        if (!edit) { edit = { original: content }; hostColors.set(node, edit) }
        else if (content !== edit.applied) edit.original = content
        edit.applied = tint
      }
      if (content !== tint) node.setAttribute('content', tint)
    }
  }

  function paintColor(color) {
    tint = inspect?.color(color) ?? color
    syncHostColors()
    if (root.style.getPropertyValue('--prts-browser-chrome-color') !== color) root.style.setProperty('--prts-browser-chrome-color', color)
  }

  function schedule() {
    if (active && frame === undefined) frame = raf(updateColor)
  }

  function updateColor() {
    frame = undefined
    if (!active) return
    const styles = window.getComputedStyle(root)
    const base = styles.getPropertyValue('--prts-canvas').trim() || (root.dataset.prtsScheme === 'light' ? '#eef1f3' : '#080a0c')
    // Only sample wallpaper actually painted on the body, not desktop split panels.
    const body = window.getComputedStyle(document.body)
    const url = body.backgroundImage?.match(/url\("?([^"\)]+)"?\)/)?.[1]
    if (url !== imageUrl) {
      imageUrl = url
      image = undefined
      sampled = undefined
      if (url) {
        const loading = new window.Image()
        image = loading
        loading.onload = () => { if (image === loading) schedule() }
        loading.src = url
      }
    }
    if (!image?.complete || !image.naturalWidth) { paintColor(base); return }
    const width = document.body.clientWidth, height = document.body.clientHeight
    const x = body.backgroundPositionX.split(',')[1].trim()
    const y = body.backgroundPositionY.split(',')[1].trim()
    const shade = Math.max(0, Math.min(1, parseFloat(styles.getPropertyValue('--prts-background-shade')) / 100 || 0))
    const key = [url, width, height, x, y, shade, base].join('|')
    if (sampled === key) return
    sampled = key
    try {
      // A tiny strip follows cover cropping and protected-image positioning.
      // Reuse the browser's image cache; never read a full-size pixel buffer.
      const canvas = document.createElement('canvas')
      canvas.width = 32; canvas.height = 1
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const offset = (position, remaining) => position.endsWith('%') ? remaining * parseFloat(position) / 100 : parseFloat(position) || 0
      const left = offset(x, width - image.naturalWidth * scale)
      const top = offset(y, height - image.naturalHeight * scale)
      ctx.fillStyle = base
      ctx.fillRect(0, 0, 32, 1)
      ctx.drawImage(image, -left / scale, -top / scale, width / scale, 4 / scale, 0, 0, 32, 1)
      ctx.globalAlpha = shade
      ctx.fillRect(0, 0, 32, 1)
      const pixels = ctx.getImageData(0, 0, 32, 1).data
      const rgb = [0, 1, 2].map(channel => {
        let sum = 0
        for (let i = channel; i < pixels.length; i += 4) sum += pixels[i]
        return Math.round(sum / 32)
      })
      paintColor(`rgb(${rgb.join(', ')})`)
    } catch {
      // Image load / canvas restrictions must never break the theme.
      paintColor(base)
    }
  }

  function remember(name, node, created = false) {
    const original = node.hasAttribute('data-prts-mobile-content-absent') ? null : node.getAttribute('data-prts-mobile-original') ?? node.getAttribute('content')
    const edit = { node, created: created || node.hasAttribute('data-prts-mobile-created'), original, applied: node.getAttribute('content') }
    for (const attribute of ['data-prts-mobile-created', 'data-prts-mobile-original', 'data-prts-mobile-content-absent']) node.removeAttribute(attribute)
    edits.set(name, edit)
    return edit
  }

  // Safe mode may disable the controller before its first sync.
  for (const node of document.head.querySelectorAll('meta[data-prts-mobile-created], meta[data-prts-mobile-original], meta[data-prts-mobile-content-absent]')) remember(node.name, node)

  function setMeta(name, content) {
    let edit = edits.get(name)
    if (!edit) {
      const existing = document.head.querySelector(`meta[name="${name}"]`)
      const node = existing || document.createElement('meta')
      edit = remember(name, node, !existing)
      node.name = name
      if (!existing) document.head.appendChild(node)
    }
    edit.node.content = content
    edit.applied = content
  }

  function restoreMeta(name) {
    const edit = edits.get(name)
    if (!edit) return
    const { node, created, original, applied } = edit
    if (node.getAttribute('content') === applied) {
      if (created) node.remove()
      else if (original === null) node.removeAttribute('content')
      else node.setAttribute('content', original)
    }
    edits.delete(name)
  }

  return {
    sync() {
      if (!root.hasAttribute('data-dsh-prts')) return
      const viewport = document.head.querySelector('meta[name="viewport"]')?.content || 'width=device-width, initial-scale=1'
      const directives = viewport.split(',').map(value => value.trim()).filter(value => value && !/^viewport-fit\s*=/i.test(value))
      setMeta('viewport', [...directives, 'viewport-fit=cover'].join(', '))
      setMeta('apple-mobile-web-app-capable', 'yes')
      // Keep the launch mode stable: changing it cannot rebuild an iOS standalone window.
      setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent')
      if (!themeColor) {
        themeColor = document.createElement('meta')
        themeColor.name = 'theme-color'
        themeColor.dataset.prtsBrowserChrome = ''
        document.head.prepend(themeColor)
      }
      sampled = undefined
      if (!active) {
        active = true
        inspect = createMobileInspect({ document, window, onChange() { sampled = undefined; schedule() } })
        observer.observe(root, { attributes: true, attributeFilter: ['style', 'data-prts-background-mode', 'data-prts-background-full', 'data-prts-background-conversation'] })
        colorObserver.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content', 'name'] })
        window.addEventListener('resize', schedule)
      }
      cancel(frame); frame = undefined
      updateColor()
    },
    dispose() {
      active = false
      inspect?.dispose(); inspect = undefined
      observer.disconnect()
      colorObserver.disconnect()
      window.removeEventListener('resize', schedule)
      cancel(frame); frame = undefined
      if (image) image.onload = null
      image = imageUrl = sampled = inputs = undefined
      root.style.removeProperty('--prts-browser-chrome-color')
      themeColor?.remove()
      themeColor = undefined
      tint = undefined
      for (const [node, edit] of hostColors) restoreColor(node, edit)
      hostColors.clear()
      for (const name of edits.keys()) restoreMeta(name)
    },
  }
}
