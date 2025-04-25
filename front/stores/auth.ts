import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";
import type {
  SignInRequest,
  SignUpRequest,
  RefreshTokenRequest,
  AuthResponse,
} from "../../back/shared/generated/auth";

const getStoredToken = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string | null>(getStoredToken("accessToken"));
  const refreshToken = ref<string | null>(getStoredToken("refreshToken"));
  const user = ref<any | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  function setTokens(access: string | null, refresh: string | null) {
    accessToken.value = access;
    refreshToken.value = refresh;
    if (typeof window !== "undefined") {
      if (access) localStorage.setItem("accessToken", access);
      else localStorage.removeItem("accessToken");
      if (refresh) localStorage.setItem("refreshToken", refresh);
      else localStorage.removeItem("refreshToken");
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post<AuthResponse>("/auth/sign-in", {
        email,
        password,
      });
      setTokens(data.accessToken, data.refreshToken);
      await fetchUser();
      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  async function signUp(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone: string
  ) {
    try {
      const { data } = await api.post<AuthResponse>("/auth/sign-up", {
        email,
        password,
        name: {
          first_name,
          last_name,
        },
        phone,
      });
      setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) throw new Error("No refresh token available");

    try {
      const { data } = await api.post<AuthResponse>("/auth/refresh", {
        refresh_token: refreshToken.value,
      });
      setTokens(data.accessToken, data.refreshToken);
      return data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }

  async function fetchUser() {
    if (!accessToken.value) return null;

    try {
      const { data } = await api.post("/auth/profile");
      user.value = data;
      return data;
    } catch (error) {
      console.error("Fetch user error:", error);
      throw error;
    }
  }

  function logout() {
    localStorage.clear();
    user.value = null;
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    setTokens,
    signIn,
    signUp,
    refreshAccessToken,
    fetchUser,
    logout,
  };
});
