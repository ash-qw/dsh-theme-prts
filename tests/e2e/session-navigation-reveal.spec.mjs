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
    const ids=window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds
    const push=ids.push.bind(ids)
    ids.push=(...values)=>{
      const card=el.getBoundingClientRect(),box=tree.getBoundingClientRect()
      window.__navigationGeometry={visible:card.top>=box.top && card.bottom<=box.top+tree.clientHeight+1,
        selected:el.getAttribute('data-prts-selection-target'),top:tree.scrollTop}
      // Model a host mount that blocks the main thread immediately after opening.
      const until=performance.now()+180;while(performance.now()<until){}
      return push(...values)
    }
    const original=tree.scrollTo.bind(tree)
    tree.scrollTo=options=>{window.__revealScrolls.push(options);original(options)}
  })
  await page.locator('[data-prts-session-summary-trigger="ongoing"]').hover()
  await page.locator('[data-prts-session-summary-item="fixture-session"]').click()
  return row
}

test('sidebar scroll and selection finish before a blocking conversation mount',async({page})=>{
  const row=await setup(page)
  await expect.poll(()=>page.evaluate(()=>window.__revealScrolls.some(x=>x.behavior==='smooth'))).toBe(true)
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
  const geometry=await page.evaluate(()=>window.__navigationGeometry)
  expect(geometry.visible).toBe(true)
  expect(geometry.selected).toBe('true')
  const before=await page.evaluate(()=>window.__revealScrolls.length)
  await page.waitForTimeout(250)
  expect(await row.evaluate(el=>el.closest('[role="tree"]').scrollTop)).toBeCloseTo(geometry.top,0)
  expect(await page.evaluate(()=>window.__revealScrolls.length)).toBe(before)
})

test('manual sidebar scrolling cancels the pending conversation navigation',async({page})=>{
  const row=await setup(page)
  await row.evaluate(el=>el.closest('[role="tree"]').dispatchEvent(new WheelEvent('wheel',{bubbles:true,deltaY:-100})))
  await page.waitForTimeout(1200)
  expect(await page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual([])
})
