import {test,expect} from '@playwright/test'

test('hero contrast separates the mark from custom backgrounds and can be disabled',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(()=>localStorage.setItem('prtsFixtureNativeConfig',JSON.stringify({revision:1,value:{enabled:true,bootAnimation:false,motion:'reduced',backgroundMode:'full'}})))
  await page.route('**/prts-theme-api/backgrounds/configuration',route=>route.fulfill({json:{revision:1,full:{id:'11111111-1111-4111-8111-111111111111'},sidebar:null,conversation:null}}))
  await page.route('**/prts-theme-api/backgrounds/image/*',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><defs><pattern id="p" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="#536e78"/><path d="M0 0L120 120M120 0L0 120" stroke="#9ca284" stroke-width="30"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>'}))
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  const surface=page.locator('[data-conversation-scroll]')
  await surface.evaluate(node=>{
    const seat=node.querySelector('[data-composer-seat]'),hero=document.createElement('section')
    hero.dataset.phase='hero';hero.innerHTML='<span data-slot="conversation.hero.brand.mark"></span><h1>探索未至之境</h1>'
    node.replaceChildren(hero,seat)
  })
  await expect(surface).toHaveAttribute('data-prts-hero-active','')
  const alpha=()=>page.locator('[data-prts-particle-layer]').evaluate(c=>{
    const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data
    let count=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>10)count++
    return count
  })
  await expect.poll(alpha).toBeGreaterThan(20000)
  const enhanced=await alpha()
  await page.screenshot({path:'/tmp/prts-hero-enhanced.png'})
  const darkPixels=await page.locator('[data-prts-particle-layer]').evaluate(c=>c.toDataURL())
  await page.locator('[data-prts-scheme-toggle]').click()
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme','light')
  await expect.poll(()=>page.locator('[data-prts-particle-layer]').evaluate(c=>c.toDataURL())).not.toBe(darkPixels)
  await page.screenshot({path:'/tmp/prts-hero-enhanced-light.png'})
  await page.locator('[data-prts-rail-brand]').click()
  await page.getByRole('tab',{name:'会话背景',exact:true}).click()
  await page.locator('[data-prts-background-hero-setting]').scrollIntoViewIfNeeded()
  await page.screenshot({path:'/tmp/prts-hero-setting-desktop.png'})
  await page.setViewportSize({width:480,height:900})
  await page.locator('[data-prts-background-hero-setting]').scrollIntoViewIfNeeded()
  await page.screenshot({path:'/tmp/prts-hero-setting-mobile.png'})
  await page.getByRole('switch',{name:'新会话徽记增强',exact:true}).click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.nativeConfigForm.getSnapshot().value.heroContrast)).toBe(false)
  await page.locator('[data-prts-theme-settings-close]').click()
  await expect.poll(alpha).toBeLessThan(enhanced/2)
  await page.screenshot({path:'/tmp/prts-hero-original.png'})
  expect(errors).toEqual([])
})
