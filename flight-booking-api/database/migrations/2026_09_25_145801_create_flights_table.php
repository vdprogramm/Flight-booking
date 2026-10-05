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
        Schema::create('flights', function (Blueprint $table) {
            $table->id();

            $table->foreignId('airline_id')
                ->constrained('airlines')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('departure_airport_id')
                ->constrained('airports')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('arrival_airport_id')
                ->constrained('airports')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('flight_number', 20);

            $table->dateTime('departure_time');
            $table->dateTime('arrival_time');

            $table->string('aircraft_code', 50)->nullable();

            $table->enum('status', [
                'SCHEDULED',
                'DELAYED',
                'CANCELLED',
                'COMPLETED'
            ])->default('SCHEDULED');

            $table->timestamps();

            $table->index([
                'departure_airport_id',
                'arrival_airport_id',
                'departure_time'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};
