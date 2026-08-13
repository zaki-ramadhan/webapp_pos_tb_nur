import os
import subprocess

def run_php(code):
    cmd = ["php", "artisan", "tinker", "--execute", code]
    res = subprocess.run(cmd, cwd=r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp", capture_output=True, text=True)
    return res.stdout, res.stderr

print("Checking transaction blueprints and backend persistence integrity...")
stdout, stderr = run_php("""
use App\\Support\\Backend\\Definitions\\OperationBackendResources;
use App\\Support\\Backend\\BackendResourceWriter;
use App\\Domain\\Support\\Models\\OperationDocument;
use Illuminate\\Support\\Facades\\DB;

$types = [
    'sales-orders', 'sales-deposits', 'sales-invoices', 'sales-receipts', 'sales-returns',
    'purchase-orders', 'goods-receipts', 'purchase-deposits', 'purchase-invoices', 'purchase-payments', 'purchase-returns',
    'cash-payments', 'cash-receipts', 'bank-transfers', 'inventory-adjustments', 'stock-transfers',
    'expense-entries', 'payroll-entries', 'general-journals'
];

foreach ($types as $t) {
    $exists = DB::table('operation_documents')->where('document_type', str_replace('-', '_', rtrim($t, 's')))->count();
    echo "Type {$t}: {$exists} records\\n";
}
""")
print(stdout)
if stderr:
    print("STDERR:", stderr)
