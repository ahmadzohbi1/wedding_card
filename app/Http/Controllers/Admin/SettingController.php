<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'show_kids_message' => Setting::flag('show_kids_message'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'show_kids_message' => ['required', 'boolean'],
        ]);

        Setting::setFlag('show_kids_message', $data['show_kids_message']);

        return response()->json([
            'show_kids_message' => Setting::flag('show_kids_message'),
        ]);
    }
}
