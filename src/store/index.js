import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import * as actions from './actions'
import * as getters from './getters'
import * as mutations from './mutations'
// 打印日志--凡是操作了mutations，就会记录下来
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)
// 检测state的修改是否来源于mutations（只在开发环境中调试，生产环境移除严格模式【会消耗性能】）
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state,
  actions,
  getters,
  mutations,
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
