<template>
  <div class="flex justify-between items-center">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
      {{ title }}
    </h2>

    <div>
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>
