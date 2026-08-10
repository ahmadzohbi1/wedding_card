<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_kids_message_flag_defaults_to_shown_on_the_public_page(): void
    {
        $this->get('/')->assertSee('data-show-kids-message="1"', false);
    }

    public function test_admin_can_toggle_the_kids_message_off(): void
    {
        $this->actingAs(User::factory()->create());

        $this->patchJson('/admin/api/settings', ['show_kids_message' => false])
            ->assertOk()
            ->assertJsonPath('show_kids_message', false);

        $this->get('/')->assertSee('data-show-kids-message="0"', false);
    }
}
