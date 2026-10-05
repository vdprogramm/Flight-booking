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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->string('transaction_code', 100)
                ->nullable()
                ->unique();

            $table->enum('payment_method', [
                'MOCK',
                'VNPAY',
                'PAYOS'
            ])->default('MOCK');

            $table->decimal('amount', 12, 2);

            $table->enum('status', [
                'PENDING',
                'PAID',
                'FAILED',
                'REFUNDED'
            ])->default('PENDING');

            $table->timestamp('paid_at')->nullable();

            $table->json('gateway_response')->nullable();

            $table->timestamps();

            $table->index(['booking_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
