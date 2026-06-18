<template>
  <div
    class="am-gc"
    :style="cssVars"
    role="region"
    aria-roledescription="carousel"
    :aria-label="carouselLabel"
    tabindex="0"
    @keydown.left.prevent="previousImage"
    @keydown.right.prevent="nextImage"
  >
    <div
      v-if="gallery.length > 1"
      class="am-gc__arrows"
    >
      <button
        type="button"
        class="am-gc__arrow am-icon-arrow-left"
        :aria-label="carouselPreviousLabel"
        @click="previousImage"
      ></button>
      <button
        type="button"
        class="am-gc__arrow am-icon-arrow-right"
        :aria-label="carouselNextLabel"
        @click="nextImage"
      ></button>
    </div>

    <div
      v-for="(img, index) in gallery"
      :key="index"
      class="am-gc__display"
      :style="{display: index === activeImage ? 'flex': 'none', backgroundImage: `url(${img.pictureFullPath})`}"
      role="group"
      aria-roledescription="slide"
      :aria-hidden="index !== activeImage"
      :aria-label="getSlideLabel(index, img)"
    ></div>

    <div
      class="am-gc__bullets"
      role="tablist"
      :aria-label="carouselNavigationLabel"
    >
      <button
        v-for="(img, index) in gallery"
        :key="index"
        class="am-gc__bullets-item"
        :class="{'am-active': index === activeImage}"
        type="button"
        role="tab"
        :aria-selected="index === activeImage"
        :tabindex="index === activeImage ? 0 : -1"
        :aria-label="getBulletLabel(index, img)"
        @click="goToImage(index)"
      ></button>
    </div>

    <span
      class="am-gc__sr-only"
      aria-live="polite"
      aria-atomic="true"
    >{{ activeSlideAnnouncement }}</span>
  </div>
</template>

<script setup>
// * Import from Vue
import {
  ref,
  inject,
  computed
} from "vue";

// * Comosables
import { useColorTransparency } from '../../../../../assets/js/common/colorManipulation.js'

const props = defineProps({
  gallery: {
    type: Array,
    required: true
  }
})

const activeImage = ref(0)

const labels = inject('labels', {})

const carouselLabel = computed(() => labels.event_image_gallery || 'Event image gallery')
const carouselPreviousLabel = computed(() => labels.previous_image || 'Previous image')
const carouselNextLabel = computed(() => labels.next_image || 'Next image')
const carouselNavigationLabel = computed(() => labels.image_navigation || 'Image navigation')

const normalizeIndex = (index) => {
  if (!props.gallery.length) {
    return 0
  }

  return (index + props.gallery.length) % props.gallery.length
}

const previousImage = () => {
  activeImage.value = normalizeIndex(activeImage.value - 1)
}

const nextImage = () => {
  activeImage.value = normalizeIndex(activeImage.value + 1)
}

const goToImage = (index) => {
  activeImage.value = normalizeIndex(index)
}

const getImageText = (img, index) => {
  return img?.title || img?.name || img?.alt || `${labels.image || 'Image'} ${index + 1}`
}

const getSlideLabel = (index, img) => {
  return `${getImageText(img, index)} (${index + 1} ${labels.of || 'of'} ${props.gallery.length})`
}

const getBulletLabel = (index, img) => {
  return `${labels.show || 'Show'} ${getSlideLabel(index, img)}`
}

const activeSlideAnnouncement = computed(() => {
  if (!props.gallery.length) {
    return ''
  }

  return getSlideLabel(activeImage.value, props.gallery[activeImage.value])
})

// * Colors
const amColors = inject('amColors')

// * Css Vars
const cssVars = computed(() => {
  return {
    '--am-c-gc-bgr': amColors.value.colorMainBgr,
    '--am-c-gc-bgr-op70': useColorTransparency(amColors.value.colorMainBgr, 0.7),
    '--am-c-gc-text': amColors.value.colorMainText,
    '--am-c-gc-text-op20': useColorTransparency(amColors.value.colorMainText, 0.2),
    '--am-c-gc-text-op10': useColorTransparency(amColors.value.colorMainText, 0.1),
  }
})
</script>

<script>
export default {
  name: "GalleryCarousel"
}
</script>

<style lang="scss">
@mixin gallery-carousel {
  // am - amelia
  // gc - gallery carousel
  .am-gc {
    position: relative;

    &:focus-visible {
      outline: 2px solid var(--am-c-gc-text);
      outline-offset: 2px;
    }

    &__arrows {
      display: flex;
      justify-content: space-between;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;

      button {
        position: absolute;
        width: 60px;
        height: 100%;
        font-size: 38px;
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 0;

        &[class*="am-icon"] {
          flex: 0 0 auto;
          font-size: 28px;
        }

        &::before {
          color: var(--am-c-gc-text);
          background: var(--am-c-gc-bgr);
          border: 1px solid var(--am-c-gc-text-op20);
          box-shadow: 0px 1px 3px var(--am-c-gc-text-op10);
          border-radius: 6px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        &:focus-visible::before {
          outline: 2px solid var(--am-c-gc-text);
          outline-offset: 2px;
        }

        &:first-child {
          left: 0;
        }

        &:last-child {
          right: 0;
        }
      }
    }

    &__display {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      background-size: auto 100%;
      background-repeat: no-repeat;
      background-position: center;
      border-radius: 6px;
    }

    &__bullets {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;

      &-item {
        display: inline-flex;
        width: 8px;
        height: 8px;
        background-color: var(--am-c-gc-bgr-op70);
        border-radius: 50%;
        cursor: pointer;
        margin: 4px;
        border: none;
        padding: 0;

        &:focus-visible {
          outline: 2px solid var(--am-c-gc-text);
          outline-offset: 2px;
        }

        &.am-active {
          width: 16px;
          height: 16px;
          background-color: var(--am-c-gc-bgr);
        }
      }
    }

    &__sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  }
}

// Public
.amelia-v2-booking #amelia-container {
  @include gallery-carousel;
}

// Admin
#amelia-app-backend-new {
  @include gallery-carousel;
}
</style>
