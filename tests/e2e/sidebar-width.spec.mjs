import {expect,test} from '@playwright/test'

test('sidebar contents follow the native width below 286px and keep hovered actions inside',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,motion:'reduced'})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  const region=page.locator('[data-prts-region="sessions"]')
  await expect(region).toBeVisible()
  const root=region.locator('[data-slot="sidebar"] > :first-child')
  for(const width of [320,286,280,260,240,220,200,280]){
    await page.locator('[data-prts-region="frame"]').evaluate((e,width)=>{e.style.gridTemplateColumns=`${width}px minmax(0,1fr) 0px`},width)
    expect((await region.boundingBox()).width).toBe(width)
    expect((await root.boundingBox()).width).toBeLessThanOrEqual(width)
    expect((await root.boundingBox()).width).toBeGreaterThan(width-2)
    for(const name of ['Workspace actions','Session actions']){
      const button=page.getByRole('button',{name,exact:true})
      await button.locator('xpath=ancestor::*[@role="treeitem"]').hover()
      await expect.poll(()=>button.evaluate(e=>{
        const r=e.getBoundingClientRect(),container=e.closest('[data-prts-region="sessions"]').getBoundingClientRect()
        return r.left>=container.left&&r.right<=container.right
      })).toBeTruthy()
      await expect.poll(()=>button.evaluate(e=>{
        const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)
        return e===hit||e.contains(hit)
      })).toBeTruthy()
    }
  }
})
