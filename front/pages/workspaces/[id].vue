<template>
  <div class="min-h-screen bg-gray-900">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- Loading Spinner for Workspace -->
      <div v-if="!workspace.id" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <!-- Workspace Header -->
      <div
        v-else
        class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700"
      >
        <img
          :src="
            workspace.image ||
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
          "
          class="w-full h-64 object-cover"
          alt="Workspace"
        />
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-200">
                {{ workspace.name }}
              </h1>
              <p class="mt-2 text-gray-400">{{ workspace.description }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-400">Одобренно</p>
              <div class="flex items-center justify-end space-x-2">
                <svg
                  v-if="workspace.approved"
                  class="h-6 w-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <svg
                  v-else
                  class="h-6 w-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Zones Section -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-200 mb-6">
          Зоны коворкинга
        </h2>

        <!-- Loading Spinner for Zones -->
        <div v-if="!zones.length" class="flex justify-center items-center h-32">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"
          ></div>
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ZoneCard v-for="zone in zones" :key="zone.id" :zone="zone" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "~/services/api";
import ZoneCard from "~/components/workspace/ZoneCard.vue";

interface Workspace {
  id: number;
  name: string;
  description: string;
  image?: string;
  approved: boolean;
}

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  places?: any[];
}

const route = useRoute();
const workspace = ref<Workspace>({} as Workspace);
const zones = ref<Zone[]>([]);

onMounted(async () => {
  try {
    const { data: workspaceData } = await api.get<Workspace>(
      `/workspaces/${route.params.id}`
    );
    workspace.value = workspaceData;

    const { data: zonesData } = await api.get<Zone[]>(
      `/workspace-zones?workspaceId=${route.params.id}`
    );
    zones.value = zonesData;
  } catch (error) {
    console.error("Failed to fetch workspace data:", error);
  }
});
</script>
