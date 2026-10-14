import {test,expect} from '@playwright/test'

test('workspace-less composer retains one notched outline during refresh handoff',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  const card=page.locator('[data-composer-card]').first()
  await card.evaluate(e=>e.classList.add('host_cardWorkspaceTrigger'))
  await page.addStyleTag({content:'.host_cardWorkspaceTrigger::after{box-sizing:border-box;border-radius:24px;border:1px dashed;inset:0}'})
  for(const scheme of ['dark','light']){
    await page.evaluate(s=>document.documentElement.dataset.prtsScheme=s,scheme)
    const layer=()=>card.evaluate(e=>{const s=getComputedStyle(e,'::after');return {border:s.borderWidth,radius:s.borderRadius,clip:s.clipPath,inset:s.top}})
    await expect.poll(layer).toMatchObject({border:'0px',radius:'0px',inset:'1px'})
    expect((await layer()).clip).toContain('polygon(')
  }
  await card.evaluate(e=>e.classList.remove('host_cardWorkspaceTrigger'))
  expect(await card.evaluate(e=>getComputedStyle(e,'::after').borderRadius)).toBe('0px')
})
