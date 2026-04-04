import type { NumberMatrix } from '@/types/sudoku'
import toolkit from './toolkit'

const {
  matrixToolkit: { checkFillable, makeMatrix, shuffle }
} = toolkit

class Generator {
  private matrix: NumberMatrix = makeMatrix(0)
  private len = 0
  private orders: number[][] = []

  init(): NumberMatrix {
    while (!this.generate()) {
      continue
    }

    return this.matrix
  }

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

export const createPuzzleBundle = (level = 5): PuzzleBundle => {
  const solution = new Generator().init()
  const puzzle = solution.map((row) => row.map((cell) => (Math.random() * 9 < level ? 0 : cell)))

  return {
    puzzle,
    solution
  }
}

export const puzzleMatrix = (level = 5): NumberMatrix => {
  return createPuzzleBundle(level).puzzle
}
