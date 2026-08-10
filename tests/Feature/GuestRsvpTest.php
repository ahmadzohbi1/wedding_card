<?php

namespace Tests\Feature;

use App\Models\Guest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestRsvpTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsAdmin(): User
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        return $admin;
    }

    public function test_creating_a_guest_group_generates_a_unique_slug_and_members(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/admin/api/guests', [
            'name' => 'Moustafa',
            'members' => ['Taha', 'Maryam'],
        ]);

        $response->assertCreated();
        $response->assertJsonPath('guest.slug', 'moustafa-invitation-card');
        $response->assertJsonCount(3, 'guest.members');

        $this->assertDatabaseHas('guests', ['slug' => 'moustafa-invitation-card']);
        $this->assertDatabaseHas('guest_members', ['name' => 'Moustafa', 'is_primary' => true]);
        $this->assertDatabaseHas('guest_members', ['name' => 'Taha', 'is_primary' => false]);
    }

    public function test_duplicate_names_get_a_unique_slug_suffix(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/admin/api/guests', ['name' => 'Moustafa', 'members' => []]);
        $response = $this->postJson('/admin/api/guests', ['name' => 'Moustafa', 'members' => []]);

        $response->assertJsonPath('guest.slug', 'moustafa-invitation-card-2');
    }

    public function test_guest_can_view_their_personalized_invitation(): void
    {
        $this->actingAsAdmin();
        $this->postJson('/admin/api/guests', ['name' => 'Moustafa', 'members' => ['Taha']]);

        $response = $this->get('/moustafa-invitation-card');

        $response->assertOk();
        $response->assertSee('Moustafa', false);
    }

    public function test_rsvp_submission_persists_per_member_status(): void
    {
        $this->actingAsAdmin();
        $created = $this->postJson('/admin/api/guests', ['name' => 'Moustafa', 'members' => ['Taha', 'Maryam']]);
        $guest = Guest::where('slug', 'moustafa-invitation-card')->firstOrFail();
        $members = $created->json('guest.members');

        $response = $this->postJson("/rsvp/{$guest->slug}", [
            'responses' => [
                ['member_id' => $members[0]['id'], 'status' => 'yes'],
                ['member_id' => $members[1]['id'], 'status' => 'yes'],
                ['member_id' => $members[2]['id'], 'status' => 'no'],
            ],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('guest_members', ['id' => $members[0]['id'], 'rsvp_status' => 'yes']);
        $this->assertDatabaseHas('guest_members', ['id' => $members[2]['id'], 'rsvp_status' => 'no']);
    }

    public function test_unknown_slug_returns_404(): void
    {
        $this->get('/not-a-real-invitation-card')->assertNotFound();
    }

    public function test_admin_can_edit_a_guest_group_by_id(): void
    {
        $this->actingAsAdmin();
        $created = $this->postJson('/admin/api/guests', ['name' => 'Moustafa', 'members' => ['Taha']]);
        $guestId = $created->json('guest.id');
        $tahaId = $created->json('guest.members.1.id');

        $response = $this->patchJson("/admin/api/guests/{$guestId}", [
            'name' => 'Moustafa',
            'members' => [['id' => $tahaId, 'name' => 'Taha Renamed'], ['name' => 'Zeina']],
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('guest_members', ['id' => $tahaId, 'name' => 'Taha Renamed']);
        $this->assertDatabaseHas('guest_members', ['guest_id' => $guestId, 'name' => 'Zeina']);
    }

    public function test_admin_can_delete_a_guest_group_by_id(): void
    {
        $this->actingAsAdmin();
        $created = $this->postJson('/admin/api/guests', ['name' => 'Moustafa', 'members' => []]);
        $guestId = $created->json('guest.id');

        $this->deleteJson("/admin/api/guests/{$guestId}")->assertNoContent();

        $this->assertDatabaseMissing('guests', ['id' => $guestId]);
    }

    public function test_admin_can_bulk_create_multiple_guest_groups_at_once(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/admin/api/guests/bulk', [
            'guests' => [
                ['name' => 'Moustafa', 'members' => ['Taha', 'Maryam']],
                ['name' => 'Moustafa', 'members' => []],
                ['name' => 'Sarah', 'members' => ['Karim']],
            ],
        ]);

        $response->assertCreated();
        $response->assertJsonCount(3, 'guests');
        $response->assertJsonPath('guests.0.slug', 'moustafa-invitation-card');
        $response->assertJsonPath('guests.1.slug', 'moustafa-invitation-card-2');
        $response->assertJsonPath('guests.2.slug', 'sarah-invitation-card');

        $this->assertDatabaseCount('guests', 3);
        $this->assertDatabaseHas('guest_members', ['name' => 'Karim', 'is_primary' => false]);
    }
}
