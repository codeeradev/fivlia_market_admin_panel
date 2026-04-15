<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />

        <div class="rounded-2xl border border-gray-200 bg-white px-5 py-7
      dark:border-gray-800 dark:bg-white/5 xl:px-10 xl:py-12">
            <h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Filter Management
            </h2>

            <!-- Controls -->
            <div class="mb-4 flex flex-col items-start justify-between gap-3
        md:flex-row md:items-center">
                <div class="flex items-center gap-2">
                    <button @click="openAddModal" class="rounded bg-green-600 px-3 py-2 text-sm text-white">
                        Add Filter
                    </button>

                    <button @click="loadFilters" class="rounded bg-blue-600 px-3 py-2 text-sm text-white">
                        Refresh
                    </button>
                </div>

                <div class="text-sm text-gray-500">
                    Total:
                    <strong class="text-gray-700 dark:text-white/90">
                        {{ filters.length }}
                    </strong>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="py-10 text-center">
                <div class="flex items-center justify-center gap-3">
                    <div class="h-10 w-10 animate-spin rounded-full border-4
            border-gray-200 border-t-theme"></div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                        Loading filters...
                    </div>
                </div>
            </div>

            <!-- Empty -->
            <div v-else-if="filters.length === 0" class="py-10 text-center text-gray-500">
                No filters found.
            </div>

            <!-- Table -->
            <div v-else>
                <BaseTable>
                    <template #head>
                        <th class="px-4 py-3">Filters</th>
                        <th class="px-4 py-3">Category</th>
                        <th class="px-4 py-3">Sub Category</th>
                        <th class="px-4 py-3">Actions</th>
                    </template>

                    <template #body>
                        <tr v-for="item in filters" :key="item._id">

                            <td class="px-4 py-3">
                                <div class="flex flex-wrap gap-2">
                                    <span v-for="f in item.filter" :key="f"
                                        class="rounded bg-gray-100 px-2 py-1 text-xs">
                                        {{ f }}
                                    </span>
                                </div>
                            </td>

                            <td class="px-4 py-3">
                                {{ getCategoryName(item.categoryId) }}
                            </td>

                            <td class="px-4 py-3">
                                {{ getSubCategoryName(item.categoryId, item.subCategoryId) || '-' }}
                            </td>

                            <td class="px-4 py-3">
                                <button @click="editFilter(item)"
                                    class="mr-2 rounded bg-amber-500 px-3 py-2 text-xs text-white">
                                    Edit
                                </button>

                                <button @click="deleteFilter(item._id)"
                                    class="rounded bg-red-600 px-3 py-2 text-xs text-white">
                                    Delete
                                </button>
                            </td>

                        </tr>
                    </template>
                </BaseTable>
            </div>

            <!-- Add Modal -->
            <BaseModal v-if="showModal" @close="closeModal">

                <template #title>{{ isEdit ? 'Edit Filter' : 'Add Filter' }}</template>

                <template #default>

                    <div class="space-y-4">

                        <!-- Category -->
                        <div>
                            <label class="text-sm font-medium">Category</label>
                            <select v-model="form.categoryId" @change="onCategoryChange" class="w-full rounded border px-3 py-2">
                                <option value="">Select Category</option>
                                <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                                    {{ cat.name }}
                                </option>
                            </select>
                        </div>

                        <!-- SubCategory -->
                        <div>
                            <label class="text-sm font-medium">Sub Category</label>
                            <select v-model="form.subCategoryId" class="w-full rounded border px-3 py-2" :disabled="!form.categoryId">
                                <option value="">Select Sub Category (Optional)</option>
                                <option v-for="subCat in subCategories" :key="subCat._id" :value="subCat._id">
                                    {{ subCat.name }}
                                </option>
                            </select>
                        </div>

                        <!-- LinkedIn Style Tag Input -->
                        <div>
                            <label class="text-sm font-medium">Filters</label>

                            <div class="flex flex-wrap items-center gap-2 rounded border p-2">

                                <span v-for="(skill, index) in form.filters" :key="index"
                                    class="flex items-center gap-1 rounded bg-gray-200 px-2 py-1 text-xs">
                                    {{ skill }}

                                    <button class="text-red-600" @click="removeSkill(index)">
                                        ×
                                    </button>

                                </span>

                                <input v-model="skillInput" @keydown.enter.prevent="addSkill"
                                    @keydown.comma.prevent="addSkill" @keydown.space.prevent="addSkill" placeholder="Type filter and press Enter/Space"
                                    class="flex-1 border-none outline-none" />

                            </div>
                        </div>

                    </div>

                </template>

                <template #footer>

                    <div class="flex gap-2">

                        <button @click="closeModal" class="rounded bg-gray-300 px-4 py-2">
                            Cancel
                        </button>

                        <button @click="submitFilter" :disabled="submitting"
                            class="rounded bg-green-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60">
                            {{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Save' }}
                        </button>

                    </div>

                </template>

            </BaseModal>

        </div>
    </AdminLayout>
</template>

<script setup>

import { ref, onMounted } from 'vue'

import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseModal from '@/components/common/BaseModal.vue'

import { get, post, del } from '@/apis/apiClient'
import { ENDPOINTS } from '@/apis/endpoint'

const currentPageTitle = ref('Filters')

const filters = ref([])
const loading = ref(true)

const showModal = ref(false)
const isEdit = ref(false)
const editingFilterId = ref('')
const submitting = ref(false)

const skillInput = ref('')

const categories = ref([])
const subCategories = ref([])

const form = ref({
    filters: [],
    categoryId: '',
    subCategoryId: ''
})

const resetForm = () => {
    form.value = {
        filters: [],
        categoryId: '',
        subCategoryId: ''
    }

    subCategories.value = []
    skillInput.value = ''
}

/* Load Filters */

const loadFilters = async () => {
    try {

        loading.value = true

        const res = await get(ENDPOINTS.GET_FILTERS)

        filters.value = res?.data || []

    } catch (error) {

        console.error(error)
        filters.value = []

    } finally {

        loading.value = false

    }
}

/* Load Categories */

const loadCategories = async () => {
    try {

        const res = await get(ENDPOINTS.CATEGORY.GET_ALL)

        categories.value = res?.categories || []

    } catch (error) {

        console.error(error)
        categories.value = []

    }
}

/* Add Skill */

const addSkill = () => {

    const value = skillInput.value.trim()

    if (!value) return

    if (!form.value.filters.includes(value)) {

        form.value.filters.push(value)

    }

    skillInput.value = ''
}

/* Remove Skill */

const removeSkill = (index) => {

    form.value.filters.splice(index, 1)

}

/* Submit Filter */

const submitFilter = async () => {

    try {

        submitting.value = true

        if (form.value.filters.length === 0 || !form.value.categoryId) {

            alert('Filters and Category required')
            return

        }

        const payload = {

            filter: form.value.filters,
            categoryId: form.value.categoryId,
            subCategoryId: form.value.subCategoryId || null

        }

        if (isEdit.value && editingFilterId.value) {

            await post(ENDPOINTS.EDIT_FILTER(editingFilterId.value), payload)

        } else {

            await post(ENDPOINTS.ADD_FILTER, payload)

        }

        closeModal()

        await loadFilters()

    } catch (error) {

        console.error(error)

        alert(error?.response?.data?.message || `Failed to ${isEdit.value ? 'update' : 'add'} filter`)

    } finally {

        submitting.value = false

    }

}

/* Delete */

const deleteFilter = async (id) => {

    try {

        if (!confirm('Delete this filter?')) return

        await del(ENDPOINTS.DELETE_FILTER(id))

        await loadFilters()

    } catch (error) {

        console.error(error)

    }

}

/* Open Add Modal */

const openAddModal = () => {

    isEdit.value = false
    editingFilterId.value = ''
    resetForm()
    showModal.value = true

}

/* Edit Filter */

const editFilter = (item) => {

    isEdit.value = true
    editingFilterId.value = item._id

    form.value = {
        filters: Array.isArray(item.filter) ? [...item.filter] : [],
        categoryId: item.categoryId || '',
        subCategoryId: item.subCategoryId || ''
    }

    skillInput.value = ''
    onCategoryChange(true)
    showModal.value = true

}

/* Close Modal */

const closeModal = () => {

    showModal.value = false
    isEdit.value = false
    editingFilterId.value = ''
    resetForm()

}

/* Handle Category Change */

const onCategoryChange = (preserveSelection = false) => {
    const currentSubCategoryId = form.value.subCategoryId
    const selectedCategory = categories.value.find(cat => cat._id === form.value.categoryId)
    subCategories.value = selectedCategory?.subcat || []

    if (preserveSelection && subCategories.value.some(sub => sub._id === currentSubCategoryId)) {
        return
    }

    form.value.subCategoryId = ''
}

/* Get Category Name */

const getCategoryName = (categoryId) => {
    const category = categories.value.find(cat => cat._id === categoryId)
    return category?.name || categoryId
}

/* Get SubCategory Name */

const getSubCategoryName = (categoryId, subCategoryId) => {
    if (!subCategoryId) return null
    const category = categories.value.find(cat => cat._id === categoryId)
    const subCategory = category?.subcat?.find(sub => sub._id === subCategoryId)
    return subCategory?.name || subCategoryId
}

onMounted(() => {
    loadFilters()
    loadCategories()
})

</script>

<style scoped>
.text-theme {
    color: #0f766e;
}

.border-t-theme {
    border-top-color: #0f766e;
}
</style>
