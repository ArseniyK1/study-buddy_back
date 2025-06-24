<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading indicator -->
      <div
        v-if="isLoading"
        class="mb-4 p-4 bg-gray-800 text-gray-200 rounded-lg"
      >
        Загрузка...
      </div>

      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-200">Коворкинг-центры</h1>
      </div>

      <!-- Filters for managers -->
      <div
        v-if="isManager"
        class="mb-6 bg-gray-800 p-4 rounded-lg shadow border border-gray-700"
      >
        <div class="flex space-x-4">
          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Status</label
            >
            <select
              v-model="filters.status"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-700 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <InfiniteList
        :fetch-items="fetchWorkspaces"
        :reset-trigger="listRefreshTrigger"
        :limit="100"
      >
        <template #default="{ items: workspaces }">
          <WorkspaceCard
            v-for="workspace in workspaces"
            :key="workspace.id"
            :workspace="workspace"
            :is-super-admin="isSuperAdmin"
            :is-deleting="deletingWorkspaceIds.has(workspace.id)"
            @view-details="viewDetails"
            @confirm-delete="showDeleteConfirmation"
          />
        </template>
      </InfiniteList>
    </div>

    <!-- Floating Action Button -->
    <button
      v-if="user?.role?.id === 2 || isSuperAdmin"
      @click="showCreateDialog = true"
      class="fixed bottom-6 right-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-colors duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>

    <!-- Create Workspace Dialog -->
    <div
      v-if="showCreateDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-200">
            Создать коворкинг-центр
          </h2>
          <button
            @click="showCreateDialog = false"
            class="text-gray-400 hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        <form @submit.prevent="createWorkspace" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Название</label
            >
            <input
              v-model="newWorkspace.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300">Адрес</label>
            <input
              v-model="newWorkspace.address"
              type="text"
              required
              class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Описание</label
            >
            <textarea
              v-model="newWorkspace.description"
              rows="3"
              class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Вместимость</label
            >
            <input
              v-model.number="newWorkspace.capacity"
              type="number"
              required
              min="1"
              class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300"
              >Удобства</label
            >
            <input
              v-model="newWorkspace.amenities"
              type="text"
              class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="showCreateDialog = false"
              class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-200">
            Подтверждение удаления
          </h2>
          <button
            @click="showDeleteDialog = false"
            class="text-gray-400 hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
        <p class="text-gray-300 mb-6">
          При удалении коворкинг-центра удалятся все его зоны и места без
          возможности восстановления. Вы уверены?
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showDeleteDialog = false"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-200"
          >
            Отмена
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useWorkspaceStore } from "../stores/workspace";
import WorkspaceCard from "../components/WorkspaceCard.vue";
import InfiniteList from "../components/common/InfiniteList.vue";
import { useNotify } from "../services/notify";
import { fakerRU as faker } from "@faker-js/faker";

interface Workspace {
  id: number;
  name: string;
  description: string;
  image?: string;
  status?: string;
}

interface NewWorkspace {
  name: string;
  address: string;
  description?: string;
  capacity: number;
  amenities?: string;
}

const router = useRouter();
const authStore = useAuthStore();
const workspaceStore = useWorkspaceStore();
const user = computed(() => authStore.user || null);
const notify = useNotify();

const filters = computed({
  get: () => workspaceStore.filters,
  set: (value) => workspaceStore.updateFilters(value),
});

const isManager = computed(() => {
  if (!user.value) return false;
  return user.value.role?.value === "MANAGER";
});

const isSuperAdmin = computed(() => {
  if (!user.value) return false;
  return user.value.role?.value === "SUPER_ADMIN";
});

const showCreateDialog = ref(false);
const newWorkspace = ref<NewWorkspace>({
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  description: faker.lorem.paragraph(),
  capacity: faker.number.int({ min: 10, max: 100 }),
  amenities: faker.lorem.words(5),
});

const deletingWorkspaceIds = ref<Set<number>>(new Set());

const fetchWorkspaces = async (offset: number, limit: number) => {
  return await workspaceStore.fetchWorkspaces(offset, limit);
};

const viewDetails = (id: number) => {
  router.push(`/workspaces/${id}`);
};

const showDeleteDialog = ref(false);
const workspaceToDelete = ref<number | null>(null);

const showDeleteConfirmation = (workspaceId: number) => {
  workspaceToDelete.value = workspaceId;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (workspaceToDelete.value === null) return;

  try {
    deletingWorkspaceIds.value.add(workspaceToDelete.value);
    await workspaceStore.deleteWorkspace(workspaceToDelete.value);
    notify.success("Успех", "Коворкинг успешно удален");
  } catch (error) {
    console.error("Error deleting workspace:", error);
    notify.error(
      "Ошибка",
      error instanceof Error ? error.message : "Не удалось удалить коворкинг"
    );
  } finally {
    deletingWorkspaceIds.value.delete(workspaceToDelete.value);
    workspaceToDelete.value = null;
    showDeleteDialog.value = false;
  }
};

const createWorkspace = async () => {
  try {
    await workspaceStore.createWorkspace(newWorkspace.value);
    notify.success("Успех", "Коворкинг успешно создан");
    showCreateDialog.value = false;
    resetForm();
  } catch (error) {
    console.error("Error creating workspace:", error);
    notify.error(
      "Ошибка",
      error instanceof Error ? error.message : "Не удалось создать коворкинг"
    );
  }
};

// Add loading state to template
const isLoading = computed(() => workspaceStore.isLoading);
const error = computed(() => workspaceStore.error);

// Add computed property for refresh trigger
const listRefreshTrigger = computed(() => ({
  ...workspaceStore.filters,
  refreshTrigger: workspaceStore.refreshTrigger,
}));

const resetForm = () => {
  newWorkspace.value = {
    name: "",
    address: "",
    description: "",
    capacity: 0,
    amenities: "",
  };
};
</script>
