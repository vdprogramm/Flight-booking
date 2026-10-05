<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\FlightSeat;
use App\Models\Passenger;
use App\Models\User;
use App\Services\BookingExpirationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_expired_booking_keeps_seat_history_and_releases_seat(): void
    {
        $user = User::factory()->create();

        $seat = FlightSeat::factory()->create([
            'status' => 'HELD',
            'held_by' => $user->id,
            'held_until' => now()->subMinute(),
        ]);

        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'flight_id' => $seat->flight_id,
            'status' => 'PENDING',
            'expires_at' => now()->subMinute(),
        ]);

        $passenger = Passenger::create([
            'booking_id' => $booking->id,
            'first_name' => 'Thanh',
            'last_name' => 'Vinh',
            'date_of_birth' => '2003-01-01',
        ]);

        $bookingSeat = BookingSeat::create([
            'booking_id' => $booking->id,
            'passenger_id' => $passenger->id,
            'flight_seat_id' => $seat->id,
            'price' => $seat->price,
        ]);

        $result = app(BookingExpirationService::class)
            ->expire($booking->id);

        $this->assertTrue($result);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'EXPIRED',
        ]);

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'AVAILABLE',
            'held_by' => null,
            'held_until' => null,
        ]);

        $this->assertDatabaseHas('booking_seats', [
            'id' => $bookingSeat->id,
            'booking_id' => $booking->id,
            'flight_seat_id' => $seat->id,
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('passengers', [
            'id' => $passenger->id,
            'first_name' => 'Thanh',
            'last_name' => 'Vinh',
        ]);
    }
}
