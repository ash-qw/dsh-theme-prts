import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {registerAvatarApi,AVATAR_API} from '../src/server/avatars.js'
import {registerEmblemApi} from '../src/server/api.js'
import {API} from '../src/server/emblems.js'
import {apply} from '../src/index.js'
import {mkdtemp,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'

for(const [register,api] of [[registerAvatarApi,AVATAR_API],[registerEmblemApi,API]])test(api+' captures admission and stops retired handlers',async t=>{
  let active=true,handler,removed=false,admissions=0
  const ctx={get connection(){if(!active)throw Error('cannot get required service "connection" in inactive context');return{admit(){admissions++;return{}}}},
    webServer:{register(route){handler=route.handler;return()=>{removed=true}}}}
  const dispose=register(ctx,{snapshot:()=>({revision:0})})
  const server=createServer((req,res)=>void handler(req,res))
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
  t.after(()=>{dispose();server.closeAllConnections();server.close()})
  const url=`http://127.0.0.1:${server.address().port}${api}/configuration`
  active=false
  assert.equal((await fetch(url)).status,200)
  assert.equal(admissions,1)
  dispose()
  assert.equal(removed,true)
  assert.equal((await fetch(url)).status,503)
  assert.equal(admissions,1)
})

test('plugin registers route and worker cleanup with Cordis effects',async()=>{
  const old=process.env.DSH_HOME
  const directory=await mkdtemp(tmpdir()+'/prts-lifecycle-')
  process.env.DSH_HOME=directory
  const cleanups=[],removed=[]
  try{
    await apply({inject(names, fn) { assert.deepEqual(names, ['settings']); },attachments:{},tools:{register:()=>()=>removed.push('tool')},connection:{admit:()=>({})},
      webServer:{register:route=>()=>removed.push(route.path)},
      effect:body=>{cleanups.push(body());return()=>{}},
      on(name){assert.equal(name,'app-boot/config-reload');return()=>{}}})
    assert.equal(cleanups.length,1)
    await cleanups[0]()
    assert.ok(removed.includes(AVATAR_API));assert.ok(removed.includes(API))
  }finally{
    if(old===undefined)delete process.env.DSH_HOME;else process.env.DSH_HOME=old
    await rm(directory,{recursive:true,force:true})
  }
})

for(const enabled of [undefined,false,true])test(`AI tool registration follows the instance switch: ${enabled}`,async()=>{
  const old=process.env.DSH_HOME,directory=await mkdtemp(tmpdir()+'/prts-tool-switch-')
  process.env.DSH_HOME=directory
  const cleanups=[],registered=new Set(),routes=new Set()
  try{
    await apply({inject(){},on(){return()=>{}},attachments:{},tools:{register:tool=>{registered.add(tool.name);return()=>registered.delete(tool.name)}},connection:{admit:()=>({})},
      webServer:{register:route=>{routes.add(route.path);return()=>routes.delete(route.path)}},
      effect:body=>{cleanups.push(body());return()=>{}}},enabled===undefined?undefined:{aiToolsEnabled:enabled})
    assert.equal(registered.size,enabled===false?0:5)
    if(enabled!==false)assert.deepEqual([...registered].sort(),['prts_avatar_apply','prts_avatar_inspect','prts_emblem_apply','prts_emblem_inspect','prts_emblem_preview'])
    assert.ok(routes.has(AVATAR_API));assert.ok(routes.has(API));assert.equal(routes.size,3)
    for(const dispose of cleanups)await dispose()
    assert.equal(registered.size,0);assert.equal(routes.size,0)
  }finally{
    if(old===undefined)delete process.env.DSH_HOME;else process.env.DSH_HOME=old
    await rm(directory,{recursive:true,force:true})
  }
})

 test('volatile AI switch unregisters and restores tools without removing manual APIs',async()=>{
  const old=process.env.DSH_HOME,directory=await mkdtemp(tmpdir()+'/prts-tool-live-')
  process.env.DSH_HOME=directory
  let enabled=true,notify,unsubscribed=false
  const cleanups=[],tools=new Set(),routes=new Set()
  try{
    await apply({inject(){},attachments:{},on(name,fn){assert.equal(name,'app-boot/config-reload');notify=fn;return()=>{unsubscribed=true}},
      tools:{register(tool){assert.ok(!tools.has(tool.name));tools.add(tool.name);return()=>tools.delete(tool.name)}},connection:{admit:()=>({})},
      webServer:{register:route=>{routes.add(route.path);return()=>routes.delete(route.path)}},effect:body=>{cleanups.push(body());return()=>{}}},
      {aiToolsEnabled:{get:()=>enabled}})
    assert.equal(tools.size,5);notify();assert.equal(tools.size,5)
    enabled=false;notify();assert.equal(tools.size,0);assert.equal(routes.size,3)
    enabled=true;notify();assert.equal(tools.size,5);assert.equal(routes.size,3)
    for(const dispose of cleanups)await dispose()
    assert.equal(tools.size,0);assert.equal(routes.size,0);assert.equal(unsubscribed,true)
  }finally{
    if(old===undefined)delete process.env.DSH_HOME;else process.env.DSH_HOME=old
    await rm(directory,{recursive:true,force:true})
  }
 })
