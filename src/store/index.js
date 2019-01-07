import Vue from 'vue'
import Vuex from 'vuex'
import main from './modules/main'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: { main },
  getters: Object.keys(main.state).reduce((a, b) => {
    return { ...a, [b]: state => state.main[b] }
  }, {})
})

export default store
