<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class FlightSeat extends Model
{
    use HasFactory;
    protected $fillable = [
        'flight_id',
        'seat_class_id',
        'seat_number',
        'price',
        'status',
        'held_by',
        'held_until',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'held_until' => 'datetime',
    ];

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    public function seatClass(): BelongsTo
    {
        return $this->belongsTo(SeatClass::class);
    }

    public function heldByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'held_by');
    }

    public function bookingSeat(): HasOne
    {
        return $this->hasOne(BookingSeat::class);
    }
}
