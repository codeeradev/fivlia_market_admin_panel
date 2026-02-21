<template>
  <div class="overflow-x-auto">
    <table class="min-w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg">
      <thead class="bg-gray-100 dark:bg-gray-800">
        <tr>
          <slot name="head"></slot>
        </tr>
      </thead>

      <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
        <slot name="body"></slot>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
// purely presentational
</script>
