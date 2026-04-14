import { createRouter, createWebHistory } from 'vue-router'
import { clearAdminSession, hasValidAdminSession } from '@/utils/adminAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'eCommerce Dashboard',
      },
    },
    {
      path: '/category',
      name: 'Category',
      component: () => import('../views/Others/CategoryList.vue'),
      meta: {
        title: 'Category',
      },
    },
    {
      path: '/filter',
      name: 'Filter',
      component: () => import('../views/filter/FilterList.vue'),
      meta: {
        title: 'Filter',
      },
    },
    {
      path: '/products',
      name: 'Products',
      component: () => import('../views/Product/Products.vue'),
      meta: { title: 'Products' },
    },
    {
      path: '/products/plans',
      name: 'Product Plans',
      component: () => import('../views/Product/ProductPlans.vue'),
      meta: { title: 'Product Plans' },
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/Others/UsersPage.vue'),
      meta: {
        title: 'Users',
      },
    },
    {
      path: '/banners',
      name: 'Banners',
      component: () => import('../views/Banners/BannersList.vue'),
      meta: { title: 'Banners' },
    },
    {
      path: '/banners/plans',
      name: 'Banner Plans',
      component: () => import('../views/Banners/BannerPlans.vue'),
      meta: { title: 'Banner Plans' },
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    {
      path: '/approvals',
      name: 'Approvals',
      component: () => import('../views/Approvals/Approvals.vue'),
      meta: {
        title: 'Approvals',
      },
    },

    {
      path: '/notification',
      name: 'Notification',
      component: () => import('../views/notification/notification-table.vue'),
      meta: {
        title: 'Notification',
      },
    },

    {
      path: '/admin-settings',
      name: 'Profile & Settings',
      component: () => import('../views/adminSettings/AdminSettings.vue'),
      meta: {
        title: 'Profile & Settings',
      },
    },
    {
      path: '/privacy-policy',
      alias: ['/privacy-policy/', '/privacy-policy/index.html'],
      name: 'Privacy Policy',
      component: () => import('../views/Public/PrivacyPolicy.vue'),
      meta: {
        title: 'Privacy Policy',
        publicRoute: true,
        standalone: true,
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
        publicRoute: true,
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
        publicRoute: true,
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  const pageTitle =
    typeof to.meta.title === 'string'
      ? to.meta.title
      : typeof to.name === 'string'
        ? to.name
        : 'Dashboard'
  const isPublicRoute = Boolean(to.meta.publicRoute)

  document.title = isPublicRoute
    ? `${pageTitle} | Fivlia Connect`
    : `Fivlia Connect ${pageTitle} | Fivlia Connect Dashboard`

  const isAuthenticated = hasValidAdminSession()

  if (isPublicRoute) {
    if (to.path === '/signin' && isAuthenticated) {
      next('/')
      return
    }
    next()
    return
  }

  if (!isAuthenticated) {
    clearAdminSession()
    next('/signin')
    return
  }

  next()
})
