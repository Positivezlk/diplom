<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import TaskCard from '@/components/TaskCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const auth = useAuthStore()
const tasks = useTasksStore()
const router = useRouter()

const form = reactive({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
})

const stats = computed(() => ({
  total: tasks.tasks.length,
  done: tasks.tasks.filter((task) => task.status === 'done').length,
  progress: tasks.tasks.filter((task) => task.status === 'in_progress').length,
  todo: tasks.tasks.filter((task) => task.status === 'todo').length,
}))

onMounted(async () => {
  const currentUser = await auth.restoreSession()
  if (!currentUser) {
    router.push('/login')
    return
  }
  await tasks.fetchTasks()
})

async function addTask() {
  if (!form.title.trim()) return
  await tasks.addTask({ ...form, title: form.title.trim() })
  form.title = ''
  form.description = ''
  form.status = 'todo'
  form.priority = 'medium'
}

async function logout() {
  auth.logout()
  tasks.clearTasks()
  router.push('/login')
}
</script>

<template>
  <main class="dashboard-page">
    <header class="topbar">
      <div class="logo-block">
        <div class="logo-icon">✓</div>
        <div>
          <div class="logo-title">Smart Manager</div>
          <div class="logo-sub">Vue 3 + FastAPI + SQLite</div>
        </div>
      </div>

      <div class="user-block">
        <div>
          <strong>{{ auth.user?.name }}</strong>
          <span>{{ auth.user?.email }}</span>
        </div>
        <button class="small-btn danger" @click="logout">Выйти</button>
      </div>
    </header>

    <section class="stats-grid">
      <div class="stat-card"><span>Всего задач</span><strong>{{ stats.total }}</strong></div>
      <div class="stat-card"><span>Выполнено</span><strong>{{ stats.done }}</strong></div>
      <div class="stat-card"><span>В процессе</span><strong>{{ stats.progress }}</strong></div>
      <div class="stat-card"><span>Todo</span><strong>{{ stats.todo }}</strong></div>
    </section>

    <section class="workspace-grid">
      <form class="panel create-panel" @submit.prevent="addTask">
        <h2>Новая задача</h2>
        <input v-model="form.title" class="input-soft" required placeholder="Название задачи" />
        <textarea v-model="form.description" class="input-soft" rows="5" placeholder="Описание" />
        <select v-model="form.status" class="input-soft">
          <option value="todo">Todo</option>
          <option value="in_progress">В процессе</option>
          <option value="done">Готово</option>
        </select>
        <select v-model="form.priority" class="input-soft">
          <option value="low">Низкий приоритет</option>
          <option value="medium">Средний приоритет</option>
          <option value="high">Высокий приоритет</option>
        </select>
        <button class="primary-btn" type="submit">Добавить</button>
      </form>

      <section class="panel tasks-panel">
        <div class="panel-header">
          <h2>Мои задачи</h2>
          <span v-if="tasks.loading">Загрузка...</span>
        </div>

        <div v-if="tasks.error" class="error-message">{{ tasks.error }}</div>
        <div v-if="tasks.toast" class="toast-message">{{ tasks.toast }}</div>

        <div v-if="!tasks.loading && tasks.tasks.length === 0" class="empty-state">
          Пока нет задач. Создайте первую задачу слева.
        </div>

        <div class="tasks-grid">
          <TaskCard
            v-for="task in tasks.tasks"
            :key="task.id"
            :task="task"
            @delete="tasks.deleteTask"
            @update="tasks.updateTask"
          />
        </div>
      </section>
    </section>
  </main>
</template>
