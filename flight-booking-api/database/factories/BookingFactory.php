<?php

namespace Database\Factories;

use App\Models\Flight;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_code' =>
                'FB-' . strtoupper(
                    Str::random(8)
                ),

            'user_id' =>
                User::factory(),

            'flight_id' =>
                Flight::factory(),

            'status' =>
                'PENDING',

            'total_amount' =>
                1500000,

            'expires_at' =>
                now()->addMinutes(10),
        ];
    }
}
