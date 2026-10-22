import test from 'node:test'
import assert from 'node:assert/strict'
import {backgroundPlacement, validBackgroundRegion} from '../src/shared/background-region.js'

test('protection preserves centered framing when already visible and minimally corrects either edge',()=>{
  assert.equal(backgroundPlacement(1000,500,500,500,{x:.3,y:0,width:.2,height:1}).x,-250)
  assert.equal(backgroundPlacement(1000,500,500,500,{x:.8,y:0,width:.1,height:1}).x,-400)
  assert.equal(backgroundPlacement(1000,500,500,500,{x:.05,y:0,width:.2,height:1}).x,-50)
  assert.equal(backgroundPlacement(500,1000,500,500,{x:0,y:.8,width:1,height:.1}).y,-400)
  assert.equal(backgroundPlacement(1000,500,500,500).x,-250)
})
test('oversized regions preserve their center and report clipping without exposing empty space',()=>{
  const p=backgroundPlacement(1000,500,200,500,{x:.1,y:0,width:.8,height:1})
  assert.equal(p.x,-400);assert.equal(p.clipped,true)
  assert.equal(backgroundPlacement(1000,500,1000,500,{x:0,y:0,width:1,height:1}).clipped,false)
})
test('placement covers every viewport and contains every region that fits across aspect ratios',()=>{
  for(const iw of [200,1000])for(const ih of [200,1000])for(const w of [150,800])for(const h of [150,800])for(const x of [0,.4,.8])for(const y of [0,.4,.8]){
    const r={x,y,width:.2,height:.2},p=backgroundPlacement(iw,ih,w,h,r),eps=.000001
    assert.ok(p.x<=eps && p.y<=eps && p.x+p.width>=w-eps && p.y+p.height>=h-eps)
    if(r.width*p.width<=w){assert.ok(p.x+x*p.width>=-eps);assert.ok(p.x+(x+r.width)*p.width<=w+eps)}
    if(r.height*p.height<=h){assert.ok(p.y+y*p.height>=-eps);assert.ok(p.y+(y+r.height)*p.height<=h+eps)}
  }
})
test('invalid regions are rejected',()=>{
  for(const value of [undefined,[],{}, {x:0,y:0,width:0,height:1},{x:.9,y:0,width:.2,height:1},{x:0,y:NaN,width:1,height:1}])assert.ok(!validBackgroundRegion(value))
  assert.ok(validBackgroundRegion(null));assert.ok(validBackgroundRegion({x:0,y:0,width:1,height:1}))
})

test('oversized vertical protection preserves its top instead of centering',()=>{
  const p=backgroundPlacement(500,1000,500,200,{x:0,y:.2,width:1,height:.6})
  assert.equal(p.y,-200);assert.equal(p.clipped,true)
})
