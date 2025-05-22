<!-- BookingTimeline.vue -->
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
              <li>Найдите свободное место на временной шкале</li>
              <li>Кликните на свободное место для начала бронирования</li>
              <li>Выберите время окончания бронирования</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- Gantt Chart Container -->
      <div class="overflow-x-auto">
        <div class="min-w-[800px]">
          <!-- Time markers -->
          <div class="flex mb-2">
            <div class="w-64 flex-shrink-0"></div>
            <div class="flex-grow flex justify-between">
              <span
                v-for="time in timeMarkers"
                :key="time"
                class="text-sm text-gray-400"
              >
                {{ time }}
              </span>
            </div>
          </div>

          <!-- Timeline grid -->
          <div class="relative">
            <!-- Grid lines -->
            <div class="absolute inset-0 flex">
              <div class="w-64 flex-shrink-0"></div>
              <div class="flex-grow grid grid-cols-12">
                <div
                  v-for="i in 12"
                  :key="i"
                  class="border-l border-gray-700"
                ></div>
              </div>
            </div>

            <!-- Workplace rows -->
            <div
              v-for="workplace in workplaces"
              :key="workplace.id"
              class="flex items-center h-16 mb-2 relative group"
            >
              <!-- Workplace info -->
              <div
                class="w-64 flex-shrink-0 p-2 bg-gray-700 rounded-l-lg h-full flex flex-col justify-center"
              >
                <div class="font-medium text-gray-200">
                  {{ workplace.name }}
                </div>
                <div class="text-sm text-gray-400">
                  {{ workplace.zone.name }}
                </div>
              </div>

              <!-- Timeline -->
              <div
                class="flex-grow h-full bg-gray-700 rounded-r-lg relative cursor-pointer"
                @click="handleTimelineClick($event, workplace)"
              >
                <!-- Available slots -->
                <div
                  v-for="(slot, index) in getAvailableSlots(workplace)"
                  :key="index"
                  class="absolute h-full bg-green-800/20 hover:bg-green-500/30 transition-colors"
                  :style="{
                    left: `${slot.start}%`,
                    width: `${slot.width}%`,
                  }"
                ></div>

                <!-- Bookings -->
                <div
                  v-for="booking in getWorkplaceBookings(workplace)"
                  :key="booking.id"
                  class="absolute h-full bg-red-500/20"
                  :style="{
                    left: `${getBookingPosition(booking.startTime)}%`,
                    width: `${getBookingWidth(
                      booking.startTime,
                      booking.endTime
                    )}%`,
                  }"
                >
                  <div
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <span class="text-xs text-red-400">
                      {{
                        formatBookingTime(booking.startTime, booking.endTime)
                      }}
                    </span>
                  </div>
                </div>

                <!-- Selection range -->
                <div
                  v-if="
                    selectionStart && selectedWorkplace?.id === workplace.id
                  "
                  class="absolute h-full bg-indigo-500/20"
                  :style="{
                    left: `${getTimePosition(selectionStart)}%`,
                    width: `${selectionWidth}%`,
                  }"
                >
                  <div
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <span class="text-xs text-indigo-400">
                      {{ formatSelectionTime() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selection info -->
      <div v-if="selectionStart" class="mt-4 space-y-2">
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-400">Место:</span>
          <span class="text-indigo-400">
            {{ selectedWorkplace?.name }} ({{ selectedWorkplace?.zone.name }})
          </span>
        </div>
        <div class="flex justify-between items-center text-sm">
          <span class="text-gray-400">Начало:</span>
          <span class="text-indigo-400">
            {{ formatFullTime(selectionStart) }}
          </span>
        </div>
        <div
          v-if="selectionEnd"
          class="flex justify-between items-center text-sm"
        >
          <span class="text-gray-400">Конец:</span>
          <span class="text-indigo-400">
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
} from "date-fns";
import { ru } from "date-fns/locale";

interface Workplace {
  id: number;
  name: string;
  zone: {
    id: number;
    name: string;
  };
  bookings: Booking[];
}

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
}

const props = defineProps<{
  workplaces: Workplace[];
  selectedDate: string;
}>();

const emit = defineEmits<{
  (
    e: "time-selected",
    workplaceId: number,
    startTime: Date,
    endTime: Date
  ): void;
}>();

const selectionStart = ref<Date | null>(null);
const selectionEnd = ref<Date | null>(null);
const selectedWorkplace = ref<Workplace | null>(null);

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

// Get bookings for a specific workplace
const getWorkplaceBookings = (workplace: Workplace) => {
  const selectedDateStart = new Date(props.selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  const selectedDateEnd = new Date(selectedDateStart);
  selectedDateEnd.setHours(23, 59, 59, 999);

  return workplace.bookings.filter((booking) => {
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
};

// Calculate available slots for a workplace
const getAvailableSlots = (workplace: Workplace) => {
  const slots = [];
  const selectedDate = new Date(props.selectedDate);
  selectedDate.setHours(9, 0, 0, 0); // Start at 9:00
  const endTime = new Date(selectedDate);
  endTime.setHours(21, 0, 0, 0); // End at 21:00

  // Sort bookings by start time
  const sortedBookings = [...getWorkplaceBookings(workplace)].sort(
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
};

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

// Handle timeline click
const handleTimelineClick = (event: MouseEvent, workplace: Workplace) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
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
  const availableSlots = getAvailableSlots(workplace);
  const isAvailable = availableSlots.some((slot) => {
    const slotStart = new Date(
      startTime.getTime() + (slot.start / 100) * totalMinutes * 60 * 1000
    );
    const slotEnd = new Date(
      slotStart.getTime() + (slot.width / 100) * totalMinutes * 60 * 1000
    );
    return newTime >= slotStart && newTime <= slotEnd;
  });

  if (!isAvailable) return;

  if (!selectionStart.value) {
    // First click - set start time
    selectionStart.value = newTime;
    selectionEnd.value = null;
    selectedWorkplace.value = workplace;
  } else if (
    !selectionEnd.value &&
    selectedWorkplace.value?.id === workplace.id
  ) {
    // Second click - set end time
    // Check if the selected range would overlap with any booking
    const wouldOverlap = getWorkplaceBookings(workplace).some((booking) => {
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
      selectionEnd.value = null;
      selectedWorkplace.value = null;
      return;
    }

    if (newTime > selectionStart.value) {
      selectionEnd.value = newTime;
      emit(
        "time-selected",
        workplace.id,
        selectionStart.value,
        selectionEnd.value
      );
    } else {
      // If end time is before start time, swap them
      selectionEnd.value = selectionStart.value;
      selectionStart.value = newTime;
      emit(
        "time-selected",
        workplace.id,
        selectionStart.value,
        selectionEnd.value
      );
    }
  } else {
    // Reset selection and start new one
    selectionStart.value = newTime;
    selectionEnd.value = null;
    selectedWorkplace.value = workplace;
  }
};
</script>
