<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')

async function submit() {
  if (password.value !== confirm.value) {
    alert('Пароли не совпадают')
    return
  }

  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
      confirm_password: confirm.value
    })

    router.push('/login')
  } catch (e) {
    alert('Ошибка регистрации')
  }
}
</script>

<template>
  <div class="auth-page">

    <h2>Регистрация</h2>

    <input v-model="name" placeholder="Имя" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Пароль" />
    <input v-model="confirm" type="password" placeholder="Повтор пароля" />

    <button @click="submit">
      Создать аккаунт
    </button>

    <router-link to="/login">
      Уже есть аккаунт
    </router-link>

  </div>
</template>