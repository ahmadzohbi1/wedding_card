<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Setting;
use Illuminate\Contracts\View\View;

class GuestInvitationController extends Controller
{
    public function show(Guest $guest): View
    {
        $guest->load('members');

        return view('invitation', [
            'guest' => [
                'slug' => $guest->slug,
                'name' => $guest->name,
                'gender' => $guest->gender,
                'members' => $guest->members->map(fn ($member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'is_primary' => $member->is_primary,
                    'rsvp_status' => $member->rsvp_status,
                ]),
            ],
            'showKidsMessage' => Setting::flag('show_kids_message'),
        ]);
    }
}
