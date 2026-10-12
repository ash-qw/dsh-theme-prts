import test from 'node:test'
import assert from 'node:assert/strict'
import { registerEmblemToolPreview } from '../src/client/emblem-tool-preview.js'

test('native preview seat uses only validated draft IDs and renders saved tool results',()=>{
  let component,options
  const dispose=()=>{}
  const ctx={slots:{inject:(_name,fn)=>fn(),register:(spec,render)=>{options=spec;component=render;return dispose}}}
  const h=(tag,props,...children)=>({tag,props,children})
  assert.equal(registerEmblemToolPreview(ctx,{createElement:h}),dispose)
  assert.equal(options.key,'prts_emblem_preview')
  const render=value=>component({block:{content:[{type:'text',text:JSON.stringify(value)}]}})
  assert.equal(render({draftId:'../../escape'}).tag,'div')
  const node=render({draftId:'abc-123',label:'示例',particles:{standard:1000},previewUrl:'https://untrusted.invalid'})
  assert.equal(node.children[0].props.src,'/prts-theme-api/emblems/draft/abc-123/preview.png')
  assert.match(node.children[1].children[0],/1000/)
})
