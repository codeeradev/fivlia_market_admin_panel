<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Banner Plans" />

    <div class="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Banner Plans
        </h2>

        <button
          @click="openModal"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + Add Plan
        </button>
      </div>

      <div
        v-if="alert.show"
        :class="[
          'mb-4 px-4 py-3 rounded text-sm',
          alert.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800',
        ]"
      >
        {{ alert.message }}
      </div>

      <div v-if="loading" class="py-10 flex justify-center">
        <div
          class="h-8 w-8 rounded-full animate-spin border-4 border-gray-200 border-t-blue-600"
        ></div>
      </div>

      <div v-else class="overflow-x-auto">
        <BaseTable>
          <template #head>
            <th class="px-4 py-2">#</th>
            <th class="px-4 py-2">Duration</th>
            <th class="px-4 py-2">Price</th>
            <th class="px-4 py-2">Status</th>
            <th class="px-4 py-2">Created</th>
            <th class="px-4 py-2 text-center">Actions</th>
          </template>

          <template #body>
            <tr
              v-for="(plan, index) in plans"
              :key="plan._id || index"
              class="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-4 py-2">{{ index + 1 }}</td>
              <td class="px-4 py-2 font-medium">{{ plan.duration || '-' }}</td>
              <td class="px-4 py-2">{{ formatPrice(plan.price) }}</td>
              <td class="px-4 py-2">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    plan.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                  ]"
                >
                  {{ plan.status ? "Active" : "Inactive" }}
                </span>
              </td>
              <td class="px-4 py-2">{{ formatDate(plan.createdAt) }}</td>
              <td class="px-4 py-2 text-center">
                <button
                  @click="openEditModal(plan)"
                  class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs"
                >
                  Edit
                </button>
              </td>
            </tr>
          </template>
        </BaseTable>

        <div v-if="plans.length === 0" class="text-center py-10 text-gray-500">
          No banner plans found
        </div>
      </div>
    </div>

    <BaseModal v-if="showModal" @close="closeModal">
      <template #title>{{ isEdit ? "Edit Banner Plan" : "Add Banner Plan" }}</template>

      <div class="grid grid-cols-1 gap-4">
        <div
          v-if="modalError"
          class="px-3 py-2 rounded text-sm bg-red-100 text-red-800"
        >
          {{ modalError }}
        </div>

        <div>
          <label class="font-medium text-sm mb-1 block">Duration</label>
          <input
            v-model="form.duration"
            type="text"
            class="border rounded p-2 h-10 w-full"
            placeholder="e.g. 7 days"
          />
        </div>

        <div>
          <label class="font-medium text-sm mb-1 block">Price</label>
          <input
            v-model="form.price"
            type="number"
            min="0"
            step="0.01"
            class="border rounded p-2 h-10 w-full"
            placeholder="0"
          />
        </div>

        <div class="flex items-center gap-2">
          <input v-model="form.status" type="checkbox" />
          <label class="font-medium text-sm">Active</label>
        </div>
      </div>

      <template #footer>
        <button @click="closeModal" class="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          @click="savePlan"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {{ saving ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update" : "Save") }}
        </button>
      </template>
    </BaseModal>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import BaseTable from "@/components/common/BaseTable.vue";
import BaseModal from "@/components/common/BaseModal.vue";
import { get, post, put } from "@/apis/apiClient";
import { ENDPOINTS } from "@/apis/endpoint";

const plans = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const isEdit = ref(false);
const editPlanId = ref("");
const modalError = ref("");
const alert = ref({
  show: false,
  type: "success",
  message: "",
});

const form = ref({
  duration: "",
  price: "",
  status: true,
});

const showSuccess = (message) => {
  alert.value = { show: true, type: "success", message };
};

const showError = (message) => {
  alert.value = { show: true, type: "error", message };
};

const resetForm = () => {
  form.value = {
    duration: "",
    price: "",
    status: true,
  };
};

const openModal = () => {
  isEdit.value = false;
  editPlanId.value = "";
  modalError.value = "";
  resetForm();
  showModal.value = true;
};

const openEditModal = (plan) => {
  isEdit.value = true;
  editPlanId.value = plan?._id || "";
  modalError.value = "";
  form.value = {
    duration: String(plan?.duration || ""),
    price: Number.isFinite(Number(plan?.price)) ? Number(plan.price) : "",
    status: !!plan?.status,
  };
  showModal.value = true;
};

const closeModal = () => {
  isEdit.value = false;
  editPlanId.value = "";
  showModal.value = false;
  modalError.value = "";
  resetForm();
};

const formatPrice = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "-";
  return `Rs. ${num.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

const fetchPlans = async () => {
  loading.value = true;

  try {
    const res = await get(ENDPOINTS.GET_PLANS, { includeInactive: true });
    plans.value = Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.error(error);
    plans.value = [];
    showError(error?.response?.data?.message || "Error fetching banner plans.");
  } finally {
    loading.value = false;
  }
};

const savePlan = async () => {
  modalError.value = "";

  const duration = String(form.value.duration || "").trim();
  if (!duration) {
    modalError.value = "Duration is required";
    return;
  }

  const parsedPrice = Number(form.value.price);
  if (!Number.isFinite(parsedPrice)) {
    modalError.value = "Valid price is required";
    return;
  }

  saving.value = true;
  const wasEdit = isEdit.value;

  try {
    if (wasEdit && !editPlanId.value) {
      modalError.value = "Invalid plan selected for editing";
      return;
    }

    const payload = {
      duration,
      price: parsedPrice,
      status: !!form.value.status,
    };

    const res = wasEdit
      ? await post(ENDPOINTS.EDIT_PLANS(editPlanId.value), payload)
      : await post(ENDPOINTS.ADD_PLANS, payload);
    closeModal();
    showSuccess(
      res?.message ||
        (wasEdit
          ? "Banner plan updated successfully."
          : "Banner plan added successfully.")
    );
    await fetchPlans();
  } catch (error) {
    console.error(error);
    modalError.value =
      error?.response?.data?.message ||
      (wasEdit
        ? "Error updating banner plan."
        : "Error adding banner plan.");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  fetchPlans();
});
</script>
