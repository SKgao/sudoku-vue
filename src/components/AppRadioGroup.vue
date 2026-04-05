<template>
  <div
    class="inline-flex items-center gap-1 rounded-full border border-white/65 bg-white/75 p-1 shadow-[0_0.55rem_1.2rem_rgba(36,51,66,0.08)] backdrop-blur-sm"
    role="radiogroup"
    :aria-label="label"
  >
    <button
      v-for="item in options"
      :key="item.key"
      type="button"
      role="radio"
      :aria-checked="modelValue === item.key"
      class="rounded-full px-3 py-1.5 text-[0.84rem] font-semibold transition-all duration-150"
      :class="modelValue === item.key
        ? 'bg-[steelblue] text-white shadow-[0_0.35rem_0.85rem_rgba(70,115,153,0.18)]'
        : 'text-[#547080] hover:bg-white/90'"
      @click="$emit('update:modelValue', item.key)"
    >
      {{ item.text }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface RadioOption {
  key: string
  text: string
}

defineProps<{
  label: string
  modelValue: string
  options: RadioOption[]
}>()

defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()
</script>
