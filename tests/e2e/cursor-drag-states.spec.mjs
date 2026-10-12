import {test,expect} from '@playwright/test'

test('partner grab and grabbing use distinct assets without click animation; disabled states take precedence',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,cursor:'prts',bootAnimation:false})))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await page.evaluate(()=>{
    const style=document.createElement('style')
    style.textContent='.dsh-partner-pendant button{cursor:pointer}.dsh-partner-pendant button:where(.dsh-partner-pendant-hit,.dsh-partner-pendant-anchor):enabled{cursor:grab}.dsh-partner-pendant button:where(.dsh-partner-pendant-hit,.dsh-partner-pendant-anchor):enabled:active{cursor:grabbing}'
    document.head.append(style)
    const surface=document.createElement('div')
    surface.className='dsh-partner-pendant'
    surface.style.cssText='position:fixed;left:300px;top:250px;z-index:9999'
    surface.innerHTML='<button class="dsh-partner-pendant-hit">挂牌</button><button class="dsh-partner-pendant-anchor">挂点</button><button disabled>禁止</button><button aria-disabled="true" class="dsh-partner-pendant-hit">不可拖动</button>'
    document.body.append(surface)
    for(const button of surface.querySelectorAll('button:not(:disabled)'))button.addEventListener('pointerdown',e=>button.setPointerCapture(e.pointerId))
  })
  const buttons=page.locator('.dsh-partner-pendant button')
  for(const index of [0,1]){
    const button=buttons.nth(index)
    await button.hover()
    const grab=await button.evaluate(e=>getComputedStyle(e).cursor)
    expect(grab).toMatch(/data:image\/png.*22 19, grab$/)
    await page.mouse.down()
    const grabbing=await button.evaluate(e=>getComputedStyle(e).cursor)
    expect(grabbing).toMatch(/data:image\/png.*22 19, grabbing$/)
    expect(grabbing).not.toBe(grab)
    await page.mouse.move(700,400)
    await page.waitForTimeout(180)
    await expect(page.locator('[data-prts-hand-active]')).toHaveCount(0)
    expect(await button.evaluate(e=>getComputedStyle(e).cursor)).toBe(grabbing)
    await page.mouse.up()
    expect(await button.evaluate(e=>getComputedStyle(e).cursor)).toBe(grab)
  }
  for(const index of [2,3]){
    await buttons.nth(index).hover({force:true})
    expect(await buttons.nth(index).evaluate(e=>getComputedStyle(e).cursor)).toMatch(/data:image\/png.*7 7, not-allowed$/)
  }
  await page.mouse.down()
  await expect(page.locator('[data-prts-hand-active]')).toHaveCount(0)
  await page.mouse.up()
  await page.evaluate(()=>document.documentElement.setAttribute('data-prts-cursor','system'))
  expect(await buttons.first().evaluate(e=>getComputedStyle(e).cursor)).toBe('grab')
})
