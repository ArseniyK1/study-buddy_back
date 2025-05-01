<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="p-6">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-medium text-gray-900">{{ zone.name }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ zone.description }}</p>
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
      <div class="mt-4">
        <button
          @click="viewZone"
          class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Забронировать место
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  places?: any[];
}

const props = defineProps<{
  zone: Zone;
}>();

const router = useRouter();

const viewZone = () => {
  router.push(`/zones/${props.zone.id}`);
};
</script>
