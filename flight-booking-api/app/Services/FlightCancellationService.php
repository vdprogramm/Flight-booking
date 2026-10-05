<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSeat;
use App\Models\Flight;
use App\Models\FlightSeat;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FlightCancellationService
{
    public function cancel(Flight $flight): Flight
    {
        return DB::transaction(function () use ($flight) {

            /*
             * Lock flight trước.
             */
            $flight = Flight::query()
                ->whereKey($flight->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($flight->status === 'CANCELLED') {
                return $flight;
            }

            if ($flight->status === 'COMPLETED') {
                throw ValidationException::withMessages([
                    'flight' => [
                        'Completed flight cannot be cancelled.',
                    ],
                ]);
            }

            /*
             * Lock toàn bộ booking của chuyến.
             */
            $bookings = Booking::query()
                ->where('flight_id', $flight->id)
                ->whereIn('status', [
                    'PENDING',
                    'CONFIRMED',
                ])
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($bookings as $booking) {

                /*
                 * Payment đã PAID:
                 *
                 * MVP chưa kết nối payment gateway thật,
                 * nên chuyển sang REFUNDED.
                 *
                 * Sau này PayOS/VNPay phải gọi refund
                 * gateway trước khi đánh dấu REFUNDED.
                 */
                Payment::query()
                    ->where('booking_id', $booking->id)
                    ->where('status', 'PAID')
                    ->update([
                        'status' => 'REFUNDED',
                    ]);

                /*
                 * Payment chưa thanh toán.
                 */
                Payment::query()
                    ->where('booking_id', $booking->id)
                    ->where('status', 'PENDING')
                    ->update([
                        'status' => 'FAILED',
                    ]);

                /*
                 * MVP hiện chưa có trạng thái
                 * CANCELLED_BY_AIRLINE.
                 *
                 * Tạm dùng CANCELLED.
                 */
                // Giữ lịch sử ghế nhưng giải phóng quyền sở hữu ghế.
                BookingSeat::query()
                    ->where('booking_id', $booking->id)
                    ->where('is_active', true)
                    ->update([
                        'is_active' => false,
                    ]);

                $booking->update([
                    'status' => 'CANCELLED',
                ]);
            }

            /*
             * Ghế của chuyến không còn được đặt nữa.
             *
             * Không để HELD tồn tại sau khi chuyến bị hủy.
             */
            FlightSeat::query()
                ->where('flight_id', $flight->id)
                ->where('status', 'HELD')
                ->update([
                    'status' => 'AVAILABLE',
                    'held_by' => null,
                    'held_until' => null,
                ]);

            $flight->update([
                'status' => 'CANCELLED',
            ]);

            return $flight->fresh();
        }, 3);
    }
}
