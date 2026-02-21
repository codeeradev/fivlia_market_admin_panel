<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Admin Settings" />

    <div class="rounded-xl border bg-white dark:bg-white/5 p-6 md:p-10 space-y-6">
      <section>
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-xl font-semibold">Admin Settings</h2>
          <button
            @click="signOut"
            class="inline-flex items-center rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700/60 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Logout
          </button>
        </div>

        <div class="grid gap-8 md:grid-cols-[220px_1fr]">
          <div class="flex flex-col items-center">
            <img
              :src="previewImage || imageUrl(adminSetting.image)"
              class="w-36 h-36 rounded-full object-cover border"
            />
            <label
              for="adminProfileImage"
              class="mt-3 inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Choose Profile Photo
            </label>
            <input
              id="adminProfileImage"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="hidden"
            />
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ selectedFileName }}
            </p>
          </div>

          <div class="grid md:grid-cols-2 gap-5">
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
              placeholder="Admin Password (optional)"
              class="border p-2 rounded md:col-span-2"
            />
          </div>
        </div>

        <!--
        <div class="grid md:grid-cols-2 gap-6 mt-6">
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

        <div class="flex justify-end mt-6">
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

    <!-- POPUP ALERT -->
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
import { clearAdminSession } from "@/utils/adminAuth";
import { useRouter } from "vue-router";

const IMAGEURL = import.meta.env.VITE_IMAGEURL;
const router = useRouter();

const toast = reactive({
  show: false,
  message: "",
  type: "success",
});

const showToast = (message: string, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;

  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

const isSavingSetting = ref(false);
const selectedImage = ref<File | null>(null);
const previewImage = ref("");
const selectedFileName = ref("No profile photo selected");

const adminSetting = reactive({
  name: "",
  email: "",
  password: "",
  image: "",
  term_and_conditons: "",
  radius: "",
});

const imageUrl = (path: string) => {
  if (!path) return "/no-image.png";

  if (/^https?:\/\//i.test(path)) return path;

  const base = (IMAGEURL || "").replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const signOut = async () => {
  clearAdminSession();
  await router.replace("/signin");
};

const loadAdminSetting = async () => {
  try {
    const res: any = await get(ENDPOINTS.GET_SETTING);

    if (res.data) {
      previewImage.value = "";
      adminSetting.name = res.data.name || "";
      adminSetting.email = res.data.email || "";
      adminSetting.password = "";
      adminSetting.image = res.data.image || "";
      adminSetting.term_and_conditons = res.data.term_and_conditons || "";
      adminSetting.radius = res.data.radius || "";
      selectedFileName.value = adminSetting.image
        ? "Current photo loaded"
        : "No profile photo selected";
    }
  } catch {
    showToast("Failed to load admin settings", "error");
  }
};

const saveAdminSetting = async () => {
  isSavingSetting.value = true;

  try {
    const payload = new FormData();
    payload.append("name", adminSetting.name || "");
    payload.append("email", adminSetting.email || "");

    if (adminSetting.password.trim()) {
      payload.append("password", adminSetting.password.trim());
    }

    if (selectedImage.value) {
      payload.append("image", selectedImage.value);
    }

    await post(ENDPOINTS.UPDATE_SETTING, payload);
    adminSetting.password = "";
    selectedImage.value = null;
    selectedFileName.value = "No profile photo selected";
    await loadAdminSetting();
    showToast("Settings updated successfully");
  } catch {
    showToast("Failed to update settings", "error");
  } finally {
    isSavingSetting.value = false;
  }
};

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  selectedImage.value = file;
  previewImage.value = URL.createObjectURL(file);
  selectedFileName.value = file.name;
};

onMounted(loadAdminSetting);
</script>

<style scoped></style>
