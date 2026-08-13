import os

for root, dirs, files in os.walk(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\database\migrations"):
    for file in files:
        if file.endswith('.php'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'payroll_entries' in content:
                    print(path)
