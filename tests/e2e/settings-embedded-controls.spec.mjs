import { expect, test } from '@playwright/test'

for (const slot of ['settings.section', 'settings.plugins.tab']) {
  for (const scheme of ['dark', 'light']) for (const width of [1440, 600]) {
    test(`embedded settings inputs retain native layout (${slot}, ${scheme}, ${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
      await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
        version: 12, enabled: true, scheme, motion: 'reduced', bootAnimation: false,
      })), scheme)
      await page.goto('/tests/fixtures/rc7-harness.html')
      await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
      if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
        const launcher = page.locator('[data-prts-rail-launcher]')
        if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
        await page.locator('[data-prts-scheme-toggle]').click()
      }
      await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
      await page.addStyleTag({ content: `
        #embedded-settings-overlay { position: fixed; inset: 70px 20px 20px; z-index: 2147483100; }
        #embedded-settings-dialog { padding: 20px; border: 1px solid #444; }
        #embedded-settings-search { display: flex; align-items: center; gap: 8px; }
        #embedded-settings-search ._wrap_fixture_1 {
          display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 8px;
          border: .5px solid #444; border-radius: 8px; background: #202428; flex: 1; min-width: 0;
        }
        #embedded-settings-search ._wrap_fixture_1:focus-within { border-color: rgb(30, 160, 180); }
        #embedded-settings-search ._input_fixture_25 {
          flex: 1; min-width: 0; border: none; outline: none; background: transparent;
          font-size: 14px; line-height: 22px; color: #eee;
        }
        #embedded-settings-categories { margin-top: 8px; }
      ` })
      await page.evaluate(slot => {
        const overlay = document.createElement('div')
        overlay.id = 'embedded-settings-overlay'
        overlay.setAttribute('role', 'presentation')
        overlay.innerHTML = `<section id="embedded-settings-dialog" role="dialog" aria-modal="true" aria-label="设置">
          <div data-slot="${slot}"><div id="embedded-settings-page">
            <div id="embedded-settings-search"><span class="_wrap_fixture_1"><span aria-hidden="true">⌕</span><input class="_input_fixture_25" placeholder="搜索插件"></span><button type="button">筛选</button></div>
            <div id="embedded-settings-categories">全部 · UI 增强 · 主题与外观</div>
          </div></div></section>`
        overlay.querySelector('input').addEventListener('input', event => { overlay.dataset.query = event.target.value })
        overlay.querySelector('button').onclick = () => {
          const menu = document.createElement('div')
          menu.id = 'embedded-settings-filter'
          menu.setAttribute('role', 'menu')
          menu.innerHTML = '<input aria-label="筛选条件"><button role="menuitem">全部</button>'
          menu.addEventListener('keydown', event => { if (event.key === 'Escape') menu.remove() })
          overlay.querySelector('#embedded-settings-page').append(menu)
        }
        document.body.append(overlay)
      }, slot)
      const dialog = page.locator('#embedded-settings-dialog')
      const input = page.getByPlaceholder('搜索插件', { exact: true })
      await expect(dialog).toHaveAttribute('data-prts-floating-glass', 'dialog')
      await expect(input).not.toHaveAttribute('data-prts-floating-input')
      const compare = () => input.evaluate(node => {
        const inspect = () => {
          const style = getComputedStyle(node)
          const bounds = node.getBoundingClientRect()
          const wrapper = node.parentElement.getBoundingClientRect()
          const categories = document.querySelector('#embedded-settings-categories').getBoundingClientRect()
          return {
            height: bounds.height, width: bounds.width, minHeight: style.minHeight,
            border: style.borderWidth, background: style.backgroundColor, shadow: style.boxShadow,
            outline: style.outlineStyle,
            overflow: Math.max(wrapper.top - bounds.top, bounds.bottom - wrapper.bottom, 0),
            categoryGap: categories.top - wrapper.bottom,
          }
        }
        const themed = inspect()
        document.documentElement.removeAttribute('data-dsh-prts')
        const native = inspect()
        document.documentElement.setAttribute('data-dsh-prts', '')
        return { themed, native }
      })
      const idle = await compare()
      expect(idle.themed).toEqual(idle.native)
      expect(idle.themed).toMatchObject({ border: '0px', background: 'rgba(0, 0, 0, 0)', shadow: 'none', overflow: 0 })
      expect(idle.themed.categoryGap).toBeGreaterThanOrEqual(8)
      await input.focus()
      await expect(input).toBeFocused()
      const focused = await compare()
      expect(focused.themed).toEqual(focused.native)
      await expect(input.locator('..')).toHaveCSS('border-color', 'rgb(30, 160, 180)')
      await input.fill('主题')
      await expect(page.locator('#embedded-settings-overlay')).toHaveAttribute('data-query', '主题')
      await page.locator('#embedded-settings-search button').click()
      const filter = page.locator('#embedded-settings-filter')
      await expect(filter).toHaveAttribute('data-prts-floating-glass', 'menu')
      await expect(filter.getByRole('menuitem')).toHaveAttribute('data-prts-floating-item', '')
      const filterInput = filter.getByRole('textbox', { name: '筛选条件' })
      await expect(filterInput).toHaveAttribute('data-prts-floating-input', '')
      await expect(filterInput).toHaveCSS('min-height', '44px')
      await filterInput.focus()
      await page.keyboard.press('Escape')
      await expect(filter).toHaveCount(0)
      await expect(input).not.toHaveAttribute('data-prts-floating-input')
      await page.locator('#embedded-settings-dialog [data-slot]').evaluate(node => {
        const replacement = document.createElement('input')
        replacement.placeholder = '另一设置页面'
        node.replaceChildren(replacement)
      })
      await expect(page.getByPlaceholder('另一设置页面')).not.toHaveAttribute('data-prts-floating-input')
      await expect(dialog).toHaveAttribute('data-prts-floating-glass', 'dialog')
    })
  }
}
