const DEFAULT_FONT_LINK_ID = 'amDefaultFontImport'

const FONTS_PATH = 'v3/src/assets/scss/common/fonts/'

/**
 * Primary family of the CSS font stack => stylesheet holding only that family's @font-face rules.
 * Mirrors FAMILY_STYLESHEETS in src/Infrastructure/WP/Fonts/AmeliaFontsService.php - keep both in
 * sync with the `fontOptions` list in redesign CustomizeBasic.vue.
 */
const FAMILY_STYLESHEETS = {
  'amelia roboto': 'font-roboto.css',
  'amelia lato': 'font-lato.css',
  'amelia merriweather': 'font-merriweather.css',
  'amelia montserrat': 'font-montserrat.css',
  'amelia mulish': 'font-mulish.css',
  'amelia nunito': 'font-nunito.css',
  'amelia asap condensed': 'font-asap-condensed.css',
  'amelia open sans': 'font-open-sans.css',
  'amelia barlow': 'font-barlow.css',
  'amelia oswald': 'font-oswald.css',
  'amelia bitter': 'font-bitter.css',
  'amelia poppins': 'font-poppins.css',
  'amelia carme': 'font-carme.css',
}

const FALLBACK_STYLESHEET = FAMILY_STYLESHEETS['amelia roboto']

/**
 * Resolve a CSS font stack such as `Amelia Open Sans, sans-serif` to its single-family stylesheet.
 *
 * @param {string|null|undefined} fontFamily
 *
 * @returns {string}
 */
export function getDefaultFontStylesheet(fontFamily) {
  const primaryFamily = String(fontFamily || '')
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .toLowerCase()

  return FAMILY_STYLESHEETS[primaryFamily] || FALLBACK_STYLESHEET
}

/**
 * Point the single default-font <link> at the selected family, creating it on first call.
 *
 * The public forms get this stylesheet enqueued by PHP instead - only the Customize preview needs
 * to swap it at runtime, because the admin changes the family without reloading the page.
 *
 * @param {string} baseUrl   Plugin URL, as `baseUrls.wpAmeliaPluginURL`
 * @param {string} fontFamily
 *
 * @returns {void}
 */
export function importDefaultFonts(baseUrl, fontFamily) {
  const head = document.head || document.getElementsByTagName('head')[0]
  const href = `${baseUrl}${FONTS_PATH}${getDefaultFontStylesheet(fontFamily)}`

  let link = head.querySelector(`#${DEFAULT_FONT_LINK_ID}`)

  if (link) {
    // Same family re-selected - leave the loaded stylesheet alone.
    if (link.getAttribute('href') !== href) {
      link.setAttribute('href', href)
    }

    return
  }

  link = document.createElement('link')
  link.setAttribute('id', DEFAULT_FONT_LINK_ID)
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('media', 'all')
  link.setAttribute('href', href)
  head.appendChild(link)
}

/**
 * Drop the default-font <link>, used when the site switches to an uploaded custom font.
 *
 * @returns {void}
 */
export function removeDefaultFonts() {
  const head = document.head || document.getElementsByTagName('head')[0]
  const link = head.querySelector(`#${DEFAULT_FONT_LINK_ID}`)

  if (link) {
    link.remove()
  }
}
