import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import { useToast } from "vue-toastification";

interface FindAllUsersRequest {
  nameFilter?: string;
  isBanned?: boolean | null;
  hasTelegram?: boolean | null;
  roleId?: number;
  currentRoleId: number;
  offset: number;
  limit: number;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  role: {
    id: number;
    value: string;
    description: string;
  };
  banned?: boolean;
  telegramId?: string;
}

interface UserListResponse {
  users: User[];
}

interface ApiError extends Error {
  message: string;
}

interface Role {
  id: number;
  value: string;
  description: string;
}

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const user = ref<any | null>(null);
  const isInitialized = ref(false);
  const users = ref<any[]>([]);
  const roles = ref<Role[]>([
    { id: 1, value: "USER", description: "Пользователь" },
    { id: 2, value: "ADMIN", description: "Администратор" },
    { id: 3, value: "MANAGER", description: "Менеджер" },
    { id: 4, value: "SUPER_ADMIN", description: "Супер администратор" },
  ]);
  const myWorkspace = ref({});
  const toast = useToast();

  const isAuthenticated = computed(() => !!accessToken.value);
  const getProfileComputed = computed(() => user.value);
  const getUsersComputed = computed(() => users.value);
  const getRolesComputed = computed(() => roles.value);
  const getMyWorkspaceComputed = computed(() => myWorkspace.value);

  function setTokens(access: string | null, refresh: string | null) {
    accessToken.value = access;
    refreshToken.value = refresh;
    if (process.client) {
      if (access) localStorage.setItem("accessToken", access);
      else localStorage.removeItem("accessToken");
      if (refresh) localStorage.setItem("refreshToken", refresh);
      else localStorage.removeItem("refreshToken");
    }
  }

  function setUser(userData: any | null) {
    user.value = userData;
    if (process.client) {
      if (userData) localStorage.setItem("userData", JSON.stringify(userData));
      else localStorage.removeItem("userData");
    }
  }

  async function initialize() {
    if (isInitialized.value) return;

    if (process.client) {
      const storedAccess = localStorage.getItem("accessToken");
      const storedRefresh = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("userData");

      if (storedAccess && storedRefresh) {
        setTokens(storedAccess, storedRefresh);
        try {
          await fetchUser();
        } catch (error) {
          console.error("Failed to fetch user:", error);
          toast.error((error as ApiError).message || "Failed to fetch user");
          logout();
        }
      }
    }

    isInitialized.value = true;
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post("/auth/sign-in", {
        email,
        password,
      });

      setTokens(data.accessToken, data.refreshToken);
      await fetchUser();
      return data;
    } catch (error) {
      toast.error("Неправильный email и/или пароль");
      throw error;
    }
  }

  async function signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) {
    try {
      const { data } = await api.post("/auth/sign-up", {
        email,
        password,
        firstName,
        lastName,
        phone,
      });
      setTokens(data.accessToken, data.refreshToken);
      await fetchUser();
      return data;
    } catch (error) {
      toast.error((error as ApiError).message || "Failed to sign up");
      throw error;
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return null;
    try {
      const { data } = await api.post("/auth/profile");
      setUser(data);

      await getMyWorkspace();
      return data;
    } catch (error) {
      toast.error(
        (error as ApiError).message || "Failed to fetch user profile"
      );
      throw error;
    }
  }

  function logout() {
    setTokens(null, null);
    setUser(null);
  }

  const findAllUsers = async (
    request: FindAllUsersRequest
  ): Promise<UserListResponse> => {
    try {
      const response = await api.post("/auth/all-users", {
        nameFilter: request.nameFilter || "",
        isBanned: request.isBanned,
        hasTelegram: request.hasTelegram,
        roleId: request.roleId || 0,
        currentRoleId: request.currentRoleId,
        offset: request.offset,
        limit: request.limit,
      });
      users.value = response.data.users;
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const getMyWorkspace = async () => {
    const res = await api.get("/auth/my-workspace");

    myWorkspace.value = res.data;

    return res;
  };

  const resetUsers = () => {
    users.value = [];
  };

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isInitialized,
    getProfileComputed,
    getUsersComputed,
    getRolesComputed,
    getMyWorkspaceComputed,
    initialize,
    setTokens,
    signIn,
    signUp,
    fetchUser,
    logout,
    findAllUsers,
    resetUsers,
  };
});
