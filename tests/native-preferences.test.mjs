import test from 'node:test'
import assert from 'node:assert/strict'
import { createNativePreferences } from '../src/client/native-preferences.js'
import { DEFAULT_PREFERENCES, PRTS_STORAGE_KEY } from '../src/client/preferences.js'
const tick = () => new Promise(resolve => setImmediate(resolve))
function setup(initial = {}, legacy) {
  const data = new Map(legacy ? [[PRTS_STORAGE_KEY, JSON.stringify(legacy)]] : [])
  const storage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k) }
  let snapshot = {status:'ready', writable:true, revision:1, value:{...DEFAULT_PREFERENCES, preferencesInitialized:true,...initial}}
  const listeners = new Set(), writes = [], changes = []
  let reject = false
  const form = {
    getSnapshot: () => snapshot,
    subscribe: fn => { listeners.add(fn); return () => listeners.delete(fn) },
    async mutate(ops, revision) {
      writes.push({ops,revision})
      if(reject || revision !== snapshot.revision) return false
      for(const op of ops) snapshot.value[op.path[0]] = op.value
      snapshot = {...snapshot, revision: snapshot.revision+1}
      for(const fn of listeners) fn()
      return true
    },
  }
  const store = createNativePreferences({storage,onChange:(value,status)=>changes.push({value,status})})
  return {store,form,writes,changes,data,storage, reject:()=>{reject=true}, remote(patch) {snapshot={...snapshot,revision:snapshot.revision+1,value:{...snapshot.value,...patch}};for(const fn of listeners)fn()}, state(patch){snapshot={...snapshot,...patch};for(const fn of listeners)fn()} }
}
test('Host settings override stale local settings without uploading them',async()=>{
  const x=setup({enabled:false},{...DEFAULT_PREFERENCES,enabled:true})
  x.store.bind(x.form);await tick()
  assert.equal(x.store.value.enabled,false);assert.equal(x.writes.length,0)
  assert.equal(x.data.has(PRTS_STORAGE_KEY),false)
})
test('existing Host settings separate right sidebar values from legacy left values',async()=>{
  const x=setup()
  const value={...DEFAULT_PREFERENCES,sidebarOpacity:.22,sidebarBlur:17,preferencesInitialized:true}
  delete value.rightSidebarOpacity
  delete value.rightSidebarBlur
  x.state({value})
  x.store.bind(x.form);await tick()
  assert.equal(x.store.value.rightSidebarOpacity,.22)
  assert.equal(x.store.value.rightSidebarBlur,17)
  assert.deepEqual(x.writes[0].ops.map(op=>op.path[0]),['rightSidebarOpacity','rightSidebarBlur','preferencesInitialized'])
  x.store.update({...x.store.value,sidebarOpacity:.05,sidebarBlur:4});await tick()
  assert.equal(x.store.value.rightSidebarOpacity,.22)
  assert.equal(x.store.value.rightSidebarBlur,17)
})
test('migrates legacy preferences once and persists native cache',async()=>{
  const x=setup({preferencesInitialized:false},{...DEFAULT_PREFERENCES,enabled:true})
  x.store.bind(x.form);await tick()
  assert.equal(x.writes.length,1);assert.equal(x.store.value.enabled,true)
  assert.ok(x.writes[0].ops.some(o=>o.path[0]==='preferencesInitialized'))
  x.remote({enabled:false});await tick();assert.equal(x.store.value.enabled,false)
  assert.equal(x.writes.length,1)
})
test('writes only changed fields and syncs remote updates',async()=>{
  const x=setup();x.store.bind(x.form)
  x.store.update({...x.store.value,enabled:true});await tick()
  assert.deepEqual(x.writes[0].ops.map(o=>o.path[0]),['enabled','preferencesInitialized'])
  assert.equal(x.writes[0].revision,1)
  x.remote({cursor:'system'});assert.equal(x.store.value.cursor,'system')
  assert.equal(x.changes.at(-1).status.phase,'saved')
})
test('failed mutation never automatically replays stale settings',async()=>{
  const x=setup();x.store.bind(x.form);x.reject()
  x.store.update({...x.store.value,enabled:true});await tick()
  assert.equal(x.changes.at(-1).status.phase,'error')
  x.remote({cursor:'system'});await tick();assert.equal(x.writes.length,1)
  x.store.retry();await tick();assert.equal(x.writes.length,2)
  assert.equal(x.writes[1].revision,2)
})
test('loading and memory-only forms cannot report durable save',async()=>{
  const x=setup();x.state({status:'loading'});x.store.bind(x.form)
  x.store.update({...x.store.value,enabled:true});await tick()
  assert.equal(x.writes.length,0);assert.equal(x.changes.at(-1).status.phase,'error')
  x.state({status:'ready',mode:'memory'});x.store.retry();await tick()
  assert.equal(x.writes.length,0)
})
test('fresh profile does not upload default values on startup',async()=>{
  const x=setup({preferencesInitialized:false});x.store.bind(x.form);await tick()
  assert.equal(x.writes.length,0)
  x.store.dispose();x.remote({enabled:true});assert.equal(x.store.value.enabled,false)
})
test('two clients converge without overwriting unrelated fields',async()=>{
  const x=setup()
  const other=createNativePreferences({storage:{getItem:()=>null},onChange(){}})
  x.store.bind(x.form);other.bind(x.form)
  x.store.update({...x.store.value,enabled:true});await tick()
  assert.equal(other.value.enabled,true)
  other.update({...other.value,cursor:'system'});await tick()
  assert.equal(x.store.value.cursor,'system');assert.equal(x.store.value.enabled,true)
  other.dispose()
})
test('browser recreation restores Host settings without local storage',async()=>{
  const x=setup({enabled:true,conversationStyle:'deck-chat'})
  x.store.bind(x.form);x.store.dispose()
  const restarted=createNativePreferences({storage:{getItem:()=>null},onChange(){}})
  restarted.bind(x.form)
  assert.equal(restarted.value.enabled,true)
  assert.equal(restarted.value.conversationStyle,'deck-chat')
  assert.equal(x.writes.length,0);restarted.dispose()
})
test('rapid edits are serialized and newest choice wins',async()=>{
  const x=setup();x.store.bind(x.form)
  const original=x.form.mutate
  let release
  x.form.mutate=async(...args)=>{await new Promise(r=>release=r);return original(...args)}
  x.store.update({...x.store.value,enabled:true})
  x.store.update({...x.store.value,enabled:false})
  release();await tick()
  assert.equal(x.store.value.enabled,false)
  release();await tick()
  assert.equal(x.store.value.enabled,false)
  assert.equal(x.writes.length,2)
  assert.equal(x.changes.at(-1).status.phase,'saved')
})
test('a disconnect during a write reports error and does not replay on reconnect',async()=>{
  const x=setup();x.store.bind(x.form)
  let fail
  x.form.mutate=()=>new Promise((_,reject)=>fail=reject)
  x.store.update({...x.store.value,enabled:true})
  x.state({status:'loading'});fail(Error('offline'));await tick()
  assert.equal(x.changes.at(-1).status.phase,'error')
  x.state({status:'ready'});assert.equal(x.store.value.enabled,false)
})
test('cache records only accepted Host state while a newer edit is pending',async()=>{
  const x=setup();x.store.bind(x.form)
  let release
  x.form.mutate=()=>new Promise(resolve=>release=resolve)
  x.store.update({...x.store.value,enabled:true})
  x.remote({cursor:'system'})
  const cached=JSON.parse(x.data.get('dsh.ui.prts.host-cache.v1'))
  assert.equal(cached.enabled,false);assert.equal(cached.cursor,'system')
  release(false);await tick()
})
test('cache remains readable even when obsolete local settings are malformed',()=>{
  const data={ 'dsh.ui.prts.v1':'{bad', 'dsh.ui.prts.host-cache.v1':JSON.stringify({...DEFAULT_PREFERENCES,enabled:true}) }
  const x=createNativePreferences({storage:{getItem:k=>data[k]},onChange(){}})
  assert.equal(x.value.enabled,true);x.dispose()
})
test('a concurrent first migration wins without being overwritten by older local settings',async()=>{
  const x=setup({preferencesInitialized:false},{...DEFAULT_PREFERENCES,enabled:true,cursor:'system'})
  let finish
  const revisions=[]
  x.form.mutate=(_,revision)=>{revisions.push(revision);return new Promise(resolve=>finish=resolve)}
  x.store.bind(x.form)
  x.remote({preferencesInitialized:true,enabled:false,cursor:'prts'})
  finish(false);await tick()
  assert.equal(x.store.value.enabled,false)
  assert.equal(x.store.value.cursor,'prts')
  assert.deepEqual(revisions,[1])
  assert.equal(x.data.has(PRTS_STORAGE_KEY),false)
})

test('bulk import waits for durable Host acceptance and rejects stale revisions',async()=>{
  const x=setup();x.store.bind(x.form)
  const revision=x.store.checkWritable()
  x.remote({cursor:'system'})
  await assert.rejects(x.store.replace({...x.store.value,glass:'soft'},revision),/其他页面/)
  assert.equal(x.writes.length,0)
  await x.store.replace({...x.store.value,glass:'soft'},x.store.checkWritable())
  assert.equal(x.store.value.glass,'soft')
  x.reject()
  await assert.rejects(x.store.replace({...x.store.value,glass:'clear'},x.store.checkWritable()),/未接受/)
  assert.equal(x.store.value.glass,'soft')
})

test('read-only Host settings can be exported but not imported',()=>{
  const x=setup();x.store.bind(x.form);x.state({writable:false})
  assert.equal(typeof x.store.checkReadable(),'number')
  assert.throws(()=>x.store.checkWritable(),/无法保存/)
})
