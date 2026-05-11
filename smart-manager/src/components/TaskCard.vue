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
  <article class="task-card">
    <template v-if="editing">
      <input v-model="form.title" class="input-soft" />
      <textarea v-model="form.description" class="input-soft" rows="3" />
      <div class="task-edit-grid">
        <select v-model="form.status" class="input-soft">
          <option value="todo">Todo</option>
          <option value="in_progress">В процессе</option>
          <option value="done">Готово</option>
        </select>
        <select v-model="form.priority" class="input-soft">
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>
    </template>

    <template v-else>
      <div class="task-card-header">
        <h3>{{ task.title }}</h3>
        <span :class="['priority', `priority-${task.priority}`]">{{ task.priority }}</span>
      </div>
      <p>{{ task.description || 'Без описания' }}</p>
      <div class="status-pill">{{ task.status }}</div>
    </template>

    <div class="task-actions">
      <button v-if="editing" class="small-btn success" @click="save">Сохранить</button>
      <button v-if="editing" class="small-btn" @click="editing = false">Отмена</button>
      <button v-else class="small-btn" @click="editing = true">Изменить</button>
      <button class="small-btn danger" @click="emit('delete', task.id)">Удалить</button>
    </div>
  </article>
</template>
