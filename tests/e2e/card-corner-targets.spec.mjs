import {test,expect} from '@playwright/test'

for(const attribute of ['data-presented-file','data-changed-files']) test(`${attribute} gives nested actions priority over the card`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('[data-prts-session-row]').first()).toBeVisible()
  await page.evaluate(attribute=>{
    const host=document.createElement('article')
    host.setAttribute('data-chat-flow-kind','assistant-step')
    host.style.cssText='position:fixed;left:450px;top:250px;width:600px;z-index:30'
    host.innerHTML=`<div id="test-card" ${attribute} style="position:relative;min-height:130px;padding:12px;display:block">
      ${attribute==='data-presented-file'?'<button class="native_cardPreview" aria-label="预览图片" style="position:absolute;inset:0;width:100%;height:100%;background:transparent;border:0"></button>':''}
      <div id="card-copy" style="position:relative;pointer-events:none;height:40px">图片文件.jpg</div>
      <div style="position:relative;display:flex;gap:12px">
        <button id="folder"><svg width="16" height="16"><path d="M1 1h14v14H1z"/></svg></button>
        <button id="menu" aria-haspopup="menu">⌄</button>
        <a id="download" href="#download">下载</a>
        <span id="role-action" role="button" tabindex="0">操作</span>
        <button id="disabled" disabled>不可用</button>
        <span id="aria-disabled" role="button" aria-disabled="true">禁用</span>
      </div></div>`
    document.querySelector('[data-prts-region="operation"]').append(host)
    window.cardActionClicks=0
    host.querySelector('#folder').onclick=()=>window.cardActionClicks++
  },attribute)
  const card=page.locator('#test-card')
  const hoverCard=()=>card.hover({position:{x:20,y:15}})
  await hoverCard()
  await expect(card).toHaveAttribute('data-prts-corner-target','')
  for(const id of ['folder','menu','download','role-action']){
    const action=page.locator('#'+id)
    await action.hover()
    await expect(action).toHaveAttribute('data-prts-corner-target','')
    await expect(card).not.toHaveAttribute('data-prts-corner-target')
    if(id==='folder'){
      await action.locator('svg').hover()
      await expect(action).toHaveAttribute('data-prts-corner-target','')
      await action.click()
      expect(await page.evaluate(()=>window.cardActionClicks)).toBe(1)
    }
    await hoverCard()
    await expect(card).toHaveAttribute('data-prts-corner-target','')
  }
  for(const id of ['disabled','aria-disabled']){
    await page.locator('#'+id).hover()
    await expect(page.locator('[data-prts-corner-target]')).toHaveCount(0)
  }
  await page.locator('#folder').focus()
  await page.keyboard.press('Tab')
  await expect(page.locator('#menu')).toHaveAttribute('data-prts-corner-target','')
})
