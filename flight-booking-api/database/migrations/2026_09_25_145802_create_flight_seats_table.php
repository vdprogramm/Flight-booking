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
        Schema::create('flight_seats', function (Blueprint $table) {
            $table->id();

            $table->foreignId('flight_id')
                ->constrained('flights')
                ->cascadeOnDelete();

            $table->foreignId('seat_class_id')
                ->constrained('seat_classes')
                ->restrictOnDelete();

            $table->string('seat_number', 10);

            $table->decimal('price', 12, 2);

            $table->enum('status', [
                'AVAILABLE',
                'HELD',
                'BOOKED'
            ])->default('AVAILABLE');

            // User đang tạm giữ ghế
            $table->foreignId('held_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Thời điểm hết hạn giữ ghế
            $table->timestamp('held_until')->nullable();

            $table->timestamps();

            // Một chuyến bay không được có 2 ghế cùng số
            $table->unique(['flight_id', 'seat_number']);

            $table->index(['flight_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flight_seats');
    }
};
