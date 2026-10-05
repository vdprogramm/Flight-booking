<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use App\Models\FlightSeat;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FlightSeatController extends Controller
{
    public function index(Flight $flight): JsonResponse
    {
        $seats = $flight->seats()
            ->with('seatClass:id,code,name')
            ->orderBy('seat_number')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $seats,
        ]);
    }


    public function generate(
        Request $request,
        Flight $flight
    ): JsonResponse {

        $validated = $request->validate([
            'classes' => [
                'required',
                'array',
                'min:1',
            ],

            'classes.*.seat_class_id' => [
                'required',
                'integer',
                'exists:seat_classes,id',
            ],

            'classes.*.start_row' => [
                'required',
                'integer',
                'min:1',
            ],

            'classes.*.end_row' => [
                'required',
                'integer',
                'min:1',
            ],

            'classes.*.letters' => [
                'required',
                'array',
                'min:1',
            ],

            'classes.*.letters.*' => [
                'required',
                'string',
                'max:2',
            ],

            'classes.*.price' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        if ($flight->seats()->exists()) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Seats have already been generated for this flight.',
            ], 409);
        }

        $created = DB::transaction(
            function () use ($validated, $flight) {

                $rows = [];

                foreach ($validated['classes'] as $class) {

                    if (
                        $class['end_row'] <
                        $class['start_row']
                    ) {
                        throw ValidationException::withMessages([
                            'classes' => [
                                'End row must be greater than or equal to start row.',
                            ],
                        ]);
                    }

                    foreach (
                        range(
                            $class['start_row'],
                            $class['end_row']
                        ) as $row
                    ) {

                        foreach (
                            $class['letters'] as $letter
                        ) {

                            $seatNumber =
                                $row .
                                strtoupper($letter);

                            $rows[] = [
                                'flight_id' => $flight->id,

                                'seat_class_id' =>
                                    $class['seat_class_id'],

                                'seat_number' =>
                                    $seatNumber,

                                'price' =>
                                    $class['price'],

                                'status' =>
                                    'AVAILABLE',

                                'held_by' =>
                                    null,

                                'held_until' =>
                                    null,

                                'created_at' =>
                                    now(),

                                'updated_at' =>
                                    now(),
                            ];
                        }
                    }
                }

                /*
                 * Kiểm tra trùng seat_number trong
                 * chính cấu hình request.
                 */
                $seatNumbers = collect($rows)
                    ->pluck('seat_number');

                if (
                    $seatNumbers->count() !==
                    $seatNumbers->unique()->count()
                ) {
                    throw ValidationException::withMessages([
                        'classes' => [
                            'Seat configuration contains duplicate seat numbers.',
                        ],
                    ]);
                }

                FlightSeat::insert($rows);

                return count($rows);
            }
        );

        return response()->json([
            'success' => true,
            'message' =>
                "{$created} seats generated successfully.",

            'data' => [
                'flight_id' => $flight->id,
                'total_created' => $created,
            ],
        ], 201);
    }
}
