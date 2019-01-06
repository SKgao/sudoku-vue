import Vue from 'vue'
import { generator } from '../../utils/generate'
import { puzzleMatrix } from '../../utils/sudoku'
import Checker from '../../utils/checker'
const myChecker = new Checker(generator)
myChecker.checkAll()

console.log(puzzleMatrix())
//console.log(myChecker.isSuccess(), myChecker.matrixMarks())

const main = {
  state: {
    title: '数独游戏',
    matrix: puzzleMatrix(), // 生成棋盘数据
    rowClass: ['row_g_top', 'row_g_middle', 'row_g_bottom'],
    colClass: ['col_g_left', 'col_g_center', 'col_g_right'],
    popShow: false, // 弹窗状态
    gridPosition: [0, 0], // 点击的单元格位置
    buttons: [
      {
        key: 'check',
        text: '检查'
      },
      {
        key: 'reset',
        text: '充值'
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
      [0, 0, 0]
    ]
  },

  mutations: {
    TOGGLE_POP: state => {
      state.popShow = !state.popShow
    },
    CLICK_GRID: (state, gridPosition) => {
      gridPosition.forEach((e, i) => {
        Vue.set(state.gridPosition, i, e)
      })
    },
    MODIFY_GRID: (state, number) => {
      Vue.set(state.matrix[state.gridPosition[0]], state.gridPosition[1], number)
    },
  },

  actions: {
    togglePop({ commit }) {
      commit('TOGGLE_POP')
    },
    clickGrid({ commit }, gridPosition) {
      commit('CLICK_GRID', gridPosition)
    },
    modifyGrid({ commit }, number) {
      commit('MODIFY_GRID', number)
    },

  }
}

export default main
