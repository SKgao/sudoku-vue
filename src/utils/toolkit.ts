import type { BoxPosition, MatrixPosition, NumberMatrix } from '@/types/sudoku'

const MATRIX_SIZE = 9
const BOX_SIZE = 3

const matrixToolkit = {
  // 快速生成一个 9x9 的矩阵，并用同一个初始值填满。
  makeMatrix<T>(value: T): T[][] {
    return Array.from({ length: MATRIX_SIZE }, () => Array<T>(MATRIX_SIZE).fill(value))
  },

  // 当前数据结构都是纯数组，直接用 JSON 方式深拷贝足够简单。
  deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T
  },

  // Fisher-Yates 洗牌，用来打乱生成数独时每一行的尝试顺序。
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

  // 同时检查行、列、宫是否允许放入这个数字。
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
  // 根据宫序号取出这个 3x3 宫里的 9 个格子。
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

  // 把“第几个宫 + 宫内第几个格子”转换回棋盘的行列坐标。
  convertFromBoxIndex(boxIndex: number, cellIndex: number): MatrixPosition {
    return {
      rowIndex: Math.floor(boxIndex / BOX_SIZE) * BOX_SIZE + Math.floor(cellIndex / BOX_SIZE),
      colIndex: (boxIndex % BOX_SIZE) * BOX_SIZE + (cellIndex % BOX_SIZE)
    }
  },

  // 把棋盘行列坐标转换成“第几个宫 + 宫内第几个格子”。
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
