export const CARD_HEIGHT_SETTINGS = Object.freeze([
  ['workspaceCardHeight', '工作区卡片', '--prts-workspace-custom-height', 32, 48],
  ['sessionCardHeight', '会话卡片', '--prts-session-custom-height', 32, 48],
])
export const CARD_HEIGHT_DEFAULTS = Object.freeze({ cardHeightMode: 'auto', workspaceCardHeight: 36, sessionCardHeight: 36 })

export function normalizeCardHeight(key, value) {
  const setting = CARD_HEIGHT_SETTINGS.find(([name]) => name === key)
  if (!setting) return undefined
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(setting[4], Math.max(setting[3], Math.round(value)))
    : CARD_HEIGHT_DEFAULTS[key]
}

export function applyCardHeights(root, preferences) {
  const mode = preferences?.cardHeightMode === 'custom' ? 'custom' : 'auto'
  if (preferences) { if (root.dataset.prtsCardHeight !== mode) root.dataset.prtsCardHeight = mode }
  else root.removeAttribute('data-prts-card-height')
  for (const [key, , property] of CARD_HEIGHT_SETTINGS) {
    if (preferences?.cardHeightMode === 'custom') {
      const value = `${normalizeCardHeight(key, preferences[key])}px`
      if (root.style.getPropertyValue(property) !== value) root.style.setProperty(property, value)
    }
    else root.style.removeProperty(property)
  }
}

export function cardHeightMarkup() {
  return `<section data-prts-card-heights data-prts-settings-group="first">
    <h3 data-prts-settings-group-title>卡片高度</h3>
    <div data-prts-card-height-modes role="group" aria-label="卡片高度模式">
      <button type="button" data-prts-setting-key="cardHeightMode" data-prts-setting-value="auto" aria-label="自动适应" aria-describedby="prts-height-auto-note" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4m8 0h4v4M4 16v4h4m8 0h4v-4M8 9h8v6H8z"/></svg>
        <span><strong>自动适应</strong><small id="prts-height-auto-note">两类卡片同高，随窗口收紧</small></span>
      </button>
      <button type="button" data-prts-setting-key="cardHeightMode" data-prts-setting-value="custom" aria-label="手动调节" aria-describedby="prts-height-custom-note" aria-pressed="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h4m0-3v6m0-3h12M4 17h10m0-3v6m0-3h6"/></svg>
        <span><strong>手动调节</strong><small id="prts-height-custom-note">分别设置高度，不随窗口压缩</small></span>
      </button>
    </div>
    <div data-prts-card-height-auto>
      <div><span>常规窗口<strong>36<small>px</small></strong></span><span>紧凑窗口<strong>32<small>px</small></strong></span></div>
      <small data-prts-setting-note>鼠标设备窗口高度 ≤ 820px 时，自动切换为紧凑高度。</small>
    </div>
    <div data-prts-card-height-controls hidden>${CARD_HEIGHT_SETTINGS.map(([key, label, , min, max]) => `<label data-prts-setting-row="${key}" data-prts-setting-range-row><span><strong>${label}</strong></span><div><input type="range" min="${min}" max="${max}" step="1" value="36" data-prts-setting-range data-prts-card-height-key="${key}" aria-label="${label}高度"><output data-prts-card-height-output="${key}">36px</output></div><span data-prts-card-height-bounds><small>${min}px · 紧凑下限</small><small>${max}px · 高度上限</small></span></label>`).join('')}</div>
  </section>`
}

export function mountCardHeights({ panel, onPreferenceChange, onPreferencePreview }) {
  let preferences
  const drafts = new Map()
  const controls = panel.querySelector('[data-prts-card-height-controls]')
  const automatic = panel.querySelector('[data-prts-card-height-auto]')
  const inputs = [...panel.querySelectorAll('[data-prts-card-height-key]')]
  function render() {
    if (!preferences) return
    if (controls) controls.hidden = preferences.cardHeightMode !== 'custom'
    if (automatic) automatic.hidden = preferences.cardHeightMode === 'custom'
    for (const input of inputs) {
      const key = input.dataset.prtsCardHeightKey
      const value = drafts.get(key) ?? normalizeCardHeight(key, preferences[key])
      if (input.value !== String(value)) input.value = String(value)
      input.nextElementSibling.textContent = `${value}px`
    }
  }
  function commit(key) {
    if (!drafts.has(key)) return
    const value = drafts.get(key)
    drafts.delete(key)
    onPreferenceChange(key, value)
  }
  function input(event) {
    const key = event.target?.dataset?.prtsCardHeightKey
    if (!preferences || preferences.cardHeightMode !== 'custom' || !CARD_HEIGHT_SETTINGS.some(([name]) => name === key)) return
    const value = normalizeCardHeight(key, Number(event.target.value))
    drafts.set(key, value)
    render()
    onPreferencePreview(key, value)
  }
  const commitEvent = event => commit(event.target?.dataset?.prtsCardHeightKey)
  panel.addEventListener('input', input)
  for (const type of ['change', 'pointerup', 'focusout']) panel.addEventListener(type, commitEvent)
  return {
    update(next) {
      if (next.cardHeightMode !== preferences?.cardHeightMode) drafts.clear()
      preferences = next
      render()
    },
    commit() { for (const key of [...drafts.keys()]) commit(key) },
    dispose() {
      drafts.clear()
      panel.removeEventListener('input', input)
      for (const type of ['change', 'pointerup', 'focusout']) panel.removeEventListener(type, commitEvent)
    },
  }
}
