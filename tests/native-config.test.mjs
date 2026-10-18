import test from 'node:test'
import assert from 'node:assert/strict'
import { Config } from '../src/index.js'
import { DEFAULT_PREFERENCES } from '../src/client/preferences.js'
test('native Config declares all preferences as dynamically editable fields',()=>{
  for(const [key,value] of Object.entries(DEFAULT_PREFERENCES)) {
    assert.equal(Config.dict[key].meta.volatile,true,key)
    assert.equal(Config.dict[key].meta.default,value,key)
  }
  assert.equal(Config.dict.preferencesInitialized.meta.volatile,true)
  assert.deepEqual(Object.fromEntries(Object.entries(Config({})).map(([key,value])=>[key,value.get()])),{...DEFAULT_PREFERENCES,preferencesInitialized:false})
  assert.throws(()=>Config({enabled:'true'}))
})
