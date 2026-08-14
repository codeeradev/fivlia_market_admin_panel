<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"
    >
      <div class="mb-5 flex items-center justify-between lg:mb-7">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
          Products
        </h3>
        <button
          @click="openCreateModal"
          class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

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
        :deleting-id="deletingProductId"
        :reposting-id="repostingProductId"
        @edit="openEditModal"
        @delete="deleteProduct"
        @repost="repostProduct"
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

    <!-- CREATE MODAL -->
    <BaseModal v-if="showCreateModal" @close="closeCreateModal">
      <template #title>Add Product</template>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Name</label>
          <input v-model="createForm.name" type="text" class="h-10 w-full rounded border p-2" placeholder="Product name" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Description</label>
          <textarea v-model="createForm.description" rows="3" class="w-full rounded border p-2" placeholder="Product description"></textarea>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium">Price</label>
            <input v-model="createForm.price" type="number" min="0" class="h-10 w-full rounded border p-2" placeholder="0" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Address</label>
            <input v-model="createForm.address" type="text" class="h-10 w-full rounded border p-2" placeholder="Address" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium">Category</label>
            <select v-model="createForm.category" @change="onCreateCategoryChange" class="h-10 w-full rounded border p-2">
              <option value="">Select Category</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Sub Category</label>
            <select v-model="createForm.subCategory" :disabled="!createForm.category" class="h-10 w-full rounded border p-2 disabled:opacity-60">
              <option value="">Select Sub Category</option>
              <option v-for="sub in createSubCategories" :key="sub._id" :value="sub._id">{{ sub.name }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Images</label>
          <p class="mb-2 text-xs text-gray-600">Recommended image size: 500 x 500 px.</p>
          <input type="file" accept="image/*" multiple @change="onCreateImageChange" class="w-full rounded border p-2" />
          <p v-if="createImageFiles.length" class="mt-1 text-xs text-gray-600">{{ createImageFiles.length }} file(s) selected.</p>
        </div>
      </div>

      <template #footer>
        <button @click="closeCreateModal" class="rounded border px-4 py-2">Cancel</button>
        <button @click="createProduct" :disabled="creating" class="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
          {{ creating ? "Adding..." : "Add Product" }}
        </button>
      </template>
    </BaseModal>

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

        <div>
          <label class="font-medium text-sm mb-1 block">Featured Product</label>
          <select
            v-model="editForm.paymentType"
            class="border rounded p-2 h-10 w-full"
          >
            <option value="free">Regular Product</option>
            <option value="paid">Featured Product</option>
          </select>
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
          <p class="text-xs text-gray-600 mb-2">Recommended image size: 500 x 500 px.</p>
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
import { del, get, post } from "@/apis/apiClient"
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
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editProductId = ref("")
const selectedImageFiles = ref([])
const currentProductImages = ref([])
const deletingProductId = ref("")
const repostingProductId = ref("")
const createImageFiles = ref([])
const createSubCategories = ref([])
const creating = ref(false)

const createForm = ref({
  name: "",
  description: "",
  price: "",
  address: "",
  category: "",
  subCategory: "",
})

const editForm = ref({
  name: "",
  description: "",
  price: "",
  address: "",
  paymentType: "",
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

function onCreateCategoryChange() {
  createSubCategories.value = getSubCategoryOptions(createForm.value.category)
  if (!createSubCategories.value.some((sub) => sub._id === createForm.value.subCategory)) {
    createForm.value.subCategory = ""
  }
}

function openCreateModal() {
  createForm.value = { name: "", description: "", price: "", address: "", category: "", subCategory: "" }
  createImageFiles.value = []
  createSubCategories.value = []
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  createImageFiles.value = []
  createSubCategories.value = []
}

function onCreateImageChange(event) {
  createImageFiles.value = Array.from(event.target?.files || [])
}

async function createProduct() {
  const name = createForm.value.name.trim()
  const price = Number(createForm.value.price)

  if (!name) return showError("Product name is required.")
  if (!Number.isFinite(price) || price < 0) return showError("A valid product price is required.")
  if (!createForm.value.category) return showError("Category is required.")

  creating.value = true
  alert.value.show = false

  try {
    const fd = new FormData()
    fd.append("name", name)
    fd.append("description", createForm.value.description.trim())
    fd.append("price", String(price))
    fd.append("address", createForm.value.address.trim())
    fd.append("category", createForm.value.category)
    if (createForm.value.subCategory) fd.append("subCategory", createForm.value.subCategory)
    createImageFiles.value.forEach((file) => fd.append("MultipleImage", file))

    const response = await post(ENDPOINTS.ADD_ADMIN_PRODUCT, fd)
    closeCreateModal()
    page.value = 1
    await loadProducts()
    showSuccess(response?.message || "Product added successfully")
  } catch (error) {
    console.error(error)
    showError(error?.response?.data?.message || "Failed to add product.")
  } finally {
    creating.value = false
  }
}

async function deleteProduct(product) {
  const productId = product?._id
  if (!productId) return

  if (!window.confirm(`Delete "${product?.name || "this product"}"? This cannot be undone.`)) return

  deletingProductId.value = productId
  alert.value.show = false

  try {
    const response = await del(ENDPOINTS.DELETE_ADMIN_PRODUCT(productId))
    products.value = products.value.filter((item) => item._id !== productId)

    if (products.value.length === 0 && page.value > 1) {
      page.value--
    }
    await loadProducts()
    showSuccess(response?.message || "Product deleted successfully")
  } catch (error) {
    console.error(error)
    showError(error?.response?.data?.message || "Failed to delete product.")
  } finally {
    deletingProductId.value = ""
  }
}

async function repostProduct(product) {
  const productId = product?._id
  if (!productId) return

  if (!window.confirm(`Repost "${product?.name || "this product"}" and make it active again?`)) return

  repostingProductId.value = productId
  alert.value.show = false

  try {
    const response = await post(ENDPOINTS.REPOST_ADMIN_PRODUCT(productId))
    await loadProducts()
    showSuccess(response?.message || "Product reposted and activated successfully")
  } catch (error) {
    console.error(error)
    showError(error?.response?.data?.message || "Failed to repost product.")
  } finally {
    repostingProductId.value = ""
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
    paymentType: "",
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
    paymentType: product?.paymentType === "paid" ? "paid" : "free",
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
    if (editForm.value.paymentType?.trim()) fd.append("paymentType", editForm.value.paymentType.trim())
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
