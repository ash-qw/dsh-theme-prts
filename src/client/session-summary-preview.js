import { renderPreviewMarkdown } from './preview-markdown.js'
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
  for (const key of [...(snapshot?.order ?? [])].reverse()) {
    const node = snapshot.nodes?.get?.(key)
    if (['user', 'steering', 'turn-trigger'].includes(node?.kind)) break
    if (latestTurn !== undefined && node?.location?.turn?.turn !== latestTurn) continue
    if (node?.kind !== 'assistant-step' || node.visibility === 'hidden' || node.data?.status !== 'settled') continue
    const text = (node.data.blocks ?? []).filter(block => block.kind === 'text').map(block => block.text ?? '').join('').trim()
    if (text) replies.push({key, text})
  }
  return replies.reverse()
}

export function createSessionSummaryPreview({ document, window, sessions, getSessions, getUiConversation, getSessionStatus, openSession, getPreviewPreferences }) {
  let active
  function stop(force = true) {
    if (!force && active) return
    const old = active
    active = undefined
    if (!old) return
    window.clearTimeout(old.leaveTimer)
    window.clearTimeout(old.delay)
    window.clearTimeout(old.refresh)
    old.unsubscribe?.()
    old.unsubscribeStatus?.()
    old.reference?.release()
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
  }
  function show(id, panel, title, anchor) {
    if (active?.sticky && active.id !== id) return
    if (active?.id === id) {
      window.clearTimeout(active.leaveTimer)
      return
    }
    stop()
    const current = { id, panel, anchor, originalParent: panel.parentElement,
      group: anchor?.closest('[data-prts-session-summary-group]') }
    current.group?.setAttribute('data-prts-preview-open', '')
    anchor?.setAttribute('data-prts-preview-active', '')
    active = current
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
    const label = panel.querySelector('strong')
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
          if (active === current) {
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
    let source
    let previousText
    let previousQuestion
    let historyKeys = []
    let detailKey
    let detailEntry
    const hideDetail = () => {
      current.detail?.hidePopover?.()
      if (current.detail) current.detail.hidden = true
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
      }
      const detail = current.detail
      detailKey = reply.key
      detailEntry?.removeAttribute('data-prts-reply-active')
      detailEntry = item
      item?.setAttribute('data-prts-reply-active', '')
      detail.querySelector('strong').textContent = '回复 ' + (index + 1)
      const content = detail.querySelector('[data-prts-preview-body]')
      content.innerHTML = renderPreviewMarkdown(reply.text)
      content.scrollTop = 0
      detail.hidden = false
      const rect = panel.getBoundingClientRect()
      const width = Math.min(340, window.innerWidth - 16)
      detail.style.width = width + 'px'
      const beside = rect.right + 10 + width <= window.innerWidth - 8
      detail.style.left = (beside ? rect.right + 10 : Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))) + 'px'
      detail.style.top = Math.max(8, Math.min(beside ? rect.top : rect.bottom + 8, window.innerHeight - 240)) + 'px'
      detail.showPopover?.()
    }
    const render = () => {
      if (active !== current) return
      if (current.editor) { current.validate?.(); return }
      const status = getSessionStatus?.()?.getSnapshot().get(id)
      const pending = status?.pendingInteraction === current.answeredPending
        ? undefined : status?.pendingInteraction
      const approval = pending?.kind === 'approval'
      const question = approval || pending?.kind === 'question' || pending?.kind === 'plan-review'
      const state = question ? 'warning' : status?.running || (current.answeredPending && status?.pendingInteraction === current.answeredPending) ? 'ongoing'
        : status?.completionUnread || status?.running === false ? 'done' : current.group?.getAttribute('data-prts-session-summary-group') || ''
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
        const replies = completedPreviewReplies(source.getSnapshot())
        panel.toggleAttribute('data-prts-preview-empty', !replies.length)
        const extendsHistory = historyKeys.length > 0 && historyKeys.every((entry,index) => replies[index]?.key === entry.key && replies[index]?.text === entry.text)
        if (!extendsHistory) {
          hideDetail()
          body.replaceChildren()
          body.scrollTop = 0
          historyKeys = []
        }
        if (!replies.length) body.textContent = '正在处理，等待本轮正文输出完成…'
        const previousHeight = body.scrollHeight
        const previousTop = body.scrollTop
        for (let index = historyKeys.length; index < replies.length; index++) {
          const entry = panel.ownerDocument.createElement('article')
          entry.setAttribute('data-prts-preview-message', '')
          const item = panel.ownerDocument.createElement('button')
          item.type = 'button'
          item.setAttribute('data-prts-reply-entry', '')
          const heading = panel.ownerDocument.createElement('small')
          heading.textContent = '回复 ' + (index + 1)
          const summary = panel.ownerDocument.createElement('span')
          const plain = panel.ownerDocument.createElement('div')
          plain.innerHTML = renderPreviewMarkdown(replies[index].text)
          summary.textContent = plain.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)
          item.append(heading, summary)
          item.addEventListener('pointermove', () => showDetail(replies[index], index, item))
          item.addEventListener('focus', () => showDetail(replies[index], index, item))
          item.addEventListener('click', () => showDetail(replies[index], index, item))
          entry.append(item)
          body.prepend(entry)
        }
        if (previousTop > 0) body.scrollTop = previousTop + body.scrollHeight - previousHeight
        else body.scrollTop = 0
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
        else body.innerHTML = renderPreviewMarkdown(text)
        previousText = text
        previousQuestion = question
        if (!extendsReply) body.scrollTop = 0
      }
      if (canAnswerPreview(pending)) enableAnswer()
    }
    current.unsubscribeStatus = getSessionStatus?.()?.subscribe(render)
    render()
    body.scrollTop = 0
    current.delay = window.setTimeout(async () => {
      try {
        const service = getUiConversation?.()
        const controller = getSessions?.() ?? sessions
        if (!controller?.retain || !service?.binding) throw new Error('unavailable')
        current.reference = controller.retain(id, { source: 'prtsSummaryPreview' })
        const binding = await current.reference.ready
        if (active !== current) return
        source = service.binding(binding).target('chat')
        current.unsubscribe = source.subscribe(() => {
          if (active !== current || current.refresh !== undefined) return
          current.refresh = window.setTimeout(() => {
            current.refresh = undefined
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
    }, 80)
  }
  function leave() {
    if (!active || active.sticky) return
    const current = active
    window.clearTimeout(current.leaveTimer)
    current.leaveTimer = window.setTimeout(() => {
      if (active === current && !current.panel.matches(':hover')) stop()
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
  return { show, stop, leave, reanchor }
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
