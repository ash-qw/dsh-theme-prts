import { expect, test } from '@playwright/test'
import sharp from 'sharp'

const wallpaper = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><path fill="#304958" d="M0 0h400v800H0z"/><path fill="#987755" d="M400 0h400v800H400z"/></svg>').toString('base64')}`

async function openSidebarFixture(page, scheme, width) {
  await page.setViewportSize({ width, height: 800 })
  await page.route('**/right-sidebar-material-fixture', route => route.fulfill({ contentType: 'text/html', body: `<!doctype html>
    <html data-dsh-prts data-prts-scheme="${scheme}" data-prts-glass="standard" data-prts-background-mode="none">
    <head><meta charset="UTF-8"><link rel="stylesheet" href="/src/styles/prts.css"><link rel="stylesheet" href="/src/styles/right-sidebar.css"><link rel="stylesheet" href="/src/styles/custom-background.css">
    <style>
    html { --prts-background-full:url('${wallpaper}'); --prts-background-conversation:url('${wallpaper}'); --prts-background-shade:0%; --prts-right-sidebar-opacity:6%; --prts-right-sidebar-blur:8px; }
    body { margin:0; } [data-prts-region="frame"] { width:100vw; height:800px; }
    [data-prts-region="auxiliary"], [data-sidebar-right-panel], [data-dockkit-host], [data-dockkit-empty], [data-dockkit-pane] { height:100%; }
    [data-dockkit-pane] { display:flex; flex-direction:column; }
    [data-dockkit-host="float"] { position:fixed; inset:40px 20px; height:auto; z-index:60; }
    [data-dockkit-strip] { height:38px; flex:none; }
    [data-files-page] { display:flex; flex:1; flex-direction:column; min-height:0; }
    [data-files-navigator] { position:relative; flex:1; min-height:0; background:var(--dsw-alias-bg-base); }
    .search-bar { height:42px; box-sizing:border-box; padding:8px; }
    .search-field { display:flex; height:28px; box-sizing:border-box; border:.5px solid var(--dsw-alias-border-l4); background:var(--dsw-alias-bg-layer-1); }
    [data-files-search] { flex:1; min-width:0; color:var(--dsw-alias-label-primary); background:transparent; border:0; outline:0; }
    [data-files-search-settings] { position:absolute; inset:42px 8px 8px; display:flex; flex-direction:column; padding:6px 4px 6px 10px; background:var(--dsw-alias-bg-base); border-radius:12px; }
    .add-rule { display:flex; min-height:32px; flex:none; border-top:.5px solid var(--dsw-alias-border-l3); }
    .add-rule input { min-width:0; flex:1; border:0; outline:0; background:transparent; }
    [data-files-search-settings] ul { flex:1; min-height:0; overflow:auto; list-style:none; padding:0; }
    [data-files-rule] { min-height:32px; }
    [data-files-search-settings] input[type=checkbox] { width:14px; height:14px; }
    [data-files-search-settings][hidden], [data-dockkit-host][hidden], [data-dockkit-empty][hidden] { display:none; }
    [data-files-navigator-mode=overlay] { position:absolute; inset:80px 8px 8px auto; width:60%; }
    [data-document-preview] { background:transparent; }
    [data-pdf-preview], .xterm { background:rgb(20,21,22); height:20px; }
    </style></head><body><div data-prts-region="frame"><aside data-prts-region="auxiliary"><div data-sidebar-right-panel="push">
    <div data-dockkit-host="dock"><section data-dockkit-pane="files"><div data-dockkit-strip="files"><button data-dockkit-add-tab>+</button></div>
    <div data-files-page><aside data-files-navigator="files"><div class="search-bar"><div class="search-field"><button data-files-search-settings-toggle aria-expanded="false">设置</button><input type="search" data-files-search aria-label="搜索文件" placeholder="搜索文件"></div></div>
    <div data-files-body></div><section role="dialog" data-files-search-settings aria-label="排除的文件和目录" hidden><header>排除的文件和目录</header><label><input type="checkbox" data-files-respect-gitignore checked>尊重忽略文件</label><div class="add-rule"><input type="text" aria-label="添加排除规则" aria-invalid="false"></div><ul>${Array.from({length:40}, (_, index) => `<li data-files-rule="rule-${index}"><label><input type="checkbox" checked>rule-${index}</label></li>`).join('')}</ul></section>
    </aside></div></section></div>
    <div data-dockkit-empty hidden><section data-dockkit-pane="empty">空面板</section></div>
    <div data-dockkit-host="float" hidden><section data-dockkit-pane="floating" data-dockkit-float="floating"><div data-document-preview><div data-pdf-preview></div><div class="xterm"></div></div></section></div>
    </div></aside></div><section role="dialog" id="unrelated-dialog">Unrelated</section>
    <script>
    const toggle=document.querySelector('[data-files-search-settings-toggle]');const settings=document.querySelector('[data-files-search-settings]');
    toggle.onclick=()=>{settings.hidden=!settings.hidden;toggle.setAttribute('aria-expanded',String(!settings.hidden));if(!settings.hidden)settings.querySelector('input[type=text]').focus()};
    settings.onkeydown=event=>{if(event.key==='Escape'){settings.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus()}};
    </script></body></html>` }))
  await page.goto('/right-sidebar-material-fixture')
}

for (const scheme of ['dark', 'light']) {
  for (const width of [390, 768, 1440]) {
    test(`right sidebar surfaces preserve material layers (${scheme}, ${width})`, async ({ page }) => {
      await openSidebarFixture(page, scheme, width)
      const pane = page.locator('[data-dockkit-pane="files"]')
      const navigator = page.locator('[data-files-navigator]')
      await expect(navigator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      const panelColor = await pane.evaluate(node => getComputedStyle(node).backgroundColor)
      expect(panelColor).not.toBe('rgba(0, 0, 0, 0)')
      for (const mode of ['split', 'full']) {
        await page.locator('html').evaluate((node, mode) => {
          node.dataset.prtsBackgroundMode = mode
          node.setAttribute(`data-prts-background-${mode === 'split' ? 'conversation' : 'full'}`, '')
        }, mode)
        await expect(pane).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        expect(await pane.evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(8px)')
        await expect(navigator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
        const image = await page.screenshot()
        const sample = async left => [...await sharp(image).extract({left, top:700, width:1, height:1}).removeAlpha().raw().toBuffer()]
        expect(await sample(Math.floor(width * .1))).not.toEqual(await sample(Math.floor(width * .9)))
      }
      await page.locator('html').evaluate(node => {
        node.style.setProperty('--prts-right-sidebar-opacity', '40%')
        node.style.setProperty('--prts-right-sidebar-blur', '14px')
      })
      expect(await pane.evaluate(node => getComputedStyle(node, '::before').backgroundColor)).toContain('0.4)')
      expect(await pane.evaluate(node => getComputedStyle(node, '::before').backdropFilter)).toContain('blur(14px)')
      await page.locator('html').evaluate(node => { node.dataset.prtsBackgroundMode = 'split'; node.removeAttribute('data-prts-background-conversation') })
      await expect(pane).toHaveCSS('background-color', panelColor)
      await page.locator('[data-dockkit-host="dock"]').evaluate(node => node.hidden = true)
      const empty = page.locator('[data-dockkit-empty]')
      await empty.evaluate(node => node.hidden = false)
      await page.locator('html').evaluate(node => node.setAttribute('data-prts-background-conversation', ''))
      await expect(empty).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      await expect(empty.locator('[data-dockkit-pane]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      expect(await empty.evaluate(node => getComputedStyle(node, '::before').content)).toBe('""')
      await page.locator('[data-dockkit-host="float"]').evaluate(node => node.hidden = false)
      const floating = page.locator('[data-dockkit-float]')
      await expect(floating).toHaveCSS('backdrop-filter', 'blur(22px) saturate(1.55)')
      await expect(page.locator('[data-document-preview]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      for (const selector of ['[data-pdf-preview]', '.xterm']) await expect(page.locator(selector)).toHaveCSS('background-color', 'rgb(20, 21, 22)')
      await page.locator('html').evaluate(node => node.dataset.prtsGlass = 'off')
      await expect(floating).toHaveCSS('backdrop-filter', 'none')
    })

    test(`file search settings and controls retain native geometry (${scheme}, ${width})`, async ({ page }) => {
      await openSidebarFixture(page, scheme, width)
      const input = page.locator('[data-files-search]')
      await input.focus()
      const field = input.locator('..')
      const accent = await input.evaluate(node => getComputedStyle(node).caretColor)
      await expect(field).toHaveCSS('border-color', accent)
      expect((await input.boundingBox()).height).toBeLessThanOrEqual(28)
      const toggle = page.locator('[data-files-search-settings-toggle]')
      await toggle.click()
      const settings = page.locator('[data-files-search-settings]')
      await expect(settings).toBeVisible()
      expect(await settings.getAttribute('aria-modal')).toBeNull()
      const add = settings.locator('input[type=text]')
      await expect(add).toBeFocused()
      await expect(add.locator('..')).toHaveCSS('border-top-color', accent)
      const bounds = await settings.boundingBox()
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(800)
      const check = settings.locator('[data-files-respect-gitignore]')
      await expect(check).toHaveCSS('height', '14px')
      await expect(check).toHaveCSS('accent-color', accent)
      await check.uncheck()
      await expect(check).not.toBeChecked()
      const list = settings.locator('ul')
      expect(await list.evaluate(node => node.scrollHeight > node.clientHeight)).toBe(true)
      await list.evaluate(node => node.scrollTop = 100)
      expect(await list.evaluate(node => node.scrollTop)).toBeGreaterThan(0)
      for (const [glass, filter] of [['standard', 'blur(22px) saturate(1.55)'], ['soft', 'blur(18px) saturate(1.45)'], ['clear', 'blur(28px) saturate(1.8)'], ['off', 'none']]) {
        await page.locator('html').evaluate((node, glass) => node.dataset.prtsGlass = glass, glass)
        await expect(settings).toHaveCSS('backdrop-filter', filter)
      }
      await add.evaluate(node => node.setAttribute('aria-invalid', 'true'))
      const error = await add.evaluate(node => getComputedStyle(node).getPropertyValue('--prts-red').trim())
      expect(await add.locator('..').evaluate(node => getComputedStyle(node).borderTopColor)).not.toBe(accent)
      expect(error).not.toBe('')
      await page.keyboard.press('Escape')
      await expect(settings).toBeHidden()
      await expect(toggle).toBeFocused()
      await page.locator('[data-files-navigator]').evaluate(node => node.dataset.filesNavigatorMode = 'overlay')
      await page.locator('html').evaluate(node => node.dataset.prtsGlass = 'standard')
      await expect(page.locator('[data-files-navigator]')).toHaveCSS('backdrop-filter', 'blur(22px) saturate(1.55)')
      await expect(page.locator('#unrelated-dialog')).toHaveCSS('backdrop-filter', 'none')
      await page.locator('html').evaluate(node => node.removeAttribute('data-dsh-prts'))
      await toggle.click()
      await expect(settings).toHaveCSS('backdrop-filter', 'none')
    })
  }
}
