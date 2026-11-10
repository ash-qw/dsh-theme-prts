import { expect, test } from '@playwright/test'

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) for (const enhanced of [false, true]) {
  test(`model search preserves compact native input geometry (${scheme}, ${width}, ${enhanced})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    await page.addInitScript(({ scheme, enhanced }) => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, bootAnimation: false, scheme, motion: 'reduced', composerGlass: enhanced,
    })), { scheme, enhanced })
    await page.goto('/tests/fixtures/rc7-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
      const launcher = page.locator('[data-prts-rail-launcher]')
      if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
      await page.locator('[data-prts-scheme-toggle]').click()
    }
    await page.addStyleTag({ content: `
      #fixture-model-portal { position:fixed;top:200px;left:30px;width:230px;z-index:2147483100; }
      .fixture-model-search-row { position:relative; }
      ._wrap_model_1 { display:flex;align-items:center;min-width:0;height:auto;padding:5px 7px;border:0 solid transparent;border-radius:8px;background:transparent; }
      ._wrap_model_1.fixture-with-query { padding-right:34px; }
      ._input_model_25 { flex:1;min-width:0;width:100%;padding:0;border:none;outline:none;background:transparent;color:inherit;font:12px/normal Arial; }
      .fixture-model-clear { position:absolute;top:50%;right:4px;transform:translateY(-50%);width:24px;height:24px;padding:0;border:0;background:transparent; }
    ` })
    await page.evaluate(() => {
      const slot = document.createElement('span')
      slot.dataset.slot = 'conversation.input.model'
      slot.innerHTML = '<button id="fixture-model-trigger" aria-haspopup="menu" aria-controls="fixture-model-menu">Model</button>'
      document.querySelector('[data-composer-card]').append(slot)
      const trigger = slot.querySelector('button')
      trigger.onclick = () => {
        const portal = document.createElement('div')
        portal.id = 'fixture-model-portal'
        portal.setAttribute('role', 'presentation')
        portal.innerHTML = '<div id="fixture-model-menu" role="group" data-menu-material><div role="menu"><div class="fixture-model-search-row"><span class="_wrap_model_1"><input class="_input_model_25" type="text" role="searchbox" aria-label="Search models" aria-controls="fixture-model-list" placeholder="Search models…"></span></div><div id="fixture-model-list"></div></div></div>'
        const input = portal.querySelector('input')
        const wrapper = input.parentElement
        const searchRow = wrapper.parentElement
        const list = portal.querySelector('#fixture-model-list')
        const models = ['DeepSeek Flash', 'DeepSeek Pro', 'GPT Model', 'MiniMax Model', 'Other Model']
        let activeIndex = -1
        const update = () => {
          activeIndex = -1
          input.removeAttribute('aria-activedescendant')
          wrapper.classList.toggle('fixture-with-query', input.value !== '')
          searchRow.querySelector('button')?.remove()
          if (input.value !== '') {
            const clear = document.createElement('button')
            clear.className = 'fixture-model-clear'
            clear.setAttribute('aria-label', 'Clear search')
            clear.textContent = '×'
            clear.onclick = () => { input.value = ''; update(); input.focus() }
            searchRow.append(clear)
          }
          list.replaceChildren(...models.filter(model => model.toLowerCase().includes(input.value.toLowerCase())).map((model, index) => {
            const option = document.createElement('button')
            option.setAttribute('role', 'menuitem')
            option.id = 'fixture-model-' + index
            option.textContent = model
            return option
          }))
        }
        input.addEventListener('input', update)
        input.addEventListener('keydown', event => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            activeIndex = (activeIndex + 1) % list.children.length
            input.setAttribute('aria-activedescendant', list.children[activeIndex].id)
          }
          if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault()
            document.body.dataset.fixtureSelectedModel = list.children[activeIndex].textContent
            portal.remove()
            trigger.focus()
          }
        })
        update()
        document.body.append(portal)
        input.focus()
      }
    })
    await page.locator('#fixture-model-trigger').click()
    const input = page.getByRole('searchbox', { name: 'Search models', exact: true })
    await expect(page.locator('#fixture-model-portal [role="menu"]')).toHaveAttribute('data-prts-floating-glass', 'menu')
    await expect(input).not.toHaveAttribute('data-prts-floating-input')
    const compareGeometry = async () => {
      const geometry = await input.evaluate(node => {
        const root = document.documentElement
        const inspect = () => {
          const style = getComputedStyle(node)
          const row = node.parentElement.parentElement.getBoundingClientRect()
          return { height: node.getBoundingClientRect().height, rowHeight: row.height, minHeight: style.minHeight,
            padding: style.padding, border: style.borderWidth, background: style.backgroundColor, shadow: style.boxShadow }
        }
        const themed = inspect()
        root.removeAttribute('data-dsh-prts')
        const native = inspect()
        root.setAttribute('data-dsh-prts', '')
        return { themed, native }
      })
      expect(geometry.themed).toEqual(geometry.native)
      expect(geometry.themed.rowHeight).toBeLessThan(32)
    }
    await expect(input).toBeFocused()
    await compareGeometry()
    await input.fill('DeepSeek')
    await expect(page.locator('#fixture-model-list [role="menuitem"]')).toHaveCount(2)
    await compareGeometry()
    const clear = page.getByRole('button', { name: 'Clear search', exact: true })
    const inputBounds = await input.boundingBox()
    const clearBounds = await clear.boundingBox()
    expect(inputBounds.x + inputBounds.width).toBeLessThanOrEqual(clearBounds.x)
    await clear.click()
    await expect(input).toHaveValue('')
    await expect(input).toBeFocused()
    await expect(page.locator('#fixture-model-list [role="menuitem"]')).toHaveCount(5)
    await compareGeometry()
    await input.fill('MiniMax')
    await page.keyboard.press('ArrowDown')
    await expect(input).toHaveAttribute('aria-activedescendant', 'fixture-model-0')
    await page.keyboard.press('Enter')
    await expect(page.locator('body')).toHaveAttribute('data-fixture-selected-model', 'MiniMax Model')
    await expect(page.locator('#fixture-model-portal')).toHaveCount(0)
    await page.locator('#fixture-model-trigger').click()
    await expect(input).not.toHaveAttribute('data-prts-floating-input')
    await compareGeometry()
  })
}
