import { defineStore } from 'pinia'
import type {
  BooleanMatrix,
  ControlButton,
  GameActionType,
  GridPosition,
  NumberMatrix,
  PopupMatrix
} from '@/types/sudoku'
import { useAppAlertDialog } from '@/composables/useAppAlertDialog'
import { useAppConfirmDialog } from '@/composables/useAppConfirmDialog'
import { useAppToast } from '@/composables/useAppToast'
import Checker from '@/utils/checker'
import { createPuzzleBundle } from '@/utils/generate'
import toolkit from '@/utils/toolkit'

const {
  matrixToolkit: { deepClone, makeMatrix }
} = toolkit
const { show: showAlert } = useAppAlertDialog()
const { show: showConfirm } = useAppConfirmDialog()
const { show: showToast } = useAppToast()

interface GameState {
  title: string
  matrix: NumberMatrix
  cloneMatrix: NumberMatrix
  solutionMatrix: NumberMatrix
  cheatMarks: BooleanMatrix
  matrixMarks: BooleanMatrix
  isSuccess: boolean | null
  popShow: boolean
  gridPosition: GridPosition
  clearErrorMarks: boolean
  buttons: ControlButton[]
  popupNumbers: PopupMatrix
}

const createGameState = (): GameState => {
  const { puzzle, solution } = createPuzzleBundle()

  return {
    title: '数独游戏',
    matrix: puzzle,
    cloneMatrix: deepClone(puzzle),
    solutionMatrix: deepClone(solution),
    cheatMarks: makeMatrix(false),
    matrixMarks: makeMatrix(true),
    isSuccess: null,
    popShow: false,
    gridPosition: [0, 0],
    clearErrorMarks: true,
    buttons: [
      { key: 'check', text: '检查', variant: 'neutral' },
      { key: 'submit', text: '提交', variant: 'primary' },
      { key: 'cheat', text: '作弊', variant: 'warning' },
      { key: 'reset', text: '重置', variant: 'warning' },
      { key: 'clear', text: '清理', variant: 'subtle' },
      { key: 'rebuild', text: '重建', variant: 'danger' }
    ],
    popupNumbers: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]
  }
}

export const useMainStore = defineStore('main', {
  state: createGameState,
  actions: {
    togglePop(isShow?: boolean) {
      this.popShow = typeof isShow === 'boolean' ? isShow : !this.popShow
    },
    clickGrid(gridPosition: GridPosition) {
      this.gridPosition = [...gridPosition] as GridPosition
    },
    modifyGrid(num: number) {
      const [rowIndex, colIndex] = this.gridPosition
      this.matrix[rowIndex][colIndex] = num
      this.cheatMarks[rowIndex][colIndex] = false
    },
    clearCurrentGrid() {
      const [rowIndex, colIndex] = this.gridPosition
      this.matrix[rowIndex][colIndex] = 0
      this.cheatMarks[rowIndex][colIndex] = false
    },
    cheatCurrentGrid() {
      const [rowIndex, colIndex] = this.gridPosition
      this.matrix[rowIndex][colIndex] = this.solutionMatrix[rowIndex][colIndex]
      this.cheatMarks[rowIndex][colIndex] = true
      this.clearErrorMarks = true
      this.matrixMarks = makeMatrix(true)
      this.isSuccess = null
    },
    checkGame() {
      const checker = new Checker(this.matrix)
      checker.checkAll()

      this.isSuccess = checker.isSuccess()
      this.clearErrorMarks = false
      this.matrixMarks = checker.matrixMarks()

      if (this.isSuccess) {
        showToast({
          title: '验证成功',
          description: '当前数独已经全部填写正确。',
          tone: 'success'
        })
        return
      }

      const invalidCount = this.matrixMarks.flat().filter((mark) => !mark).length

      showToast({
        title: '发现待修正项',
        description: `已标出 ${invalidCount} 个问题位置，请继续检查。`,
        tone: 'error',
        duration: 3800
      })
    },
    submitGame() {
      const checker = new Checker(this.matrix)
      checker.checkAll()

      this.isSuccess = checker.isSuccess()
      this.clearErrorMarks = false
      this.matrixMarks = checker.matrixMarks()

      if (this.isSuccess) {
        showAlert({
          title: '提交成功',
          description: '数独已完成，所有数字均已通过校验。',
          tone: 'success'
        })
        return
      }

      showAlert({
        title: '提交失败',
        description: '当前答案还未完成或存在错误，请继续检查并修正标红单元格。',
        tone: 'error'
      })
    },
    applyResetGame() {
      this.matrix = deepClone(this.cloneMatrix)
      this.cheatMarks = makeMatrix(false)
      this.matrixMarks = makeMatrix(true)
      this.clearErrorMarks = true
      this.isSuccess = null
      this.popShow = false
      this.gridPosition = [0, 0]
      showToast({
        title: '棋盘已重置',
        description: '已恢复到本局初始题面。',
        tone: 'info'
      })
    },
    resetGame() {
      showConfirm({
        title: '确认重置当前棋盘？',
        description: '已填写的数字会被清空，并恢复到本局最初的题面。',
        tone: 'warning',
        confirmText: '确认重置',
        cancelText: '继续作答',
        onConfirm: () => this.applyResetGame()
      })
    },
    clearGame() {
      this.clearErrorMarks = true
      this.matrixMarks = makeMatrix(true)
      showToast({
        title: '已清理标记',
        description: '错误高亮已隐藏，当前填写内容保持不变。',
        tone: 'info'
      })
    },
    applyCheatGame() {
      const emptyCells = this.matrix.reduce((count, row, rowIndex) => {
        return count + row.filter((cell, colIndex) => !this.cloneMatrix[rowIndex][colIndex] && !cell).length
      }, 0)

      if (!emptyCells) {
        showToast({
          title: '当前没有可代填空位',
          description: '所有可填写格都已有数字，作弊不会再补入新答案。',
          tone: 'info'
        })
        return
      }

      const nextMatrix = this.matrix.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isFixedCell = Boolean(this.cloneMatrix[rowIndex][colIndex])
          return isFixedCell || cell ? cell : this.solutionMatrix[rowIndex][colIndex]
        })
      )
      const nextCheatMarks = this.cheatMarks.map((row, rowIndex) =>
        row.map((marked, colIndex) => {
          const isFixedCell = Boolean(this.cloneMatrix[rowIndex][colIndex])
          const wasFilledByCheat = !isFixedCell && !this.matrix[rowIndex][colIndex] && Boolean(nextMatrix[rowIndex][colIndex])
          return marked || wasFilledByCheat
        })
      )

      this.matrix = nextMatrix
      this.cheatMarks = nextCheatMarks
      this.matrixMarks = makeMatrix(true)
      this.clearErrorMarks = true
      this.isSuccess = null
      this.popShow = false

      showToast({
        title: '作弊完成',
        description: `已为 ${emptyCells} 个未完成格子填入正确答案，代填数字会以红色显示。`,
        tone: 'success'
      })
    },
    cheatGame() {
      showConfirm({
        title: '确认启用作弊？',
        description: '系统会把所有未完成区域直接填入正确答案，当前挑战将失去意义。',
        tone: 'danger',
        confirmText: '确认作弊',
        cancelText: '继续作答',
        onConfirm: () => this.applyCheatGame()
      })
    },
    applyRebuildGame() {
      Object.assign(this, createGameState())
      showToast({
        title: '新棋盘已生成',
        description: '已经开始一局新的数独。',
        tone: 'success'
      })
    },
    rebuildGame() {
      showConfirm({
        title: '确认开始新的一局？',
        description: '当前棋盘进度将被放弃，并立即生成新的题目。',
        tone: 'danger',
        confirmText: '生成新棋盘',
        cancelText: '保留当前局',
        onConfirm: () => this.applyRebuildGame()
      })
    },
    handleGame(type: GameActionType) {
      const actions: Record<GameActionType, () => void> = {
        check: () => this.checkGame(),
        submit: () => this.submitGame(),
        cheat: () => this.cheatGame(),
        reset: () => this.resetGame(),
        clear: () => this.clearGame(),
        rebuild: () => this.rebuildGame()
      }

      actions[type]()
    }
  }
})
