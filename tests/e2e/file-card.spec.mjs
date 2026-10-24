import {test,expect} from '@playwright/test'
const frameBounds=locator=>locator.evaluate(e=>{
  const boxes=[...e.children].map(c=>c.getBoundingClientRect())
  const x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y))
  const right=Math.max(...boxes.map(b=>b.right)),bottom=Math.max(...boxes.map(b=>b.bottom))
  return {x,y,right,bottom,width:right-x,height:bottom-y}
})
for(const scheme of ['light','dark'])test(`all file presentations share rounded outlines and working actions (${scheme})`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  if(await page.locator('html').getAttribute('data-prts-scheme')!==scheme)await page.locator('[data-prts-scheme-toggle]').click()
  await page.addStyleTag({content:'*,*::before,*::after{corner-shape:superellipse(1.5)}'})
  await page.evaluate(()=>{
    const examples=document.createElement('section')
    examples.style.cssText='display:grid;gap:16px;padding:24px'
    examples.innerHTML=`<div data-presented-file style="position:relative;padding:12px"><button type="button" class="host_cardPreview" aria-label="Preview file" style="position:absolute;inset:0;background:transparent;border:0"></button><span>交付文件.txt</span></div>
      <div class="host_card" data-changed-files style="overflow:hidden;border-radius:16px;border:1px solid #999"><span class="_root_hash_1"><button type="button" class="host_header" style="width:100%;border:0"><span class="host_tile">▤</span><span class="host_titles">修改文件.txt</span></button></span></div>
      <div data-changed-files class="grouped_card" style="overflow:hidden">
        <button type="button" class="grouped_header" style="display:flex;width:100%;padding:10px;border:0"><span class="grouped_tile">▤</span><span class="grouped_titles">已编辑 2 个文件</span></button>
        <ul style="list-style:none;margin:0;padding:0;border-top:1px solid #999"><li><span><button type="button" class="grouped_row" style="width:100%;padding:8px;border:0">审核说明.md +127</button></span></li><li><span><button type="button" class="grouped_row" style="width:100%;padding:8px;border:0">待审核.patch +46</button></span></li></ul>
        <button type="button" class="grouped_toggle" aria-expanded="false" style="border:0">展开文件</button>
      </div>
      <button type="button" class="host_fileLink">工具文件引用.txt</button>
      <button type="button" class="_fileMention_hash_1 _fileLink_hash_2">正文文件引用.txt</button>
      <div data-produced-files-row><button type="button">生成文件.txt</button></div>`
    for(const button of examples.querySelectorAll('button'))button.onclick=()=>button.dataset.opened='true'
    document.querySelector('[data-chat-flow-kind="assistant-step"]').append(examples)
  })
  const cards=page.locator('[data-presented-file],[data-changed-files],[data-prts-conversation-control="file"]')
  await expect(cards).toHaveCount(5)
  await expect(page.locator('.host_card')).toHaveCSS('border-radius','10px')
  await expect(page.locator('.host_card')).toHaveCSS('corner-shape','round')
  await expect(page.locator('.host_card')).toHaveCSS('border-width','1px')
  for(const button of await page.locator('[data-changed-files] button').all()){
    await expect(button).not.toHaveAttribute('data-prts-conversation-control',/./)
    await expect(button).toHaveCSS('border-width','0px')
    await button.click();await expect(button).toHaveAttribute('data-opened','true')
  }
  await expect(page.locator('.host_fileLink')).not.toHaveAttribute('data-prts-conversation-control',/./)
  const hit=page.locator('.host_cardPreview')
  await expect(hit).not.toHaveAttribute('data-prts-conversation-control',/./)
  await expect(hit).toHaveCSS('background-color','rgba(0, 0, 0, 0)')
  for(const card of await cards.all()){
    await expect(card).toHaveCSS('border-radius','10px')
    await expect(card).toHaveCSS('corner-shape','round')
    await expect(card).toHaveCSS('clip-path','none')
    await expect(card).toHaveCSS('border-style','solid')
    const before=await card.evaluate(e=>getComputedStyle(e).borderTopColor)
    await card.hover()
    const highlight=await card.evaluate(e=>getComputedStyle(e).borderTopColor)
    expect(highlight).toBe(before)
    const frame=page.locator('[data-prts-body-target-frame]')
    await expect(frame).toHaveCSS('opacity','1')
    await expect(frame.locator('i')).toHaveCount(4)
    await expect.poll(async()=>Math.abs((await frameBounds(frame)).x-(await card.boundingBox()).x+5)).toBeLessThan(.55)
    const button=await card.evaluate(e=>e.tagName==='BUTTON')?card:card.locator('button').first()
    await button.click();await expect(button).toHaveAttribute('data-opened','true')
    await page.mouse.move(0,0);await button.focus()
    await expect(card).toHaveCSS('border-top-color',highlight)
    await button.evaluate(e=>e.blur())
  }
  await page.locator('[data-presented-file]').hover()
  await expect.poll(async()=>Math.abs((await frameBounds(page.locator('[data-prts-body-target-frame]'))).x-(await page.locator('[data-presented-file]').boundingBox()).x+5)).toBeLessThan(.55)
  const shot=await page.locator('[data-presented-file]').boundingBox()
  await page.screenshot({path:`/tmp/prts-rounded-file-${scheme}.png`,clip:{x:shot.x-10,y:shot.y-10,width:shot.width+20,height:shot.height+20}})
})


for(const width of [1280,390])test(`long tool file paths stay on one unclipped line (${width})`,async({page})=>{
  await page.setViewportSize({width,height:900})
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,conversationStyle:'deck-chat'})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  if(width<600)await page.addStyleTag({content:'.frame{grid-template-columns:0 minmax(0,1fr) 0}.sidebar-col{visibility:hidden}.center-col{grid-column:2;min-width:0}'})
  await page.addStyleTag({content:`
    .toolFixture {position:fixed;inset:100px 20px auto;z-index:9999;padding:16px;background:#30383b;color:#eee}
    .toolFixture>div {display:flex;align-items:center;gap:12px;height:24px;overflow:hidden;font-size:13px;line-height:24px}
    .toolFixture label {flex-shrink:0}
    .o3BgMG_fileLink {text-overflow:ellipsis;white-space:nowrap;min-width:0;font:inherit;text-align:left;font-size:13px;line-height:24px;color:inherit;text-underline-offset:3px;cursor:pointer;background:transparent;border:none;flex:0 auto;margin:0;padding:0;text-decoration:underline 1px dotted;overflow:hidden}
  `})
  await page.evaluate(()=>{
    const fixture=document.createElement('section');fixture.className='toolFixture'
    const row=document.createElement('div'),label=document.createElement('label'),link=document.createElement('button')
    label.textContent='读取';link.className='o3BgMG_fileLink';link.type='button'
    link.textContent='/attachments/v1/files/'+ 'a'.repeat(140)+'/analyze_agent/周期调度 超长 OR 语句环境报告.md'
    link.onclick=()=>link.dataset.opened='true'
    row.append(label,link);fixture.append(row)
    const next=document.createElement('div');next.textContent='工具调用 · ssh_list';fixture.append(next)
    document.querySelector('[data-chat-flow-kind="assistant-step"]').append(fixture)
  })
  const link=page.locator('.o3BgMG_fileLink')
  await expect(link).toHaveCSS('white-space','nowrap')
  await expect(link).toHaveCSS('padding','0px')
  await expect(link).toHaveCSS('background-color','rgba(0, 0, 0, 0)')
  await expect(link).not.toHaveAttribute('data-prts-conversation-control',/./)
  const box=await link.boundingBox(),row=await link.locator('..').boundingBox()
  expect(box.height).toBe(24);expect(box.y).toBeGreaterThanOrEqual(row.y)
  expect(box.y+box.height).toBeLessThanOrEqual(row.y+row.height)
  await link.click();await expect(link).toHaveAttribute('data-opened','true')
  await link.focus();await page.keyboard.press('Enter');await expect(link).toBeFocused()
  await page.locator('.toolFixture').screenshot({path:`/tmp/prts-tool-file-${width}.png`})
})

test('body corner feedback supports focus and leaves shell controls alone',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>{
    const body=document.querySelector('[data-chat-flow-kind="assistant-step"]')
    body.insertAdjacentHTML('beforeend','<button id="corner-action">复制内容</button><button id="corner-next">重试</button>')
    document.querySelector('[data-prts-region="operation"]').insertAdjacentHTML('beforeend','<button id="corner-shell" class="host_sessionLogButton">标题操作</button>')
  })
  const action=page.locator('#corner-action'), next=page.locator('#corner-next')
  await expect(action).toHaveAttribute('data-prts-conversation-control','micro')
  const idle=await action.evaluate(e=>getComputedStyle(e).borderColor)
  const frame=page.locator('[data-prts-body-target-frame]')
  await expect(frame).toHaveCount(1)
  await expect(frame).toHaveCSS('opacity','0')
  await action.hover()
  await expect(frame).toHaveCSS('opacity','1')
  await expect(action).toHaveCSS('border-color',idle)
  const gap=async target=>Math.abs((await frameBounds(frame)).x-(await target.boundingBox()).x+5)
  await expect.poll(()=>gap(action)).toBeLessThan(.55)
  const resting=await action.boundingBox()
  await page.mouse.down()
  expect(await action.boundingBox()).toEqual(resting)
  await expect(frame).toHaveAttribute('data-pressed','')
  await expect.poll(async()=>Math.abs((await frameBounds(frame)).x-resting.x+3)).toBeLessThan(.55)
  await page.mouse.up()
  await expect(frame).not.toHaveAttribute('data-pressed')
  await expect.poll(()=>gap(action)).toBeLessThan(.55)
  const oldX=(await frameBounds(frame)).x
  const targetX=(await next.boundingBox()).x-5
  const between=await next.evaluate(async e=>{
    const box=e.getBoundingClientRect()
    e.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:box.left+box.width/2,clientY:box.top+box.height/2}))
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))
    const frame=document.querySelector('[data-prts-body-target-frame]')
    return {x:frame.firstElementChild.getBoundingClientRect().x,alpha:Number(frame.style.opacity)}
  })
  expect(between.x).toBeGreaterThan(Math.min(oldX,targetX))
  expect(between.x).toBeLessThan(Math.max(oldX,targetX))
  expect(between.alpha).toBe(1)
  await next.hover()
  await expect(frame).toHaveCSS('opacity','1')
  await expect.poll(()=>gap(next)).toBeLessThan(.55)
  await page.mouse.move(0,0)
  await action.evaluate(e=>e.blur())
  await expect(frame).toHaveCSS('opacity','0')
  await page.keyboard.press('Tab')
  await action.focus()
  await expect(frame).toHaveCSS('opacity','1')
  await expect.poll(()=>gap(action)).toBeLessThan(.55)
  await page.emulateMedia({reducedMotion:'reduce'})
  await next.hover()
  await expect.poll(()=>gap(next)).toBeLessThan(.55)
  await page.locator('#corner-shell').hover()
  await expect(frame).toHaveCSS('opacity','1')
  await expect.poll(()=>gap(page.locator('#corner-shell'))).toBeLessThan(.55)
})

test('shared frame stays pixel aligned and follows target resizing without pointer movement',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>{
    document.querySelector('[data-chat-flow-kind="assistant-step"]').insertAdjacentHTML('beforeend','<button id="stable-corner" style="position:fixed;left:420.3px;top:180.3px;width:100.4px;height:32.4px"><span>复制</span></button>')
  })
  const button=page.locator('#stable-corner'),frame=page.locator('[data-prts-body-target-frame]')
  await button.hover()
  await expect(frame).toHaveCSS('opacity','1')
  await expect.poll(async()=>Math.abs((await frameBounds(frame)).width-(await button.boundingBox()).width-10)).toBeLessThan(1)
  await expect(frame.locator('i').first()).toHaveCSS('width','7px')
  expect(await frame.locator('i').first().evaluate(e=>getComputedStyle(e,'::before').height)).toBe('1px')
  await button.evaluate(e=>e.style.width='170.4px')
  await expect.poll(async()=>Math.abs((await frameBounds(frame)).width-(await button.boundingBox()).width-10)).toBeLessThan(1)
  const samples=await frame.evaluate(async e=>{
    const samples=[]
    for(let i=0;i<12;i++){
      await new Promise(requestAnimationFrame)
      const a=e.firstElementChild.getBoundingClientRect(),z=e.lastElementChild.getBoundingClientRect()
      samples.push([a.x,a.y,z.right,z.bottom].map(v=>v*devicePixelRatio))
    }
    return samples
  })
  for(const sample of samples)for(const coordinate of sample)expect(coordinate).toBeCloseTo(Math.round(coordinate),4)
  expect(new Set(samples.map(JSON.stringify)).size).toBe(1)
})

test('entry finishes position, size and opacity together without a second adjustment',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>{
    document.querySelector('[data-chat-flow-kind="assistant-step"]').insertAdjacentHTML('beforeend','<button id="entry-corner" style="position:fixed;left:320px;top:180px;width:640px;height:40px">复制</button>')
  })
  await expect(page.locator('#entry-corner')).toHaveAttribute('data-prts-conversation-control','micro')
  const samples=await page.locator('#entry-corner').evaluate(async e=>{
    const b=e.getBoundingClientRect(),frame=document.querySelector('[data-prts-body-target-frame]')
    e.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:b.left+b.width/2,clientY:b.top+b.height/2}))
    const samples=[]
    for(let i=0;i<45;i++){
      await new Promise(requestAnimationFrame)
      const a=frame.firstElementChild.getBoundingClientRect(),z=frame.lastElementChild.getBoundingClientRect()
      samples.push({opacity:Number(frame.style.opacity),box:[a.x,a.y,z.right-a.x,z.bottom-a.y]})
    }
    return samples
  })
  expect(samples.some(s=>s.opacity>0 && s.opacity<1)).toBe(true)
  const complete=samples.filter(s=>s.opacity===1)
  expect(complete.length).toBeGreaterThan(5)
  expect(new Set(complete.map(s=>JSON.stringify(s.box))).size).toBe(1)
  expect(complete[0].box).toEqual([315,175,650,50])
})

test('frame animation caches geometry and idle pointer movement causes no redraw',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>document.querySelector('[data-chat-flow-kind="assistant-step"]').insertAdjacentHTML('beforeend','<button id="perf-corner" style="position:fixed;left:400px;top:200px;width:160px;height:32px"><span>复制</span></button>'))
  await expect(page.locator('#perf-corner')).toHaveAttribute('data-prts-conversation-control','micro')
  const result=await page.locator('#perf-corner').evaluate(async e=>{
    const frame=document.querySelector('[data-prts-body-target-frame]')
    let reads=0,changes=0
    const original=e.getBoundingClientRect.bind(e)
    e.getBoundingClientRect=()=>{reads++;return original()}
    const move=()=>e.firstElementChild.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:480,clientY:216}))
    move()
    for(let i=0;i<30;i++)await new Promise(requestAnimationFrame)
    const animationReads=reads
    reads=0
    const observer=new MutationObserver(records=>changes+=records.length)
    observer.observe(frame,{attributes:true,subtree:true})
    for(let i=0;i<1000;i++)move()
    for(let i=0;i<4;i++)await new Promise(requestAnimationFrame)
    observer.disconnect()
    return {animationReads,idleReads:reads,idleChanges:changes,geometry:[...frame.children].map(c=>[c.style.width,c.style.height,c.style.left,c.style.top]),opacity:frame.style.opacity}
  })
  expect(result.animationReads).toBeLessThanOrEqual(3)
  expect(result.idleReads).toBe(0)
  expect(result.idleChanges).toBe(0)
  expect(result.geometry).toEqual(Array.from({length:4},()=>['','','','']))
  expect(result.opacity).toBe('1')
  await page.locator('#perf-corner').evaluate(e=>e.style.display='none')
  await expect(page.locator('[data-prts-body-target-frame]')).toHaveCSS('opacity','0')
})

test('repeated crossings and continued pointer movement never postpone the fade',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>document.querySelector('[data-chat-flow-kind="assistant-step"]').insertAdjacentHTML('beforeend','<button id="repeat-corner" style="position:fixed;left:400px;top:200px;width:160px;height:32px">复制</button>'))
  await expect(page.locator('#repeat-corner')).toHaveAttribute('data-prts-conversation-control','micro')
  const rounds=await page.locator('#repeat-corner').evaluate(async e=>{
    const frame=document.querySelector('[data-prts-body-target-frame]'),results=[]
    const move=(node,x,y)=>node.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:x,clientY:y}))
    const tick=()=>new Promise(requestAnimationFrame)
    for(let round=0;round<3;round++){
      for(let i=0;i<20;i++){
        move(i%2?document.body:e,i%2?650:480,216)
        await tick()
      }
      move(e,480,216)
      const entered=performance.now()
      while(performance.now()-entered<320)await tick()
      const opacityAfterEntry=Number(frame.style.opacity)
      move(document.body,650,216)
      const exited=performance.now()
      let i=0
      while(performance.now()-exited<350){move(document.body,650+(i++%80),250);await tick()}
      results.push({opacityAfterEntry,opacityAfterExit:Number(frame.style.opacity)})
    }
    return results
  })
  expect(rounds).toEqual(Array.from({length:3},()=>({opacityAfterEntry:1,opacityAfterExit:0})))
})

test('release moves continuously to the hover frame and stays there',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>document.querySelector('[data-chat-flow-kind="assistant-step"]').insertAdjacentHTML('beforeend','<button id="release-corner" style="position:fixed;left:400px;top:200px;width:160px;height:32px">复制</button>'))
  const button=page.locator('#release-corner'),frame=page.locator('[data-prts-body-target-frame]')
  await button.hover();await expect(frame).toHaveCSS('opacity','1')
  await page.mouse.down()
  await expect.poll(async()=>(await frameBounds(frame)).x).toBe(397)
  const samples=await button.evaluate(async e=>{
    const frame=document.querySelector('[data-prts-body-target-frame]')
    e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse',clientX:480,clientY:216}))
    const start=performance.now(),samples=[]
    for(let i=0;i<25;i++){
      await new Promise(requestAnimationFrame)
      samples.push({t:performance.now()-start,x:frame.firstElementChild.getBoundingClientRect().x})
    }
    return samples
  })
  await page.mouse.up()
  expect(samples.some(s=>Math.abs(s.x-Math.round(s.x))>.02)).toBe(true)
  for(let i=1;i<samples.length;i++)expect(samples[i].x).toBeLessThanOrEqual(samples[i-1].x)
  const settled=samples.filter(s=>s.t>=200)
  expect(settled.length).toBeGreaterThan(2)
  for(const sample of settled)expect(sample.x).toBe(395)
})

test('frame clears immediately on window exit and can resume without stale animation',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>document.querySelector('[data-chat-flow-kind="assistant-step"]').insertAdjacentHTML('beforeend','<button id="cleanup-corner" style="position:fixed;left:400px;top:200px;width:160px;height:32px">复制</button>'))
  const button=page.locator('#cleanup-corner'),frame=page.locator('[data-prts-body-target-frame]')
  await expect(button).toHaveAttribute('data-prts-conversation-control','micro')
  for(const event of ['blur','pagehide','visibilitychange']){
    await button.dispatchEvent('pointermove',{pointerType:'mouse',clientX:480,clientY:216})
    await expect(frame).toHaveCSS('opacity','1')
    const result=await page.evaluate(async event=>{
      const frame=document.querySelector('[data-prts-body-target-frame]')
      if(event==='visibilitychange'){
        Object.defineProperty(document,'hidden',{configurable:true,value:true})
        document.dispatchEvent(new Event(event))
        delete document.hidden
      }else window.dispatchEvent(new Event(event))
      const immediate=frame.style.opacity
      let changes=0
      const observer=new MutationObserver(records=>changes+=records.length)
      observer.observe(frame,{attributes:true,subtree:true})
      for(let i=0;i<20;i++)await new Promise(requestAnimationFrame)
      observer.disconnect()
      return {immediate,changes}
    },event)
    expect(result).toEqual({immediate:'0',changes:0})
    await expect(frame).toHaveCount(1)
  }
})

test('corner length adapts to the short edge while stroke thickness stays fixed',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>document.querySelector('[data-chat-flow-kind="assistant-step"]').insertAdjacentHTML('beforeend','<button id="size-corner" style="position:fixed;left:400px;top:200px;width:400px;height:32px">附件卡片</button>'))
  const button=page.locator('#size-corner'),frame=page.locator('[data-prts-body-target-frame]')
  const length=()=>frame.locator('i').first().evaluate(e=>7*new DOMMatrixReadOnly(getComputedStyle(e,'::before').transform).a)
  for(const [width,height,expected] of [[400,32,7],[400,60,10.333333],[400,72,12],[400,120,12],[32,120,7]]){
    await button.evaluate((e,{width,height})=>{e.style.width=width+'px';e.style.height=height+'px'},{width,height})
    await button.hover()
    await expect(frame).toHaveCSS('opacity','1')
    await expect.poll(async()=>Math.abs(await length()-expected)).toBeLessThan(.001)
    expect(await frame.locator('i').first().evaluate(e=>getComputedStyle(e,'::before').height)).toBe('1px')
    expect(await frame.locator('i').first().evaluate(e=>getComputedStyle(e,'::after').width)).toBe('1px')
    await page.mouse.move(0,0);await expect(frame).toHaveCSS('opacity','0')
  }
})
