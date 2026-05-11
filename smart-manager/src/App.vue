<script setup>
import { onMounted, reactive, onBeforeUnmount, computed, ref } from 'vue'
import TaskCard from './components/TaskCard.vue'
import { useTasksStore } from './stores/tasks'
import { useAuthStore } from './stores/auth'
import { useRouter } from './src/pages'

const store = useTasksStore()
const auth = useAuthStore()
const router = useRouter()

const showCreate = ref(false)
const showProfile = ref(false)
const profileRef = ref(null)

const form = reactive({
  title: '',
  description: '',
  priority: '',
  deadline: ''
})

const stats = computed(() => ({
  total: store.tasks.length,
  done: store.tasks.filter(t => t.status === 'done').length,
  progress: store.tasks.filter(t => t.status === 'in_progress').length,
  todo: store.tasks.filter(t => t.status === 'todo').length
}))

/**
 * INIT
 */
onMounted(() => {
  // защита (страховка помимо router guard)
  if (!auth.session) {
    router.push('/login')
    return
  }

  // если есть загрузка задач
  if (store.fetchTasks) {
    store.fetchTasks()
  }
})

/**
 * ADD TASK
 */
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

  store.setToast?.('Задача успешно создана ✅')
  showCreate.value = false
}

/**
 * OUTSIDE CLICK
 */
const handleClickOutside = (event) => {
  if (!profileRef.value) return

  if (!profileRef.value.contains(event.target)) {
    showProfile.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

/**
 * TASK ACTIONS
 */
async function deleteTask(id) {
  await store.deleteTask(id)
}

async function updateTask(data) {
  await store.updateTask(data)
}
</script>

<template>

<div class="container-app">

  <!-- TOPBAR -->
  <div class="topbar">

    <div class="logo-block">
      <div class="logo-icon">✓</div>

      <div>
        <div class="logo-title">Smart Task Manager</div>
        <div class="logo-sub">AI Productivity Workspace</div>
      </div>
    </div>

    <div class="topbar-actions">

      <div
        class="profile-wrapper"
        ref="profileRef"
        @click.stop="showProfile = !showProfile"
      >

        <div class="profile-menu">
          <img class="profile-avatar" src="https://i.pravatar.cc/100">

          <div>
            <div class="profile-name">Alexander</div>
            <div class="profile-email">alex@gmail.com</div>
          </div>

        </div>

      </div>

    </div>

  </div>

  <!-- PROFILE MENU -->
  <div v-if="showProfile" class="profile-dropdown">

    <button class="dropdown-item">
      ⚙ Настройки
    </button>

    <button class="dropdown-item logout-item" @click="auth.logout(); router.push('/login')">
      ⎋ Выйти
    </button>

  </div>

  <!-- STATS -->
  <div class="stats-grid">

    <div class="stat-card stat-purple">
      <div class="stat-top">
        <div class="stat-icon">📋</div>
        <div>
          <div class="stat-label">Всего задач</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </div>
    </div>

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

  </div>

  <!-- MAIN -->
  <div class="main-grid">

    <div class="panel">

      <div class="panel-title">
        Мои задачи
      </div>

      <div class="panel-line"></div>

      <div class="filters">

        <input class="input-soft search-box" placeholder="Поиск задач..." />

        <select class="input-soft">
          <option>Статус: Все</option>
        </select>

        <select class="input-soft">
          <option>Приоритет</option>
        </select>

      </div>

      <div class="empty-state">

        <div class="empty-icon">📋</div>

        <div class="empty-title">Задач пока нет</div>

        <div class="empty-sub">Создай свою первую задачу</div>

        <button class="btn-gradient" @click="showCreate = true">
          + Создать задачу
        </button>

      </div>

    </div>

    <!-- CREATE PANEL -->
    <transition name="create-panel-anim">

      <div v-if="showCreate" class="panel create-panel">

        <button class="close-create" @click="showCreate = false">×</button>

        <div class="panel-title">
          Новая задача
        </div>

        <div class="form-grid">

          <input v-model="form.title" class="input-soft" placeholder="Название задачи" />

          <textarea v-model="form.description" class="input-soft" placeholder="Описание"></textarea>

          <input v-model="form.deadline" class="input-soft" type="date" />

          <select v-model="form.priority" class="input-soft">
            <option value="" disabled>Приоритет</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>

          <button class="btn-gradient" @click="addTask">
            Добавить задачу
          </button>

        </div>

      </div>

    </transition>

    <div v-if="showCreate" class="overlay" @click="showCreate = false" />

  </div>

</div>

</template>