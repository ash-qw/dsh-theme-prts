export function createNativeSettingsShellAdapter({ document, emblemImage }) {
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

  function createFrame() {
    const frame = document.createElement('span')
    frame.setAttribute('data-prts-settings-jacket', '')
    frame.setAttribute('aria-hidden', 'true')
    frame.innerHTML = '<span data-prts-settings-cap></span><span data-prts-settings-identity><span data-prts-settings-emblem></span><span data-prts-settings-wordmark>RHODES<br>ISLAND<small>PHARMACEUTICALS</small></span></span><span data-prts-settings-keyline></span><span data-prts-settings-spine></span><span data-prts-settings-spine-dot></span><span data-prts-settings-spine-pattern></span><span data-prts-settings-side><b>R.I.</b><span>RHODES ISLAND</span><i></i><small>P.R.T.S.</small></span><span data-prts-settings-footer><span data-prts-settings-markers></span><span data-prts-settings-pagination></span></span><span data-prts-settings-clip="top"></span><span data-prts-settings-clip="bottom"></span>'
    const holder = frame.querySelector('[data-prts-settings-emblem]')
    if (emblemImage) {
      const image = document.createElement('img')
      image.src = emblemImage
      image.alt = ''
      image.width = 95
      image.height = 81
      image.draggable = false
      holder.append(image)
    }
    return frame
  }

  function finishTurn(shell, entry) {
    document.defaultView.clearTimeout(entry.turnTimer)
    entry.turnTimer = null
    shell.removeAttribute('data-prts-settings-turn')
  }

  function releasePage(button, item) {
    item.page.remove()
    restoreStyle(button, '--prts-settings-page-z', item.style)
  }

  function release(shell) {
    const entry = shells.get(shell)
    if (!entry) return
    shell.removeEventListener('animationend', entry.onTurnEnd)
    for (const [button, item] of entry.pages) releasePage(button, item)
    finishTurn(shell, entry)
    entry.frame.remove()
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
      if (!entry) {
        const frame = createFrame()
        entry = { frame, markers: frame.querySelector('[data-prts-settings-markers]'), pagination: frame.querySelector('[data-prts-settings-pagination]'), pages: new Map(), style: saveStyle(shell, '--prts-settings-front-z'), selected: null, selectedLabel: '', turn: '', turnTimer: null }
        entry.onTurnEnd = event => {
          if (event.animationName === 'prts-settings-draw-' + entry.turn && event.target.parentElement === shell) finishTurn(shell, entry)
        }
        shell.addEventListener('animationend', entry.onTurnEnd)
        shell.append(frame)
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
      while (entry.markers.children.length > categories.length) entry.markers.lastElementChild.remove()
      while (entry.markers.children.length < categories.length) entry.markers.append(document.createElement('i'))
      const selectedIndex = categories.indexOf(selected)
      for (const [index, marker] of [...entry.markers.children].entries()) {
        if (marker.hasAttribute('data-prts-settings-active') !== (index === selectedIndex)) marker.toggleAttribute('data-prts-settings-active', index === selectedIndex)
      }
      const pagination = String(selectedIndex + 1).padStart(2, '0') + ' / ' + String(categories.length).padStart(2, '0')
      if (entry.pagination.textContent !== pagination) entry.pagination.textContent = pagination
      if (selected) {
        const label = selected.textContent.trim()
        const sameCategory = entry.selected === selected || !categories.includes(entry.selected) && entry.selectedLabel === label
        if (entry.selected && sameCategory && entry.selected !== selected) finishTurn(shell, entry)
        if (entry.selected && !sameCategory) {
          entry.turn = entry.turn === 'a' ? 'b' : 'a'
          finishTurn(shell, entry)
          shell.setAttribute('data-prts-settings-turn', entry.turn)
          entry.turnTimer = document.defaultView.setTimeout(() => {
            entry.turnTimer = null
            const drawing = shell.getAnimations?.({ subtree: true }).some(animation =>
              animation.animationName === 'prts-settings-draw-' + entry.turn && ['running', 'paused'].includes(animation.playState))
            if (!drawing) finishTurn(shell, entry)
          }, 320)
        }
        entry.selected = selected
        entry.selectedLabel = label
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
