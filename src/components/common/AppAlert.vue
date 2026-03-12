<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      v-if="alertState.open"
      class="pointer-events-none fixed right-4 top-4 z-[999999] w-[calc(100vw-2rem)] max-w-sm"
    >
      <div
        v-if="alertState.type === 'loading'"
        class="pointer-events-auto rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg"
      >
        <div class="flex items-center gap-3">
          <span
            class="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white"
          ></span>
          <p class="text-sm font-medium">{{ alertState.message }}</p>
        </div>
      </div>

      <div
        v-else
        :class="[
          'pointer-events-auto rounded-lg px-4 py-3 text-white shadow-lg',
          toneClass,
        ]"
      >
        <div class="flex items-start gap-3">
          <span
            class="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/50 text-xs font-bold"
          >
            {{ iconText }}
          </span>
          <p class="min-w-0 flex-1 text-sm font-medium">{{ alertState.message }}</p>
          <button
            type="button"
            @click="closeAlert"
            class="text-xs uppercase tracking-wide text-white/80 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppAlert } from '@/composables/useAppAlert'

const { alertState, closeAlert } = useAppAlert()

const toneClass = computed(() => {
  if (alertState.value.type === 'success') return 'bg-green-600'
  if (alertState.value.type === 'error') return 'bg-red-600'
  if (alertState.value.type === 'warning') return 'bg-orange-500'
  return 'bg-blue-600'
})

const iconText = computed(() => {
  if (alertState.value.type === 'success') return 'OK'
  if (alertState.value.type === 'error') return 'NO'
  if (alertState.value.type === 'warning') return '!'
  return 'i'
})
</script>
