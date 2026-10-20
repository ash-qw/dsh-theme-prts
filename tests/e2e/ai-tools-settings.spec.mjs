import {test,expect} from '@playwright/test'

for(const width of [1440,480])test(`AI tool guide and persisted switch at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000})
  await page.addInitScript(()=>{
    if(!localStorage.getItem('prtsFixtureNativeConfig'))localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced'}}))
  })
  const open=async()=>{
    if(width<640)await page.locator('[data-prts-rail-launcher]').click()
    await page.locator('[data-prts-rail-brand]').click()
    await page.getByRole('tab',{name:'AI 工具',exact:true}).click()
  }
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await open()
  const section=page.locator('[data-prts-ai-tools]'),toggle=page.getByRole('switch',{name:'允许 AI 定制主题'})
  await expect(section).toBeVisible()
  await expect(toggle).toHaveAttribute('aria-checked','true')
  await expect(section.locator('h3')).toHaveCount(2)
  for(const summary of await section.locator('summary').all())await summary.click()
  await expect(section.locator('code')).toHaveCount(5)
  await expect(section).toContainText('手动设置不受影响')
  expect(await section.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1)
  await toggle.click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.aiToolsEnabled)).toBe(false)
  await expect(section.locator('code').first()).toBeVisible()
  await page.reload();await open()
  await expect(toggle).toHaveAttribute('aria-checked','false')
  await page.screenshot({path:`/tmp/prts-ai-tools-${width}.png`})
  await toggle.click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.aiToolsEnabled)).toBe(true)
})
