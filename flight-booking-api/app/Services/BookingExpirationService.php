<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\FlightSeat;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class BookingExpirationService
{
    public function expire(int $bookingId): bool
    {
        return DB::transaction(function () use ($bookingId) {

            $booking = Booking::query()
                ->where('id', $bookingId)
                ->lockForUpdate()
                ->first();

            if (!$booking) {
                return false;
            }

            if ($booking->status !== 'PENDING') {
                return false;
            }

            if (
                $booking->expires_at === null ||
                $booking->expires_at->isFuture()
            ) {
                return false;
            }

            $bookingSeats = BookingSeat::query()
                ->where('booking_id', $booking->id)
                ->get();

            $seatIds = $bookingSeats
                ->pluck('flight_seat_id')
                ->sort()
                ->values();

            $seats = FlightSeat::query()
                ->whereIn('id', $seatIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($seats as $seat) {
                if ($seat->status === 'HELD') {
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
             * Booking đã hết hạn nên giải phóng association
             * để flight_seat có thể được booking lại.
             */
            BookingSeat::query()
                ->where('booking_id', $booking->id)
                ->update([
                    'is_active' => false,
                ]);

            $booking->update([
                'status' => 'EXPIRED',
            ]);

            return true;
        });
    }
}
