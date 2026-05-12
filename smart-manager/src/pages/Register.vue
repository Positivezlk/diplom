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
    <section class="auth-shell">
      <div class="auth-hero">
        <button class="theme-toggle auth-theme" type="button" @click="ui.toggleTheme">
          <span class="theme-toggle-track"><span class="theme-toggle-thumb">{{ ui.isDark ? '☾' : '☀' }}</span></span>
          <span>{{ ui.isDark ? 'Тёмная тема' : 'Светлая тема' }}</span>
        </button>
        <div class="brand-badge">✓</div>
        <p class="eyebrow">Новый профиль</p>
        <h1>Создайте рабочее пространство</h1>
        <p>Регистрация занимает меньше минуты. После входа ваши карточки будут сохраняться локально в базе проекта.</p>
      </div>

      <form class="auth-card" @submit.prevent="submit">
        <h2>Регистрация</h2>

        <label>
          Имя
          <input v-model="name" type="text" autocomplete="name" required placeholder="Например: Алексей" />
        </label>

        <label>
          Электронная почта
          <input v-model="email" type="email" autocomplete="email" required placeholder="pochta@primer.ru" />
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
    </section>
  </main>
</template>
