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

      <div v-if="isLoadingList" class="flex justify-center py-10">
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
        ></div>
      </div>

      <div v-else class="overflow-x-auto">
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
                  {{ subCategoryLabel(b.subCategory, b.mainCategory) }}
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
                  :disabled="statusUpdatingId === b._id"
                  class="inline-flex items-center gap-2 rounded px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-70"
                  :class="b.status ? 'bg-green-600' : 'bg-red-600'"
                >
                  <span
                    v-if="statusUpdatingId === b._id"
                    class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white"
                  ></span>
                  {{ statusUpdatingId === b._id ? 'Updating...' : b.status ? 'Active' : 'Inactive' }}
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

      <div v-if="!isLoadingList && banners.length === 0" class="py-10 text-center text-gray-500">No banners found</div>
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

        <div>
          <label class="mb-1 block text-sm font-medium">Latitude</label>
          <input
            v-model="form.latitude"
            type="number"
            step="any"
            placeholder="e.g. 28.6139"
            class="h-10 w-full rounded border p-2"
          />
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Longitude</label>
          <input
            v-model="form.longitude"
            type="number"
            step="any"
            placeholder="e.g. 77.2090"
            class="h-10 w-full rounded border p-2"
          />
        </div>

        <template v-if="!isEdit">
          <div>
            <label class="mb-1 block text-sm font-medium">From Date</label>
            <input v-model="form.fromDate" type="datetime-local" class="h-10 w-full rounded border p-2" />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium">To Date</label>
            <input v-model="form.toDate" type="datetime-local" class="h-10 w-full rounded border p-2" />
          </div>
        </template>

        <div
          v-else
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          Existing banner schedule is read-only here. The edit API only updates banner content, location, category, image, and status.
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium">Image</label>
          <p class="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Required banner size: 1280 x 540 px. Other dimensions will be rejected.
          </p>
          <input type="file" accept="image/*" @change="selectFile" class="h-10 w-full rounded border p-2" />
          <img v-if="preview" :src="preview" class="mt-2 h-24 w-48 rounded border object-cover" />
        </div>
      </div>

      <template #footer>
        <button
          @click="showModal = false"
          :disabled="isSaving"
          class="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          @click="saveBanner"
          :disabled="isSaving"
          class="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            v-if="isSaving"
            class="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
          ></span>
          {{ isSaving ? (isEdit ? 'Updating...' : 'Saving...') : 'Save' }}
        </button>
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

              <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Plan Type</p>
                  <p class="mt-1 font-semibold text-gray-900 dark:text-gray-100">{{ formatPlanType(detailBanner.selectedPlanId?.type) }}</p>
                </div>
                <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/50">
                  <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Price</p>
                  <p class="mt-1 font-semibold text-gray-900 dark:text-gray-100">{{ formatPrice(detailBanner.selectedPlanId?.price) }}</p>
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
                <span class="text-gray-500 dark:text-gray-400">Latitude</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ coordinateLabel(detailBanner.latitude) }}</span>
              </div>
              <div class="flex items-center justify-between gap-3 py-2">
                <span class="text-gray-500 dark:text-gray-400">Longitude</span>
                <span class="font-medium text-gray-900 dark:text-gray-100">{{ coordinateLabel(detailBanner.longitude) }}</span>
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
                  <span class="text-gray-500 dark:text-gray-400">Revenue</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatPrice(detailBanner.earningAmount) }}</span>
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
                  <span class="text-gray-500 dark:text-gray-400">Revenue Status</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatRevenueStatus(detailBanner.earningStatus) }}</span>
                </div>
                <div class="flex items-center justify-between gap-3 py-2">
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
import { useAppAlert } from "@/composables/useAppAlert";

const { setAlert } = useAppAlert();

const banners = ref([]);
const categories = ref([]);
const subCategories = ref([]);

const showModal = ref(false);
const showDetailsModal = ref(false);
const isEdit = ref(false);
const editId = ref("");
const detailBanner = ref(null);
const originalBanner = ref(null);

const isLoadingList = ref(false);
const isSaving = ref(false);
const statusUpdatingId = ref("");

const file = ref(null);
const preview = ref("");

const form = ref({
  title: "",
  status: true,
  mainCategory: "",
  subCategory: "",
  latitude: "",
  longitude: "",
  fromDate: "",
  toDate: "",
});

const IMAGE_URL = import.meta.env.VITE_IMAGEURL || "";
const REQUIRED_BANNER_WIDTH = 1280;
const REQUIRED_BANNER_HEIGHT = 540;

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || fallbackMessage;

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

const formatPlanType = (value) => {
  if (value === "home") return "Home";
  if (value === "subCategory") return "Sub Category";
  return "-";
};

const formatRevenueStatus = (value) => {
  if (!value) return "-";
  const normalized = String(value).replace(/[_-]+/g, " ").trim();
  if (!normalized) return "-";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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

const coordinateLabel = (value) => {
  if (value === undefined || value === null || value === "") return "-";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(parsed) : String(value);
};

const normalizeCoordinateInput = (value) => String(value ?? "").trim();

const revokePreviewUrl = () => {
  if (preview.value && preview.value.startsWith("blob:")) {
    URL.revokeObjectURL(preview.value);
  }
};

const getImageDimensions = (selectedFile) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(selectedFile);
    const image = new Image();

    image.onload = () => {
      const width = image.naturalWidth || image.width;
      const height = image.naturalHeight || image.height;
      URL.revokeObjectURL(objectUrl);
      resolve({ width, height });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image dimensions"));
    };

    image.src = objectUrl;
  });

const validateBannerImage = async (selectedFile) => {
  const { width, height } = await getImageDimensions(selectedFile);
  if (width !== REQUIRED_BANNER_WIDTH || height !== REQUIRED_BANNER_HEIGHT) {
    setAlert(
      "warning",
      `Banner image must be exactly ${REQUIRED_BANNER_WIDTH} x ${REQUIRED_BANNER_HEIGHT} pixels`,
    );
    return false;
  }

  return true;
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
  await Promise.all([fetchAll(), loadCategories()]);
});

const fetchAll = async ({ silent = false, showError = true } = {}) => {
  if (!silent) {
    isLoadingList.value = true;
  }

  try {
    const res = await get(ENDPOINTS.GET_BANNERS);
    banners.value = Array.isArray(res) ? res : res?.banners || [];
    return true;
  } catch (error) {
    console.error(error);
    banners.value = [];

    if (showError) {
      setAlert("error", getErrorMessage(error, "Failed to load banners"));
    }
    return false;
  } finally {
    if (!silent) {
      isLoadingList.value = false;
    }
  }
};

const loadCategories = async () => {
  try {
    const res = await get(ENDPOINTS.CATEGORY.GET_ALL);
    categories.value = Array.isArray(res?.categories) ? res.categories : [];
  } catch (error) {
    console.error(error);
    categories.value = [];
    setAlert("error", getErrorMessage(error, "Failed to load categories"));
  }
};

const loadSubCategories = () => {
  const selectedMainCategoryId = toIdString(form.value.mainCategory);
  const cat = categories.value.find(
    (category) => toIdString(category) === selectedMainCategoryId,
  );

  subCategories.value = cat ? cat.subcat || [] : [];

  if (
    form.value.subCategory &&
    !subCategories.value.some(
      (subCategory) => toIdString(subCategory) === toIdString(form.value.subCategory),
    )
  ) {
    form.value.subCategory = "";
  }
};

const resetForm = () => {
  revokePreviewUrl();
  file.value = null;
  preview.value = "";
  subCategories.value = [];
  originalBanner.value = null;
  form.value = {
    title: "",
    status: true,
    mainCategory: "",
    subCategory: "",
    latitude: "",
    longitude: "",
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
  revokePreviewUrl();
  originalBanner.value = {
    title: String(banner.title || ""),
    status: !!banner.status,
    mainCategory: String(banner.mainCategory?._id || ""),
    subCategory: String(banner.subCategory?._id || ""),
    latitude:
      coordinateLabel(banner.latitude) === "-" ? "" : coordinateLabel(banner.latitude),
    longitude:
      coordinateLabel(banner.longitude) === "-" ? "" : coordinateLabel(banner.longitude),
  };

  form.value.title = banner.title || "";
  form.value.status = !!banner.status;
  form.value.mainCategory = banner.mainCategory?._id || "";
  form.value.subCategory = banner.subCategory?._id || "";
  form.value.latitude = coordinateLabel(banner.latitude) === "-" ? "" : coordinateLabel(banner.latitude);
  form.value.longitude = coordinateLabel(banner.longitude) === "-" ? "" : coordinateLabel(banner.longitude);
  form.value.fromDate = formatDateTimeLocal(banner.fromDate);
  form.value.toDate = formatDateTimeLocal(banner.toDate);

  preview.value = imgUrl(banner.image);
  loadSubCategories();

  showModal.value = true;
};

const selectFile = async (event) => {
  const input = event.target;
  const selected = input.files?.[0];
  if (!selected) return;

  try {
    const isValid = await validateBannerImage(selected);
    if (!isValid) {
      input.value = "";
      return;
    }

    revokePreviewUrl();
    file.value = selected;
    preview.value = URL.createObjectURL(selected);
  } catch (error) {
    console.error(error);
    setAlert("error", "Unable to read the selected image. Please try another file.");
  } finally {
    if (!file.value || file.value !== selected) {
      input.value = "";
    }
  }
};

const saveBanner = async () => {
  if (!form.value.mainCategory) {
    setAlert("warning", "Main category is required");
    return;
  }

  let parsedFromDate = null;
  let parsedToDate = null;

  if (!isEdit.value) {
    if (!form.value.fromDate || !form.value.toDate) {
      setAlert("warning", "From Date and To Date are required");
      return;
    }

    parsedFromDate = new Date(form.value.fromDate);
    parsedToDate = new Date(form.value.toDate);

    if (Number.isNaN(parsedFromDate.getTime()) || Number.isNaN(parsedToDate.getTime())) {
      setAlert("warning", "Please provide valid From Date and To Date");
      return;
    }

    if (parsedToDate.getTime() <= parsedFromDate.getTime()) {
      setAlert("warning", "To Date must be after From Date");
      return;
    }
  }

  const normalizedLatitude = normalizeCoordinateInput(form.value.latitude);
  const normalizedLongitude = normalizeCoordinateInput(form.value.longitude);

  if (!normalizedLatitude || !normalizedLongitude) {
    setAlert("warning", "Latitude and Longitude are required");
    return;
  }

  const latitude = Number(normalizedLatitude);
  const longitude = Number(normalizedLongitude);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    setAlert("warning", "Latitude must be a valid number between -90 and 90");
    return;
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    setAlert("warning", "Longitude must be a valid number between -180 and 180");
    return;
  }

  if (file.value) {
    try {
      const isValidImage = await validateBannerImage(file.value);
      if (!isValidImage) {
        return;
      }
    } catch (error) {
      console.error(error);
      setAlert("error", "Unable to validate the banner image dimensions");
      return;
    }
  }

  isSaving.value = true;
  setAlert("loading", isEdit.value ? "Updating banner..." : "Saving banner...");

  try {
    const fd = new FormData();
    let response = null;

    if (isEdit.value) {
      const snapshot = originalBanner.value || {};
      const normalizedTitle = String(form.value.title || "");
      const normalizedMainCategory = String(form.value.mainCategory || "");
      const normalizedSubCategory = String(form.value.subCategory || "");
      const normalizedLatitudeValue = String(latitude);
      const normalizedLongitudeValue = String(longitude);

      if (file.value) {
        fd.append("image", file.value);
      }

      if (normalizedTitle !== String(snapshot.title || "")) {
        fd.append("title", normalizedTitle);
      }

      if (!!form.value.status !== !!snapshot.status) {
        fd.append("status", String(!!form.value.status));
      }

      if (normalizedMainCategory !== String(snapshot.mainCategory || "")) {
        if (!normalizedSubCategory) {
          setAlert("warning", "Sub category is required when main category changes");
          return;
        }
        fd.append("mainCategory", normalizedMainCategory);
        fd.append("subCategory", normalizedSubCategory);
      } else if (normalizedSubCategory !== String(snapshot.subCategory || "")) {
        if (!normalizedSubCategory) {
          setAlert("warning", "Sub category cannot be cleared from the edit API");
          return;
        }
        fd.append("subCategory", normalizedSubCategory);
      }

      if (normalizedLatitudeValue !== String(snapshot.latitude || "")) {
        fd.append("latitude", normalizedLatitudeValue);
      }

      if (normalizedLongitudeValue !== String(snapshot.longitude || "")) {
        fd.append("longitude", normalizedLongitudeValue);
      }

      if (![...fd.keys()].length) {
        setAlert("warning", "No banner changes detected");
        return;
      }

      response = await put(ENDPOINTS.UPDATE_BANNER(editId.value), fd);
    } else {
      if (file.value) fd.append("image", file.value);

      fd.append("title", form.value.title || "");
      fd.append("mainCategory", form.value.mainCategory);
      if (form.value.subCategory) fd.append("subCategory", form.value.subCategory);
      fd.append("latitude", String(latitude));
      fd.append("longitude", String(longitude));
      fd.append("fromDate", parsedFromDate.toISOString());
      fd.append("toDate", parsedToDate.toISOString());
      response = await post(ENDPOINTS.ADD_ADMIN_BANNER, fd);
    }

    showModal.value = false;
    const refreshed = await fetchAll({ silent: true, showError: false });

    if (refreshed) {
      setAlert(
        "success",
        response?.message ||
          (isEdit.value ? "Banner updated successfully" : "Banner added successfully"),
      );
    } else {
      setAlert(
        "warning",
        response?.message ||
          "Banner saved, but list refresh failed. Please refresh and verify once.",
      );
    }
  } catch (error) {
    console.error(error);
    setAlert("error", getErrorMessage(error, "Failed to save banner"));
  } finally {
    isSaving.value = false;
  }
};

const toggleStatus = async (banner) => {
  if (!banner?._id || statusUpdatingId.value) return;

  const nextStatus = !banner.status;
  statusUpdatingId.value = banner._id;
  setAlert("loading", nextStatus ? "Activating banner..." : "Deactivating banner...");

  try {
    const response = await put(ENDPOINTS.UPDATE_BANNER(banner._id), { status: nextStatus });
    const refreshed = await fetchAll({ silent: true, showError: false });

    if (refreshed) {
      setAlert(
        "success",
        response?.message ||
          `Banner ${nextStatus ? "activated" : "deactivated"} successfully`,
      );
    } else {
      setAlert(
        "warning",
        response?.message ||
          `Banner ${nextStatus ? "activated" : "deactivated"}, but refresh failed`,
      );
    }
  } catch (error) {
    console.error(error);
    setAlert("error", getErrorMessage(error, "Failed to update banner status"));
  } finally {
    statusUpdatingId.value = "";
  }
};
</script>
