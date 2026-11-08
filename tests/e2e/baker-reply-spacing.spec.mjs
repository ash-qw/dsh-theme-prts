import { expect, test } from '@playwright/test'

async function mountReplies(page) {
  await page.addStyleTag({ content: `
    @media (max-width: 600px) {
      .frame { grid-template-columns: 0 minmax(0, 1fr) 0; }
      .sidebar-col { visibility: hidden; }
      .center-col { grid-column: 2; min-width: 0; }
    }
    #reply-spacing-sample { width: min(100%, 780px); min-width: 0; margin: 0 auto; }
    .spacingColumn { display: flex; flex-direction: column; }
    .spacingFlow { display: contents; }
    .spacingRow { margin: 0; min-width: 0; }
    .spacingRow:not([hidden]) ~ .spacingRow:not([hidden]) { margin-top: var(--dsh-chat-flow-gap, 4px); }
    .spacingRow[data-chat-group-part="response"] { --dsh-chat-flow-gap: 12px; }
    .spacingRow[hidden] { height: 0; margin: 0; }
    .spacing_body { width: fit-content; max-width: 100%; box-sizing: border-box; }
    .spacing_body p { margin: 0; font-size: 14px; line-height: 24px; }
  ` })
  await page.evaluate(() => {
    const sample = document.createElement('section')
    sample.id = 'reply-spacing-sample'
    const reply = (index, text) => `<div id="spacing-reply-${index}" class="spacingRow" data-chat-flow-kind="assistant-step" data-chat-group-part="response" data-chat-turn="990"><div data-slot="conversation.chat.node"><div class="spacing_body"><div data-markdown><p>${text}</p></div></div></div></div>`
    sample.innerHTML = `<div class="spacingColumn"><div class="spacingFlow" data-slot="conversation.chat.flow">
      <div class="spacingRow" data-chat-flow-kind="user">本轮输入</div>
      ${reply(1, '第一条短回复')}
      <div id="spacing-tools" class="spacingRow" data-step-process data-chat-group-key="990-tools" data-chat-turn="990" hidden="until-found"><div>工具调用分组标题</div><div data-step-process-body><div data-step-process-content><div data-chat-flow-kind="tool-call">工具调用记录</div></div></div></div>
      ${reply(2, '第二条短回复')}
      ${reply(3, '多行回复<br>第二行内容<br>第三行内容')}
      <div id="spacing-flat-tools" class="spacingRow" data-chat-flow-kind="tool-call" data-chat-turn="990" data-turn-process-member="true" data-turn-process-hidden="true" hidden="until-found"><div>未分组工具调用记录</div></div>
      ${reply(4, '最终回复')}
      <div id="spacing-reasoning" class="spacingRow" data-chat-flow-kind="assistant-step" data-chat-group-part="reasoning"><div>思考记录</div></div>
    </div></div>`
    document.querySelector('[data-conversation-scroll]').prepend(sample)
  })
  await expect(page.locator('#spacing-reply-4 .spacing_body')).toHaveAttribute('data-prts-ai-surface', 'body')
}

async function openAppearance(page) {
  const launcher = page.locator('[data-prts-rail-launcher]')
  if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('[data-prts-settings-jump="appearance"]').click()
}

async function setGrouping(page, grouped) {
  await openAppearance(page)
  const toggle = page.getByRole('switch', { name: '合并过程回复头像', exact: true })
  if (await toggle.getAttribute('aria-checked') !== String(grouped)) await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', String(grouped))
  await page.locator('[data-prts-theme-settings-close]').click()
}

async function measureReplies(page) {
  return page.locator('#reply-spacing-sample').evaluate(sample => {
    const origin = sample.getBoundingClientRect().top
    const rows = [...sample.querySelectorAll('[id^="spacing-reply-"]')].map(row => {
      const box = row.getBoundingClientRect()
      const bubble = row.querySelector('.spacing_body').getBoundingClientRect()
      const avatar = getComputedStyle(row, '::before')
      return {
        top: box.top - origin, height: box.height, padding: getComputedStyle(row).paddingBottom,
        bubbleTop: bubble.top - origin, bubbleBottom: bubble.bottom - origin,
        avatarTop: box.top - origin + parseFloat(avatar.top), avatarHeight: parseFloat(avatar.height),
      }
    })
    return {
      rows,
      gaps: rows.slice(1).map((row, index) => ({
        bubble: row.bubbleTop - rows[index].bubbleBottom,
        avatar: row.avatarTop - rows[index].avatarTop - rows[index].avatarHeight,
      })),
    }
  })
}

for (const scheme of ['dark', 'light']) for (const width of [1440, 390]) {
  test(`Baker reserves reply and avatar spacing only without grouping (${scheme}, ${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' })
    await page.addInitScript(() => {
      if (!localStorage.getItem('prtsFixtureNativeConfig')) localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({ value: {
        enabled: true, bootAnimation: false, conversationStyle: 'deck-chat', bakerGroupAvatars: true, motion: 'reduced',
      } }))
    })
    await page.goto('/tests/fixtures/rc2-harness.html?native-forms')
    if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
      const launcher = page.locator('[data-prts-rail-launcher]')
      if (await launcher.isVisible() && await launcher.getAttribute('aria-expanded') === 'false') await launcher.click()
      await page.locator('[data-prts-scheme-toggle]').click()
    }
    await mountReplies(page)
    const grouped = await measureReplies(page)
    await setGrouping(page, false)
    await expect(page.locator('html')).toHaveAttribute('data-prts-baker-individual-avatars', '')
    const checkSpacing = async (groupHidden = true, flatHidden = true) => {
      const state = await measureReplies(page)
      for (const [index, row] of state.rows.entries()) {
        const separated = index === 0 && groupHidden || index === 2 && flatHidden
        expect(row.padding).toBe(separated ? '12px' : '0px')
        if (separated) expect(row.height).toBeGreaterThanOrEqual(72)
      }
      for (const index of [0, 2]) {
        if (index === 0 ? !groupHidden : !flatHidden) continue
        expect(state.gaps[index].bubble).toBeGreaterThanOrEqual(12)
        expect(state.gaps[index].avatar).toBeGreaterThanOrEqual(12)
      }
    }
    await checkSpacing()
    await expect(page.locator('#spacing-reasoning')).toHaveCSS('padding-bottom', '0px')
    await expect(page.locator('#spacing-reasoning')).toHaveCSS('min-height', 'auto')
    await page.locator('#spacing-tools').evaluate(element => element.removeAttribute('hidden'))
    await checkSpacing(false, true)
    await page.locator('#spacing-flat-tools').evaluate(element => {
      element.removeAttribute('hidden')
      element.removeAttribute('data-turn-process-hidden')
    })
    await checkSpacing(false, false)
    const expanded = await measureReplies(page)
    await setGrouping(page, true)
    expect(await measureReplies(page)).toEqual(expanded)
    await setGrouping(page, false)
    await page.locator('#spacing-tools').evaluate(element => element.setAttribute('hidden', 'until-found'))
    await page.locator('#spacing-flat-tools').evaluate(element => {
      element.setAttribute('hidden', 'until-found')
      element.setAttribute('data-turn-process-hidden', 'true')
    })
    await checkSpacing()
    await page.locator('#spacing-reply-2').evaluate(element => element.setAttribute('hidden', 'until-found'))
    await expect(page.locator('#spacing-reply-2')).toHaveCSS('min-height', '0px')
    await expect(page.locator('#spacing-reply-2')).toHaveCSS('padding-bottom', '0px')
    await page.locator('#spacing-reply-2').evaluate(element => element.removeAttribute('hidden'))
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-prts-baker-individual-avatars', '')
    await mountReplies(page)
    await checkSpacing()
    await setGrouping(page, true)
    await expect(page.locator('html')).not.toHaveAttribute('data-prts-baker-individual-avatars')
    expect(await measureReplies(page)).toEqual(grouped)
    await setGrouping(page, false)
    await openAppearance(page)
    await page.locator('[data-prts-setting-key="conversationStyle"][data-prts-setting-value="native"]').click()
    await expect(page.locator('html')).not.toHaveAttribute('data-prts-baker-individual-avatars')
    await expect(page.locator('#spacing-reply-1')).toHaveCSS('padding-bottom', '0px')
    await expect(page.locator('#spacing-reply-1')).toHaveCSS('min-height', 'auto')
  })
}
