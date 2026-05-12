<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete', 'update'])
const editing = ref(false)

const form = reactive({
  title: props.task.title,
  description: props.task.description,
  status: props.task.status,
  priority: props.task.priority,
})

watch(
  () => props.task,
  (task) => {
    form.title = task.title
    form.description = task.description
    form.status = task.status
    form.priority = task.priority
  },
)

function save() {
  emit('update', props.task.id, { ...form })
  editing.value = false
}
</script>

<template>
  <article class="glass task-card">
    <template v-if="editing">
      <div class="form-grid task-edit-form">
        <input v-model="form.title" class="input-soft" />
        <textarea v-model="form.description" class="input-soft" rows="3" />
        <div class="two-cols">
          <select v-model="form.status" class="input-soft">
            <option value="todo">Todo</option>
            <option value="in_progress">В процессе</option>
            <option value="done">Выполнена</option>
          </select>
          <select v-model="form.priority" class="input-soft">
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="task-card-top">
        <div class="task-title">{{ task.title }}</div>
        <button class="icon-btn danger-icon" type="button" @click="emit('delete', task.id)">×</button>
      </div>

      <div class="task-desc">{{ task.description || 'Без описания' }}</div>

      <div class="task-bottom">
        <div class="badges-row">
          <div class="badge-modern">{{ task.status === 'todo' ? 'Новая' : task.status === 'in_progress' ? 'В процессе' : 'Выполнена' }}</div>
          <div :class="['priority', task.priority]">{{ task.priority }}</div>
        </div>
      </div>
    </template>

    <div class="task-actions">
      <button v-if="editing" class="btn-gradient task-action-primary" type="button" @click="save">Сохранить</button>
      <button v-if="editing" class="soft-action" type="button" @click="editing = false">Отмена</button>
      <button v-else class="soft-action" type="button" @click="editing = true">Изменить</button>
    </div>
  </article>
</template>
