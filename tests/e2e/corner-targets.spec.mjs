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
