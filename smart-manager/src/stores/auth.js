import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API = 'http://localhost:8000/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(localStorage.getItem('session') || '')

  const isAuth = computed(() => !!session.value)

  /**
   * LOGIN
   */
  async function login(email, password) {
    try {
      const res = await axios.post(`${API}/login`, {
        email,
        password
      })

      session.value = res.data.session
      user.value = res.data.user

      localStorage.setItem('session', session.value)

      return true
    } catch (err) {
      console.error('Login error:', err)
      return false
    }
  }

  /**
   * REGISTER
   */
  async function register(data) {
    try {
      await axios.post(`${API}/register`, data)
      return true
    } catch (err) {
      console.error('Register error:', err)
      return false
    }
  }

  /**
   * LOGOUT
   */
  function logout() {
    session.value = ''
    user.value = null
    localStorage.removeItem('session')
  }

  /**
   * LOAD USER (после перезагрузки)
   */
  async function fetchUser() {
    if (!session.value) return

    try {
      const res = await axios.get(`${API}/me`, {
        headers: {
          Authorization: session.value
        }
      })

      user.value = res.data
    } catch (err) {
      logout()
    }
  }

  return {
    user,
    session,
    isAuth,
    login,
    register,
    logout,
    fetchUser
  }
})