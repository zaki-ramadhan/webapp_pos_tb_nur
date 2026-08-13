import os

dirpath = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules\cash-payment"
for root, dirs, files in os.walk(dirpath):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            print("=== " + path + " ===")
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.splitlines()
                for i, line in enumerate(lines):
                    if 'bank' in line.lower() or 'kas' in line.lower() or 'account' in line.lower():
                        print(f"L{i+1}: {line.strip()}")
