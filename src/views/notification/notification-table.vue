<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Notifications" />

    <div class="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Notifications
        </h2>

        <button @click="openModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          + Add Notification
        </button>
      </div>

      <!-- ALERT -->
      <div v-if="alert.message" :class="[
        'mb-4 px-4 py-3 rounded text-sm',
        alert.type === 'success'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800',
      ]">
        {{ alert.message }}
      </div>

      <!-- LOADER -->
      <div v-if="loading" class="py-10 flex justify-center">
        <div class="h-8 w-8 rounded-full animate-spin border-4 border-gray-200 border-t-blue-600"></div>
      </div>

      <!-- TABLE -->
      <div v-else class="overflow-x-auto">
        <BaseTable>
          <template #head>
            <th class="px-4 py-2">Image</th>
            <th class="px-4 py-2">Title</th>
            <th class="px-4 py-2">Description</th>
            <th class="px-4 py-2">Cities</th>
            <th class="px-4 py-2 text-center">Actions</th>
          </template>

          <template #body>
            <tr v-for="n in notifications" :key="n._id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <!-- IMAGE -->
              <td class="px-4 py-2">
                <img v-if="n.image" :src="imageUrl(n.image)" class="h-12 w-20 rounded object-cover border" />
                <span v-else class="text-xs text-gray-400">No image</span>
              </td>

              <td class="px-4 py-2 font-medium">{{ n.title }}</td>

              <td class="px-4 py-2 text-sm text-gray-600">
                {{ n.description }}
              </td>

              <td class="px-4 py-2 text-sm">
                <span v-if="!n.city?.length">All</span>
                <span v-else>{{ n.city.length }} selected</span>
              </td>

              <td class="px-4 py-2 text-center space-x-2">
                <button @click="editNotification(n)" class="px-2 py-1 bg-yellow-500 text-white rounded text-xs">
                  Edit
                </button>

                <button @click="sendNow(n._id)" class="px-2 py-1 bg-green-600 text-white rounded text-xs">
                  Send
                </button>

                <!-- DELETE BUTTON -->
                <button @click="deleteNotification(n._id)" class="px-2 py-1 bg-red-600 text-white rounded text-xs">
                  Delete
                </button>
              </td>
            </tr>
          </template>
        </BaseTable>

        <div v-if="notifications.length === 0" class="text-center py-10 text-gray-500">
          No notifications found
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <BaseModal v-if="showModal">
      <template #title>
        {{ isEdit ? "Edit Notification" : "Add Notification" }}
      </template>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="font-medium text-sm">Title</label>
          <input v-model="form.title" class="border rounded p-2 h-10 w-full" />
        </div>

        <div>
          <label class="font-medium text-sm">Description</label>
          <textarea v-model="form.description" rows="3" class="border rounded p-2 w-full"></textarea>
        </div>

        <div>
          <label class="font-medium text-sm">Cities</label>
          <select v-model="form.city" class="border rounded p-2 h-10 w-full">
            <option value="everyone">Send to Everyone</option>
            <option v-for="c in cities" :key="c._id" :value="c._id">
              {{ c.city }}
            </option>
          </select>
        </div>

        <div>
          <label class="font-medium text-sm">Screen</label>
          <select v-model="form.screen" @change="onScreenChange" class="border rounded p-2 h-10 w-full">
            <option value="">No screen redirect</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div v-if="form.screen">
          <label class="font-medium text-sm">
            {{ form.screen === "product" ? "Select Product" : "Select Category" }}
          </label>
          <select v-model="form.refId" class="border rounded p-2 h-10 w-full">
            <option value="">
              {{
                form.screen === "product"
                  ? "Choose a product"
                  : "Choose a category"
              }}
            </option>
            <option v-for="option in selectedScreenOptions" :key="option._id" :value="option._id">
              {{ option.name || option.title || "Untitled" }}
            </option>
          </select>
        </div>

        <!-- IMAGE -->
        <div>
          <label class="font-medium text-sm">Image</label>
          <input type="file" accept="image/*" @change="onImageChange" class="border rounded p-2 w-full" />

          <!-- OLD IMAGE (EDIT MODE) -->
          <div v-if="imagePreview" class="mt-3">
            <img :src="imagePreview" class="h-32 rounded border object-cover" />
          </div>
        </div>
      </div>

      <template #footer>
        <button @click="showModal = false" class="px-4 py-2 border rounded">
          Cancel
        </button>

        <button @click="saveNotification" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded">
          {{ saving ? "Saving..." : "Save" }}
        </button>
      </template>
    </BaseModal>
  </AdminLayout>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import { get, post, del } from "@/apis/apiClient";
import { ENDPOINTS } from "@/apis/endpoint";

/* ENV IMAGE URL */
const IMAGE_BASE = import.meta.env.VITE_IMAGEURL || "";

/* STATE */
const notifications = ref([]);
const cities = ref([]);
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const saving = ref(false);
const alert = ref({ message: "", type: "success" });

const showModal = ref(false);
const isEdit = ref(false);
const editId = ref("");

const imagePreview = ref(null);

const form = ref({
  title: "",
  description: "",
  city: "everyone",
  screen: "",
  refId: "",
  image: null,
});

const selectedScreenOptions = computed(() => {
  if (form.value.screen === "product") return products.value;
  if (form.value.screen === "category") return categories.value;
  return [];
});

const normalizeSingleValue = (value, fallback = "") => {
  if (Array.isArray(value)) return normalizeSingleValue(value[0], fallback);
  if (value && typeof value === "object") return value._id || value.id || fallback;
  return value || fallback;
};

/* IMAGE URL FIX */
const imageUrl = (path) => {
  if (!path) return "";
  return IMAGE_BASE + path;
};

const deleteNotification = async (id) => {
  if (!confirm("Are you sure you want to delete this notification?")) return;

  try {
    await del(ENDPOINTS.DELETE_NOTIFICATION(id));

    alert.value = {
      message: "Notification deleted successfully",
      type: "success",
    };

    await loadNotifications(); // refresh list
  } catch (error) {
    console.error("Delete failed", error);
    alert.value = {
      message:
        error?.response?.data?.message || "Failed to delete notification",
      type: "error",
    };
  }
};

/* FETCH */
const loadNotifications = async () => {
  loading.value = true;
  const res = await get(ENDPOINTS.GET_NOTIFICATION);
  notifications.value = res.data || [];
  loading.value = false;
};

const loadCities = async () => {
  cities.value = await get(ENDPOINTS.GET_CITY);
};

const loadProducts = async () => {
  try {
    const res = await get(`${ENDPOINTS.PRODUCTS}?page=1&limit=1000`);
    products.value = res?.product || [];
  } catch (error) {
    console.error("Failed to load products", error);
    products.value = [];
  }
};

const loadCategories = async () => {
  try {
    const res = await get(ENDPOINTS.CATEGORY.GET_ALL);
    categories.value = res?.categories || [];
  } catch (error) {
    console.error("Failed to load categories", error);
    categories.value = [];
  }
};

onMounted(() => {
  loadNotifications();
  loadCities();
  loadProducts();
  loadCategories();
});

/* IMAGE */
const onImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  form.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
};

/* MODAL */
const openModal = () => {
  isEdit.value = false;
  editId.value = "";
  alert.value = { message: "", type: "success" };
  form.value = {
    title: "",
    description: "",
    city: "everyone",
    screen: "",
    refId: "",
    image: null,
  };
  imagePreview.value = null;
  showModal.value = true;
};

const editNotification = (n) => {
  isEdit.value = true;
  editId.value = n._id;
  alert.value = { message: "", type: "success" };

  form.value.title = n.title;
  form.value.description = n.description;
  form.value.city = normalizeSingleValue(n.city, "everyone");
  form.value.screen = n.screen || "";
  form.value.refId = normalizeSingleValue(n.refId);
  form.value.image = null;

  imagePreview.value = n.image ? imageUrl(n.image) : null;

  showModal.value = true;
};

const onScreenChange = () => {
  form.value.refId = "";
};

/* SAVE */
const saveNotification = async () => {
  saving.value = true;

  if (form.value.screen && !form.value.refId) {
    alert.value = {
      message: `Please select a ${form.value.screen} before saving.`,
      type: "error",
    };
    saving.value = false;
    return;
  }

  try {
    const fd = new FormData();
    fd.append("title", form.value.title);
    fd.append("description", form.value.description);
    fd.append("screen", form.value.screen || "");
    fd.append("refId", form.value.refId || "");

    if (form.value.city !== "everyone") {
      fd.append("city", form.value.city);
    }

    if (form.value.image) {
      fd.append("image", form.value.image);
    }

    if (isEdit.value) {
      await post(ENDPOINTS.EDIT_NOTIFICATION(editId.value), fd);
    } else {
      await post(ENDPOINTS.CREATE_NOTIFICATION, fd);
    }

    alert.value = {
      message: isEdit.value
        ? "Notification updated successfully"
        : "Notification created successfully",
      type: "success",
    };
    showModal.value = false;
    await loadNotifications();
  } catch (error) {
    console.error("Failed to save notification", error);
    alert.value = {
      message: error?.response?.data?.message || "Failed to save notification",
      type: "error",
    };
  } finally {
    saving.value = false;
  }
};

/* SEND */
const sendNow = async (id) => {
  if (!confirm("Send notification now?")) return;
  await post(ENDPOINTS.SEND_NOTIFICATION, { notificationId: id, radius: 5 });
};
</script>
