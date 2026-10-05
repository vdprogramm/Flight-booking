<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'string', 'exists:airports,code'],
            'to' => ['required', 'string', 'different:from', 'exists:airports,code'],
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $flights = Flight::query()
            ->with([
                'airline:id,code,name,logo_url',
                'departureAirport:id,code,name,city',
                'arrivalAirport:id,code,name,city',
            ])
            ->whereHas('departureAirport', function ($query) use ($validated) {
                $query->where('code', strtoupper($validated['from']));
            })
            ->whereHas('arrivalAirport', function ($query) use ($validated) {
                $query->where('code', strtoupper($validated['to']));
            })
            ->whereDate('departure_time', $validated['date'])
            ->where('status', 'SCHEDULED')
            ->orderBy('departure_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $flights,
        ]);
    }

    public function show(Flight $flight): JsonResponse
    {
        $flight->load([
            'airline:id,code,name,logo_url',
            'departureAirport:id,code,name,city,country',
            'arrivalAirport:id,code,name,city,country',
        ]);

        $seatSummary = $flight->seats()
            ->selectRaw('
                seat_class_id,
                COUNT(*) as total_seats,
                COUNT(*) FILTER (WHERE status = ?) as available_seats,
                MIN(price) as min_price
            ', ['AVAILABLE'])
            ->groupBy('seat_class_id')
            ->with('seatClass:id,code,name')
            ->get();

        return response()->json([
            'success' => true,

            'data' => [
                'flight' => $flight,
                'seat_summary' => $seatSummary,
            ],
        ]);
    }

    public function seats(Request $request, Flight $flight): JsonResponse
    {
        $seats = $flight->seats()
            ->with('seatClass:id,code,name')
            ->orderBy('seat_number')
            ->get([
                'id',
                'flight_id',
                'seat_class_id',
                'seat_number',
                'price',
                'status',
                'held_until',
                'held_by',
            ]);

        $userId = $request->user('sanctum')?->id;

        $seatData = $seats->map(function ($seat) use ($userId) {
            return [
                'id' => $seat->id,
                'flight_id' => $seat->flight_id,
                'seat_class_id' => $seat->seat_class_id,
                'seat_number' => $seat->seat_number,
                'price' => $seat->price,
                'status' => $seat->status,
                'held_until' => $seat->held_until,
                'is_mine' => $userId !== null
                    && $seat->status === 'HELD'
                    && (int) $seat->held_by === (int) $userId
                    && $seat->held_until !== null
                    && $seat->held_until->isFuture(),
                'seat_class' => $seat->seatClass,
            ];
        });

        return response()->json([
            'success' => true,

            'flight' => [
                'id' => $flight->id,
                'flight_number' => $flight->flight_number,
            ],

            'data' => $seatData,
        ]);
    }
}
