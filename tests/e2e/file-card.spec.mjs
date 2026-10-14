import {test,expect} from '@playwright/test'
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
  await expect(cards).toHaveCount(6)
  await expect(page.locator('.host_card')).toHaveCSS('border-radius','10px')
  await expect(page.locator('.host_card')).toHaveCSS('corner-shape','round')
  await expect(page.locator('.host_card')).toHaveCSS('border-width','1px')
  for(const button of await page.locator('[data-changed-files] button').all()){
    await expect(button).not.toHaveAttribute('data-prts-conversation-control',/./)
    await expect(button).toHaveCSS('border-width','0px')
    await button.click();await expect(button).toHaveAttribute('data-opened','true')
  }
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
    expect(highlight).not.toBe(before)
    const button=await card.evaluate(e=>e.tagName==='BUTTON')?card:card.locator('button').first()
    await button.click();await expect(button).toHaveAttribute('data-opened','true')
    await page.mouse.move(0,0);await button.focus()
    await expect(card).toHaveCSS('border-top-color',highlight)
    await button.evaluate(e=>e.blur())
  }
  await page.locator('[data-presented-file]').hover()
  await page.locator('[data-presented-file]').screenshot({path:`/tmp/prts-rounded-file-${scheme}.png`})
})
