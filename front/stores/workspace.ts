import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

interface Workspace {
  id: number;
  name: string;
  address: string;
  description?: string;
  capacity: number;
  amenities?: string;
  approved: boolean;
  ownerId: number;
  owner?: any;
  managers?: any[];
}

interface NewWorkspace {
  name: string;
  address: string;
  description?: string;
  capacity: number;
  amenities?: string;
}

interface WorkspaceFilters {
  status?: string;
}

interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const workspaces = ref<Workspace[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<WorkspaceFilters>({
    status: "",
  });
  const refreshTrigger = ref(0);

  // Getters
  const approvedWorkspaces = computed(() =>
    workspaces.value.filter((w) => w.approved)
  );

  const pendingWorkspaces = computed(() =>
    workspaces.value.filter((w) => !w.approved)
  );

  const getWorkspaceById = (id: number) =>
    workspaces.value.find((w) => w.id === id);

  // Actions
  const fetchWorkspaces = async (offset: number = 0, limit: number = 100) => {
    isLoading.value = true;
    error.value = null;
    try {
      const params = {
        offset,
        limit,
        ...(filters.value?.status && { status: filters.value.status }),
      };

      const { data } = await api.get<Workspace[]>("/workspaces", { params });
      workspaces.value = data;
      return data;
    } catch (err) {
      error.value = "Failed to fetch workspaces";
      console.error("Failed to fetch workspaces:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createWorkspace = async (workspace: NewWorkspace) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<Workspace>("/workspaces", workspace);
      refreshTrigger.value++;
      return data;
    } catch (err) {
      error.value = "Failed to create workspace";
      console.error("Failed to create workspace:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const handleError = (err: any): string => {
    if (err.response?.data) {
      const apiError = err.response.data as ApiError;
      if (typeof apiError.message === "string") {
        return apiError.message;
      }
      if (Array.isArray(apiError.message)) {
        return apiError.message[0];
      }
    }
    return err.message || "Произошла неизвестная ошибка";
  };

  const deleteWorkspace = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.delete<Workspace>(`/workspaces/${id}`);
      refreshTrigger.value++;
      return data;
    } catch (err: any) {
      const errorMessage = handleError(err);
      if (err.response?.status === 404) {
        error.value = "Коворкинг-центр не найден";
      } else if (err.response?.status === 403) {
        error.value = "У вас нет прав для удаления этого коворкинг-центра";
      } else {
        error.value = `Ошибка при удалении: ${errorMessage}`;
      }
      console.error("Failed to delete workspace:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateFilters = (newFilters: WorkspaceFilters) => {
    filters.value = { ...filters.value, ...newFilters };
    refreshTrigger.value++;
  };

  return {
    // State
    workspaces,
    isLoading,
    error,
    filters,
    refreshTrigger,

    // Getters
    approvedWorkspaces,
    pendingWorkspaces,
    getWorkspaceById,

    // Actions
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace,
    updateFilters,
  };
});
