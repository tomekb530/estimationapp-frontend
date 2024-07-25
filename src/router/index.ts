import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAccountStore } from '@/stores/account'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Strona Główna',
      component: HomeView
    },
    {
      path: '/admin',
      redirect: "/admin/users",
      name: 'none',
      meta: {
        roles: ['superadmin', 'admin']
      }
    },
    {
      path: '/admin/users',
      name: 'Użytkownicy',
      component: () => import('../views/UsersView.vue'),
      meta: {
        roles: ['superadmin', 'admin']
      }
    },
    {
      path: '/about',
      name: 'O Aplikacji',
      component: () => import('../views/AboutView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const accountStore = useAccountStore()
  if (to.matched.some(record => record.meta.roles)) {
    if (!accountStore.isAuthenticated) {
      next({ name: 'Strona Główna' })
    } else {
      const roles = to.meta.roles as string[]
      if (!roles.includes(accountStore.userData.role)) {
        next({ name: 'Strona Główna' })
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
