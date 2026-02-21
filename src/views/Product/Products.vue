<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"
    >
      <h3 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        Products
      </h3>

      <!-- ALERT -->
      <div
        v-if="alert.show"
        :class="[
          'rounded-lg p-4 mb-4',
          alert.type === 'success'
            ? 'border border-green-300 bg-green-50 text-green-700'
            : 'border border-red-300 bg-red-50 text-red-700'
        ]"
      >
        {{ alert.message }}
      </div>

      <!-- LOADER -->
      <div v-if="loading" class="flex justify-center py-6">
        <span class="animate-spin inline-block h-10 w-10 rounded-full border-4 border-slate-300 border-t-primary"></span>
      </div>

      <!-- PRODUCT TABLE -->
      <ProductsTable
        v-if="!loading"
        :products="products"
        @edit="openEditModal"
      />

      <!-- PAGINATION -->
      <div v-if="!loading" class="flex items-center justify-between mt-6">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-4 py-2 rounded border bg-gray-100 dark:bg-slate-700 disabled:opacity-40"
        >
          Prev
        </button>

        <span class="text-gray-700 dark:text-gray-300">
          Page {{ page }} of {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-4 py-2 rounded border bg-gray-100 dark:bg-slate-700 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>

    <!-- EDIT MODAL -->
    <BaseModal v-if="showEditModal" @close="closeEditModal">
      <template #title>Edit Product</template>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="font-medium text-sm mb-1 block">Name</label>
          <input
            v-model="editForm.name"
            type="text"
            class="border rounded p-2 h-10 w-full"
            placeholder="Product name"
          />
        </div>

        <div>
          <label class="font-medium text-sm mb-1 block">Description</label>
          <textarea
            v-model="editForm.description"
            rows="3"
            class="border rounded p-2 w-full"
            placeholder="Product description"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="font-medium text-sm mb-1 block">Price</label>
            <input
              v-model="editForm.price"
              type="number"
              min="0"
              class="border rounded p-2 h-10 w-full"
              placeholder="0"
            />
          </div>

          <div>
            <label class="font-medium text-sm mb-1 block">Address</label>
            <input
              v-model="editForm.address"
              type="text"
              class="border rounded p-2 h-10 w-full"
              placeholder="Address"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="font-medium text-sm mb-1 block">Category</label>
            <select
              v-model="editForm.category"
              @change="onCategoryChange"
              class="border rounded p-2 h-10 w-full"
            >
              <option value="">Select Category</option>
              <option
                v-for="cat in categories"
                :key="cat._id"
                :value="cat._id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="font-medium text-sm mb-1 block">Sub Category</label>
            <select
              v-model="editForm.subCategory"
              :disabled="!editForm.category"
              class="border rounded p-2 h-10 w-full disabled:opacity-60"
            >
              <option value="">Select Sub Category</option>
              <option
                v-for="sub in subCategories"
                :key="sub._id"
                :value="sub._id"
              >
                {{ sub.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="font-medium text-sm mb-2 block">Current Images</label>
          <div v-if="currentProductImages.length" class="flex gap-2 max-w-full overflow-x-auto pb-1">
            <img
              v-for="(img, idx) in currentProductImages"
              :key="idx"
              :src="imageUrl(img)"
              class="w-14 h-14 object-cover rounded border shrink-0"
            />
          </div>
          <p v-else class="text-sm text-gray-500">No image found.</p>
        </div>

        <div>
          <label class="font-medium text-sm mb-1 block">Replace Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            @change="onImageChange"
            class="border rounded p-2 w-full"
          />
          <p v-if="selectedImageFiles.length" class="text-xs text-gray-600 mt-1">
            {{ selectedImageFiles.length }} file(s) selected.
          </p>
        </div>
      </div>

      <template #footer>
        <button @click="closeEditModal" class="px-4 py-2 border rounded">
          Cancel
        </button>

        <button
          @click="saveProduct"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {{ saving ? "Saving..." : "Save" }}
        </button>
      </template>
    </BaseModal>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue"
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import ProductsTable from '@/components/products/ProductsTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { get, post } from "@/apis/apiClient"
import { ENDPOINTS } from "@/apis/endpoint"

const currentPageTitle = ref("Products")
const IMAGEURL = import.meta.env.VITE_IMAGEURL

const loading = ref(true)
const saving = ref(false)
const alert = ref({ show: false, type: "error", message: "" })

const products = ref([])
const categories = ref([])
const subCategories = ref([])
const page = ref(1)
const limit = 10

const totalPages = ref(1)
const showEditModal = ref(false)
const editProductId = ref("")
const selectedImageFiles = ref([])
const currentProductImages = ref([])

const editForm = ref({
  name: "",
  description: "",
  price: "",
  address: "",
  category: "",
  subCategory: "",
})

function showError(msg) {
  alert.value = { show: true, type: "error", message: msg }
}

function showSuccess(msg) {
  alert.value = { show: true, type: "success", message: msg }
}

async function loadProducts() {
  loading.value = true
  alert.value.show = false

  try {
    const response = await get(`${ENDPOINTS.PRODUCTS}?page=${page.value}&limit=${limit}`)

    if (!response || !response.product) {
      showError("Invalid API response.")
      return
    }

    products.value = response.product
    totalPages.value = response.totalPages || 1

  } catch (error) {
    console.error(error)
    showError("Failed to load products.")
  } finally {
    loading.value = false
  }
}

async function loadCategories() {
  try {
    const response = await get(ENDPOINTS.CATEGORY.GET_ALL)
    categories.value = response?.categories || []
  } catch (error) {
    console.error(error)
    categories.value = []
  }
}

function imageUrl(path) {
  if (!path) return "/no-image.png"
  if (path.startsWith("http") || path.startsWith("blob:")) return path
  return `${IMAGEURL}/${path.replace(/^\//, "")}`
}

function normalizeId(value) {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object") return value._id || value.id || ""
  return String(value)
}

function getSubCategoryOptions(categoryId) {
  const selectedCategory = categories.value.find((cat) => cat._id === categoryId)
  return selectedCategory?.subcat || []
}

function onCategoryChange() {
  subCategories.value = getSubCategoryOptions(editForm.value.category)
  if (!subCategories.value.some((sub) => sub._id === editForm.value.subCategory)) {
    editForm.value.subCategory = ""
  }
}

function closeEditModal() {
  showEditModal.value = false
  editProductId.value = ""
  selectedImageFiles.value = []
  currentProductImages.value = []
  editForm.value = {
    name: "",
    description: "",
    price: "",
    address: "",
    category: "",
    subCategory: "",
  }
}

function openEditModal(product) {
  editProductId.value = product?._id || ""

  editForm.value = {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price !== undefined && product?.price !== null ? String(product.price) : "",
    address: product?.address || "",
    category: normalizeId(product?.category || product?.mainCategory),
    subCategory: normalizeId(product?.subCategory),
  }

  subCategories.value = getSubCategoryOptions(editForm.value.category)
  if (!subCategories.value.some((sub) => sub._id === editForm.value.subCategory)) {
    editForm.value.subCategory = ""
  }

  currentProductImages.value = Array.isArray(product?.image)
    ? product.image
    : product?.image
      ? [product.image]
      : []

  selectedImageFiles.value = []
  showEditModal.value = true
}

function onImageChange(event) {
  selectedImageFiles.value = Array.from(event.target?.files || [])
}

async function saveProduct() {
  if (!editProductId.value) return

  saving.value = true
  alert.value.show = false

  try {
    const fd = new FormData()

    if (editForm.value.name?.trim()) fd.append("name", editForm.value.name.trim())
    if (editForm.value.description?.trim()) fd.append("description", editForm.value.description.trim())
    if (editForm.value.price !== "") fd.append("price", String(editForm.value.price))
    if (editForm.value.address?.trim()) fd.append("address", editForm.value.address.trim())
    if (editForm.value.category) fd.append("category", editForm.value.category)
    if (editForm.value.subCategory) fd.append("subCategory", editForm.value.subCategory)

    selectedImageFiles.value.forEach((file) => {
      fd.append("MultipleImage", file)
    })

    const response = await post(ENDPOINTS.EDIT_PRODUCT(editProductId.value), fd)
    const successMessage = response?.message || "Product updated successfully"

    closeEditModal()
    await loadProducts()
    showSuccess(successMessage)
  } catch (error) {
    console.error(error)
    showError(error?.response?.data?.message || "Failed to update product.")
  } finally {
    saving.value = false
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    loadProducts()
  }
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    loadProducts()
  }
}

onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>
