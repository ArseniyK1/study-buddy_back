<template>
  <div class="flex h-screen bg-gray-900 overflow-hidden">
    <!-- Navigation Drawer -->
    <div
      class="fixed inset-y-0 left-0 transform -translate-x-full transition-transform duration-200 ease-in-out z-50"
      :class="{ 'translate-x-0': isDrawerOpen }"
    >
      <div
        class="h-full w-64 bg-gray-800 shadow-lg flex flex-col border-r border-gray-700"
      >
        <div class="flex flex-col h-full">
          <div
            class="p-4 border-b border-gray-700 flex justify-between items-center"
          >
            <h2 class="text-lg font-semibold text-gray-200">Меню</h2>
            <button
              @click="toggleDrawer"
              class="p-2 rounded-lg hover:bg-gray-700"
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
                  @click="toggleDrawer"
                  class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
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

    <!-- Toggle Button -->
    <button
      @click="toggleDrawer"
      class="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 shadow-lg hover:bg-gray-700 transition-opacity duration-200"
      :class="{ 'opacity-0 pointer-events-none': isDrawerOpen }"
    >
      <svg
        class="h-6 w-6 text-gray-400"
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

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-gray-800 shadow sticky top-0 z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Site Name -->
            <NuxtLink to="/hello">
              <div class="flex-shrink-0">
                <h1 class="text-2xl font-bold text-indigo-400 hidden md:block">
                  Коворкинг.Онлайн
                </h1>
                <BuildingOffice2Icon
                  class="h-8 w-8 text-indigo-400 md:hidden"
                />
              </div>
            </NuxtLink>
            <!-- Search -->
            <div class="flex-1 max-w-2xl mx-4">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Поиск..."
                  @keyup.enter="handleSearch"
                  class="w-full pl-10 pr-10 py-2 border border-gray-700 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  <svg
                    class="h-5 w-5"
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
            </div>

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
                  <span class="text-sm font-medium text-gray-300">{{
                    user?.email
                  }}</span>
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
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <slot :main-content-ref="mainContent" />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useSearchStore } from "@/stores/search";
import { useRouter } from "vue-router";
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  CogIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

const authStore = useAuthStore();
const searchStore = useSearchStore();
const router = useRouter();
const user = computed(() => authStore.user);
const isDrawerOpen = ref(false);
const mainContent = ref<HTMLElement | null>(null);
const isUserMenuOpen = ref(false);
const searchQuery = ref(searchStore.getSearchQuery());

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};

const handleLogout = async () => {
  authStore.logout();
  router.push("/login");
};

const handleMainScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  // Можно передавать событие дальше в слот если нужно
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
    { name: "Управление местами", to: "/places", icon: BuildingOfficeIcon },
    { name: "Бронирования", to: "/bookings", icon: CalendarIcon },
  ];

  const adminItems = [
    { name: "Пользователи", to: "/users", icon: UserGroupIcon },
    { name: "Настройки", to: "/settings", icon: CogIcon },
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

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".relative")) {
    isUserMenuOpen.value = false;
  }
};

const handleSearch = () => {
  searchStore.setSearchQuery(searchQuery.value);
};

const clearSearch = () => {
  searchQuery.value = "";
  searchStore.setSearchQuery("");
};

// Синхронизация с URL при изменении маршрута
watch(
  () => searchStore.getSearchQuery(),
  (newQuery) => {
    if (newQuery !== searchQuery.value) {
      searchQuery.value = newQuery;
    }
  }
);

// Синхронизация при монтировании
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  searchQuery.value = searchStore.getSearchQuery();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
