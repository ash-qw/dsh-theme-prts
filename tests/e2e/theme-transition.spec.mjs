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

test('reveals the new theme behind one soft PRTS boundary', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await enableTheme(page)

  const root = page.locator('html')
  const toggle = page.locator('[data-prts-scheme-toggle]')
  const before = await root.getAttribute('data-prts-scheme')
  const target = before === 'dark' ? 'light' : 'dark'
  await page.evaluate(() => {
    const original = document.startViewTransition
    window.__prtsViewTransitionCalls = 0
    document.startViewTransition = function (...args) {
      window.__prtsViewTransitionCalls += 1
      return original.apply(this, args)
    }
  })

  await toggle.click()
  await expect(root).toHaveAttribute('data-prts-scheme-transition', target)
  await expect(root).toHaveAttribute('data-prts-scheme-transition-mode', 'view')
  await expect(page.locator('[data-prts-scheme-reveal="' + target + '"]')).toHaveCount(1)

  const state = await page.evaluate(() => {
    const html = document.documentElement
    const animation = document.getAnimations().find(candidate => candidate.effect?.pseudoElement === '::view-transition-new(root)')
    const pseudo = getComputedStyle(html, '::view-transition-new(root)')
    const blend = getComputedStyle(document.querySelector('[data-prts-scheme-reveal-blend]'))
    return {
      duration: html.style.getPropertyValue('--prts-scheme-duration'),
      startClip: animation?.effect?.getKeyframes?.()[0]?.clipPath,
      endClip: animation?.effect?.getKeyframes?.().at(-1)?.clipPath,
      easing: animation?.effect?.getTiming?.().easing,
      clip: pseudo.clipPath,
      blendWidth: blend.width,
      blendFilter: blend.webkitBackdropFilter || blend.backdropFilter,
      viewTransitions: window.__prtsViewTransitionCalls,
    }
  })
  expect(state.duration).toBe('547ms')
  expect(state.startClip).toContain('1472px')
  expect(state.endClip).toContain('0px')
  expect(state.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
  expect(state.clip).toContain('inset')
  expect(state.blendWidth).toBe('56px')
  expect(state.blendFilter).toBe('blur(5px)')
  expect(state.viewTransitions).toBe(1)

  await expect(root).toHaveAttribute('data-prts-scheme', target)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition')
  await expect(page.locator('[data-prts-scheme-reveal]')).toHaveCount(0)
  await expect(toggle).toHaveAttribute('data-prts-scheme-current', target)
})

test('tracks a held drag in both directions and rolls back below halfway', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await enableTheme(page)

  const root = page.locator('html')
  const toggle = page.locator('[data-prts-scheme-toggle]')
  const before = await root.getAttribute('data-prts-scheme')
  const target = before === 'dark' ? 'light' : 'dark'
  const box = await toggle.boundingBox()
  expect(box).not.toBeNull()
  const y = box.y + box.height / 2

  await page.mouse.move(box.x + box.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(1440 * .63, y)
  await expect(root).toHaveAttribute('data-prts-scheme-transition-interactive', '')
  await expect(root).toHaveAttribute('data-prts-scheme-transition-armed', '')
  await expect(root).toHaveAttribute('data-prts-scheme', target)
  await expect(page.locator('[data-prts-scheme-reveal-label]')).toHaveText('OPTICAL SYNC: 63%')
  expect(await root.evaluate(node => Number.parseFloat(node.style.getPropertyValue('--prts-scheme-reveal-x')))).toBeCloseTo(1440 * .63, 1)

  await page.mouse.move(1440 * .35, y)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition-armed')
  await expect(page.locator('[data-prts-scheme-reveal-label]')).toHaveText('OPTICAL SYNC: 35%')
  expect(await root.evaluate(node => Number.parseFloat(node.style.getPropertyValue('--prts-scheme-reveal-x')))).toBeCloseTo(1440 * .35, 1)

  await page.mouse.up()
  await expect(root).toHaveAttribute('data-prts-scheme', before)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition')
  await expect(page.locator('[data-prts-scheme-reveal]')).toHaveCount(0)
})

test('commits a held drag above halfway without firing a second click toggle', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await enableTheme(page)

  const root = page.locator('html')
  const toggle = page.locator('[data-prts-scheme-toggle]')
  const before = await root.getAttribute('data-prts-scheme')
  const target = before === 'dark' ? 'light' : 'dark'
  const box = await toggle.boundingBox()
  expect(box).not.toBeNull()
  const y = box.y + box.height / 2

  await page.mouse.move(box.x + box.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(1440 * .65, y)
  await expect(root).toHaveAttribute('data-prts-scheme-transition-armed', '')
  await page.mouse.up()

  await expect(root).toHaveAttribute('data-prts-scheme', target)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition')
  await page.waitForTimeout(100)
  await expect(root).toHaveAttribute('data-prts-scheme', target)
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
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition')
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition-mode')
  await expect(page.locator('[data-prts-scheme-reveal]')).toHaveCount(0)
  await expect(toggle).not.toHaveAttribute('data-prts-scheme-press', '')
})
