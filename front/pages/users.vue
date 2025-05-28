<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-gray-800 p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Name Search -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Поиск по имени</label
          >
          <input
            v-model="filters.nameFilter"
            type="text"
            placeholder="Введите имя..."
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- Ban Status -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Статус бана</label
          >
          <select
            v-model="filters.isBanned"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Все</option>
            <option :value="true">Забаненные</option>
            <option :value="false">Не забаненные</option>
          </select>
        </div>

        <!-- Telegram Status -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Telegram</label
          >
          <select
            v-model="filters.hasTelegram"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="null">Все</option>
            <option :value="true">С телеграмом</option>
            <option :value="false">Без телеграма</option>
          </select>
        </div>

        <!-- Role Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >Роль</label
          >
          <select
            v-model="filters.roleId"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option :value="0">Все роли</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.description }}
            </option>
          </select>
        </div>
      </div>

      <!-- Apply Filters Button -->
      <div class="mt-4 flex justify-between items-center">
        <Pagination
          :current-page="currentPage"
          :has-more="hasMore"
          @page-change="handlePageChange"
        />
        <button
          @click="applyFilters"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Применить фильтры
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto" style="max-height: calc(100vh - 300px)">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-700 sticky top-0">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                ФИО
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Телефон
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Роль
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Статус
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Telegram
              </th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ user.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{
                  `${user.lastName} ${user.firstName} ${user.middleName || ""}`
                }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ user.phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ user.role.description }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    user.banned
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800',
                  ]"
                >
                  {{ user.banned ? "Забанен" : "Активен" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <span v-if="user.telegramId" class="text-green-400">✓</span>
                <span v-else class="text-red-400">✗</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Button -->
    <div v-if="canCreateUsers" class="fixed bottom-6 right-6">
      <button
        @click="showCreateDialog = true"
        class="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <PlusIcon class="h-6 w-6" />
      </button>
    </div>

    <!-- Create User Dialog -->
    <CreateUserDialog
      v-model="showCreateDialog"
      :workspaces="userWorkspaces"
      @user-created="fetchUsers(currentPage)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import Pagination from "@/components/common/Pagination.vue";
import CreateUserDialog from "@/components/users/CreateUserDialog.vue";
import { PlusIcon } from "@heroicons/vue/24/outline";
import { useToast } from "vue-toastification";
import api from "@/services/api";

interface Workspace {
  id: number;
  name: string;
}

const authStore = useAuthStore();
const toast = useToast();
const users = computed(() => authStore.getUsersComputed);
const roles = computed(() => authStore.getRolesComputed);
const currentPage = ref(1);
const hasMore = ref(true);
const pageSize = 100;
const showCreateDialog = ref(false);
const userWorkspaces = ref<Workspace[]>([]);

const filters = ref({
  nameFilter: "",
  isBanned: null as boolean | null,
  hasTelegram: null as boolean | null,
  roleId: 0,
});

// Проверяем права на создание пользователей
const canCreateUsers = computed(() => {
  const userRole = authStore.user?.role?.value;
  return userRole === "SUPER_ADMIN" || userRole === "ADMIN";
});

const fetchUsers = async (page: number = 1) => {
  try {
    await authStore.findAllUsers({
      nameFilter: filters.value.nameFilter,
      isBanned: filters.value.isBanned,
      hasTelegram: filters.value.hasTelegram,
      roleId: filters.value.roleId,
      offset: (page - 1) * pageSize,
      limit: pageSize + 1,
    });

    hasMore.value = users.value.length >= pageSize;

    currentPage.value = page;
  } catch (error) {
    console.error("Error fetching users:", error);
    hasMore.value = false;
  }
};

const handlePageChange = async (page: number) => {
  if (page < 1) return;
  await fetchUsers(page);
};

const applyFilters = () => {
  currentPage.value = 1;
  fetchUsers(1);
};

// Загрузка коворкингов пользователя
const fetchUserWorkspaces = async () => {
  try {
    const response = await api.get("/auth/workspaces");
    userWorkspaces.value = response.data;
  } catch (error: any) {
    console.error("Error fetching workspaces:", error);
    toast.error("Не удалось загрузить список коворкингов");
  }
};

onMounted(() => {
  fetchUsers(1);
  if (canCreateUsers.value) {
    fetchUserWorkspaces();
  }
});
</script>
