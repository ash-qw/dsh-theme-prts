import { expect, test } from '@playwright/test'
import sharp from 'sharp'

for (const protectedRegion of [false, true]) {
  test(`conversation wallpaper stays still as the sidebar expands, protected=${protectedRegion}`, async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 500 })
    const bands = Array.from({ length: 12 }, (_, i) => `<rect x="${i * 100}" width="100" height="600" fill="hsl(${i * 30} 80% 50%)"/>`).join('')
    const image = await sharp(Buffer.from(`<svg width="1200" height="600" xmlns="http://www.w3.org/2000/svg">${bands}</svg>`)).png().toBuffer()
    const url = `data:image/png;base64,${image.toString('base64')}`
    await page.route('**/conversation-resize-fixture', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
      <html data-dsh-prts data-prts-background-mode="split" data-prts-background-conversation><head><style>
      html { --prts-canvas:#080a0c; --prts-panel:#111; --prts-ink:#fff; --prts-background-wash:transparent; --prts-background-conversation:url("${url}"); --prts-nav-width:0px; --prts-host-top-inset:0px; --prts-sidebar-image-ratio:1; --prts-sidebar-width:56px; }
      body { margin:0; } [data-prts-region="frame"] { display:grid; grid-template-columns:56px minmax(0,1fr); width:800px; height:500px; }
      [data-prts-region="sessions"] { position:relative; overflow:hidden; background:#111; } [data-prts-region="operation"] { min-width:0; }
      </style><link rel="stylesheet" href="/src/styles/custom-background.css"></head><body>
      <div data-prts-region="frame"><div data-prts-region="sessions"></div><div data-prts-region="operation"></div></div>
      </body></html>` }))
    await page.goto('/conversation-resize-fixture')
    const frame = page.locator('[data-prts-region="frame"]')
    expect(await frame.evaluate(node => getComputedStyle(node).backgroundImage)).toContain('data:image/png')
    const sidebar = page.locator('[data-prts-region="sessions"]')
    await expect(sidebar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    expect(await sidebar.evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(')
    if (protectedRegion) await page.evaluate(async () => {
      const { createBackgroundLayout } = await import('/src/client/background-layout.js')
      const layout = createBackgroundLayout({ window, document })
      layout.update({ conversation: { width: 1200, height: 600, region: { x:.45, y:.1, width:.1, height:.8 } } })
      layout.setEnabled(true)
      window.__backgroundLayout = layout
    })
    const samples = []
    for (const width of [56, 120, 280, 420]) {
      await frame.evaluate((node, value) => { node.style.gridTemplateColumns = `${value}px minmax(0,1fr)` }, width)
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const screenshot = await page.screenshot()
      const pixels = await sharp(screenshot).extract({ left: 500, top: 250, width: 1, height: 1 }).raw().toBuffer()
      samples.push([...pixels])
    }
    expect(samples.slice(1)).toEqual([samples[0], samples[0], samples[0]])
    const sidebarScreenshot = await page.screenshot()
    const sidebarPixels = await sharp(sidebarScreenshot).extract({ left: 100, top: 250, width: 300, height: 1 }).removeAlpha().raw().toBuffer()
    expect([...sidebarPixels.subarray(0, 3)]).not.toEqual([...sidebarPixels.subarray(250 * 3, 250 * 3 + 3)])
    await page.evaluate(imageUrl => {
      document.documentElement.style.setProperty('--prts-background-sidebar', `url("${imageUrl}")`)
      document.documentElement.setAttribute('data-prts-background-sidebar', '')
    }, url)
    expect(await sidebar.evaluate(node => getComputedStyle(node).backgroundImage)).toContain('data:image/png')
    if (protectedRegion) await page.evaluate(() => window.__backgroundLayout.dispose())
  })
}

for (const mode of ['split', 'full']) {
  test(`right dock reveals the frame wallpaper in ${mode} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 500 })
    const bands = Array.from({ length: 8 }, (_, i) => `<rect x="${i * 100}" width="100" height="500" fill="hsl(${i * 45} 80% 50%)"/>`).join('')
    const image = await sharp(Buffer.from(`<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">${bands}</svg>`)).png().toBuffer()
    const url = `data:image/png;base64,${image.toString('base64')}`
    const slot = mode === 'split' ? 'conversation' : 'full'
    await page.route('**/right-dock-background-fixture', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
      <html data-dsh-prts data-prts-background-mode="${mode}" data-prts-background-${slot}><head><style>
      html { --prts-canvas:#080a0c; --prts-panel:#111; --prts-ink:#fff; --prts-background-wash:transparent; --prts-background-${slot}:url("${url}"); }
      body { margin:0; } [data-prts-region="frame"] { display:grid; grid-template-columns:500px 300px; width:800px; height:500px; }
      [data-prts-region="operation"], [data-prts-region="auxiliary"], .native-tab-host, [data-dockkit-empty] { background:#111; }
      [data-dockkit-host="dock"], .native-tab-host { width:100%; height:100%; }
      </style><link rel="stylesheet" href="/src/styles/custom-background.css"></head><body>
      <div data-prts-region="frame"><div data-prts-region="operation"></div><aside data-prts-region="auxiliary"><div data-dockkit-host="dock"><div class="native-tab-host"></div></div><div data-dockkit-empty hidden></div></aside></div>
      </body></html>` }))
    await page.goto('/right-dock-background-fixture')
    const frame = page.locator('[data-prts-region="frame"]')
    expect(await frame.evaluate(node => getComputedStyle(node).backgroundImage)).toContain('data:image/png')
    const dock = page.locator('.native-tab-host')
    await expect(page.locator('[data-prts-region="auxiliary"]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(dock).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    expect(await dock.evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(8px)')
    expect(await page.locator('[data-dockkit-empty]').evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(8px)')
    await page.evaluate(() => document.documentElement.style.setProperty('--prts-sidebar-blur', '14px'))
    expect(await dock.evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(8px)')
    await page.evaluate(() => document.documentElement.style.setProperty('--prts-right-sidebar-blur', '14px'))
    expect(await dock.evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(14px)')
    const screenshot = await page.screenshot()
    const pixels = await sharp(screenshot).extract({ left: 550, top: 250, width: 201, height: 1 }).removeAlpha().raw().toBuffer()
    expect([...pixels.subarray(0, 3)]).not.toEqual([...pixels.subarray(200 * 3, 200 * 3 + 3)])
  })
}
