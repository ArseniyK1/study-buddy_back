<!-- PlaceRow.vue -->
<template>
  <div class="flex items-stretch h-16 mb-4">
    <!-- Place info -->
    <div
      class="w-64 bg-gray-700 rounded-l-lg p-3 flex flex-col justify-center border-r border-gray-600"
      :class="{
        'bg-green-900/20': place.status === 'AVAILABLE',
        'bg-red-900/20': place.status === 'OCCUPIED',
        'bg-yellow-900/20': place.status === 'MAINTENANCE',
      }"
    >
      <h3 class="font-medium text-gray-200">{{ place.name }}</h3>
      <p class="text-xs text-gray-400 truncate">{{ place.description }}</p>
      <span
        class="mt-1 text-xs px-2 py-1 rounded-full self-start"
        :class="{
          'bg-green-500/20 text-green-400': place.status === 'AVAILABLE',
          'bg-red-500/20 text-red-400': place.status === 'OCCUPIED',
          'bg-yellow-500/20 text-yellow-400': place.status === 'MAINTENANCE',
        }"
      >
        {{
          place.status === "AVAILABLE"
            ? "Свободно"
            : place.status === "OCCUPIED"
            ? "Занято"
            : "Обслуживание"
        }}
      </span>
    </div>

    <!-- Timeline -->
    <div
      class="flex-grow relative bg-gray-700 rounded-r-lg"
      @click="handleTimelineClick"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <!-- Hour markers -->
      <div class="absolute inset-0 flex">
        <div
          v-for="hour in hours"
          :key="hour"
          class="flex-1 border-r border-gray-600"
        ></div>
      </div>

      <!-- Existing bookings -->
      <div
        v-for="booking in (place.bookings || []).filter(
          (b) =>
            parseTimeToHour(b.endTime) > hours[0] &&
            parseTimeToHour(b.startTime) < hours[hours.length - 1]
        )"
        :key="booking.id"
        class="absolute h-full bg-red-500/30"
        :style="{
          left: `${
            ((Math.max(parseTimeToHour(booking.startTime), hours[0]) -
              hours[0]) /
              hours.length) *
            100
          }%`,
          width: `${
            ((Math.min(
              parseTimeToHour(booking.endTime),
              hours[hours.length - 1] + 1
            ) -
              Math.max(parseTimeToHour(booking.startTime), hours[0])) /
              hours.length) *
            100
          }%`,
        }"
      >
        <div
          class="absolute inset-0 flex items-center justify-center text-xs text-red-200"
        >
          {{ formatTime(parseTimeToHour(booking.startTime)) }}-{{
            formatTime(parseTimeToHour(booking.endTime))
          }}
        </div>
      </div>

      <!-- Current booking preview -->
      <div
        v-if="
          isCurrentPlace &&
          currentBooking.startTime !== null &&
          currentBooking.endTime !== null
        "
        class="absolute h-full bg-indigo-500/30"
        :style="{
          left: `${
            (currentBooking.startTime - hours[0]) * (100 / hours.length)
          }%`,
          width: `${
            (currentBooking.endTime - currentBooking.startTime) *
            (100 / hours.length)
          }%`,
        }"
      >
        <div
          class="absolute inset-0 flex items-center justify-center text-xs text-indigo-200"
        >
          {{ formatTime(currentBooking.startTime) }}-{{
            formatTime(currentBooking.endTime)
          }}
        </div>
      </div>

      <!-- Selection preview -->
      <div
        v-if="
          isSelecting && place.status === 'AVAILABLE' && selectionStart !== null
        "
        class="absolute h-full bg-indigo-500/20"
        :style="{
          left: `${(selectionStart - hours[0]) * (100 / hours.length)}%`,
          width: `${(currentHour - selectionStart) * (100 / hours.length)}%`,
        }"
      ></div>

      <!-- Available slots -->
      <div
        v-if="place.status === 'AVAILABLE'"
        class="absolute h-full w-full hover:bg-green-500/10 transition-colors"
      ></div>

      <!-- Mouse position indicator -->
      <div
        v-if="showMouseIndicator && place.status === 'AVAILABLE'"
        class="absolute top-0 bottom-0 w-0.5 bg-indigo-400"
        :style="{ left: `${mousePosition}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

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
  startTime: string; // Изменено с start на startTime
  endTime: string; // Изменено с end на endTime
}

interface CurrentBooking {
  placeId: number | null;
  startTime: number | null;
  endTime: number | null;
}

const props = defineProps<{
  place: Place;
  hours: number[];
  isSelecting: boolean;
  selectionStart: number | null;
  currentBooking: CurrentBooking;
}>();

const emit = defineEmits<{
  (e: "select", place: Place, time: number): void;
  (e: "selectEnd", place: Place, startTime: number, endTime: number): void;
}>();

const mousePosition = ref(0);
const showMouseIndicator = ref(false);
const currentHour = ref(0);

const isCurrentPlace = computed(() => {
  return props.currentBooking.placeId === props.place.id;
});

const formatTime = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = time % 1 === 0.5 ? "30" : "00";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
};

const handleMouseMove = (event: MouseEvent) => {
  if (props.place.status !== "AVAILABLE") return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percentage = (x / rect.width) * 100;
  mousePosition.value = percentage;

  // Calculate hour based on mouse position
  const hourIndex = Math.floor((percentage / 100) * props.hours.length);
  currentHour.value = props.hours[hourIndex];
  showMouseIndicator.value = true;
};

const handleMouseLeave = () => {
  showMouseIndicator.value = false;
};

const roundTime = (time: number): number => {
  // Round to nearest 30 minutes
  const minutes = time % 1;
  if (minutes < 0.25) return Math.floor(time);
  if (minutes < 0.75) return Math.floor(time) + 0.5;
  return Math.ceil(time);
};

const isSlotBooked = (start: number, end: number): boolean => {
  return (
    (props.place.bookings || []).some(
      (booking) =>
        start < parseTimeToHour(booking.endTime) &&
        end > parseTimeToHour(booking.startTime)
    ) ?? false
  );
};

const handleTimelineClick = (event: MouseEvent) => {
  if (props.place.status !== "AVAILABLE") return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percentage = (x / rect.width) * 100;

  // Calculate hour based on click position
  const hourIndex = Math.floor((percentage / 100) * props.hours.length);
  const clickedHour = props.hours[hourIndex];
  const roundedTime = roundTime(clickedHour);

  if (!props.isSelecting) {
    // Start selection только если не попадаем в занятый слот
    if (!isSlotBooked(roundedTime, roundedTime + 0.5)) {
      emit("select", props.place, roundedTime);
    }
  } else if (props.selectionStart !== null) {
    // End selection
    const startTime = Math.min(props.selectionStart, roundedTime);
    const endTime = Math.max(props.selectionStart, roundedTime);

    // Validate against existing bookings
    if (!isSlotBooked(startTime, endTime) && endTime > startTime) {
      emit("selectEnd", props.place, startTime, endTime);
    }
  }
};

const parseTimeToHour = (isoString: string) => {
  const date = new Date(isoString);
  return date.getUTCHours() + date.getUTCMinutes() / 60;
};
</script>
