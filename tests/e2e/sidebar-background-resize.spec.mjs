import { expect, test } from '@playwright/test'

for (const protectedRegion of [false, true]) {
  test(`sidebar wallpaper covers every resized frame, protected=${protectedRegion}`, async ({ page }) => {
    await page.route('**/sidebar-resize-fixture', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
      <html data-dsh-prts data-prts-background-mode="split" data-prts-background-sidebar><head><style>
      html { --prts-nav-width:0px; --prts-sidebar-image-ratio:.46; --prts-host-top-inset:0px; }
      body { margin:0; } [data-prts-region="frame"] { display:flex; height:100vh; }
      [data-prts-region="sessions"] { width:56px; flex:none; }
      [data-prts-region="operation"] { flex:1; }
      </style><link rel="stylesheet" href="/src/styles/custom-background.css"></head><body>
      <div data-prts-region="frame"><div data-prts-region="sessions"></div><div data-prts-region="operation"></div></div>
      </body></html>` }))
    await page.goto('/sidebar-resize-fixture')
    const result = await page.evaluate(async protectedRegion => {
      const { createBackgroundLayout } = await import('/src/client/background-layout.js')
      const { createHostGeometryAdapter } = await import('/src/client/host-geometry-adapter.js')
      const sidebar = document.querySelector('[data-prts-region="sessions"]')
      const root = document.documentElement
      const geometry = createHostGeometryAdapter({ window, document })
      geometry.start(document.querySelector('[data-prts-region="frame"]'))
      const background = createBackgroundLayout({ window, document })
      background.update({ sidebar: { width: 460, height: 1000, region: protectedRegion ? { x:.5, y:0, width:.4, height:1 } : null } })
      background.setEnabled(true)
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      const violations = [], widths = [280,56,320,180,400,56,280]
      let samples = 0
      // Registered after both adapters: checks the geometry in the resize
      // delivery before paint, not after a later rAF has hidden a stale frame.
      await new Promise(resolve => {
        const observer = new ResizeObserver(() => {
          const width = sidebar.clientWidth
          const declared = parseFloat(root.style.getPropertyValue('--prts-sidebar-width'))
          const imageWidth = parseFloat(root.style.getPropertyValue('--prts-protected-sidebar-width')) || Math.max(declared, innerHeight * .46)
          const x = parseFloat(root.style.getPropertyValue('--prts-protected-sidebar-x')) || (declared-imageWidth)/2
          if (declared !== width || x > .01 || x + imageWidth < width - .01) violations.push({width,declared,imageWidth,x})
          samples++
          if (!widths.length) { observer.disconnect(); resolve(); return }
          requestAnimationFrame(() => { sidebar.style.width = `${widths.shift()}px` })
        })
        observer.observe(sidebar)
      })
      background.dispose(); geometry.dispose()
      return { violations, samples }
    }, protectedRegion)
    expect(result.samples).toBe(8)
    expect(result.violations).toEqual([])
  })
}
