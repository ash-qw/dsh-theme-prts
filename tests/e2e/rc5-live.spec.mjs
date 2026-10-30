import {test,expect} from '@playwright/test'

// Opt-in, authenticated local regression. It only opens existing UI; no AI requests.
test.use({locale:'zh-CN',storageState:process.env.PRTS_RC5_STATE || undefined})
test('rc.5 native reasoning retains theme surfaces and interaction @live-rc5',async({page})=>{
 test.skip(!process.env.PRTS_RC5_STATE || !process.env.PRTS_RC5_SESSION,'Requires local storage state and an existing conversation with reasoning')
 test.setTimeout(60000)
 const errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.goto(process.env.PRTS_LIVE_URL || 'http://127.0.0.1:3080')
 await page.locator('[data-prts-rail-brand]').waitFor({state:'attached',timeout:20000})
 await page.locator('[data-prts-startup]').waitFor({state:'hidden'})
 await page.locator('[data-prts-session-row]').filter({hasText:process.env.PRTS_RC5_SESSION}).first().click()
 const processGroup=page.getByRole('button',{name:/已完成，用时/}).first()
 if(await processGroup.count() && await processGroup.getAttribute('aria-expanded')==='false')await processGroup.click()
 const summary=page.getByRole('button',{name:/执行了命令.*已调用工具/}).first()
 if(await summary.count() && await summary.getAttribute('aria-expanded')==='false')await summary.click()
 const reasoning=page.locator('[data-variant="think"]:visible').first()
 const disclosure=reasoning.locator('[data-disclosure-row]')
 await expect(disclosure).toBeVisible()
 const originalScheme=await page.locator('html').getAttribute('data-prts-scheme')
 try {
  for(const scheme of ['light','dark']){
   if(await page.locator('html').getAttribute('data-prts-scheme')!==scheme)await page.locator('[data-prts-scheme-toggle]').evaluate(n=>n.click())
   await expect(page.locator('html')).toHaveAttribute('data-prts-scheme',scheme)
   if(await disclosure.getAttribute('aria-expanded')==='true')await disclosure.click()
   await disclosure.click()
   await expect(disclosure).toHaveAttribute('aria-expanded','true')
   await expect(reasoning.locator('[class*="thinkBody"]')).toBeVisible()
   // Simulate wallpaper presence locally; do not change persisted background settings.
   for(const mode of ['full','split']){
    await page.evaluate(mode=>{
     const root=document.documentElement
     root.removeAttribute('data-prts-background-full')
     root.removeAttribute('data-prts-background-conversation')
     root.setAttribute('data-prts-background-mode',mode)
     root.setAttribute('data-prts-background-'+(mode==='full'?'full':'conversation'),'')
    },mode)
    const header=reasoning.locator('[data-disclosure-header]')
    await header.hover()
    await expect(header).toHaveCSS('backdrop-filter','blur(12px)')
    expect(await header.evaluate(n=>getComputedStyle(n).backgroundColor)).toContain('0.28')
   }
   await disclosure.click()
   await expect(disclosure).toHaveAttribute('aria-expanded','false')
  }
  await page.locator('[data-prts-rail-brand]').evaluate(n=>n.click())
  await expect(page.locator('[data-prts-theme-settings]')).toBeVisible()
  await page.locator('#prts-tab-interaction').click()
  await expect(page.locator('[data-prts-corner-sync]')).toBeVisible()
  await page.locator('[data-prts-transfer-open]').hover()
  const frame=page.locator('[data-prts-body-target-frame]')
  await expect(frame).toHaveCSS('opacity','1')
  await expect(frame.locator('i')).toHaveCount(4)
  for(const corner of await frame.locator('i').all())await expect(corner).toBeVisible()
  await page.keyboard.press('Escape')
  expect(errors).toEqual([])
 }finally{
  await page.keyboard.press('Escape')
  if(await page.locator('html').getAttribute('data-prts-scheme')!==originalScheme)await page.locator('[data-prts-scheme-toggle]').evaluate(n=>n.click())
  await page.reload()
 }
})
