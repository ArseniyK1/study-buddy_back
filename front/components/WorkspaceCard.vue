<template>
  <div
    class="bg-gray-800 rounded-lg shadow overflow-hidden h-full flex flex-col border border-gray-700"
  >
    <div class="h-48 overflow-hidden">
      <img
        :src="
          workspace.image ||
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        "
        class="w-full h-full object-cover"
        alt="Workspace"
      />
    </div>
    <div class="p-4 flex flex-col flex-grow">
      <h3 class="text-lg font-medium text-gray-200">
        {{ workspace.name }}
      </h3>
      <p class="mt-1 text-sm text-gray-400 flex-grow">
        {{ workspace.description }}
      </p>
      <div class="mt-4 flex justify-between items-center">
        <button
          @click="$emit('view-details', workspace.id)"
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Подробнее
        </button>
        <div v-if="isSuperAdmin" class="relative">
          <button
            v-if="!isDeleting"
            @click="$emit('confirm-delete', workspace.id)"
            class="text-red-400 hover:text-red-300"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
          <div v-else class="w-5 h-5">
            <svg
              class="animate-spin h-5 w-5 text-red-400"
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  workspace: {
    id: number;
    name: string;
    description: string;
    image?: string;
  };
  isSuperAdmin: boolean;
  isDeleting?: boolean;
}>();

defineEmits<{
  (e: "view-details", id: number): void;
  (e: "confirm-delete", id: number): void;
}>();
</script>
