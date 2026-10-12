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
