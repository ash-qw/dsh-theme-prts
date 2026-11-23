import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import sharp from 'sharp'
import { applyMenuLettering, createMenuLettering } from '../../scripts/menu-lettering.mjs'

const css = applyMenuLettering(await readFile(new URL('../../src/styles/menu-card.css', import.meta.url), 'utf8'))
const originalRail = "%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='112' viewBox='0 0 24 112'%3E%3Ctext x='14' y='8' transform='rotate(90 14 8)' fill='%23b6c1c5' font-family='monospace' font-size='8' letter-spacing='2'%3EP.R.T.S.%3C/text%3E%3C/svg%3E"

test('Rhodes header keeps geometric capitals wide and inside the native ticket header', async ({ page }) => {
  await page.setContent(createMenuLettering().header)
  const geometry = await page.locator('svg').evaluate(node => {
    const bounds = node.getBBox()
    const round = node.querySelector('#g79').getBBox()
    const cap = node.querySelector('#g72').getBBox()
    return { left: bounds.x, right: bounds.x + bounds.width, width: bounds.width, height: cap.height, roundness: round.width / round.height }
  })
  expect(geometry.left).toBeGreaterThanOrEqual(7.5)
  expect(geometry.right).toBeLessThanOrEqual(90)
  expect(geometry.width).toBeGreaterThan(76)
  expect(geometry.width).toBeLessThan(82)
  expect(geometry.height).toBeCloseTo(6, 1)
  expect(geometry.roundness).toBeGreaterThan(.95)
  expect(geometry.roundness).toBeLessThan(1.2)
})

test('Orbitron categories retain the preview cap height and fit the unchanged yellow plate', async ({ page }) => {
  await page.setContent(createMenuLettering().captions)
  const frames = await page.locator('svg > g > g').evaluateAll(nodes => nodes.map(node => {
    const bounds = node.getBBox()
    return { caption: node.querySelector('title').textContent, left: bounds.x, right: bounds.x + bounds.width, center: bounds.x + bounds.width / 2, top: bounds.y, bottom: bounds.y + bounds.height }
  }))
  expect(frames.map(frame => frame.caption)).toEqual(['PRTS', 'MODEL', 'MODE', 'ACCESS', 'ACTION', 'TEAM', 'SYSTEM'])
  for (const [index, frame] of frames.entries()) {
    expect(frame.left).toBeGreaterThanOrEqual(8)
    expect(frame.right).toBeLessThanOrEqual(63)
    expect(frame.center).toBeCloseTo(35.5, 1)
    expect(frame.top).toBeGreaterThanOrEqual(8.5 + index * 24)
    expect(frame.bottom).toBeLessThanOrEqual(16.5 + index * 24)
  }
  const cap = await page.locator('#g84').evaluate(node => node.getBBox().height)
  expect(cap).toBeCloseTo(7, 1)
})

async function mountMenu(page, scheme, zoom = 1, category = '') {
  await page.setContent(`<html data-dsh-prts data-prts-scheme="${scheme}" data-prts-glass="off"><head><style>
    html { --prts-panel: ${scheme === 'dark' ? '#283035' : '#dce3e6'}; --prts-line: #68747a; --prts-yellow: #f0c800; --prts-yellow-ink: #161300; --prts-mono: monospace; }
    body { margin: 0; background: var(--prts-panel); }
    [data-menu-material] { position: absolute; left: 16px; top: 16px; width: 240px; height: 200px; zoom: ${zoom}; isolation: isolate; }
    [aria-hidden] { position: absolute; inset: 0; z-index: -1; }
    button { margin: 10px 0; }
  </style></head><body><div data-menu-material data-prts-floating-glass="menu" data-prts-glass-menu="${category}" ${category === 'team' ? 'data-subagent-panel' : ''}><div aria-hidden="true" class="_material_probe"></div><button>Standard mode</button></div></body></html>`)
  await page.addStyleTag({ content: css })
  return page.locator('[data-menu-material]')
}

for (const scheme of ['dark', 'light']) for (const density of [1, 2]) {
  test(`short credential rails keep every glyph clear of the barcode (${scheme}, DPR ${density})`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: { width: 395, height: 320 }, deviceScaleFactor: density })
    try {
      const page = await context.newPage()
      const menu = await mountMenu(page, scheme)
      const lettering = async top => sharp(await page.screenshot({ scale: 'device' })).extract({
        left: 25 * density, top: (16 + top + 8) * density, width: 14 * density, height: 52 * density,
      }).raw().toBuffer()
      const reference = await lettering(30)
      // The native one-option account menu is 76px tall, including its borders.
      for (const height of [76, 96, 112, 128, 200, 76]) {
        await page.setViewportSize({ width: 395, height: height <= 128 ? 203 : 320 })
        await menu.evaluate((node, value) => { node.style.height = `${value}px` }, height)
        const top = Math.max(0, Math.min(height - 70, 30))
        expect((await lettering(top)).equals(reference), `complete unobscured lettering at ${height}px`).toBe(true)
        if (height === 76) await page.screenshot({ path: testInfo.outputPath('short-menu.png'), scale: 'device' })
      }
    } finally {
      await context.close()
    }
  })
}

for (const scheme of ['dark', 'light']) {
  test(`sidebar panel actions classify dynamic native slot content without text or class hashes (${scheme})`, async ({ page }) => {
    const menu = await mountMenu(page, scheme)
    const caption = () => menu.evaluate(node => getComputedStyle(node).getPropertyValue('--prts-menu-card-caption').trim())
    expect(await caption()).toBe('"PRTS"')
    const mask = await menu.evaluate(node => getComputedStyle(node, '::before').maskImage)
    await menu.evaluate(node => {
      const slot = document.createElement('div')
      slot.setAttribute('data-slot', 'sidebar.panellist.actions')
      slot.innerHTML = '<button role="menuitem">Browse plugins</button>'
      node.append(slot)
    })
    await expect.poll(caption).toBe('"ACTION"')
    expect(await menu.evaluate(node => getComputedStyle(node, '::before').maskImage)).toBe(mask)
    await menu.getByRole('menuitem').evaluate(node => { node.textContent = '浏览更多插件' })
    expect(await caption()).toBe('"ACTION"')
    await menu.locator('[data-slot]').evaluate(node => { node.remove() })
    await expect.poll(caption).toBe('"PRTS"')
  })
}

for (const scheme of ['dark', 'light']) for (const density of [1, 1.25, 1.5, 2]) for (const zoom of [.8, 1, 1.25]) {
  test(`credential rail keeps P and R counters open (${scheme}, DPR ${density}, zoom ${zoom})`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: { width: 400, height: 320 }, deviceScaleFactor: density })
    try {
      const page = await context.newPage()
      const menu = await mountMenu(page, scheme, zoom)
      await expect(menu).toHaveCSS('padding-left', '30px')
      await expect.poll(() => menu.evaluate(node => getComputedStyle(node, '::after').backgroundImage)).toContain('%3Cpath')
      const bounds = await menu.boundingBox()
      const screenshot = await page.screenshot({ path: testInfo.outputPath('rail.png'), animations: 'disabled', scale: 'device' })
      const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const brightness = (svgX, svgY) => {
        const pixelX = Math.floor((bounds.x + svgX * zoom) * density)
        const pixelY = Math.floor((bounds.y + (30 + svgY) * zoom) * density)
        const index = (pixelY * info.width + pixelX) * info.channels
        return (data[index] + data[index + 1] + data[index + 2]) / 3
      }
      const peak = (svgX, svgY) => Math.max(...[-.5, 0, .5].flatMap(horizontal => [-.5, 0, .5].map(vertical => brightness(svgX + horizontal, svgY + vertical))))
      const background = brightness(14, 72)
      for (const offset of [0, 14.03]) {
        const counter = Math.min(...[-.4, 0, .4].flatMap(horizontal => [-.4, 0, .4].map(vertical => brightness(15 + horizontal, 10.7 + vertical + offset))))
        const stem = peak(15, 8.7 + offset) - background
        const bowl = peak(15, 12 + offset) - background
        expect(stem).toBeGreaterThan(30)
        expect(bowl).toBeGreaterThan(30)
        expect(Math.abs(counter - background)).toBeLessThan(Math.min(stem, bowl) * (density * zoom < 1 ? .6 : .4))
      }
      expect(peak(19, 10) - background).toBeLessThan(12)
      expect(peak(9, 10) - background).toBeLessThan(12)
      const inkBounds = pixels => {
        const positions = []
        for (let pixelY = Math.floor((bounds.y + 36 * zoom) * density); pixelY < (bounds.y + 94 * zoom) * density; pixelY++) {
          for (let pixelX = Math.floor((bounds.x + 9 * zoom) * density); pixelX < (bounds.x + 23 * zoom) * density; pixelX++) {
            const index = (pixelY * info.width + pixelX) * info.channels
            const value = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3
            if (value - background > (190.67 - background) * .15) positions.push([pixelX, pixelY])
          }
        }
        expect(positions.length).toBeGreaterThan(10)
        return {
          left: Math.min(...positions.map(position => position[0])),
          right: Math.max(...positions.map(position => position[0])),
          top: Math.min(...positions.map(position => position[1])),
          bottom: Math.max(...positions.map(position => position[1])),
        }
      }
      const current = inkBounds(data)
      await page.addStyleTag({ content: `html[data-dsh-prts] [data-menu-material]::after { background-image: url("data:image/svg+xml,${originalRail}"), none !important; }` })
      const originalScreenshot = await page.screenshot({ path: testInfo.outputPath('original-rail.png'), scale: 'device' })
      const original = inkBounds(await sharp(originalScreenshot).removeAlpha().raw().toBuffer())
      for (const edge of ['left', 'right', 'top', 'bottom']) {
        const horizontalShift = edge === 'left' || edge === 'right' ? 3 * density * zoom : 0
        expect(Math.abs(current[edge] + horizontalShift - original[edge]) / (density * zoom)).toBeLessThanOrEqual(1.5)
      }
      const center = ((current.left + current.right + 1) / 2 / density - bounds.x) / zoom
      expect(center).toBeGreaterThan(12)
      expect(center).toBeLessThan(15)
    } finally {
      await context.close()
    }
  })
}

for (const scheme of ['dark', 'light']) for (const density of [1, 1.25, 1.5, 2]) for (const zoom of [.8, 1, 1.25]) {
  test(`credential stamp diagonal blends subpixel coverage (${scheme}, DPR ${density}, zoom ${zoom})`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: { width: 400, height: 320 }, deviceScaleFactor: density })
    try {
      const page = await context.newPage()
      const menu = await mountMenu(page, scheme, zoom, 'system')
      await page.addStyleTag({ content: '[data-menu-material] > [aria-hidden]::before, [data-menu-material]::before { background: transparent !important; }' })
      await expect.poll(() => menu.locator(':scope > [aria-hidden]').evaluate(node => getComputedStyle(node, '::after').clipPath)).toBe('polygon(7px 0px, 100% 0px, 100% 100%, 0px 100%)')
      const bounds = await menu.boundingBox()
      const image = await page.screenshot({ path: testInfo.outputPath('stamp-edge.png'), scale: 'device' })
      const { data, info } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const colorAt = (horizontal, vertical) => {
        const offset = (vertical * info.width + horizontal) * info.channels
        return [...data.subarray(offset, offset + 3)]
      }
      const start = Math.floor((bounds.x + (bounds.width / zoom - 65) * zoom) * density)
      const top = Math.floor(bounds.y * density)
      let blendedRows = 0
      let sampledRows = 0
      for (let vertical = top + Math.ceil(2 * zoom * density); vertical < top + 21 * zoom * density; vertical++) {
        const background = colorAt(start - 3, vertical)
        const yellow = colorAt(start + Math.floor(20 * zoom * density), vertical)
        const delta = yellow.map((value, channel) => value - background[channel])
        const length = delta.reduce((total, value) => total + value * value, 0)
        let blended = false
        for (let horizontal = start - 1; horizontal < start + 12 * zoom * density; horizontal++) {
          const pixel = colorAt(horizontal, vertical)
          const coverage = pixel.reduce((total, value, channel) => total + (value - background[channel]) * delta[channel], 0) / length
          if (coverage > .06 && coverage < .94) blended = true
        }
        if (blended) blendedRows++
        sampledRows++
      }
      expect(blendedRows / sampledRows).toBeGreaterThan(.4)
      await page.addStyleTag({ content: '[data-menu-material] > [aria-hidden]::after { clip-path: none !important; background: linear-gradient(106.26deg, transparent 6.72px, color-mix(in srgb, var(--prts-yellow) 86%, transparent) 6.72px) !important; }' })
      const hardImage = await page.screenshot({ path: testInfo.outputPath('stamp-edge-hard.png'), scale: 'device' })
      expect(hardImage.equals(image)).toBe(false)
    } finally {
      await context.close()
    }
  })
}

for (const scheme of ['dark', 'light']) for (const density of [1, 2]) {
  test(`credential small lettering has solid stroke cores at native size (${scheme}, DPR ${density})`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({ viewport: { width: 400, height: 320 }, deviceScaleFactor: density })
    try {
      const page = await context.newPage()
      const menu = await mountMenu(page, scheme, 1, 'system')
      await page.evaluate(() => document.documentElement.style.setProperty('--prts-panel', '#000'))
      await menu.evaluate(node => {
        node.style.setProperty('--prts-menu-card-muted', '#fff')
        node.style.setProperty('--prts-yellow', '#fff')
        node.style.setProperty('--prts-yellow-ink', '#000')
      })
      const { data, info } = await sharp(await menu.screenshot({ path: testInfo.outputPath('lettering-stroke-cores.png'), scale: 'device' })).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      const plateau = data[(2 * density * info.width + info.width - 3 * density) * info.channels]
      for (const region of [
        { start: 32 * density, end: 114 * density, ink: 255, background: 0 },
        { start: info.width - 55 * density, end: info.width, ink: 0, background: plateau },
      ]) {
        let visible = 0
        let solid = 0
        for (let vertical = 7 * density; vertical < 19 * density; vertical++) for (let horizontal = region.start; horizontal < region.end; horizontal++) {
          const pixel = data[(vertical * info.width + horizontal) * info.channels]
          const coverage = (pixel - region.background) / (region.ink - region.background)
          if (coverage > .08) visible++
          if (coverage > .9) solid++
        }
        expect(visible).toBeGreaterThan(40 * density)
        expect(solid / visible).toBeGreaterThan(.3)
      }
    } finally {
      await context.close()
    }
  })
}

for (const scheme of ['dark', 'light']) for (const glass of ['soft', 'standard', 'clear', 'off']) {
  test(`credential geometry preserves shared glass and dynamic plate colors (${scheme}, ${glass})`, async ({ page }) => {
    const menu = await mountMenu(page, scheme, 1, 'system')
    await page.evaluate(preference => document.documentElement.setAttribute('data-prts-glass', preference), glass)
    await menu.evaluate(node => node.style.setProperty('--prts-yellow', '#1680f0'))
    const material = menu.locator(':scope > [aria-hidden]')
    await expect(menu).toHaveCSS('clip-path', 'none')
    await expect(menu).toHaveCSS('backdrop-filter', 'none')
    await expect(material).toHaveCSS('clip-path', 'none')
    const filter = await material.evaluate(node => getComputedStyle(node).backdropFilter)
    expect(filter).toBe(glass === 'off' ? 'none' : {
      soft: 'blur(14px) saturate(1.35)', standard: 'blur(20px) saturate(1.45)', clear: 'blur(24px) saturate(1.55)',
    }[glass])
    const { data, info } = await sharp(await menu.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    for (const [channel, value] of [22, 128, 240].entries()) {
      const background = data[(2 * info.width + 130) * info.channels + channel]
      const plate = data[(2 * info.width + 230) * info.channels + channel]
      expect(Math.abs(plate - (value * .86 + background * .14))).toBeLessThanOrEqual(2)
    }
  })
}

for (const scheme of ['dark', 'light']) for (const [category, caption] of [
  ['', 'PRTS'], ['model', 'MODEL'], ['preset', 'MODE'], ['permission', 'ACCESS'], ['action', 'ACTION'], ['team', 'TEAM'], ['system', 'SYSTEM'],
]) {
  test(`credential ${caption} vectors preserve palette colors without system fonts (${scheme})`, async ({ page }, testInfo) => {
    const menu = await mountMenu(page, scheme, 1, category)
    await menu.evaluate(node => {
      node.style.setProperty('--prts-menu-card-muted', '#20d878')
      node.style.setProperty('--prts-yellow-ink', '#ff2266')
    })
    const material = menu.locator(':scope > [aria-hidden]')
    const decorations = await material.evaluate(node => [node, node.parentElement].map(target => {
      const style = getComputedStyle(target, '::before')
      return { content: style.content, mask: style.maskImage, fontSize: style.fontSize, color: style.backgroundColor }
    }))
    expect(decorations[0]).toMatchObject({ content: '"RHODES ISLAND"', fontSize: '0px', color: 'rgb(32, 216, 120)' })
    expect(decorations[1]).toMatchObject({ content: '""', fontSize: '0px', color: 'rgb(255, 34, 102)' })
    await expect.poll(() => menu.evaluate(node => getComputedStyle(node).getPropertyValue('--prts-menu-card-caption').trim())).toBe(`"${caption}"`)
    for (const decoration of decorations) {
      expect(decoration.mask).toContain('%3Cpath')
      expect(decoration.mask).not.toContain('%3Ctext')
    }
    const bounds = await menu.boundingBox()
    const clip = { x: bounds.x, y: bounds.y, width: bounds.width, height: 24 }
    const screenshot = await page.screenshot({ clip, path: testInfo.outputPath('vector-header.png'), animations: 'disabled' })
    const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    let headerPixels = 0
    let captionPixels = 0
    for (let vertical = 4; vertical < 20; vertical++) for (let horizontal = 24; horizontal < info.width; horizontal++) {
      const index = (vertical * info.width + horizontal) * info.channels
      if (horizontal < info.width - 65 && data[index + 1] - data[index] > 40) headerPixels++
      if (horizontal > info.width - 55 && data[index + 2] > 20 && data[index + 1] < 180) captionPixels++
    }
    expect(headerPixels).toBeGreaterThan(40)
    expect(captionPixels).toBeGreaterThan(20)
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--prts-mono', 'serif')
      document.body.style.fontFamily = 'cursive'
    })
    expect(await page.screenshot({ clip, animations: 'disabled' })).toEqual(screenshot)
  })
}
