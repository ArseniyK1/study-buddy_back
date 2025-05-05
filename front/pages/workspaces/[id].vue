<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <p class="text-gray-400">{{ workspace.description }}</p>
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

      <!-- Workspace Table -->
      <div class="mt-2">
        <h2 class="text-xl font-semibold text-gray-200">
          Зоны и рабочие места
        </h2>
        <WorkspaceTable
          :zones="zones"
          :loading="loading"
          @book-place="handleBookPlace"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/services/api";
import WorkspaceTable from "@/components/workspace/WorkspaceTable.vue";

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
  maxPlaces: number;
  workspaceId: number;
  workspace: {
    id: number;
    name: string;
    address: string;
    description: string;
    capacity: number;
    amenities: string;
    approved: boolean;
    ownerId: number;
  };
  places?: Place[];
}

interface Place {
  id: number;
  name: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  zoneId: number;
}

const route = useRoute();
const workspace = ref<Workspace>({} as Workspace);
const zones = ref<Zone[]>([]);
const loading = ref(true);

const fetchZones = async () => {
  try {
    const { data } = await api.get<Zone[]>(
      `/workspace-zones?workspaceId=${route.params.id}`
    );
    zones.value = data;
  } catch (error) {
    console.error("Failed to fetch zones:", error);
  } finally {
    loading.value = false;
  }
};

const handleBookPlace = async (
  zoneId: number,
  placeId: number,
  startTime: Date,
  endTime: Date
) => {
  try {
    await api.post("/bookings", {
      zoneId,
      placeId,
      startTime,
      endTime,
    });
    // Refresh zones data after booking
    await fetchZones();
  } catch (error) {
    console.error("Failed to book place:", error);
  }
};

onMounted(async () => {
  try {
    const { data: workspaceData } = await api.get<Workspace>(
      `/workspaces/${route.params.id}`
    );
    workspace.value = workspaceData;
    await fetchZones();
  } catch (error) {
    console.error("Failed to fetch workspace data:", error);
  }
});
</script>
