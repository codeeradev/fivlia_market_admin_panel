<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div
      class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5 xl:px-10 xl:py-12"
    >
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white/90">Pending Approvals</h2>

      <!-- FILTER BAR -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
        <div class="flex items-center gap-2">
          <select v-model="filters.type" class="px-3 py-2 border rounded">
            <option value="all">All types</option>
            <option value="product">Products</option>
            <option value="banner">Banners</option>
          </select>

          <select v-model="filters.status" class="px-3 py-2 border rounded">
            <option value="pending">Pending</option>
            <option value="all">All</option>
          </select>

          <input
            v-model="filters.q"
            type="search"
            placeholder="Search name / title / user..."
            class="px-3 py-2 border rounded w-64"
          />
        </div>

        <div class="flex gap-2 items-center">
          <button @click="loadProducts" class="px-3 py-2 bg-blue-600 text-white rounded text-sm">
            Refresh
          </button>
          <div class="text-sm text-gray-500">
            Total:
            <strong class="text-gray-700 dark:text-white/90">{{ filteredProducts.length }}</strong>
          </div>
        </div>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="text-center py-10">
        <div class="py-8 flex items-center justify-center">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-full animate-spin border-4 border-gray-200 border-t-theme"
            ></div>
            <div class="text-sm text-gray-600 dark:text-gray-300">Loading approvals...</div>
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-10 text-gray-500">
        No pending items for approval.
      </div>

      <!-- Combined Approvals Table -->
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
            <tr v-for="item in filteredProducts" :key="item._id">
              <td class="px-4 py-3">
                <a :href="imgUrl(item.image)" target="_blank" rel="noreferrer">
                  <img :src="imgUrl(item.image)" class="h-14 w-14 rounded-lg object-cover border" />
                </a>
              </td>

              <td class="px-4 py-3 font-medium">{{ item.name }}</td>

              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{{
                  item.type
                }}</span>
              </td>

              <td class="px-4 py-3 font-semibold text-theme">
                {{ item.price ? '₹ ' + item.price : '—' }}
              </td>

              <td class="px-4 py-3">
                <button class="text-blue-600 underline" @click="openUserModal(item.userId)">
                  {{ item.userId?.name || 'N/A' }}
                </button>
              </td>

              <td class="px-4 py-3">
                <span class="px-3 py-1 rounded text-xs bg-yellow-400 text-black">
                  {{ item.productStatus || item.aprroveStatus || 'pending' }}
                </span>
              </td>

              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button
                    @click="updateStatus(item._id, 'active', item.type)"
                    class="px-3 py-2 bg-green-600 text-white rounded text-xs"
                  >
                    Approve
                  </button>

                  <button
                    @click="updateStatus(item._id, 'rejected', item.type)"
                    class="px-3 py-2 bg-red-600 text-white rounded text-xs"
                  >
                    Reject
                  </button>
                  <button
                    @click="selectedItem = item; showViewModal = true"
                    class="px-3 py-2 bg-indigo-600 text-white rounded text-xs"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>

      <!-- keep user modal as-is -->
      <BaseModal v-if="showUserModal" @close="closeUserModal">
        <template #title>User Information</template>

        <template #default>
          <div class="space-y-3 text-sm">
            <div><strong>Name:</strong> {{ userInfo?.name }}</div>
            <div><strong>Email:</strong> {{ userInfo?.email }}</div>
            <div><strong>Mobile:</strong> {{ userInfo?.mobileNumber }}</div>

            <div class="flex items-start gap-3">
              <strong>Profile:</strong>
              <img
                :src="imgUrl(userInfo?.image)"
                class="h-20 w-20 rounded-lg object-cover border"
              />
            </div>

            <div><strong>Latitude:</strong> {{ userInfo?.latitude }}</div>
            <div><strong>Longitude:</strong> {{ userInfo?.longitude }}</div>
          </div>
        </template>

        <template #footer>
          <button class="px-4 py-2 bg-gray-300 rounded" @click="closeUserModal">Close</button>
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

import { get, post } from '@/apis/apiClient.ts'
import { ENDPOINTS } from '@/apis/endpoint.ts'

const currentPageTitle = ref('Product Approvals')

const products = ref([]) // combined approvals list
const loading = ref(true)

const showUserModal = ref(false)
const userInfo = ref(null)
const showViewModal = ref(false)
const selectedItem = ref(null)

const IMAGE_URL = import.meta.env.VITE_IMAGEURL || ''
const imgUrl = (path) => {
  if (!path) return '/no-image.png'
  return IMAGE_URL + path
}

/**
 * loadProducts
 * - supports response shapes:
 *   1) res.Approvals = { products: [], banners: [] }
 *   2) res.Approvals = [ { type: 'product'|'banner', ... }, ... ]
 *   3) res.Products & res.banners top-level arrays
 *
 * - produces products.value as a combined array normalized:
 *   { ...item, type: 'product'|'banner', image: singleStringOrNull, name, price }
 */
const loadProducts = async () => {
  try {
    loading.value = true
    const res = await get(ENDPOINTS.GET_PRODUCT_FOR_APPROVALS)

    let combined = []

    // Case: res.Approvals is object with products & banners arrays
    if (res?.Approvals && (res.Approvals.products || res.Approvals.banners)) {
      const prods = (res.Approvals.products || []).map((i) => ({ ...i, type: 'product' }))
      const bans = (res.Approvals.banners || []).map((i) => ({ ...i, type: 'banner' }))
      combined = [...bans, ...prods]
    }
    // Case: res.Approvals is a single combined array
    else if (Array.isArray(res?.Approvals)) {
      combined = res.Approvals.map((i) => ({
        ...i,
        type: i.type || (i.productStatus !== undefined ? 'product' : 'banner'),
      }))
    }
    // Fallback: top-level Products & banners keys
    else {
      const prods = (res.Products || res.products || []).map((i) => ({ ...i, type: 'product' }))
      const bans = (res.banners || res.Banners || []).map((i) => ({ ...i, type: 'banner' }))
      combined = [...bans, ...prods]
    }

    // Normalize items: image string, name/title unified, price kept for products
    products.value = combined.map((it) => {
      const img = Array.isArray(it.image) ? it.image[0] : it.image
      return {
        ...it,
        image: img || null,
        name: it.name || it.title || '—',
        price: it.price ?? null,
      }
    })
  } catch (err) {
    console.error('Error loading approvals:', err)
    products.value = []
  } finally {
    loading.value = false
  }
}

// updateStatus: accepts (id, status, type) and calls appropriate endpoint
const updateStatus = async (id, status, type = 'product') => {
  try {
    if (!id) return
    if (type === 'product') {
      await post(`${ENDPOINTS.UPDATE_PRODUCT_STATUS}/${id}`, { productStatus: status })
    } else if (type === 'banner') {
      // approval status for banners goes to /update-banner-approval
      const url = ENDPOINTS.UPDATE_BANNER_APPROVAL
        ? ENDPOINTS.UPDATE_BANNER_APPROVAL(id)
        : `${ENDPOINTS.UPDATE_PRODUCT_STATUS}/${id}`
      const payload = { aprroveStatus: status }
      await post(url, payload)
    } else {
      // fallback try product then banner
      try {
        await post(`${ENDPOINTS.UPDATE_PRODUCT_STATUS}/updateProductStatus/${id}`, {
          productStatus: status,
        })
      } catch {
        await post(`${ENDPOINTS.UPDATE_PRODUCT_STATUS}/updateBannerStatus/${id}`, {
          aprroveStatus: status,
        })
      }
    }

    // optimistic UI remove
    products.value = products.value.filter((p) => p._id !== id)
    alert(`Status Updated: ${status}`)
  } catch (err) {
    console.error('Status update failed:', err)
    alert('Failed to update status')
  }
}

// Filters (client-side)
const filters = ref({
  type: 'all', // all | product | banner
  status: 'pending', // pending | all
  q: '',
})

const filteredProducts = computed(() => {
  const q = (filters.value.q || '').toLowerCase().trim()
  return products.value.filter((item) => {
    if (filters.value.type !== 'all' && item.type !== filters.value.type) return false

    if (filters.value.status === 'pending') {
      const st = (item.productStatus || item.aprroveStatus || 'pending').toLowerCase()
      if (st !== 'pending') return false
    }

    if (!q) return true
    const title = (item.name || item.title || '').toString().toLowerCase()
    const userName = (item.userId?.name || '').toString().toLowerCase()
    const userEmail = (item.userId?.email || '').toString().toLowerCase()
    return (
      title.includes(q) ||
      userName.includes(q) ||
      userEmail.includes(q) ||
      (item._id || '').toString().toLowerCase().includes(q)
    )
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

onMounted(loadProducts)
</script>

<style scoped>
.text-theme {
  color: #0f766e;
}
.border-t-theme {
  border-top-color: #0f766e;
}

/* loader spin */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
