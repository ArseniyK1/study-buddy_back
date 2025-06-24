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
      <!-- Hour markers -->
      <div class="absolute inset-0 flex">
        <div
          v-for="day in days"
          :key="day.date"
          class="flex-1 border-r border-gray-600"
        >
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-full border-r border-gray-600"
          ></div>
        </div>
      </div>

      <!-- Existing bookings -->
      <div
        v-for="booking in filteredBookings"
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
import { parseISO, format, isWithinInterval } from "date-fns";

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

  const startDate = props.days[0].date;
  const endDate = props.days[props.days.length - 1].date;

  return props.place.bookings.filter((booking) => {
    const bookingStart = booking.startTime.split("T")[0];
    const bookingEnd = booking.endTime.split("T")[0];

    return (
      (bookingStart >= startDate && bookingStart <= endDate) ||
      (bookingEnd >= startDate && bookingEnd <= endDate) ||
      (bookingStart <= startDate && bookingEnd >= endDate)
    );
  });
});

const getBookingStyle = (booking: Booking) => {
  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);

  const rangeStart = parseISO(props.days[0].date);
  const rangeEnd = parseISO(props.days[props.days.length - 1].date);
  rangeEnd.setHours(23, 59, 59, 999);

  // Adjust booking to visible range
  const visibleStart = start < rangeStart ? rangeStart : start;
  const visibleEnd = end > rangeEnd ? rangeEnd : end;

  // Calculate position
  const totalDays = props.days.length;
  const totalHours = totalDays * 24;

  const startOffset = (visibleStart - rangeStart) / (1000 * 60 * 60);
  const endOffset = (visibleEnd - rangeStart) / (1000 * 60 * 60);

  const left = (startOffset / totalHours) * 100;
  const width = ((endOffset - startOffset) / totalHours) * 100;

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
};

const getCurrentBookingStyle = () => {
  if (!props.currentBooking.startTime || !props.currentBooking.endTime)
    return {};

  const startDate = props.currentBooking.startTime.date;
  const startHour = props.currentBooking.startTime.hour;
  const endDate = props.currentBooking.endTime.date;
  const endHour = props.currentBooking.endTime.hour;

  const rangeStart = parseISO(props.days[0].date);
  const rangeEnd = parseISO(props.days[props.days.length - 1].date);
  rangeEnd.setHours(23, 59, 59, 999);

  // Calculate position
  const totalDays = props.days.length;
  const totalHours = totalDays * 24;

  const startTime = new Date(`${startDate}T${startHour}:00:00`);
  const endTime = new Date(`${endDate}T${endHour}:00:00`);

  const startOffset = (startTime - rangeStart) / (1000 * 60 * 60);
  const endOffset = (endTime - rangeStart) / (1000 * 60 * 60);

  const left = (startOffset / totalHours) * 100;
  const width = ((endOffset - startOffset) / totalHours) * 100;

  return {
    left: `${left}%`,
    width: `${width}%`,
  };
};

const handleTimelineClick = (event: MouseEvent) => {
  if (props.place.status !== "AVAILABLE") return;

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const totalWidth = rect.width;

  // Calculate day and hour
  const dayIndex = Math.floor((x / totalWidth) * props.days.length);
  const dayWidth = totalWidth / props.days.length;
  const hour = Math.floor(((x - dayIndex * dayWidth) / dayWidth) * 24);

  const selectedDate = props.days[dayIndex].date;

  if (!isCurrentPlace.value) {
    emit(
      "place-select",
      props.place,
      { date: selectedDate, hour },
      { date: selectedDate, hour: hour + 1 }
    );
  } else {
    // Subsequent clicks - update end time
    const startDate = props.currentBooking.startTime!.date;
    const startHour = props.currentBooking.startTime!.hour;

    // Determine if we're selecting same day or different day
    if (selectedDate === startDate) {
      const newEndHour = hour > startHour ? hour : startHour + 1;
      emit("place-select", props.place, props.currentBooking.startTime!, {
        date: startDate,
        hour: newEndHour,
      });
    } else {
      // Different day - set end time to selected hour
      emit("place-select", props.place, props.currentBooking.startTime!, {
        date: selectedDate,
        hour: hour,
      });
    }
  }
};
</script>
