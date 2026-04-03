import './assets/main.css'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import PrivacyPolicy from './views/Public/PrivacyPolicy.vue'

const privacyPolicyPaths = new Set([
  '/privacy-policy',
  '/privacy-policy/',
  '/privacy-policy/index.html',
])
const isPrivacyPolicyEntry = privacyPolicyPaths.has(window.location.pathname)

const app = createApp(isPrivacyPolicyEntry ? PrivacyPolicy : App)

if (!isPrivacyPolicyEntry) {
  app.use(router)
  app.use(VueApexCharts)
}

app.mount('#app')
