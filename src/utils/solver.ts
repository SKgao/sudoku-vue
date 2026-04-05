import type { GameDifficulty, NumberMatrix } from '@/types/sudoku'
import toolkit from './toolkit'

const {
  matrixToolkit: { deepClone }
} = toolkit

const MATRIX_SIZE = 9
const BOX_SIZE = 3

interface CellPosition {
  rowIndex: number
  colIndex: number
}

interface SolveMetrics {
  nakedSingles: number
  hiddenSingles: number
  guessCount: number
  maxDepth: number
}

export interface PuzzleAnalysis {
  clues: number
  solved: boolean
  score: number
  guessCount: number
  maxDepth: number
  difficulty: GameDifficulty
}

type StepResult = 'changed' | 'stalled' | 'invalid'

const createMetrics = (): SolveMetrics => ({
  nakedSingles: 0,
  hiddenSingles: 0,
  guessCount: 0,
  maxDepth: 0
})

const countClues = (matrix: NumberMatrix) => matrix.flat().filter(Boolean).length

const isUnitValid = (values: number[]) => {
  const seen = new Set<number>()

  for (const value of values) {
    if (!value) {
      continue
    }

    if (seen.has(value)) {
      return false
    }

    seen.add(value)
  }

  return true
}

// 盘面只要在任一行、列、宫里出现重复数字，就应该被判定为非法。
const isMatrixValid = (matrix: NumberMatrix) => {
  for (let rowIndex = 0; rowIndex < MATRIX_SIZE; rowIndex += 1) {
    if (!isUnitValid(matrix[rowIndex])) {
      return false
    }
  }

  for (let colIndex = 0; colIndex < MATRIX_SIZE; colIndex += 1) {
    const col = Array.from({ length: MATRIX_SIZE }, (_, rowIndex) => matrix[rowIndex][colIndex])

    if (!isUnitValid(col)) {
      return false
    }
  }

  for (let boxRow = 0; boxRow < BOX_SIZE; boxRow += 1) {
    for (let boxCol = 0; boxCol < BOX_SIZE; boxCol += 1) {
      const box: number[] = []

      for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
        for (let colOffset = 0; colOffset < BOX_SIZE; colOffset += 1) {
          box.push(matrix[boxRow * BOX_SIZE + rowOffset][boxCol * BOX_SIZE + colOffset])
        }
      }

      if (!isUnitValid(box)) {
        return false
      }
    }
  }

  return true
}

// 计算某个空格当前还能填哪些数字，后面的求解、唯一解判断和难度评估都依赖它。
const getCandidates = (matrix: NumberMatrix, rowIndex: number, colIndex: number) => {
  if (matrix[rowIndex][colIndex]) {
    return []
  }

  const usedValues = new Set<number>()
  const startRowIndex = Math.floor(rowIndex / BOX_SIZE) * BOX_SIZE
  const startColIndex = Math.floor(colIndex / BOX_SIZE) * BOX_SIZE

  for (let index = 0; index < MATRIX_SIZE; index += 1) {
    usedValues.add(matrix[rowIndex][index])
    usedValues.add(matrix[index][colIndex])
  }

  for (let boxRowIndex = startRowIndex; boxRowIndex < startRowIndex + BOX_SIZE; boxRowIndex += 1) {
    for (let boxColIndex = startColIndex; boxColIndex < startColIndex + BOX_SIZE; boxColIndex += 1) {
      usedValues.add(matrix[boxRowIndex][boxColIndex])
    }
  }

  return Array.from({ length: MATRIX_SIZE }, (_, index) => index + 1).filter((value) => !usedValues.has(value))
}

const isSolved = (matrix: NumberMatrix) => matrix.every((row) => row.every(Boolean)) && isMatrixValid(matrix)

// 在一个“行/列/宫”的单元组里找隐藏单值。
// 也就是某个候选数虽然不是单格唯一候选，但在这个组里只出现过一次。
const collectHiddenSingles = (matrix: NumberMatrix, unit: CellPosition[]) => {
  const candidateMap = new Map<number, CellPosition[]>()

  for (const cell of unit) {
    const candidates = getCandidates(matrix, cell.rowIndex, cell.colIndex)

    for (const candidate of candidates) {
      const cells = candidateMap.get(candidate) ?? []
      cells.push(cell)
      candidateMap.set(candidate, cells)
    }
  }

  return Array.from(candidateMap.entries())
    .filter(([, cells]) => cells.length === 1)
    .map(([value, [cell]]) => ({ ...cell, value }))
}

// 先尽量用不需要猜测的规则推进盘面。
// 当前只统计两类最基础规则：裸单值和隐藏单值。
const applyDeterministicSteps = (matrix: NumberMatrix, metrics?: SolveMetrics): StepResult => {
  let changed = false

  while (true) {
    if (!isMatrixValid(matrix)) {
      return 'invalid'
    }

    const nakedSingles: Array<CellPosition & { value: number }> = []

    for (let rowIndex = 0; rowIndex < MATRIX_SIZE; rowIndex += 1) {
      for (let colIndex = 0; colIndex < MATRIX_SIZE; colIndex += 1) {
        const candidates = getCandidates(matrix, rowIndex, colIndex)

        if (!matrix[rowIndex][colIndex] && !candidates.length) {
          return 'invalid'
        }

        if (candidates.length === 1) {
          nakedSingles.push({ rowIndex, colIndex, value: candidates[0] })
        }
      }
    }

    if (nakedSingles.length) {
      for (const { rowIndex, colIndex, value } of nakedSingles) {
        matrix[rowIndex][colIndex] = value
      }

      if (metrics) {
        metrics.nakedSingles += nakedSingles.length
      }
      changed = true
      continue
    }

    const hiddenSingles: Array<CellPosition & { value: number }> = []

    for (let rowIndex = 0; rowIndex < MATRIX_SIZE; rowIndex += 1) {
      const rowUnit = Array.from({ length: MATRIX_SIZE }, (_, colIndex) => ({ rowIndex, colIndex }))
      hiddenSingles.push(...collectHiddenSingles(matrix, rowUnit))
    }

    for (let colIndex = 0; colIndex < MATRIX_SIZE; colIndex += 1) {
      const colUnit = Array.from({ length: MATRIX_SIZE }, (_, rowIndex) => ({ rowIndex, colIndex }))
      hiddenSingles.push(...collectHiddenSingles(matrix, colUnit))
    }

    for (let boxRow = 0; boxRow < BOX_SIZE; boxRow += 1) {
      for (let boxCol = 0; boxCol < BOX_SIZE; boxCol += 1) {
        const boxUnit: CellPosition[] = []

        for (let rowOffset = 0; rowOffset < BOX_SIZE; rowOffset += 1) {
          for (let colOffset = 0; colOffset < BOX_SIZE; colOffset += 1) {
            boxUnit.push({
              rowIndex: boxRow * BOX_SIZE + rowOffset,
              colIndex: boxCol * BOX_SIZE + colOffset
            })
          }
        }

        hiddenSingles.push(...collectHiddenSingles(matrix, boxUnit))
      }
    }

    if (!hiddenSingles.length) {
      break
    }

    const appliedCells = new Set<string>()

    for (const { rowIndex, colIndex, value } of hiddenSingles) {
      const cellKey = `${rowIndex}:${colIndex}`

      if (appliedCells.has(cellKey) || matrix[rowIndex][colIndex]) {
        continue
      }

      matrix[rowIndex][colIndex] = value
      appliedCells.add(cellKey)
    }

    if (!appliedCells.size) {
      break
    }

    if (metrics) {
      metrics.hiddenSingles += appliedCells.size
    }
    changed = true
  }

  return changed ? 'changed' : 'stalled'
}

// 回溯时优先选择候选数最少的格子，能明显减少搜索树规模。
const findBestGuessCell = (matrix: NumberMatrix) => {
  let target: (CellPosition & { candidates: number[] }) | null = null

  for (let rowIndex = 0; rowIndex < MATRIX_SIZE; rowIndex += 1) {
    for (let colIndex = 0; colIndex < MATRIX_SIZE; colIndex += 1) {
      if (matrix[rowIndex][colIndex]) {
        continue
      }

      const candidates = getCandidates(matrix, rowIndex, colIndex)

      if (!candidates.length) {
        return { rowIndex, colIndex, candidates }
      }

      if (!target || candidates.length < target.candidates.length) {
        target = { rowIndex, colIndex, candidates }
      }
    }
  }

  return target
}

// 带指标统计的求解过程。
// 如果必须进入猜测，会沿着成功解路径累计 guessCount 和 maxDepth，
// 避免把失败分支的尝试错误算进难度分数。
const solveWithMetrics = (matrix: NumberMatrix, metrics: SolveMetrics, depth = 0): boolean => {
  if (applyDeterministicSteps(matrix, metrics) === 'invalid') {
    return false
  }

  if (isSolved(matrix)) {
    return true
  }

  const target = findBestGuessCell(matrix)

  if (!target || !target.candidates.length) {
    return false
  }

  for (const candidate of target.candidates) {
    const nextMatrix = deepClone(matrix)
    const nextMetrics: SolveMetrics = {
      nakedSingles: metrics.nakedSingles,
      hiddenSingles: metrics.hiddenSingles,
      guessCount: metrics.guessCount + 1,
      maxDepth: Math.max(metrics.maxDepth, depth + 1)
    }

    nextMatrix[target.rowIndex][target.colIndex] = candidate

    if (solveWithMetrics(nextMatrix, nextMetrics, depth + 1)) {
      for (let rowIndex = 0; rowIndex < MATRIX_SIZE; rowIndex += 1) {
        for (let colIndex = 0; colIndex < MATRIX_SIZE; colIndex += 1) {
          matrix[rowIndex][colIndex] = nextMatrix[rowIndex][colIndex]
        }
      }

      metrics.nakedSingles = nextMetrics.nakedSingles
      metrics.hiddenSingles = nextMetrics.hiddenSingles
      metrics.guessCount = nextMetrics.guessCount
      metrics.maxDepth = nextMetrics.maxDepth

      return true
    }
  }

  return false
}

// 只统计解的数量，不关心具体解法细节。
// limit 默认为 2，因为这里的主要用途是判断“是否唯一解”。
const countSolutionsInternal = (matrix: NumberMatrix, limit: number): number => {
  const nextMatrix = deepClone(matrix)

  if (!isMatrixValid(nextMatrix)) {
    return 0
  }

  if (applyDeterministicSteps(nextMatrix) === 'invalid') {
    return 0
  }

  const target = findBestGuessCell(nextMatrix)

  if (!target) {
    return isSolved(nextMatrix) ? 1 : 0
  }

  if (!target.candidates.length) {
    return 0
  }

  let solutionCount = 0

  for (const candidate of target.candidates) {
    const branchMatrix = deepClone(nextMatrix)
    branchMatrix[target.rowIndex][target.colIndex] = candidate
    solutionCount += countSolutionsInternal(branchMatrix, limit - solutionCount)

    if (solutionCount >= limit) {
      return solutionCount
    }
  }

  return solutionCount
}

// 这是当前项目的启发式难度分级，不是完整的人类数独评级体系。
// 主要参考线索数量、基础规则推进量以及是否需要猜测。
const resolveDifficulty = (matrix: NumberMatrix, metrics: SolveMetrics): GameDifficulty => {
  const clues = countClues(matrix)
  const score = metrics.nakedSingles + (metrics.hiddenSingles * 3) + (metrics.guessCount * 18) + (metrics.maxDepth * 12)

  if (metrics.guessCount === 0 && metrics.hiddenSingles <= 8 && clues >= 38 && score <= 28) {
    return 'easy'
  }

  if (metrics.guessCount <= 1 && metrics.maxDepth <= 1 && clues >= 31 && score <= 70) {
    return 'medium'
  }

  return 'hard'
}

// 对外暴露的盘面分析：会尝试解题，并输出线索数、评分和当前难度判断。
export const analyzePuzzle = (matrix: NumberMatrix): PuzzleAnalysis => {
  const nextMatrix = deepClone(matrix)
  const metrics = createMetrics()
  const solved = solveWithMetrics(nextMatrix, metrics)
  const score = metrics.nakedSingles + (metrics.hiddenSingles * 3) + (metrics.guessCount * 18) + (metrics.maxDepth * 12)

  return {
    clues: countClues(matrix),
    solved,
    score,
    guessCount: metrics.guessCount,
    maxDepth: metrics.maxDepth,
    difficulty: resolveDifficulty(matrix, metrics)
  }
}

// 对外暴露的解数量统计，通常配合 limit=2 判断唯一解。
export const countSolutions = (matrix: NumberMatrix, limit = 2) => {
  const nextMatrix = deepClone(matrix)
  return countSolutionsInternal(nextMatrix, limit)
}

export const solvePuzzle = (matrix: NumberMatrix) => {
  const nextMatrix = deepClone(matrix)
  const solved = solveWithMetrics(nextMatrix, createMetrics())
  return solved ? nextMatrix : null
}

export const isValidPuzzle = (matrix: NumberMatrix) => isMatrixValid(matrix)

export const hasUniqueSolution = (matrix: NumberMatrix) => countSolutions(matrix, 2) === 1
