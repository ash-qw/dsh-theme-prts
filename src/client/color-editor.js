export function colorEditorMarkup() {
  return `<span data-prts-color-editor-title>自定义颜色</span><span data-prts-color-sample></span><label data-prts-color-hex-label>HEX<input data-prts-color-hex aria-label="HEX 颜色" maxlength="7" spellcheck="false"></label>${['R', 'G', 'B'].map((name, index) => `<label data-prts-color-channel><span>${name}</span><input type="range" min="0" max="255" step="1" data-prts-color-channel-index="${index}" aria-label="${name} 通道"><output>0</output></label>`).join('')}<span data-prts-color-actions><button type="button" data-prts-color-cancel>取消</button><button type="button" data-prts-color-apply>应用颜色</button></span>`
}

export function renderColorEditor(editor, color) {
  editor.querySelector('[data-prts-color-sample]').style.background = color
  const hex = editor.querySelector('[data-prts-color-hex]')
  hex.value = color.toUpperCase()
  hex.removeAttribute('aria-invalid')
  editor.querySelector('[data-prts-color-apply]').disabled = false
  const channels = [1, 3, 5].map(start => parseInt(color.slice(start, start + 2), 16))
  for (const slider of editor.querySelectorAll('[data-prts-color-channel-index]')) {
    const index = Number(slider.dataset.prtsColorChannelIndex)
    slider.value = channels[index]
    slider.nextElementSibling.value = channels[index]
    const start = [...channels], end = [...channels]
    start[index] = 0
    end[index] = 255
    slider.style.background = 'linear-gradient(to right,rgb(' + start.join(',') + '),rgb(' + end.join(',') + '))'
  }
}
