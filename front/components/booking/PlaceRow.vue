<template>
  <div class="flex items-stretch h-16 mb-4">
    <div
      class="w-64 bg-gray-700 rounded-l-lg p-3 flex flex-col justify-center border-r border-gray-600"
      :class="{
        'bg-green-900/20': place.status === 'AVAILABLE',
        'bg-red-900/20': place.status === 'OCCUPIED',
        'bg-yellow-900/20': place.status === 'MAINTENANCE',
      }"
    >
      <h3 class="font-medium text-gray-200">{{ place.name }}</h3>
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

    <div
      class="flex-grow relative bg-gray-700 rounded-r-lg"
      @click="handleTimelineClick"
    >
      <div class="absolute inset-0 flex">
        <div
          v-for="hour in hours"
          :key="hour"
          class="flex-1 border-r border-gray-600"
        ></div>
      </div>

      <!-- Existing bookings -->
      <div
        v-for="booking in place.bookings || []"
        :key="booking.id"
        class="absolute h-full bg-red-500/30"
        :style="getBookingStyle(booking)"
      ></div>

      <!-- Current booking selection -->
      <div
        v-if="isCurrentPlace && currentBooking.startTime"
        class="absolute h-full bg-indigo-500/30"
        :style="getCurrentBookingStyle()"
      ></div>
    </div>
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
  startTime: string;
  endTime: string;
}

const props = defineProps<{
  place: Place;
  hours: number[];
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

const isCurrentPlace = computed(() => {
  return props.currentBooking.placeId === props.place.id;
});

const parseTimeToHour = (isoString: string) => {
  const date = new Date(isoString);
  return date.getHours();
};

const getBookingStyle = (booking: Booking) => {
  const startHour = parseTimeToHour(booking.startTime);
  const endHour = parseTimeToHour(booking.endTime);

  const left = (startHour / 23) * 100;
  const width = ((endHour - startHour) / 23) * 100;

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
};

const getCurrentBookingStyle = () => {
  if (!props.currentBooking.startTime || !props.currentBooking.endTime)
    return {};

  const left = (props.currentBooking.startTime.hour / 23) * 100;
  const width =
    ((props.currentBooking.endTime.hour - props.currentBooking.startTime.hour) /
      23) *
    100;

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
};

const handleTimelineClick = (event: MouseEvent) => {
  if (props.place.status !== "AVAILABLE") return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const hour = Math.floor((x / rect.width) * 24);

  if (!isCurrentPlace.value) {
    // First click - select place and set start time
    emit(
      "place-select",
      props.place,
      { date: formatDate(new Date()), hour },
      { date: formatDate(new Date()), hour: hour + 1 }
    );
  } else {
    // Subsequent clicks - update end time
    emit("place-select", props.place, props.currentBooking.startTime!, {
      date: props.currentBooking.startTime!.date,
      hour,
    });
  }
};

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0];
};
</script>
