import { expect, test } from '@playwright/test'

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test(`0.2.2 main panel and native drawer keep their layout (${scheme}, ${width})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, scheme, motion: 'reduced', bootAnimation: false,
    })), scheme)
    await page.route('**/tests/fixtures/rc2-harness.html', async route => {
      const response = await route.fetch()
      const body = (await response.text())
        .replace('<main class="center-col">', '<main class="center-col"><header data-fixture-center-header>Native header</header><div class="main-panel">')
        .replace('</main>', '</div></main>')
        .replace('</head>', `<style>
          .center-col { display:flex; flex-direction:column; min-height:0; }
          .main-panel { display:flex; flex:1; min-height:0; }
          .frame[data-sidebar-drawer] .sidebar-col { position:absolute; inset:0 auto 0 0; width:280px; z-index:71; grid-area:auto; }
          .frame[data-sidebar-drawer][data-sidebar-collapsed] .sidebar-col { visibility:hidden; transform:translateX(-100%); }
          [data-sidebar-mask] { position:absolute; inset:0; z-index:70; background:rgba(0,0,0,.4); }
        </style></head>`)
      await route.fulfill({ response, body })
    })
    await page.goto('/tests/fixtures/rc2-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    const frame = page.locator('[data-prts-region="frame"]')
    const operation = page.locator('[data-prts-region="operation"]')
    const panel = page.locator('.main-panel')
    await expect(operation).toHaveClass('center-col')
    await expect(operation.locator('[data-fixture-center-header]')).toHaveCount(1)
    await expect(panel).not.toHaveAttribute('data-prts-region')
    await expect(operation.locator('[data-prts-composer-signal]')).toHaveCount(1)

    if (width < 768) {
      await frame.evaluate(node => {
        node.setAttribute('data-sidebar-drawer', '')
        node.setAttribute('data-sidebar-collapsed', '')
        node.style.gridTemplateColumns = '0px minmax(0,1fr) 0px'
        node.querySelector('[data-prts-region="sessions"]').setAttribute('inert', '')
      })
      const sidebar = page.locator('[data-prts-region="sessions"]')
      await expect(sidebar).toBeHidden()
      const closedWidth = (await operation.boundingBox()).width
      await frame.evaluate(node => {
        node.removeAttribute('data-sidebar-collapsed')
        node.querySelector('[data-prts-region="sessions"]').removeAttribute('inert')
        node.querySelector('[data-prts-region="operation"]').setAttribute('inert', '')
        const mask = document.createElement('div')
        mask.setAttribute('data-sidebar-mask', '')
        mask.onclick = () => {
          node.setAttribute('data-sidebar-collapsed', '')
          node.querySelector('[data-prts-region="sessions"]').setAttribute('inert', '')
          node.querySelector('[data-prts-region="operation"]').removeAttribute('inert')
          mask.remove()
        }
        node.prepend(mask)
      })
      await expect(sidebar).toBeVisible()
      await expect(sidebar).toHaveCSS('position', 'absolute')
      expect((await operation.boundingBox()).width).toBe(closedWidth)
      await expect(operation).toHaveAttribute('inert', '')
      const frameBox = await frame.boundingBox()
      await page.locator('[data-sidebar-mask]').click({ position: { x: frameBox.width - 5, y: 100 } })
      await expect(sidebar).toBeHidden()
      await expect(operation).not.toHaveAttribute('inert')
    }

    await panel.evaluate(node => node.setAttribute('data-global-panel', ''))
    await expect(operation).toHaveAttribute('data-prts-region', 'operation')
    await expect(panel).toHaveAttribute('data-global-panel', '')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    expect(errors).toEqual([])
  })
}
