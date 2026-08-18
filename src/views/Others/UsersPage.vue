<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"
    >
      <div class="mb-5 flex items-center justify-between lg:mb-7">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">Users</h3>
        <button @click="openCreateModal" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          + Add User
        </button>
      </div>

      <!-- ALERT -->
      <div v-if="alert.show"
        :class="[
          'rounded-lg p-4 mb-4',
          alert.type === 'success'
            ? 'border border-green-300 bg-green-50 text-green-700'
            : 'border border-red-300 bg-red-50 text-red-700'
        ]"
      >
        {{ alert.message }}
      </div>

      <!-- LOADER -->
      <div v-if="loading" class="flex justify-center py-6">
        <span
          class="animate-spin inline-block h-10 w-10 rounded-full border-4 border-slate-300 border-t-primary"
        ></span>
      </div>

      <!-- USERS TABLE -->
      <UserInfoCard v-if="!loading" :users="users" @view="openViewModal" @edit="openEditModal" />
    </div>

    <BaseModal v-if="showUserModal" @close="closeUserModal">
      <template #title>{{ isEditing() ? "Edit User" : "Add User" }}</template>

      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium">Name</label>
          <input v-model="userForm.name" type="text" class="h-10 w-full rounded border p-2" placeholder="User name" />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium">Mobile Number</label>
            <input v-model="userForm.mobileNumber" type="tel" class="h-10 w-full rounded border p-2" placeholder="+919999999999" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Email <span class="text-gray-500">(optional)</span></label>
            <input v-model="userForm.email" type="email" class="h-10 w-full rounded border p-2" placeholder="user@example.com" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium">Latitude</label>
            <input v-model="userForm.latitude" type="number" step="any" @change="syncMapFromFields" class="h-10 w-full rounded border p-2" placeholder="28.6139" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">Longitude</label>
            <input v-model="userForm.longitude" type="number" step="any" @change="syncMapFromFields" class="h-10 w-full rounded border p-2" placeholder="77.2090" />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Select location on map</label>
          <p class="mb-2 text-xs text-gray-500">Click the map or drag the marker to set latitude and longitude.</p>
          <div ref="mapContainer" class="h-64 w-full rounded border"></div>
        </div>
      </div>

      <template #footer>
        <button @click="closeUserModal" class="rounded border px-4 py-2">Cancel</button>
        <button @click="saveUser" :disabled="saving" class="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
          {{ saving ? "Saving..." : isEditing() ? "Save Changes" : "Add User" }}
        </button>
      </template>
    </BaseModal>

    <BaseModal v-if="viewedUser" @close="viewedUser = null">
      <template #title>User Details</template>
      <dl class="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 text-sm">
        <dt class="font-medium text-gray-500">Name</dt><dd>{{ viewedUser.name || '—' }}</dd>
        <dt class="font-medium text-gray-500">Email</dt><dd>{{ viewedUser.email || '—' }}</dd>
        <dt class="font-medium text-gray-500">Mobile</dt><dd>{{ viewedUser.mobileNumber || '—' }}</dd>
        <dt class="font-medium text-gray-500">Latitude</dt><dd>{{ viewedUser.latitude ?? '—' }}</dd>
        <dt class="font-medium text-gray-500">Longitude</dt><dd>{{ viewedUser.longitude ?? '—' }}</dd>
      </dl>
      <a v-if="hasCoordinates(viewedUser)" :href="openStreetMapUrl(viewedUser)" target="_blank" rel="noopener" class="mt-5 inline-block text-blue-600 hover:underline">Open location in OpenStreetMap</a>
      <template #footer><button @click="viewedUser = null" class="rounded border px-4 py-2">Close</button></template>
    </BaseModal>
  </admin-layout>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue"
import AdminLayout from "@/components/layout/AdminLayout.vue"
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import UserInfoCard from "@/components/users/userInfo.vue"
import BaseModal from "@/components/common/BaseModal.vue"
import { get, post } from "@/apis/apiClient"
import { ENDPOINTS } from "@/apis/endpoint"

const currentPageTitle = ref("Users")
const users = ref([])
const loading = ref(true)
const showUserModal = ref(false)
const saving = ref(false)
const editingUserId = ref("")
const viewedUser = ref(null)
const userForm = ref({ name: "", mobileNumber: "", email: "", latitude: "", longitude: "" })
const mapContainer = ref(null)
let map = null
let marker = null

const isEditing = () => Boolean(editingUserId.value)

const alert = ref({
  show: false,
  type: "error",
  message: ""
})

function showError(msg) {
  alert.value = { show: true, type: "error", message: msg }
}

function showSuccess(msg) {
  alert.value = { show: true, type: "success", message: msg }
}

function openCreateModal() {
  editingUserId.value = ""
  userForm.value = { name: "", mobileNumber: "", email: "", latitude: "28.6139", longitude: "77.2090" }
  openUserModal()
}

function openEditModal(user) {
  editingUserId.value = user._id
  userForm.value = {
    name: user.name || "",
    mobileNumber: user.mobileNumber || "",
    email: user.email || "",
    latitude: String(user.latitude ?? "28.6139"),
    longitude: String(user.longitude ?? "77.2090"),
  }
  openUserModal()
}

async function openUserModal() {
  showUserModal.value = true
  await nextTick()
  await initializeMap()
}

function closeUserModal() {
  showUserModal.value = false
  if (map) {
    map.remove()
    map = null
    marker = null
  }
}

function openViewModal(user) {
  viewedUser.value = user
}

function hasCoordinates(user) {
  const latitude = Number(user?.latitude)
  const longitude = Number(user?.longitude)
  return Number.isFinite(latitude) && Number.isFinite(longitude)
}

function openStreetMapUrl(user) {
  return `https://www.openstreetmap.org/?mlat=${user.latitude}&mlon=${user.longitude}#map=16/${user.latitude}/${user.longitude}`
}

async function loadLeaflet() {
  if (window.L) return window.L
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link")
    link.id = "leaflet-css"
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)
  }
  await new Promise((resolve, reject) => {
    const existingScript = document.getElementById("leaflet-js")
    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true })
      existingScript.addEventListener("error", reject, { once: true })
      return
    }
    const script = document.createElement("script")
    script.id = "leaflet-js"
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = resolve
    script.onerror = () => reject(new Error("Map could not be loaded"))
    document.head.appendChild(script)
  })
  return window.L
}

async function initializeMap() {
  try {
    const L = await loadLeaflet()
    if (!mapContainer.value || !L) return
    const latitude = Number(userForm.value.latitude)
    const longitude = Number(userForm.value.longitude)
    map = L.map(mapContainer.value).setView([latitude, longitude], 13)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)
    marker = L.marker([latitude, longitude], { draggable: true }).addTo(map)
    map.on("click", (event) => setCoordinates(event.latlng.lat, event.latlng.lng))
    marker.on("dragend", () => {
      const position = marker.getLatLng()
      setCoordinates(position.lat, position.lng, false)
    })
  } catch (error) {
    console.error(error)
    showError("Failed to load the map. You can still enter coordinates manually.")
  }
}

function setCoordinates(latitude, longitude, panMap = true) {
  userForm.value.latitude = Number(latitude).toFixed(6)
  userForm.value.longitude = Number(longitude).toFixed(6)
  if (marker) marker.setLatLng([latitude, longitude])
  if (panMap && map) map.panTo([latitude, longitude])
}

function syncMapFromFields() {
  const latitude = Number(userForm.value.latitude)
  const longitude = Number(userForm.value.longitude)
  if (Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
    setCoordinates(latitude, longitude)
  }
}

async function saveUser() {
  const name = userForm.value.name.trim()
  const mobileNumber = userForm.value.mobileNumber.trim()
  const email = userForm.value.email.trim()
  const latitude = Number(userForm.value.latitude)
  const longitude = Number(userForm.value.longitude)

  if (!name) return showError("User name is required.")
  if (!mobileNumber) return showError("Mobile number is required.")
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return showError("Enter a valid latitude.")
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return showError("Enter a valid longitude.")

  saving.value = true
  alert.value.show = false
  try {
    const response = await post(
      editingUserId.value ? ENDPOINTS.EDIT_ADMIN_USER(editingUserId.value) : ENDPOINTS.ADD_ADMIN_USER,
      { name, mobileNumber, email, latitude, longitude },
    )
    if (editingUserId.value) {
      const index = users.value.findIndex((user) => user._id === editingUserId.value)
      if (index !== -1) users.value[index] = response?.user
    } else {
      users.value.unshift(response?.user)
    }
    closeUserModal()
    showSuccess(response?.message || (editingUserId.value ? "User updated successfully" : "User added successfully"))
  } catch (error) {
    console.error(error)
    showError(error?.response?.data?.message || "Failed to save user.")
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const response = await get(ENDPOINTS.USERS)

    if (!response || !response.users) {
      showError("Invalid API response")
      return
    }

    users.value = response.users
  } catch (error) {
    showError("Failed to load users")
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>
