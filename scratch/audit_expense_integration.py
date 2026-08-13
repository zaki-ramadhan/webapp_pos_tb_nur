import os

app_dir = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app"
js_dir = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"

print("--- APP DIRECTORY AUDIT ---")
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith('.php'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'expense_entry' in content or 'expense-entry' in content or 'ExpenseEntry' in content:
                    print(f"File: {path}")
                    lines = content.splitlines()
                    for i, line in enumerate(lines):
                        if any(k in line.lower() for k in ['journal', 'cash_payment', 'operation_document', 'paid_amount', 'status', 'profit', 'expense']):
                            print(f"  L{i+1}: {line.strip()[:100]}")

print("\n--- JS DIRECTORY AUDIT ---")
for root, dirs, files in os.walk(js_dir):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'expense-entry' in content or 'expense_entry' in content:
                    print(f"File: {path}")
