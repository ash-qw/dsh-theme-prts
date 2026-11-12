import test from 'node:test'
import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {createSessionCardReveal} from '../src/client/session-card-reveal.js'

function fixture({reduced=false,onDone=()=>{}}={}) {
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
  const tracker=createSessionCardReveal({window,root,sessionId:'target',onDone})
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


test('temporary selection reveals before native navigation and completes only after motion settles',async()=>{
  let done=0
  const f=fixture({onDone:()=>done++})
  try {
    f.row.setAttribute('data-prts-selection-target','true')
    await f.pump()
    assert.equal(f.row.getAttribute('aria-selected'),'false')
    assert.deepEqual(f.calls,[{top:332,behavior:'smooth'}])
    f.progress(100)
    await new Promise(resolve=>setTimeout(resolve,100));await f.pump()
    assert.equal(done,0,'an unfinished scroll must block navigation')
    f.progress(332);await f.pump();await f.pump()
    await new Promise(resolve=>setTimeout(resolve,100));await f.pump()
    assert.equal(done,1)
    const count=f.calls.length
    f.resize(60);await f.pump()
    assert.equal(f.calls.length,count,'no correction remains after navigation starts')
  } finally {f.close()}
})

test('cancelled pre-navigation reveal never opens its old destination',async()=>{
  let done=0
  const f=fixture({onDone:()=>done++})
  try {
    f.row.setAttribute('data-prts-selection-target','true');await f.pump()
    f.progress(100);f.tracker.cancel();f.progress(332)
    await new Promise(resolve=>setTimeout(resolve,100));await f.pump()
    assert.equal(done,0)
    assert.deepEqual(f.calls.at(-1),{top:100,behavior:'instant'})
  } finally {f.close()}
})

function nestedFixture(options) {
  const fixtureState=fixture(options)
  const {window,root,scroller,row}=fixtureState
  const outer=window.document.createElement('aside')
  outer.setAttribute('data-prts-region','sessions')
  outer.style.overflowY='auto'
  root.before(outer)
  outer.append(root)
  Object.defineProperties(outer,{clientHeight:{value:40},clientTop:{value:0},scrollHeight:{value:200},scrollTop:{value:0,writable:true}})
  outer.getBoundingClientRect=()=>({top:0,bottom:40,height:40})
  outer.scrollTo=options=>{outer.scrollTop=options.top}
  scroller.getBoundingClientRect=()=>({top:-outer.scrollTop,bottom:100-outer.scrollTop,height:100})
  row.getBoundingClientRect=()=>({top:20-outer.scrollTop-scroller.scrollTop,bottom:52-outer.scrollTop-scroller.scrollTop,height:32})
  const reveals=[]
  row.scrollIntoView=options=>{reveals.push(options);if(options.behavior==='instant')outer.scrollTop=12}
  return {...fixtureState,outer,reveals}
}

test('outer clipping blocks navigation until the ancestor scroll has settled',async()=>{
  let done=0
  const fixtureState=nestedFixture({onDone:()=>done++})
  try {
    fixtureState.select()
    await fixtureState.pump();await fixtureState.pump()
    assert.deepEqual(fixtureState.reveals,[{block:'nearest',inline:'nearest',behavior:'smooth'}])
    await new Promise(resolve=>setTimeout(resolve,100));await fixtureState.pump()
    assert.equal(done,0)
    assert.equal(fixtureState.reveals.length,1)
    fixtureState.outer.scrollTop=12
    await fixtureState.pump();await fixtureState.pump()
    await new Promise(resolve=>setTimeout(resolve,100));await fixtureState.pump()
    assert.equal(done,1)
  } finally {fixtureState.close()}
})

test('expiry fixes outer clipping before completing navigation',async()=>{
  let visibleAtNavigation=false
  const fixtureState=nestedFixture({onDone:()=>{visibleAtNavigation=fixtureState.row.getBoundingClientRect().bottom<=40}})
  try {
    fixtureState.select();await fixtureState.pump();await fixtureState.pump()
    fixtureState.finish()
    assert.deepEqual(fixtureState.reveals.at(-1),{block:'nearest',inline:'nearest',behavior:'instant'})
    assert.equal(visibleAtNavigation,true)
  } finally {fixtureState.close()}
})

test('nonoverflowing wrappers do not hide the actual session scrollport',async()=>{
  const fixtureState=fixture()
  try {
    const wrapper=fixtureState.window.document.createElement('div')
    wrapper.style.overflowY='auto'
    Object.defineProperties(wrapper,{clientHeight:{value:700},scrollHeight:{value:700}})
    wrapper.getBoundingClientRect=()=>({top:0,bottom:700,height:700})
    fixtureState.row.before(wrapper)
    wrapper.append(fixtureState.row)
    fixtureState.select();await fixtureState.pump()
    assert.deepEqual(fixtureState.calls,[{top:332,behavior:'smooth'}])
  } finally {fixtureState.close()}
})
