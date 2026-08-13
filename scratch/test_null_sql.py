import subprocess

def run_php(code):
    cmd = ["php", "artisan", "tinker", "--execute", code]
    res = subprocess.run(cmd, cwd=r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp", capture_output=True, text=True)
    return res.stdout, res.stderr

script = """
use Illuminate\\Support\\Facades\\DB;

$num = 'DP-DEBUG-7787';

$query1 = DB::table('operation_document_lines')
    ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
    ->where('operation_document_lines.reference_code', $num)
    ->whereNotIn('operation_documents.status', ['Void', 'Cancelled'])
    ->sum('operation_document_lines.total_amount');

$query2 = DB::table('operation_document_lines')
    ->join('operation_documents', 'operation_document_lines.operation_document_id', '=', 'operation_documents.id')
    ->where('operation_document_lines.reference_code', $num)
    ->where(function($q) {
        $q->whereNull('operation_documents.status')
          ->orWhere('operation_documents.status', '')
          ->orWhereNotIn('operation_documents.status', ['Void', 'Cancelled']);
    })
    ->sum('operation_document_lines.total_amount');

echo "Query 1 (Original): {$query1}\\n";
echo "Query 2 (Fixed): {$query2}\\n";
"""

stdout, stderr = run_php(script)
print(stdout)
