<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')

async function submit() {
  message.value = ''

  if (password.value !== confirmPassword.value) {
    message.value = 'Пароли не совпадают'
    return
  }

  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      confirm_password: confirmPassword.value,
    })
    router.push('/login')
  } catch (err) {
    message.value = auth.error
  }
}
</script>

<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <div class="brand-badge">✓</div>
      <h1>Регистрация</h1>
      <p>Создайте аккаунт, чтобы сохранять задачи в SQLite.</p>

      <label>
        Имя
        <input v-model="name" type="text" autocomplete="name" required placeholder="Алексей" />
      </label>

      <label>
        Email
        <input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com" />
      </label>

      <label>
        Пароль
        <input v-model="password" type="password" autocomplete="new-password" minlength="6" required placeholder="Минимум 6 символов" />
      </label>

      <label>
        Повторите пароль
        <input v-model="confirmPassword" type="password" autocomplete="new-password" minlength="6" required placeholder="Повторите пароль" />
      </label>

      <div v-if="message" class="error-message">{{ message }}</div>

      <button class="primary-btn" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Создаём...' : 'Создать аккаунт' }}
      </button>

      <router-link to="/login">Уже есть аккаунт? Войти</router-link>
    </form>
  </main>
</template>
