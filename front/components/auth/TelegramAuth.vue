<template>
  <div class="flex flex-col items-center space-y-4">
    <button
      @click="initTelegramAuth"
      class="flex items-center space-x-2 bg-[#0088cc] text-white px-4 py-2 rounded-md hover:bg-[#0077b3] transition-colors"
    >
      <svg
        class="w-6 h-6"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.29-.49.8-.75 3.12-1.36 5.2-2.26 6.24-2.7 2.97-1.23 3.59-1.44 4-1.44.09 0 .29.02.42.14.11.1.14.23.15.38-.01.14-.01.3-.02.42z"
        />
      </svg>
      <span>Войти через Telegram</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const initTelegramAuth = () => {
  const botUsername = import.meta.env.TELEGRAM_BOT_USERNAME;
  alert(botUsername);
  if (!botUsername) {
    console.error("Telegram bot username not configured");
    return;
  }

  const authUrl = `https://oauth.telegram.org/auth?bot_id=${botUsername}&origin=${window.location.origin}&return_to=${window.location.origin}/auth/telegram`;
  window.location.href = authUrl;
};
</script>
