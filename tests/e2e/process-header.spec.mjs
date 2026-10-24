import {test,expect} from '@playwright/test'

for(const scheme of ['light','dark'])test(`expanded process headers preserve wallpaper (${scheme})`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  if(await page.locator('html').getAttribute('data-prts-scheme')!==scheme)await page.locator('[data-prts-scheme-toggle]').click()
  // Reproduce the host's sticky background rules, loaded after the theme.
  await page.addStyleTag({content:`
    .lcKema_root[data-expanded] [data-open] [data-disclosure-header],
    .Sixlwa_compactionRow:has(.Sixlwa_compactionBody) .Sixlwa_compactionButton {position:sticky;top:0;background:rgb(0,0,0);z-index:7}
    .Sixlwa_compactionRow:has(.Sixlwa_compactionBody) .Sixlwa_compactionButton:hover {background:rgb(20,20,20)}
  `})
  await page.evaluate(()=>{
    const section=document.createElement('section')
    section.innerHTML=`<div class="lcKema_root" data-variant="think" data-expanded><div data-open="true"><div data-disclosure-header><div role="button" tabindex="0" aria-expanded="true" data-disclosure-row>思考</div></div><p>思考内容</p></div></div>
      <div class="Sixlwa_compactionRow"><button class="Sixlwa_compactionButton" aria-expanded="true"><span data-compaction-disclosure="expanded">上下文压缩摘要</span></button><p class="Sixlwa_compactionBody">摘要内容</p></div>`
    document.querySelector('[data-chat-flow-kind="assistant-step"]').append(section)
    section.querySelector('[role=button]').onclick=e=>{
      const open=e.currentTarget.getAttribute('aria-expanded')!=='true'
      e.currentTarget.setAttribute('aria-expanded',open)
      section.querySelector('[data-variant]').toggleAttribute('data-expanded',open)
    }
    section.querySelector('button').onclick=e=>{
      const button=e.currentTarget.closest('button'),open=button.getAttribute('aria-expanded')!=='true'
      button.setAttribute('aria-expanded',open)
      section.querySelector('p:last-child').classList.toggle('Sixlwa_compactionBody',open)
    }
  })
  const headers=[page.locator('[data-disclosure-header]'),page.locator('.Sixlwa_compactionButton')]
  await expect(headers[1]).not.toHaveAttribute('data-prts-conversation-control',/./)
  for(const mode of ['full','split']){
    await page.evaluate(mode=>{
      const root=document.documentElement
      root.setAttribute('data-prts-background-mode',mode)
      root.setAttribute('data-prts-background-'+(mode==='full'?'full':'conversation'),'')
    },mode)
    for(const header of headers){
      await header.hover()
      await expect(header).toHaveCSS('position','sticky')
      await expect(header).toHaveCSS('backdrop-filter','blur(12px)')
      const color=await header.evaluate(e=>getComputedStyle(e).backgroundColor)
      expect(color).toContain('0.28')
    }
  }
  await page.evaluate(()=>{
    document.documentElement.removeAttribute('data-prts-background-full')
    document.documentElement.removeAttribute('data-prts-background-conversation')
  })
  await page.mouse.move(0,0)
  for(const header of headers)await expect(header).toHaveCSS('background-color','rgb(0, 0, 0)')
  await page.locator('[data-disclosure-row]').click()
  await expect(page.locator('[data-variant="think"]')).not.toHaveAttribute('data-expanded')
  await headers[1].click()
  await expect(headers[1]).toHaveAttribute('aria-expanded','false')
})
