<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading Spinner for Workplace -->
      <div v-if="!workplace.id" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <!-- Workplace Header -->
      <div
        v-else
        class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-200">
                {{ workplace.name }}
              </h1>
              <p class="mt-2 text-gray-400">{{ workplace.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Places Section -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold text-gray-200 mb-6">Места в зоне</h2>

        <InfiniteList :fetch-items="fetchPlaces" :limit="20">
          <template #default="{ items: places }">
            <WorkplaceList
              :places="places"
              :zone-id="Number(route.params.id)"
            />
          </template>
        </InfiniteList>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/services/api";
import WorkplaceList from "@/components/workplaces/WorkplaceList.vue";
import InfiniteList from "@/components/common/InfiniteList.vue";

interface Workplace {
  id: number;
  name: string;
  description: string;
  image?: string;
}

interface Place {
  id: number;
  name: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  description?: string;
  image?: string;
}

const route = useRoute();
const workplace = ref<Workplace>({} as Workplace);

const fetchPlaces = async (offset: number, limit: number) => {
  const { data } = await api.get<Place[]>(
    `/places?workplaceId=${route.params.id}&offset=${offset}&limit=${limit}`
  );
  return data;
};

onMounted(async () => {
  try {
    const { data: workplaceData } = await api.get<Workplace>(
      `/workplaces/${route.params.id}`
    );
    workplace.value = workplaceData;
  } catch (error) {
    console.error("Failed to fetch workplace data:", error);
  }
});
</script>
