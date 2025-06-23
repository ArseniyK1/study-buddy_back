export interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  start?: number | undefined;
  end?: number | undefined;
}

export interface Place {
  id: number;
  name: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  zoneId: number;
  bookings?: Booking[];
}
