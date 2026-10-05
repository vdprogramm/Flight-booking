<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Flight;
use App\Models\FlightSeat;
use App\Models\Passenger;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'flight_id' => [
                'required',
                'integer',
                'exists:flights,id'
            ],

            'passengers' => [
                'required',
                'array',
                'min:1'
            ],

            'passengers.*.flight_seat_id' => [
                'required',
                'integer',
                'distinct',
                'exists:flight_seats,id'
            ],

            'passengers.*.first_name' => [
                'required',
                'string',
                'max:100'
            ],

            'passengers.*.last_name' => [
                'required',
                'string',
                'max:100'
            ],

            'passengers.*.date_of_birth' => [
                'required',
                'date'
            ],

            'passengers.*.gender' => [
                'nullable',
                'in:MALE,FEMALE,OTHER'
            ],

            'passengers.*.document_number' => [
                'nullable',
                'string',
                'max:50'
            ],

            'passengers.*.nationality' => [
                'nullable',
                'string',
                'max:100'
            ],
        ]);

        $user = $request->user();

        $booking = DB::transaction(function () use (
            $validated,
            $user
        ) {

            $flight = Flight::query()
                ->whereKey($validated['flight_id'])
                ->lockForUpdate()
                ->firstOrFail();
            
            if ($flight->status !== 'SCHEDULED') {
                throw ValidationException::withMessages([
                    'flight_id' => [
                        'Flight is not available for booking.',
                    ],
                ]);
            }

            $seatIds = collect($validated['passengers'])
                ->pluck('flight_seat_id')
                ->sort()
                ->values();

            /*
             * Khóa tất cả ghế.
             *
             * orderBy('id') rất quan trọng khi khóa nhiều ghế:
             * các transaction khóa theo cùng thứ tự để giảm nguy cơ
             * deadlock.
             */
            $seats = FlightSeat::query()
                ->whereIn('id', $seatIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            if ($seats->count() !== $seatIds->count()) {
                throw ValidationException::withMessages([
                    'seats' => ['One or more seats do not exist.'],
                ]);
            }

            foreach ($seats as $seat) {

                if ($seat->flight_id !== (int) $validated['flight_id']) {
                    throw ValidationException::withMessages([
                        'seats' => [
                            "Seat {$seat->seat_number} does not belong to this flight."
                        ],
                    ]);
                }

                if (
                    $seat->status !== 'HELD' ||
                    $seat->held_by !== $user->id ||
                    $seat->held_until === null ||
                    $seat->held_until->isPast()
                ) {
                    throw ValidationException::withMessages([
                        'seats' => [
                            "Seat {$seat->seat_number} is not held by you or the hold has expired."
                        ],
                    ]);
                }
            }

            $totalAmount = $seats->sum(
                fn ($seat) => (float) $seat->price
            );

            $booking = Booking::create([
                'booking_code' =>
                    'FB-' . strtoupper(Str::random(8)),

                'user_id' => $user->id,

                'flight_id' => $validated['flight_id'],

                'status' => 'PENDING',

                'total_amount' => $totalAmount,

                'expires_at' => now()->addMinutes(10),
            ]);

            $seatsById = $seats->keyBy('id');

            foreach ($validated['passengers'] as $data) {

                $passenger = Passenger::create([
                    'booking_id' => $booking->id,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'date_of_birth' => $data['date_of_birth'],
                    'gender' => $data['gender'] ?? null,
                    'document_number' =>
                        $data['document_number'] ?? null,
                    'nationality' =>
                        $data['nationality'] ?? null,
                ]);

                $seat = $seatsById[
                    $data['flight_seat_id']
                ];

                BookingSeat::create([
                    'booking_id' => $booking->id,
                    'passenger_id' => $passenger->id,
                    'flight_seat_id' => $seat->id,
                    'price' => $seat->price,
                ]);
            }

            Payment::create([
                'booking_id' => $booking->id,
                'payment_method' => 'MOCK',
                'amount' => $totalAmount,
                'status' => 'PENDING',
            ]);

            return $booking;
        });

        $booking->load([
            'flight.airline',
            'flight.departureAirport',
            'flight.arrivalAirport',
            'passengers',
            'bookingSeats.flightSeat.seatClass',
            'payments',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking created successfully.',
            'data' => $booking,
        ], 201);
    }

    public function pay(
        Request $request,
        Booking $booking
    ): JsonResponse {

        if ($booking->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden.',
            ], 403);
        }

        $booking = DB::transaction(function () use (
            $booking,
            $request
        ) {

            /*
             * Khóa booking trước.
             */
            $booking = Booking::query()
                ->where('id', $booking->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($booking->status !== 'PENDING') {
                throw ValidationException::withMessages([
                    'booking' => [
                        'Booking is not pending.'
                    ],
                ]);
            }

            if (
                $booking->expires_at === null ||
                $booking->expires_at->isPast()
            ) {
                throw ValidationException::withMessages([
                    'booking' => [
                        'Booking has expired.'
                    ],
                ]);
            }

            $flight = Flight::query()
                ->whereKey($booking->flight_id)
                ->lockForUpdate()
                ->firstOrFail();
            
            if ($flight->status !== 'SCHEDULED') {
                throw ValidationException::withMessages([
                    'flight' => [
                        'Flight is no longer available.',
                    ],
                ]);
            }

            $bookingSeats = BookingSeat::query()
                ->where('booking_id', $booking->id)
                ->get();

            $seatIds = $bookingSeats
                ->pluck('flight_seat_id')
                ->sort()
                ->values();

            /*
             * Khóa lại toàn bộ ghế trước khi xác nhận.
             */
            $seats = FlightSeat::query()
                ->whereIn('id', $seatIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($seats as $seat) {

                if (
                    $seat->status !== 'HELD' ||
                    (int) $seat->held_by !== (int) $request->user()->id ||
                    $seat->held_until === null ||
                    $seat->held_until->isPast()
                ) {
                    throw ValidationException::withMessages([
                        'seat' => [
                            "Seat {$seat->seat_number} hold has expired."
                        ],
                    ]);
                }
            }

            $payment = Payment::query()
                ->where('booking_id', $booking->id)
                ->where('status', 'PENDING')
                ->lockForUpdate()
                ->firstOrFail();

            /*
             * Giả lập payment thành công.
             */
            $payment->update([
                'status' => 'PAID',

                'transaction_code' =>
                    'MOCK-' . strtoupper(Str::random(12)),

                'paid_at' => now(),
            ]);

            /*
             * HELD -> BOOKED
             */
            foreach ($seats as $seat) {
                $seat->update([
                    'status' => 'BOOKED',
                    'held_by' => null,
                    'held_until' => null,
                ]);
            }

            /*
             * PENDING -> CONFIRMED
             */
            $booking->update([
                'status' => 'CONFIRMED',
            ]);

            return $booking;
        });

        $booking->load([
            'passengers',
            'bookingSeats.flightSeat',
            'payments',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment successful.',
            'data' => $booking,
        ]);
    }

    public function payment(
        Request $request,
        Booking $booking
    ): JsonResponse {

        if (
            (int) $booking->user_id !==
            (int) $request->user()->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        $payment = Payment::query()
            ->where('booking_id', $booking->id)
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'flight.airline:id,code,name,logo_url',
                'flight.departureAirport:id,code,name,city',
                'flight.arrivalAirport:id,code,name,city',
                'bookingSeats.flightSeat.seatClass',
                'payments:id,booking_id,payment_method,amount,status,paid_at',
            ])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    public function show(
        Request $request,
        Booking $booking
    ): JsonResponse {

        if ((int) $booking->user_id !== (int) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        $booking->load([
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

    public function cancel(
        Request $request,
        Booking $booking
    ): JsonResponse {

        if ((int) $booking->user_id !== (int) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found.',
            ], 404);
        }

        DB::transaction(function () use ($booking, $request) {

            // Lock booking
            $booking = Booking::query()
                ->where('id', $booking->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($booking->status !== 'PENDING') {
                throw ValidationException::withMessages([
                    'booking' => [
                        'Only pending bookings can be cancelled.'
                    ],
                ]);
            }

            $bookingSeats = BookingSeat::query()
                ->where('booking_id', $booking->id)
                ->get();

            $seatIds = $bookingSeats
                ->pluck('flight_seat_id')
                ->sort()
                ->values();

            // Lock tất cả seat liên quan
            $seats = FlightSeat::query()
                ->whereIn('id', $seatIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($seats as $seat) {

                if (
                    $seat->status === 'HELD' &&
                    (int) $seat->held_by === (int) $request->user()->id
                ) {
                    $seat->update([
                        'status' => 'AVAILABLE',
                        'held_by' => null,
                        'held_until' => null,
                    ]);
                }
            }

            Payment::query()
                ->where('booking_id', $booking->id)
                ->where('status', 'PENDING')
                ->update([
                    'status' => 'FAILED',
                ]);

            /*
             * Schema hiện tại có UNIQUE flight_seat_id.
             * Booking bị hủy phải giải phóng association này.
             */
            BookingSeat::query()
                ->where('booking_id', $booking->id)
                ->update([
                    'is_active' => false,
                ]);

            $booking->update([
                'status' => 'CANCELLED',
            ]);
        }, 3);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully.',
        ]);
    }
}
