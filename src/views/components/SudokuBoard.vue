<template>
  <div class="board-shell">
    <div class="board-inner">
      <div
        v-for="(row, rowIndex) in matrix"
        :key="rowIndex"
        class="board-row"
      >
        <span
          v-for="(cell, colIndex) in row"
          :key="colIndex"
          :class="boardCellClass(rowIndex, colIndex, cell)"
          :style="boardCellStyle(rowIndex, colIndex)"
          data-board-cell="true"
          :data-row-index="rowIndex"
          :data-col-index="colIndex"
          @pointerdown="handleCellPointerDown(rowIndex, colIndex, $event)"
          @pointerenter="handleCellPointerEnter(rowIndex, colIndex)"
          @dragstart.prevent
          @click="handleGridClick(rowIndex, colIndex)"
        >
          {{ cell }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBoardDragSelection } from '@/composables/useBoardDragSelection'
import type { BooleanMatrix, GridPosition, NumberMatrix } from '@/types/sudoku'
import { getBoardCellClassList, getBoardCellStyle } from './board-cell'

const props = defineProps<{
  matrix: NumberMatrix
  cloneMatrix: NumberMatrix
  cheatMarks: BooleanMatrix
  matrixMarks: BooleanMatrix
  clearErrorMarks: boolean
  activeValue: number | null
  gridPosition: GridPosition | null
}>()

const emit = defineEmits<{
  (event: 'select-grid', value: GridPosition | null): void
  (event: 'set-active-value', value: number | null): void
}>()

const {
  clearDragSelection,
  consumeSuppressedClick,
  getDragBoxShadow,
  handleCellPointerDown,
  handleCellPointerEnter
} = useBoardDragSelection({
  onLongPressStart: () => emit('select-grid', null)
})

const boardCellClass = (rowIndex: number, colIndex: number, value: number) => getBoardCellClassList({
  rowIndex,
  colIndex,
  value,
  cloneMatrix: props.cloneMatrix,
  cheatMarks: props.cheatMarks,
  matrixMarks: props.matrixMarks,
  clearErrorMarks: props.clearErrorMarks,
  activeValue: props.activeValue,
  gridPosition: props.gridPosition
})

const boardCellStyle = (rowIndex: number, colIndex: number) => getBoardCellStyle({
  rowIndex,
  colIndex,
  gridPosition: props.gridPosition,
  dragBoxShadow: getDragBoxShadow(rowIndex, colIndex)
})

const handleGridClick = (rowIndex: number, colIndex: number) => {
  if (consumeSuppressedClick()) {
    return
  }

  clearDragSelection()
  const value = props.matrix[rowIndex][colIndex]
  const isHighlightedValue = Boolean(value) && props.activeValue === value

  if (props.cloneMatrix[rowIndex][colIndex]) {
    emit('select-grid', null)
    emit('set-active-value', isHighlightedValue ? null : value)
    return
  }

  const isSelected = props.gridPosition?.rowIndex === rowIndex && props.gridPosition?.colIndex === colIndex
  emit('set-active-value', isSelected && isHighlightedValue ? null : value)
  emit('select-grid', isSelected ? null : { rowIndex, colIndex })
}
</script>

<style scoped lang="less">
.board-shell {
  overflow: hidden;
  padding: 2px;
  border-radius: 1rem;
  background: #888;
  box-shadow: inset 0 0 0 1px rgba(136, 136, 136, 0.22);
}

.board-inner {
  position: relative;
  overflow: hidden;
  border-radius: calc(1rem - 2px);
  background: #fff;
}

.board-row {
  display: flex;
}

.board-cell {
  display: flex;
  flex: 1 1 0%;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  user-select: none;
  background: #fff;
  text-align: center;
  font-size: 16px;
  line-height: 1;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;

  &--border-top {
    border-top: 1px solid #888;
  }

  &--border-top-strong {
    border-top: 2px solid #888;
  }

  &--border-left {
    border-left: 1px solid #888;
  }

  &--border-left-strong {
    border-left: 2px solid #888;
  }

  &--corner-tl {
    border-top-left-radius: 0.95rem;
  }

  &--corner-tr {
    border-top-right-radius: 0.95rem;
  }

  &--corner-bl {
    border-bottom-left-radius: 0.95rem;
  }

  &--corner-br {
    border-bottom-right-radius: 0.95rem;
  }

  &--fixed {
    background: #f1f1f1;
  }

  &--highlight-fixed {
    background: #e8f1c8 !important;
  }

  &--highlight-editable {
    background: #bfe8b8 !important;
  }

  &--cheat {
    color: #c53b4c;
    font-weight: 600;
  }

  &--selected {
    background: #ffe59a !important;
  }

  &--empty {
    color: transparent;
  }

  &--error {
    background: lightpink !important;
  }
}
</style>
