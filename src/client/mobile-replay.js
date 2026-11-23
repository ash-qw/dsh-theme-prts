// Temporary replay of the complete round-13 comparison from the local backup.
// Earlier root and paint splits are archived in the diagnosis notes.
import { createMobileInspect } from './mobile-inspect.js'

export function createMobileReplay({ document, window }) {
  const readout = createMobileInspect({ document, window })
  const viewport = createReplayViewport({ document, window })
  if (new window.URLSearchParams(window.location.search).get('prts-chrome-start') === 'app') readout.record(3)
  function recordClick(event) {
    const button = event.target.closest?.('[data-prts-mobile-chrome-probe] button')
    if (!button) return
    const buttons = [...button.parentElement.querySelectorAll('button')]
    readout.record(buttons.indexOf(button))
  }
  document.addEventListener('click', recordClick)
  return {
    sync: viewport.sync,
    dispose() {
      document.removeEventListener('click', recordClick)
      viewport.dispose()
      readout.dispose()
    },
  }
}

// Temporary, URL-gated comparisons on the real application. No settings writes.
function createMobileChromeProbe({ document, window, onChange }) {
  const params = new window.URLSearchParams(window.location.search)
  if (params.get('prts-chrome-probe') !== '1') return null
  let mode = params.get('prts-chrome-start') === 'app' ? 3 : 0
  const gray = params.get('prts-chrome-tint') === 'gray'
  const tint = gray ? '#5b5d5f' : '#2878c8'
  const serializedTint = gray ? 'rgb(91, 93, 95)' : 'rgb(40, 120, 200)'
  const colors = new Map()
  const style = document.createElement('style')
  const panel = document.createElement('div')
  panel.dataset.prtsMobileChromeProbe = ''
  panel.setAttribute('role', 'group')
  panel.setAttribute('aria-label', '状态栏临时对比')
  const label = document.createElement('strong')
  const controls = document.createElement('div')
  const exit = document.createElement('a')
  exit.href = '/'
  exit.textContent = '退出对比'
  const choices = ['原页面', '同步全部声明', '重置根布局', '重置后显示应用']
  const buttons = choices.map((name, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = name
    button.addEventListener('click', () => { mode = index; render(); onChange() })
    controls.append(button)
    return button
  })
  const base = `
    [data-prts-mobile-chrome-probe]{position:fixed!important;z-index:2147483647!important;left:10px!important;right:10px!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;padding:12px!important;border:1px solid #99a!important;background:#fff!important;color:#15191c!important;font:12px/1.5 system-ui!important;}
    [data-prts-mobile-chrome-probe]>div{display:flex;gap:6px;flex-wrap:wrap}
    [data-prts-mobile-chrome-probe] button{padding:7px!important;border:1px solid #9ba4ad!important;background:#eef1f3!important;color:#15191c!important;font:inherit!important;}
    [data-prts-mobile-chrome-probe] a{color:#175b9d!important}
  `
  function render() {
    label.textContent = `状态栏临时对比：${choices[mode]}`
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === mode)))
    for (const [node, content] of colors) if (node.content === tint || node.content === serializedTint) {
      if (content === null) node.removeAttribute('content')
      else node.setAttribute('content', content)
    }
    colors.clear()
    if (mode) for (const node of document.querySelectorAll('meta[name="theme-color"]:not([data-prts-browser-chrome])')) {
      colors.set(node, node.getAttribute('content'))
      node.content = tint
    }
    style.textContent = base + (mode ? `html,body{background-color:${tint}!important}body{background-image:none!important}body>:not([data-prts-mobile-chrome-probe]){opacity:0!important;pointer-events:none!important}` : '')
      + (mode >= 2 ? `html,body{all:initial!important;display:block!important;min-height:120vh!important;background:${tint}!important;color-scheme:light!important}html::before,html::after,body::before,body::after{content:none!important}body>:not([data-prts-mobile-chrome-probe]){display:none!important}` : '')
      + (mode === 3 ? `body>#root{display:block!important;opacity:1!important;pointer-events:auto!important;height:100dvh!important;font:14px/1.5 var(--prts-body)!important;color:var(--prts-ink)!important;color-scheme:${document.documentElement.dataset.prtsScheme === 'light' ? 'light' : 'dark'}!important}` : '')
  }
  panel.append(label, controls, exit)
  document.head.append(style)
  document.body.append(panel)
  render()
  return {
    color: color => mode ? tint : color,
    dispose() { mode = 0; render(); panel.remove(); style.remove() },
  }
}


// Keep host metadata intact when the theme is disabled or hot-reloaded.
function createReplayViewport({ document, window }) {
  const edits = new Map()
  let themeColor, probe
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

  function paintColor(color) {
    color = probe?.color(color) ?? color
    if (themeColor.content !== color) themeColor.content = color
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
      probe ??= createMobileChromeProbe({ document, window, onChange() { sampled = undefined; updateColor() } })
      sampled = undefined
      if (!active) {
        active = true
        observer.observe(root, { attributes: true, attributeFilter: ['style', 'data-prts-background-mode', 'data-prts-background-full', 'data-prts-background-conversation'] })
        window.addEventListener('resize', schedule)
      }
      cancel(frame); frame = undefined
      updateColor()
    },
    dispose() {
      active = false
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      cancel(frame); frame = undefined
      if (image) image.onload = null
      image = imageUrl = sampled = inputs = undefined
      root.style.removeProperty('--prts-browser-chrome-color')
      themeColor?.remove()
      themeColor = undefined
      probe?.dispose()
      probe = undefined
      for (const name of edits.keys()) restoreMeta(name)
    },
  }
}
