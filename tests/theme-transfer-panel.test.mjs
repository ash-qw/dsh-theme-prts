import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { themeTransferMarkup, mountThemeTransfer } from '../src/client/theme-transfer-panel.js'

test('transfer panel shows pending progress, completion, error and resets for the next operation',async t=>{
  const dom=new JSDOM(themeTransferMarkup()), {window}=dom
  t.after(()=>window.close())
  let resolve, reject, report, downloaded=false
  const transfer={export:(_,progress)=>{report=progress;return new Promise((yes,no)=>{resolve=yes;reject=no})},download:()=>{downloaded=true}}
  const mounted=mountThemeTransfer({panel:window.document,window,transfer})
  t.after(()=>mounted.dispose())
  const get=name=>window.document.querySelector(`[data-prts-transfer-${name}]`)
  const tick=()=>new Promise(resolve=>setTimeout(resolve,20))
  get('export').click();await tick()
  assert.equal(get('progress').hidden,false)
  assert.equal(get('close').disabled,true)
  assert.equal(window.document.querySelector('[data-prts-transfer-card=export]').hasAttribute('data-prts-transfer-active'),true)
  report({value:.5,label:'正在读取背景…'})
  assert.equal(get('bar').value,.45)
  resolve({});await tick()
  assert.equal(downloaded,true)
  assert.equal(get('bar').value,1)
  assert.equal(window.document.querySelector('[data-prts-transfer-card=export]').hasAttribute('data-prts-transfer-active'),false)
  assert.equal(get('close').disabled,false)
  get('export').click();await tick()
  assert.equal(get('bar').hasAttribute('value'),false)
  reject(Error('模拟导出失败'));await tick()
  assert.equal(get('progress').hidden,true)
  assert.match(get('status').textContent,/模拟导出失败/)
  assert.equal(get('export').disabled,false)
})

test('cancel stays busy until rollback settles and never downloads a cancelled export',async t=>{
  const dom=new JSDOM(themeTransferMarkup()), {window}=dom
  t.after(()=>window.close())
  let finish, signal, downloads=0
  const transfer={export:(_,progress,input)=>{signal=input;return new Promise(resolve=>{finish=resolve})},download:()=>downloads++}
  const mounted=mountThemeTransfer({panel:window.document,window,transfer})
  t.after(()=>mounted.dispose())
  const get=name=>window.document.querySelector(`[data-prts-transfer-${name}]`)
  const tick=()=>new Promise(resolve=>setTimeout(resolve,20))
  get('export').click();await tick()
  assert.equal(get('stop').disabled,false)
  get('stop').click()
  assert.equal(signal.aborted,true)
  assert.equal(get('stop').disabled,true)
  assert.equal(get('close').disabled,true)
  finish({});await tick()
  assert.equal(downloads,0)
  assert.match(get('status').textContent,/已取消/)
  assert.equal(get('close').disabled,false)
  assert.equal(get('stop').hidden,true)
})


test('import card stays highlighted while choosing a file and resets on picker cancellation',t=>{
  const dom=new JSDOM(themeTransferMarkup()), {window}=dom
  t.after(()=>dom.window.close())
  const mounted=mountThemeTransfer({panel:window.document,window,transfer:{}})
  t.after(()=>mounted.dispose())
  const card=window.document.querySelector('[data-prts-transfer-card=import]')
  window.document.querySelector('[data-prts-transfer-choose]').click()
  assert.equal(card.hasAttribute('data-prts-transfer-active'),true)
  window.document.querySelector('[data-prts-transfer-file]').dispatchEvent(new window.Event('cancel',{bubbles:true}))
  assert.equal(card.hasAttribute('data-prts-transfer-active'),false)
})
