import subprocess

def run_php(code):
    cmd = ["php", "artisan", "tinker", "--execute", code]
    res = subprocess.run(cmd, cwd=r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp", capture_output=True, text=True)
    return res.stdout, res.stderr

script = """
use App\\Support\\Backend\\BackendResourceAccessService;
use App\\Domain\\Support\\Models\\OperationDocument;
use Illuminate\\Support\\Facades\\DB;

echo "=== AUDIT 1: CHECKING ALL BACKEND RESOURCE REGISTRY ===\\n";
$resourceKeys = [
    'sales-orders', 'sales-deposits', 'sales-invoices', 'sales-receipts', 'sales-returns',
    'purchase-orders', 'goods-receipts', 'purchase-deposits', 'purchase-invoices', 'purchase-payments', 'purchase-returns',
    'cash-payments', 'cash-receipts', 'bank-transfers', 'inventory-adjustments', 'stock-transfers',
    'expense-entries', 'payroll-entries', 'general-journals'
];

foreach ($resourceKeys as $key) {
    try {
        $bp = app(BackendResourceAccessService::class)->getBlueprint($key);
        echo "[OK] Blueprint {$key} -> Model: " . $bp->modelClass() . "\\n";
    } catch (Throwable $e) {
        echo "[ERROR] Blueprint {$key}: " . $e->getMessage() . "\\n";
    }
}

echo "\\n=== AUDIT 2: CHECKING RELATIONSHIPS & METADATA STRUCTURE ===\\n";
$deposits = OperationDocument::where('document_type', 'sales_deposit')->get();
foreach ($deposits as $dp) {
    echo "Deposit ID {$dp->id} ({$dp->document_number}): Paid={$dp->paid_amount}, Outstanding={$dp->outstanding_amount}, Status={$dp->status}\\n";
}

$invoices = OperationDocument::where('document_type', 'sales_invoice')->get();
foreach ($invoices as $inv) {
    $adv = $inv->metadata['advance_payments'] ?? [];
    echo "Invoice ID {$inv->id} ({$inv->document_number}): Total={$inv->total_amount}, Paid={$inv->paid_amount}, Outstanding={$inv->outstanding_amount}, AdvanceCount=" . count($adv) . "\\n";
}

$receipts = OperationDocument::where('document_type', 'sales_receipt')->get();
foreach ($receipts as $rc) {
    $linesCount = DB::table('operation_document_lines')->where('operation_document_id', $rc->id)->count();
    echo "Receipt ID {$rc->id} ({$rc->document_number}): Total={$rc->total_amount}, Lines={$linesCount}\\n";
}
"""

stdout, stderr = run_php(script)
print(stdout)
if stderr:
    print("STDERR:", stderr)
