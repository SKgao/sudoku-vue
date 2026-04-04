<template>
  <main class="app-shell">
    <header
      class="mb-8 bg-[steelblue] px-[5%] py-4 text-white shadow-[0_0.2rem_0.3rem_rgba(48,48,48,0.4)]"
    >
      <p class="mb-2 text-[0.75rem] uppercase tracking-[0.36em] text-white/70">Sudoku Vue</p>
      <h1 class="text-[2rem] leading-none font-normal">{{ store.title }}</h1>
    </header>

    <section class="page-card pb-8">
      <div class="relative">
        <div class="absolute inset-x-0 -top-3 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)] blur-xl" />

        <div
          class="relative rounded-[1.35rem] bg-white/60 p-3 shadow-[0_0.8rem_2rem_rgba(36,51,66,0.12)] ring-1 ring-white/65 backdrop-blur-sm"
        >
          <div
            ref="boardRef"
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
                  @click="handleGridClick(i, j)"
                >
                  {{ col }}
                </span>
              </div>
              <div
                v-show="store.popShow"
                class="popup-shell"
                :style="popupStyle"
              >
                <div class="overflow-hidden rounded-[0.85rem] bg-white/90 p-[1px] shadow-[0_0.8rem_1.8rem_rgba(36,51,66,0.22)] ring-1 ring-white/55 backdrop-blur-sm">
                  <div class="overflow-hidden rounded-[calc(0.85rem-1px)] bg-[steelblue]">
                    <div
                      v-for="(row, i) in store.popupNumbers"
                      :key="i"
                      class="board-row"
                    >
                      <span
                        v-for="(cell, j) in row"
                        :key="j"
                        :class="popupCellClass(i, j, cell)"
                        @click="handleModifyGrid(cell)"
                      >
                        {{ cell }}
                      </span>
                    </div>

                    <div class="flex border-t border-solid border-white/90">
                      <button
                        type="button"
                        class="flex-1 aspect-[3/2] border-r border-solid border-white/90 bg-[steelblue] text-[16px] leading-none font-semibold text-white transition-colors duration-150 hover:bg-[#5a8ab6]"
                        @click="handleCheatCurrentGrid"
                      >
                        作弊
                      </button>

                      <button
                        type="button"
                        class="flex-1 aspect-[3/2] bg-[steelblue] text-[16px] leading-none font-semibold text-white transition-colors duration-150 hover:bg-[#5a8ab6]"
                        @click="handleClearCurrentGrid"
                      >
                        清空
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer
      class="sticky bottom-0 mt-auto w-full bg-[steelblue] shadow-[0_-0.2rem_0.35rem_rgba(48,48,48,0.28)]"
    >
      <div
        class="grid w-full grid-cols-6 gap-2 border-t border-white/20 bg-[steelblue] p-2"
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
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppActionButton from '@/components/AppActionButton.vue'
import type { PopupCell } from '@/types/sudoku'
import { useMainStore } from '@/stores/main'

const store = useMainStore()
const boardRef = ref<HTMLElement | null>(null)
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const popupStyle = computed<CSSProperties>(() => {
  const [rowIndex, colIndex] = store.gridPosition
  const step = 100 / 9
  const popupWidth = step * 3
  const popupHeight = step * 4
  const cellCenterX = (colIndex * step) + (step / 2)
  const cellCenterY = (rowIndex * step) + (step / 2)
  const left = clamp(cellCenterX - (popupWidth / 2), 0, 100 - popupWidth)
  const top = clamp(cellCenterY - (popupHeight / 2), 0, 100 - popupHeight)

  return {
    top: `${top}%`,
    left: `${left}%`
  }
})

const boardCellClass = (rowIndex: number, colIndex: number, value: number) => [
  'board-cell',
  rowIndex === 0 ? '' : rowIndex % 3 === 0 ? 'border-t-2' : 'border-t',
  colIndex === 0 ? '' : colIndex % 3 === 0 ? 'border-l-2' : 'border-l',
  'border-solid border-[#888]',
  store.cloneMatrix[rowIndex][colIndex] ? 'bg-[#f1f1f1]' : 'bg-[#cfeef9]',
  store.cheatMarks[rowIndex][colIndex] && value ? 'text-[#c53b4c] font-semibold' : '',
  !value ? 'text-transparent' : '',
  (!store.matrixMarks[rowIndex][colIndex] || !value) && !store.clearErrorMarks ? '!bg-[lightpink]' : ''
]

const popupCellClass = (rowIndex: number, colIndex: number, value: PopupCell) => [
  'board-cell',
  'w-1/3 bg-[steelblue] text-[24px] text-white',
  rowIndex === 0 ? '' : rowIndex % 3 === 0 ? 'border-t-2' : 'border-t',
  colIndex === 0 ? '' : colIndex % 3 === 0 ? 'border-l-2' : 'border-l',
  'border-solid border-white/90'
]

const handleGridClick = (rowIndex: number, colIndex: number) => {
  if (store.cloneMatrix[rowIndex][colIndex]) {
    store.togglePop(false)
    return
  }

  const shown = store.gridPosition[0] === rowIndex && store.gridPosition[1] === colIndex
  store.clickGrid([rowIndex, colIndex])
  store.togglePop(shown ? undefined : true)
}

const handleModifyGrid = (value: PopupCell) => {
  store.modifyGrid(value === '' ? 0 : value)
  store.togglePop(false)
}

const handleCheatCurrentGrid = () => {
  store.cheatCurrentGrid()
  store.togglePop(false)
}

const handleClearCurrentGrid = () => {
  store.clearCurrentGrid()
  store.togglePop(false)
}

const handleOutsidePointerDown = (event: PointerEvent) => {
  if (!store.popShow) {
    return
  }

  const target = event.target
  if (!(target instanceof Node)) {
    return
  }

  if (boardRef.value?.contains(target)) {
    return
  }

  store.togglePop(false)
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointerDown)
})
</script>
