import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import sharp from 'sharp'
import { createEmblemService, API, parameters } from '../src/server/emblems.js'
import { emblemTools } from '../src/server/tools.js'
import { registerEmblemApi } from '../src/server/api.js'

async function fixture(t) {
  const directory=await mkdtemp(join(tmpdir(),'prts-service-'))
  t.after(()=>rm(directory,{recursive:true,force:true}))
  const service=await createEmblemService(directory)
  t.after(()=>service.dispose())
  const bytes=await sharp(Buffer.from('<svg width="200" height="200"><rect x="40" y="40" width="120" height="120" fill="black"/></svg>')).png().toBuffer()
  return {directory,service,bytes}
}
test('drafts preserve editable sources; commits persist and reject concurrent stale writes',async t=>{
  const {directory,service,bytes}=await fixture(t)
  const first=await service.preview({bytes,label:'示例'})
  assert.equal(service.snapshot().revision,0)
  const second=await service.preview({baseId:first.id,params:{zoom:1.2}})
  assert.ok(second.value.targets.standard.length>first.value.targets.standard.length)
  assert.equal(second.sourceId,first.sourceId)
  assert.equal((await service.draft(first.id)).params.zoom,.85)
  assert.equal((await service.image(second.id)).subarray(1,4).toString(),'PNG')
  let changes=0;const unsubscribe=service.subscribe(()=>changes++)
  await service.apply({draftId:second.id,target:'hero',revision:0})
  await assert.rejects(service.apply({draftId:first.id,target:'add',revision:0}),/其他会话/)
  assert.equal(service.snapshot().configuration.conversation.length,5)
  const attempts=await Promise.allSettled([service.apply({draftId:first.id,target:'add',revision:1}),service.apply({draftId:first.id,target:'add',revision:1})])
  assert.equal(attempts.filter(v=>v.status==='fulfilled').length,1)
  assert.equal(changes,2);unsubscribe()
  const reopened=await createEmblemService(directory)
  t.after(()=>reopened.dispose())
  assert.equal(reopened.snapshot().revision,2)
  assert.equal(reopened.snapshot().configuration.hero.draftId,second.id)
  assert.equal(reopened.snapshot().configuration.conversation.length,6)
  const edited=await reopened.preview({baseId:second.id,params:{threshold:180}})
  assert.equal(edited.params.zoom,1.2)
})
test('invalid inputs, cancellation and forged entries do not mutate configuration',async t=>{
  const {service,bytes}=await fixture(t)
  assert.throws(()=>parameters({zoom:Infinity}),/范围/)
  assert.throws(()=>parameters({unknown:1}),/范围/)
  await assert.rejects(service.draft('../secret'),/标识/)
  await assert.rejects(service.preview({bytes:Buffer.from('broken')}))
  const cancel=new AbortController();cancel.abort(new Error('取消测试'))
  await assert.rejects(service.preview({bytes},cancel.signal),/取消测试/)
  const d=await service.preview({bytes})
  const state=service.snapshot();state.configuration.hero={...d.value,kind:'custom',key:'x',label:'x',draftId:'unknown'}
  await assert.rejects(service.save(state.configuration,0),/不存在/)
  assert.equal(service.snapshot().revision,0)
  await assert.rejects(service.apply({draftId:d.id,target:'replace',entryKey:'missing',revision:0}),/不存在/)
})
test('native tools read only current-session attachments and support preview, refinement and apply',async t=>{
  const {service,bytes}=await fixture(t)
  let reads=0
  const tools=Object.fromEntries(emblemTools(service,{readImage:async ref=>{reads++;assert.equal(ref.attachmentId,'in-session');return {data:bytes}}}).map(tool=>[tool.name,tool]))
  const exec={agent:{session:{id:'session-a',snapshotEvents:()=>[{type:'user/message',data:{content:[{type:'image',attachment:{attachmentId:'in-session',name:'上传.png',bytes:bytes.length}}]}}]}},signal:new AbortController().signal}
  exec.agent.ctx={get:name=>name==='fs'?{processPathFromHostPath:path=>path}:undefined}
  const initial=await tools.prts_emblem_inspect.execute({},exec)
  assert.equal(initial.images.length,1)
  await assert.rejects(tools.prts_emblem_preview.execute({attachmentId:'other-session'},exec),/没有这张图片/)
  assert.equal(reads,0)
  const first=await tools.prts_emblem_preview.execute({attachmentId:'in-session'},exec)
  assert.equal(first.applied,false)
  const second=await tools.prts_emblem_preview.execute({draftId:first.draftId,params:{zoom:1.3}},exec)
  assert.match(second.previewMarkdown,/!\[粒子徽记预览\]/)
  await tools.prts_emblem_apply.execute({draftId:second.draftId,target:'hero',revision:initial.revision},exec)
  assert.equal(service.snapshot().configuration.hero.label,'上传.png')
})
test('HTTP endpoints require host admission and mutation header; preview and SSE are available to signed-in clients',async t=>{
  const {service,bytes}=await fixture(t)
  let handler
  const dispose=registerEmblemApi({connection:{admit:req=>req.headers.cookie==='signed-in'?{peer:{}}:{rejection:{}}},webServer:{register:route=>{handler=route.handler;return()=>{}}}},service)
  const server=createServer((req,res)=>handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  t.after(async()=>{dispose();server.closeAllConnections();await new Promise(resolve=>server.close(resolve))})
  const base=`http://127.0.0.1:${server.address().port}${API}`,headers={cookie:'signed-in'}
  assert.equal((await fetch(`${base}/configuration`)).status,401)
  assert.equal((await fetch(`${base}/configuration`,{method:'POST',headers,body:'{}'})).status,403)
  const events=await fetch(`${base}/events`,{headers});const reader=events.body.getReader()
  assert.match(new TextDecoder().decode((await reader.read()).value),/"revision":0/)
  const result=await fetch(`${base}/preview`,{method:'POST',headers:{...headers,'x-prts-request':'1'},body:JSON.stringify({image:bytes.toString('base64')})})
  assert.equal(result.status,200);const d=await result.json()
  assert.equal((await fetch(`${base}/draft/${d.draftId}/preview.png`,{headers})).headers.get('content-type'),'image/png')
  await service.apply({draftId:d.draftId,target:'hero',revision:0})
  assert.match(new TextDecoder().decode((await reader.read()).value),/"revision":1/)
  await reader.cancel()
})

test('native tool values are lossless JSON and PNGs uploaded as files are supported',async t=>{
  const {service,bytes}=await fixture(t)
  const tools=emblemTools(service,{async *readFileStream(ref){assert.equal(ref.attachmentId,'file-image');yield bytes}})
  const exec={agent:{session:{snapshotEvents:()=>[{type:'user/message',data:{content:[{type:'file',attachment:{attachmentId:'file-image',name:'上传.png',bytes:bytes.length}}]}}]}}}
  const result=await tools[0].execute({},exec)
  assert.deepEqual(result,JSON.parse(JSON.stringify(result)))
  assert.equal(result.images[0].attachmentKind,'file')
  const preview=await tools[1].execute({attachmentId:'file-image'},exec)
  assert.ok(preview.particles.standard>0)
  assert.deepEqual(preview,JSON.parse(JSON.stringify(preview)))
})

test('visual models receive the preview image while text-only models retain a usable draft',async t=>{
  const {service,bytes}=await fixture(t)
  let saves=0,visual=true
  const tools=emblemTools(service,{
    readImage:async()=>({data:bytes}),
    saveImage:async({data})=>{saves++;assert.equal(data.subarray(1,4).toString(),'PNG');return {attachmentId:'preview-image',mediaType:'image/png',bytes:data.length,width:384,height:384}},
  })
  const exec={agent:{options:{provider:'test',model:'test'},ctx:{get:name=>name==='llm'?{resolveModelInfo:async()=>({inputModalities:visual?['text','image']:['text']})}:undefined},session:{snapshotEvents:()=>[{type:'user/message',data:{content:[{type:'image',attachment:{attachmentId:'input',bytes:bytes.length}}]}}]}}}
  const first=await tools[1].execute({attachmentId:'input'},exec)
  assert.equal(first.imageForModel,true)
  assert.equal(tools[1].output.render({},first)[1].type,'image')
  visual=false
  const second=await tools[1].execute({draftId:first.draftId,params:{zoom:1}},exec)
  assert.equal(second.imageForModel,false)
  assert.equal(tools[1].output.render({},second).length,1)
  assert.equal(saves,1)
})

test('settings can save compact references without resending particle arrays',async t=>{
  const {service,bytes}=await fixture(t)
  const d=await service.preview({bytes})
  const configuration=service.snapshot().configuration
  configuration.hero={kind:'custom',key:'hero-1',label:'我的徽记',draftId:d.id}
  const saved=await service.save(configuration,0)
  assert.equal(saved.configuration.hero.targets.standard.length,d.value.targets.standard.length)
  assert.equal(saved.configuration.hero.label,'我的徽记')
  await assert.rejects(service.save({version:2,hero:null,conversation:[]},1),/配置无效/)
})

test('portable assets restore source, parameters and particle output in another instance without applying',async t=>{
  const origin=await fixture(t),destination=await fixture(t)
  const original=await origin.service.preview({bytes:origin.bytes,label:'可分享的徽记',params:{zoom:1.1,threshold:170,x:.05}})
  const asset=JSON.parse(JSON.stringify(await origin.service.exportAsset(original.id)))
  assert.equal(asset.format,'prts-emblem')
  assert.equal(asset.version,1)
  assert.equal(asset.draftId,undefined)
  const imported=await destination.service.importAsset(asset)
  assert.notEqual(imported.id,original.id)
  assert.deepEqual(imported.params,original.params)
  assert.deepEqual(imported.value.targets,original.value.targets)
  assert.deepEqual(await destination.service.image(imported.id,true),origin.bytes)
  assert.equal(destination.service.snapshot().revision,0)
  await destination.service.apply({draftId:imported.id,target:'hero',revision:0})
  const reopened=await createEmblemService(destination.directory)
  t.after(()=>reopened.dispose())
  const edited=await reopened.preview({baseId:imported.id,params:{zoom:1.3}})
  assert.equal(edited.params.threshold,170)
  assert.equal(edited.params.zoom,1.3)
  assert.equal(reopened.snapshot().configuration.hero.label,original.label)
  for(const bad of [
    {...asset,version:99},{...asset,format:'other'},{...asset,image:'broken'},
    {...asset,image:Buffer.from('not an image').toString('base64')},
    {...asset,params:{zoom:3}},{...asset,label:42},
  ])await assert.rejects(reopened.importAsset(bad))
  assert.equal(reopened.snapshot().revision,1)
})

test('tool-returned image attachments enter the real preview and apply flow without reupload',async t=>{
  const {service,bytes}=await fixture(t)
  const ref={attachmentId:'generated-image',name:'AI线稿.png',mediaType:'image/png',bytes:bytes.length}
  const events=[
    {type:'tool/call',data:{callId:'read',name:'read_image'}},
    {type:'tool/result',data:{message:{toolCallId:'read',content:[{type:'image',attachment:ref}]}}},
    {type:'tool/call',data:{callId:'preview',name:'prts_emblem_preview'}},
    {type:'tool/result',data:{message:{toolCallId:'preview',content:[{type:'image',attachment:{...ref,attachmentId:'rendered-preview'}}]}}},
    {type:'tool/result',data:{message:{isError:true,content:[{type:'image',attachment:{...ref,attachmentId:'failed'}}]}}},
    {type:'assistant/message',data:{message:{content:[{type:'image',attachment:{...ref,attachmentId:'invented'}}]}}},
    {type:'tool/result',data:{message:{content:[{type:'text',text:JSON.stringify({attachment:ref})}]}}},
  ]
  let reads=0
  const tools=emblemTools(service,{readImage:async attachment=>{
    reads++;assert.equal(attachment.attachmentId,ref.attachmentId)
    assert.equal(attachment.origin,undefined);assert.equal(attachment.toolName,undefined)
    return {data:bytes}
  }})
  const exec={agent:{session:{snapshotEvents:()=>events}}}
  const initial=await tools[0].execute({},exec)
  assert.equal(initial.images.length,1)
  assert.equal(initial.images[0].origin,'tool')
  assert.equal(initial.images[0].toolName,'read_image')
  for(const id of ['another-session','rendered-preview','failed','invented'])
    await assert.rejects(tools[1].execute({attachmentId:id},exec),/没有这张图片/)
  assert.equal(reads,0)
  const draft=await tools[1].execute({attachmentId:ref.attachmentId,params:{mode:'lineart'}},exec)
  assert.ok(draft.particles.standard>0)
  assert.equal(service.snapshot().revision,0)
  await tools[2].execute({draftId:draft.draftId,target:'hero',revision:initial.revision},exec)
  assert.equal(service.snapshot().configuration.hero.label,'AI线稿.png')
  const asset=await service.exportAsset(draft.draftId)
  assert.equal(asset.params.mode,'lineart')
  const imported=await service.importAsset(asset)
  assert.deepEqual(imported.value.targets,(await service.draft(draft.draftId)).value.targets)
})

test('line source and cleanup persist through editing and portable assets; older parameters get defaults',async t=>{
  const {service}=await fixture(t)
  const bytes=await sharp(Buffer.from('<svg width="320" height="320"><rect width="320" height="320" fill="white"/><circle cx="160" cy="160" r="100" fill="none" stroke="black" stroke-width="3"/></svg>')).png().toBuffer()
  const d=await service.preview({bytes,params:{mode:'lineart',lineSource:'ink',cleanup:4}})
  const edited=await service.preview({baseId:d.id,params:{threshold:90}})
  assert.equal(edited.params.lineSource,'ink');assert.equal(edited.params.cleanup,4)
  const restored=await service.importAsset(await service.exportAsset(edited.id))
  assert.deepEqual(restored.value.targets,edited.value.targets)
  assert.deepEqual(restored.params,edited.params)
  assert.equal(parameters({}, {mode:'lineart',threshold:128,zoom:1,x:0,y:0}).cleanup,2)
  for(const params of [{cleanup:-1},{cleanup:13},{cleanup:1.5},{lineSource:'unknown'}])assert.throws(()=>parameters(params),/范围/)
})

test('moving the crop preserves particle identity and restores clipped points in every extraction mode',async t=>{
  const {service,bytes}=await fixture(t)
  for(const params of [{mode:'alpha',zoom:.85},{mode:'alpha',zoom:2},{mode:'lineart',lineSource:'edges',cleanup:0,zoom:1.2}]) {
    const original=await service.preview({bytes,params})
    const moved=await service.preview({baseId:original.id,params:{x:.173,y:-.087}})
    const restored=await service.preview({baseId:moved.id,params:{x:0,y:0}})
    assert.deepEqual(restored.value.targets,original.value.targets)
    assert.deepEqual(moved.previewPoints,original.previewPoints.map(p=>({...p,x:p.x+.173,y:p.y-.087})))
    assert.deepEqual(moved.value.targets.standard,moved.previewPoints.filter(p=>Math.abs(p.x)<=.5&&Math.abs(p.y)<=.5))
    for(const [density,points] of Object.entries(original.value.targets)) {
      const shifted=new Map(moved.value.targets[density].map(p=>[`${p.latticeRow}:${p.latticeColumn}`,p]))
      for(const p of points) {
        const x=p.x+.173,y=p.y-.087
        if(Math.abs(x)>.5||Math.abs(y)>.5)continue
        assert.deepEqual(shifted.get(`${p.latticeRow}:${p.latticeColumn}`),{...p,x,y})
      }
    }
  }
})

test('preview requests wait for cancelled workers and queued cancellation does not block the latest parameters',async t=>{
  const {service,bytes}=await fixture(t)
  const active=new AbortController(),queued=new AbortController()
  const first=service.preview({bytes,params:{mode:'lineart'}},active.signal)
  const firstRejected=assert.rejects(first,/取消旧预览/)
  await new Promise(resolve=>setTimeout(resolve,30))
  const skipped=service.preview({bytes,params:{threshold:100}},queued.signal)
  const skippedRejected=assert.rejects(skipped,/取消排队预览/)
  const latest=service.preview({bytes,params:{threshold:190}})
  queued.abort(new Error('取消排队预览'))
  active.abort(new Error('取消旧预览'))
  await Promise.all([firstRejected,skippedRejected])
  assert.equal((await latest).params.threshold,190)
  const results=await Promise.all([service.preview({bytes,params:{threshold:80}}),service.preview({bytes,params:{threshold:170}})])
  assert.deepEqual(results.map(d=>d.params.threshold),[80,170])
})

test('prepared pixels match uncached processing across thresholds, modes and zoom levels',async t=>{
  const {processImage}=await import('../src/server/emblems.js')
  const {bytes}=await fixture(t)
  const first=await processImage(bytes,parameters({}))
  for(const params of [{threshold:190},{mode:'lineart',lineSource:'edges',cleanup:0}]) {
    const effective=parameters(params)
    const cached=await processImage(bytes,effective,undefined,first.prepared)
    const fresh=await processImage(bytes,effective)
    assert.deepEqual(cached.value,fresh.value)
    assert.deepEqual(cached.previewPoints,fresh.previewPoints)
  }
  const {service}=await fixture(t)
  await service.preview({bytes})
  const zoomed=await service.preview({bytes,params:{zoom:1.5}})
  const fresh=await processImage(bytes,parameters({zoom:1.5}))
  assert.deepEqual(zoomed.value,fresh.value)
})
