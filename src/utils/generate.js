import toolkit from './toolkit'
const { matrixToolkit: { makeMatrix, shuffle, checkFillable } } = toolkit

class Generator {
  /**
   * 生成一个随机的数独解决方案
   */
  init () {
    while (!this.generate()) {
      continue
    }
    return this.matrix
  }

  generate () {
    this.matrix = makeMatrix()
    this.len = this.matrix.length
    this.orders = Array(this.len).fill()
      .map(() => [...Array(this.len).keys()])
      .map(row => shuffle(row))
    return Array(this.len).fill().every((n, i) => this.fillNumber(i + 1))
  }

  fillNumber (number) {
    return this.fillRow(number, 0)
  }

  fillRow (n, rowIndex) {
    if (rowIndex >= this.len) {
      return true
    }

    const row = this.matrix[rowIndex]
    const orders = this.orders[rowIndex]

    for (let i = 0; i < orders.length; i++) {
      const colIndex = orders[i]
      if (row[colIndex]) {
        continue
      }
      if (!checkFillable(this.matrix, n, rowIndex, colIndex)) {
        continue
      }
      row[colIndex] = n

      // 递归操作，填下一行
      if (!this.fillRow(n, rowIndex + 1)) {
        row[colIndex] = 0
        continue
      }
      return true
    }
    return false
  }
}

export default Generator

// 生成迷盘
export const puzzleMatrix = (level = 5) => {
  const generator = new Generator().init()
  return generator.map(row => {
    return row.map(cell => Math.random() * 9 < level ? 0 : cell)
  })
}
