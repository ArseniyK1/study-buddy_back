<template>
  <div class="bg-gray-900">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"
        ></div>
      </div>

      <template v-else>
        <ZoneHeader :zone="zone" :places="places" />

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2"
              >Начальная дата</label
            >
            <input
              type="date"
              v-model="startDate"
              :min="minDate"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2"
              >Конечная дата</label
            >
            <input
              type="date"
              v-model="endDate"
              :min="startDate"
              class="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200"
            />
          </div>
        </div>

        <GanttChart
          :places="places"
          :start-date="startDate"
          :end-date="endDate"
          :current-booking="currentBooking"
          @place-select="handlePlaceSelect"
        />

        <BookingForm
          v-if="selectedPlace"
          :place="selectedPlace"
          :start-time="bookingStart"
          :end-time="bookingEnd"
          :price-per-hour="zone.pricePerHour"
          @book="bookPlace"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { format } from "date-fns";
import api from "@/services/api";
import ZoneHeader from "@/components/booking/ZoneHeader.vue";
import GanttChart from "@/components/booking/GanttChart.vue";
import BookingForm from "@/components/booking/BookingForm.vue";
import { useBookingsStore } from "@/stores/bookings";
import { useToast } from "vue-toastification";

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
  bookings?: Booking[];
}

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
}

const route = useRoute();
const loading = ref(true);
const zone = ref<Zone>({} as Zone);
const places = ref<Place[]>([]);
const selectedPlace = ref<Place | null>(null);

const startDate = ref(format(new Date(), "yyyy-MM-dd"));
const endDate = ref(format(new Date(), "yyyy-MM-dd"));
const bookingStart = ref({
  date: startDate.value,
  hour: 9,
  minute: 0,
});
const bookingEnd = ref({
  date: startDate.value,
  hour: 10,
  minute: 0,
});

const minDate = computed(() => format(new Date(), "yyyy-MM-dd"));

const handlePlaceSelect = (
  place: Place,
  start: { date: string; hour: number; minute?: number },
  end: { date: string; hour: number; minute?: number }
) => {
  selectedPlace.value = place;
  bookingStart.value = { ...start, minute: start.minute ?? 0 };
  bookingEnd.value = { ...end, minute: end.minute ?? 0 };
};

const bookingsStore = useBookingsStore();
const toast = useToast();

const toISO = ({
  date,
  hour,
  minute,
}: {
  date: string;
  hour: number;
  minute: number;
}) =>
  new Date(
    `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}:00.000Z`
  ).toISOString();

const bookPlace = async () => {
  if (!selectedPlace.value) return;

  try {
    await bookingsStore.createBooking({
      startTime: toISO(bookingStart.value),
      endTime: toISO(bookingEnd.value),
      placeId: selectedPlace.value.id,
    });

    toast.success("Место успешно забронировано!");
    selectedPlace.value = null;
    await fetchBookings();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Ошибка при бронировании");
    console.error("Booking failed:", error);
  }
};

const fetchBookings = async () => {
  await Promise.all(
    places.value.map(async (place) => {
      try {
        const { data } = await api.get(`/workplace/${place.id}/bookings`, {
          params: {
            date: startDate.value,
          },
        });
        place.bookings = data;
      } catch (error) {
        console.error(`Failed to fetch bookings for place ${place.id}:`, error);
        place.bookings = [];
      }
    })
  );
};

const fetchZoneData = async () => {
  try {
    loading.value = true;
    const { data } = await api.get<Zone>(`/workspace-zones/${route.params.id}`);
    zone.value = data;
    places.value = data.places || [];
    await fetchBookings();
  } catch (error) {
    console.error("Failed to fetch zone data:", error);
  } finally {
    loading.value = false;
  }
};

watch([startDate, endDate], fetchBookings);

const currentBooking = computed(() => ({
  placeId: selectedPlace.value?.id ?? null,
  startTime: bookingStart.value ?? null,
  endTime: bookingEnd.value ?? null,
}));

onMounted(fetchZoneData);
</script>
