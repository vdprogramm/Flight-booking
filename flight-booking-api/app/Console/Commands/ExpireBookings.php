<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Services\BookingExpirationService;
use Illuminate\Console\Command;

class ExpireBookings extends Command
{
    protected $signature = 'bookings:expire';

    protected $description = 'Expire pending bookings and release their seats';

    public function handle(
        BookingExpirationService $expirationService
    ): int {

        $bookingIds = Booking::query()
            ->where('status', 'PENDING')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->pluck('id');

        $count = 0;

        foreach ($bookingIds as $bookingId) {
            if ($expirationService->expire($bookingId)) {
                $count++;
            }
        }

        $this->info("Expired {$count} booking(s).");

        return self::SUCCESS;
    }
}
