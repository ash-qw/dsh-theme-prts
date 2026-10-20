import {test,expect} from '@playwright/test'

async function setup(page) {
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const row=page.locator('[data-session-id="fixture-session"]')
  await row.evaluate(el=>{
    el.setAttribute('aria-selected','false')
    const tree=el.closest('[role="tree"]')
    Object.assign(tree.style,{height:'240px',maxHeight:'240px',overflowY:'auto'})
    const spacer=document.createElement('div')
    Object.assign(spacer.style,{height:'700px',flexShrink:'0'})
    tree.insertBefore(spacer,el);tree.scrollTop=0
    window.__revealScrolls=[]
    const original=tree.scrollTo.bind(tree)
    tree.scrollTo=options=>{window.__revealScrolls.push(options);original(options)}
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').click()
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
  return row
}

test('navigation waits for native selection, scrolls smoothly once and corrects a later viewport resize',async({page})=>{
  const row=await setup(page)
  expect(await page.evaluate(()=>window.__revealScrolls)).toEqual([])
  await row.evaluate(el=>el.setAttribute('aria-selected','true'))
  await expect.poll(()=>page.evaluate(()=>window.__revealScrolls.filter(x=>x.behavior==='smooth').length)).toBe(1)
  await expect.poll(()=>row.evaluate(el=>{
    const r=el.getBoundingClientRect(),tree=el.closest('[role="tree"]'),box=tree.getBoundingClientRect()
    return r.top>=box.top && r.bottom<=box.top+tree.clientHeight+1
  })).toBe(true)
  await row.evaluate(el=>Object.assign(el.closest('[role="tree"]').style,{height:'180px',maxHeight:'180px'}))
  await expect.poll(()=>page.evaluate(()=>window.__revealScrolls.filter(x=>x.behavior==='instant').length)).toBeGreaterThan(0)
  await expect.poll(()=>row.evaluate(el=>{
    const r=el.getBoundingClientRect(),tree=el.closest('[role="tree"]'),box=tree.getBoundingClientRect()
    return r.top>=box.top && r.bottom<=box.top+tree.clientHeight+1
  })).toBe(true)
  expect(await page.evaluate(()=>window.__revealScrolls.filter(x=>x.behavior==='smooth').length)).toBe(1)
})

test('manual sidebar scrolling cancels a reveal that is awaiting native selection',async({page})=>{
  const row=await setup(page)
  await row.evaluate(el=>{
    el.closest('[role="tree"]').dispatchEvent(new WheelEvent('wheel',{bubbles:true,deltaY:-100}))
    el.setAttribute('aria-selected','true')
  })
  await page.waitForTimeout(150)
  expect(await page.evaluate(()=>window.__revealScrolls)).toEqual([])
})
