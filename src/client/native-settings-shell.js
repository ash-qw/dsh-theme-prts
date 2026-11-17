export function createNativeSettingsShellAdapter({ document }) {
  const shells = new Map()

  function setStyle(node, name, value) {
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value)
  }

  function restoreStyle(node, name, saved) {
    if (saved.value) node.style.setProperty(name, saved.value, saved.priority)
    else node.style.removeProperty(name)
    if (!saved.hadStyle && !node.getAttribute('style')) node.removeAttribute('style')
  }

  function saveStyle(node, name) {
    return { value: node.style.getPropertyValue(name), priority: node.style.getPropertyPriority(name), hadStyle: node.hasAttribute('style') }
  }

  function releasePage(button, item) {
    item.page.remove()
    restoreStyle(button, '--prts-settings-page-z', item.style)
  }

  function release(shell) {
    const entry = shells.get(shell)
    if (!entry) return
    for (const [button, item] of entry.pages) releasePage(button, item)
    restoreStyle(shell, '--prts-settings-front-z', entry.style)
    shell.removeAttribute('data-prts-settings-shell')
    shell.removeAttribute('data-prts-settings-turn')
    shells.delete(shell)
  }

  return {
    update(shell) {
      if (!shell.matches('[data-shortcut-modal="settings"][role="dialog"]')) { release(shell); return }
      const children = [...shell.children]
      const navigation = children.find(child => child.matches('nav'))
      const title = children.find(child => child.querySelector('[data-slot="settings.header"]'))
      const toolbar = children.find(child => child.querySelector('[data-slot="settings.close"]'))
      const content = children.find(child => child.querySelector('[data-slot="settings.section"]'))
      if (!navigation || !title || !toolbar || !content) { release(shell); return }
      let entry = shells.get(shell)
      if (entry && entry.toolbar !== toolbar) { release(shell); entry = null }
      if (!entry) {
        entry = { toolbar, pages: new Map(), style: saveStyle(shell, '--prts-settings-front-z'), selected: null, turn: '' }
        shells.set(shell, entry)
        shell.setAttribute('data-prts-settings-shell', '')
      }
      const categories = [...navigation.querySelectorAll(':scope > div > button')]
      const selected = categories.find(button => ['true', 'page'].includes(button.getAttribute('aria-current')))
      const ordered = selected ? [selected, ...categories.filter(button => button !== selected)] : categories
      for (const [button, item] of entry.pages) {
        if (categories.includes(button)) continue
        releasePage(button, item)
        entry.pages.delete(button)
      }
      setStyle(shell, '--prts-settings-front-z', String(categories.length * 2 + 2))
      for (const [depth, button] of ordered.entries()) {
        let item = entry.pages.get(button)
        if (!item) {
          const page = document.createElement('span')
          page.setAttribute('data-prts-settings-page', '')
          page.setAttribute('aria-hidden', 'true')
          item = { page, style: saveStyle(button, '--prts-settings-page-z') }
          entry.pages.set(button, item)
          shell.append(page)
        }
        const categoryIndex = categories.indexOf(button)
        const pageIndex = String(categoryIndex + 1)
        const colorIndex = String(categoryIndex % 6 + 1)
        if (item.page.getAttribute('data-prts-settings-color') !== colorIndex) item.page.setAttribute('data-prts-settings-color', colorIndex)
        if (item.page.getAttribute('data-prts-settings-page') !== pageIndex) item.page.setAttribute('data-prts-settings-page', pageIndex)
        if (item.page.getAttribute('data-prts-settings-depth') !== String(depth)) item.page.setAttribute('data-prts-settings-depth', String(depth))
        const offset = depth * Math.min(4, 24 / Math.max(1, categories.length - 1))
        setStyle(item.page, '--prts-settings-page-offset', offset + 'px')
        setStyle(item.page, '--prts-settings-page-z', String((categories.length - depth) * 2))
        setStyle(button, '--prts-settings-page-z', String((categories.length - depth) * 2 + (button === selected ? 3 : 1)))
      }
      if (selected) {
        if (entry.selected && entry.selected !== selected) {
          entry.turn = entry.turn === 'a' ? 'b' : 'a'
          shell.setAttribute('data-prts-settings-turn', entry.turn)
        }
        entry.selected = selected
      }
    },
    releaseTree(node) {
      for (const shell of shells.keys()) if (shell === node || node.contains(shell)) release(shell)
    },
    dispose() {
      for (const shell of shells.keys()) release(shell)
    },
  }
}
