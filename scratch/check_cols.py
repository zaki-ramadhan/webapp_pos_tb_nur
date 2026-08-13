import subprocess

def run_php(code):
    cmd = ["php", "artisan", "tinker", "--execute", code]
    res = subprocess.run(cmd, cwd=r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp", capture_output=True, text=True)
    return res.stdout, res.stderr

script = """
use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;

$cols = Schema::getColumnListing('operation_document_lines');
echo "Columns in operation_document_lines:\\n";
print_r($cols);
"""

stdout, stderr = run_php(script)
print(stdout)
