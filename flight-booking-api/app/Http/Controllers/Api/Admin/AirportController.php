<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Airport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AirportController extends Controller
{
    public function index(): JsonResponse
    {
        $airports = Airport::query()
            ->orderBy('code')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $airports,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code', ''))),
        ]);

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:10',
                'unique:airports,code',
            ],
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'city' => [
                'required',
                'string',
                'max:100',
            ],
            'country' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        $airport = Airport::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Airport created successfully.',
            'data' => $airport,
        ], 201);
    }

    public function show(Airport $airport): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $airport,
        ]);
    }

    public function update(
        Request $request,
        Airport $airport
    ): JsonResponse {

        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code', ''))),
        ]);

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:10',

                Rule::unique('airports', 'code')
                    ->ignore($airport->id),
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'city' => [
                'required',
                'string',
                'max:100',
            ],

            'country' => [
                'required',
                'string',
                'max:100',
            ],
        ]);

        $airport->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Airport updated successfully.',
            'data' => $airport,
        ]);
    }

    public function destroy(Airport $airport): JsonResponse
    {
        $hasFlights =
            $airport->departingFlights()->exists() ||
            $airport->arrivingFlights()->exists();

        if ($hasFlights) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Cannot delete an airport that is being used by flights.',
            ], 409);
        }

        $airport->delete();

        return response()->json([
            'success' => true,
            'message' => 'Airport deleted successfully.',
        ]);
    }
}
