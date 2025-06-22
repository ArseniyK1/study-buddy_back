<template>
  <div class="space-y-6">
    <div class="bg-gray-800 p-4 rounded-lg shadow"></div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted } from "vue";

const authStore = useAuthStore();

onMounted(async () => {
  alert(JSON.stringify(authStore.getMyWorkspaceComputed));
});
</script>
