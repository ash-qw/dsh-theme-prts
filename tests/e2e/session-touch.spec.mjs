import { expect, test } from '@playwright/test'

async function mount(page, fixture, scheme) {
  await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, scheme, bootAnimation: false, motion: 'system',
  })), scheme)
  await page.goto(`/tests/fixtures/${fixture}-harness.html`)
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await page.locator('html').evaluate(node => { node.dataset.prtsRailOpen = '' })
  const row = page.locator('[data-prts-session-row]').first()
  await expect(row).toBeVisible()
  await expect(row.locator('> [data-prts-facility-spine]')).toHaveAttribute('data-prts-facility-vector', '')
  return row
}

async function expectResting(row) {
  await expect(row.locator('> [data-prts-facility-spine]')).toHaveCSS('transform', 'matrix(0.25, 0, 0, 1, 0, 0)')
  await expect(row.locator('[data-prts-session-menu]')).toHaveCSS('animation-name', 'none')
  for (const part of ['[data-prts-row-title]', '[data-prts-facility-face]', '[data-prts-session-actions]']) {
    await expect(row.locator(part).first()).toHaveCSS('transform', /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
  }
}

for (const fixture of ['rc2', 'rc7']) for (const scheme of ['dark', 'light']) for (const width of [390, 1024]) {
  test(`touch keeps session targets stationary (${fixture}, ${scheme}, ${width})`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: true, isMobile: true, colorScheme: scheme, reducedMotion: 'no-preference' })
    try {
      const page = await context.newPage()
      const row = await mount(page, fixture, scheme)
      await row.evaluate(node => {
        node.setAttribute('aria-selected', 'false')
        node.dataset.taps = '0'
        node.dataset.actionTaps = '0'
        node.addEventListener('click', event => {
          if (event.target.closest('button')) node.dataset.actionTaps = String(Number(node.dataset.actionTaps) + 1)
          else { node.dataset.taps = String(Number(node.dataset.taps) + 1); node.setAttribute('aria-selected', 'true') }
        })
      })
      await expectResting(row)
      const title = row.locator('[data-prts-row-title]')
      const before = await title.boundingBox()
      await title.tap()
      await expect(row).toHaveAttribute('data-taps', '1')
      await expect(row).toHaveAttribute('aria-selected', 'true')
      await expectResting(row)
      expect(await title.boundingBox()).toEqual(before)
      const pickup = row.locator('[data-prts-session-pickup]')
      const bar = row.locator('[data-prts-session-pickup-bar]').first()
      await expect(pickup).toHaveCSS('opacity', '0.58')
      await expect(bar).toHaveCSS('visibility', 'visible')
      await expect(bar).toHaveCSS('animation-name', 'prts-session-pickup-sample')
      await expect(row).not.toHaveAttribute('data-prts-pickup-ready')
      await expect(row.locator('[data-prts-session-lifeline]')).toHaveCSS('opacity', '0')
      await row.evaluate(node => node.setAttribute('aria-selected', 'false'))
      await expect(pickup).toHaveCSS('opacity', '0')
      await expect(bar).toHaveCSS('animation-name', 'none')
      await row.evaluate(node => node.setAttribute('aria-selected', 'true'))
      await expect(bar).toHaveCSS('animation-name', 'prts-session-pickup-sample')
      await page.locator('html').evaluate(node => { node.dataset.prtsMotion = 'reduced' })
      await expect(bar).toHaveCSS('animation-name', 'none')
      await expect(bar).toHaveCSS('visibility', 'visible')
      await page.locator('html').evaluate(node => { node.dataset.prtsMotion = 'system' })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await expect(bar).toHaveCSS('animation-name', 'none')
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await row.locator('[data-prts-session-menu]').tap()
      await expect(row).toHaveAttribute('data-action-taps', '1')
      await expect(row).toHaveAttribute('data-taps', '1')
      await row.evaluate(node => { node.setAttribute('data-prts-row-menu-open', '') })
      await expectResting(row)
      await row.locator('[data-prts-session-menu]').focus()
      await expectResting(row)
      await row.evaluate(node => { node.removeAttribute('data-prts-row-menu-open'); node.removeAttribute('data-prts-spine-vector') })
      await expect.poll(() => row.evaluate(node => getComputedStyle(node, '::before').transform)).toBe('matrix(0.25, 0, 0, 1, 0, 0)')
    } finally {
      await context.close()
    }
  })
}

test('a touch on a mouse device contracts the spine and mouse input restores hover', async ({ page }) => {
  const row = await mount(page, 'rc7', 'dark')
  await row.hover()
  await expect(row.locator('> [data-prts-facility-spine]')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await row.dispatchEvent('pointerdown', { pointerType: 'touch', bubbles: true })
  await expectResting(row)
  await expect(row).not.toHaveAttribute('data-prts-pickup-ready')
  await row.dispatchEvent('pointerover', { pointerType: 'mouse', bubbles: true })
  await expect(row.locator('> [data-prts-facility-spine]')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await expect(row).toHaveAttribute('data-prts-pickup-ready', '')
})
