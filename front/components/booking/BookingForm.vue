<template>
  <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 mt-6">
    <h2 class="text-xl font-semibold text-gray-200 mb-4">
      Бронирование места "{{ place.name }}"
    </h2>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1"
          >Начало</label
        >
        <div class="bg-gray-700 px-3 py-2 rounded text-gray-200">
          {{ formatDateTime(startTime) }}
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1"
          >Конец</label
        >
        <div class="bg-gray-700 px-3 py-2 rounded text-gray-200">
          {{ formatDateTime(endTime) }}
        </div>
      </div>
    </div>

    <div class="bg-gray-700 rounded-lg p-4 mb-4">
      <div class="flex justify-between items-center">
        <span class="text-gray-400">Стоимость:</span>
        <span class="text-xl font-semibold text-indigo-400">
          {{ calculatePrice() }} ₽
        </span>
      </div>
    </div>

    <button
      @click="$emit('book')"
      class="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700"
    >
      Забронировать
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Place {
  id: number;
  name: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
}

const props = defineProps<{
  place: Place;
  startTime: { date: string; hour: number };
  endTime: { date: string; hour: number };
  pricePerHour: number;
}>();

const emit = defineEmits<{
  (e: "book"): void;
}>();

const formatDateTime = (time: { date: string; hour: number }) => {
  return `${time.date} ${time.hour.toString().padStart(2, "0")}:00`;
};

const calculatePrice = () => {
  const hours = props.endTime.hour - props.startTime.hour;
  return (hours * props.pricePerHour).toFixed(2);
};
</script>
