<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Airline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AirlineController extends Controller
{
    public function index(): JsonResponse
    {
        $airlines = Airline::query()
            ->withCount('flights')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $airlines,
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
                'unique:airlines,code',
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'logo_url' => [
                'nullable',
                'url',
                'max:255',
            ],
        ]);

        $validated['code'] =
            strtoupper($validated['code']);

        $airline = Airline::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Airline created successfully.',
            'data' => $airline,
        ], 201);
    }

    public function show(Airline $airline): JsonResponse
    {
        $airline->loadCount('flights');

        return response()->json([
            'success' => true,
            'data' => $airline,
        ]);
    }

    public function update(
        Request $request,
        Airline $airline
    ): JsonResponse {
        $request->merge([
            'code' => strtoupper(trim((string) $request->input('code', ''))),
        ]);

        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:10',

                Rule::unique('airlines', 'code')
                    ->ignore($airline->id),
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'logo_url' => [
                'nullable',
                'url',
                'max:255',
            ],
        ]);

        $validated['code'] =
            strtoupper($validated['code']);

        $airline->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Airline updated successfully.',
            'data' => $airline,
        ]);
    }

    public function destroy(
        Airline $airline
    ): JsonResponse {

        if ($airline->flights()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete an airline that has flights.',
            ], 409);
        }

        $airline->delete();

        return response()->json([
            'success' => true,
            'message' => 'Airline deleted successfully.',
        ]);
    }
}
