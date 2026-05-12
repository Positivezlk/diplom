<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
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
    <section class="auth-shell">
      <div class="auth-hero">
        <button class="theme-toggle auth-theme" type="button" @click="ui.toggleTheme">
          <span class="theme-toggle-track"><span class="theme-toggle-thumb">{{ ui.isDark ? '☾' : '☀' }}</span></span>
          <span>{{ ui.isDark ? 'Тёмная тема' : 'Светлая тема' }}</span>
        </button>
        <div class="brand-badge">✓</div>
        <p class="eyebrow">Личный кабинет</p>
        <h1>С возвращением</h1>
        <p>Войдите, чтобы продолжить работу с задачами, дедлайнами и приоритетами.</p>
      </div>

      <form class="auth-card" @submit.prevent="submit">
        <h2>Вход</h2>

        <label>
          Электронная почта
          <input v-model="email" type="email" autocomplete="email" required placeholder="pochta@primer.ru" />
        </label>

        <label>
          Пароль
          <input v-model="password" type="password" autocomplete="current-password" required placeholder="Введите пароль" />
        </label>

        <div v-if="message" class="error-message">{{ message }}</div>

        <button class="primary-btn" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Входим...' : 'Войти' }}
        </button>

        <router-link to="/register">Нет аккаунта? Зарегистрироваться</router-link>
      </form>
    </section>
  </main>
</template>
