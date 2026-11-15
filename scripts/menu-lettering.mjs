import { readFileSync } from 'node:fs'

const lettering = Object.freeze(Object.fromEntries(['rail', 'header', 'captions'].map(name => [
  name, readFileSync(new URL(`../src/assets/menu-lettering/${name}.svg`, import.meta.url), 'utf8').trim(),
])))

export function createMenuLettering() {
  return { ...lettering }
}

export function applyMenuLettering(css) {
  for (const [name, image] of Object.entries(createMenuLettering())) {
    const token = `__PRTS_MENU_${name.toUpperCase()}__`
    if (!css.includes(token)) throw new Error(`Missing menu lettering token: ${token}`)
    const encoded = image.replaceAll('%', '%25').replaceAll('#', '%23').replaceAll('<', '%3C').replaceAll('>', '%3E')
    css = css.replaceAll(token, encoded)
  }
  return css
}
