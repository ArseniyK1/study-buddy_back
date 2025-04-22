import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = ref(!!token.value);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
    isAuthenticated.value = true;
  }

  function clearToken() {
    token.value = null;
    localStorage.removeItem('token');
    isAuthenticated.value = false;
  }

  return {
    token,
    isAuthenticated,
    setToken,
    clearToken,
  };
});
