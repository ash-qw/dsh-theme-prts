import { expect, test } from '@playwright/test'

const sidebarImage = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path fill="#325267" d="M0 0h64v64H0z"/></svg>').toString('base64')}`
const frameImage = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><path fill="#8b6243" d="M0 0h64v64H0z"/></svg>').toString('base64')}`

for (const host of ['macOS 0.2.1', 'macOS 0.2.2', 'web']) {
  for (const scheme of ['dark', 'light']) {
    for (const mode of ['split', 'full']) {
      test(`${host} ${scheme} ${mode} wallpaper overrides native sidebar paint`, async ({ page }) => {
        const frameSelector = host === 'macOS 0.2.1' ? '' : '.frame:not([data-sidebar-drawer]) '
        const frameSlot = mode === 'split' ? 'conversation' : 'full'
        await page.route('**/desktop-background-fixture', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
          <html data-dsh-prts data-platform="${host === 'web' ? 'web' : 'darwin'}" data-prts-background-mode="${mode}" data-prts-background-${frameSlot} ${mode === 'split' ? 'data-prts-background-sidebar' : ''}>
          <head><style>
          html { --prts-canvas:#080a0c; --prts-panel:#111; --prts-background-shade:0%; --prts-background-sidebar:url("${sidebarImage}"); --prts-background-${frameSlot}:url("${frameImage}"); --prts-sidebar-width:280px; --prts-nav-width:52px; --prts-host-top-inset:0px; }
          body { margin:0; } .frame { display:grid; grid-template-columns:52px 280px 1fr; height:500px; }
          .sidebarCol, [data-prts-region="operation"] { background:rgb(30,31,32); }
          </style><link rel="stylesheet" href="/src/styles/custom-background.css"><style>
          [data-platform=darwin] ${frameSelector}.sidebarCol { background:linear-gradient(#7a9bf01a,#8f89b817),rgb(50,51,52); }
          [data-platform=darwin] [data-ds-dark-theme] ${frameSelector}.sidebarCol { background:linear-gradient(#7a9bf014,#8f89b812),rgb(20,21,22); }
          </style></head><body ${scheme === 'dark' ? 'data-ds-dark-theme' : ''}>
          <div class="frame" data-prts-region="frame"><nav data-prts-nav-rail></nav><aside class="sidebarCol" data-prts-region="sessions"><div data-slot="sidebar"></div></aside><main data-prts-region="operation"></main></div>
          </body></html>` }))
        await page.goto('/desktop-background-fixture')
        const sidebar = page.locator('[data-prts-region="sessions"]')
        const rail = page.locator('[data-prts-nav-rail]')
        const frame = page.locator('[data-prts-region="frame"]')
        const operation = page.locator('[data-prts-region="operation"]')
        const backgroundImage = locator => locator.evaluate(node => getComputedStyle(node).backgroundImage)
        const assertWallpaper = async () => {
          expect(await backgroundImage(frame)).toContain(frameImage)
          await expect(sidebar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
          await expect(operation).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
          if (mode === 'split') {
            expect(await backgroundImage(sidebar)).toContain(sidebarImage)
            expect(await backgroundImage(sidebar)).not.toContain(frameImage)
          } else {
            expect(await backgroundImage(sidebar)).toBe('none')
          }
        }
        await assertWallpaper()
        await page.evaluate(() => document.body.toggleAttribute('data-ds-dark-theme'))
        await assertWallpaper()
        await page.evaluate(() => document.body.toggleAttribute('data-ds-dark-theme'))
        await assertWallpaper()
        expect(await backgroundImage(rail)).toContain(mode === 'split' ? sidebarImage : frameImage)
        await page.evaluate(() => document.documentElement.dataset.prtsRailMode = 'overlay')
        await expect(rail).toHaveCSS('background-image', 'none')
        await expect(rail).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        await assertWallpaper()
        await page.evaluate(() => document.documentElement.removeAttribute('data-prts-rail-mode'))
        expect(await backgroundImage(rail)).toContain(mode === 'split' ? sidebarImage : frameImage)
        if (mode === 'split') {
          await page.evaluate(() => document.documentElement.removeAttribute('data-prts-background-sidebar'))
          await expect(sidebar).toHaveCSS('background-image', 'none')
          await expect(sidebar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
          expect(await backgroundImage(frame)).toContain(frameImage)
        }
        await page.evaluate(() => document.documentElement.dataset.prtsBackgroundMode = 'none')
        await expect(sidebar).toHaveCSS('background-color', host === 'web' ? 'rgb(30, 31, 32)' : scheme === 'dark' ? 'rgb(20, 21, 22)' : 'rgb(50, 51, 52)')
      })
    }
  }
}
