import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Strona Główna',
      component: HomeView
    },

    {
      path: '/about',
      name: 'O Aplikacji',
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
