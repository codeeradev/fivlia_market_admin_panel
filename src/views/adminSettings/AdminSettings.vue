<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Account Settings" />

    <div class="rounded-xl border bg-white dark:bg-white/5 p-6 md:p-10 space-y-8">

      <!-- ================= PROFILE ================= -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Profile Information</h2>

        <div class="flex flex-col md:flex-row gap-10">
          <div class="flex flex-col items-center">
            <img
              :src="previewImage || imageUrl(profile.image)"
              class="w-32 h-32 rounded-full object-cover border"
            />

            <input type="file" accept="image/*" @change="handleImageUpload" class="mt-3" />

            <button
              v-if="selectedImage"
              @click="uploadPhoto"
              class="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Upload Photo
            </button>
          </div>

          <div class="flex-1 grid md:grid-cols-2 gap-5">
            <input v-model="profile.name" placeholder="Full name" class="border p-2 rounded" />
            <input disabled v-model="profile.email" class="border p-2 rounded bg-gray-100" />
            <input v-model="profile.phone" placeholder="Phone" class="border p-2 rounded" />
          </div>
        </div>
      </section>

      <hr />

      <!-- ================= PASSWORD ================= -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Change Password</h2>

        <div class="grid md:grid-cols-3 gap-4">
          <input type="password" placeholder="Current password" v-model="passwordForm.current" class="border p-2 rounded" />
          <input type="password" placeholder="New password" v-model="passwordForm.new" class="border p-2 rounded" />
          <input type="password" placeholder="Confirm password" v-model="passwordForm.confirm" class="border p-2 rounded" />
        </div>

        <div class="text-right mt-4">
          <button @click="updatePassword" class="px-6 py-2 bg-blue-600 text-white rounded">
            Update Password
          </button>
        </div>
      </section>

      <hr />

      <!-- ================= ADMIN SETTINGS ================= -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Admin Settings</h2>

        <div class="grid md:grid-cols-3 gap-6">
          <input
            v-model="adminSetting.name"
            placeholder="Admin Name"
            class="border p-2 rounded"
          />
          <input
            v-model="adminSetting.email"
            type="email"
            placeholder="Admin Email"
            class="border p-2 rounded"
          />
          <input
            v-model="adminSetting.password"
            type="password"
            placeholder="Admin Password"
            class="border p-2 rounded"
          />
        </div>

        <!--
        <div class="grid md:grid-cols-2 gap-6">
          <textarea
            v-model="adminSetting.term_and_conditons"
            rows="5"
            placeholder="Terms & Conditions"
            class="border p-2 rounded"
          ></textarea>

          <input
            type="number"
            v-model="adminSetting.radius"
            placeholder="Radius (KM)"
            class="border p-2 rounded"
          />
        </div>
        -->

        <div class="flex justify-end mt-5">
          <button
            @click="saveAdminSetting"
            :disabled="isSavingSetting"
            class="px-6 py-3 bg-indigo-600 text-white rounded flex items-center gap-2 disabled:opacity-50"
          >
            <span v-if="!isSavingSetting">Save Settings</span>
            <span v-else>Saving...</span>

            <span
              v-if="isSavingSetting"
              class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"
            ></span>
          </button>
        </div>
      </section>
    </div>

    <!-- 🔔 POPUP ALERT -->
    <div
      v-if="toast.show"
      class="fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white transition-all duration-300"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
      style="z-index: 99999"
    >
      {{ toast.message }}
    </div>

  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import { get, post } from "@/apis/apiClient";
import { ENDPOINTS } from "@/apis/endpoint";

const IMAGEURL = import.meta.env.VITE_IMAGEURL;

/* ================= TOAST ================= */

const toast = reactive({
  show: false,
  message: "",
  type: "success"
});

const showToast = (message: string, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;

  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

/* ================= STATE ================= */

const isSavingSetting = ref(false);

const profile = reactive({
  name: "",
  email: "",
  phone: "",
  image: ""
});

const selectedImage = ref<File | null>(null);
const previewImage = ref("");

const adminSetting = reactive({
  name: "",
  email: "",
  password: "",
  term_and_conditons: "",
  radius: ""
});

const passwordForm = ref({
  current: "",
  new: "",
  confirm: ""
});

/* ================= HELPERS ================= */

const imageUrl = (path: string) =>
  path ? `${IMAGEURL}${path.replace(/^\//, "")}` : "/no-image.png";

/* ================= API ================= */

const loadAdminSetting = async () => {
  try {
    const res: any = await get(ENDPOINTS.GET_SETTING);

    if (res.data) {
      adminSetting.name = res.data.name || "";
      adminSetting.email = res.data.email || "";
      adminSetting.password = "";
      adminSetting.term_and_conditons = res.data.term_and_conditons || "";
      adminSetting.radius = res.data.radius || "";
    }
  } catch {
    showToast("Failed to load admin settings", "error");
  }
};

const saveAdminSetting = async () => {
  isSavingSetting.value = true;

  try {
    const payload: any = {
      name: adminSetting.name,
      email: adminSetting.email,
      term_and_conditons: adminSetting.term_and_conditons,
      radius: adminSetting.radius,
    };

    if (adminSetting.password.trim()) {
      payload.password = adminSetting.password.trim();
    }

    await post(ENDPOINTS.UPDATE_SETTING, payload);
    adminSetting.password = "";
    showToast("Settings updated successfully");
  } catch {
    showToast("Failed to update settings", "error");
  } finally {
    isSavingSetting.value = false;
  }
};

const updatePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    showToast("Passwords do not match", "error");
    return;
  }

  await post("/change-password", passwordForm.value);
  showToast("Password updated successfully");
};

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  selectedImage.value = file;
  previewImage.value = URL.createObjectURL(file);
};

const uploadPhoto = async () => {
  if (!selectedImage.value) return;

  const fd = new FormData();
  fd.append("image", selectedImage.value);

  await post("/upload-profile-image", fd);
  showToast("Profile photo updated");
};

onMounted(loadAdminSetting);
</script>

<style scoped></style>
