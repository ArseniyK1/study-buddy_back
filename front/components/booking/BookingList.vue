<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="loading && !isLoadingMore"
      class="flex justify-center items-center h-64"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
    >
      <p class="text-red-400">{{ error }}</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="bookings.length === 0 && !loading"
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
      <BookingCard
        v-for="booking in bookings"
        :key="booking.id"
        :booking="booking"
        @booking-cancelled="handleBookingCancelled"
      />
    </div>

    <!-- Loading More Indicator -->
    <div v-if="isLoadingMore" class="flex justify-center items-center py-4">
      <div
        class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BookingCard from "./BookingCard.vue";

const props = defineProps<{
  bookings: any[];
  loading: boolean;
  error: string | null;
  isLoadingMore: boolean;
}>();

const emit = defineEmits<{
  (e: "booking-cancelled"): void;
}>();

const handleBookingCancelled = () => {
  emit("booking-cancelled");
};
</script>
