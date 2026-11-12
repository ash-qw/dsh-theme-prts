import { expect, test } from '@playwright/test'

function contrast(foreground, background) {
  const luminance = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(channel => {
    const value = channel / 255
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4
  }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0)
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + .05) / (Math.min(first, second) + .05)
}

for (const scheme of ['dark', 'light']) {
  for (const width of [390, 1440]) {
    test(`native neutral semantic colors preserve contrast and distinct states (${scheme}, ${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(() => localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ revision: 1, value: { enabled: true, bootAnimation: false } })))
      await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
      await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
      await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
      await page.evaluate(scheme => {
        document.documentElement.dataset.prtsScheme = scheme
        const native = document.createElement('style')
        native.textContent = `body { --dsw-alias-border-selected:rgb(156,163,175); --dsw-alias-card-fill:rgb(250,250,250); --dsw-alias-card-fill-hover:rgb(245,245,245); --dsw-alias-hovercard-bg:rgb(41,41,41); --dsw-alias-hovercard-label-primary:white; --dsw-alias-json-tree-icon:rgb(95,99,104); --dsw-alias-json-tree-punctuation:rgb(32,33,36); --dsw-alias-file-diff-added-marker:rgb(65,201,119); --dsw-alias-file-diff-deleted-marker:rgb(250,66,62); --dsw-alias-hovercard-state-done:rgb(167,139,250); --dsw-alias-hovercard-state-error:rgb(242,90,90); --dsw-alias-json-tree-string:rgb(242,139,130); --dsw-alias-chart-messages:rgb(77,147,248); --dsw-alias-chart-tools:rgb(167,139,250); }`
        document.head.append(native)
        const probe = document.createElement('section')
        probe.dataset.semanticProbe = ''
        probe.style.cssText = 'position:fixed;inset:30px 10px auto;z-index:1000;padding:16px;background:var(--prts-canvas)'
        probe.innerHTML = '<button data-semantic-card style="background:var(--dsw-alias-card-fill);color:var(--prts-ink);border:1px solid var(--dsw-alias-border-selected)">原生卡片</button><div data-semantic-hover style="background:var(--dsw-alias-hovercard-bg);color:var(--dsw-alias-hovercard-label-primary);padding:12px"><span data-secondary style="color:var(--dsw-alias-hovercard-label-secondary)">说明</span><span data-tertiary style="color:var(--dsw-alias-hovercard-label-tertiary)">详情</span><span data-done style="color:var(--dsw-alias-hovercard-state-done)">完成</span><span data-error style="color:var(--dsw-alias-hovercard-state-error)">错误</span></div><div data-semantic-json style="background:var(--prts-panel)"><span data-punctuation style="color:var(--dsw-alias-json-tree-punctuation)">{</span><span data-icon style="color:var(--dsw-alias-json-tree-icon)">展开</span></div>'
        document.body.append(probe)
      }, scheme)
      const styles = await page.locator('[data-semantic-probe]').evaluate(node => {
        const read = selector => {
          const style = getComputedStyle(node.querySelector(selector))
          return { color: style.color, background: style.backgroundColor, border: style.borderTopColor }
        }
        const style = getComputedStyle(node)
        const preserved = Object.fromEntries(['file-diff-added-marker', 'file-diff-deleted-marker', 'hovercard-state-done', 'hovercard-state-error', 'json-tree-string', 'chart-messages', 'chart-tools'].map(key => [key, style.getPropertyValue(`--dsw-alias-${key}`).trim()]))
        return { card: read('[data-semantic-card]'), hover: read('[data-semantic-hover]'), secondary: read('[data-secondary]'), tertiary: read('[data-tertiary]'), done: read('[data-done]'), error: read('[data-error]'), json: read('[data-semantic-json]'), punctuation: read('[data-punctuation]'), icon: read('[data-icon]'), preserved }
      })
      expect(contrast(styles.card.color, styles.card.background)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(styles.card.border, styles.card.background)).toBeGreaterThanOrEqual(3)
      for (const key of ['hover', 'secondary', 'tertiary', 'done', 'error']) expect(contrast(styles[key].color, styles.hover.background)).toBeGreaterThanOrEqual(4.5)
      for (const key of ['punctuation', 'icon']) expect(contrast(styles[key].color, styles.json.background)).toBeGreaterThanOrEqual(4.5)
      expect(styles.card.background).toBe(scheme === 'dark' ? 'rgb(23, 29, 33)' : 'rgb(229, 234, 237)')
      expect(styles.preserved).toEqual({ 'file-diff-added-marker': 'rgb(65,201,119)', 'file-diff-deleted-marker': 'rgb(250,66,62)', 'hovercard-state-done': 'rgb(167,139,250)', 'hovercard-state-error': 'rgb(242,90,90)', 'json-tree-string': 'rgb(242,139,130)', 'chart-messages': 'rgb(77,147,248)', 'chart-tools': 'rgb(167,139,250)' })
      await page.locator('[data-semantic-card]').evaluate(node => node.style.background = 'var(--dsw-alias-card-fill-hover)')
      await expect(page.locator('[data-semantic-card]')).not.toHaveCSS('background-color', styles.card.background)
      await page.locator('html').evaluate(node => node.removeAttribute('data-dsh-prts'))
      await expect(page.locator('[data-semantic-card]')).toHaveCSS('background-color', 'rgb(245, 245, 245)')
      await expect(page.locator('[data-semantic-hover]')).toHaveCSS('background-color', 'rgb(41, 41, 41)')
    })
  }
}
