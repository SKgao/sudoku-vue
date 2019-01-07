import Vue from 'vue'
import toolkit from 'utils/toolkit'
import Checker from 'utils/checker'
import { puzzleMatrix } from 'utils/generate'
const { matrixToolkit: { makeMatrix, deepClone } } = toolkit
const myPuzzle = puzzleMatrix()

const main = {
  state: {
    title: '数独游戏',
    matrix: myPuzzle, // 生成棋盘数据
    cloneMatrix: deepClone(myPuzzle), // 棋盘原始数据、重置时追溯
    matrixMarks: makeMatrix(myPuzzle), // 解密结果
    isSuccess: null, // 是否解密成功
    rowClass: ['row_g_top', 'row_g_middle', 'row_g_bottom'],
    colClass: ['col_g_left', 'col_g_center', 'col_g_right'],
    popShow: false, // 弹窗状态
    gridPosition: [0, 0], // 点击的单元格位置
    clearErrorMarks: true, // 默认清除错误标记
    buttons: [
      {
        key: 'check',
        text: '检查'
      },
      {
        key: 'reset',
        text: '重置'
      },
      {
        key: 'clear',
        text: '清理'
      },
      {
        key: 'rebuild',
        text: '重建'
      }
    ],
    popupNumbers: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      ['', 0, '']
    ]
  },

  mutations: {
    TOGGLE_POP: (state, isShow = 0) => {
      state.popShow = isShow === 0 ? !state.popShow : isShow
    },
    CLICK_GRID: (state, gridPosition) => {
      gridPosition.forEach((e, i) => {
        Vue.set(state.gridPosition, i, e)
      })
    },
    MODIFY_GRID: (state, num) => {
      Vue.set(state.matrix[state.gridPosition[0]], state.gridPosition[1], num)
    },
    CHECK_GAME: (state) => {
      const myChecker = new Checker(state.matrix)
      myChecker.checkAll()
      const isSuccess = myChecker.isSuccess()
      state.isSuccess = isSuccess
      state.clearErrorMarks = false
      state.matrixMarks = myChecker.matrixMarks()
      isSuccess && alert('恭喜您，游戏成功！')
    },
    RESET_GAME: state => {
      state.matrix = state.cloneMatrix
    },
    CLEAR_GAME: state => {
      state.clearErrorMarks = true
    },
    REBUILD_GAME: state => {
      const newPuzzle = puzzleMatrix()
      state.matrix = newPuzzle
      state.cloneMatrix = deepClone(newPuzzle)
      state.matrixMarks = makeMatrix(true)
      state.clearErrorMarks = true
    }
  },

  actions: {
    togglePop ({ commit }, isShow) {
      commit('TOGGLE_POP', isShow)
    },
    clickGrid ({ commit }, gridPosition) {
      commit('CLICK_GRID', gridPosition)
    },
    modifyGrid ({ commit }, num) {
      commit('MODIFY_GRID', num)
    },
    handleGame ({ commit }, type) {
      commit(`${type.toUpperCase()}_GAME`)
    }
  }
}

export default main
