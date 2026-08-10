<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_custom_login_route(): void
    {
        $this->get('/admin/dashboard')->assertRedirect('/admin/getin');
    }

    public function test_admin_can_log_in_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@youver.net',
            'password' => bcrypt('secret-password'),
        ]);

        $response = $this->post('/admin/getin', [
            'email' => 'admin@youver.net',
            'password' => 'secret-password',
        ]);

        $response->assertRedirect('/admin/dashboard');
        $this->assertAuthenticated();
    }

    public function test_admin_cannot_log_in_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'admin@youver.net']);

        $response = $this->post('/admin/getin', [
            'email' => 'admin@youver.net',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }
}
