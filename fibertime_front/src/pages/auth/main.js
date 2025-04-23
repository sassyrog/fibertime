import { createApp } from 'vue'
import '@/shared/styles/style.css'
import Auth from './Auth.vue'
import router from './router'

createApp(Auth)
	.use(router)
	.mount('#app')
