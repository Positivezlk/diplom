import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { useUiStore } from '@/stores/ui'

function readStoredUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('access_token') || '')
  const user = ref(readStoredUser())
  const loading = ref(false)
  const error = ref('')

  const isAuth = computed(() => Boolean(token.value))

  function setSession(accessToken, currentUser) {
    token.value = accessToken
    user.value = currentUser
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('user', JSON.stringify(currentUser))
  }

  async function login(email, password) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setSession(data.access_token, data.user)
      useUiStore().pushToast({ title: 'Вы успешно вошли' })
      return data.user
    } catch (err) {
      error.value = err.response?.data?.detail || 'Не удалось войти'
      useUiStore().pushToast({ title: error.value, type: 'error' })
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.post('/auth/register', payload)
      useUiStore().pushToast({ title: 'Аккаунт создан', description: 'Теперь войдите в систему' })
      return data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Не удалось зарегистрироваться'
      useUiStore().pushToast({ title: error.value, type: 'error' })
      throw err
    } finally {
      loading.value = false
    }
  }

  async function restoreSession() {
    if (!token.value) return null
    try {
      const { data } = await api.get('/auth/me')
      user.value = data
      localStorage.setItem('user', JSON.stringify(data))
      return data
    } catch (err) {
      logout()
      return null
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  return { token, user, loading, error, isAuth, login, register, restoreSession, logout }
})
