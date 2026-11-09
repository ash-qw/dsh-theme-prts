import { expect, test } from '@playwright/test'
import { DEFAULT_PREFERENCES } from '../../src/client/preferences.js'

for (const width of [1440, 390]) for (const scheme of ['dark', 'light']) {
  test(`settings hierarchy distinguishes groups, subgroups and controls (${width}, ${scheme})`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 760 : 1050 })
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    await page.addInitScript(preferences => localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ revision: 1, value: preferences })), {
      ...DEFAULT_PREFERENCES, enabled: true, bootAnimation: false, motion: 'reduced', conversationStyle: 'deck-chat', backgroundMode: 'full', preferencesInitialized: true,
    })
    await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
    if (!await page.locator('[data-prts-rail-brand]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').click()
    await page.locator('[data-prts-rail-brand]').click()
    const snapshot = () => page.evaluate(() => window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot())
    const original = await snapshot()
    await expect(page.locator('[data-prts-settings-nav] [role="tab"]')).toHaveText(['会话主题', '会话背景', '侧栏卡片', '交互', '粒子徽记', '辅助功能', 'AI 工具'])
    await page.locator('#prts-tab-background').click()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#prts-tab-flow')).toBeFocused()
    await expect(page.locator('#prts-page-flow')).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#prts-tab-interaction')).toBeFocused()
    await expect(page.locator('#prts-page-interaction')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('#prts-tab-flow')).toBeFocused()
    for (const category of ['appearance', 'background', 'flow', 'interaction', 'particles', 'assistance', 'ai-tools']) {
      await page.locator(`#prts-tab-${category}`).click()
      const tab = page.locator(`#prts-page-${category}`)
      const metrics = await tab.evaluate(container => {
        const visible = node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden'
        const inspect = node => {
          const style = getComputedStyle(node)
          return { text: node.textContent.trim().slice(0, 30), size: parseFloat(style.fontSize), weight: Number(style.fontWeight), border: parseFloat(style.borderTopWidth), background: style.backgroundColor, permission: !!node.closest('[data-prts-ai-permission]'), feature: !!node.closest('[data-prts-preview-feature]') }
        }
        return {
          overflow: container.scrollWidth - container.clientWidth,
          titles: [...container.querySelectorAll('[data-prts-settings-group-title]')].filter(visible).map(inspect),
          subtitles: [...container.querySelectorAll('[data-prts-settings-subtitle]')].filter(visible).map(inspect),
          labels: [...container.querySelectorAll('[data-prts-setting-row] > span > strong:not([data-prts-settings-group-title]),[data-prts-spine-row] > strong')].filter(visible).map(inspect),
          groups: [...container.querySelectorAll('[data-prts-settings-group]')].filter(visible).map(node => ({ permission: node.hasAttribute('data-prts-ai-permission'), border: parseFloat(getComputedStyle(node).borderTopWidth) })),
        }
      })
      if (category === 'assistance') {
        const heading = tab.locator('[data-prts-preview-feature-heading]')
        await expect(heading).toHaveCSS('border-top-width', '2px')
        const geometry = await heading.evaluate(node => {
          const band = node.getBoundingClientRect(), title = node.querySelector('h3').getBoundingClientRect(), toggle = node.querySelector('[role="switch"]').getBoundingClientRect(), feature = node.closest('[data-prts-preview-feature]').getBoundingClientRect()
          return { fullWidth: Math.abs(band.width - feature.width) <= 1, titleBeforeToggle: title.right <= toggle.left, toggleInsideBand: toggle.top >= band.top && toggle.bottom <= band.bottom }
        })
        expect(geometry).toEqual({ fullWidth: true, titleBeforeToggle: true, toggleInsideBand: true })
        await expect(tab.locator('[data-prts-preview-status]')).toHaveCount(3)
        for (const state of ['ongoing', 'warning', 'done']) {
          const card = tab.locator('[data-prts-preview-status="' + state + '"]')
          await expect(card.locator('[data-prts-settings-status-marker] [data-prts-session-summary-signal="' + state + '"]')).toBeVisible()
          expect(await card.locator('[data-prts-setting-row] > span').first().evaluate(node => getComputedStyle(node, '::before').content)).toBe('none')
          expect(await card.locator('[data-prts-session-summary-signal]').evaluate(node => {
            const reference = document.createElement('i')
            reference.style.color = getComputedStyle(node).getPropertyValue('--prts-summary-state-color')
            document.body.append(reference)
            const matches = getComputedStyle(node).color === getComputedStyle(reference).color
            reference.remove()
            return matches
          })).toBe(true)
        }
        const running = tab.locator('[data-prts-running-marker]')
        await expect(running.locator('circle')).toHaveCSS('animation-name', 'none')
        await expect(running.locator('circle')).toHaveCSS('stroke-dashoffset', '2.25px')
        const workspaceSignal = page.locator('[data-prts-session-summary-trigger="ongoing"] [data-prts-running-marker]').first()
        await expect(workspaceSignal.locator('circle')).toHaveCSS('stroke-dashoffset', '0px')
        expect(await running.evaluate(node => node.outerHTML)).toBe(await workspaceSignal.evaluate(node => node.outerHTML))
        expect(await tab.locator('[data-prts-session-summary-signal="done"]').evaluate(node => getComputedStyle(node, '::before').clipPath)).toContain('polygon(')
        await expect(tab.locator('[data-prts-session-summary-signal="warning"]')).toHaveCSS('width', '9px')
        await expect(tab.locator('[data-prts-session-summary-signal="ongoing"]')).toHaveCSS('width', '16px')
        await page.screenshot({ path: '/tmp/prts-preview-settings-after-' + width + '-' + scheme + '.png' })
      }
      expect(metrics.overflow, category).toBeLessThanOrEqual(1)
      expect(metrics.titles.length, category).toBeGreaterThan(0)
      for (const title of metrics.titles) {
        expect(title.size, `${category}: ${title.text}`).toBe(width === 390 ? 17 : 18)
        expect(title.weight).toBeGreaterThanOrEqual(600)
        expect(title.border).toBe(title.permission || title.feature ? 0 : 2)
        if (!title.permission && !title.feature) expect(title.background).not.toBe('rgba(0, 0, 0, 0)')
      }
      for (const label of [...metrics.labels, ...metrics.subtitles]) expect(label.size, `${category}: ${label.text}`).toBeLessThan(width === 390 ? 17 : 18)
      for (const group of metrics.groups) expect(group.border, category).toBe(group.permission ? 1 : 0)
    }
    const permission = page.locator('[data-prts-ai-permission]')
    await expect(permission).toHaveCSS('border-top-width', '1px')
    await expect(permission.locator('[data-prts-settings-group-title]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator('[data-prts-ai-guide] > [data-prts-settings-group-title]')).toHaveCSS('border-top-width', '2px')
    await expect(page.locator('[data-prts-ai-guide-part] h4').first()).toHaveCSS('font-size', '15px')
    expect(await snapshot()).toEqual(original)
    await page.screenshot({ path: '/tmp/prts-hierarchy-bands-ai-' + width + '-' + scheme + '.png' })
    await page.locator('#prts-tab-flow').click()
    await page.screenshot({ path: `/tmp/prts-hierarchy-final-sidebar-${width}-${scheme}.png` })
    await page.locator('[data-prts-spine-reset]').scrollIntoViewIfNeeded()
    await expect(page.locator('[data-prts-spine-reset]')).toBeInViewport()
    await page.getByRole('button', { name: '当前会话卡片侧脊自定义颜色', exact: true }).click()
    const editor = page.getByRole('dialog', { name: '当前会话卡片侧脊自定义颜色', exact: true })
    await expect(editor).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(editor).toHaveCount(0)
    expect(await snapshot()).toEqual(original)
  })
}
