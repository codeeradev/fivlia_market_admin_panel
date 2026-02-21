<template>
  <teleport to="body">
    <div
      class="fixed inset-0 bg-black/40 z-[9999]
             flex items-center justify-center"
      @click.self="close"
    >
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-xl
               w-[95%] sm:w-[600px] max-w-[600px]
               max-h-[90vh] overflow-hidden animate-modal"
      >
        <!-- HEADER -->
        <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
            <!-- 🔥 FIXED -->
            <slot name="title" />
          </h2>

          <button
            class="text-gray-500 hover:text-gray-700 text-xl"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- BODY -->
        <div class="p-4 overflow-y-auto max-h-[70vh]">
          <slot />
        </div>

        <!-- FOOTER -->
        <div class="p-4 border-t dark:border-gray-700 flex justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const emit = defineEmits(["close"])
const close = () => emit("close")
</script>

<style>
@keyframes modalIn {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-modal {
  animation: modalIn .18s ease-out;
}
</style>
