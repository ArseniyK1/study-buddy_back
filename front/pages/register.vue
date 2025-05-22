<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-200">
          Создание аккаунта
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-gray-200 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="firstName" class="sr-only">Имя</label>
            <input
              id="firstName"
              v-model="firstName"
              name="firstName"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Имя"
            />
          </div>
          <div>
            <label for="lastName" class="sr-only">Фамилия</label>
            <input
              id="lastName"
              v-model="lastName"
              name="lastName"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Фамилия"
            />
          </div>
          <div>
            <label for="phone" class="sr-only">Телефон</label>
            <input
              id="phone"
              v-model="phone"
              name="phone"
              type="tel"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Телефон"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Пароль</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-gray-200 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Пароль"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            :disabled="loading"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-indigo-400 group-hover:text-indigo-300"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ loading ? "Создание аккаунта..." : "Зарегистрироваться" }}
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-900 text-gray-400">Или</span>
          </div>
        </div>

        <div class="mt-6">
          <button
            @click="initTelegramAuth"
            class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0088cc] hover:bg-[#0077b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0088cc] focus:ring-offset-gray-900"
          >
            <svg
              class="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.49.8-.75 3.12-1.36 5.2-2.26 6.24-2.7 2.97-1.23 3.59-1.44 4-1.44.09 0 .29.02.42.14.11.1.14.23.15.38-.01.14-.01.3-.02.42z"
              />
            </svg>
            Войти через Telegram
          </button>
        </div>
      </div>

      <div class="text-center mt-4">
        <NuxtLink to="/login" class="text-indigo-400 hover:text-indigo-300">
          Уже есть аккаунт? Войти
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

definePageMeta({
  layout: "auth",
});

const router = useRouter();
const authStore = useAuthStore();
const email = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const loading = ref(false);
const error = ref("");

const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = "";
    await authStore.signUp({
      email: email.value,
      password: password.value,
      name: {
        firstName: firstName.value,
        lastName: lastName.value,
      },
      phone: phone.value,
    });
    router.push("/hello");
  } catch (err) {
    error.value = "Ошибка регистрации. Пожалуйста, попробуйте снова.";
  } finally {
    loading.value = false;
  }
};

const initTelegramAuth = () => {
  // const botId = import.meta.env.TELEGRAM_BOT_ID;
  // if (!botId) {
  //   console.error("Telegram bot ID not configured");
  //   return;
  // }

  console.log("Bot ID:", import.meta.env.TELEGRAM_BOT_ID);

  const authUrl = `https://oauth.telegram.org/auth?bot_id=${"7933596215"}&origin=${
    window.location.origin
  }&return_to=${window.location.origin}/auth/telegram`;
  window.location.href = authUrl;
};
</script>
