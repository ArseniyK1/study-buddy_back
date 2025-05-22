<!-- BookingForm.vue -->
<template>
  <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 mt-6">
    <h2 class="text-xl font-semibold text-gray-200 mb-4">
      Бронирование места "{{ place.name }}"
    </h2>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1">
          Начало
        </label>
        <select
          :value="startTime"
          @input="
            $emit(
              'update:startTime',
              Number(($event.target as HTMLSelectElement).value)
            )
          "
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
        >
          <option
            v-for="time in availableTimes"
            :key="time"
            :value="time"
            :disabled="isTimeDisabled(time, 'start')"
          >
            {{ formatTime(time) }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-400 mb-1">
          Конец
        </label>
        <select
          :value="endTime"
          @input="
            $emit(
              'update:endTime',
              Number(($event.target as HTMLSelectElement).value)
            )
          "
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
        >
          <option
            v-for="time in availableTimes"
            :key="time"
            :value="time"
            :disabled="isTimeDisabled(time, 'end')"
          >
            {{ formatTime(time) }}
          </option>
        </select>
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
      class="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
      :disabled="!canBook"
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
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  zoneId: number;
  bookings?: Booking[];
}

interface Booking {
  id: number;
  start: number;
  end: number;
}

const props = defineProps<{
  place: Place;
  startTime: number;
  endTime: number;
  pricePerHour: number;
  availableTimes: number[];
}>();

defineEmits<{
  (e: "update:startTime", value: number): void;
  (e: "update:endTime", value: number): void;
  (e: "book"): void;
}>();

const formatTime = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = time % 1 === 0.5 ? "30" : "00";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const isTimeDisabled = (time: number, type: "start" | "end"): boolean => {
  if (type === "start") {
    return time >= props.endTime || hasOverlap(time, props.endTime);
  } else {
    return time <= props.startTime || hasOverlap(props.startTime, time);
  }
};

const hasOverlap = (start: number, end: number): boolean => {
  return (
    props.place.bookings?.some(
      (booking) => start < booking.end && end > booking.start
    ) ?? false
  );
};

const canBook = computed(() => {
  return (
    props.place.status === "AVAILABLE" &&
    props.startTime < props.endTime &&
    !hasOverlap(props.startTime, props.endTime)
  );
});

const calculatePrice = (): string => {
  const hours = props.endTime - props.startTime;
  return (hours * props.pricePerHour).toFixed(2);
};
</script>
