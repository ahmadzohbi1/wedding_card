<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GuestMember;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'tables' => Table::with('members.guest')->orderBy('name')->get()->map($this->transform(...)),
            'unassigned' => GuestMember::whereNull('table_id')->with('guest')->get()->map($this->transformMember(...))
                ->sortBy('guest_name')->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'zone' => ['required', Rule::in(['groom', 'bride'])],
            'seats' => ['required', 'integer', 'min:1', 'max:24'],
        ]);

        $table = Table::create($data);

        return response()->json(['table' => $this->transform($table->load('members.guest'))], 201);
    }

    public function update(Request $request, Table $table): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'zone' => ['required', Rule::in(['groom', 'bride'])],
            'seats' => ['required', 'integer', 'min:1', 'max:24'],
        ]);

        $seated = $table->members()->count();
        if ($data['seats'] < $seated) {
            throw ValidationException::withMessages([
                'seats' => "This table already seats {$seated} guests. Move some guests before shrinking it.",
            ]);
        }

        $table->update($data);

        return response()->json(['table' => $this->transform($table->load('members.guest'))]);
    }

    public function destroy(Table $table): JsonResponse
    {
        $table->delete();

        return response()->json(status: 204);
    }

    public function seat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'member_id' => ['required', 'integer', 'exists:guest_members,id'],
            'table_id' => ['nullable', 'integer', 'exists:tables,id'],
        ]);

        $member = GuestMember::findOrFail($data['member_id']);

        if (! empty($data['table_id'])) {
            $table = Table::findOrFail($data['table_id']);
            $seated = $table->members()->where('id', '!=', $member->id)->count();

            if ($seated >= $table->seats) {
                throw ValidationException::withMessages([
                    'table_id' => "{$table->name} is full.",
                ]);
            }
        }

        $member->update(['table_id' => $data['table_id'] ?? null]);

        return response()->json(['member' => $this->transformMember($member->load('guest'))]);
    }

    public function export(): StreamedResponse
    {
        $tables = Table::with('members.guest')->orderBy('zone')->orderBy('name')->get();
        $unassigned = GuestMember::whereNull('table_id')->with('guest')->get();

        $spreadsheet = new Spreadsheet;

        $this->writeSeatingSheet($spreadsheet->getActiveSheet(), $tables);
        $this->writeSummarySheet($spreadsheet->createSheet(), $tables);
        $this->writeUnassignedSheet($spreadsheet->createSheet(), $unassigned);

        $spreadsheet->setActiveSheetIndex(0);

        $filename = 'wedding-seating-'.now()->format('Y-m-d').'.xlsx';

        return new StreamedResponse(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function writeSeatingSheet($sheet, $tables): void
    {
        $sheet->setTitle('Seating Chart');
        $headers = ['Zone', 'Table', 'Seats', 'Guest', 'Invitation Party', 'RSVP'];
        $sheet->fromArray($headers, null, 'A1');
        $this->styleHeaderRow($sheet, count($headers));

        $row = 2;
        foreach ($tables as $table) {
            if ($table->members->isEmpty()) {
                $sheet->fromArray([ucfirst($table->zone), $table->name, $table->seats, '(no guests seated yet)', '', ''], null, "A{$row}");
                $row++;

                continue;
            }

            foreach ($table->members as $member) {
                $sheet->fromArray([
                    ucfirst($table->zone),
                    $table->name,
                    $table->seats,
                    $member->name,
                    $member->guest->name ?? '',
                    ucfirst($member->rsvp_status),
                ], null, "A{$row}");
                $row++;
            }
        }

        $this->autosize($sheet, count($headers));
    }

    private function writeSummarySheet($sheet, $tables): void
    {
        $sheet->setTitle('Tables Summary');
        $headers = ['Zone', 'Table', 'Seats', 'Seated', 'Empty Seats'];
        $sheet->fromArray($headers, null, 'A1');
        $this->styleHeaderRow($sheet, count($headers));

        $row = 2;
        foreach ($tables as $table) {
            $seated = $table->members->count();
            $sheet->fromArray([ucfirst($table->zone), $table->name, $table->seats, $seated, max(0, $table->seats - $seated)], null, "A{$row}");
            $row++;
        }

        $this->autosize($sheet, count($headers));
    }

    private function writeUnassignedSheet($sheet, $unassigned): void
    {
        $sheet->setTitle('Unassigned Guests');
        $headers = ['Guest', 'Invitation Party', 'Side', 'RSVP'];
        $sheet->fromArray($headers, null, 'A1');
        $this->styleHeaderRow($sheet, count($headers));

        $row = 2;
        foreach ($unassigned as $member) {
            $sheet->fromArray([
                $member->name,
                $member->guest->name ?? '',
                ucfirst($member->guest->side ?? ''),
                ucfirst($member->rsvp_status),
            ], null, "A{$row}");
            $row++;
        }

        $this->autosize($sheet, count($headers));
    }

    private function styleHeaderRow($sheet, int $columns): void
    {
        $range = 'A1:'.chr(64 + $columns).'1';
        $sheet->getStyle($range)->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet->getStyle($range)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('B76E79');
        $sheet->getStyle($range)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    }

    private function autosize($sheet, int $columns): void
    {
        for ($i = 1; $i <= $columns; $i++) {
            $sheet->getColumnDimensionByColumn($i)->setAutoSize(true);
        }
    }

    private function transform(Table $table): array
    {
        return [
            'id' => $table->id,
            'name' => $table->name,
            'zone' => $table->zone,
            'seats' => $table->seats,
            'members' => $table->members->map($this->transformMember(...))->values(),
        ];
    }

    private function transformMember(GuestMember $member): array
    {
        return [
            'id' => $member->id,
            'name' => $member->name,
            'rsvp_status' => $member->rsvp_status,
            'guest_id' => $member->guest_id,
            'guest_name' => $member->guest->name ?? '',
            'side' => $member->guest->side ?? null,
        ];
    }
}
