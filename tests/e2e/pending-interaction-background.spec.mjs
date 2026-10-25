import { test, expect } from '@playwright/test'

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
test(`pending interaction backgrounds: ${scheme}, ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 })
  await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false })))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await page.evaluate(() => {
    const host = document.createElement('div')
    host.id = 'pending-background-regression'
    const style = document.createElement('style')
    style.textContent = '#pending-background-regression:is([data-phase=active],[data-content-phase=active]) [data-composer-seat] { background:linear-gradient(180deg, transparent 0px, rgb(20,20,20) 36px) }'
    document.head.append(style)
    host.innerHTML = '<div data-composer-seat style="padding:6px 16px 10px"><section style="background:rgb(30,30,30);height:180px">请选择</section></div>'
    document.body.append(host)
  })
  await page.evaluate(scheme => document.documentElement.setAttribute('data-prts-scheme', scheme), scheme)
  const seat = page.locator('#pending-background-regression [data-composer-seat]')
  for (const embedded of [false, true]) {
  await seat.evaluate((el, embedded) => { el.parentElement.removeAttribute('data-phase'); el.parentElement.removeAttribute('data-content-phase'); el.parentElement.setAttribute(embedded ? 'data-content-phase' : 'data-phase', 'active') }, embedded)
  for (const mode of ['full', 'split']) {
    await page.evaluate(mode => {
      document.documentElement.setAttribute('data-prts-background-mode', mode)
      document.documentElement.setAttribute(mode === 'full' ? 'data-prts-background-full' : 'data-prts-background-conversation', '')
    }, mode)
    for (const marker of ['data-question-key', 'data-approval-key', 'data-plan-review-key']) {
      await seat.evaluate((el, marker) => { const card = el.firstElementChild.cloneNode(true); card.setAttribute(marker, 'test'); el.replaceChildren(card) }, marker)
      await expect(seat).toHaveCSS('background-image', 'none')
      await expect(seat).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(seat.locator('section')).toHaveCSS('background-color', 'rgb(30, 30, 30)')
    }
  }
  }
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-prts-background-mode', 'off')
  })
  await expect(seat).not.toHaveCSS('background-image', 'none')
})
}
