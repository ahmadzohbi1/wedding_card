<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GuestController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'guests' => Guest::with('members')->latest()->get()->map($this->transform(...)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'side' => ['required', Rule::in(['groom', 'bride'])],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'members' => ['array'],
            'members.*' => ['string', 'max:255'],
        ]);

        $guest = $this->createGuestGroup($data['name'], $data['side'], $data['gender'], $data['members'] ?? []);

        return response()->json(['guest' => $this->transform($guest)], 201);
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'side' => ['required', Rule::in(['groom', 'bride'])],
            'guests' => ['required', 'array', 'min:1'],
            'guests.*.name' => ['required', 'string', 'max:255'],
            'guests.*.gender' => ['required', Rule::in(['male', 'female'])],
            'guests.*.members' => ['array'],
            'guests.*.members.*' => ['string', 'max:255'],
        ]);

        $created = DB::transaction(fn () => collect($data['guests'])
            ->map(fn ($guestData) => $this->createGuestGroup($guestData['name'], $data['side'], $guestData['gender'], $guestData['members'] ?? []))
        );

        return response()->json(['guests' => $created->map($this->transform(...))], 201);
    }

    public function update(Request $request, Guest $guest): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'side' => ['required', Rule::in(['groom', 'bride'])],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'members' => ['array'],
            'members.*.id' => ['nullable', 'integer'],
            'members.*.name' => ['required', 'string', 'max:255'],
        ]);

        $guest->update(['name' => $data['name'], 'side' => $data['side'], 'gender' => $data['gender']]);
        $guest->members()->where('is_primary', true)->update(['name' => $data['name']]);

        $keepIds = [];

        foreach ($data['members'] ?? [] as $member) {
            if (! empty($member['id'])) {
                $guest->members()->whereKey($member['id'])->update(['name' => $member['name']]);
                $keepIds[] = $member['id'];
            } else {
                $keepIds[] = $guest->members()->create(['name' => $member['name']])->id;
            }
        }

        $guest->members()->whereNotIn('id', $keepIds)->where('is_primary', false)->delete();

        $guest->load('members');

        return response()->json(['guest' => $this->transform($guest)]);
    }

    public function destroy(Guest $guest): JsonResponse
    {
        $guest->delete();

        return response()->json(status: 204);
    }

    public function export(): StreamedResponse
    {
        $guests = Guest::with('members')->latest()->get();

        return response()->streamDownload(function () use ($guests) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Main Guest', 'Side', 'Invitation Link', 'Guests', 'Accepted', 'Declined', 'Pending', 'Total']);

            foreach ($guests as $guest) {
                $membersSummary = $guest->members
                    ->map(fn ($m) => $m->name.' ('.$m->rsvp_status.')')
                    ->implode('; ');

                fputcsv($handle, [
                    $guest->name,
                    ucfirst($guest->side),
                    $guest->url(),
                    $membersSummary,
                    $guest->members->where('rsvp_status', 'yes')->count(),
                    $guest->members->where('rsvp_status', 'no')->count(),
                    $guest->members->where('rsvp_status', 'pending')->count(),
                    $guest->members->count(),
                ]);
            }

            fclose($handle);
        }, 'wedding-guests-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    private function createGuestGroup(string $name, string $side, string $gender, array $members): Guest
    {
        $guest = Guest::create([
            'name' => $name,
            'slug' => $this->uniqueSlug($name),
            'side' => $side,
            'gender' => $gender,
        ]);

        $guest->members()->create([
            'name' => $name,
            'is_primary' => true,
        ]);

        foreach (array_filter($members, fn ($memberName) => trim($memberName) !== '') as $memberName) {
            $guest->members()->create(['name' => trim($memberName)]);
        }

        return $guest->load('members');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name).'-invitation-card';
        $slug = $base;
        $suffix = 2;

        while (Guest::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }

    private function transform(Guest $guest): array
    {
        return [
            'id' => $guest->id,
            'name' => $guest->name,
            'slug' => $guest->slug,
            'side' => $guest->side,
            'gender' => $guest->gender,
            'url' => $guest->url(),
            'members' => $guest->members->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'is_primary' => $m->is_primary,
                'rsvp_status' => $m->rsvp_status,
            ]),
            'counts' => [
                'accepted' => $guest->members->where('rsvp_status', 'yes')->count(),
                'declined' => $guest->members->where('rsvp_status', 'no')->count(),
                'pending' => $guest->members->where('rsvp_status', 'pending')->count(),
                'total' => $guest->members->count(),
            ],
        ];
    }
}
