<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Flight;
use App\Models\FlightSeat;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FlightCancellationTest extends TestCase
{
    use RefreshDatabase;


    public function test_admin_can_cancel_scheduled_flight_and_it_cancels_pending_bookings(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $flight = Flight::factory()->create(['status' => 'SCHEDULED']);
        
        $holder = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'flight_id' => $flight->id,
            'status' => 'HELD',
            'held_by' => $holder->id,
            'held_until' => now()->addMinutes(10),
        ]);
        
        $booking = Booking::factory()->create([
            'flight_id' => $flight->id,
            'status' => 'PENDING',
        ]);
        
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'MOCK',
            'amount' => 1500000,
            'status' => 'PENDING',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/flights/{$flight->id}/cancel");
        $response->assertOk();

        // 1. Flight -> CANCELLED
        $this->assertDatabaseHas('flights', [
            'id' => $flight->id,
            'status' => 'CANCELLED',
        ]);

        // 2. Booking PENDING -> CANCELLED
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CANCELLED',
        ]);

        // 3. Payment PENDING -> FAILED
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'FAILED',
        ]);

        // 4. HELD seat -> AVAILABLE
        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'AVAILABLE',
            'held_by' => null,
            'held_until' => null,
        ]);
    }


    public function test_admin_can_cancel_flight_and_refund_paid_bookings(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $flight = Flight::factory()->create(['status' => 'SCHEDULED']);
        
        $booking = Booking::factory()->create([
            'flight_id' => $flight->id,
            'status' => 'CONFIRMED',
        ]);
        
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'payment_method' => 'MOCK',
            'amount' => 1500000,
            'status' => 'PAID',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/flights/{$flight->id}/cancel");
        $response->assertOk();

        // Booking CONFIRMED -> CANCELLED
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'CANCELLED',
        ]);

        // Payment PAID -> REFUNDED
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'REFUNDED',
        ]);
    }


    public function test_customer_cannot_cancel_flight(): void
    {
        $customer = User::factory()->create(['role' => 'CUSTOMER']);
        $flight = Flight::factory()->create(['status' => 'SCHEDULED']);

        Sanctum::actingAs($customer);

        $response = $this->postJson("/api/admin/flights/{$flight->id}/cancel");
        $response->assertForbidden();
        
        $this->assertDatabaseHas('flights', [
            'id' => $flight->id,
            'status' => 'SCHEDULED',
        ]);
    }


    public function test_cannot_cancel_completed_flight(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $flight = Flight::factory()->create(['status' => 'COMPLETED']);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/admin/flights/{$flight->id}/cancel");
        
        // FlightCancellationService throws ValidationException
        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['flight']);
        
        $this->assertDatabaseHas('flights', [
            'id' => $flight->id,
            'status' => 'COMPLETED',
        ]);
    }
}
