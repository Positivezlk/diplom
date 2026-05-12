<script setup>
import { computed, reactive, ref, watch } from 'vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete', 'update', 'open'])
const editing = ref(false)
const confirmSaveOpen = ref(false)

const form = reactive({
  title: props.task.title,
  description: props.task.description,
  priority: props.task.priority,
  deadline: props.task.deadline || '',
})

const statusText = computed(() => ({
  todo: 'К выполнению',
  in_progress: 'В процессе',
  done: 'Выполнено',
}[props.task.status] || 'К выполнению'))

const priorityText = computed(() => ({
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}[props.task.priority] || 'Средний'))

const deadlineText = computed(() => {
  if (!props.task.deadline) return 'Без дедлайна'
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(props.task.deadline))
})

watch(
  () => props.task,
  (task) => {
    form.title = task.title
    form.description = task.description
    form.priority = task.priority
    form.deadline = task.deadline || ''
  },
)

function requestSave() {
  if (!form.title.trim()) return
  confirmSaveOpen.value = true
}

function confirmSave() {
  emit('update', props.task.id, {
    title: form.title.trim(),
    description: form.description,
    priority: form.priority,
    deadline: form.deadline || null,
  })
  confirmSaveOpen.value = false
  editing.value = false
}
</script>

<template>
  <article class="task-card" tabindex="0" @click="emit('open', task)" @keydown.enter="emit('open', task)">
    <template v-if="editing">
      <div class="task-edit-form" @click.stop>
        <label class="field-label">
          Заголовок
          <input v-model="form.title" class="field-control" maxlength="120" />
        </label>
        <label class="field-label">
          Описание
          <textarea v-model="form.description" class="field-control" rows="4" />
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
      </div>
    </template>

    <template v-else>
      <div class="task-card-header">
        <span :class="['status-dot', `status-${task.status}`]"></span>
        <span class="task-status">{{ statusText }}</span>
        <button class="icon-button danger" type="button" aria-label="Удалить задачу" @click.stop="emit('delete', task)">×</button>
      </div>

      <h3 class="task-title" :title="task.title">{{ task.title }}</h3>
      <p class="task-description" :title="task.description">{{ task.description || 'Описание не добавлено' }}</p>

      <div class="task-meta">
        <span :class="['priority-chip', `priority-${task.priority}`]">{{ priorityText }}</span>
        <span class="deadline-chip">{{ deadlineText }}</span>
      </div>
    </template>

    <div class="task-actions" @click.stop>
      <button v-if="editing" class="button button-primary button-small" type="button" :disabled="!form.title.trim()" @click="requestSave">Сохранить</button>
      <button v-if="editing" class="button button-ghost button-small" type="button" @click="editing = false">Отмена</button>
      <button v-else class="button button-ghost button-small" type="button" @click="editing = true">Редактировать</button>
      <button v-if="!editing" class="button button-soft button-small" type="button" @click="emit('open', task)">Подробнее</button>
    </div>
    <ConfirmDialog
      :open="confirmSaveOpen"
      title="Сохранить изменения?"
      message="Вы уверены, что хотите сохранить изменения?"
      confirm-text="Сохранить"
      @cancel="confirmSaveOpen = false"
      @confirm="confirmSave"
    />
  </article>
</template>
