<?php

namespace Database\Seeders;

use App\Models\Airline;
use App\Models\Airport;
use App\Models\Flight;
use App\Models\FlightSeat;
use App\Models\SeatClass;
use Illuminate\Database\Seeder;

class FlightBookingSeeder extends Seeder
{
    public function run(): void
    {
        // =========================
        // AIRLINES
        // =========================

        $vietnamAirlines = Airline::create([
            'code' => 'VN',
            'name' => 'Vietnam Airlines',
            'logo_url' => null,
        ]);

        $vietjet = Airline::create([
            'code' => 'VJ',
            'name' => 'VietJet Air',
            'logo_url' => null,
        ]);

        // =========================
        // AIRPORTS
        // =========================

        $han = Airport::create([
            'code' => 'HAN',
            'name' => 'Noi Bai International Airport',
            'city' => 'Hanoi',
            'country' => 'Vietnam',
            'timezone' => 'Asia/Ho_Chi_Minh',
        ]);

        $sgn = Airport::create([
            'code' => 'SGN',
            'name' => 'Tan Son Nhat International Airport',
            'city' => 'Ho Chi Minh City',
            'country' => 'Vietnam',
            'timezone' => 'Asia/Ho_Chi_Minh',
        ]);

        $dad = Airport::create([
            'code' => 'DAD',
            'name' => 'Da Nang International Airport',
            'city' => 'Da Nang',
            'country' => 'Vietnam',
            'timezone' => 'Asia/Ho_Chi_Minh',
        ]);

        // =========================
        // SEAT CLASSES
        // =========================

        $economy = SeatClass::create([
            'code' => 'ECONOMY',
            'name' => 'Economy',
            'description' => 'Standard economy class',
        ]);

        $business = SeatClass::create([
            'code' => 'BUSINESS',
            'name' => 'Business',
            'description' => 'Business class',
        ]);

        // =========================
        // FLIGHT
        // =========================

        $flight = Flight::create([
            'airline_id' => $vietnamAirlines->id,

            'departure_airport_id' => $han->id,
            'arrival_airport_id' => $sgn->id,

            'flight_number' => 'VN216',

            'departure_time' => now()->addDays(2)->setTime(8, 0),
            'arrival_time' => now()->addDays(2)->setTime(10, 10),

            'aircraft_code' => 'A321',

            'status' => 'SCHEDULED',
        ]);

        // =========================
        // BUSINESS SEATS
        // =========================

        foreach (['1A', '1B', '1C', '1D'] as $seatNumber) {
            FlightSeat::create([
                'flight_id' => $flight->id,
                'seat_class_id' => $business->id,
                'seat_number' => $seatNumber,
                'price' => 3500000,
                'status' => 'AVAILABLE',
            ]);
        }

        // =========================
        // ECONOMY SEATS
        // =========================

        foreach (
            [
                '2A', '2B', '2C', '2D', '2E', '2F',
                '3A', '3B', '3C', '3D', '3E', '3F',
                '4A', '4B', '4C', '4D', '4E', '4F',
            ] as $seatNumber
        ) {
            FlightSeat::create([
                'flight_id' => $flight->id,
                'seat_class_id' => $economy->id,
                'seat_number' => $seatNumber,
                'price' => 1500000,
                'status' => 'AVAILABLE',
            ]);
        }
    }
}
