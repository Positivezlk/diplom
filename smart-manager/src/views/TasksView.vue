<script setup>
import { reactive } from 'vue'
import { useTasksStore } from '../stores/tasks'
import TaskCard from '../components/TaskCard.vue'

const store = useTasksStore()

const form = reactive({
  title: '',
  description: '',
  priority: '',
  deadline: ''
})

async function addTask() {
  if (!form.title.trim()) return

  await store.addTask({
    title: form.title,
    description: form.description,
    priority: form.priority,
    deadline: form.deadline,
    status: 'todo'
  })

  form.title = ''
  form.description = ''
  form.deadline = ''
  form.priority = ''

  showCreate.value = false

  toast.value = 'Задача успешно создана ✅'

  setTimeout(() => {
    toast.value = ''
  }, 2500)
}

async function deleteTask(id) {
  await store.deleteTask(id)
}
</script>

<template>

  <!-- ADD -->
  <div class="task-form">

    <input
      v-model="form.title"
      placeholder="Название"
    />

    <textarea
      v-model="form.description"
      placeholder="Описание"
    />

    <div class="task-date">
    📅 {{ task.deadline || 'Без даты' }}
    </div>

    <button @click="addTask">
      Добавить
    </button>

  </div>

  <!-- TASKS -->
  <div class="tasks-grid">

    <TaskCard
      v-for="task in store.tasks"
      :key="task.id"
      :task="task"
      @delete="deleteTask"
    />

  </div>

</template>

<style scoped>
.task-form {
  background: white;
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 30px;

  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-form input,
.task-form textarea {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
}

.task-form button {
  border: none;
  background: #4f46e5;
  color: white;
  padding: 14px;
  border-radius: 12px;
  cursor: pointer;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
</style>