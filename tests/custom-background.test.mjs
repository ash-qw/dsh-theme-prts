import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { createServer } from 'node:http'
import sharp from 'sharp'
import { JSDOM } from 'jsdom'
import { createBackgroundService, registerBackgroundApi, BACKGROUND_API } from '../src/server/backgrounds.js'
import { createBackgroundStore, backgroundMarkup, mountBackgroundSettings } from '../src/client/custom-background.js'
import { DEFAULT_PREFERENCES, normalizePreferences } from '../src/client/preferences.js'

const png = async () => (await sharp({create:{width:32,height:16,channels:3,background:'#187bba'}}).png().toBuffer()).toString('base64')
test('backgrounds persist independent slots, reject stale writes and remove replaced files',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-background-');t.after(()=>rm(dir,{recursive:true,force:true}))
  const service=await createBackgroundService(dir),image=await png()
  const first=await service.save({revision:0,slot:'sidebar',image})
  assert.equal(first.sidebar.width,32);assert.equal((await sharp(await service.image(first.sidebar.id)).metadata()).format,'webp')
  await assert.rejects(service.save({revision:0,slot:'full',image}),{status:409})
  await assert.rejects(service.save({revision:1,slot:'other',image}),{status:400})
  await assert.rejects(service.save({revision:1,slot:'full',image:'abcd'}),{status:400})
  const second=await service.save({revision:1,slot:'full',image})
  assert.deepEqual(second.sidebar,first.sidebar)
  const replaced=await service.save({revision:2,slot:'sidebar',image})
  assert.notEqual(replaced.sidebar.id,first.sidebar.id)
  assert.ok(!(await readdir(dir)).includes(first.sidebar.id+'.webp'))
  const reopened=await createBackgroundService(dir)
  assert.deepEqual(reopened.snapshot(),replaced)
  await service.save({revision:3,slot:'sidebar',image:null})
  assert.equal(service.snapshot().sidebar,null)
  assert.ok((await readdir(dir)).includes(second.full.id+'.webp'))
  await assert.rejects(service.image('../configuration'),{status:404})
  await service.dispose();await reopened.dispose()
})
test('background HTTP routes require authentication and mutation header, and dispose cleanly',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-background-api-')
  const service=await createBackgroundService(dir)
  let handler,allowed=false
  const dispose=registerBackgroundApi({connection:{admit:()=>allowed?{}:{rejection:true}},webServer:{register:r=>{handler=r.handler;return()=>{}}}},service)
  const server=createServer((req,res)=>void handler(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r))
  t.after(async()=>{dispose();server.closeAllConnections();server.close();await service.dispose();await rm(dir,{recursive:true,force:true})})
  const url=`http://127.0.0.1:${server.address().port}${BACKGROUND_API}`
  assert.equal((await fetch(url+'/configuration')).status,401);allowed=true
  assert.equal((await fetch(url+'/configuration',{method:'POST',body:'{}'})).status,403)
  const response=await fetch(url+'/configuration',{method:'POST',headers:{'x-prts-request':'1'},body:JSON.stringify({revision:0,slot:'full',image:await png()})})
  assert.equal(response.status,200)
  const value=await response.json()
  assert.equal((await fetch(url+'/image/'+value.full.id)).headers.get('content-type'),'image/webp')
  allowed=false;assert.equal((await fetch(url+'/image/'+value.full.id)).status,401)
  dispose();assert.equal((await fetch(url+'/configuration')).status,503)
})
test('background settings switch visible regions, preserve images and cancel file selection harmlessly',()=>{
  const dom=new JSDOM(backgroundMarkup());const panel=dom.window.document.body
  const state={revision:1,sidebar:{id:'12345678-1234-1234-1234-123456789abc'},conversation:null,full:null}
  let saves=0
  const editor=mountBackgroundSettings({panel,window:dom.window,store:{snapshot:()=>state,subscribe:fn=>{fn(state);return()=>{}},save:()=>saves++},onChange(){}})
  editor.update({...DEFAULT_PREFERENCES,backgroundMode:'split'})
  assert.equal(panel.querySelector('[data-prts-background-card="sidebar"]').hidden,false)
  assert.equal(panel.querySelector('[data-prts-background-card="full"]').hidden,true)
  const file=panel.querySelector('input[type="file"]');file.dispatchEvent(new dom.window.Event('change',{bubbles:true}))
  assert.equal(saves,0)
  editor.update({...DEFAULT_PREFERENCES,backgroundMode:'full'})
  assert.equal(panel.querySelector('[data-prts-background-card="full"]').hidden,false)
  assert.equal(panel.querySelector('[data-prts-background-card="sidebar"]').hidden,true)
  editor.update(DEFAULT_PREFERENCES)
  assert.equal(panel.querySelector('[data-prts-background-images]').hidden,true)
  assert.ok(state.sidebar);editor.dispose();dom.window.close()
})
test('background store only exposes safe image URLs and removes styles on disposal',async()=>{
  const dom=new JSDOM('',{url:'http://localhost'})
  dom.window.fetch=async()=>({ok:true,json:async()=>({revision:1,full:{id:'javascript:alert(1)'},sidebar:{id:'12345678-1234-1234-1234-123456789abc'}})})
  const store=createBackgroundStore({window:dom.window,document:dom.window.document})
  await store.refresh()
  const root=dom.window.document.documentElement
  assert.equal(root.hasAttribute('data-prts-background-full'),false)
  assert.equal(root.hasAttribute('data-prts-background-sidebar'),true)
  store.dispose();assert.equal(root.hasAttribute('data-prts-background-sidebar'),false);dom.window.close()
})
test('background preferences default off and bound the readability mask',()=>{
  assert.equal(normalizePreferences({}).backgroundMode,'off')
  assert.equal(normalizePreferences({backgroundMode:'full',backgroundDim:2}).backgroundDim,.9)
  assert.equal(normalizePreferences({backgroundMode:'invalid'}).backgroundMode,'off')
})

test('protection edits persist without replacing image bytes and enforce revision checks',async t=>{
  const dir=await mkdtemp(tmpdir()+'/prts-background-region-');t.after(()=>rm(dir,{recursive:true,force:true}))
  const service=await createBackgroundService(dir),image=await png(),region={x:.6,y:.2,width:.3,height:.5}
  const first=await service.save({revision:0,slot:'full',image})
  const original=await service.image(first.full.id)
  const second=await service.save({revision:1,slot:'full',region})
  assert.equal(second.full.id,first.full.id);assert.deepEqual(second.full.region,region)
  assert.deepEqual(await service.image(first.full.id),original)
  await assert.rejects(service.save({revision:1,slot:'full',region:null}),{status:409})
  await assert.rejects(service.save({revision:2,slot:'full',region:{...region,width:2}}),{status:400})
  await assert.rejects(service.save({revision:2,slot:'sidebar',region}),{status:400})
  const reopened=await createBackgroundService(dir);assert.deepEqual(reopened.snapshot(),second);await reopened.dispose()
  const cleared=await service.save({revision:2,slot:'full',region:null});assert.equal(cleared.full.region,null)
  const imported=await service.save({revision:3,slot:'full',image,region});assert.deepEqual(imported.full.region,region)
  const replaced=await service.save({revision:4,slot:'full',image});assert.equal(replaced.full.region,null)
  await service.dispose()
})
