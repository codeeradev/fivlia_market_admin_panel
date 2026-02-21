// src/apis/endpoint.ts
export const ENDPOINTS = {
  CATEGORY: {
    SAVE: '/saveCategory', // POST form-data (create/update). "id" field for update
    GET_ALL: '/getCategories', // GET
    SAVE_SUB_ENTITY: (catId: string, subId?: string) =>
      subId
        ? `/saveSubEntity/${catId}?subId=${subId}`
        : subId
          ? `/saveSubEntity/${catId}?subId=${subId}`
          : `/saveSubEntity/${catId}`,
    DELETE_ENTITY: (catId: string, subId?: string) =>
      subId
        ? `/deleteEntity/${catId}?subId=${subId}`
        : subId
          ? `/deleteEntity/${catId}?subId=${subId}`
          : `/deleteEntity/${catId}`,
    TOGGLE_STATUS: (catId: string, subId?: string) =>
      subId
        ? `/toggleStatus/${catId}?subId=${subId}`
        : subId
          ? `/toggleStatus/${catId}?subId=${subId}`
          : `/toggleStatus/${catId}`,
  },
  USERS: '/getUsers',
  PRODUCTS: '/getProduct',
  EDIT_PRODUCT: (id: string) => `/edit-product/${id}`,
  GET_PRODUCT_FOR_APPROVALS: '/get-product-for-approvals',
  GET_BANNERS: '/get-all-banner',
  ADD_BANNER: '/addBanner',
  ADD_ADMIN_BANNER: '/admin/addBanner',
  ADD_PLANS: '/addPlans',
  GET_PLANS: '/getPlans',
  EDIT_PLANS: (planId: string) => `/edit-elans/${planId}`,
  UPDATE_PRODUCT_STATUS: '/update-product-status',
  UPDATE_BANNER: (id: string) => `update-banner-status/${id}`,
  UPDATE_BANNER_APPROVAL: (id: string) => `/update-banner-approval/${id}`,

  GET_CITY: '/get-city',

  GET_SETTING: '/admin/get-setting',
  UPDATE_SETTING: '/admin/update-setting',
  ADMIN_LOGIN: '/admin/login',

  GET_NOTIFICATION: '/get-notification',
  CREATE_NOTIFICATION: '/create-notification',
  EDIT_NOTIFICATION: (id: string) => `/edit-notification/${id}`,
  SEND_NOTIFICATION: '/send-notification',
}
