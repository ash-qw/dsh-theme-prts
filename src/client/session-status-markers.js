export function sessionStatusSignalMarkup(state) {
  if (state === 'ongoing') return '<svg data-prts-session-summary-signal="ongoing" aria-hidden="true" viewBox="0 0 24 24"><g data-prts-running-marker><text x="12" y="16">A</text><circle cx="12" cy="12" r="10" stroke-dasharray="4.5 11.208"></circle></g></svg>'
  if (state === 'warning') return '<span data-prts-session-summary-signal="warning" aria-hidden="true"></span>'
  if (state === 'done') return '<span data-prts-session-summary-signal="done" aria-hidden="true"></span>'
  return ''
}

export function createSessionStatusSignal(document, state) {
  const template = document.createElement('template')
  template.innerHTML = sessionStatusSignalMarkup(state)
  return template.content.firstElementChild
}

export function createRunningMarker(document) {
  return createSessionStatusSignal(document, 'ongoing').firstElementChild
}
