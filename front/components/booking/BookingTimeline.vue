<template>
  <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
    <div class="relative">
      <!-- Title with tooltip -->
      <div class="flex items-center gap-2 mb-6">
        <h2 class="text-xl font-semibold text-gray-200">
          Расписание бронирований
        </h2>
        <div class="relative group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-400 cursor-help"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>
          <div
            class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 text-gray-200 text-sm rounded-lg shadow-lg border border-gray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
          >
            <p class="font-medium mb-2">Выберите время бронирования:</p>
            <ol class="list-decimal list-inside space-y-1">
              <li>Кликните для выбора времени начала</li>
              <li>Кликните для выбора времени окончания</li>
              <li>Нажмите на выбранное время для точной настройки</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Time markers -->
        <div class="flex justify-between mb-2">
          <span
            v-for="time in timeMarkers"
            :key="time"
            class="text-sm text-gray-400"
          >
            {{ time }}
          </span>
        </div>

        <!-- Progress bar container -->
        <div
          class="h-8 bg-gray-700 rounded-full overflow-hidden relative cursor-pointer"
          @click="handleTimelineClick"
          ref="timelineRef"
        >
          <!-- Available slots -->
          <div
            v-for="(slot, index) in availableSlots"
            :key="index"
            class="absolute h-full bg-green-800 hover:bg-green-500/30 transition-colors"
            :style="{
              left: `${slot.start}%`,
              width: `${slot.width}%`,
            }"
          ></div>

          <!-- Booked slots -->
          <div
            v-for="booking in allBookings"
            :key="booking.id"
            class="absolute h-full bg-red-500/20"
            :style="{
              left: `${getBookingPosition(booking.startTime)}%`,
              width: `${getBookingWidth(booking.startTime, booking.endTime)}%`,
            }"
          >
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs text-red-400">
                {{ formatBookingTime(booking.startTime, booking.endTime) }}
              </span>
            </div>
          </div>

          <!-- Selection range -->
          <div
            v-if="selectionStart"
            class="absolute h-full bg-indigo-500/20"
            :class="{ 'cursor-pointer hover:bg-indigo-500/30': isAdjusting }"
            :style="{
              left: `${getTimePosition(selectionStart)}%`,
              width: `${selectionWidth}%`,
            }"
            @click="handleSelectionClick"
          >
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs text-indigo-400">
                {{ formatSelectionTime() }}
              </span>
            </div>
            <!-- Selection frame -->
            <div
              v-if="isAdjusting"
              class="absolute inset-0 border-2 border-indigo-500 rounded-lg"
            ></div>
          </div>

          <!-- Selection markers -->
          <div
            v-if="selectionStart"
            class="absolute h-full w-1 bg-indigo-500 cursor-pointer hover:w-2 transition-all"
            :class="{
              'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-700':
                isAdjustingStart,
            }"
            :style="{ left: `${getTimePosition(selectionStart)}%` }"
            @click="startAdjusting('start')"
          ></div>
          <div
            v-if="selectionEnd"
            class="absolute h-full w-1 bg-indigo-500 cursor-pointer hover:w-2 transition-all"
            :class="{
              'ring-2 ring-indigo-500 ring-offset-2 ring-offset-gray-700':
                isAdjustingEnd,
            }"
            :style="{ left: `${getTimePosition(selectionEnd)}%` }"
            @click="startAdjusting('end')"
          ></div>
        </div>

        <!-- Selection info -->
        <div v-if="selectionStart" class="mt-4 space-y-2">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-400">Начало:</span>
            <span
              class="text-indigo-400 cursor-pointer hover:text-indigo-300"
              :class="{
                'ring-2 ring-indigo-500 rounded px-2': isAdjustingStart,
              }"
              @click="startAdjusting('start')"
            >
              {{ formatFullTime(selectionStart) }}
            </span>
          </div>
          <div
            v-if="selectionEnd"
            class="flex justify-between items-center text-sm"
          >
            <span class="text-gray-400">Конец:</span>
            <span
              class="text-indigo-400 cursor-pointer hover:text-indigo-300"
              :class="{ 'ring-2 ring-indigo-500 rounded px-2': isAdjustingEnd }"
              @click="startAdjusting('end')"
            >
              {{ formatFullTime(selectionEnd) }}
            </span>
          </div>
          <div
            v-if="selectionEnd"
            class="flex justify-between items-center text-sm"
          >
            <span class="text-gray-400">Длительность:</span>
            <span class="text-indigo-400">{{ formatDuration() }}</span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-4 text-sm text-gray-400 hidden">
          <p>Выберите время бронирования:</p>
          <p>1. Кликните для выбора времени начала</p>
          <p>2. Кликните для выбора времени окончания</p>
          <p>3. Нажмите на выбранное время для точной настройки</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  format,
  parseISO,
  differenceInHours,
  differenceInMinutes,
  addDays,
} from "date-fns";
import { ru } from "date-fns/locale";

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
}

const props = defineProps<{
  bookings: Booking[];
  selectedDate: string;
}>();

const emit = defineEmits<{
  (e: "time-selected", startTime: Date, endTime: Date): void;
}>();

const timelineRef = ref<HTMLElement | null>(null);
const selectionStart = ref<Date | null>(null);
const selectionEnd = ref<Date | null>(null);

const isAdjusting = ref(false);
const isAdjustingStart = ref(false);
const isAdjustingEnd = ref(false);
const adjustmentType = ref<"start" | "end" | null>(null);

// Time markers for the timeline (9:00 - 21:00)
const timeMarkers = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
];

// Get all bookings for the selected date
const allBookings = computed(() => {
  const selectedDateStart = new Date(props.selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  const selectedDateEnd = new Date(selectedDateStart);
  selectedDateEnd.setHours(23, 59, 59, 999);

  return props.bookings.filter((booking) => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);

    // Convert to local date for comparison
    const localBookingStart = new Date(
      bookingStart.getTime() + bookingStart.getTimezoneOffset() * 60000
    );
    const localBookingEnd = new Date(
      bookingEnd.getTime() + bookingEnd.getTimezoneOffset() * 60000
    );

    return (
      localBookingStart <= selectedDateEnd &&
      localBookingEnd >= selectedDateStart
    );
  });
});

// Calculate available time slots
const availableSlots = computed(() => {
  const slots = [];
  const selectedDate = new Date(props.selectedDate);
  selectedDate.setHours(9, 0, 0, 0); // Start at 9:00
  const endTime = new Date(selectedDate);
  endTime.setHours(21, 0, 0, 0); // End at 21:00

  // Sort bookings by start time
  const sortedBookings = [...allBookings.value].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  let lastEndTime = selectedDate;

  for (const booking of sortedBookings) {
    const bookingStart = convertToLocalTime(booking.startTime);
    const bookingEnd = convertToLocalTime(booking.endTime);

    // Only consider CONFIRMED and PENDING bookings for blocking time slots
    if (booking.status === "CONFIRMED" || booking.status === "PENDING") {
      // Handle overnight bookings
      if (bookingEnd < bookingStart) {
        // If booking ends the next day, we only care about the part that's in the current day
        if (bookingStart > lastEndTime) {
          slots.push({
            start: getTimePosition(lastEndTime),
            width: getTimePosition(bookingStart) - getTimePosition(lastEndTime),
          });
        }
        lastEndTime = endTime; // Mark the rest of the day as booked
      } else {
        // Normal booking within the same day
        if (bookingStart > lastEndTime) {
          slots.push({
            start: getTimePosition(lastEndTime),
            width: getTimePosition(bookingStart) - getTimePosition(lastEndTime),
          });
        }
        lastEndTime = bookingEnd;
      }
    }
  }

  // Add final slot if there's time remaining
  if (lastEndTime < endTime) {
    slots.push({
      start: getTimePosition(lastEndTime),
      width: 100 - getTimePosition(lastEndTime),
    });
  }

  return slots;
});

// Calculate selection width
const selectionWidth = computed(() => {
  if (!selectionStart.value || !selectionEnd.value) return 0;
  return (
    getTimePosition(selectionEnd.value) - getTimePosition(selectionStart.value)
  );
});

// Helper function to convert UTC time to local time
const convertToLocalTime = (utcTime: string | Date) => {
  const date = new Date(utcTime);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

// Helper function to calculate position percentage based on time
const getTimePosition = (time: Date) => {
  const selectedDate = new Date(props.selectedDate);
  const startTime = new Date(selectedDate);
  startTime.setHours(9, 0, 0, 0);
  const endTime = new Date(selectedDate);
  endTime.setHours(21, 0, 0, 0);

  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  const currentMinutes = (time.getTime() - startTime.getTime()) / (1000 * 60);

  return Math.max(0, Math.min(100, (currentMinutes / totalMinutes) * 100));
};

// Helper function to get booking position
const getBookingPosition = (startTime: string) => {
  const localTime = convertToLocalTime(startTime);
  return getTimePosition(localTime);
};

// Helper function to calculate booking width
const getBookingWidth = (startTime: string, endTime: string) => {
  const localStart = convertToLocalTime(startTime);
  const localEnd = convertToLocalTime(endTime);
  return getTimePosition(localEnd) - getTimePosition(localStart);
};

// Format booking time for display
const formatBookingTime = (startTime: string, endTime: string) => {
  const localStart = convertToLocalTime(startTime);
  const localEnd = convertToLocalTime(endTime);
  const start = format(localStart, "HH:mm", { locale: ru });
  const end = format(localEnd, "HH:mm", { locale: ru });
  return `${start}-${end}`;
};

// Format full time with date
const formatFullTime = (time: Date) => {
  return format(time, "d MMMM, HH:mm", { locale: ru });
};

// Format selection time range
const formatSelectionTime = () => {
  if (!selectionStart.value) return "";
  if (!selectionEnd.value)
    return format(selectionStart.value, "HH:mm", { locale: ru });
  return `${format(selectionStart.value, "HH:mm", { locale: ru })} - ${format(
    selectionEnd.value,
    "HH:mm",
    { locale: ru }
  )}`;
};

// Format duration
const formatDuration = () => {
  if (!selectionStart.value || !selectionEnd.value) return "";
  const hours = differenceInHours(selectionEnd.value, selectionStart.value);
  const minutes =
    differenceInMinutes(selectionEnd.value, selectionStart.value) % 60;
  if (hours === 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
};

// Handle selection click for adjustment
const handleSelectionClick = () => {
  if (!selectionStart.value || !selectionEnd.value) return;

  isAdjusting.value = true;
  isAdjustingStart.value = true;
  isAdjustingEnd.value = false;
  adjustmentType.value = "start";
};

// Start adjusting specific time
const startAdjusting = (type: "start" | "end") => {
  isAdjusting.value = true;
  isAdjustingStart.value = type === "start";
  isAdjustingEnd.value = type === "end";
  adjustmentType.value = type;
};

// Handle timeline click
const handleTimelineClick = (event: MouseEvent) => {
  if (!timelineRef.value) return;

  const rect = timelineRef.value.getBoundingClientRect();
  const clickPosition = event.clientX - rect.left;
  const percentage = (clickPosition / rect.width) * 100;

  // Convert percentage to time
  const selectedDate = new Date(props.selectedDate);
  const startTime = new Date(selectedDate);
  startTime.setHours(9, 0, 0, 0);
  const endTime = new Date(selectedDate);
  endTime.setHours(21, 0, 0, 0);

  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  const selectedMinutes = (percentage / 100) * totalMinutes;

  const newTime = new Date(startTime.getTime() + selectedMinutes * 60 * 1000);

  // Check if the selected time is in an available slot
  const isAvailable = availableSlots.value.some((slot) => {
    const slotStart = new Date(
      startTime.getTime() + (slot.start / 100) * totalMinutes * 60 * 1000
    );
    const slotEnd = new Date(
      slotStart.getTime() + (slot.width / 100) * totalMinutes * 60 * 1000
    );
    return newTime >= slotStart && newTime <= slotEnd;
  });

  // Also check if the time is not in any confirmed or pending booking
  const isNotBooked = !allBookings.value.some((booking) => {
    if (booking.status !== "CONFIRMED" && booking.status !== "PENDING")
      return false;

    const bookingStart = convertToLocalTime(booking.startTime);
    const bookingEnd = convertToLocalTime(booking.endTime);

    // Handle overnight bookings
    if (bookingEnd < bookingStart) {
      return newTime >= bookingStart || newTime <= bookingEnd;
    }

    return newTime >= bookingStart && newTime <= bookingEnd;
  });

  if (!isAvailable || !isNotBooked) return;

  if (isAdjusting.value && adjustmentType.value) {
    // Adjusting existing selection
    if (adjustmentType.value === "start") {
      // Check if new start time would overlap with any booking
      const wouldOverlap = allBookings.value.some((booking) => {
        if (booking.status !== "CONFIRMED" && booking.status !== "PENDING")
          return false;
        if (!selectionEnd.value) return false;

        const bookingStart = convertToLocalTime(booking.startTime);
        const bookingEnd = convertToLocalTime(booking.endTime);

        // Handle overnight bookings
        if (bookingEnd < bookingStart) {
          return (
            (newTime >= bookingStart || newTime <= bookingEnd) &&
            (selectionEnd.value >= bookingStart ||
              selectionEnd.value <= bookingEnd)
          );
        }

        return (
          (newTime >= bookingStart && newTime <= bookingEnd) ||
          (selectionEnd.value >= bookingStart &&
            selectionEnd.value <= bookingEnd) ||
          (newTime <= bookingStart && selectionEnd.value >= bookingEnd)
        );
      });

      if (wouldOverlap) return;

      if (newTime < (selectionEnd.value || newTime)) {
        selectionStart.value = newTime;
      } else {
        // Swap if new start time is after end time
        selectionStart.value = selectionEnd.value;
        selectionEnd.value = newTime;
      }
    } else {
      // Check if new end time would overlap with any booking
      const wouldOverlap = allBookings.value.some((booking) => {
        if (booking.status !== "CONFIRMED" && booking.status !== "PENDING")
          return false;
        if (!selectionStart.value) return false;

        const bookingStart = convertToLocalTime(booking.startTime);
        const bookingEnd = convertToLocalTime(booking.endTime);

        // Handle overnight bookings
        if (bookingEnd < bookingStart) {
          return (
            (selectionStart.value >= bookingStart ||
              selectionStart.value <= bookingEnd) &&
            (newTime >= bookingStart || newTime <= bookingEnd)
          );
        }

        return (
          (selectionStart.value >= bookingStart &&
            selectionStart.value <= bookingEnd) ||
          (newTime >= bookingStart && newTime <= bookingEnd) ||
          (selectionStart.value <= bookingStart && newTime >= bookingEnd)
        );
      });

      if (wouldOverlap) return;

      if (newTime > (selectionStart.value || newTime)) {
        selectionEnd.value = newTime;
      } else {
        // Swap if new end time is before start time
        selectionEnd.value = selectionStart.value;
        selectionStart.value = newTime;
      }
    }

    // Reset adjustment state
    isAdjusting.value = false;
    isAdjustingStart.value = false;
    isAdjustingEnd.value = false;
    adjustmentType.value = null;

    // Emit updated times
    if (selectionStart.value && selectionEnd.value) {
      emit("time-selected", selectionStart.value, selectionEnd.value);
    }
  } else {
    // Normal selection flow
    if (!selectionStart.value) {
      // First click - set start time
      selectionStart.value = newTime;
      selectionEnd.value = null;
    } else if (!selectionEnd.value) {
      // Second click - set end time
      // Check if the selected range would overlap with any booking
      const wouldOverlap = allBookings.value.some((booking) => {
        if (booking.status !== "CONFIRMED" && booking.status !== "PENDING")
          return false;

        const bookingStart = convertToLocalTime(booking.startTime);
        const bookingEnd = convertToLocalTime(booking.endTime);

        // Handle overnight bookings
        if (bookingEnd < bookingStart) {
          return (
            (selectionStart.value! >= bookingStart ||
              selectionStart.value! <= bookingEnd) &&
            (newTime >= bookingStart || newTime <= bookingEnd)
          );
        }

        return (
          (selectionStart.value! >= bookingStart &&
            selectionStart.value! <= bookingEnd) ||
          (newTime >= bookingStart && newTime <= bookingEnd) ||
          (selectionStart.value! <= bookingStart && newTime >= bookingEnd)
        );
      });

      if (wouldOverlap) {
        // Reset selection if it would overlap
        selectionStart.value = null;
        return;
      }

      if (newTime > selectionStart.value) {
        selectionEnd.value = newTime;
        emit("time-selected", selectionStart.value, selectionEnd.value);
      } else {
        // If end time is before start time, swap them
        selectionEnd.value = selectionStart.value;
        selectionStart.value = newTime;
        emit("time-selected", selectionStart.value, selectionEnd.value);
      }
    } else {
      // Third click - reset selection
      selectionStart.value = newTime;
      selectionEnd.value = null;
    }
  }
};
</script>
