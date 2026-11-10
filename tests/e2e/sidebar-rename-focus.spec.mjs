import { expect, test } from '@playwright/test'

async function enable(page, scheme) {
  await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
    version: 12, enabled: true, bootAnimation: false, scheme, motion: 'reduced',
  })), scheme)
  await page.goto('/tests/fixtures/rc7-harness.html')
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
  if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
    await page.locator('[data-prts-scheme-toggle]').click()
  }
  await page.addStyleTag({ content: `
    html[data-input-modality="keyboard"] .sessionRow:focus-within .rowActions { display: inline-flex; }
    html[data-input-modality="keyboard"] .sessionRow:focus-within .fixture_rowResting { display: none; }
  ` })
  await page.evaluate(() => {
    const navigationKeys = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])
    function automaticFocus(element) {
      const clear = () => {
        element.removeAttribute('data-dsh-automatic-focus')
        element.removeEventListener('blur', clear)
        element.removeEventListener('keydown', navigate)
      }
      const navigate = event => {
        if (navigationKeys.has(event.key)) clear()
      }
      element.setAttribute('data-dsh-automatic-focus', '')
      element.addEventListener('blur', clear)
      element.addEventListener('keydown', navigate)
      element.focus({ preventScroll: true })
    }
    document.addEventListener('keydown', () => document.documentElement.setAttribute('data-input-modality', 'keyboard'))
    document.addEventListener('pointerdown', () => document.documentElement.setAttribute('data-input-modality', 'pointer'))
    const session = document.querySelector('[data-prts-session-row]')
    const time = session.querySelector('[data-prts-session-time]')
    const resting = document.createElement('span')
    resting.className = 'fixture_rowResting'
    time.before(resting)
    resting.append(time)
    for (const row of document.querySelectorAll('[data-prts-session-row], [data-prts-workspace-row]')) {
      row.tabIndex = 0
      if (row.hasAttribute('data-prts-workspace-row')) row.setAttribute('aria-expanded', 'false')
      row.addEventListener('dblclick', () => {
        const title = row.querySelector('[data-prts-row-title]')
        const dialog = document.createElement('section')
        dialog.setAttribute('role', 'dialog')
        dialog.setAttribute('aria-modal', 'true')
        dialog.style.cssText = 'position:fixed;inset:300px 400px auto;z-index:99999;background:#223;padding:24px'
        dialog.innerHTML = '<input aria-label="Session name"><button>Rename</button><button>Cancel</button>'
        const input = dialog.querySelector('input')
        input.value = title.textContent
        const close = save => {
          if (save) title.textContent = input.value
          automaticFocus(row)
          dialog.remove()
        }
        input.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === 'Escape') close(event.key === 'Enter')
        })
        const buttons = dialog.querySelectorAll('button')
        buttons[0].onclick = () => close(true)
        buttons[1].onclick = () => close(false)
        document.body.append(dialog)
        automaticFocus(input)
      })
    }
  })
  await expect(page.locator('[data-prts-session-resting]')).toHaveCount(1)
}

for (const scheme of ['dark', 'light']) {
  for (const kind of ['session', 'workspace']) {
    for (const exit of ['Enter', 'Escape', 'pointer']) {
      test(`automatic rename focus does not leave the ${kind} card expanded (${scheme}, ${exit})`, async ({ page }) => {
        await enable(page, scheme)
        const row = page.locator(`[data-prts-${kind}-row]`)
        const actions = row.locator(`[data-prts-${kind}-actions]`)
        const title = row.locator('[data-prts-row-title]')
        const originalTitle = await title.textContent()
        await title.dblclick()
        const dialog = page.getByRole('dialog')
        await dialog.getByRole('textbox').fill('Renamed session')
        if (exit === 'pointer') await dialog.getByRole('button', { name: 'Rename', exact: true }).click()
        else await page.keyboard.press(exit)
        await expect(dialog).toHaveCount(0)
        await page.mouse.move(1100, 850)
        await expect(row).toBeFocused()
        await expect(row).toHaveAttribute('data-dsh-automatic-focus', '')
        if (exit !== 'pointer') expect(await row.evaluate(node => node.matches(':focus-visible'))).toBe(true)
        await expect(row).toHaveCSS('--prts-row-shift', '0px')
        await expect(row).toHaveCSS('outline-style', 'none')
        await expect(actions).toBeHidden()
        await expect(title).toHaveText(exit === 'Escape' ? originalTitle : 'Renamed session')
        if (kind === 'session') {
          await expect(row).toHaveAttribute('aria-selected', 'true')
          await expect(row.locator('[data-prts-session-resting]')).toBeVisible()
        }
        await row.hover()
        await expect(actions).toBeVisible()
        await expect(row).toHaveCSS('--prts-row-shift', '6px')
        await page.mouse.move(1100, 850)
        await expect(actions).toBeHidden()
        await expect(row).toHaveCSS('--prts-row-shift', '0px')
        await page.keyboard.press('ArrowDown')
        await expect(row).not.toHaveAttribute('data-dsh-automatic-focus')
        await expect(actions).toBeVisible()
        await expect(row).toHaveCSS('--prts-row-shift', '6px')
        await page.keyboard.press('Tab')
        await expect(row.locator(`[data-prts-${kind}-menu]`)).toBeFocused()
        await expect(actions).toBeVisible()
      })
    }
  }

  test(`automatic return to a menu button preserves keyboard access (${scheme})`, async ({ page }) => {
    await enable(page, scheme)
    const row = page.locator('[data-prts-session-row]')
    const trigger = row.locator('[data-prts-session-menu]')
    await row.hover()
    await trigger.click()
    await page.keyboard.press('ArrowDown')
    await trigger.evaluate(node => node.setAttribute('data-dsh-automatic-focus', ''))
    await page.mouse.move(1100, 850)
    await expect(trigger).toBeFocused()
    await expect(trigger).toBeVisible()
    await expect(row).toHaveCSS('--prts-row-shift', '6px')
  })
}
