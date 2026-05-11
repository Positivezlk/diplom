import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import App from 'App.vue'

// ВАЖНО: у тебя pages, не components
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'

const routes = [
  {
    path: '/',
    component: App,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// auth guard
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuth) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/register') && auth.isAuth) {
    return '/'
  }
})

export default router