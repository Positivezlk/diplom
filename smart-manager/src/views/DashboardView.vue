<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import TaskCard from '@/components/TaskCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const auth = useAuthStore()
const tasks = useTasksStore()
const router = useRouter()

const showCreate = ref(false)
const showProfile = ref(false)
const profileRef = ref(null)
const search = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')

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

const filteredTasks = computed(() => {
  const query = search.value.trim().toLowerCase()

  return tasks.tasks.filter((task) => {
    const matchesSearch = !query
      || task.title.toLowerCase().includes(query)
      || (task.description || '').toLowerCase().includes(query)
    const matchesStatus = statusFilter.value === 'all' || task.status === statusFilter.value
    const matchesPriority = priorityFilter.value === 'all' || task.priority === priorityFilter.value

    return matchesSearch && matchesStatus && matchesPriority
  })
})

function closeProfileOnOutsideClick(event) {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfile.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', closeProfileOnOutsideClick)

  const currentUser = await auth.restoreSession()
  if (!currentUser) {
    router.push('/login')
    return
  }
  await tasks.fetchTasks()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeProfileOnOutsideClick)
})

async function addTask() {
  if (!form.title.trim()) return

  await tasks.addTask({
    title: form.title.trim(),
    description: form.description,
    status: form.status,
    priority: form.priority,
  })

  form.title = ''
  form.description = ''
  form.status = 'todo'
  form.priority = 'medium'
  showCreate.value = false
}

async function logout() {
  auth.logout()
  tasks.clearTasks()
  showProfile.value = false
  router.push('/login')
}
</script>

<template>
  <main class="container-app">
    <header class="topbar">
      <div class="logo-block">
        <div class="logo-icon">✓</div>
        <div>
          <div class="logo-title">Smart Task Manager</div>
          <div class="logo-sub">AI Productivity Workspace</div>
        </div>
      </div>

      <div class="topbar-actions">
        <div ref="profileRef" class="profile-wrapper" @click.stop="showProfile = !showProfile">
          <div class="profile-menu">
            <div class="profile-avatar profile-avatar-fallback">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div>
              <div class="profile-name">{{ auth.user?.name }}</div>
              <div class="profile-email">{{ auth.user?.email }}</div>
            </div>
          </div>

          <div v-if="showProfile" class="profile-dropdown">
            <button class="dropdown-item" type="button">⚙ Настройки</button>
            <button class="dropdown-item logout-item" type="button" @click.stop="logout">⎋ Выйти</button>
          </div>
        </div>
      </div>
    </header>

    <section class="stats-grid">
      <div class="stat-card stat-purple">
        <div class="stat-top">
          <div class="stat-icon">📋</div>
          <div>
            <div class="stat-label">Всего задач</div>
            <div class="stat-value">{{ stats.total }}</div>
          </div>
        </div>
      </div>
      <button class="button button-primary" type="button" @click="showCreate = true">+ Новая карточка</button>
    </section>

    <section class="stats-grid" aria-label="Статистика задач">
      <article class="stat-card stat-purple">
        <div class="stat-icon">📋</div>
        <div><span>Всего задач</span><strong>{{ stats.total }}</strong></div>
      </article>
      <article class="stat-card stat-green">
        <div class="stat-icon">✓</div>
        <div><span>Выполнено</span><strong>{{ stats.done }}</strong></div>
      </article>
      <article class="stat-card stat-blue">
        <div class="stat-icon">⟳</div>
        <div><span>В процессе</span><strong>{{ stats.progress }}</strong></div>
      </article>
      <article class="stat-card stat-orange">
        <div class="stat-icon">🗂</div>
        <div><span>К выполнению</span><strong>{{ stats.todo }}</strong></div>
      </article>
    </section>

      <div class="stat-card stat-green">
        <div class="stat-top">
          <div class="stat-icon">✓</div>
          <div>
            <div class="stat-label">Выполнено</div>
            <div class="stat-value">{{ stats.done }}</div>
          </div>
        </div>
      </div>

      <div class="stat-card stat-blue">
        <div class="stat-top">
          <div class="stat-icon">⟳</div>
          <div>
            <div class="stat-label">В процессе</div>
            <div class="stat-value">{{ stats.progress }}</div>
          </div>
        </div>
      </div>

      <div class="stat-card stat-orange">
        <div class="stat-top">
          <div class="stat-icon">🗂</div>
          <div>
            <div class="stat-label">Todo</div>
            <div class="stat-value">{{ stats.todo }}</div>
          </div>
        </div>
      </div>


    <section class="main-grid">
      <div class="panel tasks-panel">
        <div class="panel-title">Мои задачи</div>
        <div class="panel-line"></div>

        <div class="filters">
          <input v-model="search" class="input-soft search-box" placeholder="Поиск задач..." />
          <select v-model="statusFilter" class="input-soft">
            <option value="all">Статус: Все</option>
            <option value="todo">Todo</option>
            <option value="in_progress">В процессе</option>
            <option value="done">Выполнено</option>
          </select>
          <select v-model="priorityFilter" class="input-soft">
            <option value="all">Приоритет</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div v-if="tasks.error" class="error-message">{{ tasks.error }}</div>

        <div v-if="tasks.loading" class="empty-state compact-state">
          <div class="empty-icon">⏳</div>
          <div class="empty-title">Загружаем задачи</div>
        </div>

        <div v-else-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <div class="empty-title">Задач пока нет</div>
          <div class="empty-sub">Создай свою первую задачу</div>
          <button class="btn-gradient" type="button" @click="showCreate = true">+ Создать задачу</button>
        </div>

        <div v-else class="tasks-list">
          <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @delete="tasks.deleteTask"
            @update="tasks.updateTask"
          />
        </div>
      </div>
    </section>

    <transition name="create-panel-anim">
      <form v-if="showCreate" class="panel create-panel" @submit.prevent="addTask">
        <button class="close-create" type="button" @click="showCreate = false">×</button>
        <div class="panel-title">Новая задача</div>
        <div class="panel-line"></div>

        <div class="form-grid">
          <input v-model="form.title" class="input-soft" required placeholder="Название задачи" />
          <textarea v-model="form.description" class="input-soft" placeholder="Описание"></textarea>
          <div class="two-cols">
            <select v-model="form.status" class="input-soft">
              <option value="todo">Todo</option>
              <option value="in_progress">В процессе</option>
              <option value="done">Выполнено</option>
            </select>
            <select v-model="form.priority" class="input-soft">
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </div>
          <button class="btn-gradient" type="submit">Добавить задачу</button>
        </div>
      </form>
    </transition>

    <div v-if="showCreate" class="overlay" @click="showCreate = false" />
    <button class="fab" type="button" aria-label="Создать задачу" @click="showCreate = true">+</button>
    <div v-if="tasks.toast" class="toast">{{ tasks.toast }}</div>
  </main>
</template>
