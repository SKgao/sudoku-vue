<template>
  <main class="app-shell">
    <header
      class="mb-2 bg-[steelblue] px-[5%] py-4 text-white shadow-[0_0.2rem_0.3rem_rgba(48,48,48,0.4)]"
    >
      <h1 class="text-[2rem] leading-none font-normal">{{ store.title }}</h1>
    </header>

    <section class="page-card pb-8">
      <div class="relative">
        <div class="absolute inset-x-0 -top-3 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)] blur-xl" />

        <div class="mb-2.5 flex items-center justify-center gap-2">
          <span class="text-[0.84rem] font-bold tracking-[0.08em] text-[#5f7486]">游戏难度</span>
          <AppRadioGroup
            label="游戏难度"
            :model-value="store.difficulty"
            :options="store.difficultyOptions"
            @update:model-value="handleDifficultyChange"
          />
        </div>

        <div
          class="relative rounded-[1.35rem] bg-white/60 p-3 shadow-[0_0.8rem_2rem_rgba(36,51,66,0.12)] ring-1 ring-white/65 backdrop-blur-sm"
        >
          <div
            class="overflow-hidden rounded-[1rem] bg-[#888] p-[2px] shadow-[inset_0_0_0_1px_rgba(136,136,136,0.22)]"
          >
            <div class="relative overflow-hidden rounded-[calc(1rem-2px)] bg-white">
              <div
                v-for="(row, i) in store.matrix"
                :key="i"
                class="board-row"
              >
                <span
                  v-for="(col, j) in row"
                  :key="j"
                  :class="boardCellClass(i, j, col)"
                  :style="boardCellStyle(i, j)"
                  data-board-cell="true"
                  :data-row-index="i"
                  :data-col-index="j"
                  @pointerdown="handleCellPointerDown(i, j, $event)"
                  @pointerenter="handleCellPointerEnter(i, j)"
                  @dragstart.prevent
                  @click="handleGridClick(i, j)"
                >
                  {{ col }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 space-y-3">
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
                class="aspect-square rounded-[0.9rem] border border-white/65 bg-[steelblue] text-[1.15rem] font-semibold text-white shadow-[0_0.45rem_1.2rem_rgba(70,115,153,0.22)] transition-all duration-150 enabled:hover:-translate-y-[1px] enabled:hover:bg-[#5a8ab6] disabled:cursor-not-allowed disabled:bg-[#9eb8cc] disabled:text-white/70"
                :disabled="!store.gridPosition"
                @click="handleModifyGrid(value)"
              >
                {{ value }}
              </button>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="flex items-center justify-center gap-1.5 rounded-[0.82rem] border border-[#d8e2ea] bg-white/80 px-3.5 py-2.5 text-[0.92rem] font-semibold text-[#486170] transition-colors duration-150 enabled:hover:bg-white disabled:cursor-not-allowed disabled:bg-white/55 disabled:text-[#8da0ae]"
                :disabled="!store.gridPosition"
                @click="handleClearCurrentGrid"
              >
                <Icon type="undo" size="sm" />
                <span>撤销</span>
              </button>

              <button
                type="button"
                class="flex items-center justify-center gap-1.5 rounded-[0.82rem] border border-[#c9d8e5] bg-[#eef5fb] px-3.5 py-2.5 text-[0.92rem] font-semibold text-[steelblue] transition-colors duration-150 enabled:hover:bg-[#e5f0f9] disabled:cursor-not-allowed disabled:bg-[#eef5fb]/70 disabled:text-[#8da0ae]"
                :disabled="!store.gridPosition"
                @click="handleCheatCurrentGrid"
              >
                <Icon type="hint" size="sm" />
                <span>提示</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer
      class="sticky bottom-0 mt-auto w-full bg-[steelblue] shadow-[0_-0.2rem_0.35rem_rgba(48,48,48,0.28)]"
    >
      <div
        class="grid w-full grid-cols-4 gap-2 border-t border-white/20 bg-[steelblue] p-2"
      >
        <AppActionButton
          v-for="item in store.buttons"
          :key="item.key"
          :variant="item.variant"
          @click="store.handleGame(item.key)"
        >
          {{ item.text }}
        </AppActionButton>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppActionButton from '@/components/AppActionButton.vue'
import AppRadioGroup from '@/components/AppRadioGroup.vue'
import Icon from '@/components/Icon.vue'
import { useBoardDragSelection } from '@/composables/useBoardDragSelection'
import { useMainStore } from '@/stores/main'
import type { GameDifficulty } from '@/types/sudoku'

const store = useMainStore()
const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const {
  clearDragSelection,
  consumeSuppressedClick,
  getDragBoxShadow,
  handleCellPointerDown,
  handleCellPointerEnter
} = useBoardDragSelection({
  onLongPressStart: () => store.clickGrid(null)
})

const selectionLabel = computed(() => {
  if (!store.gridPosition) {
    return '请选择一个可填写的格子'
  }

  const { rowIndex, colIndex } = store.gridPosition
  return `第 ${rowIndex + 1} 行，第 ${colIndex + 1} 列`
})

const handleDifficultyChange = (difficulty: string) => {
  store.changeDifficulty(difficulty as GameDifficulty)
}

const boardCellClass = (rowIndex: number, colIndex: number, value: number) => [
  'board-cell',
  'select-none',
  rowIndex === 0 ? '' : rowIndex % 3 === 0 ? 'border-t-2' : 'border-t',
  colIndex === 0 ? '' : colIndex % 3 === 0 ? 'border-l-2' : 'border-l',
  'border-solid border-[#888]',
  rowIndex === 0 && colIndex === 0 ? 'rounded-tl-[0.95rem]' : '',
  rowIndex === 0 && colIndex === 8 ? 'rounded-tr-[0.95rem]' : '',
  rowIndex === 8 && colIndex === 0 ? 'rounded-bl-[0.95rem]' : '',
  rowIndex === 8 && colIndex === 8 ? 'rounded-br-[0.95rem]' : '',
  store.cloneMatrix[rowIndex][colIndex] ? 'bg-[#f1f1f1]' : 'bg-white',
  value && store.activeValue === value
    ? store.cloneMatrix[rowIndex][colIndex]
      ? '!bg-[#e8f1c8]'
      : '!bg-[#bfe8b8]'
    : '',
  store.cheatMarks[rowIndex][colIndex] && value ? 'text-[#c53b4c] font-semibold' : '',
  store.gridPosition?.rowIndex === rowIndex && store.gridPosition?.colIndex === colIndex
    ? '!bg-[#ffe59a]'
    : '',
  !value ? 'text-transparent' : '',
  (!store.matrixMarks[rowIndex][colIndex] || !value) && !store.clearErrorMarks ? '!bg-[lightpink]' : ''
]

const boardCellStyle = (rowIndex: number, colIndex: number) => {
  const shadows: string[] = []
  const isFocusedCell = store.gridPosition?.rowIndex === rowIndex && store.gridPosition?.colIndex === colIndex

  if (isFocusedCell) {
    shadows.push('inset 0 0 0 2px #d18c1d')
  }

  const dragBoxShadow = getDragBoxShadow(rowIndex, colIndex)

  if (dragBoxShadow) {
    shadows.push(dragBoxShadow)
  }

  return shadows.length ? { boxShadow: shadows.join(', ') } : undefined
}

const handleGridClick = (rowIndex: number, colIndex: number) => {
  if (consumeSuppressedClick()) {
    return
  }

  clearDragSelection()
  const value = store.matrix[rowIndex][colIndex]
  const isHighlightedValue = Boolean(value) && store.activeValue === value

  if (store.cloneMatrix[rowIndex][colIndex]) {
    store.clickGrid(null)
    store.setActiveValue(isHighlightedValue ? null : value)
    return
  }

  const isSelected = store.gridPosition?.rowIndex === rowIndex && store.gridPosition?.colIndex === colIndex
  store.setActiveValue(isSelected && isHighlightedValue ? null : value)
  store.clickGrid(isSelected ? null : { rowIndex, colIndex })
}

const handleModifyGrid = (value: number) => {
  store.modifyGrid(value)
}

const handleCheatCurrentGrid = () => {
  store.cheatCurrentGrid()
}

const handleClearCurrentGrid = () => {
  store.clearCurrentGrid()
}
</script>
