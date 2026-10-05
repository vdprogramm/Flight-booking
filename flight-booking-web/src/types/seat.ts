export interface SeatClass {
  id: number;
  code: string;
  name: string;
  description?: string | null;
}

export type SeatStatus = "AVAILABLE" | "HELD" | "BOOKED";

export interface FlightSeat {
  id: number;
  flight_id: number;
  seat_class_id: number;
  seat_number: string;
  price: string | number;
  status: SeatStatus;
  held_by: number | null;
  held_until: string | null;
  seat_class?: SeatClass;
  is_mine?: boolean;
}
