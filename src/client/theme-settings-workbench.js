import { PARTICLE_TRAVERSAL_SPEED_DEFAULT, PARTICLE_TRAVERSAL_SPEED_MAX, PARTICLE_TRAVERSAL_SPEED_MIN, PARTICLE_TRAVERSAL_SPEED_STEP, resolveParticleDetail } from './preferences.js'

const SETTINGS_FOCUSABLE = [
  'button:not([disabled])',
  'input:not([disabled])',
  'summary',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const PRESET_OPTIONS = [
  ['standard-tactical', '标准战术', '完整底纹 / 标准玻璃 / 系统动效'],
  ['clear-glass', '清晰玻璃', '克制底纹 / 清晰玻璃 / 系统动效'],
  ['quiet-reading', '静谧阅读', '克制底纹 / 柔和玻璃 / 减少动效'],
]

const COMMON_CONTROLS = [
  ['railDefaultHidden', '默认隐藏导航栏', [['false', '关闭'], ['true', '开启']]],
  ['texture', '环境底纹', [['off', '关闭'], ['restrained', '克制'], ['full', '完整']]],
  ['glass', '玻璃材质', [['off', '关闭'], ['soft', '柔和'], ['standard', '标准'], ['clear', '清晰']]],
  ['motion', '动态效果', [['system', '跟随系统'], ['reduced', '减少']]],
  ['conversationStyle', '会话主题', [['native', '原有'], ['deck-chat', '通讯链路']]],
]

const PARTICLE_OPTIONS = [
  ['compact', '精简', 7],
  ['standard', '标准', 12],
  ['precise', '精细', 18],
]

function settingButtons(key, label, options) {
  const note = key === 'glass'
    ? '<small data-prts-setting-note data-prts-transparency-status hidden>系统当前要求降低透明度</small>'
    : key === 'motion'
      ? '<small data-prts-setting-note data-prts-effective-motion hidden>系统当前要求减少动态</small>'
      : key === 'railDefaultHidden'
        ? '<small data-prts-setting-note>在任意窗口宽度下默认收起 P.R.T.S. 导航，可从左侧按钮临时展开</small>'
      : key === 'conversationStyle'
        ? '<small data-prts-setting-note>立即切换会话背景、头像与消息气泡</small>'
      : ''
  const sample = value => key === 'texture' || key === 'glass'
    ? `<i data-prts-option-sample="${key}" data-prts-option-sample-value="${value}" aria-hidden="true"></i>`
    : ''
  return `<div data-prts-setting-row="${key}">
    <span><strong>${label}</strong>${note}</span>
    <div role="group" aria-label="${label}">${options.map(([value, text]) => `<button type="button" data-prts-setting-key="${key}" data-prts-setting-value="${value}">${sample(value)}<span>${text}</span></button>`).join('')}</div>
  </div>`
}

function presetMarkup() {
  return PRESET_OPTIONS.map(([value, title, description]) => `<button type="button" data-prts-setting-key="preset" data-prts-setting-value="${value}" data-prts-preset-card>
    <strong>${title}</strong><span>${description}</span>
  </button>`).join('')
}

function particleMarkup() {
  return PARTICLE_OPTIONS.map(([value, label, count]) => `<button type="button" role="radio" data-prts-setting-key="particleDetail" data-prts-setting-value="${value}">
    <i data-prts-particle-detail-preview aria-hidden="true">${Array.from({ length: count }, () => '<b></b>').join('')}</i><span>${label}</span>
  </button>`).join('')
}

export function themeSettingsMarkup() {
  return `<div data-prts-settings-backdrop hidden aria-hidden="true"></div>
    <dialog id="prts-theme-settings" data-prts-theme-settings aria-label="P.R.T.S. 主题设置" aria-hidden="true">
      <div data-prts-settings-frame>
        <header data-prts-theme-settings-header>
          <span><small>P.R.T.S. / 外观</small><strong>主题设置</strong></span>
          <div data-prts-settings-summary aria-live="polite">
            <span data-prts-settings-preset-status>标准战术</span>
            <span data-prts-persistence-status hidden></span>
          </div>
          <button type="button" data-prts-theme-settings-close aria-label="关闭主题设置">×</button>
        </header>

        <div data-prts-theme-settings-scroll>
          <section data-prts-settings-presets>
            <header><span><small>快速配置</small><strong>视觉预设</strong></span></header>
            <div>${presetMarkup()}</div>
          </section>

          <section data-prts-settings-common>
            <header><span><small>常用设置</small><strong>主题表现</strong></span></header>
            <div data-prts-settings-common-grid>${COMMON_CONTROLS.map(([key, label, options]) => settingButtons(key, label, options)).join('')}</div>
          </section>

          <details data-prts-settings-advanced>
            <summary><span><small>精细调整</small><strong>粒子效果</strong></span><output data-prts-advanced-summary>标准 / 1×</output></summary>
            <div data-prts-settings-advanced-content>
              <section data-prts-particle-detail>
                <header><strong>粒子精度</strong><span>同时调整会话与新会话徽记</span></header>
                <div role="radiogroup" aria-label="粒子精度">${particleMarkup()}</div>
                <label data-prts-setting-row="particleTraversalSpeed" data-prts-setting-range-row data-prts-particle-traversal>
                  <span><strong>跟随移动速度</strong><small>控制普通会话徽记移动及破碎重组的滚动距离</small></span>
                  <div><input type="range" min="0" max="2" step="0.25" value="1" data-prts-setting-range data-prts-setting-key="particleTraversalSpeed" aria-label="粒子徽记跟随移动速度"><output data-prts-particle-traversal-output>1× · 每 1 个视口重组</output></div>
                </label>
                <span data-prts-particle-error role="alert" hidden>粒子资源加载异常，主题已使用静态后备效果</span>
              </section>
            </div>
          </details>

          <footer data-prts-settings-actions>
            <div data-prts-persistence-error hidden role="alert">
              <span><strong>仅本次会话生效</strong><small>无法写入本地设置，当前视觉效果仍会保留。</small></span>
              <button type="button" data-prts-retry-save>重试保存</button>
            </div>
            <div data-prts-reset-zone>
              <span><strong>恢复主题默认</strong><small>保留主题开关和启动动画设置</small></span>
              <button type="button" data-prts-reset-visual>恢复默认</button>
              <div data-prts-reset-confirm hidden role="group" aria-label="确认恢复主题默认">
                <span>确认恢复全部主题参数？</span>
                <button type="button" data-prts-reset-confirm-action>确认恢复</button>
                <button type="button" data-prts-reset-cancel>取消</button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </dialog>`
}

export function createThemeSettingsOverlay({
  document,
  trigger,
  panel,
  backdrop,
  onOpen = () => {},
  onPreferenceChange = () => {},
  onPreferencePreview = () => {},
  onResetVisual = () => {},
  onRetrySave = () => {},
}) {
  const window = document?.defaultView
  const transparencyMedia = window?.matchMedia?.('(prefers-reduced-transparency: reduce)')
  const motionMedia = window?.matchMedia?.('(prefers-reduced-motion: reduce)')
  const nativeModal = typeof panel?.showModal === 'function' && typeof panel?.close === 'function'
  let isOpen = false
  let previousFocus
  let currentPreferences
  let currentStatus
  let currentPersistence = { phase: 'idle', revision: 0 }
  let particleTraversalSpeedDraft
  let particleTraversalSpeedDirty = false
  let savedTimer
  let feedbackTimer
  let feedbackTarget
  let renderedPersistenceRevision = -1

  function focusable() {
    return [...(panel?.querySelectorAll?.(SETTINGS_FOCUSABLE) ?? [])].filter(node => !node.hidden && !node.disabled && node.closest('[hidden]') === null)
  }

  function reducedMotion() {
    return document?.documentElement?.dataset?.prtsMotion === 'reduced' || motionMedia?.matches
  }

  function showPanel() {
    if (nativeModal) {
      if (!panel.open) panel.showModal()
      backdrop.hidden = true
      return
    }
    panel.setAttribute('open', '')
    panel.setAttribute('data-prts-dialog-fallback', '')
    backdrop.hidden = false
    backdrop.setAttribute('data-prts-settings-visible', '')
  }

  function hidePanel() {
    if (nativeModal) {
      if (panel.open) panel.close()
    } else {
      panel.removeAttribute('open')
      panel.removeAttribute('data-prts-dialog-fallback')
      backdrop.removeAttribute('data-prts-settings-visible')
      backdrop.hidden = true
    }
  }

  function setResetConfirmation(visible) {
    const confirmation = panel?.querySelector?.('[data-prts-reset-confirm]')
    const reset = panel?.querySelector?.('[data-prts-reset-visual]')
    if (confirmation) confirmation.hidden = !visible
    if (reset) reset.hidden = visible
  }

  function setOpen(next, restoreFocus = true) {
    if (!panel || !backdrop || !trigger) return false
    const value = Boolean(next)
    if (value === isOpen) return isOpen
    if (!value) {
      commitParticleTraversalSpeed()
    }
    isOpen = value
    trigger.setAttribute('aria-expanded', String(isOpen))
    document.documentElement.toggleAttribute('data-prts-settings-open', isOpen)
    panel.setAttribute('aria-hidden', String(!isOpen))
    if (isOpen) {
      previousFocus = document.activeElement
      onOpen()
      showPanel()
      panel.setAttribute('data-prts-settings-visible', '')
      ;(panel.querySelector('[data-prts-theme-settings-close]') ?? focusable()[0] ?? panel).focus?.()
    } else {
      panel.removeAttribute('data-prts-settings-visible')
      hidePanel()
      setResetConfirmation(false)
      if (restoreFocus) (trigger.isConnected ? trigger : previousFocus)?.focus?.()
    }
    return isOpen
  }

  function normalizeParticleTraversalSpeed(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return PARTICLE_TRAVERSAL_SPEED_DEFAULT
    const clamped = Math.min(PARTICLE_TRAVERSAL_SPEED_MAX, Math.max(PARTICLE_TRAVERSAL_SPEED_MIN, numeric))
    return Math.round(clamped / PARTICLE_TRAVERSAL_SPEED_STEP) * PARTICLE_TRAVERSAL_SPEED_STEP
  }

  function currentParticleTraversalSpeed() {
    return normalizeParticleTraversalSpeed(
      particleTraversalSpeedDirty ? particleTraversalSpeedDraft : currentPreferences?.particleTraversalSpeed,
    )
  }

  function conciseNumber(value) {
    return String(Number(Number(value).toFixed(2)))
  }

  function particleTraversalLabel(value) {
    const speed = normalizeParticleTraversalSpeed(value)
    if (speed === 0) return '0× · 静止 / 不重组'
    return `${conciseNumber(speed)}× · 每 ${conciseNumber(1 / speed)} 个视口重组`
  }

  function renderParticleTraversal() {
    if (!panel || !currentPreferences) return
    const value = currentParticleTraversalSpeed()
    const range = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="particleTraversalSpeed"]')
    if (range && range.value !== String(value)) range.value = String(value)
    setText(panel.querySelector('[data-prts-particle-traversal-output]'), particleTraversalLabel(value))
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value
  }

  function commitParticleTraversalSpeed() {
    if (!particleTraversalSpeedDirty || !currentPreferences) return false
    const value = currentParticleTraversalSpeed()
    particleTraversalSpeedDirty = false
    particleTraversalSpeedDraft = value
    if (value !== normalizeParticleTraversalSpeed(currentPreferences.particleTraversalSpeed)) {
      onPreferenceChange('particleTraversalSpeed', value)
    } else {
      renderParticleTraversal()
    }
    return true
  }

  function renderPersistence() {
    const status = panel?.querySelector?.('[data-prts-persistence-status]')
    const error = panel?.querySelector?.('[data-prts-persistence-error]')
    if (!status || !error) return
    const phase = currentPersistence?.phase || 'idle'
    const revision = Number(currentPersistence?.revision) || 0
    const failed = phase === 'error'
    error.hidden = !failed
    if (phase === 'saved' && revision === renderedPersistenceRevision) return
    if (savedTimer !== undefined) window?.clearTimeout?.(savedTimer)
    savedTimer = undefined
    status.hidden = phase !== 'saved'
    status.textContent = phase === 'saved' ? '已保存' : ''
    if (phase === 'saved') {
      renderedPersistenceRevision = revision
      savedTimer = window?.setTimeout?.(() => { status.hidden = true; savedTimer = undefined }, reducedMotion() ? 500 : 1200)
    }
  }

  function renderState() {
    if (!panel || !currentPreferences) return
    const particleDetail = resolveParticleDetail(currentPreferences)
    for (const button of panel.querySelectorAll('button[data-prts-setting-key]')) {
      const key = button.dataset.prtsSettingKey
      const actual = key === 'particleDetail' ? particleDetail : currentPreferences[key]
      const selected = String(actual) === button.dataset.prtsSettingValue
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', String(selected))
      if (button.getAttribute('role') === 'radio') button.setAttribute('aria-checked', String(selected))
    }
    const presetLabels = { 'standard-tactical': '标准战术', 'clear-glass': '清晰玻璃', 'quiet-reading': '静谧阅读', custom: '自定义' }
    const preset = presetLabels[currentPreferences.preset] || '自定义'
    const presetStatus = panel.querySelector('[data-prts-settings-preset-status]')
    if (presetStatus) presetStatus.textContent = preset
    const motionStatus = panel.querySelector('[data-prts-effective-motion]')
    if (motionStatus) motionStatus.hidden = !(currentPreferences.motion === 'system' && motionMedia?.matches)
    const transparency = panel.querySelector('[data-prts-transparency-status]')
    if (transparency) transparency.hidden = !(currentPreferences.glass !== 'off' && transparencyMedia?.matches)
    const particleError = panel.querySelector('[data-prts-particle-error]')
    if (particleError) particleError.hidden = currentStatus?.particle?.phase !== 'error'
    if (!particleTraversalSpeedDirty) particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(currentPreferences.particleTraversalSpeed)
    renderParticleTraversal()
    renderPersistence()
  }

  function markFeedback(target) {
    if (!target) return
    if (feedbackTimer !== undefined) window?.clearTimeout?.(feedbackTimer)
    feedbackTarget?.removeAttribute?.('data-prts-setting-feedback')
    feedbackTarget = target
    target.setAttribute('data-prts-setting-feedback', '')
    feedbackTimer = window?.setTimeout?.(() => {
      target.removeAttribute('data-prts-setting-feedback')
      if (feedbackTarget === target) feedbackTarget = undefined
      feedbackTimer = undefined
    }, 300)
  }

  function onPanelClick(event) {
    if (event.target === panel) { setOpen(false); return }
    const target = event.target?.closest?.('button')
    if (!target) return
    if (target.hasAttribute('data-prts-theme-settings-close')) { setOpen(false); return }
    if (target.hasAttribute('data-prts-setting-key')) {
      const raw = target.dataset.prtsSettingValue
      markFeedback(target)
      onPreferenceChange(target.dataset.prtsSettingKey, raw === 'true' ? true : raw === 'false' ? false : raw)
      return
    }
    if (target.hasAttribute('data-prts-retry-save')) { onRetrySave(); return }
    if (target.hasAttribute('data-prts-reset-visual')) { setResetConfirmation(true); return }
    if (target.hasAttribute('data-prts-reset-cancel')) { setResetConfirmation(false); return }
    if (target.hasAttribute('data-prts-reset-confirm-action')) {
      particleTraversalSpeedDirty = false
      particleTraversalSpeedDraft = undefined
      setResetConfirmation(false)
      onResetVisual()
    }
  }

  function onPanelInput(event) {
    const target = event.target
    if (!target?.matches?.('input[data-prts-setting-range]')) return
    const value = Number(target.value)
    if (!Number.isFinite(value)) return
    if (target.dataset.prtsSettingKey === 'particleTraversalSpeed') {
      particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(value)
      particleTraversalSpeedDirty = true
      renderParticleTraversal()
      onPreferencePreview('particleTraversalSpeed', particleTraversalSpeedDraft)
      return
    } else {
      return
    }
  }

  function onKeydown(event) {
    if (!isOpen) return
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (nativeModal || event.key !== 'Tab') return
    const nodes = focusable()
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  function onCancel(event) { event.preventDefault(); setOpen(false) }
  const toggle = () => setOpen(!isOpen)
  const closeFromBackdrop = () => setOpen(false)
  const renderMediaState = () => renderState()
  const commitFromControl = event => {
    const target = event.target
    if (!target?.matches?.('input[data-prts-setting-range]')) return
    if (target.dataset.prtsSettingKey === 'particleTraversalSpeed') commitParticleTraversalSpeed()
  }

  trigger?.addEventListener('click', toggle)
  panel?.addEventListener('click', onPanelClick)
  panel?.addEventListener('cancel', onCancel)
  panel?.addEventListener('input', onPanelInput)
  panel?.addEventListener('change', commitFromControl)
  panel?.addEventListener('pointerup', commitFromControl)
  panel?.addEventListener('focusout', commitFromControl)
  backdrop?.addEventListener('click', closeFromBackdrop)
  document.addEventListener('keydown', onKeydown)
  transparencyMedia?.addEventListener?.('change', renderMediaState)
  motionMedia?.addEventListener?.('change', renderMediaState)

  return {
    update(preferences, status, persistenceState = currentPersistence) {
      currentPreferences = preferences
      currentStatus = status
      currentPersistence = persistenceState ?? { phase: 'idle', revision: 0 }
      if (!particleTraversalSpeedDirty) particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(preferences?.particleTraversalSpeed)
      renderState()
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle,
    dispose() {
      isOpen = false
      hidePanel()
      if (savedTimer !== undefined) window?.clearTimeout?.(savedTimer)
      if (feedbackTimer !== undefined) window?.clearTimeout?.(feedbackTimer)
      feedbackTarget?.removeAttribute?.('data-prts-setting-feedback')
      trigger?.setAttribute('aria-expanded', 'false')
      trigger?.removeEventListener('click', toggle)
      panel?.removeEventListener('click', onPanelClick)
      panel?.removeEventListener('cancel', onCancel)
      panel?.removeEventListener('input', onPanelInput)
      panel?.removeEventListener('change', commitFromControl)
      panel?.removeEventListener('pointerup', commitFromControl)
      panel?.removeEventListener('focusout', commitFromControl)
      backdrop?.removeEventListener('click', closeFromBackdrop)
      document.removeEventListener('keydown', onKeydown)
      transparencyMedia?.removeEventListener?.('change', renderMediaState)
      motionMedia?.removeEventListener?.('change', renderMediaState)
      document.documentElement.removeAttribute('data-prts-settings-open')
    },
  }
}
