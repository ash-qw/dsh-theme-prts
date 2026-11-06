import { expect, test } from '@playwright/test'

for (const structure of ['wrapped', 'direct']) for (const scheme of ['dark', 'light']) for (const width of [287, 148]) for (const reducedMotion of ['reduce', 'no-preference']) {
  test(`sidebar hover actions remain aligned and usable (${structure}, ${scheme}, ${width}, ${reducedMotion})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.emulateMedia({ reducedMotion })
    await page.addInitScript(({ scheme, reducedMotion }) => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, scheme, motion: reducedMotion === 'reduce' ? 'reduced' : 'system', bootAnimation: false,
    })), { scheme, reducedMotion })
    await page.route('**/tests/fixtures/rc7-harness.html', async route => {
      const response = await route.fetch()
      let body = await response.text()
      if (structure === 'direct') {
        body = body
          .replace('<span><button type="button" aria-label="Workspace actions">…</button></span>', '<button type="button" data-context-menu-trigger="true" aria-haspopup="menu" aria-expanded="false" aria-label="Workspace actions">…</button>')
          .replace('<span><button type="button" aria-label="Session row actions">…</button></span>', '<button type="button" data-context-menu-trigger="" aria-label="Session row actions">…</button><span class="rowQuickActions"><div data-slot="sidebar.workspaces.session.row.action"><button type="button">Archive</button><button type="button">Pin</button></div></span>')
      }
      for (const label of ['Workspace actions', 'New workspace session', 'Session row actions']) {
        body = body.replace(`aria-label="${label}"`, `class="fixture_iconButton" aria-label="${label}"`)
      }
      body = body.replace('</head>', `<style>
        .rowActions .fixture_iconButton { margin:-4px; flex:0 0 auto; }
        .fixture_menuOpen .rowActions { display:inline-flex; }
      </style></head>`)
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

    for (const kind of ['workspace', 'session']) {
      const row = page.locator(`[data-prts-${kind}-row]`)
      const actions = row.locator(`[data-prts-${kind}-actions]`)
      const menu = row.locator(`[data-prts-${kind}-menu]`)
      await row.hover()
      await expect(menu).toBeVisible()
      await expect(menu).toHaveAttribute('data-prts-facility-vector', '')
      await expect(menu).toHaveCSS('margin-top', '0px')
      await menu.click({ trial: true })
      await expect.poll(() => actions.evaluate(node => node.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0)
      const geometry = await actions.evaluate(node => {
        const rect = node.getBoundingClientRect()
        return {
          top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right,
          buttons: Array.from(node.querySelectorAll('button')).filter(button => button.checkVisibility()).map(button => {
            const bounds = button.getBoundingClientRect()
            return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right }
          }),
        }
      })
      expect(geometry.buttons).toHaveLength(kind === 'workspace' ? 2 : 1)
      for (const button of geometry.buttons) {
        expect(Math.abs(button.top - geometry.top)).toBeLessThan(0.5)
        expect(Math.abs(button.bottom - geometry.bottom)).toBeLessThan(0.5)
        expect(button.left).toBeGreaterThanOrEqual(geometry.left - 0.5)
        expect(button.right).toBeLessThanOrEqual(geometry.right + 0.5)
      }
      if (kind === 'workspace') {
        expect(geometry.buttons[1].left - geometry.buttons[0].right).toBeCloseTo(1)
        await expect(row.locator('[data-prts-workspace-create]')).toHaveAttribute('aria-label', 'New workspace session')
      } else {
        const face = await row.locator('[data-prts-facility-face]').boundingBox()
        expect(face.x + face.width).toBeLessThanOrEqual(geometry.left + 1)
        if (structure === 'direct') await expect(row.locator('[data-prts-session-quick-actions]')).toHaveCSS('display', 'none')
      }
      await page.mouse.move(1000, 800)
      await row.evaluate(node => { node.tabIndex = 0 })
      await row.click({ position: { x: 20, y: 12 } })
      await page.mouse.move(1000, 800)
      await expect(row).toBeFocused()
      await expect(menu).toBeHidden()
      await row.hover()
      await menu.evaluate(button => {
        const row = button.closest('[role="treeitem"]')
        button.addEventListener('click', () => {
          row.classList.add('fixture_menuOpen')
        }, { once: true })
      })
      await menu.click()
      await page.mouse.move(1000, 800)
      await expect(row).toHaveAttribute('data-prts-row-menu-open', '')
      await expect(menu).toBeVisible()
      await menu.evaluate(button => {
        button.closest('[role="treeitem"]').classList.remove('fixture_menuOpen')
        button.focus()
      })
      await expect(row).not.toHaveAttribute('data-prts-row-menu-open')
      await expect(menu).toBeHidden()
      await row.evaluate(node => {
        const entry = document.createElement('button')
        entry.id = 'fixture-keyboard-entry'
        entry.style.position = 'fixed'
        node.before(entry)
        entry.focus()
      })
      await page.keyboard.press('Tab')
      await expect(row).toBeFocused()
      await expect(menu).toBeVisible()
      await page.keyboard.press('Tab')
      await expect(menu).toBeFocused()
      await expect(menu).toBeVisible()
      await menu.evaluate(button => button.addEventListener('click', () => {
        button.closest('[role="treeitem"]').classList.add('fixture_menuOpen')
      }, { once: true }))
      await menu.click()
      await menu.evaluate(button => button.blur())
      await page.mouse.move(1000, 800)
      await expect(row).toHaveAttribute('data-prts-row-menu-open', '')
      await expect(menu).toBeVisible()
      await row.evaluate(node => node.classList.remove('fixture_menuOpen'))
      await expect(row).not.toHaveAttribute('data-prts-row-menu-open')
      await page.locator('#fixture-keyboard-entry').evaluate(node => node.remove())
    }
    expect(errors).toEqual([])
  })
}
