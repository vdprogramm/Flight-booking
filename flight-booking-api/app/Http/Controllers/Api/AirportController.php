<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Airport;
use Illuminate\Http\JsonResponse;

class AirportController extends Controller
{
    public function index(): JsonResponse
    {
        $airports = Airport::query()
            ->orderBy('code')
            ->get([
                'id',
                'code',
                'name',
                'city',
                'country',
                'timezone',
            ]);

        return response()->json([
            'success' => true,
            'data' => $airports,
        ]);
    }
}
