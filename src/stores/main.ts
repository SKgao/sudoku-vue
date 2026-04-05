import { defineStore } from 'pinia'
import type {
  BooleanMatrix,
  ControlButton,
  DifficultyOption,
  GameActionType,
  GameDifficulty,
  GridPosition,
  NumberMatrix
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

const difficultyOptions: DifficultyOption[] = [
  { key: 'easy', text: '简单', level: 4 },
  { key: 'medium', text: '中等', level: 5 },
  { key: 'hard', text: '困难', level: 6 }
]

const getDifficultyConfig = (difficulty: GameDifficulty) =>
  difficultyOptions.find((option) => option.key === difficulty) ?? difficultyOptions[1]

interface GameState {
  title: string
  matrix: NumberMatrix
  cloneMatrix: NumberMatrix
  solutionMatrix: NumberMatrix
  cheatMarks: BooleanMatrix
  matrixMarks: BooleanMatrix
  isSuccess: boolean | null
  gridPosition: GridPosition | null
  activeValue: number | null
  difficulty: GameDifficulty
  difficultyOptions: DifficultyOption[]
  clearErrorMarks: boolean
  buttons: ControlButton[]
}

const createGameState = (difficulty: GameDifficulty = 'medium'): GameState => {
  const difficultyConfig = getDifficultyConfig(difficulty)
  const { puzzle, solution } = createPuzzleBundle(difficultyConfig.level)

  return {
    title: '数独游戏',
    matrix: puzzle,
    cloneMatrix: deepClone(puzzle),
    solutionMatrix: deepClone(solution),
    cheatMarks: makeMatrix(false),
    matrixMarks: makeMatrix(true),
    isSuccess: null,
    gridPosition: null,
    activeValue: null,
    difficulty,
    difficultyOptions,
    clearErrorMarks: true,
    buttons: [
      { key: 'submit', text: '提交', variant: 'primary' },
      { key: 'cheat', text: '作弊', variant: 'warning' },
      { key: 'reset', text: '重置', variant: 'warning' },
      { key: 'rebuild', text: '重建', variant: 'danger' }
    ]
  }
}

export const useMainStore = defineStore('main', {
  state: createGameState,
  actions: {
    clickGrid(gridPosition: GridPosition | null) {
      this.gridPosition = gridPosition ? { ...gridPosition } : null
    },
    setActiveValue(value: number | null) {
      this.activeValue = value || null
    },
    modifyGrid(num: number) {
      if (!this.gridPosition) {
        return
      }

      const { rowIndex, colIndex } = this.gridPosition
      this.matrix[rowIndex][colIndex] = num
      this.cheatMarks[rowIndex][colIndex] = false
      this.activeValue = num || null
    },
    clearCurrentGrid() {
      if (!this.gridPosition) {
        return
      }

      const { rowIndex, colIndex } = this.gridPosition
      this.matrix[rowIndex][colIndex] = 0
      this.cheatMarks[rowIndex][colIndex] = false
      this.activeValue = null
    },
    cheatCurrentGrid() {
      if (!this.gridPosition) {
        return
      }

      const { rowIndex, colIndex } = this.gridPosition
      this.matrix[rowIndex][colIndex] = this.solutionMatrix[rowIndex][colIndex]
      this.cheatMarks[rowIndex][colIndex] = true
      this.clearErrorMarks = true
      this.matrixMarks = makeMatrix(true)
      this.isSuccess = null
      this.activeValue = this.matrix[rowIndex][colIndex]
    },
    submitGame() {
      const checker = new Checker(this.matrix)
      checker.checkAll()

      this.isSuccess = checker.isSuccess()
      this.clearErrorMarks = false
      this.matrixMarks = checker.matrixMarks()

      if (this.isSuccess) {
        showConfirm({
          title: '恭喜你完成本局游戏',
          description: '当前数独已经全部填写正确。要不要立刻再来一局？',
          tone: 'info',
          confirmText: '再来一局',
          cancelText: '取消',
          onConfirm: () => this.applyRebuildGame()
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
      this.gridPosition = null
      this.activeValue = null
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
      this.gridPosition = null
      this.activeValue = null

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
    applyDifficultyChange(difficulty: GameDifficulty) {
      Object.assign(this, createGameState(difficulty))
      const difficultyConfig = getDifficultyConfig(difficulty)

      showToast({
        title: `难度已切换为${difficultyConfig.text}`,
        description: '已根据新的难度重新生成棋盘。',
        tone: 'success'
      })
    },
    changeDifficulty(difficulty: GameDifficulty) {
      if (this.difficulty === difficulty) {
        return
      }

      const difficultyConfig = getDifficultyConfig(difficulty)

      showConfirm({
        title: `切换到${difficultyConfig.text}难度？`,
        description: '当前棋盘进度将被放弃，并立即生成对应难度的新题目。',
        tone: 'warning',
        confirmText: `切换到${difficultyConfig.text}`,
        cancelText: '保留当前局',
        onConfirm: () => this.applyDifficultyChange(difficulty)
      })
    },
    applyRebuildGame() {
      Object.assign(this, createGameState(this.difficulty))
      const difficultyConfig = getDifficultyConfig(this.difficulty)

      showToast({
        title: '新棋盘已生成',
        description: `已经开始一局新的${difficultyConfig.text}难度数独。`,
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
        submit: () => this.submitGame(),
        cheat: () => this.cheatGame(),
        reset: () => this.resetGame(),
        rebuild: () => this.rebuildGame()
      }

      actions[type]()
    }
  }
})
