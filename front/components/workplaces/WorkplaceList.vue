<template>
  <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
    <h2 class="text-xl font-semibold text-gray-200 mb-6">Планировка зала</h2>

    <!-- Loading Spinner for Places -->
    <div v-if="!places.length" class="flex justify-center items-center h-32">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"
      ></div>
    </div>

    <!-- Circular Layout -->
    <div v-else class="relative w-full aspect-square max-w-2xl mx-auto">
      <!-- Center Circle -->
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center"
      >
        <span class="text-gray-400 text-sm">Центр зала</span>
      </div>

      <!-- Workplaces -->
      <div
        v-for="(place, index) in places"
        :key="place.id"
        class="absolute"
        :style="getWorkplacePosition(index, places.length)"
      >
        <Workplace
          :id="place.id"
          :name="place.name"
          :status="place.status"
          :zone-id="zoneId"
          :description="place.description"
          :image="place.image"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Workplace from "@/components/workplaces/Workplace.vue";

interface Place {
  id: number;
  name: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  description?: string;
  image?: string;
}

defineProps<{
  places: Place[];
  zoneId: number;
}>();

// Calculate position for each workplace in a circle
const getWorkplacePosition = (index: number, total: number) => {
  const radius = 200; // Distance from center
  const angle = (index * 2 * Math.PI) / total;

  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: "translate(-50%, -50%)",
  };
};
</script>
