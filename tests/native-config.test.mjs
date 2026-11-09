import test from 'node:test'
import assert from 'node:assert/strict'
import { Config } from '../src/index.js'
import { DEFAULT_PREFERENCES, CUSTOM_COLOR_MEMORY_KEYS, normalizePreferences } from '../src/client/preferences.js'
test('native Config declares all preferences as dynamically editable fields',()=>{
  for(const [key,value] of Object.entries(DEFAULT_PREFERENCES)) {
    assert.equal(Config.dict[key].meta.volatile,true,key)
    assert.equal(Config.dict[key].meta.default,(['cornerColorLight','cornerCustomColorLight','cornerColorSource'].includes(key)||key.endsWith('SpineColorLight')||CUSTOM_COLOR_MEMORY_KEYS.includes(key))?undefined:value,key)
  }
  assert.equal(Config.dict.preferencesInitialized.meta.volatile,true)
  assert.deepEqual(normalizePreferences(Object.fromEntries(Object.entries(Config({})).map(([key,value])=>[key,value.get()]))),DEFAULT_PREFERENCES)
  assert.throws(()=>Config({enabled:'true'}))
})

test('Host schema preserves legacy color for both schemes',()=>{
 const host=Object.fromEntries(Object.entries(Config({cornerColor:'#112233',cornerCustomColor:'#445566'})).map(([key,value])=>[key,value.get()]))
 const normalized=normalizePreferences(host)
 assert.equal(normalized.cornerColorLight,'#112233')
 assert.equal(normalized.cornerCustomColorLight,'#445566')
})


test('Host schema leaves custom memories absent so legacy active colors seed them', () => {
  const host = Object.fromEntries(Object.entries(Config({ workspaceSpineColor: '#123abc', workspaceSpineColorLight: '#456def', sessionFlowPalette: 'custom', sessionFlowColorFront: '#abcdef' })).map(([key, value]) => [key, value.get()]))
  for (const key of CUSTOM_COLOR_MEMORY_KEYS) assert.equal(host[key], undefined)
  const normalized = normalizePreferences(host)
  assert.equal(normalized.workspaceSpineCustomColor, '#123abc')
  assert.equal(normalized.workspaceSpineCustomColorLight, '#456def')
  assert.equal(normalized.sessionFlowCustomColorFront, '#abcdef')
})
