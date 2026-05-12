import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { useUiStore } from '@/stores/ui'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref('')
  const toast = ref('')

  function setToast(message, type = 'success') {
    toast.value = message
    useUiStore().pushToast({ title: message, type })
  }

  async function fetchTasks() {
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/tasks')
      tasks.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Не удалось загрузить задачи'
      useUiStore().pushToast({ title: error.value, type: 'error' })
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addTask(payload) {
    const { data } = await api.post('/tasks', payload)
    tasks.value.unshift(data)
    setToast('Карточка успешно создана')
    return data
  }

  async function updateTask(id, payload) {
    const { data } = await api.put(`/tasks/${id}`, payload)
    const index = tasks.value.findIndex((task) => task.id === id)
    if (index !== -1) tasks.value[index] = data
    setToast('Изменения сохранены')
    return data
  }

  async function deleteTask(id) {
    await api.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter((task) => task.id !== id)
    setToast('Задача удалена')
  }

  function clearTasks() {
    tasks.value = []
  }

  return { tasks, loading, error, toast, setToast, fetchTasks, addTask, updateTask, deleteTask, clearTasks }
})
