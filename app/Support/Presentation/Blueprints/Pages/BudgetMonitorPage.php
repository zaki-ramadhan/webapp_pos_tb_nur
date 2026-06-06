<?php

namespace App\Support\Presentation\Blueprints\Pages;

class BudgetMonitorPage
{
    public static function get(array $navigationPages): array
    {
        return array_replace($navigationPages['budget-monitor'], [
            'budgetMonitor' => [
                'typeOptions' => ['Umum', 'Departemen'],
                'monthOptions' => ['Januari', 'Februari', 'Maret', 'April'],
                'yearOptions' => ['2026', '2025', '2024'],
                'defaults' => [
                    'type' => 'Umum',
                    'month' => 'Januari',
                    'year' => '2026',
                ],
                'accountPlaceholder' => 'Cari/Pilih Akun Perkiraan...',
                'branchPlaceholder' => 'Cari/Pilih...',
                'syncLabel' => 'Muat ulang monitor anggaran',
                'table' => [
                    'emptyLabel' => 'Belum ada data',
                    'columns' => [
                        ['id' => 'accountName', 'label' => 'Nama Akun', 'widthClassName' => 'w-[18%]'],
                        ['id' => 'accountCode', 'label' => 'Kode#', 'widthClassName' => 'w-[13%]'],
                        ['id' => 'budget', 'label' => 'Anggaran', 'widthClassName' => 'w-[13%]', 'align' => 'right'],
                        ['id' => 'usedBudget', 'label' => 'Penggunaan Anggaran', 'widthClassName' => 'w-[13%]', 'align' => 'right'],
                        ['id' => 'remainingBudget', 'label' => 'Sisa Anggaran', 'align' => 'right'],
                    ],
                ],
            ],
        ]);
    }
}
