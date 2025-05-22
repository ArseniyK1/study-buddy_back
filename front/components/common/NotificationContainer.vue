<template>
  <div class="fixed top-0 right-0 z-50 p-4 space-y-4">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :show="true"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="remove(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { notifications, useNotify } from "../../services/notify";
import Notification from "./Notification.vue";

const { remove } = useNotify();
</script>
