import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'

const adapterSource = (await readFile(new URL('../../src/client/cursor-adapter.js', import.meta.url), 'utf8')).replace('export function', 'function')
const clientSource = await readFile(new URL('../../lib/client.js', import.meta.url), 'utf8')

async function mount(page, content = '', scheme = 'dark') {
  await page.setContent(`<html data-dsh-prts data-prts-cursor="prts" data-prts-motion="system" data-prts-scheme="${scheme}"><body><main id="passive"></main>${content}</body></html>`)
  await page.evaluate(() => { window.__ModuleLoader__ = { load: entry => { window.prtsTest = entry.factory(() => ({})) } } })
  await page.addScriptTag({ content: clientSource })
  await page.addStyleTag({ content: await page.evaluate(() => window.prtsTest.cssText) })
  await page.addStyleTag({ content: 'body{min-height:1600px;margin:0}#passive{position:absolute;left:0;top:0;box-sizing:border-box;width:600px;height:800px;padding:160px 40px 40px;overflow:auto;font:12px/16px monospace;background:linear-gradient(135deg,var(--prts-panel),var(--prts-canvas))}.controls{position:absolute;left:800px;top:100px;width:400px}' })
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext
    window.rippleFeedback = () => document.querySelector('[data-prts-cursor-feedback]')?.shadowRoot || document.createDocumentFragment()
    window.rippleGpuContexts = 0
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (kind === 'webgl') window.rippleGpuContexts++
      return original.call(this, kind, ...args)
    }
  })
  await page.addScriptTag({ content: `${adapterSource}\nwindow.cursorAdapter = createCursorAdapter({ document, window, assets: window.prtsTest.assets.cursor }); window.cursorAdapter.update({ enabled: true, cursor: 'prts' });` })
}

for (const scheme of ['dark', 'light']) test('large passive content keeps a fixed ripple without inherited cursor writes: ' + scheme, async ({ page }) => {
  await mount(page, '', scheme)
  await page.locator('#passive').evaluate(node => {
    node.innerHTML = '<span>content </span>'.repeat(10000)
    window.descendantReads = 0
    node.getElementsByTagName = () => { window.descendantReads++; throw Error('Do not count descendants') }
    window.targetMutations = []
    const observer = new MutationObserver(records => window.targetMutations.push(...records.map(record => record.attributeName)))
    observer.observe(node, { attributes: true })
    observer.observe(document.documentElement, { attributes: true })
    window.cursorMutationObserver = observer
  })
  await page.mouse.move(260, 100)
  await page.mouse.down()
  const ripple = page.locator('[data-prts-click-ripple]')
  await expect(ripple).toHaveCount(1)
  await expect(ripple.locator(':scope > span')).toHaveCount(3)
  const before = await ripple.evaluate(node => {
    for (const animation of node.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 220 }
    return { left: node.getBoundingClientRect().left, top: node.getBoundingClientRect().top, transform: node.style.transform, pointerEvents: getComputedStyle(node).pointerEvents, background: getComputedStyle(node).backgroundColor }
  })
  expect(before.left + 80).toBe(260)
  expect(before.top + 80).toBe(100)
  expect(before.pointerEvents).toBe('none')
  expect(before.background).toBe('rgba(0, 0, 0, 0)')
  await page.mouse.move(700, 550)
  await page.mouse.up()
  expect(await ripple.evaluate(node => node.style.transform)).toBe(before.transform)
  expect(await page.locator('[data-prts-hand-active]').count()).toBe(0)
  expect(await page.evaluate(() => window.descendantReads)).toBe(0)
  expect(await page.evaluate(() => window.targetMutations)).toEqual([])
  await page.screenshot({ path: `/tmp/prts-cursor-ripple-${scheme}.png`, clip: { x: 100, y: 0, width: 380, height: 270 } })
  await page.evaluate(() => { for (const animation of window.rippleFeedback().querySelector('[data-prts-click-ripple]').getAnimations({ subtree: true })) animation.play() })
  await expect(ripple).toHaveCount(0)
})

test('background feedback has no per-frame JS cursor, timer or rAF updates', async ({ page }) => {
  await mount(page)
  const result = await page.evaluate(async () => {
    const frame = window.requestAnimationFrame.bind(window)
    const timer = window.setTimeout.bind(window)
    let frames = 0, timers = 0
    window.requestAnimationFrame = callback => { frames++; return frame(callback) }
    window.setTimeout = (...args) => { timers++; return timer(...args) }
    const target = document.querySelector('#passive')
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 100 }))
    await new Promise(resolve => timer(resolve, 220))
    window.requestAnimationFrame = frame
    window.setTimeout = timer
    return { frames, timers, rings: window.rippleFeedback().querySelector('[data-prts-click-ripple]').getAnimations({ subtree: true }).map(animation => Object.keys(animation.effect.getKeyframes()[0])) }
  })
  expect(result.frames).toBe(0)
  expect(result.timers).toBe(0)
  expect(result.rings).toHaveLength(4)
  for (const keys of result.rings) expect(keys.every(key => ['offset', 'computedOffset', 'easing', 'composite', 'transform', 'opacity'].includes(key))).toBe(true)
})

test('interactive controls retain full press and release with 10000 descendants', async ({ page }) => {
  await mount(page, '<div class="controls"><button id="action" style="width:300px;height:160px">Action</button></div>')
  await page.locator('#action').evaluate(node => {
    node.innerHTML = '<span hidden>Child</span>'.repeat(10000)
    node.getElementsByTagName = () => { throw Error('Do not count descendants') }
    window.addEventListener('pointerdown', () => {
      window.firstFrame = node.style.cursor
      window.firstFrameIsLink = window.prtsTest.assets.cursor.link.press.some(frame => node.style.cursor.includes(frame.url))
    }, true)
  })
  await page.locator('#action').hover()
  await page.mouse.down()
  expect(await page.evaluate(() => window.firstFrameIsLink)).toBe(true)
  expect(await page.evaluate(() => window.firstFrame)).toContain('data:image/png')
  await expect(page.locator('#action')).toHaveAttribute('data-prts-hand-active', '')
  await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
  await page.mouse.up()
  await expect(page.locator('[data-prts-hand-active]')).toHaveCount(0)
  expect(await page.locator('#action').evaluate(node => node.style.cursor)).toBe('')
})

test('SVG button children and ARIA actions are recognized without background effects', async ({ page }) => {
  await mount(page, '<div class="controls"><button><svg width="60" height="60"><rect width="60" height="60"/></svg></button><div role="menuitem" style="padding:30px">Menu action</div><div style="cursor:var(--prts-link-cursor),pointer;padding:30px">Custom action</div></div>')
  for (const selector of ['button rect', '[role="menuitem"]', '.controls > div:last-child']) {
    await page.locator(selector).hover()
    await page.mouse.down()
    await expect(page.locator('[data-prts-hand-active]')).toHaveCount(1)
    await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
    await page.mouse.up()
    await expect(page.locator('[data-prts-hand-active]')).toHaveCount(0)
  }
})

test('rapid background clicks keep at most three effects and do not cancel unrelated animation', async ({ page }) => {
  await mount(page)
  const result = await page.evaluate(() => {
    const external = document.querySelector('#passive').animate([{ opacity: 1 }, { opacity: 0.99 }], { duration: 1000, iterations: Infinity })
    const target = document.querySelector('#passive')
    let maximum = 0
    for (let index = 0; index < 30; index++) {
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 220 + index, clientY: 100 }))
      maximum = Math.max(maximum, window.rippleFeedback().querySelectorAll('[data-prts-click-ripple]').length)
    }
    const count = window.rippleFeedback().querySelectorAll('[data-prts-click-ripple]').length
    window.cursorAdapter.dispose()
    const state = external.playState
    external.cancel()
    return { maximum, count, remaining: window.rippleFeedback().querySelectorAll('[data-prts-click-ripple]').length, state }
  })
  expect(result).toEqual({ maximum: 3, count: 3, remaining: 0, state: 'running' })
})

test('prose I-beams suppress ripples while blank hand-cursor space still receives feedback', async ({ page }) => {
  await mount(page, '<article data-chat-flow-kind="assistant-step" class="controls"><div data-markdown><p id="prose" style="padding-bottom:50px">Select these readable words without changing the native text cursor.</p></div></article>')
  const point = await page.locator('#prose').evaluate(node => {
    const range = document.createRange()
    range.setStart(node.firstChild, 0)
    range.setEnd(node.firstChild, 1)
    const rect = range.getBoundingClientRect()
    return { x: rect.x + 2, y: rect.y + rect.height / 2 }
  })
  await page.mouse.move(point.x, point.y)
  await page.mouse.down()
  await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
  expect(await page.locator('#prose').evaluate(node => getComputedStyle(node).cursor)).toMatch(/, text$/)
  await page.mouse.move(point.x + 140, point.y, { steps: 6 })
  await page.mouse.up()
  expect(await page.evaluate(() => getSelection().toString().length)).toBeGreaterThan(0)
  await expect(page.locator('[data-prts-hand-active]')).toHaveCount(0)
  const blank = await page.locator('#prose').boundingBox()
  await page.mouse.click(blank.x + blank.width - 4, blank.y + blank.height - 4)
  expect(await page.locator('#prose').evaluate(node => getComputedStyle(node).cursor)).toMatch(/, default$/)
  await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(1)
})

for (const kind of ['dialog', 'popover']) test('ripple stays visible in a native top layer without stealing focus or dismissing the host: ' + kind, async ({ page }) => {
  await mount(page)
  await page.waitForFunction(() => window.rippleGpuContexts === 1)
  await page.evaluate(kind => {
    const host = document.createElement(kind === 'dialog' ? 'dialog' : 'div')
    host.id = 'top-layer-host'
    host.style.cssText = 'position:fixed;inset:100px auto auto 600px;margin:0;width:400px;height:280px;padding:20px;background:#25343e'
    host.innerHTML = '<input id="focused-input"><div id="top-blank" style="height:180px;padding:40px">Blank area</div>'
    if (kind === 'popover') host.setAttribute('popover', 'auto')
    document.body.append(host)
    if (kind === 'dialog') host.showModal()
    else host.showPopover()
    document.querySelector('#focused-input').focus()
    window.addEventListener('pointerdown', () => { window.focusDuringFeedback = document.activeElement.id }, true)
  }, kind)
  await page.locator('#top-blank').click({ position: { x: 80, y: 80 } })
  const ripple = page.locator('[data-prts-click-ripple]')
  await expect(ripple).toHaveCount(1)
  expect(await ripple.evaluate(node => node.matches(':popover-open'))).toBe(true)
  await expect(ripple.locator('[data-prts-ripple-refraction]')).toHaveCount(1)
  expect(await page.evaluate(() => window.focusDuringFeedback)).toBe('focused-input')
  expect(await page.locator('#top-layer-host').evaluate((node, kind) => kind === 'dialog' ? node.open : node.matches(':popover-open'), kind)).toBe(true)
  expect(await ripple.evaluate(node => {
    const box = node.getBoundingClientRect()
    return document.elementFromPoint(box.left + 80, box.top + 80)?.id
  })).toBe('top-blank')
  const focusStable = await page.evaluate(() => {
    const focus = document.activeElement
    const box = window.rippleFeedback().querySelector('[data-prts-click-ripple]').getBoundingClientRect()
    document.querySelector('#top-blank').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: box.left + 100, clientY: box.top + 80 }))
    return document.activeElement === focus
  })
  expect(focusStable).toBe(true)
  await expect(page.locator('[data-prts-ripple-interference]')).toHaveCount(1)
  expect(await page.locator('[data-prts-ripple-interference]').evaluate(node => node.matches(':popover-open'))).toBe(true)
  expect(await page.locator('#top-layer-host').evaluate((node, kind) => kind === 'dialog' ? node.open : node.matches(':popover-open'), kind)).toBe(true)
})

test('editing, disabled, drag and resize targets retain their native behavior', async ({ page }) => {
  await mount(page, '<div class="controls"><input id="editor"><button disabled>Disabled</button><div id="grab" style="cursor:grab;height:70px">Drag</div><div id="resize" style="cursor:col-resize;height:70px">Resize</div></div>')
  await page.locator('#editor').click()
  await page.keyboard.type('Draft remains editable')
  await expect(page.locator('#editor')).toHaveValue('Draft remains editable')
  for (const selector of ['button', '#grab', '#resize']) {
    const point = await page.locator(selector).boundingBox()
    await page.mouse.move(point.x + point.width / 2, point.y + point.height / 2)
    await page.mouse.down()
    await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
    await expect(page.locator('[data-prts-hand-active]')).toHaveCount(0)
    await page.mouse.up()
  }
})

test('reduced motion and lifecycle cleanup stop feedback without affecting the native pointer', async ({ page }) => {
  await mount(page)
  await page.mouse.click(260, 100)
  await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(1)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
  await page.mouse.click(260, 100)
  await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  for (const reason of ['blur', 'pointercancel', 'animation', 'system', 'disabled']) {
    await page.evaluate(() => window.cursorAdapter.update({ enabled: true, cursor: 'prts' }))
    await page.mouse.click(260, 100)
    await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(1)
    await page.evaluate(reason => {
      if (reason === 'animation') window.cursorAdapter.update({ enabled: true, cursor: 'prts', cursorAnimation: false })
      else if (reason === 'system') window.cursorAdapter.update({ enabled: true, cursor: 'system' })
      else if (reason === 'disabled') window.cursorAdapter.update({ enabled: false, cursor: 'prts' })
      else window.dispatchEvent(new Event(reason))
    }, reason)
    await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
  }
})

test('full plugin uses native ripples and clears them on live preference changes without enabling the follower', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ revision: 1, value: {
    preferencesInitialized: true, enabled: true, cursor: 'prts', cursorAnimation: true, motion: 'system', bootAnimation: false,
  } })))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('html')).toHaveAttribute('data-prts-cursor', 'prts')
  await page.evaluate(() => {
    const passive = document.createElement('div')
    passive.id = 'ripple-integration-target'
    passive.style.cssText = 'position:fixed;left:600px;top:200px;width:100px;height:100px;z-index:10000'
    document.body.append(passive)
  })
  const mutate = (key, value) => page.evaluate(async ({ key, value }) => {
    const form = window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm
    await form.mutate([{ op: 'set', path: [key], value }], form.getSnapshot().revision)
  }, { key, value })
  const click = () => page.locator('#ripple-integration-target').dispatchEvent('pointerdown', { pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 650, clientY: 250 })
  for (const [key, value, restore] of [['motion', 'reduced', 'system'], ['cursorAnimation', false, true], ['cursor', 'system', 'prts'], ['enabled', false, true]]) {
    await click()
    await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(1)
    await expect(page.locator('[data-prts-click-ripple]')).not.toHaveAttribute('data-prts-floating-glass')
    await mutate(key, value)
    await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
    await click()
    await expect(page.locator('[data-prts-click-ripple]')).toHaveCount(0)
    await mutate(key, restore)
    await expect(page.locator('html')).toHaveAttribute('data-prts-cursor', 'prts')
  }
  await expect(page.locator('.prts-cursor-follower')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('rings stay circular under the host superellipse corner rule', async ({ page }) => {
  await mount(page)
  await page.addStyleTag({ content: 'html * { corner-shape: superellipse(1.5); }' })
  await page.mouse.click(260, 100)
  const rings = page.locator('[data-prts-click-ripple] > span')
  await expect(rings).toHaveCount(3)
  for (const ring of await rings.all()) {
    const style = await ring.evaluate(node => {
      const style = getComputedStyle(node)
      return { radius: style.borderRadius, corner: style.cornerShape, width: style.width, height: style.height, border: [style.borderTopColor, style.borderLeftColor, style.borderBottomColor, style.borderRightColor] }
    })
    expect(style.radius).toBe('50%')
    expect(style.corner).toBe('round')
    expect(style.width).toBe(style.height)
    expect(new Set(style.border).size).toBe(1)
  }
})

for (const scheme of ['dark', 'light']) test('overlapping waves produce measured constructive and destructive interference, not alpha stacking: ' + scheme, async ({ page }) => {
  await mount(page, '', scheme)
  await page.waitForFunction(() => window.rippleGpuContexts === 1)
  const state = await page.evaluate(async () => {
    const target = document.querySelector('#passive')
    for (const clientX of [240, 280]) target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX, clientY: 140 }))
    for (const node of window.rippleFeedback().querySelectorAll('[data-prts-click-ripple]')) {
      for (const animation of node.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 60 }
    }
    await new Promise(resolve => requestAnimationFrame(resolve))
    const canvas = window.rippleFeedback().querySelector('[data-prts-ripple-interference]')
    if (!canvas) return { renderer: false }
    const gl = canvas.getContext('webgl')
    const program = gl.getParameter(gl.CURRENT_PROGRAM)
    const uniform = gl.getUniformLocation(program, 'waves[0]')
    const original = new Float32Array(36)
    for (let index = 0; index < 9; index++) original.set(gl.getUniform(program, gl.getUniformLocation(program, `waves[${index}]`)), index * 4)
    const read = values => {
      gl.uniform4fv(uniform, values)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      const pixels = new Uint8Array(canvas.width * canvas.height * 4)
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      return pixels
    }
    const first = original.slice(), second = original.slice()
    for (let slot = 3; slot < 36; slot += 4) {
      if (slot >= 12) first[slot] = 0
      else second[slot] = 0
    }
    const firstPixels = read(first), secondPixels = read(second), combined = read(original)
    let cancellation = 0, reinforcement = 0
    for (let index = 3; index < combined.length; index += 4) {
      const firstAlpha = firstPixels[index] / 255, secondAlpha = secondPixels[index] / 255, alpha = combined[index] / 255
      cancellation = Math.max(cancellation, Math.max(firstAlpha, secondAlpha) - alpha)
      if (firstAlpha > .05 && secondAlpha > .05) reinforcement = Math.max(reinforcement, alpha - Math.max(firstAlpha, secondAlpha))
    }
    return { renderer: true, ink: [...gl.getUniform(program, gl.getUniformLocation(program, 'ink'))], expectedInk: getComputedStyle(window.rippleFeedback().querySelector('[data-prts-click-ripple]')).color.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255), cancellation, reinforcement, mixed: window.rippleFeedback().querySelectorAll('[data-prts-ripple-mixed]').length, width: canvas.width, height: canvas.height }
  })
  expect(state.renderer).toBe(true)
  expect(state.mixed).toBe(2)
  for (let channel = 0; channel < 3; channel++) expect(state.ink[channel]).toBeCloseTo(state.expectedInk[channel], 5)
  expect(state.cancellation).toBeGreaterThan(.08)
  expect(state.reinforcement).toBeGreaterThan(.08)
  expect(state.width).toBeLessThanOrEqual(300)
  expect(state.height).toBeLessThanOrEqual(240)
  await page.screenshot({ path: `/tmp/prts-ripple-interference-${scheme}.png`, clip: { x: 140, y: 30, width: 250, height: 220 } })
  await page.evaluate(() => window.cursorAdapter.dispose())
  await expect(page.locator('[data-prts-ripple-interference], [data-prts-click-ripple]')).toHaveCount(0)
})

test('distant ripples keep the prewarmed renderer detached, while context loss restores isolated arcs', async ({ page }) => {
  await mount(page)
  await page.waitForFunction(() => window.rippleGpuContexts === 1)
  const result = await page.evaluate(async () => {
    const click = clientX => document.querySelector('#passive').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX, clientY: 100 }))
    click(200)
    click(500)
    const distantLayers = window.rippleFeedback().querySelectorAll('[data-prts-ripple-interference]').length
    click(240)
    const canvas = window.rippleFeedback().querySelector('[data-prts-ripple-interference]')
    const started = !!canvas
    canvas?.getContext('webgl').getExtension('WEBGL_lose_context')?.loseContext()
    await new Promise(resolve => setTimeout(resolve, 100))
    return { distantLayers, started, remaining: window.rippleFeedback().querySelectorAll('[data-prts-click-ripple]').length, mixed: window.rippleFeedback().querySelectorAll('[data-prts-ripple-mixed]').length, layers: window.rippleFeedback().querySelectorAll('[data-prts-ripple-interference]').length }
  })
  expect(result).toEqual({ distantLayers: 0, started: true, remaining: 3, mixed: 0, layers: 0 })
})

test('wave highlights fade behind refraction without extra nodes or animated paint properties', async ({ page }) => {
  await mount(page)
  const result = await page.evaluate(() => {
    document.querySelector('#passive').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 100 }))
    const ripple = window.rippleFeedback().querySelector('[data-prts-click-ripple]')
    const animations = ripple.getAnimations({ subtree: true })
    for (const animation of animations) { animation.pause(); animation.currentTime = 180 }
    const rings = [...ripple.querySelectorAll(':scope > span')]
    return {
      children: ripple.children.length,
      animations: animations.length,
      peaks: rings.map(node => Number(node.getAnimations()[0].effect.getKeyframes()[1].opacity)),
      opacities: rings.map(node => Number(getComputedStyle(node).opacity)),
      refraction: Number(getComputedStyle(ripple.querySelector('[data-prts-ripple-refraction]')).opacity),
      properties: [...new Set(animations.flatMap(animation => animation.effect.getKeyframes().flatMap(frame => Object.keys(frame))))],
    }
  })
  expect(result.children).toBe(4)
  expect(result.animations).toBe(4)
  expect(result.peaks).toEqual([.82, .5, .28])
  expect(Math.max(...result.opacities)).toBeLessThan(.25)
  expect(result.refraction).toBeGreaterThanOrEqual(.9)
  expect(result.properties.every(property => ['transform', 'opacity', 'offset', 'computedOffset', 'easing', 'composite'].includes(property))).toBe(true)
})

test('ripple artwork has tapered thickness and deliberate gaps rather than uniform complete circles', async ({ page }) => {
  await mount(page)
  await page.mouse.click(260, 100)
  const artwork = await page.locator('[data-prts-click-ripple]').evaluate(async node => {
    const source = node.style.getPropertyValue('--prts-ripple-artwork').slice(5, -2)
    const image = new Image()
    image.src = source
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, 256, 256)
    const pixels = context.getImageData(0, 0, 256, 256).data
    const widths = []
    let gaps = 0
    for (let degrees = 0; degrees < 360; degrees++) {
      const angle = degrees * Math.PI / 180
      let width = 0
      for (let radius = 42; radius <= 46; radius += .125) {
        const horizontal = Math.floor((48 + Math.cos(angle) * radius) * 256 / 96)
        const vertical = Math.floor((48 + Math.sin(angle) * radius) * 256 / 96)
        if (pixels[(vertical * 256 + horizontal) * 4 + 3] > 100) width += .125
      }
      if (width === 0) gaps++
      else widths.push(width)
    }
    return { gaps, minimum: Math.min(...widths), maximum: Math.max(...widths) }
  })
  expect(artwork.gaps).toBeGreaterThan(20)
  expect(artwork.gaps).toBeLessThan(120)
  expect(artwork.maximum - artwork.minimum).toBeGreaterThan(.5)
})

test('feedback stays in an isolated shadow tree without invalidating body observers', async ({ page }) => {
  await mount(page)
  await page.waitForFunction(() => window.rippleGpuContexts === 1)
  const state = await page.evaluate(async () => {
    const host = document.querySelector('[data-prts-cursor-feedback]')
    const mutations = []
    const observer = new MutationObserver(records => mutations.push(...records))
    observer.observe(document.body, { subtree: true, childList: true, attributes: true })
    for (let index = 0; index < 8; index++) {
      document.querySelector('#passive').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 240 + index % 3 * 20, clientY: 140 }))
    }
    const active = host.shadowRoot.querySelectorAll('[data-prts-click-ripple]').length
    const mixed = host.shadowRoot.querySelectorAll('[data-prts-ripple-mixed]').length
    const changes = observer.takeRecords().length
    await new Promise(resolve => setTimeout(resolve, 850))
    const finalChanges = mutations.length + observer.takeRecords().length
    observer.disconnect()
    return { active, mixed, changes, finalChanges, shadow: !!host.shadowRoot, stable: document.querySelector('[data-prts-cursor-feedback]') === host, remaining: host.shadowRoot.querySelectorAll('[data-prts-click-ripple], [data-prts-ripple-interference]').length }
  })
  expect(state).toEqual({ active: 3, mixed: 3, changes: 0, finalChanges: 0, shadow: true, stable: true, remaining: 0 })
  await page.evaluate(() => window.cursorAdapter.dispose())
  await expect(page.locator('[data-prts-cursor-feedback]')).toHaveCount(0)
})

for (const kind of ['page', 'dialog', 'popover']) for (const scheme of ['dark', 'light']) test('wavefront refracts real background pixels locally without replacing DOM content: ' + scheme + ' / ' + kind, async ({ page }) => {
  await mount(page, '', scheme)
  if (kind !== 'page') await page.evaluate(kind => {
    const host = document.createElement(kind === 'dialog' ? 'dialog' : 'div')
    host.style.cssText = 'position:fixed;inset:0 auto auto 0;display:block;margin:0;padding:0;border:0;width:600px;height:800px;max-width:none;max-height:none;background:transparent;overflow:visible'
    if (kind === 'popover') host.setAttribute('popover', 'auto')
    host.append(document.querySelector('#passive'))
    document.body.append(host)
    if (kind === 'dialog') host.showModal()
    else host.showPopover()
  }, kind)
  await page.locator('#passive').evaluate(node => {
    node.style.background = 'repeating-linear-gradient(0deg,transparent 0 7px,#789 7px 8px),repeating-linear-gradient(90deg,#17212d 0 7px,#789 7px 8px)'
    node.innerHTML = '<p id="refraction-prose">Water wave — 真实正文，不是截图</p>'
  })
  await page.waitForTimeout(100)
  await page.evaluate(() => {
    document.querySelector('#passive').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 140 }))
    const ripple = window.rippleFeedback().querySelector('[data-prts-click-ripple]')
    for (const animation of ripple.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 180 }
    for (const ring of ripple.querySelectorAll('span')) ring.style.visibility = 'hidden'
    window.refractionOriginal = document.querySelector('#refraction-prose')
  })
  const lens = page.locator('[data-prts-ripple-refraction]')
  await expect(lens).toHaveCount(1)
  const filter = await lens.evaluate(node => getComputedStyle(node).backdropFilter)
  expect(filter).toContain('#prts-ripple-refraction')
  expect(await lens.evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThanOrEqual(.9)
  const clip = { x: 150, y: 30, width: 220, height: 220 }
  const displaced = await page.screenshot({ clip, path: `/tmp/prts-water-refraction-${scheme}${kind === 'page' ? '' : '-' + kind}.png` })
  await lens.evaluate(node => { node.style.backdropFilter = 'none' })
  const baseline = await page.screenshot({ clip })
  const original = await sharp(baseline).ensureAlpha().raw().toBuffer()
  const refracted = await sharp(displaced).ensureAlpha().raw().toBuffer()
  let changed = 0, outside = 0, center = 0, radiusSum = 0
  for (let vertical = 0; vertical < clip.height; vertical++) for (let horizontal = 0; horizontal < clip.width; horizontal++) {
    const offset = (vertical * clip.width + horizontal) * 4
    const difference = [0, 1, 2].reduce((total, channel) => total + Math.abs(original[offset + channel] - refracted[offset + channel]), 0)
    if (difference <= 20) continue
    changed++
    const radius = Math.hypot(horizontal - 110, vertical - 110)
    radiusSum += radius
    if (radius > 80) outside++
    if (radius < 25) center++
  }
  expect(changed).toBeGreaterThan(100)
  expect(outside).toBe(0)
  expect(center).toBe(0)
  await lens.evaluate(node => {
    node.style.removeProperty('backdrop-filter')
    node.getAnimations()[0].currentTime = 60
  })
  const earlier = await sharp(await page.screenshot({ clip })).ensureAlpha().raw().toBuffer()
  let earlierChanged = 0, earlierRadiusSum = 0
  for (let vertical = 0; vertical < clip.height; vertical++) for (let horizontal = 0; horizontal < clip.width; horizontal++) {
    const offset = (vertical * clip.width + horizontal) * 4
    const difference = [0, 1, 2].reduce((total, channel) => total + Math.abs(original[offset + channel] - earlier[offset + channel]), 0)
    if (difference <= 20) continue
    earlierChanged++
    earlierRadiusSum += Math.hypot(horizontal - 110, vertical - 110)
  }
  expect(earlierChanged).toBeGreaterThan(30)
  expect(radiusSum / changed - earlierRadiusSum / earlierChanged).toBeGreaterThan(5)
  expect(await page.evaluate(() => document.querySelector('#refraction-prose') === window.refractionOriginal)).toBe(true)
  await page.evaluate(() => window.cursorAdapter.dispose())
  await expect(page.locator('[data-prts-ripple-refraction]')).toHaveCount(0)
})

test('unsupported backdrop filters retain independent arcs without a refraction layer', async ({ page }) => {
  await mount(page)
  await page.evaluate(() => {
    window.cursorAdapter.dispose()
    CSS.supports = () => false
    window.cursorAdapter.update({ enabled: true, cursor: 'prts' })
    document.querySelector('#passive').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 140 }))
    for (const animation of window.rippleFeedback().querySelector('[data-prts-click-ripple]').getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 180 }
  })
  await expect(page.locator('[data-prts-click-ripple] > span')).toHaveCount(3)
  await expect(page.locator('[data-prts-ripple-refraction]')).toHaveCount(0)
  expect(await page.evaluate(() => window.rippleFeedback().querySelectorAll('filter').length)).toBe(0)
})

test('production refraction visibly bends a real edge rather than only changing antialiasing', async ({ page }) => {
  await mount(page)
  await page.locator('#passive').evaluate(node => {
    node.innerHTML = ''
    node.style.background = 'linear-gradient(to right,#101820 0 50%,#b0c4de 50% 100%)'
  })
  await page.waitForTimeout(100)
  await page.evaluate(() => {
    document.querySelector('#passive').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 140 }))
    const ripple = window.rippleFeedback().querySelector('[data-prts-click-ripple]')
    for (const animation of ripple.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = 180 }
    for (const ring of ripple.querySelectorAll('span')) ring.style.visibility = 'hidden'
  })
  const clip = { x: 150, y: 30, width: 220, height: 220 }
  const refracted = await sharp(await page.screenshot({ clip, path: '/tmp/prts-water-visible-edge.png' })).ensureAlpha().raw().toBuffer()
  await page.locator('[data-prts-ripple-refraction]').evaluate(node => { node.style.backdropFilter = 'none' })
  const baseline = await sharp(await page.screenshot({ clip })).ensureAlpha().raw().toBuffer()
  const edge = (pixels, vertical) => {
    for (let horizontal = 130; horizontal < 175; horizontal++) {
      const offset = (vertical * clip.width + horizontal) * 4
      if ((pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3 > 110) return horizontal
    }
    throw Error('Reference edge missing')
  }
  let maximum = 0, bentRows = 0
  for (let vertical = 45; vertical < 175; vertical++) {
    const displacement = Math.abs(edge(refracted, vertical) - edge(baseline, vertical))
    maximum = Math.max(maximum, displacement)
    if (displacement >= 2) bentRows++
  }
  expect(maximum).toBeGreaterThanOrEqual(2)
  expect(bentRows).toBeGreaterThan(8)
  await page.evaluate(() => window.cursorAdapter.dispose())
})
