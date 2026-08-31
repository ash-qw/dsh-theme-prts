export const TO_BOTTOM_ATTRIBUTE = 'data-prts-to-bottom'

function isToBottomButton(node) {
  return node?.tagName === 'BUTTON'
    && [...(node.classList ?? [])].some(token => token.endsWith('_toBottom'))
}

export function createToBottomAdapter({ document, window }) {
  let observer
  let operation
  const owned = new Set()
  const pending = new Set()

  function collectButtons(node) {
    if (node?.nodeType !== 1) return
    if (node.tagName === 'BUTTON') pending.add(node)
    for (const button of node.querySelectorAll?.('button') ?? []) pending.add(button)
  }

  function process(button) {
    if (button?.isConnected && operation?.contains(button) && isToBottomButton(button)) {
      button.setAttribute(TO_BOTTOM_ATTRIBUTE, '')
      owned.add(button)
      return
    }
    button?.removeAttribute?.(TO_BOTTOM_ATTRIBUTE)
    owned.delete(button)
  }

  function scan() {
    for (const button of pending) process(button)
    pending.clear()
    for (const button of [...owned]) {
      if (!button.isConnected) process(button)
    }
  }

  function queueScan() {
    scan()
  }

  function onMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') collectButtons(mutation.target)
      for (const node of mutation.addedNodes ?? []) collectButtons(node)
      for (const node of mutation.removedNodes ?? []) {
        if (node?.nodeType !== 1) continue
        for (const button of owned) {
          if (button === node || node.contains?.(button)) pending.add(button)
        }
      }
    }
    if (pending.size) queueScan()
  }

  function clear() {
    for (const button of owned) button.removeAttribute?.(TO_BOTTOM_ATTRIBUTE)
    owned.clear()
    pending.clear()
  }

  return {
    start() {
      if (!document) return
      operation = document.querySelector('[data-prts-region="operation"]')
      if (!operation) return
      collectButtons(operation)
      scan()
      if (observer || !window?.MutationObserver) return
      observer = new window.MutationObserver(onMutations)
      observer.observe(operation, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      })
    },
    dispose() {
      observer?.disconnect()
      observer = undefined
      clear()
      operation = undefined
    },
  }
}
