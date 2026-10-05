<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AirportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(
                fake()->unique()->lexify('???')
            ),

            'name' =>
                fake()->city() . ' International Airport',

            'city' => fake()->city(),

            'country' => 'Vietnam',
        ];
    }
}
