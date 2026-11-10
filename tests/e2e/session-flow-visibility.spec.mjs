import {expect, test} from '@playwright/test'

async function mount(page, scheme, motion, sessionFlow = true) {
  await page.emulateMedia({colorScheme:scheme, reducedMotion:'no-preference'})
  await page.addInitScript(value => {
    if (!localStorage.getItem('prtsFixtureNativeConfig')) localStorage.setItem('prtsFixtureNativeConfig', JSON.stringify({revision:1,value}))
  }, {enabled:true, bootAnimation:false, motion, sessionFlow, sessionGlow:true})
  await page.goto('/tests/fixtures/rc7-harness.html?native-forms')
  await expect(page.locator('html')).toHaveAttribute('data-prts-session-flow', sessionFlow ? 'on' : 'off')
  if (!await page.locator('[data-prts-rail-brand]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
  if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) await page.locator('[data-prts-scheme-toggle]').click()
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
  await page.mouse.move(900, 800)
}
async function toggle(page) {
  await page.locator('[data-prts-rail-brand]').click()
  await page.locator('#prts-tab-flow').click()
  await page.getByRole('switch', {name:'当前会话流线', exact:true}).click()
  await page.keyboard.press('Escape')
  await page.mouse.move(900, 800)
}
const paths = page => page.locator('[data-prts-session-lifeline-layer]').evaluateAll(nodes => nodes.map(node => node.getAttribute('d')))

for (const scheme of ['dark', 'light']) for (const motion of ['full', 'reduced']) {
  test('disabling flow hides selected and reselected cards without suppressing hover feedback (' + scheme + ', ' + motion + ')', async ({page}) => {
    await mount(page, scheme, motion)
    const row = page.locator('[data-prts-session-row]'), line = row.locator('[data-prts-session-lifeline]')
    await expect(line).toHaveCSS('opacity', '0.98')
    await toggle(page)
    await expect(page.locator('html')).toHaveAttribute('data-prts-session-flow', 'off')
    await expect(line).toHaveCSS('opacity', '0')
    for (const selection of ['native', 'optimistic', 'deselected']) {
      await row.evaluate((node, selection) => {
        node.setAttribute('aria-selected', String(selection !== 'optimistic'))
        if (selection === 'native') node.removeAttribute('data-prts-selection-target')
        else node.setAttribute('data-prts-selection-target', String(selection === 'optimistic'))
      }, selection)
      await row.click({position:{x:70, y:15}})
      await page.mouse.move(900, 800)
      await expect(line).toHaveCSS('opacity', '0')
    }
    await row.evaluate(node => { node.setAttribute('aria-selected', 'true'); node.removeAttribute('data-prts-selection-target') })
    await page.waitForTimeout(200)
    const paused = await paths(page)
    await page.waitForTimeout(200)
    expect(await paths(page)).toEqual(paused)
    await row.hover()
    await expect(line).toHaveCSS('opacity', '0')
    await expect(row.locator('[data-prts-session-pickup]')).toHaveCSS('opacity', '0.58')
    await page.mouse.move(900, 800)
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-prts-session-flow', 'off')
    await page.mouse.move(900, 800)
    await expect(line).toHaveCSS('opacity', '0')
    if (!await page.locator('[data-prts-rail-brand]').isVisible()) await page.locator('[data-prts-rail-launcher]').click()
    await toggle(page)
    await expect(line).toHaveCSS('opacity', '0.98')
    if (motion === 'full') {
      const before = await paths(page)
      await expect.poll(() => paths(page)).not.toEqual(before)
    }
  })
}
for (const scheme of ['dark', 'light']) test('saved off preference hides the initial current card (' + scheme + ')', async ({page}) => {
  await mount(page, scheme, 'full', false)
  await expect(page.locator('[data-prts-session-lifeline]')).toHaveCSS('opacity', '0')
  await page.mouse.move(900, 800)
  const initial = await paths(page)
  await page.waitForTimeout(250)
  expect(await paths(page)).toEqual(initial)
})
