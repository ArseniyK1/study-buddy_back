<template>
  <div class="bg-gray-900">
    <div class="max-w-3xl mx-auto py-2 px-4 sm:px-6 lg:px-8 h-full">
      <!-- Loading Spinner -->
      <div v-if="!user" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <div
        v-else
        class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700"
      >
        <!-- Profile Header -->
        <div class="px-6 py-8 border-b border-gray-700">
          <h1 class="text-2xl font-bold text-gray-200">Профиль пользователя</h1>
        </div>

        <!-- User Information -->
        <div class="px-6 py-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-400">Имя</label>
              <p class="mt-1 text-lg text-gray-200">{{ user?.firstName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400"
                >Фамилия</label
              >
              <p class="mt-1 text-lg text-gray-200">{{ user?.lastName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400"
                >Отчество</label
              >
              <p class="mt-1 text-lg text-gray-200">{{ user?.middleName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400"
                >Email</label
              >
              <p class="mt-1 text-lg text-gray-200">{{ user?.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400"
                >Телефон</label
              >
              <p class="mt-1 text-lg text-gray-200">{{ user?.phone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400"
                >Роль</label
              >
              <p class="mt-1 text-lg text-gray-200">
                {{ user?.role?.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Change Password Form -->
        <div class="px-6 py-8 border-t border-gray-700">
          <h2 class="text-xl font-semibold text-gray-200 mb-6">Смена пароля</h2>
          <form @submit.prevent="changePassword" class="space-y-6">
            <div>
              <label
                for="currentPassword"
                class="block text-sm font-medium text-gray-400"
                >Текущий пароль</label
              >
              <input
                type="password"
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                for="newPassword"
                class="block text-sm font-medium text-gray-400"
                >Новый пароль</label
              >
              <input
                type="password"
                id="newPassword"
                v-model="passwordForm.newPassword"
                class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                for="confirmPassword"
                class="block text-sm font-medium text-gray-400"
                >Подтвердите новый пароль</label
              >
              <input
                type="password"
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                class="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                :disabled="loading"
              >
                <span v-if="loading" class="flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Сохранение...
                </span>
                <span v-else>Изменить пароль</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import api from "../services/api";
import { useNotify } from "../services/notify";

const authStore = useAuthStore();
const user = computed(() => authStore.getProfileComputed);
const loading = ref(false);
const notify = useNotify();

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    notify.error("Ошибка", "Новые пароли не совпадают");
    return;
  }

  loading.value = true;
  try {
    await api.post("/users/change-password", {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    });
    notify.success("Успех", "Пароль успешно изменен");
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  } catch (error) {
    console.error("Failed to change password:", error);
    notify.error("Ошибка", "Не удалось изменить пароль");
  } finally {
    loading.value = false;
  }
};
</script>
