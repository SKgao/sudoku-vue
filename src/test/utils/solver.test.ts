import { describe, expect, it } from 'vitest'
import type { NumberMatrix } from '@/types/sudoku'
import { analyzePuzzle, countSolutions, hasUniqueSolution, isValidPuzzle, solvePuzzle } from '@/utils/solver'
import { solvedBoard } from './fixtures'

const createBoardWithoutOneAndTwo = (): NumberMatrix => (
  solvedBoard.map((row) => row.map((value) => (value === 1 || value === 2 ? 0 : value)))
)

const createInvalidBoard = (): NumberMatrix => {
  const board = solvedBoard.map((row) => [...row])
  board[0][1] = board[0][0]
  return board
}

describe('solver', () => {
  it('能识别唯一解盘面', () => {
    expect(hasUniqueSolution(solvedBoard)).toBe(true)
    expect(countSolutions(solvedBoard)).toBe(1)
    expect(solvePuzzle(solvedBoard)).toEqual(solvedBoard)
  })

  it('能识别非唯一解盘面', () => {
    const puzzle = createBoardWithoutOneAndTwo()

    expect(hasUniqueSolution(puzzle)).toBe(false)
    expect(countSolutions(puzzle)).toBeGreaterThan(1)
  })

  it('能分析题面基础指标', () => {
    const analysis = analyzePuzzle(solvedBoard)

    expect(analysis.solved).toBe(true)
    expect(analysis.clues).toBe(81)
    expect(analysis.guessCount).toBe(0)
  })

  it('会拒绝非法盘面', () => {
    const invalidBoard = createInvalidBoard()
    const analysis = analyzePuzzle(invalidBoard)

    expect(isValidPuzzle(invalidBoard)).toBe(false)
    expect(analysis.solved).toBe(false)
    expect(countSolutions(invalidBoard)).toBe(0)
    expect(hasUniqueSolution(invalidBoard)).toBe(false)
    expect(solvePuzzle(invalidBoard)).toBeNull()
  })
})
