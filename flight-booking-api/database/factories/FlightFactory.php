<?php

namespace Database\Factories;

use App\Models\Airline;
use App\Models\Airport;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightFactory extends Factory
{
    public function definition(): array
    {
        $departure = Airport::factory()->create();
        $arrival = Airport::factory()->create();

        $departureTime = now()->addDays(5);

        return [
            'airline_id' => Airline::factory(),

            'flight_number' =>
                'TEST' . fake()->unique()->numberBetween(1000, 9999),

            'departure_airport_id' => $departure->id,

            'arrival_airport_id' => $arrival->id,

            'departure_time' => $departureTime,

            'arrival_time' => $departureTime
                ->copy()
                ->addHours(2),

            'aircraft_code' => 'A321',

            'status' => 'SCHEDULED',
        ];
    }
}
