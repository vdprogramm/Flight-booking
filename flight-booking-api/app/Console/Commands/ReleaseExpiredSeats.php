<?php

namespace App\Console\Commands;

use App\Models\FlightSeat;
use Illuminate\Console\Command;

class ReleaseExpiredSeats extends Command
{
    protected $signature = 'seats:release-expired';

    protected $description = 'Release expired seat holds';

    public function handle(): int
    {
        $count = FlightSeat::query()
            ->where('status', 'HELD')
            ->whereNotNull('held_until')
            ->where('held_until', '<=', now())
            ->update([
                'status' => 'AVAILABLE',
                'held_by' => null,
                'held_until' => null,
                'updated_at' => now(),
            ]);

        $this->info("Released {$count} expired seat(s).");

        return self::SUCCESS;
    }
}
