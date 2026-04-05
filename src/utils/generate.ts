import type { GameDifficulty, NumberMatrix } from '@/types/sudoku'
import type { PuzzleAnalysis } from './solver'
import { analyzePuzzle, hasUniqueSolution } from './solver'
import toolkit from './toolkit'

const {
  matrixToolkit: { checkFillable, deepClone, makeMatrix, shuffle }
} = toolkit

interface DifficultyConfig {
  minClues: number
  maxClues: number
  attempts: number
}

interface PuzzleCandidate {
  puzzle: NumberMatrix
  analysis: PuzzleAnalysis
}

// 三档难度先通过“保留线索数范围 + 最大重试次数”约束题面规模，
// 最终仍然要靠 solver 里的规则复杂度再做一次难度校验。
const difficultyConfigMap: Record<GameDifficulty, DifficultyConfig> = {
  easy: {
    minClues: 38,
    maxClues: 44,
    attempts: 18
  },
  medium: {
    minClues: 32,
    maxClues: 37,
    attempts: 24
  },
  hard: {
    minClues: 27,
    maxClues: 31,
    attempts: 30
  }
}

const countClues = (matrix: NumberMatrix) => matrix.flat().filter(Boolean).length
const difficultyRankMap: Record<GameDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2
}

// 挖空顺序随机化，避免每次都优先从固定区域开始删除数字。
const createCarveOrder = () => {
  const positions = Array.from({ length: 81 }, (_, index) => ({
    rowIndex: Math.floor(index / 9),
    colIndex: index % 9
  }))

  return shuffle(positions)
}

// 从完整解盘面中逐步挖空。
// 每次尝试删掉一个数字后，都会立刻校验题面是否仍然保持唯一解。
const createCandidateScore = (difficulty: GameDifficulty, analysis: PuzzleAnalysis) => {
  const config = difficultyConfigMap[difficulty]
  const targetClues = (config.minClues + config.maxClues) / 2
  const difficultyDistance = Math.abs(difficultyRankMap[difficulty] - difficultyRankMap[analysis.difficulty])
  const clueDistance = Math.abs(analysis.clues - targetClues)

  return (difficultyDistance * 100) + (clueDistance * 4) + (analysis.guessCount * 8) + (analysis.maxDepth * 5)
}

// 从完整解盘面中逐步挖空。
// 每次尝试删掉一个数字后，都会立刻校验题面是否仍然保持唯一解。
const carvePuzzle = (solution: NumberMatrix, difficulty: GameDifficulty): PuzzleCandidate | null => {
  const config = difficultyConfigMap[difficulty]
  const targetClues = config.minClues + Math.floor(Math.random() * ((config.maxClues - config.minClues) + 1))
  const puzzle = deepClone(solution)
  const positions = createCarveOrder()
  let clues = countClues(puzzle)

  for (const { rowIndex, colIndex } of positions) {
    if (clues <= targetClues) {
      break
    }

    const backup = puzzle[rowIndex][colIndex]
    puzzle[rowIndex][colIndex] = 0

    if (!hasUniqueSolution(puzzle)) {
      puzzle[rowIndex][colIndex] = backup
      continue
    }

    clues -= 1
  }

  if (clues > config.maxClues) {
    return null
  }

  const analysis = analyzePuzzle(puzzle)

  // 理论上能生成出来的题面都应该可解，这里额外做一层保护。
  if (!analysis.solved) {
    return null
  }

  return {
    puzzle,
    analysis
  }
}

class Generator {
  // 最终生成出来的完整答案盘面。
  private matrix: NumberMatrix = makeMatrix(0)
  private len = 0
  // 每一行都维护一个独立的随机列顺序，减少生成结果过于固定。
  private orders: number[][] = []

  init(): NumberMatrix {
    while (!this.generate()) {
      continue
    }

    return this.matrix
  }

  // 先重置棋盘，再按 1-9 依次尝试填满整个盘面。
  private generate(): boolean {
    this.matrix = makeMatrix(0)
    this.len = this.matrix.length
    this.orders = Array.from({ length: this.len }, () => [...Array(this.len).keys()]).map((row) =>
      shuffle(row)
    )

    return Array(this.len)
      .fill(0)
      .every((_, index) => this.fillNumber(index + 1))
  }

  private fillNumber(value: number): boolean {
    return this.fillRow(value, 0)
  }

  // 递归地把同一个数字填进每一行；一旦后续失败，就回溯重试当前位置。
  private fillRow(value: number, rowIndex: number): boolean {
    if (rowIndex >= this.len) {
      return true
    }

    const row = this.matrix[rowIndex]
    const orders = this.orders[rowIndex]

    for (let index = 0; index < orders.length; index += 1) {
      const colIndex = orders[index]
      if (row[colIndex]) {
        continue
      }
      if (!checkFillable(this.matrix, value, rowIndex, colIndex)) {
        continue
      }

      row[colIndex] = value

      if (!this.fillRow(value, rowIndex + 1)) {
        row[colIndex] = 0
        continue
      }

      return true
    }

    return false
  }
}

export default Generator

export interface PuzzleBundle {
  puzzle: NumberMatrix
  solution: NumberMatrix
}

// 先生成完整答案，再按目标难度逐步挖空，并保证题面只有唯一解。
// 如果多次尝试仍然没命中目标难度，就退化为“保留唯一解”的同档题面。
export const createPuzzleBundle = (difficulty: GameDifficulty = 'medium'): PuzzleBundle => {
  const config = difficultyConfigMap[difficulty]
  let bestCandidate: (PuzzleCandidate & { solution: NumberMatrix }) | null = null

  for (let attempt = 0; attempt < config.attempts; attempt += 1) {
    const solution = new Generator().init()
    const candidate = carvePuzzle(solution, difficulty)

    if (!candidate) {
      continue
    }

    if (
      !bestCandidate ||
      createCandidateScore(difficulty, candidate.analysis) <
        createCandidateScore(difficulty, bestCandidate.analysis)
    ) {
      bestCandidate = {
        ...candidate,
        solution
      }
    }

    if (candidate.analysis.difficulty === difficulty) {
      return {
        puzzle: candidate.puzzle,
        solution
      }
    }
  }

  if (bestCandidate) {
    return {
      puzzle: bestCandidate.puzzle,
      solution: bestCandidate.solution
    }
  }

  const solution = new Generator().init()
  const fallbackCandidate = carvePuzzle(solution, difficulty)

  return {
    puzzle: fallbackCandidate?.puzzle ?? deepClone(solution),
    solution
  }
}

export const puzzleMatrix = (difficulty: GameDifficulty = 'medium'): NumberMatrix => {
  return createPuzzleBundle(difficulty).puzzle
}
