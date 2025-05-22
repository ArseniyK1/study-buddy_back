<!-- route: /zones/:id -->
<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <!-- Zone Header -->
      <div
        v-else
        class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 p-6 mb-8"
      >
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-200">{{ zone.name }}</h1>
            <p class="mt-2 text-gray-400">{{ zone.description }}</p>
            <p class="mt-1 text-indigo-400 text-lg font-semibold">
              {{ zone.pricePerHour }} ₽/час
            </p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-400 space-y-1">
              <p>Всего мест: {{ zone.maxPlaces }}</p>
              <p class="text-green-400">Свободно: {{ availablePlaces }}</p>
              <p class="text-red-400">Занято: {{ occupiedPlaces }}</p>
              <p class="text-yellow-400">
                В обслуживании: {{ maintenancePlaces }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Date Selector -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-400 mb-2">
          Дата бронирования
        </label>
        <input
          type="date"
          v-model="bookingDate"
          :min="minDate"
          class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Gantt Chart -->
      <div class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
        <h2 class="text-xl font-semibold text-gray-200 mb-6">
          Расписание мест
        </h2>

        <div class="overflow-x-auto">
          <div class="min-w-max">
            <!-- Time header -->
            <div class="flex mb-2">
              <div class="w-64"></div>
              <div class="flex-grow flex">
                <div
                  v-for="hour in hours"
                  :key="hour"
                  class="flex-1 text-center text-sm text-gray-400 border-b border-gray-600 pb-1"
                >
                  {{ hour }}:00
                </div>
              </div>
            </div>

            <!-- Workplace rows -->
            <div
              v-for="place in places"
              :key="place.id"
              class="flex items-stretch h-16 mb-4"
            >
              <!-- Place info -->
              <div
                class="w-64 bg-gray-700 rounded-l-lg p-3 flex flex-col justify-center border-r border-gray-600"
                :class="{
                  'bg-green-900/20': place.status === 'AVAILABLE',
                  'bg-red-900/20': place.status === 'OCCUPIED',
                  'bg-yellow-900/20': place.status === 'MAINTENANCE',
                }"
              >
                <h3 class="font-medium text-gray-200">
                  {{ place.name }}
                </h3>
                <p class="text-xs text-gray-400 truncate">
                  {{ place.description }}
                </p>
                <span
                  class="mt-1 text-xs px-2 py-1 rounded-full self-start"
                  :class="{
                    'bg-green-500/20 text-green-400':
                      place.status === 'AVAILABLE',
                    'bg-red-500/20 text-red-400': place.status === 'OCCUPIED',
                    'bg-yellow-500/20 text-yellow-400':
                      place.status === 'MAINTENANCE',
                  }"
                >
                  {{
                    place.status === "AVAILABLE"
                      ? "Свободно"
                      : place.status === "OCCUPIED"
                      ? "Занято"
                      : "Обслуживание"
                  }}
                </span>
              </div>

              <!-- Timeline -->
              <div
                class="flex-grow relative bg-gray-700 rounded-r-lg"
                @click="() => handlePlaceClick(place)"
              >
                <!-- Hour markers -->
                <div class="absolute inset-0 flex">
                  <div
                    v-for="hour in hours"
                    :key="hour"
                    class="flex-1 border-r border-gray-600"
                  ></div>
                </div>

                <!-- Placeholder for bookings (will be replaced with actual data) -->
                <div
                  v-if="place.status === 'OCCUPIED'"
                  class="absolute h-full bg-red-500/30"
                  :style="{
                    left: '30%',
                    width: '40%',
                  }"
                >
                  <div
                    class="absolute inset-0 flex items-center justify-center text-xs text-red-200"
                  >
                    12:00-16:00
                  </div>
                </div>

                <!-- Available slots -->
                <div
                  v-if="place.status === 'AVAILABLE'"
                  class="absolute h-full w-full hover:bg-green-500/10 transition-colors"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Form (when place selected) -->
      <div
        v-if="selectedPlace"
        class="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 mt-6"
      >
        <h2 class="text-xl font-semibold text-gray-200 mb-4">
          Бронирование места "{{ selectedPlace.name }}"
        </h2>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">
              Начало
            </label>
            <select
              v-model="bookingStart"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
            >
              <option
                v-for="time in availableTimes"
                :key="time"
                :value="time"
                :disabled="isTimeDisabled(time, 'start')"
              >
                {{ time }}:00
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">
              Конец
            </label>
            <select
              v-model="bookingEnd"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
            >
              <option
                v-for="time in availableTimes"
                :key="time"
                :value="time"
                :disabled="isTimeDisabled(time, 'end')"
              >
                {{ time }}:00
              </option>
            </select>
          </div>
        </div>

        <div class="bg-gray-700 rounded-lg p-4 mb-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Стоимость:</span>
            <span class="text-xl font-semibold text-indigo-400">
              {{ calculatePrice() }} ₽
            </span>
          </div>
        </div>

        <button
          @click="bookPlace"
          class="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50"
          :disabled="!canBook"
        >
          Забронировать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/services/api";
import { format, differenceInHours } from "date-fns";

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  maxPlaces: number;
  workspaceId: number;
  places: Place[];
}

interface Place {
  id: number;
  name: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  zoneId: number;
  // Добавим тип для bookings, когда бэкенд будет их возвращать
  bookings?: any[];
}

const route = useRoute();
const loading = ref(true);
const zone = ref<Zone>({} as Zone);
const places = ref<Place[]>([]);
const selectedPlace = ref<Place | null>(null);

// Booking form
const bookingDate = ref(format(new Date(), "yyyy-MM-dd"));
const bookingStart = ref(9);
const bookingEnd = ref(10);

const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9-21
const availableTimes = Array.from({ length: 12 }, (_, i) => i + 9); // 9-20

const minDate = computed(() => {
  return format(new Date(), "yyyy-MM-dd");
});

const availablePlaces = computed(() => {
  return places.value.filter((p) => p.status === "AVAILABLE").length;
});

const occupiedPlaces = computed(() => {
  return places.value.filter((p) => p.status === "OCCUPIED").length;
});

const maintenancePlaces = computed(() => {
  return places.value.filter((p) => p.status === "MAINTENANCE").length;
});

const canBook = computed(() => {
  return (
    selectedPlace.value &&
    selectedPlace.value.status === "AVAILABLE" &&
    bookingStart.value < bookingEnd.value
  );
});

const isTimeDisabled = (time: number, type: "start" | "end") => {
  if (!selectedPlace.value) return true;

  // Здесь должна быть логика проверки занятости времени
  // Пока просто проверяем, чтобы end было после start
  if (type === "start") {
    return time >= bookingEnd.value;
  } else {
    return time <= bookingStart.value;
  }
};

const calculatePrice = () => {
  if (!selectedPlace.value) return 0;
  const hours = bookingEnd.value - bookingStart.value;
  return (hours * zone.value.pricePerHour).toFixed(2);
};

const handlePlaceClick = (place: Place) => {
  if (place.status === "AVAILABLE") {
    selectedPlace.value = place;
    // Сброс времени бронирования
    bookingStart.value = 9;
    bookingEnd.value = 10;
  }
};

const bookPlace = async () => {
  if (!selectedPlace.value || !canBook.value) return;

  try {
    // Здесь будет запрос на бронирование
    console.log("Booking place:", {
      placeId: selectedPlace.value.id,
      date: bookingDate.value,
      start: bookingStart.value,
      end: bookingEnd.value,
      price: calculatePrice(),
    });

    // Временная заглушка - обновляем статус места вручную
    selectedPlace.value.status = "OCCUPIED";
    places.value = places.value.map((p) =>
      p.id === selectedPlace.value?.id ? { ...p, status: "OCCUPIED" } : p
    );

    selectedPlace.value = null;
  } catch (error) {
    console.error("Booking failed:", error);
  }
};

const fetchZoneData = async () => {
  try {
    loading.value = true;
    const { data: zoneData } = await api.get<Zone>(
      `/workspace-zones/${route.params.id}`
    );
    zone.value = zoneData;
    places.value = zoneData.places || [];
  } catch (error) {
    console.error("Failed to fetch zone data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchZoneData();
});
</script>
