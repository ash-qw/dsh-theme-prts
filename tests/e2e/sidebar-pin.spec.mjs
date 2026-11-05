import { expect, test } from '@playwright/test'

for (const structure of ['legacy', 'nested', 'touch']) {
  test.describe(`native pin indicator (${structure})`, () => {
    test.use({ hasTouch: structure === 'touch' })
    for (const scheme of ['dark', 'light']) for (const width of [287, 148]) {
      test(`keeps the pin visible in idle, hovered and current sessions (${scheme}, ${width})`, async ({ page }) => {
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
          version: 12, enabled: true, motion: 'reduced', bootAnimation: false,
        })))
        await page.route('**/tests/fixtures/rc7-harness.html', async route => {
          const response = await route.fetch()
          const indicator = '<span class="fixture_pinIndicator" role="img" aria-label="已置顶"><svg viewBox="0 0 16 16" width="12" height="12"><path d="M5 1h6l-1 5 3 3H9v6H7V9H3l3-3z" fill="currentColor"/></svg></span>'
          let body = await response.text()
          body = body.replace('<span class="sessionTime">刚刚</span>', structure === 'legacy'
            ? `<span class="sessionTime">刚刚</span>${indicator}`
            : `<span class="fixture_rowResting"><span class="fixture_time fixture_timestamp">刚刚</span><span data-slot="sidebar.session.row.trailing" style="display:contents"></span>${indicator}</span>`)
          if (structure !== 'legacy') {
            body = body.replace('<span><button type="button" aria-label="Session row actions">…</button></span>', '<button type="button" data-context-menu-trigger aria-label="Session row actions">…</button><span><div data-slot="sidebar.workspaces.session.row.action"><button type="button" class="fixture_pinnedAction">Unpin</button></div></span>')
          }
          body = body.replace('</head>', `<style>
            .fixture_rowResting { display:inline-flex; flex:0 0 auto; align-items:center; gap:6px; }
            .fixture_pinIndicator { display:inline-flex; flex:0 0 16px; width:16px; height:20px; align-items:center; justify-content:center; margin-left:6px; }
            .fixture_rowResting .fixture_pinIndicator { margin-left:0; }
            .sessionRow:is(:hover, .menuOpen) .fixture_rowResting { display:none; }
            @media (hover:none) {
              .sessionRow .rowActions { display:inline-flex; }
              .sessionRow .fixture_timestamp, .sessionRow:has(.fixture_pinnedAction) .fixture_pinIndicator { display:none; }
            }
          </style></head>`)
          await route.fulfill({ response, body })
        })
        await page.goto('/tests/fixtures/rc7-harness.html')
        await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
        if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
          await page.locator('[data-prts-scheme-toggle]').click()
        }
        await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
        await page.locator('[data-prts-region="frame"]').evaluate((node, width) => {
          node.style.gridTemplateColumns = `${width}px minmax(0px, 1fr) 0px`
        }, width)
        const row = page.locator('[data-prts-session-row]')
        const pin = row.locator('[data-prts-session-pin]')
        await expect(pin).toHaveCount(1)
        for (const current of [false, true]) for (const hovered of [false, true]) {
          await row.evaluate((node, current) => node.setAttribute('aria-selected', String(current)), current)
          if (hovered) await row.hover()
          else await page.mouse.move(1100, 800)
          await expect(pin).toBeVisible()
          await expect.poll(() => pin.evaluate(node => {
            for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
              if (Number(getComputedStyle(ancestor).opacity) === 0) return false
            }
            return true
          })).toBe(true)
          const bounds = await row.evaluate(node => {
            const pin = node.querySelector('[data-prts-session-pin]').getBoundingClientRect()
            const face = node.querySelector('[data-prts-facility-face]').getBoundingClientRect()
            const title = node.querySelector('[data-prts-row-title]').getBoundingClientRect()
            const menu = node.querySelector('[data-prts-session-menu]').getBoundingClientRect()
            return { pinLeft: pin.left, pinRight: pin.right, pinTop: pin.top, pinBottom: pin.bottom, faceLeft: face.left, faceRight: face.right, faceTop: face.top, faceBottom: face.bottom, titleRight: title.right, menuLeft: menu.left, menuWidth: menu.width }
          })
          expect(bounds.pinLeft).toBeGreaterThanOrEqual(bounds.faceLeft - 0.5)
          expect(bounds.pinRight).toBeLessThanOrEqual(bounds.faceRight - 3.5)
          expect(bounds.pinTop).toBeGreaterThanOrEqual(bounds.faceTop - 0.5)
          expect(bounds.pinBottom).toBeLessThanOrEqual(bounds.faceBottom + 0.5)
          expect(bounds.titleRight).toBeLessThanOrEqual(bounds.pinLeft + 0.5)
          if (bounds.menuWidth) expect(bounds.pinRight).toBeLessThan(bounds.menuLeft)
        }
        await row.evaluate(node => node.querySelector('[data-prts-session-pin]').remove())
        await expect(pin).toHaveCount(0)
        expect(errors).toEqual([])
      })
    }
  })
}
