import { createApp } from 'vue'
import './style.css'
import './assets/style.css'
import App from './App.vue'
import {createRouter, createWebHistory, Router, RouteRecordRaw} from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/md',
    name: 'Markdown',
    component: () => import('@/pages/Md.vue'),
    meta: {
      title: 'Markdown'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Markdown2',
    component: () => import('@/pages/Md.vue'),
    meta: {
      title: 'Markdown'
    }
  }
]

const router: Router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
