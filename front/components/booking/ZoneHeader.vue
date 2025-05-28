<!-- ZoneHeader.vue -->
<template>
  <div
    class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 p-6 mb-8"
  >
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-2xl font-bold text-gray-200">{{ zone.name }}</h1>
        <p class="mt-2 text-gray-400">{{ zone.description }}</p>
        <p class="mt-1 text-indigo-400 text-lg font-semibold">
          {{ zone.pricePerHour }} ₽/час
        </p>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-400 space-y-1">
          <p>Всего мест: {{ zone.maxPlaces }}</p>
          <p class="text-green-400">Свободно: {{ availablePlaces }}</p>
          <p class="text-red-400">Занято: {{ occupiedPlaces }}</p>
          <p class="text-yellow-400">В обслуживании: {{ maintenancePlaces }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  maxPlaces: number;
  workspaceId: number;
  places: Place[];
}

interface Place {
  id: number;
  name: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  zoneId: number;
  bookings?: any[];
}

const props = defineProps<{
  zone: Zone;
  places: Place[];
}>();

const availablePlaces = computed(() => {
  return props.places.filter((p) => p.status === "AVAILABLE").length;
});

const occupiedPlaces = computed(() => {
  return props.places.filter((p) => p.status === "OCCUPIED").length;
});

const maintenancePlaces = computed(() => {
  return props.places.filter((p) => p.status === "MAINTENANCE").length;
});
</script>
