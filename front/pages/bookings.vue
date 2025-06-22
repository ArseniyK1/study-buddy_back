<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-gray-200">Мои бронирования</h1>

          <!-- Pagination -->
          <div class="flex items-center space-x-2">
            <button
              @click="handlePageChange(bookingsStore.currentPage - 1)"
              :disabled="bookingsStore.currentPage === 1"
              class="inline-flex items-center px-2 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <span class="text-gray-400">
              Страница {{ bookingsStore.currentPage }}
            </span>

            <button
              @click="handlePageChange(bookingsStore.currentPage + 1)"
              :disabled="!bookingsStore.hasMore"
              class="inline-flex items-center px-2 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

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

          <DatePicker
            v-model="dateRange"
            @update:modelValue="handleFilterChange"
          />
        </div>
      </div>

      <BookingList
        :bookings="bookingsStore.bookings"
        :loading="bookingsStore.loading"
        :error="bookingsStore.error"
        @booking-cancelled="(v) => bookingCancel(v)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useBookingsStore } from "@/stores/bookings";
import { useSearchStore } from "@/stores/search";
import BookingList from "@/components/booking/BookingList.vue";
import { format } from "date-fns";
import DatePicker from "@/components/common/DatePicker.vue";

const bookingsStore = useBookingsStore();
const searchStore = useSearchStore();
const selectedStatus = ref("");
const dateRange = ref({
  startDate: null,
  endDate: null,
});

const fetchBookings = async (reset = false) => {
  await bookingsStore.fetchBookings(
    {
      status: selectedStatus.value || undefined,
      startDate: dateRange.value.startDate
        ? format(dateRange.value.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: dateRange.value.endDate
        ? format(dateRange.value.endDate, "yyyy-MM-dd")
        : undefined,
      query: searchStore.getSearchQuery() || undefined,
      offset: reset
        ? 0
        : (bookingsStore.currentPage - 1) * bookingsStore.pageSize,
      limit: bookingsStore.pageSize,
    },
    reset
  );
};

const handlePageChange = async (page: number) => {
  if (page < 1) return;
  await bookingsStore.fetchBookings(
    {
      status: selectedStatus.value || undefined,
      startDate: dateRange.value.startDate
        ? format(dateRange.value.startDate, "yyyy-MM-dd")
        : undefined,
      endDate: dateRange.value.endDate
        ? format(dateRange.value.endDate, "yyyy-MM-dd")
        : undefined,
      query: searchStore.getSearchQuery() || undefined,
      offset: (page - 1) * bookingsStore.pageSize,
      limit: bookingsStore.pageSize,
    },
    true
  );
  bookingsStore.currentPage = page;
};

const bookingCancel = async (id: number) => {
  await bookingsStore.cancelBooking(id);
};

const handleFilterChange = () => {
  bookingsStore.resetPagination();
  fetchBookings(true);
};

onMounted(() => {
  fetchBookings(true);
});
</script>
