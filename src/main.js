import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import '@/assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Validate the Laravel session on every hard page refresh.
// We import after createPinia() so the store is available.
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
auth.fetchUser()

app.mount('#app')
