import { describe, expect, it } from 'vitest'
import { createPuzzleBundle } from '@/utils/generate'
import { analyzePuzzle, hasUniqueSolution, isValidPuzzle, solvePuzzle } from '@/utils/solver'
import { clueRangeMap } from './fixtures'

describe('generate', () => {
  it.each([
    ['easy'],
    ['medium'],
    ['hard']
  ] as const)('能为 %s 生成唯一解题面', (difficulty) => {
    for (let sampleIndex = 0; sampleIndex < 3; sampleIndex += 1) {
      const { puzzle, solution } = createPuzzleBundle(difficulty)
      const analysis = analyzePuzzle(puzzle)
      const solvedPuzzle = solvePuzzle(puzzle)
      const clueRange = clueRangeMap[difficulty]

      expect(isValidPuzzle(puzzle)).toBe(true)
      expect(hasUniqueSolution(puzzle)).toBe(true)
      expect(analysis.solved).toBe(true)
      expect(analysis.clues).toBeGreaterThanOrEqual(clueRange.min)
      expect(analysis.clues).toBeLessThanOrEqual(clueRange.max)
      expect(analysis.clues).toBeLessThan(81)
      expect(solvedPuzzle).toEqual(solution)

      for (let rowIndex = 0; rowIndex < puzzle.length; rowIndex += 1) {
        for (let colIndex = 0; colIndex < puzzle[rowIndex].length; colIndex += 1) {
          if (!puzzle[rowIndex][colIndex]) {
            continue
          }

          expect(puzzle[rowIndex][colIndex]).toBe(solution[rowIndex][colIndex])
        }
      }
    }
  })
})
