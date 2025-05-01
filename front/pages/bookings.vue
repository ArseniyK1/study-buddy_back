<template>
  <div class="min-h-screen bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-gray-200">Мои бронирования</h1>

        <!-- Filters -->
        <div class="flex items-center space-x-4">
          <select
            v-model="selectedStatus"
            @change="handleFilterChange"
            class="bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Все статусы</option>
            <option value="COMPLETED">Завершенные</option>
            <option value="CANCELLED">Отмененные</option>
            <option value="PENDING">Ожидающие</option>
          </select>

          <div class="flex items-center space-x-2">
            <input
              type="date"
              v-model="startDate"
              @change="handleFilterChange"
              class="bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span class="text-gray-400">—</span>
            <input
              type="date"
              v-model="endDate"
              @change="handleFilterChange"
              class="bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="bookingsStore.loading && !isLoadingMore"
        class="flex justify-center items-center h-64"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="bookingsStore.error"
        class="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
      >
        <p class="text-red-400">{{ bookingsStore.error }}</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="
          bookingsStore.bookings.length === 0 && !bookingsStore.loading
        "
        class="text-center py-12"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          ></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-200">Нет бронирований</h3>
        <p class="mt-1 text-sm text-gray-400">
          У вас пока нет активных бронирований.
        </p>
      </div>

      <!-- Bookings List -->
      <div v-else class="grid gap-6">
        <div
          v-for="booking in bookingsStore.bookings"
          :key="booking.id"
          class="bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-200">
                  {{ booking.place.name }}
                </h3>
                <p class="mt-1 text-sm text-gray-400">
                  Зона: {{ booking.place.zone.name }}
                </p>
              </div>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="{
                  'bg-green-500/10 text-green-400': booking.status === 'ACTIVE',
                  'bg-red-500/10 text-red-400': booking.status === 'CANCELLED',
                  'bg-yellow-500/10 text-yellow-400':
                    booking.status === 'PENDING',
                }"
              >
                {{ getStatusText(booking.status) }}
              </span>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-400">Начало</p>
                <p class="mt-1 text-gray-200">
                  {{ formatDate(booking.startTime) }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Конец</p>
                <p class="mt-1 text-gray-200">
                  {{ formatDate(booking.endTime) }}
                </p>
              </div>
            </div>

            <div class="mt-4">
              <p class="text-sm text-gray-400">Стоимость</p>
              <p class="mt-1 text-gray-200">{{ booking.totalPrice }} ₽</p>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                v-if="booking.status === 'COMPLETED'"
                @click="cancelBooking(booking.id)"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-400 bg-red-500/10 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Отменить бронирование
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading More Indicator -->
      <div v-if="isLoadingMore" class="flex justify-center items-center py-4">
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useBookingsStore } from "~/stores/bookings";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { debounce } from "lodash";

const bookingsStore = useBookingsStore();
const selectedStatus = ref("");
const startDate = ref("");
const endDate = ref("");
const isLoadingMore = ref(false);
const offset = ref(0);
const limit = 10;
const hasMore = ref(true);

const fetchBookings = async (reset = false) => {
  await bookingsStore.fetchBookings(
    {
      status: selectedStatus.value || undefined,
      startDate: startDate.value || undefined,
      endDate: endDate.value || undefined,
    },
    reset
  );
};

const handleScroll = debounce(() => {
  if (bookingsStore.loading || !bookingsStore.hasMore) return;

  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollHeight - scrollTop <= clientHeight + 200) {
    fetchBookings();
  }
}, 100);

const handleFilterChange = () => {
  bookingsStore.resetPagination();
  fetchBookings(true);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: ru });
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "Активно";
    case "CANCELLED":
      return "Отменено";
    case "PENDING":
      return "Ожидает подтверждения";
    default:
      return status;
  }
};

const cancelBooking = async (bookingId: number) => {
  if (confirm("Вы уверены, что хотите отменить бронирование?")) {
    try {
      await bookingsStore.cancelBooking(bookingId);
      fetchBookings(true);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  }
};

onMounted(() => {
  fetchBookings(true);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
