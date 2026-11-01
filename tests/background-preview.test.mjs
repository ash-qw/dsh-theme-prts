import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm,readFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import sharp from 'sharp'
import {BACKGROUND_CANVAS,renderBackgroundPreview,backgroundPreviewTool} from '../src/server/background-preview.js'
import {createBackgroundService} from '../src/server/backgrounds.js'
import {sessionImages} from '../src/server/tools.js'
import {themeToolStatus,THEME_TOOL_POLICY} from '../src/server/theme-tool-status.js'

test('preview canvas tokens match CSS; sRGB overlay uses actual dim in both schemes',async()=>{
  const css=await readFile(new URL('../src/styles/prts.css',import.meta.url),'utf8')
  for(const canvas of Object.values(BACKGROUND_CANVAS))assert.ok(css.includes('--prts-canvas: '+canvas+';'))
  const source=await sharp({create:{width:64,height:64,channels:3,background:{r:200,g:160,b:120}}}).png().toBuffer()
  for(const scheme of ['dark','light']){
    const result=await renderBackgroundPreview(source,{width:64,height:64,scheme,dim:.65,region:null})
    const {data}=await sharp(result.data).removeAlpha().raw().toBuffer({resolveWithObject:true})
    const canvas=BACKGROUND_CANVAS[scheme],rgb=[1,3,5].map(i=>parseInt(canvas.slice(i,i+2),16))
    for(let i=0;i<3;i++)assert.ok(Math.abs(data[i]-([200,160,120][i]*.35+rgb[i]*.65))<=2)
  }
})
test('protected region shifts the preview crop without unbounded intermediate resizing',async()=>{
  const source=await sharp({create:{width:400,height:100,channels:3,background:'#000'}})
    .composite([{input:Buffer.from('<svg width="400" height="100"><rect x="300" width="100" height="100" fill="red"/></svg>')}]).png().toBuffer()
  const options={width:100,height:100,scheme:'dark',dim:0}
  const centered=await renderBackgroundPreview(source,{...options,region:null})
  const protectedImage=await renderBackgroundPreview(source,{...options,region:{x:.75,y:0,width:.25,height:1}})
  assert.equal(centered.crop.left,150);assert.equal(protectedImage.crop.left,300)
  const data=await sharp(protectedImage.data).removeAlpha().raw().toBuffer()
  assert.equal(data[0],255);assert.equal(data[1],0)
})
test('session image listing tracks last appearance, disambiguates same names and excludes visual receipts',()=>{
  const part=(id)=>({type:'image',attachment:{attachmentId:id,name:'scene.png'}})
  const events=[
    {type:'user/message',createdAt:1000,data:{content:[part('old')]}},
    {type:'user/message',createdAt:2000,data:{content:[part('new')]}},
    {type:'tool/call',data:{callId:'preview',name:'prts_background_preview'}},
    {type:'tool/result',data:{message:{toolCallId:'preview',content:[part('receipt')]}}},
  ]
  const agent={session:{snapshotEvents:()=>events}}
  let images=sessionImages(agent)
  assert.deepEqual(images.map(image=>image.attachmentId),['new','old'])
  assert.equal(images[0].latestForName,true);assert.equal(images[1].latestForName,false)
  assert.equal(images[0].lastSeenAt,new Date(2000).toISOString())
  events.push({type:'user/message',createdAt:3000,data:{content:[part('old')]}})
  images=sessionImages(agent)
  assert.equal(images[0].attachmentId,'old');assert.equal(images[0].latestForName,true)
})
test('background preview returns viewable receipts without applying source or preferences',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-bg-preview-'),service=await createBackgroundService(dir)
  t.after(async()=>{await service.dispose();await rm(dir,{recursive:true,force:true})})
  const source=await sharp({create:{width:240,height:120,channels:3,background:'#cccccc'}}).png().toBuffer()
  let id=0;const files=new Map(),attachments={
    readImage:async()=>({data:source}),
    saveFile:async({data,name})=>{const attachmentId=String(++id);files.set(attachmentId,data);return{attachmentId,name,bytes:data.length}},
    saveImage:async({data,name})=>({attachmentId:'image-'+(++id),name,bytes:data.length}),
  }
  const tool=backgroundPreviewTool(service,attachments,()=>({available:true,revision:1,dim:.65}))
  const exec={agent:{session:{snapshotEvents:()=>[{type:'user/message',data:{content:[{type:'image',attachment:{attachmentId:'source'}}]}}]},
    options:{provider:'test',model:'vision'},ctx:{get:name=>name==='llm'?{resolveModelInfo:async()=>({inputModalities:['image']})}:undefined}},signal:new AbortController().signal}
  const result=await tool.execute({attachmentId:'source',width:128,height:64},exec)
  assert.equal(result.applied,false);assert.equal(service.snapshot().revision,0)
  assert.deepEqual(result.previews.map(p=>p.scheme),['dark','light'])
  assert.deepEqual(tool.output.render({},result).map(p=>p.type),['text','file','image','file','image'])
  assert.equal(result.previews[0].dim,.65)
  await assert.rejects(tool.execute({slot:'full'},exec),/尚未/)
  await assert.rejects(tool.execute({attachmentId:'source',slot:'full'},exec),/二选一/)
  await assert.rejects(tool.execute({attachmentId:'source',width:40000},exec),/宽高/)
  await assert.rejects(tool.execute({attachmentId:'source',region:{x:.9,y:0,width:.5,height:1}},exec),/保护区域/)
  await service.save({slot:'full',image:source.toString('base64'),revision:0})
  const saved=await tool.execute({slot:'full',scheme:'dark',dim:.2,width:64,height:64},exec)
  assert.equal(saved.previews.length,1);assert.equal(saved.previews[0].dim,.2);assert.equal(service.snapshot().revision,1)
  const controller=new AbortController();controller.abort()
  await assert.rejects(tool.execute({slot:'full'},{...exec,signal:controller.signal}),{name:'AbortError'})
})
test('status stays read-only and tells agents to request manual activation instead of bypassing it',async()=>{
  let enabled=false
  const tool=themeToolStatus(()=>enabled)
  assert.match(tool.description,/shell/)
  const closed=await tool.execute()
  assert.equal(closed.enabled,false);assert.match(closed.nextAction,/手动/)
  assert.equal(closed.policy,THEME_TOOL_POLICY)
  assert.deepEqual(tool.parameters.properties,{})
  enabled=true;assert.equal((await tool.execute()).enabled,true)
})
