<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Airline extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'name',
        'logo_url',
    ];

    public function flights(): HasMany
    {
        return $this->hasMany(Flight::class);
    }
}
