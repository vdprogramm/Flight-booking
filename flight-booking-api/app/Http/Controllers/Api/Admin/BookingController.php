<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => [
                'nullable',
                Rule::in([
                    'PENDING',
                    'CONFIRMED',
                    'CANCELLED',
                    'EXPIRED',
                ]),
            ],

            'flight_id' => [
                'nullable',
                'integer',
                'exists:flights,id',
            ],

            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'search' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        $query = Booking::query()
            ->with([
                'user:id,name,email',
                'flight:id,airline_id,flight_number,departure_airport_id,arrival_airport_id,departure_time,arrival_time,status',
                'flight.airline:id,code,name',
                'flight.departureAirport:id,code,name,city',
                'flight.arrivalAirport:id,code,name,city',
                'payments:id,booking_id,payment_method,amount,status,transaction_code,paid_at',
            ])
            ->withCount([
                'passengers',
                'bookingSeats',
            ])
            ->orderByDesc('created_at');

        if (!empty($validated['status'])) {
            $query->where(
                'status',
                $validated['status']
            );
        }

        if (!empty($validated['flight_id'])) {
            $query->where(
                'flight_id',
                $validated['flight_id']
            );
        }

        if (!empty($validated['user_id'])) {
            $query->where(
                'user_id',
                $validated['user_id']
            );
        }

        if (!empty($validated['search'])) {
            $search = $validated['search'];

            $query->where(function ($q) use ($search) {
                $q->where(
                    'booking_code',
                    'ILIKE',
                    "%{$search}%"
                )
                ->orWhereHas(
                    'user',
                    function ($userQuery) use ($search) {
                        $userQuery
                            ->where(
                                'name',
                                'ILIKE',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'email',
                                'ILIKE',
                                "%{$search}%"
                            );
                    }
                );
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(20),
        ]);
    }


    public function show(
        Booking $booking
    ): JsonResponse {

        $booking->load([
            'user:id,name,email',
            'flight.airline',
            'flight.departureAirport',
            'flight.arrivalAirport',

            'passengers',

            'bookingSeats.flightSeat.seatClass',

            'payments',
        ]);

        return response()->json([
            'success' => true,
            'data' => $booking,
        ]);
    }
}
