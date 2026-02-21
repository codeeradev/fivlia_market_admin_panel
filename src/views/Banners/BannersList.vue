<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Banners" />

    <div class="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Banners
        </h2>

        <button @click="openModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          + Add Banner
        </button>
      </div>

      <div class="overflow-x-auto">
        <BaseTable>
          <template #head>
            <th class="px-4 py-2">Image</th>
            <th class="px-4 py-2">Title</th>
            <th class="px-4 py-2">Type</th>
            <th class="px-4 py-2">Category</th>
            <th class="px-4 py-2 text-center">Status</th>
            <th class="px-4 py-2 text-center">Actions</th>
          </template>

          <template #body>
            <tr v-for="b in banners" :key="b._id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-2">
                <img :src="imgUrl(b.image)" class="h-10 w-20 rounded-md object-cover" />
              </td>

              <td class="px-4 py-2 font-medium">{{ b.title }}</td>
              <td class="px-4 py-2">{{ b.type }}</td>

              <td class="px-4 py-2">
                {{ b.mainCategory?.name }}
                <span v-if="b.subCategory"> / {{ b.subCategory?.name }}</span>
              </td>

              <td class="px-4 py-2 text-center">
                <button @click="toggleStatus(b)" class="px-2 py-1 text-xs text-white rounded"
                  :class="b.status ? 'bg-green-500' : 'bg-red-500'">
                  {{ b.status ? "Active" : "Inactive" }}
                </button>
              </td>

              <td class="px-4 py-2 text-center space-x-2">
                <button @click="editBanner(b)" class="px-2 py-1 bg-yellow-500 text-white rounded text-xs">
                  Edit
                </button>
                <button @click="removeBanner(b._id)" class="px-2 py-1 bg-red-600 text-white rounded text-xs">
                  Delete
                </button>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>

      <div v-if="banners.length === 0" class="text-center py-10 text-gray-500">
        No banners found
      </div>
    </div>

    <!-- MODAL -->
    <BaseModal v-if="showModal" @close="showModal = false">
      <template #title>{{ isEdit ? "Edit Banner" : "Add Banner" }}</template>

<div class="grid grid-cols-1 gap-4">

  <div>
    <label class="font-medium text-sm mb-1">Title</label>
    <input v-model="form.title" class="border rounded p-2 h-10 w-full" />
  </div>

  <div>
    <label class="font-medium text-sm mb-1">Type</label>
    <select v-model="form.type" class="border rounded p-2 h-10 w-full">
      <option value="normal">Normal</option>
      <option value="offer">Offer</option>
    </select>
  </div>

  <div class="flex items-center gap-2 mt-1">
    <input type="checkbox" v-model="form.status" />
    <label class="font-medium text-sm">Status</label>
  </div>

  <div>
    <label class="font-medium text-sm mb-1">Main Category</label>
    <select v-model="form.mainCategory" @change="loadSubCategories" class="border rounded p-2 h-10 w-full">
      <option value="">Select Category</option>
      <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
    </select>
  </div>

  <div>
    <label class="font-medium text-sm mb-1">Sub Category</label>
    <select v-model="form.subCategory" class="border rounded p-2 h-10 w-full">
      <option value="">Select Sub Category</option>
      <option v-for="s in subCategories" :key="s._id" :value="s._id">{{ s.name }}</option>
    </select>
  </div>

  <div>
    <label class="font-medium text-sm mb-1">City</label>
    <select v-model="form.cityId" class="border rounded p-2 h-10 w-full">
      <option value="">Select City</option>
      <option v-for="c in cities" :key="c._id" :value="c._id">{{ c.city || c.name }}</option>
    </select>
  </div>

  <div v-if="!isEdit">
    <label class="font-medium text-sm mb-1">From Date</label>
    <input v-model="form.fromDate" type="datetime-local" class="border rounded p-2 h-10 w-full" />
  </div>

  <div v-if="!isEdit">
    <label class="font-medium text-sm mb-1">To Date</label>
    <input v-model="form.toDate" type="datetime-local" class="border rounded p-2 h-10 w-full" />
  </div>

  <div>
    <label class="font-medium text-sm mb-1">Image</label>
    <input type="file" @change="selectFile" class="border rounded p-2 h-10 w-full" />
    <img v-if="preview" :src="preview" class="h-24 w-48 object-cover rounded border mt-2" />
  </div>

</div>

      <template #footer>
        <button @click="showModal = false" class="px-4 py-2 border rounded">
          Cancel
        </button>
        <button @click="saveBanner" class="px-4 py-2 bg-blue-600 text-white rounded">
          Save
        </button>
      </template>
    </BaseModal>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import { get, post, put, del } from "@/apis/apiClient";
import { ENDPOINTS } from "@/apis/endpoint";

const banners = ref([]);
const categories = ref([]);
const subCategories = ref([]);
const cities = ref([]);

const showModal = ref(false);
const isEdit = ref(false);
const editId = ref("");

const file = ref(null);
const preview = ref("");

const form = ref({
  title: "",
  status: true,
  type: "normal",
  mainCategory: "",
  subCategory: "",
  cityId: "",
  fromDate: "",
  toDate: "",
});

/* ---------------- IMAGES ---------------- */
const IMAGE_URL = import.meta.env.VITE_IMAGEURL || "";

const imgUrl = (path) => {
  if (!path) return "/no-image.png";
  return IMAGE_URL + path;
};

/* ---------------- FETCH ALL DATA ---------------- */
onMounted(() => {
  fetchAll();
  loadCategories();
  loadCities();
});

const fetchAll = async () => {
  const res = await get(ENDPOINTS.GET_BANNERS);
  banners.value = res.banners || res;
};

const loadCategories = async () => {
  const res = await get(ENDPOINTS.CATEGORY.GET_ALL);
  categories.value = res.categories || [];
};

const loadCities = async () => {
  const res = await get(ENDPOINTS.GET_CITY);
  cities.value = Array.isArray(res) ? res : res?.data || res?.cities || [];
};

const loadSubCategories = () => {
  const cat = categories.value.find((c) => c._id === form.value.mainCategory);
  subCategories.value = cat ? cat.subcat : [];
};

/* ---------------- MODAL HANDLING ---------------- */
const openModal = () => {
  isEdit.value = false;
  editId.value = "";
  file.value = null;
  preview.value = "";
  form.value = {
    title: "",
    status: true,
    type: "normal",
    mainCategory: "",
    subCategory: "",
    cityId: "",
    fromDate: "",
    toDate: "",
  };
  showModal.value = true;
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const editBanner = (b) => {
  isEdit.value = true;
  editId.value = b._id;

  form.value.title = b.title;
  form.value.status = b.status;
  form.value.type = b.type;
  form.value.mainCategory = b.mainCategory?._id || "";
  form.value.subCategory = b.subCategory?._id || "";
  form.value.cityId =
    b.cityId?._id ||
    b.cityId ||
    (Array.isArray(b.city) && b.city.length ? b.city[0]?._id || b.city[0] : "") ||
    "";
  form.value.fromDate = formatDateTimeLocal(b.fromDate);
  form.value.toDate = formatDateTimeLocal(b.toDate);

  preview.value = imgUrl(b.image);

  loadSubCategories();

  showModal.value = true;
};

/* ---------------- IMAGE UPLOAD ---------------- */
const selectFile = (e) => {
  const f = e.target.files?.[0];
  if (!f) return;
  file.value = f;
  preview.value = URL.createObjectURL(f);
};

/* ---------------- SAVE ---------------- */
const saveBanner = async () => {
  try {
    const fd = new FormData();

    if (file.value) fd.append("image", file.value);

    if (isEdit.value) {
      fd.append("title", form.value.title);
      fd.append("status", String(form.value.status));
      fd.append("type2", form.value.type); // backend expects type2
      fd.append("mainCategory", form.value.mainCategory);
      if (form.value.subCategory) fd.append("subCategory", form.value.subCategory);
      if (form.value.cityId) fd.append("city", JSON.stringify([form.value.cityId]));

      await put(ENDPOINTS.UPDATE_BANNER(editId.value), fd);
    } else {
      if (!form.value.mainCategory) {
        alert("Main category is required");
        return;
      }
      if (!form.value.fromDate || !form.value.toDate) {
        alert("From Date and To Date are required");
        return;
      }

      const parsedFromDate = new Date(form.value.fromDate);
      const parsedToDate = new Date(form.value.toDate);

      if (Number.isNaN(parsedFromDate.getTime()) || Number.isNaN(parsedToDate.getTime())) {
        alert("Please provide valid From Date and To Date");
        return;
      }

      fd.append("title", form.value.title);
      fd.append("mainCategory", form.value.mainCategory);
      if (form.value.subCategory) fd.append("subCategory", form.value.subCategory);
      if (form.value.cityId) fd.append("cityId", form.value.cityId);
      fd.append("fromDate", parsedFromDate.toISOString());
      fd.append("toDate", parsedToDate.toISOString());

      await post(ENDPOINTS.ADD_ADMIN_BANNER, fd);
    }

    showModal.value = false;
    await fetchAll();
  } catch (error) {
    console.error(error);
    alert(error?.response?.data?.message || "Failed to save banner");
  }
};

/* ---------------- STATUS ---------------- */
const toggleStatus = async (b) => {
  await put(ENDPOINTS.UPDATE_BANNER(b._id), { status: !b.status });
  fetchAll();
};

/* ---------------- DELETE ---------------- */
const removeBanner = async (id) => {
  if (!confirm("Delete?")) return;
  await del(ENDPOINTS.DELETE_BANNER(id));
  fetchAll();
};
</script>
