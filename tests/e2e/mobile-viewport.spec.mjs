import { expect, test } from '@playwright/test'

test.use({ hasTouch: true })

test('host colors added or changed after startup follow the current theme without a diagnostic panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false, motion: 'off' })))
  await page.goto('/tests/fixtures/rc7-harness.html?prts-chrome-probe=1')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  const stored = await page.evaluate(() => localStorage.getItem('dsh.ui.prts.v1'))
  await page.evaluate(() => {
    for (const [color, media] of [['#123456', '(prefers-color-scheme: dark)'], ['#abcdef', '(prefers-color-scheme: light)']]) {
      const node = document.createElement('meta')
      node.name = 'theme-color'; node.content = color; node.setAttribute('media', media)
      node.dataset.testHostColor = ''
      document.head.append(node)
    }
  })
  const colors = page.locator('meta[name="theme-color"]')
  await expect(colors).toHaveCount(3)
  for (const node of await colors.all()) await expect(node).toHaveAttribute('content', '#080a0c')
  await page.locator('meta[data-test-host-color]').first().evaluate(node => { node.content = '#654321' })
  await expect(page.locator('meta[data-test-host-color]').first()).toHaveAttribute('content', '#080a0c')
  await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.theme.setTheme('light'))
  for (const node of await colors.all()) await expect(node).toHaveAttribute('content', '#eef1f3')
  await expect(page.locator('meta[data-test-host-color]').last()).toHaveAttribute('media', '(prefers-color-scheme: light)')
  await expect(page.locator('[data-prts-mobile-chrome-probe]')).toHaveCount(0)
  await expect(page.locator('#root')).toHaveCSS('opacity', '1')
  expect(await page.evaluate(() => localStorage.getItem('dsh.ui.prts.v1'))).toBe(stored)
})

for (const scheme of ['dark', 'light']) {
  for (const orientation of ['portrait', 'landscape', 'desktop']) {
    test(`safe viewport and wallpaper (${scheme}, ${orientation})`, async ({ page }) => {
      const landscape = orientation === 'landscape'
      const desktop = orientation === 'desktop'
      const width = desktop ? 1440 : landscape ? 844 : 390
      const height = desktop ? 1000 : landscape ? 390 : 844
      const safe = desktop ? { top: 0, bottom: 0, left: 0, right: 0 } : landscape ? { top: 0, bottom: 21, left: 47, right: 47 } : { top: 59, bottom: 34, left: 0, right: 0 }
      await page.setViewportSize({ width, height })
      await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false, motion: 'off' })))
      await page.goto('/tests/fixtures/rc7-harness.html')
      await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
      await page.evaluate(({ scheme, safe }) => {
        window.__PRTS_FIXTURE_RUNTIME__.theme.setTheme(scheme)
        // Chromium has no iPhone hardware insets; inject the values at the env() boundary.
        for (const [edge, value] of Object.entries(safe)) document.documentElement.style.setProperty(`--prts-safe-${edge}`, `${value}px`)
        document.documentElement.dataset.prtsBackgroundMode = 'full'
        document.documentElement.dataset.prtsBackgroundFull = 'test'
        document.documentElement.style.setProperty('--prts-background-full', 'linear-gradient(135deg, rgb(50, 80, 110), rgb(170, 180, 190))')
        window.dispatchEvent(new Event('resize'))
      }, { scheme, safe })
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/)
      await expect(page.locator('meta[data-prts-browser-chrome]')).toHaveAttribute('content', scheme === 'dark' ? '#080a0c' : '#eef1f3')
      await expect.poll(() => page.locator('[data-prts-region="frame"]').evaluate(node => Math.round(node.getBoundingClientRect().bottom))).toBe(height - safe.bottom)
      const geometry = await page.evaluate(() => {
        const frame = document.querySelector('[data-prts-region="frame"]').getBoundingClientRect()
        const rail = document.querySelector('[data-prts-nav-rail]').getBoundingClientRect()
        return { top: frame.top, right: frame.right, railBottom: rail.bottom, scrollWidth: document.documentElement.scrollWidth, bodyHeight: document.body.getBoundingClientRect().height, bodyImage: getComputedStyle(document.body).backgroundImage, frameImage: getComputedStyle(document.querySelector('[data-prts-region="frame"]')).backgroundImage }
      })
      expect(geometry.top).toBeCloseTo(safe.top, 1)
      expect(geometry.right).toBeCloseTo(width - safe.right, 1)
      expect(geometry.railBottom).toBeCloseTo(height - safe.bottom, 1)
      expect(geometry.scrollWidth).toBeLessThanOrEqual(width)
      expect(geometry.bodyHeight).toBeCloseTo(height, 1)
      const scrollport = await page.evaluate(() => ({
        htmlOverflow: getComputedStyle(document.documentElement).overflowY,
        bodyOverflow: getComputedStyle(document.body).overflowY,
        travel: document.scrollingElement.scrollHeight - innerHeight,
      }))
      expect(scrollport.bodyOverflow).toBe('hidden')
      expect(scrollport.travel).toBe(0)
      expect(geometry.bodyImage).toBe(geometry.frameImage)
      expect(geometry.bodyImage).toContain('linear-gradient')
      if (safe.top) {
        const pending = await page.evaluate(() => {
          // Layout must already fit before the host's asynchronous measurement.
          document.documentElement.style.setProperty('--prts-host-top-inset', '0px')
          return {
            bottom: document.querySelector('[data-prts-region="frame"]').getBoundingClientRect().bottom,
            railTop: document.querySelector('[data-prts-nav-rail]').getBoundingClientRect().top,
          }
        })
        expect(pending.bottom).toBeCloseTo(height - safe.bottom, 1)
        expect(pending.railTop).toBeCloseTo(safe.top, 1)
      }
      await page.evaluate(() => {
        const root = document.documentElement
        root.dataset.prtsBackgroundMode = 'split'
        root.dataset.prtsBackgroundConversation = 'test'
        root.style.setProperty('--prts-background-conversation', root.style.getPropertyValue('--prts-background-full'))
      })
      await expect(page.locator('[data-prts-region="frame"]')).toHaveCSS('background-image', 'none')
      expect(await page.locator('body').evaluate(node => getComputedStyle(node).backgroundImage)).toContain('linear-gradient')
      await page.evaluate(() => { document.documentElement.dataset.prtsBackgroundMode = 'off' })
      await expect(page.locator('body')).toHaveCSS('background-image', 'none')
    })
  }
}

for (const scheme of ['dark', 'light']) {
  test(`Safari chrome matches cropped wallpaper and dimming (${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false, motion: 'off' })))
    await page.goto('/tests/fixtures/rc7-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    await page.evaluate(scheme => {
      window.__PRTS_FIXTURE_RUNTIME__.theme.setTheme(scheme)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 100
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'rgb(200, 100, 80)'; ctx.fillRect(0, 0, 100, 100)
      ctx.fillStyle = 'rgb(40, 160, 120)'; ctx.fillRect(0, 25, 100, 50)
      const root = document.documentElement
      root.dataset.prtsBackgroundMode = 'split'
      root.dataset.prtsBackgroundConversation = 'test'
      root.style.setProperty('--prts-background-conversation', `url("${canvas.toDataURL()}")`)
      root.style.setProperty('--prts-background-shade', '0%')
    }, scheme)
    const chrome = page.locator('meta[data-prts-browser-chrome]')
    await expect(chrome).toHaveAttribute('content', 'rgb(200, 100, 80)')
    await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(200, 100, 80)')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(200, 100, 80)')

    // Cover changes the visible top row in landscape; protected positioning overrides it.
    await page.setViewportSize({ width: 844, height: 390 })
    await expect(chrome).toHaveAttribute('content', 'rgb(40, 160, 120)')
    await page.evaluate(() => document.documentElement.style.setProperty('--prts-protected-conversation-y', '0px'))
    await expect(chrome).toHaveAttribute('content', 'rgb(200, 100, 80)')
    await page.evaluate(() => document.documentElement.style.setProperty('--prts-background-shade', '50%'))
    await expect(chrome).toHaveAttribute('content', scheme === 'dark' ? 'rgb(104, 55, 46)' : 'rgb(219, 171, 162)')
    await expect(page.locator('body')).toHaveCSS('background-color', scheme === 'dark' ? 'rgb(104, 55, 46)' : 'rgb(219, 171, 162)')

    // Switching slots and replacing/removing images refreshes the tint without reloading.
    await page.evaluate(() => {
      const root = document.documentElement
      root.dataset.prtsBackgroundMode = 'full'
      root.dataset.prtsBackgroundFull = 'test'
      root.style.setProperty('--prts-background-full', root.style.getPropertyValue('--prts-background-conversation'))
      root.style.setProperty('--prts-protected-full-y', '0px')
      root.style.setProperty('--prts-background-shade', '0%')
    })
    await expect(chrome).toHaveAttribute('content', 'rgb(200, 100, 80)')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(200, 100, 80)')

    // A translucent PNG must still composite over the theme canvas, independently
    // of the solid tint exposed to Safari. Read the actual rendered pixels too.
    await page.evaluate(() => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 100
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'rgba(200, 100, 80, .5)'
      ctx.fillRect(0, 0, 100, 100)
      const root = document.documentElement
      root.style.setProperty('--prts-background-full', `url("${canvas.toDataURL()}")`)
      root.style.setProperty('--prts-safe-top', '59px')
      root.style.setProperty('--prts-safe-left', '47px')
    })
    const expected = scheme === 'dark' ? [104, 55, 46] : [219, 170, 161]
    // Canvas alpha rounding differs by one channel value between engines.
    await expect.poll(async () => {
      const actual = (await chrome.getAttribute('content')).match(/\d+/g)?.map(Number)
      return actual?.length === 3 ? Math.max(...actual.map((value, i) => Math.abs(value - expected[i]))) : Infinity
    }).toBeLessThanOrEqual(1)
    await expect(page.locator('body')).toHaveCSS('background-color', await chrome.getAttribute('content'))
    const { default: sharp } = await import('sharp')
    const { data, info } = await sharp(await page.screenshot({ clip: { x: 0, y: 100, width: 4, height: 20 } })).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    for (let channel = 0; channel < 3; channel++) {
      let sum = 0
      for (let i = channel; i < data.length; i += info.channels) sum += data[i]
      expect(Math.abs(sum / (info.width * info.height) - expected[channel])).toBeLessThan(2)
    }
    await page.evaluate(() => document.documentElement.style.setProperty('--prts-background-full', 'url("/missing-wallpaper.png")'))
    await expect(chrome).toHaveAttribute('content', scheme === 'dark' ? '#080a0c' : '#eef1f3')
    await page.evaluate(() => { document.documentElement.dataset.prtsBackgroundMode = 'off' })
    await expect(chrome).toHaveAttribute('content', scheme === 'dark' ? '#080a0c' : '#eef1f3')
    await expect(page.locator('body')).toHaveCSS('background-color', scheme === 'dark' ? 'rgb(8, 10, 12)' : 'rgb(238, 241, 243)')
  })
}
