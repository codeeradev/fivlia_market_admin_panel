<template>
  <BaseModal @close="$emit('close')">
    <template #title>
      {{ item.type === 'product' ? 'Product Details' : 'Banner Details' }}
    </template>

    <template #default>
      <div class="space-y-4 text-sm">

        <!-- IMAGE -->
        <div class="flex gap-4">
          <img
            :src="imgUrl(item.image)"
            class="h-32 w-32 rounded-xl object-cover border"
          />

          <div class="space-y-1">
            <div class="text-lg font-semibold">
              {{ item.name || item.title }}
            </div>

            <div class="text-gray-500 capitalize">
              {{ item.type }}
            </div>

            <div v-if="item.price" class="text-theme font-semibold">
              ₹ {{ item.price }}
            </div>
          </div>
        </div>

        <hr />

        <!-- PRODUCT DETAILS -->
        <div v-if="item.type === 'product'" class="grid grid-cols-2 gap-3">
          <div><strong>Description:</strong> {{ item.description || '—' }}</div>
          <div><strong>Address:</strong> {{ item.address || '—' }}</div>
          <div><strong>Expiry:</strong> {{ item.expiryDays }} days</div>
          <div><strong>Status:</strong> {{ item.productStatus }}</div>
        </div>

        <!-- BANNER DETAILS -->
        <div v-else class="grid grid-cols-2 gap-3">
          <div><strong>Title:</strong> {{ item.title }}</div>
          <div><strong>Main Category:</strong> {{ item.mainCategory?.name }}</div>
          <div><strong>City:</strong> {{ item.cityId }}</div>
          <div><strong>Status:</strong> {{ item.aprroveStatus }}</div>
        </div>

        <hr />

        <!-- USER -->
        <div>
          <h4 class="font-semibold mb-2">User</h4>

          <div class="flex gap-4 items-center">
            <img
              :src="imgUrl(item.userId?.image)"
              class="h-16 w-16 rounded-full border object-cover"
            />

            <div>
              <div><strong>Name:</strong> {{ item.userId?.name }}</div>
              <div><strong>Email:</strong> {{ item.userId?.email }}</div>
              <div><strong>Mobile:</strong> {{ item.userId?.mobileNumber }}</div>
            </div>
          </div>
        </div>

      </div>
    </template>

    <template #footer>
      <button
        class="px-4 py-2 bg-gray-300 rounded"
        @click="$emit('close')"
      >
        Close
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from "@/components/common/BaseModal.vue";

defineProps({
  item: Object,
  imgUrl: Function
});
</script>
