<template>
  <div class="flex h-screen bg-gray-900 overflow-hidden">
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-gray-800 shadow sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Site Name -->
            <NuxtLink to="/hello">
              <div class="flex-shrink-0">
                <h1 class="text-2xl font-bold text-indigo-400">
                  Коворкинг.Онлайн
                </h1>
              </div>
            </NuxtLink>

            <!-- Navigation Items -->
            <nav class="flex-1 flex justify-center space-x-4 mx-4">
              <NuxtLink
                v-for="item in navigationItems"
                :key="item.name"
                :to="item.to"
                :class="[
                  'flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors',
                  { 'bg-gray-700 text-white': isActiveRoute(item.to) },
                ]"
              >
                <component
                  :is="item.icon"
                  class="h-5 w-5 mr-2"
                  :class="{ 'text-indigo-400': isActiveRoute(item.to) }"
                />
                <span class="hidden sm:inline">{{ item.name }}</span>
              </NuxtLink>
            </nav>

            <!-- User Profile -->
            <div class="flex items-center space-x-4">
              <div class="relative">
                <button
                  @click="isUserMenuOpen = !isUserMenuOpen"
                  class="flex items-center space-x-2 focus:outline-none"
                >
                  <div
                    class="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center"
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <span
                    class="text-sm font-medium text-gray-300 hidden sm:inline"
                    >{{ user?.email }}</span
                  >
                </button>

                <!-- User Menu Dropdown -->
                <div
                  v-if="isUserMenuOpen"
                  class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700"
                >
                  <NuxtLink
                    to="/profile"
                    class="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <UserIcon class="h-5 w-5 mr-2" />
                    Профиль
                  </NuxtLink>
                  <NuxtLink
                    to="/settings"
                    class="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <CogIcon class="h-5 w-5 mr-2" />
                    Настройки
                  </NuxtLink>
                  <button
                    @click="handleLogout"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    <ArrowRightOnRectangleIcon class="h-5 w-5 mr-2" />
                    Выйти
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto" ref="mainContent">
        <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot :main-content-ref="mainContent" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from "vue-router";
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const user = computed(() => authStore.user);
const mainContent = ref<HTMLElement | null>(null);
const isUserMenuOpen = ref(false);

const handleLogout = async () => {
  authStore.logout();
  router.push("/login");
};

const navigationItems = computed(() => {
  enum Role {
    USER = "USER",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
    SUPER_ADMIN = "SUPER_ADMIN",
  }
  const role = user.value?.role?.value;

  const commonItems = [{ name: "Главная", to: "/hello", icon: HomeIcon }];

  const clientItems = [
    { name: "Мои бронирования", to: "/bookings", icon: CalendarIcon },
  ];

  const managerItems = [
    { name: "Управление", to: "/dashboard", icon: BuildingOfficeIcon },
    { name: "Бронирования", to: "/bookings", icon: CalendarIcon },
    { name: "Пользователи", to: "/users", icon: UserGroupIcon },
  ];

  const adminItems = [
    { name: "Пользователи", to: "/users", icon: UserGroupIcon },
    { name: "Настройки", to: "/admin", icon: CogIcon },
    { name: "Статистика", to: "/statistics", icon: ChartBarIcon },
  ];

  switch (role) {
    case Role.USER:
      return [...commonItems, ...clientItems];
    case Role.MANAGER:
      return [...commonItems, ...managerItems];
    case Role.ADMIN:
      return [...commonItems, ...adminItems];
    case Role.SUPER_ADMIN:
      return [...commonItems, ...adminItems];
    default:
      return commonItems;
  }
});

const isActiveRoute = (path: string) => {
  // Exact match for root path
  if (path === "/hello") {
    return route.path === path;
  }
  // For other paths, check if current route starts with the path
  return route.path.startsWith(path);
};

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".relative")) {
    isUserMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
