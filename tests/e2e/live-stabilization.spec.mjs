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

  const deployedScale = page.locator('[data-prts-conversation-scale]')
  const deployedScaleCount = await deployedScale.count()
  const deployedTurnCount = deployedScaleCount
    ? Number(await deployedScale.getAttribute('data-prts-scale-count') || 0)
    : 0
  if (deployedTurnCount >= 2) {
    await expect(deployedScale).toBeVisible()
    await expect(deployedScale).toHaveAttribute('tabindex', '0')
    await expect(deployedScale.locator('[data-prts-conversation-scale-svg]')).toHaveCount(1)
    await expect(deployedScale.locator('[data-prts-conversation-scale-gray]')).toHaveCount(1)
    await expect(deployedScale.locator('[data-prts-conversation-scale-accent]')).toHaveCount(1)
    await expect(page.locator('[data-prts-timeline-turn]')).toHaveCount(0)
  } else if (deployedScaleCount) {
    await expect(deployedScale).toBeHidden()
  } else {
    await expect(deployedScale).toHaveCount(0)
  }

  await page.locator('[data-prts-rail-brand]').click()
  await expect(page.locator('[data-prts-theme-settings]')).toBeVisible()
  await page.keyboard.press('Escape')

  const beforeScheme = await page.locator('html').getAttribute('data-prts-scheme')
  await page.locator('[data-prts-scheme-toggle]').click()
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', beforeScheme === 'dark' ? 'light' : 'dark')
  expect(errors).toEqual([])
})

test('@live-stabilization knowledge and SSH workspaces release and restore the conversation scale', async ({ page }) => {
  const liveUrl = process.env.PRTS_LIVE_URL
  test.skip(!liveUrl, 'PRTS_LIVE_URL is not configured')

  for (const target of ['知识库', 'SSH 面板']) {
    await page.addInitScript(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
    await page.goto(liveUrl)
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')

    const scale = page.locator('[data-prts-conversation-scale]')
    const preview = page.locator('[data-prts-conversation-preview]')
    await expect(scale).toHaveCount(1)
    await expect(page.locator('[data-conversation-scroll]')).toHaveCount(1)
    await scale.evaluate(node => { node.dataset.liveInstance = 'before-workspace' })

    await page.getByRole('button', { name: target, exact: true }).click()
    await expect(scale).toHaveCount(0)
    await expect(preview).toHaveCount(0)
    await expect(page.locator('[data-conversation-scroll]')).toHaveCount(0)

    await page.getByRole('button', { name: '返回会话', exact: true }).click()
    await expect(scale).toHaveCount(1)
    await expect(preview).toHaveCount(1)
    await expect(page.locator('[data-conversation-scroll]')).toHaveCount(1)
    await expect(scale).not.toHaveAttribute('data-live-instance', 'before-workspace')
  }
})
