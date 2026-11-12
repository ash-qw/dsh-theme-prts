import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { themeSettingsMarkup } from '../src/client/theme-settings-workbench.js'
import { mountAvatarCrop } from '../src/client/avatar-crop.js'

test('theme modal viewports explicitly exclude native window dragging', t => {
  const dom = new JSDOM(themeSettingsMarkup())
  const document = dom.window.document
  const panel = document.querySelector('[data-prts-theme-settings]')
  const crop = mountAvatarCrop({ panel, window: dom.window, load: async () => ({}), onSave: async () => {} })
  t.after(() => { crop.dispose(); dom.window.close() })
  const dialogs = [...document.querySelectorAll('dialog')]
  assert.ok(dialogs.length >= 10)
  for (const dialog of dialogs) {
    assert.equal(dialog.hasAttribute('data-window-drag-exclude'), true, dialog.outerHTML.slice(0, 180))
    assert.equal(dialog.hasAttribute('data-window-drag'), false)
  }
  assert.equal(document.querySelector('[data-prts-settings-backdrop]').hasAttribute('data-window-drag-exclude'), true)
  assert.equal(document.body.hasAttribute('data-window-drag-exclude'), false)
})
