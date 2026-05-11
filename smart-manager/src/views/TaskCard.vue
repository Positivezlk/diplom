<template>
  <div class="glass task-card h-100">

    <div class="d-flex justify-content-between">

      <div class="task-title">
        {{ task.title }}
      </div>

      <button
        class="btn btn-sm btn-outline-danger rounded-circle"
        @click="$emit('delete', task.id)"
      >
        ×
      </button>

    </div>

    <div class="task-desc">
      {{ task.description || 'Без описания' }}
    </div>

    <div class="task-bottom">

      <div class="d-flex gap-2">

        <div class="badge-modern">
        {{
            task.status === 'todo'
            ? 'Новая'
            : task.status === 'in_progress'
            ? 'В процессе'
            : 'Выполнена'
        }}
        </div>

        <div class="badge-modern">
          {{ task.status }}
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
defineProps({
  task: Object
})
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: .2s;
}

.task-card:hover {
  transform: translateY(-4px);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top button {
  border: none;
  background: #ef4444;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  cursor: pointer;
}

.bottom {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.bottom span {
  background: #eef2ff;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
}
</style>