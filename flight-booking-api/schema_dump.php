<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$result = collect(['bookings', 'passengers', 'booking_seats', 'payments'])->mapWithKeys(fn ($t) => [$t => \Illuminate\Support\Facades\Schema::getColumnListing($t)])->all();
echo json_encode($result, JSON_PRETTY_PRINT);
