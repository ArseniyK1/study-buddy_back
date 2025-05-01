<template>
  <div
    class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 h-full flex flex-col"
  >
    <div class="p-6 flex flex-col flex-grow">
      <div class="flex justify-between items-start flex-grow">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-medium text-gray-200 truncate">
            {{ zone.name }}
          </h3>
          <p class="mt-1 text-sm text-gray-400 line-clamp-2">
            {{ zone.description }}
          </p>
        </div>
        <div class="text-right ml-4 flex-shrink-0">
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
      <div class="mt-4">
        <button
          @click="viewZone"
          :class="[
            'w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2',
            hasAvailablePlaces
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
          ]"
        >
          {{ hasAvailablePlaces ? "Забронировать место" : "Подробнее" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";

interface Place {
  id: number;
  name: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  zoneId: number;
}

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  maxPlaces: number;
  places?: Place[];
}

const props = defineProps<{
  zone: Zone;
}>();

const router = useRouter();

const availablePlaces = computed(() => {
  return (
    props.zone.places?.filter((place) => place.status === "AVAILABLE").length ||
    0
  );
});

const occupiedPlaces = computed(() => {
  return (
    props.zone.places?.filter((place) => place.status === "OCCUPIED").length ||
    0
  );
});

const hasAvailablePlaces = computed(() => {
  return availablePlaces.value > 0;
});

const viewZone = () => {
  router.push(`/zones/${props.zone.id}`);
};
</script>
