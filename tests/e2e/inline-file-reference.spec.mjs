import { expect, test } from '@playwright/test'

for (const mode of ['native', 'deck-chat']) for (const scheme of ['light', 'dark']) for (const width of [1440, 390]) {
  test(`inline file references own one surface (${mode}, ${scheme}, ${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    await page.addInitScript(({ mode, scheme }) => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, conversationStyle: mode, scheme, bootAnimation: false, motion: 'reduced',
    })), { mode, scheme })
    await page.goto('/tests/fixtures/rc2-harness.html')
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
      const launcher = page.locator('[data-prts-rail-launcher]')
      if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
      await page.locator('[data-prts-scheme-toggle]').click()
    }
    await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
    await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style', mode)
    await page.addStyleTag({ content: `
      @media (max-width: 600px) {
        .frame { grid-template-columns: 0 minmax(0, 1fr) 0; }
        .sidebar-col { visibility: hidden; }
        .center-col { grid-column: 2; min-width: 0; }
      }
      .inlineFileMarkdown :not(pre) > code {
        display: inline-flex; align-items: center; box-sizing: border-box;
        font: 0.875em/1.5 monospace; background-color: rgb(80, 80, 80);
        border: 0.5px solid rgb(100, 100, 100); border-radius: 6px; padding: 0 5px;
      }
      ._fileMention_fixture_92 { margin: 0; padding: 0; border: none; background: none; font: inherit; color: inherit; cursor: pointer; }
      #inline-file-fixture { width: min(100%, 780px); min-width: 0; box-sizing: border-box; padding: 12px; font-size: 14px; }
      #inline-file-fixture ul { padding-left: 18px; }
      #inline-file-fixture li { margin: 6px 0; }
    ` })
    await page.evaluate(() => {
      const fixture = document.createElement('section')
      fixture.id = 'inline-file-fixture'
      fixture.innerHTML = ['assistant-step', 'user'].map(role => `
        <div data-chat-flow-kind="${role}"><div ${role === 'user' ? 'data-message-bubble' : ''}>
          <div class="inlineFileMarkdown" data-markdown>
            <p>演示目录 <code data-plain-code>/data/test_workspace/prts-card-demo/</code></p>
            <ul>${['demo-card-geometry.png', 'card-demo.md', 'make_png.py', 'long-name-'.repeat(30) + '.md'].map(name => `
              <li><code data-file-code><button type="button" class="_fileMention_fixture_92" title="/data/test_workspace/${name}" aria-label="预览 ${name}"><svg width="14" height="14" aria-hidden="true"><path d="M2 2h10v10H2z"/></svg>${name}</button></code> — 文件说明</li>
            `).join('')}</ul>
            <p><code data-url-code><a href="https://example.com/">https://example.com/</a></code></p>
            <pre><code data-block-code>const example = true</code></pre>
          </div>
        </div></div>
      `).join('')
      for (const button of fixture.querySelectorAll('button')) button.onclick = () => { button.dataset.opened = 'true' }
      document.querySelector('[data-slot="main.conversation"]').append(fixture)
    })
    const buttons = page.locator('#inline-file-fixture button')
    await expect(buttons).toHaveCount(8)
    for (const button of await buttons.all()) await expect(button).toHaveAttribute('data-prts-conversation-control', 'file')
    const read = () => page.locator('#inline-file-fixture').evaluate(fixture => {
      const inspect = element => {
        const style = getComputedStyle(element)
        return { background: style.backgroundColor, border: style.borderWidth, padding: style.padding, radius: style.borderRadius, filter: style.backdropFilter }
      }
      return {
        controls: [...fixture.querySelectorAll('[data-file-code]')].map(wrapper => ({
          wrapper: inspect(wrapper), button: inspect(wrapper.firstElementChild),
          extraWidth: wrapper.getBoundingClientRect().width - wrapper.firstElementChild.getBoundingClientRect().width,
          overflow: wrapper.getBoundingClientRect().right - wrapper.closest('li').getBoundingClientRect().right,
        })),
        otherCode: [...fixture.querySelectorAll('[data-plain-code], [data-url-code], [data-block-code]')].map(inspect),
      }
    })
    const baseline = await read()
    for (const index of [0, 1, 3, 4]) {
      expect(baseline.otherCode[index]).toMatchObject({ background: 'rgb(80, 80, 80)', padding: '0px 5px', radius: '6px' })
      expect(baseline.otherCode[index].border).not.toBe('0px')
    }
    for (const material of ['off', 'full', 'split']) {
      await page.evaluate(material => {
        const root = document.documentElement
        root.setAttribute('data-prts-background-mode', material)
        root.toggleAttribute('data-prts-background-full', material === 'full')
        root.toggleAttribute('data-prts-background-conversation', material === 'split')
      }, material)
      const state = await read()
      expect(state.otherCode).toEqual(baseline.otherCode)
      for (const control of state.controls) {
        expect(control.wrapper).toMatchObject({ background: 'rgba(0, 0, 0, 0)', border: '0px', padding: '0px', radius: '0px', filter: 'none' })
        expect(control.button.border).toBe('1px')
        expect(control.button.radius).toBe('10px')
        expect(Math.abs(control.extraWidth)).toBeLessThan(1)
        expect(control.overflow).toBeLessThan(1)
      }
    }
    const first = buttons.first()
    await first.hover()
    await expect(page.locator('[data-prts-body-target-frame]')).toHaveCSS('opacity', '1')
    await first.click()
    await expect(first).toHaveAttribute('data-opened', 'true')
    await first.evaluate(button => { delete button.dataset.opened; button.blur() })
    await page.keyboard.press('Tab')
    await first.focus()
    await page.keyboard.press('Enter')
    await expect(first).toHaveAttribute('data-opened', 'true')
    const disabledWrapper = await page.locator('[data-file-code]').first().evaluate(wrapper => {
      const root = document.documentElement
      root.removeAttribute('data-dsh-prts')
      const style = getComputedStyle(wrapper)
      const result = { background: style.backgroundColor, padding: style.padding, border: style.borderWidth }
      root.setAttribute('data-dsh-prts', '')
      return result
    })
    expect(disabledWrapper.background).toBe('rgb(80, 80, 80)')
    expect(disabledWrapper.padding).toBe('0px 5px')
    expect(disabledWrapper.border).not.toBe('0px')
  })
}
