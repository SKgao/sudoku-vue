<template>
  <view :class="styles['page-shell']">
    <view :class="styles['page-header']">
      <text :class="styles['page-title']">{{ title }}</text>
    </view>

    <view :class="styles['page-card']">
      <view :class="styles['difficulty-bar']">
        <text :class="styles['difficulty-label']">游戏难度</text>
        <view :class="styles['difficulty-options']">
          <view
            v-for="option in difficultyOptions"
            :key="option.key"
            :class="difficultyChipClass(option.key)"
            @tap="handleDifficultyChange(option.key)"
          >
            {{ option.text }}
          </view>
        </view>
      </view>

      <view :class="styles['board-shell']">
        <view
          id="sudoku-board"
          :class="styles['board-inner']"
          @touchmove.stop.prevent="handleBoardTouchMove"
          @touchend="handleBoardTouchFinish"
          @touchcancel="handleBoardTouchFinish"
        >
          <view
            v-for="(row, rowIndex) in matrix"
            :key="rowIndex"
            :class="styles['board-row']"
          >
            <view
              v-for="(cell, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              :class="boardCellClass(rowIndex, colIndex, cell)"
              :style="boardCellStyle(rowIndex, colIndex)"
              @touchstart="handleCellTouchStart(rowIndex, colIndex)"
              @tap="handleGridTap(rowIndex, colIndex)"
            >
              {{ cell || '' }}
            </view>
          </view>
        </view>
      </view>

      <view :class="styles['input-panel']">
        <text :class="styles['selection-label']">{{ selectionLabel }}</text>

        <view :class="styles['keypad-row']">
          <view
            v-for="value in keypadNumbers"
            :key="value"
            :class="keypadButtonClass(value)"
            @tap="handleInput(value)"
          >
            {{ value }}
          </view>
        </view>

        <view :class="styles['quick-actions']">
          <view
            :class="quickActionButtonClass('neutral', !gridPosition && !activeValue)"
            @tap="handleClear"
          >
            <view :class="joinClasses(styles['quick-action-icon'], styles['quick-action-icon--undo'])">
              <text>↺</text>
            </view>
            <text>撤销</text>
          </view>
          <view
            :class="quickActionButtonClass('hint', !gridPosition)"
            @tap="handleHint"
          >
            <view :class="joinClasses(styles['quick-action-icon'], styles['quick-action-icon--bulb'])">
              <view :class="styles['quick-action-icon-bulb-head']"></view>
              <view :class="styles['quick-action-icon-bulb-base']"></view>
            </view>
            <text>提示</text>
          </view>
        </view>
      </view>
    </view>

    <view :class="styles['page-footer']">
      <view :class="styles['action-grid']">
        <view
          v-for="item in buttons"
          :key="item.key"
          :class="actionButtonClass(item.variant)"
          @tap="handleGameAction(item.key)"
        >
          {{ item.text }}
        </view>
      </view>
    </view>

    <AppFeedback />
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import Taro, { useDidShow } from '@tarojs/taro'
import { useMainStore } from '@/stores/main'
import AppFeedback from '@/components/app-feedback.vue'
import { getBoardCellClassList, getBoardCellStyle } from './board-cell'
import { useBoardDragSelection } from './useBoardDragSelection'
import styles from './index.module.scss'

const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const store = useMainStore()
const boardCellSize = ref(0)
const {
  clearDragSelection,
  consumeSuppressedTap,
  getDragBoxShadow,
  handleBoardTouchMove: updateBoardDragSelection,
  handleCellTouchStart,
  handleTouchFinish,
  syncBoardRect
} = useBoardDragSelection({
  onLongPressStart: () => store.clickGrid(null)
})

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
    gridPosition: gridPosition.value,
    styles
  }).join(' ')

const joinClasses = (...classNames) => classNames.filter(Boolean).join(' ')

const difficultyChipClass = (optionKey) =>
  joinClasses(
    styles['difficulty-chip'],
    optionKey === difficulty.value ? styles['difficulty-chip--active'] : ''
  )

const keypadButtonClass = (value) =>
  joinClasses(
    styles['keypad-button'],
    !gridPosition.value && activeValue.value !== value ? styles['keypad-button--disabled'] : '',
    activeValue.value === value ? styles['keypad-button--active'] : ''
  )

const quickActionButtonClass = (tone, disabled) =>
  joinClasses(
    styles['quick-action-button'],
    styles[`quick-action-button--${tone}`],
    disabled ? styles['quick-action-button--disabled'] : ''
  )

const actionButtonClass = (variant) =>
  joinClasses(
    styles['action-button'],
    styles[`action-button--${variant}`]
  )

const boardCellStyle = (rowIndex, colIndex) =>
  ({
    ...getBoardCellStyle({
      rowIndex,
      colIndex,
      gridPosition: gridPosition.value,
      dragBoxShadow: getDragBoxShadow(rowIndex, colIndex)
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
      syncBoardRect(null)
      return
    }

    boardCellSize.value = rect.width / 9
    syncBoardRect({
      left: rect.left,
      top: rect.top,
      width: rect.width
    })
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
  if (consumeSuppressedTap()) {
    return
  }

  clearDragSelection()
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
  clearDragSelection()
  void store.changeDifficulty(nextDifficulty)
}

const handleGameAction = (type) => {
  clearDragSelection()
  void store.handleGame(type)
}

const extractTouchPoint = (event) => event?.touches?.[0] ?? event?.changedTouches?.[0] ?? null

const handleBoardTouchMove = (event) => {
  const touchPoint = extractTouchPoint(event)

  if (!touchPoint) {
    return
  }

  updateBoardDragSelection(touchPoint.pageX, touchPoint.pageY)
}

const handleBoardTouchFinish = () => {
  handleTouchFinish()
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
