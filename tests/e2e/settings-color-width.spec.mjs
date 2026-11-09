import { expect, test } from '@playwright/test'

test('shared flow color editor and buttons fit their row across responsive boundaries', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ revision: 1, value: { enabled: true, bootAnimation: false, motion: 'reduced', sessionFlow: true, sessionFlowPalette: 'custom' } })))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('#prts-tab-flow').click()
  const row = page.locator('[data-prts-setting-row="sessionFlowColors"]')
  const buttons = row.locator('.prts-page-control')
  await expect(buttons).toHaveCount(3)
  for (const width of [1280, 1024, 900, 840, 800, 780, 760, 740, 721, 720, 640, 390, 360, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await row.scrollIntoViewIfNeeded()
    expect(await row.evaluate(node => node.scrollWidth - node.clientWidth), 'row overflow at ' + width).toBeLessThanOrEqual(1)
    for (const button of await buttons.all()) {
      expect(await button.evaluate(node => {
        const box = node.getBoundingClientRect(), row = node.closest('[data-prts-setting-row]').getBoundingClientRect()
        return box.left >= row.left && box.right <= row.right + 1
      }), 'button bounds at ' + width).toBeTruthy()
      await button.scrollIntoViewIfNeeded()
      expect(await button.evaluate(node => {
        const box = node.getBoundingClientRect(), hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        return hit === node || node.contains(hit)
      }), 'color hit area at ' + width).toBeTruthy()
    }
  }
  await buttons.first().click()
  const editor = page.getByRole('dialog', { name: '前层流线颜色', exact: true })
  const bounds = await editor.boundingBox()
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(320)
  expect(bounds.y).toBeGreaterThanOrEqual(0)
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(900)
  await editor.getByLabel('HEX 颜色').fill('#123456')
  await editor.getByRole('button', { name: '应用颜色', exact: true }).click()
  await expect(row).toContainText('#123456')
  await expect.poll(() => page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.sessionFlowColorFront)).toBe('#123456')
})
