import { expect, test } from '@playwright/test'

const fixturePath = '/tests/fixtures/rc7-harness.html'
const enabled = {
  version: 8,
  enabled: true,
  texture: 'full',
  glass: 'standard',
  motion: 'system',
  bootAnimation: false,
  railDefaultHidden: false,
}

async function enableTheme(page) {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
}

test('reveals a confirmed manual theme from the scheme button center', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await enableTheme(page)
  expect(await page.evaluate(() => typeof document.startViewTransition)).toBe('function')

  const root = page.locator('html')
  const toggle = page.locator('[data-prts-scheme-toggle]')
  const before = await root.getAttribute('data-prts-scheme')
  const target = before === 'dark' ? 'light' : 'dark'
  const box = await toggle.boundingBox()
  expect(box).not.toBeNull()

  await toggle.click()
  await expect(root).toHaveAttribute('data-prts-scheme-transition', target)
  await expect(root).toHaveAttribute('data-prts-scheme', target)
  const state = await page.evaluate(() => {
    const style = document.documentElement.style
    const animation = getComputedStyle(document.documentElement, '::view-transition-new(root)')
    return {
      x: Number.parseFloat(style.getPropertyValue('--prts-scheme-origin-x')),
      y: Number.parseFloat(style.getPropertyValue('--prts-scheme-origin-y')),
      radius: Number.parseFloat(style.getPropertyValue('--prts-scheme-radius')),
      animationName: animation.animationName,
      animationDuration: animation.animationDuration,
    }
  })
  expect(state.x).toBeCloseTo(box.x + box.width / 2, 1)
  expect(state.y).toBeCloseTo(box.y + box.height / 2, 1)
  expect(state.radius).toBeGreaterThan(Math.hypot(page.viewportSize().width, page.viewportSize().height) / 2)
  expect(state.animationName).toContain('prts-scheme-reveal')
  expect(state.animationDuration).toBe('0.45s')

  await expect(root).not.toHaveAttribute('data-prts-scheme-transition', target)
  await expect(toggle).toHaveAttribute('data-prts-scheme-current', target)
})

test('changes instantly without press or reveal motion when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await enableTheme(page)

  const root = page.locator('html')
  const toggle = page.locator('[data-prts-scheme-toggle]')
  const before = await root.getAttribute('data-prts-scheme')
  const target = before === 'dark' ? 'light' : 'dark'

  await toggle.click()
  await expect(root).toHaveAttribute('data-prts-scheme', target)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition', target)
  await expect(toggle).not.toHaveAttribute('data-prts-scheme-press', '')
})
