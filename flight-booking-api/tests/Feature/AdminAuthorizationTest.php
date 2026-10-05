<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;


    public function test_guest_cannot_access_admin_dashboard(): void
    {
        $response = $this->getJson(
            '/api/admin/dashboard'
        );

        $response->assertUnauthorized();
    }


    public function test_customer_cannot_access_admin_dashboard(): void
    {
        $customer = User::create([
            'name' => 'Customer',
            'email' => 'customer@example.com',
            'password' => '12345678',
            'role' => 'CUSTOMER',
        ]);

        Sanctum::actingAs($customer);

        $response = $this->getJson(
            '/api/admin/dashboard'
        );

        $response->assertForbidden();
    }


    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => '12345678',
            'role' => 'ADMIN',
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson(
            '/api/admin/dashboard'
        );

        $response
            ->assertOk()
            ->assertJsonStructure([
                'success',

                'data' => [
                    'users',
                    'flights',
                    'bookings',
                    'confirmed_bookings',
                ],
            ]);
    }
}
