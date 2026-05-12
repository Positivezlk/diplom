<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const message = ref('')

async function submit() {
  message.value = ''
  try {
    await auth.login(email.value, password.value)
    router.push(route.query.redirect || '/dashboard')
  } catch (err) {
    message.value = auth.error
  }
}
</script>

<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="submit">
      <div class="brand-badge">✓</div>
      <h1>Вход</h1>
      <p>Войдите в Smart Manager, чтобы управлять задачами.</p>

      <label>
        Email
        <input v-model="email" type="email" autocomplete="email" required placeholder="you@example.com" />
      </label>

      <label>
        Пароль
        <input v-model="password" type="password" autocomplete="current-password" required placeholder="••••••••" />
      </label>

      <div v-if="message" class="error-message">{{ message }}</div>

      <button class="primary-btn" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Входим...' : 'Войти' }}
      </button>

      <router-link to="/register">Нет аккаунта? Зарегистрироваться</router-link>
    </form>
  </main>
</template>
