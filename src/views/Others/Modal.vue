<template>
  <div class="fixed inset-0 z-[99999] flex items-center justify-center">
    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-gray-800/60 backdrop-blur-sm"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box -->
    <div
      class="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
    >
      <!-- Header -->
      <div class="flex justify-between items-center px-5 py-3 border-b dark:border-gray-700">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
          <slot name="title">Modal Title</slot>
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="px-5 py-4 max-h-[70vh] overflow-y-auto">
        <slot></slot>
      </div>

      <!-- Footer -->
      <div
        v-if="$slots.footer"
        class="px-5 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      >
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>
