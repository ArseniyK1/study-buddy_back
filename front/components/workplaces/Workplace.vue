<template>
  <div class="relative group" @click="navigateToWorkplace">
    <!-- Main Circle -->
    <div
      class="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
      :class="{
        'bg-green-500/20 hover:bg-green-500/30': status === 'AVAILABLE',
        'bg-red-500/20 hover:bg-red-500/30': status === 'BOOKED',
        'bg-yellow-500/20 hover:bg-yellow-500/30': status === 'MAINTENANCE',
      }"
    >
      <svg
        class="w-8 h-8"
        :class="{
          'text-green-500': status === 'AVAILABLE',
          'text-red-500': status === 'BOOKED',
          'text-yellow-500': status === 'MAINTENANCE',
        }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    </div>

    <!-- Hover Info Card -->
    <div
      class="absolute z-10 hidden group-hover:block bg-gray-800 rounded-lg shadow-lg p-4 w-64 -left-32 top-16 border border-gray-700"
    >
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-200">{{ name }}</h3>
          <span
            class="px-2 py-1 text-xs rounded-full"
            :class="{
              'bg-green-500/20 text-green-400': status === 'AVAILABLE',
              'bg-red-500/20 text-red-400': status === 'BOOKED',
              'bg-yellow-500/20 text-yellow-400': status === 'MAINTENANCE',
            }"
          >
            {{ statusText }}
          </span>
        </div>

        <div v-if="image" class="w-full h-32 rounded-lg overflow-hidden">
          <img :src="image" :alt="name" class="w-full h-full object-cover" />
        </div>

        <p v-if="description" class="text-sm text-gray-400">
          {{ description }}
        </p>

        <div class="flex justify-end">
          <button
            class="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            @click.stop="navigateToWorkplace"
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  id: number;
  name: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  zoneId: number;
  description?: string;
  image?: string;
}>();

const router = useRouter();

const statusText = computed(() => {
  switch (props.status) {
    case "AVAILABLE":
      return "Свободно";
    case "BOOKED":
      return "Занято";
    case "MAINTENANCE":
      return "На обслуживании";
    default:
      return "";
  }
});

const navigateToWorkplace = () => {
  router.push(`/zones/${props.zoneId}/place/${props.id}`);
};
</script>
