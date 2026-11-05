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

for (const scheme of ['dark', 'light']) for (const width of [287, 148]) {
  test(`current session without trailing controls keeps long titles inside its card (${scheme}, ${width})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, bootAnimation: false, motion: 'reduced',
    })))
    await page.route('**/tests/fixtures/rc7-harness.html', async route => {
      const response = await route.fetch()
      const body = (await response.text())
        .replace('<span class="sessionTime">刚刚</span>', '')
        .replace('<span class="rowActions"><span><button type="button" aria-label="Session row actions">…</button></span></span>', '')
      await route.fulfill({ response, body })
    })
    await page.goto('/tests/fixtures/rc7-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
      await page.locator('[data-prts-scheme-toggle]').click()
    }
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
    await page.locator('[data-prts-region="frame"]').evaluate((node, width) => {
      node.style.gridTemplateColumns = `${width}px minmax(0px, 1fr) 0px`
    }, width)
    const row = page.locator('[data-prts-session-row]')
    const title = row.locator('[data-prts-row-title]')
    await expect(row).toHaveAttribute('aria-selected', 'true')
    await expect(row.locator('[data-prts-session-actions], [data-prts-session-resting], [data-prts-session-time]')).toHaveCount(0)
    for (const text of ['这是一个需要省略显示而不能超出会话卡片右侧边缘的很长的当前会话标题', 'AReallyLongUnbrokenCurrentSessionTitleThatMustRemainInsideTheCardBoundary']) {
      await title.evaluate((node, text) => { node.textContent = text }, text)
      for (const optimistic of [false, true]) {
        await row.evaluate((node, optimistic) => {
          node.setAttribute('aria-selected', String(!optimistic))
          if (optimistic) node.setAttribute('data-prts-selection-target', 'true')
          else node.removeAttribute('data-prts-selection-target')
        }, optimistic)
        for (const hovered of [false, true]) {
          if (hovered) await row.hover()
          else await page.mouse.move(1100, 800)
          await expect(title).toHaveCSS('overflow', 'hidden')
          await expect(title).toHaveCSS('text-overflow', 'ellipsis')
          await expect(title).toHaveCSS('white-space', 'nowrap')
          await expect.poll(() => row.evaluate(node => {
            const title = node.querySelector('[data-prts-row-title]')
            const bounds = title.getBoundingClientRect()
            const face = node.querySelector('[data-prts-facility-face]').getBoundingClientRect()
            return bounds.left >= face.left - 0.5 && bounds.right <= face.right + 0.5
          })).toBe(true)
          expect(await title.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true)
        }
      }
    }
  })
}

for (const structure of ['nested', 'touch']) {
  test.describe(`idle current session title (${structure})`, () => {
    test.use({ hasTouch: structure === 'touch' })
    for (const scheme of ['dark', 'light']) for (const width of [287, 148]) {
      test(`keeps the title inside its card with hidden trailing content (${scheme}, ${width})`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
          version: 12, enabled: true, bootAnimation: false, motion: 'reduced',
        })))
        await page.route('**/tests/fixtures/rc7-harness.html', async route => {
          const response = await route.fetch()
          const body = (await response.text())
            .replace('<span class="sessionTime">刚刚</span>', '<span class="fixture_rowResting"><span class="fixture_time fixture_timestamp">刚刚</span><span data-slot="sidebar.session.row.trailing" style="display:contents"></span></span>')
            .replace('</head>', `<style>
              .fixture_rowResting { display:inline-flex; flex:0 0 auto; }
              .sessionRow:is(:hover, .menuOpen) .fixture_rowResting { display:none; }
              @media (hover:none) {
                .sessionRow .rowActions { display:inline-flex; }
                .fixture_timestamp { display:none; }
              }
            </style></head>`)
          await route.fulfill({ response, body })
        })
        await page.goto('/tests/fixtures/rc7-harness.html')
        await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
        if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
          await page.locator('[data-prts-scheme-toggle]').click()
        }
        await page.locator('[data-prts-region="frame"]').evaluate((node, width) => {
          node.style.gridTemplateColumns = `${width}px minmax(0px, 1fr) 0px`
        }, width)
        const row = page.locator('[data-prts-session-row]')
        const title = row.locator('[data-prts-row-title]')
        await title.evaluate(node => { node.textContent = '这是一个在不悬停时也必须限制在当前会话卡片内部的很长的标题LongUnbrokenSessionTitle' })
        await expect(row.locator('[data-prts-session-resting]')).toHaveCount(1)
        await page.mouse.move(1100, 800)
        for (const optimistic of [false, true]) {
          await row.evaluate((node, optimistic) => {
            node.setAttribute('aria-selected', String(!optimistic))
            if (optimistic) node.setAttribute('data-prts-selection-target', 'true')
            else node.removeAttribute('data-prts-selection-target')
          }, optimistic)
          expect(await row.evaluate(node => node.matches(':hover, :focus-within'))).toBe(false)
          await expect(title).toHaveCSS('overflow', 'hidden')
          await expect(title).toHaveCSS('text-overflow', 'ellipsis')
          await expect.poll(() => row.evaluate(node => {
            const title = node.querySelector('[data-prts-row-title]').getBoundingClientRect()
            const face = node.querySelector('[data-prts-facility-face]').getBoundingClientRect()
            return title.right <= face.right + 0.5
          })).toBe(true)
          expect(await title.evaluate(node => node.scrollWidth > node.clientWidth && node.scrollLeft === 0)).toBe(true)
        }
      })
    }
  })
}
