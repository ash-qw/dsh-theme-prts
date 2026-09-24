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
  await page.waitForFunction(() =>
    document.getAnimations().some(candidate => candidate.effect?.pseudoElement === '::view-transition-new(root)')
  )

  const state = await page.evaluate(() => {
    const html = document.documentElement
    const animation = document.getAnimations().find(candidate => candidate.effect?.pseudoElement === '::view-transition-new(root)')
    const pseudo = getComputedStyle(html, '::view-transition-new(root)')
    const blend = getComputedStyle(document.querySelector('[data-prts-scheme-reveal-blend]'))
    const grid = getComputedStyle(html, '::view-transition-new(prts-scheme-grid)')
    const toggleStyle = getComputedStyle(document.querySelector('[data-prts-scheme-toggle]'))
    return {
      duration: html.style.getPropertyValue('--prts-scheme-duration'),
      startClip: animation?.effect?.getKeyframes?.()[0]?.clipPath,
      endClip: animation?.effect?.getKeyframes?.().at(-1)?.clipPath,
      easing: animation?.effect?.getTiming?.().easing,
      clip: pseudo.clipPath,
      blendWidth: blend.width,
      blendFilter: blend.webkitBackdropFilter || blend.backdropFilter,
      gridWidth: grid.width,
      gridMask: grid.webkitMaskImage || grid.maskImage,
      toggleTransitionName: toggleStyle.viewTransitionName,
      viewTransitions: window.__prtsViewTransitionCalls,
    }
  })
  expect(state.duration).toBe('547ms')
  expect(state.startClip).toContain('1472px')
  expect(state.endClip).toContain('0px')
  expect(state.easing).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
  expect(state.clip).toContain('inset')
  expect(state.blendWidth).toBe('29px')
  expect(state.blendFilter).toBe('blur(2px)')
  expect(state.gridWidth).toBe('220px')
  expect(state.gridMask).toContain('linear-gradient')
  expect(state.toggleTransitionName).toBe('none')
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
  for (const progress of [.25, .5, .63, .9]) {
    await page.mouse.move(1440 * progress, y)
    await expect(root).toHaveAttribute('data-prts-scheme-transition-interactive', '')
    await expect(page.locator('[data-prts-scheme-reveal-grid]')).toHaveCount(1)
    const geometry = await root.evaluate(node => {
      const rootNew = getComputedStyle(node, '::view-transition-new(root)')
      const edgeGroup = getComputedStyle(node, '::view-transition-group(prts-scheme-edge)')
      const gridGroup = getComputedStyle(node, '::view-transition-group(prts-scheme-grid)')
      const gridNew = getComputedStyle(node, '::view-transition-new(prts-scheme-grid)')
      const matrixX = value => {
        const match = value.match(/^matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*([^,]+)/)
        return match ? Number.parseFloat(match[1]) : 0
      }
      const clipMatch = rootNew.clipPath.match(/^inset\([^ ]+\s+([^ ]+)/)
      const clipRight = clipMatch ? Number.parseFloat(clipMatch[1]) : Number.NaN
      const edgeAxis = matrixX(edgeGroup.transform) + Number.parseFloat(edgeGroup.translate) + 14
      const gridRight = matrixX(gridGroup.transform) + Number.parseFloat(gridGroup.translate) + Number.parseFloat(gridNew.width)
      return {
        edgeAxis,
        clipBoundary: innerWidth - clipRight,
        gridRight,
        gridImage: gridNew.backgroundImage,
        hostScheme: window.__PRTS_FIXTURE_RUNTIME__.theme.current,
      }
    })
    expect(Math.abs(geometry.edgeAxis - 1440 * progress)).toBeLessThanOrEqual(1)
    expect(Math.abs(geometry.edgeAxis - geometry.clipBoundary)).toBeLessThanOrEqual(1)
    expect(Math.abs(geometry.gridRight - geometry.clipBoundary)).toBeLessThanOrEqual(1)
    expect(geometry.gridImage).not.toBe('none')
    expect(geometry.hostScheme).toBe(target)
  }

  await page.mouse.move(1440 * .63, y)
  await expect(root).toHaveAttribute('data-prts-scheme-transition-armed', '')
  await expect(root).toHaveAttribute('data-prts-scheme', target)
  await expect(page.locator('[data-prts-scheme-reveal-label]')).toHaveText('CTRL')
  await expect(page.locator('[data-prts-scheme-reveal-value]')).toHaveText('')
  await expect(page.locator('[data-prts-scheme-reveal-grid]')).toHaveCount(1)
  const takeover63 = await root.evaluate(node => ({
    nodeImage: getComputedStyle(node, '::view-transition-new(prts-scheme-node)').backgroundImage,
    valueImage: node.style.getPropertyValue('--prts-scheme-control-value-image'),
    meterHeight: node.style.getPropertyValue('--prts-scheme-control-meter-height'),
  }))
  expect(takeover63.nodeImage).toContain('data:image/svg+xml')
  expect(takeover63.valueImage).toContain('063')
  expect(Number.parseFloat(takeover63.meterHeight)).toBeCloseTo(48 * .63, 2)
  expect(await root.evaluate(node => Number.parseFloat(node.style.getPropertyValue('--prts-scheme-reveal-x')))).toBeCloseTo(1440 * .63, 1)
  expect(await root.evaluate(node => Number(node.style.getPropertyValue('--prts-scheme-control-progress')))).toBeCloseTo(.63, 2)

  await page.mouse.move(1440 * .35, y)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition-armed')
  expect(await root.evaluate(node =>
    node.style.getPropertyValue('--prts-scheme-control-value-image'))).toContain('035')
  expect(await root.evaluate(node => Number.parseFloat(node.style.getPropertyValue('--prts-scheme-reveal-x')))).toBeCloseTo(1440 * .35, 1)

  await page.mouse.up()
  await expect(root).toHaveAttribute('data-prts-scheme', before)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition')
  await expect(page.locator('[data-prts-scheme-reveal]')).toHaveCount(0)
  expect(await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.theme.current)).toBe(before)
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

test('starts click and held-drag feedback before a delayed host theme response', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await enableTheme(page)

  await page.evaluate(() => {
    const host = window.__PRTS_FIXTURE_RUNTIME__.theme
    const original = host.setTheme.bind(host)
    host.setTheme = id => new Promise(resolve => {
      window.__pendingPrtsTheme = id
      window.__resolvePrtsTheme = () => { original(id); resolve() }
    })
  })

  const root = page.locator('html')
  const toggle = page.locator('[data-prts-scheme-toggle]')
  const source = await root.getAttribute('data-prts-scheme')
  const target = source === 'dark' ? 'light' : 'dark'

  await toggle.click()
  await expect(root).toHaveAttribute('data-prts-scheme', target)
  await expect(page.locator('[data-prts-scheme-reveal]')).toHaveCount(1)
  expect(await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.theme.current)).toBe(source)
  await page.evaluate(() => window.__resolvePrtsTheme())
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition')

  const box = await toggle.boundingBox()
  expect(box).not.toBeNull()
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + box.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(1440 * .65, y)
  await expect(root).toHaveAttribute('data-prts-scheme-transition-interactive', '')
  await expect(root).toHaveAttribute('data-prts-scheme-transition-armed', '')
  expect(await page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.theme.current)).toBe(target)
  await expect.poll(() => page.evaluate(() => window.__pendingPrtsTheme)).toBe(source)
  await page.mouse.up()
  await page.evaluate(() => window.__resolvePrtsTheme())
  await expect(root).toHaveAttribute('data-prts-scheme', source)
  await expect(root).not.toHaveAttribute('data-prts-scheme-transition')
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
