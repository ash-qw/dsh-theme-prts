import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import sharp from 'sharp'
import {createBackgroundService} from '../src/server/backgrounds.js'
import {backgroundTools} from '../src/server/background-tools.js'

async function setup(t,kind='image',origin='upload'){
  const dir=await mkdtemp(tmpdir()+'/prts-bg-tools-')
  const service=await createBackgroundService(dir)
  t.after(async()=>{await service.dispose();await rm(dir,{recursive:true,force:true})})
  const bytes=await sharp({create:{width:240,height:120,channels:3,background:'#369'}}).png().toBuffer()
  const attachments={readImage:async()=>({data:bytes}),async *readFileStream(){yield bytes}}
  const message={content:[{type:kind,attachment:{attachmentId:'source',mediaType:'image/png',name:'background.png'}}]}
  const events=origin==='upload'?[{type:'user/message',data:message}]:[
    {type:'tool/call',data:{callId:'generated',name:'read_image'}},
    {type:'tool/result',data:{message:{...message,toolCallId:'generated'}}},
  ]
  const exec={agent:{session:{snapshotEvents:()=>events}},signal:new AbortController().signal}
  const descriptor={ns:'theme-instance',revision:7,value:{enabled:true,backgroundMode:'off',backgroundDim:.45,cursor:'system'}}
  const settings={writable:true,describe:()=>[descriptor],update:async(ns,patch,revision)=>{
    assert.equal(ns,descriptor.ns)
    if(revision!==descriptor.revision)throw Error('SETTINGS_CONFLICT')
    Object.assign(descriptor.value,patch);descriptor.revision++
  }}
  const host={get:name=>name==='settings'?settings:null,fiber:{entry:{id:'include:theme-instance',options:{id:'theme-instance'}}}}
  const tools=Object.fromEntries(backgroundTools(service,attachments,host).map(tool=>[tool.name,tool]))
  return {service,attachments,exec,settings,descriptor,
    inspect:()=>tools.prts_background_inspect.execute({},exec),
    apply:args=>tools.prts_background_apply.execute(args,exec),
    configure:args=>tools.prts_background_configure.execute(args,exec)}
}
for(const kind of ['image','file'])for(const origin of ['upload','tool'])test(`background uses ${origin} ${kind}, protects, enables and removes without touching other settings`,async t=>{
  const {inspect,apply,configure,descriptor,service}=await setup(t,kind,origin)
  assert.equal((await inspect()).images[0].origin,origin)
  const region={x:.4,y:.2,width:.4,height:.6}
  const result=await apply({slot:'full',action:'replace',attachmentId:'source',region,revision:0})
  assert.deepEqual(result.full.region,region);assert.equal(result.full.width,240)
  assert.deepEqual(result.activeSlots,[])
  assert.equal((await sharp(await service.image(result.full.id)).metadata()).format,'webp')
  const enabled=await configure({mode:'full',dim:.6,revision:7})
  assert.deepEqual(enabled.activeSlots,['full']);assert.equal(descriptor.value.cursor,'system')
  assert.equal(descriptor.value.backgroundDim,.6)
  await assert.rejects(configure({mode:'split',revision:7}),/更新/)
  await assert.rejects(apply({slot:'full',action:'remove',revision:0}),/更新/)
  await apply({slot:'full',action:'protect',region:null,revision:1})
  assert.equal((await inspect()).full.region,null)
  await configure({mode:'off',revision:8})
  assert.ok((await inspect()).full)
  await apply({slot:'full',action:'remove',revision:2})
  assert.equal((await inspect()).full,null)
})
test('background validates sources, regions, sizes and cancellation before changing state',async t=>{
  const {apply,configure,service,attachments,exec}=await setup(t)
  const base={slot:'conversation',action:'replace',attachmentId:'source',revision:0}
  await assert.rejects(apply({...base,attachmentId:'foreign'}),/当前会话/)
  await assert.rejects(apply({...base,region:{x:.9,y:0,width:.2,height:1}}),/保护区域/)
  await assert.rejects(apply({...base,action:'remove'}),/attachmentId/)
  await assert.rejects(configure({revision:7,dim:1}),/dim/)
  await assert.rejects(configure({revision:7}),/指定/)
  attachments.readImage=async()=>({data:Buffer.alloc(10*1024*1024+1)})
  await assert.rejects(apply(base),/10 MB/)
  attachments.readImage=async()=>({data:Buffer.from('invalid image')})
  await assert.rejects(apply(base),/无法读取/)
  const controller=new AbortController();controller.abort();exec.signal=controller.signal
  await assert.rejects(apply(base),{name:'AbortError'})
  assert.equal(service.snapshot().revision,0)
})
test('background detects concurrent writes during attachment reads and preserves queued cancellation',async t=>{
  const {apply,service,attachments}=await setup(t)
  const read=attachments.readImage
  attachments.readImage=async()=>{
    await service.save({slot:'sidebar',image:null,revision:0})
    return read()
  }
  await assert.rejects(apply({slot:'full',action:'replace',attachmentId:'source',revision:0}),/更新/)
  assert.equal(service.snapshot().full,null)
  const controller=new AbortController()
  const pending=service.save({slot:'sidebar',image:null,revision:1},controller.signal)
  controller.abort()
  await assert.rejects(pending,{name:'AbortError'})
  assert.equal(service.snapshot().revision,1)
})
test('settings unavailability still permits material inspect and refuses configure',async t=>{
  const {settings,inspect,configure}=await setup(t)
  settings.describe=()=>[]
  assert.equal((await inspect()).settings.available,false)
  await assert.rejects(configure({mode:'full',revision:7}),/不支持/)
})
test('host configuration conflicts remain authoritative',async t=>{
  const {settings,configure,descriptor}=await setup(t)
  settings.update=async()=>{throw Error('SETTINGS_CONFLICT')}
  await assert.rejects(configure({mode:'full',revision:7}),/SETTINGS_CONFLICT/)
  assert.equal(descriptor.value.backgroundMode,'off')
})
test('material reads normalized values and patches all five regions without replacing other preferences',async t=>{
  const {inspect,configure,descriptor,service}=await setup(t)
  descriptor.value.sidebarBlur=7;descriptor.value.sidebarOpacity=.21
  const initial=await inspect()
  assert.equal(initial.settings.material.blur.sidebar,7)
  assert.equal(initial.settings.material.blur.rightSidebar,7)
  assert.equal(initial.settings.material.opacity.sidebar,.21)
  const material={blur:{sidebar:0,rightSidebar:32,rail:9,baker:6,classicUser:4},
    opacity:{sidebar:0,rightSidebar:1,rail:.3,baker:.4,classicUser:.5}}
  const result=await configure({revision:7,material})
  assert.deepEqual(result.settings.material,material)
  assert.equal(result.settings.revision,8)
  assert.equal(descriptor.value.cursor,'system')
  assert.equal(descriptor.value.backgroundMode,'off')
  assert.equal(service.snapshot().revision,0)
  const next=await configure({revision:8,material:{blur:{sidebar:2}}})
  assert.deepEqual(next.settings.material,{...material,blur:{...material.blur,sidebar:2}})
  await assert.rejects(configure({revision:8,material:{opacity:{rail:.9}}}),/更新/)
  assert.equal(descriptor.value.railOpacity,.3)
})
test('material rejects invalid and empty input atomically, including valid mode alongside invalid material',async t=>{
  const {configure,descriptor}=await setup(t)
  for(const material of [null,[],{}, {blur:{}},{unknown:{}},{blur:null},{blur:{other:1}},
    {blur:{sidebar:-1}},{blur:{sidebar:33}},{blur:{sidebar:1.5}},{blur:{sidebar:'2'}},
    {opacity:{rail:NaN}},{opacity:{rail:Infinity}},{opacity:{rail:-.1}},{opacity:{rail:1.1}}]){
    await assert.rejects(configure({revision:7,material}))
    assert.equal(descriptor.revision,7)
  }
  await assert.rejects(configure({revision:7,mode:'full',material:{blur:{rail:40}}}),/blur/)
  assert.equal(descriptor.value.backgroundMode,'off')
})
