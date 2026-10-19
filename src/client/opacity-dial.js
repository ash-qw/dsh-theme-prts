// Ring geometry adapted from React Bits CometDial (David Haz).
// See src/vendor/react-bits/LICENSE.md and THIRD_PARTY_NOTICES.md.
export const BACKGROUND_OPACITY_CONTROLS = Object.freeze([
  { key: 'sidebarOpacity', label: '会话列表侧栏', property: '--prts-sidebar-opacity', value: 94, blurKey: 'sidebarBlur', blurProperty: '--prts-sidebar-blur', blurDefault: 8 },
  { key: 'railOpacity', label: '设置侧栏', property: '--prts-rail-opacity', value: 70, blurKey: 'railBlur', blurProperty: '--prts-rail-blur', blurDefault: 12 },
  { key: 'bakerOpacity', label: 'Baker 气泡', property: '--prts-baker-opacity', value: 50, blurKey: 'bakerBlur', blurProperty: '--prts-baker-blur', blurDefault: 8, theme: 'deck-chat' },
  { key: 'classicUserOpacity', label: '经典用户消息', property: '--prts-classic-user-opacity', value: 50, blurKey: 'classicUserBlur', blurProperty: '--prts-classic-user-blur', blurDefault: 8, theme: 'native' },
])
const dialClamp = value => Math.min(100, Math.max(0, Math.round(value)))
const dialPoint = angle => [100 + Math.cos(angle * Math.PI / 180) * 80, 100 + Math.sin(angle * Math.PI / 180) * 80]
const dialArc = (start, end) => {
  const [x, y] = dialPoint(start), [ex, ey] = dialPoint(end)
  return `M ${x} ${y} A 80 80 0 ${end - start > 180 ? 1 : 0} 1 ${ex} ${ey}`
}
export function opacityDialMarkup() {
  const controls = BACKGROUND_OPACITY_CONTROLS.map(({key,label,value,blurDefault}) => {
    const sample = key === 'bakerOpacity' ? '<span>这是一条回复</span><i></i>'
      : key === 'classicUserOpacity' ? '<span>这是我发送的消息</span><i></i>'
        : key === 'railOpacity' ? '<b>◇</b><b>☼</b><b>⚙</b>' : '<span>工作区</span><i></i><i></i>'
    return `<div data-prts-opacity-control="${key}">
      <div data-prts-opacity-heading><strong>${label}</strong><button type="button" data-prts-opacity-reset data-prts-opacity-reset-tooltip="恢复到 ${value}%" aria-label="恢复${label}透明度到 ${value}%"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 10a7.5 7.5 0 1 1 .7 5.2M4.5 4.5V10H10"/></svg></button></div>
      <div data-prts-opacity-dial><svg viewBox="0 0 200 200" role="slider" tabindex="0" aria-label="${label}透明度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" aria-valuetext="${value}%"><circle data-dial-focus cx="100" cy="100" r="97"/><path data-dial-track d="${dialArc(110,430)}"/><path data-dial-lit/><path data-dial-tail/><circle data-dial-head r="8"/></svg><label data-prts-opacity-number><input type="number" min="0" max="100" step="1" value="${value}" aria-label="${label}透明度百分比"><span>%</span></label></div>
      <div data-prts-material-preview="${key}" aria-hidden="true"><div data-prts-material-preview-surface>${sample}</div></div>
      <div data-prts-blur-control hidden><label><span>模糊</span><input type="range" min="0" max="32" step="1" value="${blurDefault}" aria-label="${label}模糊度"></label><output>${blurDefault}px</output><button type="button" data-prts-blur-reset title="恢复到 ${blurDefault}px" aria-label="恢复${label}模糊度到 ${blurDefault}px"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 10a7.5 7.5 0 1 1 .7 5.2M4.5 4.5V10H10"/></svg></button></div>
      <small data-prts-opacity-note></small>
    </div>`
  }).join('')
  return `<fieldset data-prts-opacity-settings hidden><legend>材质透明度与模糊度</legend><small>透明度数值越高越透明；模糊度以像素计。调整时预览，松手后保存。</small><div data-prts-opacity-grid>${controls}</div></fieldset>`
}
export function mountOpacityDials({ section, window, onChange }) {
  const root = section.ownerDocument.documentElement
  const controls = BACKGROUND_OPACITY_CONTROLS.map(definition => {
    const container = section.querySelector(`[data-prts-opacity-control="${definition.key}"]`)
    const svg = container.querySelector('[data-prts-opacity-dial] svg'), input = container.querySelector('[data-prts-opacity-number] input'), tail = svg.querySelector('[data-dial-tail]')
    const blurControl = container.querySelector('[data-prts-blur-control]')
    const blurInput = blurControl.querySelector('input'), blurOutput = blurControl.querySelector('output')
    const materialPreview = container.querySelector('[data-prts-material-preview]')
    let value = definition.value, saved = value, grip = null, timer
    let blurValue = definition.blurDefault, savedBlur = blurValue
    const paint = next => {
      const previous = value
      value = dialClamp(next)
      const angle = 110 + value * 3.2, [x,y] = dialPoint(angle)
      svg.querySelector('[data-dial-lit]').setAttribute('d', value ? dialArc(110,angle) : '')
      const head = svg.querySelector('[data-dial-head]');head.setAttribute('cx', x);head.setAttribute('cy', y)
      svg.setAttribute('aria-valuenow', value);svg.setAttribute('aria-valuetext', `${value}%`)
      input.value = value
      window.clearTimeout(timer)
      const reach = Math.min(65, Math.abs(value - previous) * 3.2)
      tail.setAttribute('d', reach && value !== previous ? dialArc(Math.max(110, value > previous ? angle-reach : angle), Math.min(430, value > previous ? angle : angle+reach)) : '')
      tail.style.opacity = reach ? '.5' : '0'
      if (reach) timer = window.setTimeout(() => {tail.style.opacity = '0'}, 160)
    }
    const preview = next => { paint(next);root.style.setProperty(definition.property, `${100 - value}%`) }
    const commit = () => { if (value !== saved) { saved = value;onChange(definition.key, (100 - value) / 100) } }
    const position = event => {
      const b = svg.getBoundingClientRect()
      const x = (event.clientX-b.left)/b.width*200-100, y = (event.clientY-b.top)/b.height*200-100
      if (Math.hypot(x,y) < 35) return value
      let angle = (Math.atan2(y,x)*180/Math.PI-110+720)%360
      // Keep a drag on its own side of the dead zone, avoiding 100 -> 0 jumps.
      if (angle > 320) angle = grip?.side === 'high' ? 320 : grip?.side === 'low' ? 0 : angle < 340 ? 320 : 0
      else if (grip) grip.side = angle > 160 ? 'high' : 'low'
      return angle/3.2
    }
    const down = event => {
      if (event.button > 0 || grip) return
      event.preventDefault();svg.focus({preventScroll:true})
      grip = { id: event.pointerId, side: null }
      svg.setPointerCapture?.(event.pointerId);container.setAttribute('data-dragging','')
      preview(position(event))
    }
    const move = event => { if (grip?.id === event.pointerId) preview(position(event)) }
    const finish = (event, cancel = false) => {
      if (!grip || (event.pointerId !== undefined && grip.id !== event.pointerId)) return
      const id = grip.id;grip = null;container.removeAttribute('data-dragging')
      if (svg.hasPointerCapture?.(id)) svg.releasePointerCapture(id)
      if (cancel) preview(saved);else commit()
    }
    const up = event => finish(event)
    const cancel = event => finish(event,true)
    const key = event => {
      if (event.key === 'Escape') { if(grip){event.preventDefault();event.stopPropagation();finish(event,true)}return }
      const step = event.shiftKey ? 10 : 1
      const next = {ArrowRight:value+step,ArrowUp:value+step,ArrowLeft:value-step,ArrowDown:value-step,PageUp:value+10,PageDown:value-10,Home:0,End:100}[event.key]
      if (next === undefined) return
      event.preventDefault();preview(next);commit()
    }
    const change = () => { const n = input.valueAsNumber;if(!Number.isFinite(n)){paint(saved);return}preview(n);commit() }
    const reset = () => { preview(definition.value);commit() }
    const paintBlur = next => {
      blurValue = Math.min(32, Math.max(0, Math.round(next)))
      blurInput.value = blurValue
      blurOutput.value = `${blurValue}px`
      materialPreview.style.setProperty(definition.blurProperty, `${blurValue}px`)
    }
    const previewBlur = next => {
      paintBlur(next)
      if (root.hasAttribute('data-dsh-prts')) root.style.setProperty(definition.blurProperty, `${blurValue}px`)
    }
    const commitBlur = () => { if (blurValue !== savedBlur) { savedBlur = blurValue;onChange(definition.blurKey, blurValue) } }
    const blurChange = () => { previewBlur(blurInput.valueAsNumber);commitBlur() }
    const blurCancel = event => { if (event.key === 'Escape') { event.preventDefault();previewBlur(savedBlur);blurInput.blur() } }
    const resetBlur = () => { previewBlur(definition.blurDefault);commitBlur() }
    const resetButton = container.querySelector('[data-prts-opacity-reset]')
    const blurResetButton = blurControl.querySelector('[data-prts-blur-reset]')
    const bindings = [[svg,'pointerdown',down],[svg,'pointermove',move],[svg,'pointerup',up],[svg,'pointercancel',cancel],[svg,'lostpointercapture',cancel],[svg,'keydown',key],[input,'change',change],[resetButton,'click',reset],[blurInput,'input',event=>previewBlur(event.target.valueAsNumber)],[blurInput,'change',blurChange],[blurInput,'keydown',blurCancel],[blurResetButton,'click',resetBlur],[window,'blur',cancel]]
    for(const [el,type,fn] of bindings)el.addEventListener(type,fn)
    paint(value)
    return {
      update(preferences, active) {
        container.hidden = Boolean(definition.theme && preferences.conversationStyle !== definition.theme)
        saved = 100 - Math.round((preferences[definition.key] ?? (100 - definition.value) / 100) * 100)
        if (!grip && section.ownerDocument.activeElement !== input) paint(saved)
        savedBlur = preferences[definition.blurKey] ?? definition.blurDefault
        if (section.ownerDocument.activeElement !== blurInput) paintBlur(savedBlur)
        blurControl.hidden = !active
        container.querySelector('[data-prts-opacity-note]').textContent = active ? '' : '当前未启用此材质'
      },
      dispose() { if(grip)finish({},true);window.clearTimeout(timer);for(const [el,type,fn] of bindings)el.removeEventListener(type,fn) },
    }
  })
  return {
    update(preferences, state) {
      const full = preferences.backgroundMode === 'full' && Boolean(state.full)
      const split = preferences.backgroundMode === 'split'
      section.querySelector('[data-prts-opacity-settings]').hidden = preferences.backgroundMode === 'off'
      const conversationImage = full || (split && Boolean(state.conversation))
      const sidebarImage = full || (split && Boolean(state.sidebar))
      const active = [sidebarImage, sidebarImage,
        conversationImage && preferences.conversationStyle === 'deck-chat',
        conversationImage && preferences.conversationStyle === 'native']
      controls.forEach((control,i)=>control.update(preferences,active[i]))
    },
    dispose() {for(const control of controls)control.dispose()},
  }
}
