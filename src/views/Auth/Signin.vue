<template>
  <FullScreenLayout>
    <div class="min-h-screen bg-[linear-gradient(130deg,#f8fafc_0%,#e2e8f0_100%)] dark:bg-gray-900 px-4 py-8 sm:px-6 lg:px-8">
      <div class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div class="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-2 dark:border-gray-800 dark:bg-gray-900">
          <section class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.25),transparent_45%)]"></div>

            <div class="relative">
              <p class="text-xs uppercase tracking-[0.24em] text-slate-300">Fivlia Market</p>
              <h2 class="mt-6 text-4xl font-semibold leading-tight">Admin Control Center</h2>
              <p class="mt-4 text-base text-slate-300">
                Manage categories, products, banners, approvals, and notifications from one secure dashboard.
              </p>
            </div>

            <div class="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <p class="text-sm text-slate-200">
                Access is limited to configured admin credentials only.
              </p>
            </div>
          </section>

          <section class="p-6 sm:p-10 lg:p-12">
            <div class="mx-auto w-full max-w-md">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Welcome Back</p>
              <h1 class="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">Admin Sign In</h1>
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Enter your email and password to continue.
              </p>

              <p
                v-if="errorMessage"
                class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300"
              >
                {{ errorMessage }}
              </p>

              <form @submit.prevent="handleSubmit" class="mt-6 space-y-5">
                <div>
                  <label
                    for="email"
                    class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email<span class="text-error-500">*</span>
                  </label>
                  <input
                    v-model="email"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="admin@example.com"
                    class="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-3 focus:ring-blue-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    for="password"
                    class="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password<span class="text-error-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      v-model="password"
                      :type="showPassword ? 'text' : 'password'"
                      id="password"
                      placeholder="Enter your password"
                      class="h-11 w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-11 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-3 focus:ring-blue-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-500"
                    />
                    <button
                      type="button"
                      @click="togglePasswordVisibility"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <svg
                        v-if="!showPassword"
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M10.0002 13.8619C7.23361 13.8619 4.86803 12.1372 3.92328 9.70241C4.86804 7.26761 7.23361 5.54297 10.0002 5.54297C12.7667 5.54297 15.1323 7.26762 16.0771 9.70243C15.1323 12.1372 12.7667 13.8619 10.0002 13.8619ZM10.0002 4.04297C6.48191 4.04297 3.49489 6.30917 2.4155 9.4593C2.3615 9.61687 2.3615 9.78794 2.41549 9.94552C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C13.5184 15.3619 16.5055 13.0957 17.5849 9.94555C17.6389 9.78797 17.6389 9.6169 17.5849 9.45932C16.5055 6.30919 13.5184 4.04297 10.0002 4.04297ZM9.99151 7.84413C8.96527 7.84413 8.13333 8.67606 8.13333 9.70231C8.13333 10.7286 8.96527 11.5605 9.99151 11.5605H10.0064C11.0326 11.5605 11.8646 10.7286 11.8646 9.70231C11.8646 8.67606 11.0326 7.84413 10.0064 7.84413H9.99151Z"
                          fill="#98A2B3"
                        />
                      </svg>
                      <svg
                        v-else
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M4.63803 3.57709C4.34513 3.2842 3.87026 3.2842 3.57737 3.57709C3.28447 3.86999 3.28447 4.34486 3.57737 4.63775L4.85323 5.91362C3.74609 6.84199 2.89363 8.06395 2.4155 9.45936C2.3615 9.61694 2.3615 9.78801 2.41549 9.94558C3.49488 13.0957 6.48191 15.3619 10.0002 15.3619C11.255 15.3619 12.4422 15.0737 13.4994 14.5598L15.3625 16.4229C15.6554 16.7158 16.1302 16.7158 16.4231 16.4229C16.716 16.13 16.716 15.6551 16.4231 15.3622L4.63803 3.57709ZM12.3608 13.4212L10.4475 11.5079C10.3061 11.5423 10.1584 11.5606 10.0064 11.5606H9.99151C8.96527 11.5606 8.13333 10.7286 8.13333 9.70237C8.13333 9.5461 8.15262 9.39434 8.18895 9.24933L5.91885 6.97923C5.03505 7.69015 4.34057 8.62704 3.92328 9.70247C4.86803 12.1373 7.23361 13.8619 10.0002 13.8619C10.8326 13.8619 11.6287 13.7058 12.3608 13.4212ZM16.0771 9.70249C15.7843 10.4569 15.3552 11.1432 14.8199 11.7311L15.8813 12.7925C16.6329 11.9813 17.2187 11.0143 17.5849 9.94561C17.6389 9.78803 17.6389 9.61696 17.5849 9.45938C16.5055 6.30925 13.5184 4.04303 10.0002 4.04303C9.13525 4.04303 8.30244 4.17999 7.52218 4.43338L8.75139 5.66259C9.1556 5.58413 9.57311 5.54303 10.0002 5.54303C12.7667 5.54303 15.1323 7.26768 16.0771 9.70249Z"
                          fill="#98A2B3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="mt-1 flex h-11 w-full items-center justify-center rounded-lg bg-[linear-gradient(90deg,#2563eb_0%,#1d4ed8_100%)] px-4 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span v-if="!isSubmitting">Sign In</span>
                  <span v-else>Signing In...</span>
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { post } from '@/apis/apiClient'
import { ENDPOINTS } from '@/apis/endpoint'
import { saveAdminSession } from '@/utils/adminAuth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async () => {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Email and password are required'
    return
  }

  try {
    isSubmitting.value = true

    const res: any = await post(ENDPOINTS.ADMIN_LOGIN, {
      email: email.value.trim(),
      password: password.value,
    })

    if (!res?.token) {
      throw new Error('Invalid login response')
    }

    const serverExpiresAt = res.expiresAt ? new Date(res.expiresAt).getTime() : undefined

    saveAdminSession({
      token: res.token,
      expiresAt:
        Number.isFinite(serverExpiresAt) && serverExpiresAt
          ? serverExpiresAt
          : Date.now() + 24 * 60 * 60 * 1000,
      email: res?.admin?.email || email.value.trim(),
      name: res?.admin?.name || '',
    })

    await router.replace('/')
  } catch (error: any) {
    errorMessage.value = error?.response?.data?.message || 'Failed to sign in'
  } finally {
    isSubmitting.value = false
  }
}
</script>
