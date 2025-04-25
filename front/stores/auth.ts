import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const user = ref<any | null>(null);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value);
  const getProfileComputed = computed(() => user.value);

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
    // Уже инициализирован
    if (isInitialized.value) return;

    // Только на клиенте
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
          logout();
        }
      }
    }

    isInitialized.value = true;
  }

  async function signIn(email: string, password: string) {
    const { data } = await api.post("/auth/sign-in", {
      email,
      password,
    });
    setTokens(data.accessToken, data.refreshToken);
    await fetchUser();
    return data;
  }

  async function fetchUser() {
    if (!accessToken.value) return null;
    const { data } = await api.post("/auth/profile");
    setUser(data);
    return data;
  }

  function logout() {
    setTokens(null, null);
    setUser(null);
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isInitialized,
    getProfileComputed,
    initialize,
    setTokens,
    signIn,
    fetchUser,
    logout,
  };
});
