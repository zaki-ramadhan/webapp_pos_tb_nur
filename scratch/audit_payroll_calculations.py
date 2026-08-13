import os

dirpath = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\payroll-entry"
for root, dirs, files in os.walk(dirpath):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            print("=== " + path + " ===")
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.splitlines()
                for i, line in enumerate(lines):
                    if any(k in line.lower() for k in ['bruto', 'dibayarkan', 'gross', 'net', 'total']):
                        print(f"L{i+1}: {line.strip()[:100]}")
