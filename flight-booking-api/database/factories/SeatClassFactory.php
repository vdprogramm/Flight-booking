<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SeatClassFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => 'ECONOMY_' . fake()->unique()->numberBetween(1000, 9999),
            'name' => 'Economy',
            'description' => 'Economy class',
        ];
    }
}
