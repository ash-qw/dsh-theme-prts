import assert from 'node:assert/strict'
import test from 'node:test'
import { createHarnessStatusSource, EMPTY_STATUS, projectHarnessStatus } from '../src/client/status-projection.js'

function store(initial) {
  let value = initial
  const listeners = new Set()
  return {
    getSnapshot: () => value,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set(next) {
      value = next
      for (const listener of listeners) listener()
    },
    listenerCount: () => listeners.size,
  }
}

test('projects only the official connection state', () => {
  assert.deepEqual(EMPTY_STATUS, { connection: 'unknown', connectionLabel: '未知' })
  const state = store('connected')
  assert.deepEqual(projectHarnessStatus({ connection: { state } }), {
    connection: 'connected',
    connectionLabel: '已连接',
  })
  state.set('reconnecting')
  assert.deepEqual(projectHarnessStatus({ connection: { state } }), {
    connection: 'connecting',
    connectionLabel: '连接中',
  })
  state.set('disconnected')
  assert.deepEqual(projectHarnessStatus({ connection: { state } }), {
    connection: 'disconnected',
    connectionLabel: '已断开',
  })
})

test('publishes deduplicated connection changes and disposes subscriptions', () => {
  const state = store('connecting')
  const hostDescription = store(null)
  const updates = []
  const source = createHarnessStatusSource({
    connection: { state, hostDescription },
    onChange: next => updates.push(next),
  })

  assert.deepEqual(updates, [{ connection: 'connecting', connectionLabel: '连接中' }])
  state.set('reconnecting')
  assert.equal(updates.length, 1)
  state.set('connected')
  assert.deepEqual(updates.at(-1), { connection: 'connected', connectionLabel: '已连接' })
  assert.equal(state.listenerCount(), 1)
  assert.equal(hostDescription.listenerCount(), 1)

  source.dispose()
  assert.equal(state.listenerCount(), 0)
  assert.equal(hostDescription.listenerCount(), 0)
})
