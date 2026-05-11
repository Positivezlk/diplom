<script setup>
import { ref } from 'vue'

const props = defineProps({
  task: Object
})

const emit = defineEmits(['delete', 'update'])

const editing = ref(false)

const form = ref({
  title: props.task.title,
  description: props.task.description
})

async function save() {
  emit('update', {
    id: props.task.id,
    title: form.value.title,
    description: form.value.description
  })

  editing.value = false
}
</script>

<template>
  <div class="card p-3 mb-3 shadow-sm">

    <div class="d-flex justify-content-between gap-3">

      <div class="flex-grow-1">

        <template v-if="editing">

          <input v-model="form.title" class="form-control mb-2" />

          <textarea v-model="form.description" class="form-control" />

        </template>

        <template v-else>

          <h4>{{ task.title }}</h4>

          <p class="mb-0">{{ task.description }}</p>

        </template>

      </div>

      <div class="d-flex flex-column gap-2">

        <button
          v-if="editing"
          @click="save"
          class="btn btn-success btn-sm"
        >
          Save
        </button>

        <button
          v-else
          @click="editing = true"
          class="btn btn-outline-primary btn-sm"
        >
          Edit
        </button>

        <button
          @click="emit('delete', task.id)"
          class="btn btn-outline-danger btn-sm"
        >
          Delete
        </button>

      </div>

    </div>

  </div>
  </template>
  <style>
    .task-card {
    border-radius: 14px;
    padding: 14px;
    background: white;
    border: 1px solid rgba(0,0,0,0.05);
    }

    .task-card h4 {
    font-size: 16px;
    font-weight: 600;
    }

    .task-card p {
    font-size: 13px;
    color: #6b7280;
    }

    /* кнопки справа */
    .task-actions button {
    width: 100%;
    }
    </style>