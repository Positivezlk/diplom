<script setup>
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast-motion">
        <article
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="['toast-card', `toast-${toast.type}`]"
        >
          <div class="toast-icon">
            {{ toast.type === 'error' ? '!' : toast.type === 'warning' ? '?' : '✓' }}
          </div>
          <div class="toast-content">
            <strong>{{ toast.title }}</strong>
            <span v-if="toast.description">{{ toast.description }}</span>
          </div>
          <button class="toast-close" type="button" aria-label="Закрыть уведомление" @click="ui.removeToast(toast.id)">×</button>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
