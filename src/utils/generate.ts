import type { NumberMatrix } from '@/types/sudoku'
import toolkit from './toolkit'

const {
  matrixToolkit: { checkFillable, makeMatrix, shuffle }
} = toolkit

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

// 先生成完整答案，再按难度随机挖空，得到题面。
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
