<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $specificMapping = [
            'kg' => 'KG',
            'kilogram' => 'Kilogram',
            'pcs' => 'Pcs',
            'zak' => 'Zak',
            'batang' => 'Batang',
            'btg' => 'Btg',
            'galon' => 'Galon',
            'gln' => 'Galon',
            'lembar' => 'Lembar',
            'lbr' => 'Lembar',
            'buah' => 'Buah',
            'buh' => 'Buah',
            'roll' => 'Roll',
            'rol' => 'Roll',
            'tube' => 'Tube',
            'tub' => 'Tube',
            'pick up' => 'Pick Up',
            'pup' => 'Pick Up',
            'kaleng' => 'Kaleng',
            'klg' => 'Kaleng',
            'paket' => 'Paket',
            'pkt' => 'Paket',
            'dus / box' => 'Dus / Box',
            'dus' => 'Dus',
            'box' => 'Box',
            'rim' => 'Rim',
            'sak' => 'Sak',
            'meter' => 'Meter',
            'm' => 'M',
            'cm' => 'CM',
            'mm' => 'MM',
            'liter' => 'Liter',
            'l' => 'L',
        ];

        $units = DB::table('units')->get();

        foreach ($units as $unit) {
            $trimmed = trim((string) $unit->name);
            $lower = mb_strtolower($trimmed);

            if (isset($specificMapping[$lower])) {
                $newName = $specificMapping[$lower];
            } else {
                $newName = mb_convert_case($trimmed, MB_CASE_TITLE, 'UTF-8');
            }

            if ($newName !== $unit->name) {
                DB::table('units')->where('id', $unit->id)->update([
                    'name' => $newName,
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op
    }
};
