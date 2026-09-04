import { expect, test } from '@playwright/test'

const enabled = {
  version: 2,
  enabled: true,
  texture: 'full',
  glass: 'standard',
  motion: 'reduced',
  particlePattern: 'orthogonal',
}

test('@live-stabilization deployed theme mounts and exposes the stabilized controls', async ({ page }) => {
  const liveUrl = process.env.PRTS_LIVE_URL
  test.skip(!liveUrl, 'PRTS_LIVE_URL is not configured')

  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.goto(liveUrl)

  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await expect(page.locator('[data-prts-rail-brand]')).toBeVisible()
  await expect(page.locator('[data-prts-settings-action]')).toHaveCount(0)
  await expect(page.locator('[data-prts-sessions-toggle]')).toHaveCount(0)
  await expect(page.locator('[data-prts-new-session-action]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /new session/i }).first()).toBeVisible()

  await expect(page.locator('[data-prts-conversation-scale]')).toHaveCount(0)

  const nativeRail = page.locator('[data-conversation-scroll] nav[style*="--turn-natural-height"]')
  if (!(await nativeRail.count())) {
    const sessions = page.locator('[data-prts-session-row]:not([aria-selected="true"])')
    for (let index = 0; index < await sessions.count(); index += 1) {
      await sessions.nth(index).click()
      await page.waitForTimeout(400)
      if (await nativeRail.count()) break
    }
  }
  await expect(nativeRail).toHaveCount(1)
  const marks = nativeRail.locator('button')
  expect(await marks.count()).toBeGreaterThanOrEqual(2)
  await expect(nativeRail.locator('button[aria-current="true"]')).toHaveCount(1)

  await page.locator('[data-prts-rail-brand]').click()
  await expect(page.locator('[data-prts-theme-settings]')).toBeVisible()
  await page.keyboard.press('Escape')

  const beforeScheme = await page.locator('html').getAttribute('data-prts-scheme')
  await page.locator('[data-prts-scheme-toggle]').click()
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', beforeScheme === 'dark' ? 'light' : 'dark')
  expect(errors).toEqual([])
})
