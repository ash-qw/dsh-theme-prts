import {expect,test} from '@playwright/test'

test('custom flow colors fit their row and remain interactive across responsive boundaries',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false,sessionFlow:true,sessionFlowPalette:'custom'})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="flow"]').click()
  const row=page.locator('[data-prts-setting-row="sessionFlowColors"]')
  const colors=row.locator('input[type="color"]')
  for(const width of [1280,1024,900,840,800,780,760,740,721,720,640,390,360,320]){
    await page.setViewportSize({width,height:900})
    await row.scrollIntoViewIfNeeded()
    expect(await row.evaluate(e=>e.scrollWidth-e.clientWidth),`row overflow at ${width}`).toBeLessThanOrEqual(1)
    for(const input of await colors.all()){
      expect(await input.evaluate(e=>{
        const box=e.getBoundingClientRect(),row=e.closest('[data-prts-setting-row]').getBoundingClientRect(),label=e.closest('label').getBoundingClientRect()
        return box.left>=row.left&&box.right<=row.right&&box.right<=label.right+1
      }),`color bounds at ${width}`).toBeTruthy()
      await input.scrollIntoViewIfNeeded()
      expect(await input.evaluate(e=>{
        const r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)
        return hit===e||e.contains(hit)
      }),`color hit area at ${width}`).toBeTruthy()
    }
  }
  await colors.first().fill('#123456')
  await expect(row).toContainText('#123456')
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).sessionFlowColorBack)).toBe('#123456')
})
