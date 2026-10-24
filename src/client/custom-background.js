import { mountFileDrop } from './file-drop.js'
import { createBackgroundLayout } from './background-layout.js'
import { mountBackgroundRegionEditor, backgroundRegionMarkup } from './background-region-editor.js'
import { opacityDialMarkup, mountOpacityDials } from './opacity-dial.js'
const BACKGROUND_ENDPOINT = '/prts-theme-api/backgrounds'
const backgroundLabels = { sidebar: '左侧边栏', conversation: '会话正文', full: '完整背景' }
function backgroundImageUrl(entry) {
  return /^[a-f0-9-]{36}$/.test(entry?.id ?? '') ? `${BACKGROUND_ENDPOINT}/image/${entry.id}` : null
}
export function createBackgroundStore({ window, document }) {
  let state = { revision: -1, sidebar: null, conversation: null, full: null }, disposed = false, events, refreshing
  const listeners = new Set()
  const layout = createBackgroundLayout({window,document})
  const abort = window.AbortController ? new window.AbortController() : null
  const apply = value => {
    if (disposed || value.revision < state.revision) return
    state = value
    layout.update(state)
    for (const slot of Object.keys(backgroundLabels)) {
      const url = backgroundImageUrl(state[slot])
      const root = document.documentElement
      root.toggleAttribute(`data-prts-background-${slot}`, Boolean(url))
      if (url) root.style.setProperty(`--prts-background-${slot}`, `url("${url}")`)
      else root.style.removeProperty(`--prts-background-${slot}`)
    }
    const ratio = Number(state.sidebar?.width) / Number(state.sidebar?.height)
    document.documentElement.style.setProperty('--prts-sidebar-image-ratio', String(Number.isFinite(ratio) && ratio > 0 ? ratio : 1))
    for (const listener of listeners) listener(state)
  }
  const request = async data => {
    const response = await window.fetch(BACKGROUND_ENDPOINT + '/configuration', {
      credentials: 'same-origin', signal: abort?.signal,
      ...(data === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json', 'x-prts-request': '1' }, body: JSON.stringify(data) }),
    })
    const value = await response.json()
    if (!response.ok) throw Error(value.error || '背景服务暂不可用')
    apply(value); return state
  }
  const refresh = () => refreshing ?? (refreshing = request().finally(() => { refreshing = null }))
  if (window.fetch) void refresh().catch(() => {}).then(() => {
    if (disposed || !window.EventSource) return
    events = new window.EventSource(BACKGROUND_ENDPOINT + '/events')
    events.onmessage = event => {
      try {
        const revision = JSON.parse(event.data).revision
        if (revision > state.revision) void refresh().then(() => {
          if (!disposed && revision > state.revision) return refresh()
        }).catch(() => {})
      } catch {}
    }
  })
  const focus = () => { if (window.fetch) void refresh().catch(() => {}) }
  window.addEventListener('focus', focus)
  return {
    snapshot: () => state, refresh,
    setEnabled: value => layout.setEnabled(value),
    subscribe(fn) { listeners.add(fn); fn(state); return () => listeners.delete(fn) },
    async save(slot, image, revision = state.revision) {
      try { return await request({ slot, image, revision }) }
      catch (error) { await refresh().catch(() => {}); throw error }
    },
    async saveRegion(slot, region, revision = state.revision) {
      try { return await request({ slot, region, revision }) }
      catch (error) { await refresh().catch(() => {}); throw error }
    },
    dispose() {
      layout.dispose()
      document.documentElement.style.removeProperty('--prts-sidebar-image-ratio')
      disposed = true; abort?.abort(); events?.close(); listeners.clear(); window.removeEventListener('focus', focus)
      for (const slot of Object.keys(backgroundLabels)) {
        document.documentElement.removeAttribute(`data-prts-background-${slot}`)
        document.documentElement.style.removeProperty(`--prts-background-${slot}`)
      }
    },
  }
}
export function backgroundMarkup(heroContrastControl = '') {
  return `<section data-prts-background-settings>
    <header><strong>会话背景</strong><small>分区使用不同图片，或让一张完整背景贯穿侧边栏与正文。</small></header>
    <div data-prts-background-modes role="group" aria-label="背景模式">
      ${[['off','默认背景','使用主题原有底色'],['split','分区背景','左侧边栏与正文独立配置'],['full','完整背景','一张图片贯穿整个界面']].map(([value,label,hint]) => `<button type="button" data-prts-setting-key="backgroundMode" data-prts-setting-value="${value}" aria-pressed="false"><span data-prts-background-diagram="${value}" aria-hidden="true"><i></i><i></i></span><span><strong>${label}</strong><small>${hint}</small></span></button>`).join('')}
    </div>
    <div data-prts-background-images hidden>${Object.entries(backgroundLabels).map(([slot,label]) => `<article data-prts-background-card="${slot}" hidden>
      <div data-prts-background-card-heading><strong>${label}</strong><button type="button" data-prts-background-remove="${slot}" aria-label="移除${label}图片" hidden>移除</button></div>
      <div data-prts-background-image-controls="${slot}"><span data-prts-background-thumbnail="${slot}" aria-hidden="true"></span><span data-prts-background-empty>尚未选择图片</span>
        <div data-prts-background-image-actions><button type="button" data-prts-background-region-open="${slot}" hidden><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"/><rect x="6.5" y="6.5" width="7" height="7" rx="1.5"/></svg><span>保护区域</span></button><button type="button" data-prts-background-upload="${slot}" aria-label="上传或替换${label}"><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="14" height="14" rx="3"/><path d="m4 14 4-4 3 3 2-2 4 4"/><circle cx="12.5" cy="7" r="1"/></svg><span data-prts-background-caption="${slot}">选择图片</span></button></div>
      </div>
      ${backgroundRegionMarkup(slot)}
      <input type="file" data-prts-background-file="${slot}" accept="image/png,image/jpeg,image/webp,image/avif" hidden>
    </article>`).join('')}</div>
    <dialog data-prts-background-confirm aria-labelledby="prts-background-confirm-title" aria-describedby="prts-background-confirm-note">
      <header><small>会话背景</small><h2 id="prts-background-confirm-title"></h2></header>
      <div data-prts-background-compare>
        <figure><img data-prts-background-before alt="当前背景"><figcaption>当前背景</figcaption></figure>
        <figure><img data-prts-background-after alt="新背景"><figcaption>新背景<span data-prts-background-filename></span></figcaption></figure>
      </div>
      <p id="prts-background-confirm-note"></p>
      <footer><button type="button" data-prts-background-confirm-cancel autofocus>取消</button><button type="button" data-prts-background-confirm-apply>替换背景</button></footer>
    </dialog>
    <label data-prts-background-shade hidden><span>背景淡化 <output></output></span><input type="range" min="0" max="90" step="5" aria-label="背景淡化程度"><small>调高后背景更淡，接近当前主题底色。</small></label>
    <div data-prts-background-hero-setting hidden>${heroContrastControl}</div>
    ${opacityDialMarkup()}
    <small data-prts-background-help>可将图片拖入对应背景区域。支持 PNG / JPEG / WebP / AVIF · 最大 10 MB<br>图片铺满，可框选重要区域优先保留。切换模式保留素材，并在当前 DSH 实例同步。</small><p data-prts-background-status role="status"></p>
  </section>`
}
export function mountBackgroundSettings({ panel, window, store, onChange }) {
  const section = panel.querySelector('[data-prts-background-settings]')
  if (!section || !store) return { update() {}, dispose() {} }
  let disposed = false, busy = false, preferences = {}, state = store.snapshot()
  const status = section.querySelector('[data-prts-background-status]')
  const range = section.querySelector('input[type="range"]')
  const confirmDialog = section.querySelector('[data-prts-background-confirm]')
  let finishConfirmation, previewUrl, returnFocus
  const finish = accepted => {
    if (!finishConfirmation) return
    const resolve = finishConfirmation; finishConfirmation = undefined
    confirmDialog.close()
    confirmDialog.querySelectorAll('img').forEach(image => image.removeAttribute('src'))
    window.URL.revokeObjectURL(previewUrl); previewUrl = undefined
    returnFocus?.focus?.({ preventScroll: true })
    resolve(accepted)
  }
  const confirmReplace = (slot, file) => new Promise(resolve => {
    returnFocus = section.querySelector(`[data-prts-background-upload="${slot}"]`)
    previewUrl = window.URL.createObjectURL(file)
    confirmDialog.querySelector('h2').textContent = `替换${backgroundLabels[slot]}？`
    confirmDialog.querySelector('[data-prts-background-before]').src = backgroundImageUrl(state[slot])
    confirmDialog.querySelector('[data-prts-background-after]').src = previewUrl
    confirmDialog.querySelector('[data-prts-background-filename]').textContent = file.name
    confirmDialog.querySelector('p').textContent = state[slot].region ? '替换后，当前图片的保护区域将清除。' : '确认后，新图片将应用到此区域。'
    finishConfirmation = resolve
    confirmDialog.showModal()
    confirmDialog.querySelector('[data-prts-background-confirm-cancel]').focus()
  })
  const confirmClick = event => {
    if (event.target.closest('[data-prts-background-confirm-cancel]')) finish(false)
    if (event.target.closest('[data-prts-background-confirm-apply]')) finish(true)
  }
  const confirmCancel = event => { event.preventDefault(); event.stopPropagation(); finish(false) }
  const confirmKey = event => { if (event.key === 'Escape') confirmCancel(event) }
  confirmDialog.addEventListener('click', confirmClick)
  confirmDialog.addEventListener('cancel', confirmCancel)
  confirmDialog.addEventListener('keydown', confirmKey)
  const regions = mountBackgroundRegionEditor({section,window,store})
  const dials = mountOpacityDials({ section, window, onChange })
  function render() {
    dials.update(preferences, state)
    regions.update(state, preferences.backgroundMode || 'off')
    const mode = preferences.backgroundMode || 'off'
    section.querySelector('[data-prts-background-images]').hidden = mode === 'off'
    section.querySelector('[data-prts-background-shade]').hidden = mode === 'off'
    range.value = String(Math.round((preferences.backgroundDim ?? .45) * 100))
    section.querySelector('output').textContent = `${range.value}%`
    for (const slot of Object.keys(backgroundLabels)) {
      const url = backgroundImageUrl(state[slot])
      section.querySelector(`[data-prts-background-card="${slot}"]`).hidden = mode === 'off' || (mode === 'full') !== (slot === 'full')
      section.querySelector(`[data-prts-background-image-controls="${slot}"]`).toggleAttribute('data-has-image', Boolean(url))
      section.querySelector(`[data-prts-background-thumbnail="${slot}"]`).style.backgroundImage = url ? `url("${url}")` : ''
      section.querySelector(`[data-prts-background-caption="${slot}"]`).textContent = url ? '替换图片' : '选择图片'
      section.querySelector(`[data-prts-background-remove="${slot}"]`).hidden = !url
      section.querySelector(`[data-prts-background-region-open="${slot}"]`).hidden = !url
    }
    for (const button of section.querySelectorAll('[data-prts-background-upload], [data-prts-background-remove]')) button.disabled = busy
  }
  async function save(slot, file) {
    if (busy || finishConfirmation) return
    if (file && file.size > 10 * 1024 * 1024) { status.textContent = '请上传不超过 10 MB 的图片'; return }
    const revision = state.revision
    if (file && state[slot] && !await confirmReplace(slot, file)) return
    if (disposed) return
    busy = true; status.textContent = '正在保存背景…'; render()
    try {
      let image = null
      if (file) image = await new Promise((resolve, reject) => {
        const reader = new window.FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = () => reject(Error('无法读取图片'))
        reader.readAsDataURL(file)
      })
      if (disposed) return
      await store.save(slot, image, revision)
      if (!disposed) status.textContent = file ? '背景已保存，并同步到其他页面。' : '图片已移除。'
    } catch (error) { if (!disposed) status.textContent = error.message }
    finally { busy = false; if (!disposed) render() }
  }
  const click = event => {
    const upload = event.target.closest('[data-prts-background-upload]')
    if (upload) section.querySelector(`[data-prts-background-file="${upload.dataset.prtsBackgroundUpload}"]`).click()
    const remove = event.target.closest('[data-prts-background-remove]')
    if (remove) void save(remove.dataset.prtsBackgroundRemove, null)
  }
  const change = event => {
    if (event.target === range) onChange('backgroundDim', Number(range.value) / 100)
    const slot = event.target.dataset.prtsBackgroundFile
    if (slot && event.target.files?.[0]) { void save(slot, event.target.files[0]); event.target.value = '' }
  }
  const input = event => { if (event.target === range) section.querySelector('output').textContent = `${range.value}%` }
  section.addEventListener('click', click); section.addEventListener('change', change); section.addEventListener('input', input)
  const drops = Object.keys(backgroundLabels).map(slot => mountFileDrop({
    area: section.querySelector(`[data-prts-background-image-controls="${slot}"]`),
    input: section.querySelector(`[data-prts-background-file="${slot}"]`),
    enabled: () => !busy && !finishConfirmation && !disposed,
    onError: message => { status.textContent = message },
  }))
  const unsubscribe = store.subscribe(value => { state = value; render() })
  return {
    update(value) { preferences = value; render() },
    dispose() { disposed = true; finish(false); confirmDialog.removeEventListener('click', confirmClick); confirmDialog.removeEventListener('cancel', confirmCancel); confirmDialog.removeEventListener('keydown', confirmKey); drops.forEach(drop => drop.dispose()); regions.dispose(); dials.dispose(); unsubscribe(); section.removeEventListener('click', click); section.removeEventListener('change', change); section.removeEventListener('input', input) },
  }
}
