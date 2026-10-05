<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlightSeat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SeatHoldController extends Controller
{
    public function hold(Request $request, int $seatId): JsonResponse
    {
        $user = $request->user();

        $seat = DB::transaction(function () use ($seatId, $user) {

            $seat = FlightSeat::query()
                ->where('id', $seatId)
                ->lockForUpdate()
                ->first();

            if (!$seat) {
                return 'NOT_FOUND';
            }

            $flight = $seat->flight()
                ->lockForUpdate()
                ->first();

            if (
                !$flight ||
                $flight->status !== 'SCHEDULED'
            ) {
                return 'FLIGHT_NOT_AVAILABLE';
            }

            // Nếu HELD nhưng đã hết hạn -> release ngay
            if (
                $seat->status === 'HELD' &&
                $seat->held_until !== null &&
                $seat->held_until->isPast()
            ) {
                $seat->update([
                    'status' => 'AVAILABLE',
                    'held_by' => null,
                    'held_until' => null,
                ]);

                $seat->refresh();
            }

            // Chính user này đã giữ ghế
            if (
                $seat->status === 'HELD' &&
                (int) $seat->held_by === (int) $user->id
            ) {
                return $seat;
            }

            // BOOKED hoặc đang được user khác HELD
            if ($seat->status !== 'AVAILABLE') {
                return null;
            }

            $seat->update([
                'status' => 'HELD',
                'held_by' => $user->id,
                'held_until' => now()->addMinutes(10),
            ]);

            return $seat->fresh();

        }, 3); // retry transaction nếu gặp deadlock

        if ($seat === 'NOT_FOUND') {
            return response()->json([
                'success' => false,
                'message' => 'Seat not found.',
            ], 404);
        }

        if ($seat === 'FLIGHT_NOT_AVAILABLE') {
            return response()->json([
                'success' => false,
                'message' => 'Flight is not available for booking.',
            ], 409);
        }

        if ($seat === null) {
            return response()->json([
                'success' => false,
                'message' => 'Seat is not available.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Seat held successfully.',
            'data' => $seat,
        ]);
    }

    public function release(Request $request, int $seatId): JsonResponse
    {
        $user = $request->user();

        $released = DB::transaction(function () use ($seatId, $user) {

            $seat = FlightSeat::query()
                ->where('id', $seatId)
                ->lockForUpdate()
                ->firstOrFail();

            if (
                $seat->status !== 'HELD' ||
                $seat->held_by !== $user->id
            ) {
                return false;
            }

            $seat->update([
                'status' => 'AVAILABLE',
                'held_by' => null,
                'held_until' => null,
            ]);

            return true;
        });

        if (!$released) {
            return response()->json([
                'success' => false,
                'message' => 'You are not holding this seat.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Seat released successfully.',
        ]);
    }
}
