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

      <template v-else>
        <!-- Zone Header -->
        <ZoneHeader :zone="zone" :places="places" />

        <!-- Booking Date Selector -->
        <BookingDateSelector v-model="bookingDate" />

        <!-- Gantt Chart -->
        <GanttChart
          :places="places"
          :hours="hours"
          :current-booking="currentBooking"
          @place-select="handlePlaceSelect"
        />

        <!-- Booking Form (when place selected) -->
        <BookingForm
          v-if="selectedPlace"
          :place="selectedPlace"
          v-model:start-time="bookingStart"
          v-model:end-time="bookingEnd"
          :price-per-hour="zone.pricePerHour"
          :available-times="availableTimes"
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
import BookingDateSelector from "@/components/booking/BookingDateSelector.vue";
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
  start: number;
  end: number;
}

interface CurrentBooking {
  placeId: number | null;
  startTime: number | null;
  endTime: number | null;
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
const availableTimes = Array.from({ length: 24 }, (_, i) => i + 0.5).filter(
  (time) => time >= 9 && time <= 20
); // 9:00-20:30 with 30-minute intervals

// Current booking state for the Gantt chart
const currentBooking = computed<CurrentBooking>(() => ({
  placeId: selectedPlace.value?.id ?? null,
  startTime: selectedPlace.value ? bookingStart.value : null,
  endTime: selectedPlace.value ? bookingEnd.value : null,
}));

// Watch for changes in booking times to update the Gantt chart
watch([bookingStart, bookingEnd], () => {
  if (selectedPlace.value) {
    // Validate the booking times
    if (bookingStart.value >= bookingEnd.value) {
      // If start time is after or equal to end time, adjust end time
      bookingEnd.value = bookingStart.value + 1;
    }
  }
});

const handlePlaceSelect = (
  place: Place,
  startTime: number,
  endTime: number
) => {
  selectedPlace.value = place;
  bookingStart.value = startTime;
  bookingEnd.value = endTime;
};

const bookingsStore = useBookingsStore();
const toast = useToast();

const bookPlace = async () => {
  if (!selectedPlace.value) return;

  try {
    // Формируем ISO строки для времени бронирования
    const date = bookingDate.value;
    const startHour = Math.floor(bookingStart.value);
    const startMinute = bookingStart.value % 1 === 0.5 ? 30 : 0;
    const endHour = Math.floor(bookingEnd.value);
    const endMinute = bookingEnd.value % 1 === 0.5 ? 30 : 0;
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    const toUTCISOString = (d: Date) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();

    await bookingsStore.createBooking({
      startTime: toUTCISOString(startTime),
      endTime: toUTCISOString(endTime),
      placeId: selectedPlace.value.id,
    });

    // После успешного бронирования обновляем бронирования для всех мест
    await fetchBookingsForPlaces(bookingDate.value);
    toast.success("Место успешно забронировано!");
    selectedPlace.value = null;
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Ошибка при бронировании");
    console.error("Booking failed:", error);
  }
};

const calculatePrice = () => {
  if (!selectedPlace.value) return 0;
  const hours = bookingEnd.value - bookingStart.value;
  return (hours * zone.value.pricePerHour).toFixed(2);
};

const parseTimeToHour = (isoString: string) => {
  const date = new Date(isoString);
  // Учитываем часовой пояс (Z означает UTC)
  const localHours = date.getHours() + date.getMinutes() / 60;
  // Если сервер возвращает время в UTC, а вам нужно местное время
  // return localHours + (date.getTimezoneOffset() / 60);
  return localHours;
};

const fetchBookingsForPlaces = async (date: string) => {
  await Promise.all(
    places.value.map(async (place) => {
      try {
        const { data: bookings } = await api.get(
          `/workplace/${place.id}/bookings`,
          {
            params: { date },
          }
        );
        // Преобразуем startTime/endTime в числовые значения часов
        place.bookings = bookings.map((b: any) => ({
          id: b.id,
          start: parseTimeToHour(b.startTime),
          end: parseTimeToHour(b.endTime),
          startTime: b.startTime, // Сохраняем оригинальные значения
          endTime: b.endTime, // если они понадобятся где-то еще
        }));
      } catch (error) {
        place.bookings = [];
        console.error(`Failed to fetch bookings for place ${place.id}:`, error);
      }
    })
  );
};

const fetchZoneData = async () => {
  try {
    loading.value = true;
    const { data: zoneData } = await api.get<Zone>(
      `/workspace-zones/${route.params.id}`
    );
    zone.value = zoneData;
    places.value = zoneData.places || [];
    await fetchBookingsForPlaces(bookingDate.value);
  } catch (error) {
    console.error("Failed to fetch zone data:", error);
  } finally {
    loading.value = false;
  }
};

watch(bookingDate, async (newDate) => {
  await fetchBookingsForPlaces(newDate);
});

onMounted(() => {
  fetchZoneData();
});
</script>
