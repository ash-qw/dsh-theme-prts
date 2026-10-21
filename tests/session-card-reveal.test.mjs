import test from 'node:test'
import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {createSessionCardReveal} from '../src/client/session-card-reveal.js'

function fixture({reduced=false}={}) {
  const dom=new JSDOM('<main><div style="overflow-y:auto"><div data-row-key="session:target" aria-selected="false"></div></div></main>',{pretendToBeVisual:true})
  const {window}=dom,root=window.document.querySelector('main'),scroller=root.firstElementChild
  let row=scroller.firstElementChild,position=400,height=100,scroll=0,contentHeight=700,finish
  const calls=[],frames=new Map();let serial=0
  window.requestAnimationFrame=fn=>{frames.set(++serial,fn);return serial}
  window.cancelAnimationFrame=id=>frames.delete(id)
  const originalTimer=window.setTimeout.bind(window)
  window.setTimeout=(fn,ms)=>ms===1000?(finish=fn,0):originalTimer(fn,ms)
  const resizers=new Set()
  window.ResizeObserver=class {constructor(fn){this.fn=fn;resizers.add(this)}observe(){}disconnect(){}}
  window.matchMedia=()=>({matches:reduced})
  Object.defineProperties(scroller,{clientHeight:{get:()=>height},clientTop:{get:()=>0},scrollHeight:{get:()=>contentHeight},scrollTop:{get:()=>scroll,set:v=>{scroll=v}}})
  scroller.getBoundingClientRect=()=>({top:0,bottom:height,height})
  scroller.scrollTo=options=>{calls.push(options);if(options.behavior==='instant')scroll=options.top}
  const geometry=el=>{el.getBoundingClientRect=()=>({top:position-scroll,bottom:position-scroll+32,height:32})}
  geometry(row)
  const tracker=createSessionCardReveal({window,root,sessionId:'target',onDone:()=>{}})
  const pump=async()=>{await Promise.resolve();for(const [id,fn] of [...frames]){frames.delete(id);fn()}}
  return {window,root,scroller,calls,tracker,pump,get row(){return row},select:()=>row.setAttribute('aria-selected','true'),
    contentHeight:v=>{contentHeight=v;root.append(window.document.createElement('i'))},progress:v=>{scroll=v},resize:v=>{height=v;for(const r of resizers)r.fn()},move:v=>{position=v;root.append(window.document.createElement('i'))},
    remount:()=>{const next=row.cloneNode();geometry(next);row.replaceWith(next);row=next},finish:()=>finish(),
    close:()=>{tracker.cancel();dom.window.close()}}
}

test('reveal waits for native selection and does not restart a smooth scroll on unrelated mutations',async()=>{
  const f=fixture()
  try{
    await f.pump();assert.equal(f.calls.length,0)
    f.select();await f.pump();assert.deepEqual(f.calls,[{top:332,behavior:'smooth'}])
    f.progress(100);f.root.append(f.window.document.createElement('i'));await f.pump()
    assert.equal(f.calls.length,1)
  }finally{f.close()}
})
test('late viewport changes retarget smoothly without jumping from the current position',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(332)
    for(let i=0;i<10;i++)await f.pump()
    f.resize(70);await f.pump()
    assert.deepEqual(f.calls.at(-1),{top:362,behavior:'smooth'})
    assert.equal(f.scroller.scrollTop,332)
    f.progress(362);assert.equal(f.row.getBoundingClientRect().bottom,70)
  }finally{f.close()}
})
test('remounted selected cards smoothly follow a changed destination',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(332)
    f.remount();f.move(450);await f.pump()
    assert.deepEqual(f.calls.at(-1),{top:382,behavior:'smooth'})
  }finally{f.close()}
})
test('reduced motion jumps directly and user interruption cancels pending corrections',async()=>{
  const f=fixture({reduced:true})
  try{
    f.select();await f.pump();assert.deepEqual(f.calls,[{top:332,behavior:'instant'}])
    f.tracker.interrupt();const count=f.calls.length
    f.resize(60);await f.pump();assert.equal(f.calls.length,count)
  }finally{f.close()}
})
test('expiry checks changed geometry even when its scheduled frame has not run',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(332)
    f.resize(70);f.finish()
    assert.deepEqual(f.calls.at(-1),{top:362,behavior:'instant'})
    assert.equal(f.scroller.scrollTop,362)
    const count=f.calls.length;await f.pump();assert.equal(f.calls.length,count)
  }finally{f.close()}
})


test('growth below the target and unchanged remounts leave an in-flight destination untouched',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(100)
    f.contentHeight(900);await f.pump()
    f.remount();await f.pump()
    assert.deepEqual(f.calls,[{top:332,behavior:'smooth'}])
    assert.equal(f.scroller.scrollTop,100)
  }finally{f.close()}
})

test('reflow stops at the current visible card instead of pulling back to its top edge',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(200)
    f.move(220);await f.pump()
    assert.deepEqual(f.calls.at(-1),{top:200,behavior:'smooth'})
    assert.equal(f.scroller.scrollTop,200)
  }finally{f.close()}
})
test('invalid endpoints are corrected with the shortest remaining forward scroll',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(100)
    f.move(220);await f.pump()
    assert.deepEqual(f.calls.at(-1),{top:152,behavior:'smooth'})
  }finally{f.close()}
})


test('expiry completes an unfinished scroll without starting another animation',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(100);f.finish()
    assert.deepEqual(f.calls,[{top:332,behavior:'smooth'},{top:332,behavior:'instant'}])
    assert.equal(f.scroller.scrollTop,332)
  }finally{f.close()}
})
test('expiry preserves the current viewport when reflow already made the card visible',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(200);f.move(220);f.finish()
    assert.deepEqual(f.calls.at(-1),{top:200,behavior:'instant'})
    assert.equal(f.scroller.scrollTop,200)
  }finally{f.close()}
})
test('cancellation stops an owned animation even after the target disappears',async()=>{
  const f=fixture()
  try{
    f.select();await f.pump();f.progress(100);f.row.remove();f.finish()
    assert.deepEqual(f.calls.at(-1),{top:100,behavior:'instant'})
    const count=f.calls.length;f.tracker.cancel();await f.pump()
    assert.equal(f.calls.length,count)
  }finally{f.close()}
})
