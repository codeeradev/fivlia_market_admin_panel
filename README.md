<!-- src/views/Category.vue -->
<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Categories" />

    <div class="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {{
              viewMode === "categories"
                ? "Categories"
                : `Subcategories of ${parentCategory?.name ?? ""}`
            }}
          </h2>
          <p v-if="viewMode === 'subcategories'" class="text-xs text-gray-500">
            Showing subcategories inside: {{ parentCategory?.name }}
          </p>
        </div>

        <div class="flex gap-2">
          <button v-if="viewMode === 'subcategories'" @click="backToCategories"
            class="px-3 py-2 border rounded-lg text-sm">
            ← Back to Categories
          </button>

          <button v-if="viewMode === 'subcategories'" @click="openCategoryModal('sub', null, parentCategory?._id)"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
            + Add Subcategory
          </button>

          <button @click="openCategoryModal('main')"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
            + Add Category
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full text-left border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead class="bg-gray-100 dark:bg-gray-800 text-sm">
            <!-- Category header -->
            <tr v-if="viewMode === 'categories'">
              <th class="px-4 py-2">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Attributes</th>
              <th class="px-4 py-2 text-center">Subcategories</th>
              <th class="px-4 py-2 text-center">Status</th>
              <th class="px-4 py-2 text-center">Actions</th>
            </tr>

            <!-- Subcategory header -->
            <tr v-else>
              <th class="px-4 py-2">Image</th>
              <th class="px-4 py-2">Name</th>
              <th class="px-4 py-2">Commission (%)</th>
              <th class="px-4 py-2 text-center">Status</th>
              <th class="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <!-- Category rows -->
          <tbody v-if="viewMode === 'categories'">
            <tr v-for="cat in categories" :key="cat._id" class="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-2">
                <img :src="imageUrl(cat.image)" class="h-10 w-10 rounded-md object-cover" />
              </td>

              <td class="px-4 py-2 font-medium">{{ cat.name }}</td>

              <td class="px-4 py-2 text-sm text-gray-500">
                {{ (cat.attribute ?? []).join(", ") || "-" }}
              </td>

              <td class="px-4 py-2 text-center">
                <button @click="showSubList(cat)" class="text-blue-600 underline">
                  {{ cat.subcat?.length ?? 0 }}
                </button>
              </td>

              <td class="px-4 py-2 text-center">
                <button @click="toggleStatus(cat._id!)" class="px-2 py-1 text-xs rounded text-white"
                  :class="cat.status ? 'bg-green-500' : 'bg-red-500'">
                  {{ cat.status ? "Active" : "Inactive" }}
                </button>
              </td>

              <td class="px-4 py-2 text-center space-x-2">
                <button @click="openCategoryModal('main', cat)"
                  class="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white text-xs rounded">
                  Edit
                </button>

                <button @click="deleteEntity(cat._id!)"
                  class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>

          <!-- Subcategory rows (for selected parentCategory) -->
          <tbody v-else>
            <tr v-for="sub in parentCategory?.subcat ?? []" :key="sub._id"
              class="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-2">
                <img :src="imageUrl(sub.image)" class="h-10 w-10 rounded-md object-cover" />
              </td>

              <td class="px-4 py-2 font-medium">
                {{ sub.name }}
              </td>

              <td class="px-4 py-2">
                {{ (sub as any).commison ?? "-" }}
              </td>

              <td class="px-4 py-2 text-center">
                <button @click="toggleStatus(parentCategory!._id!, sub._id)"
                  class="px-2 py-1 text-xs rounded text-white" :class="sub.status ? 'bg-green-500' : 'bg-red-500'">
                  {{ sub.status ? "Active" : "Inactive" }}
                </button>
              </td>

              <td class="px-4 py-2 text-center space-x-2">
                <button @click="editSub(sub)"
                  class="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white text-xs rounded">
                  Edit
                </button>

                <button @click="deleteEntity(parentCategory!._id!, sub._id)"
                  class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded">
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="(parentCategory?.subcat ?? []).length === 0">
              <td colspan="5" class="text-center py-6 text-gray-500">
                No subcategories yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="viewMode === 'categories' && categories.length === 0" class="text-center py-10 text-gray-500">
        No categories found
      </div>
    </div>

    <!-- CATEGORY / SUBCATEGORY MODAL -->
    <Modal v-if="showCategoryModal" @close="closeCategoryModal">
      <template #title>
        {{
          categoryType === "main"
            ? form.id
              ? "Edit Category"
              : "Add Category"
            : form.id
              ? "Edit Subcategory"
              : "Add Subcategory"
        }}
      </template>

      <div class="space-y-4">
        <!-- Type selector only when creating new -->
        <div v-if="!form.id" class="flex items-center gap-4">
          <span class="text-sm font-medium">Type:</span>
          <label class="flex items-center gap-1 text-sm">
            <input type="radio" value="main" v-model="categoryType" />
            Main Category
          </label>
          <label class="flex items-center gap-1 text-sm">
            <input type="radio" value="sub" v-model="categoryType" />
            Subcategory
          </label>
        </div>

        <!-- City + Price Section -->
        <div>
          <label class="block mb-1 text-sm font-medium">City & Price</label>

          <div v-for="(item, index) in cityList" :key="index" class="flex items-center gap-2 mb-2">
            <select class="border rounded p-2 w-1/2" v-model="item.cityId">
              <option disabled value="">Select city</option>
              <option v-for="c in allCities" :key="c._id" :value="c._id">
                {{ c.city }}
              </option>
            </select>

            <input type="number" placeholder="Price" class="border rounded p-2 w-1/3" v-model.number="item.price" />

            <button class="bg-red-500 text-white px-2 py-1 rounded" @click="cityList.splice(index, 1)">
              X
            </button>
          </div>

          <button class="px-3 py-1 bg-green-600 text-white rounded text-xs"
            @click="cityList.push({ cityId: '', price: 0 })">
            + Add City Price
          </button>
        </div>

        <!-- Parent category select when type is sub -->
        <div v-if="categoryType === 'sub'">
          <label class="block mb-1 text-sm font-medium">Parent Category</label>
          <select v-model="selectedParentId" class="w-full border rounded p-2 text-sm">
            <option value="">Select parent category</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium">
            {{ categoryType === "main" ? "Category Name" : "Subcategory Name" }}
          </label>
          <input v-model="form.name" placeholder="Name" class="w-full border rounded p-2" />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium">Description</label>
          <textarea v-model="form.description" placeholder="Description" class="w-full border rounded p-2"></textarea>
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium">Image</label>
          <input type="file" accept="image/*" @change="handleCategoryImage" class="border p-2 rounded w-full" />

          <div v-if="formImagePreview" class="mt-2">
            <img :src="formImagePreview" class="h-20 w-20 object-cover rounded border" />
          </div>
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium">
            Attributes (comma separated)
          </label>
          <input v-model="attributesInput" placeholder="e.g. Size, Color" class="border rounded p-2 w-full" />
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium">Status:</label>
          <button type="button" @click="form.status = !form.status" class="px-3 py-1 rounded text-xs text-white"
            :class="form.status ? 'bg-green-500' : 'bg-red-500'">
            {{ form.status ? "Active" : "Inactive" }}
          </button>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <button @click="closeCategoryModal" class="px-4 py-2 border rounded">
            Cancel
          </button>
          <button @click="saveCategory" class="px-4 py-2 bg-blue-600 text-white rounded">
            Save
          </button>
        </div>
      </template>
    </Modal>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import Modal from "@/views/Others/Modal.vue";
import { get, post, del, patch } from "@/apis/apiClient";
import { ENDPOINTS } from "@/apis/endpoint";
import type { ICategory, ISubCategory } from "@/interfaces/category";

const IMAGEURL = import.meta.env.VITE_IMAGEURL || "";

/* States */
const categories = ref<ICategory[]>([]);
const showCategoryModal = ref(false);

const selectedCategory = ref<ICategory | null>(null);
const parentCategory = ref<ICategory | null>(null);

const viewMode = ref<"categories" | "subcategories">("categories");

/* Type: main category or subcategory when using modal */
const categoryType = ref<"main" | "sub">("main");
const selectedParentId = ref<string>("");

/* Category / Subcategory Form (shared) */
const form = reactive({
  id: "",
  name: "",
  description: "",
  image: "",
  status: true,
  attribute: [] as string[],
});

const attributesInput = ref("");
const selectedFileCategory = ref<File | null>(null);
const formImagePreview = ref("");
const allCities = ref<{ _id: string; city: string }[]>([]);
const cityList = ref<{ cityId: string; price: number }[]>([]);


/* Helpers */
const imageUrl = (path?: string) => {
  if (!path) return "/no-image.png";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${IMAGEURL}/${path.replace(/^\//, "")}`;
};

/* Fetch */
const fetchCategories = async () => {
  try {
    const res: any = await get(ENDPOINTS.CATEGORY.GET_ALL);
    categories.value = res?.categories || [];

    // Refresh parentCategory ref after reload if in sub view
    if (viewMode.value === "subcategories" && parentCategory.value) {
      const updatedParent = categories.value.find(
        (c) => c._id === parentCategory.value?._id
      );
      if (updatedParent) parentCategory.value = updatedParent;
      else {
        // parent deleted
        viewMode.value = "categories";
        parentCategory.value = null;
      }
    }
  } catch (err) {
    console.error("Error loading categories:", err);
  }
};

const fetchCities = async () => {
  try {
    const res: any = await get(ENDPOINTS.GET_CITY);
    allCities.value = res || [];
  } catch (err) {
    console.error("Failed loading cities", err);
  }
};

/* VIEW SWITCHING */
const showSubList = (cat: ICategory) => {
  parentCategory.value = cat;
  viewMode.value = "subcategories";
};

const backToCategories = () => {
  viewMode.value = "categories";
  parentCategory.value = null;
};

/* CATEGORY / SUBCATEGORY MODAL LOGIC */
const openCategoryModal = (
  type: "main" | "sub" = "main",
  cat: ICategory | null = null,
  parentId?: string
) => {
  showCategoryModal.value = true;

  // If cat is passed, we are editing a main category
  if (cat) {
    categoryType.value = "main";
    selectedCategory.value = cat;

    form.id = cat._id || "";
    form.name = cat.name || "";
    form.description = (cat as any).description || "";
    form.image = cat.image || "";
    form.status = cat.status ?? true;
    form.attribute = (cat.attribute as string[]) || [];

    attributesInput.value = form.attribute.join(", ");
    selectedFileCategory.value = null;
    formImagePreview.value = form.image ? imageUrl(form.image) : "";
    selectedParentId.value = "";
    return;
  }

  // Creating new
  categoryType.value = type;
  selectedCategory.value = null;

  form.id = "";
  form.name = "";
  form.description = "";
  form.image = "";
  form.status = true;
  form.attribute = [];
  attributesInput.value = "";
  selectedFileCategory.value = null;
  formImagePreview.value = "";

  if (type === "sub") {
    selectedParentId.value =
      parentId || parentCategory.value?._id || "";
  } else {
    selectedParentId.value = "";
  }
  if (cat) {
    cityList.value = JSON.parse(JSON.stringify(cat.city || []));
  } else {
    cityList.value = [];
  }

};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  selectedCategory.value = null;

  form.id = "";
  form.name = "";
  form.description = "";
  form.image = "";
  form.status = true;
  form.attribute = [];

  attributesInput.value = "";
  selectedFileCategory.value = null;
  formImagePreview.value = "";
  categoryType.value = "main";
  selectedParentId.value = "";
};

const handleCategoryImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  selectedFileCategory.value = file;
  formImagePreview.value = URL.createObjectURL(file);
};

const saveCategory = async () => {
  if (!form.name.trim()) {
    alert("Name is required");
    return;
  }

  // Build attributes array from input
  form.attribute = attributesInput.value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  const fd = new FormData();
  fd.append("name", form.name);
  fd.append("description", form.description);
  fd.append("status", String(form.status));
  fd.append("city", JSON.stringify(cityList.value));
  fd.append("attribute", JSON.stringify(form.attribute));

  if (selectedFileCategory.value) {
    fd.append("image", selectedFileCategory.value);
  } else if (form.image) {
    // Keep existing image path when not changing image
    fd.append("image", form.image);
  }

  try {
    if (categoryType.value === "main") {
      // Main category create/update
      if (form.id) {
        fd.append("id", form.id);
      }

      await post(ENDPOINTS.CATEGORY.SAVE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      // Subcategory create/update
      if (!selectedParentId.value) {
        alert("Please select a parent category");
        return;
      }

      fd.append("commison", ""); // optional, can be adjusted

      if (form.id) {
        // Edit subcategory
        await post(
          ENDPOINTS.CATEGORY.SAVE_SUB_ENTITY(selectedParentId.value, form.id),
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // New subcategory
        await post(
          ENDPOINTS.CATEGORY.SAVE_SUB_ENTITY(selectedParentId.value),
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
    }

    await fetchCategories();
    closeCategoryModal();
  } catch (err) {
    console.error("Save category/subcategory failed:", err);
  }
};

/* DELETE (CATEGORY OR SUBCATEGORY) */
const deleteEntity = async (catId: string, subId?: string) => {
  if (!confirm("Delete this item?")) return;

  try {
    await del(ENDPOINTS.CATEGORY.DELETE_ENTITY(catId, subId));
    await fetchCategories();
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

/* TOGGLE STATUS (CATEGORY OR SUBCATEGORY) */
const toggleStatus = async (catId: string, subId?: string) => {
  try {
    await patch(ENDPOINTS.CATEGORY.TOGGLE_STATUS(catId, subId));
    await fetchCategories();
  } catch (err) {
    console.error("Toggle failed:", err);
  }
};

/* EDIT SUBCATEGORY VIA SAME MODAL */
const editSub = (sub: ISubCategory) => {
  if (!parentCategory.value) return;

  categoryType.value = "sub";
  selectedParentId.value = parentCategory.value._id || "";

  form.id = sub._id || "";
  form.name = sub.name || "";
  form.description = (sub as any).description || "";
  form.image = sub.image || "";
  form.status = sub.status ?? true;
  form.attribute = ((sub as any).attribute as string[]) || [];

  attributesInput.value = form.attribute.join(", ");
  selectedFileCategory.value = null;
  formImagePreview.value = form.image ? imageUrl(form.image) : "";

  showCategoryModal.value = true;
};

onMounted(() => {
  fetchCategories();
  fetchCities();
});

</script>

<style scoped></style>
