<template>
  <AdminLayout>
    <PageBreadcrumb pageTitle="Help Requests" />

    <div class="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/5 xl:px-10 xl:py-12">
      <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white/90">Help Requests</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            View and manage user enquiries submitted through the contact support flow.
          </p>
        </div>

        <button @click="loadHelpRequests" class="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          Refresh
        </button>
      </div>

      <div v-if="alert.message" :class="[
        'mb-4 rounded px-4 py-3 text-sm',
        alert.type === 'success'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800',
      ]">
        {{ alert.message }}
      </div>

      <div v-if="loading" class="py-10 text-center">
        <div class="inline-flex items-center gap-3">
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <span class="text-sm text-gray-600 dark:text-gray-300">Loading help requests...</span>
        </div>
      </div>

      <div v-else>
        <BaseTable>
          <template #head>
            <th class="px-4 py-3 text-left">Title</th>
            <th class="px-4 py-3 text-left">User</th>
            <th class="px-4 py-3 text-left">Message</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Created</th>
            <th class="px-4 py-3 text-center">Actions</th>
          </template>

          <template #body>
            <tr v-for="request in helpRequests" :key="request._id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ request.title || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                <div>{{ request.userId?.name || 'Guest' }}</div>
                <div class="text-xs text-gray-400">{{ request.userId?.email || 'No email' }}</div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                <div class="max-w-xl break-words whitespace-pre-wrap">{{ request.message || '-' }}</div>
              </td>
              <td class="px-4 py-3">
                <span :class="statusClass(request.status)" class="inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                  {{ request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending' }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{{ formatDate(request.createdAt) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex flex-wrap justify-center gap-2">
                  <button
                    v-if="request.status !== 'completed'"
                    @click="markCompleted(request._id)"
                    :disabled="updating"
                    class="rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mark Completed
                  </button>

                  <button
                    v-if="request.status === 'completed'"
                    @click="markPending(request._id)"
                    :disabled="updating"
                    class="rounded bg-gray-600 px-3 py-2 text-xs text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reopen
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </BaseTable>

        <div v-if="helpRequests.length === 0" class="py-10 text-center text-gray-500">
          No help requests found.
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import { get, patch } from '@/apis/apiClient';
import { ENDPOINTS } from '@/apis/endpoint';

const helpRequests = ref<any[]>([]);
const loading = ref(false);
const updating = ref(false);
const alert = ref({ message: '', type: 'success' });

const formatDate = (value: string | number | Date) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusClass = (status: string | undefined) => {
  if (status === 'completed') {
    return 'bg-emerald-100 text-emerald-800';
  }
  return 'bg-yellow-100 text-yellow-800';
};

const loadHelpRequests = async () => {
  loading.value = true;
  alert.value = { message: '', type: 'success' };

  try {
    const response = await get<{ data: any[] }>(ENDPOINTS.GET_HELP_ENQUIRIES);
    helpRequests.value = response.data || [];
  } catch (error: any) {
    console.error('Failed to load help requests:', error);
    alert.value = {
      message: error?.response?.data?.message || 'Unable to fetch help requests.',
      type: 'error',
    };
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (id: string, status: 'pending' | 'completed') => {
  if (!id) return;
  updating.value = true;
  alert.value = { message: '', type: 'success' };

  try {
    await patch(ENDPOINTS.UPDATE_HELP_FORM_STATUS(id), { status });
    alert.value = {
      message: status === 'completed' ? 'Request marked completed.' : 'Request reopened.',
      type: 'success',
    };
    await loadHelpRequests();
  } catch (error: any) {
    console.error('Failed to update help request status:', error);
    alert.value = {
      message: error?.response?.data?.message || 'Unable to update request status.',
      type: 'error',
    };
  } finally {
    updating.value = false;
  }
};

const markCompleted = (id: string) => updateStatus(id, 'completed');
const markPending = (id: string) => updateStatus(id, 'pending');

onMounted(loadHelpRequests);
</script>
