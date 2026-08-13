import subprocess

def run_php(code):
    cmd = ["php", "artisan", "tinker", "--execute", code]
    res = subprocess.run(cmd, cwd=r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp", capture_output=True, text=True)
    return res.stdout, res.stderr

script = """
use App\\Support\\Backend\\BackendResourceRegistry;
use App\\Support\\Backend\\BackendResourceWriter;
use App\\Domain\\Support\\Models\\OperationDocument;
use Illuminate\\Support\\Facades\\DB;

echo "=== AUDIT 1: VERIFYING ALL RESOURCE BLUEPRINTS IN REGISTRY ===\\n";
$resourceKeys = [
    'sales-orders', 'sales-deposits', 'sales-invoices', 'sales-receipts', 'sales-returns',
    'purchase-orders', 'goods-receipts', 'purchase-deposits', 'purchase-invoices', 'purchase-payments', 'purchase-returns',
    'cash-payments', 'cash-receipts', 'bank-transfers', 'inventory-adjustments', 'stock-transfers',
    'expense-entries', 'payroll-entries', 'general-journals'
];

$writer = app(BackendResourceWriter::class);

foreach ($resourceKeys as $key) {
    $bp = BackendResourceRegistry::find($key);
    if (!$bp) {
        echo "[FAIL] Blueprint NOT FOUND: {$key}\\n";
    } else {
        echo "[OK] Blueprint {$key} -> Model: {$bp->modelClass()}\\n";
    }
}

echo "\\n=== AUDIT 2: TESTING SIMULATED SALES DEPOSIT -> RECEIPT -> INVOICE -> RECEIPT ===\\n";
DB::beginTransaction();

try {
    // 1. Create Sales Deposit
    $dpBp = BackendResourceRegistry::find('sales-deposits');
    $customer = DB::table('customers')->first();
    $customerId = $customer ? $customer->id : 1;

    $dp = $writer->create($dpBp, [
        'customer_id' => $customerId,
        'entry_date' => '2026-07-29',
        'document_number' => 'DP-TEST-999',
        'total_amount' => 500000,
        'status' => 'Belum Lunas',
        'paid_amount' => 0,
        'outstanding_amount' => 500000,
    ]);
    echo "[PASSED] Created Sales Deposit ID {$dp->id} ({$dp->document_number}), Status={$dp->status}\\n";

    // 2. Receipt for Deposit
    $srBp = BackendResourceRegistry::find('sales-receipts');
    $bankAccount = DB::table('accounts')->where('account_type', 'Kas & Bank')->first();
    $bankAccountId = $bankAccount ? $bankAccount->id : 1;

    $srDp = $writer->create($srBp, [
        'customer_id' => $customerId,
        'primary_account_id' => $bankAccountId,
        'entry_date' => '2026-07-29',
        'document_number' => 'SR-DP-999',
        'total_amount' => 500000,
        'lines' => [
            [
                'reference_code' => $dp->document_number,
                'payment_amount' => 500000,
            ]
        ]
    ]);
    
    $dpRefreshed = OperationDocument::find($dp->id);
    echo "[PASSED] Created Receipt for DP ID {$srDp->id}. Deposit {$dp->document_number} Status Now: {$dpRefreshed->status}, Outstanding: {$dpRefreshed->outstanding_amount}\\n";

    // 3. Create Sales Invoice allocating DP
    $siBp = BackendResourceRegistry::find('sales-invoices');
    $product = DB::table('products')->first();
    $productId = $product ? $product->id : 1;

    $si = $writer->create($siBp, [
        'customer_id' => $customerId,
        'entry_date' => '2026-07-29',
        'document_number' => 'SI-TEST-999',
        'lines' => [
            [
                'product_id' => $productId,
                'quantity' => 1,
                'unit_price' => 1500000,
            ]
        ],
        'metadata' => [
            'ignore_stock_warning' => true,
            'advance_payments' => [
                [
                    '__depositId' => $dp->id,
                    'number' => $dp->document_number,
                    'amount' => 500000,
                ]
            ]
        ]
    ]);
    
    $dpRefreshed2 = OperationDocument::find($dp->id);
    $siRefreshed = OperationDocument::find($si->id);
    echo "[PASSED] Created Sales Invoice ID {$si->id} Total: {$siRefreshed->total_amount}, Paid: {$siRefreshed->paid_amount}, Outstanding: {$siRefreshed->outstanding_amount}, Status: {$siRefreshed->status}\\n";
    echo "         Deposit {$dp->document_number} Outstanding: {$dpRefreshed2->outstanding_amount}, Paid: {$dpRefreshed2->paid_amount}\\n";

    // 4. Receipt for remaining Invoice balance (1,000,000)
    $srInv = $writer->create($srBp, [
        'customer_id' => $customerId,
        'primary_account_id' => $bankAccountId,
        'entry_date' => '2026-07-29',
        'document_number' => 'SR-INV-999',
        'total_amount' => 1000000,
        'lines' => [
            [
                'reference_code' => $si->document_number,
                'payment_amount' => 1000000,
            ]
        ]
    ]);

    $siRefreshed2 = OperationDocument::find($si->id);
    echo "[PASSED] Created Final Receipt for Invoice. Invoice Status Now: {$siRefreshed2->status}, Paid: {$siRefreshed2->paid_amount}, Outstanding: {$siRefreshed2->outstanding_amount}\\n";

    DB::rollBack();
    echo "\\n[ALL FLOW SIMULATIONS PASSED CLEANLY IN TRANSACTION]\\n";
} catch (Throwable $e) {
    DB::rollBack();
    echo "[FLOW FAILED] " . $e->getMessage() . "\\n" . $e->getTraceAsString() . "\\n";
}
"""

stdout, stderr = run_php(script)
print(stdout)
if stderr:
    print("STDERR:", stderr)
