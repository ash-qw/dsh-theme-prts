import { createAvatarStore } from '../src/client/custom-avatar.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import sharp from 'sharp'
import { createBackgroundService, registerBackgroundApi } from '../src/server/backgrounds.js'
import { createAvatarService, registerAvatarApi } from '../src/server/avatars.js'
import { createEmblemService } from '../src/server/emblems.js'
import { registerEmblemApi } from '../src/server/api.js'
import { DEFAULT_PREFERENCES } from '../src/client/preferences.js'
import { readTransferFile, createThemeTransfer, validateThemePackage, mergeThemePreferences, ignoredThemePackageFields } from '../src/client/theme-transfer.js'

const pack = () => ({format:'prts-theme',version:1,preferences:{...DEFAULT_PREFERENCES}})
test('packages reject future versions and malformed settings without mutating the input',()=>{
  const value=pack();assert.equal(validateThemePackage(value),value)
  assert.throws(()=>validateThemePackage({...value,version:2}))
  assert.throws(()=>validateThemePackage({...value,preferences:{version:999,enabled:true}}))
  assert.throws(()=>validateThemePackage({...value,preferences:{version:12,sidebarOpacity:'x'}}))
  assert.throws(()=>validateThemePackage({...value,preferences:{version:12,rightSidebarOpacity:'x'}}))
  assert.throws(()=>validateThemePackage({...value,preferences:{version:12,motion:'unknown'}}))
  assert.throws(()=>validateThemePackage({...value,assets:{}}))
  assert.equal(mergeThemePreferences({...DEFAULT_PREFERENCES,previewTools:false},{version:11,glass:'soft'}).previewTools,false)
  const merged=mergeThemePreferences({...DEFAULT_PREFERENCES,rightSidebarOpacity:.42,rightSidebarBlur:19},{version:12,sidebarOpacity:.2,sidebarBlur:11})
  assert.deepEqual([merged.sidebarOpacity,merged.sidebarBlur,merged.rightSidebarOpacity,merged.rightSidebarBlur],[.2,11,.42,19])
})

test('import preview identifies fields this version will discard',()=>{
  const value=pack()
  assert.deepEqual(ignoredThemePackageFields(value),[])
  value.preferences.futureMotion='gentle'
  value.assets={
    backgrounds:{full:null,sidebar:null,conversation:null,futureSlot:null},
    backgroundRegions:{full:null,sidebar:null,conversation:null},
    avatars:{user:null,assistant:null},
    emblems:{items:[],hero:null,conversation:[{kind:'builtin',key:'rhodes-island',label:'罗德岛',futureEffect:true}]},
    futureAssets:{enabled:true},
  }
  assert.equal(validateThemePackage(value),value)
  assert.deepEqual(ignoredThemePackageFields(value),[
    '设置.futureMotion','素材.futureAssets','背景.futureSlot','徽记.conversation[0].futureEffect',
  ])
})

async function fixture(t) {
  const directory=await mkdtemp(join(tmpdir(),'prts-transfer-'))
  const backgrounds=await createBackgroundService(join(directory,'backgrounds'))
  const avatars=await createAvatarService(join(directory,'avatars'))
  const emblems=await createEmblemService(join(directory,'emblems'))
  const routes=[]
  const ctx={connection:{admit:()=>({})},webServer:{register:route=>{routes.push(route);return()=>{}}}}
  const dispose=[registerBackgroundApi(ctx,backgrounds),registerAvatarApi(ctx,avatars),registerEmblemApi(ctx,emblems)]
  const server=createServer((req,res)=>{const route=routes.find(r=>req.url.startsWith(r.path));if(route)void route.handler(req,res);else {res.statusCode=404;res.end()}})
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  t.after(async()=>{for(const fn of dispose)fn();await emblems.dispose();await backgrounds.dispose();await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true})})
  let preferences={...DEFAULT_PREFERENCES,enabled:true,bootAnimation:false},revision=1,reject=false,onSave,onResponse,onAvatarConfiguration
  const calls=[],downloads=[]
  const window={fetch:async(path,options)=>{calls.push({path,options});const response=await fetch(`http://127.0.0.1:${server.address().port}`+path,options);await onResponse?.(path,options);return response},
    Blob,URL:{createObjectURL:blob=>{downloads.push(blob);return 'blob:test'},revokeObjectURL(){}},setTimeout:fn=>{fn()},
    document:{body:{append(){}},createElement:()=>({click(){},remove(){}})},
    FileReader:class {readAsDataURL(blob){blob.arrayBuffer().then(bytes=>{this.result='data:image/webp;base64,'+Buffer.from(bytes).toString('base64');this.onload()})}}}
  const transfer=createThemeTransfer({window,onAvatarConfiguration:value=>onAvatarConfiguration?.(value),getPreferences:()=>preferences,checkWritable:()=>revision,themeVersion:'test',savePreferences:async(next,expected)=>{if(onSave)await onSave();if(reject||revision!==expected)throw Error('模拟设置冲突');preferences=next;revision++}})
  return {backgrounds,avatars,emblems,transfer,calls,downloads,window,onAvatarConfiguration:fn=>{onAvatarConfiguration=fn},get preferences(){return preferences},reject:()=>{reject=true},onSave:fn=>{onSave=fn},onResponse:fn=>{onResponse=fn}}
}

test('configuration-only import and restore never touch asset services',async t=>{
  const f=await fixture(t)
  const value=await f.transfer.export(false)
  assert.equal(value.assets,undefined)
  value.preferences.previewTools=false
  await f.transfer.import(value)
  assert.equal(f.preferences.previewTools,false)
  assert.equal(f.calls.length,0)
  assert.equal(f.downloads.length,1)
  await f.transfer.restore()
  assert.equal(f.preferences.previewTools,true)
})

test('full package restores backgrounds, editable avatars, custom emblems and order; failures roll assets back',async t=>{
  const f=await fixture(t)
  const image=await sharp({create:{width:32,height:32,channels:4,background:'#eecc22'}}).png().toBuffer()
  const region={x:.7,y:.1,width:.2,height:.5}
  await f.backgrounds.save({slot:'sidebar',image:image.toString('base64'),region,revision:0})
  const crop={zoom:2,x:.4,y:.6}
  await f.avatars.save({role:'user',image:image.toString('base64'),crop,revision:0})
  const draft=await f.emblems.preview({bytes:image,label:'徽记',params:{mode:'alpha'}})
  await f.emblems.save({version:2,hero:null,conversation:[{kind:'custom',key:'custom-one',label:'徽记',draftId:draft.id},{kind:'builtin',key:'rhodes-island'}]},0)
  const value=await f.transfer.export(true)
  assert.deepEqual(ignoredThemePackageFields(value),[])
  assert.equal(value.assets.emblems.items.length,1)
  assert.deepEqual(value.assets.avatars.user.crop,crop)
  assert.ok(value.assets.backgrounds.sidebar)
  assert.deepEqual(value.assets.backgroundRegions.sidebar,region)
  await f.backgrounds.save({slot:'sidebar',image:null,revision:1})
  await f.avatars.save({role:'user',image:null,revision:1})
  await f.transfer.import(value)
  assert.ok(f.backgrounds.snapshot().sidebar)
  assert.deepEqual(f.backgrounds.snapshot().sidebar.region,region)
  assert.deepEqual(f.avatars.edit('user').crop,crop)
  const restored=f.emblems.snapshot().configuration
  assert.equal(restored.conversation[0].kind,'custom')
  assert.notEqual(restored.conversation[0].draftId,draft.id)
  assert.equal(restored.conversation[1].key,'rhodes-island')
  const broken=structuredClone(value)
  broken.assets.backgrounds.sidebar=null
  f.reject()
  await assert.rejects(f.transfer.import(broken),/模拟设置冲突/)
  assert.ok(f.backgrounds.snapshot().sidebar)
  assert.deepEqual(f.backgrounds.snapshot().sidebar.region,region)
  assert.deepEqual(f.avatars.edit('user').crop,crop)
  assert.equal(f.emblems.snapshot().configuration.conversation[0].draftId,restored.conversation[0].draftId)
})

test('rollback refuses to overwrite an avatar changed by another client during import',async t=>{
  const f=await fixture(t)
  const value=await f.transfer.export(true)
  const image=await sharp({create:{width:16,height:16,channels:4,background:'#123456'}}).png().toBuffer()
  f.onSave(async()=>{
    await f.avatars.save({role:'user',image:image.toString('base64'),revision:f.avatars.snapshot().revision})
    throw Error('设置冲突')
  })
  await assert.rejects(f.transfer.import(value),/部分素材未能自动恢复/)
  assert.equal(f.avatars.edit('user').image,image.toString('base64'))
  assert.equal(f.transfer.hasBackup,true)
})

test('progress tracks completed work and reports rollback without claiming success',async t=>{
  const f=await fixture(t), exported=[], imported=[]
  const value=await f.transfer.export(true,state=>exported.push(state))
  await f.transfer.import(value,state=>imported.push(state))
  for(const states of [exported,imported]) {
    assert.equal(states[0].value,0)
    assert.equal(states.at(-1).value,1)
    assert.ok(states.every((state,index)=>state.label && state.value>=0 && state.value<=1 && (!index || state.value>=states[index-1].value)))
  }
  f.reject()
  const failed=[]
  await assert.rejects(f.transfer.import(value,state=>failed.push(state)),/模拟设置冲突/)
  assert.equal(failed.at(-1).value,null)
  assert.match(failed.at(-1).label,/回退/)
  assert.ok(failed.every(state=>state.value!==1))
})

test('cancel export and import backup before any mutation, then allow another operation',async t=>{
  const f=await fixture(t)
  const stopped=new AbortController();stopped.abort()
  await assert.rejects(f.transfer.export(true,undefined,stopped.signal),{name:'AbortError'})
  assert.equal(f.calls.length,0)
  const value=await f.transfer.export(true), controller=new AbortController()
  f.calls.length=0
  await assert.rejects(f.transfer.import(value,()=>controller.abort(),controller.signal),{name:'AbortError'})
  assert.ok(f.calls.every(call=>!call.options.method))
  assert.equal(f.downloads.length,0)
  await f.transfer.export(false)
})

test('cancel during a confirmed asset write waits for response and rolls it back',async t=>{
  const f=await fixture(t)
  const image=await sharp({create:{width:16,height:16,channels:4,background:'#123456'}}).png().toBuffer()
  await f.backgrounds.save({slot:'full',image:image.toString('base64'),revision:0})
  const value=await f.transfer.export(true)
  value.assets.backgrounds.full=null
  value.preferences.previewTools=false
  const controller=new AbortController(), states=[]
  f.onResponse((path,options)=>{if(options.method==='POST')controller.abort()})
  f.calls.length=0
  await assert.rejects(f.transfer.import(value,state=>states.push(state),controller.signal),/操作已取消，已回退/)
  assert.ok(f.backgrounds.snapshot().full)
  assert.equal(f.preferences.previewTools,true)
  assert.equal(f.calls.filter(call=>call.options.method==='POST').length,2)
  assert.ok(states.some(state=>state.cancellable===false && /回退/.test(state.label)))
  assert.ok(states.every(state=>state.value!==1))
  await f.transfer.export(false)
})

test('cancellation aborts an active file reader and an active export request',async()=>{
  let aborted=false
  const controller=new AbortController()
  const reading=readTransferFile({FileReader:class {readAsText(){} abort(){aborted=true}}},{},controller.signal)
  controller.abort()
  await assert.rejects(reading,{name:'AbortError'})
  assert.equal(aborted,true)
  const network=new AbortController()
  let received
  const transfer=createThemeTransfer({window:{fetch:(_,options)=>new Promise((resolve,reject)=>{
    received=options.signal
    received.addEventListener('abort',()=>reject(Object.assign(Error('aborted'),{name:'AbortError'})),{once:true})
  })},getPreferences:()=>({...DEFAULT_PREFERENCES}),checkWritable:()=>1})
  const exporting=transfer.export(true,undefined,network.signal)
  assert.equal(received,network.signal)
  network.abort()
  await assert.rejects(exporting,{name:'AbortError'})
  await transfer.export(false)
})

test('cancel rollback conflict preserves the concurrent change and warns about incomplete recovery',async t=>{
  const f=await fixture(t), value=await f.transfer.export(true), controller=new AbortController()
  let intercepted=false
  const image=await sharp({create:{width:16,height:16,channels:4,background:'#123456'}}).png().toBuffer()
  f.onResponse(async(path,options)=>{
    if(options.method==='POST' && !intercepted){
      intercepted=true
      await f.backgrounds.save({slot:'full',image:image.toString('base64'),revision:f.backgrounds.snapshot().revision})
      controller.abort()
    }
  })
  await assert.rejects(f.transfer.import(value,undefined,controller.signal),/部分素材未能自动恢复/)
  assert.ok(f.backgrounds.snapshot().full)
  assert.equal(f.transfer.hasBackup,true)
})


test('import and rollback update current avatar display without server events or focus',async t=>{
  const f=await fixture(t)
  const properties=new Map()
  const store=createAvatarStore({window:{...f.window,addEventListener(){},removeEventListener(){}},document:{documentElement:{style:{setProperty:(k,v)=>properties.set(k,v),removeProperty:k=>properties.delete(k)}}}})
  t.after(()=>store.dispose())
  await store.refresh()
  f.onAvatarConfiguration(value=>store.applySnapshot(value))
  const image=await sharp({create:{width:32,height:32,channels:4,background:'#eecc22'}}).png().toBuffer()
  for(const role of ['user','assistant'])await f.avatars.save({role,image:image.toString('base64'),revision:f.avatars.snapshot().revision})
  const value=await f.transfer.export(true)
  for(const role of ['user','assistant'])await f.avatars.save({role,image:null,revision:f.avatars.snapshot().revision})
  await store.refresh()
  assert.equal(properties.has('--prts-custom-user-avatar'),false)
  await f.transfer.import(value)
  for(const role of ['user','assistant'])assert.equal(properties.get('--prts-custom-'+role+'-avatar'),'url("'+f.avatars.snapshot()[role]+'")')
  const cleared=structuredClone(value);cleared.assets.avatars={user:null,assistant:null}
  f.reject()
  await assert.rejects(f.transfer.import(cleared),/模拟设置冲突/)
  for(const role of ['user','assistant'])assert.equal(properties.get('--prts-custom-'+role+'-avatar'),'url("'+f.avatars.snapshot()[role]+'")')
})
