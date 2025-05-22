<template>
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed top-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-lg shadow-lg"
      :class="[
        type === 'success' && 'bg-green-800',
        type === 'error' && 'bg-red-800',
        type === 'info' && 'bg-blue-800',
        type === 'warning' && 'bg-yellow-800',
      ]"
    >
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <!-- Success Icon -->
            <svg
              v-if="type === 'success'"
              class="h-6 w-6 text-green-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <!-- Error Icon -->
            <svg
              v-if="type === 'error'"
              class="h-6 w-6 text-red-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <!-- Info Icon -->
            <svg
              v-if="type === 'info'"
              class="h-6 w-6 text-blue-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <!-- Warning Icon -->
            <svg
              v-if="type === 'warning'"
              class="h-6 w-6 text-yellow-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium" :class="textColorClass">
              {{ title }}
            </p>
            <p class="mt-1 text-sm" :class="textColorClass">
              {{ message }}
            </p>
          </div>
          <div class="ml-4 flex flex-shrink-0">
            <button
              type="button"
              class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="[
                type === 'success' &&
                  'text-green-200 hover:text-green-100 focus:ring-green-500',
                type === 'error' &&
                  'text-red-200 hover:text-red-100 focus:ring-red-500',
                type === 'info' &&
                  'text-blue-200 hover:text-blue-100 focus:ring-blue-500',
                type === 'warning' &&
                  'text-yellow-200 hover:text-yellow-100 focus:ring-yellow-500',
              ]"
              @click="$emit('close')"
            >
              <span class="sr-only">Закрыть</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  show: boolean;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

const props = defineProps<Props>();
defineEmits<{
  (e: "close"): void;
}>();

const textColorClass = computed(() => ({
  "text-green-200": props.type === "success",
  "text-red-200": props.type === "error",
  "text-blue-200": props.type === "info",
  "text-yellow-200": props.type === "warning",
}));
</script>
