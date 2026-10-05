<?php
$base = 'D:/PHP/FlightBooking/flight-booking-api/app';

function replaceDelete($file) {
    if (!file_exists($file)) return;
    $c = file_get_contents($file);
    $c = preg_replace("/BookingSeat::query\(\)\s*->where\('booking_id',\s*\\\$booking->id\)\s*->delete\(\);/s", "BookingSeat::query()\n                ->where('booking_id', \$booking->id)\n                ->update([\n                    'is_active' => false,\n                ]);", $c);
    file_put_contents($file, $c);
}

replaceDelete($base . '/Services/BookingExpirationService.php');
replaceDelete($base . '/Http/Controllers/Api/BookingController.php');
replaceDelete($base . '/Services/FlightCancellationService.php');

$f3 = $base . '/Models/BookingSeat.php';
$c3 = file_get_contents($f3);
if (strpos($c3, "'is_active'") === false) {
    $c3 = preg_replace("/protected \\\$fillable = \[([^\]]+)\];/s", "protected \$fillable = [$1, 'is_active'];", $c3);
    if (strpos($c3, "protected function casts()") === false) {
        $c3 = preg_replace("/\}\s*$/", "\n    protected function casts(): array\n    {\n        return [\n            'is_active' => 'boolean',\n            'price' => 'decimal:2',\n        ];\n    }\n}", $c3);
    } else {
        $c3 = preg_replace("/protected function casts\(\): array\s*\{\s*return\s*\[(.*?)\];/s", "protected function casts(): array\n    {\n        return [$1\n            'is_active' => 'boolean',\n        ];", $c3);
    }
}
file_put_contents($f3, $c3);

echo "Done\n";
