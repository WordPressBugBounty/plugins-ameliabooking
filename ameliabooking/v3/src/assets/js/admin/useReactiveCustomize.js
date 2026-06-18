import { ref, computed, shallowRef, watch } from 'vue'

// Global tracker for window.v3 changes - shared across all components
let globalWindowV3Tracker = null
let isGlobalTriggerSetup = false

/**
 * Composable for reactive amCustomize that works with both window.v3 and inject
 * This handles the reactivity bridge between host app (redesign) and V3 components
 *
 * This ensures that amCustomize will react to changes made by the host app (redesign)
 * when window.triggerV3Reactivity() is called.
 *
 * @returns {Object} - Object containing reactive amCustomize computed ref
 */
export function useReactiveCustomize() {
  // Initialize global tracker if not already done
  if (!globalWindowV3Tracker) {
    globalWindowV3Tracker = ref(0)
  }

  // Set up global trigger function once
  if (!isGlobalTriggerSetup && typeof window !== 'undefined') {
    window.triggerV3Reactivity = () => {
      if (globalWindowV3Tracker) {
        globalWindowV3Tracker.value++
      }
    }
    isGlobalTriggerSetup = true
  }

  // Create reactive amCustomize that responds to both Vue reactivity and manual triggers
  //
  // WHY shallowRef + two-level spread instead of computed:
  //   computed(() => window.v3?.customize?.value) returns the SAME object reference every
  //   time the tracker fires (because Pinia mutates in-place). Newer Vue 3 versions cache
  //   computed results by reference equality, so dependents never see "a change" and
  //   templates never re-render.
  //
  //   By spreading two levels deep we guarantee:
  //     • amCustomize.value itself  → new object (shallowRef detects change)
  //     • amCustomize.value[pageRenderKey] → new object (downstream computed sees change)
  //   The spread reads current (post-mutation) property values from the Pinia reactive
  //   proxy, so all nested scalars (e.g. `required`, `visibility`) reflect the update.
  const amCustomize = shallowRef(null)
  watch(
    globalWindowV3Tracker,
    () => {
      if (typeof window === 'undefined') {
        amCustomize.value = null
        return
      }

      const raw = window.v3?.customize?.value
      if (!raw) {
        amCustomize.value = null
        return
      }
      // Two-level spread: top-level keys get new objects, so every consumer that holds a
      // reference to amCustomize.value[someKey] sees a changed value on next access.
      amCustomize.value = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? [...v] : (v && typeof v === 'object' ? { ...v } : v)])
      )
    },
    { immediate: true }
  )

  const stepIndex = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.stepIndex !== undefined ? window.v3.stepIndex.value : 0
  })

  const stepName = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.stepName !== undefined ? window.v3.stepName.value : ''
  })

  const amTranslations = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.translations?.value
  })

  const flowLayout = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.flowLayout?.value
  })

  const subStepName = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.subStepName !== undefined ? window.v3.subStepName.value : ''
  })

  const bookableType = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.bookableType !== undefined ? window.v3.bookableType.value : ''
  })

  const langKey = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.langKey !== undefined ? window.v3.langKey.value : ''
  })

  const pagesType = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.pagesType !== undefined ? window.v3.pagesType.value : ''
  })

  const features = computed(() => {
    globalWindowV3Tracker.value
    return window.v3?.features !== undefined ? window.v3.features.value : {}
  })

  return {
    amCustomize,
    stepIndex,
    stepName,
    amTranslations,
    flowLayout,
    subStepName,
    bookableType,
    langKey,
    pagesType,
    features,
    globalWindowV3Tracker, // Expose tracker for triggering reactivity
  }
}
