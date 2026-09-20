import { expect, test } from '@playwright/test'

const fixtureUrl = '/tests/fixtures/rc7-harness.html'

function preferences(scheme = 'dark') {
  return {
    version: 2,
    enabled: true,
    scheme,
      texture: 'full',
    glass: 'standard',
    motion: 'reduced',
    density: 'tactical',
    panelOpen: true,
  }
}

async function enable(page, scheme = 'dark') {
  await page.goto(fixtureUrl)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), preferences(scheme))
  await page.reload()
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-dsh-prts'))
  const activeScheme = await page.locator('html').getAttribute('data-prts-scheme')
  if (activeScheme !== scheme) {
    await page.locator('[data-prts-scheme-toggle]').click()
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  }
  await expect(page.locator('[data-prts-facility-face][data-prts-facility-vector]')).toHaveCount(2)
  await expect(page.locator('[data-prts-facility-spine][data-prts-facility-vector]')).toHaveCount(2)
}

test('@facility-vector keeps one closed path through native sidebar width changes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  const frame = page.locator('[data-prts-region="frame"]')
  const face = page.locator('[data-prts-workspace-row] [data-prts-facility-face]')

  for (const width of [344, 280, 148]) {
    await frame.evaluate((node, next) => { node.style.gridTemplateColumns = `${next}px minmax(0px, 1fr) 0px` }, width)
    await expect.poll(() => frame.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ')[0])).toBe(`${width}px`)
    await expect.poll(() => frame.evaluate(node => node.style.getPropertyValue('--prts-native-sessions-column'))).toBe('')
    await expect(face).toHaveAttribute('data-prts-facility-vector', '')
    const geometry = await face.evaluate(node => {
      const paths = Array.from(node.querySelectorAll('[data-prts-facility-layer]')).map(path => path.getAttribute('d'))
      return {
        viewBox: node.querySelector('[data-prts-facility-svg]').getAttribute('viewBox'),
        paths,
        clip: getComputedStyle(node).clipPath,
        fallback: getComputedStyle(node, '::after').content,
      }
    })
    expect(geometry.viewBox.startsWith('0 0 ')).toBe(true)
    expect(geometry.paths).toHaveLength(3)
    expect(new Set(geometry.paths).size).toBe(1)
    expect(geometry.paths[0].startsWith('M ')).toBe(true)
    expect(geometry.paths[0].endsWith(' Z')).toBe(true)
    expect(geometry.clip).toBe('none')
    expect(geometry.fallback).toBe('none')
  }

  const row = page.locator('[data-prts-workspace-row]')
  const nearLayer = row.locator('[data-prts-silhouette-layer="near"]')
  await expect(row.locator('[data-prts-row-projection]')).toHaveCount(0)
  await expect(row.locator('[data-prts-silhouette-layer]')).toHaveCount(2)
  await expect(nearLayer).toHaveCSS('animation-play-state', 'paused')
  await expect(row.locator('[data-prts-silhouette-layer="far"]')).toHaveCSS('animation-duration', '22.4s')

  await page.locator('html').evaluate(node => { node.dataset.prtsMotion = 'full' })
  await row.hover()
  await expect(nearLayer).toHaveCSS('animation-play-state', 'running')
  const runningStart = await nearLayer.evaluate(node => node.getAnimations()[0]?.currentTime ?? 0)
  await page.waitForTimeout(120)
  const runningEnd = await nearLayer.evaluate(node => node.getAnimations()[0]?.currentTime ?? 0)
  expect(runningEnd).toBeGreaterThan(runningStart + 50)

  await page.mouse.move(900, 500)
  await expect(nearLayer).toHaveCSS('animation-play-state', 'paused')
  const pausedStart = await nearLayer.evaluate(node => node.getAnimations()[0]?.currentTime ?? 0)
  await page.waitForTimeout(120)
  const pausedEnd = await nearLayer.evaluate(node => node.getAnimations()[0]?.currentTime ?? 0)
  expect(Math.abs(pausedEnd - pausedStart)).toBeLessThan(20)
  await row.hover()
  await page.waitForTimeout(120)
  const resumed = await nearLayer.evaluate(node => node.getAnimations()[0]?.currentTime ?? 0)
  expect(resumed).toBeGreaterThan(pausedEnd + 50)
  const buttons = page.locator('[data-prts-workspace-actions] button')
  await expect(buttons).toHaveCount(2)
  await expect(buttons.first()).toHaveAttribute('data-prts-facility-vector', '')
  await expect(buttons.first()).toHaveCSS('clip-path', 'none')
  await expect(buttons.first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')

  const session = page.locator('[data-prts-session-row]')
  const sessionFace = session.locator('[data-prts-facility-face]')
  const pickup = session.locator('[data-prts-session-pickup]')
  const pickupBars = session.locator('[data-prts-session-pickup-bar]')
  const pickupBar = pickupBars.nth(5)
  const lifeline = session.locator('[data-prts-session-lifeline]')
  const lifelineFilaments = session.locator('[data-prts-session-lifeline-filament]')
  const lifelineFilament = session.locator('[data-prts-session-lifeline-filament="core"]')
  await expect(sessionFace).toHaveAttribute('data-prts-facility-texture', 'pickup')
  await expect(session.locator('[data-prts-row-projection]')).toHaveCount(0)
  await expect(pickupBars).toHaveCount(11)
  await expect(pickup).toHaveCSS('opacity', '0')
  await expect(pickupBar).toHaveCSS('animation-name', 'none')
  await expect(lifeline).toHaveCSS('opacity', '0.62')
  await expect(lifelineFilaments).toHaveCount(3)
  await expect(lifelineFilament).toHaveAttribute('d', /^M /)
  await expect(lifeline).toHaveAttribute('data-prts-lifeline-baseline', /.+/)
  await expect(session.locator('[data-prts-session-lifeline-mask]')).toHaveCount(0)
  await expect(lifelineFilament).toHaveCSS('animation-name', 'none')
  await expect(session.locator('[data-prts-row-title]')).toHaveCSS('font-weight', '700')
  await expect(session.locator('[data-prts-session-time]')).toHaveCSS('opacity', '0')
  await expect(session.locator('[data-prts-facility-spine]')).toHaveCSS('transform', 'matrix(0.25, 0, 0, 1, 0, 0)')
  const runningPath = await lifelineFilament.getAttribute('d')
  await expect.poll(() => lifelineFilament.getAttribute('d')).not.toBe(runningPath)

  await session.hover()
  await expect(pickup).toHaveCSS('opacity', '0.58')
  await expect(session.locator('[data-prts-session-time]')).toHaveCSS('opacity', '0')
  await expect(pickupBar).toHaveCSS('animation-name', 'prts-session-pickup-sample')
  await expect(lifeline).toHaveCSS('opacity', '0')
  await expect.poll(async () => {
    const path = await lifelineFilament.getAttribute('d')
    const values = path.match(/-?\d+(?:\.\d+)?/g).map(Number)
    const yCoordinates = values.filter((_value, index) => index % 2 === 1)
    return new Set(yCoordinates).size
  }).toBe(1)
  const hoveredPath = await lifelineFilament.getAttribute('d')
  await page.waitForTimeout(140)
  expect(await lifelineFilament.getAttribute('d')).toBe(hoveredPath)

  await page.mouse.move(900, 500)
  await expect(pickup).toHaveCSS('opacity', '0')
  await expect(pickupBar).toHaveCSS('animation-name', 'none')
  await expect(lifeline).toHaveCSS('opacity', '0.62')
  await expect.poll(() => lifelineFilament.getAttribute('d')).not.toBe(hoveredPath)

  await session.evaluate(node => node.setAttribute('aria-selected', 'false'))
  await expect(lifeline).toHaveCSS('opacity', '0')
  await expect(lifelineFilament).toHaveCSS('animation-name', 'none')
  await session.evaluate(node => node.setAttribute('aria-selected', 'true'))
  await expect(lifeline).toHaveCSS('opacity', '0.62')

  await page.locator('html').evaluate(node => { node.dataset.prtsMotion = 'reduced' })
  await session.hover()
  await expect(pickup).toHaveCSS('opacity', '0.58')
  await expect(pickupBar).toHaveCSS('animation-name', 'none')
  await expect(lifelineFilament).toHaveCSS('animation-name', 'none')
  const reducedPath = await lifelineFilament.getAttribute('d')
  await page.waitForTimeout(140)
  expect(await lifelineFilament.getAttribute('d')).toBe(reducedPath)

})

for (const scheme of ['dark', 'light']) {
  for (const dpr of [1, 2]) {
    test(`@facility-vector has continuous facility strokes at DPR ${dpr} in ${scheme} mode`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: dpr,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      await enable(page, scheme)
      await page.locator('[data-prts-workspace-row]').hover()
      const nearLayer = page.locator('[data-prts-workspace-row] [data-prts-silhouette-layer="near"]')
      await expect(nearLayer).toHaveCSS('animation-play-state', 'paused')
      await expect(nearLayer).toHaveCSS('fill', scheme === 'light' ? 'rgb(63, 77, 86)' : 'rgb(243, 246, 247)')
      await expect(nearLayer).toHaveCSS('opacity', scheme === 'light' ? '0.5' : '0.52')
      await expect(page.locator('[data-prts-workspace-actions] button').first()).toHaveAttribute('data-prts-facility-vector', '')
      await expect(page.locator('[role="tree"][aria-label="Sessions"]')).toHaveScreenshot(`facility-vector-${scheme}-dpr${dpr}.png`)
      await context.close()
    })
  }
}
