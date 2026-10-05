<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AirlineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(
                fake()->unique()->lexify('??')
            ),

            'name' => fake()->company(),

            'logo_url' => null,
        ];
    }
}
