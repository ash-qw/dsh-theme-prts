import {test,expect} from '@playwright/test'
import {readFile} from 'node:fs/promises'

async function setup(page, nested=false) {
  await page.addInitScript(()=>localStorage.setItem('dsh.ui.prts.v1',JSON.stringify({version:12,enabled:true,bootAnimation:false})))
  await page.goto('/tests/fixtures/rc7-harness.html')
  const row=page.locator('[data-session-id="fixture-session"]')
  await row.evaluate((el,nested)=>{
    el.setAttribute('aria-selected','false')
    const tree=el.closest('[role="tree"]')
    Object.assign(tree.style,{height:'240px',maxHeight:'240px',overflowY:'auto'})
    const spacer=document.createElement('div')
    Object.assign(spacer.style,{height:'700px',flexShrink:'0'})
    tree.insertBefore(spacer,el);tree.scrollTop=0
    let outer,inner
    if(nested) {
      const root=tree.closest('[data-slot="sidebar.workspaces"]')
      outer=document.createElement('div')
      outer.setAttribute('data-sidebar-scrollport','')
      Object.assign(outer.style,{height:'280px',overflowY:'auto'})
      root.before(outer)
      const navigation=document.createElement('div')
      navigation.style.height='100px'
      outer.append(navigation,root)
      inner=document.createElement('div')
      Object.assign(inner.style,{height:'180px',overflowY:'auto'})
      tree.before(inner)
      inner.append(tree)
      Object.assign(tree.style,{height:'900px',maxHeight:'none',overflowY:'visible'})
    }
    window.__revealScrolls=[]
    const ids=window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds
    const push=ids.push.bind(ids)
    ids.push=(...values)=>{
      const card=el.getBoundingClientRect(),box=tree.getBoundingClientRect()
      window.__navigationGeometry={visible:card.top>=box.top && card.bottom<=box.top+tree.clientHeight+1,
        selected:el.getAttribute('data-prts-selection-target'),top:tree.scrollTop}
      if(nested) {
        window.__navigationGeometry.visible=[outer,inner].every(node=>{
          const bounds=node.getBoundingClientRect()
          return card.top>=bounds.top-1 && card.bottom<=bounds.top+node.clientHeight+1
        })
      }
      // Model a host mount that blocks the main thread immediately after opening.
      const until=performance.now()+180;while(performance.now()<until){}
      return push(...values)
    }
    const original=tree.scrollTo.bind(tree)
    tree.scrollTo=options=>{window.__revealScrolls.push(options);original(options)}
  },nested)
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

test('status summary navigation reveals the card through both sidebar scrollports',async({page})=>{
  await page.setViewportSize({width:1440,height:560})
  await setup(page,true)
  await expect.poll(()=>page.evaluate(()=>window.__PRTS_FIXTURE_RUNTIME__.openedSessionIds)).toEqual(['fixture-session'])
  expect(await page.evaluate(()=>window.__navigationGeometry.visible)).toBe(true)
  expect(await page.evaluate(()=>window.__navigationGeometry.selected)).toBe('true')
})

async function nestedSidebar(page, {reduced=false, offset=200}={}) {
  await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'})
  await page.route('**/tests/nested-sidebar',route=>route.fulfill({contentType:'text/html',body:`
    <html data-dsh-prts><body style="margin:0">
      <aside data-prts-region="sessions" style="position:fixed;inset:0 auto 0 0;width:280px;overflow:hidden">
        <div data-sidebar-scrollport style="height:240px;overflow:auto">
          <nav style="height:180px"></nav>
          <section data-slot="sidebar.workspaces">
            <div data-sidebar-list-area style="height:260px;overflow:auto">
              <div role="tree" style="height:700px;overflow-y:visible">
                <div style="height:${offset}px"></div>
                <div data-row-key="session:target" data-prts-selection-target="true" style="height:34px">target</div>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </body></html>`}))
  await page.goto('/tests/nested-sidebar')
  await page.addStyleTag({content:await readFile(new URL('../../src/styles/prts.css',import.meta.url),'utf8')})
}

for(const reduced of [false,true]) {
  for(const offset of [200,500]) {
    test(`nested sidebar reveals through the outer clip before navigation (reduced=${reduced}, offset=${offset})`,async({page})=>{
      await nestedSidebar(page,{reduced,offset})
      const result=await page.evaluate(async()=>{
        const {createSessionCardReveal}=await import('/src/client/session-card-reveal.js')
        const root=document.querySelector('[data-slot="sidebar.workspaces"]')
        const row=root.querySelector('[data-row-key]')
        const outer=document.querySelector('[data-sidebar-scrollport]')
        const inner=document.querySelector('[data-sidebar-list-area]')
        return new Promise(resolve=>createSessionCardReveal({window,root,sessionId:'target',onDone:()=>{
          const card=row.getBoundingClientRect()
          const visibleIn=node=>{
            const box=node.getBoundingClientRect()
            return card.top>=box.top+node.clientTop-1 && card.bottom<=box.top+node.clientTop+node.clientHeight+1
          }
          resolve({outerVisible:visibleIn(outer),innerVisible:visibleIn(inner),outerTop:outer.scrollTop,innerTop:inner.scrollTop})
        }}))
      })
      expect(result.outerVisible).toBe(true)
      expect(result.innerVisible).toBe(true)
      expect(result.outerTop).toBeGreaterThan(0)
      if(offset===500)expect(result.innerTop).toBeGreaterThan(0)
    })
  }
}

test('session trees retain horizontal clipping without adding vertical scroll range',async({page})=>{
  await nestedSidebar(page)
  await expect(page.getByRole('tree')).toHaveCSS('overflow-x','hidden')
  expect(await page.getByRole('tree').evaluate(node=>node.scrollHeight-node.clientHeight)).toBe(0)
})

test('interrupting an outer reveal stops its animation without navigating',async({page})=>{
  await nestedSidebar(page)
  await page.evaluate(async()=>{
    const {createSessionCardReveal}=await import('/src/client/session-card-reveal.js')
    const root=document.querySelector('[data-slot="sidebar.workspaces"]')
    const row=root.querySelector('[data-row-key]')
    const original=row.scrollIntoView.bind(row)
    row.scrollIntoView=options=>{window.__outerRevealStarted=true;original(options)}
    window.__revealDone=false
    window.__revealTracker=createSessionCardReveal({window,root,sessionId:'target',onDone:()=>{window.__revealDone=true}})
  })
  await expect.poll(()=>page.evaluate(()=>window.__outerRevealStarted)).toBe(true)
  const stopped=await page.evaluate(()=>{
    window.__revealTracker.interrupt()
    return document.querySelector('[data-sidebar-scrollport]').scrollTop
  })
  await page.waitForTimeout(1100)
  expect(await page.evaluate(()=>window.__revealDone)).toBe(false)
  expect(await page.locator('[data-sidebar-scrollport]').evaluate(node=>node.scrollTop)).toBeCloseTo(stopped,0)
})
