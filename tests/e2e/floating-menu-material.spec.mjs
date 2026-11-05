import { expect, test } from '@playwright/test'

for (const fixture of ['rc2', 'rc7']) for (const scheme of ['dark', 'light']) for (const material of ['layered', 'plain']) {
  test(`floating menu keeps one material (${fixture}, ${scheme}, ${material})`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, bootAnimation: false, scheme, motion: 'full',
    })), scheme)
    await page.goto(`/tests/fixtures/${fixture}-harness.html`)
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').click()
    const current = page.locator('[data-prts-session-row][aria-selected="true"]').first()
    await expect(current).toBeVisible()
    await page.evaluate(material => {
      const style = document.createElement('style')
      style.textContent = `
        .fixture-host-menu { position:fixed; left:400px; top:200px; width:220px; z-index:999; isolation:isolate; }
        .fixture-host-menu > [aria-hidden="true"] { position:absolute; inset:0; pointer-events:none; background:rgba(48,49,54,.64); backdrop-filter:blur(40px) saturate(1.5); }
        .fixture-host-menu > [role="presentation"] { position:relative; }
        .fixture-host-menu [role="menuitem"] { display:block; width:100%; }
      `
      document.head.append(style)
      const current = document.querySelector('[data-prts-session-row][aria-selected="true"]')
      const other = document.createElement('div')
      other.setAttribute('role', 'treeitem')
      other.setAttribute('aria-selected', 'false')
      other.setAttribute('data-session-id', 'fixture-other-session')
      other.className = 'sessionRow'
      other.innerHTML = '<span aria-hidden="true">○</span><span class="title">Other session</span><span class="sessionTime">now</span><span class="rowActions"><span><button type="button" aria-label="Other session actions">…</button></span></span>'
      current.after(other)
      const trigger = current.querySelector('[data-prts-session-menu]')
      trigger.setAttribute('aria-haspopup', 'menu')
      trigger.setAttribute('aria-expanded', 'false')
      trigger.addEventListener('click', () => {
        const menu = document.createElement('div')
        menu.id = 'fixture-session-menu'
        menu.setAttribute('role', 'menu')
        menu.className = 'fixture-host-menu'
        menu.innerHTML = (material === 'layered' ? '<div aria-hidden="true" class="_material_fixture_21"></div>' : '')
          + '<div role="presentation"><button type="button" role="menuitem">Rename</button><button type="button" role="menuitem">Pin</button></div>'
        menu.addEventListener('click', event => {
          if (event.target.closest('[role="menuitem"]')) menu.dataset.chosen = event.target.textContent
        })
        menu.addEventListener('keydown', event => {
          const items = [...menu.querySelectorAll('[role="menuitem"]')]
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            items[(items.indexOf(document.activeElement) + 1) % items.length].focus()
          }
          if (event.key === 'Escape') {
            menu.remove()
            trigger.setAttribute('aria-expanded', 'false')
            current.classList.remove('menuOpen')
            trigger.focus()
          }
        })
        document.body.append(menu)
        trigger.setAttribute('aria-expanded', 'true')
        current.classList.add('menuOpen')
        menu.querySelector('button').focus()
      })
    }, material)
    const other = page.locator('[data-prts-session-row][data-session-id="fixture-other-session"]')
    await expect(other).toBeVisible()
    await current.hover()
    await current.locator('[data-prts-session-menu]').click()
    const menu = page.locator('#fixture-session-menu')
    await expect(menu).toHaveAttribute('data-prts-floating-glass', 'menu')
    await expect(current).toHaveAttribute('data-prts-row-menu-open', '')
    for (const [glass, expectedFilter] of [
      ['standard', 'blur(22px) saturate(1.55)'],
      ['soft', 'blur(18px) saturate(1.45)'],
      ['clear', 'blur(28px) saturate(1.8)'],
      ['off', 'none'],
    ]) {
      await page.locator('html').evaluate((node, glass) => node.dataset.prtsGlass = glass, glass)
      await expect(menu).toHaveCSS('backdrop-filter', expectedFilter)
      if (material === 'layered') {
        await expect(menu.locator('> [aria-hidden="true"]')).toHaveCSS('backdrop-filter', 'none')
        await expect(menu.locator('> [aria-hidden="true"]')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      }
    }
    await page.locator('html').evaluate(node => node.dataset.prtsGlass = 'standard')
    const spine = other.locator('> [data-prts-facility-spine]')
    const face = other.locator('> [data-prts-facility-face]')
    for (let index = 0; index < 3; index++) {
      await page.mouse.move(1000, 800)
      await expect(spine).toHaveCSS('transform', 'matrix(0.25, 0, 0, 1, 0, 0)')
      await other.hover()
      await expect(spine).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
      await expect(face).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 6, 0)')
      await expect(menu).toBeVisible()
      await expect(menu).not.toHaveAttribute('data-chosen')
      await expect(current).toHaveAttribute('aria-selected', 'true')
      await expect(other).toHaveAttribute('aria-selected', 'false')
    }
    await expect(menu.getByRole('menuitem', { name: 'Rename' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(menu.getByRole('menuitem', { name: 'Pin', exact: true })).toBeFocused()
    await menu.getByRole('menuitem', { name: 'Pin', exact: true }).click()
    await expect(menu).toHaveAttribute('data-chosen', 'Pin')
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
    await expect(current.locator('[data-prts-session-menu]')).toBeFocused()
    await expect(current).not.toHaveAttribute('data-prts-row-menu-open')
    expect(errors).toEqual([])
  })
}
