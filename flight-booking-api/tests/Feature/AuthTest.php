<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Nguyen Van A',
            'email' => 'user@example.com',
            'password' => '12345678',
            'password_confirmation' => '12345678',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'user@example.com',
            'role' => 'CUSTOMER',
        ]);
    }


    public function test_registered_user_cannot_create_admin_account(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Fake Admin',
            'email' => 'fakeadmin@example.com',
            'password' => '12345678',
            'password_confirmation' => '12345678',

            // Client cố tình gửi ADMIN
            'role' => 'ADMIN',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('users', [
            'email' => 'fakeadmin@example.com',
            'role' => 'CUSTOMER',
        ]);

        $this->assertDatabaseMissing('users', [
            'email' => 'fakeadmin@example.com',
            'role' => 'ADMIN',
        ]);
    }


    public function test_user_can_login(): void
    {
        User::create([
            'name' => 'User A',
            'email' => 'usera@example.com',
            'password' => '12345678',
            'role' => 'CUSTOMER',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'usera@example.com',
            'password' => '12345678',
        ]);

        $response->assertOk();

        $response->assertJsonStructure([
            'token',
        ]);
    }


    public function test_login_fails_with_wrong_password(): void
    {
        User::create([
            'name' => 'User A',
            'email' => 'usera@example.com',
            'password' => '12345678',
            'role' => 'CUSTOMER',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'usera@example.com',
            'password' => 'wrong-password',
        ]);

        // AuthController throws ValidationException which returns 422 Unprocessable Entity
        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['email']);
    }
}
