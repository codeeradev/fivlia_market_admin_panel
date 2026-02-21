<template>
  <div class="overflow-x-auto">
    <table class="w-full table-auto">
      <thead>
        <tr class="bg-gray-100 dark:bg-gray-800 text-left">
          <th class="px-4 py-3">#</th>
          <th class="px-4 py-3">Name</th>
          <th class="px-4 py-3">Category</th>
          <th class="px-4 py-3">Images</th>
          <th class="px-4 py-3">Price</th>
          <th class="px-4 py-3">User</th>
          <th class="px-4 py-3">Active Status</th>
          <th class="px-4 py-3">Created</th>
          <th class="px-4 py-3">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(p, i) in products"
          :key="p._id"
          class="border-b border-gray-200 dark:border-gray-700"
        >
          <td class="px-4 py-3">{{ i + 1 }}</td>
          <td class="px-4 py-3">{{ p.name }}</td>
          <td class="px-4 py-3">{{ p.category?.name || '-' }}</td>
          <td class="px-4 py-3">
            <div v-if="p.image?.length" class="flex gap-2 max-w-[180px] overflow-x-auto">
              <img
                v-for="(img, index) in p.image"
                :key="index"
                :src="imageUrl(img)"
                class="w-12 h-12 object-cover rounded border shrink-0"
                loading="lazy"
              />
            </div>

            <span v-else class="text-gray-400 text-sm">No Images</span>
          </td>

          <td class="px-4 py-3">{{ p.price }}</td>
          <td class="px-4 py-3">{{ p.userId?.name || '-' }}</td>
          <td class="px-4 py-3">{{ p.productStatus || '-' }}</td>
          <td class="px-4 py-3">{{ new Date(p.createdAt).toLocaleDateString() }}</td>

          <td class="px-4 py-3">
            <button
              class="text-blue-600 hover:underline mr-3"
              @click="$emit('edit', p)"
            >
              Edit
            </button>
            <button class="text-red-600 hover:underline">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  products: { type: Array, default: () => [] },
})
defineEmits(["edit"])

const IMAGEURL = import.meta.env.VITE_IMAGEURL

const imageUrl = (path) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${IMAGEURL}/${path.replace(/^\//, "")}`;
};

</script>
