<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Авторизация через Telegram
        </h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          {{ loading ? "Выполняется вход..." : error || "Перенаправление..." }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const hash = route.hash.substring(1);
    const params = new URLSearchParams(hash);
    const telegramData = {
      telegramId: params.get("id") || "",
      firstName: params.get("first_name") || "",
      lastName: params.get("last_name") || "",
      username: params.get("username") || "",
      photoUrl: params.get("photo_url") || "",
      authDate: params.get("auth_date") || "",
      hash: params.get("hash") || "",
    };

    if (!telegramData.telegramId) {
      throw new Error("Не удалось получить данные от Telegram");
    }

    await authStore.signInWithTelegram(telegramData);
    router.push("/hello");
  } catch (err) {
    error.value = "Ошибка авторизации через Telegram";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
