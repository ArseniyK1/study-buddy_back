<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-200">
          Добрый день, {{ user?.firstName }}!
        </h1>
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
        :reset-trigger="filters"
        :limit="100"
      >
        <template #default="{ items: workspaces }">
          <WorkspaceCard
            v-for="workspace in workspaces"
            :key="workspace.id"
            :workspace="workspace"
            :is-super-admin="isSuperAdmin"
            @view-details="viewDetails"
            @delete="deleteWorkspace"
          />
        </template>
      </InfiniteList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";
import WorkspaceCard from "../components/WorkspaceCard.vue";
import InfiniteList from "../components/common/InfiniteList.vue";

interface Workspace {
  id: number;
  name: string;
  description: string;
  image?: string;
  status?: string;
}

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user || null);

const filters = ref({
  status: "",
});

const isManager = computed(() => {
  if (!user.value) return false;
  return user.value.role?.value === "MANAGER";
});

const isSuperAdmin = computed(() => {
  if (!user.value) return false;
  return user.value.role?.value === "SUPER_ADMIN";
});

const fetchWorkspaces = async (offset: number, limit: number) => {
  const params = {
    offset,
    limit,
    ...(filters.value?.status && { status: filters.value?.status }),
  };

  const { data } = await api.get<Workspace[]>("/workspaces", { params });
  return data;
};

const viewDetails = (id: number) => {
  router.push(`/workspaces/${id}`);
};

const deleteWorkspace = async (id: number) => {
  if (!confirm("Are you sure you want to delete this workspace?")) return;

  try {
    await api.delete(`/workspaces/${id}`);
  } catch (error) {
    console.error("Failed to delete workspace:", error);
  }
};
</script>
