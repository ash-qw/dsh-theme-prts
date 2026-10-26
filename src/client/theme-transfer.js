import { validBackgroundRegion } from '../shared/background-region.js'
import { DEFAULT_PREFERENCES, normalizePreferences } from './preferences.js'

export function checkTransferCancelled(signal) {
  if (signal?.aborted) throw Object.assign(new Error('操作已取消'), { name: 'AbortError' })
}

export function readTransferFile(window, blob, signal, onProgress, asImage = false) {
  return new Promise((resolve, reject) => {
    checkTransferCancelled(signal)
    const reader = new window.FileReader()
    const cleanup = () => signal?.removeEventListener('abort', abort)
    const abort = () => { reader.abort(); cleanup(); reject(Object.assign(new Error('操作已取消'), { name: 'AbortError' })) }
    reader.onload = () => { cleanup(); resolve(asImage ? String(reader.result).split(',')[1] : reader.result) }
    reader.onerror = () => { cleanup(); reject(Error('无法读取主题文件或图片')) }
    reader.onprogress = onProgress
    signal?.addEventListener('abort', abort, { once: true })
    if (asImage) reader.readAsDataURL(blob)
    else reader.readAsText(blob)
  })
}

export const THEME_PACKAGE_LIMIT = 160 * 1024 * 1024
const transferSlots = ['full', 'sidebar', 'conversation']
const transferRoles = ['user', 'assistant']
const transferBuiltins = ['rhodes-island', 'lungmen', 'penguin-logistics', 'rhine-lab', 'reunion']
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const encodedImage = (value, limit) => typeof value === 'string' && value.length > 0 && value.length <= Math.ceil(limit / 3) * 4 && value.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(value)
const unknownFields = (value, known, prefix) => record(value)
  ? Object.keys(value).filter(key => !known.includes(key)).map(key => `${prefix}.${key}`)
  : []

export function ignoredThemePackageFields(value) {
  const ignored = unknownFields(value.preferences, Object.keys(DEFAULT_PREFERENCES), '设置')
  const assets = value.assets
  if (!assets) return ignored
  ignored.push(...unknownFields(assets, ['backgrounds', 'backgroundRegions', 'avatars', 'emblems'], '素材'))
  ignored.push(...unknownFields(assets.backgrounds, transferSlots, '背景'))
  ignored.push(...unknownFields(assets.backgroundRegions, transferSlots, '背景保护区域'))
  for (const slot of transferSlots) ignored.push(...unknownFields(assets.backgroundRegions?.[slot], ['x', 'y', 'width', 'height'], `背景保护区域.${slot}`))
  ignored.push(...unknownFields(assets.avatars, transferRoles, '头像'))
  for (const role of transferRoles) {
    ignored.push(...unknownFields(assets.avatars?.[role], ['image', 'crop'], `头像.${role}`))
    ignored.push(...unknownFields(assets.avatars?.[role]?.crop, ['zoom', 'x', 'y'], `头像.${role}.crop`))
  }
  const emblems = assets.emblems
  ignored.push(...unknownFields(emblems, ['items', 'hero', 'conversation'], '徽记'))
  for (const [index, item] of (emblems?.items ?? []).entries()) {
    ignored.push(...unknownFields(item, ['format', 'version', 'label', 'params', 'image'], `徽记.items[${index}]`))
    ignored.push(...unknownFields(item?.params, ['mode', 'lineSource', 'cleanup', 'threshold', 'zoom', 'x', 'y'], `徽记.items[${index}].params`))
  }
  ignored.push(...unknownFields(emblems?.hero, ['kind', 'key', 'label', 'asset'], '徽记.hero'))
  for (const [index, entry] of (emblems?.conversation ?? []).entries()) ignored.push(...unknownFields(entry, ['kind', 'key', 'label', 'asset'], `徽记.conversation[${index}]`))
  return ignored
}

export function validateThemePackage(value) {
  if (!record(value) || value.format !== 'prts-theme' || value.version !== 1) throw Error('不支持的主题文件格式或版本')
  if (!record(value.preferences) || !Object.keys(value.preferences).some(key => key !== 'version' && Object.hasOwn(DEFAULT_PREFERENCES, key))) throw Error('主题文件缺少设置')
  if (!Number.isInteger(value.preferences.version) || value.preferences.version < 1 || value.preferences.version > DEFAULT_PREFERENCES.version) throw Error('不支持此设置版本，请更新主题后重试')
  const normalized = normalizePreferences(value.preferences)
  for (const [key, input] of Object.entries(value.preferences)) {
    if (!Object.hasOwn(DEFAULT_PREFERENCES, key) || key === 'version') continue
    if (typeof input !== typeof DEFAULT_PREFERENCES[key] || (typeof input === 'number' && !Number.isFinite(input))) throw Error(`设置 ${key} 的类型无效`)
    // Current-format files must not silently turn malformed settings into defaults.
    if (value.preferences.version === DEFAULT_PREFERENCES.version && normalized[key] !== input) throw Error(`设置 ${key} 的值无效`)
  }
  if (value.assets === undefined) return value
  const a = value.assets
  if (!record(a) || !record(a.backgrounds) || !record(a.avatars) || !record(a.emblems)) throw Error('主题素材数据不完整')
  for (const slot of transferSlots) if (a.backgrounds[slot] !== null && !encodedImage(a.backgrounds[slot], 10 * 1024 * 1024)) throw Error('背景图片数据无效')
  if (a.backgroundRegions !== undefined && (!record(a.backgroundRegions) || transferSlots.some(slot => !validBackgroundRegion(a.backgroundRegions[slot] ?? null)))) throw Error('背景保护区域无效')
  for (const role of transferRoles) {
    const avatar = a.avatars[role]
    if (avatar === null) continue
    const crop = avatar?.crop
    if (!record(avatar) || !encodedImage(avatar.image, 5 * 1024 * 1024) || !record(crop)
      || !Number.isFinite(crop.zoom) || crop.zoom < 1 || crop.zoom > 4
      || !Number.isFinite(crop.x) || crop.x < 0 || crop.x > 1 || !Number.isFinite(crop.y) || crop.y < 0 || crop.y > 1) throw Error('头像数据或裁剪参数无效')
  }
  const { items, hero, conversation } = a.emblems
  if (!Array.isArray(items) || items.length > 13 || !Array.isArray(conversation) || conversation.length < 1 || conversation.length > 12) throw Error('徽记数量无效')
  for (const item of items) {
    if (!record(item) || item.format !== 'prts-emblem' || item.version !== 1 || typeof item.label !== 'string' || !item.label.trim() || item.label.length > 100 || !record(item.params) || !encodedImage(item.image, 8 * 1024 * 1024)) throw Error('徽记素材无效')
  }
  const validEntry = entry => record(entry) && (entry.kind === 'builtin' ? transferBuiltins.includes(entry.key) : entry.kind === 'custom' && Number.isInteger(entry.asset) && entry.asset >= 0 && entry.asset < items.length && typeof entry.label === 'string' && entry.label.length <= 100)
  if ((hero !== null && (!validEntry(hero) || hero.kind !== 'custom')) || !conversation.every(validEntry)) throw Error('徽记引用无效')
  return value
}

export function mergeThemePreferences(current, imported) {
  const normalized = normalizePreferences(imported)
  const patch = Object.fromEntries(Object.keys(DEFAULT_PREFERENCES).filter(key => key !== 'version' && Object.hasOwn(imported, key)).map(key => [key, normalized[key]]))
  return normalizePreferences({ ...current, ...patch, version: DEFAULT_PREFERENCES.version })
}

export function describeThemePackage(value) {
  const count = Object.keys(value.preferences).filter(key => key !== 'version' && Object.hasOwn(DEFAULT_PREFERENCES, key)).length
  if (!value.assets) return `${count} 项主题设置；不包含素材，将保留当前背景、头像和徽记。`
  const a = value.assets
  return `${count} 项主题设置、${transferSlots.filter(k => a.backgrounds[k]).length} 张背景、${transferRoles.filter(k => a.avatars[k]).length} 个头像、${a.emblems.items.length} 个自定义徽记。将替换当前素材及徽记排列，空项恢复为默认。`
}

export function createThemeTransfer({ window, getPreferences, savePreferences, checkWritable, checkExport = checkWritable, themeVersion, onAvatarConfiguration = () => {} }) {
  let busy = false, backup
  const request = async (path, data, signal) => {
    checkTransferCancelled(signal)
    const response = await window.fetch('/prts-theme-api/' + path, { credentials: 'same-origin', signal,
      ...(data === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json', 'x-prts-request': '1' }, body: JSON.stringify(data) }) })
    const result = await response.json()
    if (!response.ok) throw Error(result.error || '无法连接主题素材服务')
    return result
  }
  async function capture(includeAssets, progress = () => {}, signal) {
    checkTransferCancelled(signal)
    progress({ value: 0, label: '正在读取主题设置…' })
    const value = { format: 'prts-theme', version: 1, themeVersion, exportedAt: new Date().toISOString(), preferences: { ...getPreferences() } }
    const states = {}
    if (includeAssets) {
      const backgrounds = {}, backgroundRegions = {}, avatars = {}, items = [], ids = new Map()
      progress({ value: 0.1, label: '正在读取背景…' })
      states.backgrounds = await request('backgrounds/configuration', undefined, signal)
      for (const slot of transferSlots) {
        const entry = states.backgrounds[slot]
        backgroundRegions[slot] = entry?.region ?? null
        backgrounds[slot] = null
        if (entry) {
          if (!/^[a-f0-9-]{36}$/.test(entry.id)) throw Error('背景引用无效')
          const response = await window.fetch('/prts-theme-api/backgrounds/image/' + entry.id, { credentials: 'same-origin', signal })
          if (!response.ok) throw Error('无法导出背景图片')
          backgrounds[slot] = await readTransferFile(window, await response.blob(), signal, undefined, true)
        }
      }
      progress({ value: 0.35, label: '正在读取头像…' })
      states.avatars = await request('avatars/configuration', undefined, signal)
      for (const role of transferRoles) {
        const source = await request('avatars/edit/' + role, undefined, signal)
        if (source.revision !== states.avatars.revision) throw Error('头像已变化，请重新导出')
        avatars[role] = source.image ? { image: source.image, crop: source.crop } : null
      }
      progress({ value: 0.5, label: '正在读取徽记…' })
      states.emblems = await request('emblems/configuration', undefined, signal)
      async function reference(entry) {
        if (!entry) return null
        if (entry.kind === 'builtin') return { kind: 'builtin', key: entry.key, label: entry.label }
        if (!ids.has(entry.draftId)) {
          ids.set(entry.draftId, items.length)
          items.push(await request('emblems/draft/' + encodeURIComponent(entry.draftId) + '/export', undefined, signal))
        }
        return { kind: 'custom', asset: ids.get(entry.draftId), label: entry.label }
      }
      const hero = await reference(states.emblems.configuration.hero), conversation = []
      for (const entry of states.emblems.configuration.conversation) conversation.push(await reference(entry))
      value.assets = { backgrounds, backgroundRegions, avatars, emblems: { items, hero, conversation } }
      progress({ value: 0.85, label: '正在核对素材…' })
      for (const kind of ['backgrounds', 'avatars', 'emblems']) {
        if ((await request(kind + '/configuration', undefined, signal)).revision !== states[kind].revision) throw Error('素材在导出期间发生变化，请重试')
      }
    }
    if (JSON.stringify(value.preferences) !== JSON.stringify(getPreferences())) throw Error('设置在导出期间发生变化，请重试')
    checkTransferCancelled(signal)
    validateThemePackage(value)
    progress({ value: 1, label: '主题数据已就绪' })
    return { value, states }
  }
  async function exclusive(fn) {
    if (busy) throw Error('正在处理主题文件，请稍候')
    busy = true
    try { return await fn() } finally { busy = false }
  }
  function download(value, name = 'theme') {
    const blob = new window.Blob([JSON.stringify(value)], { type: 'application/json' })
    if (blob.size > THEME_PACKAGE_LIMIT) throw Error('主题文件超过 160 MB，请减少素材后重试')
    const url = window.URL.createObjectURL(blob), link = window.document.createElement('a')
    link.href = url; link.download = `prts-${name}-${new Date().toISOString().replace(/[:.]/g, '-')}.prts-theme.json`
    window.document.body.append(link); link.click(); link.remove()
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
  }
  async function apply(value, progress = () => {}, signal) {
    checkTransferCancelled(signal)
    validateThemePackage(value)
    const preferenceRevision = checkWritable()
    const before = await capture(Boolean(value.assets), state => progress({ value: state.value * 0.3, label: '备份：' + state.label }), signal)
    backup = before.value
    progress({ value: 0.3, label: '正在生成导入前备份…' })
    await new Promise(resolve => window.setTimeout(resolve, 0))
    checkTransferCancelled(signal)
    download(backup, 'before-import')
    let completed = 0
    const total = value.assets ? value.assets.emblems.items.length + 7 : 1
    const step = label => progress({ value: 0.35 + 0.65 * completed / total, label })
    const undo = [], revisions = Object.fromEntries(Object.entries(before.states).map(([key, state]) => [key, state.revision]))
    const write = async (kind, data, previous) => {
      checkTransferCancelled(signal)
      // Await writes without aborting: their confirmed revision is needed for rollback.
      const result = await request(kind + '/configuration', { ...data, revision: revisions[kind] })
      revisions[kind] = result.revision
      undo.push(async () => {
        const restored = await request(kind + '/configuration', { ...previous, revision: revisions[kind] })
        revisions[kind] = restored.revision
        if (kind === 'avatars') onAvatarConfiguration(restored)
      })
      // Apply the acknowledged images locally; SSE remains for other pages.
      if (kind === 'avatars') onAvatarConfiguration(result)
    }
    try {
      if (value.assets) {
        const a = value.assets, old = before.value.assets, drafts = []
        // Generate every custom draft before changing the active configuration.
        for (const item of a.emblems.items) {
          step('正在导入徽记素材…')
          checkTransferCancelled(signal)
          drafts.push(await request('emblems/import', item)); completed++
        }
        const entry = (ref, index) => ref === null ? null : ref.kind === 'builtin' ? ref : { kind: 'custom', key: 'import-' + index + '-' + drafts[ref.asset].draftId, label: ref.label, draftId: drafts[ref.asset].draftId }
        const configuration = { version: 2, hero: entry(a.emblems.hero, 'hero'), conversation: a.emblems.conversation.map(entry) }
        for (const slot of transferSlots) { step('正在应用背景…'); await write('backgrounds', { slot, image: a.backgrounds[slot], region: a.backgroundRegions?.[slot] ?? null }, { slot, image: old.backgrounds[slot], region: old.backgroundRegions?.[slot] ?? null }); completed++ }
        for (const role of transferRoles) { step('正在应用头像…'); await write('avatars', { role, image: a.avatars[role]?.image ?? null, crop: a.avatars[role]?.crop }, { role, image: old.avatars[role]?.image ?? null, crop: old.avatars[role]?.crop }); completed++ }
        step('正在应用徽记排列…')
        await write('emblems', { configuration }, { configuration: before.states.emblems.configuration }); completed++
      }
      step('正在保存主题设置…')
      checkTransferCancelled(signal)
      progress({ value: 0.99, label: '正在保存主题设置…', cancellable: false })
      await savePreferences(mergeThemePreferences(before.value.preferences, value.preferences), preferenceRevision)
      progress({ value: 1, label: '主题已保存' })
    } catch (error) {
      progress({ value: null, label: signal?.aborted ? '正在取消，回退素材…' : '导入失败，正在回退素材…', cancellable: false })
      let failures = 0
      for (const restore of undo.reverse()) { try { await restore() } catch { failures++ } }
      if (signal?.aborted && !failures && error.name === 'AbortError') throw Error('操作已取消，已回退已写入的素材。')
      throw Error(`${error.message}。${failures ? '部分素材未能自动恢复。' : '已回退已确认写入的素材。'}若连接中断，请检查实际状态；导入前备份已发起下载，可重新导入恢复。`)
    }
  }
  return {
    export: (includeAssets, progress, signal) => exclusive(async () => { checkExport(); return (await capture(includeAssets, progress, signal)).value }),
    import: (value, progress, signal) => exclusive(() => apply(value, progress, signal)),
    restore: (progress, signal) => exclusive(() => { if (!backup) throw Error('没有可恢复的备份'); return apply(backup, progress, signal) }),
    get hasBackup() { return Boolean(backup) },
    download,
  }
}
