import { expect, test } from '@playwright/test'

for (const fixture of ['rc2', 'rc7']) for (const scheme of ['dark', 'light']) for (const kind of ['workspace', 'session']) {
  test(`sidebar spine uses an accelerated transform (${fixture}, ${scheme}, ${kind})`, async ({ page, context }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.addInitScript(scheme => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify({
      version: 12, enabled: true, scheme, motion: 'system', bootAnimation: false,
    })), scheme)
    await page.goto(`/tests/fixtures/${fixture}-harness.html`)
    await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
    const row = page.locator(`[data-prts-${kind}-row]`).first()
    if (kind === 'workspace') await row.evaluate(node => node.setAttribute('aria-expanded', 'false'))
    const spine = row.locator('> [data-prts-facility-spine]')
    await expect(spine).toHaveAttribute('data-prts-facility-vector', '')
    await page.mouse.move(1100, 800)
    await expect(spine).toHaveCSS('transform', 'matrix(0.25, 0, 0, 1, 0, 0)')
    await expect(spine).toHaveCSS('transition-duration', '0.22s')
    await page.addStyleTag({ content: 'html[data-dsh-prts] [data-prts-facility-spine] { transition-duration: 1200ms; }' })
    const session = await context.newCDPSession(page)
    await session.send('DOM.enable')
    const { root } = await session.send('DOM.getDocument')
    const { nodeId } = await session.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: `[data-prts-${kind}-row] > [data-prts-facility-spine]`,
    })
    const { node } = await session.send('DOM.describeNode', { nodeId })
    let layers = []
    session.on('LayerTree.layerTreeDidChange', event => { if (event.layers) layers = event.layers })
    await session.send('LayerTree.enable')
    await row.hover()
    await expect.poll(async () => {
      for (const layer of layers.filter(layer => layer.backendNodeId === node.backendNodeId)) {
        const reasons = await session.send('LayerTree.compositingReasons', { layerId: layer.layerId }).catch(() => ({ compositingReasons: [] }))
        if (reasons.compositingReasons.includes('Has an active accelerated transform animation or transition.')) return true
      }
      return false
    }, { timeout: 1500, intervals: [20, 40, 80, 100] }).toBe(true)
    await expect(spine).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
    const isolation = await row.evaluate(node => {
      const face = node.querySelector('[data-prts-facility-face]')
      return {
        row: getComputedStyle(node).getPropertyValue('--prts-row-shift').trim(),
        face: getComputedStyle(face).getPropertyValue('--prts-row-shift').trim(),
        graphic: getComputedStyle(face.querySelector('svg')).getPropertyValue('--prts-row-shift').trim(),
      }
    })
    expect(isolation).toEqual({ row: '6px', face: '6px', graphic: '0px' })
    await page.mouse.move(1100, 800)
    await expect(spine).toHaveCSS('transform', 'matrix(0.25, 0, 0, 1, 0, 0)')
    if (kind === 'workspace') {
      await row.evaluate(node => node.setAttribute('aria-expanded', 'true'))
      await expect(spine).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
      await expect(spine).toHaveCSS('transition-duration', '0s')
    }
  })
}
