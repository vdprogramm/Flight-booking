<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,

            'data' => [
                'users' => User::query()
                    ->where('role', 'CUSTOMER')
                    ->count(),

                'flights' => Flight::count(),

                'bookings' => Booking::count(),

                'confirmed_bookings' => Booking::query()
                    ->where('status', 'CONFIRMED')
                    ->count(),

                'bookings_chart' => Booking::query()
                    ->select(
                        DB::raw('DATE(created_at) as date'),
                        DB::raw('COUNT(*) as count'),
                        DB::raw("SUM(CASE WHEN status = 'CONFIRMED' THEN total_amount ELSE 0 END) as revenue")
                    )
                    ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
            ],
        ]);
    }
}
