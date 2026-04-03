<template>
  <RouterView v-if="isStandaloneRoute" />
  <ThemeProvider v-else>
    <SidebarProvider>
      <RouterView />
      <AppAlert v-if="!isPublicRoute" />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import AppAlert from './components/common/AppAlert.vue'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAdminSession, hasValidAdminSession } from '@/utils/adminAuth'

const router = useRouter()
const route = useRoute()
const isPublicRoute = computed(() => Boolean(route.meta.publicRoute))
const isStandaloneRoute = computed(() => Boolean(route.meta.standalone))

let authCheckTimer: number | null = null

const ensureSessionIsValid = () => {
  if (isPublicRoute.value) return

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
