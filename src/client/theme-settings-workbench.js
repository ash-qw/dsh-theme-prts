import { CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT, CONVERSATION_SCALE_FOCUS_CONTRAST_MAX, CONVERSATION_SCALE_FOCUS_CONTRAST_MIN, CONVERSATION_SCALE_FOCUS_CONTRAST_STEP, resolveParticleDetail } from './preferences.js'
import { resolveConversationScaleLengths } from './conversation-scale-adapter.js'

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
  ['texture', '环境底纹', [['off', '关闭'], ['restrained', '克制'], ['full', '完整']]],
  ['glass', '玻璃材质', [['off', '关闭'], ['soft', '柔和'], ['standard', '标准'], ['clear', '清晰']]],
  ['motion', '动态效果', [['system', '跟随系统'], ['reduced', '减少']]],
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

function calibrationMarkup() {
  return `<div data-prts-scale-calibration data-prts-calibration-mode="hidden" data-prts-calibration-reason="unmeasured">
    <div data-prts-scale-calibration-viewport>
      <div data-prts-scale-calibration-canvas aria-hidden="true">
        <i data-prts-scale-calibration-sidebar></i>
        <span data-prts-scale-calibration-measure><i></i><output data-prts-scale-calibration-value>96 px</output></span>
        <span data-prts-scale-calibration-rail>${Array.from({ length: 9 }, (_, index) => `<i style="--prts-calibration-tick:${index}"></i>`).join('')}</span>
        <i data-prts-scale-calibration-gap></i>
        <span data-prts-scale-calibration-content><i></i><small>会话内容区</small></span>
      </div>
    </div>
    <div data-prts-scale-calibration-meta>
      <span data-prts-scale-calibration-scale hidden>缩放预览</span>
      <output data-prts-scale-calibration-status aria-live="polite">当前视图：几何测量中</output>
    </div>
  </div>`
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
            <summary><span><small>精细调整</small><strong>粒子与会话刻度</strong></span><output data-prts-advanced-summary>标准 / 96 px</output></summary>
            <div data-prts-settings-advanced-content>
              <section data-prts-particle-detail>
                <header><strong>粒子精度</strong><span>同时调整会话与新会话徽记</span></header>
                <div role="radiogroup" aria-label="粒子精度">${particleMarkup()}</div>
                <span data-prts-particle-error role="alert" hidden>粒子资源加载异常，主题已使用静态后备效果</span>
              </section>
              <section data-prts-scale-adjustment>
                <header><strong>会话刻度</strong><span>调整位置距离与悬停焦点的视觉区分</span></header>
                ${calibrationMarkup()}
                <label data-prts-setting-row="conversationScaleMaxDistance" data-prts-setting-range-row>
                  <span>最大距离</span>
                  <div><input type="range" min="16" max="240" step="8" value="96" data-prts-setting-range data-prts-setting-key="conversationScaleMaxDistance" aria-label="会话刻度最大距离"><output data-prts-scale-distance-output>96 px</output></div>
                </label>
                <label data-prts-setting-row="conversationScaleFocusContrast" data-prts-setting-range-row>
                  <span>聚焦区分度</span>
                  <div data-prts-scale-focus-control>
                    <span data-prts-scale-focus-preview aria-hidden="true">${Array.from({ length: 5 }, (_, index) => `<i data-prts-scale-focus-preview-tick="${index}"></i>`).join('')}</span>
                    <input type="range" min="0" max="100" step="10" value="70" data-prts-setting-range data-prts-setting-key="conversationScaleFocusContrast" aria-label="会话刻度聚焦区分度">
                    <output data-prts-scale-focus-output>70</output>
                  </div>
                </label>
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
  onResetVisual = () => {},
  onRetrySave = () => {},
  getConversationScalePreview = () => ({ visible: false, reason: 'unmeasured', mode: 'hidden' }),
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
  let scaleDistanceDraft
  let scaleDistanceDirty = false
  let scaleFocusContrastDraft
  let scaleFocusContrastDirty = false
  let calibrationResizeObserver
  let calibrationSettleTimer
  let calibrationFrame
  let calibrationViewportWidth
  let calibrationFactor
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
      commitScaleDistance()
      commitScaleFocusContrast()
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
      renderScaleCalibration()
      ;(panel.querySelector('[data-prts-theme-settings-close]') ?? focusable()[0] ?? panel).focus?.()
    } else {
      panel.removeAttribute('data-prts-settings-visible')
      hidePanel()
      setResetConfirmation(false)
      if (restoreFocus) (trigger.isConnected ? trigger : previousFocus)?.focus?.()
    }
    return isOpen
  }

  function normalizeScaleDistance(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return 96
    return Math.min(240, Math.max(16, Math.round(numeric / 8) * 8))
  }

  function currentScaleDistance() {
    return normalizeScaleDistance(scaleDistanceDirty ? scaleDistanceDraft : currentPreferences?.conversationScaleMaxDistance)
  }

  function normalizeScaleFocusContrast(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return CONVERSATION_SCALE_FOCUS_CONTRAST_DEFAULT
    const clamped = Math.min(CONVERSATION_SCALE_FOCUS_CONTRAST_MAX, Math.max(CONVERSATION_SCALE_FOCUS_CONTRAST_MIN, numeric))
    return Math.round(clamped / CONVERSATION_SCALE_FOCUS_CONTRAST_STEP) * CONVERSATION_SCALE_FOCUS_CONTRAST_STEP
  }

  function currentScaleFocusContrast() {
    return normalizeScaleFocusContrast(scaleFocusContrastDirty ? scaleFocusContrastDraft : currentPreferences?.conversationScaleFocusContrast)
  }

  function calibrationStatus(state, value) {
    if (state?.mode === 'configured') return `当前视图：使用配置上限 / ${Math.round(Number(state.left) || value)} px`
    if (state?.simulated) return `模拟布局：使用配置上限 / ${value} px`
    if (state?.mode === 'centered') return `当前视图：自动居中 / 距侧栏 ${Math.round(Number(state.left) || 0)} px`
    const reasons = {
      drawer: '抽屉布局', phone: '手机布局', turns: '消息不足', corridor: '会话走廊不足',
      preview: '会话预览空间不足', unmeasured: '模拟布局',
    }
    return `当前视图：隐藏 / ${reasons[state?.reason] || '空间不足'}`
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value
  }

  function setCalibrationResizeState(active) {
    for (const node of [panel, backdrop]) {
      if (!node || node.hasAttribute('data-prts-resizing') === active) continue
      node.toggleAttribute('data-prts-resizing', active)
    }
  }

  function cancelCalibrationFrame() {
    if (calibrationFrame === undefined) return
    window?.cancelAnimationFrame?.(calibrationFrame)
    window?.clearTimeout?.(calibrationFrame)
    calibrationFrame = undefined
  }

  function measureScaleCalibration() {
    calibrationFrame = undefined
    if (!isOpen) return
    const viewport = panel?.querySelector?.('[data-prts-scale-calibration-viewport]')
    const canvas = panel?.querySelector?.('[data-prts-scale-calibration-canvas]')
    const calibration = panel?.querySelector?.('[data-prts-scale-calibration]')
    const scaleNote = panel?.querySelector?.('[data-prts-scale-calibration-scale]')
    if (!viewport || !canvas || !calibration) return
    const available = calibrationViewportWidth || viewport.clientWidth
    const factor = available > 0 ? Math.min(1, available / 360) : 1
    const roundedFactor = Number(factor.toFixed(4))
    const value = currentScaleDistance()
    let state
    try { state = getConversationScalePreview(value) } catch { state = { visible: false, reason: 'unmeasured', mode: 'hidden' } }

    if (roundedFactor !== calibrationFactor) {
      calibrationFactor = roundedFactor
      canvas.style.transform = `scale(${roundedFactor})`
      viewport.style.height = `${Math.ceil(94 * roundedFactor)}px`
    }
    const scaled = factor < .999
    if (calibration.hasAttribute('data-prts-calibration-scaled') !== scaled) calibration.toggleAttribute('data-prts-calibration-scaled', scaled)
    if (scaleNote && scaleNote.hidden !== !scaled) scaleNote.hidden = !scaled
    const mode = state?.simulated ? 'simulated' : state?.mode || 'hidden'
    const reason = state?.reason || 'unmeasured'
    if (calibration.dataset.prtsCalibrationMode !== mode) calibration.dataset.prtsCalibrationMode = mode
    if (calibration.dataset.prtsCalibrationReason !== reason) calibration.dataset.prtsCalibrationReason = reason
    setText(panel.querySelector('[data-prts-scale-calibration-status]'), calibrationStatus(state, value))
  }

  function scheduleCalibrationMeasurement() {
    if (!isOpen) return
    cancelCalibrationFrame()
    calibrationFrame = window?.requestAnimationFrame?.(measureScaleCalibration)
      ?? window?.setTimeout?.(measureScaleCalibration, 16)
  }

  function scheduleScalePreviewRefresh(entries = []) {
    const viewportEntry = entries.find?.(entry => entry.target?.matches?.('[data-prts-scale-calibration-viewport]'))
    const observedWidth = Number(viewportEntry?.contentRect?.width)
    if (Number.isFinite(observedWidth) && observedWidth > 0) {
      calibrationViewportWidth = observedWidth
    }
    if (!isOpen) return
    setCalibrationResizeState(true)
    if (calibrationSettleTimer !== undefined) window?.clearTimeout?.(calibrationSettleTimer)
    calibrationSettleTimer = window?.setTimeout?.(() => {
      calibrationSettleTimer = undefined
      setCalibrationResizeState(false)
      renderScaleCalibration()
    }, 160)
  }

  function renderScaleCalibration() {
    if (!isOpen) return
    if (!panel || !currentPreferences) return
    const value = currentScaleDistance()
    const contrast = currentScaleFocusContrast()
    const lengths = resolveConversationScaleLengths(contrast)
    const calibration = panel.querySelector('[data-prts-scale-calibration]')
    const distanceRange = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="conversationScaleMaxDistance"]')
    const contrastRange = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="conversationScaleFocusContrast"]')
    const distanceOutput = panel.querySelector('[data-prts-scale-distance-output]')
    const contrastOutput = panel.querySelector('[data-prts-scale-focus-output]')
    const calibrationValue = panel.querySelector('[data-prts-scale-calibration-value]')
    if (distanceRange && distanceRange.value !== String(value)) distanceRange.value = String(value)
    if (contrastRange && contrastRange.value !== String(contrast)) contrastRange.value = String(contrast)
    setText(distanceOutput, `${value} px`)
    setText(contrastOutput, String(contrast))
    setText(calibrationValue, `${value} px`)
    for (const tick of panel.querySelectorAll('[data-prts-scale-focus-preview-tick]')) {
      const length = lengths[Number(tick.dataset.prtsScaleFocusPreviewTick)] ?? lengths.at(-1)
      const width = `${length}px`
      if (tick.style.width !== width) tick.style.width = width
    }
    const detail = resolveParticleDetail(currentPreferences)
    const detailLabels = { compact: '精简', standard: '标准', precise: '精细' }
    const advanced = panel.querySelector('[data-prts-advanced-summary]')
    setText(advanced, `${detailLabels[detail]} / 区分度 ${contrast} / ${value} px`)
    if (!calibration) return
    const distance = `${value}px`
    if (calibration.style.getPropertyValue('--prts-calibration-distance') !== distance) {
      calibration.style.setProperty('--prts-calibration-distance', distance)
    }
    scheduleCalibrationMeasurement()
  }

  function commitScaleDistance() {
    if (!scaleDistanceDirty || !currentPreferences) return false
    const value = currentScaleDistance()
    scaleDistanceDirty = false
    scaleDistanceDraft = value
    if (value !== normalizeScaleDistance(currentPreferences.conversationScaleMaxDistance)) onPreferenceChange('conversationScaleMaxDistance', value)
    else renderScaleCalibration()
    return true
  }

  function commitScaleFocusContrast() {
    if (!scaleFocusContrastDirty || !currentPreferences) return false
    const value = currentScaleFocusContrast()
    scaleFocusContrastDirty = false
    scaleFocusContrastDraft = value
    if (value !== normalizeScaleFocusContrast(currentPreferences.conversationScaleFocusContrast)) onPreferenceChange('conversationScaleFocusContrast', value)
    else renderScaleCalibration()
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
    if (!scaleDistanceDirty) scaleDistanceDraft = normalizeScaleDistance(currentPreferences.conversationScaleMaxDistance)
    if (!scaleFocusContrastDirty) scaleFocusContrastDraft = normalizeScaleFocusContrast(currentPreferences.conversationScaleFocusContrast)
    renderScaleCalibration()
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
      scaleDistanceDirty = false
      scaleDistanceDraft = undefined
      scaleFocusContrastDirty = false
      scaleFocusContrastDraft = undefined
      setResetConfirmation(false)
      onResetVisual()
    }
  }

  function onPanelInput(event) {
    const target = event.target
    if (!target?.matches?.('input[data-prts-setting-range]')) return
    const value = Number(target.value)
    if (!Number.isFinite(value)) return
    if (target.dataset.prtsSettingKey === 'conversationScaleMaxDistance') {
      scaleDistanceDraft = value
      scaleDistanceDirty = true
    } else if (target.dataset.prtsSettingKey === 'conversationScaleFocusContrast') {
      scaleFocusContrastDraft = value
      scaleFocusContrastDirty = true
    } else {
      return
    }
    renderScaleCalibration()
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
    if (target.dataset.prtsSettingKey === 'conversationScaleMaxDistance') commitScaleDistance()
    if (target.dataset.prtsSettingKey === 'conversationScaleFocusContrast') commitScaleFocusContrast()
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
  if (typeof window?.ResizeObserver === 'function') {
    calibrationResizeObserver = new window.ResizeObserver(scheduleScalePreviewRefresh)
    const viewport = panel?.querySelector?.('[data-prts-scale-calibration-viewport]')
    if (viewport) calibrationResizeObserver.observe(viewport)
  }

  return {
    update(preferences, status, persistenceState = currentPersistence) {
      currentPreferences = preferences
      currentStatus = status
      currentPersistence = persistenceState ?? { phase: 'idle', revision: 0 }
      if (!scaleDistanceDirty) scaleDistanceDraft = normalizeScaleDistance(preferences?.conversationScaleMaxDistance)
      if (!scaleFocusContrastDirty) scaleFocusContrastDraft = normalizeScaleFocusContrast(preferences?.conversationScaleFocusContrast)
      renderState()
    },
    refreshScalePreview: renderScaleCalibration,
    scheduleScalePreviewRefresh,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle,
    dispose() {
      isOpen = false
      hidePanel()
      if (savedTimer !== undefined) window?.clearTimeout?.(savedTimer)
      if (feedbackTimer !== undefined) window?.clearTimeout?.(feedbackTimer)
      if (calibrationSettleTimer !== undefined) window?.clearTimeout?.(calibrationSettleTimer)
      calibrationSettleTimer = undefined
      cancelCalibrationFrame()
      setCalibrationResizeState(false)
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
      calibrationResizeObserver?.disconnect()
      document.documentElement.removeAttribute('data-prts-settings-open')
    },
  }
}
