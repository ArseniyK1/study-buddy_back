<template>
  <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
    <h2 class="text-xl font-semibold text-gray-200 mb-6">Расписание мест</h2>

    <div class="overflow-x-auto">
      <div class="min-w-max">
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

        <PlaceRow
          v-for="place in places"
          :key="place.id"
          :place="place"
          :hours="hours"
          :current-booking="currentBooking"
          @place-select="
            (place, start, end) => $emit('place-select', place, start, end)
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
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
  startTime: string;
  endTime: string;
}

const props = defineProps<{
  places: Place[];
  startDate: string;
  endDate: string;
  currentBooking: {
    placeId: number | null;
    startTime: { date: string; hour: number } | null;
    endTime: { date: string; hour: number } | null;
  };
}>();

const emit = defineEmits<{
  (
    e: "place-select",
    place: Place,
    start: { date: string; hour: number },
    end: { date: string; hour: number }
  ): void;
}>();

const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23

const formatTime = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};
</script>
