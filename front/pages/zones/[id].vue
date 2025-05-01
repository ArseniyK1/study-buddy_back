<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <!-- Zone Header -->
      <div class="bg-white rounded-lg shadow overflow-hidden p-6 mb-8">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ zone.name }}</h1>
            <p class="mt-2 text-gray-600">{{ zone.description }}</p>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold text-indigo-600">
              {{ zone.pricePerHour }} ₽/час
            </p>
            <p class="text-sm text-gray-500">
              {{ zone.places?.length || 0 }} мест
            </p>
          </div>
        </div>
      </div>

      <!-- Interactive Layout -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6">
          Планировка зала
        </h2>
        <div class="grid grid-cols-4 gap-4">
          <WorkplaceCard
            v-for="place in places"
            :key="place.id"
            :id="place.id"
            :name="place.name"
            :status="place.status"
            :zone-id="zone.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "~/services/api";
import WorkplaceCard from "~/components/workspace/WorkplaceCard.vue";

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  places?: any[];
}

interface Place {
  id: number;
  name: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
}

const route = useRoute();
const zone = ref<Zone>({} as Zone);
const places = ref<Place[]>([]);

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
