function forEachTopLevelCharacter(source, visit) {
  let quote = ''
  let parentheses = 0
  let brackets = 0
  for (let index = 0; index < source.length; index++) {
    const character = source[index]
    if (character === '\\') {
      index++
      continue
    }
    if (quote) {
      if (character === quote) quote = ''
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      continue
    }
    if (character === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2)
      if (end < 0) return
      index = end + 1
      continue
    }
    if (character === '[') brackets++
    if (character === ']') brackets--
    if (character === '(') parentheses++
    if (character === ')') parentheses--
    if (!parentheses && !brackets) visit(character, index)
  }
}

function splitSelectorList(source) {
  const selectors = []
  let start = 0
  forEachTopLevelCharacter(source, (character, index) => {
    if (character !== ',') return
    selectors.push(source.slice(start, index).trim())
    start = index + 1
  })
  selectors.push(source.slice(start).trim())
  return selectors
}

function simpleSpecificity(selector) {
  if (selector.includes('\\')) return null
  let complex = false
  forEachTopLevelCharacter(selector, character => {
    if (/[\s>+~]/.test(character)) complex = true
  })
  if (complex) return null
  let attributes = 0
  let classes = 0
  const remaining = selector
    .replace(/\[(?:[^\]"']|"[^"]*"|'[^']*')*\]/g, () => {
      attributes++
      return ''
    })
    .replace(/\.[a-zA-Z_-][\w-]*/g, () => {
      classes++
      return ''
    })
  if (!/^(?:[a-zA-Z_][\w-]*|\*)?$/.test(remaining)) return null
  const types = remaining && remaining !== '*' ? 1 : 0
  return `${attributes + classes}:${types}`
}

function expandSubjectList(selector) {
  let subjectStart = 0
  forEachTopLevelCharacter(selector, (character, index) => {
    if (/[\s>+~]/.test(character)) subjectStart = index + 1
  })
  const subject = selector.slice(subjectStart)
  const match = subject.match(/^:is\((.*)\)(::before|::after)?$/s)
  if (!match) return [selector]
  const branches = splitSelectorList(match[1])
  if (branches.length < 2 || branches.length > 16 || branches.some(branch => !branch)) return [selector]
  const specificities = branches.map(simpleSpecificity)
  if (specificities.includes(null) || !specificities.every(value => value === specificities[0])) return [selector]
  const prefix = selector.slice(0, subjectStart)
  return branches.map(branch => prefix + branch + (match[2] ?? ''))
}

export function indexCssSelectors(source) {
  const edits = []
  let start = 0
  let opaqueDepth = 0
  forEachTopLevelCharacter(source, (character, index) => {
    if (opaqueDepth) {
      if (character === '{') opaqueDepth++
      if (character === '}') opaqueDepth--
      start = index + 1
      return
    }
    if (character === '{') {
      const header = source.slice(start, index)
      if (header.trim().startsWith('--')) opaqueDepth = 1
      if (!opaqueDepth && !header.trim().startsWith('@') && !header.includes('/*') && header.includes(':is(')) {
        const selectors = splitSelectorList(header)
        const expanded = selectors.flatMap(expandSubjectList)
        if (expanded.length > selectors.length) {
          const whitespace = header.match(/^\s*/)[0]
          const trailingWhitespace = header.match(/\s*$/)[0]
          edits.push({ start, end: index, value: whitespace + expanded.join(',') + trailingWhitespace })
        }
      }
      start = index + 1
    } else if (character === '}' || character === ';') {
      start = index + 1
    }
  })
  let output = source
  for (const edit of edits.reverse()) {
    output = output.slice(0, edit.start) + edit.value + output.slice(edit.end)
  }
  return output
}
