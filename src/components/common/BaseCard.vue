<template>
  <div class="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
    <!-- header slot (optional) -->
    <div v-if="$slots.header" class="mb-6">
      <slot name="header"></slot>
    </div>

    <!-- default content -->
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// nothing fancy here
</script>
