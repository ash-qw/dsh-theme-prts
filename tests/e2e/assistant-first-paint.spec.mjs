import { expect, test } from '@playwright/test'

for (const scheme of ['dark', 'light']) {
  for (const width of [1280, 390]) {
    for (const wallpaper of [false, true]) {
      test(`assistant mounts fully themed before its first frame (${scheme}, ${width}, wallpaper=${wallpaper})`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 })
        await page.addInitScript(({ scheme }) => {
          localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
            version: 12,
            enabled: true,
            bootAnimation: false,
            conversationStyle: 'deck-chat',
            scheme,
          }))
        }, { scheme })
        await page.goto('/tests/fixtures/rc7-harness.html')
        await expect(page.locator('html')).toHaveAttribute('data-prts-conversation-style', 'deck-chat')
        await expect(page.locator('[data-prts-startup]')).toBeHidden()
        await page.addStyleTag({ content: '.firstpaint_body { background: rgb(255, 0, 255); border-radius: 0; padding: 0; }' })

        const frames = await page.evaluate(async ({ scheme, wallpaper }) => {
          const root = document.documentElement
          root.dataset.prtsScheme = scheme
          root.dataset.prtsBackgroundMode = wallpaper ? 'split' : 'none'
          root.toggleAttribute('data-prts-background-conversation', wallpaper)
          root.style.setProperty('--prts-background-conversation', 'linear-gradient(#25303a, #121a20)')
          const scroll = document.querySelector('[data-conversation-scroll]')
          const sample = document.createElement('section')
          sample.innerHTML = `
            <div data-chat-flow-kind="user"><div class="firstpaint_bubble"><div data-markdown>用户消息</div></div></div>
            <div data-chat-flow-kind="assistant-step" data-chat-group-part="response">
              <div data-slot="conversation.chat.node" style="display: contents">
                <div class="firstpaint_root"><div class="firstpaint_body"><div data-markdown>
                  <p>第一帧即显示主题正文。</p>
                  <div class="md-code-block"><div data-code-block-banner>text</div><div data-code-block-content><pre><code>example</code></pre></div></div>
                  <div class="md-table-wide"><table><tbody><tr><td>主题表格</td></tr></tbody></table></div>
                </div></div></div>
              </div>
            </div>
          `
          const surface = sample.querySelector('.firstpaint_body')
          const step = sample.querySelector('[data-chat-flow-kind="assistant-step"]')
          const read = () => {
            const style = getComputedStyle(surface)
            const tail = getComputedStyle(surface, '::before')
            const code = getComputedStyle(surface.querySelector('.md-code-block'))
            const table = getComputedStyle(surface.querySelector('.md-table-wide'))
            return {
              surface: surface.getAttribute('data-prts-ai-surface'),
              state: step.getAttribute('data-prts-ai-surface-state'),
              background: style.backgroundColor,
              radius: style.borderTopRightRadius,
              padding: style.padding,
              visibility: style.visibility,
              display: style.display,
              tail: tail.content,
              mask: tail.maskImage,
              blur: tail.backdropFilter,
              codeRadius: code.borderTopLeftRadius,
              codeOverflow: code.overflow,
              tableRadius: table.borderTopLeftRadius,
            }
          }
          const requestFrame = window.requestAnimationFrame.bind(window)
          const cancelFrame = window.cancelAnimationFrame.bind(window)
          const pendingFrames = new Map()
          let frameId = -1
          window.requestAnimationFrame = callback => {
            const handle = frameId--
            pendingFrames.set(handle, callback)
            return handle
          }
          window.cancelAnimationFrame = handle => {
            if (handle < 0) pendingFrames.delete(handle)
            else cancelFrame(handle)
          }
          try {
            const first = new Promise(resolve => requestFrame(() => resolve(read())))
            scroll.prepend(sample)
            scroll.scrollTop = 0
            const firstFrame = await first
            await new Promise(resolve => requestFrame(resolve))
            return { first: firstFrame, second: read() }
          } finally {
            window.requestAnimationFrame = requestFrame
            window.cancelAnimationFrame = cancelFrame
            for (const callback of pendingFrames.values()) requestFrame(callback)
          }
        }, { scheme, wallpaper })

        expect(frames.first.surface).toBe('body')
        expect(frames.first.state).toBe('body')
        expect(frames.first.background).not.toBe('rgb(255, 0, 255)')
        expect(frames.first.radius).toBe(width < 760 ? '16px' : '18px')
        expect(frames.first.padding).toBe(width < 760 ? '10px 16px' : '12px 22px')
        expect(frames.first.visibility).toBe('visible')
        expect(frames.first.display).not.toBe('none')
        expect(frames.first.tail).toBe('""')
        expect(frames.first.mask).toContain('data:image/svg+xml')
        expect(frames.first.blur).toBe(wallpaper ? 'blur(8px) saturate(1.08)' : 'none')
        expect(frames.first.codeRadius).toBe('12px')
        expect(frames.first.codeOverflow).toBe('clip')
        expect(frames.first.tableRadius).toBe('10px')
        expect(frames.second).toEqual(frames.first)
      })
    }
  }
}
