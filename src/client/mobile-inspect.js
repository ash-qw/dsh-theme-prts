// Temporary, URL-gated comparison/readout. No settings or session writes.
export function createMobileInspect({ document, window, onChange }) {
  const option = new window.URLSearchParams(window.location.search).get('prts-mobile-inspect')
  if (!['1', 'steps', 'replay'].includes(option)) return null
  let mode = 0, panel, sheet
  const timers = new Set()
  function later(delay) {
    const timer = window.setTimeout(() => { timers.delete(timer); report(delay) }, delay)
    timers.add(timer)
  }
  function report(delay) {
    const root = document.documentElement
    const style = node => {
      const css = window.getComputedStyle(node)
      return Object.fromEntries(['backgroundColor', 'colorScheme', 'overflowY', 'height', 'minHeight', 'paddingTop', 'backgroundAttachment', 'backgroundClip', 'display', 'opacity', 'viewTransitionName'].map(key => [key, css[key]]))
    }
    const value = {
      revision: 'device-20261122-10', comparison: option, delay, mode,
      themed: root.hasAttribute('data-dsh-prts'),
      tint: root.style.getPropertyValue('--prts-browser-chrome-color'),
      colors: [...document.querySelectorAll('meta[name="theme-color" i]')].slice(0, 6).map(node => ({ color: node.content.slice(0, 80), parent: node.parentElement.tagName, own: node.hasAttribute('data-prts-browser-chrome') })),
      html: style(root), body: style(document.body),
      app: document.getElementById('root') ? style(document.getElementById('root')) : null,
      image: window.getComputedStyle(document.body).backgroundImage.includes('url('),
      viewport: document.querySelector('meta[name="viewport"]')?.content.slice(0, 120),
      size: [window.innerWidth, window.innerHeight, window.visualViewport?.height, window.visualViewport?.offsetTop],
      coarse: window.matchMedia('(pointer: coarse)').matches,
      standalone: Boolean(window.navigator.standalone),
    }
    // Use a read-only asset request; no new API, settings write or page changes.
    const url = new window.URL('favicon.svg', document.baseURI)
    url.searchParams.set('prts-mobile-readout', JSON.stringify(value))
    window.fetch(url.href, { credentials: 'same-origin', cache: 'no-store' }).catch(() => {})
  }
  if (option === 'steps') {
    panel = document.createElement('div')
    panel.dataset.prtsMobileInspect = ''
    panel.setAttribute('role', 'group')
    panel.setAttribute('aria-label', '状态栏分步对比')
    sheet = document.createElement('style')
    const base = '[data-prts-mobile-inspect]{position:fixed!important;z-index:2147483647!important;left:10px!important;right:10px!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;padding:12px!important;background:#fff!important;color:#15191c!important;font:14px/1.6 system-ui!important}[data-prts-mobile-inspect] button{padding:8px!important;margin:3px!important;background:#eef1f3!important;color:#15191c!important;border:1px solid #9ba4ad!important;font:inherit!important}'
    const label = document.createElement('div')
    label.textContent = '依次点击，每步等 2 秒，只看时间、电量周围。'
    const choices = ['恢复原页面', '1 · 蓝色声明', '2 · 蓝色背景', '3 · 隐藏界面']
    const buttons = choices.map((name, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = name
      button.addEventListener('click', () => {
        mode = index
        // Each step adds exactly one condition. Step 1 retains the original
        // root/body paint; step 2 retains all app content; step 3 hides it.
        sheet.textContent = base + (mode >= 2 ? 'html,body{background-color:#2878c8!important}body{background-image:none!important}' : '')
          + (mode === 3 ? 'body>:not([data-prts-mobile-inspect]){opacity:0!important;pointer-events:none!important}' : '')
        buttons.forEach((node, i) => node.setAttribute('aria-pressed', String(i === mode)))
        for (const timer of timers) window.clearTimeout(timer)
        timers.clear()
        onChange()
        later(2000)
      })
      return button
    })
    sheet.textContent = base
    panel.append(label, ...buttons)
    document.head.append(sheet)
    document.body.append(panel)
  }
  for (const delay of [1000, 4000, 9000]) later(delay)
  return {
    color: color => mode ? '#2878c8' : color,
    record(index) {
      mode = index
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
      later(2000)
    },
    dispose() {
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
      panel?.remove()
      sheet?.remove()
    },
  }
}
