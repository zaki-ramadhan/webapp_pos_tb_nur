<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "--- Columns in Table: users ---\n";
$columns = \Illuminate\Support\Facades\DB::select("SHOW COLUMNS FROM `users`");
foreach ($columns as $column) {
    echo "- {$column->Field} ({$column->Type}) - Null: {$column->Null}, Key: {$column->Key}, Default: {$column->Default}\n";
}
