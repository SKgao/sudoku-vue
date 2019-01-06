import toolkit from './toolkit'
const { matrixToolkit: { makeMatrix, shuffle, checkFillable } } = toolkit

class Generator {
  /**
   * 生成一个随机的数独解决方案
   */
  init () {
    while (!this.generate()) {
      console.log('重新生成')
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

export const generator = new Generator().init()

