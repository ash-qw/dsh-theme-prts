import { mountEmblemReorder } from './emblem-reorder.js'
import { PARTICLE_DENSITY_PROFILES } from './particle-field-adapter.js'

// Smooth, detect and thin luminance edges before snapping them to each density's grid.
// Transparent pixels are composited on white so hidden RGB cannot introduce contours.
export function extractEmblemLines(rgba, size, threshold, source = 'edges') {
  const count = size * size, luminance = new Float32Array(count), smooth = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const j = i * 4, opacity = rgba[j + 3] / 255
    luminance[i] = (rgba[j] * .2126 + rgba[j + 1] * .7152 + rgba[j + 2] * .0722) * opacity + 255 * (1 - opacity)
  }
  // Existing ink strokes must be sampled through their centers, not both borders.
  if (source === 'ink') return Uint8Array.from(luminance, value => 255 - value >= threshold / 4 ? 1 : 0)
  const sample = (values, x, y) => values[Math.max(0, Math.min(size - 1, y)) * size + Math.max(0, Math.min(size - 1, x))]
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let sum = 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      sum += sample(luminance, x + dx, y + dy) * (dx === 0 ? 2 : 1) * (dy === 0 ? 2 : 1)
    }
    smooth[y * size + x] = sum / 16
  }
  const magnitude = new Float32Array(count), direction = new Uint8Array(count)
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
    const i = y * size + x
    const gx = -smooth[i-size-1] + smooth[i-size+1] - 2*smooth[i-1] + 2*smooth[i+1] - smooth[i+size-1] + smooth[i+size+1]
    const gy = -smooth[i-size-1] - 2*smooth[i-size] - smooth[i-size+1] + smooth[i+size-1] + 2*smooth[i+size] + smooth[i+size+1]
    magnitude[i] = Math.hypot(gx, gy) / 4
    const angle = (Math.atan2(gy, gx) * 180 / Math.PI + 180) % 180
    direction[i] = angle < 22.5 || angle >= 157.5 ? 0 : angle < 67.5 ? 1 : angle < 112.5 ? 2 : 3
  }
  const edges = new Uint8Array(count), weak = new Uint8Array(count), pending = []
  const high = threshold / 4, low = high * .4, offsets = [1, size + 1, size, size - 1]
  for (let y = 1; y < size - 1; y++) for (let x = 1; x < size - 1; x++) {
    const i = y * size + x, strength = magnitude[i], offset = offsets[direction[i]]
    if (strength < low || strength < magnitude[i-offset] || strength <= magnitude[i+offset]) continue
    weak[i] = 1
    if (strength >= high) { edges[i] = 1; pending.push(i) }
  }
  // Hysteresis keeps faint continuations of strong lines without retaining isolated noise.
  while (pending.length) {
    const i = pending.pop()
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const next = i + dy * size + dx
      if (weak[next] && !edges[next]) { edges[next] = 1; pending.push(next) }
    }
  }
  return edges
}

// Zhang–Suen thinning preserves connected strokes and loops on the output grid.
export function simplifyEmblemLines(cells, size, cleanup = 2) {
  const mask = new Uint8Array(size * size)
  for (const i of cells) mask[i] = 1
  const around = [-size, -size+1, 1, size+1, size, size-1, -1, -size-1]
  let changed = true
  while (changed) {
    changed = false
    for (let pass = 0; pass < 2; pass++) {
      const remove = []
      for (let y = 1; y < size-1; y++) for (let x = 1; x < size-1; x++) {
        const i = y*size+x
        if (!mask[i]) continue
        const p = around.map(offset => mask[i+offset]), count = p.reduce((a,b)=>a+b,0)
        if (count < 2 || count > 6) continue
        let transitions = 0
        for (let k = 0; k < 8; k++) if (!p[k] && p[(k+1)%8]) transitions++
        if (transitions !== 1) continue
        if (pass === 0 ? p[0]*p[2]*p[4] || p[2]*p[4]*p[6] : p[0]*p[2]*p[6] || p[0]*p[4]*p[6]) continue
        remove.push(i)
      }
      for (const i of remove) mask[i] = 0
      if (remove.length) changed = true
    }
  }
  if (cleanup > 0) {
    const seen = new Uint8Array(mask.length)
    for (let i = 0; i < mask.length; i++) {
      if (!mask[i] || seen[i]) continue
      const component = [i]; seen[i] = 1
      for (let j = 0; j < component.length; j++) {
        const n = component[j], x = n % size, y = Math.floor(n / size)
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (x+dx<0 || x+dx>=size || y+dy<0 || y+dy>=size) continue
          const next = n + dy*size+dx
          if (mask[next] && !seen[next]) { seen[next]=1; component.push(next) }
        }
      }
      if (component.length <= cleanup) for (const n of component) mask[n] = 0
    }
  }
  return new Set(Array.from(mask, (value,i)=>value?i:-1).filter(i=>i>=0))
}

// Shared with the image worker; inject the same density profiles into its scope.
export function processCustomEmblemPixels(rgba, size, mode = 'auto', threshold = 128, profiles = PARTICLE_DENSITY_PROFILES, lineOptions = {}) {
  if (size !== 320 || rgba.length !== size * size * 4) throw new Error('图片数据无效')
  const alpha = new Uint8Array(size * size)
  const lines = mode === 'lineart' ? extractEmblemLines(rgba, size, threshold, lineOptions.lineSource) : null
  let transparent = false
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i] < 128) { transparent = true; break }
  const method = mode === 'auto' ? (transparent ? 'alpha' : 'dark') : mode
  for (let i = 0; i < alpha.length; i++) {
    const j = i * 4
    const light = rgba[j] * .2126 + rgba[j + 1] * .7152 + rgba[j + 2] * .0722
    alpha[i] = rgba[j + 3] >= (method === 'alpha' ? threshold : 64)
      && (method === 'alpha' || (method === 'light' ? light >= threshold : light < threshold)) ? 255 : 0
  }
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && alpha[Math.floor(y) * size + Math.floor(x)] > 0
  const targets = {}
  for (const [density, { pitch }] of Object.entries(profiles)) {
    const points = []
    // Map every contour pixel to its containing lattice cell. Unlike point sampling,
    // this retains thin strokes between lattice centers at every density and crop.
    let lineCells = new Set()
    if (lines) for (let i = 0; i < lines.length; i++) if (lines[i]) {
      lineCells.add(Math.floor(Math.floor(i / size) / pitch) * size + Math.floor((i % size) / pitch))
    }
    if (lines) lineCells = simplifyEmblemLines(lineCells, size, lineOptions.cleanup ?? 2)
    for (let y = pitch / 2, row = 0; y < size; y += pitch, row++) {
      for (let x = pitch / 2, column = 0; x < size; x += pitch, column++) {
        if (lines ? !lineCells.has(row * size + column) : !at(x, y)) continue
        const edge = Boolean(lines) || !at(x - pitch, y) || !at(x + pitch, y) || !at(x, y - pitch) || !at(x, y + pitch)
        points.push({ x: (x - size / 2) / size, y: (y - size / 2) / size,
          kind: edge ? 'skeleton' : 'fill', latticeColumn: column, latticeRow: row, component: 0 })
      }
    }
    targets[density] = points
  }
  if (targets.sparse.length < 4) throw new Error('可用轮廓太少，请调整提取方式、阈值或换一张图片')
  return { version: 1, key: 'custom', label: '自定义徽记', targets }
}

export function validCustomEmblem(value) {
  return value?.version === 1 && ['sparse', 'light', 'standard', 'dense', 'ultra'].every(density => {
    const points = value.targets?.[density]
    return Array.isArray(points) && points.length >= 4 && points.length <= 10000 && points.every(p =>
      Number.isFinite(p.x) && Number.isFinite(p.y) && Math.abs(p.x) <= .5 && Math.abs(p.y) <= .5
      && ['skeleton', 'fill'].includes(p.kind) && Number.isInteger(p.latticeRow) && Number.isInteger(p.latticeColumn))
  })
}

export function defaultEmblemConfiguration(emblems) {
  return { version: 2, hero: null, conversation: emblems.map(({ key, label }) => ({ kind: 'builtin', key, label })) }
}

export function validEmblemConfiguration(value, emblems) {
  const builtinKeys = new Set(emblems.map(e => e.key))
  const custom = e => e?.kind === 'custom' && typeof e.key === 'string' && e.key.length < 100
    && typeof e.label === 'string' && e.label.length <= 100 && validCustomEmblem(e)
  return value?.version === 2 && (value.hero === null || custom(value.hero))
    && Array.isArray(value.conversation) && value.conversation.length >= 1 && value.conversation.length <= 12
    && new Set(value.conversation.map(e => e?.key)).size === value.conversation.length
    && value.conversation.every(e => e?.kind === 'builtin' ? builtinKeys.has(e.key) : custom(e))
}

export function createCustomEmblemStore({ window, emblems = [], preview = () => null, onChange = () => {} }) {
  const api = '/prts-theme-api/emblems'
  const defaults = () => defaultEmblemConfiguration(emblems)
  let current = defaults(), revision = -1, disposed = false, events, refreshing = null, announced = -1, reconnectTimer
  const subscribers = new Set(), controller = new window.AbortController()
  const request = async (path, data, signal = controller.signal) => {
    const response = await window.fetch(`${api}${path}`, { credentials:'same-origin', signal,
      ...(data === undefined ? {} : {method:'POST',headers:{'content-type':'application/json','x-prts-request':'1'},body:JSON.stringify(data)}) })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || '无法连接徽记服务')
    return result
  }
  const accept = state => {
    if (disposed || state.revision <= revision) return
    if (!validEmblemConfiguration(state.configuration,emblems)) throw new Error('徽记配置无效')
    const previous = new Map([current.hero,...current.conversation].filter(Boolean).map(e=>[e.key,e]))
    const reuse = entry => {
      const old = entry && previous.get(entry.key)
      return old && entry.draftId && old.draftId === entry.draftId && old.label === entry.label ? old : entry
    }
    state.configuration.hero = reuse(state.configuration.hero)
    state.configuration.conversation = state.configuration.conversation.map(reuse)
    revision = state.revision; current = state.configuration
    onChange(current); for (const fn of subscribers) fn(current)
  }
  const refresh = () => refreshing ||= request('/configuration').then(accept).finally(()=>{refreshing=null;if(!disposed && announced>revision) { announced=-1; refresh().catch(()=>{}) }})
  const connect = () => {
    if (disposed || !window.EventSource) return
    events?.close()
    events = new window.EventSource(`${api}/events`)
    events.onmessage = event => {
      try { announced=JSON.parse(event.data).revision;if(announced>revision)refresh().catch(()=>{}) } catch {}
    }
    events.onerror = () => {
      if (disposed) return
      events.close();window.clearTimeout(reconnectTimer);reconnectTimer=window.setTimeout(connect,3000)
    }
  }
  const ready = refresh().catch(()=>{}).then(connect)
  const focus = () => { if (!disposed) refresh().catch(()=>{}) }
  window.addEventListener('focus',focus)
  return {
    ready, defaults, preview, get: () => current,
    subscribe(fn) { subscribers.add(fn); fn(current); return () => subscribers.delete(fn) },
    async save(value) {
      if (!validEmblemConfiguration(value,emblems)) throw new Error('徽记数据无效')
      if (revision < 0) await refresh()
      const ref = entry => entry && ({kind:entry.kind,key:entry.key,label:entry.label,...(entry.draftId?{draftId:entry.draftId}:{})})
      const configuration = {version:2,hero:ref(value.hero),conversation:value.conversation.map(ref)}
      try { accept(await request('/configuration',{configuration,revision})) }
      catch(error) { await refresh().catch(()=>{}); throw error }
    },
    exportAsset: id => request(`/draft/${encodeURIComponent(id)}/export`),
    importAsset: (asset,signal) => request('/import',asset,signal),
    getDraft: id => request(`/draft/${encodeURIComponent(id)}`),
    async process({file,draftId,params},signal) {
      let image
      if (file) image = await new Promise((resolve,reject)=>{
        const reader = new window.FileReader()
        reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('图片读取失败'))
        reader.readAsDataURL(file)
      })
      return request('/preview',{image,draftId,params,label:file?.name},signal)
    },
    dispose() { disposed=true; controller.abort(); window.clearTimeout(reconnectTimer);events?.close();subscribers.clear();window.removeEventListener('focus',focus) },
  }
}

export function customEmblemMarkup() {
  return `<section data-prts-custom-emblem>
    <header><strong>徽记管理</strong><small>新会话与正文分别设置，可在任意会话中让 AI 调整，设置在当前 DSH 实例共享</small></header>
    <div data-prts-emblem-hero-panel><h4>新会话徽记</h4><div data-prts-emblem-hero-row></div></div>
    <div><h4>正文轮换徽记</h4><small>按列表顺序随正文滚动轮换，可混合使用内置与上传的图片，最多 12 张。长按徽记选项任意位置拖动排序，松开保存。</small>
      <ol data-prts-emblem-list></ol>
      <div data-prts-emblem-actions><button type="button" data-prts-emblem-add>新增徽记</button><button type="button" data-prts-emblem-reset-list>恢复内置列表</button></div>
    </div>
    <div data-prts-emblem-workspace hidden>
      <strong data-prts-emblem-target></strong>
      <label>上传替换图片<input type="file" accept="image/png,image/jpeg,image/webp" data-prts-emblem-file></label>
      <small>支持 PNG、WebP、JPEG，最大 8 MB / 1600 万像素。透明底标志和黑白剪影效果更好。</small>
      <label>或导入徽记素材包<input type="file" accept=".prts-emblem.json,application/json" data-prts-emblem-import></label>
      <small>导入 .prts-emblem.json 可恢复原图和调整参数，预览后再应用。</small>
      <div data-prts-emblem-editor hidden>
        <label>提取方式<select data-prts-emblem-mode><option value="auto">自动识别</option><option value="alpha">透明轮廓</option><option value="dark">保留暗部</option><option value="light">保留亮部</option><option value="lineart">线稿轮廓</option></select></label>
        <small>线稿模式提取轮廓；阈值越高，保留的细节越少。彩色原图建议先由 AI 简化背景与纹理。</small>
        <div data-prts-emblem-line-options hidden>
          <label>线稿来源<select data-prts-emblem-lineSource><option value="edges">彩色图提轮廓</option><option value="ink">纯线稿提笔画</option></select></label>
          <label>去除碎线<input type="range" min="0" max="12" step="1" value="2" data-prts-emblem-cleanup></label>
          <small>数值越大，去掉的孤立碎线越多；五官小细节丢失时可降到 0。</small>
        </div>
        <label>阈值<input type="range" min="1" max="254" value="128" data-prts-emblem-threshold></label>
        <label>缩放与留白<input type="range" min="0.5" max="2" step="0.05" value="0.85" data-prts-emblem-zoom></label>
        <label>水平裁剪<input type="range" min="-0.5" max="0.5" step="0.025" value="0" data-prts-emblem-x></label>
        <label>垂直裁剪<input type="range" min="-0.5" max="0.5" step="0.025" value="0" data-prts-emblem-y></label>
      </div>
      <canvas width="280" height="280" data-prts-emblem-preview aria-label="徽记粒子预览" hidden></canvas>
      <div data-prts-emblem-actions><button type="button" data-prts-emblem-apply disabled>应用到此处</button><button type="button" data-prts-emblem-cancel>取消编辑</button></div>
    </div>
    <p role="status" aria-live="polite" data-prts-emblem-status>正在读取徽记设置…</p>
  </section>`
}

export function mountCustomEmblemEditor({ panel, window, store }) {
  const root = panel?.querySelector('[data-prts-custom-emblem]')
  if (!root || !store) return { dispose() {} }
  const get = suffix => root.querySelector(`[data-prts-emblem-${suffix}]`)
  const fileInput = get('file'), canvas = get('preview'), status = get('status')
  let file, draft, processingController, sourceDraftId, timer, generation = 0, disposed = false, saving = false
  let destination = null, previewValue = null, loaded = false, reorder
  const draw = (value, pointer) => {
    canvas.hidden = !value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 280, 280)
    ctx.fillStyle = '#0d1114'; ctx.fillRect(0, 0, 280, 280)
    ctx.fillStyle = '#edf1f2'
    for (const point of value?.targets.standard ?? []) {
      let x = 140 + point.x * 250, y = 140 + point.y * 250
      if (pointer) {
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy)
        if (distance > 0 && distance < 48) { const shift = (48 - distance) * .35; x += dx / distance * shift; y += dy / distance * shift }
      }
      ctx.fillRect(x, y, point.kind === 'skeleton' ? 2 : 1.5, point.kind === 'skeleton' ? 2 : 1.5)
    }
  }
  const stop = () => { processingController?.abort(); processingController = undefined }
  const process = async () => {
    get('line-options').hidden = get('mode').value !== 'lineart'
    if ((!file && !sourceDraftId) || disposed) return
    const token = ++generation
    stop(); draft = null; get('apply').disabled = true
    status.textContent = '正在处理图片…'
    processingController = new window.AbortController()
    try {
      const result = await store.process({file,draftId:file?undefined:sourceDraftId,params:{mode:get('mode').value,lineSource:get('lineSource').value,cleanup:Number(get('cleanup').value),threshold:Number(get('threshold').value),zoom:Number(get('zoom').value),x:Number(get('x').value),y:Number(get('y').value)}},processingController.signal)
      if (disposed || token !== generation) return
      draft = {...result.value,draftId:result.draftId,label:result.label}
      draw(draft); get('apply').disabled = saving
      status.textContent = `标准密度预览：${draft.targets.standard.length} 个粒子 · 尚未应用，可移动鼠标查看扰动`
    } catch(error) {
      if (disposed || token !== generation) return
      status.textContent = error.message || '图片处理失败';draw(null)
    }
  }
  const importAsset = async input => {
    const selected=input.files?.[0]
    if (!selected) return
    input.value=''
    const token=++generation
    stop();window.clearTimeout(timer);draft=null;get('apply').disabled=true
    status.textContent='正在导入徽记素材…'
    processingController=new window.AbortController()
    const signal=processingController.signal
    try {
      if(selected.size>12*1024*1024)throw new Error('徽记素材包不能超过 12 MB')
      let asset
      try {asset=JSON.parse(await selected.text())}catch{throw new Error('无法读取徽记素材包，请选择导出的 .prts-emblem.json 文件')}
      if(disposed || token!==generation)return
      const result=await store.importAsset(asset,signal)
      if(disposed || token!==generation)return
      file=null;fileInput.value='';sourceDraftId=result.draftId
      draft={...result.value,draftId:result.draftId,label:result.label}
      for(const [key,value] of Object.entries({lineSource:'edges',cleanup:2,...result.params}))get(key).value=String(value)
      get('line-options').hidden = get('mode').value !== 'lineart'
      get('editor').hidden=false;draw(draft);get('apply').disabled=saving
      status.textContent='素材已导入预览，可继续调整；点击“应用到此处”才会保存'
    }catch(error){if(!disposed && token===generation)status.textContent=error.message}
  }
  const change = event => {
    if (saving) return
    if(event.target===get('import')) {
      if(event.type==='change')void importAsset(event.target)
      return
    }
    if (event.target === fileInput) {
      if (event.type !== 'change') return
      const next = fileInput.files?.[0]
      if (!next) return
      if (!['image/png','image/jpeg','image/webp'].includes(next.type) || next.size > 8 * 1024 * 1024) {
        ++generation; stop(); window.clearTimeout(timer); file = null; draft = null
        get('apply').disabled = true; get('editor').hidden = true; draw(previewValue)
        status.textContent = '请选择不超过 8 MB 的 PNG、WebP 或 JPEG 图片'; fileInput.value = ''; return
      }
      file = next; get('editor').hidden = false
      process()
    } else if (event.target.closest('[data-prts-emblem-editor]')) {
      window.clearTimeout(timer); ++generation; stop(); draft = null; get('apply').disabled = true
      timer = window.setTimeout(process, 140)
    }
  }
  const cancel = () => {
    ++generation; stop(); window.clearTimeout(timer)
    file = null; draft = null; sourceDraftId = null; previewValue = null; destination = null; fileInput.value = ''
    get('import').value = ''
    get('editor').hidden = true; get('workspace').hidden = true; get('apply').disabled = true; draw(null)
  }
  const entryPreview = entry => entry?.kind === 'custom' ? entry : store.preview(entry)
  const button = (text, action, index, disabled = false) => {
    const el = window.document.createElement('button')
    el.type = 'button'; el.textContent = text; el.dataset.emblemAction = action
    if (index !== undefined) el.dataset.emblemIndex = String(index)
    el.disabled = disabled || saving || !loaded
    return el
  }
  const thumbnail = entry => {
    const element = window.document.createElement('canvas'); element.width = element.height = 64
    element.setAttribute('aria-hidden', 'true')
    const ctx = element.getContext('2d'); const value = entryPreview(entry)
    if (ctx) { ctx.fillStyle = '#0d1114'; ctx.fillRect(0,0,64,64); ctx.fillStyle = '#edf1f2'
      for (const p of value?.targets?.standard ?? []) ctx.fillRect(32+p.x*58,32+p.y*58,1,1)
    }
    return element
  }
  const renderList = () => {
    reorder?.cancel()
    const state = store.get()
    const hero = get('hero-row'); hero.replaceChildren()
    const name = window.document.createElement('span'); name.textContent = state.hero?.label || '内置罗德岛徽记'
    hero.append(thumbnail(state.hero),name,button('预览 / 替换','hero'),button('恢复内置','reset-hero',undefined,!state.hero))
    if(state.hero?.draftId)hero.append(button('导出素材','export-hero'))
    const list = get('list'); list.replaceChildren()
    state.conversation.forEach((entry,index) => {
      const row = window.document.createElement('li'); row.dataset.emblemKey = entry.key
      const label = window.document.createElement('span'); label.textContent = `${index+1}. ${entry.label}`
      const actions = window.document.createElement('div'); actions.setAttribute('data-prts-emblem-actions','')
      actions.append(button('预览 / 替换','edit',index),button('删除','delete',index,state.conversation.length===1))
      if(entry.draftId)actions.append(button('导出素材','export',index))
      const handle = window.document.createElement('button')
      handle.type='button';handle.setAttribute('data-prts-emblem-reorder','')
      handle.setAttribute('aria-label',`调整 ${entry.label} 的顺序`);handle.setAttribute('aria-pressed','false')
      handle.title='长按拖动；键盘按空格开始，方向键调整，回车保存'
      handle.disabled=saving || !loaded || state.conversation.length<2
      handle.append(thumbnail(entry))
      row.append(handle,label,actions); list.append(row)
    })
    get('add').disabled = saving || !loaded || state.conversation.length >= 12
    get('reset-list').disabled = saving || !loaded
  }
  const startEdit = async target => {
    cancel(); destination = target
    const state = store.get()
    const entry = target === 'hero' ? state.hero : target === 'new' ? null : state.conversation[target]
    previewValue = target === 'new' ? null : entryPreview(entry)
    get('target').textContent = target === 'hero' ? '编辑新会话徽记' : target === 'new' ? '新增正文轮换徽记' : `替换正文第 ${target+1} 张徽记`
    get('workspace').hidden = false
    for (const [key,value] of Object.entries({mode:'auto',lineSource:'edges',cleanup:'2',threshold:'128',zoom:'0.85',x:'0',y:'0'})) get(key).value = value
    get('line-options').hidden = true
    draw(previewValue)
    status.textContent = '上传图片或导入徽记素材包后可调整并预览，点击“应用到此处”才会保存'
    get('workspace').scrollIntoView?.({block:'nearest'})
    if (entry?.draftId) {
      const token = generation
      try {
        const saved = await store.getDraft(entry.draftId)
        if (disposed || token !== generation) return
        sourceDraftId = saved.draftId
        for (const [key,value] of Object.entries({lineSource:'edges',cleanup:2,...saved.params})) get(key).value = String(value)
        get('line-options').hidden = get('mode').value !== 'lineart'
        get('editor').hidden = false
        status.textContent = '可继续调整原图参数，或上传替换图片；应用后才会保存'
      } catch(error) { if (!disposed && token === generation) status.textContent = error.message }
    }

  }
  const unsubscribe = store.subscribe(() => {
    if (destination !== null && !saving) { cancel();status.textContent='徽记设置已在其他页面或会话更新，请重新选择要编辑的徽记' }
    renderList()
  })
  store.ready.then(() => { if (!disposed) { loaded = true; renderList(); status.textContent = '新会话与正文徽记独立保存；正文至少保留一张' } })
  const persist = async value => {
    saving = true
    for (const input of root.querySelectorAll('input,select,button')) input.disabled = true
    try {
      await store.save(value)
      if (disposed) return
      cancel(); status.textContent = '已保存徽记设置 · 刷新后仍然保留'
    } catch (error) { if (!disposed) status.textContent = `${error.message}，原徽记保持不变` }
    finally {
      saving = false
      if (!disposed) {
        for (const input of root.querySelectorAll('input,select,button')) input.disabled = false
        renderList(); get('apply').disabled = !draft
      }
    }
  }
  const click = async event => {
    const target = event.target.closest('button')
    if (!target || target.disabled || saving || !loaded || reorder?.active) return
    if (target.hasAttribute('data-prts-emblem-cancel')) { cancel(); status.textContent = '已取消编辑，当前徽记保持不变'; return }
    if (target.hasAttribute('data-prts-emblem-add')) { startEdit('new'); return }
    const state = store.get()
    if (target.hasAttribute('data-prts-emblem-reset-list')) { await persist({...state,conversation:store.defaults().conversation}); return }
    if (target.hasAttribute('data-prts-emblem-apply')) {
      if (!draft || destination === null) return
      const value = {...draft,kind:'custom',key:window.crypto.randomUUID(),label:(file?.name || draft.label || '自定义徽记').slice(0,100)}
      if (destination === 'hero') await persist({...state,hero:value})
      else {
        const conversation = [...state.conversation]
        if (destination === 'new') { if (conversation.length >= 12) return; conversation.push(value) }
        else conversation[destination] = value
        await persist({...state,conversation})
      }
      return
    }
    const action = target.dataset.emblemAction, index = Number(target.dataset.emblemIndex)
    if(action==='export-hero'||action==='export') {
      const entry=action==='export-hero'?state.hero:state.conversation[index]
      if(!entry?.draftId)return
      target.disabled=true
      try {
        const asset=await store.exportAsset(entry.draftId)
        if(disposed)return
        const url=window.URL.createObjectURL(new window.Blob([JSON.stringify(asset)],{type:'application/json'}))
        const link=window.document.createElement('a')
        link.href=url;link.download=`${entry.label.replace(/[\\/:*?"<>|\x00-\x1f]/g,'_')}.prts-emblem.json`
        link.hidden=true;root.append(link);link.click();link.remove()
        window.setTimeout(()=>window.URL.revokeObjectURL(url),1000)
        status.textContent='已导出徽记素材包，包含原图和调整参数，可在其他 DSH 中导入'
      }catch(error){if(!disposed)status.textContent=`导出失败：${error.message}`}
      finally{if(!disposed)target.disabled=saving}
      return
    }
    if (action === 'hero') { startEdit('hero'); return }
    if (action === 'reset-hero') { await persist({...state,hero:null}); return }
    if (!Number.isInteger(index) || index < 0 || index >= state.conversation.length) return
    if (action === 'edit') { startEdit(index); return }
    const conversation = [...state.conversation]
    if (action === 'delete' && conversation.length > 1) conversation.splice(index,1)
    else return
    await persist({...state,conversation})
  }
  reorder = mountEmblemReorder({ list:get('list'),window,status,canStart:()=>loaded && !saving && !disposed,
    onStart:cancel,
    onCommit:async (keys,movedKey)=>{
      const state=store.get(), entries=new Map(state.conversation.map(entry=>[entry.key,entry]))
      if(keys.length!==entries.size || keys.some(key=>!entries.has(key))){renderList();return}
      await persist({...state,conversation:keys.map(key=>entries.get(key))})
      const moved=[...get('list').children].find(row=>row.dataset.emblemKey===movedKey)
      moved?.querySelector('[data-prts-emblem-reorder]')?.focus({preventScroll:true})
    },
  })
  const move = event => {
    const box = canvas.getBoundingClientRect()
    draw(draft || previewValue, { x: (event.clientX-box.left)*280/box.width, y: (event.clientY-box.top)*280/box.height })
  }
  const leave = () => draw(draft || previewValue)
  root.addEventListener('change', change)
  root.addEventListener('input', change)
  root.addEventListener('click', click)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerleave', leave)
  return { cancelReorder: () => reorder.cancel(), dispose() {
    disposed = true; reorder.dispose(); ++generation; stop(); window.clearTimeout(timer); unsubscribe()
    root.removeEventListener('change', change); root.removeEventListener('input', change); root.removeEventListener('click', click)
    canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave)
  } }
}
