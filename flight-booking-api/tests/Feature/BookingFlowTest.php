<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Flight;
use App\Models\FlightSeat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_booking_flow_happy_path(): void
    {
        $user = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $flight = Flight::factory()->create([
            'status' => 'SCHEDULED',
        ]);

        $seat = FlightSeat::factory()->create([
            'flight_id' => $flight->id,
            'status' => 'AVAILABLE',
            'price' => 1500000,
        ]);

        Sanctum::actingAs($user);

        // 1. Hold Seat
        $response = $this->postJson("/api/seats/{$seat->id}/hold");
        $response->assertOk();

        // 2. Create Booking
        // Giả sử hacker muốn can thiệp giá, nhưng backend sẽ lấy giá từ DB
        $response = $this->postJson('/api/bookings', [
            'flight_id' => $flight->id,
            'passengers' => [
                [
                    'flight_seat_id' => $seat->id,
                    'first_name' => 'Nguyen',
                    'last_name' => 'Van A',
                    'date_of_birth' => '1990-01-01',
                    'gender' => 'MALE',
                    'document_number' => '001090000001',
                    'nationality' => 'VN',
                    'price' => 1000, // Thử gửi giá ảo
                ],
            ],
        ]);

        $response->assertCreated();
        $bookingId = $response->json('data.id');

        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'status' => 'PENDING',
            'total_amount' => 1500000, // Đảm bảo lấy giá gốc từ DB
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $bookingId,
            'status' => 'PENDING',
            'amount' => 1500000,
        ]);

        // 3. Pay Booking
        $response = $this->postJson("/api/bookings/{$bookingId}/pay");
        $response->assertOk();

        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'status' => 'CONFIRMED',
        ]);

        $this->assertDatabaseHas('payments', [
            'booking_id' => $bookingId,
            'status' => 'PAID',
        ]);

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'BOOKED',
            'held_by' => null,
            'held_until' => null,
        ]);
    }

    public function test_user_cannot_book_with_unheld_or_expired_seat(): void
    {
        $user = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $flight = Flight::factory()->create([
            'status' => 'SCHEDULED',
        ]);

        // Ghế chưa được Hold (AVAILABLE)
        $seat = FlightSeat::factory()->create([
            'flight_id' => $flight->id,
            'status' => 'AVAILABLE',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/bookings', [
            'flight_id' => $flight->id,
            'passengers' => [
                [
                    'flight_seat_id' => $seat->id,
                    'first_name' => 'Nguyen',
                    'last_name' => 'Van A',
                    'date_of_birth' => '1990-01-01',
                ],
            ],
        ]);

        // Validation Exception vì ghế không hợp lệ
        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['seats']);
    }

    public function test_user_cannot_book_another_users_held_seat(): void
    {
        $userA = User::factory()->create(['role' => 'CUSTOMER']);
        $userB = User::factory()->create(['role' => 'CUSTOMER']);

        $flight = Flight::factory()->create(['status' => 'SCHEDULED']);

        // User A đang hold ghế
        $seat = FlightSeat::factory()->create([
            'flight_id' => $flight->id,
            'status' => 'HELD',
            'held_by' => $userA->id,
            'held_until' => now()->addMinutes(10),
        ]);

        // User B cố tình lấy ghế của A
        Sanctum::actingAs($userB);

        $response = $this->postJson('/api/bookings', [
            'flight_id' => $flight->id,
            'passengers' => [
                [
                    'flight_seat_id' => $seat->id,
                    'first_name' => 'Hacker',
                    'last_name' => 'B',
                    'date_of_birth' => '1990-01-01',
                ],
            ],
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['seats']);
    }

    public function test_user_cannot_book_cancelled_flight(): void
    {
        $user = User::factory()->create(['role' => 'CUSTOMER']);

        $flight = Flight::factory()->create(['status' => 'CANCELLED']);

        $seat = FlightSeat::factory()->create([
            'flight_id' => $flight->id,
            'status' => 'HELD',
            'held_by' => $user->id,
            'held_until' => now()->addMinutes(10),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/bookings', [
            'flight_id' => $flight->id,
            'passengers' => [
                [
                    'flight_seat_id' => $seat->id,
                    'first_name' => 'Nguyen',
                    'last_name' => 'Van A',
                    'date_of_birth' => '1990-01-01',
                ],
            ],
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['flight_id']);
    }

    public function test_user_cannot_pay_confirmed_booking(): void
    {
        $user = User::factory()->create(['role' => 'CUSTOMER']);

        $booking = Booking::factory()->create([
            'user_id' => $user->id,
            'status' => 'CONFIRMED',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/bookings/{$booking->id}/pay");

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['booking']);
    }
}
