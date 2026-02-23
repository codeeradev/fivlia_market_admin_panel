<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5 xl:px-10 xl:py-12">
      <h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">Pending Approvals</h2>

      <div class="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div class="flex items-center gap-2">
          <select v-model="filters.type" class="rounded border px-3 py-2">
            <option value="all">All types</option>
            <option value="product">Products</option>
            <option value="banner">Banners</option>
          </select>

          <input
            v-model="filters.q"
            type="search"
            placeholder="Search title / user"
            class="w-64 rounded border px-3 py-2"
          />
        </div>

        <div class="flex items-center gap-2">
          <button @click="loadApprovals" class="rounded bg-blue-600 px-3 py-2 text-sm text-white">
            Refresh
          </button>
          <div class="text-sm text-gray-500">
            Total: <strong class="text-gray-700 dark:text-white/90">{{ filteredItems.length }}</strong>
          </div>
        </div>
      </div>

      <div v-if="loading" class="py-10 text-center">
        <div class="flex items-center justify-center gap-3">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-theme"></div>
          <div class="text-sm text-gray-600 dark:text-gray-300">Loading approvals...</div>
        </div>
      </div>

      <div v-else-if="filteredItems.length === 0" class="py-10 text-center text-gray-500">
        No pending items for approval.
      </div>

      <div v-else>
        <BaseTable>
          <template #head>
            <th class="px-4 py-3">Preview</th>
            <th class="px-4 py-3">Title / Name</th>
            <th class="px-4 py-3">Type</th>
            <th class="px-4 py-3">Price</th>
            <th class="px-4 py-3">User</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Actions</th>
          </template>

          <template #body>
            <tr v-for="item in filteredItems" :key="item._id">
              <td class="px-4 py-3">
                <a :href="imgUrl(item.image)" target="_blank" rel="noreferrer">
                  <img :src="imgUrl(item.image)" class="h-14 w-14 rounded-lg border object-cover" />
                </a>
              </td>

              <td class="px-4 py-3 font-medium">{{ item.displayName }}</td>

              <td class="px-4 py-3">
                <span class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">{{ item.type }}</span>
              </td>

              <td class="px-4 py-3 font-semibold text-theme">
                {{ item.price != null ? `Rs. ${item.price}` : '-' }}
              </td>

              <td class="px-4 py-3">
                <button class="text-blue-600 underline" @click="openUserModal(item.userId)">
                  {{ item.userId?.name || 'N/A' }}
                </button>
              </td>

              <td class="px-4 py-3">
                <span class="rounded bg-yellow-400 px-3 py-1 text-xs text-black">
                  {{ item.productStatus || item.aprroveStatus || 'pending' }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    @click="updateStatus(item, 'active')"
                    class="rounded bg-green-600 px-3 py-2 text-xs text-white"
                  >
                    Approve
                  </button>

                  <button
                    @click="updateStatus(item, 'rejected')"
                    class="rounded bg-red-600 px-3 py-2 text-xs text-white"
                  >
                    Reject
                  </button>

                  <button
                    v-if="item.type === 'banner'"
                    @click="updateStatus(item, 'resubmit')"
                    class="rounded bg-orange-600 px-3 py-2 text-xs text-white"
                  >
                    Resubmit
                  </button>

                  <button
                    @click="selectedItem = item; showViewModal = true"
                    class="rounded bg-indigo-600 px-3 py-2 text-xs text-white"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>

      <BaseModal v-if="showUserModal" @close="closeUserModal">
        <template #title>User Information</template>

        <template #default>
          <div class="space-y-3 text-sm">
            <div><strong>Name:</strong> {{ userInfo?.name }}</div>
            <div><strong>Email:</strong> {{ userInfo?.email }}</div>
            <div><strong>Mobile:</strong> {{ userInfo?.mobileNumber }}</div>

            <div class="flex items-start gap-3">
              <strong>Profile:</strong>
              <img :src="imgUrl(userInfo?.image)" class="h-20 w-20 rounded-lg border object-cover" />
            </div>

            <div><strong>Latitude:</strong> {{ userInfo?.latitude }}</div>
            <div><strong>Longitude:</strong> {{ userInfo?.longitude }}</div>
          </div>
        </template>

        <template #footer>
          <button class="rounded bg-gray-300 px-4 py-2" @click="closeUserModal">Close</button>
        </template>
      </BaseModal>

      <ViewApprovalModal
        v-if="showViewModal"
        :item="selectedItem"
        :imgUrl="imgUrl"
        @close="showViewModal = false"
      />
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ViewApprovalModal from '@/views/Approvals/ViewApprovalModal.vue'

import { get, post } from '@/apis/apiClient'
import { ENDPOINTS } from '@/apis/endpoint'

const currentPageTitle = ref('Approvals')

const items = ref([])
const loading = ref(true)

const showUserModal = ref(false)
const userInfo = ref(null)
const showViewModal = ref(false)
const selectedItem = ref(null)

const filters = ref({
  type: 'all',
  q: '',
})

const IMAGE_URL = import.meta.env.VITE_IMAGEURL || ''
const imgUrl = (path) => {
  if (!path) return '/no-image.png'
  if (/^https?:\/\//i.test(path)) return path
  const base = IMAGE_URL.replace(/\/+$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

const normalizeItem = (raw, type) => {
  const image = Array.isArray(raw?.image) ? raw.image[0] : raw?.image

  return {
    ...raw,
    type,
    image: image || '',
    displayName: raw?.name || raw?.title || '-',
    price: raw?.price ?? null,
  }
}

const loadApprovals = async () => {
  try {
    loading.value = true
    const res = await get(ENDPOINTS.GET_PRODUCT_FOR_APPROVALS)

    const approvals = res?.Approvals || {}
    const banners = Array.isArray(approvals.banners)
      ? approvals.banners.map((item) => normalizeItem(item, 'banner'))
      : []
    const products = Array.isArray(approvals.products)
      ? approvals.products.map((item) => normalizeItem(item, 'product'))
      : []

    items.value = [...banners, ...products]
  } catch (error) {
    console.error('Error loading approvals:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

const updateStatus = async (item, status) => {
  try {
    if (!item?._id) return

    if (item.type === 'product') {
      await post(ENDPOINTS.UPDATE_PRODUCT_STATUS(item._id), { productStatus: status })
    } else {
      const payload = { aprroveStatus: status }

      if (status === 'rejected' || status === 'resubmit') {
        const reason = window.prompt(
          status === 'resubmit' ? 'Enter resubmit reason' : 'Enter rejection reason',
        )
        if (!reason || !reason.trim()) return
        payload.approvalReason = reason.trim()
      }

      await post(ENDPOINTS.UPDATE_BANNER_APPROVAL(item._id), payload)
    }

    await loadApprovals()
  } catch (error) {
    console.error('Status update failed:', error)
    alert(error?.response?.data?.message || 'Failed to update status')
  }
}

const filteredItems = computed(() => {
  const query = (filters.value.q || '').toLowerCase().trim()

  return items.value.filter((item) => {
    if (filters.value.type !== 'all' && item.type !== filters.value.type) return false

    if (!query) return true

    const title = (item.displayName || '').toLowerCase()
    const userName = (item.userId?.name || '').toLowerCase()
    const userEmail = (item.userId?.email || '').toLowerCase()

    return title.includes(query) || userName.includes(query) || userEmail.includes(query)
  })
})

const openUserModal = (user) => {
  userInfo.value = user
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  userInfo.value = null
}

onMounted(loadApprovals)
</script>

<style scoped>
.text-theme {
  color: #0f766e;
}
.border-t-theme {
  border-top-color: #0f766e;
}
</style>
