<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
      ></div>
    </div>

    <div v-else-if="error" class="text-red-400 text-center py-4">
      {{ error }}
    </div>

    <div
      v-else-if="bookings.length === 0"
      class="text-gray-400 text-center py-4"
    >
      Бронирования не найдены
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700"
      >
        <div class="px-6 py-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-200">
                {{ booking.place?.name }}
              </h3>
              <p class="text-sm text-gray-400">
                {{ booking.place?.zone?.name }}
              </p>
            </div>
            <div class="text-right">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  {
                    'bg-green-900 text-green-300':
                      booking.status === 'COMPLETED',
                    'bg-red-900 text-red-300': booking.status === 'CANCELLED',
                    'bg-yellow-900 text-yellow-300':
                      booking.status === 'PENDING',
                    'bg-indigo-900 text-indigo-300':
                      booking.status === 'ACTIVE',
                  },
                ]"
              >
                {{ getStatusText(booking.status) }}
              </span>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-400">Время начала</p>
              <p class="text-gray-200">
                {{ formatDateUTC(booking.startTime) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-400">Время окончания</p>
              <p class="text-gray-200">
                {{ formatDateUTC(booking.endTime) }}
              </p>
            </div>
          </div>

          <div class="mt-4 flex justify-between items-center">
            <div class="text-lg font-medium text-gray-200">
              {{ booking.totalPrice }} ₽
            </div>
            <button
              v-if="booking.status === 'PENDING'"
              @click="handleCancel(booking.id)"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Отменить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  place?: {
    name: string;
    zone?: {
      name: string;
    };
  };
}

const props = defineProps<{
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  (e: "booking-cancelled", bookingId: number): void;
}>();

const formatDateUTC = (dateString: string) => {
  const date = new Date(dateString);

  // Получаем UTC компоненты
  const day = date.getUTCDate();
  const month = date.getUTCMonth();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Форматируем вручную
  const monthNames = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  return `${day} ${monthNames[month]} ${year}, ${hours
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const getStatusText = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "Завершено";
    case "CANCELLED":
      return "Отменено";
    case "PENDING":
      return "Ожидает";
    case "ACTIVE":
      return "Активно";
    default:
      return status;
  }
};

const handleCancel = (bookingId: number) => {
  emit("booking-cancelled", bookingId);
};
</script>
