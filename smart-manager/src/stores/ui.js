import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

let toastId = 0

function getInitialTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUiStore = defineStore('ui', () => {
  const theme = ref(getInitialTheme())
  const toasts = ref([])
  const isDark = computed(() => theme.value === 'dark')

  function applyTheme() {
    document.documentElement.dataset.theme = theme.value
    localStorage.setItem('theme', theme.value)
  }

  function setTheme(nextTheme) {
    theme.value = nextTheme
    applyTheme()
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
    pushToast({
      type: 'success',
      title: isDark.value ? 'Тёмная тема включена' : 'Светлая тема включена',
    })
  }

  function pushToast({ title, description = '', type = 'success', timeout = 3200 }) {
    const id = ++toastId
    toasts.value.push({ id, title, description, type })

    if (timeout > 0) {
      window.setTimeout(() => removeToast(id), timeout)
    }

    return id
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  applyTheme()

  return { theme, toasts, isDark, setTheme, toggleTheme, pushToast, removeToast }
})
