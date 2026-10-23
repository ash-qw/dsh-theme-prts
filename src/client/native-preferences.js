import { DEFAULT_PREFERENCES, PRTS_STORAGE_KEY, loadPreferences, normalizePreferences } from './preferences.js'

// Host snapshots are authoritative. This cache must never become a migration source.
const NATIVE_CACHE_KEY = 'dsh.ui.prts.host-cache.v1'
export function createNativePreferences({ storage, onChange }) {
  let current = loadPreferences(storage)
  let legacy = null
  try {
    const raw = JSON.parse(storage?.getItem(PRTS_STORAGE_KEY) || 'null')
    if (raw && Number.isInteger(raw.version) && raw.version >= 1 && raw.version <= 12) legacy = normalizePreferences(raw)
  } catch {}
  try {
    const cache = JSON.parse(storage?.getItem(NATIVE_CACHE_KEY) || 'null')
    if (cache) { current = normalizePreferences(cache); legacy = null }
  } catch {}
  let form, unsubscribe, disposed = false, busy = false, revision = 0
  let pending = {}, inFlight = {}, failed = {}, phase = 'idle', migrationAttempted = false
  const emit = () => { if (!disposed) onChange(current, { phase, revision: ++revision }) }
  const cache = value => { try { storage?.setItem(NATIVE_CACHE_KEY, JSON.stringify(value)) } catch {} }
  const snapshot = () => { try { return form?.getSnapshot() } catch { return undefined } }
  const writable = s => s?.status === 'ready' && s.writable && s.mode !== 'memory'
  function receive() {
    if (disposed) return
    const s = snapshot()
    if (s?.status !== 'ready') { emit(); return }
    const host = normalizePreferences(s.value)
    if (!s.value?.preferencesInitialized && legacy && !migrationAttempted && writable(s)) {
      migrationAttempted = true
      pending = { ...legacy, ...pending }
    }
    // Materialize the old shared sidebar values once, so later left-side edits
    // cannot change a right-side preference that was never written by the Host.
    if (s.value?.preferencesInitialized && writable(s)) {
      for (const key of ['rightSidebarOpacity', 'rightSidebarBlur']) {
        if (!Object.hasOwn(s.value, key) && !Object.hasOwn(pending, key) && !Object.hasOwn(inFlight, key) && !Object.hasOwn(failed, key)) pending[key] = host[key]
      }
    }
    current = normalizePreferences({ ...host, ...inFlight, ...pending })
    if (s.value?.preferencesInitialized) {
      legacy = null
      cache(host)
      // Once the Host has settings, an obsolete browser must not re-migrate them.
      try { storage?.removeItem(PRTS_STORAGE_KEY) } catch {}
    }
    emit()
    void flush()
  }
  async function flush() {
    if (disposed || busy || !Object.keys(pending).length) return
    const s = snapshot()
    if (!writable(s)) { failed = { ...failed, ...pending }; pending = {}; phase = 'error'; emit(); return }
    busy = true
    const patch = pending
    inFlight = patch
    pending = {}
    phase = 'saving'; emit()
    try {
      const ops = Object.entries(patch).map(([key, value]) => ({ op: 'set', path: [key], value }))
      ops.push({ op: 'set', path: ['preferencesInitialized'], value: true })
      // Fixed revision: conflicts are recovered by DSH, never blindly replayed.
      const accepted = await form.mutate(ops, s.revision)
      if (disposed) return
      if (accepted !== true) throw Error('Host refused settings mutation')
      for (const key of Object.keys(patch)) delete failed[key]
      phase = Object.keys(failed).length ? 'error' : 'saved'
    } catch {
      if (disposed) return
      failed = { ...failed, ...patch }
      for (const key of Object.keys(pending)) delete failed[key]
      phase = 'error'
    } finally {
      busy = false
      inFlight = {}
      if (!disposed) receive()
    }
  }
  return {
    get value() { return current },
    checkReadable() {
      const s = snapshot()
      if (disposed || s?.status !== 'ready') throw Error('请等待 DSH 设置加载完成')
      if (busy || Object.keys(pending).length || Object.keys(failed).length) throw Error('请先等待当前设置保存成功')
      return s.revision
    },
    checkWritable() {
      const revision = this.checkReadable()
      if (!writable(snapshot())) throw Error('当前连接无法保存主题设置')
      return revision
    },
    async replace(next, expectedRevision) {
      this.checkWritable()
      const s = snapshot()
      if (s.revision !== expectedRevision) throw Error('设置已在其他页面更新，请重新导入')
      const normalized = normalizePreferences(next)
      busy = true
      phase = 'saving'; emit()
      try {
        const ops = Object.entries(normalized).map(([key, value]) => ({ op: 'set', path: [key], value }))
        ops.push({ op: 'set', path: ['preferencesInitialized'], value: true })
        if (await form.mutate(ops, s.revision) !== true) throw Error('DSH 未接受导入设置，请重试')
        phase = 'saved'
      } catch (error) {
        phase = 'error'
        throw error
      } finally {
        busy = false
        receive()
      }
    },
    bind(next) {
      unsubscribe?.(); form = next
      unsubscribe = form.subscribe(receive)
      receive()
      return () => { unsubscribe?.(); unsubscribe = null; form = null }
    },
    update(next) {
      if (disposed) return
      const normalized = normalizePreferences(next)
      for (const key of Object.keys(DEFAULT_PREFERENCES)) {
        if (normalized[key] !== current[key]) { pending[key] = normalized[key]; delete failed[key] }
      }
      if (!Object.keys(pending).length) return
      current = normalized
      phase = 'saving'; emit()
      void flush()
    },
    retry() { pending = { ...failed, ...pending }; failed = {}; void flush() },
    dispose() { disposed = true; unsubscribe?.() },
  }
}
