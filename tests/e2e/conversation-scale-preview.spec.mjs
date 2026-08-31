import { expect, test } from '@playwright/test'

const fixturePath = '/tests/fixtures/rc7-harness.html'
const enabled = {
  version: 2,
  enabled: true,
  scheme: 'dark',
  texture: 'full',
  glass: 'standard',
  motion: 'reduced',
  density: 'tactical',
  panelOpen: true,
}

async function enable(page) {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.reload()
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-dsh-prts'))
}

async function populatePreviewTurns(page, count = 8) {
  await page.locator('[data-conversation-scroll]').evaluate((scroller, total) => {
    scroller.querySelector('[data-scale-preview-fixture]')?.remove()
    scroller.style.height = '880px'
    scroller.style.overflowY = 'auto'
    for (const node of scroller.querySelectorAll('[data-message-role], [data-chat-flow-kind]')) node.hidden = true
    const fixture = document.createElement('section')
    fixture.dataset.scalePreviewFixture = ''
    fixture.innerHTML = Array.from({ length: total }, (_, index) => `
      <div data-message-role="user" style="min-height:44px;padding-top:8px">
        <div class="fixture_bubble">预览问题 ${index + 1}<button>编辑</button></div>
      </div>
      <div data-chat-flow-kind="assistant-step"><div data-slot="reasoning"><div data-markdown>内部推理 ${index + 1}</div></div></div>
      <div data-chat-flow-kind="assistant-step" style="min-height:28px"><div data-markdown>第一段正式回答 ${index + 1}<button>复制</button></div></div>
      <div data-chat-flow-kind="assistant-step"><div data-markdown>第二段正式回答 ${index + 1}</div></div>
    `).join('')
    const composer = scroller.querySelector('[data-composer-seat]')
    composer.style.position = 'sticky'
    composer.style.bottom = '0'
    composer.style.zIndex = '20'
    composer.style.background = 'var(--prts-canvas)'
    scroller.insertBefore(fixture, composer)
  }, count)
  await expect(page.locator('[data-prts-conversation-scale]')).toHaveAttribute('data-prts-scale-count', String(count))
}

test('@conversation-scale-preview uses the configured adaptive offset and previews the first formal answer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await enable(page)
  await populatePreviewTurns(page)
  const scale = page.locator('[data-prts-conversation-scale]')
  const preview = page.locator('[data-prts-conversation-preview]')
  const geometry = await page.evaluate(() => {
    const operation = document.querySelector('[data-prts-region="operation"]').getBoundingClientRect()
    const scale = document.querySelector('[data-prts-conversation-scale]').getBoundingClientRect()
    return {
      operationLeft: operation.left,
      scale: { x: scale.x, y: scale.y, width: scale.width, height: scale.height },
    }
  })
  expect(geometry.scale.x - geometry.operationLeft).toBeCloseTo(96, 1)
  await expect(scale.locator('[data-prts-conversation-scale-marks]')).not.toHaveAttribute('mask', /.+/)

  const index = 3
  const localY = .5 + (geometry.scale.height - 1 - 7 * 8) / 2 + index * 8
  await page.mouse.move(geometry.scale.x + 10, geometry.scale.y + localY)
  expect(await preview.evaluate(node => node.hasAttribute('data-prts-conversation-preview-visible'))).toBe(false)
  await page.waitForTimeout(120)
  await expect(preview).toHaveAttribute('data-prts-conversation-preview-visible', '')
  await expect(preview.locator('[data-prts-conversation-preview-question]')).toHaveText('预览问题 4')
  await expect(preview.locator('[data-prts-conversation-preview-answer]')).toHaveText('第一段正式回答 4')
  await expect(preview.locator('[data-prts-conversation-preview-answer]')).not.toContainText('内部推理')
  await expect(preview.locator('[data-prts-conversation-preview-answer]')).not.toContainText('复制')

  const previewBox = await preview.boundingBox()
  expect(previewBox.x - (geometry.scale.x + geometry.scale.width)).toBeCloseTo(8, 1)
  expect(previewBox.width).toBeCloseTo(360, 1)
  expect(previewBox.height).toBeCloseTo(128, 1)
  const styles = await preview.evaluate(node => {
    const question = getComputedStyle(node.querySelector('[data-prts-conversation-preview-question]'))
    const answer = getComputedStyle(node.querySelector('[data-prts-conversation-preview-answer]'))
    const questionLabel = getComputedStyle(node.querySelector('[data-prts-conversation-preview-row="question"] b'))
    const answerLabel = getComputedStyle(node.querySelector('[data-prts-conversation-preview-row="answer"] b'))
    return {
      questionWhiteSpace: question.whiteSpace,
      answerClamp: answer.webkitLineClamp,
      questionFontSize: question.fontSize,
      answerFontSize: answer.fontSize,
      questionLabelFontSize: questionLabel.fontSize,
      answerLabelFontSize: answerLabel.fontSize,
    }
  })
  expect(styles).toEqual({
    questionWhiteSpace: 'nowrap',
    answerClamp: '3',
    questionFontSize: '15px',
    answerFontSize: '15px',
    questionLabelFontSize: '14px',
    answerLabelFontSize: '14px',
  })

  await page.mouse.move(geometry.scale.x + 10, geometry.scale.y + localY + 8)
  await expect(preview.locator('[data-prts-conversation-preview-question]')).toHaveText('预览问题 5')
  await expect(preview.locator('[data-prts-conversation-preview-answer]')).toHaveText('第一段正式回答 5')

  await page.mouse.move(geometry.scale.x + geometry.scale.width + 340, geometry.scale.y)
  await expect(preview).not.toHaveAttribute('data-prts-conversation-preview-visible', '')

  await scale.focus()
  await page.keyboard.press('End')
  await expect(preview).toHaveAttribute('data-prts-conversation-preview-visible', '')
  await expect(preview.locator('[data-prts-conversation-preview-question]')).toHaveText('预览问题 8')
})
