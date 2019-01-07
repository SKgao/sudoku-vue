import toolkit from './toolkit'
const { matrixToolkit: { makeMatrix }, boxToolkit: { getBoxCells, convertFromBoxIndex } } = toolkit

/**
 * 数组检查核心算法
 * @param {array} array
 */
const checkArray = (array) => {
  const length = array.length
  const maskArray = new Array(length).fill(true)

  for (let i = 0; i < length - 1; i++) {
    const v = array[i]
    if (!maskArray[i]) {
      continue
    }
    if (!v) {
      maskArray[i] = false
      continue
    }

    for (let j = i + 1; j < length; j++) {
      if (v === array[j]) {
        maskArray[i] = maskArray[j] = false
      }
    }
  }
  return maskArray
}

class Checker {
  constructor (matrix) {
    this._matrix = matrix
    this._matrixMarks = makeMatrix(true)
  }

  // 返回数据验证表
  matrixMarks () {
    return this._matrixMarks
  }

  // 返回是否验证通过
  isSuccess () {
    return this._success
  }

  // 检查每一列，每一行，每一宫数据
  checkAll () {
    this.checkRows()
    this.checkCols()
    this.checkBoxs()

    this._success = this._matrixMarks.every(row => row.every(v => v))
  }

  // 检查行
  checkRows () {
    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
      const row = this._matrix[rowIndex]
      const marks = checkArray(row)

      for (let i = 0; i < marks.length; i++) {
        if (!marks[i]) {
          this._matrixMarks[rowIndex][i] = false
        }
      }
    }
  }

  // 检查列
  checkCols () {
    for (let colIndex = 0; colIndex < 9; colIndex++) {
      const col = this._matrix.map(e => e[colIndex])
      const marks = checkArray(col)

      for (let i = 0; i < marks.length; i++) {
        if (!marks[i]) {
          this._matrixMarks[i][colIndex] = false
        }
      }
    }
  }

  // 检查宫
  checkBoxs () {
    for (let boxIndex = 0; boxIndex < 9; boxIndex++) {
      const box = getBoxCells(this._matrix, boxIndex)
      const marks = checkArray(box)

      for (let i = 0; i < marks.length; i++) {
        if (!marks[i]) {
          const { rowIndex, colIndex } = convertFromBoxIndex(boxIndex, i)
          this._matrixMarks[rowIndex][colIndex] = false
        }
      }
    }
  }
}

export default Checker
