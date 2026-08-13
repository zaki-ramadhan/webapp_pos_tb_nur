import os

for root, dirs, files in os.walk(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app"):
    for file in files:
        if file.endswith('.php'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'payroll' in content.lower() or 'due_date' in content.lower():
                    if 'overdue' in content.lower() or 'status' in content.lower() or 'cash_payment' in content.lower():
                        print(path)
