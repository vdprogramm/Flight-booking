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
        Schema::create('passengers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->string('first_name', 100);
            $table->string('last_name', 100);

            $table->date('date_of_birth');

            $table->enum('gender', [
                'MALE',
                'FEMALE',
                'OTHER'
            ])->nullable();

            $table->string('document_number', 50)->nullable();

            $table->string('nationality', 100)->nullable();

            $table->timestamps();

            $table->index('booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};
