import {test,expect} from '@playwright/test'

for(const width of [1280,390])for(const scheme of ['dark','light'])test(`communications bubbles preserve content and round portraits (${width}, ${scheme})`,async({page})=>{
  await page.setViewportSize({width,height:960})
  await page.addInitScript(({scheme})=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,conversationStyle:'deck-chat',scheme})),{scheme})
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style','deck-chat')
  if(await page.locator('html').getAttribute('data-prts-scheme')!==scheme){
    if(width<600)await page.locator('[data-prts-rail-launcher]').click()
    await page.locator('[data-prts-scheme-toggle]').click()
    if(width<600)await page.keyboard.press('Escape')
  }
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme',scheme)
  // The fixture has a fixed desktop sidebar; model the host's collapsed phone layout.
  if(width<600)await page.addStyleTag({content:'.frame{grid-template-columns:0 minmax(0,1fr) 0}.sidebar-col{visibility:hidden}.center-col{grid-column:2;min-width:0}'})
  await page.addStyleTag({content:'*,*::before,*::after{corner-shape:superellipse(1.5)}'})
  await page.evaluate(()=>{
    const scroll=document.querySelector('[data-conversation-scroll]')
    scroll.querySelector('[data-chat-flow-kind="assistant-step"]').remove()
    const sample=document.createElement('section')
    sample.dataset.bubbleSample=''
    sample.style.cssText='display:grid;gap:24px;padding:20px 12px;max-width:850px;margin:auto;box-sizing:border-box'
    sample.innerHTML='<div data-chat-flow-kind="user"><div class="sample_bubble" style="width:fit-content;margin-left:auto"><div data-markdown>我也很期待你这次的专辑。</div></div></div>'+
      '<div data-chat-flow-kind="assistant-step"><div class="sample_body"><div data-markdown>这样吗……</div></div></div>'+
      '<div data-chat-flow-kind="assistant-step"><div class="sample_body"><div data-markdown>好啦，既然管理员都这么说了，那我当然会继续努力，争取早点让你听到啦！</div></div></div>'+
      '<div data-chat-flow-kind="assistant-step"><div class="sample_body"><div data-markdown><p>长代码仍然可以横向滚动：</p><pre><code>'+('example_long_line_'.repeat(25))+'</code></pre></div></div></div>'
    scroll.prepend(sample)
  })
  const ai=page.locator('[data-prts-ai-surface]').first()
  await expect(ai).toBeVisible()
  const portrait=await page.locator('[data-chat-flow-kind="assistant-step"]').first().evaluate(e=>{const s=getComputedStyle(e,'::before');return{radius:s.borderRadius,corner:s.cornerShape,image:s.backgroundImage,width:s.width,height:s.height}})
  expect(portrait.corner).toBe('round');expect(portrait.image).toContain('stroke-dasharray');
  expect(portrait.radius).toBe('50%');expect(portrait.width).toBe(portrait.height)
  expect(await ai.evaluate(e=>getComputedStyle(e,'::before').maskImage)).toContain('data:image/svg+xml')
  const bubble=page.locator('.sample_bubble')
  await expect(bubble).toHaveCSS('color','rgb(25, 28, 25)')
  await expect(bubble).toHaveCSS('border-top-right-radius','0px')
  await page.locator('[data-bubble-sample]').screenshot({path:`/tmp/prts-chat-${width}-${scheme}.png`})
  const overflow=await page.locator('[data-bubble-sample]').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,children:[...e.children].map(c=>({width:c.clientWidth,scroll:c.scrollWidth,rect:c.getBoundingClientRect().toJSON()}))}))
  expect(overflow.scroll,JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width+1)
  expect(await page.locator('pre').evaluate(e=>e.scrollWidth>e.clientWidth)).toBe(true)
  await page.locator('[data-bubble-sample]').screenshot({path:`/tmp/prts-chat-${width}-${scheme}.png`})
})
