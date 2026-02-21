<template>
  <div class="overflow-x-auto">
    <table class="w-full table-auto border-collapse">
      <thead>
        <tr class="bg-gray-100 dark:bg-gray-800 text-left">
          <th class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">#</th>
          <th class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
          <th class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
          <th class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Phone</th>
          <th class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(user, index) in users" :key="user._id" class="border-b border-gray-200 dark:border-gray-700">
          <td class="px-4 py-3">{{ index + 1 }}</td>

          <td class="px-4 py-3">{{ user.name }}</td>

          <td class="px-4 py-3">
            {{ user.email || '—' }}
          </td>

          <td class="px-4 py-3">
            {{ user.phone || '—' }}
          </td>

          <td class="px-4 py-3">
            <button class="text-blue-600 hover:underline mr-2" @click="$emit('view', user)">
              View
            </button>
            <button class="text-red-600 hover:underline" @click="$emit('delete', user._id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>

    </table>
  </div>
</template>

<script setup>
defineProps({
  users: { type: Array, default: () => [] }
})
</script>
