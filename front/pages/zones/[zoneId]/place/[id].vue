<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
      <!-- Loading Spinner -->
      <div v-if="!workplace.id" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <div v-else class="space-y-8">
        <!-- Workplace Header -->
        <div
          class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 p-6"
        >
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-gray-200">
                Рабочее место №{{ workplace.id }}. {{ workplace.name }}
              </h1>
              <p class="mt-2 text-gray-400">{{ workplace.description }}</p>
              <p class="mt-2 text-gray-400">
                {{ workplace.zone.pricePerHour }} ₽/час
              </p>
            </div>
            <div class="text-right">
              <span
                class="px-3 py-1 text-sm rounded-full"
                :class="{
                  'bg-green-500/20 text-green-400':
                    workplace.status === 'AVAILABLE',
                  'bg-red-500/20 text-red-400': workplace.status === 'BOOKED',
                  'bg-yellow-500/20 text-yellow-400':
                    workplace.status === 'MAINTENANCE',
                }"
              >
                {{ statusText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Workplace Image -->
        <div
          v-if="workplace.image"
          class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700"
        >
          <img
            :src="workplace.image"
            :alt="workplace.name"
            class="w-full h-96 object-cover"
          />
        </div>

        <!-- Booking Timeline -->

        <!-- Booking Section -->
        <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-200 mb-6">Бронирование</h2>

          <!-- Date and Time Selection -->
          <div class="grid grid-cols-1 gap-6 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">
                Дата
              </label>
              <input
                type="date"
                v-model="bookingDate"
                :min="minDate"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Booking Timeline -->
          <div class="mb-6">
            <BookingTimeline
              :bookings="workplace.bookings"
              :selected-date="bookingDate"
              @time-selected="handleTimeSelected"
            />
          </div>

          <!-- Price Calculation -->
          <div class="bg-gray-700 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-gray-400">Стоимость:</span>
              <span class="text-xl font-semibold text-indigo-400">
                {{ calculatePrice() }} ₽
              </span>
            </div>
          </div>

          <!-- Book Button -->
          <button
            @click="bookWorkplace"
            :disabled="!canBook"
            class="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Забронировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../../../services/api";
import BookingTimeline from "@/components/booking/BookingTimeline.vue";
import { useToast, POSITION } from "vue-toastification";

interface Workplace {
  id: number;
  name: string;
  description: string;
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE";
  image?: string;
  zoneId: number;
  zone: {
    id: number;
    name: string;
    description: string;
    pricePerHour: number;
    maxPlaces: number;
    workspaceId: number;
  };
  bookings: {
    id: number;
    startTime: string;
    endTime: string;
    status: string;
    totalPrice: number;
    userId: number;
    placeId: number;
  }[];
}

const toast = useToast();
const route = useRoute();
const router = useRouter();
const workplace = ref<Workplace>({} as Workplace);

// Booking form state
const bookingDate = ref("2026-04-20");
const bookingStartTime = ref<Date | null>(null);
const bookingEndTime = ref<Date | null>(null);

// Available times (9:00 - 21:00)
const availableTimes = [
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
];

// Computed properties
const statusText = computed(() => {
  switch (workplace.value.status) {
    case "AVAILABLE":
      return "Свободно";
    case "BOOKED":
      return "Занято";
    case "MAINTENANCE":
      return "На обслуживании";
    default:
      return "";
  }
});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

const canBook = computed(() => {
  return (
    workplace.value.status === "AVAILABLE" &&
    bookingDate.value &&
    bookingStartTime.value &&
    bookingEndTime.value
  );
});

// Methods
const handleTimeSelected = (startTime: Date, endTime: Date) => {
  bookingStartTime.value = startTime;
  bookingEndTime.value = endTime;
};

const calculatePrice = () => {
  if (
    !workplace.value.zone?.pricePerHour ||
    !bookingStartTime.value ||
    !bookingEndTime.value
  )
    return 0;
  const hours =
    (bookingEndTime.value.getTime() - bookingStartTime.value.getTime()) /
    (1000 * 60 * 60);
  const totalPrice = workplace.value.zone.pricePerHour * hours;
  return Math.floor(totalPrice * 100) / 100;
};

const bookWorkplace = async () => {
  try {
    if (!bookingStartTime.value || !bookingEndTime.value) return;

    const bookingData = {
      placeId: workplace.value.id,
      startTime: bookingStartTime.value.toISOString(),
      endTime: bookingEndTime.value.toISOString(),
    };

    await api.post("/workplace/booking", bookingData);
    toast.success("Бронирование успешно создано", {
      position: POSITION.BOTTOM_RIGHT,
      timeout: 5000,
    });
    router.push("/bookings");
  } catch (error: any) {
    console.error("Ошибка при бронировании:", error);
    toast.error(
      error.response?.data?.message || "Ошибка при создании бронирования",
      {
        position: POSITION.BOTTOM_RIGHT,
        timeout: 5000,
      }
    );
  }
};

// Fetch workplace data
onMounted(async () => {
  try {
    const { data } = await api.get<Workplace>(`/workplace/${route.params.id}`);
    if (!data.zone?.id || route.params.zoneId !== data.zone.id.toString()) {
      toast.error("Рабочее место не найдено в указанной зоне", {
        position: POSITION.BOTTOM_RIGHT,
        timeout: 5000,
        closeOnClick: true,
        pauseOnFocusLoss: true,
        pauseOnHover: true,
        draggable: true,
        draggablePercent: 0.6,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: "button",
        icon: true,
        rtl: false,
      });
      return;
    }
    workplace.value = data;
  } catch (error) {
    console.error("Failed to fetch workplace data:", error);
    toast.error("Ошибка при загрузке данных", {
      position: POSITION.BOTTOM_RIGHT,
      timeout: 5000,
    });
  }
});
</script>
