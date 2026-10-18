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
