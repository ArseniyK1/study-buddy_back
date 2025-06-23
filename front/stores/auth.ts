import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";
import { useToast } from "vue-toastification";

interface ApiError extends Error {
  message: string;
}

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const user = ref<any | null>(null);
  const isInitialized = ref(false);
  const toast = useToast();

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
      console.log("Data:", data);
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
    signUp,
    fetchUser,
    logout,
  };
});
