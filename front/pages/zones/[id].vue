<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading Spinner -->
      <div v-if="!zone.id" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <!-- Zone Header -->
      <div
        v-else
        class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 p-6 mb-8"
      >
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-200">{{ zone.name }}</h1>
            <p class="mt-2 text-gray-400">{{ zone.description }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold text-indigo-400">
              {{ zone.pricePerHour }} ₽/час
            </p>
            <div class="text-sm text-gray-400 space-y-1">
              <p>Всего мест: {{ zone.maxPlaces }}</p>
              <p class="text-green-400">Свободно: {{ availablePlaces }}</p>
              <p class="text-red-400">Занято: {{ occupiedPlaces }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Layout -->
      <WorkplaceList :places="places" :zone-id="zone.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "@/services/api";
import WorkplaceList from "@/components/workplaces/WorkplaceList.vue";

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  maxPlaces: number;
  places?: Place[];
}

interface Place {
  id: number;
  name: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
}

const route = useRoute();
const zone = ref<Zone>({} as Zone);
const places = ref<Place[]>([]);

const availablePlaces = computed(() => {
  return places.value.filter((place) => place.status === "AVAILABLE").length;
});

const occupiedPlaces = computed(() => {
  return places.value.filter((place) => place.status === "BOOKED").length;
});

onMounted(async () => {
  try {
    const { data: zoneData } = await api.get<Zone>(
      `/workspace-zones/${route.params.id}`
    );
    zone.value = zoneData;

    const { data: placesData } = await api.get<Place[]>(
      `/workplace?zoneId=${route.params.id}`
    );
    places.value = placesData;
  } catch (error) {
    console.error("Failed to fetch zone data:", error);
  }
});
</script>
