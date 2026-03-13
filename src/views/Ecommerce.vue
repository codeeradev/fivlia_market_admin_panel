<template>
  <AdminLayout>
    <div class="space-y-6">
      <section
        class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-900 to-emerald-800 p-6 text-white shadow-xl"
      >
        <div class="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-24 left-6 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl"></div>

        <div class="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-cyan-100/80">Fivlia Market Analytics</p>
            <h1 class="mt-2 text-2xl font-semibold sm:text-3xl">Live Operations Dashboard</h1>
            <p class="mt-2 max-w-2xl text-sm text-cyan-100/80">
              Unified metrics from users, listings, banners, plans, approvals, and notification modules.
            </p>

            <div class="mt-4 flex items-center gap-2 text-xs text-cyan-100/80">
              <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-300"></span>
              <span v-if="lastUpdated">Last sync: {{ formatDateTime(lastUpdated) }}</span>
              <span v-else>Waiting for first sync</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <select
              v-model="selectedRange"
              class="h-10 rounded-xl border border-white/30 bg-white/10 px-3 text-sm text-white outline-none backdrop-blur placeholder:text-white/70 focus:border-white"
            >
              <option value="7d" class="text-slate-900">Last 7 days</option>
              <option value="30d" class="text-slate-900">Last 30 days</option>
              <option value="90d" class="text-slate-900">Last 90 days</option>
              <option value="all" class="text-slate-900">All time</option>
            </select>

            <button
              @click="refreshDashboard"
              :disabled="loading || refreshing"
              class="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                v-if="refreshing"
                class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
              ></span>
              <span>{{ refreshing ? 'Refreshing...' : 'Refresh Data' }}</span>
            </button>
          </div>
        </div>
      </section>

      <div
        v-if="loadErrors.length"
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        Partial data loaded. Could not fetch: {{ loadErrors.join(', ') }}.
      </div>

      <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-cyan-600"></div>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
      </div>

      <template v-else>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm dark:border-cyan-500/30 dark:bg-white/[0.03]">
            <p class="text-sm font-medium text-cyan-700 dark:text-cyan-300">Total Users</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ formatNumber(users.length) }}</p>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {{ formatNumber(filteredUsers.length) }} joined in {{ selectedRangeLabel }}
            </p>
          </article>

          <article class="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm dark:border-emerald-500/30 dark:bg-white/[0.03]">
            <p class="text-sm font-medium text-emerald-700 dark:text-emerald-300">Listings</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ formatNumber(products.length) }}</p>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {{ formatNumber(productStatusCounts.active) }} active • {{ formatNumber(productStatusCounts.sold) }} sold
            </p>
          </article>

          <article class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-orange-500/30 dark:bg-white/[0.03]">
            <p class="text-sm font-medium text-orange-700 dark:text-orange-300">Pending Approvals</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ formatNumber(pendingApprovalsCount) }}</p>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {{ formatNumber(approvals.products.length) }} products • {{ formatNumber(approvals.banners.length) }} banners
            </p>
          </article>

          <article class="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm dark:border-violet-500/30 dark:bg-white/[0.03]">
            <p class="text-sm font-medium text-violet-700 dark:text-violet-300">Notifications</p>
            <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ formatNumber(notifications.length) }}</p>
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {{ formatNumber(filteredNotifications.length) }} created in {{ selectedRangeLabel }}
            </p>
          </article>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
            <p class="text-xs text-gray-500 dark:text-gray-400">Active Banners</p>
            <p class="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{{ formatNumber(bannerStatusCounts.active) }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
            <p class="text-xs text-gray-500 dark:text-gray-400">Active Banner Plans</p>
            <p class="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{{ formatNumber(activePlansCount) }}</p>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03]">
            <p class="text-xs text-gray-500 dark:text-gray-400">Active Listing Value</p>
            <p class="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{{ formatCurrency(activeListingValue) }}</p>
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-12">
          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-8">
            <div class="mb-4 flex items-start justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Growth Trend</h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">Last 6 months registrations vs listings</p>
              </div>
            </div>
            <VueApexCharts type="area" height="320" :options="activityChartOptions" :series="activityChartSeries" />
          </section>

          <section class="space-y-4 xl:col-span-4">
            <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Listing Status Mix</h3>
              <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">Active, sold, expired</p>
              <VueApexCharts type="donut" height="240" :options="productChartOptions" :series="productChartSeries" />
            </div>

            <div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Banner Approval Mix</h3>
              <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">Current banner approval statuses</p>
              <VueApexCharts type="donut" height="240" :options="bannerChartOptions" :series="bannerChartSeries" />
            </div>
          </section>
        </div>

        <div class="grid gap-4 xl:grid-cols-12">
          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-5">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Top Categories</h3>
            <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">Most listed categories in {{ selectedRangeLabel }}</p>
            <VueApexCharts type="bar" height="290" :options="categoryChartOptions" :series="categoryChartSeries" />
          </section>

          <section class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:col-span-7">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Pending Approvals</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Fast lane for moderation</p>
              </div>
              <router-link
                to="/approvals"
                class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Open Approvals
              </router-link>
            </div>

            <div v-if="recentApprovals.length === 0" class="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
              No pending approvals right now.
            </div>

            <ul v-else class="space-y-3">
              <li
                v-for="item in recentApprovals"
                :key="item.id"
                class="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 dark:border-gray-800"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.title }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.owner }} • {{ formatDateTime(item.createdAt) }}</p>
                </div>
                <span
                  :class="[
                    'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider',
                    item.type === 'Banner'
                      ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
                  ]"
                >
                  {{ item.type }}
                </span>
              </li>
            </ul>
          </section>
        </div>

        <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Platform Activity</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Latest listings, banners and notifications</p>
            </div>
          </div>

          <div class="max-w-full overflow-x-auto">
            <table class="min-w-full">
              <thead class="border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Item</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Owner</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="activityRows.length === 0">
                  <td colspan="5" class="px-5 py-7 text-center text-sm text-gray-500 dark:text-gray-400">No activity available.</td>
                </tr>

                <tr
                  v-for="row in activityRows"
                  :key="row.id"
                  class="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                      <div
                        v-if="row.image"
                        class="h-10 w-10 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <img :src="row.image" :alt="row.title" class="h-full w-full object-cover" />
                      </div>
                      <div
                        v-else
                        class="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {{ row.type.charAt(0) }}
                      </div>

                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ row.title }}</p>
                        <p v-if="row.price != null" class="text-xs text-gray-500 dark:text-gray-400">{{ formatCurrency(row.price) }}</p>
                      </div>
                    </div>
                  </td>

                  <td class="px-5 py-3">
                    <span :class="typeBadgeClass(row.type)">
                      {{ row.type }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{{ row.owner }}</td>
                  <td class="px-5 py-3">
                    <span :class="statusBadgeClass(row.status)">
                      {{ row.status }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(row.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ENDPOINTS } from '@/apis/endpoint'
import { get } from '@/apis/apiClient'

type RangeKey = '7d' | '30d' | '90d' | 'all'
type ProductStatus = 'pending' | 'rejected' | 'active' | 'sold' | 'expired'
type BannerStatus = 'pending' | 'rejected' | 'active' | 'resubmit' | 'expired'

type NamedEntity = string | { name?: string } | null | undefined
type UserRef = string | { name?: string } | null | undefined

interface UserRecord {
  _id?: string
  name?: string
  createdAt?: string
}

interface ProductRecord {
  _id?: string
  name?: string
  price?: number
  image?: string[] | string
  userId?: UserRef
  category?: NamedEntity
  productStatus?: ProductStatus
  createdAt?: string
}

interface BannerRecord {
  _id?: string
  title?: string
  image?: string
  userId?: UserRef
  aprroveStatus?: BannerStatus
  createdAt?: string
}

interface NotificationRecord {
  _id?: string
  title?: string
  description?: string
  createdAt?: string
}

interface BannerPlanRecord {
  _id?: string
  status?: boolean
}

interface ApprovalRecord {
  _id?: string
  type?: 'product' | 'banner'
  name?: string
  title?: string
  userId?: UserRef
  createdAt?: string
}

interface ProductResponse {
  product?: ProductRecord[]
  totalPages?: number | null
}

interface UsersResponse {
  users?: UserRecord[]
}

interface ApprovalsResponse {
  Approvals?: {
    products?: ApprovalRecord[]
    banners?: ApprovalRecord[]
  }
}

interface PlansResponse {
  data?: BannerPlanRecord[]
}

interface NotificationsResponse {
  data?: NotificationRecord[]
}

interface ApprovalItemView {
  id: string
  type: 'Product' | 'Banner'
  title: string
  owner: string
  createdAt?: string
}

interface ActivityRow {
  id: string
  title: string
  type: 'Listing' | 'Banner' | 'Notification'
  owner: string
  status: string
  createdAt?: string
  image?: string
  price?: number
}

const RANGE_DAYS: Record<RangeKey, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  all: null,
}

const RANGE_LABELS: Record<RangeKey, string> = {
  '7d': 'last 7 days',
  '30d': 'last 30 days',
  '90d': 'last 90 days',
  all: 'all time',
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const IMAGE_BASE_URL = String(import.meta.env.VITE_IMAGEURL || '').replace(/\/+$/, '')

const users = ref<UserRecord[]>([])
const products = ref<ProductRecord[]>([])
const banners = ref<BannerRecord[]>([])
const plans = ref<BannerPlanRecord[]>([])
const notifications = ref<NotificationRecord[]>([])
const approvals = ref<{ products: ApprovalRecord[]; banners: ApprovalRecord[] }>({
  products: [],
  banners: [],
})

const selectedRange = ref<RangeKey>('30d')
const loading = ref(true)
const refreshing = ref(false)
const lastUpdated = ref<Date | null>(null)
const loadErrors = ref<string[]>([])

let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

const selectedRangeLabel = computed(() => RANGE_LABELS[selectedRange.value])
const activeRangeDays = computed(() => RANGE_DAYS[selectedRange.value])

const parseDate = (value?: string | Date | null): Date | null => {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const isInsideRange = (createdAt?: string, days?: number | null): boolean => {
  if (days === null || days === undefined) return true
  const date = parseDate(createdAt)
  if (!date) return false
  const diff = Date.now() - date.getTime()
  return diff >= 0 && diff <= days * DAY_IN_MS
}

const normalizeStatus = (value?: string): string => String(value || '').trim().toLowerCase()

const getUserName = (user: UserRef): string => {
  if (!user) return 'Unknown'
  if (typeof user === 'string') return user
  return user.name?.trim() || 'Unknown'
}

const getCategoryName = (category: NamedEntity): string => {
  if (!category) return 'Uncategorized'
  if (typeof category === 'string') return category
  return category.name?.trim() || 'Uncategorized'
}

const resolveImage = (path?: string | null): string => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const cleanPath = path.replace(/^\/+/, '')
  if (!IMAGE_BASE_URL) return cleanPath ? `/${cleanPath}` : ''
  return `${IMAGE_BASE_URL}/${cleanPath}`
}

const getProductImage = (image?: string[] | string): string => {
  if (Array.isArray(image)) return resolveImage(image[0] || '')
  if (typeof image === 'string') return resolveImage(image)
  return ''
}

const formatNumber = (value: number): string => new Intl.NumberFormat('en-IN').format(value)

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const formatDateTime = (value?: string | Date | null): string => {
  const parsed = parseDate(value || null)
  if (!parsed) return '-'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed)
}

const filteredUsers = computed(() =>
  users.value.filter((item) => isInsideRange(item.createdAt, activeRangeDays.value)),
)

const filteredProducts = computed(() =>
  products.value.filter((item) => isInsideRange(item.createdAt, activeRangeDays.value)),
)

const filteredNotifications = computed(() =>
  notifications.value.filter((item) => isInsideRange(item.createdAt, activeRangeDays.value)),
)

const productStatusCounts = computed(() => {
  const counts = { active: 0, sold: 0, expired: 0 }
  for (const item of products.value) {
    const status = normalizeStatus(item.productStatus)
    if (status === 'active') counts.active += 1
    if (status === 'sold') counts.sold += 1
    if (status === 'expired') counts.expired += 1
  }
  return counts
})

const bannerStatusCounts = computed(() => {
  const counts = { active: 0, pending: 0, rejected: 0, resubmit: 0, expired: 0 }
  for (const item of banners.value) {
    const status = normalizeStatus(item.aprroveStatus) as BannerStatus | ''
    if (status === 'active') counts.active += 1
    if (status === 'pending') counts.pending += 1
    if (status === 'rejected') counts.rejected += 1
    if (status === 'resubmit') counts.resubmit += 1
    if (status === 'expired') counts.expired += 1
  }
  return counts
})

const pendingApprovalsCount = computed(
  () => approvals.value.products.length + approvals.value.banners.length,
)

const activePlansCount = computed(
  () => plans.value.filter((plan) => Boolean(plan.status)).length,
)

const activeListingValue = computed(() =>
  products.value.reduce((sum, item) => {
    if (normalizeStatus(item.productStatus) !== 'active') return sum
    const amount = Number(item.price || 0)
    return Number.isFinite(amount) ? sum + amount : sum
  }, 0),
)

const monthBuckets = computed(() => {
  const bucketCount = 6
  const buckets: Array<{ key: string; label: string }> = []
  const current = new Date()

  for (let index = bucketCount - 1; index >= 0; index -= 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - index, 1)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const label = date.toLocaleString('en-US', { month: 'short' })
    buckets.push({ key, label })
  }

  return buckets
})

const buildMonthlySeries = <T extends { createdAt?: string }>(items: T[]): number[] => {
  const map = new Map(monthBuckets.value.map((bucket) => [bucket.key, 0]))

  for (const item of items) {
    const created = parseDate(item.createdAt)
    if (!created) continue
    const key = `${created.getFullYear()}-${created.getMonth()}`
    if (!map.has(key)) continue
    map.set(key, (map.get(key) || 0) + 1)
  }

  return monthBuckets.value.map((bucket) => map.get(bucket.key) || 0)
}

const activityChartSeries = computed(() => [
  { name: 'Users', data: buildMonthlySeries(users.value) },
  { name: 'Listings', data: buildMonthlySeries(products.value) },
])

const activityChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  },
  colors: ['#06b6d4', '#f97316'],
  stroke: { width: 3, curve: 'smooth' },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 90, 100],
    },
  },
  dataLabels: { enabled: false },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    labels: { colors: '#64748b' },
  },
  grid: { borderColor: '#E2E8F0' },
  xaxis: {
    categories: monthBuckets.value.map((bucket) => bucket.label),
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: '#64748b' } },
  },
  yaxis: {
    min: 0,
    labels: { style: { colors: '#64748b' } },
  },
  tooltip: { theme: 'light' },
}))

const productChartSeries = computed(() => {
  const raw = [
    productStatusCounts.value.active,
    productStatusCounts.value.sold,
    productStatusCounts.value.expired,
  ]
  return raw.some((value) => value > 0) ? raw : [1]
})

const productChartLabels = computed(() => {
  const raw = [
    productStatusCounts.value.active,
    productStatusCounts.value.sold,
    productStatusCounts.value.expired,
  ]
  return raw.some((value) => value > 0) ? ['Active', 'Sold', 'Expired'] : ['No Data']
})

const productChartOptions = computed(() => ({
  labels: productChartLabels.value,
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif',
  },
  colors:
    productChartLabels.value[0] === 'No Data'
      ? ['#CBD5E1']
      : ['#22C55E', '#FB923C', '#94A3B8'],
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    labels: { colors: '#64748b' },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
      },
    },
  },
}))

const bannerChartSeries = computed(() => {
  const raw = [
    bannerStatusCounts.value.active,
    bannerStatusCounts.value.pending,
    bannerStatusCounts.value.rejected,
    bannerStatusCounts.value.resubmit,
    bannerStatusCounts.value.expired,
  ]
  return raw.some((value) => value > 0) ? raw : [1]
})

const bannerChartLabels = computed(() => {
  const raw = [
    bannerStatusCounts.value.active,
    bannerStatusCounts.value.pending,
    bannerStatusCounts.value.rejected,
    bannerStatusCounts.value.resubmit,
    bannerStatusCounts.value.expired,
  ]
  return raw.some((value) => value > 0)
    ? ['Active', 'Pending', 'Rejected', 'Resubmit', 'Expired']
    : ['No Data']
})

const bannerChartOptions = computed(() => ({
  labels: bannerChartLabels.value,
  chart: {
    type: 'donut',
    fontFamily: 'Outfit, sans-serif',
  },
  colors:
    bannerChartLabels.value[0] === 'No Data'
      ? ['#CBD5E1']
      : ['#0EA5E9', '#F59E0B', '#EF4444', '#F97316', '#64748B'],
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    labels: { colors: '#64748b' },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
      },
    },
  },
}))

const topCategories = computed(() => {
  const source = filteredProducts.value.length ? filteredProducts.value : products.value
  const map = new Map<string, number>()

  for (const item of source) {
    const categoryName = getCategoryName(item.category)
    map.set(categoryName, (map.get(categoryName) || 0) + 1)
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const categoryChartSeries = computed(() => [
  {
    name: 'Listings',
    data: topCategories.value.length ? topCategories.value.map((item) => item.count) : [0],
  },
])

const categoryChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
  },
  colors: ['#14B8A6'],
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      barHeight: '48%',
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: topCategories.value.length
      ? topCategories.value.map((item) => item.name)
      : ['No categories'],
    labels: { style: { colors: '#64748b' } },
  },
  yaxis: {
    labels: { style: { colors: '#64748b' } },
  },
  grid: {
    borderColor: '#E2E8F0',
  },
}))

const recentApprovals = computed<ApprovalItemView[]>(() => {
  const productItems = approvals.value.products.map((item, index) => ({
    id: `product-${item._id || index}`,
    type: 'Product' as const,
    title: item.name?.trim() || 'Untitled Listing',
    owner: getUserName(item.userId),
    createdAt: item.createdAt,
  }))

  const bannerItems = approvals.value.banners.map((item, index) => ({
    id: `banner-${item._id || index}`,
    type: 'Banner' as const,
    title: item.title?.trim() || 'Untitled Banner',
    owner: getUserName(item.userId),
    createdAt: item.createdAt,
  }))

  return [...productItems, ...bannerItems]
    .sort((a, b) => {
      const timeA = parseDate(a.createdAt)?.getTime() || 0
      const timeB = parseDate(b.createdAt)?.getTime() || 0
      return timeB - timeA
    })
    .slice(0, 6)
})

const activityRows = computed<ActivityRow[]>(() => {
  const listingRows = products.value.map((item, index) => ({
    id: `listing-${item._id || index}`,
    title: item.name?.trim() || 'Untitled Listing',
    type: 'Listing' as const,
    owner: getUserName(item.userId),
    status: item.productStatus || 'unknown',
    createdAt: item.createdAt,
    image: getProductImage(item.image),
    price: Number.isFinite(Number(item.price)) ? Number(item.price) : undefined,
  }))

  const bannerRows = banners.value.map((item, index) => ({
    id: `banner-${item._id || index}`,
    title: item.title?.trim() || 'Untitled Banner',
    type: 'Banner' as const,
    owner: getUserName(item.userId),
    status: item.aprroveStatus || 'unknown',
    createdAt: item.createdAt,
    image: resolveImage(item.image || ''),
  }))

  const notificationRows = notifications.value.map((item, index) => ({
    id: `notification-${item._id || index}`,
    title: item.title?.trim() || 'Untitled Notification',
    type: 'Notification' as const,
    owner: 'Admin',
    status: 'published',
    createdAt: item.createdAt,
  }))

  return [...listingRows, ...bannerRows, ...notificationRows]
    .sort((a, b) => {
      const timeA = parseDate(a.createdAt)?.getTime() || 0
      const timeB = parseDate(b.createdAt)?.getTime() || 0
      return timeB - timeA
    })
    .slice(0, 10)
})

const typeBadgeClass = (type: ActivityRow['type']): string => {
  if (type === 'Listing') {
    return 'rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
  }
  if (type === 'Banner') {
    return 'rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300'
  }
  return 'rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
}

const statusBadgeClass = (status: string): string => {
  const normalized = normalizeStatus(status)

  if (normalized === 'active' || normalized === 'published') {
    return 'rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
  }
  if (normalized === 'pending') {
    return 'rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
  }
  if (normalized === 'sold') {
    return 'rounded-full bg-sky-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
  }
  if (normalized === 'expired') {
    return 'rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-500/30 dark:text-slate-300'
  }
  if (normalized === 'resubmit') {
    return 'rounded-full bg-orange-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
  }
  if (normalized === 'rejected') {
    return 'rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-500/20 dark:text-red-300'
  }

  return 'rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
}

const fetchAllProducts = async (): Promise<ProductRecord[]> => {
  const pageSize = 100
  const first = await get<ProductResponse>(ENDPOINTS.PRODUCTS, {
    page: 1,
    limit: pageSize,
  })

  const firstPage = Array.isArray(first.product) ? first.product : []
  const totalPages = Math.max(1, Number(first.totalPages || 1))

  if (totalPages === 1) return firstPage

  const requests: Promise<ProductResponse>[] = []

  for (let page = 2; page <= totalPages; page += 1) {
    requests.push(
      get<ProductResponse>(ENDPOINTS.PRODUCTS, {
        page,
        limit: pageSize,
      }),
    )
  }

  const pages = await Promise.all(requests)
  const nextPages = pages.flatMap((item) => (Array.isArray(item.product) ? item.product : []))
  return [...firstPage, ...nextPages]
}

const loadDashboard = async (isManualRefresh = false) => {
  if (isManualRefresh) {
    refreshing.value = true
  } else {
    loading.value = true
  }

  const errors: string[] = []

  const [
    usersResult,
    productsResult,
    approvalsResult,
    bannersResult,
    plansResult,
    notificationsResult,
  ] = await Promise.allSettled([
    get<UsersResponse>(ENDPOINTS.USERS),
    fetchAllProducts(),
    get<ApprovalsResponse>(ENDPOINTS.GET_PRODUCT_FOR_APPROVALS),
    get<BannerRecord[]>(ENDPOINTS.GET_BANNERS),
    get<PlansResponse>(ENDPOINTS.GET_PLANS, { includeInactive: true }),
    get<NotificationsResponse>(ENDPOINTS.GET_NOTIFICATION),
  ])

  if (usersResult.status === 'fulfilled') {
    users.value = Array.isArray(usersResult.value.users) ? usersResult.value.users : []
  } else {
    users.value = []
    errors.push('users')
  }

  if (productsResult.status === 'fulfilled') {
    products.value = Array.isArray(productsResult.value) ? productsResult.value : []
  } else {
    products.value = []
    errors.push('products')
  }

  if (approvalsResult.status === 'fulfilled') {
    approvals.value = {
      products: Array.isArray(approvalsResult.value.Approvals?.products)
        ? approvalsResult.value.Approvals?.products || []
        : [],
      banners: Array.isArray(approvalsResult.value.Approvals?.banners)
        ? approvalsResult.value.Approvals?.banners || []
        : [],
    }
  } else {
    approvals.value = { products: [], banners: [] }
    errors.push('approvals')
  }

  if (bannersResult.status === 'fulfilled') {
    banners.value = Array.isArray(bannersResult.value) ? bannersResult.value : []
  } else {
    banners.value = []
    errors.push('banners')
  }

  if (plansResult.status === 'fulfilled') {
    plans.value = Array.isArray(plansResult.value.data) ? plansResult.value.data : []
  } else {
    plans.value = []
    errors.push('plans')
  }

  if (notificationsResult.status === 'fulfilled') {
    notifications.value = Array.isArray(notificationsResult.value.data)
      ? notificationsResult.value.data
      : []
  } else {
    notifications.value = []
    errors.push('notifications')
  }

  loadErrors.value = errors
  lastUpdated.value = new Date()
  loading.value = false
  refreshing.value = false
}

const refreshDashboard = async () => {
  await loadDashboard(true)
}

onMounted(async () => {
  await loadDashboard()

  autoRefreshTimer = setInterval(() => {
    if (loading.value || refreshing.value) return
    void loadDashboard(true)
  }, 120000)
})

onBeforeUnmount(() => {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer)
})
</script>
