import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { opacityDialMarkup, mountOpacityDials } from '../src/client/opacity-dial.js'
import { DEFAULT_PREFERENCES, normalizePreferences } from '../src/client/preferences.js'

test('opacity defaults and normalization preserve existing material strengths', () => {
  const defaults = normalizePreferences({})
  assert.equal(defaults.sidebarOpacity,.06);assert.equal(defaults.railOpacity,.3);assert.equal(defaults.bakerOpacity,.5)
  const normalized = normalizePreferences({sidebarOpacity:-1,railOpacity:2,bakerOpacity:NaN})
  assert.equal(normalized.sidebarOpacity,0);assert.equal(normalized.railOpacity,1);assert.equal(normalized.bakerOpacity,.5)
})
test('dial supports exact entry, keyboard, preview without writes and cancel rollback', () => {
  const dom = new JSDOM(opacityDialMarkup()), w = dom.window, section = w.document.body, changes = []
  const dials = mountOpacityDials({section,window:w,onChange:(...args)=>changes.push(args)})
  dials.update({...DEFAULT_PREFERENCES,backgroundMode:'full'}, {full:{id:'test'}})
  const svg = section.querySelector('svg'), input = section.querySelector('input')
  svg.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}))
  assert.deepEqual(changes.pop(),['sidebarOpacity',.05])
  input.value='32';input.dispatchEvent(new w.Event('change'))
  assert.deepEqual(changes.pop(),['sidebarOpacity',.68])
  svg.getBoundingClientRect = ()=>({left:0,top:0,width:200,height:200})
  const pointer = (type, props) => { const e=new w.Event(type);Object.assign(e,{pointerId:1,button:0,...props});svg.dispatchEvent(e) }
  pointer('pointerdown',{clientX:180,clientY:100})
  assert.equal(changes.length,0)
  assert.notEqual(input.value,'32')
  pointer('pointercancel',{})
  assert.equal(input.value,'32');assert.equal(changes.length,0)
  assert.equal(w.document.documentElement.style.getPropertyValue('--prts-sidebar-opacity'),'68%')
  pointer('pointerdown',{clientX:180,clientY:100});pointer('pointerup',{})
  assert.equal(changes.length,1)
  dials.update({...DEFAULT_PREFERENCES,backgroundMode:'off'}, {})
  assert.equal(section.querySelector('fieldset').hidden,true)
  dials.dispose();dom.window.close()
})
