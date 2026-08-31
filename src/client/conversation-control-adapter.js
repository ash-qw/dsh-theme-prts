export const CONVERSATION_CONTROL_ATTRIBUTE = 'data-prts-conversation-control'

function hasClassSuffix(node, suffix) {
  return [...(node?.classList ?? [])].some(token => token.endsWith(suffix))
}

function closestWithClassSuffix(node, suffix) {
  for (let current = node; current?.nodeType === 1; current = current.parentElement) {
    if (hasClassSuffix(current, suffix)) return current
  }
  return null
}

function classify(button, operation) {
  if (button.tagName !== 'BUTTON' || !operation.contains(button)) return null
  if (hasClassSuffix(button, '_sessionLogButton')) return 'header'
  if (button.closest('[data-produced-files-row]') || hasClassSuffix(button, '_showFolder')) return 'utility'
  if (closestWithClassSuffix(button, '_older')) return 'utility'
  if (hasClassSuffix(button, '_inspectButton')) return 'inspect'

  const approval = button.closest('[data-approval-key]')
  if (approval) return hasClassSuffix(button, '_reject') ? 'danger' : 'cta'
  if (hasClassSuffix(button, '_modalAction') || button.closest('[role="dialog"]')) return 'cta'

  if (button.closest('[data-chat-flow-kind], [data-message-role]')) return 'micro'
  return null
}

export function createConversationControlAdapter({ document, window }) {
  let observer
  let operation
  const owned = new Set()
  const pending = new Set()

  function collectButtons(node) {
    if (node?.nodeType !== 1) return
    if (node.tagName === 'BUTTON') pending.add(node)
    for (const button of node.querySelectorAll?.('button') ?? []) pending.add(button)
    const closest = node.closest?.('button')
    if (closest) pending.add(closest)
  }

  function process(button) {
    const kind = button?.isConnected ? classify(button, operation) : null
    if (!kind) {
      button?.removeAttribute?.(CONVERSATION_CONTROL_ATTRIBUTE)
      owned.delete(button)
      return
    }
    button.setAttribute(CONVERSATION_CONTROL_ATTRIBUTE, kind)
    owned.add(button)
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
    for (const button of owned) button.removeAttribute?.(CONVERSATION_CONTROL_ATTRIBUTE)
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
        attributeFilter: ['class', 'data-approval-key'],
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
