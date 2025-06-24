<template>
  <div class="flex items-stretch h-16 mb-4">
    <!-- Place info column -->
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

    <!-- Timeline -->
    <div
      class="flex-grow relative bg-gray-700 rounded-r-lg"
      @click="handleTimelineClick"
    >
      <!-- Hour markers with borders -->
      <div class="absolute inset-0 flex">
        <div
          v-for="hour in hours"
          :key="hour"
          class="flex-1 border-r border-gray-600"
        ></div>
      </div>

      <!-- Existing bookings -->
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="absolute h-full bg-red-500/40 rounded-sm"
        :style="getBookingStyle(booking)"
      >
        <div class="absolute inset-0 border-l-2 border-red-600"></div>
        <div class="absolute inset-0 border-r-2 border-red-600"></div>
      </div>

      <!-- Current booking selection -->
      <div
        v-if="isCurrentPlace && currentBooking.startTime"
        class="absolute h-full bg-indigo-500/40 rounded-sm"
        :style="getCurrentBookingStyle()"
      >
        <div class="absolute inset-0 border-l-2 border-indigo-400"></div>
        <div class="absolute inset-0 border-r-2 border-indigo-400"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { parseISO, isWithinInterval, addMinutes } from "date-fns";

interface Place {
  id: number;
  name: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  bookings?: Booking[];
}

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
}

interface Day {
  date: string;
  label: string;
}

const props = defineProps<{
  place: Place;
  hours: number[];
  days: Day[];
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

const filteredBookings = computed(() => {
  if (!props.place.bookings) return [];

  const rangeStart = parseISO(props.days[0].date);
  const rangeEnd = addMinutes(
    parseISO(props.days[props.days.length - 1].date),
    1439
  ); // 23:59

  return props.place.bookings.filter((booking) => {
    const bookingStart = parseISO(booking.startTime);
    const bookingEnd = parseISO(booking.endTime);

    return (
      isWithinInterval(bookingStart, { start: rangeStart, end: rangeEnd }) ||
      isWithinInterval(bookingEnd, { start: rangeStart, end: rangeEnd }) ||
      (bookingStart < rangeStart && bookingEnd > rangeEnd)
    );
  });
});

const getBookingStyle = (booking: Booking) => {
  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);
  const rangeStart = parseISO(props.days[0].date);
  const rangeEnd = addMinutes(
    parseISO(props.days[props.days.length - 1].date),
    1439
  );

  // Adjust to visible range
  const visibleStart = start < rangeStart ? rangeStart : start;
  const visibleEnd = end > rangeEnd ? rangeEnd : end;

  // Calculate total visible time range in milliseconds
  const totalRange = rangeEnd - rangeStart;
  const startOffset = visibleStart - rangeStart;
  const duration = visibleEnd - visibleStart;

  return {
    left: `${(startOffset / totalRange) * 100}%`,
    width: `${(duration / totalRange) * 100}%`,
  };
};

const getCurrentBookingStyle = () => {
  if (!props.currentBooking.startTime || !props.currentBooking.endTime)
    return {};

  const start = new Date(
    `${props.currentBooking.startTime.date}T${String(
      props.currentBooking.startTime.hour
    ).padStart(2, "0")}:00:00`
  );
  const end = new Date(
    `${props.currentBooking.endTime.date}T${String(
      props.currentBooking.endTime.hour
    ).padStart(2, "0")}:00:00`
  );
  const rangeStart = parseISO(props.days[0].date);
  const rangeEnd = addMinutes(
    parseISO(props.days[props.days.length - 1].date),
    1439
  );

  const totalRange = rangeEnd - rangeStart;
  const startOffset = start - rangeStart;
  const duration = end - start;

  return {
    left: `${(startOffset / totalRange) * 100}%`,
    width: `${(duration / totalRange) * 100}%`,
  };
};

const handleTimelineClick = (event: MouseEvent) => {
  if (props.place.status !== "AVAILABLE") return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const totalWidth = rect.width;

  // Calculate day and hour
  const dayIndex = Math.min(
    Math.floor((x / totalWidth) * props.days.length),
    props.days.length - 1
  );
  const dayWidth = totalWidth / props.days.length;
  const hour = Math.min(
    Math.floor(((x - dayIndex * dayWidth) / dayWidth) * 24),
    23
  );

  const selectedDate = props.days[dayIndex].date;

  if (!isCurrentPlace.value) {
    // First click - select place and set start time
    emit(
      "place-select",
      props.place,
      { date: selectedDate, hour },
      { date: selectedDate, hour: hour + 1 }
    );
  } else {
    // Subsequent clicks - update end time
    const startDate = props.currentBooking.startTime!.date;
    const newEndHour =
      hour > props.currentBooking.startTime!.hour
        ? hour
        : props.currentBooking.startTime!.hour + 1;

    emit("place-select", props.place, props.currentBooking.startTime!, {
      date: selectedDate,
      hour: newEndHour,
    });
  }
};
</script>
