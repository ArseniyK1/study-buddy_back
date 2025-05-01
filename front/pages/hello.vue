<template>
  <div class="min-h-screen bg-gray-900">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-200">
          Hello, {{ user?.firstName }}!
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

      <!-- Workspaces Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WorkspaceCard
          v-for="workspace in workspaces"
          :key="workspace.id"
          :workspace="workspace"
          :is-super-admin="isSuperAdmin"
          @view-details="viewDetails"
          @delete="deleteWorkspace"
        />
      </div>

      <!-- Loading indicator -->
      <div v-if="loading" class="mt-6 text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";
import WorkspaceCard from "../components/WorkspaceCard.vue";

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

const workspaces = ref<Workspace[]>([]);
const loading = ref(false);
const offset = ref(0);
const limit = 100;
const hasMore = ref(true);

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

const fetchWorkspaces = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return;

  loading.value = true;
  try {
    const params = {
      offset: reset ? 0 : offset.value,
      limit,
      ...(filters.value?.status && { status: filters.value?.status }),
    };

    const { data } = await api.get<Workspace[]>("/workspaces", { params });

    if (reset) {
      workspaces.value = data;
    } else {
      workspaces.value = [...workspaces.value, ...data];
    }

    hasMore.value = data.length === limit;
    if (!reset) {
      offset.value += limit;
    }
  } catch (error) {
    console.error("Failed to fetch workspaces:", error);
  } finally {
    loading.value = false;
  }
};

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollHeight - scrollTop <= clientHeight + 100) {
    fetchWorkspaces();
  }
};

const viewDetails = (id: number) => {
  router.push(`/workspaces/${id}`);
};

const deleteWorkspace = async (id: number) => {
  if (!confirm("Are you sure you want to delete this workspace?")) return;

  try {
    await api.delete(`/workspaces/${id}`);
    workspaces.value = workspaces.value.filter((w) => w.id !== id);
  } catch (error) {
    console.error("Failed to delete workspace:", error);
  }
};

// Watch for filter changes
watch(
  filters,
  () => {
    offset.value = 0;
    hasMore.value = true;
    fetchWorkspaces(true);
  },
  { deep: true }
);

onMounted(() => {
  fetchWorkspaces(true);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
