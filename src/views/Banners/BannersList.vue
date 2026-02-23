<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Banners" />

    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Banners</h2>

        <button
          @click="openModal"
          class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Add Banner
        </button>
      </div>

      <div class="overflow-x-auto">
        <BaseTable>
          <template #head>
            <th class="px-4 py-2">Image</th>
            <th class="px-4 py-2">Title</th>
            <th class="px-4 py-2">Category</th>
            <th class="px-4 py-2">Approval</th>
            <th class="px-4 py-2">Active</th>
            <th class="px-4 py-2 text-center">Actions</th>
          </template>

          <template #body>
            <tr
              v-for="b in banners"
              :key="b._id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-4 py-2">
                <img :src="imgUrl(b.image)" class="h-10 w-20 rounded-md object-cover" />
              </td>

              <td class="px-4 py-2">
                <div class="font-medium text-gray-900 dark:text-gray-100">{{ b.title || '-' }}</div>
              </td>

              <td class="px-4 py-2">
                <div class="text-sm text-gray-900 dark:text-gray-100">{{ b.mainCategory?.name || '-' }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ subCategoryLabel(b.subCategory, b.mainCategory) }} | {{ cityLabel(b.cityId) }}
                </div>
              </td>

              <td class="px-4 py-2">
                <span
                  class="rounded px-2 py-1 text-xs"
                  :class="approvalBadgeClass(b.aprroveStatus)"
                >
                  {{ statusLabel(b.aprroveStatus || 'pending') }}
                </span>
              </td>

              <td class="px-4 py-2">
                <button
                  @click="toggleStatus(b)"
                  class="rounded px-2 py-1 text-xs text-white"
                  :class="b.status ? 'bg-green-600' : 'bg-red-600'"
                >
                  {{ b.status ? 'Active' : 'Inactive' }}
                </button>
              </td>

              <td class="px-4 py-2 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openDetailsModal(b)"
                    class="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    @click="editBanner(b)"
                    class="rounded bg-yellow-500 px-2 py-1 text-xs text-white"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>

      <div v-if="banners.length === 0" class="py-10 text-center text-gray-500">No banners found</div>
    </div>

    <BaseModal v-if="showModal" @close="showModal = false">
      <template #title>{{ isEdit ? 'Edit Banner' : 'Add Banner' }}</template>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Title</label>
          <input v-model="form.title" class="h-10 w-full rounded border p-2" />
        </div>

        <div class="flex items-center gap-2" v-if="isEdit">
          <input type="checkbox" v-model="form.status" />
          <label class="text-sm font-medium">Active status</label>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Main Category</label>
          <select
            v-model="form.mainCategory"
            @change="loadSubCategories"
            class="h-10 w-full rounded border p-2"
          >
            <option value="">Select Category</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Sub Category</label>
          <select v-model="form.subCategory" class="h-10 w-full rounded border p-2">
            <option value="">Select Sub Category</option>
            <option v-for="s in subCategories" :key="s._id" :value="s._id">{{ s.name }}</option>
          </select>
        </div>

        <template v-if="!isEdit">
          <div>
            <label class="mb-1 block text-sm font-medium">City (optional)</label>
            <select v-model="form.cityId" class="h-10 w-full rounded border p-2">
              <option value="">Select City</option>
              <option v-for="c in cities" :key="c._id" :value="c._id">
                {{ c.city || c.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">From Date</label>
            <input v-model="form.fromDate" type="datetime-local" class="h-10 w-full rounded border p-2" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">To Date</label>
            <input v-model="form.toDate" type="datetime-local" class="h-10 w-full rounded border p-2" />
          </div>
        </template>

        <div>
          <label class="mb-1 block text-sm font-medium">Image</label>
          <input type="file" @change="selectFile" class="h-10 w-full rounded border p-2" />
          <img v-if="preview" :src="preview" class="mt-2 h-24 w-48 rounded border object-cover" />
        </div>
      </div>

      <template #footer>
        <button @click="showModal = false" class="rounded border px-4 py-2">Cancel</button>
        <button @click="saveBanner" class="rounded bg-blue-600 px-4 py-2 text-white">Save</button>
      </template>
    </BaseModal>

    <BaseModal v-if="showDetailsModal && detailBanner" @close="closeDetailsModal">
      <template #title>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-base font-semibold text-gray-900 dark:text-gray-100">Banner Details</span>
          <span class="rounded-full px-2 py-1 text-xs" :class="scheduleBadgeClass(detailBanner)">
            {{ scheduleLabel(detailBanner) }}
          </span>
        </div>
      </template>

      <div class="max-h-[68vh] space-y-4 overflow-y-auto pr-1">
        <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
            <img
              :src="imgUrl(detailBanner.image)"
              class="h-44 w-full object-cover lg:h-full"
              alt="Banner image"
            />
            <div class="bg-gradient-to-br from-gray-50 to-white p-4 dark:from-gray-900/40 dark:to-gray-900">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {{ detailBanner.title || '-' }}
                  </h3>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {{ detailBanner.mainCategory?.name || '-' }} / {{ subCategoryLabel(detailBanner.subCategory, detailBanner.mainCategory) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">City: {{ cityLabel(detailBanner.cityId) }}</p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span
                    class="rounded-full px-2 py-1 text-xs"
                    :class="approvalBadgeClass(detailBanner.aprroveStatus)"
                  >
                    {{ statusLabel(detailBanner.aprroveStatus || 'pending') }}
                  </span>
                  <span
                    class="rounded-full px-2 py-1 text-xs"
                    :class="detailBanner.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  >
                    {{ detailBanner.status ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Plan</p>
                  <p class="mt-1 font-semibold text-gray-900 dark:text-gray-100">{{ detailBanner.selectedPlanId?.duration || '-' }}</p>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Price</p>
                  <p class="mt-1 font-semibold text-gray-900 dark:text-gray-100">{{ formatPrice(detailBanner.selectedPlanId?.price) }}</p>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</p>
                  <p class="mt-1 font-semibold text-gray-900 dark:text-gray-100">{{ detailBanner.type || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h4 class="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Banner Info</h4>
            <div class="space-y-1 text-sm">
              <div class="flex items-center justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">Main Category</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ detailBanner.mainCategory?.name || '-' }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">Sub Category</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ subCategoryLabel(detailBanner.subCategory, detailBanner.mainCategory) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 py-2">
                <span class="text-gray-500 dark:text-gray-400">City</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ cityLabel(detailBanner.cityId) }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <h4 class="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Owner Info</h4>
            <div class="space-y-1 text-sm">
              <div class="flex items-center justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                <span class="text-gray-500 dark:text-gray-400">Name</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ detailBanner.userId?.name || '-' }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 py-2">
                <span class="text-gray-500 dark:text-gray-400">Mobile</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ detailBanner.userId?.mobileNumber || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 p-4 dark:border-gray-700 md:col-span-2">
            <h4 class="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Payment & Timeline</h4>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-1 text-sm">
                <div class="flex items-center justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                  <span class="text-gray-500 dark:text-gray-400">Transaction ID</span>
                  <span class="break-all text-right font-medium text-gray-900 dark:text-gray-100">{{ detailBanner.transactionId || '-' }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                  <span class="text-gray-500 dark:text-gray-400">From Date</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDateTime(detailBanner.fromDate) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 py-2">
                  <span class="text-gray-500 dark:text-gray-400">To Date</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDateTime(detailBanner.toDate) }}</span>
                </div>
              </div>

              <div class="space-y-1 text-sm">
                <div class="flex items-center justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                  <span class="text-gray-500 dark:text-gray-400">Approved At</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDateTime(detailBanner.approvedAt) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 border-b border-gray-100 py-2 dark:border-gray-800">
                  <span class="text-gray-500 dark:text-gray-400">Created At</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDateTime(detailBanner.createdAt) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 py-2">
                  <span class="text-gray-500 dark:text-gray-400">Updated At</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatDateTime(detailBanner.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="detailBanner.approvalReason"
          class="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30"
        >
          <p class="text-sm font-semibold text-red-700 dark:text-red-300">Approval Reason</p>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ detailBanner.approvalReason }}</p>
        </div>
      </div>

      <template #footer>
        <button @click="closeDetailsModal" class="rounded border px-4 py-2">Close</button>
        <button @click="editFromDetails" class="rounded bg-yellow-500 px-4 py-2 text-white">Edit Banner</button>
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
import { get, post, put } from "@/apis/apiClient";
import { ENDPOINTS } from "@/apis/endpoint";

const banners = ref([]);
const categories = ref([]);
const subCategories = ref([]);
const cities = ref([]);

const showModal = ref(false);
const showDetailsModal = ref(false);
const isEdit = ref(false);
const editId = ref("");
const detailBanner = ref(null);

const file = ref(null);
const preview = ref("");

const form = ref({
  title: "",
  status: true,
  mainCategory: "",
  subCategory: "",
  cityId: "",
  fromDate: "",
  toDate: "",
});

const IMAGE_URL = import.meta.env.VITE_IMAGEURL || "";

const imgUrl = (path) => {
  if (!path) return "/no-image.png";
  if (/^https?:\/\//i.test(path)) return path;
  const base = IMAGE_URL.replace(/\/+$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
};

const approvalBadgeClass = (status) => {
  const s = String(status || "pending").toLowerCase();
  if (s === "active") return "bg-green-100 text-green-700";
  if (s === "rejected") return "bg-red-100 text-red-700";
  if (s === "resubmit") return "bg-orange-100 text-orange-700";
  if (s === "expired") return "bg-gray-200 text-gray-700";
  return "bg-yellow-100 text-yellow-700";
};

const statusLabel = (value) => {
  const normalized = String(value || "").replace(/[_-]+/g, " ").trim();
  if (!normalized) return "-";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  const price = Number(value);
  if (Number.isNaN(price)) return String(value);
  return `Rs ${price.toLocaleString("en-IN")}`;
};

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value?._id || value?.id || "");
};

const subCategoryLabel = (subCategory, mainCategory) => {
  if (!subCategory) return "-";
  if (typeof subCategory === "object" && subCategory.name) return subCategory.name;

  const subCategoryId = toIdString(subCategory);
  if (!subCategoryId) return "-";

  const mainCategoryId = toIdString(mainCategory);
  let subCategoryPool = [];

  if (mainCategoryId) {
    const selectedMainCategory = categories.value.find(
      (category) => toIdString(category) === mainCategoryId,
    );
    subCategoryPool = Array.isArray(selectedMainCategory?.subcat)
      ? selectedMainCategory.subcat
      : [];
  }

  if (!subCategoryPool.length) {
    subCategoryPool = categories.value.flatMap((category) =>
      Array.isArray(category?.subcat) ? category.subcat : [],
    );
  }

  const matchedSubCategory = subCategoryPool.find(
    (item) => toIdString(item) === subCategoryId,
  );
  return matchedSubCategory?.name || "-";
};

const cityLabel = (city) => {
  if (!city) return "-";
  if (typeof city === "object") return city.city || city.name || "-";

  const cityId = toIdString(city);
  if (!cityId) return "-";

  const matchedCity = cities.value.find((item) => toIdString(item) === cityId);
  return matchedCity?.city || matchedCity?.name || "-";
};

const scheduleLabel = (banner) => {
  const from = Date.parse(banner?.fromDate || "");
  const to = Date.parse(banner?.toDate || "");
  if (Number.isNaN(from) || Number.isNaN(to)) return "No schedule";
  const now = Date.now();
  if (now < from) return "Scheduled";
  if (now > to) return "Expired";
  return "Running";
};

const scheduleBadgeClass = (banner) => {
  const state = scheduleLabel(banner);
  if (state === "Running") return "bg-green-100 text-green-700";
  if (state === "Scheduled") return "bg-blue-100 text-blue-700";
  if (state === "Expired") return "bg-gray-200 text-gray-700";
  return "bg-yellow-100 text-yellow-700";
};

const openDetailsModal = (banner) => {
  detailBanner.value = banner;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  detailBanner.value = null;
};

const editFromDetails = () => {
  if (!detailBanner.value) return;
  const banner = detailBanner.value;
  closeDetailsModal();
  editBanner(banner);
};

onMounted(async () => {
  await Promise.all([fetchAll(), loadCategories(), loadCities()]);
});

const fetchAll = async () => {
  try {
    const res = await get(ENDPOINTS.GET_BANNERS);
    banners.value = Array.isArray(res) ? res : res?.banners || [];
  } catch (error) {
    console.error(error);
    banners.value = [];
  }
};

const loadCategories = async () => {
  try {
    const res = await get(ENDPOINTS.CATEGORY.GET_ALL);
    categories.value = Array.isArray(res?.categories) ? res.categories : [];
  } catch (error) {
    console.error(error);
    categories.value = [];
  }
};

const loadCities = async () => {
  try {
    const res = await get(ENDPOINTS.GET_CITY);
    cities.value = Array.isArray(res) ? res : res?.data || res?.cities || [];
  } catch (error) {
    console.error(error);
    cities.value = [];
  }
};

const loadSubCategories = () => {
  const cat = categories.value.find((c) => c._id === form.value.mainCategory);
  subCategories.value = cat ? cat.subcat || [] : [];
};

const resetForm = () => {
  file.value = null;
  preview.value = "";
  subCategories.value = [];
  form.value = {
    title: "",
    status: true,
    mainCategory: "",
    subCategory: "",
    cityId: "",
    fromDate: "",
    toDate: "",
  };
};

const openModal = () => {
  isEdit.value = false;
  editId.value = "";
  resetForm();
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

const editBanner = (banner) => {
  closeDetailsModal();
  isEdit.value = true;
  editId.value = banner._id;

  form.value.title = banner.title || "";
  form.value.status = !!banner.status;
  form.value.mainCategory = banner.mainCategory?._id || "";
  form.value.subCategory = banner.subCategory?._id || "";
  form.value.cityId = banner.cityId?._id || banner.cityId || "";
  form.value.fromDate = formatDateTimeLocal(banner.fromDate);
  form.value.toDate = formatDateTimeLocal(banner.toDate);

  preview.value = imgUrl(banner.image);
  loadSubCategories();

  showModal.value = true;
};

const selectFile = (event) => {
  const selected = event.target.files?.[0];
  if (!selected) return;
  file.value = selected;
  preview.value = URL.createObjectURL(selected);
};

const saveBanner = async () => {
  try {
    const fd = new FormData();

    if (file.value) fd.append("image", file.value);

    if (isEdit.value) {
      fd.append("title", form.value.title || "");
      fd.append("status", String(!!form.value.status));
      if (form.value.mainCategory) fd.append("mainCategory", form.value.mainCategory);
      if (form.value.subCategory) fd.append("subCategory", form.value.subCategory);

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

      fd.append("title", form.value.title || "");
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

const toggleStatus = async (banner) => {
  try {
    await put(ENDPOINTS.UPDATE_BANNER(banner._id), { status: !banner.status });
    await fetchAll();
  } catch (error) {
    console.error(error);
    alert(error?.response?.data?.message || "Failed to update banner status");
  }
};
</script>
