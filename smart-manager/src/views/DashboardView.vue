<script setup>
import { computed } from 'vue'
import { useTasksStore } from '../stores/tasks'

const store = useTasksStore()

const total = computed(() => store.tasks.length)

const done = computed(() =>
  store.tasks.filter(t => t.status === 'done').length
)

const progress = computed(() =>
  store.tasks.filter(t => t.status === 'in_progress').length
)
</script>

<template>
  <div class="row g-4 mb-4">

  <div class="col-md-3">
    <div class="glass stat-card">
      <div class="stat-label">
        Всего задач
      </div>

      <div class="stat-value">
        {{ stats.total }}
      </div>
    </div>
  </div>

  <div class="col-md-3">
    <div class="glass stat-card">
      <div class="stat-label">
        Выполнено
      </div>

      <div class="stat-value">
        {{ stats.done }}
      </div>
    </div>
  </div>

  <div class="col-md-3">
    <div class="glass stat-card">
      <div class="stat-label">
        В процессе
      </div>

      <div class="stat-value">
        {{ stats.progress }}
      </div>
    </div>
  </div>

  <div class="col-md-3">
    <div class="glass stat-card">
      <div class="stat-label">
        Todo
      </div>

      <div class="stat-value">
        {{ stats.todo }}
      </div>
    </div>
  </div>

</div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 20px;
}
</style>