import test from 'node:test'
import assert from 'node:assert/strict'
import { processCustomEmblemPixels, validCustomEmblem, defaultEmblemConfiguration, validEmblemConfiguration } from '../src/client/custom-emblem.js'

function raster({ transparent = false } = {}) {
  const data = new Uint8ClampedArray(320 * 320 * 4)
  for (let y = 0; y < 320; y++) for (let x = 0; x < 320; x++) {
    const i = (y * 320 + x) * 4
    const inside = x > 80 && x < 240 && y > 80 && y < 240
    data[i] = data[i+1] = data[i+2] = inside ? 0 : 255
    data[i+3] = transparent && !inside ? 0 : 255
  }
  return data
}
test('opaque dark silhouettes and transparent masks produce the same bounded targets', () => {
  const opaque = processCustomEmblemPixels(raster(),320)
  const transparent = processCustomEmblemPixels(raster({ transparent:true }),320)
  assert.deepEqual(opaque.targets,transparent.targets)
  assert.ok(validCustomEmblem(opaque))
  assert.ok(opaque.targets.ultra.length > opaque.targets.sparse.length)
  for (const points of Object.values(opaque.targets)) {
    assert.ok(points.every(p=>Math.abs(p.x)<.26 && Math.abs(p.y)<.26))
    assert.ok(points.some(p=>p.kind==='skeleton'))
  }
})
test('light extraction inverts the selected area and invalid or empty masks fail', () => {
  const result=processCustomEmblemPixels(raster(),320,'light',128)
  assert.ok(result.targets.standard.every(p=>Math.abs(p.x)>.24 || Math.abs(p.y)>.24))
  assert.throws(()=>processCustomEmblemPixels(new Uint8ClampedArray(320*320*4),320),/轮廓太少/)
  assert.throws(()=>processCustomEmblemPixels([],0),/数据无效/)
  assert.equal(validCustomEmblem({version:1,targets:{}}),false)
  result.targets.standard[0].x=Infinity
  assert.equal(validCustomEmblem(result),false)
})

test('configuration accepts mixed lists and rejects empty, oversized, duplicate or unknown entries', () => {
  const builtins=[{key:'rhodes-island',label:'罗德岛'}]
  const defaults=defaultEmblemConfiguration(builtins)
  const custom={...processCustomEmblemPixels(raster(),320),kind:'custom',key:'upload-1',label:'图片'}
  assert.ok(validEmblemConfiguration(defaults,builtins))
  assert.ok(validEmblemConfiguration({...defaults,hero:custom,conversation:[custom,...defaults.conversation]},builtins))
  for (const conversation of [[],[custom,custom],Array.from({length:13},(_,i)=>({...custom,key:String(i)})),[{kind:'builtin',key:'unknown'}]]) {
    assert.equal(validEmblemConfiguration({...defaults,conversation},builtins),false)
  }
  assert.equal(validEmblemConfiguration(custom,builtins),false)
})

test('custom masks retain builtin particle density without truncating dense images', async () => {
  const { createOrthogonalTargets } = await import('../src/client/particle-field-adapter.js')
  const rgba = raster({ transparent: true })
  const alpha = Uint8Array.from({length:320*320},(_,i)=>rgba[i*4+3])
  const custom = processCustomEmblemPixels(rgba,320)
  for (const density of Object.keys(custom.targets)) {
    const builtin = createOrthogonalTargets({width:320,height:320,alpha},density)
    const ratio = custom.targets[density].length / builtin.length
    assert.ok(ratio > .9 && ratio < 1.1, `${density}: ${ratio}`)
  }
  const full = processCustomEmblemPixels(new Uint8ClampedArray(320*320*4).fill(255),320,'alpha')
  assert.ok(full.targets.ultra.length > 9000)
  assert.ok(validCustomEmblem(full))
})

test('server synchronization preserves unchanged custom targets and closes the event stream',async()=>{
  const { createCustomEmblemStore } = await import('../src/client/custom-emblem.js')
  const custom={...processCustomEmblemPixels(raster(),320),kind:'custom',key:'upload',label:'图片',draftId:'draft'}
  let remote={revision:0,configuration:{version:2,hero:custom,conversation:[{kind:'builtin',key:'rhodes-island',label:'罗德岛'}]}}
  let events,changes=0
  class EventSource {constructor(){events=this}close(){this.closed=true}}
  const window={AbortController,EventSource,setTimeout,clearTimeout,addEventListener(){},removeEventListener(){},fetch:async()=>({ok:true,json:async()=>structuredClone(remote)})}
  const store=createCustomEmblemStore({window,emblems:[{key:'rhodes-island',label:'罗德岛'}],onChange:()=>changes++})
  await store.ready
  const original=store.get().hero
  remote={...remote,revision:1}
  events.onmessage({data:JSON.stringify({revision:1})})
  await new Promise(resolve=>setTimeout(resolve,0))
  assert.equal(changes,2)
  assert.equal(store.get().hero,original)
  store.dispose();assert.equal(events.closed,true)
})

test('lineart keeps outlines instead of filled regions and ignores invisible RGB', () => {
  const outline=processCustomEmblemPixels(raster(),320,'lineart')
  assert.ok(validCustomEmblem(outline))
  for (const points of Object.values(outline.targets)) {
    assert.ok(points.every(p=>p.kind==='skeleton'))
    assert.ok(points.every(p=>Math.abs(p.x)>.22 || Math.abs(p.y)>.22), 'solid interior must remain empty')
  }
  const transparent=raster({transparent:true})
  for(let i=0;i<transparent.length;i+=4)if(!transparent[i+3]) {
    transparent[i]=i%256;transparent[i+1]=(i*7)%256;transparent[i+2]=(i*13)%256
  }
  assert.deepEqual(processCustomEmblemPixels(transparent,320,'lineart').targets,outline.targets)
  assert.throws(()=>processCustomEmblemPixels(new Uint8ClampedArray(320*320*4),320,'lineart'),/轮廓太少/)
})

test('thin strokes survive grid phase shifts at every density', () => {
  for(const lineX of [100,101,102,103,104]) {
    const data=new Uint8ClampedArray(320*320*4).fill(255)
    for(let y=30;y<290;y++) {
      const i=(y*320+lineX)*4;data[i]=data[i+1]=data[i+2]=0
    }
    const result=processCustomEmblemPixels(data,320,'lineart',100)
    for(const [density,points] of Object.entries(result.targets)) {
      const rows=[...new Set(points.map(p=>p.latticeRow))].sort((a,b)=>a-b)
      assert.ok(rows.length>40, density)
      assert.ok(rows.every((row,i)=>i===0 || row===rows[i-1]+1), density+' must not skip thin-line rows')
      assert.ok(points.every(p=>Math.abs(p.x-(lineX-160)/320)<.03))
    }
  }
})

test('raising the lineart threshold removes faint isolated details', () => {
  const data=raster()
  for(let y=20;y<55;y++)for(let x=20;x<55;x++){
    const i=(y*320+x)*4;data[i]=data[i+1]=data[i+2]=215
  }
  const low=processCustomEmblemPixels(data,320,'lineart',30)
  const high=processCustomEmblemPixels(data,320,'lineart',220)
  assert.ok(low.targets.standard.some(p=>p.x<-.3 && p.y<-.3))
  assert.ok(!high.targets.standard.some(p=>p.x<-.3 && p.y<-.3))
})

test('line simplification preserves loops and endpoints while filtering only small components',async()=>{
  const {simplifyEmblemLines}=await import('../src/client/custom-emblem.js')
  const size=40,cells=new Set()
  for(let y=8;y<=30;y++)for(let x=8;x<=30;x++)if(x<=10||x>=28||y<=10||y>=28)cells.add(y*size+x)
  cells.add(2*size+2);cells.add(2*size+3)
  const result=simplifyEmblemLines(cells,size,2)
  assert.ok(result.size<cells.size/2)
  assert.ok(!result.has(2*size+2))
  assert.ok(!result.has(20*size+20),'loop interior remains empty')
  const remaining=new Set(result),pending=[result.values().next().value]
  remaining.delete(pending[0])
  while(pending.length){
    const i=pending.pop()
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const n=i+dy*size+dx
      if(remaining.delete(n))pending.push(n)
    }
  }
  assert.equal(remaining.size,0,'loop stays connected')
  const stroke=new Set(Array.from({length:20},(_,i)=>(i+5)*size+20))
  assert.deepEqual(simplifyEmblemLines(stroke,size,12),stroke,'long isolated strokes retain their endpoints')
  assert.ok(simplifyEmblemLines(cells,size,0).has(2*size+2),'zero cleanup preserves short details')
})

test('ink extraction yields one-particle strokes without double contours',()=>{
  const data=new Uint8ClampedArray(320*320*4).fill(255)
  for(let y=35;y<285;y++)for(let x=98;x<=102;x++){
    const i=(y*320+x)*4;data[i]=data[i+1]=data[i+2]=0
  }
  const result=processCustomEmblemPixels(data,320,'lineart',128,undefined,{lineSource:'ink',cleanup:0})
  for(const points of Object.values(result.targets)){
    const rows=new Map()
    for(const p of points)rows.set(p.latticeRow,(rows.get(p.latticeRow)||0)+1)
    assert.ok(rows.size>35)
    assert.ok([...rows.values()].every(n=>n===1),'one particle per row')
  }
})

test('draft reads share pending requests, reuse immutable IDs and retry failures',async()=>{
  const {createCustomEmblemStore}=await import('../src/client/custom-emblem.js')
  let reads=0,fail=true,release
  const gate=new Promise(resolve=>{release=resolve})
  const window={AbortController,setTimeout,clearTimeout,addEventListener(){},removeEventListener(){},fetch:async url=>{
    if(url.endsWith('/configuration'))return {ok:true,json:async()=>({revision:0,configuration:{version:2,hero:null,conversation:[]}})}
    reads++;await gate
    return {ok:!fail,json:async()=>fail?{error:'暂时不可用'}:{draftId:url.split('/').at(-1),params:{zoom:1.2}}}
  }}
  const store=createCustomEmblemStore({window})
  await store.ready
  const first=store.getDraft('one'),shared=store.getDraft('one')
  assert.equal(first,shared);assert.equal(reads,1)
  const rejected=assert.rejects(first,/暂时不可用/)
  release();await rejected
  fail=false
  const recovered=await store.getDraft('one')
  assert.equal(reads,2)
  assert.equal(await store.getDraft('one'),recovered)
  assert.equal(reads,2)
  await store.getDraft('two');assert.equal(reads,3)
  store.dispose()
})
