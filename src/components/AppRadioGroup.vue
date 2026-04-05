<template>
  <div
    class="radio-group-shell"
    role="radiogroup"
    :aria-label="label"
  >
    <button
      v-for="(item, index) in options"
      :key="item.key"
      :ref="(element) => setOptionRef(element, index)"
      type="button"
      role="radio"
      :tabindex="getTabIndex(item.key)"
      :aria-checked="modelValue === item.key"
      class="radio-option"
      :class="modelValue === item.key
        ? 'bg-[steelblue] text-white shadow-[0_0.35rem_0.85rem_rgba(70,115,153,0.18)]'
        : 'text-[#547080] hover:bg-white/90'"
      @click="selectOptionByKey(item.key)"
      @keydown="handleKeydown(item.key, $event)"
    >
      {{ item.text }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

interface RadioOption {
  key: string
  text: string
}

const props = defineProps<{
  label: string
  modelValue: string
  options: RadioOption[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const optionRefs = ref<Array<HTMLButtonElement | null>>([])

const activeIndex = computed(() => {
  const matchedIndex = props.options.findIndex((option) => option.key === props.modelValue)
  return matchedIndex >= 0 ? matchedIndex : 0
})

const setOptionRef = (element: Element | null, index: number) => {
  optionRefs.value[index] = element instanceof HTMLButtonElement ? element : null
}

const getTabIndex = (key: string) => {
  if (!props.options.length) {
    return -1
  }

  return props.options[activeIndex.value]?.key === key ? 0 : -1
}

const focusOptionAt = (index: number) => {
  nextTick(() => {
    optionRefs.value[index]?.focus()
  })
}

const selectOptionAt = (index: number, shouldFocus = true) => {
  if (!props.options.length) {
    return
  }

  const normalizedIndex = (index + props.options.length) % props.options.length
  emit('update:modelValue', props.options[normalizedIndex].key)

  if (shouldFocus) {
    focusOptionAt(normalizedIndex)
  }
}

const selectOptionByKey = (key: string, shouldFocus = false) => {
  const index = props.options.findIndex((option) => option.key === key)

  if (index < 0) {
    return
  }

  selectOptionAt(index, shouldFocus)
}

const handleKeydown = (key: string, event: KeyboardEvent) => {
  const currentIndex = props.options.findIndex((option) => option.key === key)

  if (currentIndex < 0) {
    return
  }

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      selectOptionAt(currentIndex + 1)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      selectOptionAt(currentIndex - 1)
      break
    case 'Home':
      event.preventDefault()
      selectOptionAt(0)
      break
    case 'End':
      event.preventDefault()
      selectOptionAt(props.options.length - 1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectOptionByKey(key, true)
      break
    default:
      break
  }
}
</script>
