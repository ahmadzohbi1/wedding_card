<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RsvpController extends Controller
{
    public function store(Request $request, Guest $guest): JsonResponse
    {
        $data = $request->validate([
            'responses' => ['required', 'array', 'min:1'],
            'responses.*.member_id' => ['required', 'integer'],
            'responses.*.status' => ['required', 'in:yes,no'],
        ]);

        $memberIds = $guest->members()->pluck('id');

        foreach ($data['responses'] as $response) {
            if (! $memberIds->contains($response['member_id'])) {
                continue;
            }

            $guest->members()->whereKey($response['member_id'])->update([
                'rsvp_status' => $response['status'],
                'responded_at' => now(),
            ]);
        }

        $guest->load('members');

        return response()->json([
            'members' => $guest->members->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
                'is_primary' => $member->is_primary,
                'rsvp_status' => $member->rsvp_status,
            ]),
        ]);
    }
}
