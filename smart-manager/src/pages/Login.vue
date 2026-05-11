<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

async function submit() {
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    alert('Ошибка входа')
  }
}
</script>

<template>
  <div class="auth-page">

    <h2>Вход</h2>

    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Пароль" />

    <button @click="submit">
      Войти
    </button>

    <router-link to="/register">
      Нет аккаунта? Регистрация
    </router-link>

  </div>
</template>