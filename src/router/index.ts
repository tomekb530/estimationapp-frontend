import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAccountStore } from '@/stores/account'
import { get } from '@/util/backendHelper'
import { useToast } from 'vue-toastification'
const toast = useToast()

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
      name: 'Admin',
      meta: {
        roles: ['superadmin', 'admin'],
        dontshow: true
      }
    },
    {
      path: '/admin/users',
      name: 'Użytkownicy',
      component: () => import('../views/UsersView.vue'),
      meta: {
        roles: ['superadmin']
      }
    },
    {
      path: '/about',
      name: 'O Aplikacji',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/email/verify/:id/:token',
      name: 'Weryfikacja Email',
      component: () => import('../views/AboutView.vue'),
      meta: {
        dontshow: true,
      }
    },
    {
      path: '/reset-password/:token',
      name: 'Reset Hasła',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: {
        dontshow: true,
      }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const accountStore = useAccountStore()
  if (!accountStore.isAuthenticated) {
    try{
      await accountStore.checkAuth()
    }catch(e){
      //toast.error("Nie jesteś zalogowany");
    }
  }
  if (to.name === "Weryfikacja Email") {
    const req = to.fullPath
    try{
      const response = await get(req)
      if(response.status === 204){
        toast.success("Adres email został zweryfikowany")
      }
    }
    catch(e: any){
      toast.error("Nie udało się zweryfikować adresu email: " + e.response.data.message)
    }finally{
      await accountStore.checkAuth()
      next({ name: 'Strona Główna' })
    }
  }


  if (to.matched.some(record => record.meta.roles)) {
    if (!accountStore.isAuthenticated) {
      try{
        await accountStore.checkAuth()
      }catch(e){
        toast.error("Nie jesteś zalogowany");
      }
    }
    if (!accountStore.isAuthenticated) {
      next({ name: 'Strona Główna' })
    } else {
      const roles = to.meta.roles as string[]
      if (accountStore.userData && !roles.includes(accountStore.userData.role)) {
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
