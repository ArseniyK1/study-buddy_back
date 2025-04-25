<template>
  <div class="flex h-full">
    <!-- Navigation Drawer -->
    <div
      class="fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-200 ease-in-out z-30"
      :class="{ 'translate-x-0': isDrawerOpen }"
    >
      <div class="h-full w-64 bg-white shadow-lg flex flex-col">
        <div class="flex flex-col h-full">
          <div class="p-4 border-b flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">Меню</h2>
            <button
              @click="toggleDrawer"
              class="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                class="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto">
            <ul class="p-4 space-y-2">
              <li v-for="item in navigationItems" :key="item.name">
                <NuxtLink
                  :to="item.to"
                  class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <component :is="item.icon" class="h-5 w-5 mr-3" />
                  {{ item.name }}asd
                </NuxtLink>
              </li>
            </ul>
          </nav>
          <div class="p-4 border-t">
            <button
              @click="handleLogout"
              class="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg
                class="h-5 w-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toggle Button for Mobile -->
    <button
      @click="toggleDrawer"
      class="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg md:hidden hover:bg-gray-100"
    >
      <svg
        class="h-6 w-6 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Overlay -->
    <div
      v-if="isDrawerOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      @click="toggleDrawer"
    ></div>

    <!-- Main Content -->
    <div class="flex-1">
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
              <!-- Site Name -->
              <div class="flex-shrink-0">
                <h1 class="text-2xl font-bold text-indigo-600">
                  Коворкинг.Онлайн
                </h1>
              </div>

              <!-- Search -->
              <div class="flex-1 max-w-2xl mx-4">
                <div class="relative">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <svg
                      class="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- User Profile -->
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <div
                    class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"
                  >
                    <svg
                      class="h-5 w-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{
                    user?.email
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/outline";

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);
const isDrawerOpen = ref(false);

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};

const navigationItems = computed(() => {
  const role = user.value?.role?.value;

  const commonItems = [{ name: "Главная", to: "/", icon: HomeIcon }];

  const clientItems = [
    { name: "Мои бронирования", to: "/bookings", icon: CalendarIcon },
  ];

  const managerItems = [
    { name: "Управление местами", to: "/places", icon: BuildingOfficeIcon },
    { name: "Бронирования", to: "/bookings", icon: CalendarIcon },
  ];

  const adminItems = [
    { name: "Пользователи", to: "/users", icon: UserGroupIcon },
    { name: "Настройки", to: "/settings", icon: CogIcon },
    { name: "Статистика", to: "/statistics", icon: ChartBarIcon },
  ];

  switch (role) {
    case "client":
      return [...commonItems, ...clientItems];
    case "manager":
      return [...commonItems, ...managerItems];
    case "admin":
      return [...commonItems, ...adminItems];
    default:
      return commonItems;
  }
});
</script>
