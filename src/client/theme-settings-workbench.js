import { themeTransferMarkup, mountThemeTransfer } from './theme-transfer-panel.js'
import { backgroundMarkup, mountBackgroundSettings } from './custom-background.js'
import { avatarMarkup, mountAvatarSettings } from './custom-avatar.js'
import { customEmblemMarkup, mountCustomEmblemEditor } from './custom-emblem.js'
import { PARTICLE_TRAVERSAL_SPEED_DEFAULT, PARTICLE_TRAVERSAL_SPEED_MAX, PARTICLE_TRAVERSAL_SPEED_MIN, PARTICLE_TRAVERSAL_SPEED_STEP, SESSION_FLOW_SPEED_DEFAULT, SESSION_FLOW_SPEED_MAX, SESSION_FLOW_SPEED_MIN, SESSION_FLOW_SPEED_STEP, resolveParticleDetail } from './preferences.js'

const SETTINGS_FOCUSABLE = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'summary',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const COMMON_CONTROLS = [
  ['cursor', 'PRTS 光标', [['system', '关闭'], ['prts', '开启']]],
  ['railDefaultHidden', '默认隐藏导航栏', [['false', '关闭'], ['true', '开启']]],
  ['motion', '动态效果', []],
  ['sessionFlow', '当前会话流线', [['false', '关闭'], ['true', '开启']]],
  ['sessionGlow', '流线光效', [['false', '关闭'], ['true', '开启']]],
  ['sessionFlowPalette', '流线色调', [['triad', '三色'], ['rhodes', '青蓝'], ['amber', '金黄'], ['alert', '赤红'], ['custom', '自定义']]],
]

const SESSION_FLOW_COLOR_CONTROLS = [
  ['sessionFlowColorBack', '后层'],
  ['sessionFlowColorCore', '中层'],
  ['sessionFlowColorFront', '前层'],
]

const PARTICLE_OPTIONS = [
  ['compact', '精简', 7],
  ['standard', '标准', 12],
  ['precise', '精细', 18],
]

function previewSetting(key, label, description) {
  return settingButtons(key, label, []).replace('</strong>', `</strong><small data-prts-preview-setting-description>${description}</small>`)
}

function settingButtons(key, label, options) {
  const note = key === 'composerGlass'
      ? '<small data-prts-setting-note>增强输入框的背景模糊与轻微折射，关闭时使用原有材质</small>'
      : key === 'bakerLoading'
      ? '<small data-prts-setting-note>每轮正文生成时显示三点动画，完成后显示全文；中断时保留已收到的内容</small>'
      : key === 'motion'
      ? '<small data-prts-setting-note>关闭后减少装饰动效，保留运行状态等必要反馈</small><small data-prts-setting-note data-prts-effective-motion hidden>系统当前要求减少动态</small>'
      : key === 'railDefaultHidden'
        ? '<small data-prts-setting-note>在任意窗口宽度下默认收起 P.R.T.S. 导航，可从左侧按钮临时展开</small>'
      : key === 'conversationStyle'
        ? '<small data-prts-setting-note>立即切换会话背景、头像与消息气泡</small>'
      : key === 'sessionFlow'
        ? '<small data-prts-setting-note>仅控制当前会话卡片的三色流线</small>'
      : key === 'conversationEmblem'
        ? '<small data-prts-setting-note>控制经典主题正文中的粒子徽记，不影响新会话徽记</small>'
      : key === 'bakerGroupAvatars'
        ? '<small data-prts-setting-note>过程正文仅首条显示头像，最终回答独立保留；关闭后每条回复均显示</small>'
      : key === 'sessionGlow'
        ? '<small data-prts-setting-note>为流线添加柔和的同色辉光</small>'
      : key === 'sessionFlowPalette'
        ? '<small data-prts-setting-note>同时适配日间与夜间模式</small>'
      : ''
  if (['composerGlass', 'bakerLoading', 'motion', 'cursor', 'railDefaultHidden', 'sessionFlow', 'sessionGlow', 'bakerGroupAvatars', 'conversationEmblem', 'sessionPreview', 'aiToolsEnabled', 'previewOngoing', 'previewTools', 'previewWarning', 'previewDone', 'previewDoubleClick', 'previewFollowOngoing', 'previewFollowWarning'].includes(key)) return `<div data-prts-setting-row="${key}">
    <span><strong>${label}</strong>${note}</span>
    <button type="button" role="switch" aria-label="${label}" aria-checked="false" data-prts-setting-switch="${key}" ${key === 'cursor' ? 'data-prts-cursor-switch' : ''}><span aria-hidden="true"></span></button>
  </div>`
  const sample = value => key === 'sessionFlowPalette'
    ? `<i data-prts-option-sample="${key}" data-prts-option-sample-value="${value}" aria-hidden="true"></i>`
    : ''
  return `<div data-prts-setting-row="${key}">
    <span><strong>${label}</strong>${note}</span>
    <div role="group" aria-label="${label}">${options.map(([value, text]) => `<button type="button" data-prts-setting-key="${key}" data-prts-setting-value="${value}">${sample(value)}<span>${text}</span></button>`).join('')}</div>
  </div>`
}


function particleMarkup() {
  return PARTICLE_OPTIONS.map(([value, label, count]) => `<button type="button" role="radio" data-prts-setting-key="particleDetail" data-prts-setting-value="${value}">
    <i data-prts-particle-detail-preview aria-hidden="true">${Array.from({ length: count }, () => '<b></b>').join('')}</i><span>${label}</span>
  </button>`).join('')
}

function sessionFlowPreviewMarkup() {
  const filaments = [
    ['back', 'M 3 29 C 34 8 66 36 101 17 C 126 5 151 27 177 13'],
    ['core', 'M 3 24 C 30 35 61 7 94 23 C 124 37 148 7 177 20'],
    ['front', 'M 3 18 C 34 4 66 30 96 12 C 125 -1 148 30 177 24'],
  ]
  return `<svg data-prts-session-flow-preview viewBox="0 0 180 42" aria-label="三色流线预览" role="img">
    ${filaments.map(([strand, path]) => `<g data-prts-session-flow-preview-filament="${strand}">
      <path data-prts-session-flow-preview-layer="halo" d="${path}"></path>
      <path data-prts-session-flow-preview-layer="body" d="${path}"></path>
      <path data-prts-session-flow-preview-layer="core" d="${path}"></path>
    </g>`).join('')}
  </svg>`
}

function sessionFlowColorMarkup() {
  return `<div data-prts-setting-row="sessionFlowColors" data-prts-session-flow-colors>
    <span><strong>三色调色盘</strong><small data-prts-setting-note>任意修改后切换为自定义，日夜模式均保持原色</small></span>
    <div data-prts-session-flow-color-workbench>
      ${sessionFlowPreviewMarkup()}
      <div data-prts-session-flow-color-inputs role="group" aria-label="三色流线调色盘">
        ${SESSION_FLOW_COLOR_CONTROLS.map(([key, label]) => `<label><span>${label}</span><input type="color" value="#ffffff" data-prts-setting-color data-prts-setting-key="${key}" aria-label="${label}流线颜色"><output data-prts-setting-color-output="${key}">#ffffff</output></label>`).join('')}
      </div>
    </div>
  </div>`
}

export function themeSettingsMarkup() {
  return `<div data-prts-settings-backdrop hidden aria-hidden="true"></div>
    <dialog id="prts-theme-settings" data-prts-theme-settings aria-label="P.R.T.S. 主题设置" aria-hidden="true">
      <div data-prts-settings-frame>
        <header data-prts-theme-settings-header>
          <span><small>P.R.T.S. / 设置</small><strong>主题设置</strong></span>
          <div data-prts-settings-summary aria-live="polite">
            <span data-prts-persistence-status hidden></span>
          </div>
          <button type="button" data-prts-theme-settings-close aria-label="关闭主题设置">×</button>
        </header>

        <div data-prts-settings-body>
        <div data-prts-settings-sidebar>
        <nav data-prts-settings-nav role="tablist" aria-label="设置分区">
          <button type="button" data-prts-settings-jump="appearance" role="tab" id="prts-tab-appearance" aria-controls="prts-page-appearance" aria-selected="true" tabindex="0">会话主题</button>
          <button type="button" data-prts-settings-jump="background" role="tab" id="prts-tab-background" aria-controls="prts-page-background" aria-selected="false" tabindex="-1">会话背景</button>
          <button type="button" data-prts-settings-jump="interaction" role="tab" id="prts-tab-interaction" aria-controls="prts-page-interaction" aria-selected="false" tabindex="-1">交互</button>
          <button type="button" data-prts-settings-jump="flow" role="tab" id="prts-tab-flow" aria-controls="prts-page-flow" aria-selected="false" tabindex="-1">会话流线</button>
          <button type="button" data-prts-settings-jump="particles" role="tab" id="prts-tab-particles" aria-controls="prts-page-particles" aria-selected="false" tabindex="-1">粒子徽记</button>
          <button type="button" data-prts-settings-jump="assistance" role="tab" id="prts-tab-assistance" aria-controls="prts-page-assistance" aria-selected="false" tabindex="-1">辅助功能</button>
          <button type="button" data-prts-settings-jump="ai-tools" role="tab" id="prts-tab-ai-tools" aria-controls="prts-page-ai-tools" aria-selected="false" tabindex="-1">AI 工具</button>
        </nav>
          <footer data-prts-settings-actions aria-label="全局主题设置操作">
            <div data-prts-persistence-error hidden role="alert">
              <span><strong>设置未保存</strong><small>未能保存到 DSH，可能存在连接中断、配置冲突或当前访问不支持持久保存。重试将重新提交本次修改。</small></span>
              <button type="button" data-prts-retry-save>重试保存</button>
            </div>
            <button type="button" data-prts-transfer-open data-prts-footer-action aria-haspopup="dialog" aria-expanded="false"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14V3m-3 3 3-3 3 3M14 6v11m-3-3 3 3 3-3"/></svg><span>导入与导出</span></button>
            <div data-prts-reset-zone>

              <button type="button" data-prts-reset-visual data-prts-footer-action title="恢复全部主题设置" aria-label="恢复全部主题设置"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7a6.5 6.5 0 1 1-.4 5M4 3v4h4"/></svg><span>恢复默认</span></button>
              <div data-prts-reset-confirm hidden role="group" aria-label="确认恢复全部主题设置">
                <span>重置全部分类的主题设置，保留主题开关、启动动画和徽记配置。</span>
                <button type="button" data-prts-reset-confirm-action>确认恢复</button>
                <button type="button" data-prts-reset-cancel>取消</button>
              </div>
            </div>
          </footer>
          ${themeTransferMarkup()}
        </div>
        <div data-prts-theme-settings-scroll>
          <section data-prts-settings-section="appearance" role="tabpanel" id="prts-page-appearance" aria-labelledby="prts-tab-appearance" tabindex="0">
          <section data-prts-conversation-settings>
            <header><strong>会话主题</strong><small>选择消息的呈现方式</small></header>
            <div data-prts-conversation-cards>
              <button type="button" data-prts-setting-key="conversationStyle" data-prts-setting-value="native" aria-pressed="false"><span data-prts-conversation-sample="classic" aria-hidden="true"><i></i><i></i></span><strong>经典</strong><small>简洁正文，保留熟悉的阅读布局</small></button>
              <button type="button" data-prts-setting-key="conversationStyle" data-prts-setting-value="deck-chat" aria-pressed="false"><span data-prts-conversation-sample="baker" aria-hidden="true"><i></i><i></i></span><strong>Baker</strong><small>终末地通讯风格，圆形头像与消息气泡</small></button>
            </div>
            <div data-prts-classic-options>${settingButtons('conversationEmblem', '正文徽记', [])}</div>
            ${avatarMarkup()}
            <div data-prts-baker-options>${settingButtons('bakerGroupAvatars', '合并过程回复头像', [])}${settingButtons('bakerLoading', '回复完成前显示加载动画', [])}</div>
          </section>
          </section>
          <section data-prts-settings-section="background" role="tabpanel" id="prts-page-background" aria-labelledby="prts-tab-background" tabindex="0" hidden>
            ${backgroundMarkup()}
            <div data-prts-composer-glass-setting>${settingButtons('composerGlass', '输入框增强毛玻璃', [])}</div>
            <small data-prts-composer-glass-required hidden>自定义背景下，输入框增强毛玻璃始终开启。</small>
          </section>
          <section data-prts-settings-common data-prts-settings-section="interaction" role="tabpanel" id="prts-page-interaction" aria-labelledby="prts-tab-interaction" tabindex="0" hidden>
            <div data-prts-settings-common-grid>
              ${COMMON_CONTROLS.filter(([key]) => ['cursor', 'railDefaultHidden', 'motion'].includes(key)).map(([key, label, options]) => settingButtons(key, label, options)).join('')}
            </div>
          </section>
          <section data-prts-settings-section="ai-tools" data-prts-ai-tools role="tabpanel" id="prts-page-ai-tools" aria-labelledby="prts-tab-ai-tools" tabindex="0" hidden>
            <div data-prts-preview-settings><div data-prts-preview-master>
            ${previewSetting('aiToolsEnabled', '允许 AI 定制主题', '默认开启 · 共 5 个工具 · 影响此 DSH 实例的所有会话')}
            </div></div>
            <p>开启后，AI 可以通过工具调整粒子徽记和 Baker 头像。关闭后，后续模型请求不再提供这些工具，手动设置不受影响；已有对话中的工具记录不会删除。</p>
            <section>
              <h3>粒子徽记 <small>3 个工具</small></h3>
              <p>将会话中的图片制作成粒子徽记，用于新会话页面或正文轮换。</p>
              <ol><li>上传图片，或让 AI 读取已生成的图片。</li><li>让 AI 制作草稿，调整轮廓、位置和缩放，先查看预览。</li><li>满意后明确要求应用到新会话徽记，或加入正文轮换。</li></ol>
              <blockquote>“把这张图片做成粒子徽记，先给我看看效果。”</blockquote>
              <details><summary>工具说明与限制</summary><dl>
                <dt><code>prts_emblem_inspect</code></dt><dd>查看徽记配置、版本与当前会话的可用图片，不修改设置。</dd>
                <dt><code>prts_emblem_preview</code></dt><dd>制作或调整粒子徽记草稿，只生成预览，不直接应用。</dd>
                <dt><code>prts_emblem_apply</code></dt><dd>经你确认后，替换新会话徽记，或添加、替换正文轮换徽记。</dd>
              </dl><p>单张来源图片最大 8 MB。徽记设置跨工作区和会话共享。粒子预览不等同于原图；配置发生变化时，AI 需要重新核对后再应用。</p></details>
            </section>
            <section>
              <h3>Baker 头像 <small>2 个工具</small></h3>
              <p>为用户和 AI 设置头像，调整圆形裁剪，或恢复默认头像。仅在 Baker 会话样式下显示。</p>
              <ol><li>上传图片，说明要修改用户头像还是 AI 头像。</li><li>让 AI 查看当前配置，再按你的要求替换、裁剪或恢复默认。</li></ol>
              <blockquote>“把这张图片设为 AI 头像，居中裁剪。”</blockquote>
              <details><summary>工具说明与限制</summary><dl>
                <dt><code>prts_avatar_inspect</code></dt><dd>查看头像配置、原图尺寸、裁剪参数及会话图片，不修改设置。</dd>
                <dt><code>prts_avatar_apply</code></dt><dd>替换用户或 AI 头像、基于现有原图重新裁剪，或恢复默认头像。</dd>
              </dl><p>单图最大 5 MB、2500 万像素；裁剪支持 1～4 倍缩放。修改立即影响此实例所有会话，不会自动切换会话样式。替换后不保留旧原图；恢复默认会删除自定义原图。</p></details>
            </section>
          </section>
          <section data-prts-settings-section="assistance" role="tabpanel" id="prts-page-assistance" aria-labelledby="prts-tab-assistance" tabindex="0" hidden>
            <section data-prts-preview-settings>
              <div data-prts-preview-master>
                ${previewSetting('sessionPreview', '会话状态预览', '在工作区右侧查看会话进度，无需切换当前会话')}
              </div>
              <div data-prts-preview-options>
                <section data-prts-preview-setting-group>
                  <header><strong>悬停预览</strong><small>选择哪些状态显示详细浮窗</small></header>
                  ${previewSetting('previewOngoing', '运行中预览', '逐轮查看已完成的回复，最新内容置顶')}
                  <div data-prts-preview-details="previewOngoing">
                  ${previewSetting('previewTools', '显示工具调用', '显示工具进度，悬停查看最新正文之后的调用记录')}
                  <label data-prts-setting-row="previewReplyLimit"><span><strong>回复条数</strong><small data-prts-preview-setting-description>仅保留最新回复</small></span><select data-prts-preview-reply-limit aria-label="最多显示回复"><option value="5">最新 5 条</option><option value="10">最新 10 条</option><option value="0">不限制</option></select></label>
                  ${previewSetting('previewFollowOngoing', '运行结束后跟随', '转为待处理或已完成时，自动切换预览')}
                  </div>
                  ${previewSetting('previewWarning', '待处理预览（回答与审批）', '查看问题或审批请求，并直接提交选择')}
                  <div data-prts-preview-details="previewWarning">
                  ${previewSetting('previewFollowWarning', '待处理结束后跟随', '回答或审批后继续跟随；关闭则留在待处理列表')}
                  </div>
                  ${previewSetting('previewDone', '已完成预览', '查看本轮最终回复')}

                </section>
                <section data-prts-preview-setting-group>
                  <header><strong>快捷操作</strong></header>
                  ${previewSetting('previewDoubleClick', '双击浮窗进入会话', '双击正文或空白区域，打开对应会话')}
                </section>
              </div>
            </section>
          </section>
          <section data-prts-settings-common data-prts-settings-section="flow" role="tabpanel" id="prts-page-flow" aria-labelledby="prts-tab-flow" tabindex="0" hidden>
            <div data-prts-settings-common-grid>
              ${COMMON_CONTROLS.filter(([key]) => ['sessionFlow', 'sessionGlow', 'sessionFlowPalette'].includes(key)).map(([key, label, options]) => settingButtons(key, label, options)).join('')}
              ${sessionFlowColorMarkup()}
              <label data-prts-setting-row="sessionFlowSpeed" data-prts-setting-range-row data-prts-session-flow-speed>
                <span><strong>流线速度</strong><small data-prts-setting-note>控制当前会话流线的形变速度</small></span>
                <div><input type="range" min="0.25" max="2" step="0.25" value="1" data-prts-setting-range data-prts-setting-key="sessionFlowSpeed" aria-label="当前会话流线速度"><output data-prts-session-flow-speed-output>1× · 标准</output></div>
              </label>

            </div>
          </section>

          <section data-prts-settings-advanced data-prts-settings-section="particles" role="tabpanel" id="prts-page-particles" aria-labelledby="prts-tab-particles" tabindex="0" hidden>
            <div data-prts-settings-advanced-content>
              ${customEmblemMarkup()}
              <section data-prts-particle-detail>
                <header><strong>粒子精度</strong><span>同时调整会话与新会话徽记</span><output data-prts-advanced-summary>标准</output></header>
                <div role="radiogroup" aria-label="粒子精度">${particleMarkup()}</div>
                <label data-prts-setting-row="particleTraversalSpeed" data-prts-setting-range-row data-prts-particle-traversal>
                  <span><strong>跟随移动速度</strong><small>控制普通会话徽记移动及破碎重组的滚动距离</small></span>
                  <div><input type="range" min="0" max="2" step="0.25" value="1" data-prts-setting-range data-prts-setting-key="particleTraversalSpeed" aria-label="粒子徽记跟随移动速度"><output data-prts-particle-traversal-output>1× · 每 1 个视口重组</output></div>
                </label>
                <span data-prts-particle-error role="alert" hidden>粒子资源加载异常，主题已使用静态后备效果</span>
              </section>
            </div>
          </section>

        </div>
        </div>

      </div>
    </dialog>`
}

export function createThemeSettingsOverlay({
  document,
  trigger,
  panel,
  backdrop,
  customEmblemStore, avatarStore, backgroundStore, themeTransfer,
  onOpen = () => {},
  onPreferenceChange = () => {},
  onPreferencePreview = () => {},
  onResetVisual = () => {},
  onRetrySave = () => {},
}) {
  const window = document?.defaultView
  const transferEditor = mountThemeTransfer({ panel, window, transfer: themeTransfer })
  const backgroundEditor = mountBackgroundSettings({panel,window,store:backgroundStore,onChange:onPreferenceChange})
  const avatarEditor = mountAvatarSettings({panel,window,store:avatarStore})
  const customEditor = mountCustomEmblemEditor({ panel, window, store: customEmblemStore })
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
  let sessionFlowSpeedDraft
  let sessionFlowSpeedDirty = false
  let sessionFlowColorDrafts = {}
  const sessionFlowColorDirty = new Set()
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
      commitSessionFlowSpeed()
      commitSessionFlowColors()
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
      customEditor.close?.()
      avatarEditor.close?.()
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

  function normalizeSessionFlowSpeed(value) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return SESSION_FLOW_SPEED_DEFAULT
    const clamped = Math.min(SESSION_FLOW_SPEED_MAX, Math.max(SESSION_FLOW_SPEED_MIN, numeric))
    return Math.round(clamped / SESSION_FLOW_SPEED_STEP) * SESSION_FLOW_SPEED_STEP
  }

  function currentSessionFlowSpeed() {
    return normalizeSessionFlowSpeed(
      sessionFlowSpeedDirty ? sessionFlowSpeedDraft : currentPreferences?.sessionFlowSpeed,
    )
  }

  function normalizeSessionFlowColor(value, fallback = '#ffffff') {
    return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : fallback
  }

  function currentSessionFlowColor(key) {
    return normalizeSessionFlowColor(
      sessionFlowColorDirty.has(key) ? sessionFlowColorDrafts[key] : currentPreferences?.[key],
      '#ffffff',
    )
  }

  function activeSessionFlowPalette() {
    return sessionFlowColorDirty.size > 0 ? 'custom' : currentPreferences?.sessionFlowPalette
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

  function sessionFlowSpeedLabel(value) {
    const speed = normalizeSessionFlowSpeed(value)
    const description = speed < 1 ? '缓慢' : speed === 1 ? '标准' : speed <= 1.5 ? '快速' : '高速'
    return `${conciseNumber(speed)}× · ${description}`
  }

  function renderSessionFlowSpeed() {
    if (!panel || !currentPreferences) return
    const value = currentSessionFlowSpeed()
    const range = panel.querySelector('input[data-prts-setting-range][data-prts-setting-key="sessionFlowSpeed"]')
    if (range && range.value !== String(value)) range.value = String(value)
    setText(panel.querySelector('[data-prts-session-flow-speed-output]'), sessionFlowSpeedLabel(value))
  }

  function renderSessionFlowColors() {
    if (!panel || !currentPreferences) return
    for (const [key] of SESSION_FLOW_COLOR_CONTROLS) {
      const value = currentSessionFlowColor(key)
      const input = panel.querySelector(`input[data-prts-setting-color][data-prts-setting-key="${key}"]`)
      if (input && input.value !== value) input.value = value
      setText(panel.querySelector(`[data-prts-setting-color-output="${key}"]`), value)
    }
    const preview = panel.querySelector('[data-prts-session-flow-preview]')
    if (preview) {
      preview.dataset.prtsSessionFlowPreviewPalette = activeSessionFlowPalette() || 'triad'
      preview.style.setProperty('--prts-session-flow-back', currentSessionFlowColor('sessionFlowColorBack'))
      preview.style.setProperty('--prts-session-flow-core', currentSessionFlowColor('sessionFlowColorCore'))
      preview.style.setProperty('--prts-session-flow-front', currentSessionFlowColor('sessionFlowColorFront'))
    }
    for (const button of panel.querySelectorAll('button[data-prts-setting-key="sessionFlowPalette"]')) {
      const selected = button.dataset.prtsSettingValue === activeSessionFlowPalette()
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', String(selected))
    }
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

  function commitSessionFlowSpeed() {
    if (!sessionFlowSpeedDirty || !currentPreferences) return false
    const value = currentSessionFlowSpeed()
    sessionFlowSpeedDirty = false
    sessionFlowSpeedDraft = value
    if (value !== normalizeSessionFlowSpeed(currentPreferences.sessionFlowSpeed)) {
      onPreferenceChange('sessionFlowSpeed', value)
    } else {
      renderSessionFlowSpeed()
    }
    return true
  }

  function commitSessionFlowColor(key) {
    if (!sessionFlowColorDirty.has(key) || !currentPreferences) return false
    const value = currentSessionFlowColor(key)
    sessionFlowColorDirty.delete(key)
    sessionFlowColorDrafts[key] = value
    if (value !== normalizeSessionFlowColor(currentPreferences[key]) || currentPreferences.sessionFlowPalette !== 'custom') {
      onPreferenceChange(key, value)
    } else {
      renderSessionFlowColors()
    }
    return true
  }

  function commitSessionFlowColors() {
    let committed = false
    for (const key of [...sessionFlowColorDirty]) committed = commitSessionFlowColor(key) || committed
    return committed
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
    status.hidden = phase !== 'saved' && phase !== 'saving'
    status.textContent = phase === 'saved' ? '已保存' : phase === 'saving' ? '正在保存…' : ''
    if (phase === 'saved') {
      renderedPersistenceRevision = revision
      savedTimer = window?.setTimeout?.(() => { status.hidden = true; savedTimer = undefined }, reducedMotion() ? 500 : 1200)
    }
  }

  function renderState() {
    if (!panel || !currentPreferences) return
    for (const toggle of panel.querySelectorAll('[data-prts-setting-switch]')) {
      const key = toggle.dataset.prtsSettingSwitch
      const enabled = key === 'cursor' ? currentPreferences.cursor === 'prts'
        : key === 'motion' ? currentPreferences.motion !== 'reduced'
        : key === 'railDefaultHidden' ? currentPreferences[key] === true : currentPreferences[key] !== false
      toggle.setAttribute('aria-checked', String(enabled))
      toggle.classList.toggle('is-active', enabled)
    }
    const replyLimitSelect = panel.querySelector('[data-prts-preview-reply-limit]')
    if (replyLimitSelect) replyLimitSelect.value = String(currentPreferences.previewReplyLimit)
    const replyLimitRow = panel.querySelector('[data-prts-setting-row="previewReplyLimit"]')
    if (replyLimitRow) replyLimitRow.hidden = currentPreferences.previewOngoing === false
    for (const details of panel.querySelectorAll('[data-prts-preview-details]')) details.hidden = currentPreferences[details.dataset.prtsPreviewDetails] === false
    const previewOptions = panel.querySelector('[data-prts-preview-options]')
    if (previewOptions) previewOptions.hidden = currentPreferences.sessionPreview === false
    for (const key of ['sessionGlow', 'sessionFlowPalette', 'sessionFlowColors', 'sessionFlowSpeed']) {
      const row = panel.querySelector(`[data-prts-setting-row="${key}"]`)
      if (row) row.hidden = currentPreferences.sessionFlow === false
        || (key === 'sessionFlowColors' && activeSessionFlowPalette() !== 'custom')
    }
    const particleDetail = resolveParticleDetail(currentPreferences)
    const detailSummary = panel.querySelector('[data-prts-advanced-summary]')
    if (detailSummary) detailSummary.textContent = PARTICLE_OPTIONS.find(([value]) => value === particleDetail)?.[1] ?? '标准'
    for (const button of panel.querySelectorAll('button[data-prts-setting-key]')) {
      const key = button.dataset.prtsSettingKey
      const actual = key === 'particleDetail'
        ? particleDetail
        : key === 'sessionFlowPalette'
          ? activeSessionFlowPalette()
        : key === 'sessionFlow' || key === 'sessionGlow'
          ? currentPreferences[key] !== false
          : currentPreferences[key]
      const selected = String(actual) === button.dataset.prtsSettingValue
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', String(selected))
      if (button.getAttribute('role') === 'radio') button.setAttribute('aria-checked', String(selected))
    }
    const motionStatus = panel.querySelector('[data-prts-effective-motion]')
    if (motionStatus) motionStatus.hidden = !(currentPreferences.motion === 'system' && motionMedia?.matches)
    const transparency = panel.querySelector('[data-prts-transparency-status]')
    if (transparency) transparency.hidden = !(currentPreferences.glass !== 'off' && transparencyMedia?.matches)
    const particleError = panel.querySelector('[data-prts-particle-error]')
    if (particleError) particleError.hidden = currentStatus?.particle?.phase !== 'error'
    if (!particleTraversalSpeedDirty) particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(currentPreferences.particleTraversalSpeed)
    if (!sessionFlowSpeedDirty) sessionFlowSpeedDraft = normalizeSessionFlowSpeed(currentPreferences.sessionFlowSpeed)
    for (const [key] of SESSION_FLOW_COLOR_CONTROLS) {
      if (!sessionFlowColorDirty.has(key)) sessionFlowColorDrafts[key] = normalizeSessionFlowColor(currentPreferences[key])
    }
    renderParticleTraversal()
    renderSessionFlowSpeed()
    renderSessionFlowColors()
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

  let activeSection = 'appearance'
  const sectionScroll = new Map()
  function selectSection(key, focus = false) {
    const scroller = panel?.querySelector('[data-prts-theme-settings-scroll]')
    const section = panel?.querySelector(`[data-prts-settings-section="${key}"]`)
    if (!scroller || !section) return
    if (key === 'particles') void customEditor.prefetch?.()
    if (key !== activeSection) {
      sectionScroll.set(activeSection, scroller.scrollTop)
      customEditor.cancelReorder?.()
      for (const page of panel.querySelectorAll('[data-prts-settings-section]')) page.hidden = page !== section
      activeSection = key
      scroller.scrollTop = sectionScroll.get(key) || 0
      setResetConfirmation(false)
    }
    for (const tab of panel.querySelectorAll('[data-prts-settings-jump]')) {
      const selected = tab.dataset.prtsSettingsJump === key
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
      if (selected && focus) tab.focus({preventScroll:true})
    }
  }

  function onPanelClick(event) {
    if (event.target === panel) { setOpen(false); return }
    const target = event.target?.closest?.('button')
    if (!target) return
    if (target.hasAttribute('data-prts-settings-jump')) {
      selectSection(target.dataset.prtsSettingsJump)
      return
    }
    if (target.hasAttribute('data-prts-theme-settings-close')) { setOpen(false); return }
    if (target.hasAttribute('data-prts-setting-switch')) {
      const key = target.dataset.prtsSettingSwitch
      const enabled = target.getAttribute('aria-checked') === 'true'
      onPreferenceChange(key, key === 'cursor' ? (enabled ? 'system' : 'prts') : key === 'motion' ? (enabled ? 'reduced' : 'system') : !enabled)
      return
    }
    if (target.hasAttribute('data-prts-setting-key')) {
      const raw = target.dataset.prtsSettingValue
      if (target.dataset.prtsSettingKey === 'sessionFlowPalette') {
        sessionFlowColorDirty.clear()
        sessionFlowColorDrafts = {}
      }
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
      sessionFlowSpeedDirty = false
      sessionFlowSpeedDraft = undefined
      sessionFlowColorDirty.clear()
      sessionFlowColorDrafts = {}
      setResetConfirmation(false)
      onResetVisual()
    }
  }

  function onPanelInput(event) {
    const target = event.target
    if (target?.matches?.('[data-prts-preview-reply-limit]')) { onPreferenceChange('previewReplyLimit', Number(target.value)); return }
    if (target?.matches?.('input[data-prts-setting-color]')) {
      const key = target.dataset.prtsSettingKey
      const value = normalizeSessionFlowColor(target.value, currentSessionFlowColor(key))
      sessionFlowColorDrafts[key] = value
      sessionFlowColorDirty.add(key)
      renderSessionFlowColors()
      onPreferencePreview(key, value)
      return
    }
    if (!target?.matches?.('input[data-prts-setting-range]')) return
    const value = Number(target.value)
    if (!Number.isFinite(value)) return
    if (target.dataset.prtsSettingKey === 'particleTraversalSpeed') {
      particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(value)
      particleTraversalSpeedDirty = true
      renderParticleTraversal()
      onPreferencePreview('particleTraversalSpeed', particleTraversalSpeedDraft)
      return
    } else if (target.dataset.prtsSettingKey === 'sessionFlowSpeed') {
      sessionFlowSpeedDraft = normalizeSessionFlowSpeed(value)
      sessionFlowSpeedDirty = true
      renderSessionFlowSpeed()
      onPreferencePreview('sessionFlowSpeed', sessionFlowSpeedDraft)
      return
    } else {
      return
    }
  }

  function onKeydown(event) {
    if (!isOpen) return
    const tab = event.target.closest?.('[data-prts-settings-jump]')
    if (tab && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault()
      const tabs = [...panel.querySelectorAll('[data-prts-settings-jump]')]
      const index = tabs.indexOf(tab)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1
        : (index + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length
      selectSection(tabs[next].dataset.prtsSettingsJump, true)
      return
    }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (nativeModal || event.key !== 'Tab') return
    const nodes = focusable()
    if (!nodes.length) return
    const first = nodes[0]
    const last = nodes.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  function onCancel(event) {
    // File inputs also emit bubbling cancel events when their picker is dismissed.
    if (event.target !== panel) return
    event.preventDefault(); setOpen(false)
  }
  const toggle = () => setOpen(!isOpen)
  const closeFromBackdrop = () => setOpen(false)
  const renderMediaState = () => renderState()
  const commitFromControl = event => {
    const target = event.target
    if (target?.matches?.('input[data-prts-setting-color]')) {
      if (event.type === 'change' || event.type === 'focusout') commitSessionFlowColor(target.dataset.prtsSettingKey)
      return
    }
    if (!target?.matches?.('input[data-prts-setting-range]')) return
    if (target.dataset.prtsSettingKey === 'particleTraversalSpeed') commitParticleTraversalSpeed()
    if (target.dataset.prtsSettingKey === 'sessionFlowSpeed') commitSessionFlowSpeed()
  }

  trigger?.addEventListener('click', toggle)
  panel?.addEventListener('click', onPanelClick)
  selectSection('appearance')
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
      const emblemNote = panel.querySelector('[data-prts-emblem-baker-note]')
      if (emblemNote) emblemNote.hidden = preferences?.conversationStyle !== 'deck-chat'
      panel.querySelector('[data-prts-classic-options]').hidden = preferences?.conversationStyle === 'deck-chat'
      panel.querySelector('[data-prts-baker-options]').hidden = preferences?.conversationStyle !== 'deck-chat'
      panel.querySelector('[data-prts-avatars]').hidden = preferences?.conversationStyle !== 'deck-chat'
      const customBackground = preferences.backgroundMode !== 'off'
      panel.querySelector('[data-prts-composer-glass-setting]').hidden = customBackground
      panel.querySelector('[data-prts-composer-glass-required]').hidden = !customBackground
      backgroundEditor.update(preferences)
      currentPreferences = preferences
      currentStatus = status
      currentPersistence = persistenceState ?? { phase: 'idle', revision: 0 }
      if (!particleTraversalSpeedDirty) particleTraversalSpeedDraft = normalizeParticleTraversalSpeed(preferences?.particleTraversalSpeed)
      if (!sessionFlowSpeedDirty) sessionFlowSpeedDraft = normalizeSessionFlowSpeed(preferences?.sessionFlowSpeed)
      for (const [key] of SESSION_FLOW_COLOR_CONTROLS) {
        if (!sessionFlowColorDirty.has(key)) sessionFlowColorDrafts[key] = normalizeSessionFlowColor(preferences?.[key])
      }
      renderState()
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle,
    dispose() {
      transferEditor.dispose()
      customEditor.dispose()
      avatarEditor.dispose()
      backgroundEditor.dispose()
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
