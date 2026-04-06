<template>
  <view class="page-shell">
    <view class="page-header">
      <text class="page-title">{{ title }}</text>
    </view>

    <view class="page-card">
      <view class="difficulty-bar">
        <text class="difficulty-label">游戏难度</text>
        <view class="difficulty-options">
          <view
            v-for="option in difficultyOptions"
            :key="option.key"
            class="difficulty-chip"
            :class="{ 'difficulty-chip--active': option.key === difficulty }"
            @tap="handleDifficultyChange(option.key)"
          >
            {{ option.text }}
          </view>
        </view>
      </view>

      <view class="board-shell">
        <view
          id="sudoku-board"
          class="board-inner"
        >
          <view
            v-for="(row, rowIndex) in matrix"
            :key="rowIndex"
            class="board-row"
          >
            <view
              v-for="(cell, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              :class="boardCellClass(rowIndex, colIndex, cell)"
              :style="boardCellStyle(rowIndex, colIndex)"
              @tap="handleGridTap(rowIndex, colIndex)"
            >
              {{ cell || '' }}
            </view>
          </view>
        </view>
      </view>

      <view class="input-panel">
        <text class="selection-label">{{ selectionLabel }}</text>
        <text class="selection-tip">{{ selectionTip }}</text>

        <view class="keypad-row">
          <view
            v-for="value in keypadNumbers"
            :key="value"
            class="keypad-button"
            :class="{
              'keypad-button--disabled': !gridPosition && activeValue !== value,
              'keypad-button--active': activeValue === value
            }"
            @tap="handleInput(value)"
          >
            {{ value }}
          </view>
        </view>

        <view class="quick-actions">
          <view
            class="quick-action-button quick-action-button--neutral"
            :class="{ 'quick-action-button--disabled': !gridPosition && !activeValue }"
            @tap="handleClear"
          >
            撤销
          </view>
          <view
            class="quick-action-button quick-action-button--hint"
            :class="{ 'quick-action-button--disabled': !gridPosition }"
            @tap="handleHint"
          >
            提示
          </view>
        </view>
      </view>
    </view>

    <view class="page-footer">
      <view class="action-grid">
        <view
          v-for="item in buttons"
          :key="item.key"
          class="action-button"
          :class="`action-button--${item.variant}`"
          @tap="handleGameAction(item.key)"
        >
          {{ item.text }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMainStore } from '@/stores/main'
import { getBoardCellClassList, getBoardCellStyle } from './board-cell'

const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const store = useMainStore()
const boardCellSize = ref(0)

const {
  title,
  matrix,
  cloneMatrix,
  cheatMarks,
  matrixMarks,
  clearErrorMarks,
  activeValue,
  gridPosition,
  difficulty,
  difficultyOptions,
  buttons
} = storeToRefs(store)

const selectionLabel = computed(() => {
  if (!gridPosition.value) {
    return activeValue.value ? `当前高亮数字 ${activeValue.value}` : '请选择一个可填写的格子'
  }

  const { rowIndex, colIndex } = gridPosition.value
  return `第 ${rowIndex + 1} 行，第 ${colIndex + 1} 列`
})

const selectionTip = computed(() => {
  if (gridPosition.value) {
    return '点击数字直接填入，点“撤销”可清空当前格。'
  }

  return activeValue.value
    ? `当前高亮数字 ${activeValue.value}，再次点击相同数字可取消。`
    : '未选中格子时，点击数字会切换同数字高亮。'
})

const boardCellClass = (rowIndex, colIndex, value) =>
  getBoardCellClassList({
    rowIndex,
    colIndex,
    value,
    cloneMatrix: cloneMatrix.value,
    cheatMarks: cheatMarks.value,
    matrixMarks: matrixMarks.value,
    clearErrorMarks: clearErrorMarks.value,
    activeValue: activeValue.value,
    gridPosition: gridPosition.value
  }).join(' ')

const boardCellStyle = (rowIndex, colIndex) =>
  ({
    ...getBoardCellStyle({
      rowIndex,
      colIndex,
      gridPosition: gridPosition.value
    }),
    width: boardCellSize.value ? `${boardCellSize.value}px` : '11.111111%',
    height: boardCellSize.value ? `${boardCellSize.value}px` : '11.111111vw'
  })

const syncBoardCellSize = () => {
  const query = Taro.createSelectorQuery()

  query.select('#sudoku-board').boundingClientRect()
  query.exec((result) => {
    const rect = result?.[0]

    if (!rect?.width) {
      return
    }

    boardCellSize.value = rect.width / 9
  })
}

const scheduleBoardMeasure = () => {
  nextTick(() => {
    syncBoardCellSize()
  })
}

onMounted(() => {
  scheduleBoardMeasure()
})

useDidShow(() => {
  scheduleBoardMeasure()
})

const handleGridTap = (rowIndex, colIndex) => {
  const value = matrix.value[rowIndex][colIndex]
  const isHighlightedValue = Boolean(value) && activeValue.value === value

  if (cloneMatrix.value[rowIndex][colIndex]) {
    store.clickGrid(null)
    store.setActiveValue(isHighlightedValue ? null : value)
    return
  }

  const isSelected =
    gridPosition.value?.rowIndex === rowIndex &&
    gridPosition.value?.colIndex === colIndex

  store.setActiveValue(isSelected && isHighlightedValue ? null : value)
  store.clickGrid(isSelected ? null : { rowIndex, colIndex })
}

const handleDifficultyChange = (nextDifficulty) => {
  void store.changeDifficulty(nextDifficulty)
}

const handleGameAction = (type) => {
  void store.handleGame(type)
}

const handleInput = (value) => {
  if (!gridPosition.value) {
    store.setActiveValue(activeValue.value === value ? null : value)
    return
  }

  store.modifyGrid(value)
}

const handleClear = () => {
  if (!gridPosition.value) {
    if (activeValue.value) {
      store.setActiveValue(null)
    }
    return
  }

  store.clearCurrentGrid()
}

const handleHint = () => {
  if (!gridPosition.value) {
    return
  }

  store.cheatCurrentGrid()
}
</script>

<style src="./index.css"></style>
