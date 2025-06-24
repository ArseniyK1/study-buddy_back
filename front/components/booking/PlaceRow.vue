<template>
  <div class="flex items-stretch h-16 mb-4">
    <!-- Place info column -->
    <div
      class="w-64 bg-gray-700 rounded-l-lg p-3 flex flex-col justify-center border-r border-gray-600 relative"
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

      <!-- Clear button -->
      <button
        v-if="isCurrentPlace && currentBooking.startTime"
        @click="clearSelection"
        class="absolute top-1 right-1 text-gray-400 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
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
import {
  parseISO,
  isWithinInterval,
  addMinutes,
  isBefore,
  isAfter,
} from "date-fns";
import { useToast } from "vue-toastification";

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
  (e: "clear-selection"): void;
}>();

const toast = useToast();

const isCurrentPlace = computed(() => {
  return props.currentBooking.placeId === props.place.id;
});

const filteredBookings = computed(() => {
  if (!props.place.bookings) return [];

  const rangeStart = new Date(props.days[0].date);
  const rangeEnd = addMinutes(
    new Date(props.days[props.days.length - 1].date),
    1439
  ); // 23:59

  return props.place.bookings.filter((booking) => {
    if (booking.status !== "ACTIVE") return false;

    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);

    return (
      isWithinInterval(bookingStart, { start: rangeStart, end: rangeEnd }) ||
      isWithinInterval(bookingEnd, { start: rangeStart, end: rangeEnd }) ||
      (bookingStart < rangeStart && bookingEnd > rangeEnd)
    );
  });
});

const getBookingStyle = (booking: Booking) => {
  // Используем UTC время без преобразования
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  const rangeStart = new Date(props.days[0].date);
  const rangeEnd = addMinutes(
    new Date(props.days[props.days.length - 1].date),
    1439
  ); // 23:59

  // Adjust to visible range
  const visibleStart = start < rangeStart ? rangeStart : start;
  const visibleEnd = end > rangeEnd ? rangeEnd : end;

  // Calculate total visible time range in milliseconds
  const totalRange = rangeEnd.getTime() - rangeStart.getTime();
  const startOffset = visibleStart.getTime() - rangeStart.getTime();
  const duration = visibleEnd.getTime() - visibleStart.getTime();

  return {
    left: `${(startOffset / totalRange) * 100}%`,
    width: `${(duration / totalRange) * 100}%`,
  };
};

const getCurrentBookingStyle = () => {
  if (!props.currentBooking.startTime || !props.currentBooking.endTime)
    return {};

  // Создаем даты в UTC
  const start = new Date(
    `${props.currentBooking.startTime.date}T${String(
      props.currentBooking.startTime.hour
    ).padStart(2, "0")}:00:00Z` // Добавляем Z для указания UTC
  );
  const end = new Date(
    `${props.currentBooking.endTime.date}T${String(
      props.currentBooking.endTime.hour
    ).padStart(2, "0")}:00:00Z` // Добавляем Z для указания UTC
  );

  const rangeStart = new Date(props.days[0].date);
  const rangeEnd = addMinutes(
    new Date(props.days[props.days.length - 1].date),
    1439
  );

  const totalRange = rangeEnd.getTime() - rangeStart.getTime();
  const startOffset = start.getTime() - rangeStart.getTime();
  const duration = end.getTime() - start.getTime();

  return {
    left: `${(startOffset / totalRange) * 100}%`,
    width: `${(duration / totalRange) * 100}%`,
  };
};

const checkTimeConflict = (start: Date, end: Date) => {
  if (!props.place.bookings) return false;

  return props.place.bookings.some((booking) => {
    if (booking.status !== "ACTIVE") return false;

    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);

    return (
      (isAfter(start, bookingStart) && isBefore(start, bookingEnd)) ||
      (isAfter(end, bookingStart) && isBefore(end, bookingEnd)) ||
      (isBefore(start, bookingStart) && isAfter(end, bookingEnd))
    );
  });
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
    const startHour = props.currentBooking.startTime!.hour;

    let newEndHour = hour;

    // Ensure end time is after start time
    if (selectedDate === startDate && hour <= startHour) {
      newEndHour = startHour + 1;
    } else if (new Date(selectedDate) < new Date(startDate)) {
      // If selected date is before start date, swap them
      emit(
        "place-select",
        props.place,
        { date: selectedDate, hour },
        { date: startDate, hour: startHour }
      );
      return;
    }

    // Создаем даты в UTC
    const startTime = new Date(
      `${startDate}T${String(startHour).padStart(2, "0")}:00:00Z`
    );
    const endTime = new Date(
      `${selectedDate}T${String(newEndHour).padStart(2, "0")}:00:00Z`
    );

    // Check for conflicts with existing bookings
    if (checkTimeConflict(startTime, endTime)) {
      toast.error(
        "Выбранный интервал пересекается с уже забронированным временем"
      );
      return;
    }

    emit("place-select", props.place, props.currentBooking.startTime!, {
      date: selectedDate,
      hour: newEndHour,
    });
  }
};

const clearSelection = () => {
  emit("clear-selection");
};
</script>
