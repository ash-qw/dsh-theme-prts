import { expect, test } from '@playwright/test'

for (const scheme of ['dark', 'light']) for (const state of ['ongoing', 'warning', 'done']) for (const direction of ['below', 'above']) {
  test('status tray keeps internal breathing room and a continuous pointer path (' + scheme + ', ' + state + ', ' + direction + ')', async ({ page }) => {
    await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, bootAnimation: false, scheme, motion: scheme === 'dark' ? 'full' : 'reduced',
    })), scheme)
    await page.goto('/tests/fixtures/rc7-harness.html')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').click()
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
    await page.evaluate(state => {
      if (state === 'done') for (const element of document.querySelectorAll('[data-state="ongoing"]')) element.setAttribute('data-state', 'done')
      window.__PRTS_FIXTURE_RUNTIME__.sessionStatus.set(new Map([['fixture-session', state === 'ongoing'
        ? { running: true } : state === 'done' ? { running: false, completionUnread: true }
          : { pendingInteraction: { kind: 'question', questions: [] } }]]))
    }, state)
    const trigger = page.locator('[data-prts-session-summary-trigger="' + state + '"]')
    const menu = page.locator('[data-prts-session-summary-popover="' + state + '"]')
    await trigger.evaluate((element, direction) => {
      const header = element.closest('[data-prts-session-summary-header]')
      Object.assign(header.style, { position: 'fixed', width: '280px', top: direction === 'above' ? '940px' : '100px' })
    }, direction)
    await trigger.hover()
    await expect(menu).toBeVisible()
    await expect(menu).not.toHaveAttribute('data-prts-summary-no-space', '')
    if (direction === 'above') await expect(menu).toHaveAttribute('data-prts-summary-above', '')
    else await expect(menu).not.toHaveAttribute('data-prts-summary-above', '')
    await expect.poll(async () => menu.evaluate(element => getComputedStyle(element).opacity)).toBe('1')
    const headerBounds = await trigger.evaluate(element => element.closest('[data-prts-session-summary-header]').getBoundingClientRect().toJSON())
    const triggerBounds = await trigger.boundingBox()
    const menuBounds = await menu.boundingBox()
    expect(Math.abs(menuBounds.x - headerBounds.left)).toBeLessThan(1)
    expect(Math.abs(menuBounds.width - headerBounds.width)).toBeLessThan(1)
    expect(Math.abs(direction === 'above' ? menuBounds.y + menuBounds.height - triggerBounds.y : menuBounds.y - triggerBounds.y - triggerBounds.height)).toBeLessThan(1)
    const surface = await menu.evaluate(element => {
      const style = getComputedStyle(element), accent = getComputedStyle(element, '::before'), face = getComputedStyle(element, '::after')
      const bounds = element.getBoundingClientRect(), border = parseFloat(style.borderTopWidth)
      return { background: face.backgroundColor, filter: face.backdropFilter, edgeWidth: face.borderTopWidth, radius: face.borderTopLeftRadius, padding: parseFloat(style.paddingTop), accentLeft: parseFloat(accent.left) + parseFloat(style.borderLeftWidth), accentWidth: parseFloat(accent.width), top: bounds.top + border + parseFloat(face.top), bottom: bounds.bottom - border - parseFloat(face.bottom) }
    })
    expect(Math.abs(direction === 'above' ? surface.bottom - headerBounds.top : surface.top - headerBounds.bottom)).toBeLessThan(1)
    expect(direction === 'above' ? triggerBounds.y - surface.bottom : surface.top - triggerBounds.y - triggerBounds.height).toBeGreaterThan(1)
    expect(surface.background).toMatch(/^rgba\(/)
    expect(surface.filter).toContain('blur(')
    expect(surface.edgeWidth).toBe('1px')
    expect(surface.radius).toBe('4px')
    expect(surface.padding).toBeGreaterThanOrEqual(12)
    expect(Math.abs(menuBounds.x + surface.accentLeft - triggerBounds.x)).toBeLessThan(1)
    expect(Math.abs(surface.accentWidth - triggerBounds.width)).toBeLessThan(1)
    const pointerX = triggerBounds.x + triggerBounds.width / 2
    const start = direction === 'above' ? triggerBounds.y : triggerBounds.y + triggerBounds.height
    const end = direction === 'above' ? menuBounds.y + menuBounds.height - 4 : menuBounds.y + 4
    const hitPath = await menu.evaluate((element, { pointerX, start, end }) => {
      const group = element.closest('[data-prts-session-summary-group]')
      const step = Math.sign(end - start)
      for (let pointerY = start; step * (end - pointerY) >= 0; pointerY += step) {
        if (!group.contains(document.elementFromPoint(pointerX, pointerY))) return false
      }
      return true
    }, { pointerX, start, end })
    expect(hitPath).toBe(true)
    await page.mouse.move(pointerX, (start + (direction === 'above' ? menuBounds.y + menuBounds.height : menuBounds.y)) / 2)
    await page.waitForTimeout(500)
    await expect(menu).toBeVisible()
    await page.mouse.move(pointerX, end, { steps: 8 })
    await page.waitForTimeout(500)
    await expect(menu).toBeVisible()
    await menu.locator('[data-prts-session-summary-item]').first().hover()
    await expect(page.locator('[data-prts-summary-reply]:not([data-prts-reply-detail]):visible')).toHaveCount(1)
    await page.mouse.move(1200, 850)
    await expect(menu).toBeHidden()
  })
}
