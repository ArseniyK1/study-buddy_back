<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-200 mb-6">
      Управление бронированиями
    </h1>

    <!-- Filters -->
    <div class="flex justify-between items-center mb-4">
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

        <input
          type="date"
          v-model="selectedDate"
          @change="handleFilterChange"
          class="bg-gray-800 text-gray-200 rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
      ></div>
    </div>

    <div v-else-if="error" class="text-red-400 text-center py-4">
      {{ error }}
    </div>

    <div
      v-else-if="bookings?.length === 0"
      class="text-gray-400 text-center py-4"
    >
      Бронирования не найдены
    </div>

    <div v-else class="space-y-4">
      <table class="min-w-full bg-gray-800 rounded">
        <thead>
          <tr class="text-gray-400">
            <th class="px-4 py-2 text-white">ID</th>
            <th class="px-4 py-2 text-white">Место</th>
            <th class="px-4 py-2 text-white">Зона</th>
            <th class="px-4 py-2 text-white">Период</th>
            <th class="px-4 py-2 text-white">Статус</th>
            <th class="px-4 py-2 text-white">Цена</th>
            <th class="px-4 py-2 text-white">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="booking in bookings"
            :key="booking.id"
            class="border-b border-gray-700"
          >
            <td class="px-4 py-2 text-white">{{ booking.id }}</td>
            <td class="px-4 py-2 text-white">{{ booking.place?.name }}</td>
            <td class="px-4 py-2 text-white">
              {{ booking.place?.zone?.name }}
            </td>
            <td class="px-4 py-2 text-white">
              {{ formatPeriod(booking.startTime, booking.endTime) }}
            </td>
            <td class="px-4 py-2 text-white">{{ booking.status }}</td>
            <td class="px-4 py-2 text-white">{{ booking.totalPrice }}</td>
            <td class="px-4 py-2 space-x-2 text-white">
              <button
                v-if="booking.status === 'PENDING'"
                class="bg-green-600 text-white px-2 py-1 rounded"
                @click="acceptBooking(booking.id)"
              >
                Принять
              </button>
              <button
                v-if="booking.status === 'PENDING'"
                class="bg-red-600 text-white px-2 py-1 rounded"
                @click="rejectBooking(booking.id)"
              >
                Отклонить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useBookingsStore } from "@/stores/bookings";
import { useSearchStore } from "@/stores/search";
import { format } from "date-fns";

const props = defineProps({
  placeIds: {
    type: Array as () => number[],
    required: true,
  },
});

const bookingsStore = useBookingsStore();
const searchStore = useSearchStore();
const selectedStatus = ref("");
const selectedDate = ref(new Date().toISOString().split("T")[0]);

const fetchBookings = async (reset = false) => {
  await bookingsStore.fetchWorkplaceBookings(
    1, // Пример ID рабочего места
    {
      status: selectedStatus.value || undefined,
      date: selectedDate.value,
      placeIds: props.placeIds,
      query: searchStore.getSearchQuery() || undefined,
      offset: reset
        ? 0
        : (bookingsStore.currentPage - 1) * bookingsStore.pageSize,
      limit: bookingsStore.pageSize,
    },
    reset
  );
};

const handleFilterChange = () => {
  bookingsStore.resetPagination();
  fetchBookings(true);
};

const formatPeriod = (start: string, end: string) => {
  return `${new Date(start).toLocaleString()} — ${new Date(
    end
  ).toLocaleString()}`;
};

const acceptBooking = async (id: number) => {
  try {
    await bookingsStore.acceptBooking(id);
    await fetchBookings(true);
  } catch (error) {
    console.error("Ошибка при подтверждении бронирования:", error);
  }
};

const rejectBooking = async (id: number) => {
  try {
    await bookingsStore.rejectBooking(id);
    await fetchBookings(true);
  } catch (error) {
    console.error("Ошибка при отклонении бронирования:", error);
  }
};

onMounted(() => {
  fetchBookings(true);
});
</script>
