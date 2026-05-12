<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import TaskCard from '@/components/TaskCard.vue'
import VoiceAssistantButton from '@/components/VoiceAssistantButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const tasks = useTasksStore()
const ui = useUiStore()
const router = useRouter()

const showCreate = ref(false)
const showProfile = ref(false)
const selectedTask = ref(null)
const profileRef = ref(null)
const search = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const saving = ref(false)

const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  confirmText: 'Подтвердить',
  danger: false,
  action: null,
})

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  deadline: '',
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

const selectedTaskDetails = computed(() => {
  if (!selectedTask.value) return null
  return tasks.tasks.find((task) => task.id === selectedTask.value.id) || selectedTask.value
})

function priorityText(priority) {
  return ({ low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' }[priority] || 'Средний')
}

function statusText(status) {
  return ({ todo: 'К выполнению', in_progress: 'В процессе', done: 'Выполнено' }[status] || 'К выполнению')
}

function formatDate(dateValue) {
  if (!dateValue) return 'Без дедлайна'
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateValue))
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.deadline = ''
}

function closeProfileOnOutsideClick(event) {
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfile.value = false
  }
}

function handleEscape(event) {
  if (event.key !== 'Escape') return
  if (confirmState.open) {
    closeConfirm()
    return
  }
  if (selectedTask.value) {
    selectedTask.value = null
    return
  }
  if (showCreate.value) showCreate.value = false
}

onMounted(async () => {
  document.addEventListener('click', closeProfileOnOutsideClick)
  document.addEventListener('keydown', handleEscape)

  const currentUser = await auth.restoreSession()
  if (!currentUser) {
    router.push('/login')
    return
  }
  await tasks.fetchTasks()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeProfileOnOutsideClick)
  document.removeEventListener('keydown', handleEscape)
})

async function addTask() {
  if (!form.title.trim()) {
    ui.pushToast({ title: 'Введите заголовок карточки', type: 'warning' })
    return
  }

  saving.value = true
  try {
    await tasks.addTask({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      deadline: form.deadline || null,
    })
    resetForm()
    showCreate.value = false
  } finally {
    saving.value = false
  }
}

function askConfirm({ title, message, confirmText = 'Подтвердить', danger = false, action }) {
  confirmState.open = true
  confirmState.title = title
  confirmState.message = message
  confirmState.confirmText = confirmText
  confirmState.danger = danger
  confirmState.action = action
}

function closeConfirm() {
  confirmState.open = false
  confirmState.action = null
}

async function runConfirmedAction() {
  const action = confirmState.action
  closeConfirm()
  if (action) await action()
}

function requestDelete(task) {
  askConfirm({
    title: 'Удалить задачу?',
    message: 'Вы уверены, что хотите удалить задачу?',
    confirmText: 'Удалить',
    danger: true,
    action: async () => {
      await tasks.deleteTask(task.id)
      if (selectedTask.value?.id === task.id) selectedTask.value = null
    },
  })
}

function requestUpdate(id, payload) {
  askConfirm({
    title: 'Сохранить изменения?',
    message: 'Вы уверены, что хотите сохранить изменения?',
    confirmText: 'Сохранить',
    action: async () => {
      await tasks.updateTask(id, payload)
    },
  })
}

function requestStatusUpdate(task, status) {
  if (task.status === status) return
  requestUpdate(task.id, { status })
}

function requestLogout() {
  askConfirm({
    title: 'Выйти из аккаунта?',
    message: 'Вы уверены, что хотите выйти из аккаунта?',
    confirmText: 'Выйти',
    danger: true,
    action: async () => {
      auth.logout()
      tasks.clearTasks()
      showProfile.value = false
      ui.pushToast({ title: 'Вы вышли из аккаунта' })
      router.push('/login')
    },
  })
}
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <div class="brand-block">
        <div class="brand-logo">✓</div>
        <div>
          <p class="eyebrow">Рабочее пространство</p>
          <h1>Смарт Менеджер</h1>
          <span>Планируйте задачи, сроки и приоритеты без хаоса.</span>
        </div>
      </div>

      <div class="header-actions">
        <button class="theme-toggle" type="button" :aria-label="ui.isDark ? 'Включить светлую тему' : 'Включить тёмную тему'" @click="ui.toggleTheme">
          <span class="theme-toggle-track"><span class="theme-toggle-thumb">{{ ui.isDark ? '☾' : '☀' }}</span></span>
          <span>{{ ui.isDark ? 'Тёмная' : 'Светлая' }}</span>
        </button>

        <div ref="profileRef" class="profile-wrapper" @click.stop="showProfile = !showProfile">
          <div class="profile-menu">
            <div class="profile-avatar">{{ auth.user?.name?.charAt(0)?.toUpperCase() || 'П' }}</div>
            <div class="profile-copy">
              <strong>{{ auth.user?.name }}</strong>
              <span>{{ auth.user?.email }}</span>
            </div>
          </div>

          <Transition name="dropdown-motion">
            <div v-if="showProfile" class="profile-dropdown">
              <button class="dropdown-item" type="button" @click.stop="ui.toggleTheme">{{ ui.isDark ? '☀ Светлая тема' : '☾ Тёмная тема' }}</button>
              <button class="dropdown-item logout-item" type="button" @click.stop="requestLogout">⎋ Выйти</button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <section class="stats-grid" aria-label="Статистика задач">
      <article class="stat-card stat-purple">
        <div class="stat-icon">📋</div>
        <div><span>Всего задач</span><strong>{{ stats.total }}</strong></div>
      </article>
      <article class="stat-card stat-orange">
        <div class="stat-icon">🗂</div>
        <div><span>К выполнению</span><strong>{{ stats.todo }}</strong></div>
      </article>
      <article class="stat-card stat-blue">
        <div class="stat-icon">⟳</div>
        <div><span>В процессе</span><strong>{{ stats.progress }}</strong></div>
      </article>
      <article class="stat-card stat-green">
        <div class="stat-icon">✓</div>
        <div><span>Выполнено</span><strong>{{ stats.done }}</strong></div>
      </article>
    </section>

    <section class="workspace-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Задачи</p>
          <h2>Мои задачи</h2>
        </div>
        <div class="panel-heading-actions">
          <span>{{ filteredTasks.length }} из {{ tasks.tasks.length }}</span>
          <VoiceAssistantButton />
          <button class="button button-primary" type="button" @click="showCreate = true">Создать задачу</button>
        </div>
      </div>

      <div class="filters-panel">
        <label class="search-field">
          <span>Поиск</span>
          <input v-model="search" class="field-control" placeholder="Название или описание" />
        </label>
        <label class="field-label compact-label">
          Статус
          <select v-model="statusFilter" class="field-control">
            <option value="all">Все статусы</option>
            <option value="todo">К выполнению</option>
            <option value="in_progress">В процессе</option>
            <option value="done">Выполнено</option>
          </select>
        </label>
        <label class="field-label compact-label">
          Приоритет
          <select v-model="priorityFilter" class="field-control">
            <option value="all">Все приоритеты</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
            <option value="critical">Критический</option>
          </select>
        </label>
      </div>

      <div v-if="tasks.error" class="inline-error">{{ tasks.error }}</div>

      <div v-if="tasks.loading" class="task-grid">
        <div v-for="index in 6" :key="index" class="task-skeleton"></div>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-illustration">📋</div>
        <h2>Здесь пока нет карточек</h2>
        <p>Добавьте первую задачу с дедлайном и приоритетом — она сохранится в базе данных.</p>
        <button class="button button-primary" type="button" @click="showCreate = true">Создать задачу</button>
      </div>

      <TransitionGroup v-else name="card-motion" tag="div" class="task-grid">
        <TaskCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @open="selectedTask = $event"
          @delete="requestDelete"
          @update="tasks.updateTask"
        />
      </TransitionGroup>
    </section>

    <Transition name="modal-fade">
      <div v-if="showCreate" class="modal-backdrop" @click.self="showCreate = false">
        <form class="create-modal" @submit.prevent="addTask">
          <button class="modal-close" type="button" aria-label="Закрыть форму" @click="showCreate = false">×</button>
          <p class="eyebrow">Новая задача</p>
          <h2>Опишите задачу</h2>
          <p class="modal-subtitle">Статус будет установлен автоматически: «К выполнению».</p>

          <label class="field-label">
            Заголовок
            <input v-model="form.title" class="field-control" required maxlength="120" placeholder="Например: подготовить презентацию" />
          </label>

          <label class="field-label">
            Описание
            <textarea v-model="form.description" class="field-control" rows="5" maxlength="800" placeholder="Кратко опишите контекст, шаги и ожидаемый результат"></textarea>
          </label>

          <div class="form-row">
            <label class="field-label">
              Приоритет
              <select v-model="form.priority" class="field-control">
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </label>
            <label class="field-label">
              Дедлайн
              <input v-model="form.deadline" class="field-control" type="date" />
            </label>
          </div>

          <button class="button button-primary button-full" type="submit" :disabled="saving || !form.title.trim()">
            {{ saving ? 'Сохраняем...' : 'Создать задачу' }}
          </button>
        </form>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="selectedTaskDetails" class="modal-backdrop" @click.self="selectedTask = null">
        <section class="task-detail-modal" role="dialog" aria-modal="true" :aria-label="selectedTaskDetails.title">
          <button class="modal-close" type="button" aria-label="Закрыть карточку" @click="selectedTask = null">×</button>
          <div class="detail-topline">
            <span :class="['status-pill', `status-${selectedTaskDetails.status}`]">{{ statusText(selectedTaskDetails.status) }}</span>
            <span :class="['priority-chip', `priority-${selectedTaskDetails.priority}`]">{{ priorityText(selectedTaskDetails.priority) }}</span>
          </div>
          <h2>{{ selectedTaskDetails.title }}</h2>
          <p class="detail-description">{{ selectedTaskDetails.description || 'Описание не добавлено.' }}</p>
          <div class="detail-grid">
            <div><span>Дедлайн</span><strong>{{ formatDate(selectedTaskDetails.deadline) }}</strong></div>
            <div><span>Создано</span><strong>{{ formatDate(selectedTaskDetails.created_at) }}</strong></div>
          </div>
          <div class="status-actions">
            <button class="button button-soft" type="button" @click="requestStatusUpdate(selectedTaskDetails, 'todo')">К выполнению</button>
            <button class="button button-soft" type="button" @click="requestStatusUpdate(selectedTaskDetails, 'in_progress')">В процессе</button>
            <button class="button button-soft" type="button" @click="requestStatusUpdate(selectedTaskDetails, 'done')">Выполнено</button>
          </div>
          <div class="detail-actions">
            <button class="button button-danger" type="button" @click="requestDelete(selectedTaskDetails)">Удалить</button>
            <button class="button button-ghost" type="button" @click="selectedTask = null">Закрыть</button>
          </div>
        </section>
      </div>
    </Transition>


    <ConfirmDialog
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-text="confirmState.confirmText"
      :danger="confirmState.danger"
      @cancel="closeConfirm"
      @confirm="runConfirmedAction"
    />
  </main>
</template>
