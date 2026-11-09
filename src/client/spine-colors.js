export const SPINE_COLOR_SETTINGS = Object.freeze([
  ['workspaceSpineColor', '工作区卡片', '--prts-workspace-spine-color', '#33ccff'],
  ['sessionSpineColor', '普通会话卡片', '--prts-session-spine-color', '#5e6a70'],
  ['currentSessionSpineColor', '当前会话卡片', '--prts-current-session-spine-color', '#ffcc00'],
])

export const SPINE_COLOR_PRESETS = Object.freeze([
  ['贸易站蓝', '#33ccff'],
  ['发电站绿', '#ccff66'],
  ['制造站黄', '#ffcc00'],
])

export const SPINE_COLOR_KEYS = new Set(SPINE_COLOR_SETTINGS.flatMap(([key]) => [key, key + 'Light']))
export const SPINE_COLOR_DEFAULTS = Object.freeze({
  ...Object.fromEntries([...SPINE_COLOR_KEYS].map(key => [key, 'auto'])),
  spineColorLinked: false,
  spineColorSource: 'dark',
})

export function spineColorValue(preferences, key, mode) {
  const color = preferences[mode === 'light' ? key + 'Light' : key]
  if (typeof color === 'string' && /^#[\da-f]{6}$/i.test(color)) return color
  return mode === 'light' && key === 'sessionSpineColor' ? '#65727a' : SPINE_COLOR_SETTINGS.find(([setting]) => setting === key)[3]
}

export function applySpineColors(root, preferences) {
  for (const [key, , property] of SPINE_COLOR_SETTINGS) {
    for (const mode of ['dark', 'light']) {
      const name = property + '-' + mode
      if (preferences) root.style.setProperty(name, spineColorValue(preferences, key, preferences.spineColorLinked ? preferences.spineColorSource : mode))
      else root.style.removeProperty(name)
    }
  }
}

export function spineColorMarkup() {
  return `<section data-prts-spine-colors data-prts-settings-group>
    <div data-prts-spine-heading><h3 data-prts-settings-group-title>卡片侧脊配色</h3>
      <span data-prts-spine-modes role="group" aria-label="侧脊编辑配色模式"><button type="button" data-prts-spine-mode="light" aria-pressed="false">☀ 日间</button><button type="button" data-prts-spine-mode="dark" aria-pressed="false">☾ 夜间</button></span>
      <button type="button" data-prts-spine-sync role="switch" aria-checked="false" title="开启后，日间和夜间共用当前选定模式的侧脊配色"><span>日夜共用</span><i aria-hidden="true"></i></button>
    </div>
    <small data-prts-setting-note>分别设置工作区、普通会话和当前会话；不影响状态标记、流线和动画。</small>
    <small data-prts-setting-note>日夜共用使用当前选定模式的配色；关闭后恢复独立配色，另一套保持不变。</small>
    ${SPINE_COLOR_SETTINGS.map(([key, label, , fallback]) => `<div data-prts-spine-row data-prts-setting-row="${key}">
      <strong>${label}</strong><div data-prts-spine-presets role="group" aria-label="${label}侧脊颜色">
        ${SPINE_COLOR_PRESETS.map(([name, color]) => `<button type="button" data-prts-spine-swatch data-prts-spine-key="${key}" data-prts-setting-value="${color}" aria-label="${name}" title="${name} ${color.toUpperCase()}" style="--swatch:${color}"><i aria-hidden="true"></i></button>`).join('')}
        <label data-prts-spine-custom><input type="color" data-prts-setting-color data-prts-color-caption="自定义" data-prts-spine-color data-prts-setting-key="${key}" aria-label="${label}侧脊自定义颜色" value="${fallback}"></label>
      </div></div>`).join('')}
    <div data-prts-spine-footer><small data-prts-setting-note>默认：贸易站蓝 / 日夜会话灰 / 制造站黄</small><button type="button" data-prts-spine-reset>恢复默认</button></div>
  </section>`
}

export function renderSpineColors(panel, preferences, editMode = panel.ownerDocument.documentElement.dataset.prtsScheme === 'light' ? 'light' : 'dark') {
  const mode = preferences.spineColorLinked ? preferences.spineColorSource : editMode
  panel.querySelector('[data-prts-spine-modes]').hidden = preferences.spineColorLinked
  panel.querySelector('[data-prts-spine-sync]').setAttribute('aria-checked', String(preferences.spineColorLinked))
  for (const button of panel.querySelectorAll('[data-prts-spine-mode]')) button.setAttribute('aria-pressed', String(button.dataset.prtsSpineMode === editMode))
  for (const [key] of SPINE_COLOR_SETTINGS) {
    const row = panel.querySelector(`[data-prts-spine-row][data-prts-setting-row="${key}"]`)
    const input = row?.querySelector('[data-prts-spine-color]')
    if (!input) continue
    const setting = mode === 'light' ? key + 'Light' : key
    const color = spineColorValue(preferences, key, mode)
    input.dataset.prtsSettingKey = setting
    input.value = color
    for (const button of row.querySelectorAll('[data-prts-spine-swatch]')) {
      button.dataset.prtsSpineKey = setting
      const selected = button.dataset.prtsSettingValue === color
      button.setAttribute('aria-pressed', String(selected))
    }
    const custom = preferences[setting] !== 'auto' && !SPINE_COLOR_PRESETS.some(([, value]) => value === color)
    input.parentElement.toggleAttribute('data-prts-spine-custom-active', custom)
    input.parentElement.querySelector('.prts-page-control')?.setAttribute('aria-pressed', String(custom))
  }
}
