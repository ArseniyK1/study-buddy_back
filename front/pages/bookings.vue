<template>
  <div class="bg-gray-900">
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
        :is-loading-more="isLoadingMore"
        @booking-cancelled="fetchBookings(true)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useBookingsStore } from "@/stores/bookings";
import { useSearchStore } from "@/stores/search";
import { debounce } from "lodash";
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
const isLoadingMore = ref(false);

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

onMounted(() => {
  fetchBookings(true);
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
