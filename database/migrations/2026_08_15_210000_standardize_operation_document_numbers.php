<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!\Illuminate\Support\Facades\Schema::hasTable('operation_documents')) {
            return;
        }

         = [
            'sales_quote' => 'PN',
            'sales_order' => 'SO',
            'sales_delivery' => 'SJ',
            'sales_invoice' => 'FP',
            'sales_return' => 'RJ',
            'purchase_order' => 'PO',
            'goods_receipt' => 'PB',
            'purchase_invoice' => 'FB',
            'purchase_return' => 'RB',
            'payroll_entry' => 'GJ',
            'expense_entry' => 'BB',
            'general_journal' => 'JU',
            'cash_payment' => 'KK',
            'cash_receipt' => 'KM',
            'bank_transfer' => 'TB',
            'stock_transfer' => 'TP',
            'sales_deposit' => 'UM',
            'purchase_payment' => 'BYB',
            'purchase_deposit' => 'UMP',
            'sales_receipt' => 'KW',
            'item_request' => 'PBG',
            'inventory_adjustment' => 'PS',
            'price_adjustment' => 'PH',
            'work_order' => 'SPK',
            'material_addition' => 'FPB',
            'work_completion' => 'SPP',
            'asset_change' => 'PAA',
            'asset_disposal' => 'PDA',
            'asset_move' => 'PMA',
        ];

         = DB::table('operation_documents')->orderBy('id', 'asc')->get();
        foreach ( as ) {
             = (string) (->document_number ?? '');
             = ->document_type ?? 'operation';
             = [] ?? 'DOC';

             = ->entry_date ? \Carbon\Carbon::parse(->entry_date) : now();
             = ->format('Y');
             = ->format('m');

             = false;
            if (preg_match('/^[A-Z]+\.\d{4}\.\d{2}\.\d{4}$/', )) {
                 = explode('.', );
                if ([0] === ) {
                     = true;
                }
            }

            if (!) {
                 = 1;
                do {
                     = str_pad(, 4, '0', STR_PAD_LEFT);
                     = "{}.{}.{}.{}";
                     = DB::table('operation_documents')
                        ->where('document_number', )
                        ->where('id', '!=', ->id)
                        ->exists();
                    if () {
                        ++;
                    }
                } while ();

                DB::table('operation_documents')
                    ->where('id', ->id)
                    ->update(['document_number' => ]);
            }
        }
    }

    public function down(): void
    {
    }
};
