<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"
    >
      <h3 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Users
      </h3>

      <!-- ALERT -->
      <div v-if="alert.show"
        :class="[
          'rounded-lg p-4 mb-4',
          alert.type === 'success'
            ? 'border border-green-300 bg-green-50 text-green-700'
            : 'border border-red-300 bg-red-50 text-red-700'
        ]"
      >
        {{ alert.message }}
      </div>

      <!-- LOADER -->
      <div v-if="loading" class="flex justify-center py-6">
        <span
          class="animate-spin inline-block h-10 w-10 rounded-full border-4 border-slate-300 border-t-primary"
        ></span>
      </div>

      <!-- USERS TABLE -->
      <UserInfoCard v-if="!loading" :users="users" />
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, onMounted } from "vue"
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import UserInfoCard from "@/components/users/userInfo.vue"
import { get } from "@/apis/apiClient"
import { ENDPOINTS } from "@/apis/endpoint"

const currentPageTitle = ref("Users")
const users = ref([])
const loading = ref(true)

const alert = ref({
  show: false,
  type: "error",
  message: ""
})

function showError(msg) {
  alert.value = { show: true, type: "error", message: msg }
}

onMounted(async () => {
  try {
    const response = await get(ENDPOINTS.USERS)

    if (!response || !response.users) {
      showError("Invalid API response")
      return
    }

    users.value = response.users
  } catch (error) {
    showError("Failed to load users")
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>
