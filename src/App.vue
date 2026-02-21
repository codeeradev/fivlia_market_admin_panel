<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAdminSession, hasValidAdminSession } from '@/utils/adminAuth'

const router = useRouter()
const route = useRoute()

let authCheckTimer: number | null = null

const ensureSessionIsValid = () => {
  if (route.path === '/signin') return

  if (!hasValidAdminSession()) {
    clearAdminSession()
    router.replace('/signin')
  }
}

onMounted(() => {
  ensureSessionIsValid()
  authCheckTimer = window.setInterval(ensureSessionIsValid, 60 * 1000)
})

onUnmounted(() => {
  if (authCheckTimer !== null) {
    window.clearInterval(authCheckTimer)
    authCheckTimer = null
  }
})
</script>
