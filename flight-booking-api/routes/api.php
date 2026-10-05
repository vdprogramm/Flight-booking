<?php

use App\Http\Controllers\Api\AirportController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\Admin\AirlineController;
use App\Http\Controllers\Api\Admin\AirportController as AdminAirportController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\FlightController as AdminFlightController;
use App\Http\Controllers\Api\Admin\FlightSeatController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SeatHoldController;
use App\Models\SeatClass;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/airports', [AirportController::class, 'index']);
Route::get('/flights', [FlightController::class, 'index']);
Route::get(
    '/flights/{flight}',
    [FlightController::class, 'show']
);
Route::get('/flights/{flight}/seats', [FlightController::class, 'seats']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);

    Route::post(
        '/seats/{seatId}/hold',
        [SeatHoldController::class, 'hold']
    );

    Route::delete(
        '/seats/{seatId}/hold',
        [SeatHoldController::class, 'release']
    );

    Route::post(
        '/bookings',
        [BookingController::class, 'store']
    );

    Route::get(
        '/my-bookings',
        [BookingController::class, 'index']
    );

    Route::get(
        '/bookings/{booking}',
        [BookingController::class, 'show']
    );

    Route::delete(
        '/bookings/{booking}',
        [BookingController::class, 'cancel']
    );

    Route::post(
        '/bookings/{booking}/pay',
        [BookingController::class, 'pay']
    );

    Route::put(
        '/profile',
        [ProfileController::class, 'update']
    );

    Route::put(
        '/password',
        [ProfileController::class, 'changePassword']
    );

    Route::get(
        '/bookings/{booking}/payment',
        [BookingController::class, 'payment']
    );

    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware([
    'auth:sanctum',
    'admin',
])
    ->prefix('admin')
    ->group(function () {

        Route::get(
            '/dashboard',
            [DashboardController::class, 'index']
        );

        Route::apiResource(
            'airlines',
            AirlineController::class
        );

        Route::apiResource(
            'airports',
            AdminAirportController::class
        );

        Route::apiResource(
            'flights',
            AdminFlightController::class
        );

        Route::post(
            '/flights/{flight}/cancel',
            [AdminFlightController::class, 'cancel']
        );

        Route::get(
            '/flights/{flight}/seats',
            [FlightSeatController::class, 'index']
        );

        Route::post(
            '/flights/{flight}/seats/generate',
            [FlightSeatController::class, 'generate']
        );

        Route::get(
            '/bookings',
            [AdminBookingController::class, 'index']
        );

        Route::get(
            '/bookings/{booking}',
            [AdminBookingController::class, 'show']
        );

        Route::get('/seat-classes', function () {
            return response()->json([
                'success' => true,
                'data' => SeatClass::query()
                    ->orderBy('id')
                    ->get(['id', 'code', 'name']),
            ]);
        });

    });
