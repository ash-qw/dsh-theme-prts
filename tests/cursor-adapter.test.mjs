import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createCursorAdapter } from '../src/client/cursor-adapter.js'

function setup() {
  const dom = new JSDOM('<html><body><button style="cursor:url(data:image/png;base64,AA),pointer">Press</button><input style="cursor:text"></body></html>')
  const { window } = dom
  const { document } = window
  const timers = new Map()
  let id = 0, now = 0
  Object.defineProperty(window.performance, "now", { value: () => now })
  window.setTimeout = (fn, delay=0) => { const due=now+delay;timers.set(++id, () => { now=Math.max(now,due);fn() }); return id }
  window.clearTimeout = key => timers.delete(key)
  window.matchMedia = () => ({ matches: false })
  const assets = { hotspot: [7, 6], textHotspot: [24, 24], textClick: [{ url: 'text-click', duration: 16 }, { url: 'end', duration: 60000 }], hold: 'hold', press: [{ url: 'press', duration: 16 }, { url: 'end', duration: 60000 }], release: [{ url: 'release', duration: 16 }, { url: 'end', duration: 60000 }] }
  const adapter = createCursorAdapter({ document, window, assets })
  const active = { enabled: true, cursor: 'prts' }
  adapter.update(active)
  const frame = () => document.querySelector('[data-prts-hand-active]')?.style.cursor ?? ''
  const fire = (name, overrides = {}, target = document.querySelector('button')) => {
    const event = new window.Event(name, { bubbles: true })
    Object.assign(event, { pointerType: 'mouse', button: 0, pointerId: 1, isPrimary: true, buttons: 1 }, overrides)
    target.dispatchEvent(event)
  }
  const tick = () => { const next = timers.entries().next().value; if (next) { timers.delete(next[0]); next[1]() } }
  return { dom, window, document, adapter, active, frame, fire, tick, timers, assets, advance:ms=>{now+=ms} }
}

test('normal press, hold and release preserve native text cursors and ignore secondary/touch input', () => {
  const s = setup()
  for (const event of [{ button: 2 }, { pointerType: 'touch' }]) s.fire('pointerdown', event)
  s.fire('pointerdown', {}, s.document.querySelector('input'))
  assert.equal(s.frame(), '')
  s.fire('pointerdown'); assert.match(s.frame(), /press/)
  s.tick(); assert.match(s.frame(), /hold/); assert.equal(s.timers.size, 0)
  s.fire('pointerup'); assert.match(s.frame(), /release/)
  s.tick(); assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  s.adapter.dispose(); s.dom.window.close()
})

test('fast repeat gestures, blur, cancellation, system selection and disposal never leave held frames', () => {
  const s = setup()
  s.fire('pointerdown'); s.fire('pointerup'); s.fire('pointerdown')
  assert.equal(s.timers.size, 1); s.tick(); assert.match(s.frame(), /hold/)
  for (const name of ['blur', 'pointercancel', 'dragstart']) {
    s.fire('pointerdown'); s.fire(name, {}, name === 'blur' ? s.window : undefined); assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  }
  s.fire('pointerdown'); s.fire('pointermove', { buttons: 0 }); assert.equal(s.frame(), '')
  s.fire('pointerdown'); s.adapter.update({ ...s.active, cursor: 'system' })
  s.fire('pointerdown'); assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  s.adapter.update(s.active); s.adapter.update(s.active)
  s.document.documentElement.dataset.prtsMotion = 'reduced'
  s.fire('pointerdown'); assert.match(s.frame(), /hold/); assert.equal(s.timers.size, 0)
  s.fire('pointerup'); assert.equal(s.frame(), '')
  s.fire('pointerdown'); s.adapter.dispose(); s.fire('pointerdown'); assert.equal(s.frame(), '')
  s.dom.window.close()
})

test('text cursor remains static through clicks, selection, exit and disposal', () => {
  const s = setup()
  const input = s.document.querySelector('input')
  input.style.cursor = 'url(data:image/png;base64,AA), text'
  const textFrame = () => s.document.documentElement.style.getPropertyValue('--prts-text-frame')
  const down = () => s.fire('pointerdown', { clientX: 10, clientY: 10 }, input)
  down(); assert.equal(textFrame(), ''); assert.equal(s.frame(), '')
  s.fire('pointerup', {}, input); assert.equal(textFrame(), '')
  s.tick(); assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  down(); down(); assert.equal(s.timers.size, 0)
  s.fire('pointermove', { clientX: 25, clientY: 10 }, input)
  assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  down(); s.fire('pointermove'); assert.equal(textFrame(), '')
  down(); s.fire('pointerout'); assert.equal(textFrame(), '')
  s.document.documentElement.dataset.prtsMotion = 'reduced'
  down(); assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  s.document.documentElement.dataset.prtsMotion = 'system'
  down(); s.adapter.dispose(); assert.equal(textFrame(), ''); assert.equal(s.timers.size, 0)
  s.dom.window.close()
})

test('focus changes inside the page do not cancel a new gesture, but window blur does', () => {
  const s = setup()
  s.fire('pointerdown')
  s.document.querySelector('input').dispatchEvent(new s.window.Event('blur'))
  assert.match(s.frame(), /press/)
  s.tick(); assert.match(s.frame(), /hold/)
  s.window.dispatchEvent(new s.window.Event('blur'))
  assert.equal(s.frame(), ''); assert.equal(s.timers.size, 0)
  s.adapter.dispose(); s.dom.window.close()
})

test('quick taps complete press and briefly hold before release, without queueing repeated clicks', () => {
  const s = setup()
  s.fire('pointerdown'); s.fire('pointerup')
  assert.match(s.frame(), /press/)
  s.tick(); assert.match(s.frame(), /hold/)
  s.tick(); assert.match(s.frame(), /release/)
  s.tick(); assert.equal(s.frame(), '')
  s.fire('pointerdown'); s.fire('pointerup'); s.tick()
  s.fire('pointerdown'); assert.match(s.frame(), /press/); assert.equal(s.timers.size, 1)
  s.tick(); assert.match(s.frame(), /hold/); assert.equal(s.timers.size, 0)
  s.adapter.dispose(); s.dom.window.close()
})

test('hand animation stays local, restores inline cursors and leaves large backgrounds static', () => {
  const s = setup()
  const button = s.document.querySelector('button')
  const original = button.style.cursor
  const observer = new s.window.MutationObserver(() => {})
  observer.observe(s.document.documentElement, { attributes: true })
  s.fire('pointerdown')
  assert.match(button.style.cursor, /press/)
  s.tick(); s.fire('pointerup'); s.tick()
  assert.equal(button.style.cursor, original)
  assert.equal(observer.takeRecords().length, 0)
  const background = s.document.createElement('div')
  background.style.cursor = original
  background.innerHTML = '<span>Content</span>'.repeat(150)
  s.document.body.append(background)
  s.fire('pointerdown', {}, background)
  assert.equal(s.timers.size, 0)
  assert.equal(background.style.cursor, original)
  assert.equal(s.frame(), '')
  s.fire('pointerdown')
  s.fire('pointermove', {}, background)
  assert.equal(button.style.cursor, original)
  assert.equal(background.style.cursor, original)
  s.fire('pointermove', {}, button)
  assert.match(button.style.cursor, /press/)
  s.adapter.dispose()
  assert.equal(button.style.cursor, original)
  observer.disconnect(); s.dom.window.close()
})

test('cleanup preserves a cursor changed by another plugin during a hand gesture', () => {
  const s = setup()
  const button = s.document.querySelector('button')
  s.fire('pointerdown')
  button.style.cursor = 'grab'
  s.adapter.dispose()
  assert.equal(button.style.cursor, 'grab')
  s.dom.window.close()
})

for (const change of ['value', 'priority', 'remove']) {
  for (const phase of ['press', 'hold', 'release']) {
    test(`host cursor ${change} during ${phase} stops animation without restoring stale state`, () => {
      const s = setup()
      const button = s.document.querySelector('button')
      s.fire('pointerdown')
      if (phase !== 'press') s.tick()
      if (phase === 'release') s.fire('pointerup')
      if (change === 'value') button.style.cursor = 'grab'
      if (change === 'priority') button.style.setProperty('cursor', button.style.cursor, 'important')
      if (change === 'remove') button.style.removeProperty('cursor')
      const value = button.style.cursor
      const priority = button.style.getPropertyPriority('cursor')
      if (phase === 'hold') s.fire('pointermove')
      else s.tick()
      assert.equal(s.frame(), '')
      assert.equal(s.timers.size, 0)
      s.fire('pointermove'); s.fire('pointerup'); s.tick(); s.adapter.dispose()
      assert.equal(button.style.cursor, value)
      assert.equal(button.style.getPropertyPriority('cursor'), priority)
      s.dom.window.close()
    })
  }
}

test('pointer bursts coalesce style reads and disposal cancels pending movement',()=>{
  const s=setup(),frames=new Map();let id=0,reads=0
  s.assets.resize={ew:"resize"}
  s.window.requestAnimationFrame=fn=>{frames.set(++id,fn);return id}
  s.window.cancelAnimationFrame=id=>frames.delete(id)
  const original=s.window.getComputedStyle.bind(s.window)
  s.window.getComputedStyle=(...args)=>{reads++;return original(...args)}
  for(let i=0;i<100;i++)s.fire('pointermove',{clientX:i,clientY:10})
  assert.equal(reads,0);assert.equal(frames.size,1)
  frames.values().next().value()
  assert.equal(reads,1);assert.equal(frames.size,0)
  s.fire('pointermove');s.adapter.dispose()
  assert.equal(frames.size,0)
  s.dom.window.close()
})

test('late animation callbacks skip expired frames and finish without replaying them',()=>{
  const s=setup()
  s.assets.press=[{url:'first',duration:16},{url:'second',duration:16},{url:'third',duration:16},{url:'end',duration:60000}]
  s.fire('pointerdown');assert.match(s.frame(),/first/)
  s.advance(35);s.tick();assert.match(s.frame(),/third/)
  s.advance(1000);s.tick();assert.match(s.frame(),/hold/)
  assert.equal(s.timers.size,0)
  s.fire('pointerup');s.advance(1000);s.tick()
  assert.equal(s.frame(),'');assert.equal(s.timers.size,0)
  s.adapter.dispose();s.dom.window.close()
})

test('identical adjacent frames do not rewrite the native cursor',()=>{
  const s=setup()
  s.assets.press=[{url:'same',duration:16},{url:'same',duration:16},{url:'end',duration:60000}]
  s.fire('pointerdown')
  const observer=new s.window.MutationObserver(()=>{})
  observer.observe(s.document.querySelector('button'),{attributes:true,attributeFilter:['style']})
  s.tick();assert.equal(observer.takeRecords().length,0)
  s.adapter.dispose();observer.disconnect();s.dom.window.close()
})
