<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            [
                'email' => 'admin@flightbooking.com',
            ],
            [
                'name' => 'Flight Booking Admin',
                'password' => 'Admin@123456',
                'role' => 'ADMIN',
            ]
        );
    }
}
