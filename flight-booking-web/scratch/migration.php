<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_seats', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
        });

        // Đồng bộ trạng thái cho các bản ghi đã tồn tại.
        DB::statement("
            UPDATE booking_seats AS bs
            SET is_active = false
            FROM bookings AS b
            WHERE bs.booking_id = b.id
              AND b.status IN ('EXPIRED', 'CANCELLED')
        ");

        // Bỏ unique cũ: một ghế chỉ xuất hiện một lần trong toàn bộ lịch sử.
        Schema::table('booking_seats', function (Blueprint $table) {
            $table->dropUnique('booking_seats_flight_seat_id_unique');
        });

        // Một ghế chỉ được xuất hiện trong một booking đang hoạt động.
        DB::statement("
            CREATE UNIQUE INDEX booking_seats_active_seat_unique
            ON booking_seats (flight_seat_id)
            WHERE is_active = true
        ");
    }

    public function down(): void
    {
        // Không thể khôi phục unique cũ nếu một ghế đã có nhiều
        // bản ghi lịch sử. Chặn rollback để tránh làm mất dữ liệu.
        throw new RuntimeException(
            'Cannot safely roll back booking seat history migration.'
        );
    }
};
