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
      on(){throw Error('Legacy disposal events must not be used')}})
    assert.equal(cleanups.length,1)
    await cleanups[0]()
    assert.ok(removed.includes(AVATAR_API));assert.ok(removed.includes(API))
  }finally{
    if(old===undefined)delete process.env.DSH_HOME;else process.env.DSH_HOME=old
    await rm(directory,{recursive:true,force:true})
  }
})
