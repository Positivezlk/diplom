import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref([])
  const toast = ref('')
  let timer = null

  function setToast(msg) {
    toast.value = msg

    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      toast.value = ''
    }, 2500)
  }

  async function addTask(task) {
    tasks.value.unshift({
      id: Date.now(),
      ...task
    })

    setToast('Задача создана ✅')
  }

  return {
    tasks,
    toast,
    setToast,
    addTask
  }
})