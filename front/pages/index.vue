<template>
  <div class="flex h-full">
    <!-- Navigation Drawer -->
    <div
      class="fixed inset-y-0 left-0 transform -translate-x-full md:translate-x-0 transition-transform duration-200 ease-in-out z-30"
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
                  {{ item.name }}
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
      class="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow md:hidden"
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
      class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
      @click="toggleDrawer"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 md:ml-64">
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-6">
          Добро пожаловать, {{ user?.firstName }}!
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Role-specific content will go here -->
          <div
            v-if="user?.role?.value === 'client'"
            class="bg-white p-6 rounded-lg shadow"
          >
            <h2 class="text-xl font-semibold mb-4">Мои бронирования</h2>
            <!-- Client specific content -->
          </div>
          <div
            v-if="user?.role?.value === 'manager'"
            class="bg-white p-6 rounded-lg shadow"
          >
            <h2 class="text-xl font-semibold mb-4">Управление коворкингом</h2>
            <!-- Manager specific content -->
          </div>
          <div
            v-if="user?.role?.value === 'admin'"
            class="bg-white p-6 rounded-lg shadow"
          >
            <h2 class="text-xl font-semibold mb-4">Административная панель</h2>
            <!-- Admin specific content -->
          </div>
        </div>
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
