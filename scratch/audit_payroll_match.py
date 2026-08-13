import os

files = [
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry\PayrollEntrySections.jsx",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry\PayrollEntryEmployeeModal.jsx",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry\payrollEntryEmployeeModalUtils.js",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry\payrollEntryFormUtils.js",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry\PayrollEntryFormView.jsx",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\PayrollEntryPage.php",
]

for filepath in files:
    print(f"=== {filepath} ===")
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        lines = content.splitlines()
        for i, line in enumerate(lines[:120]):
            print(f"L{i+1}: {line.strip()[:100]}")
