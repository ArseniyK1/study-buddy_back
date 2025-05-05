<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <!-- Workspace Table -->
      <div
        v-else
        class="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <!-- Table Header -->
            <thead class="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Зона
                </th>
                <th
                  v-for="place in allPlaces"
                  :key="place.id"
                  scope="col"
                  class="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {{ place.name }}
                </th>
              </tr>
            </thead>

            <!-- Table Body -->
            <tbody class="bg-gray-800 divide-y divide-gray-700">
              <tr v-for="zone in zones" :key="zone.id">
                <!-- Zone Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <div class="text-sm font-medium text-gray-200">
                      {{ zone.name }}
                    </div>
                    <div class="text-sm text-gray-400">
                      {{ zone.pricePerHour }} ₽/час
                    </div>
                  </div>
                </td>

                <!-- Places -->
                <td
                  v-for="place in allPlaces"
                  :key="place.id"
                  class="px-6 py-4 whitespace-nowrap text-center"
                >
                  <button
                    v-if="getPlaceStatus(zone, place)"
                    @click="openBookingModal(zone, place)"
                    class="w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 group relative"
                    :class="getPlaceButtonClass(getPlaceStatus(zone, place))"
                  >
                    <svg
                      class="w-8 h-8"
                      :class="getPlaceIconClass(getPlaceStatus(zone, place))"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 19V8a2 2 0 012-2h10a2 2 0 012 2v11M5 19h14M5 19l-2-4h18l-2 4M7 8v11M17 8v11M7 8h10M7 19h10M7 8l-2 4M17 8l2 4"
                      />
                    </svg>
                    <div
                      class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-gray-200 text-sm rounded-lg shadow-lg border border-gray-700 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    >
                      {{ getStatusText(getPlaceStatus(zone, place)) }}
                    </div>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Booking Modal -->
      <div
        v-if="showBookingModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeBookingModal"
      >
        <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
          <div class="p-6">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-xl font-semibold text-gray-200">
                  Бронирование места
                </h2>
                <p class="text-gray-400">
                  {{ selectedPlace?.name }} в зоне {{ selectedZone?.name }}
                </p>
              </div>
              <button
                @click="closeBookingModal"
                class="text-gray-400 hover:text-gray-200"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Date Picker -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-400 mb-2">
                Выберите дату
              </label>
              <input
                type="date"
                v-model="selectedDate"
                :min="minDate"
                class="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <!--  -->
            <BookingTimeline
              :bookings="placeBookings"
              :selected-date="selectedDate"
              @time-selected="handleTimeSelected"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BookingTimeline from "@/components/booking/BookingTimeline.vue";
import api from "@/services/api";

interface Place {
  id: number;
  name: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  zoneId: number;
}

interface Zone {
  id: number;
  name: string;
  description: string;
  pricePerHour: number;
  maxPlaces: number;
  places?: Place[];
}

const props = defineProps<{
  zones: Zone[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (
    e: "book-place",
    zoneId: number,
    placeId: number,
    startTime: Date,
    endTime: Date
  ): void;
}>();

// Modal state
const showBookingModal = ref(false);
const selectedZone = ref<Zone | null>(null);
const selectedPlace = ref<Place | null>(null);
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const placeBookings = ref([]);
const loadingBookings = ref(false);

// Get all unique places across all zones
const allPlaces = computed(() => {
  const places = new Map<number, Place>();
  props.zones.forEach((zone) => {
    zone.places?.forEach((place) => {
      if (!places.has(place.id)) {
        places.set(place.id, place);
      }
    });
  });
  return Array.from(places.values());
});

// Get place status for a specific zone
const getPlaceStatus = (zone: Zone, place: Place) => {
  return zone.places?.find((p) => p.id === place.id)?.status;
};

// Get button class based on status
const getPlaceButtonClass = (status: string | undefined) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-500/20 hover:bg-green-500/30";
    case "OCCUPIED":
      return "bg-red-500/20 hover:bg-red-500/30";
    case "MAINTENANCE":
      return "bg-yellow-500/20 hover:bg-yellow-500/30";
    default:
      return "bg-gray-500/20 hover:bg-gray-500/30";
  }
};

// Get icon class based on status
const getPlaceIconClass = (status: string | undefined) => {
  switch (status) {
    case "AVAILABLE":
      return "text-green-500";
    case "OCCUPIED":
      return "text-red-500";
    case "MAINTENANCE":
      return "text-yellow-500";
    default:
      return "text-gray-500";
  }
};

// Calculate minimum date (today)
const minDate = computed(() => {
  return new Date().toISOString().split("T")[0];
});

// Watch for changes in selected place or date to fetch bookings
watch([selectedPlace, selectedDate], async ([place, date]) => {
  if (place && date) {
    await fetchPlaceBookings(place.id, date);
  }
});

// Fetch bookings for the selected place and date
const fetchPlaceBookings = async (placeId: number, date: string) => {
  loadingBookings.value = true;
  try {
    const { data } = await api.get(`/bookings?placeId=${placeId}&date=${date}`);
    placeBookings.value = data;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    placeBookings.value = [];
  } finally {
    loadingBookings.value = false;
  }
};

// Modal handlers
const openBookingModal = (zone: Zone, place: Place) => {
  if (place.status !== "AVAILABLE") return;
  selectedZone.value = zone;
  selectedPlace.value = place;
  showBookingModal.value = true;
};

const closeBookingModal = () => {
  showBookingModal.value = false;
  selectedZone.value = null;
  selectedPlace.value = null;
};

// Handle time selection from BookingTimeline
const handleTimeSelected = (startTime: Date, endTime: Date) => {
  if (selectedZone.value && selectedPlace.value) {
    emit(
      "book-place",
      selectedZone.value.id,
      selectedPlace.value.id,
      startTime,
      endTime
    );
    closeBookingModal();
  }
};

// Add this function in the script section after getPlaceIconClass
const getStatusText = (status: string | undefined) => {
  switch (status) {
    case "AVAILABLE":
      return "Свободно";
    case "OCCUPIED":
      return "Занято";
    case "MAINTENANCE":
      return "Тех. обслуживание";
    default:
      return "";
  }
};
</script>
