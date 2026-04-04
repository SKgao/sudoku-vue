<template>
  <button
    type="button"
    class="group relative flex min-h-[2.5rem] w-full items-center justify-center overflow-hidden rounded-[1.15rem] border px-3 py-2 text-center transition duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
    :class="buttonClass"
  >
    <div
      class="absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-100"
      :class="glowClass"
    />

    <span class="relative text-[1rem] leading-none font-semibold tracking-[0.04em]" :class="labelClass">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ActionButtonVariant } from '@/types/sudoku'

const props = withDefaults(
  defineProps<{
    variant?: ActionButtonVariant
  }>(),
  {
    variant: 'neutral'
  }
)

const variantMap = {
  primary: {
    button:
      'border-[#24425b]/10 bg-[linear-gradient(180deg,rgba(36,66,91,0.96),rgba(26,44,61,0.98))] shadow-[0_0.85rem_1.8rem_rgba(36,51,66,0.18)] hover:-translate-y-[1px]',
    glow: 'bg-[radial-gradient(circle_at_top,rgba(151,209,247,0.28),transparent_60%)]',
    label: 'text-white'
  },
  neutral: {
    button:
      'border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,247,250,0.96))] shadow-[0_0.7rem_1.4rem_rgba(36,51,66,0.08)] hover:-translate-y-[1px]',
    glow: 'bg-[radial-gradient(circle_at_top,rgba(123,183,228,0.18),transparent_62%)]',
    label: 'text-[#243342]'
  },
  subtle: {
    button:
      'border-white/65 bg-[linear-gradient(180deg,rgba(248,251,253,0.95),rgba(239,245,249,0.92))] shadow-[0_0.65rem_1.3rem_rgba(36,51,66,0.06)] hover:-translate-y-[1px]',
    glow: 'bg-[radial-gradient(circle_at_top,rgba(111,126,139,0.14),transparent_62%)]',
    label: 'text-[#40515f]'
  },
  warning: {
    button:
      'border-[#e7c778]/55 bg-[linear-gradient(180deg,rgba(255,248,231,0.98),rgba(250,236,193,0.94))] shadow-[0_0.8rem_1.6rem_rgba(181,128,20,0.12)] hover:-translate-y-[1px]',
    glow: 'bg-[radial-gradient(circle_at_top,rgba(233,190,77,0.22),transparent_62%)]',
    label: 'text-[#6d4c09]'
  },
  danger: {
    button:
      'border-[#f1c2c7]/70 bg-[linear-gradient(180deg,rgba(255,245,246,0.98),rgba(253,230,233,0.95))] shadow-[0_0.8rem_1.6rem_rgba(179,58,72,0.12)] hover:-translate-y-[1px]',
    glow: 'bg-[radial-gradient(circle_at_top,rgba(214,40,57,0.16),transparent_62%)]',
    label: 'text-[#7f2632]'
  }
} as const

const currentVariant = computed(() => variantMap[props.variant])
const buttonClass = computed(() => currentVariant.value.button)
const glowClass = computed(() => currentVariant.value.glow)
const labelClass = computed(() => currentVariant.value.label)
</script>
