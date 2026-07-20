import { computed, unref } from 'vue'
import { useColorTransparency } from '../common/colorManipulation'

/**
 * Shared CSS custom properties for event list / calendar / WPA landing containers
 * and EventBookingDialog.
 *
 * @param {import('vue').ComputedRef<object>|import('vue').Ref<object>} amColors
 * @param {import('vue').Ref<object>} amFonts
 * @param {import('vue').Ref<number>} dynamicVh
 */
export function eventFormCssVars(amColors, amFonts, dynamicVh) {
  return computed(() => {
    const c = unref(amColors)
    const f = unref(amFonts)
    const vh = unref(dynamicVh)

    return {
      '--am-c-primary': c.colorPrimary,
      '--am-c-success': c.colorSuccess,
      '--am-c-error': c.colorError,
      '--am-c-warning': c.colorWarning,
      '--am-c-main-bgr': c.colorMainBgr,
      '--am-c-main-heading-text': c.colorMainHeadingText,
      '--am-c-main-text': c.colorMainText,
      '--am-c-main-text-op15': useColorTransparency(c.colorMainText, 0.15),
      '--am-c-sb-bgr': c.colorSbBgr,
      '--am-c-sb-text': c.colorSbText,
      '--am-c-inp-bgr': c.colorInpBgr,
      '--am-c-inp-border': c.colorInpBorder,
      '--am-c-inp-text': c.colorInpText,
      '--am-c-inp-placeholder': c.colorInpPlaceHolder,
      '--am-c-drop-bgr': c.colorDropBgr,
      '--am-c-drop-text': c.colorDropText,
      '--am-c-card-bgr': c.colorCardBgr,
      '--am-c-card-text': c.colorCardText,
      '--am-c-card-border': c.colorCardBorder,
      '--am-c-btn-prim': c.colorBtnPrim,
      '--am-c-btn-prim-text': c.colorBtnPrimText,
      '--am-c-btn-sec': c.colorBtnSec,
      '--am-c-btn-sec-text': c.colorBtnSecText,
      '--am-c-skeleton-op20': useColorTransparency(c.colorMainText, 0.2),
      '--am-c-skeleton-op60': useColorTransparency(c.colorMainText, 0.6),
      '--am-font-family': f.fontFamily,
      '--am-dvh': vh ? `${vh}px` : '100dvh',
      '--am-mw-main': '792px',
      '--am-hd-main': '652px',
      '--am-c-scroll-op30': useColorTransparency(c.colorPrimary, 0.3),
      '--am-c-scroll-op10': useColorTransparency(c.colorPrimary, 0.1),
      '--am-rad-inp': '6px',
      '--am-mb-dialog': '300px',
    }
  })
}
