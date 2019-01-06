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
          :class="[colClass[j % 3], {empty: !col}, {fixed: col}]"
          @click="col ? false : clickGrid(i, j)">{{ col }}</span>
      </div>
    </div>

    <div id="dashboard" class="dashboard">
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
          top: gridPosition[0] * 33 + 96 + 'px',
          left: gridPosition[1] < 5 ? gridPosition[1] * 31 + 65 + 'px' : gridPosition[1] * 31 - 110 + 'px'
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
              {'mark': i === 3 && j % 3 !== 1},
              {'mark1': i === 3 && j === 0},
              {'empty': i === 3 && j === 1},
              {'mark2': i === 3 && j === 2}
            ]">
            {{ cell }}
          </span>
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Main',
  computed: {
    ...mapGetters([
      'title',
      'buttons',
      'matrix',
      'rowClass',
      'colClass',
      'popShow',
      'gridPosition',
      'popupNumbers'
    ])
  },
  methods: {
    handleButton (type) {
      console.log('type-->', type)
      //this.$store.dispatch('togglePop')
    },
    clickGrid(i, j) {
      console.log('gridPosition', [i, j], this.gridPosition)
      this.$store.dispatch('togglePop')
      this.$store.dispatch('clickGrid', [i, j])
    },
    modifyGrid (number) {
      this.$store.dispatch('modifyGrid', number)
      this.$store.dispatch('togglePop')
    },
  }

}
</script>

<style lang="less">
  @import "../styles/main.less";
</style>
