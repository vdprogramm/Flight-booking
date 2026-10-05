<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Flight;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;


    public function test_user_cannot_view_another_users_booking(): void
    {
        $userA = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $userB = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $flight = Flight::factory()->create();

        $booking = Booking::factory()->create([
            'user_id' => $userA->id,
            'flight_id' => $flight->id,
            'status' => 'PENDING',
        ]);

        Sanctum::actingAs($userB);

        $response = $this->getJson(
            "/api/bookings/{$booking->id}"
        );

        $response->assertNotFound();
    }


    public function test_user_cannot_cancel_another_users_booking(): void
    {
        $userA = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $userB = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $flight = Flight::factory()->create();

        $booking = Booking::factory()->create([
            'user_id' => $userA->id,
            'flight_id' => $flight->id,
            'status' => 'PENDING',
        ]);

        Sanctum::actingAs($userB);

        $response = $this->deleteJson(
            "/api/bookings/{$booking->id}"
        );

        $response->assertNotFound();

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'PENDING',
        ]);
    }
}
