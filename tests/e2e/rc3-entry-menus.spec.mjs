import { test, expect } from '@playwright/test'

// rc.3 uses body portals with MenuSurface/MenuItemButton; anchors have no aria-controls.
for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test(`rc.3 entry menus preserve native item states (${scheme}, ${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1',
      JSON.stringify({ version: 12, enabled: true, bootAnimation: false, scheme })), scheme)
    await page.goto('/tests/fixtures/rc2-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.evaluate(scheme => {
      const style = document.createElement('style')
      style.textContent = `
        .rc3-native-item { display:block; width:100%; border:0; background:transparent; padding:8px; }
        .rc3-native-item:hover:not(:disabled), .rc3-native-item:focus-visible:not(:disabled) {
          background:var(--dsw-alias-interactive-bg-hover); outline:none;
        }`
      document.head.append(style)
      const host = document.createElement('div')
      host.style.cssText = 'position:fixed;top:100px;left:20px;z-index:999;display:grid;gap:10px'
      document.body.append(host)
      for (const [kind, label, className] of [
        ['sidebar', '更多', 'hHd-Xa_panelRow'],
        ['conversation', '更多会话视图', 'wSkVaW_viewsMore'],
        ['rightbar', '更多工具', 'geFEbW_entry'],
      ]) {
        const anchor = document.createElement('button')
        anchor.id = 'rc3-' + kind
        anchor.className = className
        anchor.textContent = label
        anchor.setAttribute('aria-haspopup', 'menu')
        anchor.setAttribute('aria-expanded', 'false')
        host.append(anchor)
        anchor.onclick = () => {
          const menu = document.createElement('div')
          menu.id = 'rc3-menu'
          menu.setAttribute('role', 'menu')
          menu.setAttribute('data-menu-material', 'translucent')
          menu.className = '_surface_ri079_1 _list_4ub78_7 _portal_4ub78_41'
          menu.style.cssText = 'position:fixed;left:20px;top:280px;width:260px;z-index:999;--dsw-alias-interactive-bg-hover:' +
            (scheme === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)')
          menu.innerHTML = '<div aria-hidden="true" class="_material_ri079_21"></div><div role="presentation">' +
            ['浏览更多插件', '创建你的插件'].map(text =>
              '<div class="_itemWrap_4ub78_90"><button role="menuitem" class="_item_4ub78_90 rc3-native-item">' + text + '</button></div>').join('') + '</div>'
          menu.addEventListener('click', event => {
            if (event.target.closest('[role="menuitem"]')) menu.dataset.chosen = event.target.textContent
          })
          menu.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
              menu.remove()
              anchor.setAttribute('aria-expanded', 'false')
              anchor.focus()
            }
          })
          document.body.append(menu)
          anchor.setAttribute('aria-expanded', 'true')
          menu.querySelector('button').focus()
        }
      }
    }, scheme)
    for (const kind of ['sidebar', 'conversation', 'rightbar']) {
      const anchor = page.locator('#rc3-' + kind)
      await anchor.click()
      const menu = page.locator('#rc3-menu')
      await expect(menu).toHaveAttribute('data-prts-floating-glass', 'menu')
      await expect(menu).not.toHaveAttribute('data-prts-glass-menu')
      const background = scheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
      const items = menu.getByRole('menuitem')
      await expect(items).toHaveCount(2)
      for (let i = 0; i < 2; i++) {
        const item = items.nth(i)
        await item.hover()
        await expect(item).toHaveCSS('background-color', background)
        await expect(item).not.toHaveAttribute('data-prts-corner-target')
        await item.click()
        await expect(menu).toHaveAttribute('data-chosen', await item.textContent())
      }
      await items.first().focus()
      await page.keyboard.press('Tab')
      await expect(items.last()).toBeFocused()
      await expect(items.last()).toHaveCSS('background-color', background)
      await page.keyboard.press('Escape')
      await expect(menu).toHaveCount(0)
      await expect(anchor).toBeFocused()
      const frame = page.locator('[data-prts-body-target-frame]')
      await expect(frame).toHaveCSS('opacity', '0')
    }
    expect(errors).toEqual([])
  })
}
