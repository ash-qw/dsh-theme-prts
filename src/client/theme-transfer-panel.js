import { mountFileDrop } from './file-drop.js'
import { checkTransferCancelled, readTransferFile, THEME_PACKAGE_LIMIT, validateThemePackage, describeThemePackage, ignoredThemePackageFields } from './theme-transfer.js'

export function themeTransferMarkup() {
  return `<dialog data-prts-transfer-dialog aria-labelledby="prts-transfer-title">
    <section data-prts-transfer>
      <header data-prts-transfer-heading><div><small>P.R.T.S. / 主题文件</small><h2 id="prts-transfer-title">导入与导出</h2></div><button type="button" data-prts-transfer-close aria-label="关闭导入与导出">×</button></header>
      <div data-prts-transfer-columns>
        <section data-prts-transfer-card="export">
          <h3>导出主题</h3><p>保存一份主题，备份或带到另一台设备。</p>
          <label data-prts-transfer-option><input type="checkbox" data-prts-transfer-assets checked><span>包含自定义素材<small>背景、头像和徽记，保留编辑参数与排列。</small></span></label>
          <small>取消勾选，仅导出主题设置。</small>
          <button type="button" data-prts-transfer-export>导出主题文件 <span aria-hidden="true">↓</span></button>
        </section>
        <section data-prts-transfer-card="import" data-prts-transfer-drop>
          <h3>导入主题</h3><p>选择或拖入已导出的文件，确认内容后应用。</p>
          <div data-prts-transfer-file-hint><span aria-hidden="true">↑</span><small>.prts-theme.json · 最大 160 MB</small></div>
          <button type="button" data-prts-transfer-choose>选择主题文件 <span aria-hidden="true">↑</span></button>
          <input type="file" accept=".prts-theme.json,application/json" aria-label="导入主题文件" data-prts-transfer-file hidden>
        </section>
      </div>
      <div data-prts-transfer-preview hidden>
        <strong>确认导入</strong><p data-prts-transfer-summary></p>
        <p data-prts-transfer-compatibility hidden role="alert"></p>
        <small>应用前会下载当前配置备份，请保留备份文件。</small>
        <div data-prts-transfer-buttons><button type="button" data-prts-transfer-apply>确认导入</button><button type="button" data-prts-transfer-cancel>取消</button></div>
      </div>
      <div data-prts-transfer-recovery hidden><small>恢复将替换最近一次导入后所做的修改。</small><button type="button" data-prts-transfer-restore>恢复导入前配置</button></div>
      <div data-prts-transfer-progress hidden><div><span data-prts-transfer-phase></span><span data-prts-transfer-percent></span></div><progress data-prts-transfer-bar max="1" aria-label="主题文件处理进度"></progress></div>
      <button type="button" data-prts-transfer-stop hidden>取消操作</button>
      <p data-prts-transfer-status role="status" aria-live="polite"></p>
    </section>
  </dialog>`
}

export function mountThemeTransfer({ panel, window, transfer }) {
  const section = panel.querySelector('[data-prts-transfer]')
  if (!section || !transfer) return { dispose() {} }
  const dialog = panel.querySelector('[data-prts-transfer-dialog]')
  const trigger = panel.querySelector('[data-prts-transfer-open]')
  const open = () => { dialog.showModal(); trigger?.setAttribute('aria-expanded', 'true'); get('close').focus() }
  const close = () => { if (busy) return; dialog.close(); trigger?.setAttribute('aria-expanded', 'false'); trigger?.focus() }
  const keydown = event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() } }
  const cancel = event => { if (event.target === dialog) { event.preventDefault(); event.stopPropagation(); close() } }
  const get = name => section.querySelector(`[data-prts-transfer-${name}]`)
  let choosing = false, activeOperation, pending, busy = false, disposed = false, generation = 0, controller, cancellable = true
  const render = () => {
    if (disposed) return
    for (const card of section.querySelectorAll('[data-prts-transfer-card]')) card.toggleAttribute('data-prts-transfer-active', card.dataset.prtsTransferCard === (busy ? activeOperation : pending || choosing ? 'import' : undefined))
    get('preview').hidden = !pending
    if (!pending) get('compatibility').hidden = true
    get('recovery').hidden = !transfer.hasBackup
    for (const control of section.querySelectorAll('button,input')) control.disabled = busy
    get('stop').hidden = !busy
    get('stop').disabled = !busy || !cancellable || controller?.signal.aborted
    // Prevent local editors from racing a multi-service import; other clients use revision checks.
    for (const page of panel.querySelectorAll('[data-prts-settings-section]')) if (!page.contains(section)) page.inert = busy
  }
  const progress = ({ value, label, cancellable: allowed }) => {
    if (disposed) return
    if (allowed === false) { cancellable = false; render() }
    get('progress').hidden = false
    get('phase').textContent = label
    get('percent').textContent = value === null ? '' : `${Math.round(value * 100)}%`
    if (value === null) get('bar').removeAttribute('value')
    else get('bar').value = value
  }
  const paint = () => new Promise(resolve => window.setTimeout(resolve, 0))
  async function run(kind, task) {
    if (busy) return
    controller = new window.AbortController(); cancellable = true
    activeOperation = kind
    busy = true; section.setAttribute('aria-busy', 'true'); get('status').textContent = ''; get('progress').hidden = true; render()
    progress({ value: null, label: '正在准备…' })
    try {
      await paint()
      checkTransferCancelled(controller.signal)
      const message = await task(controller.signal)
      if (!disposed) { progress({ value: 1, label: '处理完成' }); get('status').textContent = message }
    }
    catch (error) { if (!disposed) { get('progress').hidden = true; get('status').textContent = error.name === 'AbortError' ? '操作已取消。' : error.message } }
    finally { busy = false; if (!pending && !disposed) get('file').value = '';  if (!disposed) section.setAttribute('aria-busy', 'false'); render() }
  }
  const change = event => {
    if (event.target !== get('file')) return
    choosing = false
    const file = event.target.files?.[0], selected = ++generation
    pending = undefined; render()
    if (!file) return
    void run('import', async signal => {
      if (file.size > THEME_PACKAGE_LIMIT) throw Error('主题文件不能超过 160 MB')
      const text = await readTransferFile(window, file, signal, event => progress({ value: event.lengthComputable && event.total ? event.loaded / event.total * 0.8 : null, label: '正在读取主题文件…' }))
      progress({ value: 0.8, label: '正在解析并检查主题文件…' })
      await paint()
      checkTransferCancelled(signal)
      let value
      try { value = JSON.parse(text) } catch { throw Error('主题文件不是有效的 JSON') }
      validateThemePackage(value)
      if (disposed || selected !== generation) return ''
      pending = value
      get('summary').textContent = describeThemePackage(value)
      const ignored = ignoredThemePackageFields(value)
      const compatibility = get('compatibility')
      compatibility.hidden = ignored.length === 0
      compatibility.textContent = ignored.length
        ? `当前版本不支持以下配置，导入后将丢失：${ignored.join('、')}。请保留原文件。`
        : ''
      return '已读取文件，请确认导入内容。'
    })
  }
  const click = event => {
    const button = event.target.closest?.('button')
    if (button === get('stop') && busy && cancellable) {
      controller.abort(); progress({ value: null, label: '正在取消，请稍候…', cancellable: false }); return
    }
    if (button === get('close')) close()
    if (button === get('choose')) { choosing = true; render(); get('file').click() }
    if (button === get('export')) void run('export', async signal => {
      const value = await transfer.export(get('assets').checked, state => progress({ ...state, value: state.value * 0.9 }), signal)
      progress({ value: 0.9, label: '正在生成下载文件…' })
      await paint()
      checkTransferCancelled(signal)
      transfer.download(value)
      return '已发起下载，请确认主题文件已保存。'
    })
    if (button === get('apply') && pending) void run('import', async signal => {
      await transfer.import(pending, progress, signal); pending = undefined; get('file').value = ''
      return '主题已导入并保存。'
    })
    if (button === get('cancel')) { pending = undefined; get('file').value = ''; get('status').textContent = ''; get('progress').hidden = true; render() }
    if (button === get('restore')) void run('import', async signal => { await transfer.restore(progress, signal); return '已恢复导入前配置。' })
  }
  const drop = mountFileDrop({ area: get('drop'), input: get('file'), enabled: () => !busy && !disposed, onError: message => { get('status').textContent = message } })
  const cancelChoice = () => { choosing = false; render() }
  get('file').addEventListener('cancel', cancelChoice)
  trigger?.addEventListener('click', open)
  dialog.addEventListener('keydown', keydown); dialog.addEventListener('cancel', cancel)
  section.addEventListener('change', change); section.addEventListener('click', click); render()
  return { dispose() { get('file').removeEventListener('cancel', cancelChoice); drop.dispose(); disposed = true; controller?.abort(); generation++; if (dialog.open) dialog.close(); trigger?.removeEventListener('click', open); dialog.removeEventListener('keydown', keydown); dialog.removeEventListener('cancel', cancel); section.removeEventListener('change', change); section.removeEventListener('click', click) } }
}
