import { expect, test } from '@playwright/test'

async function openFixture(page, fixture, scheme) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, scheme, motion: 'reduced', bootAnimation: false,
  })), scheme)
  await page.goto(`/tests/fixtures/${fixture}-harness.html`)
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
    await page.locator('[data-prts-scheme-toggle]').click()
  }
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
}

for (const fixture of ['rc2', 'rc7']) for (const scheme of ['dark', 'light']) {
  test(`inline quote removal keeps native geometry, focus and events (${fixture}, ${scheme})`, async ({ page }) => {
    await openFixture(page, fixture, scheme)
    await page.addStyleTag({ content: `
      .fixtureQuote { display:inline-flex;align-items:baseline;gap:4px;max-width:300px;color:#67aaff; }
      .fixtureQuoteRemove { display:grid;place-items:center;align-self:center;flex:none;width:16px;height:16px;padding:0;border:0;border-radius:50%;background:transparent;color:inherit; }
      .fixtureQuoteRemove svg { grid-area:1/1; }
    ` })
    await page.evaluate(() => {
      const composer = document.querySelector('[data-composer-card]')
      composer.insertAdjacentHTML('beforeend', `
        <span contenteditable="true" data-fixture-quote-editor>Draft text</span>
        <span data-composer-quote><span class="fixtureQuote" data-quote-preview data-removable><button type="button" class="fixtureQuoteRemove" aria-label="移除指针引用"><svg width="16" height="16"><rect width="8" height="8" fill="currentColor"/></svg></button><span data-quote-preview-text>Quoted text</span></span></span>
        <span data-composer-quote><span class="fixtureQuote" data-quote-preview data-removable><button type="button" class="fixtureQuoteRemove" aria-label="移除键盘引用"><svg width="16" height="16"><rect width="8" height="8" fill="currentColor"/></svg></button><span data-quote-preview-text>Second quote</span></span></span>
      `)
      composer.dataset.fixtureQuoteRemovals = '0'
      for (const button of composer.querySelectorAll('.fixtureQuoteRemove')) {
        button.addEventListener('pointerdown', event => { event.preventDefault(); event.stopPropagation() })
        button.addEventListener('click', event => {
          event.preventDefault()
          event.stopPropagation()
          composer.dataset.fixtureQuoteRemovals = String(Number(composer.dataset.fixtureQuoteRemovals) + 1)
          button.closest('[data-composer-quote]').remove()
        })
      }
    })
    const pointerRemove = page.getByRole('button', { name: '移除指针引用', exact: true })
    await expect(pointerRemove).toHaveCSS('width', '16px')
    await expect(pointerRemove).toHaveCSS('height', '16px')
    await expect(pointerRemove).toHaveCSS('border-radius', '50%')
    await expect(pointerRemove).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(pointerRemove).toHaveCSS('color', 'rgb(103, 170, 255)')
    expect(await pointerRemove.evaluate(button => getComputedStyle(button, '::before').content)).toBe('none')
    await pointerRemove.hover()
    await expect(pointerRemove).not.toHaveAttribute('data-prts-corner-target')
    await expect(pointerRemove).not.toHaveAttribute('data-prts-conversation-control')
    await expect(page.locator('[data-prts-body-target-frame]')).toHaveCSS('opacity', '0')
    const editor = page.locator('[data-fixture-quote-editor]')
    await editor.focus()
    const bounds = await pointerRemove.boundingBox()
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    await page.mouse.down()
    await expect(editor).toBeFocused()
    await page.mouse.up()
    await expect(pointerRemove).toHaveCount(0)
    await expect(page.locator('[data-composer-card]')).toHaveAttribute('data-fixture-quote-removals', '1')
    const keyboardRemove = page.getByRole('button', { name: '移除键盘引用', exact: true })
    await keyboardRemove.focus()
    await expect(keyboardRemove).not.toHaveAttribute('data-prts-corner-target')
    await page.keyboard.press('Enter')
    await expect(keyboardRemove).toHaveCount(0)
    await expect(page.locator('[data-composer-card]')).toHaveAttribute('data-fixture-quote-removals', '2')
  })
}

for (const scheme of ['dark', 'light']) {
  test(`dynamic native submenus use one outer blur and preserve custom materials (${scheme})`, async ({ page }) => {
    await openFixture(page, 'rc7', scheme)
    await page.addStyleTag({ content: `
      .fixtureContextMenu { position:fixed;left:420px;top:200px;width:180px;isolation:isolate;z-index:100;--dsw-menu-backdrop-filter:blur(40px) saturate(150%); }
      .fixtureContextMenu button { display:block;width:100%; }
      .fixtureSubmenu { position:absolute;left:100%;top:0;width:180px;isolation:isolate; }
      .fixture_material_layer { position:absolute;inset:0;z-index:-1;backdrop-filter:var(--dsw-menu-backdrop-filter);background:rgba(48,49,54,.64); }
    ` })
    await page.evaluate(() => {
      const menu = document.createElement('div')
      menu.id = 'fixture-dynamic-menu'
      menu.className = 'fixtureContextMenu'
      menu.setAttribute('role', 'menu')
      menu.setAttribute('data-menu-material', 'translucent')
      menu.innerHTML = '<div class="fixture_material_layer" aria-hidden="true"></div><div data-fixture-submenu-owner><button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false">More</button></div>'
      const trigger = menu.querySelector('button')
      const open = () => {
        if (menu.querySelector('#fixture-dynamic-submenu')) return
        const submenu = document.createElement('div')
        submenu.id = 'fixture-dynamic-submenu'
        submenu.className = 'fixtureSubmenu'
        submenu.setAttribute('role', 'menu')
        submenu.setAttribute('data-menu-material', 'translucent')
        submenu.innerHTML = '<div class="fixture_material_layer" aria-hidden="true"></div><button type="button" role="menuitem">Subaction</button>'
        submenu.querySelector('button').addEventListener('click', () => { menu.dataset.fixtureSelected = 'subaction' })
        submenu.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            submenu.remove()
            trigger.setAttribute('aria-expanded', 'false')
            trigger.focus()
          }
        })
        menu.querySelector('[data-fixture-submenu-owner]').append(submenu)
        trigger.setAttribute('aria-expanded', 'true')
      }
      trigger.addEventListener('mouseenter', open)
      trigger.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          open()
          menu.querySelector('#fixture-dynamic-submenu button').focus()
        }
      })
      document.body.append(menu)
    })
    const menu = page.locator('#fixture-dynamic-menu')
    await expect(menu).toHaveAttribute('data-prts-floating-glass', 'menu')
    await expect(menu).toHaveCSS('backdrop-filter', 'blur(22px) saturate(1.55)')
    await expect(menu.locator(':scope > [aria-hidden]')).toHaveCSS('backdrop-filter', 'none')
    const trigger = menu.getByRole('menuitem', { name: 'More', exact: true })
    await trigger.hover()
    const submenu = page.locator('#fixture-dynamic-submenu')
    await expect(submenu).toHaveAttribute('data-prts-floating-nested', '')
    await expect(submenu).toHaveCSS('backdrop-filter', 'none')
    await expect(submenu.locator(':scope > [aria-hidden]')).toHaveCSS('backdrop-filter', 'none')
    await expect(submenu.getByRole('menuitem')).toHaveAttribute('data-prts-floating-item', '')
    await page.mouse.move(1100, 800)
    await trigger.focus()
    await page.keyboard.press('ArrowRight')
    await expect(submenu.getByRole('menuitem')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('data-fixture-selected', 'subaction')
    await page.keyboard.press('Escape')
    await expect(submenu).toHaveCount(0)
    await expect(trigger).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(submenu).toHaveAttribute('data-prts-floating-nested', '')
    await page.evaluate(() => {
      const menu = document.querySelector('#fixture-dynamic-menu')
      menu.insertAdjacentHTML('beforeend', '<button type="button" role="menuitem" data-danger="true" data-fixture-late-danger>Delete</button><div role="menu" data-plugin="custom-menu" data-fixture-custom style="border-radius:18px;box-shadow:0 4px 8px #000;backdrop-filter:blur(7px)"><button role="menuitem">Custom</button></div><div role="menu" data-fixture-content-list><button role="menuitem">Model content</button></div>')
    })
    await expect(menu.locator('[data-fixture-late-danger]')).toHaveAttribute('data-prts-floating-danger', '')
    const custom = menu.locator('[data-fixture-custom]')
    await expect(custom).toHaveAttribute('data-prts-floating-preserved', 'custom')
    await expect(custom).not.toHaveAttribute('data-prts-floating-glass')
    await expect(custom).toHaveCSS('backdrop-filter', 'blur(7px)')
    await expect(custom.getByRole('menuitem')).not.toHaveAttribute('data-prts-floating-item')
    const content = menu.locator('[data-fixture-content-list]')
    await expect(content).not.toHaveAttribute('data-prts-floating-glass')
    await expect(content.getByRole('menuitem')).toHaveAttribute('data-prts-floating-item', '')
  })
}

for (const scheme of ['dark', 'light']) for (const width of [148, 287]) for (const pinned of [false, true]) {
  test(`session quick actions stay hidden while the menu remains accessible (${scheme}, ${width}, pinned=${pinned})`, async ({ page }) => {
    await page.route('**/tests/fixtures/rc7-harness.html', async route => {
      const response = await route.fetch()
      const body = (await response.text()).replace(
        '<span><button type="button" aria-label="Session row actions">…</button></span>',
        '<button type="button" data-context-menu-trigger aria-label="Session row actions">…</button><span><div data-slot="sidebar.workspaces.session.row.action" style="display:contents"><button type="button" aria-label="Archive">A</button><button type="button" aria-label="Pin">P</button><button type="button" aria-label="Extension action">E</button></div></span>',
      )
      await route.fulfill({ response, body })
    })
    await openFixture(page, 'rc7', scheme)
    await page.locator('[data-prts-region="frame"]').evaluate((frame, width) => {
      frame.style.gridTemplateColumns = `${width}px minmax(0,1fr) 0px`
    }, width)
    const row = page.locator('[data-prts-session-row]')
    if (pinned) {
      await row.evaluate(row => row.querySelector('.sessionTime').insertAdjacentHTML('afterend', '<span class="fixture_pinIndicator" role="img" aria-label="Pinned">P</span>'))
      await expect(row.locator('[data-prts-session-pin]')).toBeVisible()
    }
    const quick = row.locator('[data-prts-session-quick-actions]')
    await expect(quick).toHaveCSS('display', 'none')
    await row.hover()
    const menu = row.getByRole('button', { name: 'Session row actions', exact: true })
    await expect(menu).toBeVisible()
    await expect(quick).toHaveCSS('display', 'none')
    for (const name of ['Archive', 'Pin', 'Extension action']) {
      await expect(row.getByRole('button', { name, exact: true, includeHidden: true })).toBeHidden()
    }
    await menu.focus()
    await expect(menu).toBeFocused()
    await expect(menu).toBeVisible()
    await expect(quick).toHaveCSS('display', 'none')
    expect(await row.evaluate(row => row.style.getPropertyValue('--prts-session-action-count'))).toBe('')
  })
}
