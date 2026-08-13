import subprocess

def run_php(code):
    cmd = ["php", "artisan", "tinker", "--execute", code]
    res = subprocess.run(cmd, cwd=r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp", capture_output=True, text=True)
    return res.stdout, res.stderr

script = """
use App\\Support\\Backend\\BackendResourceRegistry;
use App\\Support\\Backend\\BackendResourceWriter;
use Illuminate\\Support\\Facades\\DB;

$writer = app(BackendResourceWriter::class);
$dpBp = BackendResourceRegistry::find('sales-deposits');
$srBp = BackendResourceRegistry::find('sales-receipts');

$num = 'DEBUG-' . rand(1000, 9999);
$dp = $writer->create($dpBp, [
    'customer_id' => 1,
    'entry_date' => '2026-07-29',
    'document_number' => 'DP-' . $num,
    'total_amount' => 500000,
    'status' => 'Belum Lunas',
    'paid_amount' => 0,
    'outstanding_amount' => 500000,
]);

$srDp = $writer->create($srBp, [
    'customer_id' => 1,
    'primary_account_id' => 1,
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

$rawLine = DB::table('operation_document_lines')->where('operation_document_id', $srDp->id)->first();
echo "Raw Line:\\n";
print_r($rawLine);
"""

stdout, stderr = run_php(script)
print(stdout)
