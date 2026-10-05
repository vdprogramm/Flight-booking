<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use App\Services\FlightCancellationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FlightController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Flight::query()
            ->with([
                'airline:id,code,name',
                'departureAirport:id,code,name,city',
                'arrivalAirport:id,code,name,city',
            ])
            ->withCount('seats')
            ->orderByDesc('departure_time');

        if ($request->filled('status')) {
            $query->where(
                'status',
                strtoupper($request->status)
            );
        }

        if ($request->filled('airline_id')) {
            $query->where(
                'airline_id',
                $request->airline_id
            );
        }

        $flights = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $flights,
        ]);
    }


    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateFlight($request);

        if (
            (int) $validated['departure_airport_id'] ===
            (int) $validated['arrival_airport_id']
        ) {
            throw ValidationException::withMessages([
                'arrival_airport_id' => [
                    'Arrival airport must be different from departure airport.',
                ],
            ]);
        }

        $flight = Flight::create($validated);

        $flight->load([
            'airline:id,code,name',
            'departureAirport:id,code,name,city',
            'arrivalAirport:id,code,name,city',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Flight created successfully.',
            'data' => $flight,
        ], 201);
    }


    public function show(Flight $flight): JsonResponse
    {
        $flight->load([
            'airline',
            'departureAirport',
            'arrivalAirport',
            'seats.seatClass',
        ]);

        return response()->json([
            'success' => true,
            'data' => $flight,
        ]);
    }


    public function update(
        Request $request,
        Flight $flight
    ): JsonResponse {

        /*
         * Không cho sửa thông tin quan trọng nếu
         * chuyến đã có booking CONFIRMED.
         */
        if (
            $flight->bookings()
                ->where('status', 'CONFIRMED')
                ->exists()
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Cannot modify a flight that already has confirmed bookings.',
            ], 409);
        }

        $validated = $this->validateFlight(
            $request,
            $flight
        );

        if (
            (int) $validated['departure_airport_id'] ===
            (int) $validated['arrival_airport_id']
        ) {
            throw ValidationException::withMessages([
                'arrival_airport_id' => [
                    'Arrival airport must be different from departure airport.',
                ],
            ]);
        }

        $flight->update($validated);

        $flight->load([
            'airline:id,code,name',
            'departureAirport:id,code,name,city',
            'arrivalAirport:id,code,name,city',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Flight updated successfully.',
            'data' => $flight,
        ]);
    }


    public function destroy(Flight $flight): JsonResponse
    {
        if ($flight->bookings()->exists()) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Cannot delete a flight that has bookings.',
            ], 409);
        }

        $flight->delete();

        return response()->json([
            'success' => true,
            'message' => 'Flight deleted successfully.',
        ]);
    }


    public function cancel(
        Flight $flight,
        FlightCancellationService $service
    ): JsonResponse {

        $flight = $service->cancel($flight);

        return response()->json([
            'success' => true,
            'message' => 'Flight cancelled successfully.',
            'data' => $flight,
        ]);
    }


    private function validateFlight(
        Request $request,
        ?Flight $flight = null
    ): array {

        return $request->validate([
            'airline_id' => [
                'required',
                'integer',
                'exists:airlines,id',
            ],

            'flight_number' => [
                'required',
                'string',
                'max:20',

                Rule::unique(
                    'flights',
                    'flight_number'
                )->ignore($flight?->id),
            ],

            'departure_airport_id' => [
                'required',
                'integer',
                'exists:airports,id',
            ],

            'arrival_airport_id' => [
                'required',
                'integer',
                'exists:airports,id',
            ],

            'departure_time' => [
                'required',
                'date',
            ],

            'arrival_time' => [
                'required',
                'date',
                'after:departure_time',
            ],

            'aircraft_code' => [
                'required',
                'string',
                'max:20',
            ],

            'status' => [
                'required',

                Rule::in([
                    'SCHEDULED',
                    'DELAYED',
                    'CANCELLED',
                    'COMPLETED',
                ]),
            ],
        ]);
    }
}
