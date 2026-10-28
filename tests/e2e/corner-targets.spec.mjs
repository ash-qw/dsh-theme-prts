import {test,expect} from '@playwright/test'
async function start(page){
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
}
test('earlier messages, composer controls share the corner frame',async({page})=>{
  await start(page)
  await page.evaluate(()=>{
    const operation=document.querySelector('[data-prts-region="operation"]')
    operation.insertAdjacentHTML('beforeend',`<section id="coverage" style="position:fixed;left:400px;top:180px;z-index:10;background:var(--prts-panel);padding:16px">
      <div class="host_older"><button id="earlier">加载更早</button></div>
      <button class="host_showFolder" id="folder">打开文件夹</button>
      <button class="host_sessionLogButton" id="log">会话日志</button>
      <div data-prts-composer-fallback>
        <button id="attach">附件</button><button id="send" type="submit">发送</button>
        <button id="model" data-prts-glass-control="model">模型</button>
        <button id="permission" data-prts-glass-control="permission">权限</button>
        <button id="preset" data-prts-glass-control="preset">预设</button>
        <div role="menu"><button id="menu-item">普通菜单项</button></div>
        <div data-slot="conversation.input.attachments"><button id="file-remove">原生附件操作</button></div>
      </div>
      <div data-prts-workspace-actions><button id="workspace">工作区操作</button></div>
      <div data-prts-session-actions><button id="session">会话操作</button></div>
      <button id="disabled-corner" data-prts-glass-control="model" disabled>禁用</button>
    </section>`)
  })
  const frame=page.locator('[data-prts-body-target-frame]')
  for(const id of ['earlier','folder','log','attach','send','model','permission','preset']){
    const button=page.locator('#'+id)
    await expect(button).toBeVisible()
    const idle=await button.evaluate(e=>({border:getComputedStyle(e).borderColor,borderWidth:getComputedStyle(e).borderTopWidth,outline:getComputedStyle(e).getPropertyValue('--prts-control-outline')}))
    await button.hover()
    await expect(button).toHaveAttribute('data-prts-corner-target','')
    await expect(frame).toHaveCSS('opacity','1')
    if(parseFloat(idle.borderWidth))expect(await button.evaluate(e=>getComputedStyle(e).borderColor)).toBe(idle.border)
    expect(await button.evaluate(e=>getComputedStyle(e).getPropertyValue('--prts-control-outline'))).toBe(idle.outline)
    await page.mouse.down();await expect(frame).toHaveAttribute('data-pressed')
    await page.mouse.up()
  }
  for(const id of ['menu-item','file-remove','disabled-corner','workspace','session']){
    await page.locator('#'+id).hover({force:true})
    await expect(frame).toHaveCSS('opacity','0')
    await expect(page.locator('#'+id)).not.toHaveAttribute('data-prts-corner-target')
  }
  const model=page.locator('#model')
  await page.keyboard.press('Tab');await model.focus()
  await expect(model).toHaveAttribute('data-prts-corner-target','')
  await expect(frame).toHaveCSS('opacity','1')
})

test('transfer dialog actions remain clickable with a frame above the modal',async({page})=>{
  await start(page)
  await page.locator('[data-prts-rail-brand]').click()
  const reset=page.locator('[data-prts-reset-visual]')
  await reset.hover()
  await expect(reset).toHaveAttribute('data-prts-corner-target','')
  await expect(page.locator('[data-prts-body-target-frame]')).toHaveCSS('opacity','1')
  await page.mouse.down()
  await expect(page.locator('[data-prts-body-target-frame]')).toHaveAttribute('data-pressed')
  await page.mouse.up()
  await expect(page.locator('[data-prts-reset-confirm]')).toBeVisible()
  await page.locator('[data-prts-reset-cancel]').click()
  await expect(page.locator('[data-prts-reset-confirm]')).toBeHidden()
  const open=page.locator('[data-prts-transfer-open]')
  await open.hover()
  await expect(open).toHaveAttribute('data-prts-corner-target','')
  await open.click()
  const dialog=page.locator('[data-prts-transfer-dialog]')
  await expect(dialog).toBeVisible()
  const action=page.locator('[data-prts-transfer-export]')
  await action.hover()
  await expect(action).toHaveAttribute('data-prts-corner-target','')
  const frame=page.locator('[data-prts-body-target-frame]')
  await expect(frame).toHaveCSS('opacity','1')
  expect(await frame.evaluate(e=>e.matches(':popover-open'))).toBe(true)
  await expect(frame.locator('i')).toHaveCount(4)
  await page.locator('[data-prts-transfer-close]').click()
  await expect(dialog).toBeHidden()
  await page.mouse.move(0,0)
  await open.evaluate(e=>e.blur())
  await expect(frame).toHaveCSS('opacity','0')
  expect(await frame.evaluate(e=>e.matches(':popover-open'))).toBe(false)
  await expect(frame).toHaveCount(1)
})

test('same-frame tap visibly contracts then releases without delaying click', async ({page}) => {
  await start(page)
  await page.evaluate(() => {
    const b=document.createElement('button');b.id='quick-tap';b.setAttribute('data-prts-glass-control','model');b.textContent='轻点';b.style.cssText='position:fixed;left:600px;top:300px;width:80px;height:40px;z-index:100';document.body.append(b)
  })
  const button=page.locator('#quick-tap')
  await button.hover()
  await page.waitForTimeout(300)
  const result=await button.evaluate(async b=>{
    const frame=document.querySelector('[data-prts-body-target-frame]')
    const corner=frame.firstElementChild
    const initial=corner.style.transform
    let clicked=false;b.onclick=()=>{clicked=true}
    b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse'}))
    b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse'}))
    b.click()
    const immediate=clicked,samples=[]
    for(let i=0;i<30;i++){await new Promise(requestAnimationFrame);samples.push({pressed:frame.hasAttribute('data-pressed'),transform:corner.style.transform})}
    return {initial,immediate,samples}
  })
  expect(result.immediate).toBe(true)
  expect(result.samples.some(s=>s.pressed && s.transform!==result.initial)).toBe(true)
  expect(result.samples.at(-1).pressed).toBe(false)
  expect(result.samples.at(-1).transform).toBe(result.initial)
})

test('back-to-bottom keeps native geometry and clears corners when removed', async ({page}) => {
  await start(page)
  await page.evaluate(()=>{
    const b=document.createElement('button');b.className='host_toBottom';b.id='bottom-test';b.textContent='↓';b.style.cssText='position:fixed;left:650px;top:250px;width:32px;height:32px;border-radius:50%;background:rgb(40,50,60);z-index:100';
    b.onclick=()=>b.remove();document.querySelector('[data-prts-region="operation"]').append(b)
  })
  const b=page.locator('#bottom-test'),frame=page.locator('[data-prts-body-target-frame]')
  await expect(b).toHaveAttribute('data-prts-to-bottom','')
  const material=await b.evaluate(n=>({radius:getComputedStyle(n).borderRadius,background:getComputedStyle(n).backgroundColor}))
  await b.hover()
  await expect(b).toHaveAttribute('data-prts-corner-target','')
  await expect(frame).toHaveCSS('opacity','1')
  await expect(b).toHaveCSS('border-radius',material.radius)
  await expect(b).toHaveCSS('background-color',material.background)
  await page.mouse.down()
  await expect(frame).toHaveAttribute('data-pressed')
  await page.mouse.up()
  await expect(b).toHaveCount(0)
  await expect(frame).toHaveCSS('opacity','0')
})

test('removed back-to-bottom finishes tap contraction then fades in place',async({page})=>{
  await start(page)
  await page.evaluate(()=>{
    const b=document.createElement('button');b.id='vanishing-bottom';b.className='host_toBottom';b.textContent='↓';b.style.cssText='position:fixed;left:650px;top:250px;width:36px;height:36px;z-index:100';b.onclick=()=>b.remove();document.querySelector('[data-prts-region="operation"]').append(b)
  })
  const button=page.locator('#vanishing-bottom')
  await button.hover();await page.waitForTimeout(300)
  const result=await button.evaluate(async b=>{
    const f=document.querySelector('[data-prts-body-target-frame]'),corner=f.firstElementChild,initial=corner.style.transform
    b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse'}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse'}));b.click()
    const samples=[]
    for(let i=0;i<35;i++){await new Promise(requestAnimationFrame);samples.push({pressed:f.hasAttribute('data-pressed'),alpha:Number(f.style.opacity),transform:corner.style.transform})}
    return {initial,samples,removed:!b.isConnected}
  })
  expect(result.removed).toBe(true)
  expect(result.samples.some(s=>s.pressed && s.alpha===1 && s.transform!==result.initial)).toBe(true)
  const fade=result.samples.filter(s=>s.alpha>0 && s.alpha<1)
  expect(fade.length).toBeGreaterThan(0)
  expect(new Set(fade.map(s=>s.transform)).size).toBe(1)
  expect(result.samples.at(-1).alpha).toBe(0)
})

for (const kind of ['question', 'plan-review', 'approval']) {
  test(`${kind} action contracts after removal; choice rows stay native`,async({page})=>{
    await start(page)
    await page.evaluate(kind=>{
      const panel=document.createElement('section');panel.id='pending-corner-test';panel.setAttribute('data-'+kind+'-key','fixture');panel.style.cssText='position:fixed;left:500px;top:250px;z-index:100';
      panel.innerHTML='<button id="pending-choice" class="host_option">选项</button><button id="pending-wait" class="host_waitButton">暂缓</button><div class="host_'+(kind==='question'?'footerActions':'actions')+'"><button id="pending-submit">提交</button></div>';
      panel.querySelector('#pending-submit').onclick=()=>panel.remove();document.querySelector('[data-prts-region="operation"]').append(panel)
    },kind)
    if(kind==='question'){
      await page.locator('#pending-choice').hover()
      await expect(page.locator('#pending-choice')).not.toHaveAttribute('data-prts-corner-target')
      await page.locator('#pending-wait').hover()
      await expect(page.locator('#pending-wait')).toHaveAttribute('data-prts-corner-target','')
    }
    const b=page.locator('#pending-submit');await b.hover();await page.waitForTimeout(300)
    const result=await b.evaluate(async b=>{
      const f=document.querySelector('[data-prts-body-target-frame]'),initial=f.firstElementChild.style.transform
      b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse'}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse'}));b.click()
      const samples=[];for(let i=0;i<35;i++){await new Promise(requestAnimationFrame);samples.push({pressed:f.hasAttribute('data-pressed'),alpha:Number(f.style.opacity),position:f.firstElementChild.style.transform})}
      return {initial,samples,removed:!b.isConnected}
    })
    expect(result.removed).toBe(true)
    expect(result.samples.some(s=>s.pressed && s.alpha===1 && s.position!==result.initial)).toBe(true)
    expect(result.samples.at(-1).alpha).toBe(0)
  })
}

test('image preview portal clears background corners without pointer movement',async({page})=>{
  await start(page)
  await page.evaluate(()=>{
    const flow=document.createElement('div');flow.setAttribute('data-message-role','assistant');
    flow.innerHTML='<button id="preview-image" style="position:fixed;left:600px;top:250px;width:100px;height:80px;z-index:100">图片</button>';
    flow.firstElementChild.onclick=()=>{
      const modal=document.createElement('div');modal.id='image-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.style.cssText='position:fixed;inset:0;z-index:1000;background:#333';document.body.append(modal)
    };document.querySelector('[data-prts-region="operation"]').append(flow)
  })
  const b=page.locator('#preview-image'),f=page.locator('[data-prts-body-target-frame]')
  await b.hover();await expect(f).toHaveCSS('opacity','1')
  await b.click();await expect(page.locator('#image-modal')).toBeVisible()
  await expect(f).toHaveCSS('opacity','0')
  await expect(b).not.toHaveAttribute('data-prts-corner-target')
  await b.dispatchEvent('pointermove',{pointerType:'mouse'})
  await expect(f).toHaveCSS('opacity','0')
  await page.locator('#image-modal').evaluate(n=>n.remove())
  await page.mouse.move(300,200);await b.hover();await expect(f).toHaveCSS('opacity','1')
})

test('image tap visibly contracts above opaque preview then clears',async({page})=>{
  await start(page)
  await page.evaluate(()=>{
    const flow=document.createElement('div');flow.setAttribute('data-message-role','assistant');flow.innerHTML='<button id="image-tap" style="position:fixed;left:600px;top:250px;width:100px;height:80px;z-index:10"><img alt="图片"></button>';
    flow.firstElementChild.onclick=()=>{const modal=document.createElement('div');modal.id='image-tap-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.style.cssText='position:fixed;inset:0;z-index:1000;background:rgb(17,22,26)';modal.innerHTML='<img alt="预览">';document.body.append(modal)};
    document.querySelector('[data-prts-region="operation"]').append(flow)
  })
  const b=page.locator('#image-tap');await b.hover();await page.waitForTimeout(300)
  const result=await b.evaluate(async b=>{
    const f=document.querySelector('[data-prts-body-target-frame]'),initial=f.firstElementChild.style.transform
    b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse'}));b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse'}));b.click()
    const samples=[];for(let i=0;i<35;i++){await new Promise(requestAnimationFrame);samples.push({pressed:f.hasAttribute('data-pressed'),alpha:Number(f.style.opacity),position:f.firstElementChild.style.transform,top:f.matches(':popover-open'),z:Number(getComputedStyle(f).zIndex)})}
    return {initial,samples}
  })
  expect(result.samples.some(s=>s.pressed && s.position!==result.initial && s.alpha>0)).toBe(true)
  expect(result.samples.filter(s=>s.alpha>0).every(s=>s.top)).toBe(true)
  expect(result.samples.at(-1).alpha).toBe(0)
  await page.locator('#image-tap-modal').evaluate(n=>n.remove())
  await page.mouse.move(300,200);await b.hover()
  await expect(page.locator('[data-prts-body-target-frame]')).toHaveCSS('opacity','1')
})

test('pointer bursts commit only the final target in a frame',async({page})=>{
  await start(page)
  await page.evaluate(()=>{
    const panel=document.createElement('div');panel.id='burst-controls';panel.setAttribute('role','toolbar')
    panel.style.cssText='position:fixed;left:500px;top:300px;z-index:100;display:flex;gap:16px'
    panel.innerHTML='<button data-prts-glass-control="model" style="width:60px;height:36px">A</button><button data-prts-glass-control="model" style="width:60px;height:36px">B</button>'
    document.body.append(panel)
  })
  await page.locator('#burst-controls button').first().hover()
  await expect(page.locator('[data-prts-body-target-frame]')).toHaveCSS('opacity','1')
  const result=await page.evaluate(async()=>{
    const panel=document.querySelector('#burst-controls'),buttons=[...panel.children],rects=buttons.map(b=>b.getBoundingClientRect())
    let changes=0
    const observer=new MutationObserver(records=>changes+=records.length)
    observer.observe(panel,{subtree:true,attributes:true,attributeFilter:['data-prts-corner-target']})
    for(let i=0;i<100;i++){
      const index=i%2,r=rects[index]
      buttons[index].dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse',clientX:r.left+10,clientY:r.top+10}))
    }
    await new Promise(resolve=>setTimeout(resolve,120))
    observer.disconnect()
    return {changes,selected:buttons[1].hasAttribute('data-prts-corner-target')}
  })
  expect(result.selected).toBe(true)
  expect(result.changes).toBe(2)
})
