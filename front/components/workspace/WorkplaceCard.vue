<template>
  <div class="relative group" @click="handleClick">
    <div
      class="w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110"
      :class="{
        'bg-green-500/20 hover:bg-green-500/30': status === 'AVAILABLE',
        'bg-red-500/20 hover:bg-red-500/30': status === 'BOOKED',
        'bg-gray-500/20 hover:bg-gray-500/30': status === 'MAINTENANCE',
      }"
    >
      <svg
        class="w-8 h-8"
        :class="{
          'text-green-500': status === 'AVAILABLE',
          'text-red-500': status === 'BOOKED',
          'text-gray-500': status === 'MAINTENANCE',
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

    <!-- Tooltip -->
    <div
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-gray-200 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
    >
      <div class="font-medium">{{ name }}</div>
      <div
        class="text-xs"
        :class="{
          'text-green-400': status === 'AVAILABLE',
          'text-red-400': status === 'BOOKED',
          'text-gray-400': status === 'MAINTENANCE',
        }"
      >
        {{ statusText }}
      </div>
    </div>

    <!-- Status Indicator -->
    <div
      v-if="status !== 'AVAILABLE'"
      class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800"
      :class="{
        'bg-red-500': status === 'BOOKED',
        'bg-gray-500': status === 'MAINTENANCE',
      }"
    >
      <svg
        v-if="status === 'BOOKED'"
        class="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="status === 'MAINTENANCE'"
        class="w-2 h-2 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

interface Props {
  id: number;
  name: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  zoneId: number;
}

const props = defineProps<Props>();

const router = useRouter();

const statusText = computed(() => {
  switch (props.status) {
    case "AVAILABLE":
      return "Свободно";
    case "BOOKED":
      return "Занято";
    case "MAINTENANCE":
      return "Тех. обслуживание";
    default:
      return "";
  }
});

const handleClick = () => {
  if (props.status === "AVAILABLE") {
    router.push(`/zones/${props.zoneId}/places/${props.id}/book`);
  }
};
</script>
