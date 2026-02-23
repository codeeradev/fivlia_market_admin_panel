<template>
  <BaseModal @close="$emit('close')">
    <template #title>
      {{ item.type === 'product' ? 'Product Details' : 'Banner Details' }}
    </template>

    <template #default>
      <div class="space-y-4 text-sm">
        <div class="flex gap-4">
          <img :src="imgUrl(item.image)" class="h-32 w-32 rounded-xl border object-cover" />

          <div class="space-y-1">
            <div class="text-lg font-semibold">{{ item.name || item.title }}</div>
            <div class="capitalize text-gray-500">{{ item.type }}</div>
            <div v-if="item.price != null" class="font-semibold text-theme">Rs. {{ item.price }}</div>
          </div>
        </div>

        <hr />

        <div v-if="item.type === 'product'" class="grid grid-cols-2 gap-3">
          <div><strong>Description:</strong> {{ item.description || '-' }}</div>
          <div><strong>Address:</strong> {{ item.address || '-' }}</div>
          <div><strong>Expiry:</strong> {{ item.expiryDays || '-' }} days</div>
          <div><strong>Status:</strong> {{ item.productStatus || '-' }}</div>
        </div>

        <div v-else class="grid grid-cols-2 gap-3">
          <div><strong>Title:</strong> {{ item.title || '-' }}</div>
          <div><strong>Main Category:</strong> {{ item.mainCategory?.name || '-' }}</div>
          <div><strong>City:</strong> {{ item.cityId?.city || item.cityId?.name || item.cityId || '-' }}</div>
          <div><strong>Status:</strong> {{ item.aprroveStatus || '-' }}</div>
        </div>

        <hr />

        <div>
          <h4 class="mb-2 font-semibold">User</h4>

          <div class="flex items-center gap-4">
            <img :src="imgUrl(item.userId?.image)" class="h-16 w-16 rounded-full border object-cover" />

            <div>
              <div><strong>Name:</strong> {{ item.userId?.name || '-' }}</div>
              <div><strong>Email:</strong> {{ item.userId?.email || '-' }}</div>
              <div><strong>Mobile:</strong> {{ item.userId?.mobileNumber || '-' }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <button class="rounded bg-gray-300 px-4 py-2" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from "@/components/common/BaseModal.vue";

defineProps({
  item: {
    type: Object,
    required: true,
  },
  imgUrl: {
    type: Function,
    required: true,
  },
});
</script>
