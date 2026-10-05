<?php

namespace Database\Factories;

use App\Models\Flight;
use App\Models\SeatClass;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightSeatFactory extends Factory
{
    public function definition(): array
    {
        return [
            'flight_id' => Flight::factory(),
            'seat_class_id' => SeatClass::factory(),

            'seat_number' =>
                fake()->numberBetween(1, 30) .
                fake()->randomElement([
                    'A', 'B', 'C', 'D', 'E', 'F',
                ]),

            'price' => 1500000,

            'status' => 'AVAILABLE',

            'held_by' => null,

            'held_until' => null,
        ];
    }
}
