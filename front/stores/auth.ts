import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
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

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/sign-in", { email, password });
      setTokens(data.accessToken, data.refreshToken);
      await fetchUser();
      return data;
    } catch (error) {
      toast.error((error as ApiError).message || "Failed to sign in");
      throw error;
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    name: {
      firstName: string;
      lastName: string;
      middleName?: string;
    };
    phone: string;
  }) => {
    try {
      const response = await api.post("/auth/sign-up", data);
      setTokens(response.data.accessToken, response.data.refreshToken);
      await fetchUser();
      return response.data;
    } catch (error) {
      toast.error((error as ApiError).message || "Failed to sign up");
      throw error;
    }
  };

  const signInWithTelegram = async (data: {
    telegramId: string;
    firstName: string;
    lastName: string;
    username: string;
    photoUrl: string;
    authDate: string;
    hash: string;
  }) => {
    try {
      const response = await api.post("/auth/telegram/sign-in", {
        telegram_id: data.telegramId,
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        photo_url: data.photoUrl,
        auth_date: data.authDate,
        hash: data.hash,
      });
      setTokens(response.data.accessToken, response.data.refreshToken);
      await fetchUser();
      return response.data;
    } catch (error) {
      toast.error(
        (error as ApiError).message || "Failed to sign in with Telegram"
      );
      throw error;
    }
  };

  const linkTelegramAccount = async (data: {
    userId: string;
    telegramId: string;
    firstName: string;
    lastName: string;
    username: string;
    photoUrl: string;
    authDate: string;
    hash: string;
  }) => {
    try {
      const response = await api.post("/auth/telegram/link", {
        user_id: data.userId,
        telegram_id: data.telegramId,
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        photo_url: data.photoUrl,
        auth_date: data.authDate,
        hash: data.hash,
      });
      setTokens(response.data.accessToken, response.data.refreshToken);
      await fetchUser();
      return response.data;
    } catch (error) {
      toast.error(
        (error as ApiError).message || "Failed to link Telegram account"
      );
      throw error;
    }
  };

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
    signInWithTelegram,
    linkTelegramAccount,
    fetchUser,
    logout,
  };
});
