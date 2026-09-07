import { expect, test } from '@playwright/test'

const fixturePath = '/tests/fixtures/rc7-harness.html'
const enabled = {
  version: 2,
  enabled: true,
  texture: 'full',
  glass: 'standard',
  motion: 'reduced',
  particlePattern: 'orthogonal',
}

async function enable(page) {
  await page.goto(fixturePath)
  await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), enabled)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
}

async function openRail(page) {
  const root = page.locator('html')
  const expectedMode = await page.evaluate(() => window.innerWidth >= 1180 ? 'docked' : 'overlay')
  await expect(root).toHaveAttribute('data-prts-rail-mode', expectedMode)
  if (expectedMode !== 'overlay') return
  if (await root.getAttribute('data-prts-rail-open') !== null) return
  await page.locator('[data-prts-rail-launcher]').click()
  await expect(root).toHaveAttribute('data-prts-rail-open', '')
  await expect(page.locator('[data-prts-nav-rail]')).toBeVisible()
  await page.waitForTimeout(200)
}

test('@stabilization rail controls stay visible and one click changes the complete scheme', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  const beforeScheme = await page.locator('html').getAttribute('data-prts-scheme')

  const before = await page.evaluate(() => ({
    body: getComputedStyle(document.body).backgroundColor,
    operation: getComputedStyle(document.querySelector('[data-prts-region="operation"]')).backgroundColor,
    railButton: getComputedStyle(document.querySelector('[data-prts-scheme-toggle]')).color,
  }))
  expect(before.railButton).not.toBe('rgba(0, 0, 0, 0)')
  await expect(page.locator('[data-prts-scheme-toggle] small')).toHaveCSS('opacity', '0')
  await page.locator('[data-prts-scheme-toggle]').hover()
  await expect(page.locator('[data-prts-scheme-toggle] small')).toHaveCSS('opacity', '1')

  await page.locator('[data-prts-scheme-toggle]').click()
  await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', beforeScheme === 'dark' ? 'light' : 'dark')
  const after = await page.evaluate(() => ({
    body: getComputedStyle(document.body).backgroundColor,
    operation: getComputedStyle(document.querySelector('[data-prts-region="operation"]')).backgroundColor,
  }))
  expect(after.body).not.toBe(before.body)
  expect(after.operation).not.toBe(before.operation)
})

test('@stabilization Rhodes mark owns one shared theme settings panel and visual reset stays enabled', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await expect(page.locator('[data-prts-settings-action]')).toHaveCount(0)
  const brand = page.locator('[data-prts-rail-brand]')
  await brand.click()
  const panel = page.locator('[data-prts-theme-settings]')
  await expect(panel).toBeVisible()
  await expect(panel.locator('[data-prts-setting-row="particlePattern"]')).toHaveCount(0)
  await expect(panel).toContainText('粒子精度')
  await expect(panel.locator('[data-prts-settings-advanced]')).not.toHaveAttribute('open', '')
  await panel.locator('[data-prts-setting-key="preset"][data-prts-setting-value="quiet-reading"]').click()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')).preset)).toBe('quiet-reading')
  await panel.locator('[data-prts-reset-visual]').click()
  await panel.locator('[data-prts-reset-confirm-action]').click()
  const reset = await page.evaluate(() => JSON.parse(localStorage.getItem('dsh.ui.prts.v1')))
  expect(reset.enabled).toBe(true)
  expect(reset.preset).toBe('standard-tactical')
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(brand).toBeFocused()
})

test('@stabilization resize shield prunes only operation surfaces and clears after settle', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await page.locator('[data-prts-rail-brand]').click()
  const panel = page.locator('[data-prts-theme-settings]')
  await expect(panel).toBeVisible()

  const burst = await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'))
    const inspect = selector => {
      const node = document.querySelector(selector)
      return {
        shielded: node?.hasAttribute('data-prts-resize-shield'),
        contentVisibility: node ? getComputedStyle(node).contentVisibility : '',
      }
    }
    return {
      operation: inspect('[data-prts-region="operation"]'),
      panel: inspect('[data-prts-theme-settings]'),
      backdrop: inspect('[data-prts-settings-backdrop]'),
      rail: inspect('[data-prts-nav-rail]'),
      sessions: inspect('[data-prts-region="sessions"]'),
    }
  })
  for (const key of ['operation', 'panel', 'backdrop']) {
    expect(burst[key]).toEqual({ shielded: true, contentVisibility: 'hidden' })
  }
  expect(burst.rail.shielded).toBe(false)
  expect(burst.sessions.shielded).toBe(false)

  await expect.poll(
    () => page.locator('[data-prts-resize-shield]').count(),
    { timeout: 1000 },
  ).toBe(0)
  await expect(panel).toBeVisible()

  await page.evaluate(() => {
    window.dispatchEvent(new Event('resize'))
    document.querySelector('[data-prts-theme-disable]').click()
  })
  await expect(page.locator('html')).not.toHaveAttribute('data-dsh-prts', '')
  await expect(page.locator('[data-prts-resize-shield]')).toHaveCount(0)
})


for (const scheme of ['dark', 'light']) {
  for (const dpr of [1, 2]) {
    test(`@composer-outline keeps a continuous contour at DPR ${dpr} in ${scheme} mode`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: dpr,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      await page.goto(fixturePath)
      await page.evaluate(value => localStorage.setItem('dsh.ui.prts.v1', JSON.stringify(value)), { ...enabled, scheme })
      await page.reload()
      await expect(page.locator('html')).toHaveAttribute('data-dsh-prts', '')
      if (await page.locator('html').getAttribute('data-prts-scheme') !== scheme) {
        await page.locator('[data-prts-scheme-toggle]').click()
        await expect(page.locator('html')).toHaveAttribute('data-prts-scheme', scheme)
      }

      const composer = page.locator('[data-composer-card]')
      const textarea = composer.locator('textarea')
      await expect(composer).toHaveScreenshot(`composer-outline-${scheme}-dpr${dpr}-idle.png`)
      await textarea.focus()
      await expect(textarea).toHaveCSS('outline-style', 'none')
      await expect(composer).toHaveScreenshot(`composer-outline-${scheme}-dpr${dpr}-focused.png`)
      await context.close()
    })
  }
}

test("@composer-attachments keeps pasted previews painted above the display-contents slot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await page.addStyleTag({ content: `
    .JVDQca_root { min-width: 0; position: relative; }
    .JVDQca_rail { gap: 10px; display: flex; overflow: auto hidden; }
    .JVDQca_item { width: 64px; height: 64px; position: relative; }
    .JVDQca_thumbnail { width: 64px; height: 64px; padding: 0; overflow: hidden; border: .5px solid white; border-radius: 16px; background: #333; }
    .JVDQca_thumbnail img { width: 100%; height: 100%; object-fit: cover; display: block; }
  ` })
  await page.locator("[data-composer-card]").evaluate(card => {
    const slot = document.createElement("div")
    slot.dataset.slot = "conversation.input.attachments"
    slot.style.display = "contents"
    slot.innerHTML = `
      <div class="JVDQca_root">
        <div class="JVDQca_rail">
          <div class="JVDQca_item">
            <button type="button" class="JVDQca_thumbnail" aria-label="Open pasted image">
              <img alt="Pasted preview" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22%3E%3Crect width=%2264%22 height=%2264%22 fill=%22%23ff00ff%22/%3E%3Crect x=%2216%22 y=%2216%22 width=%2232%22 height=%2232%22 fill=%22%2300ff00%22/%3E%3C/svg%3E">
            </button>
          </div>
        </div>
      </div>
    `
    card.prepend(slot)
  })

  const preview = page.getByAltText("Pasted preview")
  await preview.evaluate(image => image.decode())
  const styles = await preview.evaluate(image => {
    const slot = image.closest("[data-slot=\"conversation.input.attachments\"]")
    const surface = slot.firstElementChild
    const button = image.closest("button")
    return {
      slotDisplay: getComputedStyle(slot).display,
      slotPosition: getComputedStyle(slot).position,
      slotZ: getComputedStyle(slot).zIndex,
      surfacePosition: getComputedStyle(surface).position,
      surfaceZ: getComputedStyle(surface).zIndex,
      buttonRadius: getComputedStyle(button).borderRadius,
      buttonClip: getComputedStyle(button).clipPath,
      buttonBefore: getComputedStyle(button, "::before").content,
    }
  })
  expect(styles).toEqual({
    slotDisplay: "contents",
    slotPosition: "static",
    slotZ: "auto",
    surfacePosition: "relative",
    surfaceZ: "2",
    buttonRadius: "16px",
    buttonClip: "none",
    buttonBefore: "none",
  })

  const screenshot = await preview.screenshot()
  const pixels = await page.evaluate(async source => {
    const image = new Image()
    image.src = `data:image/png;base64,${source}`
    await image.decode()
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext("2d")
    context.drawImage(image, 0, 0)
    return {
      corner: [...context.getImageData(8, 8, 1, 1).data],
      center: [...context.getImageData(32, 32, 1, 1).data],
    }
  }, screenshot.toString("base64"))
  expect(pixels.corner).toEqual([255, 0, 255, 255])
  expect(pixels.center).toEqual([0, 255, 0, 255])
})

test('@stabilization Desktop titlebar inset keeps the shell, overlays, and composer inside the host viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await page.addStyleTag({ content: `
    #root { padding-top: 56px; }
    [data-slot="conversation"] {
      display: grid;
      grid-template-rows: 48px minmax(0, 1fr);
    }
    [data-conversation-scroll] {
      min-height: 0;
      overflow: auto;
      display: flex;
      flex-direction: column;
    }
    [data-composer-seat] { margin-top: auto; }
  ` })
  await page.evaluate(() => window.dispatchEvent(new Event('resize')))
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--prts-host-top-inset'),
  )).toBe('56px')

  const geometry = await page.evaluate(() => {
    const box = selector => {
      const rect = document.querySelector(selector).getBoundingClientRect()
      return { top: rect.top, bottom: rect.bottom }
    }
    return {
      rail: box('[data-prts-nav-rail]'),
      frame: box('[data-prts-region="frame"]'),
      sessions: box('[data-prts-region="sessions"]'),
      operation: box('[data-prts-region="operation"]'),
      composer: box('[data-composer-card]'),
    }
  })
  for (const region of ['rail', 'frame', 'sessions', 'operation']) {
    expect(geometry[region].top).toBeGreaterThanOrEqual(55)
    expect(geometry[region].bottom).toBeLessThanOrEqual(901)
  }
  expect(geometry.composer.bottom).toBeGreaterThan(geometry.composer.top)
  expect(geometry.composer.bottom).toBeLessThanOrEqual(901)

  await page.locator('[data-prts-rail-brand]').click()
  await expect(page.locator('[data-prts-theme-settings]')).toBeVisible()
  const settings = await page.evaluate(() => {
    const panel = document.querySelector('[data-prts-theme-settings]')
    const rect = panel.getBoundingClientRect()
    return { tag: panel.tagName, open: panel.open, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left }
  })
  expect(settings.tag).toBe('DIALOG')
  expect(settings.open).toBe(true)
  expect(settings.top).toBeGreaterThanOrEqual(16)
  expect(settings.bottom).toBeLessThanOrEqual(884)
  await page.keyboard.press('Escape')

  await page.setViewportSize({ width: 800, height: 900 })
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--prts-host-top-inset'),
  )).toBe('56px')
  await openRail(page)
  await page.locator('[data-prts-theme-disable]').click()
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--prts-host-top-inset'),
  )).toBe('')
})

test("@refinement active composer preserves native geometry under the P.R.T.S. shell", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)

  const surface = page.locator("[data-conversation-scroll]")
  await expect(surface).not.toHaveAttribute("data-prts-hero-active")
  const geometry = await page.evaluate(() => {
    const scroller = document.querySelector("[data-conversation-scroll]")
    const seat = document.querySelector("[data-composer-seat]")
    const slot = document.querySelector("[data-slot=\"conversation.composer\"]")
    const card = document.querySelector("[data-composer-card]")
    const textarea = card.querySelector("textarea")
    const send = card.querySelector("button[aria-label*=\"Send\" i]")
    const scrollerStyle = getComputedStyle(scroller)
    const cardStyle = getComputedStyle(card)
    const cardBox = card.getBoundingClientRect()
    const slotBox = slot.getBoundingClientRect()
    return {
      scrollerPadding: [scrollerStyle.paddingTop, scrollerStyle.paddingRight, scrollerStyle.paddingBottom, scrollerStyle.paddingLeft],
      scrollPaddingBottom: scrollerStyle.scrollPaddingBottom,
      seatPosition: getComputedStyle(seat).position,
      slotPosition: getComputedStyle(slot).position,
      cardPadding: [cardStyle.paddingTop, cardStyle.paddingRight, cardStyle.paddingBottom, cardStyle.paddingLeft],
      cardWidth: cardBox.width,
      slotWidth: slotBox.width,
      textareaMinHeight: getComputedStyle(textarea).minHeight,
      sendWidth: send.getBoundingClientRect().width,
      sendMinWidth: getComputedStyle(send).minWidth,
      outerClip: cardStyle.clipPath,
      innerClip: getComputedStyle(card, "::before").clipPath,
    }
  })
  expect(geometry.scrollerPadding).toEqual(["0px", "0px", "0px", "0px"])
  expect(geometry.scrollPaddingBottom).toBe("auto")
  expect(geometry.seatPosition).toBe("static")
  expect(geometry.slotPosition).toBe("static")
  expect(geometry.cardPadding).toEqual(["0px", "0px", "0px", "0px"])
  expect(Math.abs(geometry.cardWidth - geometry.slotWidth)).toBeLessThanOrEqual(1)
  expect(geometry.textareaMinHeight).not.toBe("64px")
  expect(geometry.sendWidth).toBe(36)
  expect(geometry.sendMinWidth).not.toBe("40px")
  expect(geometry.outerClip).toBe("none")
  expect(geometry.innerClip).toContain("polygon")
})

test("@refinement native sidebar controls and facility geometry remain host-compatible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)

  const nativeSettings = page.locator("[data-slot=\"sidebar.settings\"] > button")
  await expect(nativeSettings).toBeVisible()
  await expect(nativeSettings).toBeEnabled()
  await expect(page.locator("[data-prts-workspace-icon]")).toHaveCSS("display", "none")
  const workspaceTitleWidthBefore = await page.locator("[data-prts-workspace-row] [data-prts-row-title]").evaluate(node => node.getBoundingClientRect().width)
  await page.locator("[data-prts-workspace-row]").hover()
  await expect(page.locator("[data-prts-workspace-actions] button").first()).toHaveAttribute("data-prts-facility-vector", "")
  const workspaceFace = page.locator("[data-prts-workspace-row] [data-prts-facility-face]")
  const workspaceTexture = workspaceFace.locator("[data-prts-facility-layer=\"texture\"]")
  const silhouetteScene = workspaceFace.locator("[data-prts-facility-silhouette]")
  const silhouetteFar = workspaceFace.locator("[data-prts-silhouette-layer=\"far\"]")
  const silhouetteNear = workspaceFace.locator("[data-prts-silhouette-layer=\"near\"]")
  await expect(workspaceFace).toHaveAttribute("data-prts-facility-texture", "silhouette")
  await expect(workspaceTexture).toHaveCSS("opacity", "0")
  await expect(silhouetteScene).toHaveCSS("opacity", "1")
  await expect(silhouetteNear).toHaveCSS("opacity", "0.52")
  await expect(silhouetteFar).toHaveCSS("opacity", "0.24")
  await expect(silhouetteNear).toHaveCSS("fill", "rgb(243, 246, 247)")
  await expect(silhouetteNear).toHaveCSS("animation-play-state", "paused")
  await workspaceFace.evaluate(node => node.setAttribute("data-prts-facility-texture", "grid"))
  await expect(silhouetteScene).toHaveCSS("opacity", "0")
  await expect(workspaceTexture).toHaveCSS("opacity", "0.12")
  await expect(workspaceTexture).toHaveCSS("fill", "rgb(92, 205, 219)")
  await expect.poll(() => workspaceTexture.evaluate(node => getComputedStyle(node).maskImage)).not.toBe("none")
  await workspaceFace.evaluate(node => node.setAttribute("data-prts-facility-texture", "none"))
  await page.locator("[data-prts-workspace-row], [data-prts-session-row]").evaluateAll(rows => rows.forEach(row => row.classList.add("menuOpen")))
  await expect(page.locator("[data-prts-row-projection]")).toHaveCount(0)
  await page.waitForTimeout(300)

  const geometry = await page.evaluate(() => {
    const workspace = document.querySelector("[data-prts-workspace-row]")
    const session = document.querySelector("[data-prts-session-row]")
    const workspaceButton = document.querySelector("[data-prts-workspace-actions] button")
    const sessionButton = document.querySelector("[data-prts-session-actions] button")
    const workspaceActions = document.querySelector("[data-prts-workspace-actions]")
    const sessionActions = document.querySelector("[data-prts-session-actions]")
    const face = workspace.querySelector("[data-prts-facility-face]")
    const sessionFace = session.querySelector("[data-prts-facility-face]")
    const sessionPickup = sessionFace.querySelector("[data-prts-session-pickup]")
    const faceSvg = face.querySelector("[data-prts-facility-svg]")
    const faceOutline = face.querySelector('[data-prts-facility-layer="outline"]')
    const workspaceSpine = workspace.querySelector("[data-prts-facility-spine]")
    const sessionSpine = session.querySelector("[data-prts-facility-spine]")
    const workspaceButtonSvg = workspaceButton.querySelector("[data-prts-facility-svg]")
    const time = document.querySelector("[data-prts-session-time]")
    const rootStyle = getComputedStyle(document.documentElement)
    const workspaceTitle = workspace.querySelector("[data-prts-row-title]")
    return {
      workspaceHeight: getComputedStyle(workspace).height,
      sessionHeight: getComputedStyle(session).height,
      workspaceButtonHeight: getComputedStyle(workspaceButton).height,
      sessionButtonHeight: getComputedStyle(sessionButton).height,
      workspaceButtonWidth: getComputedStyle(workspaceButton).width,
      sessionButtonWidth: getComputedStyle(sessionButton).width,
      workspaceActionsWidth: getComputedStyle(workspaceActions).width,
      sessionActionsWidth: getComputedStyle(sessionActions).width,
      faceRight: getComputedStyle(face).right,
      sessionFaceRight: getComputedStyle(sessionFace).right,
      spineWidth: getComputedStyle(workspaceSpine).width,
      spineHeight: getComputedStyle(workspaceSpine).height,
      spineBoxHeight: workspaceSpine.getBoundingClientRect().height,
      workspaceSpineReady: workspaceSpine.hasAttribute("data-prts-facility-vector"),
      sessionSpineReady: sessionSpine.hasAttribute("data-prts-facility-vector"),
      workspaceSpineViewBox: workspaceSpine.querySelector("[data-prts-facility-svg]").getAttribute("viewBox"),
      spineRest: rootStyle.getPropertyValue("--prts-spine-rest").trim(),
      spineTravel: rootStyle.getPropertyValue("--prts-spine-travel").trim(),
      faceClip: getComputedStyle(face).clipPath,
      faceInnerContent: getComputedStyle(face, "::after").content,
      faceViewBox: faceSvg.getAttribute("viewBox"),
      facePath: faceOutline.getAttribute("d"),
      faceStrokeWidth: faceOutline.getAttribute("stroke-width"),
      faceVectorEffect: faceOutline.getAttribute("vector-effect"),
      faceLineJoin: faceOutline.getAttribute("stroke-linejoin"),
      faceAriaHidden: faceSvg.getAttribute("aria-hidden"),
      workspaceSpineFill: getComputedStyle(workspaceSpine.querySelector('[data-prts-facility-layer="surface"]')).fill,
      sessionSpineFill: getComputedStyle(sessionSpine.querySelector('[data-prts-facility-layer="surface"]')).fill,
      workspaceButtonBorder: getComputedStyle(workspaceButton).borderStyle,
      workspaceButtonClip: getComputedStyle(workspaceButton).clipPath,
      workspaceButtonInnerContent: getComputedStyle(workspaceButton, "::before").content,
      workspaceButtonPath: workspaceButtonSvg.querySelector('[data-prts-facility-layer="outline"]').getAttribute("d"),
      timeMarginRight: getComputedStyle(time).marginRight,
      projectionCount: document.querySelectorAll('[data-prts-row-projection]').length,
      sessionFaceTexture: sessionFace.getAttribute("data-prts-facility-texture"),
      sessionPickupOpacity: getComputedStyle(sessionPickup).opacity,
      sessionPickupBarCount: sessionPickup.querySelectorAll("[data-prts-session-pickup-bar]").length,
      sessionPickupBaselineStart: sessionPickup.querySelector("[data-prts-session-pickup-baseline]").getAttribute("x1"),
      sessionPickupBaselineEnd: sessionPickup.querySelector("[data-prts-session-pickup-baseline]").getAttribute("x2"),
      workspaceFaceWidth: face.getBoundingClientRect().width,
      sessionFaceWidth: sessionFace.getBoundingClientRect().width,
      workspaceTitle: workspaceTitle.textContent.trim(),
      workspaceTitleWidth: workspaceTitle.getBoundingClientRect().width,
    }
  })
  expect(geometry.workspaceButtonHeight).toBe(geometry.workspaceHeight)
  expect(geometry.sessionButtonHeight).toBe(geometry.sessionHeight)
  expect(geometry.workspaceButtonWidth).toBe("28px")
  expect(geometry.sessionButtonWidth).toBe("28px")
  expect(geometry.workspaceActionsWidth).toBe("57px")
  expect(geometry.sessionActionsWidth).toBe("28px")
  expect(geometry.faceRight).toBe("29px")
  expect(geometry.sessionFaceRight).toBe("29px")
  expect(Math.abs(geometry.workspaceFaceWidth - geometry.sessionFaceWidth)).toBeLessThanOrEqual(1)
  expect(geometry.spineWidth).toBe("8px")
  expect(geometry.spineHeight).toBe("38px")
  expect(geometry.spineBoxHeight).toBe(38)
  expect(geometry.workspaceSpineReady).toBe(true)
  expect(geometry.sessionSpineReady).toBe(true)
  expect(geometry.workspaceSpineViewBox).toBe("0 0 8 38")
  expect(geometry.spineRest).toBe(".25")
  expect(geometry.spineTravel).toBe("6px")
  expect(geometry.faceClip).toBe("none")
  expect(geometry.faceInnerContent).toBe("none")
  expect(geometry.faceViewBox.startsWith("0 0 ")).toBe(true)
  expect(geometry.faceViewBox.endsWith(" 38")).toBe(true)
  expect(geometry.facePath.startsWith("M ")).toBe(true)
  expect(geometry.facePath).toContain(" Z")
  expect(geometry.faceStrokeWidth).toBe("1")
  expect(geometry.faceVectorEffect).toBe("non-scaling-stroke")
  expect(geometry.faceLineJoin).toBe("miter")
  expect(geometry.faceAriaHidden).toBe("true")
  expect(geometry.workspaceSpineFill).toBe("rgb(92, 205, 219)")
  expect(geometry.sessionSpineFill).toBe("rgb(240, 200, 0)")
  expect(geometry.workspaceButtonBorder).toBe("none")
  expect(geometry.workspaceButtonClip).toBe("none")
  expect(geometry.workspaceButtonInnerContent).toBe("none")
  expect(geometry.workspaceButtonPath).toContain(" Z")
  expect(geometry.timeMarginRight).toBe("39px")
  expect(geometry.projectionCount).toBe(0)
  expect(geometry.sessionFaceTexture).toBe("pickup")
  expect(geometry.sessionPickupOpacity).toBe("0")
  expect(geometry.sessionPickupBarCount).toBe(11)
  expect(geometry.sessionPickupBaselineStart).toBe("60%")
  expect(geometry.sessionPickupBaselineEnd).toBe("98%")
  expect(geometry.workspaceTitle).toBe("PRTS 工作区")
  expect(geometry.workspaceTitleWidth).toBeGreaterThan(40)
  expect(Math.abs(geometry.workspaceTitleWidth - workspaceTitleWidthBefore)).toBeLessThanOrEqual(1)

  await page.locator("html").evaluate(node => { node.dataset.prtsMotion = "full" })
  await page.locator("[data-prts-workspace-row]").hover()
  await expect(page.locator("[data-prts-workspace-row] > [data-prts-row-projection]")).toHaveCount(0)
  await expect(silhouetteFar).toHaveCSS("animation-duration", "22.4s")
  await expect(silhouetteNear).toHaveCSS("animation-name", "prts-silhouette-near-drift")
  await expect(silhouetteNear).toHaveCSS("animation-play-state", "running")
  await expect(page.locator("[data-prts-workspace-actions] button").first()).toHaveCSS("animation-name", "prts-facility-button-dock")

  const sessionRow = page.locator("[data-prts-session-row]")
  const sessionPickup = sessionRow.locator("[data-prts-session-pickup]")
  const sessionBar = sessionRow.locator("[data-prts-session-pickup-bar]").nth(5)
  await sessionRow.hover()
  await expect(sessionPickup).toHaveCSS("opacity", "0.58")
  await expect(sessionRow.locator("[data-prts-session-time]")).toHaveCSS("opacity", "0")
  await expect(sessionBar).toHaveCSS("animation-name", "prts-session-pickup-sample")
  await page.mouse.move(900, 500)
  await expect(sessionPickup).toHaveCSS("opacity", "0")
  await expect(sessionBar).toHaveCSS("animation-name", "none")

  const frame = page.locator("[data-prts-region=\"frame\"]")
  const faceViewBoxBefore = await page.locator("[data-prts-workspace-row] [data-prts-facility-face] > [data-prts-facility-svg]").getAttribute("viewBox")
  await frame.evaluate(node => { node.style.gridTemplateColumns = "344px minmax(0px, 1fr) 0px" })
  await expect.poll(() => frame.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(" ")[0])).toBe("344px")
  await expect.poll(() => frame.evaluate(node => node.style.getPropertyValue("--prts-native-sessions-column"))).toBe("")
  await expect.poll(() => page.locator("[data-prts-workspace-row] [data-prts-facility-face] > [data-prts-facility-svg]").getAttribute("viewBox")).not.toBe(faceViewBoxBefore)

  await frame.evaluate(node => { node.style.gridTemplateColumns = "148px minmax(0px, 1fr) 0px" })
  await expect(frame).not.toHaveAttribute("data-prts-native-sessions-compact", "")
  await expect(page.locator("[data-prts-session-pickup]")).toHaveCount(1)
})


test("@refinement theme preserves native responsive axes and AI action sizing", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await page.locator("[data-conversation-scroll]").evaluate(node => {
    const user = document.createElement("div")
    user.dataset.chatFlowKind = "user"
    user.innerHTML = `<div class="fixture_userStack"><div class="fixture_bubble">响应式用户消息</div></div>`
    const assistant = document.createElement("div")
    assistant.dataset.chatFlowKind = "assistant-step"
    assistant.innerHTML = `<div class="fixture_root"><div class="fixture_body">响应式助手回复</div></div><div class="fixture_aiActions"><button type="button" aria-label="Copy response"><span class="fixture_aiActionLabel">复制</span></button><button type="button" aria-label="More actions">…</button></div>`
    node.prepend(user, assistant)
  })

  const capture = async (width, sidebarTrack) => {
    await page.setViewportSize({ width, height: 900 })
    await page.locator("[data-slot=\"root\"] > div").evaluate((frame, track) => {
      frame.style.gridTemplateColumns = `${track}px minmax(0px, 1fr) 0px`
    }, sidebarTrack)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.waitForTimeout(350)
    return page.evaluate(() => {
      const assistant = document.querySelector("[data-chat-flow-kind=\"assistant-step\"]")
      const composer = document.querySelector("[data-composer-seat]")
      const userStack = document.querySelector(".fixture_userStack")
      const action = document.querySelector(".fixture_aiActions button")
      const label = document.querySelector(".fixture_aiActionLabel")
      const frame = document.querySelector("[data-slot=\"root\"] > div")
      const assistantStyle = getComputedStyle(assistant)
      const composerStyle = getComputedStyle(composer)
      const userStyle = getComputedStyle(userStack)
      const actionStyle = getComputedStyle(action)
      return {
        bodyMax: assistantStyle.maxWidth,
        composerMax: composerStyle.maxWidth,
        userMax: userStyle.maxWidth,
        bodyWidth: assistant.getBoundingClientRect().width,
        composerWidth: composer.getBoundingClientRect().width,
        actionWidth: action.getBoundingClientRect().width,
        actionHeight: action.getBoundingClientRect().height,
        actionPadding: actionStyle.padding,
        labelDisplay: getComputedStyle(label).display,
        frameTrack: getComputedStyle(frame).gridTemplateColumns.split(" ")[0],
      }
    })
  }

  const viewports = [[1440, 280], [1100, 148], [800, 56], [640, 0]]
  const themed = []
  for (const [width, track] of viewports) themed.push(await capture(width, track))
  await openRail(page)
  await page.locator("[data-prts-theme-disable]").click()
  await expect(page.locator("html")).not.toHaveAttribute("data-dsh-prts", "")
  const native = []
  for (const [width, track] of viewports) native.push(await capture(width, track))

  for (let index = 0; index < viewports.length; index += 1) {
    const [width, track] = viewports[index]
    expect(themed[index].bodyMax).toBe("748px")
    expect(themed[index].composerMax).toBe("780px")
    expect(themed[index].userMax).toBe("min(525px, 82%)")
    expect(themed[index].actionWidth).toBe(28)
    expect(themed[index].actionHeight).toBe(28)
    expect(themed[index].actionPadding).toBe("0px")
    expect(themed[index].frameTrack).toBe(`${track}px`)
    expect(themed[index].labelDisplay).toBe(width <= 720 ? "none" : "inline")
    expect(themed[index].bodyMax).toBe(native[index].bodyMax)
    expect(themed[index].composerMax).toBe(native[index].composerMax)
    expect(themed[index].userMax).toBe(native[index].userMax)
    expect(themed[index].actionWidth).toBe(native[index].actionWidth)
    expect(themed[index].actionHeight).toBe(native[index].actionHeight)
    expect(themed[index].labelDisplay).toBe(native[index].labelDisplay)
  }
  expect(themed[0].composerWidth - themed[0].bodyWidth).toBeCloseTo(32, 0)
})

test('@refinement fresh-session composer stays continuous through former layout breakpoints', async ({ page }) => {
  await page.setViewportSize({ width: 722, height: 900 })
  await enable(page)
  const surface = page.locator('[data-conversation-scroll]')
  await surface.evaluate(node => {
    const seat = node.querySelector('[data-composer-seat]')
    const hero = document.createElement('section')
    hero.dataset.phase = 'hero'
    hero.innerHTML = '<span data-slot="conversation.hero.brand.mark"><svg viewBox="0 0 34 25"></svg></span><h1>探索未至之境</h1>'
    node.replaceChildren(hero, seat)
  })
  await expect(surface).toHaveAttribute('data-prts-hero-active', '')

  const measure = async width => {
    await page.setViewportSize({ width, height: 900 })
    await page.waitForTimeout(40)
    return page.evaluate(() => {
      const hero = document.querySelector('[data-phase="hero"]').getBoundingClientRect()
      const composer = document.querySelector('[data-composer-seat]').getBoundingClientRect()
      const scroller = document.querySelector('[data-conversation-scroll]').getBoundingClientRect()
      return {
        heroBottom: hero.bottom,
        composerTop: composer.top,
        composerWidth: composer.width,
        surfaceWidth: scroller.width,
      }
    })
  }

  const points = new Map()
  for (const width of [722, 721, 720, 719, 642, 641, 640, 639]) {
    points.set(width, await measure(width))
  }
  for (const [width, point] of points) {
    expect(point.heroBottom, `hero/composer overlap at ${width}px`).toBeLessThan(point.composerTop)
    expect(point.composerWidth, `composer overflow at ${width}px`).toBeLessThanOrEqual(point.surfaceWidth + 1)
  }
  for (const [left, right] of [[722, 721], [721, 720], [720, 719], [642, 641], [641, 640], [640, 639]]) {
    const before = points.get(left)
    const after = points.get(right)
    expect(Math.abs(before.composerTop - after.composerTop), `vertical jump across ${left}/${right}px`).toBeLessThan(8)
    expect(Math.abs(before.composerWidth - after.composerWidth), `width jump across ${left}/${right}px`).toBeLessThan(8)
  }
})
test('@stabilization theme settings enter the top layer above foreign workspaces', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await enable(page)
  await page.evaluate(() => {
    const foreign = document.createElement('section')
    foreign.dataset.foreignWorkspace = 'ssh'
    foreign.setAttribute('aria-label', 'Foreign SSH workspace')
    Object.assign(foreign.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      background: 'rgb(20, 24, 28)',
    })
    document.body.appendChild(foreign)
    document.querySelector('[data-prts-rail-brand]').click()
  })

  const panel = page.locator('[data-prts-theme-settings]')
  await expect(panel).toBeVisible()
  const layering = await page.evaluate(() => {
    const dialog = document.querySelector('[data-prts-theme-settings]')
    const hit = document.elementFromPoint(innerWidth / 2, innerHeight / 2)
    return {
      modal: dialog.matches(':modal'),
      dialogHit: hit === dialog || dialog.contains(hit),
      foreignConnected: document.querySelector('[data-foreign-workspace="ssh"]').isConnected,
    }
  })
  expect(layering).toEqual({ modal: true, dialogHit: true, foreignConnected: true })
  await page.keyboard.press('Escape')
})
