<!-- GanttChart.vue -->
<template>
  <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
    <h2 class="text-xl font-semibold text-gray-200 mb-6">Расписание мест</h2>

    <div class="overflow-x-auto">
      <div class="min-w-max">
        <!-- Time header -->
        <div class="flex mb-2">
          <div class="w-64"></div>
          <div class="flex-grow flex">
            <div
              v-for="hour in hours"
              :key="hour"
              class="flex-1 text-center text-sm text-gray-400 border-b border-gray-600 pb-1"
            >
              {{ formatTime(hour) }}
            </div>
          </div>
        </div>

        <!-- Workplace rows -->
        <PlaceRow
          v-for="place in places"
          :key="place.id"
          :place="place"
          :hours="hours"
          :is-selecting="isSelecting"
          :selection-start="selectionStart"
          :current-booking="currentBooking"
          @select="handlePlaceSelect"
          @select-end="handlePlaceSelectEnd"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import PlaceRow from "./PlaceRow.vue";

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
  startTime?: string; // Опционально, если нужно
  endTime?: string; // Опционально, если нужно
}

interface CurrentBooking {
  placeId: number | null;
  startTime: number | null;
  endTime: number | null;
}

const props = defineProps<{
  places: Place[];
  hours: number[];
  currentBooking: CurrentBooking;
}>();

const emit = defineEmits<{
  (e: "placeSelect", place: Place, startTime: number, endTime: number): void;
}>();

const isSelecting = ref(false);
const selectionStart = ref<number | null>(null);
const selectedPlace = ref<Place | null>(null);

const formatTime = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = time % 1 === 0.5 ? "30" : "00";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const handlePlaceSelect = (place: Place, time: number) => {
  selectedPlace.value = place;
  selectionStart.value = time;
  isSelecting.value = true;
};

const handlePlaceSelectEnd = (
  place: Place,
  startTime: number,
  endTime: number
) => {
  if (place.id === selectedPlace.value?.id) {
    emit("placeSelect", place, startTime, endTime);
    // Reset selection state
    isSelecting.value = false;
    selectionStart.value = null;
    selectedPlace.value = null;
  }
};
</script>
