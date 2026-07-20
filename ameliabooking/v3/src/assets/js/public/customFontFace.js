const CUSTOM_FONT_FACE_STYLE_ID = 'amCustomFont'

/**
 * Injects a single @font-face rule into document head when Amelia uses an uploaded custom font.
 * Removes any previous node with the same id (legacy behavior).
 *
 * @param {{ customFontSelected?: boolean, fontFamily?: string, fontUrl?: string }|null|undefined} fonts
 */
export function applyCustomFontFaceIfSelected(fonts) {
  if (!fonts || !fonts.customFontSelected) {
    return
  }

  if (!fonts.fontFamily || !fonts.fontUrl) {
    return
  }

  const head = document.head || document.getElementsByTagName('head')[0]
  const existing = head.querySelector(`#${CUSTOM_FONT_FACE_STYLE_ID}`)
  if (existing) {
    existing.remove()
  }

  const safeFontFamily = String(fonts.fontFamily).replace(/['\\\n\r]/g, '\\$&')
  const safeFontUrl = String(fonts.fontUrl).replace(/["\\)\n\r]/g, '\\$&')
  const css = `@font-face { font-family: '${safeFontFamily}'; src: url("${safeFontUrl}"); }`
  const style = document.createElement('style')
  head.appendChild(style)
  style.setAttribute('type', 'text/css')
  style.setAttribute('id', CUSTOM_FONT_FACE_STYLE_ID)
  style.appendChild(document.createTextNode(css))
}
