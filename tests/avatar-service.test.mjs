import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp,rm,readFile,readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import sharp from 'sharp'
import { createAvatarService, registerAvatarApi, AVATAR_API } from '../src/server/avatars.js'
import { isBase64 } from '../src/server/api.js'
import { randomBytes } from 'node:crypto'
import { createServer } from 'node:http'

test('avatars persist normalized images, isolate roles, reject stale and malformed updates',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-avatar-test-');t.after(()=>rm(dir,{recursive:true,force:true}))
  const service=await createAvatarService(dir)
  const bytes=await sharp({create:{width:360,height:180,channels:4,background:'#f00'}}).png().toBuffer()
  let notifications=0
  const stop=service.subscribe(()=>notifications++)
  const first=await service.save({role:'user',image:bytes.toString('base64'),revision:0})
  const meta=await sharp(Buffer.from(first.user.split(',')[1],'base64')).metadata()
  assert.equal(meta.width,256);assert.equal(meta.height,256);assert.equal(meta.format,'png')
  assert.equal((await createAvatarService(dir)).snapshot().user,first.user)
  await assert.rejects(service.save({role:'assistant',image:null,revision:0}),/其他页面/)
  await assert.rejects(service.save({role:'other',image:null,revision:1}),/类型/)
  await assert.rejects(service.save({role:'assistant',image:'bad image',revision:1}),/图片/)
  await assert.rejects(service.save({role:'assistant',image:Buffer.from('<svg/>').toString('base64'),revision:1}),/图片/)
  assert.equal(service.snapshot().revision,1)
  await service.save({role:'assistant',image:bytes.toString('base64'),revision:1})
  const reset=await service.save({role:'user',image:null,revision:2})
  assert.equal(reset.user,null);assert.ok(reset.assistant)
  assert.equal(notifications,3);stop()
})

test('avatar HTTP API requires admission and mutation header',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-avatar-api-');t.after(()=>rm(dir,{recursive:true,force:true}))
  let handler
  const service=await createAvatarService(dir)
  const dispose=registerAvatarApi({connection:{admit:req=>req.headers['x-test-login']?{}:{rejection:{}}},webServer:{register:route=>{handler=route.handler;return()=>{}}}},service)
  const server=createServer((req,res)=>void handler(req,res))
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  t.after(()=>{dispose();server.closeAllConnections();server.close()})
  const url=`http://127.0.0.1:${server.address().port}${AVATAR_API}/configuration`
  assert.equal((await fetch(url)).status,401)
  assert.equal((await fetch(url,{headers:{'x-test-login':'1'}})).status,200)
  assert.equal((await fetch(url,{method:'POST',headers:{'x-test-login':'1'}})).status,403)
  const result=await fetch(url,{method:'POST',headers:{'x-test-login':'1','x-prts-request':'1'},body:JSON.stringify({role:'user',image:null,revision:0})})
  assert.equal(result.status,200)
  assert.equal((await result.json()).revision,1)
})

test('avatar crop selects the requested source region and rejects invalid crop without mutation',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-avatar-crop-');t.after(()=>rm(dir,{recursive:true,force:true}))
  const service=await createAvatarService(dir)
  const red=await sharp({create:{width:100,height:100,channels:3,background:'#ff0000'}}).png().toBuffer()
  const bytes=await sharp({create:{width:200,height:100,channels:3,background:'#0000ff'}}).composite([{input:red,left:0,top:0}]).png().toBuffer()
  const result=await service.save({role:'user',revision:0,image:bytes.toString('base64'),crop:{zoom:1,x:.75,y:.5}})
  const pixel=await sharp(Buffer.from(result.user.split(',')[1],'base64')).resize(1,1).removeAlpha().raw().toBuffer()
  assert.ok(pixel[2]>240&&pixel[0]<10,'right-hand blue region is selected')
  await assert.rejects(service.save({role:'user',revision:1,image:bytes.toString('base64'),crop:{zoom:0,x:.5,y:.5}}))
  assert.equal(service.snapshot().revision,1)
})

test('editing retains the original and crop across restart without bloating configuration',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-avatar-edit-');t.after(()=>rm(dir,{recursive:true,force:true}))
  let service=await createAvatarService(dir)
  const bytes=await sharp({create:{width:300,height:100,channels:3,background:'#f00'}}).png().toBuffer()
  const crop={zoom:2,x:.75,y:.5}
  await service.save({role:'user',image:bytes.toString('base64'),crop,revision:0})
  service=await createAvatarService(dir)
  assert.deepEqual(service.edit('user'),{revision:1,image:bytes.toString('base64'),crop})
  assert.equal(service.snapshot().sources,undefined)
  await service.save({role:'user',image:null,revision:1})
  assert.equal(service.edit('user').image,null)
})


test('replacing avatars removes prior originals and leaves only the current atomic record',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-avatar-replace-');t.after(()=>rm(dir,{recursive:true,force:true}))
  const service=await createAvatarService(dir)
  const images=await Promise.all(['#f00','#0f0','#00f'].map(background=>sharp({create:{width:80,height:60,channels:3,background}}).png().toBuffer().then(b=>b.toString('base64'))))
  await service.save({role:'assistant',image:images[0],revision:0})
  for(let i=0;i<images.length;i++)await service.save({role:'user',image:images[i],revision:i+1})
  const disk=await readFile(dir+'/avatars.json','utf8')
  assert.equal(disk.includes(images[1]),false)
  assert.equal(JSON.parse(disk).sources.user.image,images[2])
  assert.equal(JSON.parse(disk).sources.assistant.image,images[0])
  assert.deepEqual(await readdir(dir),['avatars.json'])
  await service.save({role:'user',image:null,revision:4})
  const reset=JSON.parse(await readFile(dir+'/avatars.json','utf8'))
  assert.equal(reset.sources.user,null);assert.equal(reset.user,null)
})


test('multi-megabyte image validation and avatar save do not exhaust the regexp stack',async t=>{
  for(const value of ['Zg==','Zm8=','Zm9v',''])assert.equal(isBase64(value),true)
  for(const value of ['Zg=','Zm=v','====','Zm9v\n','Zm9v!AAA',null,42])assert.equal(isBase64(value),false)
  const maximum=Buffer.alloc(5*1024*1024,123).toString('base64')
  assert.equal(isBase64(maximum),true)
  assert.equal(isBase64(maximum.slice(0,-1)+'!'),false)
  const dir=await mkdtemp(tmpdir()+'/prts-avatar-large-');t.after(()=>rm(dir,{recursive:true,force:true}))
  const service=await createAvatarService(dir)
  const bytes=await sharp(randomBytes(1280*1280*3),{raw:{width:1280,height:1280,channels:3}}).png().toBuffer()
  assert.ok(bytes.length>4*1024*1024&&bytes.length<5*1024*1024)
  const result=await service.save({role:'user',image:bytes.toString('base64'),revision:0})
  assert.ok(result.user.startsWith('data:image/png;base64,'))
  assert.equal((await createAvatarService(dir)).edit('user').image,bytes.toString('base64'))
})
