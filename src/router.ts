import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainView from './views/Main.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: MainView
  },
  {
    path: '/main',
    redirect: '/'
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
