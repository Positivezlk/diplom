<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: 'Подтвердить',
  },
  cancelText: {
    type: String,
    default: 'Отмена',
  },
  danger: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="emit('cancel')">
        <section class="confirm-dialog" role="dialog" aria-modal="true" :aria-label="title">
          <div :class="['confirm-mark', { 'confirm-mark-danger': danger }]">
            {{ danger ? '!' : '✓' }}
          </div>
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <div class="confirm-actions">
            <button class="button button-ghost" type="button" @click="emit('cancel')">{{ cancelText }}</button>
            <button :class="['button', danger ? 'button-danger' : 'button-primary']" type="button" @click="emit('confirm')">
              {{ confirmText }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
