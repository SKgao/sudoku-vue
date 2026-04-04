import type { BooleanMatrix, NumberMatrix } from '@/types/sudoku'
import toolkit from './toolkit'

const {
  matrixToolkit: { makeMatrix },
  boxToolkit: { convertFromBoxIndex, getBoxCells }
} = toolkit

const checkArray = (array: number[]): boolean[] => {
  const length = array.length
  const maskArray = new Array<boolean>(length).fill(true)

  for (let index = 0; index < length - 1; index += 1) {
    const value = array[index]
    if (!maskArray[index]) {
      continue
    }
    if (!value) {
      maskArray[index] = false
      continue
    }

    for (let compareIndex = index + 1; compareIndex < length; compareIndex += 1) {
      if (value === array[compareIndex]) {
        maskArray[index] = false
        maskArray[compareIndex] = false
      }
    }
  }

  return maskArray
}

class Checker {
  private _matrix: NumberMatrix
  private _matrixMarks: BooleanMatrix
  private _success = false

  constructor(matrix: NumberMatrix) {
    this._matrix = matrix
    this._matrixMarks = makeMatrix(true)
  }

  matrixMarks(): BooleanMatrix {
    return this._matrixMarks
  }

  isSuccess(): boolean {
    return this._success
  }

  checkAll(): void {
    this.checkRows()
    this.checkCols()
    this.checkBoxes()

    this._success = this._matrixMarks.every((row) => row.every((value) => value))
  }

  private checkRows(): void {
    for (let rowIndex = 0; rowIndex < 9; rowIndex += 1) {
      const row = this._matrix[rowIndex]
      const marks = checkArray(row)

      for (let columnIndex = 0; columnIndex < marks.length; columnIndex += 1) {
        if (!marks[columnIndex]) {
          this._matrixMarks[rowIndex][columnIndex] = false
        }
      }
    }
  }

  private checkCols(): void {
    for (let colIndex = 0; colIndex < 9; colIndex += 1) {
      const col = this._matrix.map((row) => row[colIndex])
      const marks = checkArray(col)

      for (let rowIndex = 0; rowIndex < marks.length; rowIndex += 1) {
        if (!marks[rowIndex]) {
          this._matrixMarks[rowIndex][colIndex] = false
        }
      }
    }
  }

  private checkBoxes(): void {
    for (let boxIndex = 0; boxIndex < 9; boxIndex += 1) {
      const box = getBoxCells(this._matrix, boxIndex)
      const marks = checkArray(box)

      for (let cellIndex = 0; cellIndex < marks.length; cellIndex += 1) {
        if (!marks[cellIndex]) {
          const { rowIndex, colIndex } = convertFromBoxIndex(boxIndex, cellIndex)
          this._matrixMarks[rowIndex][colIndex] = false
        }
      }
    }
  }
}

export default Checker
