<template>
  <main class="app-shell">
    <header class="page-header">
      <h1 class="text-[2rem] leading-none font-normal">{{ store.title }}</h1>
    </header>

    <section class="page-card pb-8">
      <div class="relative">
        <div class="page-glow" />

        <div class="mb-2.5 flex items-center justify-center gap-2">
          <span class="text-[0.84rem] font-bold tracking-[0.08em] text-[#5f7486]">游戏难度</span>
          <AppRadioGroup
            label="游戏难度"
            :model-value="store.difficulty"
            :options="store.difficultyOptions"
            @update:model-value="handleDifficultyChange"
          />
        </div>

        <div class="page-surface">
          <SudokuBoard
            :matrix="store.matrix"
            :clone-matrix="store.cloneMatrix"
            :cheat-marks="store.cheatMarks"
            :matrix-marks="store.matrixMarks"
            :clear-error-marks="store.clearErrorMarks"
            :active-value="store.activeValue"
            :grid-position="store.gridPosition"
            @select-grid="store.clickGrid"
            @set-active-value="store.setActiveValue"
          />

          <SudokuInputPanel
            :grid-position="store.gridPosition"
            :disabled="!store.gridPosition"
            @input="store.modifyGrid"
            @clear="store.clearCurrentGrid"
            @hint="store.cheatCurrentGrid"
          />
        </div>
      </div>
    </section>

    <footer class="page-footer">
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
import AppActionButton from '@/components/AppActionButton.vue'
import AppRadioGroup from '@/components/AppRadioGroup.vue'
import { useMainStore } from '@/stores/main'
import type { GameDifficulty } from '@/types/sudoku'
import SudokuBoard from '@/views/components/SudokuBoard.vue'
import SudokuInputPanel from '@/views/components/SudokuInputPanel.vue'

const store = useMainStore()

const handleDifficultyChange = (difficulty: string) => {
  store.changeDifficulty(difficulty as GameDifficulty)
}
</script>
