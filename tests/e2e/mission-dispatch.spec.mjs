import { test, expect } from '@playwright/test'

for (const scheme of ['dark', 'light']) for (const width of [1440, 760, 390]) {
  test(`mission dispatch preserves notification semantics and fits conversation columns (${scheme}, ${width})`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false })))
    await page.goto('/tests/fixtures/rc2-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').evaluate(node => node.click())
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
    await page.addStyleTag({ content: `
      [data-mission-fixture]{position:fixed;top:120px;left:24px;width:${width === 760 ? 310 : Math.min(width - 48, 980)}px;z-index:50}
      .native_trigger{min-width:0;border:.5px solid #888;border-radius:16px;background:#222}
      .native_header{display:flex;align-items:center;gap:10px;width:100%;padding:12px 16px;border:0;background:none;color:#aaa;font:inherit;text-align:left}
      .native_icon{display:inline-flex;flex:none}.native_title{flex:1;min-width:0;font-size:14px;overflow-wrap:anywhere}
      .native_time{flex:none;margin-left:auto;font:12px/1.5 sans-serif}.native_body{padding:0 16px 12px 40px}
      .native_explanation{margin:8px 0;color:var(--dsw-alias-label-secondary);font:12px/1.5 sans-serif}
      .native_content{max-height:240px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 sans-serif}
    ` })
    await page.evaluate(() => {
      const stage = document.createElement('div')
      stage.setAttribute('data-mission-fixture', '')
      stage.innerHTML = `<section class="native_trigger" data-turn-trigger><button class="native_header" type="button" aria-expanded="false" aria-controls="mission-body"><span class="native_icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 16 16"><path d="M5 2.5H3.5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-10a1 1 0 0 0-1-1H11M8 .5v7M5.5 5 8 7.5 10.5 5M5.5 11h5" fill="none" stroke="currentColor"/></svg></span><span class="native_title">收到执行请求</span><time class="native_time" datetime="2026-11-20T09:12:00Z">11月20日 17:12</time><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor"/></svg></button></section><div data-generation-continuation>继续回复</div>`
      const card = stage.querySelector('section')
      const button = stage.querySelector('button')
      button.onclick = () => {
        const open = button.getAttribute('aria-expanded') === 'true'
        button.setAttribute('aria-expanded', String(!open))
        if (open) document.getElementById('mission-body').remove()
        else {
          const body = document.createElement('div')
          body.id = 'mission-body'; body.className = 'native_body'
          body.innerHTML = '<p class="native_explanation">这条通知触发了本轮回复。</p><div class="native_content"><pre data-context-text>请继续处理刚才的执行请求。\n' + '通知原文与来源字段保持可读。\n'.repeat(30) + '</pre><dl data-context-fields><div><dt>provider</dt><dd>custom-extension</dd></div></dl><a href="#mission-link">通知中的链接</a></div>'
          card.append(body)
        }
      }
      document.querySelector('[data-prts-region="operation"]').append(stage)
    })
    const card = page.locator('[data-turn-trigger]')
    const button = card.locator(':scope > button')
    await expect(card).toHaveAttribute('data-prts-mission', '')
    await expect(button).toHaveAccessibleName('收到执行请求 11月20日 17:12')
    await expect(button).not.toHaveAttribute('data-prts-conversation-control', /./)
    await expect(button).toHaveCSS('display', 'grid')
    await expect(card).toHaveCSS('border-radius', '6px')
    expect(await button.evaluate(node => node.getBoundingClientRect().height)).toBeLessThanOrEqual(52)
    await expect(card.locator('[data-prts-mission-decoration="category"]')).toHaveCSS('grid-row-start', '1')
    await expect(card.locator('[data-prts-mission-part="title"]')).toHaveCSS('grid-row-start', '2')
    await expect(card.locator('[data-prts-mission-part="time"]')).toHaveCSS('grid-row-start', '3')
    if (width === 1440) await expect(card.locator('[data-prts-mission-decoration="caption"]')).toBeVisible()
    const fit = () => card.evaluate(node => [...node.querySelectorAll('button, [data-prts-mission-part="title"], time, [data-prts-mission-decoration="action"]')].filter(child => {
      const a = node.getBoundingClientRect(), b = child.getBoundingClientRect()
      return b.x < a.x - 1 || b.right > a.right + 1 || (!child.hasAttribute('data-prts-mission-decoration') && child.scrollWidth > child.clientWidth + 1)
    }).map(child => ({ part: child.outerHTML.slice(0, 100), scroll: child.scrollWidth, client: child.clientWidth })))
    expect(await fit()).toEqual([])
    await button.focus()
    await expect(button).toHaveCSS('outline-style', 'solid')
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(card.locator('[data-prts-mission-decoration="collapse"]')).toBeVisible()
    await expect(card.locator('[data-prts-mission-decoration="expand"]')).toBeHidden()
    const body = card.locator('#mission-body')
    const bodyText = card.locator('[data-context-text]')
    const colors = {
      dark: { ink: 'rgb(225, 231, 235)', surface: 'rgb(37, 44, 48)', note: 'rgb(192, 220, 230)' },
      light: { ink: 'rgb(33, 63, 81)', surface: 'rgb(255, 255, 255)', note: 'rgb(36, 92, 120)' },
    }
    const checkBody = async mode => {
      await expect(body).toHaveCSS('background-color', colors[mode].surface)
      await expect(bodyText).toHaveCSS('color', colors[mode].ink)
      await expect(body.locator(':scope > p')).toHaveCSS('color', colors[mode].note)
    }
    await checkBody(scheme)
    // Theme changes must also update a body that is already open.
    await page.locator('[data-prts-scheme-toggle]').evaluate(node => node.click())
    await checkBody(scheme === 'dark' ? 'light' : 'dark')
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await page.locator('[data-prts-scheme-toggle]').evaluate(node => node.click())
    await checkBody(scheme)
    const content = card.locator('.native_content')
    expect(await content.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true)
    await card.screenshot({ path: testInfo.outputPath('mission-expanded.png') })
    await content.evaluate(node => node.scrollTop = node.scrollHeight)
    await expect(content.getByRole('link')).toBeInViewport()
    await button.evaluate(node => node.addEventListener('click', () => queueMicrotask(() => {
      const ghost = node.parentElement.querySelector('[data-prts-mission-exit]')
      window.__missionExit = ghost && { hidden: ghost.getAttribute('aria-hidden'), inert: ghost.hasAttribute('inert'), ids: ghost.querySelectorAll('[id]').length, animating: ghost.getAnimations().length > 0 }
    }), { once: true }))
    await button.focus()
    await page.keyboard.press('Space')
    expect(await page.evaluate(() => window.__missionExit)).toEqual({ hidden: 'true', inert: true, ids: 0, animating: true })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(card.locator('#mission-body')).toHaveCount(0)
    const exit = card.locator('[data-prts-mission-exit]')
    await expect(exit).toHaveCount(0)
    // Reverse each direction before completion; no ghost or stale animation survives.
    await button.evaluate(node => { node.click(); setTimeout(() => node.click(), 50); setTimeout(() => node.click(), 90) })
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(card.locator('#mission-body')).toHaveCount(1)
    await expect(card).not.toHaveAttribute('data-prts-mission-transition', '')
    await expect(exit).toHaveCount(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(exit).toHaveCount(0)
    await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true')
    await expect(card.locator('[data-prts-mission-motion]')).toHaveCount(0)
    await button.click()
    await expect(page.locator('[data-generation-continuation]')).not.toHaveAttribute('data-prts-mission', /./)
    await card.locator('[data-prts-mission-part="title"]').evaluate(node => node.textContent = 'Execution requested / 自动化任务 / ' + '很长的通知标题'.repeat(5))
    expect(await fit()).toEqual([])
    await expect(card.locator('[data-prts-mission-part="chevron"]')).toHaveCSS('transition-duration', '0s')
    await card.screenshot({ path: testInfo.outputPath('mission-long-title.png') })
  })
}
