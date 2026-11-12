import { expect, test } from '@playwright/test'

test.use({ locale: 'zh-CN', storageState: process.env.PRTS_RC022_STATE || undefined })
test.beforeEach(async ({ page }) => {
  test.skip(!process.env.PRTS_RC022_STATE, 'Requires authenticated local 0.2.2 storage state')
  test.setTimeout(60_000)
  await page.addInitScript(() => {
    let facade
    const wrapped = new WeakSet()
    Object.defineProperty(window, '__ModuleLoader__', {
      configurable: true,
      get: () => facade,
      set(value) {
        facade = value
        let load = value.load
        Object.defineProperty(value, 'load', {
          configurable: true,
          get: () => registration => {
            if (registration.id === '@ash-qw/dsh-theme-prts' && !registration.chunk && !wrapped.has(registration)) {
              wrapped.add(registration)
              const factory = registration.factory
              registration.factory = require => {
                const exports = factory(require)
                window.__prtsNativeRequire = require
                return exports
              }
            }
            return load.call(value, registration)
          },
          set(next) { load = next },
        })
      },
    })
  })
})

for (const scheme of ['dark', 'light']) {
  for (const width of [390, 1440]) {
    test(`native diff, streamed math and JSON retain semantics (${scheme}, ${width}) @live-rc0222`, async ({ page }) => {
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize({ width, height: 900 })
      await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
      await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '', { timeout: 20_000 })
      await page.locator('[data-prts-startup]').waitFor({ state: 'hidden' })
      await page.evaluate(scheme => {
        const require = window.__prtsNativeRequire
        const React = require('react')
        const ReactDOM = require('react-dom')
        const { MarkdownText, JsonTree } = require('@deepseek-ai/dsh-client-ui-primitives')
        document.documentElement.dataset.prtsScheme = scheme
        document.documentElement.dataset.prtsConversationStyle = 'deck-chat'
        document.body.toggleAttribute('data-ds-dark-theme', scheme === 'dark')
        const stage = document.createElement('section')
        stage.dataset.nativeMarkdownProbe = ''
        stage.dataset.prtsAiSurface = ''
        stage.style.cssText = 'position:fixed;inset:20px 10px;z-index:10000;overflow:auto;padding:12px;box-sizing:border-box;background:var(--prts-panel);color:var(--prts-ink)'
        document.body.append(stage)
        const root = ReactDOM.createRoot(stage)
        const labels = { code: { copyLabel: '复制', copiedLabel: '已复制', toolbarLabels: { codeLabel: '代码', wrapLabel: '换行', unwrapLabel: '不换行' } }, footnotes: '脚注' }
        window.__prtsRenderNativeMarkdown = (text, streaming) => root.render(React.createElement(MarkdownText, { text, streaming, labels }))
        window.__prtsRenderNativeJson = () => root.render(React.createElement(JsonTree, {
          data: { nested: { value: 'nested-value', count: 42 }, enabled: true },
          label: '原生 JSON',
          labels: { copyValue: '复制值', copyJson: '复制 JSON', copyPath: '复制路径', copyPrettyJson: '格式化复制', copyCompactJson: '紧凑复制', copied: '已复制', copyFailed: '复制失败', collapseNode: '收起节点', expandNode: '展开节点', copyButtonTitle: action => action },
        }))
        window.__prtsDisposeNativeProbe = () => { root.unmount(); stage.remove() }
      }, scheme)
      const probe = page.locator('[data-native-markdown-probe]')
      try {
        const source = `diff --git a/example.txt b/example.txt\n--- a/example.txt\n+++ b/example.txt\n@@ -1 +1 @@\n-deleted_${'column_'.repeat(80)}\n+added_${'column_'.repeat(80)}`
        await page.evaluate(source => window.__prtsRenderNativeMarkdown('```diff\n' + source + '\n```', true), source)
        const block = probe.locator('.md-code-block')
        await expect(block).toBeVisible()
        const added = block.locator('.line').filter({ hasText: '+added_' })
        const deleted = block.locator('.line').filter({ hasText: '-deleted_' })
        await expect(added).toHaveCount(1)
        await expect(deleted).toHaveCount(1)
        const colors = await added.evaluate((node, scheme) => {
          const old = node.parentElement.querySelectorAll('.line')
          const removed = [...old].find(line => line.textContent.includes('-deleted_'))
          return { added: getComputedStyle(node).backgroundColor, deleted: getComputedStyle(removed).backgroundColor, marker: getComputedStyle(node.querySelector('span')).color, expected: scheme === 'dark' ? 'rgb(31, 49, 36)' : 'rgb(230, 244, 231)' }
        }, scheme)
        expect(colors.added).toBe(colors.expected)
        expect(colors.added).not.toBe(colors.deleted)
        expect(colors.marker).toBe(scheme === 'dark' ? 'rgb(65, 201, 119)' : 'rgb(1, 162, 65)')
        await block.getByRole('button', { name: '换行', exact: true }).click()
        await expect(block).toHaveAttribute('data-code-wrap', 'false')
        const pre = block.locator('pre')
        expect(await pre.evaluate(node => { node.scrollLeft = 160; return node.scrollLeft })).toBeGreaterThan(0)
        expect(await block.evaluate(node => node.getBoundingClientRect().right <= node.closest('[data-native-markdown-probe]').getBoundingClientRect().right)).toBe(true)
        await page.evaluate(source => window.__prtsRenderNativeMarkdown('```diff\n' + source + '\n```', false), source)
        await expect(added).toHaveCSS('background-color', colors.added)
        await expect(deleted).toHaveCSS('background-color', colors.deleted)
        if (await block.getAttribute('data-code-wrap') === 'false') await block.getByRole('button', { name: '换行', exact: true }).click()
        await expect(block).toHaveAttribute('data-code-wrap', 'true')
        await page.evaluate(() => window.__prtsRenderNativeMarkdown('```math\n\\frac{a', true))
        await expect(probe.locator('.katex-error')).toHaveCount(0)
        await expect(probe.locator('pre')).toContainText('\\frac{a')
        await page.evaluate(() => window.__prtsRenderNativeMarkdown('```math\n\\frac{a}{b} = c\n```', true))
        await expect(probe.locator('.katex')).toHaveCount(0)
        await page.evaluate(() => window.__prtsRenderNativeMarkdown('```math\n\\frac{a}{b} = c\n```', false))
        await expect(probe.locator('.katex-display')).toHaveCount(1)
        await expect(probe.locator('.katex-error')).toHaveCount(0)
        await expect(probe.locator('annotation[encoding="application/x-tex"]')).toContainText('\\frac{a}{b} = c')
        await expect(probe.locator('.md-code-block')).toHaveCount(0)
        await expect(probe.locator('.katex-display')).toHaveCSS('overflow-x', 'auto')
        await page.evaluate(() => window.__prtsRenderNativeJson())
        const expander = probe.locator('[data-json-expander]').first()
        await expect(expander).toBeVisible()
        await expander.focus()
        await page.keyboard.press('ArrowRight')
        await expect(expander).toHaveAttribute('aria-expanded', 'true')
        await page.keyboard.press('ArrowLeft')
        await expect(expander).toHaveAttribute('aria-expanded', 'false')
        const punctuation = await probe.locator('[class*="_root_"]').first().evaluate(node => {
          const style = getComputedStyle(node)
          return { actual: style.getPropertyValue('--json-tree-punctuation').trim(), expected: style.getPropertyValue('--prts-ink').trim() }
        })
        expect(punctuation.actual).toBe(punctuation.expected)
        expect(errors).toEqual([])
      } finally {
        await page.evaluate(() => window.__prtsDisposeNativeProbe())
      }
    })
  }
}
