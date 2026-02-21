<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Notifications" />

    <div
      class="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Notifications
        </h2>

        <button
          @click="openModal"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + Add Notification
        </button>
      </div>

      <!-- ALERT -->
      <div
        v-if="alert.message"
        :class="[
          'mb-4 px-4 py-3 rounded text-sm',
          alert.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800',
        ]"
      >
        {{ alert.message }}
      </div>

      <!-- LOADER -->
      <div v-if="loading" class="py-10 flex justify-center">
        <div
          class="h-8 w-8 rounded-full animate-spin border-4 border-gray-200 border-t-blue-600"
        ></div>
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
            <tr
              v-for="n in notifications"
              :key="n._id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <!-- IMAGE -->
              <td class="px-4 py-2">
                <img
                  v-if="n.image"
                  :src="imageUrl(n.image)"
                  class="h-12 w-20 rounded object-cover border"
                />
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
                <button
                  @click="editNotification(n)"
                  class="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                >
                  Edit
                </button>

                <button
                  @click="sendNow(n._id)"
                  class="px-2 py-1 bg-green-600 text-white rounded text-xs"
                >
                  Send
                </button>
              </td>
            </tr>
          </template>
        </BaseTable>

        <div
          v-if="notifications.length === 0"
          class="text-center py-10 text-gray-500"
        >
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
          <textarea
            v-model="form.description"
            rows="3"
            class="border rounded p-2 w-full"
          ></textarea>
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

        <!-- IMAGE -->
        <div>
          <label class="font-medium text-sm">Image</label>
          <input
            type="file"
            accept="image/*"
            @change="onImageChange"
            class="border rounded p-2 w-full"
          />

          <!-- OLD IMAGE (EDIT MODE) -->
          <div v-if="imagePreview" class="mt-3">
            <img
              :src="imagePreview"
              class="h-32 rounded border object-cover"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <button @click="showModal = false" class="px-4 py-2 border rounded">
          Cancel
        </button>

        <button
          @click="saveNotification"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {{ saving ? "Saving..." : "Save" }}
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
import { get, post } from "@/apis/apiClient";
import { ENDPOINTS } from "@/apis/endpoint";

/* ENV IMAGE URL */
const IMAGE_BASE = import.meta.env.VITE_IMAGEURL || "";

/* STATE */
const notifications = ref([]);
const cities = ref([]);
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
  image: null,
});

/* IMAGE URL FIX */
const imageUrl = (path) => {
  if (!path) return "";
  return IMAGE_BASE + path;
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

onMounted(() => {
  loadNotifications();
  loadCities();
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
  form.value = {
    title: "",
    description: "",
    city: "everyone",
    image: null,
  };
  imagePreview.value = null;
  showModal.value = true;
};

const editNotification = (n) => {
  isEdit.value = true;
  editId.value = n._id;

  form.value.title = n.title;
  form.value.description = n.description;
  form.value.city = n.city?.length ? n.city : "everyone";
  form.value.image = null;

  imagePreview.value = n.image ? imageUrl(n.image) : null;

  showModal.value = true;
};

/* SAVE */
const saveNotification = async () => {
  saving.value = true;

  const fd = new FormData();
  fd.append("title", form.value.title);
  fd.append("description", form.value.description);

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

  showModal.value = false;
  saving.value = false;
  loadNotifications();
};

/* SEND */
const sendNow = async (id) => {
  if (!confirm("Send notification now?")) return;
  await post(ENDPOINTS.SEND_NOTIFICATION, { notificationId: id, radius: 5 });
};
</script>
