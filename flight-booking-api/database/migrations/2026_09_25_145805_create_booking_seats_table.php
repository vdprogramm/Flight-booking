<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_seats', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('passenger_id')
                ->constrained('passengers')
                ->cascadeOnDelete();

            $table->foreignId('flight_seat_id')
                ->constrained('flight_seats')
                ->restrictOnDelete();

            // Lưu giá tại thời điểm đặt
            $table->decimal('price', 12, 2);

            $table->timestamps();

            // Một ghế chỉ được thuộc một booking đã tạo
            $table->unique('flight_seat_id');

            // Một passenger chỉ nhận một ghế trong booking này
            $table->unique(['booking_id', 'passenger_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_seats');
    }
};
