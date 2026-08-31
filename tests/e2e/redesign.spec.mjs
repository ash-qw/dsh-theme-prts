import { expect, test } from '@playwright/test'

const fixturePath = '/tests/fixtures/rc7-harness.html'
const enabled = {
  version: 2,
  enabled: true,
  texture: 'full',
  glass: 'standard',
  motion: 'system',
}

async function enable(page) {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.reload()
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-dsh-prts'))
  await page.waitForFunction(() => document.querySelector('[data-prts-facility-face="workspace"]'))
}

async function openRail(page) {
  const root = page.locator('html')
  const expectedMode = await page.evaluate(() => window.innerWidth >= 1180 ? 'docked' : 'overlay')
  await expect(root).toHaveAttribute('data-prts-rail-mode', expectedMode)
  if (expectedMode !== 'overlay') return
  if (await root.getAttribute('data-prts-rail-open') !== null) return
  await page.locator('[data-prts-rail-launcher]').click()
  await expect(root).toHaveAttribute('data-prts-rail-open', '')
  await expect(page.locator('[data-prts-nav-rail]')).toBeVisible()
  await page.waitForTimeout(200)
}

test('@redesign facility cards keep fixed-left spines, equal heights, and sequential docking', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)

  await expect(page.locator('[data-prts-nav-rail]')).toHaveCSS('width', '52px')
  await expect(page.locator('[data-prts-region="sessions"]')).toHaveCSS('width', '280px')

  const workspace = page.locator('[data-prts-workspace-row]')
  const face = workspace.locator('[data-prts-facility-face="workspace"]')
  const workspaceSpine = await workspace.evaluate(row => getComputedStyle(row, "::before").backgroundColor)
  expect(workspaceSpine).toBe("rgb(92, 205, 219)")
  const expandedX = await face.evaluate(node => node.getBoundingClientRect().x)
  await workspace.evaluate(row => row.setAttribute('aria-expanded', 'false'))
  await expect.poll(async () => Math.round(expandedX - await face.evaluate(node => node.getBoundingClientRect().x))).toBe(6)
  const collapsedX = await face.evaluate(node => node.getBoundingClientRect().x)

  await workspace.evaluate(row => row.setAttribute('aria-expanded', 'true'))
  await expect.poll(async () => Math.round(await face.evaluate(node => node.getBoundingClientRect().x) - collapsedX)).toBe(6)

  await workspace.evaluate(row => row.setAttribute('aria-expanded', 'false'))
  await expect.poll(async () => Math.abs(Math.round(await face.evaluate(node => node.getBoundingClientRect().x) - collapsedX))).toBe(0)
  await workspace.hover()
  await expect.poll(async () => Math.round(await face.evaluate(node => node.getBoundingClientRect().x) - collapsedX)).toBe(6)
  await workspace.evaluate(row => row.setAttribute('aria-expanded', 'true'))
  await workspace.evaluate(row => row.setAttribute('aria-expanded', 'false'))
  await expect.poll(async () => Math.round(await face.evaluate(node => node.getBoundingClientRect().x) - collapsedX)).toBe(6)
  await page.locator('[data-prts-nav-rail]').hover()
  await expect.poll(async () => Math.abs(Math.round(await face.evaluate(node => node.getBoundingClientRect().x) - collapsedX))).toBe(0)

  await workspace.hover()
  const geometry = await workspace.evaluate(row => {
    const rowHeight = row.getBoundingClientRect().height
    const buttons = [...row.querySelectorAll('[data-prts-workspace-actions] button')]
    return {
      rowHeight,
      buttonHeights: buttons.map(button => button.getBoundingClientRect().height),
      animationNames: buttons.map(button => getComputedStyle(button).animationName),
      animationDelays: buttons.map(button => getComputedStyle(button).animationDelay),
    }
  })
  expect(geometry.buttonHeights).toEqual([geometry.rowHeight, geometry.rowHeight])
  expect(geometry.animationNames).toEqual(['prts-facility-button-dock', 'prts-facility-button-dock'])
  expect(geometry.animationDelays).toEqual(['0.055s', '0.125s'])

  const session = page.locator('[data-prts-session-row]')
  const colors = await session.evaluate(row => ({
    spine: getComputedStyle(row, '::before').backgroundColor,
    face: getComputedStyle(row.querySelector('[data-prts-facility-face]')).backgroundColor,
  }))
  expect(colors.spine).toBe('rgb(240, 200, 0)')
  expect(colors.face).not.toBe(colors.spine)

  await expect(session.locator('[data-prts-row-projection]')).toHaveCount(0)
  const pickup = session.locator('[data-prts-session-pickup]')
  await expect(pickup).toHaveCSS('opacity', '0')
  await session.hover()
  await expect(pickup).toHaveCSS('opacity', '0.58')
  await expect(session.locator('[data-prts-session-time]')).toHaveCSS('opacity', '0')

})
