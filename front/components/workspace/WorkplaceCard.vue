<template>
  <div
    class="w-24 h-24 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
    :class="{
      'bg-green-100 hover:bg-green-200': status === 'AVAILABLE',
      'bg-red-100 hover:bg-red-200': status === 'BOOKED',
      'bg-gray-100 hover:bg-gray-200': status === 'MAINTENANCE',
    }"
    @click="handleClick"
  >
    <div class="text-center">
      <p class="text-sm font-medium">{{ name }}</p>
      <p class="text-xs text-gray-500">{{ statusText }}</p>
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
      return "Ремонт";
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
