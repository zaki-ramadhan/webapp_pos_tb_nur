import os

files = [
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Backend\BackendResourceWriter.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Backend\Definitions\OperationBackendResources.php",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Backend\Queries\BankInquiryQueryService.php"
]

for filepath in files:
    print(f"=== {filepath} ===")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        lines = content.splitlines()
        for i, line in enumerate(lines):
            if any(k in line.lower() for k in ['expense-entry', 'expense_entry', 'expense']):
                print(f"L{i+1}: {line.strip()[:100]}")
