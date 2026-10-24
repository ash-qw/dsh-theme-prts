import { test, expect } from '@playwright/test'

test('composer menus retain native hover and keyboard backgrounds', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false })))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = '.native-option:hover,.native-option:focus-visible,.native-option[data-highlighted] { background: var(--dsw-alias-interactive-bg-hover, rgb(61, 72, 83)); }'
    document.head.append(style)
    const composer = document.createElement('div')
    composer.setAttribute('data-composer-card', '')
    composer.innerHTML = '<span><button class="iWlSmW_trigger" aria-label="权限模式：仅可查看"><span class="iWlSmW_triggerLabel">仅可查看</span></button></span><button aria-haspopup="menu" aria-controls="model-menu">模型</button><button aria-haspopup="listbox" aria-controls="action-menu">添加</button>'
    document.body.append(composer)
    const menus = [
      '<div id="permission-menu" role="menu" data-menu-material><button role="menuitemradio" class="native-option">权限项</button></div>',
      '<div id="model-menu" role="group" data-menu-material><div role="menu"><button role="menuitem" class="native-option">模型项</button></div></div>',
      '<div id="action-menu" role="listbox" data-menu-material><button role="option" class="native-option">添加项</button></div>',
      '<div id="generic-menu" role="menu"><button role="menuitem" class="native-option">其它菜单项</button></div>',
    ]
    menus.forEach((html, i) => {
      document.body.insertAdjacentHTML('beforeend', html)
      document.body.lastElementChild.style.cssText = 'position:fixed;left:700px;top:' + (100 + i * 120) + 'px;z-index:100;width:200px'
    })
  })
  for (const kind of ['permission', 'model', 'action']) {
    const menu = page.locator('#' + kind + '-menu')
    if (kind === 'permission') {
      // The current host Menu portals to body without linking its anchor by ID.
      await expect(menu).not.toHaveAttribute('data-prts-glass-menu')
      await expect(menu.locator('button')).toHaveAttribute('data-prts-floating-item', '')
    } else await expect(menu).toHaveAttribute('data-prts-glass-menu', kind)
    const item = menu.locator('button')
    await item.hover()
    await expect(item).toHaveCSS('background-color', 'rgb(61, 72, 83)')
    await expect(item).not.toHaveAttribute('data-prts-corner-target')
    await page.mouse.move(0, 0)
    await item.evaluate(el => el.setAttribute('data-highlighted', ''))
    await expect(item).toHaveCSS('background-color', 'rgb(61, 72, 83)')
    await item.evaluate(el => el.removeAttribute('data-highlighted'))
    await page.keyboard.press('Tab')
    await item.focus()
    await expect(item).toHaveCSS('background-color', 'rgb(61, 72, 83)')
    await item.evaluate(el => el.blur())
  }
  const generic = page.locator('#generic-menu button')
  await expect(generic).toHaveAttribute('data-prts-floating-item', '')
  await generic.hover()
  await expect(generic).not.toHaveCSS('background-color', 'rgb(61, 72, 83)')
})
