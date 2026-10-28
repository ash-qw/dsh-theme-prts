import {test,expect} from '@playwright/test'

// Native rc.3 ScheduleCreateCard and SessionScheduleMark structure/styles.
async function start(page){
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('[data-prts-session-row]').first()).toBeVisible()
}
test('schedule card retains its full-surface click target and separate open action',async({page})=>{
  await start(page)
  await page.addStyleTag({content:`
    .native_card{box-sizing:border-box;border:.5px solid gray;border-radius:12px;background:#222;width:100%;display:flex;position:relative;overflow:hidden;flex-direction:column;gap:6px;padding:8px 10px}
    .native_cardOpen{z-index:1;border-radius:inherit;cursor:pointer;background:none;border:0;width:100%;padding:0;position:absolute;inset:0}
    .native_row{z-index:2;pointer-events:none;align-items:center;gap:10px;min-height:44px;display:flex;position:relative}
    .native_body{flex:auto;display:flex;flex-direction:column}
    .native_openButton{pointer-events:auto;flex:none}
  `})
  await page.evaluate(()=>{
    document.querySelector('[data-prts-region="operation"]').insertAdjacentHTML('beforeend',`<article data-chat-flow-kind="assistant-step" style="position:fixed;left:450px;top:250px;width:500px;z-index:20">
      <div data-tool="schedule_create" class="native_card"><button type="button" class="native_cardOpen" aria-label="打开任务"></button><div class="native_row"><span>◷</span><span class="native_body"><span>定时任务主题测试</span><span>每天 09:00</span></span><button class="native_openButton">查看</button></div></div></article>`)
    window.scheduleClicks=0
    document.querySelectorAll('[data-tool="schedule_create"] button').forEach(button=>button.onclick=()=>window.scheduleClicks++)
  })
  const card=page.locator('[data-tool="schedule_create"]'),overlay=card.locator('.native_cardOpen')
  await expect(overlay).not.toHaveAttribute('data-prts-conversation-control')
  await expect(overlay).toHaveCSS('position','absolute')
  const box=await card.boundingBox(),hit=await overlay.boundingBox()
  expect(hit.width).toBeGreaterThan(box.width-3)
  expect(hit.height).toBeGreaterThan(box.height-3)
  const frame=page.locator('[data-prts-body-target-frame]')
  const open=card.locator('.native_openButton')
  for(const [target,marked] of [[overlay,card],[open,open],[overlay,card]]){
    await target.hover()
    await expect(marked).toHaveAttribute('data-prts-corner-target','')
    await expect(marked===card?open:card).not.toHaveAttribute('data-prts-corner-target')
    const targetBox=await marked.boundingBox()
    await expect(frame).toHaveCSS('opacity','1')
    const edges=await frame.evaluate(f=>[...f.children].map(c=>{const m=new DOMMatrixReadOnly(getComputedStyle(c).transform);return {x:m.m41,y:m.m42}}))
    expect(Math.abs(edges[0].x-(targetBox.x-5))).toBeLessThan(1)
    expect(Math.abs(edges[0].y-(targetBox.y-5))).toBeLessThan(1)
    expect(Math.abs(edges[3].x+7-(targetBox.x+targetBox.width+5))).toBeLessThan(1)
    expect(Math.abs(edges[3].y+7-(targetBox.y+targetBox.height+5))).toBeLessThan(1)
  }
  const tap=await overlay.evaluate(async button=>{
    const frame=document.querySelector('[data-prts-body-target-frame]'),initial=frame.firstElementChild.style.transform
    button.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse'}))
    button.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse'}))
    let contracted=false
    for(let i=0;i<20;i++){await new Promise(requestAnimationFrame);if(frame.hasAttribute('data-pressed') && frame.firstElementChild.style.transform!==initial)contracted=true}
    return contracted
  })
  expect(tap).toBe(true)
  for(const [x,y] of [[5,5],[box.width-5,5],[5,box.height-5],[box.width/2,box.height/2]]){
    await page.mouse.click(box.x+x,box.y+y)
  }
  await card.locator('.native_openButton').click()
  expect(await page.evaluate(()=>window.scheduleClicks)).toBe(5)
  await page.mouse.move(0,0)
  await expect(frame).toHaveCSS('opacity','0')
  await card.evaluate(node=>node.querySelectorAll('button').forEach(b=>b.remove()))
  await card.hover()
  await expect(card).not.toHaveAttribute('data-prts-corner-target')
  await expect(frame).toHaveCSS('opacity','0')
})

test('scheduled session mark aligns with native status and follows the card shift',async({page})=>{
  await start(page)
  const row=page.locator('[data-prts-session-row]').first()
  await row.evaluate(node=>{
    const slot=document.createElement('span');slot.id='schedule-status-slot';slot.style.cssText='display:inline-flex;width:16px;align-items:center;justify-content:center'
    slot.innerHTML='<span data-session-schedule-mark style="display:inline-flex;flex:none;width:16px;height:20px;align-items:center;justify-content:center"><svg width="14" height="14"><circle cx="7" cy="7" r="5"/></svg></span>'
    node.prepend(slot)
  })
  const mark=row.locator('[data-session-schedule-mark]')
  await expect(mark).toHaveCSS('margin-left','20px')
  await expect(row.locator('[data-prts-session-idle-indicator]')).toHaveCSS('opacity','0')
  const initial=await mark.boundingBox()
  await row.hover();await page.waitForTimeout(280)
  const shifted=await mark.boundingBox()
  const shift=await row.evaluate(e=>parseFloat(getComputedStyle(e).getPropertyValue('--prts-row-shift')))
  expect(Math.abs((shifted.x-initial.x)-shift)).toBeLessThan(1)
  await mark.evaluate(e=>e.remove())
  await expect(row.locator('[data-prts-session-idle-indicator]')).toHaveCSS('opacity','1')
})
