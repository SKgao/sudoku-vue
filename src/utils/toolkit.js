// 生成矩阵
const matrixToolkit = {
  /**
   * 生产9*9的数组矩阵，不传值全部为0
   */
  makeMatrix (value = 0) {
    return Array(9).fill().map(_ => Array(9).fill(value))
  },

  /**
   * 深度克隆（不考虑复杂对象等情况）
   * @param {*} array
   */
  deepClone (val) {
    return JSON.parse(JSON.stringify(val))
  },

  /**
   * shuffle 洗牌算法，打乱数组
   */
  shuffle (array = []) {
    const length = array.length
    const endIndex = length - 1
    for (let i = 0; i < endIndex; i++) {
      const j = i + Math.floor(Math.random() * (length - i))
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array
  },

  /**
   * 检查指定位置是够可以填入数字
   */
  checkFillable (matrix, n, rowIndex, colIndex) {
    const { convertToBoxIndex, getBoxCells } = boxToolkit
    const box = convertToBoxIndex(rowIndex, colIndex)
    const boxCells = getBoxCells(matrix, box.boxIndex)
    for (let i = 0; i < 9; i++) {
      if (matrix[i][colIndex] === n || matrix[rowIndex][i] === n || boxCells[i] === n) {
        return false
      }
    }
    return true
  }
}

// 宫坐标系工具
const boxToolkit = {
  /**
   * 获取九宫格内数据
   */
  getBoxCells (matrix, boxIndex) {
    const startRowIndex = Math.floor(boxIndex / 3) * 3
    const startColIndex = boxIndex % 3 * 3
    const result = []
    for (let i = 0; i < 9; i++) {
      const rowIndex = startRowIndex + Math.floor(i / 3)
      const colIndex = startColIndex + i % 3
      result.push(matrix[rowIndex][colIndex])
    }
    return result
  },

  /**
   * 从宫坐标转换为矩阵坐标
   */
  convertFromBoxIndex (boxIndex, cellIndex) {
    return {
      rowIndex: Math.floor(boxIndex / 3) * 3 + Math.floor(cellIndex / 3),
      colIndex: boxIndex % 3 * 3 + cellIndex % 3
    }
  },

  /**
   * 从矩阵坐标转换为宫坐标
   */
  convertToBoxIndex (rowIndex, colIndex) {
    return {
      boxIndex: Math.floor(rowIndex / 3) * 3 + Math.floor(colIndex / 3),
      cellIndex: rowIndex % 3 * 3 + colIndex % 3
    }
  }
}

// 工具集
export default {
  matrixToolkit,
  boxToolkit
}
