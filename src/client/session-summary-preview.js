import { createPreviewContentCache } from './preview-markdown.js'
export function canAnswerPreview(pending) {
  if (pending?.kind === 'approval') return pending.answerable === true && typeof pending.answer === 'function'
  const question = pending?.questions?.[0]
  return pending?.kind === 'question' && pending.questions.length === 1
    && typeof pending.answer === 'function' && typeof question?.id === 'string'
    && !question.intent && !question.detail && question.options?.length > 0
    && !pending.getSnapshot?.().closed
}

// Pending choices are separate from assistant prose in DSH.
export function pendingQuestionPreview(pending) {
  const questions = pending.questions ?? []
  const text = questions.slice(0, 2).map(item => {
    const question = (item.question ?? '').slice(0, 80)
    const options = (item.options ?? []).slice(0, 4).map(option => option.label).filter(Boolean).join(' / ')
    return [question, options].filter(Boolean).join('：')
  }).join('；')
  return text ? text.slice(0, 240) : '有待回答的问题，请打开会话查看'
}

// Read the host's assembled Chat view rather than interpreting raw stream events.
export function latestAssistantReply(snapshot) {
  const order = snapshot?.order ?? []
  const latestTurn = snapshot?.timeline?.turnOrder?.at(-1)
  for (let i = order.length - 1; i >= 0; i--) {
    const node = snapshot.nodes?.get?.(order[i])
    // Never search past a new user input, even before turn/start arrives.
    if (['user', 'steering', 'turn-trigger'].includes(node?.kind)) return ''
    if (latestTurn !== undefined && node?.location?.turn?.turn !== latestTurn) continue
    if (node?.kind !== 'assistant-step' || node.visibility === 'hidden') continue
    let text = ''
    for (const block of node.data?.blocks ?? []) {
      if (block.kind === 'text') text += block.text ?? ''
    }
    text = text.trim()
    if (text) return text
  }
  return ''
}

export function completedPreviewReplies(snapshot) {
  const replies = []
  const latestTurn = snapshot?.timeline?.turnOrder?.at(-1)
  const order = snapshot?.order ?? []
  for (let i = order.length - 1; i >= 0; i--) {
    const key = order[i]
    const node = snapshot.nodes?.get?.(key)
    if (['user', 'steering', 'turn-trigger'].includes(node?.kind)) break
    if (latestTurn !== undefined && node?.location?.turn?.turn !== latestTurn) continue
    if (node?.kind !== 'assistant-step' || node.visibility === 'hidden' || node.data?.status !== 'settled') continue
    const text = (node.data.blocks ?? []).filter(block => block.kind === 'text').map(block => block.text ?? '').join('').trim()
    if (text) replies.push({key, text})
  }
  return replies.reverse()
}

// Ignore streaming text: only settled prose and turn boundaries affect this list.
// Cache immutable host data; mutable test/older-host data is read on each check.
export function createPreviewReplySelector() {
  const textCache = new WeakMap()
  let previous = [], previousTurn, previousBoundary
  return (snapshot, limit = 5) => {
    const order = snapshot?.order ?? []
    const turn = snapshot?.timeline?.turnOrder?.at(-1)
    const replies = []
    let boundary
    for (let i = order.length - 1; i >= 0; i--) {
      const key = order[i], node = snapshot.nodes?.get?.(key)
      if (['user', 'steering', 'turn-trigger'].includes(node?.kind)) { boundary = key; break }
      if (turn !== undefined && node?.location?.turn?.turn !== turn) continue
      if (node?.kind !== 'assistant-step' || node.visibility === 'hidden' || node.data?.status !== 'settled') continue
      let text = textCache.get(node.data)
      if (text === undefined) {
        text = (node.data.blocks ?? []).filter(block => block.kind === 'text').map(block => block.text ?? '').join('').trim()
        if (Object.isFrozen(node.data)) textCache.set(node.data, text)
      }
      if (text) replies.push({key, text})
    }
    replies.reverse()
    const selected = (limit > 0 ? replies.slice(-limit) : replies)
      .map((reply, index) => ({...reply, ordinal: replies.length - (limit > 0 ? Math.min(limit, replies.length) : replies.length) + index + 1}))
    if (turn === previousTurn && boundary === previousBoundary && selected.length === previous.length && selected.every((reply, i) => reply.key === previous[i].key && reply.text === previous[i].text && reply.ordinal === previous[i].ordinal)) return previous
    previousTurn = turn
    previousBoundary = boundary
    return previous = selected
  }
}

function previewStatusFields(status) {
  const pending = status?.pendingInteraction
  return [status?.running, status?.completionUnread, pending, pending?.answer,
    JSON.stringify([pending?.kind, pending?.answerable, pending?.getSnapshot?.().closed,
      pending?.questions, pending?.callId, pending?.toolName, pending?.reason, pending?.displayReason])]
}

export function approvalCallDetails(snapshot, pending) {
  if (!pending?.callId) return undefined
  for (const node of snapshot?.nodes?.values?.() ?? []) {
    const root = node.kind === 'tool-call' ? node.data?.root : undefined
    if (!root || root.callId !== pending.callId || 'kind' in root || root.phase !== 'start') continue
    const raw = root.argsRaw
    if (typeof raw !== 'string') return undefined
    try {
      const args = JSON.parse(raw)
      if (args && typeof args === 'object' && !Array.isArray(args) && typeof args.command === 'string') {
        const {command, ...rest} = args
        return {command, parameters: Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''}
      }
      return {parameters: JSON.stringify(args, null, 2)}
    } catch { return {parameters: raw} }
  }
}

export function createSessionSummaryPreview({ document, window, sessions, getSessions, getUiConversation, getSessionStatus, openSession, getPreviewPreferences, onPreviewClosed, onAnswerSubmitted }) {
  let active
  function follows(state) {
    const preferences = getPreviewPreferences?.() ?? {}
    return state === 'warning' ? preferences.previewFollowWarning === true : preferences.previewFollowOngoing !== false
  }
  // Shared across running, pending and completed previews. Active ownership is
  // outside the LRU so it can never be evicted by an idle timeout.
  const warm = new Map()
  const cacheLimit = 5
  function releaseWarm(id) {
    const entry = warm.get(id)
    if (!entry) return
    warm.delete(id)
    window.clearTimeout(entry.timer)
    entry.reference.release()
  }
  function clearWarm() {
    for (const id of warm.keys()) releaseWarm(id)
  }
  function trimWarm(limit) {
    while (warm.size > limit) releaseWarm(warm.keys().next().value)
  }
  function stop(force = true, keepWarm = false) {
    if (!force) return
    if (!keepWarm) clearWarm()
    const old = active
    active = undefined
    if (!old) return
    window.clearTimeout(old.leaveTimer)
    window.clearTimeout(old.delay)
    window.clearTimeout(old.refresh)
    old.unsubscribe?.()
    old.unsubscribeStatus?.()
    if (keepWarm && old.reference && old.source) {
      releaseWarm(old.id)
      const entry = { reference: old.reference, source: old.source, contentCache: old.contentCache }
      entry.timer = window.setTimeout(() => {
        if (warm.get(old.id) === entry) releaseWarm(old.id)
      }, 30000)
      warm.set(old.id, entry)
      trimWarm(cacheLimit)
    } else old.reference?.release()
    old.panel.hidePopover?.()
    old.panel.hidden = true
    old.panel.removeAttribute('data-prts-preview-editing')
    old.panel.setAttribute('role', 'note')
    old.cleanupEditor?.()
    old.cleanupHover?.()
    old.detail?.hidePopover?.()
    old.detail?.remove()
    old.group?.removeAttribute('data-prts-preview-open')
    old.anchor?.removeAttribute('data-prts-preview-active')
    if (old.detached) {
      old.panel.remove()
      if (old.originalParent?.isConnected) old.originalParent.append(old.panel)
    }
    onPreviewClosed?.()
  }
  function show(id, panel, title, anchor) {
    if (active?.id === id) {
      window.clearTimeout(active.leaveTimer)
      return
    }
    stop(true, true)
    const cached = warm.get(id)
    if (cached) { window.clearTimeout(cached.timer); warm.delete(id) }
    // Reserve one slot for the active preview, including a pending acquisition.
    trimWarm(cacheLimit - 1)
    const current = { id, panel, anchor, originalParent: panel.parentElement,
      group: anchor?.closest('[data-prts-session-summary-group]') }
    current.group?.setAttribute('data-prts-preview-open', '')
    anchor?.setAttribute('data-prts-preview-active', '')
    active = current
    current.contentCache = cached?.contentCache ?? createPreviewContentCache(panel.ownerDocument)
    if (cached) { current.reference = cached.reference; current.source = cached.source }
    const keep = () => window.clearTimeout(current.leaveTimer)
    const onDoubleClick = event => {
      if (active !== current || event.button !== 0 || getPreviewPreferences?.().previewDoubleClick === false) return
      if (event.target.closest?.('button, a, input, textarea, select, label, summary, [role="button"], [role="link"], [contenteditable]:not([contenteditable="false"])')) return
      event.preventDefault()
      event.stopPropagation()
      stop()
      openSession?.(id)
    }
    const dismissSticky = event => {
      if (!current.sticky) return
      if (event.type === 'keydown') {
        if (event.key !== 'Escape') return
        event.preventDefault()
      } else if (panel.contains(event.target) || current.anchor?.contains(event.target)) return
      stop()
    }
    panel.ownerDocument.addEventListener('pointerdown', dismissSticky)
    panel.ownerDocument.addEventListener('keydown', dismissSticky)
    panel.addEventListener('dblclick', onDoubleClick)
    panel.addEventListener('pointerenter', keep)
    panel.addEventListener('pointerleave', leave)
    current.cleanupHover = () => {
      panel.ownerDocument.removeEventListener('pointerdown', dismissSticky)
      panel.ownerDocument.removeEventListener('keydown', dismissSticky)
      panel.removeEventListener('dblclick', onDoubleClick)
      panel.removeEventListener('pointerenter', keep)
      panel.removeEventListener('pointerleave', leave)
    }
    panel.removeAttribute('data-prts-preview-editing')
    panel.setAttribute('role', 'note')
    panel.hidden = false
    if (anchor) {
      const list = anchor.closest('[data-prts-session-summary-popover]').getBoundingClientRect()
      const row = anchor.getBoundingClientRect()
      panel.style.left = (list.right + 10) + 'px'
      panel.style.top = Math.max(8, Math.min(row.top, window.innerHeight - 230)) + 'px'
    }
    panel.ownerDocument.body.append(panel)
    current.detached = true
    panel.showPopover?.()
    let positionFrame
    const positionPanels = () => {
      positionFrame = undefined
      if (active !== current) return
      const viewport = window.visualViewport
      const left = (viewport?.offsetLeft ?? 0) + 8, top = (viewport?.offsetTop ?? 0) + 8
      const width = Math.max(1, (viewport?.width ?? window.innerWidth) - 16)
      const height = Math.max(1, (viewport?.height ?? window.innerHeight) - 16)
      const place = (surface, reference, preferredTop, noticeOwner, anchorBottom = preferredTop) => {
        surface.style.maxWidth = 'none'
        surface.style.maxHeight = 'none'
        const bounds = surface.getBoundingClientRect()
        const x = reference ? reference.right + 10 : left
        const fitsVertically = y => y >= top && y + bounds.height <= top + height
        const above = anchorBottom - bounds.height
        const y = !fitsVertically(preferredTop) && fitsVertically(above) ? above : preferredTop
        const insufficient = Boolean(reference) && (x < left || x + bounds.width > left + width || !fitsVertically(y))
        surface.toggleAttribute('data-prts-preview-no-space', insufficient)
        const noticeKey = surface === panel ? 'spaceNotice' : 'detailSpaceNotice'
        if (insufficient && noticeOwner) {
          let notice = current[noticeKey]
          if (!notice) {
            notice = panel.ownerDocument.createElement('div')
            notice.setAttribute('data-prts-preview-space-notice', '')
            notice.setAttribute('role', 'status')
            const guidance = '空间不足，无法展开预览。可点击会话进入；建议扩大窗口，或在辅助功能中关闭对应预览。'
            notice.textContent = surface === panel ? '空间不足，无法展开正文预览' : guidance
            notice.title = guidance
            current[noticeKey] = notice
          }
          if (notice.parentElement !== noticeOwner) noticeOwner.append(notice)
        } else { current[noticeKey]?.remove(); current[noticeKey] = undefined }
        surface.style.left = x + 'px'
        surface.style.top = y + 'px'
        return !insufficient
      }
      const menu = current.anchor?.closest('[data-prts-session-summary-popover]')
      const reference = menu?.getBoundingClientRect()
      const row = current.anchor?.getBoundingClientRect()
      const visible = place(panel, reference, row?.top ?? (parseFloat(panel.style.top) || top), menu, row?.bottom)
      panel.toggleAttribute('data-prts-preview-tail', Boolean(visible && row))
      if (visible && row) {
        const bounds = panel.getBoundingClientRect()
        const tail = Math.abs(bounds.top - row.top) <= 3 ? 'top'
          : Math.abs(bounds.bottom - row.bottom) <= 3 ? 'bottom' : 'middle'
        panel.setAttribute('data-prts-preview-tail', tail)
        const center = (row.top + row.bottom) / 2 - bounds.top
        const cy = Math.max(8, Math.min(bounds.height - 8, center))
        const spread = Math.min(10, cy - 8, bounds.height - 8 - cy)
        let outline = panel.querySelector('[data-prts-preview-outline]')
        if (!outline) {
          outline = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          outline.setAttribute('data-prts-preview-outline', '')
          outline.setAttribute('aria-hidden', 'true')
          outline.append(document.createElementNS('http://www.w3.org/2000/svg', 'path'))
          panel.prepend(outline)
        }
        const w = bounds.width + 6, h = bounds.height
        outline.setAttribute('viewBox', `0 0 ${w} ${h}`)
        outline.style.width = w + 'px'
        outline.style.height = h + 'px'
        // One filled contour keeps the translucent tail and body free of seams.
        const right = `H${w-8.5} Q${w-.5} .5 ${w-.5} 8.5 V${h-8.5} Q${w-.5} ${h-.5} ${w-8.5} ${h-.5}`
        let contour
        if (tail === 'top') {
          contour = `M.5 .5 ${right} H14.5 Q6.5 ${h-.5} 6.5 ${h-8.5} V12.5 L.5 .5 Z`
        } else if (tail === 'bottom') {
          contour = `M14.5 .5 ${right} H.5 L6.5 ${h-12.5} V8.5 Q6.5 .5 14.5 .5 Z`
        } else {
          contour = `M14.5 .5 ${right} H14.5 Q6.5 ${h-.5} 6.5 ${h-8.5} V${cy+spread} C6.5 ${cy+spread*.45} 2.5 ${cy+2} .5 ${cy} C2.5 ${cy-2} 6.5 ${cy-spread*.45} 6.5 ${cy-spread} V8.5 Q6.5 .5 14.5 .5 Z`
        }
        // Only update the SVG when its geometry changes.
        if (outline.firstElementChild.getAttribute('d') !== contour) outline.firstElementChild.setAttribute('d', contour)
      }
      if (current.detail && !current.detail.hidden) {
        if (visible) place(current.detail, panel.getBoundingClientRect(), panel.getBoundingClientRect().top, panel, panel.getBoundingClientRect().bottom)
        else current.detail.setAttribute('data-prts-preview-no-space', '')
      }

    }
    const schedulePosition = () => {
      if (positionFrame === undefined) positionFrame = window.requestAnimationFrame(positionPanels)
    }
    const positionObserver = window.ResizeObserver ? new window.ResizeObserver(schedulePosition) : undefined
    positionObserver?.observe(panel)
    window.addEventListener('resize', schedulePosition)
    window.visualViewport?.addEventListener('resize', schedulePosition)
    window.visualViewport?.addEventListener('scroll', schedulePosition)
    const cleanupHover = current.cleanupHover
    current.cleanupHover = () => {
      cleanupHover()
      current.spaceNotice?.remove()
      current.detailSpaceNotice?.remove()
      panel.removeAttribute('data-prts-preview-no-space')
      panel.removeAttribute('data-prts-preview-tail')
      panel.querySelector('[data-prts-preview-outline]')?.remove()
      positionObserver?.disconnect()
      window.cancelAnimationFrame(positionFrame)
      window.removeEventListener('resize', schedulePosition)
      window.visualViewport?.removeEventListener('resize', schedulePosition)
      window.visualViewport?.removeEventListener('scroll', schedulePosition)
    }
    schedulePosition()
    const label = panel.querySelector('strong')
    let sessionTitle = panel.querySelector('[data-prts-preview-session-title]')
    if (!sessionTitle) {
      sessionTitle = panel.ownerDocument.createElement('div')
      sessionTitle.setAttribute('data-prts-preview-session-title', '')
      panel.prepend(sessionTitle)
    }
    sessionTitle.textContent = title
    sessionTitle.title = title
    let body = panel.querySelector('[data-prts-preview-body]')
    if (!body) {
      body = panel.ownerDocument.createElement('div')
      body.setAttribute('data-prts-preview-body', '')
      panel.querySelector('p').replaceWith(body)
    }
    const choices = panel.ownerDocument.createElement('div')
    choices.setAttribute('data-prts-preview-choices', '')
    panel.querySelector('[data-prts-preview-choices]')?.remove()
    panel.append(choices)
    panel.querySelector('[data-prts-preview-actions]')?.remove()
    const actions = panel.ownerDocument.createElement('div')
    actions.setAttribute('data-prts-preview-actions', '')
    panel.append(actions)
    const pendingNow = () => getSessionStatus?.()?.getSnapshot().get(id)?.pendingInteraction
    const button = (text, action) => {
      const el = panel.ownerDocument.createElement('button')
      el.type = 'button'
      el.textContent = text
      el.addEventListener('click', action)
      return el
    }
    const closeSticky = button('关闭预览', () => stop())
    const enter = button('进入会话', () => { stop(); openSession?.(id) })
    const enableAnswer = () => {
      const pending = pendingNow()
      if (!canAnswerPreview(pending)) return
      current.editor = true
      current.editingPending = pending
      // Detach from the hover menu before promoting again to the top layer.
      panel.setAttribute('data-prts-preview-editing', '')
      panel.setAttribute('role', 'dialog')

      const approval = pending.kind === 'approval'
      const question = approval ? {
        options: [{label:'仅允许本次'}, {label:'拒绝'}]
      } : pending.questions[0]
      const submitLabel = approval ? '提交审批' : '提交回答'
      const selected = new Set()
      let busy = false
      const message = panel.ownerDocument.createElement('small')
      message.setAttribute('role', 'status')
      const submit = button(submitLabel, async () => {
        if (busy || !selected.size) return
        if (pendingNow() !== pending || pending.getSnapshot?.().closed || (approval && !pending.answerable)) {
          message.textContent = '问题状态已变化，请重新打开预览。'
          submit.disabled = true
          return
        }
        busy = true
        submit.disabled = true
        submit.textContent = '正在提交…'
        try {
          const channel = pending.getSnapshot?.().channel
          await pending.answer(approval
            ? selected.has('仅允许本次') ? 'allowed-once' : 'rejected'
            : {answers:[{id:question.id,selected:question.options.map(o=>o.label).filter(value=>selected.has(value))}]})
          if (active === current && !follows('warning')) {
            stop(true, true)
            onAnswerSubmitted?.('warning')
          } else if (active === current) {
            current.sticky = true
            keep()
            current.answeredPending = pending
            current.cleanupEditor?.()
            current.cleanupEditor = undefined
            current.validate = undefined
            current.editor = false
            panel.removeAttribute('data-prts-preview-editing')
            panel.setAttribute('role', 'note')
            render()
          }
          if (channel === 'rpc') await pending.dismiss?.()
        } catch {
          if (active !== current) return
          busy = false
          submit.disabled = false
          submit.textContent = submitLabel
          message.textContent = '提交失败，请重试或进入会话处理。'
        }
      })
      submit.disabled = true
      choices.replaceChildren(...question.options.map(option => {
        const choice = button(option.label, () => {
          if (busy) return
          if (question.multiSelect) {
            if (selected.has(option.label)) selected.delete(option.label)
            else selected.add(option.label)
          } else {
            selected.clear()
            selected.add(option.label)
          }
          pending.engage?.()
          for (const el of choices.children) el.setAttribute('aria-pressed', String(selected.has(el.dataset.value)))
          submit.disabled = !selected.size
        })
        choice.dataset.value = option.label
        choice.setAttribute('aria-pressed','false')
        if (option.description) {
          const detail = panel.ownerDocument.createElement('small')
          detail.textContent = option.description
          choice.append(detail)
        }
        return choice
      }))
      choices.hidden = false
      actions.replaceChildren(button('取消', () => stop()), enter, submit, message)
      const onKey = event => { if (event.key === 'Escape') { event.preventDefault(); stop() } }
      panel.addEventListener('keydown', onKey)
      const onEnter = () => pending.holdFocus?.()
      const onOutside = event => { if (!panel.contains(event.target) && !anchor?.contains(event.target)) stop() }
      panel.addEventListener('pointerenter', onEnter)
      panel.ownerDocument.addEventListener('pointerdown', onOutside)
      current.cleanupEditor = () => {
        pending.releaseFocus?.()
        panel.removeEventListener('keydown', onKey)
        panel.removeEventListener('pointerenter', onEnter)
        panel.ownerDocument.removeEventListener('pointerdown', onOutside)
      }
      current.validate = () => {
        if (!busy && (pendingNow() !== pending || (approval && !pending.answerable))) {
          message.textContent = '问题已更新或结束，请进入会话查看。'
          submit.disabled = true
          for (const el of choices.children) el.disabled = true
        }
      }
    }
    let lastChoices = ''
    let source = cached?.source
    let previousText
    let previousQuestion
    let historyKeys = []
    const selectReplies = createPreviewReplySelector()
    const replyLimit = () => getPreviewPreferences?.().previewReplyLimit ?? 5
    let detailKey
    let detailEntry
    const hideDetail = () => {
      current.detail?.hidePopover?.()
      if (current.detail) current.detail.hidden = true
      current.detailSpaceNotice?.remove()
      current.detailSpaceNotice = undefined
      detailKey = undefined
      detailEntry?.removeAttribute('data-prts-reply-active')
      detailEntry = undefined
    }
    const showDetail = (reply, index, item) => {
      keep()
      if (detailKey === reply.key && current.detail && !current.detail.hidden) return
      if (!current.detail) {
        const detail = panel.ownerDocument.createElement('section')
        detail.setAttribute('data-prts-summary-reply', '')
        detail.setAttribute('data-prts-reply-detail', '')
        detail.setAttribute('popover', 'manual')
        detail.setAttribute('role', 'note')
        const heading = panel.ownerDocument.createElement('strong')
        const content = panel.ownerDocument.createElement('div')
        content.setAttribute('data-prts-preview-body', '')
        detail.append(heading, content)
        panel.append(detail)
        current.detail = detail
        positionObserver?.observe(detail)
      }
      const detail = current.detail
      detailKey = reply.key
      detailEntry?.removeAttribute('data-prts-reply-active')
      detailEntry = item
      item?.setAttribute('data-prts-reply-active', '')
      detail.querySelector('strong').textContent = '回复 ' + (reply.ordinal ?? index + 1)
      const content = detail.querySelector('[data-prts-preview-body]')
      content.innerHTML = current.contentCache(reply.text).html
      content.scrollTop = 0
      detail.hidden = false
      const rect = panel.getBoundingClientRect()
      const width = Math.min(340, window.innerWidth - 16)
      detail.style.width = width + 'px'
      const beside = rect.right + 10 + width <= window.innerWidth - 8
      detail.style.left = (beside ? rect.right + 10 : Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))) + 'px'
      detail.style.top = Math.max(8, Math.min(beside ? rect.top : rect.bottom + 8, window.innerHeight - 240)) + 'px'
      detail.showPopover?.()
      schedulePosition()
    }
    const renderApprovalDetails = pending => {
      if (pending?.kind !== 'approval') return
      const details = approvalCallDetails(source?.getSnapshot(), pending)
      let section = body.querySelector('[data-prts-approval-details]')
      const signature = JSON.stringify(details ?? null)
      if (section?.dataset.signature === signature) return
      if (!section) { section = document.createElement('div'); section.setAttribute('data-prts-approval-details', ''); body.append(section) }
      section.dataset.signature = signature
      section.replaceChildren()
      if (!details) {
        section.textContent = source ? '暂无可用的操作参数，请进入会话核对详情。' : '正在读取操作详情…'
        return
      }
      for (const [name, value] of [['命令', details.command], ['参数', details.parameters]]) {
        if (!value) continue
        const heading = document.createElement('div')
        heading.textContent = name
        const code = document.createElement('pre')
        code.textContent = value
        section.append(heading, code)
      }
    }
    const render = () => {
      if (active !== current) return
      if (current.editor) { current.validate?.(); if (pendingNow() === current.editingPending) renderApprovalDetails(current.editingPending); return }
      const status = getSessionStatus?.()?.getSnapshot().get(id)
      const pending = status?.pendingInteraction === current.answeredPending
        ? undefined : status?.pendingInteraction
      const approval = pending?.kind === 'approval'
      panel.toggleAttribute('data-prts-preview-approval', approval)
      const question = approval || pending?.kind === 'question' || pending?.kind === 'plan-review'
      const state = question ? 'warning' : status?.running || (current.answeredPending && status?.pendingInteraction === current.answeredPending) ? 'ongoing'
        : status?.completionUnread || status?.running === false ? 'done' : current.group?.getAttribute('data-prts-session-summary-group') || ''
      if (current.state && current.state !== state && !follows(current.state)) return
      if (current.state && current.state !== state) {
        current.sticky = true
        keep()
      }
      current.state = state
      panel.setAttribute('data-prts-preview-state', state)
      label.textContent = approval ? '等待审批 · 仅本次授权' : question ? '等待你的选择' : state === 'ongoing' ? '运行中 · 已完成正文' : state === 'done' ? '已完成 · 最后回复' : '最新 AI 回复'
      panel.toggleAttribute('data-prts-preview-question', question)
      if (question) {
        if (!actions.contains(enter)) actions.replaceChildren(enter)
      } else if (current.sticky) {
        if (!actions.contains(closeSticky)) actions.replaceChildren(closeSticky)
      } else actions.replaceChildren()
      const first = question ? pending.questions?.[0] : undefined
      const labels = (first?.options ?? []).slice(0, 3).map(option => option.label)
      const remaining = Math.max(0, (first?.options?.length ?? 0) - 3)
      if (remaining) labels.push('另有 ' + remaining + ' 个选项')
      if ((pending?.questions?.length ?? 0) > 1) labels.push('共 ' + pending.questions.length + ' 个问题')
      const signature = JSON.stringify(labels)
      if (signature !== lastChoices) {
        lastChoices = signature
        choices.replaceChildren(...labels.map(text => {
          const option = panel.ownerDocument.createElement('span')
          option.textContent = text
          return option
        }))
      }
      choices.hidden = !labels.length
      panel.setAttribute('aria-label', title + '：' + label.textContent)
      if (state === 'ongoing' && source) {
        const replies = selectReplies(source.getSnapshot(), replyLimit())
        if (replies === historyKeys) return
        panel.toggleAttribute('data-prts-preview-empty', !replies.length)
        const previousTop = body.scrollTop
        const scrollAnchor = previousTop > 0 ? [...body.children].find(entry => entry.getBoundingClientRect().bottom > body.getBoundingClientRect().top) : undefined
        const anchorTop = scrollAnchor?.getBoundingClientRect().top
        const retained = new Map(historyKeys.map(reply => [reply.key, reply]))
        for (const old of historyKeys) {
          const replacement = replies.find(reply => reply.key === old.key)
          if (!replacement || replacement.text !== old.text || replacement.ordinal !== old.ordinal) {
            body.querySelectorAll('[data-prts-preview-message]').forEach(entry => {
              if (entry.dataset.replyKey === old.key) entry.remove()
            })
            retained.delete(old.key)
            if (detailKey === old.key) hideDetail()
          }
        }
        if (!historyKeys.length) body.replaceChildren()
        if (!replies.length) body.textContent = '正在处理，等待本轮正文输出完成…'
        for (let index = 0; index < replies.length; index++) {
          const reply = replies[index]
          if (retained.has(reply.key)) continue
          const entry = panel.ownerDocument.createElement('article')
          entry.setAttribute('data-prts-preview-message', '')
          entry.dataset.replyKey = reply.key
          const item = panel.ownerDocument.createElement('button')
          item.type = 'button'
          item.setAttribute('data-prts-reply-entry', '')
          const heading = panel.ownerDocument.createElement('small')
          heading.textContent = '回复 ' + reply.ordinal
          const summary = panel.ownerDocument.createElement('span')
          summary.textContent = current.contentCache(reply.text).summary
          item.append(heading, summary)
          item.addEventListener('pointermove', () => showDetail(reply, index, item))
          item.addEventListener('focus', () => showDetail(reply, index, item))
          item.addEventListener('click', () => showDetail(reply, index, item))
          entry.append(item)
          body.prepend(entry)
        }
        // Reorder only when necessary, preserving retained DOM and open details.
        const entries = new Map([...body.children].map(entry => [entry.dataset.replyKey, entry]))
        for (let i = replies.length - 1, position = 0; i >= 0; i--, position++) {
          const entry = entries.get(replies[i].key)
          if (body.children[position] !== entry) body.insertBefore(entry, body.children[position] ?? null)
        }
        if (scrollAnchor?.isConnected) body.scrollTop += scrollAnchor.getBoundingClientRect().top - anchorTop
        else if (previousTop === 0) body.scrollTop = 0
        historyKeys = replies
        previousText = undefined
        previousQuestion = undefined
        return
      }
      hideDetail()
      historyKeys = []
      const excerpt = source ? latestAssistantReply(source.getSnapshot()) : ''
      panel.toggleAttribute('data-prts-preview-empty', !question && !excerpt)
      const text = question
        ? approval
          ? [pending.toolName, pending.displayReason?.['zh-CN'] || pending.displayReason?.zh || pending.reason || pending.displayReason?.en || '请进入会话查看操作详情'].filter(Boolean).join('：')
          : first?.question || pendingQuestionPreview(pending)
        : source ? excerpt || (state === 'ongoing' ? '正在处理，尚未输出正文…' : '暂无正文回复，可进入会话查看执行记录。') : '正在读取…'
      if (previousText !== text || previousQuestion !== question) {
        const extendsReply = previousQuestion === question && previousText && text.startsWith(previousText)
        if (question) body.textContent = text
        else body.innerHTML = current.contentCache(text).html
        previousText = text
        previousQuestion = question
        if (!extendsReply) body.scrollTop = 0
      }
      if (approval) renderApprovalDetails(pending)
      if (canAnswerPreview(pending)) enableAnswer()
    }
    let statusFields = previewStatusFields(getSessionStatus?.()?.getSnapshot().get(id))
    current.unsubscribeStatus = getSessionStatus?.()?.subscribe(() => {
      const next = previewStatusFields(getSessionStatus?.()?.getSnapshot().get(id))
      if (next.every((value, index) => value === statusFields[index])) return
      statusFields = next
      render()
    })
    render()
    body.scrollTop = 0
    current.delay = window.setTimeout(async () => {
      try {
        const service = getUiConversation?.()
        const controller = getSessions?.() ?? sessions
        if (!controller?.retain || !service?.binding) throw new Error('unavailable')
        if (!current.reference) current.reference = controller.retain(id, { source: 'prtsSummaryPreview' })
        const binding = await current.reference.ready
        if (active !== current) return
        source ??= service.binding(binding).target('chat')
        current.source = source
        current.unsubscribe = source.subscribe(() => {
          if (active !== current || current.refresh !== undefined) return
          current.refresh = window.setTimeout(() => {
            current.refresh = undefined
            if (current.state === 'ongoing' && !current.editor && selectReplies(source.getSnapshot(), replyLimit()) === historyKeys) return
            render()
          }, 120)
        })
        render()
      } catch {
        if (active !== current) return
        current.unsubscribe?.()
        current.unsubscribe = undefined
        current.reference?.release()
        current.reference = undefined
        render()
        if (body.textContent.trim() === '正在读取…') body.textContent = '暂时无法读取回复，可点击会话查看'
      }
    }, cached ? 0 : 80)
  }
  function leave() {
    if (!active || active.sticky) return
    const current = active
    window.clearTimeout(current.leaveTimer)
    current.leaveTimer = window.setTimeout(() => {
      if (active === current && !current.panel.matches(':hover')) stop(true, true)
    }, 300)
  }
  function reanchor(root) {
    if (!active) return
    const anchor = [...root.querySelectorAll('[data-prts-session-summary-item]')]
      .find(item => item.getAttribute('data-prts-session-summary-item') === active.id)
    active.group?.removeAttribute('data-prts-preview-open')
    active.anchor?.removeAttribute('data-prts-preview-active')
    active.anchor = anchor
    active.group = anchor?.closest('[data-prts-session-summary-group]')
    active.originalParent = undefined
    active.group?.setAttribute('data-prts-preview-open', '')
    anchor?.setAttribute('data-prts-preview-active', '')
    window.clearTimeout(active.leaveTimer)
  }
  function enterState(state) {
    if (active && active.state !== state) stop(true, true)
  }
  function pinnedState() {
    return active && !follows(active.state)
      ? { id: active.id, state: active.state } : undefined
  }
  return { show, stop, leave, reanchor, enterState, pinnedState, isOpen: () => Boolean(active) }
}

export function scrollSummaryTitle(button, viewport, text, window) {
  let animation
  const stop = () => { animation?.cancel(); animation = undefined }
  const start = () => {
    stop()
    const distance = text.scrollWidth - viewport.clientWidth
    if (distance <= 8 || !text.animate) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    animation = text.animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(-${distance}px)` },
    ], { duration: reduced ? 0 : distance / 30 * 1000, fill: 'forwards', easing: 'linear' })
  }
  button.addEventListener('pointerenter', start)
  button.addEventListener('pointerleave', stop)
  button.addEventListener('focus', start)
  button.addEventListener('blur', stop)
  return stop
}
