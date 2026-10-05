export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Airline {
  id: number;
  code: string;
  name: string;
  logo_url?: string | null;
}

export interface Flight {
  id: number;
  flight_number: string;

  departure_time: string;
  arrival_time: string;

  aircraft_code: string;
  status: string;

  airline?: Airline;

  departure_airport?: Airport;
  arrival_airport?: Airport;
}
