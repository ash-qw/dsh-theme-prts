import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import sharp from 'sharp'
import {createAvatarService} from '../src/server/avatars.js'
import {avatarTools} from '../src/server/avatar-tools.js'

async function setup(t,kind='image'){
  const dir=await mkdtemp(tmpdir()+'/prts-avatar-tools-');t.after(()=>rm(dir,{recursive:true,force:true}))
  const service=await createAvatarService(dir)
  const bytes=await sharp({create:{width:240,height:120,channels:3,background:'#f00'}}).png().toBuffer()
  let reads=0
  const attachments={readImage:async()=>{reads++;return{data:bytes}},async *readFileStream(){reads++;yield bytes}}
  const tools=Object.fromEntries(avatarTools(service,attachments).map(t=>[t.name,t]))
  const exec={agent:{session:{snapshotEvents:()=>[{type:'user/message',data:{content:[{type:kind,attachment:{attachmentId:'local',mediaType:'image/png',name:'avatar.png'}}]}}]}},signal:new AbortController().signal}
  return{service,tools,exec,reads:()=>reads,attachments}
}
for(const kind of ['image','file'])test(`avatar tools inspect, replace ${kind}, recrop, reject stale edits, and reset`,async t=>{
  const {service,tools,exec}=await setup(t,kind)
  const inspect=()=>tools.prts_avatar_inspect.execute({},exec)
  const apply=args=>tools.prts_avatar_apply.execute(args,exec)
  const initial=await inspect()
  assert.equal(initial.images[0].attachmentId,'local');assert.equal(initial.user.custom,false)
  const result=await apply({action:'replace',role:'user',attachmentId:'local',revision:0})
  assert.equal(result.applied,true);assert.equal(result.revision,1)
  const current=await inspect()
  assert.equal(current.user.width,240);assert.equal(current.user.height,120)
  assert.deepEqual(current.user.crop,{zoom:1,x:.5,y:.5})
  assert.equal(JSON.stringify(current).includes('base64'),false)
  await assert.rejects(apply({action:'reset',role:'user',revision:0}),/更新/)
  await apply({action:'recrop',role:'user',crop:{zoom:2,x:.75,y:.5},revision:1})
  assert.equal(service.edit('user').crop.zoom,2)
  await apply({action:'reset',role:'user',revision:2})
  assert.equal(service.edit('user').image,null)
  await assert.rejects(apply({action:'recrop',role:'user',crop:{zoom:2,x:.5,y:.5},revision:3}),/尚未/)
})
test('avatar tools isolate session images, reject oversized data and honor cancellation',async t=>{
  const {service,tools,exec,reads,attachments}=await setup(t)
  const apply=args=>tools.prts_avatar_apply.execute({action:'replace',role:'assistant',revision:0,...args},exec)
  await assert.rejects(apply({attachmentId:'another-session'}),/当前会话/)
  assert.equal(reads(),0)
  attachments.readImage=async()=>({data:Buffer.alloc(5*1024*1024+1)})
  await assert.rejects(apply({attachmentId:'local'}),/5 MB/)
  await assert.rejects(tools.prts_avatar_inspect.execute({},{}),/会话/)
  const controller=new AbortController();controller.abort();exec.signal=controller.signal
  await assert.rejects(tools.prts_avatar_apply.execute({action:'reset',role:'user',revision:0},exec),{name:'AbortError'})
  assert.equal(service.snapshot().revision,0)
})
test('avatar tools accept generated image attachments returned by a conversation tool',async t=>{
  const {tools,exec}=await setup(t)
  exec.agent.session.snapshotEvents=()=>[
    {type:'tool/call',data:{callId:'generated',name:'read_image'}},
    {type:'tool/result',data:{message:{toolCallId:'generated',content:[{type:'image',attachment:{attachmentId:'generated-image',mediaType:'image/png'}}]}}},
  ]
  const inspect=await tools.prts_avatar_inspect.execute({},exec)
  assert.equal(inspect.images[0].origin,'tool')
  assert.equal((await tools.prts_avatar_apply.execute({action:'replace',role:'assistant',revision:0,attachmentId:'generated-image'},exec)).assistant.custom,true)
})
