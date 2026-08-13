import os

dirpath = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js\features\workspace\modules"
for root, dirs, files in os.walk(dirpath):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if 'cashBank' in content or 'cash_bank_label' in content or 'primary_account' in content:
                    print(path)
