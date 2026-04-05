<template>
  <div class="input-panel">
    <div class="flex items-center justify-between px-1">
      <p class="text-[0.9rem] text-[#486170]">
        {{ selectionLabel }}
      </p>
    </div>

    <div class="grid grid-cols-9 gap-2">
      <button
        v-for="value in keypadNumbers"
        :key="value"
        type="button"
        class="keypad-button"
        :disabled="disabled"
        @click="$emit('input', value)"
      >
        {{ value }}
      </button>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button
        type="button"
        class="quick-action-button quick-action-neutral"
        :disabled="disabled"
        @click="$emit('clear')"
      >
        <Icon type="undo" size="sm" />
        <span>撤销</span>
      </button>

      <button
        type="button"
        class="quick-action-button quick-action-hint"
        :disabled="disabled"
        @click="$emit('hint')"
      >
        <Icon type="hint" size="sm" />
        <span>提示</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/Icon.vue'
import type { GridPosition } from '@/types/sudoku'

const props = defineProps<{
  gridPosition: GridPosition | null
  disabled?: boolean
}>()

defineEmits<{
  (event: 'input', value: number): void
  (event: 'clear'): void
  (event: 'hint'): void
}>()

const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const selectionLabel = computed(() => {
  if (!props.gridPosition) {
    return '请选择一个可填写的格子'
  }

  const { rowIndex, colIndex } = props.gridPosition
  return `第 ${rowIndex + 1} 行，第 ${colIndex + 1} 列`
})
</script>
