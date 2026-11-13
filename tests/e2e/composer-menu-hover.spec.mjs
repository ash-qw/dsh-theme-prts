import { test, expect } from '@playwright/test'

for (const enhanced of [false, true]) test(`composer menus retain native hover and keyboard backgrounds (${enhanced ? 'enhanced' : 'basic'})`, async ({ page }) => {
  await page.addInitScript(enhanced => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({ version: 12, enabled: true, bootAnimation: false, composerGlass: enhanced })), enhanced)
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  if (enhanced) await expect(page.locator('html')).toHaveAttribute('data-prts-composer-enhanced', '')
  await page.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = `
      .native-option:hover,.native-option:focus-visible,.native-option[data-highlighted] { background: var(--dsw-alias-interactive-bg-hover, rgb(61, 72, 83)); }
      ._material_fixture_21 { position:absolute; inset:0; pointer-events:none; background:rgba(48,49,54,.64); backdrop-filter:blur(40px) saturate(1.5); }
    `
    document.head.append(style)
    const composer = document.createElement('div')
    composer.setAttribute('data-composer-card', '')
    composer.innerHTML = '<span data-slot="conversation.input.permission"><button class="arbitrary_permission_hash" aria-label="权限模式：仅可查看"><span class="iWlSmW_triggerLabel">仅可查看</span></button></span><span data-slot="conversation.input.model"><button aria-haspopup="menu" aria-controls="model-menu">模型</button></span><button aria-haspopup="listbox" aria-controls="action-menu">添加</button>'
    document.body.append(composer)
    const menus = [
      '<div id="permission-menu" role="menu" data-menu-material><div aria-hidden="true" class="_material_fixture_21"></div><button role="menuitemradio" class="native-option">权限项</button></div>',
      '<div id="model-menu" role="group" data-menu-material><div aria-hidden="true" class="_material_fixture_21"></div><div role="menu"><button role="menuitem" class="native-option">模型项</button></div></div>',
      '<div id="action-menu" role="listbox" data-menu-material><div aria-hidden="true" class="_material_fixture_21"></div><button role="option" class="native-option">添加项</button></div>',
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
      await expect(menu).toHaveCSS('backdrop-filter', 'none')
      await expect(menu.locator('> [aria-hidden="true"]')).toHaveCSS('backdrop-filter', 'blur(16px) saturate(1.45)')
    } else {
      await expect(menu).toHaveAttribute('data-prts-glass-menu', kind)
      await expect(menu).toHaveCSS('backdrop-filter', kind === 'model' || enhanced ? 'none' : 'blur(22px) saturate(1.55)')
      await expect(menu.locator('> [aria-hidden="true"]')).toHaveCSS('backdrop-filter', kind === 'model' ? 'blur(16px) saturate(1.45)' : enhanced ? 'blur(16px) saturate(1.15)' : 'none')
    }
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

test('unlinked native preset portals use generic menu material without guessing their owner', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, bootAnimation: false,
  })))
  await page.goto('/tests/fixtures/rc2-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  await page.evaluate(() => {
    const slot = document.createElement('div')
    slot.dataset.slot = 'conversation.hero.agentPreset'
    slot.innerHTML = '<span><button id="native-preset" aria-haspopup="menu" aria-expanded="true">Preset</button></span>'
    document.querySelector('[data-prts-region="operation"]').append(slot)
    const popup = document.createElement('div')
    popup.id = 'native-preset-menu'
    popup.setAttribute('role', 'menu')
    popup.setAttribute('data-menu-material', 'translucent')
    popup.style.cssText = 'position:fixed;left:700px;top:200px;z-index:100;width:200px'
    popup.innerHTML = '<div aria-hidden="true" class="_material_fixture_21" style="backdrop-filter:blur(40px)"></div><button role="menuitem">Preset entry</button>'
    document.body.append(popup)
  })
  await expect(page.locator('#native-preset')).toHaveAttribute('data-prts-glass-control', 'preset')
  const popup = page.locator('#native-preset-menu')
  await expect(popup).not.toHaveAttribute('data-prts-glass-menu')
  await expect(popup).toHaveAttribute('data-prts-floating-glass', 'menu')
  await expect(popup.locator('button')).toHaveAttribute('data-prts-floating-item', '')
  await expect(popup.locator('> [aria-hidden="true"]')).toHaveCSS('backdrop-filter', 'blur(16px) saturate(1.45)')
  await expect(popup).toHaveCSS('backdrop-filter', 'none')
  await popup.locator('button').click({ trial: true })
})
