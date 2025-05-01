<template>
  <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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
            'bg-yellow-500/10 text-yellow-400': booking.status === 'PENDING',
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
          @click="isModalOpen = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-400 bg-red-500/10 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Отменить бронирование
        </button>
      </div>
    </div>

    <Modal
      :is-open="isModalOpen"
      title="Отмена бронирования"
      confirm-button-text="Да"
      cancel-button-text="Назад"
      @close="isModalOpen = false"
      @confirm="handleCancelBooking"
    >
      Вы уверены, что хотите отменить бронирование?
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useBookingsStore } from "@/stores/bookings";
import { ref } from "vue";
import Modal from "@/components/ui/Modal.vue";

const props = defineProps<{
  booking: {
    id: number;
    place: {
      name: string;
      zone: {
        name: string;
      };
    };
    status: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
  };
}>();

const bookingsStore = useBookingsStore();
const isModalOpen = ref(false);

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

const handleCancelBooking = async () => {
  try {
    await bookingsStore.cancelBooking(props.booking.id);
    emit("booking-cancelled");
    isModalOpen.value = false;
  } catch (error) {
    console.error("Failed to cancel booking:", error);
  }
};

const emit = defineEmits<{
  (e: "booking-cancelled"): void;
}>();
</script>
