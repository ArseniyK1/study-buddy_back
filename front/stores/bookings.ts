import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/services/api";
import { withPagination } from "@/helpers/api";

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  userId: number;
  placeId: number;
  place: {
    id: number;
    name: string;
    zone: {
      id: number;
      name: string;
    };
  };
}

interface GetMyBookingsParams {
  offset?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  query?: string;
}

export const useBookingsStore = defineStore("bookings", () => {
  const bookings = ref<Booking[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const hasMore = ref(true);

  const fetchBookings = async (
    params: GetMyBookingsParams = {},
    reset = false
  ) => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;
    try {
      if (reset) {
        hasMore.value = true;
      }

      const { data } = await api.get<Booking[]>("/booking", {
        params: {
          ...params,
          offset: params.offset ?? (currentPage.value - 1) * pageSize.value,
          limit: params.limit ?? pageSize.value,
        },
      });

      bookings.value = data;
      hasMore.value = data.length === pageSize.value;
    } catch (err) {
      error.value = "Failed to fetch bookings";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createBooking = async (bookingData: {
    startTime: string;
    endTime: string;
    placeId: number;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.post<Booking>("/booking", bookingData);
      if (!!data?.id) {
        bookings.value.push(data);
        return data;
      } else {
        error.value = "Failed to create booking";
        throw new Error("Failed to create booking");
      }
    } catch (err) {
      error.value = "Failed to create booking";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cancelBooking = async (bookingId: number) => {
    loading.value = true;
    error.value = null;
    try {
      await api.delete(`/booking/${bookingId}`);
      bookings.value = bookings.value.filter((b) => b.id !== bookingId);
    } catch (err) {
      error.value = "Failed to cancel booking";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const resetPagination = () => {
    currentPage.value = 1;
    hasMore.value = true;
  };

  return {
    bookings,
    loading,
    error,
    currentPage,
    pageSize,
    hasMore,
    fetchBookings,
    createBooking,
    cancelBooking,
    resetPagination,
  };
});
