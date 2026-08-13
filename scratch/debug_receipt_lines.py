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

$writer = app(BackendResourceWriter::class);
$dpBp = BackendResourceRegistry::find('sales-deposits');
$srBp = BackendResourceRegistry::find('sales-receipts');
$customer = DB::table('customers')->first();
$customerId = $customer ? $customer->id : 1;
$bankAccount = DB::table('accounts')->where('account_type', 'Kas & Bank')->first();
$bankAccountId = $bankAccount ? $bankAccount->id : 1;

$num = 'DEBUG-' . rand(1000, 9999);

$dp = $writer->create($dpBp, [
    'customer_id' => $customerId,
    'entry_date' => '2026-07-29',
    'document_number' => 'DP-' . $num,
    'total_amount' => 500000,
    'status' => 'Belum Lunas',
    'paid_amount' => 0,
    'outstanding_amount' => 500000,
]);

$srDp = $writer->create($srBp, [
    'customer_id' => $customerId,
    'primary_account_id' => $bankAccountId,
    'entry_date' => '2026-07-29',
    'document_number' => 'SR-' . $num,
    'total_amount' => 500000,
    'lines' => [
        [
            'reference_code' => 'DP-' . $num,
            'payment_amount' => 500000,
        ]
    ]
]);

echo "Receipt Status: '{$srDp->status}', Document Type: '{$srDp->document_type}'\\n";

$queryLines = DB::table('operation_document_lines')
    ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
    ->where('operation_document_lines.reference_code', 'DP-' . $num)
    ->whereNotIn('operation_documents.status', ['Void', 'Cancelled'])
    ->get();

echo "Query Lines Count: " . count($queryLines) . "\\n";
print_r($queryLines);

$dpRefreshed = OperationDocument::find($dp->id);
echo "Deposit Status: {$dpRefreshed->status}, Paid: {$dpRefreshed->paid_amount}, Outstanding: {$dpRefreshed->outstanding_amount}\\n";
"""

stdout, stderr = run_php(script)
print(stdout)
