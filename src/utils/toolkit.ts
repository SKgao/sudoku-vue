import type { BoxPosition, MatrixPosition, NumberMatrix } from '@/types/sudoku'

const MATRIX_SIZE = 9
const BOX_SIZE = 3

const matrixToolkit = {
  makeMatrix<T>(value: T): T[][] {
    return Array.from({ length: MATRIX_SIZE }, () => Array<T>(MATRIX_SIZE).fill(value))
  },

  deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T
  },

  shuffle<T>(array: T[] = []): T[] {
    const length = array.length
    const endIndex = length - 1

    for (let index = 0; index < endIndex; index += 1) {
      const swapIndex = index + Math.floor(Math.random() * (length - index))
      const current = array[index]
      array[index] = array[swapIndex]
      array[swapIndex] = current
    }

    return array
  },

  checkFillable(matrix: NumberMatrix, value: number, rowIndex: number, colIndex: number): boolean {
    const box = boxToolkit.convertToBoxIndex(rowIndex, colIndex)
    const boxCells = boxToolkit.getBoxCells(matrix, box.boxIndex)

    for (let index = 0; index < MATRIX_SIZE; index += 1) {
      if (
        matrix[index][colIndex] === value ||
        matrix[rowIndex][index] === value ||
        boxCells[index] === value
      ) {
        return false
      }
    }

    return true
  }
}

const boxToolkit = {
  getBoxCells(matrix: NumberMatrix, boxIndex: number): number[] {
    const startRowIndex = Math.floor(boxIndex / BOX_SIZE) * BOX_SIZE
    const startColIndex = (boxIndex % BOX_SIZE) * BOX_SIZE
    const result: number[] = []

    for (let index = 0; index < MATRIX_SIZE; index += 1) {
      const rowIndex = startRowIndex + Math.floor(index / BOX_SIZE)
      const colIndex = startColIndex + (index % BOX_SIZE)
      result.push(matrix[rowIndex][colIndex])
    }

    return result
  },

  convertFromBoxIndex(boxIndex: number, cellIndex: number): MatrixPosition {
    return {
      rowIndex: Math.floor(boxIndex / BOX_SIZE) * BOX_SIZE + Math.floor(cellIndex / BOX_SIZE),
      colIndex: (boxIndex % BOX_SIZE) * BOX_SIZE + (cellIndex % BOX_SIZE)
    }
  },

  convertToBoxIndex(rowIndex: number, colIndex: number): BoxPosition {
    return {
      boxIndex: Math.floor(rowIndex / BOX_SIZE) * BOX_SIZE + Math.floor(colIndex / BOX_SIZE),
      cellIndex: (rowIndex % BOX_SIZE) * BOX_SIZE + (colIndex % BOX_SIZE)
    }
  }
}

export default {
  matrixToolkit,
  boxToolkit
}
