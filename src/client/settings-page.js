export function createSettingsPage(React, meta = {}) {
  const h = React.createElement

  return function PrtsPluginSettingsPage({ useStore, updatePreference }) {
    const { preferences } = useStore(state => ({ preferences: state.preferences }))
    const safeMode = Boolean(meta.safeMode)
    const enabled = Boolean(preferences.enabled) && !safeMode
    const bootAnimation = preferences.bootAnimation !== false

    const settingRow = ({ key, title, description, checked, disabled = false, onChange }) => h('div', {
      className: 'prts-plugin-settings__row',
      key,
      'data-prts-plugin-setting': key,
    },
    h('span', { className: 'prts-plugin-settings__copy' },
      h('strong', null, title),
      h('small', null, description),
    ),
    h('button', {
      type: 'button',
      role: 'switch',
      className: checked ? 'is-active' : '',
      'aria-label': title,
      'aria-checked': String(checked),
      disabled,
      onClick: onChange,
    }, h('span', { 'aria-hidden': true })),
    )

    return h('section', {
      className: 'prts-plugin-settings',
      'data-prts-plugin-settings': '',
      'data-prts-settings-enabled': String(enabled),
      'aria-label': 'P.R.T.S. 插件设置',
    },
    h('header', { className: 'prts-plugin-settings__header' },
      h('h3', null, 'P.R.T.S.'),
      h('p', null, '完整外观设置位于主界面左上角的罗德岛徽记。'),
    ),
    safeMode && h('p', { className: 'prts-plugin-settings__safe', role: 'status' },
      '安全模式已暂停主题。移除地址中的 ?prts-safe=1 后即可恢复。',
    ),
    h('div', { className: 'prts-plugin-settings__list' },
      settingRow({
        key: 'enabled',
        title: '启用 P.R.T.S. 主题',
        description: safeMode ? '安全模式下无法启用主题' : '控制 P.R.T.S. 外观是否加载',
        checked: enabled,
        disabled: safeMode,
        onChange: () => { if (!safeMode) updatePreference('enabled', !preferences.enabled) },
      }),
      settingRow({
        key: 'bootAnimation',
        title: '播放启动动画',
        description: '刷新或启用主题时显示 P.R.T.S. 启动动画',
        checked: bootAnimation,
        onChange: () => updatePreference('bootAnimation', !bootAnimation),
      }),
    ),
    )
  }
}
