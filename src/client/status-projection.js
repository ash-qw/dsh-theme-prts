export const EMPTY_STATUS = Object.freeze({
  connection: 'unknown',
  connectionLabel: '未知',
})

const CONNECTION_LABELS = Object.freeze({
  connected: '已连接',
  connecting: '连接中',
  disconnected: '已断开',
  unknown: '未知',
})

function snapshotOf(source) {
  try {
    return source?.getSnapshot?.()
  } catch {
    return undefined
  }
}

function subscribeTo(source, listener) {
  try {
    return typeof source?.subscribe === 'function' ? source.subscribe(listener) : () => {}
  } catch {
    return () => {}
  }
}

function connectionState(connection) {
  if (!connection) return 'unknown'
  const stateSource = connection.state ?? connection.status
  const state = snapshotOf(stateSource)
  if (state === 'connected') return 'connected'
  if (state === 'connecting' || state === 'reconnecting') return 'connecting'
  if (state === 'disconnected') return 'disconnected'
  if (connection.hostDescription?.getSnapshot) {
    return snapshotOf(connection.hostDescription) ? 'connected' : 'connecting'
  }
  return 'unknown'
}

export function projectHarnessStatus({ connection } = {}) {
  const connectionValue = connectionState(connection)
  return {
    connection: connectionValue,
    connectionLabel: CONNECTION_LABELS[connectionValue],
  }
}

function equalStatus(previous, next) {
  return previous?.connection === next.connection
    && previous?.connectionLabel === next.connectionLabel
}

export function createHarnessStatusSource({ connection, onChange }) {
  let disposed = false
  let lastStatus
  const stops = []

  function publish() {
    if (disposed) return
    const nextStatus = projectHarnessStatus({ connection })
    if (equalStatus(lastStatus, nextStatus)) return
    lastStatus = nextStatus
    onChange(nextStatus)
  }

  stops.push(subscribeTo(connection?.hostDescription, publish))
  stops.push(subscribeTo(connection?.state ?? connection?.status, publish))
  publish()

  return {
    refresh: publish,
    dispose() {
      disposed = true
      for (const stop of stops.splice(0).reverse()) stop()
    },
  }
}
