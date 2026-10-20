import { THEME_PACKAGE_LIMIT, validateThemePackage, describeThemePackage } from './theme-transfer.js'

export function themeTransferMarkup() {
  return `<dialog data-prts-transfer-dialog aria-labelledby="prts-transfer-title">
    <section data-prts-transfer>
      <header data-prts-transfer-heading><div><small>P.R.T.S. / 主题文件</small><h2 id="prts-transfer-title">导入与导出</h2></div><button type="button" data-prts-transfer-close aria-label="关闭导入与导出">×</button></header>
      <div data-prts-transfer-columns>
        <section data-prts-transfer-card>
          <h3>导出主题</h3><p>保存一份主题，备份或带到另一台设备。</p>
          <label data-prts-transfer-option><input type="checkbox" data-prts-transfer-assets checked><span>包含自定义素材<small>背景、头像和徽记，保留编辑参数与排列。</small></span></label>
          <small>取消勾选，仅导出主题设置。</small>
          <button type="button" data-prts-transfer-export>导出主题文件 <span aria-hidden="true">↓</span></button>
        </section>
        <section data-prts-transfer-card>
          <h3>导入主题</h3><p>选择已导出的文件，确认内容后应用。</p>
          <div data-prts-transfer-file-hint><span aria-hidden="true">↑</span><small>.prts-theme.json · 最大 160 MB</small></div>
          <button type="button" data-prts-transfer-choose>选择主题文件</button>
          <input type="file" accept=".prts-theme.json,application/json" aria-label="导入主题文件" data-prts-transfer-file hidden>
        </section>
      </div>
      <div data-prts-transfer-preview hidden>
        <strong>确认导入</strong><p data-prts-transfer-summary></p>
        <small>应用前会下载当前配置备份，请保留备份文件。</small>
        <div data-prts-transfer-buttons><button type="button" data-prts-transfer-apply>确认导入</button><button type="button" data-prts-transfer-cancel>取消</button></div>
      </div>
      <div data-prts-transfer-recovery hidden><small>恢复将替换最近一次导入后所做的修改。</small><button type="button" data-prts-transfer-restore>恢复导入前配置</button></div>
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
  let pending, busy = false, disposed = false, generation = 0
  const render = () => {
    if (disposed) return
    get('preview').hidden = !pending
    get('recovery').hidden = !transfer.hasBackup
    for (const control of section.querySelectorAll('button,input')) control.disabled = busy
    // Prevent local editors from racing a multi-service import; other clients use revision checks.
    for (const page of panel.querySelectorAll('[data-prts-settings-section]')) if (!page.contains(section)) page.inert = busy
  }
  async function run(task) {
    if (busy) return
    busy = true; get('status').textContent = '正在处理，请稍候…'; render()
    try { get('status').textContent = await task() }
    catch (error) { if (!disposed) get('status').textContent = error.message }
    finally { busy = false; render() }
  }
  const change = event => {
    if (event.target !== get('file')) return
    const file = event.target.files?.[0], selected = ++generation
    pending = undefined; render()
    if (!file) return
    void run(async () => {
      if (file.size > THEME_PACKAGE_LIMIT) throw Error('主题文件不能超过 160 MB')
      const text = await new Promise((resolve, reject) => {
        const reader = new window.FileReader()
        reader.onload = () => resolve(reader.result); reader.onerror = () => reject(Error('无法读取主题文件')); reader.readAsText(file)
      })
      let value
      try { value = JSON.parse(text) } catch { throw Error('主题文件不是有效的 JSON') }
      validateThemePackage(value)
      if (disposed || selected !== generation) return ''
      pending = value
      get('summary').textContent = describeThemePackage(value)
      return '已读取文件，请确认导入内容。'
    })
  }
  const click = event => {
    const button = event.target.closest?.('button')
    if (button === get('close')) close()
    if (button === get('choose')) get('file').click()
    if (button === get('export')) void run(async () => {
      const value = await transfer.export(get('assets').checked)
      transfer.download(value)
      return '已发起下载，请确认主题文件已保存。'
    })
    if (button === get('apply') && pending) void run(async () => {
      await transfer.import(pending); pending = undefined; get('file').value = ''
      return '主题已导入并保存。'
    })
    if (button === get('cancel')) { pending = undefined; get('file').value = ''; get('status').textContent = ''; render() }
    if (button === get('restore')) void run(async () => { await transfer.restore(); return '已恢复导入前配置。' })
  }
  trigger?.addEventListener('click', open)
  dialog.addEventListener('keydown', keydown); dialog.addEventListener('cancel', cancel)
  section.addEventListener('change', change); section.addEventListener('click', click); render()
  return { dispose() { disposed = true; generation++; if (dialog.open) dialog.close(); trigger?.removeEventListener('click', open); dialog.removeEventListener('keydown', keydown); dialog.removeEventListener('cancel', cancel); section.removeEventListener('change', change); section.removeEventListener('click', click) } }
}
