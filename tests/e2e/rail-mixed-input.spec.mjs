import {test,expect} from '@playwright/test'
for(const width of [520,640,641]) test('mouse navigation with touch capability at '+width,async({page})=>{
 await page.setViewportSize({width,height:800})
 await page.addInitScript(()=>{
  Object.defineProperty(navigator,'maxTouchPoints',{get:()=>10})
  localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:8,enabled:true,bootAnimation:false,railDefaultHidden:false}))
 })
 await page.goto('/tests/fixtures/rc7-harness.html')
 const root=page.locator('html'),launcher=page.locator('[data-prts-rail-launcher]')
 await expect(root).toHaveAttribute('data-prts-rail-mode','overlay')
 await launcher.click()
 await expect(root).toHaveAttribute('data-prts-rail-open','')
 await page.keyboard.press('Escape')
 await expect(root).not.toHaveAttribute('data-prts-rail-open')
 await launcher.focus()
 await page.keyboard.press('Enter')
 await expect(root).toHaveAttribute('data-prts-rail-open','')
})
