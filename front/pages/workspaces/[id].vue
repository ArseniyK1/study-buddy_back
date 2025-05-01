<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- Workspace Header -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
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
              <h1 class="text-2xl font-bold text-gray-900">
                {{ workspace.name }}
              </h1>
              <p class="mt-2 text-gray-600">{{ workspace.description }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Статус</p>
              <p
                class="text-lg font-semibold"
                :class="{
                  'text-green-600': workspace.status === 'APPROVED',
                  'text-yellow-600': workspace.status === 'PENDING',
                }"
              >
                {{
                  workspace.status === "APPROVED"
                    ? "Одобрено"
                    : "На рассмотрении"
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Zones Section -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          Зоны коворкинга
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  status: string;
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
