import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/styles.css'
import router from './router'

const app = createApp(App)

createApp(App)
  .use(createPinia())
  .use(router)
  .mount('#app')

app.use(createPinia())

app.mount('#app')