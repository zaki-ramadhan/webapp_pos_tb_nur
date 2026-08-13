import os

for root, dirs, files in os.walk(r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\resources\js"):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if '2017' in content or '2016' in content or ('payroll' in file.lower() and 'year' in content.lower()):
                    print(path)
