<template>
  <div>
    <div class="title">
      <h1>{{ title }}</h1>
    </div>

    <div class="container grid">
      <div class="row" v-for="(row, i) in matrix" :key="i" :class="rowClass[i % 3]">
        <span
          v-for="(col, j) in row"
          :key="j"
          :class="[
            colClass[j % 3],
            {empty: !col},
            {fixed: cloneMatrix[i][j]},
            {mark1: !cloneMatrix[i][j]},
            {error: (!matrixMarks[i][j] || !col) && !clearErrorMarks}
          ]"
          @click="cloneMatrix[i][j] ? false : clickGrid(i, j)">{{ col }}</span>
      </div>
    </div>

    <div class="dashboard">
      <div class="buttons">
        <button
          v-for="item in buttons"
          :key="item.key"
          @click="handleButton(item.key)">{{ item.text }}</button>
      </div>
    </div>

    <div class="popup-num grid"
      v-show="popShow"
      :style="{
        top: `calc(${gridPosition[0] * 10}vw + ${gridPosition[0] + 1}px)`,
        left: gridPosition[1] < 4 ? (gridPosition[1] + 1) * 10 + 'vw' : (gridPosition[1] * 10) - 39.5 + 'vw'
      }">

      <div class="row"
        v-for="(row, i) in popupNumbers"
        :key="i"
        :class="[{'row-g-top': i === 0}, {'row-g-bottom': i === 3}]">
        <span
          v-for="(cell, j) in row"
          :key="j"
          :class="[
            {'col-g-left': j % 3 === 0},
            {'col-g-right': j % 3 === 2},
            {'mark': cell === ''},
            {'mark1': i === 3 && j === 0},
            {'mark2': i === 3 && j === 2}
          ]"
          @click="modifyGrid(cell)">
          {{ cell }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import store from 'store/index'

export default {
  name: 'Main',
  computed: {
    ...mapGetters(Object.keys(store.getters))
  },
  methods: {
    handleButton (type) {
      this.$store.dispatch('handleGame', type)
    },
    clickGrid (i, j) {
      const shown = [i, j].every(e => this.gridPosition.includes(e))
      this.$store.dispatch('clickGrid', [i, j]).then(() => {
        this.$store.dispatch('togglePop', !shown || 0)
      })
    },
    modifyGrid (val) {
      const num = val === '' ? 0 : val
      this.$store.dispatch('modifyGrid', num).then(() => {
        this.$store.dispatch('togglePop')
      })
    }
  }

}
</script>

<style lang="less">
  @import "../styles/main.less";
</style>
