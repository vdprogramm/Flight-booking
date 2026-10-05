<?php

namespace Tests\Feature;

use App\Models\FlightSeat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SeatHoldTest extends TestCase
{
    use RefreshDatabase;


    public function test_user_can_hold_available_seat(): void
    {
        $user = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'status' => 'AVAILABLE',
            'held_by' => null,
            'held_until' => null,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson(
            "/api/seats/{$seat->id}/hold"
        );

        $response
            ->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'HELD',
            'held_by' => $user->id,
        ]);

        $seat->refresh();

        $this->assertNotNull(
            $seat->held_until
        );

        $this->assertTrue(
            $seat->held_until->isFuture()
        );
    }


    public function test_another_user_cannot_hold_already_held_seat(): void
    {
        $userA = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $userB = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'status' => 'HELD',
            'held_by' => $userA->id,
            'held_until' => now()->addMinutes(10),
        ]);

        Sanctum::actingAs($userB);

        $response = $this->postJson(
            "/api/seats/{$seat->id}/hold"
        );

        $response->assertStatus(409);

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'HELD',
            'held_by' => $userA->id,
        ]);
    }


    public function test_same_user_can_call_hold_again_without_losing_seat(): void
    {
        $user = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'status' => 'HELD',
            'held_by' => $user->id,
            'held_until' => now()->addMinutes(10),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson(
            "/api/seats/{$seat->id}/hold"
        );

        $response->assertOk();

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'HELD',
            'held_by' => $user->id,
        ]);
    }


    public function test_expired_hold_can_be_taken_by_another_user(): void
    {
        $userA = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $userB = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'status' => 'HELD',
            'held_by' => $userA->id,
            'held_until' => now()->subMinute(),
        ]);

        Sanctum::actingAs($userB);

        $response = $this->postJson(
            "/api/seats/{$seat->id}/hold"
        );

        $response->assertOk();

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'HELD',
            'held_by' => $userB->id,
        ]);

        $seat->refresh();

        $this->assertTrue(
            $seat->held_until->isFuture()
        );
    }


    public function test_user_can_release_own_held_seat(): void
    {
        $user = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'status' => 'HELD',
            'held_by' => $user->id,
            'held_until' => now()->addMinutes(10),
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson(
            "/api/seats/{$seat->id}/hold"
        );

        $response->assertOk();

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'AVAILABLE',
            'held_by' => null,
            'held_until' => null,
        ]);
    }


    public function test_user_cannot_release_another_users_hold(): void
    {
        $userA = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $userB = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'status' => 'HELD',
            'held_by' => $userA->id,
            'held_until' => now()->addMinutes(10),
        ]);

        Sanctum::actingAs($userB);

        $response = $this->deleteJson(
            "/api/seats/{$seat->id}/hold"
        );

        $response->assertStatus(409);

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'HELD',
            'held_by' => $userA->id,
        ]);
    }


    public function test_user_cannot_hold_seat_of_cancelled_flight(): void
    {
        $user = User::factory()->create([
            'role' => 'CUSTOMER',
        ]);

        $seat = FlightSeat::factory()->create([
            'status' => 'AVAILABLE',
        ]);

        $seat->flight()->update([
            'status' => 'CANCELLED',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson(
            "/api/seats/{$seat->id}/hold"
        );

        $response->assertStatus(409);

        $this->assertDatabaseHas('flight_seats', [
            'id' => $seat->id,
            'status' => 'AVAILABLE',
            'held_by' => null,
        ]);
    }
}
