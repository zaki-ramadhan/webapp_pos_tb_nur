import os

dirpath = r"d:\Codingan\random\_client_projects\pos_tb_nur\webapp\app\Support\Presentation\Blueprints\Pages"
for root, dirs, files in os.walk(dirpath):
    for file in files:
        if file.endswith('.php'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if '2017' in content or '2016' in content:
                    print(path)
