<template>
  <svg
    v-bind="attrs"
    class="inline-flex shrink-0 align-middle leading-none fill-none"
    :class="sizeClass"
    :role="accessibleLabel ? 'img' : undefined"
    :aria-hidden="accessibleLabel ? undefined : 'true'"
    :aria-label="accessibleLabel ?? undefined"
    :title="props.title ?? undefined"
    :style="sizeStyle"
    viewBox="0 0 24 24"
    fill="none"
  >
    <title v-if="props.title">{{ props.title }}</title>
    <use :href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

type IconPresetSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type IconSize = IconPresetSize | number | `${number}` | `${number}px` | `${number}rem`

defineOptions({
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    type: string
    size?: IconSize
    title?: string
    label?: string
    prefix?: string
  }>(),
  {
    size: 'md',
    prefix: 'icon'
  }
)

const attrs = useAttrs()

const presetSizeMap: Record<IconPresetSize, string> = {
  xs: '0.875rem',
  sm: '1rem',
  md: '1.05rem',
  lg: '1.25rem',
  xl: '1.5rem'
}

const accessibleLabel = computed(() => props.label ?? props.title ?? null)
const symbolId = computed(() => `#${props.prefix}-${props.type}`)

const normalizedSize = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}px`
  }

  if (props.size in presetSizeMap) {
    return presetSizeMap[props.size as IconPresetSize]
  }

  return /^\d+$/.test(props.size) ? `${props.size}px` : props.size
})

const sizeClass = computed(() => 'h-auto w-auto')
const sizeStyle = computed(() => ({
  width: normalizedSize.value,
  height: normalizedSize.value
}))
</script>

<style scoped>
svg {
  overflow: visible;
}
</style>
