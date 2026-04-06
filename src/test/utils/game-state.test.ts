import { describe, expect, it } from 'vitest'
import type { GameState } from '@/types/sudoku'
import {
  createCheatCurrentGridPatch,
  createClearCurrentGridPatch,
  createGridSelectionPatch,
  createModifyGridPatch,
  createResetGamePatch,
  createSubmitResult,
  difficultyOptions
} from '@/utils/game-state'
import toolkit from '@/utils/toolkit'
import { solvedBoard } from './fixtures'

const {
  matrixToolkit: { deepClone, makeMatrix }
} = toolkit

const createFixtureState = (): GameState => {
  const puzzle = deepClone(solvedBoard)
  puzzle[0][1] = 0
  puzzle[0][2] = 0

  return {
    title: '凹凹数独',
    matrix: deepClone(puzzle),
    cloneMatrix: deepClone(puzzle),
    solutionMatrix: deepClone(solvedBoard),
    cheatMarks: makeMatrix(false),
    matrixMarks: makeMatrix(true),
    isSuccess: null,
    gridPosition: { rowIndex: 0, colIndex: 1 },
    activeValue: null,
    difficulty: 'medium',
    difficultyOptions,
    clearErrorMarks: true,
    buttons: []
  }
}

describe('game-state', () => {
  it('能为当前选中空格填写数字', () => {
    const state = createFixtureState()
    state.cheatMarks[0][1] = true
    const patch = createModifyGridPatch(state, 3)

    expect(patch).not.toBeNull()
    expect(patch?.matrix?.[0][1]).toBe(3)
    expect(patch?.cheatMarks?.[0][1]).toBe(false)
    expect(patch?.activeValue).toBe(3)
  })

  it('不会修改初始固定格', () => {
    const state = createFixtureState()
    state.gridPosition = { rowIndex: 0, colIndex: 0 }

    expect(createModifyGridPatch(state, 1)).toBeNull()
    expect(createClearCurrentGridPatch(state)).toBeNull()
    expect(createCheatCurrentGridPatch(state)).toBeNull()
  })

  it('能为当前空格填入提示答案，并重置错误标记', () => {
    const state = createFixtureState()
    state.matrixMarks[0][0] = false
    state.clearErrorMarks = false
    state.isSuccess = false
    const patch = createCheatCurrentGridPatch(state)

    expect(patch).not.toBeNull()
    expect(patch?.matrix?.[0][1]).toBe(solvedBoard[0][1])
    expect(patch?.cheatMarks?.[0][1]).toBe(true)
    expect(patch?.activeValue).toBe(solvedBoard[0][1])
    expect(patch?.clearErrorMarks).toBe(true)
    expect(patch?.isSuccess).toBeNull()
    expect(patch?.matrixMarks?.every((row) => row.every(Boolean))).toBe(true)
  })

  it('能把当前棋盘恢复到初始题面', () => {
    const state = createFixtureState()
    state.matrix[0][1] = 9
    state.cheatMarks[0][1] = true
    state.gridPosition = { rowIndex: 1, colIndex: 1 }
    state.activeValue = 9
    state.clearErrorMarks = false
    state.isSuccess = false

    const patch = createResetGamePatch(state)

    expect(patch.matrix).toEqual(state.cloneMatrix)
    expect(patch.cheatMarks?.every((row) => row.every((mark) => !mark))).toBe(true)
    expect(patch.gridPosition).toBeNull()
    expect(patch.activeValue).toBeNull()
    expect(patch.clearErrorMarks).toBe(true)
    expect(patch.isSuccess).toBeNull()
  })

  it('能产出提交校验结果', () => {
    const submitResult = createSubmitResult(solvedBoard)

    expect(submitResult.isSuccess).toBe(true)
    expect(submitResult.clearErrorMarks).toBe(false)
    expect(submitResult.matrixMarks.every((row) => row.every(Boolean))).toBe(true)
  })

  it('能创建安全的选中格坐标副本', () => {
    const source = { rowIndex: 1, colIndex: 2 }
    const selection = createGridSelectionPatch(source)

    expect(selection.gridPosition).toEqual({ rowIndex: 1, colIndex: 2 })
    expect(selection.gridPosition).not.toBe(source)
  })
})
