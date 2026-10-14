import {test,expect} from '@playwright/test'
for(const width of [1280,390])for(const role of ['user','assistant'])test(`Baker table spacing and contained scrolling (${width}, ${role})`,async({page})=>{
  await page.setViewportSize({width,height:960})
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,conversationStyle:'deck-chat'})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  if(width<600)await page.addStyleTag({content:'.frame{grid-template-columns:0 minmax(0,1fr) 0}.sidebar-col{visibility:hidden}.center-col{grid-column:2;min-width:0}'})
  await page.addStyleTag({content:'.test-table td,.test-table th{padding:10px 16px 10px 0}.test-table{border-collapse:collapse;min-width:800px}.test_tableScroll_hash{margin-left:-200px;padding-left:200px;overflow-x:hidden}'})
  await page.evaluate(role=>{
    const sample=document.createElement('section');sample.dataset.tableSample=''
    sample.style.cssText='padding:16px;min-width:0;box-sizing:border-box'
    sample.innerHTML=`<div data-chat-flow-kind="${role==='assistant'?'assistant-step':'user'}"><div class="${role==='assistant'?'sample_body':'sample_bubble'}"><div data-markdown><div class="test_tableScroll_hash md-table-wide"><table class="test-table"><thead><tr><th>字段名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td>name</td><td>string</td><td>完整字段说明</td></tr></tbody></table></div></div></div></div>`
    document.querySelector('[data-conversation-scroll]').prepend(sample)
  },role)
  const sample=page.locator('[data-table-sample]'),wrap=sample.locator('.md-table-wide')
  await expect(sample.locator('td').first()).toHaveCSS('padding-left','14px')
  await expect(sample.locator('th').last()).toHaveCSS('padding-right','14px')
  await expect(wrap).toHaveCSS('border-radius','10px')
  await expect(wrap).toHaveCSS('corner-shape','round')
  await expect(sample.locator('table')).toHaveCSS('border-width','0px')
  const geometry=await wrap.evaluate(e=>{const b=e.closest('[data-prts-ai-surface],.sample_bubble'),r=e.getBoundingClientRect(),br=b.getBoundingClientRect();e.scrollLeft=100;return{left:r.left,right:r.right,bodyLeft:br.left,bodyRight:br.right,scroll:e.scrollLeft}})
  expect(geometry.left).toBeGreaterThanOrEqual(geometry.bodyLeft)
  expect(geometry.right).toBeLessThanOrEqual(geometry.bodyRight+1)
  expect(geometry.scroll).toBeGreaterThan(0)
  expect(await sample.evaluate(e=>e.scrollWidth<=e.clientWidth+1)).toBe(true)
  await sample.screenshot({path:`/tmp/prts-table-${role}-${width}.png`})
  await page.evaluate(()=>document.documentElement.setAttribute('data-prts-conversation-style','native'))
  await expect(sample.locator('td').first()).toHaveCSS('padding-left','0px')
})
