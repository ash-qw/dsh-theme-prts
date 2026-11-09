import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { themeSettingsMarkup } from '../src/client/theme-settings-workbench.js'

test('all settings categories declare explicit group titles without promoting individual controls', () => {
  const dom = new JSDOM(themeSettingsMarkup())
  const panel = dom.window.document.querySelector('#prts-theme-settings')
  const categories = ['appearance', 'background', 'flow', 'interaction', 'particles', 'assistance', 'ai-tools']
  assert.deepEqual([...panel.querySelectorAll('[data-prts-settings-jump]')].map(button => button.dataset.prtsSettingsJump), categories)
  for (const category of categories) {
    const page = panel.querySelector(`[data-prts-settings-section="${category}"]`)
    const groups = page.querySelectorAll('[data-prts-settings-group]')
    assert.ok(groups.length, category)
    for (const group of groups) {
      const titles = [...group.querySelectorAll('[data-prts-settings-group-title]')].filter(title => title.closest('[data-prts-settings-group]') === group)
      assert.equal(titles.length, 1, category)
      const title = titles[0]
      assert.ok(['H3', 'LEGEND'].includes(title.tagName) || (title.getAttribute('role') === 'heading' && title.getAttribute('aria-level') === '3'), title.outerHTML)
    }
  }
  for (const subtitle of panel.querySelectorAll('[data-prts-settings-subtitle]')) assert.equal(subtitle.tagName, 'H4')
  const interaction = panel.querySelector('#prts-page-interaction')
  assert.deepEqual([...interaction.querySelectorAll('[data-prts-settings-group-title]')].map(title => title.textContent), ['交互行为', '交互提示框颜色'])
  const cards = panel.querySelector('#prts-page-flow')
  assert.equal(panel.querySelector('#prts-tab-flow').textContent, '侧栏卡片')
  assert.deepEqual([...cards.querySelectorAll('[data-prts-settings-group-title]')].map(title => title.textContent), ['卡片高度', '卡片侧脊配色', '会话流线'])
  assert.equal(cards.querySelectorAll('[data-prts-settings-group] [data-prts-spine-row]').length, 3)
  assert.equal(cards.querySelector('[data-prts-card-heights]').dataset.prtsSettingsGroup, 'first')
  assert.equal(interaction.querySelector('[data-prts-card-heights], [data-prts-spine-colors]'), null)
  assert.equal(panel.querySelector('[data-prts-avatars] [data-prts-baker-options]'), null)
  assert.equal(panel.querySelector('[data-prts-baker-options] [data-prts-settings-group-title]').textContent, 'Baker 消息选项')
  assert.equal(panel.querySelector('[data-prts-opacity-settings] > legend').hasAttribute('data-prts-settings-group-title'), true)
  const preview = panel.querySelector('[data-prts-preview-feature]')
  assert.equal(preview.querySelector('[data-prts-preview-feature-heading] > h3').textContent, '会话状态预览')
  assert.equal(preview.querySelectorAll('[data-prts-preview-feature-heading] [data-prts-setting-switch="sessionPreview"]').length, 1)
  assert.deepEqual([...preview.querySelectorAll('[data-prts-preview-status]')].map(node => node.dataset.prtsPreviewStatus), ['ongoing', 'warning', 'done'])
  assert.equal(preview.querySelector('[data-prts-preview-details="previewOngoing"]').closest('[data-prts-preview-status]').dataset.prtsPreviewStatus, 'ongoing')
  assert.equal(preview.querySelector('[data-prts-preview-details="previewWarning"]').closest('[data-prts-preview-status]').dataset.prtsPreviewStatus, 'warning')
  for (const state of ['ongoing', 'warning', 'done']) {
    const status = preview.querySelector('[data-prts-preview-status="' + state + '"]')
    assert.equal(status.querySelectorAll('[data-prts-settings-status-marker] [data-prts-session-summary-signal="' + state + '"]').length, 1)
    assert.equal(status.querySelectorAll('[data-prts-preview-details] [data-prts-settings-status-marker]').length, 0)
  }
  const ai = panel.querySelector('#prts-page-ai-tools')
  assert.equal(ai.querySelectorAll('[data-prts-settings-group]').length, 2)
  assert.equal(ai.querySelectorAll('[data-prts-ai-permission] [data-prts-setting-switch="aiToolsEnabled"]').length, 1)
  assert.equal(ai.querySelector('[data-prts-ai-permission-label]').textContent, '权限控制 · 当前 DSH 实例')
  assert.equal(ai.querySelector('[data-prts-ai-guide] > h3').textContent, '使用说明')
  assert.equal(ai.querySelectorAll('[data-prts-ai-guide-part] > h4[data-prts-settings-subtitle]').length, 4)
  assert.equal(ai.querySelector('[data-prts-ai-guide] [data-prts-setting-switch]'), null)
  assert.equal(ai.querySelectorAll('code').length, 13)
  dom.window.close()
})
