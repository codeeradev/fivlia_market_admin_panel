<template>
  <aside :class="[
    'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
    {
      'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
      'lg:w-[90px]': !isExpanded && !isHovered,
      'translate-x-0 w-[290px]': isMobileOpen,
      '-translate-x-full': !isMobileOpen,
      'lg:translate-x-0': true,
    },
  ]" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div :class="[
      'py-8 flex',
      !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
    ]">
      <router-link to="/" class="inline-flex items-center">
        <span class="text-lg font-semibold text-slate-800 dark:text-white leading-none">
          FIVLIA MARKET
        </span>
      </router-link>
    </div>


    <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2 :class="[
              'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
              !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
            ]">
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>

            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button v-if="item.subItems" @click="toggleSubmenu(groupIndex, index)" :class="[
                  'menu-item group w-full',
                  {
                    'menu-item-active': isSubmenuOpen(groupIndex, index),
                    'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                  },
                  !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start',
                ]">
                  <span :class="[
                    isSubmenuOpen(groupIndex, index)
                      ? 'menu-item-icon-active'
                      : 'menu-item-icon-inactive',
                  ]">
                    <component :is="item.icon" />
                  </span>

                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">
                    {{ item.name }}
                  </span>

                  <ChevronDownIcon v-if="isExpanded || isHovered || isMobileOpen" :class="[
                    'ml-auto w-5 h-5 transition-transform duration-200',
                    { 'rotate-180 text-brand-500': isSubmenuOpen(groupIndex, index) },
                  ]" />
                </button>

                <router-link v-else-if="item.path" :to="item.path" :class="[
                  'menu-item group',
                  { 'menu-item-active': isActive(item.path), 'menu-item-inactive': !isActive(item.path) },
                ]">
                  <span :class="[isActive(item.path) ? 'menu-item-icon-active' : 'menu-item-icon-inactive']">
                    <component :is="item.icon" />
                  </span>
                  <span v-if="isExpanded || isHovered || isMobileOpen" class="menu-item-text">
                    {{ item.name }}
                  </span>
                </router-link>

                <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition"
                  @after-leave="endTransition">
                  <div v-show="isSubmenuOpen(groupIndex, index) && (isExpanded || isHovered || isMobileOpen)">
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link :to="subItem.path" :class="[
                          'menu-dropdown-item',
                          {
                            'menu-dropdown-item-active': isActive(subItem.path),
                            'menu-dropdown-item-inactive': !isActive(subItem.path),
                          },
                        ]">
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span v-if="subItem.new" :class="[
                              'menu-dropdown-badge',
                              { 'menu-dropdown-badge-active': isActive(subItem.path), 'menu-dropdown-badge-inactive': !isActive(subItem.path) },
                            ]">
                              new
                            </span>

                            <span v-if="subItem.pro" :class="[
                              'menu-dropdown-badge',
                              { 'menu-dropdown-badge-active': isActive(subItem.path), 'menu-dropdown-badge-inactive': !isActive(subItem.path) },
                            ]">
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { useRoute } from "vue-router";
import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  // ChatIcon,
  // MailIcon,
  // DocsIcon,
  // PieChartIcon,
  ChevronDownIcon,
  HorizontalDots,
  PageIcon,
  ListIcon,
  PlugInIcon,
} from "../../icons";

import BoxCubeIcon from "@/icons/BoxCubeIcon.vue";
import { useSidebar } from "@/composables/useSidebar";

interface SubItem {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
}

interface MenuItem {
  icon?: Component;
  name: string;
  path?: string;
  subItems?: SubItem[];
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const route = useRoute();
const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

/* this is fine now because they ARE booleans */
const isActive = (path?: string) => !!path && route.path === path;

const menuGroups: MenuGroup[] = [
  {
    title: "Menu",
    items: [
      { icon: GridIcon, name: "Dashboard", subItems: [{ name: "Ecommerce", path: "/", pro: false }] },
      { icon: CalenderIcon, name: "Category", path: "/category" },
      {
        icon: PageIcon,
        name: "Banners",
        subItems: [
          { name: "Banner List", path: "/banners" },
          { name: "Banner Plans", path: "/banners/plans" },
        ],
      },
      { icon: PageIcon, name: "Notification", path: "/notification" },
      { icon: PageIcon, name: "Approvals", path: "/approvals" },
      { icon: UserCircleIcon, name: "Users", path: "/users" },
      { icon: ListIcon, name: "Products", path: "/products" },
    ],
  },

  {
    title: "Others",
    items: [
      { icon: PageIcon, name: "Profile & Settings", path: "/admin-settings" },
      // {
      //   icon: BoxCubeIcon,
      //   name: "Ui Elements",
      //   subItems: [
      //     { name: "Alerts", path: "/alerts" },
      //     { name: "Avatars", path: "/avatars" },
      //     { name: "Badge", path: "/badge" },
      //     { name: "Buttons", path: "/buttons" },
      //     { name: "Images", path: "/images" },
      //     { name: "Videos", path: "/videos" },
      //   ],
      // },
      { icon: PlugInIcon, name: "Authentication", subItems: [{ name: "Signin", path: "/signin" }, { name: "Signup", path: "/signup" }] },
    ],
  },
];

const toggleSubmenu = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() =>
  menuGroups.some((group) =>
    group.items.some((item) => item.subItems?.some((sub) => isActive(sub.path)))
  )
);

const isSubmenuOpen = (g: number, i: number) => {
  const key = `${g}-${i}`;
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups[g].items[i].subItems?.some((sub) => isActive(sub.path)))
  );
};

/* transition hooks now 100% typed */
const startTransition = (el: Element) => {
  const target = el as HTMLElement;
  target.style.height = "auto";
  const height = target.scrollHeight;
  target.style.height = "0px";
  const _ = target.offsetHeight
  target.style.height = `${height}px`;
};

const endTransition = (el: Element) => {
  const target = el as HTMLElement;
  target.style.height = "";
};

const handleMouseEnter = () => {
  if (!isExpanded) isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
};
</script>

<style scoped></style>
