import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'
import {build} from 'esbuild'
test.use({launchOptions:{ignoreDefaultArgs:['--hide-scrollbars']}})
let adapter
test.beforeAll(async()=>{
  const result=await build({entryPoints:['src/client/cursor-follower.js'],bundle:true,write:false,format:'iife',globalName:'FollowerTest'})
  adapter=result.outputFiles[0].text
})
async function setup(page){
 await page.setContent('<html data-dsh-prts data-prts-cursor="prts"><body><main id="large" style="padding:40px"></main><button id="action" style="position:fixed;top:20px;right:20px">Action</button><textarea style="position:fixed;top:70px;right:20px"></textarea><div id="resize" style="position:fixed;top:150px;right:20px;width:100px;height:30px;cursor:ew-resize">resize</div></body></html>')
 await page.evaluate(()=>{document.querySelector('#large').innerHTML=('<section>'+'<span>x</span>'.repeat(99)+'</section>').repeat(100);window.__ModuleLoader__={load:entry=>window.prtsTest=entry.factory(()=>({}))}})
 await page.addScriptTag({content:await readFile('lib/client.js','utf8')})
 await page.addStyleTag({content:await page.evaluate(()=>prtsTest.cssText)})
 await page.addScriptTag({content:adapter})
 await page.evaluate(()=>{window.follower=FollowerTest.createCursorAdapter({document,window,assets:prtsTest.assets.cursor});follower.update({enabled:true,cursor:'prts-follower'})})
}
test('follower animates large background, tracks both axes, restores functional cursors and disposes',async({page})=>{
 await setup(page)
 const overlay=page.locator('.prts-cursor-follower'),image=overlay.locator('img')
 await page.mouse.move(20,20)
 await expect(overlay).toBeVisible()
 await expect(page.locator('#large')).toHaveCSS('cursor','none')
 const idle=await image.getAttribute('src')
 await page.mouse.down()
 await expect(image).not.toHaveAttribute('src',idle)
 await expect(page.locator('#large')).not.toHaveAttribute('data-prts-hand-active','')
 expect(await page.locator('#large').evaluate(e=>e.style.cursor)).toBe('')
 await page.mouse.move(100,20)
 await expect.poll(()=>overlay.evaluate(e=>Math.round(e.getBoundingClientRect().x))).toBe(100)
 await page.mouse.move(100,100)
 await expect.poll(()=>overlay.evaluate(e=>Math.round(e.getBoundingClientRect().y))).toBe(100)
 await page.mouse.up()
 await expect(image).toHaveAttribute('src',idle)
 await page.locator('textarea').hover()
 await expect(overlay).toBeVisible()
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.text))
 await expect(page.locator('textarea')).toHaveCSS('cursor','none')
 await page.locator('textarea').fill('Native typing works')
 await expect(page.locator('textarea')).toHaveValue('Native typing works')
 await page.locator('#resize').hover()
 await expect(overlay).toBeVisible()
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.resize.ew))
 await expect(page.locator('#resize')).toHaveCSS('cursor','none')
 await page.locator('#action').hover()
 await expect(overlay).toBeVisible()
 expect(await image.getAttribute('src')).toBe(await page.evaluate(()=>prtsTest.assets.cursor.link.rest))
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')))
 await expect(overlay).toBeHidden()
 await page.mouse.move(20,20)
 await expect(overlay).toBeVisible()
 await page.evaluate(()=>follower.update({enabled:true,cursor:'prts'}))
 await expect(overlay).toHaveCount(0)
 await expect(page.locator('html')).not.toHaveAttribute('data-prts-follower-visible','')
})
test('follower survives rapid clicks and mode changes without duplicate layers or blocked clicks',async({page})=>{
 await setup(page)
 await page.evaluate(()=>{window.clicks=0;document.querySelector('#action').addEventListener('click',()=>clicks++)})
 for(let i=0;i<5;i++)await page.locator('#action').click()
 expect(await page.evaluate(()=>clicks)).toBe(5)
 await expect(page.locator('.prts-cursor-follower')).toHaveCount(1)
 await page.evaluate(()=>{for(let i=0;i<5;i++){follower.update({enabled:true,cursor:'prts'});follower.update({enabled:true,cursor:'prts-follower'})}})
 await page.mouse.move(20,20)
 await expect(page.locator('.prts-cursor-follower')).toHaveCount(1)
 await expect(page.locator('.prts-cursor-follower')).toBeVisible()
 await page.evaluate(()=>document.documentElement.dataset.prtsMotion='reduced')
 await page.mouse.down()
 await expect(page.locator('.prts-cursor-follower img')).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.hold))
 await page.mouse.up()
 await expect(page.locator('.prts-cursor-follower img')).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.rest))
 await page.evaluate(()=>{const dialog=document.createElement('dialog');dialog.innerHTML='<button>Modal button</button>';document.body.append(dialog);dialog.showModal()})
 await page.getByRole('button',{name:'Modal button'}).hover()
 await expect(page.locator('.prts-cursor-follower')).toBeVisible()
 await expect(page.getByRole('button',{name:'Modal button'})).toHaveCSS('cursor','none')
 expect(await page.locator('.prts-cursor-follower').evaluate(e=>e.matches(':popover-open'))).toBe(true)
 await page.evaluate(()=>document.querySelector('dialog').close())
 await page.mouse.move(20,20)
 await page.evaluate(()=>window.dispatchEvent(new Event('dragstart')))
 await expect(page.locator('.prts-cursor-follower')).toBeHidden()
 await page.mouse.move(30,20)
 await expect(page.locator('.prts-cursor-follower')).toBeVisible()
 await page.evaluate(()=>follower.dispose())
 await expect(page.locator('.prts-cursor-follower')).toHaveCount(0)
})
test('cursor boundary handoff completes without waiting for the next animation frame',async({page})=>{
 await setup(page)
 await page.mouse.move(20,20)
 await expect(page.locator('.prts-cursor-follower')).toBeVisible()
 const states=await page.evaluate(()=>{
   const original=window.requestAnimationFrame
   window.requestAnimationFrame=()=>999999
   try{
     return ['textarea','#action','#resize','#action'].map(selector=>{
       const target=document.querySelector(selector),rect=target.getBoundingClientRect()
       target.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',
         pointerId:1,isPrimary:true,buttons:0,clientX:rect.left+4,clientY:rect.top+4}))
       return {hidden:document.querySelector('.prts-cursor-follower').hidden,
         cursor:getComputedStyle(target).cursor,owned:document.documentElement.hasAttribute('data-prts-follower-visible')}
     })
   }finally{window.requestAnimationFrame=original}
 })
 expect(states.map(s=>s.hidden)).toEqual([false,false,false,false])
 expect(states.map(s=>s.owned)).toEqual([true,true,true,true])
 expect(states.map(s=>s.cursor)).toEqual(['none','none','none','none'])
})
test('chat width handles have PRTS resize cursors before hover and retain them across repeated crossings',async({page})=>{
 await setup(page)
 await page.addStyleTag({content:'.host_widthHandle{position:fixed;left:200px;top:20px;width:10px;height:200px;cursor:col-resize}.host_widthHandle span{display:block;width:100%;height:100%}'})
 await page.evaluate(()=>{const edge=document.createElement('div');edge.className='host_widthHandle';edge.innerHTML='<span></span>';document.body.append(edge)})
 const edge=page.locator('.host_widthHandle span')
 const native=()=>edge.evaluate(e=>getComputedStyle(e).cursor)
 expect(await native()).toMatch(/data:image\/png.*col-resize$/)
 for(let i=0;i<8;i++){
   await page.mouse.move(180,60)
   await expect(page.locator('.prts-cursor-follower')).toBeVisible()
   await page.mouse.move(205,60)
   await expect(page.locator('.prts-cursor-follower')).toBeVisible()
   await expect(page.locator('.prts-cursor-follower img')).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.resize.ew))
   expect(await native()).toBe('none')
   await page.mouse.down()
   await page.mouse.up()
 }
 await edge.evaluate(el=>el.addEventListener('pointerdown',e=>el.setPointerCapture(e.pointerId)))
 await page.mouse.down()
 await page.mouse.move(100,60)
 await expect(page.locator('.prts-cursor-follower img')).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.resize.ew))
 await page.mouse.up()
 await expect(page.locator('.prts-cursor-follower img')).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.rest))
 expect(await edge.evaluate(e=>e.style.cursor)).toBe('')
 await page.evaluate(()=>follower.dispose())
 expect(await native()).toMatch(/data:image\/png.*col-resize$/)
})
test('disabled, grab, crop and dynamic resize states share one renderer without exposing native cursors',async({page})=>{
 await setup(page)
 await page.evaluate(()=>{
   const area=document.createElement('div')
   area.style.cssText='position:fixed;top:250px;right:20px;width:180px'
   area.innerHTML='<button disabled><span id="disabled">Disabled</span></button><div id="grab" style="cursor:grab;height:30px">Grab</div><div data-prts-region-stage><div id="crop" data-prts-region-handle="ne" style="height:30px">Crop</div></div><div id="dynamic" style="cursor:ew-resize!important;height:30px"><span>Dynamic</span></div>'
   document.body.append(area)
   window.hiddenTransitions=[]
   new MutationObserver(rs=>{for(const r of rs)hiddenTransitions.push(r.oldValue)}).observe(document.documentElement,{attributes:true,attributeOldValue:true,attributeFilter:['data-prts-follower-visible']})
 })
 await page.mouse.move(20,20)
 await expect(page.locator('.prts-cursor-follower')).toBeVisible()
 await page.evaluate(()=>hiddenTransitions.length=0)
 const image=page.locator('.prts-cursor-follower img')
 for(const [selector,asset] of [['#disabled','unavailable'],['#grab','grab'],['#crop','resize.nesw'],['#dynamic span','resize.ew']]){
   await page.locator(selector).hover()
   await expect(image).toHaveAttribute('src',await page.evaluate(path=>path.split('.').reduce((v,k)=>v[k],prtsTest.assets.cursor),asset))
   await expect(page.locator(selector)).toHaveCSS('cursor','none')
 }
 await page.locator('#dynamic').evaluate(el=>el.style.setProperty('cursor','ns-resize','important'))
 await page.mouse.move(1320,365)
 await page.locator('#dynamic').hover()
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.resize.ns))
 await page.locator('#action').hover()
 await page.locator('#action').evaluate(el=>el.disabled=true)
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.unavailable))
 await page.locator('#action').evaluate(el=>el.disabled=false)
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.link.rest))
 expect(await page.evaluate(()=>hiddenTransitions.length)).toBe(0)
 await page.evaluate(()=>follower.dispose())
 await expect(page.locator('#dynamic')).toHaveCSS('cursor','ns-resize')
 expect(await page.locator('#dynamic').evaluate(el=>el.style.getPropertyValue('--prts-source-cursor'))).toBe('')
 await expect(page.locator('style[data-prts-cursor-semantics]')).toHaveCount(0)
})
test('message text uses the same overlay while native text selection remains available',async({page})=>{
 await setup(page)
 const point=await page.evaluate(()=>{
   const article=document.createElement('article');article.dataset.messageRole='user'
   article.style.cssText='position:fixed;left:500px;top:20px;width:200px;user-select:text'
   article.innerHTML='<div data-markdown><p id="selectable">Select these words</p></div>';document.body.append(article)
   const range=document.createRange();range.setStart(document.querySelector('#selectable').firstChild,0);range.setEnd(document.querySelector('#selectable').firstChild,1)
   const box=range.getBoundingClientRect();return {x:box.x+box.width/2,y:box.y+box.height/2}
 })
 await page.mouse.move(point.x,point.y)
 await expect(page.locator('.prts-cursor-follower img')).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.text))
 await expect(page.locator('#selectable')).toHaveCSS('cursor','none')
 await page.mouse.down();await page.mouse.move(point.x+80,point.y,{steps:5});await page.mouse.up()
 expect(await page.evaluate(()=>window.getSelection().toString().length)).toBeGreaterThan(0)
})

test('native cursor picker suppresses queued refreshes until page interaction resumes',async({page})=>{
 await setup(page)
 await page.evaluate(()=>{
  const select=document.createElement('select')
  select.id='mode';select.style.cssText='position:fixed;left:200px;top:20px'
  select.innerHTML='<option value="prts-follower">Animated</option><option value="system">System</option>'
  select.onchange=()=>follower.update({enabled:true,cursor:select.value})
  document.body.append(select)
 })
 const overlay=page.locator('.prts-cursor-follower')
 await page.locator('#mode').hover()
 await expect(overlay).toBeVisible()
 await page.locator('#mode').click()
 await page.evaluate(()=>{
  const select=document.querySelector('#mode')
  select.dispatchEvent(new FocusEvent('focusin',{bubbles:true}))
  select.dispatchEvent(new MouseEvent('click',{bubbles:true}))
  window.dispatchEvent(new Event('resize'))
 })
 await expect(overlay).toBeHidden()
 await expect(page.locator('html')).not.toHaveAttribute('data-prts-follower-visible','')
 await page.keyboard.press('Escape')
 await page.locator('#action').hover()
 await expect(overlay).toBeVisible()
 await page.locator('#mode').focus()
 await page.keyboard.press('ArrowDown')
 await expect(overlay).toBeHidden()
 await page.keyboard.press('Escape')
 await page.locator('#mode').selectOption('system')
 await expect(overlay).toHaveCount(0)
 await expect(page.locator('html')).not.toHaveAttribute('data-prts-follower-visible','')
})

test('stable movement reuses classification and stationary geometry changes re-hit',async({page})=>{
 await setup(page)
 await page.locator('#action').hover()
 await expect(page.locator('.prts-cursor-follower')).toBeVisible()
 const counts=await page.evaluate(async()=>{
  const originalStyle=window.getComputedStyle,originalHit=document.elementFromPoint
  let styles=0,hits=0
  window.getComputedStyle=function(...args){styles++;return originalStyle.apply(this,args)}
  document.elementFromPoint=function(...args){hits++;return originalHit.apply(this,args)}
  try{
   const target=document.querySelector('#action'),rect=target.getBoundingClientRect()
   for(let i=0;i<30;i++){
    target.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:rect.x+5+i%10,clientY:rect.y+5}))
    await new Promise(requestAnimationFrame)
   }
   return {styles,hits}
  }finally{window.getComputedStyle=originalStyle;document.elementFromPoint=originalHit}
 })
 expect(counts.styles).toBeLessThan(5)
 expect(counts.hits).toBeLessThan(5)
 await page.locator('#action').evaluate(el=>el.style.transform='translateY(300px)')
 await expect(page.locator('.prts-cursor-follower img')).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.rest))
})

test('text cache follows selectable state and new content without retaining character geometry',async({page})=>{
 await setup(page)
 const point=await page.evaluate(()=>{
  const article=document.createElement('article');article.dataset.messageRole='user'
  article.style.cssText='position:fixed;left:500px;top:20px;width:300px'
  article.innerHTML='<div data-markdown><p id="cache-text" style="user-select:text">A long line of selectable text</p></div>';document.body.append(article)
  const text=document.querySelector('#cache-text').firstChild,range=document.createRange()
  range.setStart(text,8);range.setEnd(text,9)
  const b=range.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}
 })
 const image=page.locator('.prts-cursor-follower img')
 await page.mouse.move(point.x,point.y)
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.text))
 await page.locator('#cache-text').evaluate(el=>el.style.userSelect='none')
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.rest))
 await page.locator('#cache-text').evaluate(el=>el.style.userSelect='text')
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.text))
 await page.locator('#cache-text').evaluate(el=>el.textContent='A')
 await page.mouse.move(point.x+1,point.y)
 await expect(image).toHaveAttribute('src',await page.evaluate(()=>prtsTest.assets.cursor.rest))
})

test('standard medium-container tap uses exactly two cursor writes and large containers stay static',async({page})=>{
 await setup(page)
 await page.evaluate(()=>{
  follower.update({enabled:true,cursor:'prts'})
  const area=document.createElement('div');area.id='tier-area'
  area.style.cssText='position:fixed;left:0;top:0;width:300px;height:300px;padding:30px;background:#111'
  area.innerHTML='<span>x</span>'.repeat(200);document.body.append(area)
  window.cursorWrites=0
  new MutationObserver(rs=>cursorWrites+=rs.filter(r=>r.attributeName==='style').length).observe(area,{attributes:true})
 })
 await page.mouse.move(15,15);await page.mouse.down()
 expect(await page.locator('#tier-area').evaluate(e=>e.style.cursor.includes(prtsTest.assets.cursor.hold))).toBe(true)
 await page.mouse.up()
 await expect(page.locator('#tier-area')).not.toHaveAttribute('data-prts-hand-active','')
 expect(await page.evaluate(()=>cursorWrites)).toBe(2)
 await page.locator('#tier-area').evaluate(e=>{e.innerHTML='<span>x</span>'.repeat(257);window.cursorWrites=0})
 await page.mouse.down();await page.mouse.up()
 expect(await page.locator('#tier-area').evaluate(e=>e.style.cursor)).toBe('')
 expect(await page.evaluate(()=>cursorWrites)).toBe(0)
})

test('follower tracks native range drags outside the slider and releases normally',async({page})=>{
 await setup(page)
 await page.evaluate(()=>{
  const range=document.createElement('input');range.type='range';range.id='drag-range';range.value='50'
  range.style.cssText='position:fixed;left:100px;top:300px;width:300px;height:30px'
  document.body.append(range)
 })
 const overlay=page.locator('.prts-cursor-follower')
 const box=await page.locator('#drag-range').boundingBox()
 const x=box.x+box.width/2,y=box.y+box.height/2
 await page.mouse.move(x,y)
 await expect(overlay).toBeVisible()
 await page.mouse.down()
 for(const [dx,dy] of [[80,0],[180,60],[-100,-40]]){
  await page.mouse.move(x+dx,y+dy,{steps:5})
  await expect.poll(()=>overlay.evaluate(e=>({x:Math.round(e.getBoundingClientRect().x),y:Math.round(e.getBoundingClientRect().y)}))).toEqual({x:Math.round(x+dx),y:Math.round(y+dy)})
 }
 await page.mouse.up()
 expect(Number(await page.locator('#drag-range').inputValue())).toBeLessThan(50)
 await page.mouse.move(50,50)
 await expect.poll(()=>overlay.evaluate(e=>Math.round(e.getBoundingClientRect().x))).toBe(50)
})

test('native scrollbar drag hides the frozen overlay until pointer events resume',async({page})=>{
 await setup(page)
 await page.addStyleTag({content:'#scroll-test::-webkit-scrollbar{width:16px}#scroll-test::-webkit-scrollbar-thumb{background:#888}'})
 await page.evaluate(()=>{
  const el=document.createElement('div');el.id='scroll-test';el.style.cssText='position:fixed;left:100px;top:300px;width:300px;height:200px;overflow:scroll'
  el.innerHTML='<div style="height:2000px">scroll content</div>';document.body.append(el)
 })
 const overlay=page.locator('.prts-cursor-follower')
 await page.mouse.move(392,310)
 await expect(overlay).toBeVisible()
 await page.mouse.down()
 await expect(overlay).toBeHidden()
 await expect(page.locator('html')).not.toHaveAttribute('data-prts-follower-visible','')
 await page.mouse.move(392,390,{steps:6})
 await expect.poll(()=>page.locator('#scroll-test').evaluate(e=>e.scrollTop)).toBeGreaterThan(0)
 await expect(overlay).toBeHidden()
 await page.mouse.up()
 await page.mouse.move(250,250)
 await expect(overlay).toBeVisible()
 await expect.poll(()=>overlay.evaluate(e=>Math.round(e.getBoundingClientRect().y))).toBe(250)
})
