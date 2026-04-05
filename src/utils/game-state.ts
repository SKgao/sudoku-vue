import type {
  ControlButton,
  DifficultyOption,
  GameDifficulty,
  GameState,
  GridPosition
} from '@/types/sudoku'
import Checker from './checker'
import { createPuzzleBundle } from './generate'
import toolkit from './toolkit'

const {
  matrixToolkit: { deepClone, makeMatrix }
} = toolkit

export interface CheatGameResult {
  emptyCells: number
  statePatch: Partial<GameState> | null
}

const controlButtons: ControlButton[] = [
  { key: 'submit', text: '提交', variant: 'primary' },
  { key: 'cheat', text: '作弊', variant: 'warning' },
  { key: 'reset', text: '重置', variant: 'warning' },
  { key: 'rebuild', text: '重建', variant: 'danger' }
]

export const difficultyOptions: DifficultyOption[] = [
  { key: 'easy', text: '简单' },
  { key: 'medium', text: '中等' },
  { key: 'hard', text: '困难' }
]

export const getDifficultyOption = (difficulty: GameDifficulty) =>
  difficultyOptions.find((option) => option.key === difficulty) ?? difficultyOptions[1]

const resetCheckState = () => ({
  matrixMarks: makeMatrix(true),
  clearErrorMarks: true,
  isSuccess: null
})

const getSelectedEditableCell = (state: Pick<GameState, 'gridPosition' | 'cloneMatrix'>) => {
  if (!state.gridPosition) {
    return null
  }

  const { rowIndex, colIndex } = state.gridPosition

  if (state.cloneMatrix[rowIndex][colIndex]) {
    return null
  }

  return { rowIndex, colIndex }
}

// 统一生成一局完整状态，避免 store 里夹杂初始化细节。
export const createGameState = (difficulty: GameDifficulty = 'medium'): GameState => {
  const { puzzle, solution } = createPuzzleBundle(difficulty)

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
    buttons: controlButtons
  }
}

// 点击格子时只保留坐标变更，方便 store 与拖拽逻辑复用。
export const createGridSelectionPatch = (gridPosition: GridPosition | null) => ({
  gridPosition: gridPosition ? { ...gridPosition } : null
})

export const createActiveValuePatch = (value: number | null) => ({
  activeValue: value || null
})

// 单格填写、撤销、提示都走同一套“选中可编辑格子”保护，避免误改初始题面。
export const createModifyGridPatch = (
  state: Pick<GameState, 'gridPosition' | 'cloneMatrix' | 'matrix' | 'cheatMarks'>,
  value: number
) => {
  const cell = getSelectedEditableCell(state)

  if (!cell) {
    return null
  }

  const nextMatrix = deepClone(state.matrix)
  const nextCheatMarks = deepClone(state.cheatMarks)

  nextMatrix[cell.rowIndex][cell.colIndex] = value
  nextCheatMarks[cell.rowIndex][cell.colIndex] = false

  return {
    matrix: nextMatrix,
    cheatMarks: nextCheatMarks,
    activeValue: value || null
  }
}

export const createClearCurrentGridPatch = (
  state: Pick<GameState, 'gridPosition' | 'cloneMatrix' | 'matrix' | 'cheatMarks'>
) => {
  return createModifyGridPatch(state, 0)
}

export const createCheatCurrentGridPatch = (
  state: Pick<
    GameState,
    'gridPosition' | 'cloneMatrix' | 'matrix' | 'cheatMarks' | 'solutionMatrix'
  >
) => {
  const cell = getSelectedEditableCell(state)

  if (!cell) {
    return null
  }

  const nextMatrix = deepClone(state.matrix)
  const nextCheatMarks = deepClone(state.cheatMarks)
  const value = state.solutionMatrix[cell.rowIndex][cell.colIndex]

  nextMatrix[cell.rowIndex][cell.colIndex] = value
  nextCheatMarks[cell.rowIndex][cell.colIndex] = true

  return {
    matrix: nextMatrix,
    cheatMarks: nextCheatMarks,
    activeValue: value,
    ...resetCheckState()
  }
}

// 提交校验只返回结果数据，弹窗与提示完全交给 store 决定。
export const createSubmitResult = (matrix: GameState['matrix']) => {
  const checker = new Checker(matrix)
  checker.checkAll()

  return {
    isSuccess: checker.isSuccess(),
    clearErrorMarks: false,
    matrixMarks: checker.matrixMarks()
  }
}

export const createResetGamePatch = (
  state: Pick<GameState, 'cloneMatrix'>
): Partial<GameState> => ({
  matrix: deepClone(state.cloneMatrix),
  cheatMarks: makeMatrix(false),
  gridPosition: null,
  activeValue: null,
  ...resetCheckState()
})

// 全局提示会补齐所有仍为空的可编辑格子，并记录哪些数字来自系统代填。
export const createCheatGameResult = (
  state: Pick<GameState, 'matrix' | 'cloneMatrix' | 'solutionMatrix' | 'cheatMarks'>
): CheatGameResult => {
  const emptyCells = state.matrix.reduce((count, row, rowIndex) => {
    return count + row.filter((cell, colIndex) => !state.cloneMatrix[rowIndex][colIndex] && !cell).length
  }, 0)

  if (!emptyCells) {
    return {
      emptyCells: 0,
      statePatch: null
    }
  }

  const nextMatrix = state.matrix.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const isFixedCell = Boolean(state.cloneMatrix[rowIndex][colIndex])
      return isFixedCell || cell ? cell : state.solutionMatrix[rowIndex][colIndex]
    })
  )
  const nextCheatMarks = state.cheatMarks.map((row, rowIndex) =>
    row.map((marked, colIndex) => {
      const isFixedCell = Boolean(state.cloneMatrix[rowIndex][colIndex])
      const wasFilledByCheat = !isFixedCell && !state.matrix[rowIndex][colIndex] && Boolean(nextMatrix[rowIndex][colIndex])
      return marked || wasFilledByCheat
    })
  )

  return {
    emptyCells,
    statePatch: {
      matrix: nextMatrix,
      cheatMarks: nextCheatMarks,
      gridPosition: null,
      activeValue: null,
      ...resetCheckState()
    }
  }
}
