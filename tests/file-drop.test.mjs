import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { mountFileDrop } from '../src/client/file-drop.js'

test('file drops are scoped, validate one file, honor disabled and inert state, and dispose',t=>{
  const dom=new JSDOM('<div id="area"><span></span><input type="file" accept="image/png"></div>')
  t.after(()=>dom.window.close())
  const {document,Event}=dom.window, area=document.querySelector('#area'), input=area.querySelector('input')
  let files, changes=0, errors=[]
  Object.defineProperty(input,'files',{get:()=>files,set:value=>{files=value}})
  input.addEventListener('change',()=>changes++)
  const drop=mountFileDrop({area,input,onError:message=>errors.push(message)})
  const dispatch=(name,data,target=area)=>{const event=new Event(name,{bubbles:true,cancelable:true});Object.defineProperty(event,'dataTransfer',{value:data});target.dispatchEvent(event);return event}
  const image={name:'one.png',type:'image/png'}, data={types:['Files'],files:[image]}
  dispatch('dragenter',data);dispatch('dragenter',data,area.querySelector('span'))
  dispatch('dragleave',data,area.querySelector('span'))
  assert.equal(area.hasAttribute('data-prts-drop-active'),true)
  assert.equal(dispatch('drop',data).defaultPrevented,true)
  assert.equal(changes,1);assert.deepEqual(files,[image]);assert.equal(area.hasAttribute('data-prts-drop-active'),false)
  dispatch('drop',{types:['Files'],files:[image,image]})
  dispatch('drop',{types:['Files'],files:[{name:'bad.txt',type:'text/plain'}]})
  assert.equal(changes,1);assert.equal(errors.length,2)
  input.disabled=true;dispatch('drop',data);assert.equal(changes,1)
  input.disabled=false;area.setAttribute('inert','');dispatch('drop',data);assert.equal(changes,1)
  area.removeAttribute('inert')
  assert.equal(dispatch('dragover',{types:['text/plain'],files:[]}).defaultPrevented,false)
  drop.dispose();assert.equal(dispatch('drop',data).defaultPrevented,false);assert.equal(changes,1)
})
