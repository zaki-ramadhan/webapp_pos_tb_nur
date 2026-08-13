import os

files_to_check = [
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry\payrollEntryShared.js",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry\PayrollEntryTableView.jsx",
    r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages\PayrollEntryPage.php",
]

for filepath in files_to_check:
    if os.path.exists(filepath):
        print("=== " + filepath + " ===")
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                if '2016' in line or '2017' in line or 'year' in line.lower() or 'tahun' in line.lower():
                    print(f"L{i+1}: {line.strip()}")
